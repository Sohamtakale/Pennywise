import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    def __init__(self):
        # In a real app, this comes from secure storage or env
        # For this prototype, we'll try to load from env, else use the provided key temporarily if needed
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
             # Fallback for the hackathon demo if .env isn't set up yet by the user manually
             # Ideally this is passed during init
             pass
        
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    def configure(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        if not self.model:
            return "Error: API Key not configured."
        
        full_prompt = prompt
        if system_instruction:
            full_prompt = f"{system_instruction}\n\nUser: {prompt}"

        try:
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f"AI Error: {str(e)}"

gemini_client = GeminiClient()
