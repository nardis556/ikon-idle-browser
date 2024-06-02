import * as idex from "@idexio/idex-sdk";
import { setTimeout } from "timers/promises";
import { v1 as uuidv1 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const walletAddress = process.env.WALLET_ADDRESS as string;
const envConfigs: idex.RestAuthenticatedClientOptions = {
  baseURL: process.env.BASE_URL as string,
  chainId: Number(process.env.CHAIN_ID) as number,
  sandbox: process.env.SANDBOX === "true",
  apiKey: process.env.API_KEY as string,
  apiSecret: process.env.API_SECRET as string,
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY as string,
  exchangeContractAddress: process.env.EXCHANGE_CONTRACT_ADDRESS as string,
};

const authClient = new idex.RestAuthenticatedClient({
  ...envConfigs,
});

const getWalletNonce = () => ({
  nonce: uuidv1(),
  wallet: walletAddress,
});

const pubClient = authClient.public;

let loop = 1;

while (true) {
  try {
    await authClient.getDeposits({ ...getWalletNonce() });
    await authClient.getWithdrawals({ ...getWalletNonce() });
    await authClient.getOrders({ ...getWalletNonce() });
    await authClient.getFills({ ...getWalletNonce() });
    await authClient.getHistoricalPnL({ ...getWalletNonce() });
    await authClient.getFundingPayments({ ...getWalletNonce() });
    await authClient.getPositions({ ...getWalletNonce() });

    await pubClient.getExchange();
    await pubClient.getMarkets();
    await pubClient.getTickers();
    await pubClient.getOrderBookLevel2({ market: "BTC-USD" });
    await pubClient.getTrades({ market: "BTC-USD" });

    console.log(
      `${new Date()} Loop ${loop} completed successfully at ${new Date().toISOString()}`
    );
    loop++;
  } catch (e: any) {
    console.error(
      `${new Date()} Error in loop ${loop}: ${e.response ? e.response.data : e}`
    );
  }

  await setTimeout(2000);
}
