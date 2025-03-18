'use client';
import { useState } from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export const Devs = () => {
  const [activeProfile, setActiveProfile] = useState(0);
  const developers = [
    {
      name: 'Audrey Pendo',
      role: 'Lead Blockchain Developer',
      bio: 'Blockchain architect and Software Engineering Student',
      image: '/images/odree.jpeg',
      socialLinks: {
        linkedin: 'https://www.linkedin.com/in/audrey-pendo-109656346/',
        twitter: 'https://twitter.com/AudreyOuma_P',
        github: 'https://github.com/odree123'
      }
    },
    {
      name: 'Ouma Ouma',
      role: 'Full Stack Engineer',
      bio: 'Expert in Golang, React, Node.js, and smart contract development',
      image: '/images/godwin.jpeg',
      socialLinks: {
        linkedin: 'https://www.linkedin.com/in/ouma-ouma-a01716267',
        twitter: 'https://twitter.com/ouma_godwin1',
        github: 'https://github.com/oumaoumag'
      }
    },
  ]; 

  return (
    <div className="container mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Meet Our Team</h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Our talented blockchain developers and industry experts are dedicated to revolutionizing the dairy supply chain
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        {developers.map((dev, index) => (
          <motion.div 
            key={index}
            className={`bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all ${
              activeProfile === index 
                ? 'border-l-4 border-green-600' 
                : ''
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -10 }}
            onClick={() => setActiveProfile(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveProfile(index)}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile image */}
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={dev.image}
                  alt={dev.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-800">{dev.name}</h3>
                <p className="text-green-600 font-medium mb-2">{dev.role}</p>
                <p className="text-gray-600 mb-4">{dev.bio}</p>
                
                <div className="flex justify-center md:justify-start space-x-4">
                  <a 
                    href={dev.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a 
                    href={dev.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-400 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                  <a 
                    href={dev.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Join Our Team card */}
      <motion.div 
        className="mt-12 bg-gradient-to-r from-green-900 to-green-700 rounded-xl p-8 shadow-md text-white text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
        <p className="mb-6">
          We're looking for talented blockchain developers and dairy industry experts to help us transform supply chains
        </p>
        <motion.button 
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Openings
        </motion.button>
      </motion.div>
    </div>
  );
};