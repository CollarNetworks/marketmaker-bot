const { fetchEscrowSettings } = require('../adapters/collarAPI')
const { createOnchainEscrowOffer } = require('../adapters/collarProtocol')
const { DEADLINE_MINUTES, CACHE_REFRESH_INTERVAL } = require('../constants')

let settingsCache = null
let lastCacheTime = null

// Work in progress
// will need help from Carlos
async function executeOnchainEscrowOffer(escrowProposal, amount, rpcUrl) {
  const offerId = await createOnchainEscrowOffer(
    escrowProposal.escrowSupplierNFTContractAddress,
    amount,
    escrowProposal.duration,
    escrowProposal.interestAPR,
    escrowProposal.gracePeriod,
    escrowProposal.lateFeeAPR,
    escrowProposal.minEscrow,
    rpcUrl
  )
  return offerId
}

async function getEscrowSettings(rpcUrl) {
  const now = Date.now()

  // Check if cache is valid (exists and less than 15 minutes old)
  if (
    settingsCache &&
    lastCacheTime &&
    now - lastCacheTime < CACHE_REFRESH_INTERVAL
  ) {
    return settingsCache
  }

  const defaultSettings = {
    interestAPR: 500,
    lateFeeAPR: 5000,
    minEscrow: 1,
    gracePeriod: 7 * 3600 * 24,
    deadline: new Date(),
    escrowSupplierNFTContractAddress:
      '0x4ffe5473cac9313bd89fe1d34ea207c0a2dd5d35',
    deadlineMinutes: DEADLINE_MINUTES,
  }

  const defaultEscrowContracts = {
    '0xf17eb654885afece15039a9aa26f91063cc693e0:0x69fc9d4d59843c6e55f00b5f66b263c963214c53':
      '0x4ffe5473cac9313bd89fe1d34ea207c0a2dd5d35',
    '0x19d87c960265c229d4b1429df6f0c7d18f0611f3:0x69fc9d4d59843c6e55f00b5f66b263c963214c53':
      '0x397470a7d62ed3a694718d55456ee813562978a6',
  }

  try {
    const response = await fetchEscrowSettings(rpcUrl)
    const settings = response.data

    if (settings) {
      const settingsObj = settings.reduce((prev, curr) => {
        const assetPair = `${curr.collateralAsset}:${curr.cashAsset}`
        const contractAddress = defaultEscrowContracts[assetPair]
        console.log({ contractAddress })
        prev[assetPair] = {
          ...curr,
          interestAPR: curr.interestAPR || defaultSettings.interestAPR,
          lateFeeAPR: curr.lateFeeAPR || defaultSettings.lateFeeAPR,
          deadlineMinutes:
            curr.deadlineMinutes || defaultSettings.deadlineMinutes,
          minEscrow: curr.minEscrow || defaultSettings.minEscrow,
          gracePeriod: curr.gracePeriod || defaultSettings.gracePeriod,
          escrowSupplierNFTContractAddress:
            curr.escrowSupplierNFTContractAddress || contractAddress,
        }
        return prev
      }, {})
      settingsObj.default = defaultSettings
      settingsCache = settingsObj
      lastCacheTime = now
      return settingsObj
    }
    throw new Error('No escrow settings found')
  } catch (error) {
    console.log('No escrow settings found using default settings')
    settingsCache = { default: defaultSettings }
    lastCacheTime = now
    return {
      default: defaultSettings,
    }
  }
}

async function getEscrowTermsBySettings(offer, rpcUrl) {
  const allSettings = await getEscrowSettings(rpcUrl)
  const settings =
    allSettings[`${offer.collateralAsset}:${offer.cashAsset}`] ||
    allSettings.default

  // TODO:
  // use offer data and user bot settings to calculate escrow terms
  const deadline = new Date()
  deadline.setMinutes(deadline.getMinutes() + settings.deadlineMinutes)

  return {
    interestAPR: settings.interestAPR,
    lateFeeAPR: settings.lateFeeAPR,
    minEscrow: settings.minEscrow,
    gracePeriod: settings.gracePeriod,
    escrowSupplierNFTContractAddress: settings.escrowSupplierNFTContractAddress,
    deadline,
  }
}

module.exports = {
  getEscrowTermsBySettings,
  getEscrowSettings,
  executeOnchainEscrowOffer,
}
