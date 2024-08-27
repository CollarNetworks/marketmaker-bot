const ERCC20_ABI = require("../constants/abi/ERC20");
const { PROVIDER_NFT_ABI } = require("../constants/abi/ProviderNFT");
const { getContractInstance, getWalletInstance } = require("./ethers");
async function parseReceipt(receipt, contract) {
    if (receipt.logs && receipt.logs.length > 0) {
        const parsedLogs = receipt.logs.map(log => {
            try {
                // only return events that are able to be parsed from the contract 
                return contract.interface.parseLog(log);
            } catch (e) {
                // console.log("Could not parse log:", log);
                return null;
            }
        }).filter(Boolean);
        return parsedLogs
    } else {
        console.log("No logs found in the transaction receipt");
    }
}
async function createOnchainOffer(callstrike, ltv, amount, duration, providerNFTContractAddress, rpcUrl) {
    const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY);
    const providerContract = await getContractInstance(
        rpcUrl || process.env.RPC_URL,
        providerNFTContractAddress,
        PROVIDER_NFT_ABI,
        wallet
    );
    const cashAsset = await providerContract.cashAsset();
    const cashAssetContract = await getContractInstance(
        rpcUrl || process.env.RPC_URL,
        cashAsset,
        ERCC20_ABI,
        wallet
    );
    const approvalTX = await cashAssetContract.approve(providerNFTContractAddress, amount);
    await approvalTX.wait();
    /**
     *  function createOffer(uint callStrikeDeviation, uint amount, uint putStrikeDeviation, uint duration)
        external
        returns (uint offerId);
     */

    const takerNFT = await providerContract.collarTakerContract();
    const tx = await providerContract.createOffer(
        callstrike,
        amount,
        ltv,
        duration
    )
    const receipt = await tx.wait()
    const events = await parseReceipt(receipt, providerContract);
    const offerCreatedEvent = events.find(event => event.name === "OfferCreated");
    if (!offerCreatedEvent) {
        throw new Error("OfferCreated event not found in the transaction receipt)")
    }
    const offerId = offerCreatedEvent.args.offerId;
    return offerId

}
module.exports = {
    createOnchainOffer
}