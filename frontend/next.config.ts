/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    PREDICTION_MARKET_CONTRACT: process.env.PREDICTION_MARKET_CONTRACT || "0x98cAbC5317F0d9BF14A9dD50860aC3B3BfC4E3B1",
    AGENT_STACK_ADDRESS: process.env.AGENT_STACK_ADDRESS || "0x6d7298b17f7e3007bf466df577006439c175f111",
  },
};

export default nextConfig;
