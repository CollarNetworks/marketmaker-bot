require('dotenv').config()
const {
  createOnchainOffer,
  createOnchainRollOffer,
  getProviderLockedCashFromOracleAndTerms,
} = require('./adapters/collarProtocol')
const {
  fetchOfferRequests,
  markProposalAsExecuted,
  createCallstrikeProposal,
  fetchAcceptedRollOfferProposals,
  markRollOfferProposalAsExecuted,
  fetchRequestProposalsByProvider,
  getProposalById,
  getNetworkById,
} = require('./adapters/collarAPI')
const {
  API_BASE_URL,
  PROVIDER_ADDRESS,
  POLL_INTERVAL_MS,
  RPC_URL,
  MAX_RETRIES,
  CHAIN_ID,
} = require('./constants')

if (!API_BASE_URL || !PROVIDER_ADDRESS) {
  console.error(
    'API_BASE_URL and PROVIDER_ADDRESS must be set in the environment variables'
  )
  process.exit(1)
}

const tries = {}
const rollTries = {}

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
  providerNFTContractAddress,
  oracleAddress,
  rpcUrl
) {
  const cashAmount = await getProviderLockedCashFromOracleAndTerms(
    oracleAddress,
    amount,
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

async function getAcceptedProposalById(requestId, proposalId, networkId) {
  const response = await getProposalById(requestId, proposalId, networkId)
  console.log({ response: response })
  return response.data
}

async function getProposalsByProvider(offer, networkId) {
  const response = await fetchRequestProposalsByProvider(offer.id, PROVIDER_ADDRESS, networkId)
  console.log({ response: response })
  return response.data
}

async function processOpenOfferRequests() {
  const response = await fetchOfferRequests("open", CHAIN_ID)
  console.log({ response: response.data })
  const offerRequests = response.data
  if (offerRequests.length === 0) {
    console.log('No open offer requests found')
    return
  }
  const offer = offerRequests[0]
  // for (const offer of offerRequests) {
  try {
    const callstrike = await getCallstrikeByTerms(offer) // here's where the configurable callback logic would come in
    const providerProposals = await getProposalsByProvider(offer, offer.networkId)
    if (
      providerProposals.length > 0 ||
      (tries[offer.id] !== undefined && tries[offer.id] >= MAX_RETRIES)
    ) {
      // skip these as they failed twice already
      // continue
    }
    try {
      const response = await createCallstrikeProposal(offer.id, callstrike, offer.networkId)
      const proposal = response.data
      console.log(
        `Created proposal for offer request ${offer.id} with callstrike ${callstrike} proposal id ${proposal.id}`
      )
    } catch (error) {
      console.log('error', error)
      tries[offer.id] = tries[offer.id] + 1 || 1
      // continue
    }
  } catch (error) {
    console.error(`Error during processing open :${offer.id}`, error)
  }
  // }
}

async function processAcceptedRequestProposals() {
  const response = await fetchOfferRequests("accepted", CHAIN_ID)
  console.log({ response: response.data })
  const offerRequests = response.data
  if (offerRequests.length === 0) {
    console.log('No open offer requests found')
    return
  }
  const offer = offerRequests[0]
  // for (const offer of offerRequests) {
  try {
    const acceptedProposal = await getAcceptedProposalById(offer.id, offer.acceptedProposalId, offer.networkId)
    if (offer.ltv < 100) {
      offer.ltv = offer.ltv * 100
    }
    if (offer.duration < 300) {
      offer.duration = 300
    }
    if (acceptedProposal) {
      console.log({ acceptedProposal })
      const providerNFTAddress =
        acceptedProposal.providerNftContractAddress
      const oracleAddress = acceptedProposal.oracleContractAddress
      const { data: network } = await getNetworkById(acceptedProposal.networkId)
      console.log({ network })
      const rpcUrl = network.rpcUrl
      const onchainId = await executeOnchainOffer(
        acceptedProposal.callstrike,
        offer.ltv,
        offer.collateralAmount,
        offer.duration,
        providerNFTAddress,
        oracleAddress,
        rpcUrl
      )
      console.log({ onchainId })
      await markProposalAsExecuted(
        acceptedProposal.networkId,
        offer.id,
        acceptedProposal.id,
        Number(onchainId)
      )
      console.log(
        `Executed onchain offer for request ${offer.id}, execution ID: ${onchainId}`
      )
    }
  } catch (error) {
    console.error(`Error during processing accepted: ${offer.id}`, error)
  }
  // }
}

async function processRollOfferProposals() {
  const response = await fetchAcceptedRollOfferProposals(PROVIDER_ADDRESS, CHAIN_ID)
  const proposals = response.data
  if (proposals?.length === 0) {
    return
  }
  for (proposal of proposals) {
    if (proposal.status === 'accepted') {
      // execute roll offer on chain with the proposal terms
      if (new Date(proposal.deadline) > new Date()) {
        try {
          if (
            rollTries[proposal.id] !== undefined &&
            rollTries[proposal.id] >= MAX_RETRIES
          ) {
            // skip these as they failed twice already
            continue
          }
          const { data: network } = await getNetworkById(proposal.networkId)
          const rpcUrl = network.rpcUrl
          const onchainRollOffer = await createOnchainRollOffer(
            proposal,
            rpcUrl
          )
          await markRollOfferProposalAsExecuted(
            proposal.id,
            onchainRollOffer.toString(),
            network.id
          )
          console.log(
            `Executed onchain roll offer for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress}, execution ID: ${onchainRollOffer} `
          )
        } catch (e) {
          console.log('error', e)
          rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
          continue
        }
      }
    }
  }
}

async function poll() {
  await processAcceptedRequestProposals()
  await processOpenOfferRequests()
  await processRollOfferProposals()
  // Schedule the next processing cycle
  setTimeout(poll, POLL_INTERVAL_MS)
}

// Start the processing cycle
poll()

console.log(
  `Offer request processor running.Processing every ${POLL_INTERVAL_MS} ms.Press Ctrl + C to stop.`
)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully.')
  process.exit(0)
})
