import { Wallet } from "ethers"
import env from './env'

import minionWallets from "../output/wallets.json"
import { getSearchArgs } from './cliArgs'

/**
 * Gets array of wallet(s) for given program according to CLI input.
 * @param programName Name of program/script being run (see `package.json` scripts).
 * @returns array of wallets from `src/output/wallets.json`
 */
export const getSearchWalletSet = (programName: string) => {
    const {startIdx, endIdx, useMempool} = getSearchArgs(programName)
    const wallets = getWalletSet(startIdx, endIdx)
    return {wallets, useMempool}
}

export const getWalletSet = (startIdx: number, endIdx: number) => {
    const wallets = minionWallets
        .slice(startIdx, endIdx)
        .map(wallet => new Wallet(wallet.privateKey))
    console.log("using the following wallet(s)", wallets.map(w => w.address))
    return wallets
}

export const getAdminWallet = () => new Wallet(env.ADMIN_PRIVATE_KEY)
export const getTestWallet = (idx?: number) => new Wallet(idx ? minionWallets[idx].privateKey : env.TEST_PRIVATE_KEY)
