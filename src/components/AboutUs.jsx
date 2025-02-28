import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="max-w-6xl mx-auto p-8 text-gray-100">
      <header className="text-center py-12 border-b border-gray-700 mb-12">
        <h1 className="text-4xl mb-6 text-yellow-400 font-bold">About MilkNet</h1>
        <p className="text-xl text-green-300">Revolutionizing Dairy Supply Chains with Blockchain Technology</p>
      </header>

      <div className="space-y-12">
        {/* Project Overview */}
        <section className="bg-gray-900 p-8 rounded-xl border border-gray-700">
          <h2 className="text-3xl mb-6 text-green-400">Project Overview</h2>
          <p className="text-lg leading-relaxed">
            MilkNet is a decentralized platform connecting farmers directly with consumers through blockchain technology. 
            Our platform ensures transparency, quality assurance, and fair pricing while eliminating intermediaries in the 
            dairy supply chain.
          </p>
        </section>

        {/* Problem & Solution Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
            <h3 className="text-2xl mb-4 text-red-400">The Problem</h3>
            <ul className="list-disc pl-6 space-y-4">
              <li>Payment delays and limited market access for farmers</li>
              <li>Quality concerns and lack of transparency for consumers</li>
              <li>Inefficient dispute resolution processes</li>
            </ul>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
            <h3 className="text-2xl mb-4 text-green-400">Our Solution</h3>
            <ul className="list-disc pl-6 space-y-4">
              <li>Blockchain-powered traceability system</li>
              <li>Smart contract automated payments</li>
              <li>Decentralized dispute resolution</li>
              <li>Direct farmer-consumer marketplace</li>
            </ul>
          </div>
        </div>

        {/* Technical Details */}
        <section className="bg-gray-900 p-8 rounded-xl border border-gray-700">
          <h2 className="text-3xl mb-6 text-yellow-400">Technical Implementation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl mb-4 text-green-300">Features</h3>
              <ul className="list-disc pl-6 space-y-3">
                <li>Real-time milk batch tracking</li>
                <li>Immutable transaction records</li>
                <li>Automated quality assurance</li>
                <li>Instant payment settlement</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 text-green-300">Deployment</h3>
              <p className="mb-4">Currently live on:</p>
              <div className="flex gap-4">
                <span className="bg-green-800 px-4 py-2 rounded-full">Sepolia Testnet</span>
                <span className="bg-blue-800 px-4 py-2 rounded-full">Lisk Testnet</span>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link to="/" className="bg-yellow-400 text-black px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}