/* ===============================
   EVENTOS
================================ */
let historicoModal;
let propostaModal;
let deletePropostaModal;

document.addEventListener('DOMContentLoaded', function () {
    historicoModal = new bootstrap.Modal(document.getElementById('historicoModal'))
    propostaModal = new bootstrap.Modal(document.getElementById('propostaModal'))
    deletePropostaModal = new bootstrap.Modal(document.getElementById('deletePropostaModal'))
    loadCards()
})

document.getElementById("operacoes-select").addEventListener("change", loadTabelasSelect);
document.getElementById("operacoes-select").addEventListener("change", renderPropostaFields);

document.getElementById("operacoes-select").addEventListener("change", () => {
    document.getElementById('coeficiente').value = ''
    document.getElementById('prazo').value = ''
});

document.getElementById("banco-select").addEventListener("change", () => {
    document.getElementById('coeficiente').value = ''
    document.getElementById('prazo').value = ''
});

document.getElementById("tabela-select").addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex]

    if (!selectedOption || !selectedOption.dataset.coeficiente) {
        document.getElementById('coeficiente').value = ''
        return
    }
    
    if (!selectedOption || !selectedOption.dataset.prazo) {
        document.getElementById('prazo').value = ''
        return
    }

    document.getElementById('coeficiente').value = selectedOption.dataset.coeficiente
    document.getElementById('prazo').value = selectedOption.dataset.prazo
});

function calcularTroco(){
    const select = document.getElementById('operacoes-select');
    const selectedText = select.options[select.selectedIndex].text;

    if(selectedText.includes('Cartão')){
        const coeficiente = Number(document.getElementById('coeficiente').value);
        const parcela = Number(document.getElementById('parcela').value);
        const parcelaReal = parcela * 0.7;
        const troco = (parcelaReal * coeficiente);
        document.getElementById('troco').value = troco.toFixed(2);
    } else {
        const coeficiente = Number(document.getElementById('coeficiente').value);
        const saldo_devedor = Number(document.getElementById('saldo_devedor')?.value ?? 0);
        const parcela = Number(document.getElementById('parcela').value);
        const troco = (parcela / coeficiente) - saldo_devedor;
        document.getElementById('troco').value = troco.toFixed(2);
    }


}

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

    fetch(`/api/cards-propostas/`)
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

function editarCard(id, status, historico, propostas) {
    showLoader();

    fetch('/api/cards-oferta/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: id,
            status: status
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
        createHistorico(id, obs = historico)
        if(status == "CANCELADO") {
            propostas.forEach(proposta => {
                cancelarProposta(proposta.id, 14)
            })
        }
        loadCards();
    })
    .catch(err => {
        showToast(err.message)
    })
    .finally(() => hideLoader())
}

function createHistorico(cardId, obs = '') {
    return fetch('/api/historico-card/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            card_id: cardId,
            obs: obs
        })
    })
    .then(res => res.json())
}

function deleteProposta() {
    showLoader()
    const id = document.getElementById('delete-proposta-id').value

    fetch('/api/propostas/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ id })
    })
    .then(async res => {
        const data = await res.json()
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || 'Erro ao excluir')
        }
        return data
    })
    .then(() => {
        deletePropostaModal.hide();
        showToast('Proposta excluida com sucesso', 'success')
        loadCards();
    })
    .catch(err => {
        if(err.message.includes("Cannot delete some instances of model")){
            deletePropostaModal.hide();
            showToast("Não é possível deletar uma proposta ativa", 'danger')
        } else {
            deletePropostaModal.hide();
            showToast(err.message)
        }
    })
    .finally(() => hideLoader())
}

function cancelarProposta(id, status) {
    showLoader();

    fetch('/api/propostas/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: id,
            status: status
        })
    })
    .then(async res => {
        const data = await res.json()
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || 'Erro ao atualizar')
        }
        return data
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
        if(card.status == 'PRECISA_ATENCAO' || card.status == 'FORMALIZACAO'){
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
        propostasHTML += `
            <tr>
                <td class="small">${proposta.codigo_interno}</td>
                <td class="small">${proposta.tabela__banco__nome}</td>
                <td class="small">${proposta.tabela__operacao__nome}</td>
                <td class="small">${proposta.parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</td>
                <td class="small">${proposta.status__nome}</td>
                <td>
                    <button class="btn btn-sm btn-warning bi bi-clock-history" title="Histórico"></button>
                    <button class="btn btn-sm btn-primary bi bi bi-files" title="Abrir Proposta"></button>
                    <div class="btn-group dropend">
                        <button type="button" class="btn btn-sm btn-info bi bi-gear dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        </button>
                        <ul class="dropdown-menu">
                            <li>
                                <button class="dropdown-item" onclick="openDeletePropostaModal(${proposta.id}, '${proposta.codigo_interno}')"><i class="bi bi-trash3 text-danger"></i> Excluir proposta
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `
    })

    let btnAdd = ''
    let btnActions = ''

    if(card.status == 'NAO_INICIADO'){
        btnAdd = `
            <button class="btn btn-sm btn-success bi bi-plus-circle"
                    title="Adicionar Proposta"
                    onclick="openCreatePropostaModal('${card.cliente__cpf}', '${card.id}')">
            </button>
        `

        btnActions = `
        <div class="btn-group dropend">
            <button type="button" ${card.is_blocked ? 'disabled' : ''} class="btn btn-sm btn-info bi bi-gear dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul class="dropdown-menu">
                <li>
                    <button class="dropdown-item" onclick="editarCard(${card.id}, 'DIGITACAO', 'Digitação Solicitada', '${JSON.stringify(card.propostas)}')"><i class="bi bi-send text-success"></i> Enviar para digitação
                    </button>
                </li>
                <li><button class="dropdown-item" onclick="editarCard(${card.id}, 'CANCELADO', 'Card Cancelado', '${JSON.stringify(card.propostas)}')"><i class="bi bi-exclamation-triangle text-warning"></i> Solicitar cancelamento</button></li>
            </ul>
        </div>
        `
    }

    if(card.status == 'CANCELADO'){

        btnActions = `
        <div class="btn-group dropend">
            <button type="button" class="btn btn-sm btn-info bi bi-gear dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul class="dropdown-menu">
                <li>
                    <button class="dropdown-item" onclick="editarCard(${card.id}, 'NAO_INICIADO', 'Card Reiniciado', '${JSON.stringify(card.propostas)}')"><i class="bi bi-arrow-up-left-circle""></i> Redigitar Card
                    </button>
                </li>
            </ul>
        </div>
        `
    }
    
    
    if(card.status == 'ATENCAO' || card.status == 'FORMALIZACAO'){

        btnActions = `
        <div class="btn-group dropend">
            <button type="button" class="btn btn-sm btn-info bi bi-gear dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul class="dropdown-menu">
                <li>
                    <button class="dropdown-item" onclick="editarCard(${card.id}, 'ANDAMENTO', 'Pendência resolvida', '${JSON.stringify(card.propostas)}')"><i class="bi bi-check-lg text-success"></i> Informar Pendência Resolvida
                    </button>
                </li>
            </ul>
        </div>
        `
    }
    

    cardAccordion.innerHTML += `
        <div class="accordion-item mt-2">
            <h2 class="accordion-header d-flex align-items-center justify-content-between px-3 py-2">
                
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <button class="btn btn-sm btn-warning bi bi-clock-history"
                            onclick="openHistoricoModal('${card.id }')"
                            title="Histórico">
                    </button>
                    ${btnAdd}
                    ${btnActions}
                    <h6 class="mb-0 text-dark">
                        ${card.codigo_interno} - ${card.cliente__nome} - 
                        CPF: ${maskCPF(card.cliente__cpf)} - 
                        Matrícula: ${card.matricula__matricula}
                    </h6>
                </div>

                <button class="accordion-button collapsed shadow-none p-0 bg-transparent"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapse${card.id}"
                        aria-expanded="false"
                        aria-controls="collapse${card.id}"
                        style="width: auto;">
                </button>

            </h2>

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

function openHistoricoModal(cardId) {
    const list = document.getElementById('historicoList')
    const loading = document.getElementById('historico-loading')
    list.innerHTML = ''
    loading.classList.remove('d-none')

    historicoModal.show()

    fetch(`/api/historico-card/?card_id=${cardId}`)
        .then(res => res.json())
        .then(res => {
            loading.classList.add('d-none')

            if (res.status !== 'success') {
                list.innerHTML = `
                    <li class="list-group-item text-danger">
                        Erro ao carregar histórico
                    </li>
                `
                return
            }

            if (!res.data.length) {
                list.innerHTML = `
                    <li class="list-group-item text-muted text-center">
                        Nenhum histórico encontrado
                    </li>
                `
                return
            }

            res.data.forEach(item => {
                list.insertAdjacentHTML('beforeend', `
                    <li class="list-group-item">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">
                                Alterado por ${item.user__username ?? 'Sistema'} em ${formatDate(item.date)}
                            </small> 
                        </div>

                        ${item.obs ? `
                            <div class="mt-1">
                                ${item.obs}
                            </div>
                        ` : ''}
                    </li>
                `)
            })
        })
        .catch(() => {
            loading.classList.add('d-none')
            list.innerHTML = `
                <li class="list-group-item text-danger">
                    Erro de conexão
                </li>
            `
        })
}

function openDeletePropostaModal(id, codig_interno) {
    propostaModal.hide()
    document.getElementById('delete-proposta-id').value = id
    document.getElementById('delete-proposta-nome').innerText = codig_interno
    deletePropostaModal.show()
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


/* ===============================
   PROPOSTAS
================================ */

function openCreatePropostaModal(cpf, card_id) {
    let formProposta = document.getElementById('form-proposta-fields');
    formProposta.innerHTML = '';

    document.getElementById('propostaModalTitle').innerText = "Nova Proposta";

    document
        .querySelectorAll('#propostaModal input, #propostaModal textarea')
        .forEach(el => el.value = '');

    document.getElementById('proposta-modal-card-id').value = card_id;
    document.getElementById('proposta-modal-cliente-cpf').value = cpf;

    document.getElementById('proposta-id').value = '';

    loadBancosSelect();
    loadOperacoesSelect();

    propostaModal.show();
}

function saveProposta() {
    let card_id = document.getElementById('proposta-modal-card-id').value;
    let cpf = document.getElementById('proposta-modal-cliente-cpf').value;
    
    showLoader();
    if (!cpf) {
        showToast("Cliente não identificado", "danger");
        return;
    }

    if (!card_id) {
        showToast("Card de oferta não identificado", "danger");
        return;
    }

    let saldoDevedor = Number(document.getElementById('saldo_devedor')?.value ?? 0);
    let troco = Number(document.getElementById('troco').value);
    let financiado = saldoDevedor + troco;

    const payload = {
        id: document.getElementById('proposta-id').value || null,

        cpf: cpf,
        card_oferta_id: card_id,
        usuario_id: currentUser,

        tabela_id: Number(document.getElementById('tabela-select').value),

        parcela: Number(document.getElementById('parcela').value),
        saldo_devedor: saldoDevedor,
        prazo: Number(document.getElementById('prazo').value),
        troco: troco,
        financiado: financiado,
        banco_origem: document.getElementById('banco_origem')?.value ?? null,
        contrato_portado: document.getElementById('contrato_portado')?.value ?? null,
        prazo_original: Number(document.getElementById('prazo_original')?.value) ?? null,
        prazo_restante: Number(document.getElementById('prazo_restante')?.value) ?? null,
        obs: document.getElementById('obs').value,
    };

    /* ===== VALIDAÇÕES ===== */
    const select = document.getElementById('operacoes-select');
    const selectedText = select.options[select.selectedIndex].text;

    /* ===== MARGEM LIVRE ===== */
    if(selectedText.includes('Margem Livre')) {
        if(!payload.tabela_id || !payload.parcela){
            showToast("Tabela e parcela são obrigatórios", "warning");
            return;
        }
    }

    /* ===== SAQUE COMPLEMENTAR ===== */
    if(selectedText.includes('Saque')) {
        if(!payload.tabela_id || !payload.parcela || !payload.troco){
            showToast("Tabela, parcela e saque são obrigatórios", "warning");
            return;
        }
    }

    /* ===== REFINANCIAMENTO ===== */
    if(selectedText.includes('Refinanciamento')) {
        if(!payload.tabela_id || !payload.parcela || !payload.saldo_devedor){
            showToast("Tabela, parcela e saldo devedor são obrigatórios", "warning");
            return;
        }
    }

    /* ===== PORTABILIDADE ===== */
    if (selectedText.includes('Portabilidade')) {

        const camposObrigatorios = {
            tabela_id: 'Tabela',
            parcela: 'Parcela',
            saldo_devedor: 'Saldo devedor',
            banco_origem: 'Banco de origem',
            contrato_portado: 'Contrato portado',
            prazo_original: 'Prazo original',
            prazo_restante: 'Prazo restante'
        };

        const faltantes = Object.entries(camposObrigatorios)
            .filter(([campo]) => !payload[campo])
            .map(([, label]) => label);

        if (faltantes.length) {
            showToast(
                `Campos obrigatórios não preenchidos: ${faltantes.join(', ')}`,
                'warning'
            );
            return;
        }
    }

    fetch('/api/propostas/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(payload),
    })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {

                showToast(
                    payload.id
                        ? "Proposta atualizada com sucesso"
                        : "Proposta criada com sucesso",
                    "success"
                );

                propostaModal.hide();
                loadCards();

            } else {
                showToast(res.message || "Erro ao salvar proposta", "danger");
            }
        })
        .catch(err => {
            showToast("Erro de conexão com o servidor", "danger");
            console.error(err);
        })
        .finally(() => hideLoader())
}

/* ===============================
   PROPOSTAS END
================================ */



