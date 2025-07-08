const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const webRoutes = require('./routes/webRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/', webRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Página no encontrada',
    error: 'La página que buscas no existe' 
  });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error del servidor',
    error: 'Error interno del servidor' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Frontend corriendo en http://localhost:${PORT}`);
  console.log(`API Backend en: ${process.env.API_BASE_URL}`);
});