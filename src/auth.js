import dotenv from 'dotenv';
dotenv.config();

export const AuthService = {
  async verificarCredenciais(username, password) {
    try {
      console.log('🔐 Tentativa de login:', { username });
      
      // Debug: mostrar variáveis de ambiente (sem senhas)
      console.log('🔑 Configurações carregadas:', {
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPassword: !!process.env.ADMIN_PASSWORD,
        hasToken: !!process.env.ADMIN_TOKEN,
        nodeEnv: process.env.NODE_ENV
      });
      
      // Simular delay para segurança
      await new Promise(resolve => setTimeout(resolve, 800));

      // 🔥 CORREÇÃO: Usar valores padrão se env não estiver configurado
      const adminUser = process.env.ADMIN_USERNAME 
      const adminPass = process.env.ADMIN_PASSWORD 
      const adminToken = process.env.ADMIN_TOKEN 

      console.log('🔍 Comparando credenciais...');
      console.log('📝 Usuário esperado:', adminUser);
      console.log('📝 Usuário recebido:', username);

      if (username !== adminUser) {
        console.log('❌ Usuário incorreto');
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (password !== adminPass) {
        console.log('❌ Senha incorreta');
        return { success: false, error: 'Credenciais inválidas' };
      }

      console.log('✅ Login realizado com sucesso');
      console.log('🎟️  Token que será retornado:', adminToken ? '***' + adminToken.slice(-4) : 'Nenhum');
      
      return { 
        success: true, 
        usuario: { 
          id: 1, 
          username: adminUser 
        },
        token: adminToken, // 🔥 CORREÇÃO: Usar o mesmo token que será verificado
        message: 'Login realizado com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      return { success: false, error: 'Erro interno na autenticação' };
    }
  },

  middlewareAuth(req, res, next) {
    let token = req.headers.authorization;
    
    console.log('=== 🔐 VERIFICAÇÃO DE TOKEN ===');
    console.log('📨 Token recebido:', token ? '***' + token.slice(-4) : 'Nenhum token');
    console.log('📨 Header completo:', req.headers);
    
    // 🔥 CORREÇÃO: Remover "Bearer " se presente
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
      console.log('🔧 Token após remover Bearer:', '***' + token.slice(-4));
    }
    
    const expectedToken = process.env.ADMIN_TOKEN || 'admin_token_secreto';
    console.log('🎯 Token esperado:', expectedToken ? '***' + expectedToken.slice(-4) : 'Não configurado');
    
    if (!token) {
      console.log('❌ Token não enviado');
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido'
      });
    }

    if (token === expectedToken) {
      console.log('✅ Token válido - Acesso permitido');
      next();
    } else {
      console.log('❌ Token inválido - Acesso negado');
      console.log('🔍 Comparação:', {
        received: '***' + token.slice(-4),
        expected: '***' + expectedToken.slice(-4),
        match: token === expectedToken
      });
      res.status(401).json({
        success: false,
        error: 'Token inválido. Faça login novamente.'
      });
    }
  },

  // 🔥 NOVO: Método para verificar configurações
  verificarConfiguracoes() {
    const config = {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Não configurado (usando padrão: admin)',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '***' : 'Não configurado (usando padrão: admin123)',
      ADMIN_TOKEN: process.env.ADMIN_TOKEN ? '***' : 'Não configurado (usando padrão: admin_token_secreto)',
      NODE_ENV: process.env.NODE_ENV || 'Não configurado'
    };
    
    console.log('=== 🔧 CONFIGURAÇÕES DE AUTENTICAÇÃO ===');
    Object.entries(config).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log('========================================');
    
    return config;
  }
};

// 🔥 NOVO: Verificar configurações ao iniciar
console.log('🔄 Inicializando serviço de autenticação...');
AuthService.verificarConfiguracoes();