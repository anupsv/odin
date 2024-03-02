import { goerli } from 'viem/chains';
import { generateContractHook } from '@/hooks/contracts';
import InvariantABI from './InvariantABI';

/**
 * Returns contract data for the BuyMeACoffee contract.
 */
export const useInvariantContract = generateContractHook({
  abi: InvariantABI,
  [goerli.id]: {
    chain: goerli,
    address: '0x4AacB4e5448b86f8e53FCCB29d58a01EffB0962F',
  },
});
