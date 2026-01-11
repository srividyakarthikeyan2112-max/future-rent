"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  /* ---------------- STATE ---------------- */
  const [investment, setInvestment] = useState(50000);
  const [annualYield, setAnnualYield] = useState(12);
  const [activeProof, setActiveProof] = useState(null);

  const annualReturn = investment * (annualYield / 100);
  const monthlyPayout = annualReturn / 12;

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative hero-bg text-white py-28">
        <div className="absolute inset-0 hero-overlay" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="uppercase tracking-widest text-sm mb-4 text-[#B7C4D3]">
            FutureRent
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium mb-6">
            Own Tomorrow’s Income, Today
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto text-[#E6F1FF]">
            Tokenize and trade future cash flows from real-world assets like solar,
            farmland, and digital royalties.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace"
              className="bg-[#00C389] text-white px-10 py-4 rounded-xl font-medium hover:bg-[#00B07A]">
              Explore Marketplace
            </Link>

            <Link href="/create"
              className="border border-white/80 text-white px-10 py-4 rounded-xl font-medium hover:bg-white hover:text-[#0A192F]">
              Create Asset
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#B7C4D3]">
            No wallet required to explore
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[#0A192F] py-6">
        <div className="container mx-auto px-4 flex justify-center gap-10 text-[#B7C4D3] text-sm">
          <span>🔒 Smart Contracts</span>
          <span>🌍 Real-World Assets</span>
          <span>⛓ Blockchain-Backed</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F1F5F9] py-20">
        <h2 className="text-3xl font-bold text-center mb-14 text-[#0A192F]">
          How It Works
        </h2>

        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10">
          {[
            ["🏭", "Tokenize Assets", "Mint NFTs representing future income."],
            ["💰", "Invest Securely", "Funds locked safely in escrow."],
            ["📊", "Automatic Payouts", "Verified income distributed automatically."]
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-white p-10 rounded-2xl shadow-md">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED ASSETS */}
      <section className="bg-white py-20">
        <h2 className="text-3xl font-bold text-center mb-14 text-[#0A192F]">
          Supported Assets
        </h2>

        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10">
          <AssetCard icon="☀️" title="Solar Rooftops" desc="12% APY · Government Metered" onClick={() => setActiveProof("solar")} />
          <AssetCard icon="🌾" title="Farmland" desc="10% APY · Seasonal Yield" onClick={() => setActiveProof("farmland")} />
          <AssetCard icon="🎵" title="Digital Royalties" desc="15% APY · Streaming Income" onClick={() => setActiveProof("royalties")} />
        </div>
      </section>

      {/* LIVE YIELD SIMULATOR */}
      <section className="bg-[#F1F5F9] py-20">
        <h2 className="text-3xl font-bold text-center mb-10 text-[#0A192F]">
          Live Yield Simulator
        </h2>

        <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg">
          <label className="text-sm font-medium">Investment Amount</label>
          <input type="range" min="10000" max="200000" step="5000"
            value={investment}
            onChange={(e) => setInvestment(+e.target.value)}
            className="w-full accent-[#00C389]" />
          <div className="mt-2 font-semibold">
            ₹ {investment.toLocaleString("en-IN")}
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium">Expected Annual Yield (%)</label>
            <input type="range" min="6" max="20" step="0.5"
              value={annualYield}
              onChange={(e) => setAnnualYield(+e.target.value)}
              className="w-full accent-[#00C389]" />
            <div className="mt-2 font-semibold">{annualYield}%</div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10 text-center">
            <Stat title="Expected APY" value={`${annualYield}%`} highlight />
            <Stat title="Monthly Payout" value={`₹ ${Math.round(monthlyPayout).toLocaleString("en-IN")}`} />
            <Stat title="Lock Period" value="12 Months" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A192F] py-6 text-center text-sm text-[#B7C4D3]">
        © 2026 FutureRent · Tokenizing Future Income
      </footer>

      {/* VERIFICATION + PAYOUT MODAL */}
      {activeProof && (
        <VerificationModal type={activeProof} onClose={() => setActiveProof(null)} />
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function AssetCard({ icon, title, desc, onClick }) {
  return (
    <div className="bg-[#F8FAFC] p-10 rounded-2xl shadow-md text-center relative">
      <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
        ✔ Verified
      </span>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{desc}</p>
      <button onClick={onClick} className="text-[#00C389] underline text-sm font-medium">
        View Proof & Payouts
      </button>
    </div>
  );
}

function Stat({ title, value, highlight }) {
  return (
    <div className="bg-[#F8FAFC] p-6 rounded-xl">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-[#00C389]" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function VerificationModal({ type, onClose }) {
  const data = {
    solar: {
      title: "Solar Rooftop",
      verification: [
        "📄 Net Metering ID: TN-SOL-34892",
        "⚡ Capacity: 10 kW",
        "🏢 Utility: TNEB",
        "📡 Oracle: Energy Production API"
      ],
      payouts: [
        "✔ Jan 2026 · ₹4,800 · Paid",
        "✔ Feb 2026 · ₹5,100 · Paid",
        "⏳ Mar 2026 · ₹5,200 · Scheduled"
      ]
    },
    farmland: {
      title: "Farmland",
      verification: [
        "📄 Land Record ID: TN-LAND-99213",
        "🌱 Crop: Paddy",
        "📍 Location: Thanjavur",
        "📡 Oracle: Agriculture Yield API"
      ],
      payouts: [
        "✔ Oct 2025 · ₹18,000 · Paid",
        "✔ Jan 2026 · ₹22,000 · Paid",
        "⏳ Apr 2026 · ₹25,000 · Scheduled"
      ]
    },
    royalties: {
      title: "Digital Royalties",
      verification: [
        "🎵 Content ID: SPOT-TRK-78291",
        "🏢 Platform: Spotify",
        "📡 Oracle: Streaming Revenue API"
      ],
      payouts: [
        "✔ Jan 2026 · ₹42,000 · Paid",
        "✔ Feb 2026 · ₹45,000 · Paid",
        "⏳ Mar 2026 · ₹47,000 · Scheduled"
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">
          {data[type].title} — Verification & Payouts
        </h3>

        <h4 className="font-semibold mb-2">Verification</h4>
        <ul className="text-sm mb-4 space-y-1">
          {data[type].verification.map((v, i) => <li key={i}>{v}</li>)}
        </ul>

        <h4 className="font-semibold mb-2">Payout History</h4>
        <ul className="text-sm space-y-1">
          {data[type].payouts.map((p, i) => <li key={i}>{p}</li>)}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#0A192F] text-white py-3 rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
}
