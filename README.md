# project

1. kurtosis run github.com/kurtosis-tech/ethereum-package '{"mev_type": "mock"}'
2. Clone https://github.com/flashbots/mev-flood
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
```
4. `../cli/bin/run init -r http://127.0.0.1:54986 -k bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31 -u bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31`
