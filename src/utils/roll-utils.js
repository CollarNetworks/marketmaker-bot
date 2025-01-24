const { updatePositionProposal, getNetworkById, getAssetPair } = require('../adapters/collarAPI')
const { getCurrentPrice } = require('../adapters/collarProtocol')
const { BIPS_BASE } = require('../constants')
async function getProposalTermsByPosition(
  position,
  rollsContractAddress,
  price
) {
  const minPrice = (price * 9500n) / BigInt(BIPS_BASE)
  const maxPrice = (price * 10500n) / BigInt(BIPS_BASE)
  const d = new Date()
  d.setMinutes(d.getMinutes() + 15)

  return {
    takerId: Number(position.loanId),
    takerAddress: position.borrower,
    providerNftAddress: position.pairedPosition.providerNFT.contractAddress,
    providerId: position.pairedPosition.providerPosition.positionId,
    rollsContractAddress,
    loansContractAddress: position.loansNFT.contractAddress,
    // terms
    rollFeeAmount: '100',
    rollFeeDeltaFactorBips: 5,
    rollFeeReferencePrice: price.toString(),
    minPrice: minPrice.toString(),
    maxPrice: maxPrice.toString(),
    minToProvider: '100',
    deadline: d,
  }
}


async function handleUpdatePositionProposal(position, proposalId, networkId) {
  const { data: network } = await getNetworkById(networkId)
  const rpcUrl = network.rpcUrl
  const { data: pair } = await getAssetPair(network.id, position.loansNFT.underlying, position.loansNFT.cashAsset)
  const oracleContractAddress = position.pairedPosition.collarTakerNFT.oracle
  const rollsContractAddress = pair.rollsContractAddress
  const price = await getCurrentPrice(rpcUrl, oracleContractAddress)
  let proposalToCreate = await getProposalTermsByPosition(position, rollsContractAddress, price)
  const proposalUpdate = {
    ...proposalToCreate,
    isExecuted: false,
    isAccepted: false,
    status: 'proposed',
  }
  const response = await updatePositionProposal(network.id, proposalId, proposalUpdate);
  const proposal = response.data;
  return proposal
}



module.exports = {
  getProposalTermsByPosition,
  handleUpdatePositionProposal,
}
