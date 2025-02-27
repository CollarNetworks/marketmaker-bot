const {
  API_BASE_URL,
  LOG_IN_MESSAGE,
  PROVIDER_ADDRESS,
} = require('../constants')
const jwt = require('jsonwebtoken')
const { getWalletInstance } = require('./ethers')

// AUTH
//

async function signAndGetTokenForAuth(rpcUrl) {
  const wallet = await getWalletInstance(rpcUrl, process.env.PRIVATE_KEY)
  const signature = await wallet.signMessage(LOG_IN_MESSAGE)
  const payload = {
    address: PROVIDER_ADDRESS,
    signature,
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'RS256' })
}

// REQUESTS
//

async function fetchOfferRequests(status = 'open', networkId, rpcUrl) {
  const requestURl = `${API_BASE_URL}/network/${networkId}/request?limit=1000&status=${status}`
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(requestURl, {
    method: 'GET',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function updateOfferRequests(requestId, body, networkId) {
  const requestURl = `${API_BASE_URL}/network/${networkId}/request/${requestId}`
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(requestURl, {
    method: 'PATCH',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

// CALLSTRIKE
//

// Placeholder till logic is built in API
async function fetchCallstrikeSettings() {
  const response = new Response(JSON.stringify({}))
  return await response.json()
}

async function createCallstrikeProposal(
  offerRequestId,
  callstrike,
  deadline,
  networkId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)

  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/request/${offerRequestId}/proposal`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: PROVIDER_ADDRESS,
        callstrike,
        deadline,
        offerRequestId,
        status: 'proposed',
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
  onchainOfferId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const url = `${API_BASE_URL}/network/${networkId}/request/${requestId}/proposal/${proposalId}`

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      onchainOfferId,
      status: 'offerCreated',
    }),
  })
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
  networkId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
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
        status: 'offerCreated',
      }),
    }
  )
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error)
  }
  return data
}

async function fetchRequestProposalsByProvider(
  requestId,
  provider,
  networkId,
  rpcUrl
) {
  const proposalURl = `${API_BASE_URL}/network/${networkId}/request/${requestId}/proposal?limit=1000&provider=${provider}`
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(proposalURl, {
    method: 'GET',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function getProposalById(requestId, proposalId, networkId, rpcUrl) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const url = `${API_BASE_URL}/network/${networkId}/request/${requestId}/proposal/${proposalId}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

// ESCROW
//

// Placeholder till logic is built in API
async function fetchEscrowSettings(rpcUrl) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const url = `${API_BASE_URL}/user/${PROVIDER_ADDRESS}/settings/escrow`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
  })
  return await response.json()
}

async function getEscrowProposalById(requestId, proposalId, networkId, rpcUrl) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const url = `${API_BASE_URL}/network/${networkId}/request/${requestId}/escrow-proposal/${proposalId}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function createEscrowProposal(
  offerRequestId,
  interestAPR,
  lateFeeAPR,
  minEscrow,
  gracePeriod,
  deadline,
  networkId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/request/${offerRequestId}/escrow-proposal`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interestAPR,
        lateFeeAPR,
        minEscrow,
        gracePeriod,
        deadline
      }),
    }
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

async function updateEscrowProposal(
  requestId,
  proposalId,
  networkId,
  interestAPR,

  lateFeeAPR,
  minEscrow,
  duration,
  gracePeriod,
  deadline,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/request/${requestId}/escrow-proposal/${proposalId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: PROVIDER_ADDRESS,
        interestAPR,
        lateFeeAPR,
        minEscrow,
        duration,
        gracePeriod,
        deadline,
        escrowSupplierNFTContractAddress,
        offerRequestId,
        status: 'proposed',
      }),
    }
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

async function fetchRequestEscrowProposalsByProvider(
  requestId,
  networkId,
  rpcUrl
) {
  const proposalURl = `${API_BASE_URL}/network/${networkId}/request/${requestId}/escrow-proposal?limit=1000&provider=${PROVIDER_ADDRESS}`
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(proposalURl, {
    method: 'GET',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function markEscrowProposalAsExecuted(
  networkId,
  requestId,
  proposalId,
  onchainOfferId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const url = `${API_BASE_URL}/network/${networkId}/request/${requestId}/escrow-proposal/${proposalId}`

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `MMBOTBearer ${token}`,
      Environment: process.env.API_ENVIRONMENT,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      onchainOfferId,
      status: 'offerCreated',
    }),
  })
  const data = await response.json()
  console.log({ data })
  if (!data.success) {
    throw new Error(data.error)
  }
  return data
}

// ROLLS
//

async function fetchRollOfferProposalsByProvider(
  providerAddress,
  networkId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)

  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/proposal?provider=${providerAddress}&limit=1000&showExpired=true`,
    {
      method: 'GET',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function fetchRollOfferProposalsByPosition(
  providerAddress,
  loansContractAddress,
  takerId,
  networkId,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)

  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/proposal?provider=${providerAddress}&limit=2&takerId=${takerId}&loansContractAddress=${loansContractAddress}&showExpired=true`,
    {
      method: 'GET',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function createPositionProposal(
  networkId,
  positionId,
  proposalToCreate,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/${positionId}/proposal`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
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
        networkId,
      }),
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function updatePositionProposal(
  networkId,
  proposalId,
  proposalToUpdate,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/proposal/${proposalId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...proposalToUpdate,
        providerAddress: PROVIDER_ADDRESS.toLowerCase(),
        chainId: networkId,
        networkId,
      }),
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

// POSITION
//
async function getPositionsByProvider(networkId, rpcUrl) {
  const token = await signAndGetTokenForAuth(rpcUrl)

  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position?provider=${PROVIDER_ADDRESS}&limit=1000`,
    {
      method: 'GET',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

async function createPositionProposal(
  networkId,
  positionId,
  proposalToCreate,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/${positionId}/proposal`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
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
        networkId,
      }),
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}
async function getPositionById(networkId, positionId, rpcUrl) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/position/${positionId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

// NETWORK

// cache this request since it's called a lot
let networkCache = null
let networkCacheTime = null
const staleTime = 1000 * 60 * 15 // 15 minutes

async function getNetworkById(networkId) {
  const now = Date.now()
  if (networkCache && networkCacheTime && now - networkCacheTime < staleTime) {
    return networkCache
  }
  const response = await fetch(`${API_BASE_URL}/network/${networkId}`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const data = await response.json()
  networkCache = data
  networkCacheTime = now
  return data
}

async function getAssetPair(networkId, underlyingAddress, cashAssetAddress) {
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/pair/${underlyingAddress}:${cashAssetAddress}`
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

// OFFERS (ONCHAIN)

async function getOffersByProviderAndStatus(
  networkId,
  providerAddress,
  status,
  rpcUrl
) {
  const token = await signAndGetTokenForAuth(rpcUrl)
  const response = await fetch(
    `${API_BASE_URL}/network/${networkId}/offer?provider=${providerAddress}&limit=1000${status ? `&status=${status}` : ''
    }`,
    {
      method: 'GET',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

module.exports = {
  fetchOfferRequests,
  updateOfferRequests,
  getProposalById,
  fetchCallstrikeSettings,
  fetchEscrowSettings,
  getEscrowProposalById,
  createEscrowProposal,
  updateEscrowProposal,
  fetchRequestEscrowProposalsByProvider,
  markEscrowProposalAsExecuted,
  createCallstrikeProposal,
  markProposalAsExecuted,
  markRollOfferProposalAsExecuted,
  fetchRollOfferProposalsByProvider,
  fetchRollOfferProposalsByPosition,
  fetchRequestProposalsByProvider,
  getNetworkById,
  getAssetPair,
  getPositionById,
  getPositionsByProvider,
  createPositionProposal,
  getOffersByProviderAndStatus,
  updatePositionProposal,
  getOffersByProviderAndStatus,
}
