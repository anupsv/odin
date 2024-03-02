import { createSmartLotteryTxs } from './lib/lottery'
import { getSearchWalletSet } from './lib/wallets'
import { calculateBundleHash } from './lib/helpers'
import { PROVIDER } from './lib/providers'
import { sendBundle, simulateBundle } from './lib/flashbots'
import { v4 as uuidv4 } from "uuid"

// load wallets from disk
const {wallets, useMempool} = getSearchWalletSet("smart-search")

// run a block monitor to send bundles on every block
PROVIDER.on('block', async blockNum => {
    console.log(`[BLOCK ${blockNum}]`)
    const signedTxs = await createSmartLotteryTxs(wallets)
    if (signedTxs.length === 0) {
        console.warn("no txs created")
        return
    }

    if (useMempool) {
        console.warn("SENDING TXS TO MEMPOOL")
        try {
            for (const signedTx of signedTxs) {
                const res = await PROVIDER.sendTransaction(signedTx)
                console.log("tx result", res)
            }
        } catch (e) {
            const err: any = e
            console.error("backend error", err)
        }
    } else {
        console.warn("SENDING TXS TO FLASHBOTS")
        // simulate
        try {
            for (const tx of signedTxs) {
                // each tx should be in its own bundle
                const bundleHash = calculateBundleHash([tx])
                console.log(`pre-calculated bundleHash: ${bundleHash}`)
                const simResult = await simulateBundle([tx], blockNum - 1)
                console.log("sim result", simResult)
            }
            // throws 500
        } catch (e) {
            const err: any = e
            console.error("[simulateBundle] backend error", err.code)
        }

        //send
        try {
            const sentBundles = await Promise.all(signedTxs.map(async tx => {
                return await sendBundle([tx], blockNum + 2, uuidv4())
            }))
            console.log("sent bundles", sentBundles)
        } catch (e) {
            const err: any = e
            console.error("[sendBundle] backend error", err)
        }
    }


    // console.warn("aborting for debug")
    // process.exit(0)
})
