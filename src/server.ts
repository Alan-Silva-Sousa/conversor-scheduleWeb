import express from 'express';
import multer from 'multer';
import path from 'path';
import { processarTxt } from './txtProcessor';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const app = express();
const upload = multer();

app.use(express.static(path.join(__dirname, '../public'), { index: false }));

// 2. Crie a rota raiz que faz a injeção do ID
app.get('/', (req, res) => {
  // Use o process.cwd() para garantir o caminho correto no Docker
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler index.html:', err);
      return res.status(500).send('Erro interno ao carregar página');
    }

    const clientId = process.env.GENESYS_CLIENT_ID || '';
    
    // Faz a troca do texto pelo ID do .env
    const renderedHtml = data.replace('{{GENESYS_CLIENT_ID}}', clientId);
    
    console.log(`Injetando Client ID: ${clientId}`); // Log para ver no 'docker logs'
    res.send(renderedHtml);
  });
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('Nenhum arquivo enviado');

  try {
    const buffer = await processarTxt(req.file.buffer.toString('utf-8'));
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=resultado.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  } catch (e: any) {
    console.error(e);
    res.status(500).send('Erro ao processar arquivo');
  }
});

app.listen(3000, '0.0.0.0', () => {
console.log('Servidor rodando na porta 3000');
});
