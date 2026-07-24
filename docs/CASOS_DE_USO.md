# Sistema de Gestão de Academia - Casos de Uso

Abaixo está o mapeamento dos perfis de acesso e suas respectivas permissões/ações dentro do sistema.

## Visão Geral

```text
+---------------------------------------+
|    Sistema de Gestão de Academia      |
+---------------------------------------+
```

### 👑 Administrador
Possui acesso total ao sistema e gerencia tanto os alunos quanto o quadro de funcionários e planos.
- Cadastrar / Editar Aluno
- Excluir Aluno
- Cadastrar Planos
- Registrar Pagamentos
- Consultar Aluno
- Gerenciar Professor
- Emitir Relatórios

### 💁 Recepcionista
Focado no atendimento diário, recebimento e triagem.
- Cadastrar / Editar Aluno
- Registrar Pagamentos
- Consultar Aluno

### 🏋️ Professor
Focado na evolução física e acompanhamento do aluno.
- Consultar Aluno
- Gerenciar Ficha de Treino *(integrado com a Engine de IA para sugestões)*

### 📱 Aluno
Acesso restrito apenas aos seus próprios dados.
- Consultar Ficha de Treino
- Consultar Faturas / Pagamentos
