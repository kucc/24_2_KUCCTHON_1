document
  .getElementById("start-link")
  .addEventListener("click", async (event) => {
    event.preventDefault(); // 기본 링크 동작을 막고 커스텀 동작 수행

    const title = document.getElementById("title").value;
    const genre = document.getElementById("genre").value;

    if (!title || !genre) {
      alert("제목과 장르를 모두 입력해주세요.");
      return;
    }

    try {
      // 로컬 스토리지에 title과 genre 저장
      localStorage.setItem("title", title);
      localStorage.setItem("genre", genre);

      // 소설 시작 설정을 백엔드에 전달
      const response = await fetch("http://localhost:5001/api/start_novel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, genre }),
      });

      if (response.ok) {
        // 소설 설정이 완료되면 index.html로 이동
        window.location.href = "index.html";
      } else {
        alert("소설 시작 설정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버에 문제가 발생했습니다.");
    }
  });
