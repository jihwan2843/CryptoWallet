import axios from "axios";
import { ethers } from "ethers";
import { assets } from "./assets.js";
import { selectNetwork } from "./constants/index.js";

const balance = [{}];

const testAddr1 = process.env.TestAddr1;
const testAddr2 = process.env.TestAddr2;
const pvk1 = process.env.PVK1;
const apiKey = process.env.CoinGeckoAPIKey;

const getTokenPrice = async (apiId) => {
  const options = {
    method: "GET",
    url: `https://api.coingecko.com/api/v3/simple/price?ids=${apiId}&vs_currencies=usd`,
    headers: {
      accept: "application/json",
      "x-cg-pro-api-key": apiKey,
    },
  };
  try {
    const response = await axios.request(options);
    //console.log(response.data[apiId].usd);
    return response.data[apiId].usd;
  } catch (error) {
    console.error(error);
  }
};
export const getBalance = async () => {
  const provider = selectNetwork("Polygon");

  try {
    // 속도를 높이기 위해 비동기 작업을 병렬로 처리하기
    const balancePromise = assets.map(async (network) => {
      const networkBalance = await Promise.all(
        network.tokens.map(async (v) => {
          try {
            if (v.type !== "erc20") {
              const nativeBalance = await provider.getBalance(testAddr1);
              const tokenPrice = await getTokenPrice(v.apiId);
              return {
                name: v.name,
                balance: ethers.formatEther(nativeBalance),
                price: tokenPrice,
              };
            } else {
              const tokenContract = new ethers.Contract(
                v.address,
                v.abi,
                provider
              );
              const tokenBalance = await tokenContract.balanceOf(testAddr1);

              const tokenPrice = await getTokenPrice(v.apiId);
              // tokenBalance의 타입이 BigInt라서 0n으로 해야함
              if (tokenBalance !== 0n) {
                return {
                  name: v.name,
                  balance: ethers.formatUnits(tokenBalance, v.decimals),
                  price: tokenPrice,
                };
              }

              return null;
            }
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );

      return networkBalance.filter((balance) => balance !== null);
    });

    const result = await Promise.all(balancePromise);
    const flatResult = result.flat();
    flatResult.forEach((result) => balance.push(result));

    console.log(balance);
    return balance;
  } catch (error) {
    console.error(error);
  }
};

//getBalance();
