import { Web3Provider } from './contexts/Web3Context';
import FarmerRegistration from './components/farmers/Registration';
import CreateBatch from './components/batches/CreateBatch';

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <h1>MilkNet Marketplace</h1>
        <FarmerRegistration />
        <CreateBatch />
      </div>
    </Web3Provider>
  );
}

export default App;