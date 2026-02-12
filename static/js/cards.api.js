/* ===============================
   EVENTOS
================================ */
let historicoModal

document.addEventListener('DOMContentLoaded', function () {
    historicoModal = new bootstrap.Modal(document.getElementById('historicoModal'))
    loadCards()
})

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
                    <button class="btn btn-sm btn-info bi bi-gear" title="Gerenciar"></button>
                </td>
            </tr>
        `
    })

    cardAccordion.innerHTML += `
        <div class="accordion-item mt-2">
            <h2 class="accordion-header d-flex align-items-center justify-content-between px-3 py-2 ${color}">
                
                <!-- Conteúdo do header (não clicável) -->
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <button class="btn btn-sm btn-warning bi bi-clock-history"
                            onclick="openHistoricoModal('${card.id }')"
                            title="Histórico">
                    </button>
                    <h6 class="mb-0 text-dark">
                        ${card.codigo_interno} - ${card.cliente__nome} - 
                        CPF: ${maskCPF(card.cliente__cpf)} - 
                        Matrícula: ${card.matricula__matricula}
                    </h6>
                </div>

                <!-- 🔥 Botão da seta (único que expande) -->
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
/* ===============================
   RENDERS END
================================ */