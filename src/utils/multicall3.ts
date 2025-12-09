import { ethers } from 'ethers';
import multicallContracts from '@/config/contract/multicall';

// Multicall3 ABI - Only includes the methods we need
const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'callData', type: 'bytes' }
        ],
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate',
    outputs: [
      { name: 'blockNumber', type: 'uint256' },
      { name: 'returnData', type: 'bytes[]' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' }
        ],
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' }
        ],
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' }
        ],
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' }
        ],
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  }
];

// Type definitions
export interface Call {
  target: string;
  callData: string;
}

export interface Call3 {
  target: string;
  allowFailure: boolean;
  callData: string;
}

export interface Call3Value extends Call3 {
  value: string;
}

export interface Result {
  success: boolean;
  returnData: string;
}

export interface AggregateResult {
  blockNumber: string;
  returnData: string[];
}

export interface Multicall3Options {
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Multicall3 Utility Class
 * Provides functionality for batch calling smart contract methods
 */
export class Multicall3 {
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(provider: ethers.Provider, chainId: number) {
    this.provider = provider;
    
    const multicallAddress = multicallContracts[chainId];
    if (!multicallAddress) {
      throw new Error(`Multicall3 contract not found for chain ID: ${chainId}`);
    }

    this.contract = new ethers.Contract(multicallAddress, MULTICALL3_ABI, provider);
  }

  /**
   * Batch call contract methods (aggregate)
   * @param calls Array of calls
   * @param options Optional parameters
   * @returns Array of results
   */
  async aggregate(
    calls: Call[],
    options?: Multicall3Options
  ): Promise<AggregateResult> {
    try {
      const overrides: any = {};
      if (options?.gasLimit) overrides.gasLimit = options.gasLimit;
      if (options?.gasPrice) overrides.gasPrice = options.gasPrice;
      if (options?.maxFeePerGas) overrides.maxFeePerGas = options.maxFeePerGas;
      if (options?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = options.maxPriorityFeePerGas;

      const result = await this.contract.aggregate.staticCall(calls, overrides);
      
      return {
        blockNumber: result.blockNumber.toString(),
        returnData: result.returnData
      };
    } catch (error) {
      throw new Error(`Multicall3 aggregate failed: ${error}`);
    }
  }

  /**
   * Batch call contract methods (aggregate3) - Supports failure tolerance
   * @param calls Array of calls
   * @param options Optional parameters
   * @returns Array of results
   */
  async aggregate3(
    calls: Call3[],
    options?: Multicall3Options
  ): Promise<Result[]> {
    try {
      const overrides: any = {};
      if (options?.gasLimit) overrides.gasLimit = options.gasLimit;
      if (options?.gasPrice) overrides.gasPrice = options.gasPrice;
      if (options?.maxFeePerGas) overrides.maxFeePerGas = options.maxFeePerGas;
      if (options?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = options.maxPriorityFeePerGas;

      const result = await this.contract.aggregate3.staticCall(calls, overrides);
      
      return result.map((item: any) => ({
        success: item.success,
        returnData: item.returnData
      }));
    } catch (error) {
      throw new Error(`Multicall3 aggregate3 failed: ${error}`);
    }
  }

  /**
   * Batch call contract methods (aggregate3Value) - Supports ETH transfers
   * @param calls Array of calls
   * @param options Optional parameters
   * @returns Array of results
   */
  async aggregate3Value(
    calls: Call3Value[],
    options?: Multicall3Options
  ): Promise<Result[]> {
    try {
      const overrides: any = {};
      if (options?.gasLimit) overrides.gasLimit = options.gasLimit;
      if (options?.gasPrice) overrides.gasPrice = options.gasPrice;
      if (options?.maxFeePerGas) overrides.maxFeePerGas = options.maxFeePerGas;
      if (options?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = options.maxPriorityFeePerGas;

      const result = await this.contract.aggregate3Value.staticCall(calls, overrides);
      
      return result.map((item: any) => ({
        success: item.success,
        returnData: item.returnData
      }));
    } catch (error) {
      throw new Error(`Multicall3 aggregate3Value failed: ${error}`);
    }
  }

  /**
   * Batch get ERC20 token balances
   * @param tokenAddresses Array of token contract addresses
   * @param accountAddress Account address
   * @returns Array of balances
   */
  async getTokenBalances(
    tokenAddresses: string[],
    accountAddress: string
  ): Promise<string[]> {
    const calls: Call[] = tokenAddresses.map(tokenAddress => ({
      target: tokenAddress,
      callData: ethers.Interface.from([
        'function balanceOf(address owner) view returns (uint256)'
      ]).encodeFunctionData('balanceOf', [accountAddress])
    }));

    const result = await this.aggregate(calls);
    
    return result.returnData.map(data => {
      const decoded = ethers.Interface.from([
        'function balanceOf(address owner) view returns (uint256)'
      ]).decodeFunctionResult('balanceOf', data);
      return decoded[0].toString();
    });
  }

  /**
   * Batch get ERC20 token information
   * @param tokenAddresses Array of token contract addresses
   * @returns Array of token information
   */
  async getTokenInfo(tokenAddresses: string[]): Promise<Array<{
    name: string;
    symbol: string;
    decimals: number;
  }>> {
    const calls: Call[] = [];
    
    // Add name, symbol, decimals calls for each token
    tokenAddresses.forEach(tokenAddress => {
      const erc20Interface = ethers.Interface.from([
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)'
      ]);

      calls.push(
        { target: tokenAddress, callData: erc20Interface.encodeFunctionData('name') },
        { target: tokenAddress, callData: erc20Interface.encodeFunctionData('symbol') },
        { target: tokenAddress, callData: erc20Interface.encodeFunctionData('decimals') }
      );
    });

    const result = await this.aggregate(calls);
    const erc20Interface = ethers.Interface.from([
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)'
    ]);

    const tokenInfos = [];
    for (let i = 0; i < tokenAddresses.length; i++) {
      const nameData = result.returnData[i * 3];
      const symbolData = result.returnData[i * 3 + 1];
      const decimalsData = result.returnData[i * 3 + 2];

      try {
        const name = erc20Interface.decodeFunctionResult('name', nameData)[0];
        const symbol = erc20Interface.decodeFunctionResult('symbol', symbolData)[0];
        const decimals = erc20Interface.decodeFunctionResult('decimals', decimalsData)[0];

        tokenInfos.push({
          name,
          symbol,
          decimals: Number(decimals)
        });
      } catch (error) {
        // If token info retrieval fails, use default values
        tokenInfos.push({
          name: 'Unknown',
          symbol: 'UNKNOWN',
          decimals: 18
        });
      }
    }

    return tokenInfos;
  }

  /**
   * Batch check token allowances
   * @param tokenAddresses Array of token contract addresses
   * @param ownerAddress Owner address
   * @param spenderAddress Spender address
   * @returns Array of allowances
   */
  async getTokenAllowances(
    tokenAddresses: string[],
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string[]> {
    const calls: Call[] = tokenAddresses.map(tokenAddress => ({
      target: tokenAddress,
      callData: ethers.Interface.from([
        'function allowance(address owner, address spender) view returns (uint256)'
      ]).encodeFunctionData('allowance', [ownerAddress, spenderAddress])
    }));

    const result = await this.aggregate(calls);
    
    return result.returnData.map(data => {
      const decoded = ethers.Interface.from([
        'function allowance(address owner, address spender) view returns (uint256)'
      ]).decodeFunctionResult('allowance', data);
      return decoded[0].toString();
    });
  }

  /**
   * Get current block number
   * @returns Block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Check if Multicall3 contract is available
   * @returns Whether available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.contract.getAddress();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Convenience function to create Multicall3 instance
 * @param provider ethers Provider instance
 * @param chainId Chain ID
 * @returns Multicall3 instance
 */
export function createMulticall3(provider: ethers.Provider, chainId: number): Multicall3 {
  return new Multicall3(provider, chainId);
}

/**
 * Convenience function for batch calling contract methods
 * @param provider ethers Provider instance
 * @param chainId Chain ID
 * @param calls Array of calls
 * @param options Optional parameters
 * @returns Result
 */
export async function batchCall(
  provider: ethers.Provider,
  chainId: number,
  calls: Call[],
  options?: Multicall3Options
): Promise<AggregateResult> {
  const multicall = createMulticall3(provider, chainId);
  return await multicall.aggregate(calls, options);
}

/**
 * Convenience function for batch calling contract methods (supports failure tolerance)
 * @param provider ethers Provider instance
 * @param chainId Chain ID
 * @param calls Array of calls
 * @param options Optional parameters
 * @returns Result
 */
export async function batchCall3(
  provider: ethers.Provider,
  chainId: number,
  calls: Call3[],
  options?: Multicall3Options
): Promise<Result[]> {
  const multicall = createMulticall3(provider, chainId);
  return await multicall.aggregate3(calls, options);
}
