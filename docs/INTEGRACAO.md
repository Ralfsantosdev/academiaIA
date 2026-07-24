# Exemplos de Integração da API de IA

Abaixo estão os exemplos práticos de integração com a API `academia-ia-core`, tanto no Frontend quanto no Backend.

## 🎨 1. Integração no Frontend (React / Next.js / Vue / JS Vanilla)

Você pode criar uma função utilitária para chamar a API de IA a partir dos seus componentes ou formulários.

### Exemplo em JavaScript/TypeScript (para React/Web):

```javascript
// services/iaService.js

const IA_API_BASE_URL = process.env.REACT_APP_IA_SERVICE_URL || 'http://localhost:8000/api/v1/ia';

/**
 * Consulta a probabilidade de Churn de um aluno
 */
export async function verificarRiscoChurn(dadosAluno) {
  try {
    const response = await fetch(`${IA_API_BASE_URL}/churn/predicao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aluno_id: dadosAluno.id,
        freq_semanal_media: dadosAluno.frequenciaSemanal,
        dias_sem_frequentar: dadosAluno.diasSemVir,
        idade: dadosAluno.idade,
        meses_matricula: dadosAluno.mesesMatricula,
        pagamentos_atrasados: dadosAluno.qtdAtrasos,
      }),
    });

    if (!response.ok) throw new Error('Erro ao consultar IA de Churn');
    return await response.json();
  } catch (error) {
    console.error('Erro na IA de Churn:', error);
    return null;
  }
}

/**
 * Solicita a geração de uma sugestão de ficha de treino
 */
export async function gerarSugestaoTreino(parametrosTreino) {
  try {
    const response = await fetch(`${IA_API_BASE_URL}/treino/gerar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aluno_id: parametrosTreino.alunoId,
        objetivo: parametrosTreino.objetivo, // ex: "hipertrofia"
        nivel: parametrosTreino.nivel,       // ex: "intermediario"
        dias_por_semana: parametrosTreino.diasPorSemana,
        restricoes: parametrosTreino.restricoes || [], // ex: ["joelho"]
      }),
    });

    if (!response.ok) throw new Error('Erro ao gerar treino na IA');
    return await response.json();
  } catch (error) {
    console.error('Erro no Gerador de Treino:', error);
    return null;
  }
}
```

### Exemplo de uso num componente React (Card do Aluno na Recepção):

```jsx
import React, { useState } from 'react';
import { verificarRiscoChurn } from './services/iaService';

export function CardAluno({ aluno }) {
  const [analiseIa, setAnaliseIa] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleAnalisarRisco = async () => {
    setCarregando(true);
    const resultado = await verificarRiscoChurn(aluno);
    setAnaliseIa(resultado);
    setCarregando(false);
  };

  return (
    <div className="card-aluno">
      <h3>{aluno.nome}</h3>
      <button onClick={handleAnalisarRisco} disabled={carregando}>
        {carregando ? 'Analisando...' : 'Verificar Risco de Cancelamento'}
      </button>

      {analiseIa && (
        <div className={`alerta-churn risco-${analiseIa.nivel_risco.toLowerCase()}`}>
          <p><strong>Risco de Churn:</strong> {analiseIa.probabilidade_churn}% ({analiseIa.nivel_risco})</p>
          <p><strong>Recomendação:</strong> {analiseIa.acao_recomendada}</p>
        </div>
      )}
    </div>
  );
}
```

## ⚙️ 2. Integração Backend a Backend (Node.js / Express / NestJS)

Se você preferir que o seu backend principal consulte a Engine de IA para gravar o status de risco no banco de dados da academia antes de responder ao cliente, faça uma requisição HTTP interna:

### Exemplo em Node.js (usando Axios):

```javascript
const axios = require('axios');

async function calcularEGravarChurnAluno(alunoId) {
  // 1. Busca os dados de frequência e histórico financeiro no seu banco PostgreSQL/MySQL
  const alunoDadosBD = await buscarDadosHistoricosAlunoDoBD(alunoId);

  // 2. Chama a Engine de IA
  const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://localhost:8000';
  const responseIa = await axios.post(`${IA_SERVICE_URL}/api/v1/ia/churn/predicao`, {
    aluno_id: alunoId,
    freq_semanal_media: alunoDadosBD.frequencia_media,
    dias_sem_frequentar: alunoDadosBD.dias_ausente,
    idade: alunoDadosBD.idade,
    meses_matricula: alunoDadosBD.meses_ativo,
    pagamentos_atrasados: alunoDadosBD.faturas_atrasadas
  });

  const { probabilidade_churn, nivel_risco, acao_recomendada } = responseIa.data;

  // 3. Atualiza a tabela 'alunos' com os insights calculados pela IA
  await atualizarStatusIaAlunoBD(alunoId, {
    probabilidade_churn,
    nivel_risco,
    acao_recomendada
  });

  return responseIa.data;
}
```

## 🔒 3. Recomendações para Produção

- **Variáveis de Ambiente**: Nunca deixe URLs fixas no código (como `http://localhost:8000`). Armazene no `.env` do seu projeto (ex: `IA_SERVICE_URL=https://ia.suaacademia.com.br`).
- **CORS (Cross-Origin Resource Sharing)**: Como o seu frontend estará em uma porta/domínio e o FastAPI estará em outro (ex: `:8000`), garanta que o suporte a CORS está ativo no FastAPI se for fazer requisições diretamente do navegador. No `academia-ia-core`, o CORS pode ser configurado no `app/main.py`.
