const {
  PostConditionMode,
  cvToValue,
  hexToCV,
  principalCV,
  serializeCV,
} = require("@stacks/transactions");
const { STACKS_MAINNET } = require("@stacks/network");

const DEFAULT_CONFIG = {
  contractAddress: "SP1Q7YR67R6WGP28NXDJD1WZ11REPAAXRJJ3V6RKM",
  contractName: "clicker",
  apiBase: "https://api.mainnet.hiro.so",
  network: STACKS_MAINNET,
};

function resolveConfig(overrides = {}) {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function serializeCvToHex(cv) {
  const serialized = serializeCV(cv);
  if (typeof serialized === "string") {
    return serialized.startsWith("0x") ? serialized : `0x${serialized}`;
  }
  return `0x${Buffer.from(serialized).toString("hex")}`;
}

async function callReadOnly(functionName, args = [], config = {}) {
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

  return response.json();
}

function normalizeLeaderboardValue(raw) {
  const entries = Array.isArray(raw) ? raw : [];
  return entries
    .map((item) => {
      const entry = item && typeof item === "object" && "value" in item ? item.value : item;
      return {
        who: String(entry?.who?.value ?? entry?.who ?? ""),
        clicks: Number(entry?.clicks?.value ?? entry?.clicks ?? 0),
      };
    })
    .filter((entry) => entry.who && entry.clicks > 0);
}

async function getTotalClicks(config = {}) {
  const data = await callReadOnly("get-total-clicks", [], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true);
  return Number(parsed?.value ?? parsed ?? 0);
}

async function getUserClicks(userAddress, config = {}) {
  const principalArg = serializeCvToHex(principalCV(userAddress));
  const data = await callReadOnly("get-user-clicks", [principalArg], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true);
  return Number(parsed?.value ?? parsed ?? 0);
}

async function getLeaderboard(config = {}) {
  const data = await callReadOnly("get-leaderboard", [], config);
  if (!data.okay || !data.result) {
    return [];
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true);
  return normalizeLeaderboardValue(parsed);
}

function createTapCall(config = {}) {
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

module.exports = {
  DEFAULT_CONFIG,
  callReadOnly,
  createTapCall,
  getLeaderboard,
  getTotalClicks,
  getUserClicks,
};
