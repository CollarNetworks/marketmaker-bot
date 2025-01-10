const {
  updateOfferRequests,
  fetchOfferRequests,
  getProposalById,
  getEscrowProposalById,
} = require('../adapters/collarAPI')
const { CHAIN_ID } = require('../constants')

async function updateAcceptedRequestToOfferCreated(request) {
  if (request.status !== 'accepted') {
    return
  }

  try {
    const {
      id: requestId,
      acceptedProposalId,
      acceptedEscrowProposalId,
    } = request

    // Skip if no proposals are accepted
    if (!acceptedProposalId) {
      return
    }

    let callstrikeProposalOnchain = false
    let escrowProposalOnchain = acceptedEscrowProposalId ? false : true // Default to true if no escrow proposal exists

    // Check callstrike proposal
    const proposal = await getProposalById(
      requestId,
      acceptedProposalId,
      CHAIN_ID
    )
    callstrikeProposalOnchain =
      proposal.data.status === 'offerCreated' && proposal.data.onchainOfferId
        ? true
        : false

    // Check escrow proposal if it exists
    if (acceptedEscrowProposalId) {
      const escrowProposal = await getEscrowProposalById(
        requestId,
        acceptedEscrowProposalId,
        CHAIN_ID
      )
      escrowProposalOnchain =
        escrowProposal.data.status === 'offerCreated' &&
        escrowProposal.data.onchainOfferId
          ? true
          : false
    }

    // Update status if:
    // 1. Only callstrike proposal exists and is onchain, or
    // 2. Both proposals exist and are onchain
    if (callstrikeProposalOnchain && escrowProposalOnchain) {
      // TODO: Add API endpoint to update request status to offerCreated
      await updateOfferRequests(requestId, { status: 'offerCreated' }, CHAIN_ID)

      console.log(
        `Request ${requestId} proposal(s) are onchain. Status updated to offerCreated`
      )
    }
  } catch (error) {
    console.error('Error in checkProposalsOnchainPlugin:', error)
  }
}

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
  updateAcceptedRequestToOfferCreated,
}
