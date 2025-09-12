export const formatAddress = (
  address: string,
  prefixLength = 4,
  suffixLength = 4
) => {
  return address
    ? `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
    : "-";
};
