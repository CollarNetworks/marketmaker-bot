require('dotenv').config()
const { createOnchainOffer } = require('./adapters/collarProtocol')
const {
  fetchOfferRequests,
  markProposalAsExecuted,
  createCallstrikeProposal,
} = require('./adapters/collarAPI')
const {
  API_BASE_URL,
  PROVIDER_ADDRESS,
  POLL_INTERVAL_MS,
  RPC_URL,
} = require('./constants')

if (!API_BASE_URL || !PROVIDER_ADDRESS) {
  console.error(
    'API_BASE_URL and PROVIDER_ADDRESS must be set in the environment variables'
  )
  process.exit(1)
}

async function getCallstrikeByTerms(terms) {
  // Implement the logic to get callstrike by terms by config callback
  // This is a placeholder implementation
  return 11000 // Example callstrike value
}

async function executeOnchainOffer(
  callstrike,
  ltv,
  amount,
  duration,
  providerNFTContractAddress
) {
  const offerId = await createOnchainOffer(
    callstrike,
    ltv,
    amount,
    duration,
    providerNFTContractAddress,
    RPC_URL // change to rpc url from deployment data
  )
  return offerId
}

function getAcceptedProposalFromProvider(offer) {
  return offer.proposals.find(
    (p) =>
      (p.status === 'accepted' || p.is_accepted) &&
      p.address === PROVIDER_ADDRESS
  )
}

function getProposalsByProvider(offer) {
  return offer.proposals.filter((p) => p.address === PROVIDER_ADDRESS)
}

async function processOfferRequests() {
  console.log('Processing offer requests...')

  const response = await fetchOfferRequests()
  const offerRequests = response.data.offerRequests

  for (const offer of offerRequests) {
    try {
      if (offer.status === 'open') {
        const callstrike = await getCallstrikeByTerms(offer) // here's where the configurable callback logic would come in
        const providerProposals = getProposalsByProvider(offer)
        if (providerProposals.length > 0) {
          console.log(
            `Provider already has proposals for offer request ${offer.id}`
          )
          continue
        }
        const proposal = await createCallstrikeProposal(offer.id, callstrike)
        console.log(
          `Created proposal for offer request ${offer.id} with callstrike ${callstrike}`
        )
      } else if (offer.status === 'accepted') {
        const acceptedProposal = getAcceptedProposalFromProvider(offer)
        if (offer.ltv < 100) {
          offer.ltv = offer.ltv * 100
        }
        if (offer.duration < 300) {
          offer.duration = 300
        }
        if (acceptedProposal) {
          const providerNFTAddress =
            '0x6A20EB0D3e8cC89FBC809aD04eB8529C2Ef60bd6' // get from deployment data by asset pair
          const onchainId = await executeOnchainOffer(
            acceptedProposal.callstrike,
            offer.ltv,
            offer.collateral_amount,
            offer.duration,
            providerNFTAddress
          )
          await markProposalAsExecuted(
            acceptedProposal.id,
            Number(onchainId),
            providerNFTAddress
          )
          console.log(
            `Executed onchain offer for request ${offer.id}, execution ID: ${onchainId}`
          )
        }
      }
    } catch (error) {
      console.error(`Error during processing:${offer.id}`, error)
    }
  }
  console.log('Processing complete.')

  // Schedule the next processing cycle
  setTimeout(processOfferRequests, POLL_INTERVAL_MS)
}

// Start the processing cycle
processOfferRequests()

console.log(
  `Offer request processor running. Processing every ${POLL_INTERVAL_MS}ms. Press Ctrl+C to stop.`
)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully.')
  process.exit(0)
})
