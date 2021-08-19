import BN from 'bn.js'
import Web3 from 'web3'
import { Wallet } from 'ethers'
import { fromAscii } from 'web3-utils'
import { Contract } from 'web3-eth-contract'
import { TransactionRequest } from '@ethersproject/abstract-provider'

import { JUG } from '@src/abi/jug'
import { OSM } from '@src/abi/osm'
import { SPOT } from '@src/abi/spot'
import { sleep } from '@src/sleep'
import { logger } from '@src/logger'
import { WaitGroup } from '@src/waitgroup'
import * as config from '@config/server.json'

function getTimestamp() {
	return Math.floor(Date.now() / 1000)
}

function toBytes32(ascii: string) {
    let bytes32 = fromAscii(ascii)
    const count = (32 + 1) * 2 - bytes32.length
    if (count <= 0) {
      bytes32 = bytes32.slice(0, (32 + 1) * 2)
    } else {
      bytes32 = bytes32 + new Array(count + 1).join('0')
    }
    return bytes32
}

async function next(web3: Web3, address: string) {
    return await web3.eth.getTransactionCount(address, 'pending')
}

async function pokeOSM(web3: Web3, chainId: number, contract: Contract, wallet: Wallet, nonce: number) {
    const data = contract.methods.poke().encodeABI()
    return await sendTransaction(web3, chainId, wallet, contract.options.address, nonce, data)
}

async function pokeSpot(web3: Web3, chainId: number, contract: Contract, wallet: Wallet, nonce: number, ilk: string) {
    const data = contract.methods.poke(toBytes32(ilk)).encodeABI()
    return await sendTransaction(web3,chainId,  wallet, contract.options.address, nonce, data)
}

async function dripJug(web3: Web3, chainId: number, contract: Contract, wallet: Wallet, nonce: number, ilk: string) {
    const data = contract.methods.drip(toBytes32(ilk)).encodeABI()
    return await sendTransaction(web3, chainId, wallet, contract.options.address, nonce, data)
}

async function sendTransaction(web3: Web3, chainId: number, wallet: Wallet, to: string, nonce: number, data: string) {
    let rawTransaction: TransactionRequest = {
        type: 2,
        chainId: chainId,
        to: to,
        from: wallet.address,
        nonce: nonce,
        gasLimit: web3.utils.toHex(config.gasLimit),
        data: data,
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei(new BN(1), 'Gwei')),
        maxFeePerGas: web3.utils.toHex(web3.utils.toWei(new BN(config.maxFeePerGas), 'Gwei')),
    }
    const serializedTx = await wallet.signTransaction(rawTransaction)

    let hash: string = ''
    let error: any = null
    let waitGroup = new WaitGroup(1)
    web3.eth.sendSignedTransaction(serializedTx).once('transactionHash', function(receipt: string) {
        hash = receipt
        waitGroup.done()
    }).on('error', function(err) {
        error = err
        waitGroup.done()
    })
    await waitGroup.wait()
    if (error != null) {
        throw error
    }
    return hash
}

(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.endpoint))
    const chainId = await web3.eth.getChainId()
    logger.info('ethereum chain id: %s', chainId)

    const osm = new web3.eth.Contract(OSM, config.contract.PIP)
    const jug = new web3.eth.Contract(JUG, config.contract.MCD_JUG)
    const spot = new web3.eth.Contract(SPOT, config.contract.MCD_SPOT)

    var hexPrivateKey = config.privateKey
    if (hexPrivateKey.startsWith('0x') || hexPrivateKey.startsWith('0X')) {
        hexPrivateKey = hexPrivateKey.substring(2)
    } 

    const wallet = new Wallet(hexPrivateKey)
    logger.info('poke user address: %s', wallet.address)

    let lastTime = 0
    while (true) {
        const nonce = await next(web3, wallet.address)

        try {
            const hash = await pokeOSM(web3, chainId, osm, wallet, nonce)
            logger.info('call poke method of OSM, hash: %s', hash)
        } catch (error) {
            logger.error('failed to call poke method of OSM, reason: %s', error)
        }

        try {
            const hash = await pokeSpot(web3, chainId, spot, wallet, nonce+1, config.ilkName)
            logger.info('call poke method of Spot, hash: %s', hash)
        } catch (error) {
            logger.error('failed to call poke method of Spot, reason: %s', error)
        }

        if (getTimestamp() - lastTime >= 60 * 60 * 24) {
            try {
                const hash = await dripJug(web3, chainId, jug, wallet, nonce+2, config.ilkName)
                lastTime = getTimestamp()
                logger.info('call drip method of Jug, hash: %s', hash)
            } catch (error) {
                logger.error('failed to call drip method of Jug, reason: %s', error)
            } 
        }

        logger.info(`wait for ${config.interval} seconds...`)
        await sleep(config.interval * 1000)
    }
})()
