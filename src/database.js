import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Configuração otimizada para produção
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configurações para Render + Neon
  max: 10, // Reduzido para evitar sobrecarga
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão com retry
export const testConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    let client;
    try {
      client = await pool.connect();
      console.log('✅ Conectado ao PostgreSQL Neon.tech');
      
      // Verificar se as tabelas necessárias existem
      await client.query('SELECT 1 FROM visitas LIMIT 1');
      await client.query('SELECT 1 FROM cantadas LIMIT 1');
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1}/${retries} - Erro na conexão:`, error.message);
      
      if (client) client.release();
      
      if (i < retries - 1) {
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Todas as tentativas de conexão falharam');
        return false;
      }
    }
  }
};