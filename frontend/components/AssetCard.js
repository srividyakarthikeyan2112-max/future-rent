"use client";

import Link from "next/link";

export default function AssetCard({ asset }) {
  const getAssetIcon = (type) => {
    switch (type) {
      case "solar":
        return "☀️";
      case "farmland":
        return "🌾";
      case "digital":
        return "🎵";
      default:
        return "📊";
    }
  };

  return (
    <Link href={`/invest/${asset.tokenId}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
        <div className="text-4xl mb-4">{getAssetIcon(asset.assetType)}</div>
        <h3 className="text-xl font-semibold mb-2">
          {asset.metadata?.name || `Asset #${asset.tokenId}`}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {asset.metadata?.description || "No description available"}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Yield:</span>
            <span className="font-medium">{asset.yieldPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Price:</span>
            <span className="font-medium">{asset.targetPrice} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize">{asset.assetType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span
              className={`font-medium ${
                asset.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {asset.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          View Details
        </button>
      </div>
    </Link>
  );
}
