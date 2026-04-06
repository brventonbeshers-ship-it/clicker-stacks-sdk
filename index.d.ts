import type { StacksNetwork } from "@stacks/network";
import type { PostConditionMode } from "@stacks/transactions";

export interface ClickerConfig {
  contractAddress?: string;
  contractName?: string;
  apiBase?: string;
  network?: StacksNetwork;
}

export interface LeaderEntry {
  who: string;
  clicks: number;
}

export interface TapCall {
  contractAddress: string;
  contractName: string;
  functionName: "tap";
  functionArgs: [];
  postConditionMode: PostConditionMode;
  postConditions: [];
  network: StacksNetwork;
}

export const DEFAULT_CONFIG: Required<ClickerConfig>;

export function callReadOnly(
  functionName: string,
  args?: string[],
  config?: ClickerConfig
): Promise<any>;

export function getTotalClicks(config?: ClickerConfig): Promise<number>;

export function getUserClicks(
  userAddress: string,
  config?: ClickerConfig
): Promise<number>;

export function getLeaderboard(config?: ClickerConfig): Promise<LeaderEntry[]>;

export function createTapCall(config?: ClickerConfig): TapCall;
