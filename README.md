# ODIN
## Guarding the Gateway to Web3 Valhalla solves
![UI image](img/ui.png?raw=true "ui-image")

### Description
By Using ODIN, dapp's can ensure that their smart contracts will be paused before malicious transactions that break protocol invariants ( usually hacks ) are executed. This makes dapps much safer by preventing loss of funds to the dapp users. This also bootstraps a two sided market where dapps pay block builders for their services and block builders are bonded on EigenLayer so they don't maliciously pause these dapps. Malicious block builders will be slashed, thus they are economially aligned.

### How to run
1. kurtosis run github.com/kurtosis-tech/ethereum-package '{"mev_type": "mock"}'
2. Clone repository
3.
```
cd core/
yarn install
yarn script.createWallets
yarn build
cd ..
cd cli/
yarn install
yarn build
NODE_ENV=goerli yarn script.testSimpleBundle
NODE_ENV=goerli yarn script.testBundleWithTxChecks
```
4. `../cli/bin/run init -r http://127.0.0.1:54986 -k bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31 -u bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31`
