/**
 * Simple JavaScript example demonstrating authentication with private WebSockets channels.
 */
const { DydxClient } = require('@dydxprotocol/v3-client')
const { ethers } = require('ethers')
const Web3 = require('web3')
const WebSocket = require('ws')
// const { DepositETH } = require('../dydx/deposit')

const HTTP_HOST = 'https://api.dydx.exchange'
const WS_HOST = 'wss://api.dydx.exchange/v3/ws'

// NOTE: Set up web3 however your prefer to authenticate to your Ethereum account.
web3 = new Web3("wss://speedy-nodes-nyc.moralis.io/8f6372ea3c483de563c9ae94/eth/mainnet/ws")

web3.eth.accounts.wallet.add("29f2d2a8e3af9d8f796888cff0e8a5ece000be197e27b83a284c6dff754323a2");

const main = async () => {
  ((async () => {

    client = new DydxClient(HTTP_HOST, { web3 })

    // const keyPairWithYCoordinate: KeyPairWithYCoordinate = await client.onboarding.deriveStarkKey(
    //   'ethereumAddress',
    // );
    const apiCreds = await client.onboarding.recoverDefaultApiCredentials(ethers.utils.getAddress("0xEfdc4Fb960fDD5cc2110aa9a75F9ACae245b5d95"))
    client.apiKeyCredentials = apiCreds

    console.log({ apiCreds })


    const timestamp = new Date().toISOString()
    const signature = client.private.sign({
      requestPath: '/ws/accounts',
      method: 'GET',
      isoTimestamp: timestamp,
    })
    const msg = {
      type: 'subscribe',
      channel: 'v3_accounts',
      accountNumber: '0',
      apiKey: apiCreds.key,
      signature,
      timestamp,
      passphrase: apiCreds.passphrase
    }

    const ws = new WebSocket(WS_HOST)

    ws.on('message', (message) => {
      console.log('<', message)
    })

    ws.on('open', () => {
      console.log('>', msg)
      ws.send(JSON.stringify(msg))
    })

    ws.on('error', (error) => {
      console.log('<', error)
    })

    ws.on('close', () => {
      console.log('Connection closed')
    })

  })()).then(() => console.log('Done')).catch(console.error)

}
main()
