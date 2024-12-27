const {
  API_BASE_URL,
  DEADLINE_MINUTES,
  LOG_IN_MESSAGE,
  PROVIDER_ADDRESS,
  RPC_URL,
} = require('../constants')
const jwt = require('jsonwebtoken')
const { getWalletInstance } = require('./ethers')



async function fetchOfferRequests(status = 'open', networkId) {
  const requestURl = `${API_BASE_URL}/network/${networkId}/request?limit=1000&status=${status}`
  const token = await signAndGetTokenForAuth()
  const response = await fetch(requestURl, {
    method: "GET",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}


async function signAndGetTokenForAuth() {
  const wallet = await getWalletInstance(RPC_URL, process.env.PRIVATE_KEY)
  const signature = await wallet.signMessage(LOG_IN_MESSAGE)
  const payload = {
    address: PROVIDER_ADDRESS,
    signature,
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'RS256' })
}

async function createCallstrikeProposal(offerRequestId, callstrike, networkId) {
  const deadline = new Date()
  deadline.setMinutes(deadline.getMinutes() + DEADLINE_MINUTES)
  const token = await signAndGetTokenForAuth()

  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/request/${offerRequestId}/proposal`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        'Environment': process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: PROVIDER_ADDRESS,
        callstrike,
        deadline,
        offerRequestId,
        status: 'proposed'
      }),
    }
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

async function markProposalAsExecuted(
  networkId,
  requestId,
  proposalId,
  onchainOfferId
) {
  const token = await signAndGetTokenForAuth()
  const url = `${API_BASE_URL}/network/${networkId}/request/${requestId}/proposal/${proposalId}`

  const response = await fetch(
    url,
    {
      method: 'PATCH',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        'Environment': process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        onchainOfferId,
        status: 'offerCreated'
      }),
    }
  )
  const data = await response.json()
  console.log({ data })
  if (!data.success) {
    throw new Error(data.error)
  }
  return data
}

async function markRollOfferProposalAsExecuted(
  proposalId,
  onchainOfferId,
  networkId
) {
  const token = await signAndGetTokenForAuth()
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/proposal/${proposalId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        onchainOfferId,
        status: "offerCreated"
      }),
    }
  )
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error)
  }
  return data
}

async function fetchRequestProposalsByProvider(requestId, provider, networkId) {
  const proposalURl = `${API_BASE_URL}/network/${networkId}/request/${requestId}/proposal?limit=1000&provider=${provider}`
  const token = await signAndGetTokenForAuth()
  const response = await fetch(proposalURl, {
    method: "GET",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function getProposalById(requestId, proposalId, networkId) {
  const token = await signAndGetTokenForAuth()
  const url = `${API_BASE_URL}/network/${networkId}/request/${requestId}/proposal/${proposalId}`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function fetchAcceptedRollOfferProposalsByProvider(providerAddress, networkId) {
  const token = await signAndGetTokenForAuth()

  const response = await fetch(`${API_BASE_URL}/network/${networkId}/position/proposal?provider=${providerAddress}&limit=1000&status=accepted`, {
    method: "GET",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    }
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}
async function fetchRollOfferProposalsByPosition(providerAddress, loansContractAddress, takerId, networkId) {
  const token = await signAndGetTokenForAuth()

  const response = await fetch(`${API_BASE_URL}/network/${networkId}/position/proposal?provider=${providerAddress}&limit=2&takerId=${takerId}&loansContractAddress=${loansContractAddress}`, {
    method: "GET",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    }
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function getNetworkById(networkId) {
  const response = await fetch(`${API_BASE_URL}/network/${networkId}`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}


async function getAssetPair(networkId, underlyingAddress, cashAssetAddress) {
  const response = await fetch(`${API_BASE_URL}/network/${networkId}/pair/${underlyingAddress}:${cashAssetAddress}`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}


async function getPositionsByProvider(networkId) {
  const token = await signAndGetTokenForAuth()

  const response = await fetch(`${API_BASE_URL}/network/${networkId}/position?provider=${PROVIDER_ADDRESS}&limit=1000`, {
    method: "GET",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    }
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function createPositionProposal(networkId, positionId, proposalToCreate) {
  const token = await signAndGetTokenForAuth()
  const response = await fetch(`${API_BASE_URL}/network/${networkId}/position/${positionId}/proposal`, {
    method: "POST",
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      'Environment': process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...proposalToCreate,
      providerAddress: PROVIDER_ADDRESS.toLowerCase(),
      onchainOfferId: null,
      status: 'proposed',
      isExecuted: false,
      isAccepted: false,
      chainId: networkId,
      networkId
    })
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

module.exports = {
  fetchOfferRequests,
  getProposalById,
  createCallstrikeProposal,
  markProposalAsExecuted,
  markRollOfferProposalAsExecuted,
  fetchAcceptedRollOfferProposalsByProvider,
  fetchRollOfferProposalsByPosition,
  fetchRequestProposalsByProvider,
  getNetworkById,
  getAssetPair,
  getPositionsByProvider,
  createPositionProposal
}
