import { ethers } from 'ethers';
import FarmerRegistrationABI from '../../artifacts/contracts/FarmerRegistration.sol/FarmerRegistration.json';

const contractAddress = "0x7d7491eb3b88d26a1e6c635401cbd97809131053";

export const getContract = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, FarmerRegistrationABI.abi, signer);
};