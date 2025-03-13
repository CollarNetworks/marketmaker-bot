const {
  createCallstrikeProposal,
  markProposalAsExecuted,
  getNetworkById,
} = require('../adapters/collarAPI')
const {
  executeOnchainOffer,
  getCallstrikeTermsBySettings,
  getProposalsByProvider,
  getAcceptedProposalById,
} = require('../utils/callstrike-utils')
const {
  MAX_RETRIES,
  PROVIDER_ADDRESS,
  PROVIDER_BOT_ACTIVE,
} = require('../constants')

const tries = {}

async function generateCallstrikeProposal(offer) {
  if (!PROVIDER_BOT_ACTIVE) return
  try {
    const { data: network } = await getNetworkById(offer.networkId)
    const rpcUrl = network.rpcUrl
    const terms = await getCallstrikeTermsBySettings(offer, rpcUrl) // here's where the configurable callback logic would come in
    const providerProposals = await getProposalsByProvider(
      offer,
      offer.networkId,
      rpcUrl
    )

    if (
      providerProposals.length > 0 ||
      (tries[offer.id] !== undefined && tries[offer.id] >= MAX_RETRIES)
    ) {
      // skip these as they failed twice already
      return
    }

    try {
      const response = await createCallstrikeProposal(
        offer.id,
        terms.callstrike,
        terms.deadline,
        offer.networkId,
        rpcUrl
      )
      const proposal = response.data
      console.log(
        `Created proposal for offer request ${offer.id} with callstrike ${terms.callstrike} proposal id ${proposal.id}`
      )
    } catch (error) {
      console.log('error', error)
      tries[offer.id] = tries[offer.id] + 1 || 1
      await generateCallstrikeProposal(offer)
    }
  } catch (error) {
    console.error(`Error during processing open :${offer.id}`, error)
  }
}

async function executeCallstrikeProposal(offer) {
  if (!PROVIDER_BOT_ACTIVE) return
  try {
    const { data: network } = await getNetworkById(offer.networkId)
    const rpcUrl = network.rpcUrl
    const acceptedProposal = await getAcceptedProposalById(
      offer.id,
      offer.acceptedProposalId,
      offer.networkId,
      rpcUrl
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
      const providerNFTAddress = acceptedProposal.providerNFTContractAddress
      const oracleAddress = acceptedProposal.oracleContractAddress

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
  generateCallstrikeProposal,
  executeCallstrikeProposal,
}
