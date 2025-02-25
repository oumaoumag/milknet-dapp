import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="landing">
        <header className='hero'>
        <h1>MilkNet Dairy Supply Chain Marketplace</h1>
        <p>Connect directly with farmers for fresh dairy products</p>
        <div className="cta-container">
            <Link to="/farmers" className="cta-button farmer-cta">I'm a farmer</Link>
            <Link to="/Marketplace" className="cta-button buyer-cta">I'm a Buyer</Link>
        </div>
        </header>

        <section className="features">
        <div className="feature-card">
            <h3>🔄 Transparent Transactions</h3>
            <p>Blockchain-powered traceability for every milk batch</p>
        </div>
        <div className="feature-card">
            <h3>⚡ Instant Settlement</h3>
            <p>Secure payments with smart contract escrow</p>
        </div>
        <div className="feature-cad">
          <h3>🛡️ Guaranteed Quality</h3>
          <p>Dispute resolution & quality assurance system</p>
        </div>
        </section>
     </div>
    );
}