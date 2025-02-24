import { ethers } from 'ethers';
import FarmerRegistrationABI from '../../artifacts/contracts/FarmerRegistration.sol/FarmerRegistration.json';

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

export const getContract = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, FarmerRegistrationABI.abi, signer);
};