import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">FutureRent</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Tokenize and trade the future income of real-world assets.
            Invest in solar rooftops, farmland, and digital royalties.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/marketplace"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/create"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Create Asset
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🏭</div>
            <h3 className="text-xl font-semibold mb-2">Tokenize Assets</h3>
            <p className="text-gray-600">
              Asset owners mint NFTs representing a percentage of future income
              from their real-world assets.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Invest Securely</h3>
            <p className="text-gray-600">
              Investors buy yield rights at a discount. Funds are locked in
              escrow until income is verified.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Automatic Payouts</h3>
            <p className="text-gray-600">
              Oracles verify real-world income. Smart contracts automatically
              distribute payouts to investors.
            </p>
          </div>
        </div>
      </section>

      {/* Asset Types Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Assets</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">☀️</div>
              <h3 className="text-xl font-semibold mb-2">Solar Rooftops</h3>
              <p className="text-gray-600">
                Invest in solar energy generation and earn from electricity sales.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold mb-2">Farmland</h3>
              <p className="text-gray-600">
                Tokenize agricultural yields and benefit from crop sales.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold mb-2">Digital Royalties</h3>
              <p className="text-gray-600">
                Trade future royalties from music, art, and digital content.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
