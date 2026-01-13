export type ServiceType = "oneclick" | "usdt0" | "cctp";

export const Service = {
  OneClick: "oneclick",
  Usdt0: "usdt0",
  CCTP: "cctp",
} as const;

export type Service = (typeof Service)[keyof typeof Service];

// Used for backend data conversion
export const Project = {
  Nearintents: 0,
  Layerzero: 1,
  CCTP: 2,
};

export type Project = (typeof Project)[keyof typeof Project];

export const ProjectMap: Record<Project, { name: string; color: string; logo: string; value: string; tokens: ("USDT" | "USDC" | "USD1")[]; }> = {
  [Project.Nearintents]: {
    name: "Near Intents",
    value: "nearintents",
    color: "#4CD093",
    logo: "/bridge/logo-near-intents.png",
    tokens: ["USDT", "USDC"],
  },
  [Project.Layerzero]: {
    name: "USDT0",
    value: "layerzero",
    color: "#00b988",
    logo: "/bridge/logo-usdt0.svg",
    tokens: ["USDT"],
  },
  [Project.CCTP]: {
    name: "CCTP",
    value: "cctp",
    color: "#29233b",
    logo: "/bridge/logo-circle.avif",
    tokens: ["USDC"],
  },
};
