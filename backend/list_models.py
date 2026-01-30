
import aiohttp
import asyncio
import json
from app.config import get_settings

async def list_models():
    settings = get_settings()
    api_key = settings.gemini_api_key_analysis
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    print(f"Querying models with Analysis Key...")
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status != 200:
                print(f"Error {resp.status}: {await resp.text()}")
                return
            
            data = await resp.json()
            models = data.get('models', [])
            print(f"Found {len(models)} models:")
            for m in models:
                if 'generateContent' in m.get('supportedGenerationMethods', []):
                     print(f" - {m['name']} (Supports generateContent)")

if __name__ == "__main__":
    asyncio.run(list_models())
