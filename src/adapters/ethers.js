const ethers = require('ethers')
const ERCC20_ABI = require('../constants/abi/ERC20')

/**
 *  module variable in order to load providers once only and reuse them
 */
const loadedProviders = {}
const contracts = {}

async function getProvider(rpcUrl) {
    const loadedProvider = loadedProviders[rpcUrl]
    if (!!loadedProvider) {
        return loadedProvider
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    loadedProviders[rpcUrl] = provider
    return provider
}

async function getContractInstance(
    rpcUrl,
    contractAddress,
    contractAbi,
    wallet
) {
    const provider = await getProvider(rpcUrl)
    const loadedContract = contracts[contractAddress]

    if (
        !!loadedContract &&
        (!wallet || loadedContract.wallet?.address === wallet.address)
    ) {
        return loadedContract.contract
    }
    const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        wallet || provider
    )
    contracts[contractAddress] = { contract, wallet, provider }
    return contract
}

async function getWalletInstance(rpcUrl, privateKey) {
    const provider = await getProvider(rpcUrl)
    return new ethers.Wallet(privateKey, provider)
}


async function getTokenBalance(rpcUrl, tokenAddress, address) {
    const tokenContract = await getContractInstance(rpcUrl, tokenAddress, ERCC20_ABI)
    return await tokenContract.balanceOf(address)
}

function createMessageDigest(message) {
    // Convert the message to bytes
    const messageBytes = ethers.toUtf8Bytes(message);

    // Create the Ethereum signed message
    const ethereumSignedMessagePrefix =
        "\x19Ethereum Signed Message:\n" + messageBytes.length;
    const prefixedMessageBytes = ethers.concat([
        ethers.toUtf8Bytes(ethereumSignedMessagePrefix),
        messageBytes
    ]);

    // Hash the prefixed message
    const digest = ethers.keccak256(prefixedMessageBytes);

    return digest;
}
function verifyMessage(message, signature) {
    return ethers.verifyMessage(
        message,
        signature
    );
}

function recoverAddress(message, data) {
    return ethers.recoverAddress(createMessageDigest(message), data);
}

module.exports = {
    getContractInstance,
    getWalletInstance,
    getTokenBalance,
    createMessageDigest,
    verifyMessage,
    recoverAddress
}
