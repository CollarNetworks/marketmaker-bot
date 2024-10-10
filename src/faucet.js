require('dotenv').config()
const { signAndGetTokenForAuth } = require('./adapters/collarAPI')
const { API_BASE_URL, PROVIDER_ADDRESS } = require('./constants')

if (!API_BASE_URL || !process.env.CHAIN_ID || !process.env.API_ENVIRONMENT) {
  console.error(
    'API_BASE_URL and PROVIDER_ADDRESS must be set in the environment variables'
  )
  process.exit(1)
}

async function faucetTokens() {
  const token = await signAndGetTokenForAuth()
  try {
    const url = `${API_BASE_URL}/faucet/cash`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `MMBOTBearer ${token}`,
        'Chain-Id': process.env.CHAIN_ID,
        Environment: process.env.API_ENVIRONMENT,
        'Content-Type': 'application/json',
      },
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      console.error(
        'Error fauceting tokens!  Check API response for more details.'
      )
      process.exit(1)
    }
    return console.log('Tokens successfully fauceted!')
  } catch (error) {
    console.error(
      'Error fauceting tokens!  Check API response for more details.'
    )
    process.exit(1)
  }
}

console.log(`Fauceting cash tokens...`)
await faucetTokens()

process.exit(0)
