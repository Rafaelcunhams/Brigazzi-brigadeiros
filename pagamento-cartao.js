// ═══════════════════════════════════════════════════
//  BRIGAZZI — pagamento-cartao.js
// ═══════════════════════════════════════════════════

function fmtMoeda(val) {
    return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
}

// ─── CARREGAR DADOS DO LOCALSTORAGE ───────────────
const pedido = JSON.parse(localStorage.getItem('brigazziPedido') || '{}');

if (!pedido.produto) {
    window.location.href = 'pedido.html';
}

// ─── PREENCHER RESUMO MINI ────────────────────────
document.getElementById('rmProduto').textContent = pedido.produto || '—';
document.getElementById('rmTipo').textContent = pedido.tipo || '—';
document.getElementById('rmQtd').textContent = pedido.quantidade + ' un.';
document.getElementById('rmTotal').textContent = fmtMoeda(pedido.total);
document.getElementById('btnTotal').textContent = fmtMoeda(pedido.total);

// ─── FLIP DO CARTÃO (CVV) ─────────────────────────
function flipCard(flip) {
    const card = document.getElementById('creditCard');
    if (flip) card.classList.add('flipped');
    else card.classList.remove('flipped');
}

// ─── SYNC DO PREVIEW DO CARTÃO ────────────────────
function syncNome(val) {
    const display = document.getElementById('cardNomePreview');
    display.textContent = val.toUpperCase() || 'NOME COMPLETO';
}

function syncExp(val) {
    document.getElementById('cardExpPreview').textContent = val || 'MM/AA';
}

function syncCvv(val) {
    document.getElementById('cardCvvPreview').textContent = val ? '•'.repeat(val.length) : '•••';
}

// ─── MÁSCARAS DOS INPUTS ──────────────────────────
const numInput = document.getElementById('cardNumero');
const valInput = document.getElementById('cardValidade');

numInput.addEventListener('input', () => {
    let v = numInput.value.replace(/\D/g, '').slice(0, 16);
    numInput.value = v.replace(/(.{4})/g, '$1 ').trim();

    // Preview do número
    const padded = (v + '0000000000000000').slice(0, 16);
    const groups = padded.match(/.{4}/g);
    document.getElementById('cardNumPreview').textContent = groups.join('  ');

    // Detecta bandeira
    detectBrand(v);

    // Validação visual
    setFieldState(numInput, v.length === 16);
});

valInput.addEventListener('input', () => {
    let v = valInput.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    valInput.value = v;
    syncExp(v);
    setFieldState(valInput, v.length === 5);
});

document.getElementById('cardCvv').addEventListener('input', function () {
    syncCvv(this.value);
    setFieldState(this, this.value.length >= 3);
});

document.getElementById('cardNome').addEventListener('input', function () {
    syncNome(this.value);
    setFieldState(this, this.value.trim().length >= 3);
});

// ─── VALIDAÇÃO VISUAL DOS CAMPOS ──────────────────
function setFieldState(input, valid) {
    input.classList.remove('valid', 'invalid');
    if (input.value.trim() !== '') {
        input.classList.add(valid ? 'valid' : 'invalid');
    }
}

// ─── DETECÇÃO DE BANDEIRA ─────────────────────────
function detectBrand(num) {
    const icon = document.getElementById('brandIcon');
    if (/^4/.test(num)) icon.innerHTML = '<i class="fab fa-cc-visa" style="color:#1A1F71"></i>';
    else if (/^5[1-5]/.test(num)) icon.innerHTML = '<i class="fab fa-cc-mastercard" style="color:#EB001B"></i>';
    else if (/^3[47]/.test(num)) icon.innerHTML = '<i class="fab fa-cc-amex" style="color:#2E77BC"></i>';
    else icon.innerHTML = '';

    // Também troca o ícone da frente do cartão
    const brandEl = document.querySelector('.card-brand');
    if (/^4/.test(num)) brandEl.innerHTML = '<i class="fab fa-cc-visa"></i>';
    else if (/^5[1-5]/.test(num)) brandEl.innerHTML = '<i class="fab fa-cc-mastercard"></i>';
    else if (/^3[47]/.test(num)) brandEl.innerHTML = '<i class="fab fa-cc-amex"></i>';
    else brandEl.innerHTML = '<i class="fab fa-cc-visa"></i>';
}

// ─── PROCESSAR PAGAMENTO ──────────────────────────
function processarPagamento() {
    const nome = document.getElementById('cardNome').value.trim();
    const numero = document.getElementById('cardNumero').value.replace(/\s/g, '');
    const validade = document.getElementById('cardValidade').value;
    const cvv = document.getElementById('cardCvv').value;

    // Validação completa
    if (!nome || nome.length < 3) {
        _showAlert('Informe o nome completo como está no cartão.'); return;
    }
    if (numero.length < 16) {
        _showAlert('Número do cartão deve ter 16 dígitos.'); return;
    }
    if (validade.length < 5) {
        _showAlert('Informe a validade no formato MM/AA.'); return;
    }
    if (!_validarValidade(validade)) {
        _showAlert('Cartão vencido ou data inválida.'); return;
    }
    if (cvv.length < 3) {
        _showAlert('CVV deve ter ao menos 3 dígitos.'); return;
    }

    // Loading
    const btn = document.getElementById('btnPagar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processando pagamento...</span>';

    // Simula processamento em 2 etapas
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-shield-alt"></i> <span>Verificando segurança...</span>';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Pagamento aprovado!</span>';
            btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
            btn.style.color = 'white';
            setTimeout(() => _mostrarConfirmacao(), 700);
        }, 1200);
    }, 1500);
}

// ─── VALIDAR VALIDADE DO CARTÃO ───────────────────
function _validarValidade(val) {
    const [mes, ano] = val.split('/').map(Number);
    if (!mes || !ano || mes < 1 || mes > 12) return false;
    const hoje = new Date();
    const expiry = new Date(2000 + ano, mes - 1, 1);
    return expiry >= new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

// ─── MOSTRAR ALERTA ───────────────────────────────
function _showAlert(msg) {
    const box = document.getElementById('formAlert');
    document.getElementById('alertMsg').textContent = msg;
    box.classList.remove('show');
    void box.offsetWidth;
    box.classList.add('show');
}

// ─── CONFIRMAÇÃO ──────────────────────────────────
function _mostrarConfirmacao() {
    document.getElementById('stepConfirm').classList.add('active', 'done');
    document.querySelector('#stepConfirm .step-num').innerHTML = '<i class="fas fa-check"></i>';

    document.getElementById('confCodigo').textContent = pedido.codigo || '—';
    document.getElementById('cdProduto').textContent = pedido.produto || '—';
    document.getElementById('cdTipo').textContent = pedido.tipo || '—';
    document.getElementById('cdQtd').textContent = pedido.quantidade + ' unidade' + (pedido.quantidade > 1 ? 's' : '');
    document.getElementById('cdTotal').textContent = fmtMoeda(pedido.total);

    document.getElementById('painelCartao').style.display = 'none';
    document.getElementById('confirmacao').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    localStorage.removeItem('brigazziPedido');
}