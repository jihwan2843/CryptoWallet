import { ethers } from "ethers";
import { selectNetwork } from "./constants/index.js";
import dotenv from "dotenv";
dotenv.config();

const pvk1 = process.env.PVK1;
const testAddr1 = process.env.TestAddr1;
const testAddr2 = process.env.TestAddr2;

// 지갑마다 거래내역을 불러오는 방식도 다르다 어떤지갑은 자기네 지갑을 사용하기 시작한 이후부터 거래내역을 나타내기도 하고
// 어떤 지갑은 과거의 거래내역도 불러오기도 한다. 여기서는 지갑을 사용하기 시작한 이후의 거래내역을 나타내기 위한 코드이다
// history.js는 네이티브 토큰과 ERC20토큰을 수신하는 경우에 출력하는 코드이다.
// 거래내역을 나타내기위해 DB를 사용을 하는것이 필요하다고 생각을 했다.
// 토큰을 전송을 할때 그 정보를 DB에 저장을 하고 수신하는 정보는 이벤트 구독을 활용하여 DB에 저장하는 방식으로 구현하는것이 좋겠다고 생각 했다.
let provider;
const balance = [];

function subscribe() {
  // 트랜잭션이 완료가 아닌 pending상태를 추적하여 수신하는 자금을 확인한다
  subscribeHistory("pending", receiveNativeToken);
  subscribeHistory(
    // ERC20을 전송을 하면 Transfer 이벤트가 발생하는데 그것을 추적을 하여 수신하는 자금을 확인한다
    // topics 배열을 포함한 객체를 전달해야 하기 때문에 중괄호가 필요
    { topics: [ethers.id("Transfer(address,address,uint256)")] },
    receiveERC20Token
  );
}

const subscribeHistory = (event, handler) => {
  provider = selectNetwork("Polygon");
  const signer = new ethers.Wallet(pvk1, provider);
  // provider.on은 handler를 계속 실행시켜 event를 처리할 수가 있다
  provider.on(event, handler);
};
// 실시간으로 발생되는 트랜잭션 해시들이다
const receiveNativeToken = async (txHash) => {
  try {
    // 트랜잭션 해시들 중에 to가 지갑주소와 같으면 지갑주소는 수신하는 계정이다
    provider = selectNetwork("Sepolia");
    //console.log(txHash);
    const tx = await provider.getTransaction(txHash);
    //console.log(tx);
    // tx.to.toLowerCase()가 null인 경우에는 에러가 발생하기 때문에
    // 조건문을 동시에 3개를 써야 한다.
    if (tx && tx.to && tx.to.toLowerCase() === testAddr2.toLowerCase()) {
      // 트랜잭션이 완료가 아닌 pending 상태인 트랜잭션 해시들의 정보를 가지고 왔기 때문에
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
// 실시간으로 발생되는 트랜잭션들의 log들이다
const receiveERC20Token = async (log) => {
  try {
    //console.log(log);
    const to = "0x" + log.topics[2].substring(26);
    const block = await provider.getBlock(log.blockNumber);
    if (to.toLowerCase() === testAddr2.toLowerCase()) {
      // log들 중에 to가 지갑주소계정이 같은게 있으면 지갑주소는 수신을 하는 계정이다
      const from = "0x" + log.topics[1].substring(26);
      // 로그 데이터 중에서 "uint256"을 decode한 데이터는 전송하는 자금량 이다
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
