import Button from "@/components/button";
import { renderTextWithLinks } from "../utils";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Intent-Based Solvers",
      description: "A decentralised network of professional market makers competes in real-time to fulfil your transfer intents at the best possible rate. Each solver is backed by a shared capital base, ensuring deep liquidity and reliable execution even at scale.",
      buttonText: "Transfer Now",
      buttonLink: "http://app.stableflow.ai",
      icon: "🔄"
    },
    {
      number: "2",
      title: "Atomic Transfers",
      description: "Transfers routing through StableFlow settle atomically through NEAR's Verifier Smart Contract, Circle’s CCTP bridge or USDT0. Your transaction either completes or reverts back to the user, guaranteeing your funds are never at risk.",
      buttonText: "How It Works",
      buttonLink: "https://docs.stableflow.ai/overview/how-stableflow-works",
      icon: "🔒"
    },
    {
      number: "3",
      title: "Institutional Liquidity, Powered by NEAR",
      description: "For large-scale transfers exceeding $1M, NEAR Intents solvers can source liquidity dynamically after quoting. This enables StableFlow to handle seven-figure transfers without pre-deposited pools or slippage trade-offs.",
      buttonText: "Learn More",
      buttonLink: "https://docs.stableflow.ai/overview/how-stableflow-works/powered-by-near-intents",
      icon: "💼"
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-[20px] md:text-[24px] font-[700] text-[#6284F5] mb-[12px]">
        How StableFlow Works
      </h2>

      <p className="text-[14px] md:text-[16px] text-[#9FA7BA] font-[500] mb-[20px]">
        A New Approach to Crosschain Transfers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] flex flex-col"
          >
            <h3 className="text-[16px] font-[700] text-[#2B3337] mb-[12px] leading-[1.3]">
              {step.title}
            </h3>

            <p className="text-[13px] md:text-[14px] text-[#444C59] leading-[1.6] mb-[16px] flex-grow">
              {renderTextWithLinks(step.description)}
            </p>

            <a
              href={step.buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                className="w-full h-[40px] bg-[#6284F5] text-white hover:bg-[#2453f0] duration-150"
              >
                {step.buttonText}
              </Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
