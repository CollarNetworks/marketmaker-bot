const PROVIDER_NFT_ABI = [{ "inputs": [{ "internalType": "address", "name": "initialOwner", "type": "address" }, { "internalType": "contract ConfigHub", "name": "_configHub", "type": "address" }, { "internalType": "contract IERC20", "name": "_cashAsset", "type": "address" }, { "internalType": "contract IERC20", "name": "_collateralAsset", "type": "address" }, { "internalType": "address", "name": "_collarTakerContract", "type": "address" }, { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }], "name": "AddressEmptyCode", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "AddressInsufficientBalance", "type": "error" }, { "inputs": [], "name": "ERC721EnumerableForbiddenBatchMint", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }], "name": "ERC721IncorrectOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ERC721InsufficientApproval", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "approver", "type": "address" }], "name": "ERC721InvalidApprover", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "ERC721InvalidOperator", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "ERC721InvalidOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }], "name": "ERC721InvalidReceiver", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "ERC721InvalidSender", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ERC721NonexistentToken", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "ERC721OutOfBoundsIndex", "type": "error" }, { "inputs": [], "name": "EnforcedPause", "type": "error" }, { "inputs": [], "name": "ExpectedPause", "type": "error" }, { "inputs": [], "name": "FailedInnerCall", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "SafeERC20FailedOperation", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "contract ConfigHub", "name": "previousConfigHub", "type": "address" }, { "indexed": false, "internalType": "contract ConfigHub", "name": "newConfigHub", "type": "address" }], "name": "ConfigHubUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "provider", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "putStrikeDeviation", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "callStrikeDeviation", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerId", "type": "uint256" }], "name": "OfferCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "provider", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "previousAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newAmount", "type": "uint256" }], "name": "OfferUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferStarted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "guardian", "type": "address" }], "name": "PausedByGuardian", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "withdrawn", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "expiration", "type": "uint256" }], "name": "PositionCanceled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "putStrikeDeviation", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "callStrikeDeviation", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerId", "type": "uint256" }], "name": "PositionCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "indexed": false, "internalType": "int256", "name": "positionChange", "type": "int256" }, { "indexed": false, "internalType": "uint256", "name": "withdrawable", "type": "uint256" }], "name": "PositionSettled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "tokenContract", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amountOrId", "type": "uint256" }], "name": "TokensRescued", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "withdrawn", "type": "uint256" }], "name": "WithdrawalFromSettled", "type": "event" }, { "inputs": [], "name": "MAX_CALL_STRIKE_BIPS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_PUT_STRIKE_BIPS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MIN_CALL_STRIKE_BIPS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "VERSION", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }], "name": "cancelAndWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "cashAsset", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "collarTakerContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "collateralAsset", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "configHub", "outputs": [{ "internalType": "contract ConfigHub", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "callStrikeDeviation", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "putStrikeDeviation", "type": "uint256" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "createOffer", "outputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }], "name": "getOffer", "outputs": [{ "components": [{ "internalType": "address", "name": "provider", "type": "address" }, { "internalType": "uint256", "name": "available", "type": "uint256" }, { "internalType": "uint256", "name": "putStrikeDeviation", "type": "uint256" }, { "internalType": "uint256", "name": "callStrikeDeviation", "type": "uint256" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "internalType": "struct IProviderPositionNFT.LiquidityOffer", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "positionId", "type": "uint256" }], "name": "getPosition", "outputs": [{ "components": [{ "internalType": "uint256", "name": "expiration", "type": "uint256" }, { "internalType": "uint256", "name": "principal", "type": "uint256" }, { "internalType": "uint256", "name": "putStrikeDeviation", "type": "uint256" }, { "internalType": "uint256", "name": "callStrikeDeviation", "type": "uint256" }, { "internalType": "bool", "name": "settled", "type": "bool" }, { "internalType": "uint256", "name": "withdrawable", "type": "uint256" }], "internalType": "struct IProviderPositionNFT.ProviderPosition", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mintPositionFromOffer", "outputs": [{ "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "components": [{ "internalType": "uint256", "name": "expiration", "type": "uint256" }, { "internalType": "uint256", "name": "principal", "type": "uint256" }, { "internalType": "uint256", "name": "putStrikeDeviation", "type": "uint256" }, { "internalType": "uint256", "name": "callStrikeDeviation", "type": "uint256" }, { "internalType": "bool", "name": "settled", "type": "bool" }, { "internalType": "uint256", "name": "withdrawable", "type": "uint256" }], "internalType": "struct IProviderPositionNFT.ProviderPosition", "name": "position", "type": "tuple" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextOfferId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextPositionId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "pauseByGuardian", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pendingOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "rescueTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ConfigHub", "name": "_newConfigHub", "type": "address" }], "name": "setConfigHub", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "internalType": "int256", "name": "positionChange", "type": "int256" }], "name": "settlePosition", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "internalType": "uint256", "name": "newAmount", "type": "uint256" }], "name": "updateOfferAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "positionId", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }], "name": "withdrawFromSettled", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]


module.exports = {
    PROVIDER_NFT_ABI
}