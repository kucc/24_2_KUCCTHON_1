const oracledb = require("oracledb");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the client foldera
app.use(express.static("client"));

// Oracle Database connection details
const dbConfig = {
  user: "your_username",
  password: "your_password",
  connectString: "your_connect_string",
};

// Route to test Oracle database connection
app.get("/api/test", async (req, res) => {
  let connection;

  try {
    // Connect to the database
    connection = await oracledb.getConnection(dbConfig);

    // Query example
    const result = await connection.execute("SELECT * FROM your_table_name");
    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Error connecting to the database");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

// Route to interact with OpenAI API
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // OpenAI API 키는 .env 파일에 설정
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // 필요한 경우 모델 업데이트
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
        n: 1,
        stop: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // 응답에서 특정 데이터만 반환
    res.json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Basic route to test the server
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
