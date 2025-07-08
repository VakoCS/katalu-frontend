// JavaScript para la página de registro

document.addEventListener('DOMContentLoaded', function() {
    let productosDisponibles = [];
    let contadorProductos = 0;

    // Elementos del DOM
    const btnBuscarCliente = document.getElementById('btnBuscarCliente');
    const dniInput = document.getElementById('dni');
    const clienteInfo = document.getElementById('clienteInfo');
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    const productosContainer = document.getElementById('productosContainer');
    const montoTotalSpan = document.getElementById('montoTotal');
    const formRegistro = document.getElementById('formRegistro');

    // Cargar productos disponibles
    cargarProductos();

    // Event listeners
    btnBuscarCliente.addEventListener('click', buscarCliente);
    dniInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarCliente();
        }
    });
    btnAgregarProducto.addEventListener('click', agregarProducto);
    formRegistro.addEventListener('submit', validarFormulario);

    // Establecer fecha mínima como hoy
    const fechaEntrega = document.getElementById('fechaEntrega');
    const today = new Date().toISOString().split('T')[0];
    fechaEntrega.min = today;
    fechaEntrega.value = today;

    // Funciones auxiliares
    function validarDNI(dni) {
        return /^\d{8}$/.test(dni);
    }

    function truncateToOneDecimal(num) {
        return Math.floor(num * 10) / 10;
    }

    function showButtonLoading(button, text = 'Cargando...') {
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${text}`;
    }

    function hideButtonLoading(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    }

    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const main = document.querySelector('main');
        main.insertBefore(alertDiv, main.firstChild);
        
        // Auto dismiss
        setTimeout(() => {
            if (alertDiv.querySelector('.btn-close')) {
                alertDiv.querySelector('.btn-close').click();
            }
        }, 5000);
    }

    // Funciones principales
    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos');
            const data = await response.json();
            
            if (data.success) {
                productosDisponibles = data.data;
                console.log('Productos cargados:', productosDisponibles.length);
            } else {
                console.error('Error al cargar productos:', data.message);
                showAlert('Error al cargar productos', 'warning');
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            showAlert('Error de conexión al cargar productos', 'danger');
        }
    }

    async function buscarCliente() {
        const dni = dniInput.value.trim();
        
        if (!validarDNI(dni)) {
            showAlert('DNI debe tener 8 dígitos', 'warning');
            return;
        }

        const originalText = btnBuscarCliente.innerHTML;
        showButtonLoading(btnBuscarCliente, 'Buscando...');

        try {
            const response = await fetch(`/api/cliente/${dni}`);
            const data = await response.json();

            if (data.success) {
                mostrarInfoCliente(data.data);
            } else {
                clienteInfo.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> Cliente no encontrado
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error al buscar cliente:', error);
            clienteInfo.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times"></i> Error de conexión
                </div>
            `;
        } finally {
            hideButtonLoading(btnBuscarCliente, originalText);
        }
    }

    function mostrarInfoCliente(cliente) {
        clienteInfo.innerHTML = `
            <div class="cliente-info">
                <i class="fas fa-user text-success"></i>
                <strong>${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno}</strong><br>
                <small>DNI: ${cliente.documento}</small>
            </div>
        `;
    }

    function agregarProducto() {
        if (productosDisponibles.length === 0) {
            showAlert('No hay productos disponibles', 'warning');
            return;
        }

        contadorProductos++;
        const productoId = `producto_${contadorProductos}`;

        const productoHTML = `
            <div class="producto-item fade-in" id="${productoId}">
                <button type="button" class="btn btn-danger btn-sm btn-remove" onclick="eliminarProducto('${productoId}')">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Producto</label>
                        <select class="form-select producto-select" name="productos[${contadorProductos}][idProducto]" required onchange="actualizarProducto(this, '${productoId}')">
                            <option value="">Seleccionar producto...</option>
                            ${productosDisponibles.map(p => 
                                `<option value="${p.idProducto}" data-precio="${p.precioUnitario}" data-nombre="${p.nombre}">
                                    ${p.codigo} - ${p.nombre}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Cantidad</label>
                        <input type="number" class="form-control cantidad-input" 
                               name="productos[${contadorProductos}][cantidad]" 
                               min="1" value="1" required 
                               oninput="calcularTotal()">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Precio Unit.</label>
                        <input type="number" class="form-control precio-input" 
                               name="productos[${contadorProductos}][precioUnitario]" 
                               step="0.01" min="0" required readonly>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Descripción</label>
                        <input type="text" class="form-control descripcion-input" 
                               name="productos[${contadorProductos}][descripcion]" 
                               readonly>
                    </div>
                    <div class="col-md-1">
                        <label class="form-label">Subtotal</label>
                        <input type="text" class="form-control subtotal-display" readonly>
                    </div>
                </div>
            </div>
        `;

        productosContainer.insertAdjacentHTML('beforeend', productoHTML);
        
        // Asegurar que el nuevo producto tenga los event listeners
        const nuevoProducto = document.getElementById(productoId);
        const cantidadInput = nuevoProducto.querySelector('.cantidad-input');
        const selectProducto = nuevoProducto.querySelector('.producto-select');
        
        // Agregar event listeners adicionales
        cantidadInput.addEventListener('input', calcularTotal);
        cantidadInput.addEventListener('change', calcularTotal);
        selectProducto.addEventListener('change', function() {
            actualizarProducto(this, productoId);
        });
        
        calcularTotal();
    }

    function eliminarProducto(productoId) {
        const elemento = document.getElementById(productoId);
        if (elemento) {
            elemento.remove();
            calcularTotal();
        }
    }

    function actualizarProducto(select, productoId) {
        const option = select.selectedOptions[0];
        const productoDiv = document.getElementById(productoId);
        
        if (!productoDiv) return;
        
        if (option.value) {
            const precio = parseFloat(option.getAttribute('data-precio'));
            const nombre = option.getAttribute('data-nombre');
            
            const precioInput = productoDiv.querySelector('.precio-input');
            const descripcionInput = productoDiv.querySelector('.descripcion-input');
            
            if (precioInput) precioInput.value = precio.toFixed(2);
            if (descripcionInput) descripcionInput.value = nombre;
        } else {
            const precioInput = productoDiv.querySelector('.precio-input');
            const descripcionInput = productoDiv.querySelector('.descripcion-input');
            
            if (precioInput) precioInput.value = '';
            if (descripcionInput) descripcionInput.value = '';
        }
        
        calcularTotal();
    }

    // Hacer las funciones globales para que funcionen con onclick
    window.eliminarProducto = eliminarProducto;
    window.actualizarProducto = actualizarProducto;
    window.calcularTotal = calcularTotal;

    function calcularTotal() {
        let total = 0;
        
        document.querySelectorAll('.producto-item').forEach(item => {
            const cantidad = parseInt(item.querySelector('.cantidad-input').value) || 0;
            const precio = parseFloat(item.querySelector('.precio-input').value) || 0;
            const subtotal = cantidad * precio;
            
            // Actualizar subtotal del producto
            const subtotalDisplay = item.querySelector('.subtotal-display');
            if (subtotalDisplay) {
                subtotalDisplay.value = `S/ ${subtotal.toFixed(2)}`;
            }
            
            total += subtotal;
        });

        // Truncar a 1 decimal
        total = truncateToOneDecimal(total);
        
        // Actualizar el total en la pantalla
        const montoTotalElement = document.getElementById('montoTotal');
        if (montoTotalElement) {
            montoTotalElement.textContent = `S/ ${total.toFixed(1)}`;
        }
        
        console.log('Total calculado:', total); // Para debugging
    }

    function validarFormulario(e) {
        const dni = dniInput.value.trim();
        const productos = document.querySelectorAll('.producto-item');

        if (!validarDNI(dni)) {
            e.preventDefault();
            showAlert('DNI debe tener 8 dígitos', 'danger');
            return false;
        }

        if (productos.length === 0) {
            e.preventDefault();
            showAlert('Debe agregar al menos un producto', 'danger');
            return false;
        }

        // Validar que todos los productos estén completos
        let productosValidos = true;
        productos.forEach(item => {
            const select = item.querySelector('.producto-select');
            const cantidad = item.querySelector('.cantidad-input');
            
            if (!select.value || !cantidad.value || cantidad.value <= 0) {
                productosValidos = false;
            }
        });

        if (!productosValidos) {
            e.preventDefault();
            showAlert('Todos los productos deben estar completos y con cantidad mayor a 0', 'danger');
            return false;
        }

        // Mostrar loading en el botón de submit
        const submitBtn = formRegistro.querySelector('button[type="submit"]');
        showButtonLoading(submitBtn, 'Registrando...');

        return true;
    }

    // Agregar un producto por defecto
    agregarProducto();
});