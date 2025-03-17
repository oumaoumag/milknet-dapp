import { Link } from 'react-router-dom';
import { Devs } from './Devs';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';

export default function Landing() {
  const { isAuthenticated, isFarmer, isBuyer, user } = useAuth();
  const { account } = useWeb3();
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
          
          {isAuthenticated ? (
            <div className="bg-gray-900 bg-opacity-80 p-6 rounded-xl border border-gray-700 max-w-xl mx-auto mb-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-3">Welcome back, {user?.name || 'there'}!</h2>
              <p className="mb-4">You're logged in as a {isFarmer ? 'Farmer' : isBuyer ? 'Buyer' : 'User'}.</p>
              
              <div className="flex gap-6 justify-center mt-4">
                {isFarmer ? (
                  <Link 
                    to="/farmer" 
                    className="bg-yellow-400 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                  >
                    Go to Farmer Dashboard
                  </Link>
                ) : isBuyer ? (
                  <Link 
                    to="/buyer-dashboard" 
                    className="bg-green-500 text-black px-6 py-3 rounded-md hover:bg-green-600 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                  >
                    Go to Buyer Dashboard
                  </Link>
                ) : null}
                
                <Link 
                  to="/marketplace" 
                  className="bg-white text-green-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>
          ) : account ? (
            <div className="bg-gray-900 bg-opacity-80 p-6 rounded-xl border border-gray-700 max-w-xl mx-auto mb-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-3">Almost there!</h2>
              <p className="mb-4">Your wallet is connected, but you need to register or login.</p>
              
              <div className="flex gap-6 justify-center mt-4">
                <Link 
                  to="/register" 
                  className="bg-yellow-400 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                >
                  Register
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white text-green-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                >
                  Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-lg mb-2">Please connect your wallet and register as:</p>
              <div className="flex gap-6 justify-center">
                <Link 
                  to="/register" 
                  className="bg-yellow-400 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                >
                  Farmer
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-500 text-black px-6 py-3 rounded-md hover:bg-green-600 transition-transform hover:-translate-y-0.5 text-lg font-medium"
                >
                  Buyer
                </Link>
              </div>
              <div className="mt-4">
                <Link 
                  to="/login" 
                  className="text-yellow-400 underline hover:text-yellow-300"
                >
                  Already registered? Login here
                </Link>
              </div>
            </div>
          )}
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
        
        {/* How it works section */}
        <section className="mt-16 bg-gray-900 bg-opacity-80 p-8 rounded-xl">
          <h2 className="text-3xl text-yellow-400 font-bold mb-6 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl mb-4 text-yellow-400 font-semibold">For Farmers</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Connect your wallet and register as a farmer</li>
                <li>Upload information about your milk batches</li>
                <li>Set your desired price and quality information</li>
                <li>Receive instant payment when buyers purchase</li>
                <li>Build your reputation through verified transactions</li>
              </ol>
              {!isAuthenticated && (
                <div className="mt-6 text-center">
                  <Link 
                    to="/register" 
                    className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-all font-medium"
                  >
                    Register as Farmer
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl mb-4 text-yellow-400 font-semibold">For Buyers</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Connect your wallet and register as a buyer</li>
                <li>Browse available milk batches by price, quality, or location</li>
                <li>Purchase directly from farmers with transparent pricing</li>
                <li>Rate transactions and build your buyer profile</li>
                <li>Access transaction history and receipts</li>
              </ol>
              {!isAuthenticated && (
                <div className="mt-6 text-center">
                  <Link 
                    to="/register" 
                    className="inline-block bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 transition-all font-medium"
                  >
                    Register as Buyer
                  </Link>
                </div>
              )}
            </div>
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