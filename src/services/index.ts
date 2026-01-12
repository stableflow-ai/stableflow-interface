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

export const ProjectMap: Record<Project, { name: string; color: string; logo: string; }> = {
  [Project.Nearintents]: {
    name: "Near Intents",
    color: "#4CD093",
    logo: "/bridge/logo-near-intents.png",
  },
  [Project.Layerzero]: {
    name: "USDT0",
    color: "#00b988",
    logo: "/bridge/logo-usdt0.svg",
  },
  [Project.CCTP]: {
    name: "CCTP",
    color: "#29233b",
    logo: "/bridge/logo-circle.avif",
  },
};
