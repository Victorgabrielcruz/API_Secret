import dotenv from 'dotenv';
dotenv.config();

export const AuthService = {
  async verificarCredenciais(username, password) {
    try {
      // Simular um pequeno delay para segurança
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Tentativa de login:', { username, password: '***' });

      if (username !== process.env.ADMIN_USERNAME) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (password !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      console.log('Login realizado com sucesso para:', username);
      
      return { 
        success: true, 
        usuario: { 
          id: 1, 
          username: process.env.ADMIN_USERNAME 
        },
        token: process.env.ADMIN_TOKEN
      };

    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, error: 'Erro interno na autenticação' };
    }
  },

  middlewareAuth(req, res, next) {
    const token = req.headers.authorization || req.query.token;
    
    console.log('Verificando token:', token ? '***' + token.slice(-4) : 'Nenhum token');
    
    if (token === process.env.ADMIN_TOKEN) {
      next();
    } else {
      console.log('Acesso negado - Token inválido');
      res.status(401).json({
        success: false,
        error: 'Não autorizado. Faça login novamente.'
      });
    }
  }
};