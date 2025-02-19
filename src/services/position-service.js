const { getPositionsByProvider } = require('../adapters/collarAPI')
const { CHAIN_ID } = require('../constants')

async function processOpenPositions(plugins = []) {
  if (plugins.length === 0) {
    console.log('No plugins found')
    return
  }

  try {
    const response = await getPositionsByProvider(CHAIN_ID)
    const positions = response.data
    // loop through onchain positions and create a positionProposal on the API (roll proposal) if the position characteristics match determined values
    if (positions.length === 0) {
      console.log(`No open positions found`)
      return
    }
    for (const position of positions) {
      for (const plugin of plugins) {
        await plugin(position)
      }
    }
  } catch (error) {
    console.log('error processing positions', error)
  }
}

module.exports = {
  processOpenPositions,
}
