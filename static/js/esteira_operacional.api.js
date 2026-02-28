/* ===============================
   EVENTOS
================================ */
let geranciarCardModal;
let gerenciarPropostaModal;

document.addEventListener('DOMContentLoaded', function () {
    geranciarCardModal = new bootstrap.Modal(document.getElementById('geranciarCardModal'));
    gerenciarPropostaModal = new bootstrap.Modal(document.getElementById('gerenciarPropostaModal'));
    loadCards();
    loadStatus();
})

document.getElementById("filter-btn").addEventListener("click", loadCards);

/* ===============================
================================ */


/* ===============================
   MODAL OPENERS
================================ */

function openGerenciarModal(id, status, codigo_interno){
    document.getElementById('gerenciar-card-id').value = id
    document.getElementById('gerenciar-card-status').value = status
    document.getElementById('card-title').textContent = codigo_interno
    geranciarCardModal.show()
}

function openConfigModal(proposta) {
    console.log(proposta);
    document.getElementById('config-id').value = proposta.id
    document.getElementById('config-status').value = proposta.status
    document.getElementById('config-observacao').value = ''
    document.getElementById('config-ade').value = proposta.ade
    document.getElementById('config-ade-2').value = proposta.ade_2
    gerenciarPropostaModal.show();
}

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

    fetch(`/api/cards-propostas/geral/?${params.toString()}`)
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

function loadStatus() {
    showLoader()

    fetch('/api/status/')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                showToast('Erro ao carregar status')
                return
            }
            document.getElementById('config-status').innerHTML = ''
            data.data.forEach(status => {
                const option = document.createElement('option')
                option.value = status.nome
                option.innerText = `${status.codigo} - ${status.nome}`
                document.getElementById('config-status').appendChild(option)
            })
        })
        .catch(() => showToast('Erro de conexão com o servidor'))
        .finally(() => hideLoader())
}

function changeCard() {
    const carId = document.getElementById('gerenciar-card-id').value    
    const cardStatus = document.getElementById('gerenciar-card-status').value
    const cardStatusText = document.getElementById('gerenciar-card-status').options[document.getElementById('gerenciar-card-status').selectedIndex].text
    const cardBlocked = document.getElementById('gerenciar-card-desbloquear').value;
    let blocked = true;

    if(cardBlocked == 'on') {
        blocked = false;
    } else {
        blocked = true;
    }

    showLoader();

    fetch('/api/cards-oferta/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: carId,
            status: cardStatus,
            is_blocked: blocked
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== 'success') {
            showToast('Erro ao alterar card')
            return
        }
        loadCards();
        showToast(`Card alterado para ${cardStatusText}`, 'success')
    })
    .catch(() => showToast('Erro de conexão com o servidor'))
    .finally(() => hideLoader())

}

function changeProposta() {
    const propostaId = document.getElementById('config-id').value
    const propostaStatus = document.getElementById('config-status').value
    const propostaStatusText = document.getElementById('config-status').options[document.getElementById('config-status').selectedIndex].text
    const ade = document.getElementById('config-ade')?.value || null
    const ade2 = document.getElementById('config-ade-2')?.value || null
    const obs = document.getElementById('config-observacao').value
    showLoader();

    fetch('/api/propostas-geral/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: propostaId,
            status: propostaStatus,
            ade: ade,
            ade_2: ade2,
            obs: obs
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== 'success') {
            showToast('Erro ao alterar propostas')
            return
        }
        loadCards();
        showToast(`Proposta alterada para ${propostaStatusText}`, 'success')
    })
    .catch(() => showToast('Erro de conexão com o servidor'))
    .finally(() => hideLoader())
}

function bloquearProposta(button, id) {

    fetch('/api/propostas-geral/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: id,
            bloqueado: true,
            status: 'Proposta bloqueada para edição',
            obs: ''
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== 'success') {
            showToast('Erro ao alterar propostas')
            return
        }
        showToast('Proposta bloqueada com sucesso', 'success')

        button.classList.remove('btn-light', 'bi-unlock')
        button.classList.add('btn-dark', 'bi-lock')
        button.title = 'Desbloquear'
        button.setAttribute(
            'onclick',
            `bloquearProposta(this, '${id}')`
        )
    })
    .catch(() => showToast('Erro de conexão com o servidor'))
    .finally(() => hideLoader())
}

function desbloquearProposta(button, id) {

    fetch('/api/propostas-geral/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: id,
            bloqueado: false,
            status: 'Proposta desbloqueada para edição',
            obs: ''
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== 'success') {
            showToast('Erro ao alterar proposta')
            return
        }

        showToast('Proposta desbloqueada com sucesso', 'success')

        button.classList.remove('btn-dark', 'bi-lock')
        button.classList.add('btn-light', 'bi-unlock')
        button.title = 'Bloquear'
        button.setAttribute(
            'onclick',
            `bloquearProposta(this, '${id}')`
        )
    })
    .catch(() => showToast('Erro de conexão com o servidor'))
    .finally(() => hideLoader())
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

    cardAccordion.innerHTML += `
        <div class="accordion-item mt-2">
            <h2 class="accordion-header d-flex align-items-center justify-content-between px-3 py-2">
                
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-sm-icon btn-success bi bi-gear" 
                            onclick="openGerenciarModal('${card.id }', '${card.status}', '${card.codigo_interno}')" 
                            title="Gerenciar">
                        </button>
                        <button class="btn btn-sm btn-sm-icon btn-warning bi bi-clock-history"
                            onclick="openHistoricoModal('${card.id }')"
                            title="Histórico">
                        </button>
                    </div>


                    <h6 class="mb-0 text-dark" id="accordion-title">
                        ${card.user__username} - 
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

function renderButtonPropostaBloqueado(bloqueado, id){
    switch(bloqueado){
        case true:
            return `
                <button 
                    class="btn btn-sm btn-sm-icon btn-dark bi bi-lock"
                    title="Desbloquear"
                    onclick="desbloquearProposta(this, '${id}')">
                </button>
            `
        case false:
            return `
                <button 
                    class="btn btn-sm btn-sm-icon btn-light bi bi-unlock"
                    title="Bloquear"
                    onclick="bloquearProposta(this, '${id}')">
                </button>
            `
    }
}


function renderProposta(proposta) {
        btn = renderButtonPropostaBloqueado(proposta.bloqueado, proposta.id, proposta.status__id);
        return `
            <tr>
                <td class="small">${proposta.codigo_interno}</td>
                <td class="small">${proposta.tabela__banco__nome}</td>
                <td class="small">${proposta.tabela__operacao__nome}</td>
                <td class="small">${proposta.parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</td>
                <td class="small">${proposta.status}</td>
                <td>
                    <div class="btn-group">
                        ${btn}
                        <button class="btn btn-sm btn-sm-icon btn-warning bi bi-clock-history" title="Histórico" onclick="openHistoricoPropostaModal(${proposta.id})"></button>
                        <button class="btn btn-sm btn-sm-icon btn-primary bi bi bi-files" title="Abrir Proposta" onclick="openProposta(${proposta.id})"></button>
                        <button class="btn btn-sm btn-sm-icon btn-success bi bi-gear" title="Gerenciar" onclick='openConfigModal(${JSON.stringify(proposta)})'></button>
                        <button 
                            class="btn btn-sm btn-sm-icon btn-info bi bi-pen" 
                            title="Editar"
                            data-proposta='${JSON.stringify(proposta).replace(/'/g, "&apos;")}'
                            onclick="openEditPropostaModal(this)"></button>
                    </div>
                </td>
            </tr>
        `
}

function openProposta(id){
    window.open(`/propostas/${id}`, '_blank', 'noopener,noreferrer');
}

/* ===============================
   RENDERS END
================================ */
