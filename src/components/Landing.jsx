import { Link } from 'react-router-dom';
import { Devs } from './Devs';

export default function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-black/60" 
          style={{ 
            backgroundImage: "url(/images/trial2.webp)",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-8 text-white">
        <header className="text-center py-16 mb-12">
          <h1 className="text-4xl mb-8 text-yellow-400 font-bold drop-shadow-lg">
            MilkNet Dairy Supply Chain Marketplace
          </h1>
          <p className="text-xl mb-8 drop-shadow-md">
            Connect directly with farmers for fresh dairy products
          </p>
          
          <div className="flex gap-6 justify-center mt-8">
            <Link 
              to="/register-farmer" 
              className="bg-yellow-400 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition-transform hover:-translate-y-0.5 text-lg font-medium"
            >
              I'm a farmer
            </Link>
            <Link 
              to="/marketplace" 
              className="bg-green-500 text-black px-6 py-3 rounded-md hover:bg-green-600 transition-transform hover:-translate-y-0.5 text-lg font-medium"
            >
              I'm a Buyer
            </Link>
          </div>
        </header>

        {/* Feature cards section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div className="bg-gray-900 bg-opacity-70 p-8 rounded-xl border border-gray-700 transition-transform hover:-translate-y-1">
            <h3 className="mb-4">🔄 Transparent Transactions</h3>
            <p>Blockchain-powered traceability for every milk batch</p>
          </div>
          <div className="bg-gray-900 bg-opacity-70 p-8 rounded-xl border border-gray-700 transition-transform hover:-translate-y-1">
            <h3 className="mb-4">⚡ Instant Settlement</h3>
            <p>Secure payments with smart contract escrow</p>
          </div>
          <div className="bg-gray-900 bg-opacity-70 p-8 rounded-xl border border-gray-700 transition-transform hover:-translate-y-1">
            <h3 className="mb-4">🛡️ Guaranteed Quality</h3>
            <p>Dispute resolution & quality assurance system</p>
          </div>
        </section>
      </div>
      
      {/* Keep the Devs component */}
      <div className="relative z-10">
        <Devs />
      </div>
    </div>
  );
}