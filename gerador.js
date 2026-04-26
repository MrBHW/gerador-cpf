<<<<<<< HEAD
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GERADOR DE CPFs FICTÍCIOS
 *  Arquivo: gerador.js
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  O CPF tem 11 dígitos: [D1 D2 D3 D4 D5 D6 D7 D8 D9] [V1] [V2]
 *
 *  Os 9 primeiros são aleatórios.
 *  V1 e V2 são calculados pelo algoritmo oficial da Receita Federal.
 *
 *  Exemplo de CPF:  456 382 891 - 09
 *  Sem pontuação:   45638289109
 * ═══════════════════════════════════════════════════════════════════════════
 */


// ─── VARIÁVEL GLOBAL ────────────────────────────────────────────────────────
// Armazena os CPFs gerados para que a função baixarExcel() possa acessá-los
// depois que o usuário clicar em "Baixar .xlsx".
let cpfsGerados = [];


// ─── FUNÇÃO 1: gerarDigito ──────────────────────────────────────────────────
/**
 * Calcula um dígito verificador do CPF.
 *
 * O algoritmo funciona assim:
 *   1. Multiplica cada dígito pelo seu "peso" (que diminui a cada posição)
 *   2. Soma todos os produtos
 *   3. Divide a soma por 11 e pega o RESTO da divisão (operador %)
 *   4. Se o resto for 0 ou 1 → dígito = 0
 *      Se o resto for 2 a 10  → dígito = 11 - resto
 *
 * @param {number[]} digitos - Array com os dígitos usados no cálculo
 * @param {number}   pesoInicial - Peso do PRIMEIRO dígito do array
 *
 * Exemplo para o 1º verificador:
 *   digitos      = [4, 5, 6, 3, 8, 2, 8, 9, 1]
 *   pesoInicial  = 10
 *   pesos usados = [10, 9, 8, 7, 6, 5, 4, 3, 2]
 */
function gerarDigito(digitos, pesoInicial) {
  let soma = 0;

  for (let i = 0; i < digitos.length; i++) {
    soma += digitos[i] * (pesoInicial - i);
    //
    // Iteração a iteração (exemplo com [4,5,6,3,8,2,8,9,1] e peso 10):
    //   i=0: 4 * 10 = 40
    //   i=1: 5 *  9 = 45
    //   i=2: 6 *  8 = 48
    //   i=3: 3 *  7 = 21
    //   i=4: 8 *  6 = 48
    //   i=5: 2 *  5 = 10
    //   i=6: 8 *  4 = 32
    //   i=7: 9 *  3 = 27
    //   i=8: 1 *  2 =  2
    //   SOMA = 273
  }

  const resto = soma % 11;  // 273 % 11 = 9

  // Regra da Receita Federal:
  return resto < 2 ? 0 : 11 - resto;  // 11 - 9 = 2  → primeiro verificador = 2
}


// ─── FUNÇÃO 2: gerarCPF ─────────────────────────────────────────────────────
/**
 * Gera um único CPF fictício com 11 dígitos sem pontuação.
 *
 * Fluxo:
 *   1. Gera 9 dígitos aleatórios (0-9)
 *   2. Calcula o 1º dígito verificador (V1) usando os 9 dígitos, peso inicial = 10
 *   3. Calcula o 2º dígito verificador (V2) usando os 9 + V1, peso inicial = 11
 *   4. Junta tudo num string de 11 caracteres
 *
 * @returns {string} CPF com 11 dígitos, ex: "45638289102"
 */
function gerarCPF() {
  // PASSO 1 — Gera os 9 dígitos base de forma aleatória
  const base = [];
  for (let i = 0; i < 9; i++) {
    base.push(Math.floor(Math.random() * 10));
    // Math.random() → float entre 0 (incluso) e 1 (excluso), ex: 0.4562
    // * 10          → 4.562
    // Math.floor()  → 4   (arredonda para baixo = dígito inteiro 0-9)
  }

  // PASSO 2 — 1º dígito verificador
  const v1 = gerarDigito(base, 10);

  // PASSO 3 — 2º dígito verificador (usa os 9 dígitos + v1, agora são 10)
  const v2 = gerarDigito([...base, v1], 11);
  // [...base, v1] = spread operator: cria um NOVO array copiando "base" e adicionando v1

  // PASSO 4 — Monta o CPF final como string
  return [...base, v1, v2].join('');
  // .join('') une todos os elementos do array sem separador
  // Exemplo: [4,5,6,3,8,2,8,9,1,0,9] → "45638289109"
}


// ─── FUNÇÃO 3: cpfSequencial ────────────────────────────────────────────────
/**
 * Verifica se um CPF tem todos os dígitos iguais (ex: 11111111111).
 *
 * CPFs assim passam no algoritmo matemático, mas são explicitamente
 * rejeitados pela Receita Federal. Precisamos filtrá-los.
 *
 * A regex /^(\d)\1{10}$/ funciona assim:
 *   ^       → início da string
 *   (\d)    → captura qualquer dígito no grupo 1
 *   \1{10}  → o mesmo dígito capturado (backreference \1) deve se repetir +10 vezes
 *   $       → fim da string
 *   Total: 1 + 10 = 11 dígitos iguais
 *
 * @param {string} cpf
 * @returns {boolean} true se for inválido (sequencial)
 */
function cpfSequencial(cpf) {
  return /^(\d)\1{10}$/.test(cpf);
}


// ─── FUNÇÃO 4: gerar ────────────────────────────────────────────────────────
/**
 * Função principal — chamada quando o usuário clica em "Gerar CPFs".
 *
 * Responsabilidades:
 *   - Valida o input do usuário
 *   - Gera os CPFs evitando duplicatas e sequenciais
 *   - Atualiza a interface (estatísticas e prévia)
 */
function gerar() {
  // Referências aos elementos HTML
  const inputQtd = document.getElementById('qtd');
  const erroEl   = document.getElementById('erro');
  const statsEl  = document.getElementById('stats');
  const previewEl = document.getElementById('preview');

  // Esconde erro anterior (se houver)
  erroEl.style.display = 'none';

  // Lê e converte o valor do input para inteiro
  const quantidade = parseInt(inputQtd.value, 10);

  // Validação: precisa ser número entre 1 e 10000
  if (!quantidade || quantidade < 1 || quantidade > 10000) {
    erroEl.style.display = 'block';  // mostra a mensagem de erro
    return;                           // para a execução aqui
  }

  // ── Geração dos CPFs ──────────────────────────────────────────────────────
  cpfsGerados = [];              // limpa array global
  const usados = new Set();     // Set garante unicidade (sem duplicatas)
  //
  // Por que Set em vez de Array?
  // Array.includes() percorre O(n) elementos a cada checagem.
  // Set.has()        é O(1) — busca em tempo constante. Muito mais rápido
  //                           quando geramos milhares de CPFs.

  let tentativas = 0;
  const limiteTentativas = quantidade * 5; // margem para evitar loop infinito

  while (cpfsGerados.length < quantidade && tentativas < limiteTentativas) {
    const cpf = gerarCPF();

    // Adiciona apenas se não for sequencial e não for duplicado
    if (!cpfSequencial(cpf) && !usados.has(cpf)) {
      usados.add(cpf);
      cpfsGerados.push(cpf);
    }

    tentativas++;
  }

  // ── Atualiza a interface ──────────────────────────────────────────────────

  // Exibe as estatísticas
  document.getElementById('statQtd').textContent =
    cpfsGerados.length.toLocaleString('pt-BR');   // formata com ponto: "1.500"
  statsEl.classList.add('visible');

  // Exibe a prévia (até 10 CPFs)
  const listaEl = document.getElementById('lista');
  const previewCPFs = cpfsGerados.slice(0, 10);   // pega os primeiros 10

  listaEl.innerHTML = previewCPFs
    .map(cpf => `<div>${cpf}</div>`)              // cada CPF em uma <div>
    .join('');

  // Mensagem "e mais N CPFs no arquivo Excel"
  const maisEl = document.getElementById('mais');
  if (cpfsGerados.length > 10) {
    maisEl.textContent =
      `… e mais ${(cpfsGerados.length - 10).toLocaleString('pt-BR')} CPFs no arquivo Excel.`;
  } else {
    maisEl.textContent = '';
  }

  previewEl.classList.add('visible');

  // Habilita o botão de download
  document.getElementById('btnBaixar').disabled = false;
}


// ─── FUNÇÃO 5: baixarExcel ──────────────────────────────────────────────────
/**
 * Cria e faz o download de um arquivo .xlsx com todos os CPFs gerados.
 *
 * Usa a biblioteca SheetJS (XLSX) que foi carregada no index.html.
 *
 * !! IMPORTANTE — POR QUE SALVAR COMO TEXTO (type: 's') ??
 *
 * CPFs podem começar com zero: ex "01234567890"
 * Se salvarmos como NÚMERO, o Excel entende "1234567890" e remove o zero.
 * Forçando type: 's' (string/texto), o Excel preserva todos os 11 dígitos.
 */
function baixarExcel() {
  // Segurança: só executa se houver CPFs gerados
  if (cpfsGerados.length === 0) return;

  // ── 1. Cria uma nova planilha ─────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  // wb = workbook (o arquivo Excel inteiro)

  // ── 2. Monta os dados como array de arrays ────────────────────────────────
  //
  // Estrutura esperada pelo SheetJS:
  //   [ [linha1colA], [linha2colA], ... ]
  //
  // A primeira linha é o cabeçalho.
  // As demais linhas são os CPFs, cada um como objeto de célula explícita:
  //   { t: 's', v: '01234567890' }
  //   t: 's' = tipo texto (string)
  //   v: valor da célula
  //
  const dados = [
    ['CPF'],  // linha 1 = cabeçalho
    ...cpfsGerados.map(cpf => [{ t: 's', v: cpf }])
    //
    // O spread operator (...) "desempacota" o array de CPFs para que
    // cada CPF vire uma linha separada, não um array dentro de um array.
    //
    // Sem spread: [ ['CPF'], [ [{cpf1}], [{cpf2}] ] ]   ← ERRADO
    // Com spread: [ ['CPF'], [{cpf1}], [{cpf2}], ... ]  ← CORRETO
  ];

  // ── 3. Converte para objeto de planilha (worksheet) ───────────────────────
  const ws = XLSX.utils.aoa_to_sheet(dados);
  // aoa = Array Of Arrays

  // ── 4. Define a largura da coluna A ───────────────────────────────────────
  ws['!cols'] = [{ wch: 16 }];
  // wch = width in characters (largura em caracteres)

  // ── 5. Adiciona a planilha ao workbook ────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, ws, 'CPFs');
  // Parâmetros: (workbook, worksheet, nome da aba)

  // ── 6. Gera e baixa o arquivo ─────────────────────────────────────────────
  const nomeArquivo = `cpfs_ficticios_${cpfsGerados.length}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
  // O SheetJS cria o arquivo binário e dispara o download automaticamente.
=======
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GERADOR DE CPFs FICTÍCIOS
 *  Arquivo: gerador.js
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  O CPF tem 11 dígitos: [D1 D2 D3 D4 D5 D6 D7 D8 D9] [V1] [V2]
 *
 *  Os 9 primeiros são aleatórios.
 *  V1 e V2 são calculados pelo algoritmo oficial da Receita Federal.
 *
 *  Exemplo de CPF:  456 382 891 - 09
 *  Sem pontuação:   45638289109
 * ═══════════════════════════════════════════════════════════════════════════
 */


// ─── VARIÁVEL GLOBAL ────────────────────────────────────────────────────────
// Armazena os CPFs gerados para que a função baixarExcel() possa acessá-los
// depois que o usuário clicar em "Baixar .xlsx".
let cpfsGerados = [];


// ─── FUNÇÃO 1: gerarDigito ──────────────────────────────────────────────────
/**
 * Calcula um dígito verificador do CPF.
 *
 * O algoritmo funciona assim:
 *   1. Multiplica cada dígito pelo seu "peso" (que diminui a cada posição)
 *   2. Soma todos os produtos
 *   3. Divide a soma por 11 e pega o RESTO da divisão (operador %)
 *   4. Se o resto for 0 ou 1 → dígito = 0
 *      Se o resto for 2 a 10  → dígito = 11 - resto
 *
 * @param {number[]} digitos - Array com os dígitos usados no cálculo
 * @param {number}   pesoInicial - Peso do PRIMEIRO dígito do array
 *
 * Exemplo para o 1º verificador:
 *   digitos      = [4, 5, 6, 3, 8, 2, 8, 9, 1]
 *   pesoInicial  = 10
 *   pesos usados = [10, 9, 8, 7, 6, 5, 4, 3, 2]
 */
function gerarDigito(digitos, pesoInicial) {
  let soma = 0;

  for (let i = 0; i < digitos.length; i++) {
    soma += digitos[i] * (pesoInicial - i);
    //
    // Iteração a iteração (exemplo com [4,5,6,3,8,2,8,9,1] e peso 10):
    //   i=0: 4 * 10 = 40
    //   i=1: 5 *  9 = 45
    //   i=2: 6 *  8 = 48
    //   i=3: 3 *  7 = 21
    //   i=4: 8 *  6 = 48
    //   i=5: 2 *  5 = 10
    //   i=6: 8 *  4 = 32
    //   i=7: 9 *  3 = 27
    //   i=8: 1 *  2 =  2
    //   SOMA = 273
  }

  const resto = soma % 11;  // 273 % 11 = 9

  // Regra da Receita Federal:
  return resto < 2 ? 0 : 11 - resto;  // 11 - 9 = 2  → primeiro verificador = 2
}


// ─── FUNÇÃO 2: gerarCPF ─────────────────────────────────────────────────────
/**
 * Gera um único CPF fictício com 11 dígitos sem pontuação.
 *
 * Fluxo:
 *   1. Gera 9 dígitos aleatórios (0-9)
 *   2. Calcula o 1º dígito verificador (V1) usando os 9 dígitos, peso inicial = 10
 *   3. Calcula o 2º dígito verificador (V2) usando os 9 + V1, peso inicial = 11
 *   4. Junta tudo num string de 11 caracteres
 *
 * @returns {string} CPF com 11 dígitos, ex: "45638289102"
 */
function gerarCPF() {
  // PASSO 1 — Gera os 9 dígitos base de forma aleatória
  const base = [];
  for (let i = 0; i < 9; i++) {
    base.push(Math.floor(Math.random() * 10));
    // Math.random() → float entre 0 (incluso) e 1 (excluso), ex: 0.4562
    // * 10          → 4.562
    // Math.floor()  → 4   (arredonda para baixo = dígito inteiro 0-9)
  }

  // PASSO 2 — 1º dígito verificador
  const v1 = gerarDigito(base, 10);

  // PASSO 3 — 2º dígito verificador (usa os 9 dígitos + v1, agora são 10)
  const v2 = gerarDigito([...base, v1], 11);
  // [...base, v1] = spread operator: cria um NOVO array copiando "base" e adicionando v1

  // PASSO 4 — Monta o CPF final como string
  return [...base, v1, v2].join('');
  // .join('') une todos os elementos do array sem separador
  // Exemplo: [4,5,6,3,8,2,8,9,1,0,9] → "45638289109"
}


// ─── FUNÇÃO 3: cpfSequencial ────────────────────────────────────────────────
/**
 * Verifica se um CPF tem todos os dígitos iguais (ex: 11111111111).
 *
 * CPFs assim passam no algoritmo matemático, mas são explicitamente
 * rejeitados pela Receita Federal. Precisamos filtrá-los.
 *
 * A regex /^(\d)\1{10}$/ funciona assim:
 *   ^       → início da string
 *   (\d)    → captura qualquer dígito no grupo 1
 *   \1{10}  → o mesmo dígito capturado (backreference \1) deve se repetir +10 vezes
 *   $       → fim da string
 *   Total: 1 + 10 = 11 dígitos iguais
 *
 * @param {string} cpf
 * @returns {boolean} true se for inválido (sequencial)
 */
function cpfSequencial(cpf) {
  return /^(\d)\1{10}$/.test(cpf);
}


// ─── FUNÇÃO 4: gerar ────────────────────────────────────────────────────────
/**
 * Função principal — chamada quando o usuário clica em "Gerar CPFs".
 *
 * Responsabilidades:
 *   - Valida o input do usuário
 *   - Gera os CPFs evitando duplicatas e sequenciais
 *   - Atualiza a interface (estatísticas e prévia)
 */
function gerar() {
  // Referências aos elementos HTML
  const inputQtd = document.getElementById('qtd');
  const erroEl   = document.getElementById('erro');
  const statsEl  = document.getElementById('stats');
  const previewEl = document.getElementById('preview');

  // Esconde erro anterior (se houver)
  erroEl.style.display = 'none';

  // Lê e converte o valor do input para inteiro
  const quantidade = parseInt(inputQtd.value, 10);

  // Validação: precisa ser número entre 1 e 10000
  if (!quantidade || quantidade < 1 || quantidade > 10000) {
    erroEl.style.display = 'block';  // mostra a mensagem de erro
    return;                           // para a execução aqui
  }

  // ── Geração dos CPFs ──────────────────────────────────────────────────────
  cpfsGerados = [];              // limpa array global
  const usados = new Set();     // Set garante unicidade (sem duplicatas)
  //
  // Por que Set em vez de Array?
  // Array.includes() percorre O(n) elementos a cada checagem.
  // Set.has()        é O(1) — busca em tempo constante. Muito mais rápido
  //                           quando geramos milhares de CPFs.

  let tentativas = 0;
  const limiteTentativas = quantidade * 5; // margem para evitar loop infinito

  while (cpfsGerados.length < quantidade && tentativas < limiteTentativas) {
    const cpf = gerarCPF();

    // Adiciona apenas se não for sequencial e não for duplicado
    if (!cpfSequencial(cpf) && !usados.has(cpf)) {
      usados.add(cpf);
      cpfsGerados.push(cpf);
    }

    tentativas++;
  }

  // ── Atualiza a interface ──────────────────────────────────────────────────

  // Exibe as estatísticas
  document.getElementById('statQtd').textContent =
    cpfsGerados.length.toLocaleString('pt-BR');   // formata com ponto: "1.500"
  statsEl.classList.add('visible');

  // Exibe a prévia (até 10 CPFs)
  const listaEl = document.getElementById('lista');
  const previewCPFs = cpfsGerados.slice(0, 10);   // pega os primeiros 10

  listaEl.innerHTML = previewCPFs
    .map(cpf => `<div>${cpf}</div>`)              // cada CPF em uma <div>
    .join('');

  // Mensagem "e mais N CPFs no arquivo Excel"
  const maisEl = document.getElementById('mais');
  if (cpfsGerados.length > 10) {
    maisEl.textContent =
      `… e mais ${(cpfsGerados.length - 10).toLocaleString('pt-BR')} CPFs no arquivo Excel.`;
  } else {
    maisEl.textContent = '';
  }

  previewEl.classList.add('visible');

  // Habilita o botão de download
  document.getElementById('btnBaixar').disabled = false;
}


// ─── FUNÇÃO 5: baixarExcel ──────────────────────────────────────────────────
/**
 * Cria e faz o download de um arquivo .xlsx com todos os CPFs gerados.
 *
 * Usa a biblioteca SheetJS (XLSX) que foi carregada no index.html.
 *
 * !! IMPORTANTE — POR QUE SALVAR COMO TEXTO (type: 's') ??
 *
 * CPFs podem começar com zero: ex "01234567890"
 * Se salvarmos como NÚMERO, o Excel entende "1234567890" e remove o zero.
 * Forçando type: 's' (string/texto), o Excel preserva todos os 11 dígitos.
 */
function baixarExcel() {
  // Segurança: só executa se houver CPFs gerados
  if (cpfsGerados.length === 0) return;

  // ── 1. Cria uma nova planilha ─────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  // wb = workbook (o arquivo Excel inteiro)

  // ── 2. Monta os dados como array de arrays ────────────────────────────────
  //
  // Estrutura esperada pelo SheetJS:
  //   [ [linha1colA], [linha2colA], ... ]
  //
  // A primeira linha é o cabeçalho.
  // As demais linhas são os CPFs, cada um como objeto de célula explícita:
  //   { t: 's', v: '01234567890' }
  //   t: 's' = tipo texto (string)
  //   v: valor da célula
  //
  const dados = [
    ['CPF'],  // linha 1 = cabeçalho
    ...cpfsGerados.map(cpf => [{ t: 's', v: cpf }])
    //
    // O spread operator (...) "desempacota" o array de CPFs para que
    // cada CPF vire uma linha separada, não um array dentro de um array.
    //
    // Sem spread: [ ['CPF'], [ [{cpf1}], [{cpf2}] ] ]   ← ERRADO
    // Com spread: [ ['CPF'], [{cpf1}], [{cpf2}], ... ]  ← CORRETO
  ];

  // ── 3. Converte para objeto de planilha (worksheet) ───────────────────────
  const ws = XLSX.utils.aoa_to_sheet(dados);
  // aoa = Array Of Arrays

  // ── 4. Define a largura da coluna A ───────────────────────────────────────
  ws['!cols'] = [{ wch: 16 }];
  // wch = width in characters (largura em caracteres)

  // ── 5. Adiciona a planilha ao workbook ────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, ws, 'CPFs');
  // Parâmetros: (workbook, worksheet, nome da aba)

  // ── 6. Gera e baixa o arquivo ─────────────────────────────────────────────
  const nomeArquivo = `cpfs_ficticios_${cpfsGerados.length}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
  // O SheetJS cria o arquivo binário e dispara o download automaticamente.
>>>>>>> 06254ee500681ed9313a21bc4b33333d37a0ffd0
}