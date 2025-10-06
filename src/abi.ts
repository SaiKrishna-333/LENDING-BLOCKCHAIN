export const contractAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "uint256", name: "_interestRate", type: "uint256" },
      { internalType: "uint256", name: "_loanTerm", type: "uint256" }
    ],
    name: "requestLoan",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "depositCollateral",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "confirmLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "approveLoan",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "repayLoan",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "markAsDefaulted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "liquidateLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllLoans",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "loanId", type: "bytes32" },
          { internalType: "address", name: "lender", type: "address" },
          { internalType: "address", name: "borrower", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "interestRate", type: "uint256" },
          { internalType: "uint256", name: "balance", type: "uint256" },
          { internalType: "uint256", name: "loanTerm", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "isRepaid", type: "bool" },
          { internalType: "bool", name: "isDefaulted", type: "bool" },
          { internalType: "uint8", name: "confirmations", type: "uint8" },
          { internalType: "bool", name: "funded", type: "bool" }
        ],
        internalType: "struct TokenizedStudentLoan.Loan[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "_loanId", type: "bytes32" }],
    name: "getLoanDetails",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "loanId", type: "bytes32" },
          { internalType: "address", name: "lender", type: "address" },
          { internalType: "address", name: "borrower", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "interestRate", type: "uint256" },
          { internalType: "uint256", name: "balance", type: "uint256" },
          { internalType: "uint256", name: "loanTerm", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "isRepaid", type: "bool" },
          { internalType: "bool", name: "isDefaulted", type: "bool" },
          { internalType: "uint8", name: "confirmations", type: "uint8" },
          { internalType: "bool", name: "funded", type: "bool" }
        ],
        internalType: "struct TokenizedStudentLoan.Loan",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "rewardBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_borrower", type: "address" }],
    name: "getBorrowerLoans",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_lender", type: "address" }],
    name: "getLenderLoans",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "loanCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "loans",
    outputs: [
      { internalType: "bytes32", name: "loanId", type: "bytes32" },
      { internalType: "address", name: "lender", type: "address" },
      { internalType: "address", name: "borrower", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRate", type: "uint256" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "loanTerm", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "isRepaid", type: "bool" },
      { internalType: "bool", name: "isDefaulted", type: "bool" },
      { internalType: "uint8", name: "confirmations", type: "uint8" },
      { internalType: "bool", name: "funded", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
];
