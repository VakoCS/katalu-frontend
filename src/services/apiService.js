const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Crear nueva salida
  async crearSalida(salidaData) {
    try {
      const response = await this.api.post('/katalu/ingreso', salidaData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener lista de salidas
  async obtenerSalidas() {
    try {
      const response = await this.api.get('/katalu/lista');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener lista de productos (necesitaremos esta función para el formulario)
  async obtenerProductos() {
    try {
      const response = await this.api.get('/katalu/productos');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Buscar cliente por DNI
  async buscarClientePorDNI(dni) {
    try {
      const response = await this.api.get(`/katalu/cliente/${dni}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generar minería de datos
  async generarMineria() {
    try {
      const response = await this.api.post('/katalu/mineria');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || error.response.data.error || 'Error del servidor',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        status: 500,
        message: 'No se pudo conectar con el servidor',
        data: null
      };
    } else {
      return {
        status: 500,
        message: error.message || 'Error desconocido',
        data: null
      };
    }
  }
}

module.exports = new ApiService();