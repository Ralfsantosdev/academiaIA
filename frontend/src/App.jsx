import React, { useState } from 'react';
import { verificarRiscoChurn } from './services/iaService';

// Serviço Real de Autenticação e Usuários
const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    if (!response.ok) throw new Error('Falha no login');
    return response.json();
  },
  
  createUser: async (userData, token) => {
    const response = await fetch('http://localhost:8000/api/v1/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao criar usuário');
    }
    return response.json();
  },

  getUsers: async (token) => {
    const response = await fetch('http://localhost:8000/api/v1/users/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  },

  deleteUser: async (userId, token) => {
    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao excluir usuário');
    }
    return response.json();
  },

  updateUserPassword: async (userId, password, token) => {
    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao atualizar senha');
    }
    return response.json();
  },

  createPlano: async (planoData, token) => {
    const response = await fetch('http://localhost:8000/api/v1/planos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(planoData)
    });
    if (!response.ok) throw new Error('Erro ao criar plano');
    return response.json();
  },
  getPlanos: async (token) => {
    const response = await fetch('http://localhost:8000/api/v1/planos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar planos');
    return response.json();
  },
  deletePlano: async (id, token) => {
    const response = await fetch(`http://localhost:8000/api/v1/planos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao excluir plano');
    return response.json();
  },

  createPagamento: async (pagamentoData, token) => {
    const response = await fetch('http://localhost:8000/api/v1/pagamentos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(pagamentoData)
    });
    if (!response.ok) throw new Error('Erro ao registrar pagamento (Verifique se o CPF está correto)');
    return response.json();
  },
  getPagamentos: async (token) => {
    const response = await fetch('http://localhost:8000/api/v1/pagamentos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar pagamentos');
    return response.json();
  },
  
  getRelatorioFinanceiro: async (token) => {
    const response = await fetch('http://localhost:8000/api/v1/relatorios/financeiro', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar relatório financeiro');
    return response.json();
  },

  getAlunosAll: async (token) => {
    const response = await fetch('http://localhost:8000/api/v1/alunos/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar alunos');
    return response.json();
  },

  generateTreinoIA: async (dadosTreino, token) => {
    const response = await fetch('http://localhost:8000/api/v1/ia/treino/gerar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dadosTreino)
    });
    if (!response.ok) throw new Error('Erro ao gerar treino');
    return response.json();
  },

  gerarLinkAssinatura: async (dados, token) => {
    const response = await fetch('http://localhost:8000/api/v1/pagamentos/gerar-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dados)
    });
    if (!response.ok) throw new Error('Erro ao gerar link de pagamento');
    return response.json();
  },

  enviarWhatsApp: async (telefone, mensagem, token) => {
    const response = await fetch('http://localhost:8000/api/v1/webhooks/whatsapp/disparar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ telefone, mensagem })
    });
    if (!response.ok) throw new Error('Erro ao disparar WhatsApp');
    return response.json();
  },

  createAluno: async (alunoData, token) => {
    const response = await fetch('http://localhost:8000/api/v1/alunos/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...alunoData,
        idade: parseInt(alunoData.idade)
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao cadastrar aluno');
    }
    return response.json();
  },

  updateAluno: async (cpf, alunoData, token) => {
    const response = await fetch(`http://localhost:8000/api/v1/alunos/${cpf}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...alunoData,
        idade: parseInt(alunoData.idade)
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao atualizar aluno');
    }
    return response.json();
  },

  getAluno: async (termo, token) => {
    const response = await fetch(`http://localhost:8000/api/v1/alunos/busca/${termo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Aluno não encontrado');
    }
    return response.json();
  }
};

function App() {
  const [user, setUser] = useState(null); // null = não logado
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de navegação
  const [activeTab, setActiveTab] = useState('dashboard');
  const [churnResult, setChurnResult] = useState(null);
  const [churnLoading, setChurnLoading] = useState(false);

  // Estados para Gerenciar Exclusão de Alunos
  const [alunosList, setAlunosList] = useState([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState('');
  const [excluirMsg, setExcluirMsg] = useState('');

  // Estados do Formulário de Criação/Edição de Aluno
  const [novoAluno, setNovoAluno] = useState({
    nome: '', cpf: '', idade: '', telefone: '', plano: 'Mensal', objetivo: 'Hipertrofia'
  });
  const [alunoMsg, setAlunoMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [buscaCpf, setBuscaCpf] = useState('');

  // Estados de Gestão de Usuários
  const [newUser, setNewUser] = useState({ nome: '', username: '', password: '', role: 'Aluno' });
  const [createMsg, setCreateMsg] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [usersMsg, setUsersMsg] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Estados de Planos
  const [planosList, setPlanosList] = useState([]);
  const [novoPlano, setNovoPlano] = useState({ nome: '', valor: '', duracao_meses: '' });
  const [planosMsg, setPlanosMsg] = useState('');

  // Estados de Pagamentos
  const [pagamentosList, setPagamentosList] = useState([]);
  const [novoPagamento, setNovoPagamento] = useState({ aluno_cpf: '', valor: '', status: 'Pago' });
  const [pagamentosMsg, setPagamentosMsg] = useState('');

  // Estados de Relatórios
  const [relatorioData, setRelatorioData] = useState(null);

  // Estados de Consultar Aluno
  const [buscaConsultar, setBuscaConsultar] = useState('');
  const [alunoConsultado, setAlunoConsultado] = useState(null);
  const [consultarMsg, setConsultarMsg] = useState('');

  // Estados de Gerenciar Ficha (Professor)
  const [profAlunosList, setProfAlunosList] = useState([]);
  const [treinoForm, setTreinoForm] = useState({ aluno_id: '', objetivo: '', nivel: 'iniciante', dias_por_semana: 3, restricoes: '' });
  const [treinoGerado, setTreinoGerado] = useState(null);
  const [treinoMsg, setTreinoMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await authService.login(e.target.username.value, e.target.password.value);
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
    } catch (err) {
      setError('Usuário ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setCreateMsg('');
      const token = localStorage.getItem('token');
      await authService.createUser(newUser, token);
      setCreateMsg('✅ Usuário criado com sucesso!');
      setNewUser({ nome: '', username: '', password: '', role: 'Aluno' });
      loadUsers(); // Recarrega a lista
    } catch (err) {
      setCreateMsg(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await authService.getUsers(token);
      setUsersList(data);
    } catch (err) {
      setUsersMsg(`❌ Erro: ${err.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const token = localStorage.getItem('token');
      await authService.deleteUser(id, token);
      setUsersMsg('✅ Usuário excluído com sucesso!');
      loadUsers();
    } catch (err) {
      setUsersMsg(`❌ Erro: ${err.message}`);
    }
  };

  const handleUpdatePassword = async (id) => {
    if (!newPassword) return alert('Digite a nova senha!');
    try {
      const token = localStorage.getItem('token');
      await authService.updateUserPassword(id, newPassword, token);
      setUsersMsg('✅ Senha atualizada com sucesso!');
      setEditingUserId(null);
      setNewPassword('');
    } catch (err) {
      setUsersMsg(`❌ Erro: ${err.message}`);
    }
  };

  // Carregar dados com base na aba ativa
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (activeTab === 'gerenciar_usuarios' && user?.role.toLowerCase() === 'administrador') {
      loadUsers();
      setUsersMsg('');
      setCreateMsg('');
    }
    if (activeTab === 'cadastrar_planos') {
      authService.getPlanos(token).then(setPlanosList).catch(err => setPlanosMsg(err.message));
    }
    if (activeTab === 'registrar_pagamentos') {
      authService.getPagamentos(token).then(setPagamentosList).catch(err => setPagamentosMsg(err.message));
    }
    if (activeTab === 'emitir_relatorios') {
      authService.getRelatorioFinanceiro(token).then(setRelatorioData).catch(err => console.error(err));
    }
    if (activeTab === 'gerenciar_ficha' && user?.role.toLowerCase() === 'professor') {
      authService.getAlunosAll(token).then(setProfAlunosList).catch(err => console.error(err));
    }
  }, [activeTab, user]);

  const handleCreatePlano = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await authService.createPlano({
        ...novoPlano,
        valor: parseFloat(novoPlano.valor),
        duracao_meses: parseInt(novoPlano.duracao_meses)
      }, token);
      setPlanosMsg('✅ Plano criado com sucesso!');
      setNovoPlano({ nome: '', valor: '', duracao_meses: '' });
      authService.getPlanos(token).then(setPlanosList);
    } catch (err) {
      setPlanosMsg(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlano = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      const token = localStorage.getItem('token');
      await authService.deletePlano(id, token);
      setPlanosMsg('✅ Plano excluído com sucesso!');
      authService.getPlanos(token).then(setPlanosList);
    } catch (err) {
      setPlanosMsg(`❌ Erro: ${err.message}`);
    }
  };

  const handleCreatePagamento = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await authService.createPagamento({
        ...novoPagamento,
        valor: parseFloat(novoPagamento.valor)
      }, token);
      setPagamentosMsg('✅ Pagamento registrado com sucesso!');
      setNovoPagamento({ aluno_cpf: '', valor: '', status: 'Pago' });
      authService.getPagamentos(token).then(setPagamentosList);
    } catch (err) {
      setPagamentosMsg(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAluno = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlunoMsg('');
    const token = localStorage.getItem('token');
    
    try {
      if (isEditing) {
        await authService.updateAluno(novoAluno.cpf, novoAluno, token);
        setAlunoMsg('✅ Cadastro atualizado com sucesso no Banco de Dados!');
      } else {
        await authService.createAluno(novoAluno, token);
        setAlunoMsg('✅ Aluno cadastrado com sucesso no Banco de Dados!');
      }
      setNovoAluno({ nome: '', cpf: '', idade: '', telefone: '', plano: 'Mensal', objetivo: 'Hipertrofia' });
      setIsEditing(false);
      setBuscaCpf('');
    } catch (err) {
      setAlunoMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarAluno = async (e) => {
    e.preventDefault();
    if (buscaCpf.length < 3) {
      setAlunoMsg('❌ Digite um nome ou CPF válido para buscar.');
      return;
    }
    
    setAlunoMsg('Buscando...');
    const token = localStorage.getItem('token');
    
    try {
      const alunoDb = await authService.getAluno(buscaCpf, token);
      setAlunoMsg('');
      setIsEditing(true);
      setNovoAluno({
        nome: alunoDb.nome,
        cpf: alunoDb.cpf,
        idade: alunoDb.idade.toString(),
        telefone: alunoDb.telefone || '',
        plano: alunoDb.plano || 'Mensal',
        objetivo: alunoDb.objetivo || 'Hipertrofia'
      });
    } catch (err) {
      setAlunoMsg('❌ Aluno não encontrado no Banco de Dados.');
      setIsEditing(false);
    }
  };

  const handleDetectarRisco = async () => {
    setChurnLoading(true);
    setChurnResult(null);
    const dadosDemo = {
      id: "demo",
      frequenciaSemanal: 2,
      diasSemVir: 7,
      idade: 28,
      mesesMatricula: 4,
      qtdAtrasos: 1
    };
    const result = await verificarRiscoChurn(dadosDemo);
    setChurnResult(result);
    setChurnLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return (
      <div className="dashboard-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%' }}>
          <h2 className="panel-title" style={{ justifyContent: 'center', fontSize: '2rem' }}>Acesso ao Sistema</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>
            Digite suas credenciais para entrar.
          </p>
          
          {error && <p style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</p>}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Usuário</label>
              <input type="text" name="username" placeholder="Ex: admin" required />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Senha</label>
              <input type="password" name="password" placeholder="Senha" required />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)', textAlign: 'center' }}>
            <p><strong>Dica de Teste:</strong> Usuários (admin, recepcao, professor, aluno) | Senha: 123</p>
          </div>
        </div>
      </div>
    );
  }

  const role = user.role.toLowerCase();

  // Layout específico para ALUNO (Estilo Mobile App PWA)
  if (role === 'aluno') {
    return (
      <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-accent)', fontSize: '1.5rem' }}>Academia IA</h2>
          <button onClick={logout} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,0,0,0.2)', color: 'var(--danger)', border: 'none', borderRadius: '4px' }}>Sair</button>
        </header>

        <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
           <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>👋 Olá, {user.nome}!</h3>
           <p style={{ margin: 0, color: 'var(--text-muted)' }}>Status da Assinatura: <strong style={{color: 'var(--success)'}}>Ativa</strong></p>
        </div>

        <div className="glass-panel" style={{ flex: 1 }}>
           <h3 style={{ marginBottom: '1rem', color: '#00B1EA' }}>Meu Protocolo de Treino</h3>
           <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Nenhum treino ativo hoje.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O seu professor ou a IA ainda não geraram seu protocolo da semana.</p>
           </div>
        </div>
        
        {/* Bottom Navigation Bar (PWA Style) */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-panel)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-around', padding: '1rem 0', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center', color: 'var(--primary-accent)', flex: 1, cursor: 'pointer' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🏋️</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Treino</div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', flex: 1, cursor: 'pointer' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💳</div>
            <div style={{ fontSize: '0.75rem' }}>Faturas</div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', flex: 1, cursor: 'pointer' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>👤</div>
            <div style={{ fontSize: '0.75rem' }}>Perfil</div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Lateral */}
      <aside className="sidebar glass-panel" style={{ borderRadius: '0', borderRight: '1px solid rgba(102, 252, 241, 0.2)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-accent)', fontFamily: 'Orbitron' }}>AcademiaIA</h2>
          <p style={{ fontSize: '1rem', marginTop: '1rem' }}>Olá, <strong>{user.nome}</strong></p>
          <span style={{ fontSize: '0.8rem', background: 'var(--primary-accent)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            {user.role}
          </span>
          <br/>
          <button style={{ marginTop: '1.5rem', padding: '0.6rem', fontSize: '0.9rem' }} onClick={logout}>Sair do Sistema</button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className={`menu-item ${activeTab === 'dashboard' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('dashboard')}>
            🏠 Início
          </div>

          {(role === 'administrador' || role === 'recepcionista') && (
            <div className={`menu-item ${activeTab === 'cadastrar_aluno' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('cadastrar_aluno')}>
              👥 Cadastrar / Editar Aluno
            </div>
          )}

          {role === 'administrador' && (
            <>
              <div className={`menu-item ${activeTab === 'excluir_aluno' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('excluir_aluno')}>❌ Excluir Aluno</div>
              <div className={`menu-item ${activeTab === 'cadastrar_planos' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('cadastrar_planos')}>📝 Cadastrar Planos</div>
              <div className={`menu-item ${activeTab === 'gerenciar_usuarios' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('gerenciar_usuarios')}>
                👨‍🏫 Gestão de Usuários
              </div>
              <div className={`menu-item ${activeTab === 'emitir_relatorios' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('emitir_relatorios')}>📊 Emitir Relatórios</div>
            </>
          )}

          {(role === 'administrador' || role === 'recepcionista') && (
            <div className={`menu-item ${activeTab === 'registrar_pagamentos' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('registrar_pagamentos')}>💰 Registrar Pagamentos</div>
          )}

          {(role === 'administrador' || role === 'recepcionista' || role === 'professor') && (
            <div className={`menu-item ${activeTab === 'consultar_aluno' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('consultar_aluno')}>🔍 Consultar Aluno</div>
          )}

          {role === 'professor' && (
            <div className={`menu-item ${activeTab === 'gerenciar_ficha' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('gerenciar_ficha')}>
              🧠 Gerenciar Ficha (IA)
            </div>
          )}
        </nav>
      </aside>

      {/* Conteúdo Principal (Workspace) */}
      <main className="dashboard-content">
        <header className="header" style={{ marginBottom: '1rem' }}>
          <h1>Workspace <span className="header-accent">Nexus</span></h1>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid-layout">
            <section className="glass-panel">
              <h2 className="panel-title">Resumo do Sistema</h2>
              <p>Bem-vindo ao painel, {user.nome}. Selecione uma opção no menu lateral.</p>
            </section>
            
            {/* Simulando o dashboard da Recepção/Admin (IA de Churn) */}
            {(role === 'administrador' || role === 'recepcionista') && (
              <section className="glass-panel">
                <h2 className="panel-title">Análise de Risco (Churn)</h2>
                <p>Ferramenta preditiva para retenção de alunos.</p>
                <button style={{marginTop: '1rem'}} onClick={handleDetectarRisco} disabled={churnLoading}>
                  {churnLoading ? 'Analisando...' : 'Detectar Risco (IA)'}
                </button>
                {churnResult && (
                  <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(102,252,241,0.1)', borderRadius: '8px'}}>
                    <p><strong>Risco:</strong> {churnResult.nivel_risco}</p>
                    <p><strong>Probabilidade:</strong> {(churnResult.probabilidade_churn * 100).toFixed(1)}%</p>
                    <p><strong>Ação:</strong> {churnResult.acao_recomendada}</p>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {activeTab === 'cadastrar_aluno' && (
          <section className="glass-panel" style={{ maxWidth: '700px' }}>
            <h2 className="panel-title">Cadastrar / Editar Aluno</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Para editar um aluno, busque pelo Nome ou CPF. Para cadastrar um novo, basta preencher os dados.
            </p>

            {/* Barra de Busca de Aluno Existente */}
            <form onSubmit={handleBuscarAluno} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(102, 252, 241, 0.2)' }}>
              <input 
                type="text" 
                placeholder="Buscar por Nome ou CPF (Ex: João ou 000.000.000-00)" 
                value={buscaCpf}
                onChange={e => setBuscaCpf(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" style={{ width: 'auto', padding: '0 1.5rem' }}>Buscar</button>
            </form>
            
            <form onSubmit={handleCreateAluno} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-layout" style={{ gap: '1rem', marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nome Completo</label>
                  <input type="text" value={novoAluno.nome} onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})} placeholder="Ex: João da Silva" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>CPF</label>
                  <input type="text" value={novoAluno.cpf} onChange={e => setNovoAluno({...novoAluno, cpf: e.target.value})} placeholder="000.000.000-00" required />
                </div>
              </div>

              <div className="grid-layout" style={{ gap: '1rem', marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Idade</label>
                  <input type="number" value={novoAluno.idade} onChange={e => setNovoAluno({...novoAluno, idade: e.target.value})} placeholder="Ex: 28" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Telefone / WhatsApp</label>
                  <input type="text" value={novoAluno.telefone} onChange={e => setNovoAluno({...novoAluno, telefone: e.target.value})} placeholder="(11) 90000-0000" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Plano Escolhido</label>
                <select value={novoAluno.plano} onChange={e => setNovoAluno({...novoAluno, plano: e.target.value})}>
                  <option value="Mensal">Mensal (R$ 120,00)</option>
                  <option value="Trimestral">Trimestral (R$ 300,00)</option>
                  <option value="Anual">Anual (R$ 1.000,00)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Objetivo Principal (Para uso da IA)</label>
                <select value={novoAluno.objetivo} onChange={e => setNovoAluno({...novoAluno, objetivo: e.target.value})}>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Condicionamento Físico">Condicionamento Físico</option>
                  <option value="Reabilitação">Reabilitação</option>
                </select>
              </div>

              <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar Aluno' : 'Cadastrar Novo Aluno')}
              </button>

              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setNovoAluno({ nome: '', cpf: '', idade: '', telefone: '', plano: 'Mensal', objetivo: 'Hipertrofia' }); }} style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', marginTop: '0.5rem' }}>
                  Cancelar Edição
                </button>
              )}

              {alunoMsg && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: alunoMsg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>
                  {alunoMsg}
                </div>
              )}
            </form>
          </section>
        )}

        {activeTab === 'excluir_aluno' && (
          <section className="glass-panel">
            <h2 className="panel-title" style={{color: 'var(--danger)'}}>Excluir Aluno</h2>
            <p>Selecione um aluno para desativar ou remover da base.</p>
            {alunosList.length === 0 && !alunoSelecionadoId && (
              <button 
                onClick={async () => {
                  setLoading(true);
                  setExcluirMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:8000/api/v1/alunos/all', {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    if (!response.ok) {
                      throw new Error('Erro ao buscar alunos');
                    }
                    const alunos = await response.json();
                    setAlunosList(alunos);
                    setExcluirMsg('');
                  } catch (err) {
                    setExcluirMsg(`❌ ${err.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{ marginBottom: '2rem' }}
              >
                {loading ? 'Carregando...' : 'Carregar Lista de Alunos'}
              </button>
            )}
            {excluirMsg && (
              <div style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,0,0,0.1)', color: 'var(--danger)' }}>
                {excluirMsg}
              </div>
            )}
            {alunosList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {alunosList.map((aluno) => (
                  <div 
                    key={aluno.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      border: '1px solid rgba(102, 252, 241, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: alunoSelecionadoId === aluno.id ? 'rgba(102, 252, 241, 0.1)' : 'transparent'
                    }}
                    onClick={() => setAlunoSelecionadoId(aluno.id)}
                  >
                    <div>
                      <strong>{aluno.nome}</strong> - CPF: {aluno.cpf}
                    </div>
                    {alunoSelecionadoId === aluno.id && (
                      <button
                        onClick={async () => {
                          setLoading(true);
                          setExcluirMsg('');
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`http://localhost:8000/api/v1/alunos/${aluno.cpf}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            if (!response.ok) {
                              throw new Error('Erro ao excluir aluno');
                            }
                            const result = await response.json();
                            setExcluirMsg(`✅ ${result.message}`);
                            setAlunosList(alunosList.filter(a => a.id !== aluno.id));
                            setAlunoSelecionadoId('');
                          } catch (err) {
                            setExcluirMsg(`❌ ${err.message}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        style={{ 
                          background: 'var(--danger)', 
                          color: '#000',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                      </button>
                    )}
                  </div>
                ))}
                {alunoSelecionadoId && (
                  <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(102, 252, 241, 0.1)', color: 'var(--primary-accent)' }}>
                    Aluno selecionado! Clique no botão ao lado para confirmar a exclusão.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'cadastrar_planos' && (
          <section className="glass-panel">
            <h2 className="panel-title">Cadastrar Planos</h2>
            <p style={{ marginBottom: '1.5rem' }}>Gerencie os planos da academia (Mensal, Trimestral, Anual).</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <form onSubmit={handleCreatePlano} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nome do Plano</label>
                  <input type="text" value={novoPlano.nome} onChange={e => setNovoPlano({...novoPlano, nome: e.target.value})} placeholder="Ex: Semestral" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Valor (R$)</label>
                  <input type="number" step="0.01" value={novoPlano.valor} onChange={e => setNovoPlano({...novoPlano, valor: e.target.value})} placeholder="Ex: 500.00" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Duração em Meses</label>
                  <input type="number" value={novoPlano.duracao_meses} onChange={e => setNovoPlano({...novoPlano, duracao_meses: e.target.value})} placeholder="Ex: 6" required />
                </div>
                <button type="submit" disabled={loading}>Salvar Plano</button>
                {planosMsg && <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: planosMsg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>{planosMsg}</div>}
              </form>

              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-accent)' }}>Planos Ativos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {planosList.map(plano => (
                    <div key={plano.id} style={{ padding: '1rem', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{plano.nome}</strong><br/>
                        <span style={{ fontSize: '0.9rem' }}>R$ {plano.valor} - {plano.duracao_meses} meses</span>
                      </div>
                      <button onClick={() => handleDeletePlano(plano.id)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'emitir_relatorios' && (
          <section className="glass-panel">
            <h2 className="panel-title">Relatório Financeiro e Operacional</h2>
            <p>Balanço financeiro em tempo real.</p>
            
            {relatorioData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ padding: '2rem', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ color: 'var(--primary-accent)', fontSize: '1rem', marginBottom: '0.5rem' }}>Total Arrecadado</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>R$ {relatorioData.total_arrecadado.toFixed(2)}</div>
                </div>
                <div style={{ padding: '2rem', background: 'rgba(255, 100, 100, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '0.5rem' }}>Pagamentos Pendentes</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>R$ {relatorioData.pagamentos_pendentes.toFixed(2)}</div>
                </div>
                <div style={{ padding: '2rem', background: 'rgba(100, 255, 100, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ color: 'var(--success)', fontSize: '1rem', marginBottom: '0.5rem' }}>Alunos Ativos</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{relatorioData.total_alunos}</div>
                </div>
              </div>
            ) : (
              <p>Carregando dados financeiros...</p>
            )}
          </section>
        )}

        {activeTab === 'registrar_pagamentos' && (
          <section className="glass-panel">
            <h2 className="panel-title">Registrar Pagamentos</h2>
            <p style={{ marginBottom: '1.5rem' }}>Receba mensalidades e atualize o caixa associando pelo CPF do aluno.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <form onSubmit={handleCreatePagamento} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>CPF do Aluno</label>
                  <input type="text" value={novoPagamento.aluno_cpf} onChange={e => setNovoPagamento({...novoPagamento, aluno_cpf: e.target.value})} placeholder="000.000.000-00" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Valor (R$)</label>
                  <input type="number" step="0.01" value={novoPagamento.valor} onChange={e => setNovoPagamento({...novoPagamento, valor: e.target.value})} placeholder="Ex: 120.00" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Status</label>
                  <select value={novoPagamento.status} onChange={e => setNovoPagamento({...novoPagamento, status: e.target.value})}>
                    <option value="Pago">Pago (Manual)</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1 }}>Registrar Manual</button>
                  <button 
                    type="button" 
                    disabled={loading || !novoPagamento.aluno_cpf || !novoPagamento.valor} 
                    style={{ flex: 1, background: '#00B1EA', color: '#fff' }}
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const token = localStorage.getItem('token');
                        const data = await authService.gerarLinkAssinatura({
                          aluno_cpf: novoPagamento.aluno_cpf,
                          nome_plano: "Assinatura Automática",
                          valor: parseFloat(novoPagamento.valor)
                        }, token);
                        setPagamentosMsg('✅ Link de Assinatura gerado com sucesso!');
                        window.open(data.link, '_blank');
                      } catch (err) {
                        setPagamentosMsg(`❌ Erro: ${err.message}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    🔗 Criar Assinatura (Mercado Pago)
                  </button>
                </div>

                {pagamentosMsg && <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: pagamentosMsg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>{pagamentosMsg}</div>}
              </form>

              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-accent)' }}>Histórico Recente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {pagamentosList.map(pag => (
                    <div key={pag.id} style={{ padding: '1rem', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                      <strong>{pag.aluno_nome}</strong><br/>
                      <span style={{ fontSize: '0.9rem' }}>Valor: R$ {pag.valor} | Status: <span style={{ color: pag.status === 'Pago' ? 'var(--success)' : 'var(--danger)' }}>{pag.status}</span></span><br/>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data: {new Date(pag.data_pagamento).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'consultar_aluno' && (
          <section className="glass-panel">
            <h2 className="panel-title">Consultar Aluno</h2>
            <p style={{ marginBottom: '1.5rem' }}>Busque o histórico de um aluno pelo nome ou CPF.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!buscaConsultar) return;
              setConsultarMsg('Buscando...');
              try {
                const token = localStorage.getItem('token');
                const aluno = await authService.getAluno(buscaConsultar, token);
                setAlunoConsultado(aluno);
                setConsultarMsg('');
              } catch(err) {
                setAlunoConsultado(null);
                setConsultarMsg('❌ Aluno não encontrado.');
              }
            }} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Nome ou CPF (ex: João ou 000.000.000-00)" 
                value={buscaConsultar}
                onChange={(e) => setBuscaConsultar(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" style={{ width: 'auto', padding: '0 1.5rem' }}>Buscar</button>
            </form>
            
            {consultarMsg && <p style={{ color: consultarMsg.includes('❌') ? 'var(--danger)' : 'var(--text-main)', marginBottom: '1rem' }}>{consultarMsg}</p>}
            
            {alunoConsultado && (
              <div style={{ background: 'rgba(102, 252, 241, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--primary-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>{alunoConsultado.nome}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'var(--text-main)' }}>
                      <p><strong>CPF:</strong> {alunoConsultado.cpf}</p>
                      <p><strong>Idade:</strong> {alunoConsultado.idade} anos</p>
                      <p><strong>Telefone:</strong> {alunoConsultado.telefone || 'Não informado'}</p>
                      <p><strong>Plano:</strong> {alunoConsultado.plano || 'Não informado'}</p>
                      <p><strong>Objetivo:</strong> {alunoConsultado.objetivo || 'Não informado'}</p>
                    </div>
                  </div>
                  {alunoConsultado.telefone && (
                    <button 
                      style={{ background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        try {
                          await authService.enviarWhatsApp(
                            alunoConsultado.telefone, 
                            `Olá ${alunoConsultado.nome}! Passando para lembrar dos seus treinos e do seu objetivo de ${alunoConsultado.objetivo}. Conta com a gente!`, 
                            token
                          );
                          alert('Mensagem enviada com sucesso para o WhatsApp!');
                        } catch(err) {
                          alert('Erro ao enviar Zap: ' + err.message);
                        }
                      }}
                    >
                      💬 Lembrete WhatsApp
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'minhas_faturas' && (
          <section className="glass-panel">
            <h2 className="panel-title">Minhas Faturas</h2>
            <p>Veja seu histórico de mensalidades pagas e pendentes.</p>
          </section>
        )}


        {/* Simulando o dashboard específico do Professor */}
        {activeTab === 'gerenciar_ficha' && role === 'professor' && (
          <section className="glass-panel">
            <h2 className="panel-title">Gerador de Treino Neural (IA)</h2>
            <p style={{ marginBottom: '1.5rem' }}>Use a IA para montar um protocolo de treino personalizado baseado no perfil do aluno.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setTreinoMsg('Processando IA...');
                setTreinoGerado(null);
                try {
                  const token = localStorage.getItem('token');
                  const payload = {
                    aluno_id: treinoForm.aluno_id,
                    objetivo: treinoForm.objetivo,
                    nivel: treinoForm.nivel,
                    dias_por_semana: parseInt(treinoForm.dias_por_semana),
                    restricoes: treinoForm.restricoes ? treinoForm.restricoes.split(',').map(r => r.trim()) : []
                  };
                  const resultado = await authService.generateTreinoIA(payload, token);
                  setTreinoGerado(resultado.prescricao);
                  setTreinoMsg('');
                } catch(err) {
                  setTreinoMsg('❌ ' + err.message);
                } finally {
                  setLoading(false);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Selecione o Aluno</label>
                  <select 
                    value={treinoForm.aluno_id} 
                    onChange={e => {
                      const alunoSelecionado = profAlunosList.find(a => a.cpf === e.target.value);
                      setTreinoForm({ 
                        ...treinoForm, 
                        aluno_id: e.target.value, 
                        objetivo: alunoSelecionado ? alunoSelecionado.objetivo : ''
                      });
                    }}
                    required
                  >
                    <option value="">-- Escolha --</option>
                    {profAlunosList.map(a => (
                      <option key={a.id} value={a.cpf}>{a.nome} (CPF: {a.cpf})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Objetivo do Treino</label>
                  <input type="text" value={treinoForm.objetivo} onChange={e => setTreinoForm({...treinoForm, objetivo: e.target.value})} placeholder="Ex: Hipertrofia, Emagrecimento" required />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nível de Experiência</label>
                  <select value={treinoForm.nivel} onChange={e => setTreinoForm({...treinoForm, nivel: e.target.value})}>
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>

                <div className="grid-layout" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Dias p/ Semana</label>
                    <input type="number" min="1" max="7" value={treinoForm.dias_por_semana} onChange={e => setTreinoForm({...treinoForm, dias_por_semana: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Restrições Médicas?</label>
                    <input type="text" value={treinoForm.restricoes} onChange={e => setTreinoForm({...treinoForm, restricoes: e.target.value})} placeholder="Ex: joelho, coluna (separado por vírgula)" />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ background: 'var(--primary-accent)', color: '#000' }}>
                  {loading ? 'IA Gerando Treino...' : 'Gerar Protocolo (IA)'}
                </button>

                {treinoMsg && <p style={{ color: treinoMsg.includes('❌') ? 'var(--danger)' : 'var(--primary-accent)' }}>{treinoMsg}</p>}
              </form>

              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-accent)' }}>Protocolo Gerado</h3>
                {treinoGerado ? (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(102, 252, 241, 0.2)', maxHeight: '500px', overflowY: 'auto' }}>
                    {typeof treinoGerado === 'string' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{treinoGerado}</div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                          <span style={{ background: 'var(--primary-accent)', color: '#000', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>{treinoGerado.objetivo}</span>
                          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem' }}>Nível: {treinoGerado.nivel}</span>
                          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem' }}>Freq: {treinoGerado.frequencia_semanal_sugerida}</span>
                        </div>

                        {treinoGerado.restricoes_consideradas && treinoGerado.restricoes_consideradas.length > 0 && (
                          <div style={{ marginBottom: '1.5rem', padding: '0.8rem', background: 'rgba(255, 100, 100, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '4px' }}>
                            <strong style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>⚠️ Restrições Consideradas:</strong>
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{treinoGerado.restricoes_consideradas.join(', ')}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {treinoGerado.plano_treino && treinoGerado.plano_treino.map((dia, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <h4 style={{ color: 'var(--primary-accent)', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(102, 252, 241, 0.2)', paddingBottom: '0.5rem' }}>
                                Foco: {dia.grupo_muscular}
                              </h4>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {dia.exercicios.map((ex, exIdx) => (
                                  <div key={exIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '6px' }}>
                                    <div style={{ flex: 1 }}>
                                      <strong style={{ display: 'block', fontSize: '1rem', color: '#fff' }}>{ex.nome}</strong>
                                      {ex.restricao && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'rgba(255,0,0,0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Adaptado: {ex.restricao}</span>}
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                      <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 'bold' }}>{ex.series}x {ex.repeticoes}</span>
                                      <span>⏱ {ex.descanso_seg}s desc.</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    O treino prescrito pela IA aparecerá aqui.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Simulando o dashboard do Aluno */}
        {activeTab === 'minha_ficha' && role === 'aluno' && (
          <section className="glass-panel">
            <h2 className="panel-title">Seu Treino Atual</h2>
            <p>Seus professores prepararam uma rotina utilizando IA.</p>
            <div className="result-box" style={{marginTop: '1rem'}}>
              Foco: Hipertrofia | Protocolo: A, B, C, D
            </div>
          </section>
        )}

        {/* Formulário de Gestão de Usuários (Apenas Admin) */}
        {activeTab === 'gerenciar_usuarios' && role === 'administrador' && (
          <section className="glass-panel">
            <h2 className="panel-title">Gestão de Usuários</h2>
            <p style={{ marginBottom: '1.5rem' }}>Crie acessos para Recepcionistas, Professores ou Alunos e gerencie os usuários existentes.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-accent)' }}>Cadastrar Novo Usuário</h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nome Completo</label>
                    <input type="text" value={newUser.nome} onChange={e => setNewUser({...newUser, nome: e.target.value})} required />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Login (Username)</label>
                    <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Senha Inicial</label>
                    <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Perfil de Acesso</label>
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="Administrador">Administrador</option>
                      <option value="Recepcionista">Recepcionista</option>
                      <option value="Professor">Professor</option>
                      <option value="Aluno">Aluno</option>
                    </select>
                  </div>

                  <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
                    {loading ? 'Salvando...' : 'Criar Usuário'}
                  </button>

                  {createMsg && (
                    <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: createMsg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>
                      {createMsg}
                    </div>
                  )}
                </form>
              </div>

              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-accent)' }}>Usuários Cadastrados</h3>
                {usersMsg && (
                  <div style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: usersMsg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>
                    {usersMsg}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                  {usersList.map((u) => (
                    <div key={u.id} style={{ padding: '1rem', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{u.nome}</strong> ({u.username})<br/>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.role}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setEditingUserId(editingUserId === u.id ? null : u.id); setNewPassword(''); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--primary-accent)' }}>
                            Senha
                          </button>
                          {user.id !== u.id && (
                            <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                              X
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {editingUserId === u.id && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '8px' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nova Senha</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Nova senha"
                              style={{ flex: 1, padding: '0.4rem', fontSize: '0.9rem' }}
                            />
                            <button onClick={() => handleUpdatePassword(u.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Salvar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
