"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.min.css";

const apiExamples = [
  {
    id: "quote",
    label: "Get quotes",
    command: `import { SFA, tokens, EVMWallet } from 'stableflow-ai-sdk';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const wallet = new EVMWallet(provider, signer);

const fromToken = tokens.find(t => 
  t.chainName === 'Ethereum' && t.symbol === 'USDT'
);
const toToken = tokens.find(t => 
  t.chainName === 'Arbitrum' && t.symbol === 'USDT'
);

const quotes = await SFA.getAllQuote({
  dry: false,
  prices: {},
  fromToken: fromToken!,
  toToken: toToken!,
  wallet: wallet,
  recipient: '0x1234...',
  refundTo: '0x5678...',
  amountWei: ethers.parseUnits('100', fromToken!.decimals).toString(),
  slippageTolerance: 0.5,
  // optional
  appFees: [
    {
      // Your wallet address to receive the fee
      recipient: "stableflow.near",
      fee: 100,
    },
  ],
});`,
    response: `[
  {
    "serviceType": "oneclick",
    "quote": {
      "quote": {...},
      "quoteParam": {...},
      "sendParam": {...},
      "depositAddress": "0x...",
      "needApprove": true,
      "approveSpender": "0x...",
      "fees": {...},
      "outputAmount": "99750000000",
      "estimateTime": 1800
    }
  },
  {
    "serviceType": "cctp",
    "quote": {...}
  },
  {
    "serviceType": "usdt0",
    "error": "Amount exceeds max"
  }
]`,
  },
  {
    id: "execute",
    label: "Execute a quote",
    command: `import { SFA, Service, EVMWallet } from 'stableflow-ai-sdk';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const wallet = new EVMWallet(provider, signer);

const selectedQuote = quotes.find(q => q.quote && !q.error);

if (selectedQuote && selectedQuote.quote) {
  if (selectedQuote.quote.needApprove) {
    await wallet.approve({
      contractAddress: selectedQuote.quote.quoteParam.fromToken.contractAddress,
      spender: selectedQuote.quote.approveSpender,
      amountWei: selectedQuote.quote.quoteParam.amountWei,
    });
  }
  
  const txHash = await SFA.send(selectedQuote.serviceType, {
    wallet: wallet,
    quote: selectedQuote.quote,
  });
  
  console.log('Transaction hash:', txHash);
}`,
    response: `"0xabc123def456..."`,
  },
  {
    id: "status",
    label: "Check status",
    command: `import { SFA, Service, TransactionStatus } from 'stableflow-ai-sdk';

// OneClick service: query using deposit address
const status1 = await SFA.getStatus(Service.OneClick, {
  depositAddress: '0x...',
});

// USDT0 or CCTP service: query using transaction hash
const status2 = await SFA.getStatus(Service.Usdt0, {
  hash: '0x...',
});

console.log('Status:', status1.status);
if (status1.toChainTxHash) {
  console.log('Destination chain tx hash:', status1.toChainTxHash);
}`,
    response: `{
  "status": "success",
  "toChainTxHash": "0xdef789..."
}`,
  },
  {
    id: "chains",
    label: "Token Configuration",
    command: `import { tokens, usdtTokens, usdcTokens } from 'stableflow-ai-sdk';

// Get all supported tokens
const allTokens = tokens;

// Get USDT tokens only
const usdtOnly = usdtTokens;

// Get USDC tokens only
const usdcOnly = usdcTokens;

// Find token by chain name and symbol
const ethUsdt = tokens.find(t => 
  t.chainName === 'Ethereum' && t.symbol === 'USDT'
);

// Filter by chain type
const evmTokens = tokens.filter(t => t.chainType === 'evm');
const solanaTokens = tokens.filter(t => t.chainType === 'sol');`,
    response: `[
  {
    "chainName": "Ethereum",
    "chainType": "evm",
    "symbol": "USDT",
    "decimals": 6,
    "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "assetId": "usdt",
    "services": ["oneclick", "usdt0"],
    "rpcUrl": "https://eth.merkle.io"
  },
  ...
]`,
  },
  {
    id: "affiliate",
    label: "Developer Fees",
    command: `// When requesting quotes, include appFees parameter
const quotes = await SFA.getAllQuote({
  // ... other parameters
  appFees: [
    {
      recipient: "yourapp.near",
      fee: 100, // 1% (100 = 1%, 50 = 0.5%, 10 = 0.10%, 1 = 0.01%)
    }
  ],
});

// Multi-party revenue sharing
appFees: [
  { recipient: "yourapp.near", fee: 70 },
  { recipient: "kol.near", fee: 30 }
]`,
    response: `// Fees are automatically embedded in the execution path
// 1% of the user's transfer amount will be routed 
// directly to your wallet when the transaction executes.

// No custody. No settlement process. No off-chain accounting.`,
  },
];

const ApiPlayground = () => {
  const [activeTab, setActiveTab] = useState("quote");
  const activeExample = apiExamples.find((ex) => ex.id === activeTab);

  // Highlight TypeScript code
  const highlightedCommand = useMemo(() => {
    if (!activeExample?.command) return "";
    try {
      return hljs.highlight(activeExample.command, { language: "typescript" }).value;
    } catch {
      return activeExample.command;
    }
  }, [activeExample?.command]);

  // Highlight response (JSON or TypeScript comments)
  const highlightedResponse = useMemo(() => {
    if (!activeExample?.response) return "";
    try {
      // Check if it's JSON
      if (activeExample.response.trim().startsWith("{") || activeExample.response.trim().startsWith("[")) {
        return hljs.highlight(activeExample.response, { language: "json" }).value;
      }
      // Check if it's mostly comments
      if (activeExample.response.trim().startsWith("//")) {
        return hljs.highlight(activeExample.response, { language: "typescript" }).value;
      }
      // Default to JSON
      return hljs.highlight(activeExample.response, { language: "json" }).value;
    } catch {
      return activeExample.response;
    }
  }, [activeExample?.response]);

  return (
    <section className="pt-16 md:pt-20">
      <div className="">
        <h2 className="text-2xl font-semibold text-black leading-[100%]">
          Try the Stableflow API
        </h2>
        <p className="text-[#9FA7BA] text-md font-normal mt-4.5">
          Explore real API calls and inspect the response structure.
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] py-6 px-8 grid lg:grid-cols-[190px_1fr] gap-6 lg:gap-12">
        {/* Left side - Tabs */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {apiExamples.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => setActiveTab(example.id)}
              className={clsx(
                "pl-8 pr-4 py-2.5 text-black text-left text-sm font-normal rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-white",
                activeTab === example.id
                  ? "bg-black text-white"
                  : "hover:text-[#2B3337] hover:border-[#D9D9D9]"
              )}
            >
              {example.label}
            </button>
          ))}
        </div>

        {/* Right side - Code */}
        <div className="min-w-0 flex-1">
          <div className="bg-[#0f172a] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  TypeScript
                </span>
              </div>
            </div>

            {/* Command */}
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
              <pre className="overflow-x-auto">
                <code 
                  className="text-sm font-mono leading-relaxed hljs language-typescript"
                  dangerouslySetInnerHTML={{ __html: highlightedCommand }}
                />
              </pre>
            </div>

            {/* Response */}
            <div className="px-4 py-3">
              <div className="text-xs text-slate-500 mb-2 font-mono">
                Response
              </div>
              <pre className="overflow-x-auto">
                <code 
                  className="text-sm font-mono leading-relaxed hljs"
                  dangerouslySetInnerHTML={{ __html: highlightedResponse }}
                />
              </pre>
            </div>
          </div>
          <p className="text-xs text-[#9FA7BA] mt-3">
            All responses are returned in real time with zero platform fees.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ApiPlayground;
