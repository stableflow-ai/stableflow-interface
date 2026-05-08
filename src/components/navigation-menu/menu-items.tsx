export const menuItems = [
  {
    label: "Transfer",
    path: "/",
    isExternal: false,
  },
  {
    label: "Ecosystem",
    path: "/ecosystem",
    isExternal: false,
  },
  {
    label: "More",
    path: false,
    isExternal: false,
    children: [
      {
        label: "About",
        path: "/about",
        isExternal: false,
      },
      {
        label: "Developer",
        path: "/developer",
        isExternal: false,
      },
      {
        label: "Docs",
        path: "https://docs.stableflow.ai/",
        isExternal: true,
      },
      // {
      //   label: "Explorer",
      //   path: "https://github.com/stableflow-ai/stableflow-interface",
      //   isExternal: true,
      // },
      // {
      //   label: "Bug Bounty",
      //   path: "https://github.com/stableflow-ai/stableflow-interface/issues",
      //   isExternal: true,
      // },
    ],
  }
];
