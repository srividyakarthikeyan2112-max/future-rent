"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FutureRent
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/marketplace"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Create Asset
            </Link>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}
