import { useWeb3 } from '../contexts/Web3Context';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../utils/errorUtils';

export default function Header() {
  const { account, networkName, connectWallet, disconnectWallet, switchNetwork, switchToAccount } = useWeb3();
  const { user, isAuthenticated, isFarmer, isBuyer, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showAccountsMenu, setShowAccountsMenu] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const menuRef = useRef();
  const accountsMenuRef = useRef();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Add mobile menu toggle
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useClickOutside(menuRef, () => setShowMenu(false));
  useClickOutside(accountsMenuRef, () => setShowAccountsMenu(false));

  // Navigation links based on user role
  const getNavLinks = () => {
    const links = [
      { path: "/", name: "Home" },
      { path: "/marketplace", name: "Marketplace" },
      { path: "/about", name: "About Us" }
    ];
    
    if (isAuthenticated) {
      if (isFarmer) {
        links.splice(2, 0, { path: "/farmer", name: "Farmer Dashboard" });
      } else if (isBuyer) {
        links.splice(2, 0, { path: "/buyer-dashboard", name: "Buyer Dashboard" });
      }
    } else {
      links.splice(2, 0, { path: "/login", name: "Login" });
    }
    
    return links;
  };
  
  const navLinks = getNavLinks();

  // Add loading state to connectWallet
  const handleConnect = async () => {
    try {
      setConnecting(true);
      await connectWallet();
      
      // If wallet is connected but user isn't authenticated, redirect to role selector
      if (!isAuthenticated) {
        navigate('/select-role');
      }
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
  
  const fetchAccounts = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return;
    }

    try {
      setLoadingAccounts(true);
      // Use eth_requestAccounts to ensure we have permission to view all accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      if (error.code === 4001) {
        toast.error('Permission to access accounts was denied');
      } else {
        toast.error(`Failed to fetch wallet accounts: ${formatBlockchainError(error)}`);
      }
    } finally {
      setLoadingAccounts(false);
    }
  };
  
  const handleAccountSwitch = async (accountIndex) => {
    try {
      setLoadingAccounts(true);
      const result = await switchToAccount(accountIndex);
      if (result) {
        // Keep the menu open since the user needs to select in MetaMask
        setTimeout(() => {
          // Refresh the accounts list after a short delay
          fetchAccounts().finally(() => {
            setLoadingAccounts(false);
          });
        }, 1000);
      } else {
        setLoadingAccounts(false);
      }
    } catch (error) {
      console.error('Error switching account:', error);
      toast.error(`Failed to switch account: ${error.message}`);
      setLoadingAccounts(false);
    }
  };
  
  // Toggle accounts menu and fetch accounts if needed
  const toggleAccountsMenu = async () => {
    try {
      if (!showAccountsMenu) {
        // Always refresh accounts when opening the menu
        await fetchAccounts();
      }
      setShowAccountsMenu(!showAccountsMenu);
      setShowMenu(false);
    } catch (error) {
      console.error('Error toggling accounts menu:', error);
    }
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
              <div className="flex items-center gap-2">
                <div 
                  className="bg-yellow-400 text-green-900 py-1.5 px-3 rounded-lg text-sm font-medium cursor-pointer hover:bg-yellow-300 transition-colors flex items-center gap-1"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <button
                  className="bg-green-950 bg-opacity-50 text-green-100 py-1.5 px-2 rounded-lg text-sm hover:bg-opacity-70 transition-colors"
                  onClick={toggleAccountsMenu}
                  title="Switch Account"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
                  </svg>
                </button>
              </div>
              
              {/* Account switcher menu */}
              {showAccountsMenu && (
                <div ref={accountsMenuRef} className="absolute top-12 right-0 bg-white rounded-lg shadow-xl p-4 min-w-[280px] z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Switch Account</h3>
                    <button 
                      onClick={() => setShowAccountsMenu(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {loadingAccounts ? (
                    <div className="py-3 text-center">
                      <svg className="animate-spin h-5 w-5 text-yellow-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Loading accounts...</p>
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="py-3 text-center text-gray-500">
                      <p>No accounts available</p>
                      <button 
                        onClick={fetchAccounts}
                        className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 underline"
                      >
                        Refresh accounts
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {accounts.map((addr, index) => (
                        <div 
                          key={addr}
                          className={`p-2 border rounded cursor-pointer transition-all ${
                            addr.toLowerCase() === account?.toLowerCase() 
                              ? 'border-yellow-500 bg-yellow-50' 
                              : 'border-gray-200 hover:bg-yellow-50'
                          }`}
                          onClick={() => handleAccountSwitch(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{`Account ${index + 1}`}</div>
                              <div className="text-xs text-gray-500 truncate">{addr}</div>
                            </div>
                            {addr.toLowerCase() === account?.toLowerCase() && (
                              <span className="text-yellow-600 text-xs font-medium">Active</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      <p>Switch accounts to access different user roles</p>
                    </div>
                    <button
                      onClick={fetchAccounts}
                      className="mt-2 w-full text-center text-xs text-yellow-600 hover:text-yellow-700 py-1 rounded border border-yellow-200 hover:bg-yellow-50"
                    >
                      Refresh Accounts
                    </button>
                  </div>
                </div>
              )}
              
              {showMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl p-4 min-w-[200px] z-50">
                  <div className="space-y-2">
                    {isAuthenticated && (
                      <div className="px-4 py-2 text-sm text-gray-900 font-medium border-b border-gray-100 mb-2">
                        Signed in as {user?.name || 'User'}
                        <div className="text-xs text-gray-500 mt-1">
                          Role: {isFarmer ? 'Farmer' : isBuyer ? 'Buyer' : 'Guest'}
                        </div>
                      </div>
                    )}
                    
                    {!isAuthenticated && (
                      <>
                        <button
                          onClick={() => { setShowMenu(false); navigate('/login'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => { setShowMenu(false); navigate('/register'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Register
                        </button>
                        <div className="border-t border-gray-100 my-2"></div>
                      </>
                    )}
                    
                    <button
                      onClick={handleNetworkSwitch}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Switch to {networkName === 'Sepolia' ? 'LISK Testnet' : 'Sepolia'}
                    </button>
                    
                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          logout();
                          setShowMenu(false);
                          toast.info('Logged out successfully');
                          
                          // Navigate to role selector if wallet is still connected
                          if (account) {
                            navigate('/select-role');
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100 rounded"
                      >
                        Logout
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowMenu(false);
                      }}
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

// // Create a SkeletonLoader component
// function SkeletonLoader() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {[1, 2, 3, 4, 5, 6].map(i => (
//         <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
//           <div className="h-16 bg-gray-200"></div>
//           <div className="p-4 space-y-4">
//             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//             <div className="h-10 bg-gray-200 rounded"></div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }