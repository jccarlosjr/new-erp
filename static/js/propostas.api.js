let propostaModal;

document.addEventListener('DOMContentLoaded', function () {
    propostaModal = new bootstrap.Modal(document.getElementById('propostaModal'))
})

document.getElementById("operacoes-select").addEventListener("change", () => {
    loadTabelasSelect();
    renderPropostaFields();
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

function changeStatusProposta() {
    showLoader()
    const id = document.getElementById('change-proposta-id').value;
    const status = document.getElementById('status-change-proposta').value;
    const obs = document.getElementById('obs-change-proposta').value;

    if(!status || !obs) {
        showToast('Preencha todos os campos !', 'danger');
        hideLoader();
        return
    }

    fetch('/api/propostas/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ 
            id: id,
            status_id: status,
            obs: obs,
            bloqueado: true
        })
    })
    .then(async res => {
        const data = await res.json()
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || 'Erro ao excluir')
        }
        return data
    })
    .then(() => {
        changePropostaModal.hide();
        showToast('Status alterado com sucesso', 'success')
        loadCards();
    })
    .catch(err => {
        changePropostaModal.hide();
        showToast(err.message)
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

function openEditPropostaModal(element) {
    const proposta = JSON.parse(element.dataset.proposta);

    loadBancosSelect();
    loadOperacoesSelect();

    document.getElementById('banco-select').value = proposta.tabela__banco__id

    propostaModal.show();
    
    document.getElementById('operacoes-select').value = proposta.tabela__operacao__id
    console.log(proposta);
}