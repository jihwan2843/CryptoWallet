import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

export const selectNetwork = (network) => {
  let provider;
  switch (network) {
    case "Polygon":
      provider = new ethers.JsonRpcProvider(
        process.env["POLYGON_ALLTHATNODE_RPC"]
      );
      break;
    case "Ethereum":
      provider = new ethers.JsonRpcProvider(
        process.env["ETHEREUM_ALLTHATNODE_RPC"]
      );
      break;
    case "Sepolia":
      provider = new ethers.JsonRpcProvider(
        process.env["SEPOLIA_JSONRPC_PROVIDER"]
      );
      break;
    default:
      console.log("there is no network");
      break;
  }

  return provider;
};
