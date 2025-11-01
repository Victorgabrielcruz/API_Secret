import dotenv from 'dotenv';
dotenv.config();

export const AuthService = {
  async verificarCredenciais(username, password) {
    try {
      console.log('🔐 Tentativa de login:', { username });
      
      // Simular delay para segurança
      await new Promise(resolve => setTimeout(resolve, 800));

      if (username !== process.env.ADMIN_USERNAME) {
        console.log('❌ Usuário incorreto');
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (password !== process.env.ADMIN_PASSWORD) {
        console.log('❌ Senha incorreta');
        return { success: false, error: 'Credenciais inválidas' };
      }

      console.log('✅ Login realizado com sucesso');
      
      return { 
        success: true, 
        usuario: { 
          id: 1, 
          username: process.env.ADMIN_USERNAME 
        },
        token: process.env.ADMIN_TOKEN,
        message: 'Login realizado com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      return { success: false, error: 'Erro interno na autenticação' };
    }
  },

  middlewareAuth(req, res, next) {
    const token = req.headers.authorization;
    
    console.log('=== 🔐 VERIFICAÇÃO DE TOKEN ===');
    console.log('Token recebido:', token ? '***' + token.slice(-4) : 'Nenhum token');
    console.log('Token esperado:', process.env.ADMIN_TOKEN ? '***' + process.env.ADMIN_TOKEN.slice(-4) : 'Não configurado');
    
    if (!token) {
      console.log('❌ Token não enviado');
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido'
      });
    }

    if (token === process.env.ADMIN_TOKEN) {
      console.log('✅ Token válido - Acesso permitido');
      next();
    } else {
      console.log('❌ Token inválido - Acesso negado');
      res.status(401).json({
        success: false,
        error: 'Token inválido. Faça login novamente.'
      });
    }
  }
};