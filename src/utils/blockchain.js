import { Contract } from 'ethers';
import FarmerRegistrationABI from './FarmerRegistrationABI.json';

export function getContract(address, signer) {
  return new Contract(address, FarmerRegistrationABI, signer);
}
