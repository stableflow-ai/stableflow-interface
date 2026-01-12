export const DefaultIcon = "https://assets.db3.app/tokens/default_icon.png";

export const getTokenLogo = (name: string) => {
  name = name.toLowerCase();

  if (name) {
    return `https://assets.db3.app/token/${name}.png`;
  }
  return DefaultIcon;
};

export const getChainLogo = (name: string) => {
  name = name.toLowerCase();
  if (name === "arbitrum one") {
    name = "arbitrum";
  }
  if (name) {
    return `https://assets.db3.app/chain/${name}.png`;
  }
  return DefaultIcon;
};
