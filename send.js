const selectToken = (network, name) => {
  const mainnet = assets.find((asset) => asset.network === network);
  if (mainnet) {
    const token = mainnet.tokens.find((t) => t.name === name);
    return token;
  }
  return null;
};
const Send = async (toAddress, amount, networkName, tokenName) => {
  const { type, address, abi } = selectToken(networkName, tokenName);

  if (type === "erc20") {
    try {
      // 단위를 wei로 변환
      const tokenAmount = ethers.parseEther("1");

      const signer = new ethers.Wallet(pvk1, provider);
      // erc20 토큰 전송
      const contract = new ethers.Contract(address, abi, signer);
      console.log(36, "success");
      const tx = await contract.transfer(testAddr2, tokenAmount);
      console.log(38, "success");
      // 트랜잭션이 블록에 담길때까지 대기
      const receipt = await tx.wait();
      console.log(41, receipt);
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  } else {
    try {
      // cryptocurrency 전송

      // 이더단위를 wei로 변환
      const amount = ethers.parseEther("1");

      console.log(12, amount);
      const myBalance = await provider.getBalance(testAddr1);
      console.log(20, myBalance);

      const signer = new ethers.Wallet(pvk1, provider);
      const tx = { to: testAddr2, value: amount };
      const estGas = await provider.estimateGas(tx);
      // 예상 가스비를 이더단위로 변환
      const gas = ethers.formatEther(estGas);
      console.log(24, gas);

      // 트랜잭션 보내기
      const txReceipt = await signer.sendTransaction(tx);
      await txReceipt.wait();
      console.log(27, txReceipt);
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  }
};
