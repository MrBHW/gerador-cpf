/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GERADOR DE CPFs FICTÍCIOS
 *  Arquivo: gerador.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

let cpfsGerados = [];

function gerarDigito(digitos, pesoInicial) {
  let soma = 0;
  for (let i = 0; i < digitos.length; i++) {
    soma += digitos[i] * (pesoInicial - i);
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function gerarCPF() {
  const base = [];
  for (let i = 0; i < 9; i++) {
    base.push(Math.floor(Math.random() * 10));
  }
  const v1 = gerarDigito(base, 10);
  const v2 = gerarDigito([...base, v1], 11);
  return [...base, v1, v2].join('');
}

function cpfSequencial(cpf) {
  return /^(\d)\1{10}$/.test(cpf);
}

function gerar() {
  const inputQtd  = document.getElementById('qtd');
  const erroEl    = document.getElementById('erro');
  const statsEl   = document.getElementById('stats');
  const previewEl = document.getElementById('preview');

  erroEl.style.display = 'none';

  const quantidade = parseInt(inputQtd.value, 10);

  if (!quantidade || quantidade < 1 || quantidade > 10000) {
    erroEl.style.display = 'block';
    return;
  }

  cpfsGerados = [];
  const usados = new Set();
  let tentativas = 0;
  const limiteTentativas = quantidade * 5;

  while (cpfsGerados.length < quantidade && tentativas < limiteTentativas) {
    const cpf = gerarCPF();
    if (!cpfSequencial(cpf) && !usados.has(cpf)) {
      usados.add(cpf);
      cpfsGerados.push(cpf);
    }
    tentativas++;
  }

  document.getElementById('statQtd').textContent =
    cpfsGerados.length.toLocaleString('pt-BR');
  statsEl.classList.add('visible');

  const listaEl     = document.getElementById('lista');
  const previewCPFs = cpfsGerados.slice(0, 10);

  listaEl.innerHTML = previewCPFs.map(cpf => `<div>${cpf}</div>`).join('');

  const maisEl = document.getElementById('mais');
  if (cpfsGerados.length > 10) {
    maisEl.textContent =
      `… e mais ${(cpfsGerados.length - 10).toLocaleString('pt-BR')} CPFs no arquivo Excel.`;
  } else {
    maisEl.textContent = '';
  }

  previewEl.classList.add('visible');
  document.getElementById('btnBaixar').disabled = false;
}

function baixarExcel() {
  if (cpfsGerados.length === 0) return;

  const wb   = XLSX.utils.book_new();
  const dados = [
    ['CPF'],
    ...cpfsGerados.map(cpf => [{ t: 's', v: cpf }])
  ];
  const ws = XLSX.utils.aoa_to_sheet(dados);
  ws['!cols'] = [{ wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'CPFs');
  XLSX.writeFile(wb, `cpfs_ficticios_${cpfsGerados.length}.xlsx`);
}
