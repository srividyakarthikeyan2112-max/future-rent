




"use client";

import Link from "next/link";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">

        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-semibold text-white tracking-wide"
        >
          FutureRent
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8 text-sm">
          <Link
            href="/marketplace"
            className="text-[#B7C4D3] hover:text-white transition"
          >
            Marketplace
          </Link>

          <Link
            href="/create"
            className="text-[#B7C4D3] hover:text-white transition"
          >
            Create Asset
          </Link>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
