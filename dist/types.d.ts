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
export interface ReadOnlyResponse {
    okay?: boolean;
    result?: string;
    cause?: string;
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
