const fs = require("fs")
const MetaMaskMnemonic = fs.readFileSync(".secret").toString().trim()

var HDWalletProvider = require("truffle-hdwallet-provider")
module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "*",
        },

        rinkeby: {
            network_id: 5,
            provider: new HDWalletProvider(
                MetaMaskMnemonic,
                "https://goerli.infura.io/v3/bc22ba5c5cea42f3a40c659d6d754c8b"
            ),
        },
    },
    mocha: {
        // timeout: 100000
    },
    contarcts_directory: "./contracts/",
    contarcts_build_directory: "./src/abis/",
    compilers: {
        solc: {
            version: "0.8.17",
        },
    },
}
