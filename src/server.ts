
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { processarTxt } from './txtProcessor';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const upload = multer();

app.get('/', (_, res) => {
  const htmlPath = path.join(__dirname, '../public/index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  html = html.replace(
    '__GENESYS_CLIENT_ID__',
    process.env.GENESYS_CLIENT_ID || ''
  );

  res.send(html);
});

app.post('/', upload.single('file'), async (req, res) => {
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
  } catch (e:any) {
    console.error(e);
    res.status(500).send('Erro ao processar arquivo');
  }
});

app.listen(3000, () => console.log('Servidor em http://localhost:3000'));
