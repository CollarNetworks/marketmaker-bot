const LOANS_ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'initialOwner', type: 'address' },
            {
                internalType: 'contract CollarTakerNFT',
                name: '_takerNFT',
                type: 'address',
            },
            { internalType: 'string', name: '_name', type: 'string' },
            { internalType: 'string', name: '_symbol', type: 'string' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [{ internalType: 'address', name: 'target', type: 'address' }],
        name: 'AddressEmptyCode',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'AddressInsufficientBalance',
        type: 'error',
    },
    {
        inputs: [
            { internalType: 'address', name: 'sender', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            { internalType: 'address', name: 'owner', type: 'address' },
        ],
        name: 'ERC721IncorrectOwner',
        type: 'error',
    },
    {
        inputs: [
            { internalType: 'address', name: 'operator', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'ERC721InsufficientApproval',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'approver', type: 'address' }],
        name: 'ERC721InvalidApprover',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'operator', type: 'address' }],
        name: 'ERC721InvalidOperator',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
        name: 'ERC721InvalidOwner',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'receiver', type: 'address' }],
        name: 'ERC721InvalidReceiver',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
        name: 'ERC721InvalidSender',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'ERC721NonexistentToken',
        type: 'error',
    },
    { inputs: [], name: 'EnforcedPause', type: 'error' },
    { inputs: [], name: 'ExpectedPause', type: 'error' },
    { inputs: [], name: 'FailedInnerCall', type: 'error' },
    {
        inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
        name: 'OwnableInvalidOwner',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'OwnableUnauthorizedAccount',
        type: 'error',
    },
    {
        inputs: [
            { internalType: 'uint8', name: 'bits', type: 'uint8' },
            { internalType: 'uint256', name: 'value', type: 'uint256' },
        ],
        name: 'SafeCastOverflowedUintDowncast',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
        name: 'SafeERC20FailedOperation',
        type: 'error',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'value', type: 'uint256' },
            { internalType: 'uint256', name: 'length', type: 'uint256' },
        ],
        name: 'StringsInsufficientHexLength',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'approved',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address',
            },
            { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
        ],
        name: 'ApprovalForAll',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'loanId',
                type: 'uint256',
            },
            { indexed: true, internalType: 'bool', name: 'enabled', type: 'bool' },
        ],
        name: 'ClosingKeeperApproved',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousKeeper',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newKeeper',
                type: 'address',
            },
        ],
        name: 'ClosingKeeperUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'contract ConfigHub',
                name: 'previousConfigHub',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'contract ConfigHub',
                name: 'newConfigHub',
                type: 'address',
            },
        ],
        name: 'ConfigHubUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'escrowId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'toEscrow',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'fromEscrow',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'leftOver',
                type: 'uint256',
            },
        ],
        name: 'EscrowSettled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'loanId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'LoanCancelled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'loanId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'borrower',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'repayment',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'cashAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'underlyingFromSwap',
                type: 'uint256',
            },
        ],
        name: 'LoanClosed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'loanId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'underlyingAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'loanAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'usesEscrow',
                type: 'bool',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'escrowId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'escrowNFT',
                type: 'address',
            },
        ],
        name: 'LoanOpened',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'loanId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'rollId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newLoanId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'prevLoanAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newLoanAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'int256',
                name: 'transferAmount',
                type: 'int256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'escrowId',
                type: 'uint256',
            },
        ],
        name: 'LoanRolled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferStarted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Paused',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'guardian',
                type: 'address',
            },
        ],
        name: 'PausedByGuardian',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'swapper',
                type: 'address',
            },
            { indexed: true, internalType: 'bool', name: 'allowed', type: 'bool' },
            { indexed: true, internalType: 'bool', name: 'setDefault', type: 'bool' },
        ],
        name: 'SwapperSet',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'tokenContract',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amountOrId',
                type: 'uint256',
            },
        ],
        name: 'TokensRescued',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Unpaused',
        type: 'event',
    },
    {
        inputs: [],
        name: 'MAX_SWAP_PRICE_DEVIATION_BIPS',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'VERSION',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'acceptOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'allAllowedSwappers',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'cashAsset',
        outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'loanId', type: 'uint256' },
            {
                components: [
                    { internalType: 'uint256', name: 'minAmountOut', type: 'uint256' },
                    { internalType: 'address', name: 'swapper', type: 'address' },
                    { internalType: 'bytes', name: 'extraData', type: 'bytes' },
                ],
                internalType: 'struct ILoansNFT.SwapParams',
                name: 'swapParams',
                type: 'tuple',
            },
        ],
        name: 'closeLoan',
        outputs: [
            { internalType: 'uint256', name: 'underlyingOut', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'closingKeeper',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'configHub',
        outputs: [
            { internalType: 'contract ConfigHub', name: '', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'defaultSwapper',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'getApproved',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
        name: 'getLoan',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'underlyingAmount',
                        type: 'uint256',
                    },
                    { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
                    { internalType: 'bool', name: 'usesEscrow', type: 'bool' },
                    {
                        internalType: 'contract EscrowSupplierNFT',
                        name: 'escrowNFT',
                        type: 'address',
                    },
                    { internalType: 'uint256', name: 'escrowId', type: 'uint256' },
                ],
                internalType: 'struct ILoansNFT.Loan',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'swapper', type: 'address' }],
        name: 'isAllowedSwapper',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'operator', type: 'address' },
        ],
        name: 'isApprovedForAll',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'sender', type: 'address' },
            { internalType: 'uint256', name: 'loanId', type: 'uint256' },
        ],
        name: 'keeperApprovedFor',
        outputs: [{ internalType: 'bool', name: 'enabled', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'underlyingAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'minLoanAmount', type: 'uint256' },
            {
                components: [
                    { internalType: 'uint256', name: 'minAmountOut', type: 'uint256' },
                    { internalType: 'address', name: 'swapper', type: 'address' },
                    { internalType: 'bytes', name: 'extraData', type: 'bytes' },
                ],
                internalType: 'struct ILoansNFT.SwapParams',
                name: 'swapParams',
                type: 'tuple',
            },
            {
                components: [
                    {
                        internalType: 'contract CollarProviderNFT',
                        name: 'providerNFT',
                        type: 'address',
                    },
                    { internalType: 'uint256', name: 'id', type: 'uint256' },
                ],
                internalType: 'struct ILoansNFT.ProviderOffer',
                name: 'providerOffer',
                type: 'tuple',
            },
            {
                components: [
                    {
                        internalType: 'contract EscrowSupplierNFT',
                        name: 'escrowNFT',
                        type: 'address',
                    },
                    { internalType: 'uint256', name: 'id', type: 'uint256' },
                ],
                internalType: 'struct ILoansNFT.EscrowOffer',
                name: 'escrowOffer',
                type: 'tuple',
            },
            { internalType: 'uint256', name: 'escrowFees', type: 'uint256' },
        ],
        name: 'openEscrowLoan',
        outputs: [
            { internalType: 'uint256', name: 'loanId', type: 'uint256' },
            { internalType: 'uint256', name: 'providerId', type: 'uint256' },
            { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'underlyingAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'minLoanAmount', type: 'uint256' },
            {
                components: [
                    { internalType: 'uint256', name: 'minAmountOut', type: 'uint256' },
                    { internalType: 'address', name: 'swapper', type: 'address' },
                    { internalType: 'bytes', name: 'extraData', type: 'bytes' },
                ],
                internalType: 'struct ILoansNFT.SwapParams',
                name: 'swapParams',
                type: 'tuple',
            },
            {
                components: [
                    {
                        internalType: 'contract CollarProviderNFT',
                        name: 'providerNFT',
                        type: 'address',
                    },
                    { internalType: 'uint256', name: 'id', type: 'uint256' },
                ],
                internalType: 'struct ILoansNFT.ProviderOffer',
                name: 'providerOffer',
                type: 'tuple',
            },
        ],
        name: 'openLoan',
        outputs: [
            { internalType: 'uint256', name: 'loanId', type: 'uint256' },
            { internalType: 'uint256', name: 'providerId', type: 'uint256' },
            { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pauseByGuardian',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pendingOwner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amountOrId', type: 'uint256' },
            { internalType: 'bool', name: 'isNFT', type: 'bool' },
        ],
        name: 'rescueTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'loanId', type: 'uint256' },
            {
                components: [
                    { internalType: 'contract Rolls', name: 'rolls', type: 'address' },
                    { internalType: 'uint256', name: 'id', type: 'uint256' },
                ],
                internalType: 'struct ILoansNFT.RollOffer',
                name: 'rollOffer',
                type: 'tuple',
            },
            { internalType: 'int256', name: 'minToUser', type: 'int256' },
            { internalType: 'uint256', name: 'newEscrowOfferId', type: 'uint256' },
            { internalType: 'uint256', name: 'newEscrowFee', type: 'uint256' },
        ],
        name: 'rollLoan',
        outputs: [
            { internalType: 'uint256', name: 'newLoanId', type: 'uint256' },
            { internalType: 'uint256', name: 'newLoanAmount', type: 'uint256' },
            { internalType: 'int256', name: 'toUser', type: 'int256' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'operator', type: 'address' },
            { internalType: 'bool', name: 'approved', type: 'bool' },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract ConfigHub',
                name: '_newConfigHub',
                type: 'address',
            },
        ],
        name: 'setConfigHub',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'keeper', type: 'address' }],
        name: 'setKeeper',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'loanId', type: 'uint256' },
            { internalType: 'bool', name: 'enabled', type: 'bool' },
        ],
        name: 'setKeeperApproved',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'swapper', type: 'address' },
            { internalType: 'bool', name: 'allow', type: 'bool' },
            { internalType: 'bool', name: 'setDefault', type: 'bool' },
        ],
        name: 'setSwapperAllowed',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'takerNFT',
        outputs: [
            { internalType: 'contract CollarTakerNFT', name: '', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'underlying',
        outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'unpause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
        name: 'unwrapAndCancelLoan',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]


module.exports = {
    LOANS_ABI,
}