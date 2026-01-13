import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// ============================================================================
// Chat Command Parsing
// ============================================================================

export type ParsedTransferCommand = {
  type: "transfer";
  amount: number;
  asset: "SOL" | { mint: string; symbol?: string };
  destination: string;
  raw: string;
};

export type ParsedCommand =
  | ParsedTransferCommand
  | { type: "help"; raw: string }
  | { type: "status"; transferId?: string; raw: string }
  | { type: "balance"; raw: string }
  | { type: "unknown"; raw: string };

export function parseUserMessage(message: string): ParsedCommand {
  const raw = message.trim();
  const lower = raw.toLowerCase();

  // Help command
  if (lower === "help" || lower === "/help" || lower.includes("how do i") || lower.includes("what can you do")) {
    return { type: "help", raw };
  }

  // Status command
  if (lower.startsWith("status") || lower.startsWith("/status")) {
    const parts = raw.split(/\s+/);
    const transferId = parts.length > 1 ? parts[1] : undefined;
    return { type: "status", transferId, raw };
  }

  // Balance command
  if (lower === "balance" || lower === "/balance" || lower.includes("my balance") || lower.includes("check balance")) {
    return { type: "balance", raw };
  }

  return { type: "unknown", raw };
}

// ============================================================================
// Response Generation
// ============================================================================

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: {
    transferId?: string;
    status?: "pending" | "routing" | "complete" | "failed";
  };
};

export function generateHelpResponse(): string {
  return `# FLUX Pay Commands

Privacy-first token transfers on Solana.

## Commands
- **Send tokens**: "send 2 SOL privately to [address]"
- **Check balance**: "balance"
- **Transfer status**: "status"

## How It Works
1. Specify the destination and amount
2. A routing plan is generated with ephemeral hops
3. Sign the transaction in your wallet
4. Funds route through privacy-preserving multi-hop path

## Fees
- **Protocol fee**: 1%`;
}

export function generateTransferConfirmation(input: {
  amount: number;
  destination: string;
  estimatedTimeMs: number;
  hopCount: number;
  feeApplied: boolean;
  feeSol: number;
}): string {
  const { amount, destination, estimatedTimeMs, hopCount, feeApplied, feeSol } = input;
  const shortDest = `${destination.slice(0, 4)}...${destination.slice(-4)}`;
  const timeSeconds = Math.ceil(estimatedTimeMs / 1000);

  let response = `# Transfer Plan Ready

**Amount**: ${amount} SOL
**Destination**: \`${shortDest}\`
**Privacy Hops**: ${hopCount} hops
**Estimated Time**: ~${timeSeconds}s

`;

  response += `**Fee**: ${feeSol.toFixed(4)} SOL (1%)

`;

  response += `Sign the transaction to initiate the transfer.`;

  return response;
}

export function generateRoutingUpdate(input: {
  currentHop: number;
  totalHops: number;
  status: "routing" | "complete" | "failed";
  signature?: string;
  error?: string;
}): string {
  const { currentHop, totalHops, status, signature, error } = input;

  if (status === "routing") {
    const progress = Math.round((currentHop / totalHops) * 100);
    const messages = [
      "routing through ephemeral hop",
      "processing privacy layer",
      "finalizing route",
      "completing transfer",
    ];
    return `Hop ${currentHop}/${totalHops}... ${messages[currentHop % 4]} (${progress}%)`;
  }

  if (status === "complete") {
    const shortSig = signature ? `${signature.slice(0, 8)}...` : "";
    return `# Transfer Complete

Your tokens have been delivered successfully.

**TX**: \`${shortSig}\`

View on Solscan for confirmation.`;
  }

  return `# Transfer Failed

**Error**: ${error || "Unknown error"}

Funds in routing chain may need recovery. Please contact support.`;
}

export function generateBalanceResponse(input: {
  solBalance: number;
}): string {
  const { solBalance } = input;

  let response = `# Wallet Balance

**SOL**: ${solBalance.toFixed(4)}

`;

  response += `**Protocol Fee**: 1%`;

  return response;
}

export function generateUnknownResponse(): string {
  const responses = [
    "I didn't recognize that command. Try 'send 2 SOL privately to [address]' or type 'help'.",
    "Unknown command. Type 'help' for available commands.",
    "Command not recognized. Example: 'send 1.5 SOL privately to 9xj...abc'",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function generateInsufficientFundsResponse(required: number, available: number): string {
  return `# Insufficient Balance

**Required**: ${required.toFixed(4)} SOL
**Available**: ${available.toFixed(4)} SOL

Please add more SOL to your wallet and try again.`;
}

export function generateSigningMessage(): string {
  return "Awaiting wallet signature...";
}

export function generateRoutingStartMessage(): string {
  return "Initiating private transfer. Applying privacy-preserving multi-hop routing...";
}

// ============================================================================
// Utility
// ============================================================================

export function solToLamports(sol: number): bigint {
  return BigInt(Math.floor(sol * LAMPORTS_PER_SOL));
}

export function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}
