// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TokenizedStudentLoan {
    struct Loan {
        bytes32 loanId;
        address lender;      // address who funds the loan on approval
        address borrower;    // address who requested the loan
        uint256 amount;      // principal in wei
        uint256 interestRate; // flat interest in wei for simplicity
        uint256 balance;     // remaining principal to be repaid; set to 0 when fully repaid
        uint256 loanTerm;    // arbitrary term metadata
        uint256 createdAt;   // timestamp when requested
        bool isRepaid;
        bool isDefaulted;
        uint8 confirmations; // number of validator confirmations
        bool funded;         // set true once lender approves/funds
    }

    uint256 public loanCounter;
    mapping(bytes32 => Loan) public loans;
    // Collateral in wei locked by borrower per loanId
    mapping(bytes32 => uint256) public collateralByLoan;
    mapping(address => bytes32[]) public borrowerLoans;
    mapping(address => bytes32[]) public lenderLoans;
    bytes32[] public allLoanIds;

    // Validators for multi-signature style approval
    address public validator1;
    address public validator2;
    uint8 public requiredConfirmations = 2;

    // Simple rewards balance (not a full ERC20 for simplicity)
    mapping(address => uint256) public rewardBalance;

    event LoanRequested(bytes32 loanId, address borrower, uint256 amount, uint256 interestRate, uint256 loanTerm);
    event LoanApproved(bytes32 loanId, address lender, address borrower, uint256 amount);
    event LoanRepaid(bytes32 loanId, uint256 amount);
    event LoanDefaulted(bytes32 loanId);
    event LoanConfirmed(bytes32 loanId, address validator, uint8 confirmations);
    event CollateralDeposited(bytes32 loanId, address borrower, uint256 amount);
    event CollateralLiquidated(bytes32 loanId, address lender, uint256 amount);
    event RewardMinted(address to, uint256 amount);

    constructor(address _validator1, address _validator2) {
        validator1 = _validator1;
        validator2 = _validator2;
    }

    // Step 1: Borrower requests a loan. No ETH transferred here.
    function requestLoan(uint256 _amount, uint256 _interestRate, uint256 _loanTerm) external returns (bytes32) {
        loanCounter++;
        bytes32 loanId = keccak256(abi.encodePacked(block.timestamp, msg.sender, loanCounter));

        loans[loanId] = Loan({
            loanId: loanId,
            lender: address(0),
            borrower: msg.sender,
            amount: _amount,
            interestRate: _interestRate,
            balance: _amount,
            loanTerm: _loanTerm,
            createdAt: block.timestamp,
            isRepaid: false,
            isDefaulted: false,
            confirmations: 0,
            funded: false
        });

        borrowerLoans[msg.sender].push(loanId);
        allLoanIds.push(loanId);
        emit LoanRequested(loanId, msg.sender, _amount, _interestRate, _loanTerm);
        return loanId;
    }

    // Borrower deposits collateral for a specific loan (must be >= amount)
    function depositCollateral(bytes32 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Only borrower");
        require(loan.lender == address(0), "Already approved");
        require(!loan.isDefaulted && !loan.isRepaid, "Inactive");
        require(msg.value > 0, "No value");
        collateralByLoan[_loanId] += msg.value;
        emit CollateralDeposited(_loanId, msg.sender, msg.value);
    }

    // Validators confirm the loan prior to funding
    function confirmLoan(bytes32 _loanId) external {
        require(msg.sender == validator1 || msg.sender == validator2, "Not validator");
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Invalid loan");
        require(!loan.funded, "Already funded");
        // simple duplicate-protection by packing confirmations by address bits
        // we will mark confirmations using createdAt low bits as bitmap
        uint256 mask = (msg.sender == validator1) ? 1 : 2;
        require((loan.createdAt & mask) == 0, "Already confirmed");
        loan.createdAt = loan.createdAt | mask;
        loan.confirmations += 1;
        emit LoanConfirmed(_loanId, msg.sender, loan.confirmations);
    }

    // Step 2: Lender approves and funds the loan by sending ETH equal to amount.
    function approveLoan(bytes32 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Invalid loan");
        require(loan.lender == address(0), "Already approved");
        require(!loan.isDefaulted && !loan.isRepaid, "Inactive loan");
        require(msg.sender != loan.borrower, "Cannot lend to self");
        require(msg.value == loan.amount, "Send exact loan amount");
        require(loan.confirmations >= requiredConfirmations, "Not enough confirmations");
        require(collateralByLoan[_loanId] >= loan.amount, "Insufficient collateral");

        loan.lender = msg.sender;
        loan.funded = true;
        lenderLoans[msg.sender].push(_loanId);

        (bool sent, ) = payable(loan.borrower).call{value: msg.value}("");
        require(sent, "Transfer to borrower failed");

        emit LoanApproved(_loanId, msg.sender, loan.borrower, msg.value);
    }

    // Step 3: Borrower repays principal + interest. ETH is sent to lender.
    function repayLoan(bytes32 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(msg.sender == loan.borrower, "Only borrower");
        require(!loan.isRepaid, "Already repaid");
        require(!loan.isDefaulted, "Defaulted");
        require(loan.lender != address(0), "Not approved yet");

        uint256 totalDue = loan.amount + loan.interestRate;
        require(msg.value == totalDue, "Incorrect repay amount");

        loan.balance = 0;
        loan.isRepaid = true;

        (bool sent, ) = payable(loan.lender).call{value: msg.value}("");
        require(sent, "Transfer to lender failed");

        // Mint simple reward: 1% of principal expressed in wei (or flat interestRate)
        uint256 reward = loan.interestRate; // simple: reward equals interest amount
        rewardBalance[msg.sender] += reward;
        emit RewardMinted(msg.sender, reward);

        emit LoanRepaid(_loanId, msg.value);
    }

    function markAsDefaulted(bytes32 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(!loan.isRepaid, "Already repaid");
        require(!loan.isDefaulted, "Already defaulted");
        // Optional: add access control (e.g., only lender) in future
        loan.isDefaulted = true;
        emit LoanDefaulted(_loanId);
    }

    // Lender can liquidate collateral once defaulted
    function liquidateLoan(bytes32 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.lender == msg.sender, "Only lender");
        require(loan.isDefaulted, "Not defaulted");
        uint256 amt = collateralByLoan[_loanId];
        require(amt > 0, "No collateral");
        collateralByLoan[_loanId] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amt}("");
        require(ok, "Collateral transfer failed");
        emit CollateralLiquidated(_loanId, msg.sender, amt);
    }

    function getLoanDetails(bytes32 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }

    function getBorrowerLoans(address _borrower) external view returns (bytes32[] memory) {
        return borrowerLoans[_borrower];
    }

    function getLenderLoans(address _lender) external view returns (bytes32[] memory) {
        return lenderLoans[_lender];
    }

    function getAllLoans() external view returns (Loan[] memory) {
        Loan[] memory allLoans = new Loan[](allLoanIds.length);
        for (uint256 i = 0; i < allLoanIds.length; i++) {
            allLoans[i] = loans[allLoanIds[i]];
        }
        return allLoans;
    }
}