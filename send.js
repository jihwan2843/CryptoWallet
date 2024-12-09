import axios from "axios";
import { ethers } from "ethers";
import { assets } from "./assets.js";
import dotenv from "dotenv";
import { Transaction } from "ethers";
import { selectNetwork } from "./constants/index.js";

dotenv.config();

const balance = [{}];

const testAddr1 = process.env.TestAddr1;
const testAddr2 = process.env.TestAddr2;
const pvk1 = process.env.PVK1;
const apiKey = process.env.CoinGeckoAPIKey;

const selectToken = (network, name) => {
  const mainnet = assets.find((asset) => asset.network === network);
  if (mainnet) {
    const token = mainnet.tokens.find((t) => t.name === name);
    return token;
  }
  return null;
};
export const Send = async (toAddress, amount, networkName, tokenName) => {
  const provider = selectNetwork(networkName);
  const { type, decimals, address, abi } = selectToken(networkName, tokenName);

  if (type === "erc20") {
    try {
      // 단위를 wei로 변환
      const tokenAmount = ethers.parseUnits("0.1", Number(decimals)); // USDT는 decimals가 6이기 때문에 parseUnits를 사용.

      const signer = new ethers.Wallet(pvk1, provider);
      // erc20 토큰 전송
      const contract = new ethers.Contract(address, abi, signer);

      // 내 잔액 보여주기
      const myBalance = await contract.balanceOf(testAddr1);

      /**
       * 조건문 넣어줘야 함 if(amount > myBalance)
       */

      const contractAddr = await contract.getAddress();
      console.log(typeof contractAddr, contractAddr);
      // 거래 정보
      const tx = new Transaction({
        to: contractAddr,
        data: contract.interface.encodeFunctionData("transfer", [
          testAddr2,
          tokenAmount,
        ]),
      });

      // 최대 가스 가격
      const maxGasPrice = (await provider.getFeeData()).maxFeePerGas;

      // // 예상 트랜잭션 가스량
      const estGasAmount = await provider.estimateGas(tx);

      // 예상 최대 가스비
      const estGas = ethers.formatEther(maxGasPrice * estGasAmount);
      console.log(85, estGas);

      const txResponse = await contract.transfer(testAddr2, tokenAmount);

      // 트랜잭션이 블록에 담길때까지 대기
      const txReceipt = await txResponse.wait();
      console.log(50, txReceipt);
      const txHash = txReceipt.hash;

      console.log(53, txHash);
      // 조건문이 만족하면 트랜잭션이 성공
      if (txReceipt && (await txReceipt.status) === 1) {
        console.log("success");
        // 트랜잭션이 성공하면 이 사이트로 이동할 수 있는 기능을 프론트에서 만들어야 함. `https://sepolia.etherscan.io/tx/${txHash}`

        // 사용된 가스량
        const gasUsed = txReceipt.gasUsed;
        // 적용된 가스 가격
        const gasPrice = txReceipt.gasPrice;
        // 사용된 총 가스비
        const totalGas = ethers.formatEther(gasUsed * gasPrice);
        const a = [{ to: txReceipt.to, from: txReceipt.from, amount: amount }];
        return a;
      } else {
        console.log("failed");
      }
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  } else {
    try {
      // cryptocurrency 전송

      // 이더단위를 wei로 변환
      const txAmount = ethers.parseEther("0.01");

      const myBalance = await provider.getBalance(testAddr1);

      /* 조건문 달아야 함. 보내는 돈이 내 잔액보다 많아야함
      if(amount > myBalance)
      */
      const signer = new ethers.Wallet(pvk1, provider);
      const tx = { to: testAddr2, value: txAmount };

      // 최대 가스 가격
      const maxGasPrice = (await provider.getFeeData()).maxFeePerGas;
      // 예상 트랜잭션 가스량
      const estGasAmount = await provider.estimateGas(tx);
      // 예상 최대 가스비
      const estGas = ethers.formatEther(maxGasPrice * estGasAmount);
      console.log(85, estGas);

      // 트랜잭션 보내기
      const txResponse = await signer.sendTransaction(tx);
      console.log(118, txResponse);
      const txReceipt = await txResponse.wait();
      console.log(90, txReceipt);
      const txHash = txReceipt.hash;

      // 조건문이 만족하면 트랜잭션이 성공
      if (txReceipt && (await txReceipt.status) === 1) {
        console.log("success");
        // 트랜잭션이 성공하면 이 사이트로 이동할 수 있는 기능을 프론트에서 만들어야 함. `https://sepolia.etherscan.io/tx/${txHash}`

        // 사용된 가스량
        const gasUsed = txReceipt.gasUsed;
        // 적용된 가스 가격
        const gasPrice = txReceipt.gasPrice;
        // 사용된 총 가스비
        const totalGas = ethers.formatEther(gasUsed * gasPrice);
        const a = [{ to: txReceipt.to, from: txReceipt.from, amount: amount }];
        return a;
      } else {
        console.log("failed");
      }
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  }
};
// 거래 전에 예상 가스비, 최대 가스비 , 총 금액을 보여줘야 함
//Send("", "", "Sepolia", "SAND");

// 거래 가속화 하기
async function accelerateTx() {
  const tx = await provider.getTransaction(txResponse);
  const newGasPrice = tx.gasPrice.mul(110).div(100); // 10% 증가

  const speedUpTx = {
    to: tx.to,
    from: tx.from,
    nonce: tx.nonce,
    value: tx.value,
    data: tx.data,
    gasLimit: tx.gasLimit,
    gasPrice: newGasPrice,
  };

  return await signer.sendTransaction(speedUpTx);
}

// 거래 취소하기
async function cancelTx() {
  const tx = await provider.getTransaction(txResponse);
  const newGasPrice = tx.gasPrice.mul(110).div(100); // 10% 증가

  const cancelTx = {
    to: await signer.getAddress(), // 자신의 주소
    from: await signer.getAddress(),
    nonce: tx.nonce,
    value: 0, // 0 ETH 전송
    gasLimit: 21000, // 기본 전송에 필요한 가스
    gasPrice: newGasPrice,
  };

  return await signer.sendTransaction(cancelTx);
}
