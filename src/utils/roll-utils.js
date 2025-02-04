const { updatePositionProposal, getNetworkById, getAssetPair } = require('../adapters/collarAPI')
const { getCurrentPrice, previewSettlement, getProtocolFee, getProviderLockedCashFromOracleAndTerms } = require('../adapters/collarProtocol')
const { BIPS_BASE } = require('../constants')


async function getProposalTermsByPosition(
  position,
  rollsContractAddress,
  price,
  newProviderLocked,
  providerSettled,
  protocolFee
) {

  const minPrice = (price * 9500n) / BigInt(BIPS_BASE)
  const maxPrice = (price * 10500n) / BigInt(BIPS_BASE)
  const d = new Date()
  d.setMinutes(d.getMinutes() + 25)
  const rollFee = 100n  // @TODO get roll fee from MM
  d.setMinutes(d.getMinutes() + 15)

  const minToProvider = providerSettled - newProviderLocked + rollFee - protocolFee
  const SLIPPAGE_BIPS = 2n; // 
  const slippageAmount = (minToProvider * SLIPPAGE_BIPS) / 10000n;
  const minToProviderWithSlippage = minToProvider - slippageAmount;
  return {
    takerId: Number(position.loanId),
    takerAddress: position.borrower,
    providerNftAddress: position.pairedPosition.providerNFT.contractAddress,
    providerId: position.pairedPosition.providerPosition.positionId,
    rollsContractAddress,
    loansContractAddress: position.loansNFT.contractAddress,
    // terms
    rollFeeAmount: '100', // get from MM 
    rollFeeDeltaFactorBips: 5,
    rollFeeReferencePrice: price.toString(),
    minPrice: minPrice.toString(),
    maxPrice: maxPrice.toString(),
    minToProvider: minToProviderWithSlippage.toString(),
    deadline: d,
  }
}


async function getProposalToCreateFromPosition(
  network, position
) {
  const rpcUrl = network.rpcUrl
  const { data: pair } = await getAssetPair(network.id, position.loansNFT.underlying, position.loansNFT.cashAsset)
  const oracleContractAddress =
    position.pairedPosition.collarTakerNFT.oracle
  const rollsContractAddress = pair.rollsContractAddress
  const takerContractAddress = pair.takerNFTContractAddress
  const providerContractAddress = pair.providerNFTContractAddress
  const price = await getCurrentPrice(rpcUrl, oracleContractAddress)
  const providerGain = await previewSettlement(
    rpcUrl,
    takerContractAddress,
    position.loanId,
    price
  )
  const oldProviderLocked = BigInt(position.pairedPosition.providerPosition.providerLocked)
  const providerSettled = oldProviderLocked + providerGain
  const { fee: protocolFee } = await getProtocolFee(
    rpcUrl,
    providerContractAddress,
    oldProviderLocked,
    position.pairedPosition.duration
  );

  // Calculate new provider locked amount
  const newProviderLocked = await getProviderLockedCashFromOracleAndTerms(
    oracleContractAddress,
    position.underlyingAmount, // collateral amount
    position.pairedPosition.callStrikePercent,
    position.pairedPosition.putStrikePercent,
    rpcUrl
  );
  let proposalToCreate = await getProposalTermsByPosition(position, rollsContractAddress, price)
  return await getProposalTermsByPosition(
    position,
    rollsContractAddress,
    price,
    newProviderLocked,
    providerSettled,
    protocolFee
  )
}


async function handleUpdatePositionProposal(position, proposalId, networkId) {
  const { data: network } = await getNetworkById(networkId)

  const proposalToCreate = await getProposalToCreateFromPosition(
    network, position
  )
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
  getProposalToCreateFromPosition
}
