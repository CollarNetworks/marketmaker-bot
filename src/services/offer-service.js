const {
  getOffersByProviderAndStatus,
  getNetworkById,
} = require('../adapters/collarAPI')
const { cancelOnchainOffer } = require('../adapters/collarProtocol')

const { PROVIDER_ADDRESS, CHAIN_ID } = require('../constants')

async function processOnchainOffers(plugins = []) {
  if (plugins.length === 0) {
    console.log('No plugins found')
    return
  }
  try {
    // get all offers from provider
    const { data: offers } = await getOffersByProviderAndStatus(
      CHAIN_ID,
      PROVIDER_ADDRESS,
      'Active'
    )
    // loop through offers and cancel them
    const { data: network } = await getNetworkById(CHAIN_ID)
    const rpcUrl = network.rpcUrl
    for (const offer of offers) {
      for (const plugin of plugins) {
        await plugin(offer, rpcUrl)
      }
    }
  } catch (e) {
    console.log('error pulling all offers', e)
  }
}

async function cancelOnchainOffer(offer, rpcUrl) {
  try {
    const success = await cancelOnchainOffer(
      offer.offerId,
      offer.collarProviderNFT?.contractAddress,
      rpcUrl
    )
    if (success) {
      console.log(`Successfully cancelled offer ${offer.offerId}`)
    }
  } catch (e) {
    console.log(`error cancelling offer ${offer.offerId} `, e)
    return
  }
}

module.exports = {
  processOnchainOffers,
  cancelOnchainOffer,
}
