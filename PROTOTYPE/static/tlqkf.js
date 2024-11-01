document.getElementById("start-button").addEventListener("click", () => {
  // 제목과 장르를 사용자로부터 입력받는 방법을 추가할 수 있습니다.
  const title = "예시 제목"; // 여기서 제목을 설정
  const genre = "예시 장르"; // 여기서 장르를 설정

  fetch("http://127.0.0.1:5001/api/start_novel", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json' // JSON 데이터 전송
      },
      body: JSON.stringify({ title: title, genre: genre }) // 제목과 장르를 JSON 형태로 전송
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('네트워크 응답이 정상적이지 않습니다: ' + response.statusText);
      }
      return response.json(); // JSON 응답 파싱
  })
  .then(data => {
      console.log(data); // 응답 데이터 처리
      alert(data.message); // 성공 메시지 알림
  })
  .catch(error => {
      console.error('fetch 작업에 문제가 발생했습니다:', error);
      alert('에러가 발생했습니다. 다시 시도해 주세요.'); // 에러 발생 시 사용자에게 알림
  });
});
