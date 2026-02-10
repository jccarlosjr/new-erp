let matriculaModal;
let propostaModal;
let deleteModal;
let currentCliente = null;
let selectedMatricula = null;
let currentCardOferta = null;
let currentTabela = null;

/* ===============================
   EVENTOS
================================ */

document.addEventListener('DOMContentLoaded', () => {
    matriculaModal = new bootstrap.Modal(
        document.getElementById('matriculaModal')
    );


    propostaModal = new bootstrap.Modal(
        document.getElementById('propostaModal')
    );
    
    
    deleteModal = new bootstrap.Modal(
        document.getElementById('deleteModal')
    );

    document
        .getElementById('btn-search-btn')
        ?.addEventListener('click', getClienteByCPF);

    document
        .getElementById('clienteForm')
        ?.addEventListener('submit', saveCliente);
});

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
   CLIENTE
================================ */

function getClienteByCPF() {
    showLoader();
    const cpfValue = document.getElementById('cpf').value.trim();
    const cpf = cleanCPF(cpfValue);

    if (!cpf) {
        showToast("Informe um CPF", "warning");
        return;
    }

    fetch(`/api/clientes/?cpf=${cpf}`)
        .then(res => res.json())
        .then(res => {
            const cliente = res.data;

            if (cliente) {
                showToast("Dados do cliente retornados", "success");
                renderCliente(cliente);
            } else {
                showToast(
                    "Cliente não encontrado, preencha os dados manualmente",
                    "info"
                );
                clearClienteForm();
            }
        })
        .catch(err => {
            showToast("Erro de conexão com o servidor", "danger");
            console.error(err);
        })
        .finally(() => hideLoader());
}


function saveCliente(e) {
    showLoader();
    e.preventDefault();

    const payload = {
        cpf: cleanCPF(cpf.value),
        nome: nome.value,
        nascimento: nascimento.value,
        sexo: sexo.value,
        email: email.value,
        iletrado: iletrado.checked,
        numero_documento: numero_documento.value,
        orgao_emissor: orgao_emissor.value,
        uf_emissao: uf_emissao.value,
        data_emissao: data_emissao.value,
        naturalidade: naturalidade.value,
        uf_naturalidade: uf_naturalidade.value,
        pai: pai.value,
        mae: mae.value,
        celular: celular.value,
        cep: cep.value,
        endereco: endereco.value,
        numero: numero.value,
        bairro: bairro.value,
        complemento: complemento.value,
        cidade: cidade.value,
        uf_cidade: uf_cidade.value,
    };

    fetch('/api/clientes/', {
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
                showToast("Cliente salvo com sucesso", "success");
                currentCliente = res.data; // 👈 CLIENTE DISPONÍVEL GLOBALMENTE
                document.getElementById('cliente-id').value = res.data.id;
                goStep(2);
                loadConvenios();
                loadMatriculasCliente();
            } else {
                showToast(
                    res.message || "Erro ao salvar cliente",
                    "danger"
                );
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
   MATRÍCULAS
================================ */

function openCreateMatriculaModal() {
    document.getElementById('matriculaModalTitle').innerText =
        "Nova Matrícula";

    document.getElementById('matricula-id').value = '';
    document.getElementById('matricula-matricula').value = '';
    document.getElementById('matricula-codigo-convenio').value = '';
    document.getElementById('matricula-banco').value = '';
    document.getElementById('matricula-agencia').value = '';
    document.getElementById('matricula-conta').value = '';

    document.getElementById('matricula-cliente').value =
        `${currentCliente.nome} (${currentCliente.cpf})`;

    loadUFs('matricula-uf-convenio'); // 👈 AQUI

    matriculaModal.show();
}

function loadMatriculasCliente() {
    showLoader();
    if (!currentCliente?.cpf) {
        showToast("Cliente não identificado, retorne para a etapa anterior", "danger");
        return;
    }

    fetch(`/api/matriculas/?cpf=${currentCliente.cpf}`)
        .then(res => res.json())
        .then(res => {
            if (res.data) {
                renderMatriculas(res.data);
            }
        })
        .catch(err => {
            showToast("Erro ao carregar matrículas", "danger");
            console.error(err);
        })
        .finally(() => hideLoader())
}

function editMatricula(id) {
    showLoader();
    fetch(`/api/matriculas/${id}/`)
        .then(res => res.json())
        .then(res => {
            if (!res.data) {
                showToast("Matrícula não encontrada", "warning");
                return;
            }

            fillMatriculaForm(res.data);

            document.getElementById('matriculaModalTitle').innerText =
                "Editar Matrícula";

            matriculaModal.show();
        })
        .catch(err => {
            showToast("Erro ao carregar matrícula", "danger");
            console.error(err);
        })
        .finally(() => hideLoader());
}

function saveMatricula() {
    showLoader();
    if (!currentCliente?.cpf) {
        showToast("Cliente não identificado", "danger");
        return;
    }

    const payload = {
        id: document.getElementById('matricula-id').value || null,
        cpf: currentCliente.cpf,

        convenio_id: document.getElementById('convenio').value,
        matricula: document.getElementById('matricula-matricula').value,
        codigo_convenio: document.getElementById('matricula-codigo-convenio').value,
        uf_convenio: document.getElementById('matricula-uf-convenio').value,
        recebimento: document.getElementById('matricula-recebimento').value,

        banco: document.getElementById('matricula-banco').value,
        agencia: document.getElementById('matricula-agencia').value,
        conta: document.getElementById('matricula-conta').value,
    };

    /* ===== VALIDAÇÕES BÁSICAS ===== */
    if (!payload.convenio_id) {
        showToast("Selecione um convênio", "warning");
        return;
    }

    if (!payload.matricula) {
        showToast("Informe o número da matrícula", "warning");
        return;
    }

    fetch('/api/matriculas/', {
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
                        ? "Matrícula atualizada com sucesso"
                        : "Matrícula criada com sucesso",
                    "success"
                );

                matriculaModal.hide();
                loadMatriculasCliente(); // 🔄 RECARREGA A LISTA
            } else {
                showToast(
                    res.message || "Erro ao salvar matrícula",
                    "danger"
                );
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
   CONVENIOS
================================ */
function loadConvenios() {
    showLoader();
    fetch('/api/convenios/')
        .then(res => res.json())
        .then(res => {
            if (res.data) {
                renderConvenios(res.data);
            }
        })
        .catch(err => {
            showToast("Erro ao carregar convênios", "danger");
            console.error(err);
        })
        .finally(() => hideLoader())
}
/* ===============================
================================ */


/* ===============================
   RENDER / FORM
================================ */

function renderCliente(cliente) {
    for (const key in cliente) {
        const el = document.getElementById(key);
        if (!el) continue;

        if (el.type === 'checkbox') {
            el.checked = cliente[key];
        } else {
            el.value = cliente[key] ?? '';
        }
    }
}

function clearClienteForm() {
    document
        .querySelectorAll('#clienteForm input, #clienteForm select')
        .forEach(el => {
            if (el.type === 'checkbox') {
                el.checked = false;
            } else if (el.id !== 'cpf') {
                el.value = '';
            }
        });
}

function renderClienteMatricula(cliente) {
    document.getElementById('matriculaClienteNome').innerText = cliente.nome;
    document.getElementById('matriculaClienteCPF').innerText = cliente.cpf;
}

function renderConvenios(convenios) {
    const select = document.getElementById('convenio');

    select.innerHTML = '<option value="">-</option>';

    convenios.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nome;
        select.appendChild(opt);
    });
}

function renderMatriculas(matriculas) {
    const divMatriculas = document.getElementById('matriculas');

    if (!matriculas.length) {
        tbody.innerHTML = `
            <div class="col-md-12">
                    Nenhuma matrícula cadastrada
            </div>`;
        return;
    }

    divMatriculas.innerHTML = '';

    matriculas.forEach(m => {
        divMatriculas.innerHTML += `
        <div class="row text-center mt-2">
            <div class="col-md-1"><input type="radio" name="matriculaSelect" onclick="selectMatricula(${m.id})"></div>
            <div class="col-md-2">${m.convenio__nome}</div>
            <div class="col-md-2">${m.matricula}</div>
            <div class="col-md-2">${m.codigo_convenio}</div>
            <div class="col-md-1">${m.banco}</div>
            <div class="col-md-1">${m.agencia}</div>
            <div class="col-md-2">${m.conta}</div>
            <div class="col-md-1">
                <button class="btn btn-sm btn-outline-success" onclick="editMatricula(${m.id})"><i class="bi bi-pencil-square"></i></button>
            </div>
        </div>
        `;
    });
}

function fillMatriculaForm(m) {
    document.getElementById('matricula-id').value = m.id;
    document.getElementById('matricula-cliente').value =
        currentCliente.nome;

    document.getElementById('convenio').value = m.convenio;
    document.getElementById('matricula-matricula').value = m.matricula;
    document.getElementById('matricula-codigo-convenio').value =
        m.codigo_convenio ?? '';

    document.getElementById('matricula-uf-convenio').value =
        m.uf_convenio ?? '';

    document.getElementById('matricula-recebimento').value =
        m.recebimento ?? 'CC';

    document.getElementById('matricula-banco').value = m.banco ?? '';
    document.getElementById('matricula-agencia').value = m.agencia ?? '';
    document.getElementById('matricula-conta').value = m.conta ?? '';
    loadUFs('matricula-uf-convenio', m.uf_convenio);

}

function selectMatricula(id) {
    selectedMatricula = id;
    document.getElementById('btnContinuarOferta').disabled = false;
}

function clearMatriculaForm() {
    document.getElementById('matricula-id').value = '';

    document
        .querySelectorAll(
            '#matriculaModal input, #matriculaModal select'
        )
        .forEach(el => {
            if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
            } else if (el.id !== 'matricula-cliente') {
                el.value = '';
            }
        });
}

function loadUFs(selectId, selected = null) {
    const ufs = [
        "AC","AL","AP","AM","BA","CE","DF","ES","GO",
        "MA","MT","MS","MG","PA","PB","PR","PE","PI",
        "RJ","RN","RS","RO","RR","SC","SP","SE","TO"
    ];

    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-</option>';

    ufs.forEach(uf => {
        const opt = document.createElement('option');
        opt.value = uf;
        opt.textContent = uf;

        if (selected === uf) {
            opt.selected = true;
        }

        select.appendChild(opt);
    });
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

function renderPropostas(propostas) {
    let propostasTable = document.getElementById('propostasTable');
    propostasTable.innerHTML = '';

    propostas.forEach(proposta => {
        let row = `
            <tr>
                <td>${proposta.codigo_interno}</td>
                <td>${proposta.tabela__operacao__nome}</td>
                <td>${proposta.tabela__banco__nome}</td>
                <td>${proposta.parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</td>
                <td>${proposta.card_oferta__matricula__matricula}</td>
                <td>
                    <button class="btn btn-outline-danger" title="Excluir" onclick="openDeleteModal(${proposta.id}, '${proposta.codigo_interno}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        propostasTable.innerHTML += row;
    });

}


/* ===============================
   CARD HISTORICO
================================ */ 
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
/* ===============================
   CARD
================================ */ 


function createCardOferta() {
    showLoader();

    if(currentCardOferta != null) {
        currentCardOferta = currentCardOferta;
        goStep(3);
        return;
    }

    if (!currentCliente?.cpf) {
        showToast("Cliente não identificado", "danger");
        return;
    }

    if (!selectedMatricula) {
        showToast("Selecione uma matrícula", "warning");
        return;
    }

    const payload = {
        cpf: currentCliente.cpf,
        matricula_id: selectedMatricula
    };

    fetch('/api/cards-oferta/', {
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
                showToast("Card de oferta criado", "success");
                currentCardOferta = res.data;
                createHistorico(res.data.id, obs = 'Card de Oferta Criado')
                goStep(3);
                document.getElementById('card-oferta').innerHTML = `
                    <h4 class="mb-4">${currentCliente.nome} - ${currentCliente.cpf}</h4>
                    <p>Card de Ofertas - <span class="text-primary">${currentCardOferta.codigo_interno}</span></p>
                `;
            } else {
                showToast(res.message || "Erro ao criar card", "danger");
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
   PROPOSTA
================================ */ 

function openCreatePropostaModal() {
    let formProposta = document.getElementById('form-proposta-fields');
    formProposta.innerHTML = '';

    if (!currentCliente?.cpf) {
        showToast("Cliente não identificado", "danger");
        return;
    }

    if (!currentCardOferta?.id) {
        showToast("Card de oferta não identificado", "danger");
        return;
    }

    document.getElementById('propostaModalTitle').innerText =
        "Nova Proposta";

    document.getElementById('proposta-id').value = '';

    document
        .querySelectorAll('#propostaModal input, #propostaModal textarea')
        .forEach(el => el.value = '');
    
    loadBancosSelect();
    loadOperacoesSelect();

    propostaModal.show();
}

function saveProposta() {
    showLoader();
    if (!currentCliente?.cpf) {
        showToast("Cliente não identificado", "danger");
        return;
    }

    if (!currentCardOferta?.id) {
        showToast("Card de oferta não identificado", "danger");
        return;
    }

    let saldoDevedor = Number(document.getElementById('saldo_devedor')?.value ?? 0);
    let troco = Number(document.getElementById('troco').value);
    let financiado = saldoDevedor + troco;

    const payload = {
        id: document.getElementById('proposta-id').value || null,

        cpf: currentCliente.cpf,
        card_oferta_id: currentCardOferta.id,
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
                loadPropostasByCardID();

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

function loadPropostasByCardID() {
    showLoader();
    fetch(`/api/propostas/?card_id=${currentCardOferta.id}`)
        .then(res => res.json())
        .then(res => {
            if (res.data) {
                renderPropostas(res.data);
            }
        })
        .catch(err => {
            showToast("Erro ao carregar propostas", "danger");
            console.error(err);
        })
        .finally(() => hideLoader())
}

function openDeleteModal(id, nome) {
    document.getElementById('delete-id').value = id
    document.getElementById('delete-nome').innerText = nome
    deleteModal.show()
}

function deleteProposta(){
    showLoader();
    deleteModal.show();
    const id = document.getElementById('delete-id').value;

    fetch(`/api/propostas/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            deleteModal.hide()
            showToast("Proposta excluida com sucesso", "success");
            loadPropostasByCardID();
        } else {
            showToast(res.message || "Erro ao excluir proposta", "danger");
        }
    })
    .catch(err => {
        showToast("Erro de conexão com o servidor", "danger");
        console.error(err);
    })
    .finally(() => hideLoader())
}

async function finalizarCard() {
    goStep(4);

    const response = await setCardStatusDigitacao();

    if (!response || response.status !== 'success') {
        showToast(
            'Erro ao solicitar digitação, solicite a digitação manualmente!',
            'danger'
        );
        return;
    }

    showToast('Card digitado com sucesso!', 'success');

    document.getElementById("text-confirm").innerHTML = `
        <h5 class="text-center">
            <span class="text-primary">${currentCardOferta.codigo_interno}</span>
            digitado com sucesso!
        </h5>
    `;
}


async function setCardStatusDigitacao() {
    showLoader();

    return fetch('/api/cards-oferta/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({
            id: currentCardOferta.id,
            status: 'DIGITACAO'
        })
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar status');
            }
            return data;
        });
    })
    .then(data => {
        console.log('Status atualizado:', data);
        createHistorico(currentCardOferta.id, obs = 'Digitação Solicitada')
        return data;
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => {
        hideLoader();
    });
}


/* ===============================
================================ */
