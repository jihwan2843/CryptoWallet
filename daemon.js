import { ethers } from "ethers";
import { ETHEREUM_RPC, POLYGON_RPC, SEPOLIA_RPC } from "./constants/index.js";

export const POLYGON_PROVIDER = new ethers.JsonRpcProvider(POLYGON_RPC);
export const ETHEREUM_PROVIDER = new ethers.JsonRpcProvider(ETHEREUM_RPC);
export const SEPOLIA_PROVIDER = new ethers.InfuraProvider(SEPOLIA_RPC);
