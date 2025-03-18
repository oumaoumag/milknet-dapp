import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-green-900 to-green-700 text-white">
        <div className="container mx-auto py-20 px-4 md:px-8 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">MilkNet</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">Transforming Dairy Supply Chains With Blockchain</h2>
            <p className="text-xl mb-10 text-gray-100">
              Join the revolution in transparent and traceable milk supply
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link to="/register-farmer" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                Register as Farmer
              </Link>
              <Link to="/register" className="bg-white hover:bg-gray-100 text-green-800 font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Register as Buyer
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/marketplace" className="bg-transparent hover:bg-green-800 border-2 border-white text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Explore Marketplace
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Arenas Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Our Arenas</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore different aspects of our blockchain-powered milk supply chain platform
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Arena 1 - Farmers */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">For Farmers</h3>
              <p className="text-gray-600 text-center mb-6">
                Register your farm, manage milk batches, and connect directly with buyers - all on blockchain.
              </p>
              <div className="flex justify-center">
                <Link to="/register-farmer" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                  Register as Farmer
                </Link>
              </div>
            </motion.div>
            
            {/* Arena 2 - Buyers */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">For Buyers</h3>
              <p className="text-gray-600 text-center mb-6">
                Purchase quality milk with full transparency and traceability - from farm to your doorstep.
              </p>
              <div className="flex justify-center">
                <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm">
                  Register as Buyer
                </Link>
              </div>
            </motion.div>
            
            {/* Arena 3 - Marketplace */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Marketplace</h3>
              <p className="text-gray-600 text-center mb-6">
                Browse available milk batches, compare prices, and place orders with secure blockchain transactions.
              </p>
              <div className="flex justify-center">
                <Link to="/marketplace" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  Explore Marketplace
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-4xl font-bold text-green-600 mb-2">1.2k+</h3>
              <p className="text-gray-600">Registered Farmers</p>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-green-600 mb-2">5k+</h3>
              <p className="text-gray-600">Milk Batches</p>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-green-600 mb-2">10k+</h3>
              <p className="text-gray-600">Transactions</p>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-green-600 mb-2">98%</h3>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Why MilkNet?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our platform offers revolutionary features powered by blockchain technology
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Immutable Records",
                desc: "All transactions are recorded on blockchain, ensuring data cannot be altered or tampered with."
              },
              {
                title: "Quality Assurance",
                desc: "Track milk from source to consumer, with quality checkpoints recorded at every stage."
              },
              {
                title: "Fair Pricing",
                desc: "Transparent pricing model ensures farmers receive fair compensation for their products."
              },
              {
                title: "Dispute Resolution",
                desc: "Built-in mechanisms for addressing quality concerns and resolving disputes."
              },
              {
                title: "Real-time Updates",
                desc: "Get instant notifications about orders, deliveries, and payments."
              },
              {
                title: "Secure Payments",
                desc: "Smart contracts ensure secure and timely payments for all parties."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-50 rounded-lg p-6 shadow hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-bold mb-3 text-green-700">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-900 to-green-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Future of Dairy?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Whether you're a farmer looking to sell your products or a buyer seeking quality milk,
            MilkNet has everything you need to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register-farmer" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-all">
              Register as Farmer
            </Link>
            <Link to="/register" className="bg-transparent hover:bg-green-800 border-2 border-white text-white font-bold py-3 px-8 rounded-lg transition-all">
              Register as Buyer
            </Link>
            <Link to="/marketplace" className="bg-white hover:bg-gray-100 text-green-800 font-bold py-3 px-8 rounded-lg transition-all">
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}