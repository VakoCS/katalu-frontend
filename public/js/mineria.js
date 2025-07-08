// JavaScript para la página de minería

document.addEventListener('DOMContentLoaded', function() {
    const btnGenerarMineria = document.getElementById('btnGenerarMineria');
    const loadingContainer = document.getElementById('loadingContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');

    btnGenerarMineria.addEventListener('click', generarMineria);

    async function generarMineria() {
        try {
            // Mostrar loading y ocultar otros elementos
            btnGenerarMineria.disabled = true;
            btnGenerarMineria.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
            loadingContainer.style.display = 'block';
            resultsContainer.style.display = 'none';
            errorContainer.style.display = 'none';

            console.log('Iniciando petición de minería...');

            // Hacer petición al backend
            const response = await fetch('/mineria/generar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Respuesta recibida:', data);

            if (data.success && data.data.success) {
                // Mostrar resultados
                mostrarResultados(data.data);
            } else {
                // Mostrar error
                mostrarError(data.error || data.data.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error al generar minería:', error);
            mostrarError('Error de conexión: ' + error.message);
        } finally {
            // Restaurar botón
            btnGenerarMineria.disabled = false;
            btnGenerarMineria.innerHTML = '<i class="fas fa-rocket me-2"></i>Generar Minería de Datos';
            loadingContainer.style.display = 'none';
        }
    }

    function mostrarResultados(data) {
        console.log('Mostrando resultados:', data);

        // Mostrar contenedor de resultados
        resultsContainer.style.display = 'block';
        errorContainer.style.display = 'none';

        // Llenar métricas
        if (data.metricas) {
            document.getElementById('metricR2').textContent = data.metricas.r2;
            document.getElementById('metricRMSE').textContent = data.metricas.rmse + ' unidades';
            document.getElementById('metricMAE').textContent = data.metricas.mae + ' unidades';
            document.getElementById('metricMAPE').textContent = data.metricas.mape + '%';
        }

        // Llenar predicciones
        if (data.predicciones && data.mes_prediccion) {
            document.getElementById('mesPrediction').textContent = data.mes_prediccion;
            
            const tablaPrediciones = document.getElementById('tablaPrediciones');
            tablaPrediciones.innerHTML = '';

            for (const [region, cantidad] of Object.entries(data.predicciones)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${region}</strong></td>
                    <td>${cantidad.toLocaleString()} unidades</td>
                `;
                tablaPrediciones.appendChild(row);
            }
        }

        // Mostrar gráficos
        if (data.graphs) {
            const graphMapping = {
                'real_vs_predicho': 'graph1',
                'residuos': 'graph2', 
                'cantidad_region': 'graph3',
                'evolucion_temporal': 'graph4',
                'distribucion_errores': 'graph5'
            };

            for (const [graphKey, elementId] of Object.entries(graphMapping)) {
                if (data.graphs[graphKey]) {
                    const imgElement = document.getElementById(elementId);
                    imgElement.src = 'data:image/png;base64,' + data.graphs[graphKey];
                    imgElement.style.display = 'block';
                    
                    // Agregar efecto de fade in
                    imgElement.style.opacity = '0';
                    setTimeout(() => {
                        imgElement.style.transition = 'opacity 0.5s ease-in';
                        imgElement.style.opacity = '1';
                    }, 100);
                }
            }
        }

        // Scroll suave a los resultados
        resultsContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

        // Mostrar mensaje de éxito
        showAlert('Minería de datos generada exitosamente', 'success');
    }

    function mostrarError(errorMessage) {
        console.error('Mostrando error:', errorMessage);
        
        resultsContainer.style.display = 'none';
        errorContainer.style.display = 'block';
        
        document.getElementById('errorMessage').textContent = errorMessage;
        
        // Scroll al error
        errorContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto dismiss
        setTimeout(() => {
            if (alertDiv.querySelector('.btn-close')) {
                alertDiv.querySelector('.btn-close').click();
            }
        }, 5000);
    }

    console.log('Minería JavaScript cargado correctamente');
});