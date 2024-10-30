import { ethers } from "ethers";
import express from "express";
import dotenv from "dotenv";
import { getBalance } from "./getBalance.js";
import { Send } from "./send.js";

dotenv.config();

const app = express();

const port = 3010;

const testAddr1 = process.env.TestAddr1;
const testAddr2 = process.env.TestAddr2;
const pvk1 = process.env.PVK1;
const apiKey = process.env.CoinGeckoAPIKey;
const balance = [{}];

let provider;
app.get("/getBalance", async (req, res) => {
  const result = await getBalance();

  return res.json(result);
});

app.get("/send", async (req, res) => {
  const result = await Send(testAddr2, "0.1", "Polygon", "MATIC");
  return res.json(result);
});

app.listen(port);
