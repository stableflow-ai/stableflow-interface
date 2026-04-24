export const LogoHost = "https://assets.dapdap.net";
export const DefaultIcon = `${LogoHost}/tokens/default_icon.png`;
export const getLogo = (path: string) => {
  const host = "https://assets.dapdap.net";
  path = /^\//.test(path) ? path : `/${path}`;
  return `${host}${path}`;
};
export const getStableflowChainLogo = (name: string) => {
  name = name.toLowerCase();
  return getLogo(`/stableflow/networks/${name}.png`);
};
export const getStableflowTokenLogo = (name: string) => {
  name = name.toLowerCase();
  return getLogo(`/stableflow/tokens/${name}.png`);
};
export const getStableflowRouteLogo = (name: string) => {
  name = name.toLowerCase();
  return getLogo(`/stableflow/routes/${name}`);
};
