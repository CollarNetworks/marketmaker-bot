const {
  fetchRollOfferProposalsByPosition,
  getNetworkById,
  getAssetPair,
  createPositionProposal,
  markRollOfferProposalAsExecuted,
  fetchAcceptedRollOfferProposalsByProvider,
} = require('../adapters/collarAPI')
const { createOnchainRollOffer } = require('../adapters/collarProtocol')
const { getProposalTermsByPosition } = require('../utils/roll-utils')
const { getCurrentPrice } = require('../adapters/collarProtocol')
const { PROVIDER_ADDRESS, CHAIN_ID, MAX_RETRIES } = require('../constants')

const rollTries = {}

async function processAcceptedRollOfferProposals(plugins = []) {
  if (plugins.length === 0) {
    console.log('No plugins found')
    return
  }

  try {
    const response = await fetchAcceptedRollOfferProposalsByProvider(
      PROVIDER_ADDRESS,
      CHAIN_ID
    )
    const proposals = response.data
    if (proposals?.length === 0) {
      return
    }
    for (proposal of proposals) {
      for (const plugin of plugins) {
        await plugin(proposal)
      }
    }
  } catch (error) {
    console.log('error processing positions', error)
  }
}

async function generateRollOfferProposal(position) {
  if (position.status === 'Active') {
    // create a position proposal on the API
    try {
      const { data: existingProposals } =
        await fetchRollOfferProposalsByPosition(
          PROVIDER_ADDRESS,
          position.loansNFT.contractAddress,
          position.loanId,
          CHAIN_ID
        )
      if (existingProposals?.length === 0) {
        const { data: network } = await getNetworkById(CHAIN_ID)
        const rpcUrl = network.rpcUrl
        const { data: pair } = await getAssetPair(
          network.id,
          position.loansNFT.underlying,
          position.loansNFT.cashAsset
        )
        const oracleContractAddress =
          position.pairedPosition.collarTakerNFT.oracle
        const rollsContractAddress = pair.rollsContractAddress
        const price = await getCurrentPrice(rpcUrl, oracleContractAddress)
        const proposalToCreate = await getProposalTermsByPosition(
          position,
          rollsContractAddress,
          price
        )
        const response = await createPositionProposal(
          network.id,
          position.id,
          proposalToCreate
        )
        const proposal = response.data
        console.log(
          `Created position proposal for position ${position.id} with proposal id ${proposal?.id}`
        )
      } else {
        console.log(
          `Position proposal already exists for position ${position.id}`
        )
      }
    } catch (error) {
      console.error(
        `Error during processing open positions: ${position.id}`,
        error
      )
    }
  }
}

async function executeRollOffer(proposal) {
  if (proposal.status === 'accepted') {
    // execute roll offer on chain with the proposal terms
    if (new Date(proposal.deadline) > new Date()) {
      try {
        if (
          rollTries[proposal.id] !== undefined &&
          rollTries[proposal.id] >= MAX_RETRIES
        ) {
          // skip these as they failed twice already
          return
        }
        const { data: network } = await getNetworkById(proposal.networkId)
        const rpcUrl = network.rpcUrl
        const onchainRollOffer = await createOnchainRollOffer(proposal, rpcUrl)
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
        executeRollOffer(proposal)
      }
    }
  }
}

module.exports = {
  generateRollOfferProposal,
  executeRollOffer,
  processAcceptedRollOfferProposals,
}
