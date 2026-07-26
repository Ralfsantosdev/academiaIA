PLANOS_ASSINATURA = {
    "free": {
        "nome": "Free",
        "preco_mensal": 0,
        "max_alunos": 10,
        "max_usuarios": 1,
        "descricao": "Para testar o sistema sem compromisso",
        "features": ["Até 10 alunos", "1 usuário (admin)", "Relatórios básicos"]
    },
    "start": {
        "nome": "Start",
        "preco_mensal": 97,
        "max_alunos": 100,
        "max_usuarios": 3,
        "descricao": "Para academias em crescimento",
        "features": ["Até 100 alunos", "3 usuários", "Importar base", "Cobrança via WhatsApp", "Relatórios completos", "IA de treino"]
    },
    "pro": {
        "nome": "Pro",
        "preco_mensal": 197,
        "max_alunos": 500,
        "max_usuarios": 10,
        "descricao": "Para academias estabelecidas",
        "features": ["Até 500 alunos", "10 usuários", "Tudo do Start +", "Integração Mercado Pago", "API de terceiros", "Suporte prioritário"]
    },
    "enterprise": {
        "nome": "Enterprise",
        "preco_mensal": 497,
        "max_alunos": 99999,
        "max_usuarios": 99999,
        "descricao": "Para redes de academias",
        "features": ["Alunos ilimitados", "Usuários ilimitados", "Tudo do Pro +", "Onboarding dedicado", "SLA garantido", "Personalizações"]
    }
}

def get_plano_info(slug):
    return PLANOS_ASSINATURA.get(slug, PLANOS_ASSINATURA["free"])

def get_max_alunos(slug):
    return get_plano_info(slug)["max_alunos"]

def get_max_usuarios(slug):
    return get_plano_info(slug)["max_usuarios"]
