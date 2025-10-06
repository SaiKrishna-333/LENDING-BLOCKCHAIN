"use client";
import React, { useState, useEffect } from "react";
import { useWeb3ModalProvider, useWeb3ModalAccount } from "@web3modal/ethers5/react";
import { BrowserProvider, Contract, formatUnits, parseEther } from "ethers";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { contractAbi } from "@/abi";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const ApproveLoanComponent: React.FC = () => {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingLoans = async () => {
    if (!isConnected) return;

    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const allLoans = await contract.getAllLoans();

      // Filter loans that need approval (lender == address(0))
      const pending = allLoans.filter(
        (loan: any) => loan.lender === "0x0000000000000000000000000000000000000000" && !loan.isDefaulted
      );

      setPendingLoans(
        pending.map((loan: any) => ({
          loanId: loan.loanId,
          borrower: loan.borrower,
          amount: formatUnits(loan.amount, 18),
          interestRate: formatUnits(loan.interestRate, 18),
          loanTerm: loan.loanTerm.toString(),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLoan = async (loanId: string, amount: string) => {
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      // CRITICAL: Send ETH with transaction
      const tx = await contract.approveLoan(loanId, {
        value: parseEther(amount),
      });

      await tx.wait();
      alert("Loan approved! ETH sent to borrower.");
      fetchPendingLoans();
    } catch (err: any) {
      alert("Failed to approve loan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, [isConnected]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Pending Loan Requests</h2>
      {pendingLoans.length === 0 ? (
        <p>No pending loans</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Borrower</TableCell>
              <TableCell>Amount (ETH)</TableCell>
              <TableCell>Interest (ETH)</TableCell>
              <TableCell>Term (seconds)</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingLoans.map((loan, idx) => (
              <TableRow key={idx}>
                <TableCell>{loan.borrower.slice(0, 10)}...</TableCell>
                <TableCell>{loan.amount}</TableCell>
                <TableCell>{loan.interestRate}</TableCell>
                <TableCell>{loan.loanTerm}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleApproveLoan(loan.loanId, loan.amount)}
                    disabled={loading}
                  >
                    {loading ? "Approving..." : "Approve & Send ETH"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ApproveLoanComponent;
