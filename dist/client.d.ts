import type { ClickerConfig, LeaderEntry, ReadOnlyResponse, TapCall } from "./types";
export declare const DEFAULT_CONFIG: Required<ClickerConfig>;
export declare function callReadOnly(functionName: string, args?: string[], config?: ClickerConfig): Promise<ReadOnlyResponse>;
export declare function getTotalClicks(config?: ClickerConfig): Promise<number>;
export declare function getUserClicks(userAddress: string, config?: ClickerConfig): Promise<number>;
export declare function getLeaderboard(config?: ClickerConfig): Promise<LeaderEntry[]>;
export declare function createTapCall(config?: ClickerConfig): TapCall;
export declare class ClickerClient {
    private readonly config;
    constructor(config?: ClickerConfig);
    getTotalClicks(): Promise<number>;
    getUserClicks(userAddress: string): Promise<number>;
    getLeaderboard(): Promise<LeaderEntry[]>;
    createTapCall(): TapCall;
}
