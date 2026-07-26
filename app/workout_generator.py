import json
import requests
from typing import List
from app.config import settings

class WorkoutEngine:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY

    def _sanitize_error(self, msg: str) -> str:
        if self.api_key and self.api_key in msg:
            msg = msg.replace(self.api_key, "sk-***")
        return msg

    def generate(self, objetivo: str, nivel: str, restricoes: List[str], dias_por_semana: int) -> dict:
        if not self.api_key or self.api_key.startswith("sk-proj-xxxx") or self.api_key == "sua-chave-aqui":
            return {
                "objetivo": objetivo,
                "nivel": nivel,
                "frequencia_semanal_sugerida": f"{dias_por_semana}x",
                "restricoes_consideradas": ["Erro: Chave OPENAI_API_KEY inválida ou não configurada no .env"],
                "plano_treino": []
            }

        sys_prompt = (
            "Você é um personal trainer especialista de elite em montar treinos de musculação. "
            "Você recebe o objetivo do aluno, o nível de experiência, os dias que ele pode treinar e suas restrições médicas. "
            "Gere uma ficha de treino REALISTA E COMPLETA, dividida pelo número de dias (ex: Treino A, Treino B, Treino C, etc). "
            "Tenha muito cuidado com as restrições médicas para evitar lesões. "
            "Retorne APENAS um objeto JSON válido, sem formatação markdown extra, no seguinte formato exato:\n"
            "{\n"
            '  "objetivo": "...",\n'
            '  "nivel": "...",\n'
            '  "frequencia_semanal_sugerida": "...",\n'
            '  "restricoes_consideradas": ["..."],\n'
            '  "plano_treino": [\n'
            "    {\n"
            '      "grupo_muscular": "...", // ex: "Treino A - Peito e Tríceps"\n'
            '      "exercicios": [\n'
            "        {\n"
            '          "nome": "...",\n'
            '          "series": 3,\n'
            '          "repeticoes": "...",\n'
            '          "descanso_seg": 60,\n'
            '          "restricao": "..." // Apenas inclua esta chave se o exercício foi adaptado (ex: "Adaptado para dor no joelho")\n'
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        
        user_prompt = (
            f"Objetivo: {objetivo}\n"
            f"Nível: {nivel}\n"
            f"Dias por semana: {dias_por_semana}\n"
            f"Restrições médicas/lesões: {', '.join(restricoes) if restricoes else 'Nenhuma'}\n"
        )
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": "gpt-4.1-nano",
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7
        }
        
        try:
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            result_text = data["choices"][0]["message"]["content"]
            return json.loads(result_text)
            
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    if "error" in error_data and "message" in error_data["error"]:
                        error_msg = self._sanitize_error(error_data["error"]["message"])
                except:
                    pass
                    
            return {
                "objetivo": objetivo,
                "nivel": nivel,
                "frequencia_semanal_sugerida": f"{dias_por_semana}x por semana",
                "restricoes_consideradas": [f"Erro da OpenAI: {error_msg}"],
                "plano_treino": []
            }
        except Exception as e:
            return {
                "objetivo": objetivo,
                "nivel": nivel,
                "frequencia_semanal_sugerida": f"{dias_por_semana}x por semana",
                "restricoes_consideradas": [f"Erro interno: {str(e)}"],
                "plano_treino": []
            }

workout_service = WorkoutEngine()
