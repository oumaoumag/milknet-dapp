import { Contract } from 'ethers';
import MilkNetABI from './MilkNetABI.json';

export function getContract(address, signer) {
  return new Contract(address, MilkNetABI, signer);
}
