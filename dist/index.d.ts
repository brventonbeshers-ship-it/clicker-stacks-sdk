import type { ClickerClient } from "./client";
export { ClickerClient, DEFAULT_CONFIG, callReadOnly, createTapCall, getLeaderboard, getTotalClicks, getUserClicks, } from "./client";
export type { ClickerConfig, LeaderEntry, ReadOnlyResponse, TapCall, } from "./types";
export type TotalClicksResult = Awaited<ReturnType<ClickerClient["getTotalClicks"]>>;
