# StableFlow SDK - Developer Guide

This guide helps developers integrate StableFlow features, including the HTTP-only API flow, the full bridge integration flow, and Hyperliquid deposit.

## Table of Contents

1. [Overview](#1-overview)
   - [1.1 Introduction](#11-introduction)
   - [1.2 Migration Guide](#12-migration-guide)
2. [Getting Started](#2-getting-started)
   - [2.1 Installation](#21-installation)
   - [2.2 Configuration](#22-configuration)
   - [2.3 API Integration Flow](#23-api-integration-flow)
   - [2.4 Full Integration Flow](#24-full-integration-flow)
   - [2.5 Hyperliquid](#25-hyperliquid)
3. [API Reference](#3-api-reference)
   - [3.1 Overview](#31-overview)
   - [3.2 API Reference](#32-api-reference)
     - [3.2.1 API Integration Flow](#321-api-integration-flow)
     - [3.2.2 Full Integration Flow](#322-full-integration-flow)
     - [3.2.3 Hyperliquid](#323-hyperliquid)
4. [Advanced](#4-advanced)
   - [4.1 Recommended Use of the `dry` Flag](#41-recommended-use-of-the-dry-flag)
   - [4.2 `oneclickParams`](#42-oneclickparams)
   - [4.3 approve](#43-approve)
   - [4.4 permit signature](#44-permit-signature)
   - [4.5 Error Handling](#45-error-handling)


## 1. Overview

Fast, secure, and built for transfers at scale.

### 1.1 Introduction

A comprehensive guide for developers to integrate StableFlow's crosschain transfers into your applications.

#### Features

##### Solver-based

A decentralised network of professional market makers competes to fill your order. When native protocol rails offer better execution, StableFlow routes there instead. Deep liquidity, across every transfer size.
Transfer leading stablecoins including USDT, USDC, and frxUSD across 12+ chains.

##### Smart Routing

Transfers between different assets on different chains can require bridging, redeeming, minting, and converting across multiple protocols. StableFlow sequences these steps using pre-signed authorisations. You confirm once. The rest executes automatically.

##### Competitive at any size

Low Fees, from 1 basis point(0.01%), 0 slippage via native rails and Near Intents, transfer size competitive from $1 to $1M+, 20+ including Ethereum, Solana, NEAR, Tron, and Aptos.

##### Customizable

StableFlow SDK is not a fixed all-in-one bundle. You can install only `@stableflow/core` for HTTP quotes, deposit addresses, and status checks. You can combine `@stableflow/bridges` with the wallet adapters you need to build a full multi-chain flow across EVM, Solana, NEAR, Tron, Aptos, Sui, TON, and more. If your product only needs Hyperliquid deposits, `@stableflow/hyperliquid` provides a focused integration surface.

The package split lets teams adopt StableFlow gradually. Use `dry: true` for fast previews and route comparison, switch to `dry: false` for executable deposit parameters, enable app fees, proxy deposit addresses, permit signatures, or custom RPC endpoints only when your business needs them. Wallets, exchanges, OTC desks, payment products, and cross-chain DApps can use StableFlow either as a lightweight API client or as a complete cross-chain execution layer.

#### Community

For questions or support, visit:

* [Github Repository](https://github.com/stableflow-ai/stableflow-sdk)
* [Discord](https://discord.gg/stableflow)
* [X](https://twitter.com/stableflowai)

### 1.2 Migration Guide

#### Migrating from v1.x

If you are migrating from v1.x, install `@stableflow/core` and import the methods you need from it.

The v1.x APIs `OpenAPI`, `SFA.getTokens()`, `SFA.getQuote()`, `SFA.submitDepositTx()`, and `SFA.getExecutionStatus()` are now in `@stableflow/core`.

#### Migrating from v2.x

If you are migrating from v2.x, note the following changes:

The previous `stableflow-ai-sdk` package has been moved into the `@stableflow/` organization and split by responsibility. The old `stableflow-ai-sdk` package now acts as an aggregate entry that pulls in `@stableflow/*` packages and upgrades from v2.x to v3.x. It will not continue to be maintained, so new integrations should migrate to `@stableflow/*`.

The v2.x methods `SFA.getAllQuote()`, `SFA.send()`, and `SFA.getStatus()` are now in `@stableflow/bridges`:

```typescript
import { BridgeSFA } from "@stableflow/bridges";

BridgeSFA.getAllQuote();
BridgeSFA.send();
BridgeSFA.getStatus();
```

**Breaking change: `BridgeSFA.getStatus` parameters**

In v2.x (`stableflow-ai-sdk`), `SFA.getStatus` accepted optional `depositAddress` and `hash`:

```typescript
// v2.x
await SFA.getStatus(serviceType, {
  depositAddress?: string;
  hash?: string;
});
```

In v3.x (`@stableflow/bridges`), `BridgeSFA.getStatus` requires the same `quote` object you passed to `send` and a required `hash`:

```typescript
// v3.x
await BridgeSFA.getStatus(serviceType, {
  quote: any;   // same quote object passed to send
  hash: string; // source-chain tx hash from send (required)
});
```

- Do not pass `depositAddress` manually; v3 derives deposit-address vs hash behavior from `quote` via `getQuoteModes`.
- `hash` changed from optional to **required**.
- Persist the same `quote` from `getAllQuote({ dry: false })` that you passed to `send` for polling.

**Before (v2.x):**

```typescript
await SFA.getStatus(serviceType, {
  depositAddress: quote.quote.depositAddress,
  hash: txHash,
});
```

**After (v3.x):**

```typescript
await BridgeSFA.getStatus(serviceType, {
  quote: finalRoute.quote,
  hash: txHash,
});
```

The v2.x Hyperliquid flow is now in `@stableflow/hyperliquid`:

```typescript
import { Hyperliquid } from "@stableflow/hyperliquid";

Hyperliquid.quote();
Hyperliquid.transfer();
Hyperliquid.deposit();
Hyperliquid.getStatus();
```

#### Wallet adapters (`stableflow-ai-sdk` → `@stableflow/wallet-*`)

In v2.x, chain wallet classes were exported from the single `stableflow-ai-sdk` package. In v3.x they live in **per-chain packages**. Install only the adapters your app supports (for example `@stableflow/wallet-evm` for EVM-only flows).


| v2.x import (`stableflow-ai-sdk`) | v3.x package                | v3.x import                                                |
| --------------------------------- | --------------------------- | ---------------------------------------------------------- |
| `EVMWallet`                       | `@stableflow/wallet-evm`    | `import { EVMWallet } from "@stableflow/wallet-evm"`       |
| `SolanaWallet`                    | `@stableflow/wallet-solana` | `import { SolanaWallet } from "@stableflow/wallet-solana"` |
| `NearWallet`                      | `@stableflow/wallet-near`   | `import { NearWallet } from "@stableflow/wallet-near"`     |
| `TronWallet`                      | `@stableflow/wallet-tron`   | `import { TronWallet } from "@stableflow/wallet-tron"`     |
| `AptosWallet`                     | `@stableflow/wallet-aptos`  | `import { AptosWallet } from "@stableflow/wallet-aptos"`   |
| `SuiWallet`                       | `@stableflow/wallet-sui`    | `import { SuiWallet } from "@stableflow/wallet-sui"`       |
| `TonWallet`                       | `@stableflow/wallet-ton`    | `import { TonWallet } from "@stableflow/wallet-ton"`       |


**Before (v2.x):**

```typescript
import { EVMWallet } from "stableflow-ai-sdk";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const wallet = new EVMWallet(provider, signer);
```

**After (v3.x):**

```bash
pnpm add @stableflow/wallet-evm @stableflow/core @stableflow/bridges
```

```typescript
import { EVMWallet } from "@stableflow/wallet-evm";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const wallet = new EVMWallet(provider, signer);

const walletConfig = wallet;
```

The constructor APIs for each adapter are unchanged; only the import path and package install step differ. Each package also supports a default export (for example `import EVMWallet from "@stableflow/wallet-evm"`).

For React demos, see the `examples/demo-*` apps (for example `[examples/demo-evm](examples/demo-evm)` for wagmi + `EVMWallet`, `[examples/demo-solana](examples/demo-solana)` for `SolanaWallet`).

## 2. Getting Started

### 2.1 Installation

```bash
# npm
npm install @stableflow/core

# pnpm
pnpm add @stableflow/core

# yarn
yarn add @stableflow/core
```

StableFlow includes the following packages:

| Package | Role |
|---------|------|
| `@stableflow/core` | API client, models, token/chain config, `SFA` |
| `@stableflow/bridges` | `BridgeSFA`, `ServiceMap`, all bridge route implementations |
| `@stableflow/wallet-*` | Per-chain `WalletConfig` adapters for sign, send, approve, and quote simulation |
| `@stableflow/utils-*` | Internal RPC and protocol helpers |
| `@stableflow/hyperliquid` | Hyperliquid deposit flow on top of OneClick and Arbitrum USDC permit |

**Typical integration paths**

For HTTP-only access, such as simple OneClick quote and status checks, `SFA` from `@stableflow/core` is sufficient.

For a full bridge integration:

- Install `@stableflow/core`, `@stableflow/bridges`, and the wallet package or packages for your supported chains.
- Connect your wallet layer and instantiate the required `@stableflow/wallet-*` adapters.
- Call `BridgeSFA.getAllQuote` with `dry: true` to compare routes quickly.
- Re-quote the chosen route with `dry: false`, then call `BridgeSFA.send`.
- Call `BridgeSFA.getStatus` to read the result.

#### Reading Path and Security Notes

Start with [section 2.3](#23-api-integration-flow) if you only need HTTP APIs (method details in [section 3.2.1](#321-api-integration-flow)). Read [section 2.4](#24-full-integration-flow) and [sections 4.3–4.5](#43-approve) if your app connects wallets, compares routes, approves tokens, signs permits, and sends transactions directly (bridge API details in [section 3.2.2](#322-full-integration-flow)). Read [section 2.5](#25-hyperliquid) for Hyperliquid-only flows ([section 3.2.3](#323-hyperliquid)).

Do not commit JWT tokens, WalletConnect project IDs, or private RPC URLs. The examples use `.env.local`; production deployments should inject these values through a backend or a secret manager.

### 2.2 Configuration

#### Authentication

**JWT Token**: Required for API access.

**👉 [Apply for JWT Token](https://docs.google.com/forms/u/3/d/e/1FAIpQLSdTeV7UaZ1MiFxdJ2jH_PU60PIN3iqYJ1WXEOFY45TsAy6O5g/viewform)**

After receiving the token, set it before API calls:

```typescript
import { OpenAPI } from "@stableflow/core";

OpenAPI.TOKEN = "your-jwt-token";
```

#### RPC URLs (optional)

Bridge quotes and sends may read chain state, including balances, gas, and ATA existence. Override RPC endpoints if needed:

```typescript
import { setRpcUrls } from "@stableflow/core";

setRpcUrls({
  eth: ["https://your-eth-rpc.example.com"],
  arb: ["https://your-arb-rpc.example.com"],
  sol: ["https://your-solana-rpc.example.com"],
});
```

Use `getChainRpcUrl(chainKey)` to read the active URL or URLs for a chain.

#### Debug Logs (optional)

```typescript
import { OpenAPI } from "@stableflow/core";

OpenAPI.DEBUG = true;
```

### 2.3 API Integration Flow

Use this flow when you only need OneClick cross-chain transfers and already have your own wallet or transaction-sending logic. Install `@stableflow/core`, request a quote with `SFA.getQuote({ dry: false, ... })`, send the quoted amount to the returned `depositAddress`, optionally submit the deposit transaction hash, and poll status.

`SFA.getQuote` uses basis points for `QuoteRequest.slippageTolerance`. For example, `50` means `0.5%`. By contrast, the bridge and Hyperliquid examples use `0.5` to mean `0.5%`; those packages convert the value internally for OneClick routes.

```typescript
import {
  QuoteRequest,
  SFA,
  type QuoteResponse,
  type TokenResponse,
  OneClickStatus,
} from "@stableflow/core";

const [tokens, setTokens] = useState<TokenResponse[]>([]);
const [quote, setQuote] = useState<QuoteResponse | null>(null);

const all = await SFA.getTokens();
setTokens(filterEvmTokens(all));

const quoteRes = await SFA.getQuote({
  dry: false,
  swapType: QuoteRequest.swapType.EXACT_INPUT,
  slippageTolerance: 50,
  originAsset: fromToken.assetId,
  destinationAsset: toToken.assetId,
  amount: "1000000",
  refundTo: "0x...",
  refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
  recipient: "0x...",
  recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
  depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
  deadline: new Date(Date.now() + 3600_000).toISOString(),
});
setQuote(quoteRes);

if (!quoteRes.quote.depositAddress) {
  throw new Error("Missing deposit address");
}

const tokenContract = new Contract(
  fromToken.contractAddress,
  ["function transfer(address to, uint256 amount) returns (bool)"],
  signer
);
const tx = await tokenContract.transfer(quoteRes.quote.depositAddress, "1000000");

await SFA.submitDepositTx({
  txHash: tx.hash,
  depositAddress: quoteRes.quote.depositAddress,
});

const status = await SFA.getExecutionStatus(quoteRes.quote.depositAddress, quoteRes.quote.depositMemo);
if (
  [
    OneClickStatus.PENDING_DEPOSIT,
    OneClickStatus.KNOWN_DEPOSIT_TX,
    OneClickStatus.INCOMPLETE_DEPOSIT,
    OneClickStatus.PROCESSING,
  ].includes(status.status)
) {
  // Still processing.
}
if (status.status === OneClickStatus.SUCCESS) {
  // Success.
}
if (
  [
    OneClickStatus.FAILED,
    OneClickStatus.REFUNDED,
  ].includes(status.status)
) {
  // Failed or refunded.
}
```

See the runnable example at [demo-simple](https://github.com/stableflow-ai/stableflow-sdk/tree/main/examples/demo-simple/README.md).

For method signatures and parameter tables, see [section 3.2.1](#321-api-integration-flow).

### 2.4 Full Integration Flow

The full integration flow uses `@stableflow/core`, `@stableflow/bridges`, and the required `@stableflow/wallet-*` adapters. Use it when your app needs to connect wallets, compare multiple routes, approve tokens, sign permits, send transactions, and poll status.

See the runnable full demo at [demo-full](https://github.com/stableflow-ai/stableflow-sdk/tree/main/examples/demo-full/README.md). The main app code is in `stableflow/examples/demo-full/src/App.tsx`.

#### Run demo-full

From the monorepo root `stableflow/`:

```bash
pnpm install
pnpm build
pnpm dev:demo-full
```

The dev server runs at `http://localhost:3011`.

```env
VITE_STABLEFLOW_JWT_TOKEN=your-jwt-here
VITE_WALLET_CONNECT_PROJECT_ID=your-walletconnect-project-id
```

#### Integration Steps

1. Read `tokens` from `@stableflow/core` and filter by `chainType`, `symbol`, or `services`.
2. Connect the source-chain wallet and adapt it to `WalletConfig`.
3. Build `GetAllQuoteParams` and call `BridgeSFA.getAllQuote`.
4. In production, quote first with `dry: true`, then re-quote the selected `singleService` with `dry: false`.
5. Filter routes where `quote && !error`, then choose by output, fees, time estimate, or business preference.
6. If `quote.needPermit`, generate a permit signature. If `quote.needApprove`, approve first.
7. Call `BridgeSFA.send(serviceType, { wallet, quote, permitSignature })`.
8. Poll `BridgeSFA.getStatus(serviceType, { quote, hash })`. Persist the same `quote` object you passed to `send` (for example in your transaction record or local storage) so later polls can rebuild service-specific status query fields.

```typescript
import Big from "big.js";
import { BridgeSFA, getQuoteModes, type GetAllQuoteParams } from "@stableflow/bridges";
import { EVMWallet } from "@stableflow/wallet-evm";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const fromWalletAddress = await signer.getAddress();
const fromWallet = new EVMWallet(provider, signer);

const quoteRequest: GetAllQuoteParams = {
  dry: true,
  prices,
  fromToken,
  toToken,
  wallet: fromWallet,
  recipient,
  refundTo: fromWalletAddress,
  amountWei: Big(amount).times(10 ** fromToken.decimals).toFixed(0, 0),
  slippageTolerance: 0.5,
  oneclickParams: {
    appFees: [{ recipient: "stableflow.near", fee: 100 }],
  },
};

const previews = await BridgeSFA.getAllQuote(quoteRequest);
const best = previews.find((item) => item.quote && !item.error);
if (!best) throw new Error("No valid route");

const [finalRoute] = await BridgeSFA.getAllQuote({
  ...quoteRequest,
  dry: false,
  singleService: best.serviceType,
});

const { isExactOutput } = getQuoteModes({
  quoteData: finalRoute.quote,
  bridgeStore: { quoteDataService: finalRoute.serviceType },
});
const amountToApprove = isExactOutput
  ? finalRoute.quote.quote?.minAmountIn
  : finalRoute.quote.quoteParam.amountWei;

const txHash = await BridgeSFA.send(finalRoute.serviceType, {
  wallet: fromWallet,
  quote: finalRoute.quote,
  permitSignature,
});

await BridgeSFA.getStatus(finalRoute.serviceType, {
  quote: finalRoute.quote,
  hash: txHash,
});
```

For method signatures and parameter tables, see [section 3.2.2](#322-full-integration-flow).

### 2.5 Hyperliquid

`@stableflow/hyperliquid` wraps the flow from an EVM source asset to OneClick, then to Arbitrum USDC, then to Hyperliquid deposit. Use it when your product only needs Hyperliquid deposits.

See the runnable demo at [demo-hyperliquid](https://github.com/stableflow-ai/stableflow-sdk/tree/main/examples/demo-hyperliquid/README.md). The main app code is in `stableflow/examples/demo-hyperliquid/src/App.tsx`.

#### Run demo-hyperliquid

```bash
pnpm dev:demo-hyperliquid
```

The dev server runs at `http://localhost:3010`.

```env
VITE_STABLEFLOW_JWT_TOKEN=your-jwt
VITE_WALLET_CONNECT_PROJECT_ID=your-walletconnect-project-id
```

#### Integration Steps

1. Pick a source token from `HyperliquidFromTokens`.
2. Use `HyperliuquidMinAmount` to validate the minimum deposit amount. It is denominated in the smallest unit of `HyperliuquidToToken`.
3. Debounce `Hyperliquid.quote({ dry: true })` for preview. The default is `dry: true`.
4. If the quote returns `needApprove`, approve the source token and quote again.
5. On user confirmation, call `Hyperliquid.quote({ dry: false })`.
6. Call `Hyperliquid.transfer` to send the source-chain deposit and get `txhash`.
7. Switch to Arbitrum and call `Hyperliquid.deposit`. It signs an Arbitrum USDC EIP-2612 permit internally and registers the deposit.
8. Poll `Hyperliquid.getStatus({ depositId })`.

```typescript
import Big from "big.js";
import {
  Hyperliquid,
  HyperliquidFromTokens,
  HyperliuquidMinAmount,
  HyperliuquidToToken,
} from "@stableflow/hyperliquid";
import { EVMWallet } from "@stableflow/wallet-evm";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();
const fromWallet = new EVMWallet(provider, signer);

const fromToken = HyperliquidFromTokens.find((token) => token.chainType === "evm");
const amountWei = Big(amount).times(10 ** fromToken.decimals).toFixed(0, 0);

if (Big(amountWei).lt(HyperliuquidMinAmount)) {
  throw new Error(`Min amount is ${HyperliuquidMinAmount}`);
}

const quoteParams = {
  slippageTolerance: 0.5,
  refundTo: address,
  // This example only shows usage for EVM chains; for other chains, pass the destination chain address.
  recipient: address,
  wallet: fromWallet,
  fromToken,
  prices,
  amountWei,
};

const preview = await Hyperliquid.quote({
  ...quoteParams,
  dry: true,
});

if (preview.error) throw new Error(preview.error);

const finalQuote = await Hyperliquid.quote({
  ...quoteParams,
  dry: false,
});
if (!finalQuote.quote) throw new Error(finalQuote.error || "No quote");

const txhash = await Hyperliquid.transfer({
  wallet: fromWallet,
  evmWallet: fromWallet,
  evmWalletAddress: address,
  quote: finalQuote.quote,
});

const depositRes = await Hyperliquid.deposit({
  txhash,
  wallet: fromWallet,
  evmWallet: fromWallet,
  evmWalletAddress: address,
  quote: finalQuote.quote,
});

const status = await Hyperliquid.getStatus({
  depositId: String(depositRes.data.depositId),
});
```

For method signatures and parameter tables, see [section 3.2.3](#323-hyperliquid).

## 3. API Reference

### 3.1 Overview

Sections [2.3](#23-api-integration-flow)–[2.5](#25-hyperliquid) walk through integration flows. Method signatures, parameters, and return types are documented in [section 3.2](#32-api-reference).

### 3.2 API Reference

#### 3.2.1 API Integration Flow

##### @stableflow/core SFA.getTokens()

```typescript
SFA.getTokens(): CancelablePromise<TokenResponse[]>
```

| Return field | Type | Description |
|--------------|------|-------------|
| `assetId` | `string` | StableFlow asset ID used by `originAsset` and `destinationAsset`. |
| `decimals` | `number` | Token decimals. Amounts should be passed in the smallest unit. |
| `blockchain` | `TokenResponse.blockchain` | Chain key, such as `eth`, `arb`, `sol`, or `tron`. |
| `symbol` | `string` | Token symbol. |
| `price` | `number` | Current USD price. |
| `priceUpdatedAt` | `string` | Price update timestamp. |
| `contractAddress` | `string \| undefined` | Token contract address when applicable. |

##### @stableflow/core SFA.getQuote()

```typescript
SFA.getQuote(requestBody: QuoteRequest): CancelablePromise<QuoteResponse>
```

The table below follows the current `@stableflow/core` `QuoteRequest` type and adds semantic details from the [Near Intents OneClick Request a swap quote](https://docs.near-intents.org/api-reference/oneclick/request-a-swap-quote) reference. Upstream OneClick may support additional fields before the generated SDK types expose them. Prefer the installed SDK types unless you intentionally extend the request through a custom request layer.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dry` | `boolean` | Yes | `true` for preview. `false` returns executable deposit parameters. |
| `depositMode` | `SIMPLE \| MEMO` | No | Deposit address mode. Usually defaults to `SIMPLE`. `MEMO` requires both `depositAddress` and `depositMemo`, for example on memo-based chains. |
| `swapType` | `EXACT_INPUT \| EXACT_OUTPUT \| FLEX_INPUT` | Yes | How to interpret `amount`. See the detailed semantics below. |
| `slippageTolerance` | `number` | Yes | Slippage in basis points. `100` means `1%`. |
| `originAsset` | `string` | Yes | Source asset ID. |
| `depositType` | `ORIGIN_CHAIN \| INTENTS` | Yes | Deposit address type. |
| `destinationAsset` | `string` | Yes | Destination asset ID. |
| `amount` | `string` | Yes | Integer string in the token's smallest unit. Do not pass decimal strings like `"0.01"`. |
| `refundTo` | `string` | Yes | Refund address. |
| `refundType` | `ORIGIN_CHAIN \| INTENTS` | Yes | Refund address type. |
| `recipient` | `string` | Yes | Recipient address matching `recipientType`. |
| `virtualChainRecipient` | `string` | No | EVM recipient for virtual-chain flows. |
| `virtualChainRefundRecipient` | `string` | No | EVM refund recipient for virtual-chain flows. |
| `recipientType` | `DESTINATION_CHAIN \| INTENTS` | Yes | Recipient address type. |
| `deadline` | `string` | Yes | ISO timestamp after which refund handling may begin. It must be later than the expected source-chain deposit confirmation time. Chains such as Bitcoin may need a longer deadline. |
| `quoteWaitingTimeMs` | `number` | No | How long to wait for relay quotes. Defaults to `0`, meaning return the fastest quote as soon as possible. |
| `appFees` | `AppFee[]` | No | OneClick app fee configuration. |

`swapType` details:

| Value | Description |
|-------|-------------|
| `EXACT_INPUT` | `amount` is the fixed input amount. Deposits below `amountIn` are refunded after the deadline; deposits above `amountIn` are processed and the excess is refunded to `refundTo`. |
| `EXACT_OUTPUT` | `amount` is the fixed output amount. The returned `amountIn` usually includes a slippage buffer, while `minAmountIn` is the minimum required input. Excess input is refunded to `refundTo`; deposits below `minAmountIn` are refunded after the deadline. |
| `FLEX_INPUT` | Allows flexible input and partial deposits. Slippage applies to both `minAmountIn` and `minAmountOut`. Use it for variable deposit flows. |

| Return field | Type | Description |
|--------------|------|-------------|
| `correlationId` | `string` | Upstream OneClick request tracing ID. The current SDK type may not declare it explicitly, but the response may include it and it is useful for debugging. |
| `timestamp` | `string` | Quote timestamp. |
| `signature` | `string` | StableFlow signature for the quote and deposit address. Store it with the quote. |
| `quoteRequest` | `QuoteRequest` | Request body used by the service. |
| `quote` | `Quote` | Quote details. |

Important `Quote` fields:

| Field | Type | Description |
|-------|------|-------------|
| `depositAddress` | `string \| undefined` | Returned when `dry: false`. |
| `depositMemo` | `string \| undefined` | Required by some chains together with `depositAddress`. |
| `amountIn` / `amountInFormatted` / `amountInUsd` | `string` | Input amount fields. |
| `minAmountIn` | `string` | Minimum input amount after slippage, often used by exact-output routes. |
| `amountOut` / `amountOutFormatted` / `amountOutUsd` | `string` | Output amount fields. |
| `minAmountOut` | `string` | Minimum output after slippage. |
| `deadline` | `string \| undefined` | Deposit address expiration time. Returned when `dry: false`. |
| `timeWhenInactive` | `string \| undefined` | Time when the deposit address becomes cold. Returned when `dry: false`. |
| `timeEstimate` | `number` | Estimated execution time in seconds after deposit confirmation. |
| `customRecipientMsg` | `string \| undefined` | NEAR `ft_transfer_call` message. Experimental. |
| `refundFee` | `string \| undefined` | Fee charged for refunding assets to `refundTo`, denominated in the smallest unit of the origin asset. |

##### @stableflow/core SFA.submitDepositTx()

```typescript
SFA.submitDepositTx(body: SubmitDepositTxRequest): CancelablePromise<SubmitDepositTxResponse>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `txHash` | `string` | Yes | Source-chain transaction hash sent to the deposit address. |
| `depositAddress` | `string` | Yes | Deposit address from `SFA.getQuote({ dry: false })`. |

The response includes `quoteResponse`, `status`, `updatedAt`, and `swapDetails`. Calling this method helps the service associate the deposit transaction sooner.

##### @stableflow/core SFA.getExecutionStatus()

```typescript
SFA.getExecutionStatus(
  depositAddress: string,
  depositMemo?: string
): CancelablePromise<GetExecutionStatusResponse>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `depositAddress` | `string` | Yes | Deposit address from the quote. |
| `depositMemo` | `string` | No | Memo from the quote, if any. |

| Return field | Type | Description |
|--------------|------|-------------|
| `quoteResponse` | `QuoteResponse` | Original quote. |
| `status` | `KNOWN_DEPOSIT_TX \| PENDING_DEPOSIT \| INCOMPLETE_DEPOSIT \| PROCESSING \| SUCCESS \| REFUNDED \| FAILED` | Execution status. |
| `updatedAt` | `string` | Last update timestamp. |
| `swapDetails` | `SwapDetails` | Swap and withdrawal details. |

#### 3.2.2 Full Integration Flow

##### @stableflow/bridges BridgeSFA.getAllQuote()

```typescript
BridgeSFA.getAllQuote(
  params: GetAllQuoteParams
): Promise<Array<{ serviceType: Service; quote?: any; error?: string }>>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `singleService` | `Service` | No | Quote only one route. |
| `disabledServices` | `Service[]` | No | Disable specific routes. |
| `dry` | `boolean` | No | Use `true` for preview and `false` before sending. |
| `prices` | `Record<string, string>` | Yes | Price map used for gas and fee estimates. |
| `fromToken` | `TokenConfig` | Yes | Source token. |
| `toToken` | `TokenConfig` | Yes | Destination token. |
| `wallet` | `WalletConfig` | Yes | Source-chain wallet adapter. |
| `evmWallet` | `WalletConfig` | No | EVM wallet for mixed routes or permits. |
| `evmAddress` | `string` | No | Address for `evmWallet`. |
| `recipient` | `string` | Yes | Destination recipient address. |
| `refundTo` | `string` | Yes | Source-chain refund address. |
| `amountWei` | `string` | Yes | Source amount in the smallest unit. |
| `slippageTolerance` | `number` | Yes | Percentage value. `0.5` means `0.5%`; OneClick routes convert it internally. |
| `minInputAmount` | `string` | No | Minimum input amount. Defaults to `1`. |
| `appFees` | `{ recipient; fee }[]` | No | Deprecated. Use `oneclickParams.appFees`. |
| `oneclickParams` | `object` | No | OneClick-specific `appFees`, `swapType`, and `isProxy`. |

Return items:

| Field | Type | Description |
|-------|------|-------------|
| `serviceType` | `Service` | Route type. |
| `quote` | `any` | Route quote, usually including `quoteParam`, `sendParam`, fees, `outputAmount`, `needApprove`, `approveSpender`, and `needPermit`. |
| `error` | `string` | Route-level error. Other routes may still succeed. |

##### @stableflow/bridges BridgeSFA.send()

```typescript
BridgeSFA.send(
  serviceType: Service,
  params: {
    wallet: WalletConfig;
    quote: any;
    permitSignature?: {
      amount: string;
      deadline: number;
      nonce: string;
      owner: string;
      r: string;
      s: string;
      v: 27 | 28;
    };
  }
): Promise<string>
```

Returns the source-chain transaction hash. `permitSignature` is required when `quote.needPermit === true`.

##### @stableflow/bridges BridgeSFA.getStatus()

```typescript
BridgeSFA.getStatus(
  serviceType: Service,
  params: { quote: any; hash: string }
): Promise<{ status: TransactionStatus; toChainTxHash?: string }>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceType` | `Service` | Yes | Same route type as for `send`. |
| `quote` | `any` | Yes | The quote object from `getAllQuote({ dry: false })`, identical to the one passed to `send`. The SDK derives deposit-address vs hash behavior internally. |
| `hash` | `string` | Yes | Source-chain transaction hash returned by `BridgeSFA.send`. |

The returned `status` is normalized to `pending`, `success`, or `failed`. `toChainTxHash` may be returned after success.

##### @stableflow/bridges getQuoteModes()

| Return field | Description |
|--------------|-------------|
| `isExactOutput` | Use `quote.quote.minAmountIn` for approve/send input amount when true. |
| `isOneClickService` | Whether the route uses OneClick send logic. |
| `isQuoteParamDepositAddress` | Whether the deposit address is stored under `quote.quoteParam.depositAddress`. |
| `isPermitWithNonce` | Whether the route needs a nonce-based permit. |

##### @stableflow/core tokens

`tokens` is the exported `TokenConfig[]` list from `@stableflow/core`. Demo helpers such as `getBridgeTokens` are local demo utilities, not SDK exports.

#### 3.2.3 Hyperliquid

##### @stableflow/hyperliquid Hyperliquid.quote()

```typescript
Hyperliquid.quote(
  params: HyperliquidQuoteParams
): Promise<{ quote: any; error: string | null }>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slippageTolerance` | `number` | Yes | Percentage value. `0.5` means `0.5%`. |
| `refundTo` | `string` | Yes | Source-chain refund address. |
| `recipient` | `string` | Yes | Recipient/sender address used by the deposit flow. |
| `wallet` | `WalletConfig` | Yes | Source EVM wallet adapter. |
| `fromToken` | `TokenConfig` | Yes | Source token. |
| `prices` | `Record<string, string>` | Yes | Price map. |
| `amountWei` | `string` | Yes | Source amount in the smallest unit. |
| `dry` | `boolean` | No | Defaults to `true`; `false` generates a real deposit address. |
| `oneclickParams.appFees` | `{ recipient; fee }[]` | No | App fee configuration. |

##### @stableflow/hyperliquid Hyperliquid.transfer()

```typescript
Hyperliquid.transfer(params: HyperliquidTransferParams): Promise<string>
```

Returns the source-chain transaction hash.

##### @stableflow/hyperliquid Hyperliquid.deposit()

```typescript
Hyperliquid.deposit(params: HyperliquidDepositParams): Promise<HyperliquidDepositResponse>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `txhash` | `string` | Yes | Source-chain transaction hash from `transfer`. |
| `wallet` | `WalletConfig` | Yes | Source wallet. |
| `evmWallet` | `WalletConfig` | Yes | EVM wallet used to sign the Arbitrum USDC permit. |
| `evmWalletAddress` | `string` | Yes | Permit owner address. |
| `quote` | `any` | Yes | Quote from `Hyperliquid.quote({ dry: false })`. |

Returns `{ code, data: { depositId } }`.

##### @stableflow/hyperliquid Hyperliquid.getStatus()

```typescript
Hyperliquid.getStatus(
  params: { depositId: string }
): Promise<HyperliquidDepositStatusResponse>
```

Returns `{ code, data: { status, txHash } }`, where `status` is `PROCESSING`, `SUCCESS`, `REFUNDED`, or `FAILED`.

##### @stableflow/hyperliquid HyperliquidFromTokens

Source token list for Hyperliquid deposits. Arbitrum USDC is excluded because it is the fixed destination token.

##### @stableflow/hyperliquid HyperliuquidMinAmount

Minimum deposit amount in the smallest unit of `HyperliuquidToToken`. The misspelled `Hyperliuquid` name is the actual SDK export and should be imported exactly as exported.

##### @stableflow/hyperliquid HyperliuquidToToken

Destination token, currently Arbitrum USDC. The misspelled `Hyperliuquid` name is the actual SDK export.

## 4. Advanced

### 4.1 Recommended Use of the `dry` Flag

Use `dry: true` during the quote preview phase to improve response time and user experience. Use `dry: false` only when the user is ready to execute or when you are about to call `send`.

For OneClick HTTP quotes, `QuoteRequest.dry` behaves as follows:

- `dry: true`: dry run. The response does not include `depositAddress`, `timeWhenInactive`, or `deadline`.
- `dry: false`: full quote with a real deposit address and deadlines.

`BridgeSFA.getAllQuote` forwards `dry` to every eligible route in `ServiceMap`. Wallet adapters may also simplify gas estimation or skip transaction construction when `dry: true`.

```typescript
import { BridgeSFA, ServiceMap } from "@stableflow/bridges";
import { EVMWallet } from "@stableflow/wallet-evm";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();
const fromWallet = new EVMWallet(provider, signer);

const previews = await BridgeSFA.getAllQuote({
  ...params,
  dry: true,
});

const best = previews
  .filter((route) => route.quote && !route.error)
  .sort(/* your comparator */)[0];

const [final] = await BridgeSFA.getAllQuote({
  ...params,
  dry: false,
  singleService: best.serviceType,
});

const txHash = await BridgeSFA.send(best.serviceType, {
  wallet: fromWallet,
  quote: final.quote,
});
```

### 4.2 `oneclickParams`

`BridgeSFA.getAllQuote()` supports additional OneClick parameters. These concepts also apply to `SFA.getQuote()` where the same fields exist.

#### appFees

This only applies to OneClick routes, including mixed routes that contain OneClick. OneClick charges 0.0001% (1 pip) per transaction.

All partners participate in a 50/50 revenue share by default. Half of the fee amount specified through `appFees` is sent to the OneClick protocol address, and the other half goes to the partner `recipient`.

```typescript
oneclickParams: {
  appFees: [
    {
      recipient: "yourapp.near",
      fee: 100, // 1%
    }
  ]
}
```

Fee units:

| Value | Fee |
|-------|-----|
| `100` | `1.00%` |
| `50` | `0.50%` |
| `10` | `0.10%` |
| `1` | `0.01%` |

#### swapType

| Value | Description | Common use |
|-------|-------------|------------|
| `EXACT_INPUT` | Fixed input amount, quote calculates output. | User enters how much to send. |
| `EXACT_OUTPUT` | Fixed output amount, quote calculates required input and refunds excess. | Hyperliquid deposit or fixed destination amount. |
| `FLEX_INPUT` | Flexible input amount. | Partial or variable deposit flows. |

#### isProxy

`isProxy` only applies to OneClick routes and mixed routes that start from OneClick. When enabled, OneClick uses proxy deposit address mode, which makes deposit addresses more stable. This is useful when institutions, exchanges, custodians, or enterprise wallets need transfer allowlists.

The tradeoff is higher execution cost on some chains. For example, Tron transfers can cost more than 50% extra gas. Prefer `isProxy: true` for allowlist or compliance flows, and leave it off for ordinary users when lowest gas cost matters more. In production, compare fees with `dry: true`, then re-quote with the same `isProxy` value and `dry: false` before execution.

### 4.3 approve

`approve` is required when a route needs token allowance before it can transfer an ERC-20 or similar token from the user's wallet. A quote may return `needApprove: true` and `approveSpender`.

Use `getQuoteModes` to determine the amount to approve:

```typescript
import Big from "big.js";
import { getQuoteModes } from "@stableflow/bridges";

const { isExactOutput } = getQuoteModes({
  quoteData: quote,
  bridgeStore: { quoteDataService: serviceType },
});

const amountWei = isExactOutput
  ? quote.quote?.minAmountIn
  : quote.quoteParam.amountWei;
```

Then call the wallet adapter:

```typescript
if (quote.needApprove && wallet.approve) {
  const approveRes = await wallet.approve({
    contractAddress: quote.quoteParam.fromToken.contractAddress,
    spender: quote.approveSpender,
    amountWei,
    isDetails: true,
  });

  if (!approveRes.success) {
    throw new Error(approveRes.message || "Approve failed");
  }
}
```

`@stableflow/wallet-evm` supports `isDetails: true` and returns `success`, `data.txHash`, `data.blockNumber`, `data.confirmations`, and `message`.

For some Ethereum ERC-20 tokens, changing allowance from one non-zero value to another non-zero value can fail. The full demo first approves `0` when an existing allowance is greater than `0`, then approves the required amount. The `dry: true` quote stage skips on-chain allowance checks, so check `needApprove` again on the final `dry: false` quote before sending.

After approve succeeds, re-quote or refresh the final quote because allowance and gas estimates may have changed. You can also call `ServiceMap[serviceType].estimateTransaction` to refresh the fee estimate.

### 4.4 permit signature

Permit signatures let users authorize token spending by signing EIP-712 typed data instead of sending an approve transaction.

#### BridgeSFA

When `quote.needPermit === true`, `BridgeSFA.send` requires `permitSignature`.

```typescript
const signature = await evmWallet.signTypedData({
  fromToken: quote.permitToken,
  amountWei: quote.permitAmountWei,
  spender: quote.permitSpender,
});

const permitSignature = {
  amount: signature.value,
  deadline: signature.deadline,
  nonce: signature.nonce,
  owner: signature.owner,
  r: signature.r,
  s: signature.s,
  v: signature.v,
  ...quote.permitAdditionalData,
};

await BridgeSFA.send(serviceType, {
  wallet: fromWallet,
  quote,
  permitSignature,
});
```

The EVM wallet adapter builds the EIP-712 `Permit`, reads `nonces(owner)`, signs typed data, and verifies the signature with a static `permit` call. Mixed routes such as `OneClickUsdt0`, `OneClickFraxZero`, and `FraxZeroOneClick` are handled inside `BridgeSFA.send`; integrators only pass the normalized `permitSignature`.

#### Hyperliquid

`Hyperliquid.deposit` generates the permit internally. The token is fixed to `HyperliuquidToToken` (Arbitrum USDC), and the spender is maintained inside `@stableflow/hyperliquid`.

The caller must provide an `evmWallet` that supports `signTypedData`, an `evmWalletAddress` that owns the funds, and a working Arbitrum RPC through `getChainRpcUrl("arb")`.

### 4.5 Error Handling

StableFlow errors fall into three layers: HTTP API errors, route quote/execution errors, and wallet or chain errors.

#### SFA

HTTP methods throw `ApiError` for non-2xx responses. Important fields are `status`, `statusText`, `body`, `message`, and `url`.

| Method | HTTP error | Suggested handling |
|--------|------------|-------------------|
| `SFA.getQuote` | `400` | Validate assets, amount, deadline, recipient, and refund fields. |
| `SFA.getQuote` | `401` | Check `OpenAPI.TOKEN`. |
| `SFA.submitDepositTx` | `400` | Validate `txHash` and `depositAddress`. |
| `SFA.getExecutionStatus` | `404` | Check that the quote was `dry: false` and that memo/address are correct. |

`OneClickStatus` is a business status, not an exception. Continue polling for `PENDING_DEPOSIT`, `KNOWN_DEPOSIT_TX`, `INCOMPLETE_DEPOSIT`, and `PROCESSING`. Treat `SUCCESS`, `REFUNDED`, and `FAILED` as terminal states.

#### BridgeSFA

`BridgeSFA.getAllQuote` can either throw or return route-level errors. It throws for invalid parameters, amounts lower than `minInputAmount`, and unsupported token pairs. It returns `{ serviceType, error }` when one route fails but other routes may still succeed.

`BridgeSFA.send` may throw `Invalid service type`, `Quote data is required`, `Permit signature is required`, wallet rejection, insufficient balance, insufficient gas, or RPC errors. `BridgeSFA.getStatus` throws if the service type is invalid or status is unsupported; otherwise it returns normalized `TransactionStatus`.

#### Hyperliquid

`Hyperliquid.quote` usually returns `{ quote: null, error }` for quote failures or amounts below `HyperliuquidMinAmount`. `Hyperliquid.transfer` can fail because of wallet rejection, insufficient balance, network issues, or missing deposit address. `Hyperliquid.deposit` can fail when `signTypedData` is unavailable or rejected, Arbitrum RPC cannot read `nonces`, or the API response has `code !== 200`.

