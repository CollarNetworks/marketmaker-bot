const {
  createEscrowProposal,
  markEscrowProposalAsExecuted,
  getNetworkById,
  getEscrowProposalById,
  fetchRequestEscrowProposalsByProvider,
  updateEscrowProposal,
} = require('../adapters/collarAPI')
const {
  getEscrowTermsBySettings,
  executeOnchainEscrowOffer,
} = require('../utils/escrow-utils')
const {
  MAX_RETRIES,
  PROVIDER_ADDRESS,
  LENDER_BOT_ACTIVE,
} = require('../constants')

const tries = {}

async function generateEscrowProposal(offer) {
  if (!LENDER_BOT_ACTIVE) return
  try {
    const { data: network } = await getNetworkById(offer.networkId)
    const rpcUrl = network.rpcUrl
    const terms = await getEscrowTermsBySettings(offer, rpcUrl) // here's where the configurable callback logic would come in
    const response = await fetchRequestEscrowProposalsByProvider(
      offer.id,
      offer.networkId,
      rpcUrl
    )
    const escrowProposals = response.data
    if (
      escrowProposals.length > 0 ||
      (tries[offer.id] !== undefined && tries[offer.id] >= MAX_RETRIES)
    ) {
      // skip these as they failed twice already
      return
    }
    try {
      const response = await createEscrowProposal(
        offer.id,
        terms.interestAPR,
        terms.lateFeeAPR,
        terms.minEscrow,
        offer.duration,
        terms.gracePeriod,
        terms.escrowSupplierNFTContractAddress,
        terms.deadline,
        offer.networkId,
        rpcUrl
      )
      const proposal = response.data
      console.log(
        `Created escrow proposal for offer request ${offer.id} with apr ${terms.interestAPR} and late fee APR ${terms.lateFeeAPR} proposal id ${proposal.id}`
      )
    } catch (error) {
      console.log('error', error)
      tries[offer.id] = tries[offer.id] + 1 || 1
      await generateEscrowProposal(offer)
    }
  } catch (error) {
    console.error(`Error during processing open :${offer.id}`, error)
  }
}

async function reproposeEscrowProposal(offer) {
  if (!LENDER_BOT_ACTIVE) return
  try {
    const { data: network } = await getNetworkById(offer.networkId)
    const rpcUrl = network.rpcUrl
    const terms = await getEscrowTermsBySettings(offer, rpcUrl) // here's where the configurable callback logic would come in
    const response = await updateEscrowProposal(
      offer.id,
      offer.acceptedEscrowProposalId,
      offer.networkId,
      terms.interestAPR,
      terms.lateFeeAPR,
      terms.minEscrow,
      offer.duration,
      terms.gracePeriod,
      terms.deadline,
      rpcUrl
    )
    const proposal = response.data
    console.log(
      `Reproposed escrow proposal for offer request ${offer.id} with apr ${terms.interestAPR} and late fee APR ${terms.lateFeeAPR} proposal id ${proposal.id}`
    )
  } catch (error) {
    console.error(
      `Error during reproposing escrow proposal: ${offer.id}`,
      error
    )
  }
}
async function executeEscrowProposal(offer) {
  if (!LENDER_BOT_ACTIVE) return

  if (!offer.acceptedEscrowProposalId) return

  try {
    const { data: network } = await getNetworkById(offer.networkId)
    const rpcUrl = network.rpcUrl
    const { data: acceptedProposal } = await getEscrowProposalById(
      offer.id,
      offer.acceptedEscrowProposalId,
      offer.networkId,
      rpcUrl
    )

    if (
      acceptedProposal &&
      acceptedProposal.address.toLowerCase() === PROVIDER_ADDRESS.toLowerCase()
    ) {
      // avoid proposal duplication
      // if already onchain or expired skip
      if (acceptedProposal.status === 'offerCreated') {
        return
      }

      if (
        acceptedProposal.status === 'accepted' &&
        acceptedProposal.deadline < new Date()
      ) {
        // if accepted and deadline is passed we need to repropose \
        await reproposeEscrowProposal(offer)
        return
      }

      const onchainId = await executeOnchainEscrowOffer(
        acceptedProposal,
        offer.collateralAmount,
        rpcUrl
      )
      console.log({ onchainId })
      await markEscrowProposalAsExecuted(
        acceptedProposal.networkId,
        offer.id,
        acceptedProposal.id,
        Number(onchainId),
        rpcUrl
      )
      console.log(
        `Executed onchain offer for request ${offer.id}, execution ID: ${onchainId}`
      )
    }
  } catch (error) {
    console.error(`Error during processing accepted: ${offer.id}`, error)
  }
}

module.exports = {
  generateEscrowProposal,
  executeEscrowProposal,
}
