require('dotenv').config()

// Load configuration from environment variables
const API_BASE_URL = process.env.API_BASE_URL
const PROVIDER_ADDRESS = process.env.ADDRESS
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 10000 // Default to 1 minute
const DEADLINE_MINUTES = parseInt(process.env.DEADLINE_MINUTES) || 15 // Default to 15 minutes
const LOG_IN_MESSAGE =
    'I confirm that I am the sole owner of this wallet address and no other person or entity has access to it. Any transactions that take place under this account are my responsibility and not that of any other. By signing this, I agree to engage in the use of CollarNetworks Maerketmaker Bot and I understand that I am responsible for any losses that may occur as a result of my actions.'
if (!API_BASE_URL || !PROVIDER_ADDRESS) {
    console.error(
        'API_BASE_URL and PROVIDER_ADDRESS must be set in the environment variables'
    )
    process.exit(1)
}

async function fetchOfferRequests() {
    const response = await fetch(`${API_BASE_URL}/offerRequest?limit=1000`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return await response.json()
}

async function getCallstrikeByTerms(terms) {
    // Implement the logic to get callstrike by terms
    // This is a placeholder implementation
    return 11000 // Example callstrike value
}

async function createCallstrikeProposal(offerRequestId, callstrike) {
    const deadline = new Date()
    deadline.setMinutes(deadline.getMinutes() + DEADLINE_MINUTES)
    const response = await fetch(
        `${API_BASE_URL}/callstrikeProposal/${offerRequestId}`,
        {
            method: 'POST',
            headers: {
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

    return await response.json()
}

async function executeOnchainOffer(offerRequestId) {
    // Implement the logic to execute onchain offer
    // This is a placeholder implementation
    return 0
}

async function markProposalAsExecuted(proposalId, onchainOfferId) {
    const response = await fetch(
        `${API_BASE_URL}/callstrikeProposal/${proposalId}/execute`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                providerNFTAddress: '0x6A20EB0D3e8cC89FBC809aD04eB8529C2Ef60bd6',
                onchainOfferId,
            }),
        }
    )
    console.log({ response })
    const data = await response.json()
    console.log({ data, status: response.status })
    if (!data.success) {
        throw new Error(data.error)
    }
    return data
}

function getAcceptedProposalFromProvider(offer) {
    return offer.proposals.find(
        (p) =>
            (p.status === 'accepted' || p.is_accepted) &&
            p.address === PROVIDER_ADDRESS
    )
}

function getProposalsByProvider(offer) {
    return offer.proposals.filter((p) => p.address === PROVIDER_ADDRESS)
}

async function processOfferRequests() {
    console.log('Processing offer requests...')

    const response = await fetchOfferRequests()
    const offerRequests = response.data.offerRequests

    for (const offer of offerRequests) {
        try {
            if (offer.status === 'open') {
                const callstrike = await getCallstrikeByTerms(offer)
                const providerProposals = getProposalsByProvider(offer)
                if (providerProposals.length > 0) {
                    console.log(
                        `Provider already has proposals for offer request ${offer.id}`
                    )
                    continue
                }
                const proposal = await createCallstrikeProposal(offer.id, callstrike)
                console.log(
                    `Created proposal for offer request ${offer.id} with callstrike ${callstrike}`
                )
            } else if (offer.status === 'accepted') {
                const acceptedProposal = getAcceptedProposalFromProvider(offer)
                if (acceptedProposal) {
                    const onchainId = await executeOnchainOffer(offer.id)
                    await markProposalAsExecuted(acceptedProposal.id, onchainId)
                    console.log(
                        `Executed onchain offer for request ${offer.id}, execution ID: ${onchainId}`
                    )
                }
            }
        } catch (error) {
            console.error(`Error during processing:${offer.id}`, error)
        }
    }
    console.log('Processing complete.')

    // Schedule the next processing cycle
    setTimeout(processOfferRequests, POLL_INTERVAL_MS)
}

// Start the processing cycle
processOfferRequests()

console.log(
    `Offer request processor running. Processing every ${POLL_INTERVAL_MS}ms. Press Ctrl+C to stop.`
)

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully.')
    process.exit(0)
})
