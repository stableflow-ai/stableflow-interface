export const LogoHost = "https://assets.dapdap.net";
export const DefaultIcon = `${LogoHost}/tokens/default_icon.png`;
export const formatPath = (path: string) => {
  return /^\//.test(path) ? path : `/${path}`;
};
export const getLogo = (path: string) => {
  const host = "https://assets.dapdap.net";
  path = formatPath(path);
  return `${host}${path}`;
};
export const getStableflowChainLogo = (name: string) => {
  name = name.toLowerCase();
  name = formatPath(name);
  return getLogo(`/stableflow/networks${name}.png`);
};
export const getStableflowTokenLogo = (name: string) => {
  name = name.toLowerCase();
  name = formatPath(name);
  return getLogo(`/stableflow/tokens${name}.png`);
};
export const getStableflowRouteLogo = (name: string) => {
  name = name.toLowerCase();
  name = formatPath(name);
  return getLogo(`/stableflow/routes${name}`);
};
export const getStableflowLogo = (name: string) => {
  name = name.toLowerCase();
  name = formatPath(name);
  return getLogo(`/stableflow/logos${name}`);
};
export const getStableflowIcon = (name: string) => {
  name = name.toLowerCase();
  name = formatPath(name);
  return getLogo(`/stableflow/icons${name}`);
};
export const getStableflowTrustAvatar = (name: string) => {
  name = name.toLowerCase();
  name = formatPath(name);
  return getLogo(`/stableflow/trusts${name}`);
};
