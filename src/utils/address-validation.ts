// Address validation utilities for different blockchains

export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an address based on the target blockchain
 * @param address - The address to validate
 * @param blockchain - The target blockchain key
 * @returns AddressValidationResult with validation status and error message
 */
export function validateAddress(
  address: string,
  blockchain: string
): AddressValidationResult {
  if (!address.trim()) {
    return {
      isValid: false,
      error: "Address cannot be empty"
    };
  }

  const trimmedAddress = address.trim();

  switch (blockchain) {
    case "near":
      return validateNearAddress(trimmedAddress);
    case "sol":
      return validateSolanaAddress(trimmedAddress);
    case "evm":
      return validateEthereumAddress(trimmedAddress);
    default:
      return {
        isValid: false,
        error: "Unsupported blockchain"
      };
  }
}

/**
 * Validates a NEAR address
 * NEAR addresses are typically 2-64 characters long and contain alphanumeric characters and dots
 */
function validateNearAddress(address: string): AddressValidationResult {
  // Length check
  if (address.length < 2 || address.length > 64) {
    return {
      isValid: false,
      error: "NEAR address must be 2-64 characters long"
    };
  }

  // Additional checks
  if (address.startsWith(".") || address.endsWith(".")) {
    return {
      isValid: false,
      error: "NEAR address cannot start or end with a dot"
    };
  }

  if (address.includes("..")) {
    return {
      isValid: false,
      error: "NEAR address cannot contain consecutive dots"
    };
  }

  // Check if address contains only numbers (not allowed for NEAR)
  if (/^\d+$/.test(address)) {
    return {
      isValid: false,
      error: "NEAR address cannot be purely numeric"
    };
  }

  // NEAR address pattern: 2-64 characters, alphanumeric and dots, must contain at least one letter
  const nearPattern = /^[a-zA-Z0-9.]+$/;
  const hasLetterPattern = /[a-zA-Z]/;

  if (!nearPattern.test(address)) {
    return {
      isValid: false,
      error: "Invalid NEAR address"
    };
  }

  if (!hasLetterPattern.test(address)) {
    return {
      isValid: false,
      error: "NEAR address must contain at least one letter"
    };
  }

  return { isValid: true };
}

/**
 * Validates a Solana address
 * Solana addresses are base58 encoded and typically 32-44 characters long
 */
function validateSolanaAddress(address: string): AddressValidationResult {
  // Solana address pattern: base58 encoded, typically 32-44 characters
  const solanaPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  if (!solanaPattern.test(address)) {
    return {
      isValid: false,
      error: "Invalid Solana address"
    };
  }

  return { isValid: true };
}

/**
 * Validates an Ethereum address (used for Arbitrum)
 * Ethereum addresses are 42 characters long, starting with 0x
 */
function validateEthereumAddress(address: string): AddressValidationResult {
  // Ethereum address pattern: 0x followed by 40 hexadecimal characters
  const ethereumPattern = /^0x[a-fA-F0-9]{40}$/;

  if (!ethereumPattern.test(address)) {
    return {
      isValid: false,
      error: "Invalid Ethereum address"
    };
  }

  return { isValid: true };
}

/**
 * Gets a placeholder text for the address input based on the target blockchain
 */
export function getAddressPlaceholder(blockchain: string): string {
  switch (blockchain) {
    case "near":
      return "Enter NEAR wallet address (e.g., alice.near)";
    case "sol":
      return "Enter Solana wallet address (e.g., 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM)";
    case "arb":
      return "Enter Ethereum/Arbitrum wallet address (e.g., 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6)";
    default:
      return "Enter recipient wallet address";
  }
}
