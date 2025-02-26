import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="text-center py-16 border-b border-gray-700 mb-12">
        <h1 className="text-4xl mb-8 text-yellow-400">MilkNet Dairy Supply Chain Marketplace</h1>
        <p className="mb-8">Connect directly with farmers for fresh dairy products</p>
        <div className="flex gap-6 justify-center mt-8">
          <Link 
            to="/farmers" 
            className="bg-yellow-400 text-black px-6 py-2 rounded-md hover:bg-yellow-500 transition-transform hover:-translate-y-0.5"
          >
            I'm a farmer
          </Link>
          <Link 
            to="/Marketplace" 
            className="bg-green-500 text-black px-6 py-2 rounded-md hover:bg-green-600 transition-transform hover:-translate-y-0.5"
          >
            I'm a Buyer
          </Link>
        </div>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 transition-transform hover:-translate-y-1">
          <h3 className="mb-4">🔄 Transparent Transactions</h3>
          <p>Blockchain-powered traceability for every milk batch</p>
        </div>
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 transition-transform hover:-translate-y-1">
          <h3 className="mb-4">⚡ Instant Settlement</h3>
          <p>Secure payments with smart contract escrow</p>
        </div>
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 transition-transform hover:-translate-y-1">
          <h3 className="mb-4">🛡️ Guaranteed Quality</h3>
          <p>Dispute resolution & quality assurance system</p>
        </div>
      </section>
    </div>
  );
}