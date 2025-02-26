import "./App.css"
import { Web3Provider } from './contexts/Web3Context';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header'
import Landing from './components/Landing';
import FarmerDashboard from './components/farmers/Dashboard';
import Marketplace from './components/buyer/Marketplace';
import FarmerRegistration from './components/farmers/Registration';

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
       <Header />
       <Routes>
         <Route path="/" element={<Landing />} />
         <Route path="/farmer" element={<FarmerDashboard/>} />
         <Route path="/marketplace" element={<Marketplace />} />
         <Route path="/register-farmer" element={<FarmerRegistration />} />
       </Routes>
     </BrowserRouter>
    </Web3Provider>
  );
}

export default App;