import Web3 from 'web3'
import { fromAscii } from 'web3-utils'
import { JUG } from '@src/abi/jug'
import { OSM } from '@src/abi/osm'
import { SPOT } from '@src/abi/spot'
import { sleep } from '@src/sleep'
import { logger } from '@src/logger'
import { WaitGroup } from '@src/waitgroup'
import { Transaction } from 'ethereumjs-tx'
import { Contract } from 'web3-eth-contract'
import * as serverConfig from '@config/server.json'

const keythereum = require('keythereum');

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

async function pokeOSM(web3: Web3, contract: Contract, address: string, privKey: Buffer, nonce: number) {
    const data = contract.methods.poke().encodeABI()
    return await sendTransaction(web3, address, privKey, contract.options.address, nonce, data)
}

async function pokeSpot(web3: Web3, contract: Contract, address: string, privKey: Buffer, nonce: number, ilk: string) {
    const data = contract.methods.poke(toBytes32(ilk)).encodeABI()
    return await sendTransaction(web3, address, privKey, contract.options.address, nonce, data)
}

async function dripJug(web3: Web3, contract: Contract, address: string, privKey: Buffer, nonce: number, ilk: string) {
    const data = contract.methods.drip(toBytes32(ilk)).encodeABI()
    return await sendTransaction(web3, address, privKey, contract.options.address, nonce, data)
}

async function sendTransaction(web3: Web3, from: string, privateKey: Buffer, to: string, nonce: number, data: string) {
    const gasPrice = await web3.eth.getGasPrice()
    let rawTransaction: Object = {
        from: from,
        to: to,
        data: data,
        value: 0,
        nonce: nonce,
        gasLimit: web3.utils.toHex(120000),
        gasPrice: web3.utils.toHex(gasPrice)
    }
    const tx = new Transaction(rawTransaction, {chain: serverConfig.network})
    tx.sign(privateKey)
    const serializedTx = '0x' + tx.serialize().toString('hex')

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
    const host = `https://${serverConfig.network}.infura.io/v3/${serverConfig.infura_key}`
    const web3 = new Web3(new Web3.providers.HttpProvider(host))
    const network = await web3.eth.net.getNetworkType()
    logger.info('ethereum network type: %s', network)

    const osm = new web3.eth.Contract(OSM, serverConfig.contract.PIP_HOT)
    const jug = new web3.eth.Contract(JUG, serverConfig.contract.MCD_JUG)
    const spot = new web3.eth.Contract(SPOT, serverConfig.contract.MCD_SPOT)
    const address = '0x' + serverConfig.keystore.address
    const privateKey = keythereum.recover(serverConfig.password, serverConfig.keystore)
    logger.info('poke user address: %s', address)

    let lastTime = 0
    while (true) {
        const nonce = await next(web3, address)

        try {
            const hash = await pokeOSM(web3, osm, address, privateKey, nonce)
            logger.info('call poke method of OSM, hash: %s', hash)
        } catch (error) {
            logger.error('failed to call poke method of OSM, reason: %s', error)
        }

        try {
            const hash = await pokeSpot(web3, spot, address, privateKey, nonce+1, 'HOT-A')
            logger.info('call poke method of Spot, hash: %s', hash)
        } catch (error) {
            logger.error('failed to call poke method of Spot, reason: %s', error)
        }

        if (getTimestamp() - lastTime >= 60 * 60 * 24) {
            try {
                const hash = await dripJug(web3, jug, address, privateKey, nonce+2, 'HOT-A')
                lastTime = getTimestamp()
                logger.info('call drip method of Jug, hash: %s', hash)
            } catch (error) {
                logger.error('failed to call drip method of Jug, reason: %s', error)
            } 
        }

        logger.info(`wait for ${serverConfig.interval} seconds...`)
        await sleep(serverConfig.interval * 1000)
    }
})()
