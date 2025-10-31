import bcrypt from 'bcrypt';

export const AuthService = {
  // Verificar credenciais
  async verificarCredenciais(username, password) {
    try {
      // Aqui você buscaria do banco, mas como é só um usuário:
      const usuarioValido = {
        username: 'admin',
        passwordHash: '$2b$10$8J6aXl5Y3qjz1Q1VQ2Q3uOcWQ3nY5Z7A9B1C3D5E7G9I1K3M5O7Q9S1U3W5' // admin123
      };

      if (username !== usuarioValido.username) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const senhaValida = await bcrypt.compare(password, usuarioValido.passwordHash);
      
      if (!senhaValida) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      return { 
        success: true, 
        usuario: { 
          id: 1, 
          username: usuarioValido.username 
        } 
      };

    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, error: 'Erro interno na autenticação' };
    }
  },

  // Middleware para verificar autenticação
  middlewareAuth(req, res, next) {
    // Em produção, você usaria JWT ou sessions
    // Aqui vou usar uma verificação simples por query param
    const token = req.headers.authorization || req.query.token;
    
    if (token === 'admin_token_secreto') {
      next();
    } else {
      res.status(401).json({
        success: false,
        error: 'Não autorizado'
      });
    }
  }
};