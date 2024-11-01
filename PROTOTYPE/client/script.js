// 로컬 스토리지에서 title과 genre 가져오기
const title = localStorage.getItem("title");
const genre = localStorage.getItem("genre");

if (title && genre) {
  console.log("Title:", title);
  console.log("Genre:", genre);
} else {
  console.error("Title or genre not found in local storage.");
}

// 페이지 로드 시 초기 이야기를 가져옴
document.addEventListener("DOMContentLoaded", getInitialStory);

function getInitialStory() {
  fetch("http://localhost:5001/api/start_novel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title, genre: genre }), // 실제 사용자 입력값을 전달
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.intro_story) {
        addMessage("bot-message", data.intro_story);
      } else {
        addMessage("bot-message", "초기 이야기를 불러올 수 없습니다");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      addMessage(
        "bot-message",
        "초기 이야기를 불러오는 중 오류가 발생했습니다."
      );
    });
}

// Enter 키로 메시지 전송
document
  .getElementById("userInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // 기본 Enter 동작 방지
      sendMessage(); // 메시지 전송
    }
  });

function sendMessage() {
  console.log("sendMessage() 함수가 호출되었습니다."); // 디버깅용 로그
  const input = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  const userMessage = input.value.trim();
  if (userMessage) {
    // 사용자 메시지를 대화창에 추가
    const userMessageDiv = document.createElement("div");
    userMessageDiv.className = "user-message";
    userMessageDiv.textContent = userMessage;
    chatWindow.appendChild(userMessageDiv);

    // 입력칸 초기화
    input.value = "";
    restorePlaceholder();

    console.log("Sending message to backend:", userMessage);

    // 서버에 사용자 메시지 전송
    fetch("http://localhost:5001/api/continue_novel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received response from backend:", data);

        // 서버 응답 메시지를 대화창에 추가
        const botMessageDiv = document.createElement("div");
        botMessageDiv.className = "bot-message";
        botMessageDiv.textContent = data.content;
        chatWindow.appendChild(botMessageDiv);

        // 새 메시지가 보이도록 스크롤
        chatWindow.scrollTop = chatWindow.scrollHeight;
      })
      .catch((error) => {
        console.error("Error:", error);
        const errorMessageDiv = document.createElement("div");
        errorMessageDiv.className = "bot-message";
        errorMessageDiv.textContent = "오류가 발생했습니다. 다시 시도해주세요.";
        chatWindow.appendChild(errorMessageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
      });
  }
}

// 소설 이어쓰기 버튼 클릭 시 실행되는 함수
function continueNovel() {
  const userInput =
    document.getElementById("userInput").value || "소설을 계속 써줘.";

  fetch("http://localhost:5001/api/continue_novel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userInput }), // message 데이터를 포함시킴
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        addMessage(
          "bot-message",
          "소설 이어쓰기에 실패했습니다: " + data.error
        );
      } else {
        addMessage("bot-message", data.content);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      addMessage("bot-message", "소설 이어쓰기에 실패했습니다.");
    });
}

function addMessage(className, message) {
  const chatWindow = document.getElementById("chatWindow");
  const messageElement = document.createElement("div");
  messageElement.className = className;
  messageElement.innerText = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // 새 메시지가 보이도록 스크롤
}

function clearPlaceholder() {
  const input = document.getElementById("userInput");
  input.placeholder = "";
}

function restorePlaceholder() {
  const input = document.getElementById("userInput");
  input.placeholder = "입력하세요";
}
