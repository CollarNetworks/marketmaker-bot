const { fetchEscrowSettings } = require('../adapters/collarAPI')
const { createOnchainEscrowOffer } = require('../adapters/collarProtocol')
const { DEADLINE_MINUTES, CACHE_REFRESH_INTERVAL } = require('../constants')

let settingsCache = null
let lastCacheTime = null

// Work in progress
// will need help from Carlos
async function executeOnchainEscrowOffer(
  escrowProposal,
  amount,
  rpcUrl
) {
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

async function getEscrowSettings() {
  const now = Date.now()

  // Check if cache is valid (exists and less than 15 minutes old)
  if (
    settingsCache &&
    lastCacheTime &&
    now - lastCacheTime < CACHE_REFRESH_INTERVAL
  ) {
    console.log('Using cached escrow settings')
    return settingsCache
  }

  const defaultSettings = {
    interestAPR: 500,
    lateFeeAPR: 5000,
    minEscrow: 1,
    gracePeriod: 7 * 3600 * 24,
    deadline: new Date(),
    escrowSupplierNFTContractAddress: '0x528fa3cc2c35b701a870d74601e0f24bb38231d0',
    deadlineMinutes: DEADLINE_MINUTES,
  }

  const defaultEscrowContracts = {
    "0xf17eb654885afece15039a9aa26f91063cc693e0:0x69fc9d4d59843c6e55f00b5f66b263c963214c53": "0x528fa3cc2c35b701a870d74601e0f24bb38231d0",
    "0x19d87c960265c229d4b1429df6f0c7d18f0611f3:0x69fc9d4d59843c6e55f00b5f66b263c963214c53": "0x14a2600fa25bdd5ba922715ac2bcc897062efc5f",
  }

  try {
    const response = await fetchEscrowSettings()
    const settings = response.data

    if (settings) {
      const settingsObj = settings.reduce((prev, curr) => {
        const assetPair = `${curr.collateralAsset}:${curr.cashAsset}`
        const contractAddress = defaultEscrowContracts[assetPair]
        console.log({ contractAddress })
        prev[assetPair] = {
          ...curr,
          interestAPR:
            curr.interestAPR || defaultSettings.interestAPR,
          lateFeeAPR: curr.lateFeeAPR || defaultSettings.lateFeeAPR,
          deadlineMinutes:
            curr.deadlineMinutes || defaultSettings.deadlineMinutes,
          minEscrow: curr.minEscrow || defaultSettings.minEscrow,
          gracePeriod: curr.gracePeriod || defaultSettings.gracePeriod,
          escrowSupplierNFTContractAddress:
            curr.escrowSupplierNFTContractAddress ||
            contractAddress,

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

async function getEscrowTermsBySettings(offer) {
  const allSettings = await getEscrowSettings()
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
