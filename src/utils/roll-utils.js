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

module.exports = {
  getProposalTermsByPosition,
}
