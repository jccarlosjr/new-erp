/* ===============================
   EVENTOS
================================ */

document.addEventListener('DOMContentLoaded', function () {
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

    fetch(`/api/cards-oferta/`)
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                showToast('Erro ao carregar cards')
                return
            }

            updateCounters(data.data)

            data.data.forEach(card => {
                
            })
        })
        .catch(() => showToast('Erro de conexão com o servidor'))
        .finally(() => hideLoader())
}

/* ===============================
================================ */


/* ===============================
   HELPERS
================================ */

function updateCounters(cards){
    let naoIniciadoInt = 0;
    let digitacaoInt = 0;
    let andamentoInt = 0;
    let precisaAtencaoInt = 0;
    let finalizadoInt = 0;
    let canceladosInt = 0;

    cards.forEach(card => {
        if(card.status == 'NAO_INICIADO'){
            naoIniciadoInt++;
        }
        if(card.status == 'DIGITACAO'){
            digitacaoInt++;
        }
        if(card.status == 'ANDAMENTO'){
            andamentoInt++;
        }
        if(card.status == 'PRECISA_ATENCAO' || card.status == 'FORMALIZACAO'){
            precisaAtencaoInt++;
        }
        if(card.status == 'FINALIZADO'){
            finalizadoInt++;
        }
        if(card.status == 'CANCELADO'){
            canceladosInt++;
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

function renderCards(cards) {
    cards.forEach(card => {
        
    })
}

/* ===============================
   RENDERS END
================================ */