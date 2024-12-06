// 크롬 브라우저 IndexedDB에 저장하는 코드
const saveWallet = (walletAddress, pvk) => {
  // IndexedDB 데이터베이스 열기
  const dbRequest = indexedDB.open("myWallet", 1);
  // 데이터베이스 구조를 설정하는 함수
  dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("walletStore", { keyPath: "id" }); // 고유 키(id)를 설정한 오브젝트 스토어 생성

    // 데이터베이스 연결 성공 시 실행되는 함수
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("walletStore", "readwrite"); // 읽기/쓰기 모드로 트랜잭션 생성
      const store = transaction.objectStore("walletStore"); // 오브젝트 스토어 접근

      // IndexedDB에 저장할 데이터 (예: 암호화된 개인 키)
      const encryptedData = {
        id: walletAddress, // 고유 키 설정
        data: pvk, // 실제 저장할 암호화된 데이터
      };
    };

    // 데이터 저장
    store.put(encryptedData);
  };

  const getWallet = (walletAddress) => {
    // 저장된 데이터 가져오기 (id가 "encryptedKey"인 항목)
    const getRequest = store.get(walletAddress);

    getRequest.onsuccess = (event) => {
      const data = event.target.result;
      if (data) {
        console.log("Retrieved Data:", data);
      } else {
        console.log("No data found with the given key.");
      }
    };

    getRequest.onerror = (event) => {
      console.error("Error retrieving data:", event);
    };
  };
};
