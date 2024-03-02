import { FlashbotsBundleResolution, FlashbotsTransaction, FlashbotsTransactionResponse } from '@flashbots/ethers-provider-bundle'
import axios from "axios"
import { formatEther, id as ethersId, parseTransaction } from "ethers/lib/utils"

import env from './env'
import { getRpcRequest } from './helpers'
import { PROVIDER} from "./providers"
import { getAdminWallet } from './wallets'

const authSigner = getAdminWallet()

export const cancelBundle = async (uuid: string) => {
    const params = [
        {
	        userUuid: uuid,
        }
    ]
    console.log('params', params)

    const { headers, body } = await getRpcRequest(params, "eth_cancelBundle", authSigner)

    return await axios.post(env.MEV_GETH_HTTP_URL, body, {
        headers,
      })
}

export const sendBundle = async (signedTransactions: string[], targetBlock: number, uuid: string) => {
    const params = [
        {
            txs: signedTransactions,
            blockNumber: `0x${targetBlock.toString(16)}`,
            userUuid: uuid,
        }
    ]
    console.log('params', params)

    const { headers, body } = await getRpcRequest(params, "eth_sendBundle", authSigner)
    return (await axios.post(env.MEV_GETH_HTTP_URL, body, {
        headers,
      })).data
}

export const simulateBundle = async (signedTransactions: string[], blockNumber: number, stateBlockNumber?: number, timestamp?: number) => {
    signedTransactions.forEach((rawTx) => {
        const tx = parseTransaction(rawTx)
        console.log('tx.from', tx.from)
        console.log('tx.to', tx.to)
    })
    stateBlockNumber = stateBlockNumber || await PROVIDER.getBlockNumber()

    const params = [{
        txs: signedTransactions,
        blockNumber: `0x${blockNumber.toString(16)}`,
        stateBlockNumber: `0x${(stateBlockNumber).toString(16)}`,
        timestamp: timestamp,
    }]

    let totalGasUsed = 0
    try {
        const { body, headers } = await getRpcRequest(params, "eth_callBundle", authSigner)
        console.log("body", body)
        console.log("headers", headers)
        const res: any = await axios.post(env.MEV_GETH_HTTP_URL, body, {
            headers
        })
        if (res.error || res.data.error) {
            let e = res.error ? res.error : res.data.error
            console.log('[flashbots.simulateBundle] error', e)
        }

        const simResult = res.data.result
        if (!simResult || !simResult.results) {
            console.error("sim results empty")
            return undefined
        }
        simResult.results.forEach((element: any) => {
            totalGasUsed += element.gasUsed
        })
        const coinbaseDiff = formatEther(simResult.coinbaseDiff)

        console.log(
            `block_number=${blockNumber},state_block_number=${stateBlockNumber},coinbase_diff=${coinbaseDiff},eth_sent_to_coinbase=${formatEther(simResult.ethSentToCoinbase)},totalGasUsed=${totalGasUsed},gasPrice=${simResult.coinbaseDiff / totalGasUsed / 1e9}`
        )
        return simResult
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export interface GetBundleStatsResponseSuccess {
    isSimulated: boolean
    isSentToMiners: boolean
    isHighPriority: boolean
    simulatedAt: string
    submittedAt: string
    sentToMinersAt: string
}

export interface RelayResponseError {
    error: {
      message: string
      code: number
    }
}

export type GetBundleStatsResponse = GetBundleStatsResponseSuccess | RelayResponseError

export const getBundleStats = async (bundleHash: string, blockNumber: string) => {
    const evmBlockNumber = blockNumber.startsWith("0x") ? blockNumber : `0x${parseInt(blockNumber).toString(16)}`

    const params = [{ bundleHash, blockNumber: evmBlockNumber }]

    const body = {
        method: "flashbots_getBundleStats",
        params,
        id: "1337",
        jsonrpc: '2.0'
    }
    const res: any = await axios.post(env.MEV_GETH_HTTP_URL, body, {
        headers: {
        'Content-Type': 'application/json',
        'X-Flashbots-Signature': (await authSigner.getAddress()) + ':' + (await authSigner.signMessage(ethersId(JSON.stringify(body))))
        }
    })

    if (res.error !== undefined && res.error !== null) {
      return {
        error: {
          message: res.error.message,
          code: res.error.code
        }
      }
    }

    return res.data
}

export const logSendBundleResponse = async (res?: FlashbotsTransaction) => {
    if (res) {
        if ("error" in res) {
            throw (res as RelayResponseError).error
        } else {
            const bundleRes = await res.wait()
            const msg = bundleRes == FlashbotsBundleResolution.BlockPassedWithoutInclusion ?
                "block passed without inclusion" :
                bundleRes == FlashbotsBundleResolution.AccountNonceTooHigh ?
                "account nonce too high" :
                "bundle not included (unknown reason)"
            console.warn(msg)
        }
    }
}
