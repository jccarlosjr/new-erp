let matriculaModal;
let currentCliente = null;
let selectedMatricula = null;
let currentCardOferta = null;


/* ===============================
   EVENTOS
================================ */

document.addEventListener('DOMContentLoaded', () => {
    matriculaModal = new bootstrap.Modal(
        document.getElementById('matriculaModal')
    );

    document
        .getElementById('btn-search-btn')
        ?.addEventListener('click', getClienteByCPF);

    document
        .getElementById('clienteForm')
        ?.addEventListener('submit', saveCliente);
});


/* ===============================
   CLIENTE
================================ */

function getClienteByCPF() {
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
        });
}


function saveCliente(e) {
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
        });
}


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
    if (!currentCliente?.cpf) return;

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
        });
}

function editMatricula(id) {
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
        });
}

function saveMatricula() {

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
        });
}



/* ===============================
   CONVENIOS
================================ */
function loadConvenios() {
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
        });
}



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
    const tbody = document.getElementById('matriculasTable');

    if (!matriculas.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Nenhuma matrícula cadastrada
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = '';

    matriculas.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>
                    <input type="radio"
                           name="matriculaSelect"
                           onclick="selectMatricula(${m.id})">
                </td>
                <td>${m.convenio__nome}</td>
                <td>${m.matricula}</td>
                <td>${m.banco || '-'}</td>
                <td>${m.conta || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary"
                            onclick="editMatricula(${m.id})">
                        Editar
                    </button>
                </td>
            </tr>
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


/* ===============================
   CARD
================================ */ 

function createCardOferta() {

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
                goStep(3);
            } else {
                showToast(res.message || "Erro ao criar card", "danger");
            }
        })
        .catch(err => {
            showToast("Erro de conexão com o servidor", "danger");
            console.error(err);
        });
}
