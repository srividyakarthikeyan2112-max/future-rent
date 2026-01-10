"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function InvestPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState("");
  const [investing, setInvesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    // Fetch asset details
    fetch(`http://localhost:3001/api/assets/${tokenId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAsset(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching asset:", err);
        setLoading(false);
      });
  }, [tokenId]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setInvesting(true);

    try {
      // In production, call smart contract here
      // For now, just show success message
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Investment successful!");
      setInvestAmount("");
    } catch (error) {
      console.error("Error investing:", error);
      alert("Error processing investment");
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Loading asset details...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Asset not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Invest in Asset #{tokenId}</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Asset Details</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Type:</span> {asset.assetType}
          </p>
          <p>
            <span className="font-medium">Yield Percentage:</span>{" "}
            {asset.yieldPercent}%
          </p>
          <p>
            <span className="font-medium">Target Price:</span> {asset.targetPrice}{" "}
            ETH
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {asset.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Make Investment</h2>

        {!connected ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Connected: {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}
            </p>
          </div>
        )}

        <form onSubmit={handleInvest}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Investment Amount (ETH)
            </label>
            <input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
            />
          </div>

          <button
            type="submit"
            disabled={investing || !connected}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {investing ? "Processing..." : "Invest Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
