import express from "express";
import { ethers } from "ethers";
import { assets } from "./assets.js";

const app = express();

const port = 3010;

//const provider = new ethers.InfuraProvider("matic");
const provider = new ethers.AlchemyProvider("matic");
//const provider = new ethers.AlchemyProvider("sepolia");
let testAddr1;
let testAddr2;
let pvk1;

const balance = [{}];
