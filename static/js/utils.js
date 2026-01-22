function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value
}

function showToast(message, type = 'danger') {
    const container = document.getElementById('toastContainer')

    const toastEl = document.createElement('div')
    toastEl.className = `toast text-bg-${type} border-0`
    toastEl.role = 'alert'

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white ms-auto"
                    data-bs-dismiss="toast"></button>
        </div>
    `

    container.appendChild(toastEl)

    const toast = new bootstrap.Toast(toastEl, { delay: 4000 })
    toast.show()

    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
}