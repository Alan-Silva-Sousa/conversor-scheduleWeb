import ExcelJS from 'exceljs';

const DIAS_SEMANA_MAP: Record<string, string> = {
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
  Saturday: 'Sábado',
  Sunday: 'Domingo'
};

export async function processarTxt(content: string): Promise<Buffer> {
  const linhas = content.split(/\r?\n/);

  const dias: Record<string, Record<string, string>> = {};
  const horas: Record<string, Record<string, string>> = {};
  const datasSet = new Set<string>();

  const regex = /^([\w\sÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç._-]+)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo),\s+(\d{2}\/\d{2}\/\d{4}),\s+([\d:]+(?:\s?(?:am|pm))?)\s*(?:to|a|-)\s*([\d:]+(?:\s?(?:am|pm))?)/i;

  for (const linha of linhas) {
  const m = linha.match(regex);
  if (!m) continue;

  let [, nome, diaSemana, data, hIniRaw, hFimRaw] = m;

  nome = nome
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

  const partes = data.split('/');

  let dia: string;
  let mes: string;
  let y: string;

  // 🔥 Se o dia da semana estiver em inglês → formato americano
  if (DIAS_SEMANA_MAP[diaSemana as keyof typeof DIAS_SEMANA_MAP]) {
    // MM/DD/YYYY
    [mes, dia, y] = partes;
  } else {
    // DD/MM/YYYY
    [dia, mes, y] = partes;
  }

  const iso = `${y}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`;

  const hIni = to24h(hIniRaw);
  const hFim = to24h(hFimRaw);

  datasSet.add(iso);

  dias[nome] ??= {};
  horas[nome] ??= {};

  dias[nome][iso] = 'T';
  horas[nome][iso] = `${hIni} - ${hFim}`;
}

  const datas = gerarIntervaloCompleto(Array.from(datasSet));

  const wb = new ExcelJS.Workbook();
  criarAba(wb, 'Dias Trabalhados', dias, datas, true);
  criarAba(wb, 'Horários Trabalhados', horas, datas, false);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function to24h(time: string): string {
  time = time.trim().toLowerCase();

  // Se não tem am/pm → já está em 24h
  if (!time.includes('am') && !time.includes('pm')) {
    const [h, m] = time.split(':').map(Number);
    return `${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
  }

  const [hm, period] = time.split(' ');
  let [h, m] = hm.split(':').map(Number);

  if (period === 'pm' && h !== 12) h += 12;
  if (period === 'am' && h === 12) h = 0;

  return `${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
}

function gerarIntervaloCompleto(datas: string[]): string[] {
  if (datas.length === 0) return [];

  const ordenadas = datas.sort(); // ISO já ordena certo

  const [anoInicio, mesInicio, diaInicio] = ordenadas[0].split('-').map(Number);
  const [anoFim, mesFim, diaFim] = ordenadas[ordenadas.length - 1].split('-').map(Number);

  const inicio = new Date(anoInicio, mesInicio - 1, diaInicio);
  const fim = new Date(anoFim, mesFim - 1, diaFim);

  const resultado: string[] = [];
  const atual = new Date(inicio);

  while (atual <= fim) {
    const y = atual.getFullYear();
    const m = String(atual.getMonth() + 1).padStart(2, '0');
    const d = String(atual.getDate()).padStart(2, '0');

    resultado.push(`${y}-${m}-${d}`);
    atual.setDate(atual.getDate() + 1);
  }

  return resultado;
}

function criarAba(
  wb: ExcelJS.Workbook,
  nome: string,
  dados: Record<string, Record<string, string>>,
  datas: string[],
  pintar: boolean
) {
  const ws = wb.addWorksheet(nome);
  ws.getCell(1, 1).value = 'Usuário';

  datas.forEach((d, i) => {
  const [y, m, day] = d.split('-');
  ws.getCell(1, i + 2).value = `${day}/${m}/${y}`;
  });

  let row = 2;
  for (const user of Object.keys(dados)) {
    ws.getCell(row, 1).value = user;

    datas.forEach((d, i) => {
      const v = dados[user][d] ?? 'F';
      const c = ws.getCell(row, i + 2);
      c.value = v;

      if (pintar && v === 'T'){
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' }
        };
      }
    });

    row++;
  }

  ws.columns.forEach(col => (col.width = 20));
}
