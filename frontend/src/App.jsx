import React, { useState } from 'react';
import { verificarRiscoChurn } from './services/iaService';
import { API_BASE_URL } from './config';

// Serviço Real de Autenticação e Usuários
const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  },

  deleteUser: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/password`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/planos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(planoData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Erro ao criar plano');
    return data;
  },
  getPlanos: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/planos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar planos');
    return response.json();
  },
  deletePlano: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/planos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || 'Erro ao excluir plano');
    }
    return {};
  },

  createPagamento: async (pagamentoData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/pagamentos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(pagamentoData)
    });
    if (!response.ok) throw new Error('Erro ao registrar pagamento (Verifique se o CPF está correto)');
    return response.json();
  },
  getPagamentos: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/pagamentos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar pagamentos');
    return response.json();
  },
  
  getRelatorioFinanceiro: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/relatorios/financeiro`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar relatório financeiro');
    return response.json();
  },

  getAlunosAll: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/alunos/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar alunos');
    return response.json();
  },

  generateTreinoIA: async (dadosTreino, token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/ia/treino/gerar`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/pagamentos/gerar-link`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/webhooks/whatsapp/disparar`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/alunos/`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/alunos/${cpf}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/alunos/busca/${termo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Aluno não encontrado');
    }
    return response.json();
  },

  getMeusPagamentos: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/pagamentos/meus`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar pagamentos');
    return response.json();
  },

  getMeuPerfil: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    return response.json();
  },
};

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registroForm, setRegistroForm] = useState({
    nome_academia: '',
    subdomain: '',
    admin_nome: '',
    admin_username: '',
    admin_password: ''
  });
  const [registroMsg, setRegistroMsg] = useState('');
  const [registroLoading, setRegistroLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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

  // Estados de Cobranças
  const [inadimplentesList, setInadimplentesList] = useState([]);
  const [selectedCobranca, setSelectedCobranca] = useState([]);
  const [mensagemCobranca, setMensagemCobranca] = useState('');
  const [cobrancaResult, setCobrancaResult] = useState(null);
  const [cobrancaLoading, setCobrancaLoading] = useState(false);

  // Estados de Importação
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  // Estados de Planos/Assinatura
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeLink, setUpgradeLink] = useState(null);
  const [upgradeMsg, setUpgradeMsg] = useState('');

  // Estados do Aluno (autoatendimento)
  const [studentTab, setStudentTab] = useState('aluno_treino');
  const [meusDados, setMeusDados] = useState(null);
  const [minhasFaturas, setMinhasFaturas] = useState([]);

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
      const subdomain = e.target.subdomain.value || 'admin';
      const username = `${subdomain}:${e.target.username.value}`;
      const data = await authService.login(username, e.target.password.value);
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      setTenantInfo(data.tenant || null);
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
    if (activeTab === 'cadastrar_planos' || activeTab === 'cadastrar_aluno') {
      authService.getPlanos(token).then(setPlanosList).catch(err => setPlanosMsg(err.message));
    }
    if (activeTab === 'registrar_pagamentos') {
      authService.getPagamentos(token).then(setPagamentosList).catch(err => setPagamentosMsg(err.message));
    }
    if (activeTab === 'emitir_relatorios') {
      authService.getRelatorioFinanceiro(token).then(setRelatorioData).catch(err => console.error(err));
    }
    if (activeTab === 'cobrancas') {
      fetch(`${API_BASE_URL}/api/v1/relatorios/inadimplentes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(setInadimplentesList).catch(() => {});
    }
    if ((activeTab === 'aluno_treino' || activeTab === 'aluno_faturas' || activeTab === 'aluno_perfil') && user?.role?.toLowerCase() === 'aluno') {
      authService.getMeusPagamentos(token).then(setMinhasFaturas).catch(() => {});
      fetch(`${API_BASE_URL}/api/v1/alunos/meus-dados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(dados => setMeusDados(dados)).catch(() => {});
    }
    if (activeTab === 'gerenciar_ficha' && user?.role.toLowerCase() === 'professor') {
      authService.getAlunosAll(token).then(setProfAlunosList).catch(err => console.error(err));
    }
    if (activeTab === 'planos') {
      fetch(`${API_BASE_URL}/api/v1/tenants/planos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(setPlanosDisponiveis).catch(() => {});
      fetch(`${API_BASE_URL}/api/v1/tenants/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(data => setTenantInfo(prev => ({...prev, ...data}))).catch(() => {});
      setUpgradeLink(null);
      setUpgradeMsg('');
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
    const digitsCpf = (novoAluno.cpf || '').replace(/\D/g, '');
    const digitsTel = (novoAluno.telefone || '').replace(/\D/g, '');
    if (digitsCpf.length < 11) {
      setAlunoMsg('❌ CPF deve ter pelo menos 11 dígitos.');
      setLoading(false);
      return;
    }
    if (novoAluno.telefone && digitsTel.length < 10) {
      setAlunoMsg('❌ Telefone deve ter pelo menos 10 dígitos.');
      setLoading(false);
      return;
    }
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
    if (showRegister) {
      return (
        <div className="dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 className="panel-title" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>Criar Conta Gratuita</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>
              30 dias de trial grátis. Sem cartão de crédito.
            </p>
            {registroMsg && <p style={{color: registroMsg.includes('✅') ? 'var(--success)' : 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{registroMsg}</p>}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setRegistroLoading(true);
              setRegistroMsg('');
              try {
                const res = await fetch(`${API_BASE_URL}/api/v1/tenants/registrar`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(registroForm)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Erro ao criar conta');
                setRegistroMsg('✅ ' + data.mensagem);
                setTimeout(() => setShowRegister(false), 2000);
              } catch (err) {
                setRegistroMsg('❌ ' + err.message);
              } finally {
                setRegistroLoading(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-nome">Nome da Academia</label>
                <input id="reg-nome" type="text" value={registroForm.nome_academia} onChange={e => setRegistroForm({...registroForm, nome_academia: e.target.value})} placeholder="Ex: FitClub" required autoComplete="off" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-subdomain">Subdomínio</label>
                <input id="reg-subdomain" type="text" value={registroForm.subdomain} onChange={e => setRegistroForm({...registroForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')})} placeholder="Ex: fitclub" required autoComplete="off" style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-admin-nome">Seu Nome</label>
                <input id="reg-admin-nome" type="text" value={registroForm.admin_nome} onChange={e => setRegistroForm({...registroForm, admin_nome: e.target.value})} placeholder="Ex: João Silva" required autoComplete="name" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-admin-user">Usuário de Admin</label>
                <input id="reg-admin-user" type="text" value={registroForm.admin_username} onChange={e => setRegistroForm({...registroForm, admin_username: e.target.value})} placeholder="Ex: admin" required autoComplete="username" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-admin-pass">Senha</label>
                <input id="reg-admin-pass" type="password" value={registroForm.admin_password} onChange={e => setRegistroForm({...registroForm, admin_password: e.target.value})} placeholder="Mínimo 4 caracteres" required minLength={4} autoComplete="new-password" />
              </div>
              <button type="submit" disabled={registroLoading} style={{ marginTop: '0.5rem' }}>
                {registroLoading ? 'Criando...' : 'Criar Conta Grátis'}
              </button>
              <button type="button" onClick={() => { setShowRegister(false); setShowLogin(true); setRegistroMsg(''); }} style={{ background: 'transparent', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Voltar ao Login
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (showLogin) {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Orbitron', color: 'var(--primary-accent)', fontSize: '1.8rem', letterSpacing: '2px' }}>ACADEMIA IA</h2>
              <p style={{ color: 'var(--text-main)', marginTop: '0.5rem' }}>Faça login no sistema</p>
            </div>
            {error && <p style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</p>}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="login-subdomain">Academia</label>
                <input id="login-subdomain" type="text" name="subdomain" placeholder="subdomínio" autoComplete="off" defaultValue="admin" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="login-username">Usuário</label>
                <input id="login-username" type="text" name="username" required autoComplete="username" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="login-password">Senha</label>
                <input id="login-password" type="password" name="password" required autoComplete="current-password" />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button onClick={() => setShowLogin(false)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', fontSize: '0.9rem' }}>
                ← Voltar
              </button>
              <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ainda não tem conta?{' '}
                <button onClick={() => { setShowLogin(false); setShowRegister(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>
                  Criar Conta Grátis
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (showTerms) {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => setShowTerms(false)} style={{ background: 'transparent', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', width: 'auto', marginBottom: '2rem' }}>
              ← Voltar
            </button>
            <div className="glass-panel">
              <h1 style={{ fontFamily: 'Orbitron', color: 'var(--primary-accent)', marginBottom: '2rem', fontSize: '1.8rem' }}>TERMOS DE USO</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Última atualização: julho de 2026</p>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>1. Aceitação dos Termos</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Ao criar uma conta e utilizar a plataforma Academia IA, o contratante declara ter lido, compreendido e aceitado todos os termos e condições aqui descritos, em conformidade com a Lei nº 10.406/2002 (Código Civil), o Marco Civil da Internet (Lei nº 12.965/2014) e o Código de Defesa do Consumidor (Lei nº 8.078/1990).</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>2. Responsabilidades do Contratante</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>O contratante é o único responsável pela veracidade dos dados cadastrados, pelo uso do sistema por seus usuários, pela gestão de seus alunos, pela cobrança e pelo cumprimento das obrigações legais perante seus clientes (alunos). A plataforma é um instrumento de gestão e não se responsabiliza por relações contratuais entre academias e seus alunos.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>3. Limitação de Responsabilidade</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>A Academia IA não se responsabiliza por:</p>
                <ul style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Danos materiais ou morais decorrentes do uso inadequado do sistema;</li>
                  <li>Perda de dados por falha do contratante em realizar backups;</li>
                  <li>Ações judiciais entre a academia contratante e seus alunos;</li>
                  <li>Interrupções temporárias do serviço para manutenção ou por caso fortuito;</li>
                  <li>Conteúdo gerado pela inteligência artificial — o uso do protocolo de treino é de inteira responsabilidade do profissional de educação física contratante.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>4. Obrigações da Plataforma</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>A Academia IA se compromete a envidar os melhores esforços para manter o sistema disponível, seguro e atualizado, mas sem garantia de disponibilidade ininterrupta. O serviço é fornecido "no estado em que se encontra", dentro dos limites do art. 14 do CDC, sendo excluída qualquer responsabilidade por danos indiretos ou lucros cessantes.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>5. Propriedade Intelectual</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Todo o código, design, algoritmos de IA e funcionalidades da plataforma são de propriedade exclusiva da Academia IA. É vedada a engenharia reversa, cópia, redistribuição ou revenda do sistema sem autorização expressa por escrito.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>6. Cancelamento e Exclusão</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>O contratante pode cancelar sua conta a qualquer momento. Ao cancelar, todos os dados serão excluídos permanentemente em até 30 dias, conforme o art. 7º, X da LGPD (Lei nº 13.709/2018). Não haverá reembolso de valores já pagos, salvo disposição contrária em contrato específico.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>7. Foro</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste termo, com renúncia expressa a qualquer outro foro, por mais privilegiado que seja.</p>
              </section>
            </div>
          </div>
        </div>
      );
    }

    if (showPrivacy) {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => setShowPrivacy(false)} style={{ background: 'transparent', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', width: 'auto', marginBottom: '2rem' }}>
              ← Voltar
            </button>
            <div className="glass-panel">
              <h1 style={{ fontFamily: 'Orbitron', color: 'var(--primary-accent)', marginBottom: '2rem', fontSize: '1.8rem' }}>POLÍTICA DE PRIVACIDADE</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Última atualização: julho de 2026</p>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>1. Dados Coletados</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Coletamos os seguintes dados pessoais dos contratantes e seus alunos: nome, CPF, telefone, e-mail, idade, dados de pagamento (processados exclusivamente pelo Mercado Pago, sem armazenamento de dados de cartão em nossos servidores) e informações de uso do sistema.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>2. Finalidade do Tratamento</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Os dados são utilizados exclusivamente para a prestação dos serviços contratados: gestão de alunos, controle de pagamentos, geração de treinos por IA, envio de cobranças via WhatsApp e análise de churn. Não compartilhamos dados pessoais com terceiros para fins de marketing.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>3. Base Legal</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>O tratamento de dados é realizado com base no legítimo interesse do controlador (art. 7º, IX da LGPD) e na execução do contrato de prestação de serviços (art. 7º, V da LGPD). Para dados sensíveis de saúde (restrições médicas informadas), o tratamento é feito mediante consentimento explícito do titular.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>4. Compartilhamento com Terceiros</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>A plataforma se integra com serviços terceiros para funcionamento: Mercado Pago (processamento de pagamentos), Evolution API (envio de WhatsApp) e provedor de hospedagem. Cada um desses serviços possui suas próprias políticas de privacidade e segurança.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>5. Direitos do Titular</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Nos termos da LGPD, o titular dos dados possui os direitos de: confirmação da existência de tratamento, acesso aos dados, correção, anonimização, bloqueio ou eliminação, portabilidade, e revogação do consentimento. Para exercer seus direitos, entre em contato pelo e-mail: privacidade@academiaia.com.br.</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>6. Segurança dos Dados</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acessos não autorizados, destruição, perda ou alteração, incluindo criptografia em trânsito (TLS), isolamento de dados por tenant (multi-tenancy) e controle de acesso baseado em papéis (RBAC).</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>7. Retenção e Exclusão</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Os dados serão mantidos enquanto a conta do contratante estiver ativa. Após o cancelamento, os dados serão excluídos permanentemente em até 30 dias, salvo quando houver obrigação legal de retenção (ex: dados fiscais de pagamentos, que podem ser retidos por até 5 anos conforme o art. 195 do CTN).</p>
              </section>

              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>8. Encarregado (DPO)</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>O encarregado pelo tratamento de dados pessoais pode ser contatado pelo e-mail: dpo@academiaia.com.br ou pelo endereço: Av. Paulista, 1000, São Paulo/SP, CEP 01310-100.</p>
              </section>

              <section style={{ marginBottom: '0.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>9. Disposições Gerais</h2>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem' }}>Esta política poderá ser atualizada a qualquer momento. As alterações serão comunicadas aos contratantes por e-mail ou através da própria plataforma. O uso continuado do sistema após as alterações constitui aceitação da nova política.</p>
              </section>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', borderBottom: '1px solid rgba(102,252,241,0.1)' }}>
          <h2 style={{ fontFamily: 'Orbitron', color: 'var(--primary-accent)', fontSize: '1.5rem', letterSpacing: '2px' }}>ACADEMIA IA</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowLogin(true)} style={{ background: 'transparent', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, width: 'auto' }}>
              Entrar
            </button>
            <button onClick={() => setShowRegister(true)} style={{ background: 'linear-gradient(135deg, var(--secondary-accent), var(--primary-accent))', border: 'none', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, width: 'auto' }}>
              Trial Grátis
            </button>
          </div>
        </nav>

        <section style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: '3rem', color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            O Sistema <span style={{ color: 'var(--primary-accent)' }}>Inteligente</span> para Sua Academia
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Gestão completa de alunos, planos, pagamentos e cobranças com Inteligência Artificial.
            Reduza a inadimplência e aumente o faturamento da sua academia.
          </p>
          <button onClick={() => setShowRegister(true)} style={{ background: 'linear-gradient(135deg, var(--secondary-accent), var(--primary-accent))', border: 'none', color: '#000', padding: '1rem 2.5rem', fontSize: '1.2rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Ubuntu, Orbitron, sans-serif', fontWeight: 700, width: 'auto' }}>
            Começar Trial Grátis de 30 Dias →
          </button>
        </section>

        <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Orbitron', color: 'var(--text-light)', textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>
            Por que escolher a <span style={{ color: 'var(--primary-accent)' }}>Academia IA</span>?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🤖', title: 'IA Generativa de Treinos', desc: 'Monte protocolos personalizados para cada aluno automaticamente com inteligência artificial.' },
              { icon: '📊', title: 'Análise de Churn', desc: 'Saiba quais alunos estão prestes a cancelar e tome ação antes que eles saiam.' },
              { icon: '💳', title: 'Pagamentos Integrados', desc: 'Mercado Pago integrado. Gere links de pagamento e receba automaticamente.' },
              { icon: '📱', title: 'Cobrança via WhatsApp', desc: 'Dispare cobranças em lote pelo WhatsApp com templates personalizados.' },
              { icon: '📥', title: 'Importação de Base', desc: 'Importe seus alunos de planilhas CSV ou XLSX em segundos.' },
              { icon: '🔒', title: 'Multi-tenant Seguro', desc: 'Dados isolados por academia. Cada cliente vê apenas seus próprios dados.' },
            ].map((f, i) => (
              <div key={i} className="glass-panel" style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'default' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ color: 'var(--primary-accent)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Orbitron', color: 'var(--text-light)', textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>
            Planos para <span style={{ color: 'var(--primary-accent)' }}>Todas as Academias</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { nome: 'Free', preco: 'R$ 0', alunos: '10 alunos', users: '1 usuário', cor: 'var(--text-muted)' },
              { nome: 'Start', preco: 'R$ 97', alunos: '100 alunos', users: '3 usuários', cor: 'var(--secondary-accent)', destaque: true },
              { nome: 'Pro', preco: 'R$ 197', alunos: '500 alunos', users: '10 usuários', cor: 'var(--primary-accent)' },
              { nome: 'Enterprise', preco: 'R$ 497', alunos: 'Ilimitado', users: 'Ilimitado', cor: 'var(--warning)' },
            ].map((p, i) => (
              <div key={i} style={{
                padding: '2rem 1.5rem', borderRadius: '12px', textAlign: 'center',
                border: p.destaque ? '2px solid var(--primary-accent)' : '1px solid rgba(102,252,241,0.15)',
                background: p.destaque ? 'rgba(102,252,241,0.05)' : 'rgba(31,40,51,0.4)',
                position: 'relative'
              }}>
                {p.destaque && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-accent)', color: '#000', padding: '0.2rem 1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>MAIS POPULAR</div>}
                <h3 style={{ color: p.cor, marginBottom: '0.5rem', fontSize: '1.3rem' }}>{p.nome}</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-light)', margin: '1rem 0' }}>{p.preco}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/mês</span></p>
                <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>✅ {p.alunos}</p>
                <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>✅ {p.users}</p>
                <button onClick={() => setShowRegister(true)} style={{ background: 'transparent', border: '1px solid ' + p.cor, color: p.cor, borderRadius: '6px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, width: 'auto' }}>
                  {p.preco === 'R$ 0' ? 'Começar Grátis' : 'Assinar'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(102,252,241,0.1)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© 2026 Academia IA — Sistema de Gestão Inteligente para Academias</p>
          <p style={{ marginTop: '0.5rem' }}>
            <button onClick={() => setShowLogin(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Login</button>
            {' · '}
            <button onClick={() => setShowRegister(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Criar Conta</button>
            {' · '}
            <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Termos de Uso</button>
            {' · '}
            <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Privacidade</button>
          </p>
        </footer>
      </div>
    );
  }

  const role = user.role.toLowerCase();

  // Layout específico para ALUNO (Estilo Mobile App PWA)
  if (role === 'aluno') {
    const planoStatus = meusDados?.plano_ativo
      ? (meusDados?.data_expiracao_plano && new Date(meusDados.data_expiracao_plano) < new Date()
        ? { label: 'Vencido', color: 'var(--danger)' }
        : { label: 'Ativo', color: 'var(--success)' })
      : { label: 'Inativo', color: 'var(--danger)' };

    const diasRestantes = meusDados?.data_expiracao_plano
      ? Math.ceil((new Date(meusDados.data_expiracao_plano) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    const renderStudentContent = () => {
      if (studentTab === 'aluno_treino') {
        return (
          <div className="glass-panel" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', color: '#00B1EA' }}>Meu Protocolo de Treino</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Nenhum treino ativo hoje.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O seu professor ou a IA ainda não geraram seu protocolo da semana.</p>
            </div>
          </div>
        );
      }

      if (studentTab === 'aluno_faturas') {
        return (
          <div className="glass-panel" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', color: '#00B1EA' }}>Minhas Faturas</h3>
            {minhasFaturas.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Nenhum pagamento registrado.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {minhasFaturas.map(f => (
                  <div key={f.id} style={{ padding: '1rem', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>R$ {f.valor.toFixed(2)}</strong>
                        <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(f.data_pagamento).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span style={{ color: f.status === 'Pago' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {f.status === 'Pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      if (studentTab === 'aluno_perfil') {
        return (
          <div className="glass-panel" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', color: '#00B1EA' }}>Meu Perfil</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>Plano:</strong> {meusDados?.plano || 'Nenhum'}</p>
              <p><strong>Objetivo:</strong> {meusDados?.objetivo || 'Não definido'}</p>
              <p><strong>Telefone:</strong> {meusDados?.telefone || 'Não informado'}</p>
              <p><strong>Status:</strong> <span style={{ color: planoStatus.color, fontWeight: 'bold' }}>{planoStatus.label}</span></p>
              {diasRestantes > 0 && <p><strong>Vencimento em:</strong> {diasRestantes} dias</p>}
            </div>
          </div>
        );
      }
    };

    return (
      <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-accent)', fontSize: '1.5rem' }}>Academia IA</h2>
          <button onClick={logout} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,0,0,0.2)', color: 'var(--danger)', border: 'none', borderRadius: '4px' }}>Sair</button>
        </header>

        <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
           <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Olá, {user.nome}!</h3>
           <p style={{ margin: 0, color: 'var(--text-muted)' }}>
             Status do Plano: <strong style={{ color: planoStatus.color }}>{planoStatus.label}</strong>
             {diasRestantes > 0 && ` (${diasRestantes} dias restantes)`}
           </p>
        </div>

        {renderStudentContent()}
        
        {/* Bottom Navigation Bar (PWA Style) */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-panel)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-around', padding: '1rem 0', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center', color: studentTab === 'aluno_treino' ? 'var(--primary-accent)' : 'var(--text-muted)', flex: 1, cursor: 'pointer' }} onClick={() => setStudentTab('aluno_treino')}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🏋️</div>
            <div style={{ fontSize: '0.75rem', fontWeight: studentTab === 'aluno_treino' ? 'bold' : 'normal' }}>Treino</div>
          </div>
          <div style={{ textAlign: 'center', color: studentTab === 'aluno_faturas' ? 'var(--primary-accent)' : 'var(--text-muted)', flex: 1, cursor: 'pointer' }} onClick={() => setStudentTab('aluno_faturas')}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💳</div>
            <div style={{ fontSize: '0.75rem', fontWeight: studentTab === 'aluno_faturas' ? 'bold' : 'normal' }}>Faturas</div>
          </div>
          <div style={{ textAlign: 'center', color: studentTab === 'aluno_perfil' ? 'var(--primary-accent)' : 'var(--text-muted)', flex: 1, cursor: 'pointer' }} onClick={() => setStudentTab('aluno_perfil')}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>👤</div>
            <div style={{ fontSize: '0.75rem', fontWeight: studentTab === 'aluno_perfil' ? 'bold' : 'normal' }}>Perfil</div>
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
          {tenantInfo?.is_trial && (
            <div style={{ marginTop: '0.8rem', padding: '0.5rem', borderRadius: '6px', background: 'rgba(252, 163, 17, 0.15)', border: '1px solid rgba(252, 163, 17, 0.3)', fontSize: '0.8rem', textAlign: 'center' }}>
              <strong style={{ color: 'var(--warning)' }}>🚀 Trial</strong>
              <p style={{ color: 'var(--text-main)', marginTop: '0.3rem' }}>{tenantInfo.trial_days_left} dias restantes</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Academia: {tenantInfo.nome}</p>
            </div>
          )}
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
              <div className={`menu-item ${activeTab === 'cobrancas' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('cobrancas')}>💰 Cobranças</div>
              <div className={`menu-item ${activeTab === 'importar_base' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('importar_base')}>📥 Importar Base</div>
              <div className={`menu-item ${activeTab === 'planos' ? 'highlight-menu' : ''}`} onClick={() => setActiveTab('planos')}>📋 Planos e Assinatura</div>
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
                    <p><strong>Probabilidade:</strong> {churnResult.probabilidade_churn.toFixed(1)}%</p>
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
              <label htmlFor="busca-aluno" style={{position:'absolute',left:'-9999px'}}>Buscar Aluno</label>
              <input 
                id="busca-aluno"
                type="text" 
                placeholder="Buscar por Nome ou CPF (Ex: João ou 000.000.000-00)" 
                value={buscaCpf}
                onChange={e => setBuscaCpf(e.target.value)}
                style={{ flex: 1 }} autoComplete="off"
              />
              <button type="submit" style={{ width: 'auto', padding: '0 1.5rem' }}>Buscar</button>
            </form>
            
            <form onSubmit={handleCreateAluno} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-layout" style={{ gap: '1rem', marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="aluno-nome">Nome Completo</label>
                  <input id="aluno-nome" type="text" value={novoAluno.nome} onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})} placeholder="Ex: João da Silva" required autoComplete="name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="aluno-cpf">CPF</label>
                  <input id="aluno-cpf" type="text" value={novoAluno.cpf} onChange={e => setNovoAluno({...novoAluno, cpf: e.target.value})} placeholder="000.000.000-00" required autoComplete="off" />
                </div>
              </div>

              <div className="grid-layout" style={{ gap: '1rem', marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="aluno-idade">Idade</label>
                  <input id="aluno-idade" type="number" value={novoAluno.idade} onChange={e => setNovoAluno({...novoAluno, idade: e.target.value})} placeholder="Ex: 28" required autoComplete="bday" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="aluno-telefone">Telefone / WhatsApp</label>
                  <input id="aluno-telefone" type="text" value={novoAluno.telefone} onChange={e => setNovoAluno({...novoAluno, telefone: e.target.value})} placeholder="(11) 90000-0000" autoComplete="tel" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="aluno-plano">Plano Escolhido</label>
                <select id="aluno-plano" value={novoAluno.plano} onChange={e => setNovoAluno({...novoAluno, plano: e.target.value})} autoComplete="off">
                  <option value="">Selecione um plano</option>
                  {planosList.map(p => (
                    <option key={p.id} value={p.nome}>{p.nome} (R$ {p.valor})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="aluno-objetivo">Objetivo Principal (Para uso da IA)</label>
                <select id="aluno-objetivo" value={novoAluno.objetivo} onChange={e => setNovoAluno({...novoAluno, objetivo: e.target.value})} autoComplete="off">
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
                    const response = await fetch(`${API_BASE_URL}/api/v1/alunos/all`, {
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
                            const response = await fetch(`${API_BASE_URL}/api/v1/alunos/${aluno.cpf}`, {
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
                  <label htmlFor="plano-nome">Nome do Plano</label>
                  <input id="plano-nome" type="text" value={novoPlano.nome} onChange={e => setNovoPlano({...novoPlano, nome: e.target.value})} placeholder="Ex: Semestral" required autoComplete="off" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="plano-valor">Valor (R$)</label>
                  <input id="plano-valor" type="number" step="0.01" value={novoPlano.valor} onChange={e => setNovoPlano({...novoPlano, valor: e.target.value})} placeholder="Ex: 500.00" required autoComplete="off" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="plano-duracao">Duração em Meses</label>
                  <input id="plano-duracao" type="number" value={novoPlano.duracao_meses} onChange={e => setNovoPlano({...novoPlano, duracao_meses: e.target.value})} placeholder="Ex: 6" required autoComplete="off" />
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
              <>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(102,252,241,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--primary-accent)', fontSize: '1rem', marginBottom: '0.5rem' }}>Planos Ativos</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{relatorioData.alunos_com_plano_ativo}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,100,100,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '0.5rem' }}>Inadimplentes</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{relatorioData.alunos_inadimplentes}</div>
                  </div>
                </div>
              </>
            ) : (
              <p>Carregando dados financeiros...</p>
            )}
          </section>
        )}

        {activeTab === 'cobrancas' && (
          <section className="glass-panel">
            <h2 className="panel-title" style={{color: 'var(--danger)'}}>Painel de Cobranças</h2>
            <p style={{ marginBottom: '1.5rem' }}>Alunos com pendências financeiras. Selecione e dispare cobrança em lote via WhatsApp.</p>

            {inadimplentesList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nenhum aluno inadimplente no momento.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => {
                      const todos = inadimplentesList.filter(a => a.telefone).map(a => a.id);
                      setSelectedCobranca(selectedCobranca.length === todos.length ? [] : todos);
                    }}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  >
                    {selectedCobranca.length === inadimplentesList.filter(a => a.telefone).length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedCobranca.length} selecionados
                  </span>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {inadimplentesList.map(a => (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.8rem', borderRadius: '8px',
                      border: '1px solid rgba(255,100,100,0.3)',
                      background: selectedCobranca.includes(a.id) ? 'rgba(255,100,100,0.1)' : 'rgba(0,0,0,0.2)',
                      cursor: 'pointer', opacity: a.telefone ? 1 : 0.5
                    }} onClick={() => {
                      if (!a.telefone) return;
                      setSelectedCobranca(prev =>
                        prev.includes(a.id) ? prev.filter(id => id !== a.id) : [...prev, a.id]
                      );
                    }}>
                      <input id={`cobranca-${a.id}`} type="checkbox" checked={selectedCobranca.includes(a.id)} onChange={() => {}} disabled={!a.telefone} autoComplete="off" />
                      <div style={{ flex: 1 }}>
                        <label htmlFor={`cobranca-${a.id}`} style={{cursor:'pointer'}}><strong>{a.nome}</strong></label>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{a.telefone || 'Sem telefone'}</span>
                        <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                          {a.faturas_atrasadas > 0 && <span style={{ color: 'var(--danger)' }}>{a.faturas_atrasadas} fatura(s) em atraso | </span>}
                          {a.dias_expirado != null && <span style={{ color: 'var(--danger)' }}>{a.dias_expirado} dia(s) vencido | </span>}
                          Plano: {a.plano || 'Nenhum'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-accent)' }}>Mensagem de Cobrança</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Use {'{nome}'} e {'{plano}'} como variáveis. Deixe vazio para usar a mensagem padrão.
                  </p>
                  <textarea
                    value={mensagemCobranca}
                    onChange={e => setMensagemCobranca(e.target.value)}
                    placeholder={`Ex: Olá {nome}! Seu plano {plano} está vencido. Regularize já!`}
                    style={{ width: '100%', minHeight: '100px', marginBottom: '1rem', padding: '0.8rem' }}
                  />
                  <button
                    disabled={cobrancaLoading || selectedCobranca.length === 0}
                    onClick={async () => {
                      setCobrancaLoading(true);
                      setCobrancaResult(null);
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL}/api/v1/webhooks/whatsapp/cobranca-lote`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({
                            alunos_ids: selectedCobranca,
                            mensagem_personalizada: mensagemCobranca
                          })
                        });
                        const data = await response.json();
                        setCobrancaResult(data);
                      } catch (err) {
                        setCobrancaResult({ erro: err.message });
                      } finally {
                        setCobrancaLoading(false);
                      }
                    }}
                    style={{ background: '#25D366', color: '#000', fontWeight: 'bold' }}
                  >
                    {cobrancaLoading ? 'Enviando...' : `Enviar WhatsApp para ${selectedCobranca.length} aluno(s)`}
                  </button>

                  {cobrancaResult && (
                    <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: cobrancaResult.erro ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)' }}>
                      {cobrancaResult.erro ? (
                        <p style={{ color: 'var(--danger)' }}>Erro: {cobrancaResult.erro}</p>
                      ) : (
                        <div>
                          <p style={{ color: 'var(--success)' }}>
                            ✅ {cobrancaResult.enviados} de {cobrancaResult.total_envios} mensagens enviadas
                            {cobrancaResult.sem_telefone > 0 && ` (${cobrancaResult.sem_telefone} alunos sem telefone)`}
                          </p>
                          <details>
                            <summary style={{ cursor: 'pointer', color: 'var(--primary-accent)', fontSize: '0.9rem' }}>Ver detalhes</summary>
                            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                              {cobrancaResult.resultados.map(r => (
                                <p key={r.id}>{r.nome}: {r.status === 'enviado' || r.status === 'simulado' ? '✅ Enviado' : r.status === 'sem_telefone' ? '📵 Sem telefone' : '❌ ' + r.status}</p>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'importar_base' && (
          <section className="glass-panel">
            <h2 className="panel-title">📥 Importar Base de Alunos</h2>
            <p style={{ marginBottom: '1.5rem' }}>Faça upload de uma planilha CSV ou Excel (.xlsx) com os dados dos alunos.</p>

            <div style={{ background: 'rgba(102,252,241,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-accent)', fontSize: '1rem' }}>Formato esperado da planilha:</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Colunas: <strong>nome</strong>, <strong>cpf</strong>, <strong>telefone</strong> (opcional), 
                <strong> idade</strong> (opcional), <strong>plano</strong> (opcional), <strong>objetivo</strong> (opcional), 
                <strong>meses_matricula</strong> (opcional), <strong>faturas_atrasadas</strong> (opcional)
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                A primeira linha deve conter os nomes das colunas. CPF duplicado será ignorado.
                {'Alunos importados recebem senha padrão "123" e username "aluno_{CPF}".'}
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!importFile) return;
              setImportLoading(true);
              setImportResult(null);
              try {
                const token = localStorage.getItem('token');
                const formData = new FormData();
                formData.append('arquivo', importFile);
                const response = await fetch(`${API_BASE_URL}/api/v1/alunos/importar`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` },
                  body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Erro ao importar');
                setImportResult(data);
              } catch (err) {
                setImportResult({ erro: err.message });
              } finally {
                setImportLoading(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="import-arquivo">Selecione o arquivo (CSV ou XLSX)</label>
                <input
                  id="import-arquivo"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={e => setImportFile(e.target.files[0])}
                  required
                  autoComplete="off"
                  style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(102,252,241,0.3)', borderRadius: '8px', width: '100%' }}
                />
              </div>
              <button type="submit" disabled={importLoading || !importFile} style={{ background: 'var(--primary-accent)', color: '#000' }}>
                {importLoading ? 'Importando...' : 'Importar Alunos'}
              </button>
            </form>

            {importResult && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: importResult.erro ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)' }}>
                {importResult.erro ? (
                  <p style={{ color: 'var(--danger)' }}>❌ {importResult.erro}</p>
                ) : (
                  <div>
                    <p style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      ✅ {importResult.importados} aluno(s) importado(s) com sucesso!
                    </p>
                    {importResult.erros && importResult.erros.length > 0 && (
                      <details style={{ marginTop: '1rem' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--danger)', fontSize: '0.9rem' }}>
                          {importResult.erros.length} erro(s) ignorado(s)
                        </summary>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                          {importResult.erros.map((e, i) => <p key={i}>{e}</p>)}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'planos' && (
          <section className="glass-panel">
            <h2 className="panel-title">📋 Planos de Assinatura</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              {tenantInfo?.is_trial
                ? `Seu trial termina em ${tenantInfo.trial_days_left} dias. Escolha um plano para continuar.`
                : `Plano atual: ${tenantInfo?.plano_nome || 'Free'} — R$ ${tenantInfo?.preco_mensal || 0}/mês`}
            </p>
            {upgradeLink ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--success)', fontSize: '1.2rem', marginBottom: '1rem' }}>✅ Link de pagamento gerado!</p>
                <a href={upgradeLink} target="_blank" rel="noopener noreferrer">
                  <button style={{ background: 'var(--primary-accent)', color: '#000', padding: '1rem 2rem', fontSize: '1.1rem', width: 'auto' }}>
                    Ir para o Pagamento
                  </button>
                </a>
                <button onClick={() => setUpgradeLink(null)} style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', marginTop: '1rem', padding: '0.5rem', width: 'auto', fontSize: '0.9rem' }}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {planosDisponiveis.filter(p => p.slug !== 'trial' && p.slug !== 'free').map(plano => {
                  const isCurrent = tenantInfo?.plano === plano.slug;
                  const isUpgrade = !isCurrent && tenantInfo?.preco_mensal < plano.preco_mensal;
                  return (
                    <div key={plano.slug} style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: isCurrent ? '2px solid var(--primary-accent)' : '1px solid rgba(102,252,241,0.2)',
                      background: isCurrent ? 'rgba(102,252,241,0.08)' : 'rgba(0,0,0,0.2)',
                      display: 'flex', flexDirection: 'column', gap: '0.8rem'
                    }}>
                      <h3 style={{ color: isCurrent ? 'var(--primary-accent)' : 'var(--text-light)', fontSize: '1.4rem' }}>{plano.nome}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{plano.descricao}</p>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: isCurrent ? 'var(--primary-accent)' : 'var(--text-light)' }}>
                        R$ {plano.preco_mensal}<span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/mês</span>
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {plano.features.map((f, i) => (
                          <li key={i} style={{ padding: '0.3rem 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>✅ {f}</li>
                        ))}
                      </ul>
                      {isCurrent && (
                        <div style={{ marginTop: 'auto', textAlign: 'center', padding: '0.5rem', background: 'rgba(102,252,241,0.2)', borderRadius: '6px', color: 'var(--primary-accent)', fontWeight: 'bold' }}>
                          Plano Atual
                        </div>
                      )}
                      {isUpgrade && (
                        <button
                          disabled={upgradeLoading}
                          onClick={async () => {
                            setUpgradeLoading(true);
                            setUpgradeMsg('');
                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE_URL}/api/v1/tenants/upgrade`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ plano_slug: plano.slug })
                              });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.detail || 'Erro');
                              setUpgradeLink(data.link_pagamento);
                            } catch (err) {
                              setUpgradeMsg('❌ ' + err.message);
                            } finally {
                              setUpgradeLoading(false);
                            }
                          }}
                          style={{ marginTop: 'auto', background: 'linear-gradient(135deg, var(--secondary-accent), var(--primary-accent))', color: '#000' }}
                        >
                          {upgradeLoading ? 'Gerando...' : `Assinar ${plano.nome}`}
                        </button>
                      )}
                      {upgradeMsg && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{upgradeMsg}</p>}
                    </div>
                  );
                })}
              </div>
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
                  <label htmlFor="pagamento-cpf">CPF do Aluno</label>
                  <input id="pagamento-cpf" type="text" value={novoPagamento.aluno_cpf} onChange={e => setNovoPagamento({...novoPagamento, aluno_cpf: e.target.value})} placeholder="000.000.000-00" required autoComplete="off" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="pagamento-valor">Valor (R$)</label>
                  <input id="pagamento-valor" type="number" step="0.01" value={novoPagamento.valor} onChange={e => setNovoPagamento({...novoPagamento, valor: e.target.value})} placeholder="Ex: 120.00" required autoComplete="off" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="pagamento-status">Status</label>
                  <select id="pagamento-status" value={novoPagamento.status} onChange={e => setNovoPagamento({...novoPagamento, status: e.target.value})} autoComplete="off">
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
                        if (data.link && (data.link.startsWith('https://') || data.link.startsWith('http://localhost'))) {
                          window.open(data.link, '_blank');
                        }
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
              <label htmlFor="consulta-busca" style={{position:'absolute',left:'-9999px'}}>Buscar Aluno</label>
              <input 
                id="consulta-busca"
                type="text" 
                placeholder="Nome ou CPF (ex: João ou 000.000.000-00)" 
                value={buscaConsultar}
                onChange={(e) => setBuscaConsultar(e.target.value)}
                style={{ flex: 1 }} autoComplete="off"
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
                  <label htmlFor="ficha-aluno">Selecione o Aluno</label>
                  <select id="ficha-aluno"
                    value={treinoForm.aluno_id} autoComplete="off"
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
                  <label htmlFor="ficha-objetivo">Objetivo do Treino</label>
                  <input id="ficha-objetivo" type="text" value={treinoForm.objetivo} onChange={e => setTreinoForm({...treinoForm, objetivo: e.target.value})} placeholder="Ex: Hipertrofia, Emagrecimento" required autoComplete="off" />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="ficha-nivel">Nível de Experiência</label>
                  <select id="ficha-nivel" value={treinoForm.nivel} onChange={e => setTreinoForm({...treinoForm, nivel: e.target.value})} autoComplete="off">
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>

                <div className="grid-layout" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ficha-dias">Dias p/ Semana</label>
                    <input id="ficha-dias" type="number" min="1" max="7" value={treinoForm.dias_por_semana} onChange={e => setTreinoForm({...treinoForm, dias_por_semana: e.target.value})} required autoComplete="off" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ficha-restricoes">Restrições Médicas?</label>
                    <input id="ficha-restricoes" type="text" value={treinoForm.restricoes} onChange={e => setTreinoForm({...treinoForm, restricoes: e.target.value})} placeholder="Ex: joelho, coluna (separado por vírgula)" autoComplete="off" />
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
                    <label htmlFor="user-nome">Nome Completo</label>
                    <input id="user-nome" type="text" value={newUser.nome} onChange={e => setNewUser({...newUser, nome: e.target.value})} required autoComplete="name" />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="user-username">Login (Username)</label>
                    <input id="user-username" type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required autoComplete="username" />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="user-password">Senha Inicial</label>
                    <input id="user-password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required autoComplete="new-password" />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="user-role">Perfil de Acesso</label>
                    <select id="user-role" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} autoComplete="off">
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
                          <label htmlFor="new-user-password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nova Senha</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              id="new-user-password"
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Nova senha"
                              autoComplete="new-password"
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
