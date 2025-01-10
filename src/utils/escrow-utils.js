const { fetchEscrowSettings } = require('../adapters/collarAPI')
const { DEADLINE_MINUTES, CACHE_REFRESH_INTERVAL } = require('../constants')

let settingsCache = null
let lastCacheTime = null

// Work in progress
// will need help from Carlos
async function executeOnchainEscrowOffer(
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
    annualPercentageRate: 450,
    originatingFee: 100,
    deadlineMinutes: DEADLINE_MINUTES,
  }

  try {
    const response = await fetchEscrowSettings()
    const settings = response.data

    if (settings) {
      const settingsObj = settings.reduce((prev, curr) => {
        prev[`${curr.collateralAsset}:${curr.cashAsset}`] = {
          ...curr,
          annualPercentageRate:
            curr.annualPercentageRate || defaultSettings.annualPercentageRate,
          originatingFee: curr.originatingFee || defaultSettings.originatingFee,
          deadlineMinutes:
            curr.deadlineMinutes || defaultSettings.deadlineMinutes,
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
    apr: settings.annualPercentageRate,
    fee: settings.originatingFee,
    deadline,
  }
}

module.exports = {
  getEscrowTermsBySettings,
  getEscrowSettings,
  executeOnchainEscrowOffer,
}
