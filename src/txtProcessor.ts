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

  const regex =
    /^([\w\sÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç]+)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\d{2}\/\d{2}\/\d{4}),\s+([\d:]+\s?(?:am|pm))\s+to\s+([\d:]+\s?(?:am|pm))/i;

  for (const linha of linhas) {
    const m = linha.match(regex);
    if (!m) continue;

    let [, nome, diaSemana, data, hIniRaw, hFimRaw] = m;

    nome = nome
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();

    const [d, mth, y] = data.split('/');
    const iso = `${y}-${mth}-${d}`;

    const hIni = to24h(hIniRaw);
    const hFim = to24h(hFimRaw);

    datasSet.add(iso);

    dias[nome] ??= {};
    horas[nome] ??= {};

    dias[nome][iso] = 'T';
    horas[nome][iso] = `${hIni} - ${hFim}`;
  }

  const datas = Array.from(datasSet).sort();

  const wb = new ExcelJS.Workbook();
  criarAba(wb, 'Dias Trabalhados', dias, datas, true);
  criarAba(wb, 'Horários Trabalhados', horas, datas, false);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function to24h(time: string): string {
  const [hm, period] = time.toLowerCase().split(' ');
  let [h, m] = hm.split(':').map(Number);

  if (period === 'pm' && h !== 12) h += 12;
  if (period === 'am' && h === 12) h = 0;

  return `${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
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
