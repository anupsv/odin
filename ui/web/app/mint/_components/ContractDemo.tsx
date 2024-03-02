import { useState } from 'react';
import { encodeFunctionData, formatEther } from 'viem';
import { useAccount, useEstimateGas } from 'wagmi';
import { SpinnerIcon } from '@/components/icons/SpinnerIcon';
import AccountConnect from '@/components/layout/header/AccountConnect';
import NextImage from '@/components/NextImage/NextImage';
import { EXPECTED_CHAIN } from '@/constants';
import { useCollectionMetadata } from '@/hooks/useCollectionMetadata';
import { getChainsForEnvironment } from '@/store/supportedChains';
import { useCustom1155Contract } from '../_contracts/useCustom1155Contract';
import StepStartMint from './StepStartMint';
import SwitchNetwork from './SwitchNetwork';

export enum MintSteps {
  START_MINT_STEP,
  MINT_PROCESSING_STEP,
  OUT_OF_GAS_STEP,
  MINT_COMPLETE_STEP,
}

export default function MintContractDemo() {
  const [mintStep, setMintStep] = useState<MintSteps>(MintSteps.START_MINT_STEP);

  const { chain: accountChain, address, isConnected } = useAccount();

  const contract = useCustom1155Contract();

  const chain =
    accountChain ?? getChainsForEnvironment().find((envChain) => EXPECTED_CHAIN.id === envChain.id);

  const onCorrectNetwork = chain?.id === EXPECTED_CHAIN.id;

  const {
    collectionName,
    description,
    imageAddress,
    isLoading: isLoadingCollectionMetadata,
  } = useCollectionMetadata(
    onCorrectNetwork,
    contract.status === 'ready' ? contract.address : undefined,
    contract.abi,
  );

  // The CustomERC1155 contract is a free mint, so instead of mint price we fetch tx fee estimate
  const { data: txFeeEstimation, isLoading: isLoadingFeeEstimate } = useEstimateGas({
    to: contract.status === 'ready' ? contract.address : undefined,
    account: address,
    chainId: chain?.id,
    data: address
      ? encodeFunctionData({
          abi: contract.abi,
          functionName: 'mint',
          args: [address, BigInt(1), BigInt(1), address],
        })
      : undefined,
    query: { enabled: onCorrectNetwork && !!address },
  });

  const mintTxFeeEstimation = txFeeEstimation ? formatEther(txFeeEstimation, 'gwei') : 'Unknown';

  if (isLoadingCollectionMetadata) {
    return (
      <div className="my-5 flex justify-center align-middle">
        <span className="text-xl">
          <SpinnerIcon className="h-20 w-20 animate-spin" />
        </span>
      </div>
    );
  }

  return (
    <div className="gap-16 lg:flex">
      <div className="w-full flex-shrink-0 flex-grow lg:max-w-[400px] xl:max-w-[600px]">
        <NextImage
          src={imageAddress}
          altText={collectionName}
          className="block w-full rounded-2xl"
        />
      </div>
      <div className="flex-shrink-1 mt-10 w-full flex-grow-0 lg:mt-0">
        <h1 className="text-4xl font-bold">{collectionName}</h1>

        {isConnected && (
          <h2 className="my-5">
            Estimated tx fee:{' '}
            {isLoadingFeeEstimate ? (
              <SpinnerIcon className="inline animate-spin" height="1.2rem" width="1.2rem" />
            ) : (
              <>
                {mintTxFeeEstimation}
                {chain?.nativeCurrency.symbol ?? 'ETH'}
              </>
            )}
          </h2>
        )}

        <p className="mb-6 mt-4 text-sm text-boat-footer-light-gray">{description}</p>

        {contract.status === 'onUnsupportedNetwork' && <SwitchNetwork />}

        {isConnected ? (
          <StepStartMint
            setMintStep={setMintStep}
            mintStep={mintStep}
            collectionName={collectionName}
          />
        ) : (
          <AccountConnect />
        )}

        {/* TODO: hiding this progress bar till we get the number of NFT's from the contract */}
        {/* <div className="items-center md:flex">
          <div className="w-full flex-shrink-0 flex-grow md:max-w-[70%]">
            <ProgressBar percent={45} />
          </div>
          <div className="mt-2 w-full flex-shrink flex-grow-0 text-boat-footer-light-gray md:mt-0 md:text-right">
            94/200 Minted
          </div>
        </div> */}
      </div>
    </div>
  );
}
