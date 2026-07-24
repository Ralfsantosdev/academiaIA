import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    api_key = api_key.strip().strip('"').strip("'")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}
payload = {
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "hello"}],
    "max_tokens": 5
}
try:
    resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    print("Status:", resp.status_code)
    print("Body:", resp.text)
except Exception as e:
    print(e)
