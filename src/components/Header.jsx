import { useWeb3 } from '../contexts/Web3Context';
import { Link, NavLink } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

export default function Header() {
  const { account, networkName, connectWallet, disconnectWallet, switchNetwork } = useWeb3();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Add mobile menu toggle
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useClickOutside(menuRef, () => setShowMenu(false));

  // Navigation links
  const navLinks = [
    { path: "/", name: "Home" },
    { path: "/marketplace", name: "Marketplace" },
    { path: "/farmer", name: "Farmer Dashboard" },
    { path: "/about", name: "About Us" }
  ];

  // Add loading state to connectWallet
  const handleConnect = async () => {
    try {
      setConnecting(true);
      await connectWallet();
    } catch (error) {
      setError(error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleNetworkSwitch = async () => {
    const currentChainId = parseInt(window.ethereum.chainId, 16);
    const targetChainId = currentChainId === 11155111 ? 4202 : 11155111;
    await switchNetwork(targetChainId);
  };

  return (
    <header className="bg-gradient-to-r from-green-700 to-green-900 py-4 px-6 sticky top-0 z-40 shadow-md">
      <nav className="flex flex-wrap justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-3 no-underline group transition-all duration-300">
          <div className="flex items-center">
            <img src="/logo.svg" alt="MilkNet Logo" className="w-10 h-10" />
          </div>
          <span className="text-yellow-400 font-bold text-xl tracking-tight group-hover:text-yellow-300 transition-colors">
            MilkNet
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-white hover:text-yellow-200 transition-colors py-2 ${
                  isActive ? 'font-medium text-yellow-300 border-b-2 border-yellow-300' : ''
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center mt-0 sm:mt-0">
          {account ? (
            <div ref={menuRef} className="flex items-center flex-wrap gap-3 relative">
              <div className="bg-green-950 bg-opacity-50 text-green-100 py-1.5 px-3 rounded-lg text-sm border border-green-600">
                <span className="font-medium">{networkName}</span>
              </div>
              <div 
                className="bg-yellow-400 text-green-900 py-1.5 px-3 rounded-lg text-sm font-medium cursor-pointer hover:bg-yellow-300 transition-colors"
                onClick={() => setShowMenu(!showMenu)}
              >
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </div>
              
              {showMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl p-4 min-w-[200px] z-50">
                  <div className="space-y-2">
                    <button
                      onClick={handleNetworkSwitch}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Switch to {networkName === 'Sepolia' ? 'LISK Testnet' : 'Sepolia'}
                    </button>
                    <button
                      onClick={disconnectWallet}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 py-2 px-6 rounded-full font-medium shadow-md transition-all flex gap-2 items-center"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-green-800">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="block px-4 py-2 text-white hover:bg-green-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2">
          {error}
          <button 
            className="float-right text-red-700" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
    </header>
  );
}

// Create a SkeletonLoader component
function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}