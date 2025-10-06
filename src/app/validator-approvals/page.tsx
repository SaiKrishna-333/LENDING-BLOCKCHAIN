"use client";
import * as React from "react";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contractAbi } from "@/abi";

export default function ValidatorApprovalsPage() {
  const [loanId, setLoanId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

  const handleConfirm = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (!window.ethereum) throw new Error("No wallet");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const tx = await contract.confirmLoan(loanId);
      await tx.wait();
      alert("Loan confirmed by validator");
      setLoanId("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validator Approvals</CardTitle>
        <CardDescription>
          Validators confirm loans before lender funding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConfirm}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="loanId">Loan ID</Label>
              <Input
                id="loanId"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>
          </div>
          <CardFooter>
            <Button type="submit" className=" mt-5">
              {loading ? "Confirming..." : "Confirm Loan"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
