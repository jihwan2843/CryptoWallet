import axios from "axios";
import { ethers } from "ethers";
import { assets } from "./assets.js";
import { selectNetwork } from "./constants/index.js";

const balance = [{}];

const testAddr1 = process.env.TestAddr1;
const testAddr2 = process.env.TestAddr2;
const pvk1 = process.env.PVK1;
const apiKey = process.env.CoinGeckoAPIKey;

// coingecko 사이트에서 api를 사용하여 토큰 가격을 가지고 오는 코드
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
        // assets.js 파일에 tokens을 반복문으로 모두 찾기
        network.tokens.map(async (v) => {
          try {
            // 네이티브 토큰인경우(이더리움 네트워크에서는 네이티브 토큰이 이더리움이다 그 외의 경우에는 모두 ERC20 토큰이다
            if (v.type !== "erc20") {
              // 네이티브 토큰경우에는 ethers js에 제공하는 getBalance() 함수만으로 잔액 조회 가능
              const nativeBalance = await provider.getBalance(testAddr1);
              const tokenPrice = await getTokenPrice(v.apiId);
              return {
                name: v.name,
                balance: ethers.formatEther(nativeBalance),
                price: tokenPrice,
              };
            } else {
              // ERC20 토큰 자체가 컨트랙트이기 때문에 ERC20 토큰에 대한 정보를 불러오려면 컨트랙트 주소, abi, priver가 필요하다
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
