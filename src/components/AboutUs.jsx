'use client';
import { motion } from 'framer-motion';
import { Devs } from './Devs';
import { 
  ArrowRight, 
  Shield, 
  Cpu, 
  LineChart, 
  Droplet, 
  Tractor, 
  Leaf, 
  Clock, 
  FileCheck, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';

export default function AboutUs() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Transactions",
      description: "Smart contract-powered payments and immutable transaction records ensure complete security."
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Blockchain Technology",
      description: "Built on cutting-edge blockchain infrastructure for maximum transparency and reliability."
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Comprehensive tracking and analytics for informed decision-making."
    }
  ];

  const problems = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Payment Delays",
      description: "Farmers often wait weeks or months to receive payment for their products."
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Quality Concerns",
      description: "Consumers lack visibility into milk quality and origin."
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Limited Market Access",
      description: "Small-scale farmers struggle to reach consumers directly."
    }
  ];
  
  const solutions = [
    {
      icon: <Droplet className="w-6 h-6" />,
      title: "Traceability System",
      description: "Track milk from farm to table with blockchain verification."
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Smart Contracts",
      description: "Automated payments triggered immediately upon delivery confirmation."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Direct Marketplace",
      description: "Connect farmers and consumers without costly intermediaries."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with milk-drop animated background */}
      <motion.section 
        className="relative overflow-hidden py-20 px-4 bg-gradient-to-r from-green-900 to-green-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated milk drops background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20 backdrop-blur-sm"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 30 + 10, 0],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: Math.random() * 5 + 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
            {...fadeIn}
          >
            MilkNet
          </motion.h1>
          <motion.h2 
            className="text-2xl md:text-3xl font-semibold mb-8 text-white"
            {...fadeIn}
          >
            Transforming Dairy Supply Chains With Blockchain
          </motion.h2>
          <motion.p 
            className="text-xl text-white/80 max-w-2xl mx-auto mb-8"
            {...fadeIn}
          >
            MilkNet connects farmers directly with consumers through blockchain technology,
            ensuring transparency, quality, and fair pricing in every transaction.
          </motion.p>
          
          <motion.button 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-all flex items-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Our Platform
            <ArrowRight className="ml-2 w-5 h-5" />
          </motion.button>
        </div>
      </motion.section>

      {/* Project Overview Section */}
      <motion.section 
        className="py-16 px-4 bg-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Project Overview</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover how MilkNet is revolutionizing the dairy industry through blockchain technology
          </p>
          
          <div className="bg-gray-200/70 p-8 rounded-xl shadow-md border border-gray-200 max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              MilkNet is a decentralized platform connecting farmers directly with consumers through blockchain technology. 
              Our platform ensures transparency, quality assurance, and fair pricing while eliminating intermediaries in the dairy supply chain.
            </p>
            
            <div className="flex items-center space-x-3 justify-center p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center">
                <Tractor className="w-6 h-6 text-green-600 mr-2" />
                <span className="font-medium">Farmer</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-green-100 mx-2 relative">
                <motion.div 
                  className="absolute h-2 w-2 bg-green-600 rounded-full top-1/2 transform -translate-y-1/2"
                  animate={{
                    x: [0, 100, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              <div className="flex items-center">
                <Droplet className="w-6 h-6 text-green-600 mr-2" />
                <span className="font-medium">MilkNet</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-green-100 mx-2 relative">
                <motion.div 
                  className="absolute h-2 w-2 bg-green-600 rounded-full top-1/2 transform -translate-y-1/2"
                  animate={{
                    x: [0, 100, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                />
              </div>
              
              <div className="flex items-center">
                <ShoppingCart className="w-6 h-6 text-green-600 mr-2" />
                <span className="font-medium">Consumer</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Problems & Solutions Section */}
      <motion.section 
        className="py-16 px-4 bg-green-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Problems & Solutions</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Addressing key challenges in the dairy industry with innovative blockchain technology
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* The Problem */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">The Problem</h3>
                <div className="w-16 h-1 bg-red-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                {problems.map((problem, idx) => (
                  <motion.div 
                    key={idx}
                    className="bg-gray-100/80 p-6 rounded-xl shadow-md flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx + 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-3 bg-red-50 rounded-full text-red-500">
                      {problem.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{problem.title}</h4>
                      <p className="text-gray-600 text-sm">{problem.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Our Solution */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Solution</h3>
                <div className="w-16 h-1 bg-green-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                {solutions.map((solution, idx) => (
                  <motion.div 
                    key={idx}
                    className="bg-gray-100/80 p-6 rounded-xl shadow-md flex items-start gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx + 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                      {solution.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{solution.title}</h4>
                      <p className="text-gray-600 text-sm">{solution.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        className="py-16 px-4 bg-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Why Choose MilkNet?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our platform offers revolutionary features powered by blockchain technology
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-green-50/80 p-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technical Implementation */}
      <motion.section 
        className="py-16 px-4 bg-green-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Technical Implementation</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Powered by cutting-edge blockchain technology for maximum security and transparency
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-gray-100/90 rounded-xl p-8 shadow-md relative z-10"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center">
                <Droplet className="mr-2 w-6 h-6" />
                Core Features
              </h3>
              <ul className="space-y-3">
                {[
                  "Real-time milk batch tracking", 
                  "Immutable transaction records", 
                  "Automated quality assurance", 
                  "Instant payment settlement"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    className="flex items-center p-2 hover:bg-green-50 rounded-lg transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-gray-100/90 rounded-xl p-8 shadow-md relative z-10"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center">
                <Cpu className="mr-2 w-6 h-6" />
                Blockchain Integration
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">Currently deployed on:</p>
                <div className="flex gap-4 flex-wrap">
                  <span className="bg-green-50 border border-green-200 px-4 py-2 rounded-full text-green-600 text-sm font-medium">
                    Sepolia Testnet
                  </span>
                  <span className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-full text-blue-600 text-sm font-medium">
                    Lisk Testnet
                  </span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center mb-2">
                    <Leaf className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700 font-medium">Eco-Friendly</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Our platform uses energy-efficient validation mechanisms to minimize environmental impact.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Mission Statement */}
      <motion.section 
        className="py-16 px-4 bg-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="bg-green-50/90 p-8 md:p-12 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
              <Tractor className="w-10 h-10 text-green-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
            </div>
            <p className="text-lg leading-relaxed mb-6 text-gray-700">
              At MilkNet, we're committed to transforming the dairy industry through innovative blockchain solutions. 
              Our platform bridges the gap between farmers and consumers, creating a transparent and efficient marketplace 
              that benefits all participants in the dairy supply chain.
            </p>
            <motion.div 
              className="flex items-center text-green-600 cursor-pointer group font-medium"
              whileHover={{ x: 5 }}
            >
              Learn more about our vision
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-green-50">
        <Devs />
      </section>
      
      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4 bg-gradient-to-r from-green-900 to-green-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Milk Revolution?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Start connecting with farmers and consumers on our blockchain platform today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join as Farmer
            </motion.button>
            <motion.button 
              className="bg-transparent hover:bg-green-800 border-2 border-white text-white font-bold py-3 px-8 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join as Buyer
            </motion.button>
            <motion.button 
              className="bg-white hover:bg-gray-100 text-green-800 font-bold py-3 px-8 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Marketplace
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}