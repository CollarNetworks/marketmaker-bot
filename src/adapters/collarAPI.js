const {
  API_BASE_URL,
  DEADLINE_MINUTES,
  LOG_IN_MESSAGE,
  PROVIDER_ADDRESS,
  RPC_URL,
} = require('../constants')
const jwt = require('jsonwebtoken')
const { getWalletInstance } = require('./ethers')
async function fetchOfferRequests() {
  const response = await fetch(`${API_BASE_URL}/offerRequest?limit=1000`)
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

async function createCallstrikeProposal(offerRequestId, callstrike) {
  const deadline = new Date()
  deadline.setMinutes(deadline.getMinutes() + DEADLINE_MINUTES)
  const token = await signAndGetTokenForAuth()
  const response = await fetch(
    `${API_BASE_URL}/callstrikeProposal/${offerRequestId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        'Chain-Id': process.env.CHAIN_ID,
        'Environment': process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: PROVIDER_ADDRESS,
        callstrike,
        deadline,
        offerRequestId,
      }),
    }
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

async function markProposalAsExecuted(
  proposalId,
  onchainOfferId,
  providerNFTAddress
) {
  const token = await signAndGetTokenForAuth()
  const response = await fetch(
    `${API_BASE_URL}/callstrikeProposal/${proposalId}/execute`,
    {
      method: 'PUT',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        'Chain-Id': process.env.CHAIN_ID,
        'Environment': process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerNFTAddress,
        onchainOfferId,
      }),
    }
  )
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error)
  }
  return data
}

module.exports = {
  fetchOfferRequests,
  createCallstrikeProposal,
  markProposalAsExecuted,
}
