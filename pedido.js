// ═══════════════════════════════════════════════════
//  BRIGAZZI — pedido.js
//  Estado central: order object
//  Produto ≠ Tipo ≠ Pagamento — estados completamente separados
// ═══════════════════════════════════════════════════

// ─── ESTADO GLOBAL ───────────────────────────────
const order = {
    produto: null,
    precoProduto: 0,
    tipoPedido: null,
    precoTipo: 0,
    quantidade: 1,
    pagamento: null,
    endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: ''
    }
};


// ─── HELPERS ─────────────────────────────────────

// [FIX #1] subtotal = (precoProduto + precoTipo) × quantidade
function calcSubtotal() {
    return (order.precoProduto + order.precoTipo) * order.quantidade;
}

function fmtMoeda(val) {
    return 'R$ ' + val.toFixed(2).replace('.', ',');
}

function _setSelected(scope, el) {
    document.querySelectorAll(scope).forEach(e => e.classList.remove('selected'));
    if (el) el.classList.add('selected');
}

function _showAlert(msg) {
    const box = document.getElementById('alertBox');
    document.getElementById('alertMsg').textContent = msg;
    box.classList.remove('show');
    void box.offsetWidth; // força re-render para animação de shake
    box.classList.add('show');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── PRODUTO ─────────────────────────────────────
// Escopo: apenas .product-grid .product-option (card 1)
function selectProduto(el, nome, preco) {
    const jaSelected = el.classList.contains('selected');

    // desmarca todos os produtos (card 1 — product-grid)
    el.closest('.product-grid')
        .querySelectorAll('.product-option')
        .forEach(e => e.classList.remove('selected'));

    if (jaSelected) {
        order.produto = null;
        order.precoProduto = 0;
    } else {
        el.classList.add('selected');
        order.produto = nome;
        order.precoProduto = preco;
    }

    updateSummary();
    updateSteps();
}

// ─── TIPO DE PEDIDO ───────────────────────────────
// Escopo: apenas .type-grid .product-option (card 2)
// Regras de negócio:
//   "Tradicional"      → só define tipoPedido, NÃO toca em order.produto
//   "Kit Presente"
//   "Edição Especial"  → garante produto (DOM ou fallback) + define tipoPedido
function selectTipoPedido(el, nome, preco) {
    // 1. Limpa seleção visual do card de tipo e marca o clicado
    el.closest('.type-grid')
        .querySelectorAll('.product-option')
        .forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');

    if (nome === 'Tradicional') {
        // ── TRADICIONAL: apenas define o tipo, preço extra = 0
        order.tipoPedido = nome;
        order.precoTipo  = 0;

    } else {
        // ── KIT PRESENTE / EDIÇÃO ESPECIAL
        // (A) Garante que order.produto esteja preenchido
        if (!order.produto) {
            // Tenta ler o produto visualmente marcado no card 1
            const produtoVisual = document.querySelector('.product-grid .product-option.selected');
            if (produtoVisual) {
                const nomeEl       = produtoVisual.querySelector('.product-name');
                const precoEl      = produtoVisual.querySelector('.product-price');
                order.produto      = nomeEl ? nomeEl.textContent.trim() : 'Brigadeiro';
                const precoStr     = precoEl ? precoEl.textContent.replace('R$', '').trim().replace(',', '.') : '0';
                order.precoProduto = parseFloat(precoStr) || 0;
            } else {
                // Nenhum produto marcado visualmente: usa fallback neutro
                order.produto      = 'Brigadeiro';
                order.precoProduto = 0;
            }
        }

        // (B) Define o tipo e seu preço extra
        order.tipoPedido = nome;
        order.precoTipo  = preco;
    }

    updateSummary();
    updateSteps();

}

// ─── QUANTIDADE ───────────────────────────────────
function changeQty(delta) {
    order.quantidade = Math.max(1, Math.min(60, order.quantidade + delta));
    const display = document.getElementById('qtyDisplay');
    display.textContent = order.quantidade;
    display.style.transform = delta > 0 ? 'scale(1.2)' : 'scale(0.85)';
    setTimeout(() => display.style.transform = 'scale(1)', 150);
    updateSummary();
}

// ─── PAGAMENTO ────────────────────────────────────
// Seleção visual — registra a escolha, sem avançar de tela ainda
function selectPagamento(el, tipo) {
    const jaSelected = el.classList.contains('selected');
    document.querySelectorAll('.pay-option').forEach(e => e.classList.remove('selected'));

    if (jaSelected) {
        order.pagamento = null;
    } else {
        el.classList.add('selected');
        order.pagamento = tipo;
    }

    updateSummary();
    updateSteps();
}

// ─── ENDEREÇO ─────────────────────────────────────
function updateAddress(campo, valor) {
    order.endereco[campo] = valor.trim();
    updateSummary();
}

function _buildEnderecoStr() {
    const { rua, numero, bairro, cidade } = order.endereco;
    const partes = [rua, numero, bairro, cidade].filter(Boolean);
    return partes.length ? partes.join(', ') : null;
}

// ─── RESUMO ───────────────────────────────────────
function updateSummary() {
    const subtotal = calcSubtotal();
    const endStr = _buildEnderecoStr();
    const qtdLabel = order.quantidade + ' unidade' + (order.quantidade > 1 ? 's' : '');

    // Produto + Tipo: cada um preservado independentemente
    // Nunca um substitui o outro — apenas coexistem
    const _prod = order.produto   || null;
    const _tipo = order.tipoPedido || null;

    let produtoLabel;
    if (_prod && _tipo)  produtoLabel = _prod + ' - ' + _tipo;
    else if (_prod)      produtoLabel = _prod;
    else                 produtoLabel = '—';   // sem produto → sempre traço, tipo NÃO aparece aqui

    document.getElementById('sumProduto').textContent = produtoLabel;

    // sumTipo: exibe apenas o tipo (linha separada no resumo)
    document.getElementById('sumTipo').textContent = _tipo || '—';

    document.getElementById('sumQtd').textContent = qtdLabel;
    document.getElementById('sumPag').textContent = order.pagamento || '—';
    document.getElementById('sumEndereco').textContent = endStr || '—';
    document.getElementById('sumTotal').textContent = fmtMoeda(subtotal);
    document.getElementById('subtotalDisplay').textContent = fmtMoeda(subtotal);
}

// ─── STEPS ────────────────────────────────────────
function updateSteps() {
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');

    [s1, s2, s3].forEach(s => s.classList.remove('done', 'active'));
    s1.classList.add('active');

    if (order.produto) { s1.classList.add('done'); s2.classList.add('active'); }
    if (order.tipoPedido) { s2.classList.add('done'); s3.classList.add('active'); }
    if (order.pagamento) { s3.classList.add('done'); }
}

// ─── VALIDAÇÃO ────────────────────────────────────
function validarPedido() {
    if (!order.produto)    { _showAlert('Por favor, selecione um produto.');           return false; }
    if (!order.tipoPedido) { _showAlert('Por favor, selecione o tipo de pedido.');     return false; }
    if (!order.pagamento)  { _showAlert('Por favor, selecione a forma de pagamento.'); return false; }
    return true;
}

// ─── HELPER: monta label produto+tipo ─────────────
function _buildProdutoLabel() {
    const p = order.produto    || null;
    const t = order.tipoPedido || null;
    if (p && t)  return p + ' - ' + t;
    if (p)       return p;
    return '—';
}

// ─── FINALIZAR ────────────────────────────────────
// Valida todos os campos → salva pedido no sessionStorage
// → redireciona para pagamento-pix.html ou pagamento-cartao.html
function finalizarPedido() {
    if (!validarPedido()) return;

    // Gera código único do pedido
    const codigo = 'BRG-' + Math.floor(1000 + Math.random() * 9000);

    // Serializa o estado completo para a página de pagamento
    const payload = {
        codigo,
        produto:      order.produto,
        tipo:         order.tipoPedido,
        quantidade:   order.quantidade,
        pagamento:    order.pagamento,
        total:        calcSubtotal(),
        endereco:     order.endereco,
        produtoLabel: _buildProdutoLabel()
    };
    localStorage.setItem('brigazziPedido', JSON.stringify(payload));

    // Redireciona para a página correta conforme o pagamento escolhido
    if (order.pagamento === 'Pix') {
        window.location.href = 'pagamento-pix.html';
    } else {
        window.location.href = 'pagamento-cartao.html';
    }
}

// ─── NOVO PEDIDO ──────────────────────────────────
function novoPedido() {
    order.produto      = null;
    order.precoProduto = 0;
    order.tipoPedido   = null;
    order.precoTipo    = 0;
    order.quantidade   = 1;
    order.pagamento    = null;
    order.endereco     = { rua: '', numero: '', bairro: '', cidade: '' };

    document.querySelectorAll('.product-option, .pay-option')
        .forEach(e => e.classList.remove('selected'));

    ['addrRua', 'addrNumero', 'addrBairro', 'addrCidade']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    document.getElementById('qtyDisplay').textContent = '1';

    ['step1', 'step2', 'step3', 'step4'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('done', 'active');
    });
    document.getElementById('step1').classList.add('active');

    document.getElementById('alertBox').classList.remove('show');

    updateSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── INIT ─────────────────────────────────────────
updateSummary();