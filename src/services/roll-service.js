const {
  fetchRollOfferProposalsByPosition,
  getNetworkById,
  getAssetPair,
  createPositionProposal,
  markRollOfferProposalAsExecuted,
  fetchRollOfferProposalsByProvider,
  getPositionById,
} = require('../adapters/collarAPI')
const { createOnchainRollOffer, getOnchainRollOffer } = require('../adapters/collarProtocol')
const { getProposalTermsByPosition, handleUpdatePositionProposal } = require('../utils/roll-utils')
const { getCurrentPrice } = require('../adapters/collarProtocol')
const { PROVIDER_ADDRESS, CHAIN_ID, MAX_RETRIES } = require('../constants')

const rollTries = {}


async function handleAcceptedRollOfferProposals(proposal) {
  if (proposal.status === 'accepted') {
    // execute roll offer on chain with the proposal terms
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
        console.log('error executing onchain offer', e)
        rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
        handleAcceptedRollOfferProposals(proposal)
      }
    } else {
      // if proposal is accepted but expired , repropose 
      try {
        const positionId = `${proposal.loansContractAddress}-${proposal.takerId}`
        const { data: position } = await getPositionById(proposal.networkId, positionId)
        await handleUpdatePositionProposal(position, proposal.id, proposal.networkId)
        console.log(
          `Reproposed accepted position proposal id ${proposal.id} for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress} `
        )
      } catch (e) {
        console.log(`error reproposing expired proposal ${proposal.id} for takerId ${proposal.takerId}`, e)
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
        const positionId = `${proposal.loansContractAddress}-${proposal.takerId}`
        const { data: position } = await getPositionById(proposal.networkId, positionId)
        await handleUpdatePositionProposal(position, proposal.id, proposal.networkId)
        console.log(
          `Reproposed position proposal id ${proposal.id} for position ${proposal.takerId} on loans contract: ${proposal.loansContractAddress} `
        )
      } catch (e) {
        console.log(`error reproposing expired proposal ${proposal.id} for takerId ${proposal.takerId}`, e)
        rollTries[proposal.id] = rollTries[proposal.id] + 1 || 1
        handleProposedRollOfferProposals(proposal)
      }
    }
  }
}

async function handleOnchainRollOfferProposals(proposal) {
  if (proposal.status === 'offerCreated') {
    // if offerCreated and onchain is expired, pull onchain roll offer and repropose, else skip
    if (new Date(proposal.deadline) < new Date()) {
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
        const onchainOffer = await getOnchainRollOffer(proposal.onchainOfferId, proposal.rollsContractAddress, rpcUrl)
        const onchainDeadline = new Date(Number(onchainOffer.deadline) * 1000)
        if (onchainDeadline < new Date() && onchainOffer.active) {
          const success = await cancelOnchainRollOffer(proposal.onchainOfferId, proposal.rollsContractAddress, rpcUrl)
          if (success) {
            console.log(`Successfully cancelled onchain roll offer ${proposal.onchainOfferId}`)
          }
          const positionId = `${proposal.loansContractAddress}-${proposal.takerId}`

          const { data: position } = await getPositionById(proposal.networkId, positionId)
          await handleUpdatePositionProposal(position, proposal.id, proposal.networkId)
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
}


async function processRollOfferProposals(plugins = []) {
  if (plugins.length === 0) {
    console.log('No plugins found')
    return
  }

  try {
    const response = await fetchRollOfferProposalsByProvider(
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



module.exports = {
  generateRollOfferProposal,
  handleAcceptedRollOfferProposals,
  handleProposedRollOfferProposals,
  handleOnchainRollOfferProposals,
  processRollOfferProposals,
}

