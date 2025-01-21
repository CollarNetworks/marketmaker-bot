const { fetchOfferRequests } = require('../adapters/collarAPI')
const { CHAIN_ID } = require('../constants')

async function processRequests(status = 'open', plugins = []) {
  if (plugins.length === 0) {
    console.log('No plugins found')
    return
  }
  try {
    const response = await fetchOfferRequests(status, CHAIN_ID)
    const offerRequests = response.data
    if (offerRequests.length === 0) {
      console.log(`No ${status} offer requests found`)
      return
    }
    for (const request of offerRequests) {
      for (const plugin of plugins) {
        await plugin(request)
      }
    }
  } catch (error) {
    console.log('error processing requests', error)
  }
}

module.exports = {
  processRequests,
}
