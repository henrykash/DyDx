const { readFileSync } = require("fs");
const hre = require("hardhat");
const { ethers, utils, providers } = require("ethers");

var UNISWAP_ABI = JSON.parse(
    readFileSync(`utils/dydxABI.json`, "utf8")
);


function toHex(currencyAmount) {
    if (currencyAmount.toString().includes("e")) {
        let hexedAmount = currencyAmount.toString(16);
        return `0x${hexedAmount}`;
    } else {
        let parsedAmount = parseInt(currencyAmount);
        let hexedAmount = parsedAmount.toString(16);
        return `0x${hexedAmount}`;
    }
}

//method to get Nonce of wallet
const walletNonce = async () => {
    try {
        let nonce = await web3.eth.getTransactionCount(walletAddress)
        if (nonce) {
            return nonce;
        } else {
            let nonce = await web3.eth.getTransactionCount(walletAddress);
            return nonce;
        }
    } catch (error) {
        console.log("error fetching walletNonce", error);
    }
}
const abi = [
    "function approve(address _spender, uint256 _value) public returns (bool success)",
]

const MAX_INT = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xEfdc4Fb960fDD5cc2110aa9a75F9ACae245b5d95"],
});

//create variables to be used when creating a smart contract
const signer = new ethers.Wallet(toHex("provide your private key"))


const provider = new providers.WebSocketProvider("provide your moralis wss url here for mainnent")


const account = signer.connect(provider)
const router = ethers.utils.getAddress("0x8e8bd01b5A9eb272CC3892a2E40E64A716aa2A40")
let contract = new ethers.Contract(
    "0x8e8bd01b5A9eb272CC3892a2E40E64A716aa2A40",
    UNISWAP_ABI,
    account
);

const approve = async (tokenAddress) => {
    try {

        const contract = new ethers.Contract(tokenAddress, abi, account)

        const tx = await contract.approve(router, MAX_INT, {
            // gasPrice: 5 * 10 ** 9,
            // gasLimit: 300000
        })

        console.log("*****************************************")

        console.log("*********SUCCESFUL APPROVE*****", tx.hash)

        return { success: true, hash: tx.hash }

    } catch (error) {
        console.log("Error Approving ", error);
    }

}

const main = async () => {

    //call the  approve function pasing the token_address

    //  let tx_approve = await approve("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")

    // console.log("Approving USDC", { tx_approve })

    const DepositETH = async (deposit_amount, starkey, postionId, signature) => {

        try {
            const bal = parseInt(await (await provider.getBalance(await signer.address))._hex, 16)
            console.log("Balance", bal)

            console.log(`depoisit_amount${deposit_amount}, starkey ${starkey}, positionId ${postionId}, signature ${signature} `)


            const tx = await contract.deposit(
                toHex(deposit_amount),
                starkey,
                postionId,
                signature,
                {
                    //gasPrice: 20 * 10 ** 9,
                    gasLimit: 1000000,
                }
            )
            console.log('***************SUCCESSFUL DEPOSIT*************', tx.hash)
            console.log("************************************************")
            return { success: true, data: `${tx.hash}` };

        } catch (error) {
            console.log("*************DEPOSIT**************", error)

            return { success: false, data: `${error}` };
        }
    }

    let strkkey = toHex("06248bdf08048e15fc00eff52972805829023a7fcab3b20544dd79eb790b0bbf")

    let signature = "0x684da02fb4022e605dacdf0087e374540092d570f0f8e48118a150a7506a9d0c359df3d675036129235263eb90afb1a531e2aa63b393af0a7c2d6c0d7d3cb8771c"

    //signature = utils.toUtf8Bytes(signature).BYTES_PER_ELEMENT

    console.log({
        signature
    });
    let deposit = await DepositETH(10, BigInt(strkkey), 185158, signature)

    console.log({ deposit })
}


main()