from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

f = open("novel.txt", "a")

# OpenAI API 키 설정 (.env 파일에서 가져옴)
openai.api_key = os.getenv("OPENAI_API_KEY")

# 소설의 설정 정보를 저장할 변수
conversation =[]

def chat_with_gpt4(messages, model="gpt-3.5-turbo"):
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            max_tokens=200,
            temperature=0.7,
        )
        print("API Response:", response)  # 디버깅을 위해 전체 응답 출력
        reply = response.choices[0].message['content'].strip()
        return reply
    except Exception as e:
        print("Error in OpenAI API call:", e)
        return "Error: Unable to generate response"

# 엔드포인트: 소설 시작 준비 (index 페이지 전환 없이 데이터 전달)
@app.route('/api/start_novel', methods=['POST'])
def start_novel():
    
    if request.method == 'OPTIONS':
        return '', 204

    data = request.json
    title = data.get("title")
    genre = data.get("genre")

    f.write("\n\n\ntitle : {}\ngenre : {}\n".format(title,genre))

    conversation.clear()
    conversation.append({"role": "system", "content": '''
        지금부터 책에 대해 사용자와 이야기를 나누어 볼거야. 몇 가지 조건이 있어.
        1. 이 책은 실제로 존재하는 것이 아니지만, 가상의 이야기가 이미 존재한다고 생각하고 이야기를 나누는 거야.
        2. 사용자를 친구라고 여기고 함께 수다떠는 듯이 친근한 말투로 해줘.
        3. 확정적인 말투로 해줘.
        4. 사용자와 번갈아가면서 이야기할거야. 그리고 반드시 100자 내로 문장을 완결해줘.
        5. 사용자와 gpt가 각각 5번씩 이야기했을 때 이야기의 전체적인 스토리가 완성되도록 스토리 진전도를 조절해줘.
        6. 사용자가 '이야기 끝'이라고 입력하면 5번을 무시하고 이야기를 끝내줘.
        7. 사용자에게 뭘 묻지말아줘.
        8. 작품의 분위기에 맞춰서 어투를 조절해줘
        9. 친구에게 이야기를 전해주듯이 알려주듯이 말해줘
    '''})
    conversation.append({"role": "system", "content": "반드시 전체적인 줄거리를 이야기하지 말고 초반부의 이야기를 작성해줘"})
    conversation.append({"role": "user", "content": f"지금부터 {title}이라는 제목의 책에 대해 이야기를 나누어 볼거야. 이 작품은 {genre} 장르의 소설이야."})
    try:
        intro_story = chat_with_gpt4(conversation)
        conversation.append({"role": "assistant", "content": intro_story})
        return jsonify({"message": "Novel setup complete", "intro_story": intro_story}), 200
    except Exception as e:
        print("Error in OpenAI API call:", e)
        return jsonify({"error": "Failed to generate initial story"}), 500

# 엔드포인트: 소설 이어서 쓰기 (index.html에서 호출)
@app.route('/api/continue_novel', methods=['POST', 'OPTIONS'])
def continue_novel():
    if request.method == 'OPTIONS':
        return '', 204

    if not conversation:
        return jsonify({"error": "Novel context not set"}), 400

    # 사용자 입력 추가
    user_input = request.json.get("message", "소설을  계속 써줘.")

    f.write("user : "+user_input+"\n")

    conversation.append({"role": "user", "content": user_input})

    # GPT-4에 대화 전달
    try:
        answer = chat_with_gpt4(conversation)

        f.write(" AI : "+answer+"\n")
        
        conversation.append({"role": "assistant", "content": answer})
        return jsonify({"content": answer}), 200
    except Exception as e:
        print("Error in OpenAI API call:", e)
        return jsonify({"error": "Failed to continue the novel"}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)