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
  
  // Mobile menu state
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useClickOutside(menuRef, () => setShowMenu(false));
  useClickOutside(accountsMenuRef, () => setShowAccountsMenu(false));

  const getNavLinks = () => {
    if (isAuthenticated) {
      if (user?.role === ROLES.FARMER) {
        return [
          { to: '/farmer', label: 'Dashboard' },
          { to: '/marketplace', label: 'Marketplace' },
        ];
      } else if (user?.role === ROLES.BUYER) {
        return [
          { to: '/buyer-dashboard', label: 'Dashboard' },
          { to: '/marketplace', label: 'Marketplace' },
        ];
      }
    }
    return [
      { to: '/about', label: 'About Us' },
      { to: '/marketplace', label: 'Marketplace' },
    ];
  };

  const handleConnect = async () => {
    if (connecting) return;
    
    try {
      setConnecting(true);
      setError(null);
      await connectWallet();
    } catch (err) {
      setError(formatBlockchainError(err) || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  const handleNetworkSwitch = async () => {
    try {
      const targetNetworkId = networkName === 'Sepolia' ? 4202 : 11155111;
      await switchNetwork(targetNetworkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const fetchAccounts = async () => {
    if (!window.ethereum) return;
    setLoadingAccounts(true);
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts from your wallet');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAccountSwitch = async (accountAddress) => {
    if (!window.ethereum) return;
    
    try {
      // Check if this is already the active account
      if (account.toLowerCase() === accountAddress.toLowerCase()) {
        toast.info('Already connected to this account');
        setShowAccountsMenu(false);
        return;
      }
      
      // Request connection to the specific account
      await window.ethereum.request({ 
        method: 'wallet_requestPermissions', 
        params: [{ eth_accounts: {} }] 
      });
      
      // The accountsChanged event will handle the rest
      setShowAccountsMenu(false);
      toast.info('Please select the desired account in your wallet');
    } catch (error) {
      console.error('Failed to switch account:', error);
      toast.error('Failed to switch account: ' + error.message);
    }
  };

  const toggleAccountsMenu = async () => {
    if (!showAccountsMenu) {
      await fetchAccounts();
    }
    setShowAccountsMenu(!showAccountsMenu);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-green-800">MilkNet</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {getNavLinks().map((link, index) => (
              <NavLink 
                key={index} 
                to={link.to} 
                className={({ isActive }) => 
                  isActive 
                    ? "text-green-600 font-semibold" 
                    : "text-gray-700 hover:text-green-600 transition-colors"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Account/Login Section */}
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="hidden sm:inline text-gray-800">
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </span>
                  <span className="sm:hidden text-gray-800">
                    {account.substring(0, 4)}...
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Connected as</p>
                      <p className="text-sm font-medium truncate">{account}</p>
                    </div>
                    
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">{networkName || 'Unknown Network'}</span>
                      </div>
                      <button
                        onClick={handleNetworkSwitch}
                        className="mt-1 text-xs text-green-600 hover:text-green-800"
                      >
                        Switch Network
                      </button>
                    </div>
                    
                    <button
                      onClick={toggleAccountsMenu}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Switch Account
                    </button>
                    
                    {showAccountsMenu && (
                      <div className="absolute left-full ml-2 top-0 w-64 bg-white rounded-lg shadow-xl py-2 z-20" ref={accountsMenuRef}>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium">Select Account</p>
                        </div>
                        
                        {loadingAccounts ? (
                          <div className="px-4 py-4 text-center">
                            <svg className="animate-spin h-5 w-5 mx-auto text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : accounts.length > 0 ? (
                          accounts.map((acc, index) => (
                            <button
                              key={index}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${acc.toLowerCase() === account.toLowerCase() ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => handleAccountSwitch(acc)}
                            >
                              <div className="flex items-center">
                                {acc.toLowerCase() === account.toLowerCase() && (
                                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                                <span className="truncate">{acc}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">No accounts found</div>
                        )}
                      </div>
                    )}
                    
                    {isAuthenticated && (
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <button
                        onClick={disconnectWallet}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : 'Connect Wallet'}
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 border-t border-gray-200 pt-3">
            <div className="space-y-2">
              {getNavLinks().map((link, index) => (
                <NavLink 
                  key={index} 
                  to={link.to}
                  className={({ isActive }) => 
                    `block py-2 px-2 rounded-md ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-2 rounded-md text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
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