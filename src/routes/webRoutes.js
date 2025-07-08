const express = require('express');
const router = express.Router();
const webController = require('../controllers/webController');

// Ruta principal - redirige a registrar
router.get('/', (req, res) => {
  res.redirect('/registrar');
});

// Página de registro de salidas
router.get('/registrar', webController.mostrarFormularioRegistro);
router.post('/registrar', webController.procesarRegistro);

// Página de lista de ventas
router.get('/lista', webController.mostrarListaVentas);

// Página de minería (vacía por ahora)
router.get('/mineria', webController.mostrarMineria);

// Generar análisis de minería
router.post('/mineria/generar', webController.generarMineria);

// API endpoints para el frontend (AJAX)
router.get('/api/productos', webController.obtenerProductos);
router.get('/api/cliente/:dni', webController.buscarClientePorDNI);

module.exports = router;