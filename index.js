import { ethers } from "ethers";
import axios from "axios";
import crypto from "crypto";

//const provider = new ethers.InfuraProvider("matic");
const provider = new ethers.AlchemyProvider("matic");
//const provider = new ethers.AlchemyProvider("sepolia");

const apiKey = process.env.CoinGeckoAPIKey;
const balance = [{}];
const getTokenPrice = () => {
  const options = {
    method: "GET",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd",
    headers: {
      accept: "application/json",
      "x-cg-pro-api-key": apiKey,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
};
const main = () => {};
getTokenPrice();
