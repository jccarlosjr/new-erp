let historicoModal

document.addEventListener('DOMContentLoaded', function () {
    historicoModal = new bootstrap.Modal(document.getElementById('historicoModal'))
})

function createPropostaHistorico(propostaId, obs = '', propostaStatusId) {
    return fetch('/api/historico-proposta/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            proposta_id: propostaId,
            obs: obs,
            status_codigo: propostaStatusId
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
                    <li class="list-group-item mt-2 bg-${item.status__color}-subtle shadow-lg">
                        <div class="d-flex justify-content-between p-2">
                            <small class="text-muted">
                                ${item.user__username ?? 'Sistema'}: <strong class="text-dark">${item.status__nome}</strong> em ${formatDate(item.date)}
                            </small>
                        </div>

                        ${item.obs ? `
                            <div class="mt-1">
                            <hr>
                                <span class="text-dark">${item.obs}</span>
                            </div>
                        ` : ''}
                    </li>
                `)
            })
        })
        .catch(error => {
            console.log(error)
            loading.classList.add('d-none')
            list.innerHTML = `
                <li class="list-group-item text-danger">
                    Erro de conexão
                </li>
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
                    <li class="list-group-item mt-2 shadow-lg">
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

