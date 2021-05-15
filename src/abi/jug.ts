import { AbiItem } from 'web3-utils/types'

const JUG: Array<AbiItem> = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "vat_",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": true,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes4",
                "name": "sig",
                "type": "bytes4"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "usr",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "arg1",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "arg2",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "LogNote",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "base",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            }
        ],
        "name": "deny",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "ilk",
                "type": "bytes32"
            }
        ],
        "name": "drip",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "rate",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "ilk",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "what",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "data",
                "type": "uint256"
            }
        ],
        "name": "file",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "what",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "data",
                "type": "uint256"
            }
        ],
        "name": "file",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "what",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "data",
                "type": "address"
            }
        ],
        "name": "file",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "ilks",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "duty",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rho",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "ilk",
                "type": "bytes32"
            }
        ],
        "name": "init",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            }
        ],
        "name": "rely",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vat",
        "outputs": [
            {
                "internalType": "contract VatLike",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vow",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "wards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export { JUG }
