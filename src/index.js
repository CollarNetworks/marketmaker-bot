require('dotenv').config()
const { processRequests } = require('./services/request-service')
const {
  generateRollOfferProposal,
  processRollOfferProposals,
  handleOnchainRollOfferProposals,
  handleProposedRollOfferProposals,
  handleAcceptedRollOfferProposals,
} = require('./services/roll-service')
const { processOpenPositions } = require('./services/position-service')
// const { processOnchainOffers, cancelOnchainOffer } = require('./services/offer-service')
const {
  generateCallstrikeProposal,
  executeCallstrikeProposal,
} = require('./services/callstrike-service')
const {
  API_BASE_URL,
  PROVIDER_ADDRESS,
  POLL_INTERVAL_MS,
} = require('./constants')
const {
  generateEscrowProposal,
  executeEscrowProposal,
} = require('./services/escrow-service')

if (!API_BASE_URL || !PROVIDER_ADDRESS) {
  console.error(
    'API_BASE_URL and PROVIDER_ADDRESS must be set in the environment variables'
  )
  process.exit(1)
}

async function poll() {
  // RFQ
  await processRequests('open', [
    generateEscrowProposal,
    generateCallstrikeProposal,
  ])
  await processRequests('acceptedEscrow', [executeEscrowProposal])
  await processRequests('offerCreatedEscrow', [generateCallstrikeProposal])
  await processRequests('accepted', [executeCallstrikeProposal])

  // Roll
  await processOpenPositions([generateRollOfferProposal])
  await processRollOfferProposals([
    handleAcceptedRollOfferProposals,
    handleProposedRollOfferProposals,
    handleOnchainRollOfferProposals,
  ])

  // await processOnchainOffers([cancelOnchainOffer]) // delete all onchain offers from this provider (cleanup method)

  /**  @TODO: pull money from onchain  offers that match an expired callstrike proposal 
  (get all expired offerCreated proposals from this provider , loop and updateAmount to 0)
  **/

  // Schedule the next processing cycle
  setTimeout(poll, POLL_INTERVAL_MS)
}

// Start the processing cycle
poll()

console.log(`Processing every ${POLL_INTERVAL_MS} ms.Press Ctrl + C to stop.`)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully.')
  process.exit(0)
})
