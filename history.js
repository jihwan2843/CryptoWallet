import { ethers } from "ethers";
import { selectNetwork } from "./constants/index.js";
import dotenv from "dotenv";

dotenv.config();

const pvk1 = process.env.PVK1;
const testAddr1 = process.env.TestAddr1;
const testAddr2 = process.env.TestAddr2;

let provider;
const balance = [];

function subscribe() {
  subscribeHistory("pending", receiveNativeToken);
  subscribeHistory(
    // topics 배열을 포함한 객체를 전달해야 하기 때문에 중괄호가 필요
    { topics: [ethers.id("Transfer(address,address,uint256)")] },
    receiveERC20Token
  );
}

const subscribeHistory = (event, handler) => {
  provider = selectNetwork("Polygon");
  const signer = new ethers.Wallet(pvk1, provider);
  provider.on(event, handler);
};

const receiveNativeToken = async (txHash) => {
  try {
    provider = selectNetwork("Sepolia");
    //console.log(txHash);
    const tx = await provider.getTransaction(txHash);
    //console.log(tx);
    // tx.to.toLowerCase()가 null인 경우에는 에러가 발생하기 때문에
    // 조건문을 동시에 3개를 써야 한다.
    if (tx && tx.to && tx.to.toLowerCase() === testAddr2.toLowerCase()) {
      // 트랜잭션이 마이닝될 때까지 대기
      const receipt = await tx.wait();
      const block = await provider.getBlock(receipt.blockNumber);
      // 블록 번호를 가지고 타임스탬프를 가져옴
      balance.push({ to: testAddr2, value: tx.value, time: block.timestamp });
      console.log(balance);
    }
  } catch (error) {
    console.error(error);
  }
};
const receiveERC20Token = async (log) => {
  try {
    //console.log(log);
    const to = "0x" + log.topics[2].substring(26);
    const block = await provider.getBlock(log.blockNumber);
    if (to.toLowerCase() === testAddr2.toLowerCase()) {
      const from = "0x" + log.topics[1].substring(26);
      const parsedLog = new ethers.AbiCoder().decode(["uint256"], log.data);
      const value = ethers.formatEther(parsedLog[0]);
      balance.push({ from, to, value, time: block.timestamp });
      console.log(balance);
    }
  } catch (error) {
    console.error(error);
  }
};

subscribe();
