[![npm](https://img.shields.io/npm/v/clicker-stacks-sdk?color=blueviolet)](https://www.npmjs.com/package/clicker-stacks-sdk) ![Stacks Mainnet](https://img.shields.io/badge/Stacks-Mainnet-blueviolet) ![license](https://img.shields.io/badge/license-MIT-blue)

# clicker-stacks-sdk

TypeScript SDK for interacting with the Clicker contract on Stacks.

## Installation

```bash
npm install clicker-stacks-sdk
```

## Usage

```ts
import { getLeaderboard, getTotalClicks, createTapCall } from "clicker-stacks-sdk";

const total = await getTotalClicks();
const leaderboard = await getLeaderboard();
const tx = createTapCall();
```

## License

MIT
