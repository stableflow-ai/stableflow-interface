export const formatAddress = (
  address?: string | null,
  prefixLength = 4,
  suffixLength = 4
) => {
  if (!address) return "-";
  if (typeof address !== "string") return address + "";
  if (address.length < prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};
