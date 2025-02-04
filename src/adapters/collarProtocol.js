const { DEADLINE_MINUTES, BIPS_BASE } = require('../constants')
const ERC20_ABI = require('../constants/abi/ERC20')
const { PROVIDER_NFT_ABI } = require('../constants/abi/ProviderNFT')
const { TAKER_NFT_ABI } = require('../constants/abi/TakerNFT')
const { ROLLS_ABI } = require('../constants/abi/Rolls')
const { LOANS_ABI } = require('../constants/abi/Loans')
const { getContractInstance, getWalletInstance } = require('./ethers')
const { ORACLE_ABI } = require('../constants/abi/Oracle')
const { ESCROW_NFT_ABI } = require('../constants/abi/EscrowSupplierNFT')
async function parseReceipt(receipt, contract) {
  if (receipt.logs && receipt.logs.length > 0) {
    const parsedLogs = receipt.logs
      .map((log) => {
        try {
          // only return events that are able to be parsed from the contract
          return contract.interface.parseLog(log)
        } catch (e) {
          // console.log("Could not parse log:", log);
          return null
        }
      })
      .filter(Boolean)
    return parsedLogs
  } else {
    console.log('No logs found in the transaction receipt')
  }
}
async function createOnchainOffer(
  callstrike,
  ltv,
  amount,
  duration,
  providerNFTContractAddress,
  rpcUrl
) {

  try {
    const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
    const providerContract = await getContractInstance(
      rpcUrl,
      providerNFTContractAddress,
      PROVIDER_NFT_ABI,
      wallet
    )
    const cashAsset = await providerContract.cashAsset()
    const cashAssetContract = await getContractInstance(
      rpcUrl,
      cashAsset,
      ERC20_ABI,
      wallet
    )
    const approvalTX = await cashAssetContract.approve(
      providerNFTContractAddress,
      amount
    )
    await approvalTX.wait()
    /**
       function createOffer(
          uint callStrikePercent,
          uint amount,
          uint putStrikePercent,
          uint duration,
          uint minLocked
      ) external whenNotPaused returns (uint offerId)
       */
    const tx = await providerContract.createOffer(
      callstrike,
      amount, // @TODO: need to account for protocol fee
      ltv,
      duration,
      10n // minimum 10 wei
    )
    const receipt = await tx.wait()
    const events = await parseReceipt(receipt, providerContract)
    const offerCreatedEvent = events.find(
      (event) => event.name === 'OfferCreated'
    )
    if (!offerCreatedEvent) {
      throw new Error('OfferCreated event not found in the transaction receipt)')
    }
    const offerId = offerCreatedEvent.args.offerId
    return offerId
  } catch (e) {
    console.log("error creating offer, ", e)
    throw e
  }
}

async function createOnchainRollOffer(proposal, rpcUrl) {
  try {
    // Get wallet instance
    const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
    // Get contract instance
    const rollsContract = await getContractInstance(
      rpcUrl,
      proposal.rollsContractAddress,
      ROLLS_ABI,
      wallet
    )

    // Extract proposal terms
    const {
      takerId,
      rollFeeAmount,
      rollFeeDeltaFactorBips,
      minPrice,
      maxPrice,
      minToProvider,
      loansContractAddress,
      rollsContractAddress
    } = proposal
    const deadlineDate = new Date()
    deadlineDate.setMinutes(deadlineDate.getMinutes() + DEADLINE_MINUTES)
    const deadline = Math.ceil(deadlineDate.getTime() / 1000)

    // get providerNFT address and id
    const takerNFTContractAddress =
      await getTakerNFTContractAddressByLoansContractAddress(
        rpcUrl,
        loansContractAddress
      )
    const takerContract = await getContractInstance(
      rpcUrl,
      takerNFTContractAddress,
      TAKER_NFT_ABI,
      wallet
    )
    const [providerNFTContractAddress, providerNFTId] =
      await takerContract.getPosition(takerId)

    // approve provider id to rolls
    const providerNFTContract = await getContractInstance(
      rpcUrl,
      providerNFTContractAddress,
      PROVIDER_NFT_ABI,
      wallet
    )

    const approvalTX = await providerNFTContract.approve(
      rollsContractAddress,
      providerNFTId
    )
    await approvalTX.wait()
    // Create roll offer on-chain
    const tx = await rollsContract.createOffer(
      takerId,
      rollFeeAmount,
      rollFeeDeltaFactorBips,
      minPrice,
      maxPrice,
      minToProvider,
      deadline
    )

    // Wait for the transaction to be mined
    const receipt = await tx.wait()

    const events = await parseReceipt(receipt, rollsContract)
    const offerCreatedEvent = events.find(
      (event) => event.name === 'OfferCreated'
    )
    if (!offerCreatedEvent) {
      throw new Error(
        'OfferCreated event not found in the transaction receipt)'
      )
    }
    const rollId = offerCreatedEvent.args.rollId
    console.log({ rollId })
    return rollId
  } catch (error) {
    console.error(`Error creating roll offer on-chain for proposal ${proposal.id} and takerId ${proposal.takerId} on loans ${proposal.loansContractAddress}:`, error)
    throw error
  }
}

async function createOnchainEscrowOffer(
  escrowSupplierNFTContractAddress,
  amount,
  duration,
  interestAPR,
  gracePeriod,
  lateFeeAPR,
  minEscrow,
  rpcUrl
) {
  /**
   * function createOffer(
        uint amount,
        uint duration,
        uint interestAPR,
        uint gracePeriod,
        uint lateFeeAPR,
        uint minEscrow
    ) external whenNotPaused returns (uint offerId) {
   */

  const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
  const escrowSupplierNFTContract = await getContractInstance(
    rpcUrl,
    escrowSupplierNFTContractAddress,
    ESCROW_NFT_ABI,
    wallet
  )

  const assetAddress = await escrowSupplierNFTContract.asset()
  const assetContract = await getContractInstance(
    rpcUrl,
    assetAddress,
    ERC20_ABI,
    wallet
  )

  const approvalTX = await assetContract.approve(
    escrowSupplierNFTContractAddress,
    amount
  )
  await approvalTX.wait()

  const tx = await escrowSupplierNFTContract.createOffer(
    amount,
    duration,
    interestAPR,
    gracePeriod,
    lateFeeAPR,
    minEscrow,
  )

  const receipt = await tx.wait()
  const events = await parseReceipt(receipt, escrowSupplierNFTContract)
  const offerCreatedEvent = events.find(
    (event) => event.name === 'OfferCreated'
  )
  if (!offerCreatedEvent) {
    throw new Error('OfferCreated event not found in the transaction receipt)')
  }
  const offerId = offerCreatedEvent.args.offerId
  return offerId
}

async function cancelOnchainRollOffer(rollOfferId, rollsContractAddress, rpcUrl) {
  try {
    // Get wallet instance
    const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
    // Get contract instance
    const rollsContract = await getContractInstance(
      rpcUrl,
      rollsContractAddress,
      ROLLS_ABI,
      wallet
    )

    const tx = await rollsContract.cancelOffer(rollOfferId)
    const receipt = await tx.wait()
    const events = await parseReceipt(receipt, rollsContract)
    const offerCancelledEvent = events.find(
      (event) => event.name === 'OfferCancelled'
    )
    if (!offerCancelledEvent) {
      throw new Error('OfferCancelled event not found in the transaction receipt)')
    }
    return true
  } catch (e) {
    console.log(`error cancelling roll offer id: ${rollOfferId} `, e)
    throw e
  }
}

async function getOnchainRollOffer(rollOfferId, rollsContractAddress, rpcUrl) {
  try {
    const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
    const rollsContract = await getContractInstance(
      rpcUrl,
      rollsContractAddress,
      ROLLS_ABI,
      wallet
    )
    const rollOffer = await rollsContract.getRollOffer(rollOfferId)
    return rollOffer
  } catch (e) {
    console.log("error getting roll offer, ", e)
    throw e
  }
}

async function previewRoll(rpcUrl, rollsContractAddress, rollOfferId, currentPrice) {
  try {
    const wallet = await getWalletInstance(
      rpcUrl, process.env.PRIVATE_KEY
    )
    const rollsContract = await getContractInstance(
      rpcUrl,
      rollsContractAddress,
      ROLLS_ABI,
      wallet
    )
    const previewResult = await rollsContract.getRollOffer(rollOfferId, currentPrice)
    return previewResult

  } catch (e) {
    console.log('error previewing roll', e);
    throw e
  }

}

async function previewSettlement(rpcUrl, takerContractAddress, positionId, currentPrice) {
  try {
    const wallet = await getWalletInstance(
      rpcUrl, process.env.PRIVATE_KEY
    )
    const takerContract = await getContractInstance(
      rpcUrl,
      takerContractAddress,
      TAKER_NFT_ABI,
      wallet
    )
    const positionResult = await takerContract.getPosition(positionId);

    // Create a new plain object with the same values
    const position = {
      providerNFT: positionResult[0],
      providerId: positionResult[1],
      duration: positionResult[2],
      expiration: positionResult[3],
      startPrice: positionResult[4],
      putStrikePercent: positionResult[5],
      callStrikePercent: positionResult[6],
      takerLocked: positionResult[7],
      providerLocked: positionResult[8],
      settled: positionResult[9],
      withdrawable: positionResult[10]
    }
    console.log({ position })
    const result = await takerContract.previewSettlement(position, currentPrice)
    console.log({ result })
    return result[1]
  } catch (e) {
    console.log('error previewing settlement', e)
    throw e
  }
}


async function getProtocolFee(rpcUrl, providerNFTContractAddress, providerLocked, duration) {
  try {
    const wallet = await getWalletInstance(
      rpcUrl, process.env.PRIVATE_KEY
    )
    const providerNFTContract = await getContractInstance(
      rpcUrl,
      providerNFTContractAddress,
      PROVIDER_NFT_ABI,
      wallet
    )
    const [fee, feeRecipient] = await providerNFTContract.protocolFee(
      providerLocked,
      duration
    );
    return {
      fee,
      feeRecipient
    };
  } catch (e) {
    console.log('error getting protocol fee', e);
    throw e;
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

async function getProviderLockedCashFromOracleAndTerms(
  oracleAddress,
  collateralAmount,
  callStrike,
  putStrike,
  rpcUrl
) {
  // Get wallet instance
  const wallet = await getWalletInstance(
    rpcUrl,
    process.env.PRIVATE_KEY
  )
  // Get contract instance
  const oracleContract = await getContractInstance(
    rpcUrl,
    oracleAddress,
    ORACLE_ABI,
    wallet
  )
  const price = await oracleContract.currentPrice()
  const fullCashAmount = await oracleContract.convertToQuoteAmount(
    collateralAmount,
    price
  )
  // First calculate taker's locked amount
  const loanAmount = (fullCashAmount * BigInt(putStrike)) / BigInt(BIPS_BASE);
  const takerLocked = fullCashAmount - loanAmount;

  // Then calculate provider's locked amount
  const putRange = BigInt(BIPS_BASE) - BigInt(putStrike);
  const callRange = BigInt(callStrike) - BigInt(BIPS_BASE);
  const providerLocked = (takerLocked * callRange) / putRange;
  return providerLocked

}

async function getCurrentPrice(rpcUrl, oracleAddress) {
  // Get contract instance
  const oracleContract = await getContractInstance(
    rpcUrl,
    oracleAddress,
    ORACLE_ABI,
  )
  const price = await oracleContract.currentPrice()
  return price
}


async function cancelOnchainOffer(offerId, providerNFTContractAddress, rpcUrl) {
  try {
    const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
    const providerContract = await getContractInstance(
      rpcUrl,
      providerNFTContractAddress,
      PROVIDER_NFT_ABI,
      wallet
    )
    const tx = await providerContract.updateOfferAmount(offerId, 0)
    const receipt = await tx.wait()
    const events = await parseReceipt(receipt, providerContract)
    const offerUpdatedEvent = events.find(
      (event) => event.name === 'OfferUpdated'
    )
    if (!offerUpdatedEvent) {
      throw new Error('OfferUpdated event not found in the transaction receipt)')
    }

    return true
  } catch (e) {
    console.log(`error cancelling offer, ${offerId} `, e)
    throw e
  }
}


module.exports = {
  getProviderLockedCashFromOracleAndTerms,
  createOnchainOffer,
  cancelOnchainOffer,
  createOnchainRollOffer,
  createOnchainEscrowOffer,
  getOnchainRollOffer,
  getCurrentPrice,
  previewRoll,
  previewSettlement,
  getProtocolFee,
  cancelOnchainRollOffer
}
