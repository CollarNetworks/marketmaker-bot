const {
  fetchRollOfferProposalsByPosition,
  getNetworkById,
  createPositionProposal,
  markRollOfferProposalAsExecuted,
  fetchRollOfferProposalsByProvider,
  getPositionById,
} = require('../adapters/collarAPI')
const {
  createOnchainRollOffer,
  getOnchainRollOffer,
  cancelOnchainRollOffer,
} = require('../adapters/collarProtocol')
const {

  handleUpdatePositionProposal,
  getProposalToCreateFromPosition,
} = require('../utils/roll-utils')

const { PROVIDER_ADDRESS, CHAIN_ID, MAX_RETRIES } = require('../constants')

const rollTries = {}

async function handleAcceptedRollOfferProposals(proposal) {
  if (proposal.status === 'accepted') {
    // execute roll offer on chain with the proposal terms
    const { data: network } = await getNetworkById(proposal.networkId)
    const rpcUrl = network.rpcUrl
    if (new Date(proposal.deadline) > new Date()) {
      try {
        if (
          rollTries[proposal.id] !== undefined &&
          rollTries[proposal.id] >= MAX_RETRIES
        ) {
          // skip these as they failed twice already
          rollTries[proposal.id] = 0
          return
        }

        const onchainRollOffer = await createOnchainRollOffer(proposal, rpcUrl)
        await markRollOfferProposalAsExecuted(
          proposal.id,
          onchainRollOffer.toString(),
          network.id,
          rpcUrl
        )
        console.log(
          `Executed onchain roll offer for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress}, execution ID: ${onchainRollOffer} `
        )
      } catch (e) {
        console.log('error executing onchain offer', e)
        rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
        handleAcceptedRollOfferProposals(proposal)
      }
    } else {
      // if proposal is accepted but expired , repropose
      try {
        const positionId = `${proposal.loansContractAddress}-${proposal.takerId}`
        const { data: position } = await getPositionById(
          proposal.networkId,
          positionId,
          rpcUrl
        )
        await handleUpdatePositionProposal(
          position,
          proposal.id,
          proposal.networkId,
          rpcUrl
        )
        console.log(
          `Reproposed accepted position proposal id ${proposal.id} for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress} `
        )
      } catch (e) {
        console.log(
          `error reproposing expired proposal ${proposal.id} for takerId ${proposal.takerId}`,
          e
        )
        rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
        return
      }
    }
  }
}

async function handleProposedRollOfferProposals(proposal) {
  if (proposal.status === 'proposed') {
    // if its proposed but expired, repropose, else skip
    if (new Date(proposal.deadline) < new Date()) {
      if (
        rollTries[proposal.id] !== undefined &&
        rollTries[proposal.id] >= MAX_RETRIES
      ) {
        // skip these as they failed twice already
        rollTries[proposal.id] = 0
        return
      }
      try {
        const { data: network } = await getNetworkById(proposal.networkId)
        const rpcUrl = network.rpcUrl
        const positionId = `${proposal.loansContractAddress}-${proposal.takerId}`
        const { data: position } = await getPositionById(
          proposal.networkId,
          positionId,
          rpcUrl
        )
        await handleUpdatePositionProposal(
          position,
          proposal.id,
          proposal.networkId,
          rpcUrl
        )
        console.log(
          `Reproposed position proposal id ${proposal.id} for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress} `
        )
      } catch (e) {
        console.log(
          `error reproposing expired proposal ${proposal.id} for takerId ${proposal.takerId}`,
          e
        )
        rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
        handleProposedRollOfferProposals(proposal)
      }
    }
  }
}

async function handleOnchainRollOfferProposals(proposal) {

  if (proposal.status === 'offerCreated') {
    // if offerCreated and onchain is expired, pull onchain roll offer and repropose, else skip

    try {
      if (
        rollTries[proposal.id] !== undefined &&
        rollTries[proposal.id] >= MAX_RETRIES
      ) {
        // skip these as they failed twice already
        rollTries[proposal.id] = 0
        return
      }
      const { data: network } = await getNetworkById(proposal.networkId)
      const rpcUrl = network.rpcUrl
      const onchainOffer = await getOnchainRollOffer(
        proposal.onchainOfferId,
        proposal.rollsContractAddress,
        rpcUrl
      )
      const onchainDeadline = new Date(Number(onchainOffer.deadline) * 1000)
      if (onchainDeadline < new Date() && onchainOffer.active) {
        const success = await cancelOnchainRollOffer(
          proposal.onchainOfferId,
          proposal.rollsContractAddress,
          rpcUrl
        )
        if (success) {
          console.log(
            `Successfully cancelled onchain roll offer ${proposal.onchainOfferId}`
          )
        }
        const positionId = `${proposal.loansContractAddress}-${proposal.takerId}`

        const { data: position } = await getPositionById(
          proposal.networkId,
          positionId,
          rpcUrl
        )
        await handleUpdatePositionProposal(
          position,
          proposal.id,
          proposal.networkId,
          rpcUrl
        )
        console.log(
          `Cancelled onchain and reproposed position proposal id ${proposal.id} for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress} `
        )
      }
    } catch (e) {
      console.log('error reproposing expired onchain offer', e)
      rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
      return
    }
  }
}

async function processRollOfferProposals(plugins = []) {
  if (plugins.length === 0) {
    console.log('No plugins found')
    return
  }

  try {
    const { data: network } = await getNetworkById(CHAIN_ID)
    const rpcUrl = network.rpcUrl
    const response = await fetchRollOfferProposalsByProvider(
      PROVIDER_ADDRESS,
      CHAIN_ID,
      rpcUrl
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
      const { data: network } = await getNetworkById(CHAIN_ID)
      const rpcUrl = network.rpcUrl
      const { data: existingProposals } =
        await fetchRollOfferProposalsByPosition(
          PROVIDER_ADDRESS,
          position.loansNFT.contractAddress,
          position.loanId,
          network.id,
          rpcUrl
        )
      if (existingProposals?.length === 0) {
        const proposalToCreate = await getProposalToCreateFromPosition(
          network.id, position, rpcUrl
        )
        const response = await createPositionProposal(
          network.id,
          position.id,
          proposalToCreate,
          rpcUrl
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

module.exports = {
  generateRollOfferProposal,
  handleAcceptedRollOfferProposals,
  handleProposedRollOfferProposals,
  handleOnchainRollOfferProposals,
  processRollOfferProposals,
}
