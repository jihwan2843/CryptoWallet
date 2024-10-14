// 새로운 지갑 만들기
const newWallet = ethers.Wallet.createRandom();
// address
console.log(newWallet.address);
// pk
console.log(newWallet.privateKey);
// mnemonic
console.log(newWallet.mnemonic.phrase);

// 시드 문구로 지갑 만들기
const myWallet = ethers.Wallet.fromPhrase(seedPhrase);
console.log("new wallet", myWallet);

async function encryptPassword(password) {
  // 첫 번째 단계: PBKDF2로 키 파생
  const salt1 = crypto.randomBytes(16); // 1. 소금값(Salt) 생성
  const iterations = 200000; // 2. 반복 횟수 설정 (반복 횟수가 클수록 보안성이 강화됨)
  const keyLength = 32; // 3. 생성할 키의 길이 설정 (256비트, 32바이트)
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt1,
    iterations,
    keyLength,
    "sha256"
  ); // 4. PBKDF2를 사용해 비밀번호로부터 키 파생
  const passwd = derivedKey.toString("hex");
  return passwd;
}
(async () => {
  // 사용자가 설정한 비밀번호
  const passwd = await encryptWallet(); // 암호화된 JSON과 소금값 저장

  // 지갑을 암호화
  const encryptedJSON = await newWallet.encrypt(passwd);
  console.log(encryptedJSON);
  // 지갑 주소는 사용자가 입력하여 로컬 스토리지의 key로 사용한다.
  let walletName;
  // 크롬 로컬 스토리지에 저장
  //localStorage.setItem(walletName, encryptedJSON);
  // 크롬 로컬 스토리지에서 암호화 된 지갑객체 가지고 오기
  // const encryptedJson = localStorage.getItem(walletName);

  // 지갑을 복호화
  const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, passwd);
  console.log(wallet);
  console.log("Encrypted Wallet JSON:", passwd); // 암호화된 JSON 출력
})();
