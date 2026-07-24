import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

MODEL_PATH = "churn_model.pkl"

class ChurnPredictor:
    def __init__(self):
        self.model = None
        self._load_or_train_model()

    def _load_or_train_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            # Treinamento inicial com dados sintéticos baseados no comportamento de alunos
            np.random.seed(42)
            n_samples = 1000
            
            # Features: [frequencia_semanal, dias_sem_frequentar, idade, meses_de_matricula, pagamentos_atrasados]
            freq_semanal = np.random.uniform(0, 6, n_samples)
            dias_sem_frequentar = np.random.uniform(0, 30, n_samples)
            idade = np.random.randint(16, 70, n_samples)
            meses_matricula = np.random.randint(1, 36, n_samples)
            atrasos = np.random.randint(0, 5, n_samples)
            
            # Lógica de churn heurística para dados sintéticos
            churn_score = (dias_sem_frequentar * 0.1) + (atrasos * 0.3) - (freq_semanal * 0.4) - (meses_matricula * 0.05)
            y = (churn_score > 0.5).astype(int)
            
            X = pd.DataFrame({
                'freq_semanal': freq_semanal,
                'dias_sem_frequentar': dias_sem_frequentar,
                'idade': idade,
                'meses_matricula': meses_matricula,
                'atrasos': atrasos
            })
            
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.model.fit(X, y)
            joblib.dump(self.model, MODEL_PATH)

    def predict_risk(self, freq_semanal: float, dias_sem_frequentar: int, idade: int, meses_matricula: int, atrasos: int) -> dict:
        features = pd.DataFrame([[freq_semanal, dias_sem_frequentar, idade, meses_matricula, atrasos]],
                                columns=['freq_semanal', 'dias_sem_frequentar', 'idade', 'meses_matricula', 'atrasos'])
        
        probabilidade_churn = self.model.predict_proba(features)[0][1]
        risco_percentual = round(probabilidade_churn * 100, 2)
        
        if risco_percentual >= 70:
            nivel = "ALTO"
            acao = "Contatar o aluno imediatamente para reagendamento e oferta de incentivo."
        elif risco_percentual >= 40:
            nivel = "MEDIO"
            acao = "Enviar mensagem de engajamento no WhatsApp."
        else:
            nivel = "BAIXO"
            acao = "Manter acompanhamento padrão."

        return {
            "probabilidade_churn": risco_percentual,
            "nivel_risco": nivel,
            "acao_recomendada": acao
        }

churn_service = ChurnPredictor()
