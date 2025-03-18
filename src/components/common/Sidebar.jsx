import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check once on component mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Define actions based on user role
  const buyerActions = [
    {
      title: 'Browse Marketplace',
      description: 'Discover fresh milk batches',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      onClick: () => navigate('/marketplace')
    },
    {
      title: 'My Orders',
      description: 'Track your purchase history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: () => navigate('/buyer-dashboard')
    },
    {
      title: 'Manage Profile',
      description: 'Update your information',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate('/profile')
    },
    {
      title: 'Transaction History',
      description: 'View blockchain activity',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      onClick: () => window.open('https://etherscan.io', '_blank')
    }
  ];

  const farmerActions = [
    {
      title: 'Add Milk Batch',
      description: 'Register new milk batches',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => navigate('/farmer')
    },
    {
      title: 'View Orders',
      description: 'Check buyer orders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: () => navigate('/farmer')
    },
    {
      title: 'Manage Profile',
      description: 'Update your information',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate('/profile')
    },
    {
      title: 'View Statistics',
      description: 'Track sales and earnings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      onClick: () => navigate('/farmer')
    }
  ];

  // Select the appropriate actions based on user role
  const actions = userRole === 'farmer' ? farmerActions : buyerActions;

  // Animation variants for the sidebar
  const sidebarVariants = {
    expanded: { width: 256, transition: { duration: 0.3 } },
    collapsed: { width: 72, transition: { duration: 0.3 } }
  };

  // Animation variants for content inside sidebar
  const contentVariants = {
    expanded: { 
      opacity: 1, 
      display: "block",
      transition: { delay: 0.1, duration: 0.2 } 
    },
    collapsed: { 
      opacity: 0, 
      display: "none", 
      transition: { duration: 0.2 } 
    }
  };

  // Mobile overlay variants
  const overlayVariants = {
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hidden: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Toggle button to expand/collapse
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Toggle button that's always visible */}
      <button 
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 transition-colors`}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile overlay - only shown when sidebar is expanded on mobile */}
      {isMobile && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Collapsible sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isExpanded ? "expanded" : "collapsed"}
        className={`${
          isMobile ? 'fixed left-0 top-0 bottom-0' : 'relative'
        } bg-white shadow-lg rounded-r-xl overflow-hidden z-50 h-full transition-all`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-green-900 to-green-700 flex items-center">
            <motion.h2
              variants={contentVariants}
              initial={false}
              animate={isExpanded ? "expanded" : "collapsed"}
              className="text-lg font-bold text-white"
            >
              Quick Actions
            </motion.h2>
          </div>

          {/* Action Items */}
          <div className="p-4 space-y-4 flex-grow overflow-y-auto">
            {actions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ x: isExpanded ? 5 : 0 }}
                className={`p-3 rounded-lg hover:bg-green-50 cursor-pointer transition-colors flex ${isExpanded ? '' : 'justify-center'}`}
                onClick={action.onClick}
              >
                <div className={`${isExpanded ? 'p-2 mr-3' : 'p-1'} bg-green-100 text-green-600 rounded-full`}>
                  {action.icon}
                </div>
                {isExpanded && (
                  <motion.div
                    variants={contentVariants}
                    initial={false}
                    animate={isExpanded ? "expanded" : "collapsed"}
                  >
                    <h3 className="font-medium text-gray-800">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar; 