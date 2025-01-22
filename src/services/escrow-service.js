const {
  createEscrowProposal,
  markEscrowProposalAsExecuted,
  getNetworkById,
  getEscrowProposalById,
  fetchRequestEscrowProposalsByProvider,
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
    const terms = await getEscrowTermsBySettings(offer) // here's where the configurable callback logic would come in
    const response = await fetchRequestEscrowProposalsByProvider(
      offer.id,
      offer.networkId
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
        offer.networkId
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

// Work in progress
// will need help from Carlos
async function executeEscrowProposal(offer) {
  if (!LENDER_BOT_ACTIVE) return

  if (
    offer.acceptedEscrowProposalId === null ||
    offer.acceptedEscrowProposalId === undefined
  )
    return

  try {
    const acceptedProposal = await getEscrowProposalById(
      offer.id,
      offer.acceptedEscrowProposalId,
      offer.networkId
    )
    if (offer.ltv < 100) {
      offer.ltv = offer.ltv * 100
    }
    if (offer.duration < 300) {
      offer.duration = 300
    }
    if (
      acceptedProposal &&
      acceptedProposal.address.toLowerCase() === PROVIDER_ADDRESS.toLowerCase()
    ) {
      // avoid proposal duplication
      // if already onchain or expired skip
      if (
        acceptedProposal.status === 'offerCreated' ||
        new Date(acceptedProposal.deadline) < new Date()
      ) {
        return
      }
      const providerNFTAddress = acceptedProposal.providerNftContractAddress
      const oracleAddress = acceptedProposal.oracleContractAddress
      const { data: network } = await getNetworkById(acceptedProposal.networkId)
      const rpcUrl = network.rpcUrl
      const onchainId = await executeOnchainEscrowOffer(
        acceptedProposal.callstrike,
        offer.ltv,
        offer.collateralAmount,
        offer.duration,
        providerNFTAddress,
        oracleAddress,
        rpcUrl
      )
      console.log({ onchainId })
      await markEscrowProposalAsExecuted(
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
}

module.exports = {
  generateEscrowProposal,
  executeEscrowProposal,
}
