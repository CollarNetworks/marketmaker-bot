

const { DEADLINE_MINUTES } = require("../constants");
const ERCC20_ABI = require("../constants/abi/ERC20");
const { PROVIDER_NFT_ABI } = require("../constants/abi/ProviderNFT");
const { TAKER_NFT_ABI } = require("../constants/abi/TakerNFT");
const { ROLLS_ABI } = require("../constants/abi/Rolls");
const { LOANS_ABI } = require("../constants/abi/Loans");
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
        rpcUrl,
        providerNFTContractAddress,
        PROVIDER_NFT_ABI,
        wallet
    );
    const cashAsset = await providerContract.cashAsset();
    const cashAssetContract = await getContractInstance(
        rpcUrl,
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


async function createOnchainRollOffer(proposal, rpcUrl) {
    try {
        console.log("creating roll offer")
        // Get wallet instance
        // const rpcUrl = 'https://virtual.arbitrum-sepolia.rpc.tenderly.co/aae1ab80-fdc7-46d1-a9ba-3ce19afb5125'
        const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY);
        // Get contract instance
        const rollsContract = await getContractInstance(
            rpcUrl,
            proposal.rolls_contract_address,
            ROLLS_ABI,
            wallet
        );

        // Extract proposal terms
        const {
            taker_id,
            roll_fee_amount,
            roll_fee_delta_factor_bips,
            min_price,
            max_price,
            min_to_provider,
        } = proposal;
        const deadlineDate = new Date();
        deadlineDate.setMinutes(deadlineDate.getMinutes() + DEADLINE_MINUTES);
        const deadline = Math.ceil(deadlineDate.getTime() / 1000)
        console.log({ deadline, time: deadlineDate.getTime() })

        // get providerNFT address and id 
        const takerNFTContractAddress = await getTakerNFTContractAddressByLoansContractAddress(rpcUrl, proposal.loans_contract_address);
        const takerContract = await getContractInstance(
            rpcUrl,
            takerNFTContractAddress,
            TAKER_NFT_ABI,
            wallet
        )
        const [providerNFTContractAddress, providerNFTId] = await takerContract.getPosition(taker_id);
        // approve provider id to rolls 
        console.log({ providerNFTContractAddress, providerNFTId })
        const providerNFTContract = await getContractInstance(
            rpcUrl,
            providerNFTContractAddress,
            PROVIDER_NFT_ABI,
            wallet
        );
        const approvalTX = await providerNFTContract.approve(proposal.rolls_contract_address, providerNFTId);
        await approvalTX.wait();
        // Create roll offer on-chain
        const tx = await rollsContract.createRollOffer(
            taker_id,
            roll_fee_amount,
            roll_fee_delta_factor_bips,
            min_price,
            max_price,
            min_to_provider,
            deadline
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log({ receipt })

        const events = await parseReceipt(receipt, rollsContract);
        const offerCreatedEvent = events.find(event => event.name === "OfferCreated");
        if (!offerCreatedEvent) {
            throw new Error("OfferCreated event not found in the transaction receipt)")
        }
        const rollId = offerCreatedEvent.args.rollId;
        return rollId
    } catch (error) {
        console.error('Error creating roll offer on-chain:', error);
        throw error;
    }
}

async function getTakerNFTContractAddressByLoansContractAddress(
    rpcUrl,
    loansContractAddress
) {
    const loansContract = await getContractInstance(
        rpcUrl,
        loansContractAddress,
        LOANS_ABI
    )
    const takerNFTContractAddress = await loansContract.takerNFT()
    return takerNFTContractAddress
}

module.exports = {
    createOnchainOffer,
    createOnchainRollOffer
}