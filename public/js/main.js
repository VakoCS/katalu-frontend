// JavaScript principal para Sistema Katalu

document.addEventListener('DOMContentLoaded', function() {
    // Configuración de tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-dismiss alerts después de 5 segundos
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.querySelector('.btn-close')) {
                alert.querySelector('.btn-close').click();
            }
        }, 5000);
    });

    // Confirmar acciones importantes
    const deleteButtons = document.querySelectorAll('[data-confirm]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm') || '¿Estás seguro?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Formatear números como moneda
    window.formatCurrency = function(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Truncar a 1 decimal
    window.truncateToOneDecimal = function(num) {
        return Math.floor(num * 10) / 10;
    };

    // Validar DNI peruano
    window.validarDNI = function(dni) {
        return /^\d{8}$/.test(dni);
    };

    // Mostrar loading en botones
    window.showButtonLoading = function(button, text = 'Cargando...') {
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${text}`;
    };

    window.hideButtonLoading = function(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    };

    // Utilidades para mostrar mensajes
    window.showAlert = function(message, type = 'info', container = 'body') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const containerEl = document.querySelector(container);
        containerEl.insertBefore(alertDiv, containerEl.firstChild);
        
        // Auto dismiss
        setTimeout(() => {
            if (alertDiv.querySelector('.btn-close')) {
                alertDiv.querySelector('.btn-close').click();
            }
        }, 5000);
    };

    console.log('Sistema Katalu cargado correctamente');
});