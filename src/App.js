// App.js
import "./App.css"
import { Web3Provider } from './contexts/Web3Context';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './components/Landing';
import FarmerDashboard from './components/farmers/Dashboard';
import Marketplace from './components/buyer/Marketplace';
import FarmerRegistration from './components/farmers/Registration';
import AboutUs from './components/AboutUs';

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Header />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/register-farmer" element={<FarmerRegistration />} />
            <Route path="/farmer" element={<FarmerDashboard/>} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </Web3Provider>
  );
}

export default App;