let historicoModal

document.addEventListener('DOMContentLoaded', function () {
    historicoModal = new bootstrap.Modal(document.getElementById('historicoModal'))
})

function createPropostaHistorico(propostaId, obs = '', title) {
    return fetch('/api/historico-proposta/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            proposta_id: propostaId,
            obs: obs,
            title: title
        })
    })
    .then(res => res.json())
}

function openHistoricoPropostaModal(propostaId) {
    const list = document.getElementById('historicoList')
    const loading = document.getElementById('historico-loading')

    list.innerHTML = ''
    loading.classList.remove('d-none')

    historicoModal.show()

    fetch(`/api/historico-proposta/?proposta_id=${propostaId}`)
        .then(res => res.json())
        .then(res => {
            loading.classList.add('d-none')

            if (res.status !== 'success') {
                list.innerHTML = `
                    <div class="text-center text-danger py-3">
                        Erro ao carregar histórico
                    </div>
                `
                return
            }

            if (!res.data || !res.data.length) {
                list.innerHTML = `
                    <div class="text-center text-muted py-3">
                        Nenhum histórico encontrado
                    </div>
                `
                return
            }

            // const historico = [...res.data].reverse()
            const historico = [...res.data]

            historico.forEach((item, index) => {

                const side = index % 2 === 0 ? 'left' : 'right'

                list.insertAdjacentHTML('beforeend', `
                    <div class="timeline-item ${side}">
                        <div class="content bg-${item.status__color}-subtle">

                            <span>
                                <span class="fw-bold text-dark badge bg-primary-subtle">${item.user__username ?? 'Sistema'}</span> - 
                                <small class="text-muted">${formatDate(item.date)} </small>
                            </span>

                            ${item.title ? `
                                <hr>
                                <div class="text-dark fw-bold mt-2">
                                    ${item.title.toUpperCase()}
                                </div>
                            ` : ''}

                            ${item.obs ? `
                                <hr>
                                <div class="text-dark mt-2">
                                    ${item.obs}
                                </div>
                            ` : ''}

                        </div>
                    </div>
                `)
            })
        })
        .catch(error => {
            console.error(error)
            loading.classList.add('d-none')
            list.innerHTML = `
                <div class="text-center text-danger py-3">
                    Erro de conexão
                </div>
            `
        })
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
                    <div class="text-center text-danger py-3">
                        Erro ao carregar histórico
                    </div>
                `
                return
            }

            if (!res.data || !res.data.length) {
                list.innerHTML = `
                    <div class="text-center text-muted py-3">
                        Nenhum histórico encontrado
                    </div>
                `
                return
            }

            // const historico = [...res.data].reverse()
            const historico = [...res.data]

            historico.forEach((item, index) => {

                const side = index % 2 === 0 ? 'left' : 'right'

                list.insertAdjacentHTML('beforeend', `
                    <div class="timeline-item ${side}">
                        <div class="content bg-light">

                            <span>
                                <span class="fw-bold text-dark badge bg-primary-subtle">${item.user__username ?? 'Sistema'}</span> - 
                                <small class="text-muted">${formatDate(item.date)} </small>
                            </span>

                            ${item.obs ? `
                                <hr>
                                <div class="text-dark mt-2">
                                    ${item.obs}
                                </div>
                            ` : ''}

                        </div>
                    </div>
                `)
            })
        })
        .catch(error => {
            console.error(error)
            loading.classList.add('d-none')
            list.innerHTML = `
                <div class="text-center text-danger py-3">
                    Erro de conexão
                </div>
            `
        })
}

