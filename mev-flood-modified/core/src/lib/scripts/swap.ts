import { Contract, providers, Wallet } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import contracts from '../contracts'
import { LiquidDeployment } from '../liquid'
import { createRandomSwapParams, signSwap, SwapOptions, SwapParams } from '../swap'

export const createSwaps = async (options: SwapOptions, provider: providers.JsonRpcProvider, userWallets: Wallet[], deployment: LiquidDeployment, nonce: {offset?: number, override?: number}) => {
    let signedSwaps: {signedTx: string, tx: providers.TransactionRequest}[] = []
    let swapParams: SwapParams[] = []
    for (const wallet of userWallets) {
        const atomicSwapContract = new Contract(deployment.atomicSwap.contractAddress, contracts.AtomicSwap.abi)
        const swap = await createRandomSwapParams(
            provider,
            deployment.uniV2FactoryA.contractAddress,
            deployment.uniV2FactoryB.contractAddress,
            deployment.dai.map(c => c.contractAddress),
            deployment.weth.contractAddress,
            options
        )
        swapParams.push(swap)
        const wethForDai = swap.path[0].toLowerCase() === deployment.weth.contractAddress.toLowerCase()
        console.log(`[${wallet.address}] swapping ${formatEther(swap.amountIn)} ${wethForDai ? "WETH" : "DAI"} for ${wethForDai ? "DAI" : "WETH"}`)
        const signedSwap = await signSwap(
            atomicSwapContract,
            swap.uniFactoryAddress,
            wallet,
            swap.amountIn,
            swap.path,
            nonce.override || (await wallet.getTransactionCount()) + (nonce.offset || 0),
            provider.network.chainId,
            options.gasFees
        )
        signedSwaps.push(signedSwap)
    }
    return {signedSwaps, swapParams}
}
