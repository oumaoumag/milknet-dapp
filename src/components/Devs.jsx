'use client';
import { useState } from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';

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
    <div className="container mx-auto min-h p-10 bg-transparent">
      <h2 className="text-4xl font-bold text-center mb-12 text-white">
        Meet Our Innovative Team
      </h2>
      
      <div className="grid md:grid-cols-2 gap-20">
        {developers.map((dev, index) => (
          <div 
            key={index}
            className={`bg-transparent rounded-2xl p-6 text-center transition-all duration-300 ${
              activeProfile === index 
                ? 'scale-105 shadow-2xl border-2 border-green-500 backdrop-blur-sm bg-white/5' 
                : 'hover:scale-105 hover:shadow-xl backdrop-blur-sm bg-white/5'
            }`}
            onClick={() => setActiveProfile(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveProfile(index)}
          >
            <div className="w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full">
              <img 
                src={dev.image}
                alt={dev.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white">{dev.name}</h3>
            <p className="text-gray-200 mb-2">{dev.role}</p>
            <p className="text-white mb-4">{dev.bio}</p>
            
            <div className="flex justify-center space-x-4">
              <a 
                href={dev.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-400"
              >
                <Linkedin size={24} />
              </a>
              <a 
                href={dev.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-400"
              >
                <Twitter size={24} />
              </a>
              <a 
                href={dev.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Github size={24} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};