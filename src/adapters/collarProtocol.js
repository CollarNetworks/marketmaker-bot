

const { DEADLINE_MINUTES, BIPS_BASE } = require("../constants");
const ERC20_ABI = require("../constants/abi/ERC20");
const { PROVIDER_NFT_ABI } = require("../constants/abi/ProviderNFT");
const { TAKER_NFT_ABI } = require("../constants/abi/TakerNFT");
const { ROLLS_ABI } = require("../constants/abi/Rolls");
const { LOANS_ABI } = require("../constants/abi/Loans");
const { getContractInstance, getWalletInstance } = require("./ethers");
const { ORACLE_ABI } = require("../constants/abi/Oracle");
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
        ERC20_ABI,
        wallet
    );
    const approvalTX = await cashAssetContract.approve(providerNFTContractAddress, amount);
    await approvalTX.wait();
    /**
     *  function createOffer(uint callStrikeDeviation, uint amount, uint putStrikeDeviation, uint duration)
        external
        returns (uint offerId);
     */
    console.log({
        cashAsset,
        approvalTX,
        providerNFTContractAddress,
        amount,
        callstrike, duration
    })
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

async function getProviderLockedCashFromOracleAndTerms(oracleAddress, collateralAmount, callstrike) {
    // Get wallet instance
    const wallet = await getWalletInstance(process.env.RPC_URL, process.env.PRIVATE_KEY);
    // Get contract instance
    const oracleContract = await getContractInstance(
        process.env.RPC_URL,
        oracleAddress,
        ORACLE_ABI,
        wallet
    );
    const price = await oracleContract.currentPrice();
    const baseTokenAmount = await oracleContract.BASE_TOKEN_AMOUNT();
    const baseTokenAddress = await oracleContract.baseToken();
    const baseTokenContract = await getContractInstance(
        process.env.RPC_URL,
        baseTokenAddress,
        ERC20_ABI,
        wallet
    );
    const baseTokenDecimals = await baseTokenContract.decimals();
    const baseTokenScale = 10n ** BigInt(baseTokenDecimals);
    // calculate the amount of cash the collateral represents : price * collateralAmount * baseTokenDecimalsScale / baseTokenAmount * baseTokenDecimalsScale
    const cashAmount = (BigInt(collateralAmount) * price * baseTokenScale) / (baseTokenAmount * baseTokenScale);
    // get percentage of provider locked amount e.g.: if callstrike is 11000 (110%) then providerLockedPercentage = 0.1 
    const providerLocked = cashAmount * (BigInt(callstrike) - BigInt(BIPS_BASE)) / BigInt(BIPS_BASE);
    // calculate the amount of cash to be locked by the provider in the offer:  price of collateral in cash token * amount of collateral * providerLockedPercentage
    console.log({ baseTokenAmount, baseTokenScale, price, collateralAmount, cashAmount, providerLocked })
    return providerLocked;
}

module.exports = {
    getProviderLockedCashFromOracleAndTerms,
    createOnchainOffer,
    createOnchainRollOffer
}