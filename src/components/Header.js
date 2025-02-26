import { useWeb3 } from '../contexts/Web3Context';
import { Link } from 'react-router-dom';

export default function Header() {
    const { account, networkName } = useWeb3();

    return (
        <header className='app-header'>
            <nav>
                <Link to="/" className="logo">
                  {/* <img src="../public/logo.svg" alt="MilkNet" /> */}
                  <span>MilkNet</span>
                  </Link>

                  <div className='wallet-info'>
                    {account ? (
                        <>
                        <div className='network-chip'>{networkName}</div>
                        <div className='account-pill'>
                            {`${account.slice(0, 6)}...${account.slice(-4)}`}
                            </div>
                            </>
                    ) : (
                        <button className='connect-button'>
                            Connect Wallet
                        </button>
                    )}
                  </div>
            </nav>
        </header>
    );
}