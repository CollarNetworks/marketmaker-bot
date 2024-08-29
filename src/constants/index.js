// Load configuration from environment variables
const API_BASE_URL = process.env.API_BASE_URL
const PROVIDER_ADDRESS = process.env.ADDRESS
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 10000 // Default to 1 minute
const DEADLINE_MINUTES = parseInt(process.env.DEADLINE_MINUTES) || 15 // Default to 15 minutes
const LOG_IN_MESSAGE = "I confirm that I am the sole owner of this wallet address and no other person or entity has access to it. Any transactions that take place under this account are my responsibility and not that of any other. By signing this, I agree to engage in the use of CollarNetworks Marketmaker Bot and I understand that I am responsible for any losses that may occur as a result of my actions."
const RPC_URL = process.env.RPC_URL
module.exports = {
    RPC_URL,
    API_BASE_URL,
    PROVIDER_ADDRESS,
    POLL_INTERVAL_MS,
    DEADLINE_MINUTES,
    LOG_IN_MESSAGE
}