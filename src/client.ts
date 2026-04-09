import { STACKS_MAINNET } from "@stacks/network";
import {
  PostConditionMode,
  cvToValue,
  hexToCV,
  principalCV,
  serializeCV,
} from "@stacks/transactions";
import type {
  ClickerConfig,
  LeaderEntry,
  ReadOnlyResponse,
  TapCall,
} from "./types";

export const DEFAULT_CONFIG: Required<ClickerConfig> = {
  contractAddress: "SP1Q7YR67R6WGP28NXDJD1WZ11REPAAXRJJ3V6RKM",
  contractName: "clicker",
  apiBase: "https://api.mainnet.hiro.so",
  network: STACKS_MAINNET,
};

function resolveConfig(overrides: ClickerConfig = {}): Required<ClickerConfig> {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function serializeCvToHex(cv: unknown): string {
  const serialized = serializeCV(cv as never);
  if (typeof serialized === "string") {
    return serialized.startsWith("0x") ? serialized : `0x${serialized}`;
  }

  return `0x${Buffer.from(serialized).toString("hex")}`;
}

export async function callReadOnly(
  functionName: string,
  args: string[] = [],
  config: ClickerConfig = {}
): Promise<ReadOnlyResponse> {
  const resolved = resolveConfig(config);
  const response = await fetch(
    `${resolved.apiBase}/v2/contracts/call-read/${resolved.contractAddress}/${resolved.contractName}/${functionName}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: resolved.contractAddress,
        arguments: args,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Read-only call failed with status ${response.status}`);
  }

  return response.json() as Promise<ReadOnlyResponse>;
}

function normalizeLeaderboardValue(raw: unknown): LeaderEntry[] {
  const entries = Array.isArray(raw) ? raw : [];

  return entries
    .map(item => {
      const entry =
        item && typeof item === "object" && "value" in item
          ? (item as { value: unknown }).value
          : item;
      const record = entry as {
        who?: { value?: string } | string;
        clicks?: { value?: string | number } | string | number;
      };

      return {
        who: String(record?.who && typeof record.who === "object" ? record.who.value ?? "" : record?.who ?? ""),
        clicks: Number(
          record?.clicks && typeof record.clicks === "object"
            ? record.clicks.value ?? 0
            : record?.clicks ?? 0
        ),
      };
    })
    .filter(entry => entry.who && entry.clicks > 0);
}

export async function getTotalClicks(config: ClickerConfig = {}): Promise<number> {
  const data = await callReadOnly("get-total-clicks", [], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true) as { value?: unknown } | unknown;
  return Number(
    parsed && typeof parsed === "object" && "value" in parsed
      ? parsed.value ?? 0
      : parsed ?? 0
  );
}

export async function getUserClicks(
  userAddress: string,
  config: ClickerConfig = {}
): Promise<number> {
  const principalArg = serializeCvToHex(principalCV(userAddress));
  const data = await callReadOnly("get-user-clicks", [principalArg], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true) as { value?: unknown } | unknown;
  return Number(
    parsed && typeof parsed === "object" && "value" in parsed
      ? parsed.value ?? 0
      : parsed ?? 0
  );
}

export async function getLeaderboard(
  config: ClickerConfig = {}
): Promise<LeaderEntry[]> {
  const data = await callReadOnly("get-leaderboard", [], config);
  if (!data.okay || !data.result) {
    return [];
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true);
  return normalizeLeaderboardValue(parsed);
}

export function createTapCall(config: ClickerConfig = {}): TapCall {
  const resolved = resolveConfig(config);
  return {
    contractAddress: resolved.contractAddress,
    contractName: resolved.contractName,
    functionName: "tap",
    functionArgs: [],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    network: resolved.network,
  };
}

export class ClickerClient {
  private readonly config: Required<ClickerConfig>;

  constructor(config: ClickerConfig = {}) {
    this.config = resolveConfig(config);
  }

  getTotalClicks(): Promise<number> {
    return getTotalClicks(this.config);
  }

  getUserClicks(userAddress: string): Promise<number> {
    return getUserClicks(userAddress, this.config);
  }

  getLeaderboard(): Promise<LeaderEntry[]> {
    return getLeaderboard(this.config);
  }

  createTapCall(): TapCall {
    return createTapCall(this.config);
  }
}
