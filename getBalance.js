const balance = [{}];
const getBalance = async () => {
  try {
    // 속도를 높이기 위해 비동기 작업을 병렬로 처리하기
    const balancePromise = assets.map(async (network) => {
      const networkBalance = await Promise.all(
        network.tokens.map(async (v) => {
          try {
            if (v.type !== "erc20") {
              const nativeBalance = await provider.getBalance(testAddr2);
              return { name: v.name, balance: nativeBalance };
            } else {
              const tokenContract = new ethers.Contract(
                v.address,
                v.abi,
                provider
              );
              const tokenBalance = await tokenContract.balanceOf(testAddr2);
              // tokenBalance의 타입이 BigInt라서 0n으로 해야함
              if (tokenBalance !== 0n) {
                return {
                  name: v.name,
                  balance: tokenBalance,
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
  } catch (error) {
    console.error(error);
  }
};
