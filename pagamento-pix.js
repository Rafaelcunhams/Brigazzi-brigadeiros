// ═══════════════════════════════════════════════════
//  BRIGAZZI — pagamento-pix.js
// ═══════════════════════════════════════════════════

function fmtMoeda(val) {
    return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
}

// ─── CARREGAR DADOS DO LOCALSTORAGE ───────────────
const pedido = JSON.parse(localStorage.getItem('brigazziPedido') || '{}');

// Redireciona se não há pedido salvo
if (!pedido.produto) {
    window.location.href = 'pedido.html';
}

// ─── PREENCHER RESUMO ─────────────────────────────
document.getElementById('rProduto').textContent = pedido.produto || '—';
document.getElementById('rTipo').textContent = pedido.tipo || '—';
document.getElementById('rQtd').textContent = pedido.quantidade + ' unidade' + (pedido.quantidade > 1 ? 's' : '');
document.getElementById('rCodigo').textContent = pedido.codigo || '—';
document.getElementById('rTotal').textContent = fmtMoeda(pedido.total);

// ─── GERAR QR CODE ────────────────────────────────
const qrData = encodeURIComponent(
    'Pix Brigazzi | Código: ' + pedido.codigo +
    ' | Valor: ' + pedido.total +
    ' | ' + Date.now()
);
document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + qrData;

// ─── TIMER REGRESSIVO (5 minutos) ─────────────────
let totalSecs = 5 * 60;
const timerEl = document.getElementById('timer');

const timerInterval = setInterval(() => {
    totalSecs--;
    const m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const s = String(totalSecs % 60).padStart(2, '0');
    timerEl.textContent = m + ':' + s;

    if (totalSecs <= 60) timerEl.classList.add('urgente');
    if (totalSecs <= 0) {
        clearInterval(timerInterval);
        timerEl.textContent = '00:00';
        timerEl.style.color = '#E53935';
    }
}, 1000);

// ─── CONFIRMAR PIX ────────────────────────────────
function confirmarPix() {
    const btn = document.getElementById('btnConfirmar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Verificando pagamento...</span>';

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Pagamento aprovado!</span>';
        btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';

        setTimeout(() => {
            clearInterval(timerInterval);
            _mostrarConfirmacao();
        }, 800);
    }, 2000);
}

// ─── TELA DE CONFIRMAÇÃO ──────────────────────────
function _mostrarConfirmacao() {
    // Marca step 3 como ativo/feito
    document.getElementById('stepConfirm').classList.add('active', 'done');
    const stepNum = document.querySelector('#stepConfirm .step-num');
    stepNum.innerHTML = '<i class="fas fa-check"></i>';

    // Preenche dados
    document.getElementById('confCodigo').textContent = pedido.codigo || '—';
    document.getElementById('cdProduto').textContent = pedido.produto || '—';
    document.getElementById('cdTipo').textContent = pedido.tipo || '—';
    document.getElementById('cdQtd').textContent = pedido.quantidade + ' unidade' + (pedido.quantidade > 1 ? 's' : '');
    document.getElementById('cdTotal').textContent = fmtMoeda(pedido.total);

    // Troca painel
    document.getElementById('painelPix').style.display = 'none';
    const conf = document.getElementById('confirmacao');
    conf.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Limpa storage
    localStorage.removeItem('brigazziPedido');
}