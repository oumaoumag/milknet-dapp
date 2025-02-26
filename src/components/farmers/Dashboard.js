import { useEffect, useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context"
import CreateBatch from '../batches/CreateBatch';
import BatchList from '../batches/BatchList';

export default function FarmerDashboard() {
    const { contract, account } = useWeb3();
    const [farmerData, setFarmerData] = useState(null);
    const [showBatchForm, setShowBatchForm] = useState(false);

    useEffect(() => {
        const loadFarmerData = async () => {
            if (contract && account) {
                const data = await contract.getFarmer(account);
                const batches = await contract.fetchBatches() // Not yet implemented
                setFarmerData({ ...data, batches })
            }
        };
        loadFarmerData();
    }, [contract, account]);

    if (!farmerData) return <div>Loading farmer data...</div>;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Welcome, {farmerData.name}</h2>
                <button onClick={() => setShowBatchForm(!showBatchForm)}>
                    {showBatchForm ? 'Cancel' : 'Add New Batch' }
                </button>
            </div>

            {showBatchForm && <CreateBatch />}

            <section className="stats-grid">
                <div className="stat-card">
                    <h3> Total Batches</h3>
                    <p>{farmerData.batches.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Orders</h3>
                    <p>{farmerData.activeOrders}</p>
                </div>
            </section>

            <BatchList batches={farmerData.batches} />
        </div>
    );
}