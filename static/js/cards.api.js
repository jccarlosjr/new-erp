/* ===============================
   EVENTOS
================================ */
let changePropostaModal;

document.addEventListener('DOMContentLoaded', function () {
    changePropostaModal = new bootstrap.Modal(document.getElementById('changePropostaModal'))
    loadCards()
})


document.getElementById("filter-btn").addEventListener("click", loadCards);

/* ===============================
================================ */

/* ===============================
   CONTADORES
================================ */

let countNaoIniciado = document.getElementById('count-nao-iniciado');
let countAguardandoDigitacao = document.getElementById('count-aguardando-digitacao');
let countAndamento = document.getElementById('count-andamento');
let countPrecisaAtencao = document.getElementById('count-precisa-atencao');
let countFinalizado = document.getElementById('count-finalizado');
let countCancelados = document.getElementById('count-cancelados');

/* ===============================
================================ */



/* ===============================
   REQUESTS
================================ */

function loadCards() {
    showLoader()
    let filterField = document.getElementById('filter-operacao').value
    let filterValue = document.getElementById('filter-banco').value.trim()
    const params = new URLSearchParams()

    if(filterField == 'cpf') {
        filterValue = filterValue.replace('.', '').replace('.', '').replace('-', '')
    }

    if (filterValue) {
        params.append(filterField, filterValue)
    }

    fetch(`/api/cards-propostas/?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                showToast('Erro ao carregar cards')
                return
            }

            updateCountersAndRenderAccordions(data.data)

        })
        .catch(() => showToast('Erro de conexão com o servidor'))
        .finally(() => hideLoader())
}

function editarCard(id, status, historico) {
    showLoader();

    fetch('/api/cards-oferta/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: id,
            status: status,
            obs: historico
        })
    })
    .then(async res => {
        const data = await res.json()
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || 'Erro ao atualizar')
        }
        return data
    })
    .then(() => {
        showToast('Card atualizado com sucesso', 'success')
        loadCards();
    })
    .catch(err => {
        showToast(err.message)
    })
    .finally(() => hideLoader())
}


/* ===============================
================================ */


/* ===============================
   HELPERS
================================ */

function updateCountersAndRenderAccordions(cards){
    let naoIniciadoInt = 0;
    let digitacaoInt = 0;
    let andamentoInt = 0;
    let precisaAtencaoInt = 0;
    let finalizadoInt = 0;
    let canceladosInt = 0;

    let cardAccordionAndamento = document.getElementById('accordionPropostasAndamento');
    let accordionPropostasCancelado = document.getElementById('accordionPropostasCancelado');
    let accordionPropostasDigitacao = document.getElementById('accordionPropostasDigitacao');
    let accordionPropostasFinalizado = document.getElementById('accordionPropostasFinalizado');
    let accordionPropostasNaoIniciado = document.getElementById('accordionPropostasNaoIniciado');
    let accordionPropostasAtencao = document.getElementById('accordionPropostasAtencao');

    cardAccordionAndamento.innerHTML = '';
    accordionPropostasCancelado.innerHTML = '';
    accordionPropostasDigitacao.innerHTML = '';
    accordionPropostasFinalizado.innerHTML = '';
    accordionPropostasNaoIniciado.innerHTML = '';
    accordionPropostasAtencao.innerHTML = '';

    cards.forEach(card => {
        if(card.status == 'NAO_INICIADO'){
            naoIniciadoInt++;
            renderCard(card, 'bg-light-subtle', accordionPropostasNaoIniciado);
        }
        if(card.status == 'DIGITACAO'){
            digitacaoInt++;
            renderCard(card, 'bg-info-subtle', accordionPropostasDigitacao);
        }
        if(card.status == 'ANDAMENTO'){
            andamentoInt++;
            renderCard(card, 'bg-info', cardAccordionAndamento);
        }
        if(card.status == 'ATENCAO' || card.status == 'FORMALIZACAO'){
            precisaAtencaoInt++;
            renderCard(card, 'bg-warning-subtle', accordionPropostasAtencao);
        }
        if(card.status == 'FINALIZADO'){
            finalizadoInt++;
            renderCard(card, 'bg-success-subtle', accordionPropostasFinalizado);
        }
        if(card.status == 'CANCELADO'){
            canceladosInt++;
            renderCard(card, 'bg-danger-subtle', accordionPropostasCancelado);
        }
    })

    countNaoIniciado.innerText = naoIniciadoInt ?? 0;
    countAguardandoDigitacao.innerText = digitacaoInt ?? 0;
    countAndamento.innerText = andamentoInt ?? 0;
    countPrecisaAtencao.innerText = precisaAtencaoInt ?? 0;
    countFinalizado.innerText = finalizadoInt ?? 0;
    countCancelados.innerText = canceladosInt ?? 0;
}

/* ===============================
   HELPERS END
================================ */



/* ===============================
   RENDERS
================================ */

function renderCard(card, color, cardAccordion) {
    let propostasHTML = ''

    card.propostas.forEach(proposta => {
        propostasHTML += renderProposta(proposta);
    })

    const { btnAdd, btnActions } = renderCardActions(card);
    
    cardAccordion.innerHTML += `
        <div class="accordion-item mt-2 shadow-lg">
            <span class="accordion-header d-flex align-items-center justify-content-between px-3 py-2">
                <div class="d-flex align-items-center justify-content-center gap-2">
                <div class="btn-group">
                    <button class="btn btn-sm btn-sm-icon btn-warning bi bi-clock-history"
                            onclick="openHistoricoModal('${card.id }')"
                            title="Histórico">
                    </button>
                    ${btnAdd}
                    ${btnActions}
                </div>
                    <small class="card p-2 text-dark">${card.codigo_interno}</small>
                    <small class="card p-2 text-dark">${card.cliente__nome}</small>
                    <small class="card p-2 text-dark">CPF: ${maskCPF(card.cliente__cpf)}</small>
                    <small class="card p-2 text-dark">Matrícula: ${card.matricula__matricula}</small>
                </div>

                <button class="accordion-button collapsed shadow-none p-0 bg-transparent"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapse${card.id}"
                        aria-expanded="false"
                        aria-controls="collapse${card.id}"
                        style="width: auto;">
                </button>
            </span>

            <div id="collapse${card.id}" 
                class="accordion-collapse collapse"
                data-bs-parent="#accordionExample">

                <div class="accordion-body">
                    <table class="table text-center table-hover">
                        <thead>
                            <tr>
                                <th class="small">Proposta</th>
                                <th class="small">Banco</th>
                                <th class="small">Operação</th>
                                <th class="small">Parcela</th>
                                <th class="small">Status</th>
                                <th class="small">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${propostasHTML.length > 0 ? propostasHTML : `
                                <tr>
                                    <td colspan="6" class="text-center">
                                        Nenhuma proposta vinculada a esse card
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    `
}

function renderProposta(proposta) {
    return `
        <tr>
            <td class="small">${proposta.codigo_interno}</td>
            <td class="small">${proposta.tabela__banco__nome}</td>
            <td class="small">${proposta.tabela__operacao__nome}</td>
            <td class="small">${proposta.parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</td>
            <td class="small">${proposta.status__nome}</td>
            <td>
            <div class="btn-group">
                <button class="btn btn-sm btn-sm-icon btn-warning bi bi-clock-history" title="Histórico" onclick="openHistoricoPropostaModal(${proposta.id})"></button>
                <button class="btn btn-sm btn-sm-icon btn-primary bi bi bi-files" title="Abrir Proposta" onclick="openProposta(${proposta.id})"></button>
                <div class="btn-group dropend">
                    <button 
                        type="button" 
                        ${proposta.bloqueado ? 'disabled' : ''} 
                        class="btn btn-sm btn-sm-icon bi ${proposta.bloqueado ? 'bi-lock btn-secondary' : 'bi-gear btn-info'} dropdown-toggle" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <button 
                                class="dropdown-item" 
                                data-proposta='${JSON.stringify(proposta).replace(/'/g, "&apos;")}'
                                onclick="openEditPropostaModal(this)">
                                <i class="bi bi-pen text-success"></i> Editar Proposta
                            </button>
                            <button class="dropdown-item" onclick="openChangePropostaModal(${proposta.id}, '${proposta.codigo_interno}')">
                                <i class="bi bi-gear text-primary"></i> Alterar Status
                            </button>
                            <button class="dropdown-item" onclick="openDeletePropostaModal(${proposta.id}, '${proposta.codigo_interno}')">
                                <i class="bi bi-trash3 text-danger"></i> Excluir proposta
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            </td>
        </tr>
    `
}


function openProposta(id){
    window.open(`/propostas/${id}`, '_blank', 'noopener,noreferrer');
}

function renderCardActions(card) {

    let btnAdd = '';
    let btnActions = '';
    

    if (card.status === 'NAO_INICIADO') {
        btnAdd = `
            <button class="btn btn-sm btn-sm-icon btn-success bi bi-plus-circle"
                    title="Adicionar Proposta"
                    onclick="openCreatePropostaModal('${card.cliente__cpf}', '${card.id}')">
            </button>
        `;
    }

    if (card.status === 'NAO_INICIADO') {
        btnActions = dropdown(card, [
            {
                status: 'DIGITACAO',
                label: 'Enviar para digitação',
                icon: 'bi-send text-success',
                historico: 'Digitação Solicitada'
            },
            {
                status: 'CANCELADO',
                label: 'Solicitar cancelamento',
                icon: 'bi-exclamation-triangle text-warning',
                historico: 'Card Cancelado'
            }
        ]);
    }

    else if (card.status === 'CANCELADO') {
        btnActions = dropdown(card, [
            {
                status: 'NAO_INICIADO',
                label: 'Redigitar Card',
                icon: 'bi-arrow-up-left-circle',
                historico: 'Card Reiniciado'
            }
        ]);
    }

    else if (card.status === 'ATENCAO' || card.status === 'FORMALIZACAO') {
        btnActions = dropdown(card, [
            {
                status: 'ANDAMENTO',
                label: 'Informar Pendência Resolvida',
                icon: 'bi-check-lg text-success',
                historico: 'Pendência resolvida'
            }
        ]);
    }

    return { btnAdd, btnActions };
}

function dropdown(card, actions) {
    return `
        <div class="btn-group dropend">
            <button type="button"
                    ${card.is_blocked ? 'disabled' : ''}
                    class="btn btn-sm btn-sm-icon btn-info bi bi-gear dropdown-toggle"
                    data-bs-toggle="dropdown">
            </button>

            <ul class="dropdown-menu">
                ${actions.map(action => `
                    <li>
                        <button class="dropdown-item"
                                onclick="editarCard(${card.id}, '${action.status}', '${action.historico}')">
                            <i class="bi ${action.icon}"></i>
                            ${action.label}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function loadBancosSelect(selected = null) {
    showLoader();
    const select = document.getElementById('banco-select')
    select.innerHTML = `<option value="">Selecione um banco</option>`

    fetch('/api/bancos/')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                showToast('Erro ao carregar bancos')
                return
            }

            data.data.forEach(banco => {
                const option = document.createElement('option')
                option.value = banco.id
                option.textContent = `${banco.codigo} - ${banco.nome}`

                if (selected && selected == banco.id) {
                    option.selected = true
                }

                select.appendChild(option)
            })
        })
        .finally(() => hideLoader())
}

function loadOperacoesSelect(selected = null) {
    showLoader();
    const select = document.getElementById('operacoes-select')
    select.innerHTML = `<option value="">Selecione uma operação</option>`

    fetch('/api/operacoes/')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                showToast('Erro ao carregar operações')
                return
            }

            data.data.forEach(operacao => {
                const option = document.createElement('option')
                option.value = operacao.id
                option.textContent = `${operacao.nome}`

                if (selected && selected == operacao.id) {
                    option.selected = true
                }

                select.appendChild(option)
            })
        })
        .finally(() => hideLoader());
}

function loadTabelasSelect(selected = null) {
    showLoader();
    const formProposta = document.getElementById('form-proposta');
    formProposta.classList.remove('d-none');

    const bancoId = document.getElementById('banco-select').value
    const operacaoId = document.getElementById('operacoes-select').value

    let params = new URLSearchParams()

    params.append('banco', bancoId)
    params.append('operacao', operacaoId)
    params.append('ativo', 'true')

    let url = '/api/tabelas/'

    if ([...params].length) {
        url += `?${params.toString()}`
    }

    const select = document.getElementById('tabela-select')
    select.innerHTML = `<option value="">Selecione uma tabela</option>`

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                showToast('Erro ao carregar tabelas para esse banco e operação')
                return
            }

            data.data.forEach(tabela => {
                const option = document.createElement('option')
                option.value = tabela.id
                option.textContent = `${tabela.nome} - ${tabela.prazo}x`
                option.dataset.coeficiente = tabela.coeficiente
                option.dataset.prazo = tabela.prazo
                option.dataset.cms = tabela.cms

                if (selected && selected == tabela.id) {
                    option.selected = true
                    document.getElementById('coeficiente').value = tabela.coeficiente
                    document.getElementById('prazo').value = tabela.prazo
                    document.getElementById('cms').value = tabela.cms
                }

                select.appendChild(option)
            })
        })
        .finally(() => hideLoader())
}

function renderPropostaFields(){
    let formProposta = document.getElementById('form-proposta-fields');
    const select = document.getElementById('operacoes-select');
    const selectedText = select.options[select.selectedIndex].text;

    formProposta.innerHTML = '';

    if(selectedText.includes('Margem Livre')){
        formProposta.innerHTML = `
        <div class="row mt-3">
            <div class="col-md-6">
                <label>Parcela</label>
                <input type="text" id="parcela" class="form-control" onchange="calcularTroco()" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-6">
                <label>Troco</label>
                <input type="text" id="troco" class="form-control" maxlength="9">
            </div>
            <div class="col-md-12">
                <label>Observação</label>
                <textarea type="text" id="obs" class="form-control"></textarea>
            </div>
        </div>
        `
    } else if(selectedText.includes('Refinanciamento')){
        formProposta.innerHTML = `
        <div class="row mt-3">
            <div class="col-md-4">
                <label>Parcela</label>
                <input type="text" id="parcela" class="form-control" onchange="calcularTroco()" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-4">
                <label>Saldo Devedor</label>
                <input type="text" id="saldo_devedor" class="form-control" onchange="calcularTroco()" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-4">
                <label>Troco</label>
                <input type="text" id="troco" class="form-control" oninput="floatFormat(this)" maxlength="9">
            </div>
            <div class="col-md-12">
                <label>Observação</label>
                <textarea type="text" id="obs" class="form-control"></textarea>
            </div>
        </div>
        `
    } else if(selectedText.includes('Portabilidade')){
        formProposta.innerHTML = `
        <div class="row mt-3">
            <div class="col-md-3">
                <label>Banco Origem</label>
                <input type="text" id="banco_origem" class="form-control" required maxlength="3" oninput="formatNumbersOnly(this)">
            </div>
            <div class="col-md-6">
                <label>Nº Contrato</label>
                <input type="text" id="contrato_portado" class="form-control" required>
            </div>
            <div class="col-md-3">
                <label>Saldo Devedor</label>
                <input type="text" id="saldo_devedor" class="form-control" onchange="calcularTroco()" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <!-- -->
            <div class="col-md-3">
                <label>Prazo Original</label>
                <input type="text" id="prazo_original" class="form-control" required maxlength="3" oninput="formatNumbersOnly(this)">
            </div>
            <div class="col-md-3">
                <label>Prazo Restante</label>
                <input type="text" id="prazo_restante" class="form-control" required maxlength="3" oninput="formatNumbersOnly(this)">
            </div>
            <div class="col-md-3">
                <label>Parcela</label>
                <input type="text" id="parcela" class="form-control" onchange="calcularTroco()" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-3">
                <label>Troco</label>
                <input type="text" id="troco" class="form-control" oninput="floatFormat(this)" maxlength="9">
            </div>
            <div class="col-md-12">
                <label>Observação</label>
                <textarea type="text" id="obs" class="form-control"></textarea>
            </div>
        </div>
        `
    } else if(selectedText.includes('Cartão')){
        formProposta.innerHTML = `
        <div class="row mt-3">
            <div class="col-md-6">
                <label>Parcela</label>
                <input type="text" id="parcela" class="form-control" onchange="calcularTroco()" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-6">
                <label>Saque</label>
                <input type="text" id="troco" class="form-control" maxlength="9" oninput="floatFormat(this)">
            </div>
            <div class="col-md-12">
                <label>Observação</label>
                <textarea type="text" id="obs" class="form-control"></textarea>
            </div>
        </div>
        `
    } else if(selectedText.includes('Saque')){
        formProposta.innerHTML = `
        <div class="row mt-3">
            <div class="col-md-6">
                <label>Parcela</label>
                <input type="text" id="parcela" class="form-control" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-6">
                <label>Saque</label>
                <input type="text" id="troco" class="form-control" oninput="floatFormat(this)" required maxlength="9">
            </div>
            <div class="col-md-12">
                <label>Observação</label>
                <textarea type="text" id="obs" class="form-control"></textarea>
            </div>
        </div>
        `
    }
}



/* ===============================
   RENDERS END
================================ */
