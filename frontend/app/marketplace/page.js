"use client";

import { useEffect, useState } from "react";
import AssetCard from "../../components/AssetCard";

export default function MarketplacePage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch assets from backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAssets(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Marketplace</h1>
      <p className="text-gray-600 mb-8">
        Browse available future income rights and invest in real-world assets.
      </p>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assets...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No assets available yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.tokenId} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
