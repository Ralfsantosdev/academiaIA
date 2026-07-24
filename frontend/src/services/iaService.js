export const IA_API_BASE_URL = 'http://localhost:8000/api/v1/ia';

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
        objetivo: parametrosTreino.objetivo,
        nivel: parametrosTreino.nivel,
        dias_por_semana: parametrosTreino.diasPorSemana,
        restricoes: parametrosTreino.restricoes || [],
      }),
    });

    if (!response.ok) throw new Error('Erro ao gerar treino na IA');
    return await response.json();
  } catch (error) {
    console.error('Erro no Gerador de Treino:', error);
    return null;
  }
}
