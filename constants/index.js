import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const POLYGON_RPC = process.env["POLYGON_INFURA_PROVIDER"];
export const ETHEREUM_RPC = process.env["ETHEREUM_INFURA_PROVIDER "];
export const SEPOLIA_RPC = process.env["SEPOLIA_INFURA_PROVIDER"];
