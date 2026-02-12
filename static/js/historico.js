
function openHistoricoModal(propostaId) {
    let historicoModal = new bootstrap.Modal(document.getElementById('historicoModal'))
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
                    <li class="list-group-item">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">
                                Alterado para <strong class="text-dark">${item.status__nome}</strong> por ${item.user__username ?? 'Sistema'} em ${formatDate(item.date)}
                            </small> 
                        </div>

                        ${item.obs ? `
                            <div class="mt-1">
                            <hr>
                                <p class="text-muted">${item.obs}</p>
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