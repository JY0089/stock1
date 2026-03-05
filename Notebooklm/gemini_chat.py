"""
Gemini AI Chat - Google Search + Thinking Mode
Google AI Studio 코드를 기반으로 한 대화형 스크립트

사용법:
  1. GEMINI_API_KEY 환경변수 설정 또는 아래 API_KEY에 직접 입력
  2. python gemini_chat.py
"""

import os
from google import genai
from google.genai import types


# ─── 설정 ───────────────────────────────────────────
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDaf_ppoEsThTBxE46GQjgkHDwQndeSKbk")
MODEL   = "gemini-2.5-flash-preview-04-17"   # gemini-3-flash-preview (미출시) 대신 최신 안정 모델
# ────────────────────────────────────────────────────


def ask(question: str, thinking_level: str = "HIGH") -> None:
    """Gemini에 질문하고 스트리밍으로 답변 출력"""
    client = genai.Client(api_key=API_KEY)

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=question)],
        )
    ]

    tools = [types.Tool(googleSearch=types.GoogleSearch())]

    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level=thinking_level),
        tools=tools,
    )

    print(f"\n🤖 Gemini ({MODEL}) 답변:\n{'─'*50}")
    for chunk in client.models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=config,
    ):
        if chunk.text:
            print(chunk.text, end="", flush=True)
    print(f"\n{'─'*50}")


def main():
    print("=" * 50)
    print("  Gemini AI Chat  (Google Search + Thinking)")
    print("  종료: 'quit' 또는 Ctrl+C")
    print("=" * 50)

    if API_KEY == "여기에_API_키_입력":
        print("\n⚠️  API 키를 설정해주세요!")
        print("   방법 1: API_KEY 변수에 직접 입력")
        print("   방법 2: 환경변수 GEMINI_API_KEY 설정\n")
        return

    while True:
        try:
            question = input("\n💬 질문: ").strip()
            if not question:
                continue
            if question.lower() in ("quit", "exit", "종료"):
                print("종료합니다.")
                break
            ask(question)
        except KeyboardInterrupt:
            print("\n\n종료합니다.")
            break
        except Exception as e:
            print(f"\n❌ 오류: {e}")


if __name__ == "__main__":
    main()
