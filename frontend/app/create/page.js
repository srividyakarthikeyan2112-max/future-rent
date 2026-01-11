"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetOwner: "",
    yieldPercent: "",
    targetPrice: "",
    assetType: "solar",
    metadata: {
      name: "",
      description: "",
      image: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("metadata.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Asset created successfully!");
        router.push("/marketplace");
      } else {
        alert("Error creating asset: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create Asset</h1>
      <p className="text-gray-600 mb-8">
        Tokenize your asset&apos;s future income and make it available for
        investment.
      </p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Asset Owner Address
          </label>
          <input
            type="text"
            name="assetOwner"
            value={formData.assetOwner}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Yield Percentage (0-100)
          </label>
          <input
            type="number"
            name="yieldPercent"
            value={formData.yieldPercent}
            onChange={handleChange}
            required
            min="1"
            max="100"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Target Price (ETH)
          </label>
          <input
            type="number"
            name="targetPrice"
            value={formData.targetPrice}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="10.0"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Asset Type</label>
          <select
            name="assetType"
            value={formData.assetType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="solar">Solar Rooftop</option>
            <option value="farmland">Farmland</option>
            <option value="digital">Digital Royalties</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Asset Name</label>
          <input
            type="text"
            name="metadata.name"
            value={formData.metadata.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="My Solar Farm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="metadata.description"
            value={formData.metadata.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your asset..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="metadata.image"
            value={formData.metadata.image}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Asset"}
        </button>
      </form>
    </div>
  );
}
