import express from 'express';
import cors from 'cors';
import { pool, testConnection } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware para Render
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://seu-frontend.onrender.com', // Substitua pelo seu frontend no Render
    'https://victorgabriel-portfolio.onrender.com' // Exemplo
  ],
  credentials: true
}));

app.use(express.json());

// Log simplificado para produção
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Health Check para Render
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const dbResult = await client.query('SELECT NOW() as time');
    client.release();
    
    res.json({ 
      status: 'OK', 
      message: 'API Cantadas Dev - Render',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint para Render
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Cantadas Dev - Online!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      visitas: 'POST /api/visitas',
      cantadas: 'GET /api/cantadas',
      estatisticas: 'GET /api/estatisticas',
      random: 'GET /api/cantadas/random'
    },
    documentation: 'https://github.com/seu-usuario/cantadas-api'
  });
});

// Incrementar contador e obter estatísticas
app.post('/api/visitas', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    
    const visitasResult = await client.query(
      `INSERT INTO visitas (id, contador) 
       VALUES (1, 1) 
       ON CONFLICT (id) 
       DO UPDATE SET contador = visitas.contador + 1, data_atualizacao = CURRENT_TIMESTAMP
       RETURNING contador`
    );
    
    const cantadasResult = await client.query(
      'SELECT COUNT(*) as total FROM cantadas WHERE ativa = true'
    );
    
    res.json({
      success: true,
      visitas: visitasResult.rows[0].contador,
      totalCantadas: parseInt(cantadasResult.rows[0].total)
    });
    
  } catch (error) {
    console.error('Erro ao incrementar visitas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    if (client) client.release();
  }
});

// Obter todas as cantadas
app.get('/api/cantadas', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT id, texto, categoria, ativa, data_criacao FROM cantadas WHERE ativa = true ORDER BY data_criacao DESC'
    );
    
    res.json({
      success: true,
      cantadas: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Erro ao obter cantadas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao carregar cantadas' 
    });
  } finally {
    if (client) client.release();
  }
});

// Obter uma cantada aleatória
app.get('/api/cantadas/random', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT texto FROM cantadas WHERE ativa = true ORDER BY RANDOM() LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma cantada encontrada'
      });
    }
    
    res.json({
      success: true,
      cantada: result.rows[0].texto
    });
    
  } catch (error) {
    console.error('Erro ao obter cantada aleatória:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao carregar cantada' 
    });
  } finally {
    if (client) client.release();
  }
});

// Obter estatísticas
app.get('/api/estatisticas', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    
    const [visitasResult, cantadasResult] = await Promise.all([
      client.query('SELECT contador FROM visitas WHERE id = 1'),
      client.query('SELECT COUNT(*) as total FROM cantadas WHERE ativa = true')
    ]);
    
    res.json({
      success: true,
      visitas: visitasResult.rows[0]?.contador || 0,
      totalCantadas: parseInt(cantadasResult.rows[0]?.total) || 0
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao carregar estatísticas' 
    });
  } finally {
    if (client) client.release();
  }
});

// Adicionar nova cantada (útil para admin)
app.post('/api/cantadas', async (req, res) => {
  let client;
  try {
    const { texto, categoria = 'dev' } = req.body;
    
    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Texto da cantada é obrigatório'
      });
    }
    
    client = await pool.connect();
    const result = await client.query(
      'INSERT INTO cantadas (texto, categoria) VALUES ($1, $2) RETURNING *',
      [texto.trim(), categoria]
    );
    
    res.status(201).json({
      success: true,
      cantada: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao adicionar cantada:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao adicionar cantada' 
    });
  } finally {
    if (client) client.release();
  }
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Inicializar servidor
const startServer = async () => {
  console.log('🚀 Iniciando API Cantadas Dev para Render...');
  console.log('📍 Porta:', PORT);
  console.log('🌍 Ambiente:', process.env.NODE_ENV);
  
  // Testar conexão com o banco
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.log('⚠️  Aviso: Sem conexão com o banco, mas servidor iniciando...');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
    console.log(`🏥 Health Check: http://0.0.0.0:${PORT}/api/health`);
    
    if (dbConnected) {
      console.log('✅ Pronto para receber requisições!');
    }
  });
};

// Graceful shutdown para Render
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, desligando graciosamente...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, desligando graciosamente...');
  await pool.end();
  process.exit(0);
});

startServer();