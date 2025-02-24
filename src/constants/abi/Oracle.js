const ORACLE_ABI = [
    {
        inputs: [
            { internalType: 'address', name: '_baseToken', type: 'address' },
            { internalType: 'address', name: '_quoteToken', type: 'address' },
            { internalType: 'address', name: '_oracle_1', type: 'address' },
            { internalType: 'bool', name: '_invert_1', type: 'bool' },
            { internalType: 'address', name: '_oracle_2', type: 'address' },
            { internalType: 'bool', name: '_invert_2', type: 'bool' },
            { internalType: 'string', name: 'expectedDescription', type: 'string' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
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
        name: 'VIRTUAL_ASSET',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'baseToken',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'baseUnitAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'quoteTokenAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'atPrice', type: 'uint256' },
        ],
        name: 'convertToBaseAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'baseTokenAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'atPrice', type: 'uint256' },
        ],
        name: 'convertToQuoteAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'currentPrice',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'description',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'inversePrice',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'invert_1',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'invert_2',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'oracle_1',
        outputs: [
            { internalType: 'contract ITakerOracle', name: '', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'oracle_2',
        outputs: [
            { internalType: 'contract ITakerOracle', name: '', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'quoteToken',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'quoteUnitAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'sequencerChainlinkFeed',
        outputs: [
            {
                internalType: 'contract IChainlinkFeedLike',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'atLeast', type: 'uint256' }],
        name: 'sequencerLiveFor',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
]

module.exports = {
    ORACLE_ABI,
}