import { useWeb3 } from '../contexts/Web3Context';
import { Link } from 'react-router-dom';

export default function Header() {
  const { account, networkName, connectWallet } = useWeb3();
  
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-green-700 to-green-900 py-4 px-6 sticky top-0 z-40 shadow-md">
      <nav className="flex flex-wrap justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-3 no-underline group transition-all duration-300">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-green-900 font-bold text-lg">M</span>
          </div>
          <span className="text-yellow-400 font-bold text-xl tracking-tight group-hover:text-yellow-300 transition-colors">
            MilkNet
          </span>
        </Link>
        
        <div className="flex items-center mt-0 sm:mt-0">
          {account ? (
            <div className="flex items-center flex-wrap gap-3">
              <div className="bg-green-950 bg-opacity-50 text-green-100 py-1.5 px-3 rounded-lg text-sm border border-green-600">
                {networkName}
              </div>
              <div className="bg-yellow-400 text-green-900 py-1.5 px-4 rounded-full font-mono font-medium shadow-sm hover:shadow-md transition-all">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </div>
            </div>
          ) : (
            <button 
              onClick={handleConnect}
              className="bg-yellow-400 text-green-900 py-2 px-6 rounded-full font-medium shadow-md hover:bg-yellow-300 hover:shadow-lg transition-all flex gap-2 items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}