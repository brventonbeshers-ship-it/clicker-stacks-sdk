"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickerClient = exports.DEFAULT_CONFIG = void 0;
exports.callReadOnly = callReadOnly;
exports.getTotalClicks = getTotalClicks;
exports.getUserClicks = getUserClicks;
exports.getLeaderboard = getLeaderboard;
exports.createTapCall = createTapCall;
const network_1 = require("@stacks/network");
const transactions_1 = require("@stacks/transactions");
exports.DEFAULT_CONFIG = {
    contractAddress: "SP1Q7YR67R6WGP28NXDJD1WZ11REPAAXRJJ3V6RKM",
    contractName: "clicker",
    apiBase: "https://api.mainnet.hiro.so",
    network: network_1.STACKS_MAINNET,
};
function resolveConfig(overrides = {}) {
    return { ...exports.DEFAULT_CONFIG, ...overrides };
}
function serializeCvToHex(cv) {
    const serialized = (0, transactions_1.serializeCV)(cv);
    if (typeof serialized === "string") {
        return serialized.startsWith("0x") ? serialized : `0x${serialized}`;
    }
    return `0x${Buffer.from(serialized).toString("hex")}`;
}
async function callReadOnly(functionName, args = [], config = {}) {
    const resolved = resolveConfig(config);
    const response = await fetch(`${resolved.apiBase}/v2/contracts/call-read/${resolved.contractAddress}/${resolved.contractName}/${functionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: resolved.contractAddress,
            arguments: args,
        }),
    });
    if (!response.ok) {
        throw new Error(`Read-only call failed with status ${response.status}`);
    }
    return response.json();
}
function normalizeLeaderboardValue(raw) {
    const entries = Array.isArray(raw) ? raw : [];
    return entries
        .map(item => {
        const entry = item && typeof item === "object" && "value" in item
            ? item.value
            : item;
        const record = entry;
        return {
            who: String(record?.who && typeof record.who === "object" ? record.who.value ?? "" : record?.who ?? ""),
            clicks: Number(record?.clicks && typeof record.clicks === "object"
                ? record.clicks.value ?? 0
                : record?.clicks ?? 0),
        };
    })
        .filter(entry => entry.who && entry.clicks > 0);
}
async function getTotalClicks(config = {}) {
    const data = await callReadOnly("get-total-clicks", [], config);
    if (!data.okay || !data.result) {
        return 0;
    }
    const clarityValue = (0, transactions_1.hexToCV)(data.result);
    const parsed = (0, transactions_1.cvToValue)(clarityValue, true);
    return Number(parsed && typeof parsed === "object" && "value" in parsed
        ? parsed.value ?? 0
        : parsed ?? 0);
}
async function getUserClicks(userAddress, config = {}) {
    const principalArg = serializeCvToHex((0, transactions_1.principalCV)(userAddress));
    const data = await callReadOnly("get-user-clicks", [principalArg], config);
    if (!data.okay || !data.result) {
        return 0;
    }
    const clarityValue = (0, transactions_1.hexToCV)(data.result);
    const parsed = (0, transactions_1.cvToValue)(clarityValue, true);
    return Number(parsed && typeof parsed === "object" && "value" in parsed
        ? parsed.value ?? 0
        : parsed ?? 0);
}
async function getLeaderboard(config = {}) {
    const data = await callReadOnly("get-leaderboard", [], config);
    if (!data.okay || !data.result) {
        return [];
    }
    const clarityValue = (0, transactions_1.hexToCV)(data.result);
    const parsed = (0, transactions_1.cvToValue)(clarityValue, true);
    return normalizeLeaderboardValue(parsed);
}
function createTapCall(config = {}) {
    const resolved = resolveConfig(config);
    return {
        contractAddress: resolved.contractAddress,
        contractName: resolved.contractName,
        functionName: "tap",
        functionArgs: [],
        postConditionMode: transactions_1.PostConditionMode.Deny,
        postConditions: [],
        network: resolved.network,
    };
}
class ClickerClient {
    constructor(config = {}) {
        this.config = resolveConfig(config);
    }
    getTotalClicks() {
        return getTotalClicks(this.config);
    }
    getUserClicks(userAddress) {
        return getUserClicks(userAddress, this.config);
    }
    getLeaderboard() {
        return getLeaderboard(this.config);
    }
    createTapCall() {
        return createTapCall(this.config);
    }
}
exports.ClickerClient = ClickerClient;
