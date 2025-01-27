const {
  fetchCallstrikeSettings,
  fetchRequestProposalsByProvider,
  getProposalById,
} = require('../adapters/collarAPI')
const {
  getProviderLockedCashFromOracleAndTerms,
  createOnchainOffer,
} = require('../adapters/collarProtocol')
const {
  PROVIDER_ADDRESS,
  CACHE_REFRESH_INTERVAL,
  DEADLINE_MINUTES,
} = require('../constants')

let settingsCache = null
let lastCacheTime = null

async function executeOnchainOffer(
  callstrike,
  ltv,
  underlyingAmount,
  duration,
  providerNFTContractAddress,
  oracleAddress,
  rpcUrl
) {
  const cashAmount = await getProviderLockedCashFromOracleAndTerms(
    oracleAddress,
    underlyingAmount,
    callstrike,
    ltv,
    rpcUrl
  )
  const offerId = await createOnchainOffer(
    callstrike,
    ltv,
    cashAmount,
    duration,
    providerNFTContractAddress,
    rpcUrl
  )
  return offerId
}

async function getCallstrikeTermsBySettings(offer) {
  const allSettings = await getCallstrikeSettings()
  const settings =
    allSettings[`${offer.collateralAsset}:${offer.cashAsset}`] ||
    allSettings.default

  // TODO:
  // use offer data and user bot settings to calculate callstrike
  const deadline = new Date()
  deadline.setMinutes(deadline.getMinutes() + settings.deadlineMinutes)

  return {
    callstrike: settings.callstrike,
    deadline,
  } // Example callstrike value
}

async function getCallstrikeSettings() {
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
    callstrike: 11000,
    deadlineMinutes: DEADLINE_MINUTES,
  }

  try {
    const response = await fetchCallstrikeSettings()
    const settings = response.data

    if (settings) {
      const settingsObj = settings.reduce((prev, curr) => {
        prev[`${curr.collateralAsset}:${curr.cashAsset}`] = curr
        return prev
      }, {})
      settingsObj.default = defaultSettings
      settingsCache = settingsObj
      lastCacheTime = now
      return settingsObj
    }
    throw new Error('No callstrike settings found')
  } catch (error) {
    console.log('No callstrike settings found using default settings')
    // Even for default settings, update the cache timestamp
    settingsCache = { default: defaultSettings }
    lastCacheTime = now
    return { default: defaultSettings }
  }
}

async function getAcceptedProposalById(requestId, proposalId, networkId) {
  const response = await getProposalById(requestId, proposalId, networkId)
  return response.data
}

async function getProposalsByProvider(offer, networkId) {
  const response = await fetchRequestProposalsByProvider(
    offer.id,
    PROVIDER_ADDRESS,
    networkId
  )
  return response.data
}

module.exports = {
  executeOnchainOffer,
  getCallstrikeTermsBySettings,
  getAcceptedProposalById,
  getProposalsByProvider,
}
