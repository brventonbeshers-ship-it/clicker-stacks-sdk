# clicker-stacks-sdk

JavaScript SDK for interacting with the Clicker contract on Stacks.

## Installation

```bash
npm install clicker-stacks-sdk
```

## Usage

```js
const { getLeaderboard, getTotalClicks, createTapCall } = require("clicker-stacks-sdk");

const total = await getTotalClicks();
const leaderboard = await getLeaderboard();
const tx = createTapCall();
```

## License

MIT
