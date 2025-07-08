const apiService = require('../services/apiService');

class WebController {
  
  // Mostrar formulario de registro
  async mostrarFormularioRegistro(req, res) {
    try {
      res.render('registrar', { 
        title: 'Registrar Venta',
        success: null,
        error: null
      });
    } catch (error) {
      console.error('Error al mostrar formulario:', error);
      res.render('registrar', { 
        title: 'Registrar Venta',
        success: null,
        error: 'Error al cargar el formulario'
      });
    }
  }

  // Procesar registro de salida
  async procesarRegistro(req, res) {
    try {
      const { dni, fechaEntrega, productos } = req.body;
      
      // Validar datos básicos
      if (!dni || !fechaEntrega || !productos || productos.length === 0) {
        return res.render('registrar', {
          title: 'Registrar Venta',
          success: null,
          error: 'Todos los campos son obligatorios'
        });
      }

      // Buscar cliente por DNI
      const clienteResponse = await apiService.buscarClientePorDNI(dni);
      if (clienteResponse.status && clienteResponse.status !== 200) {
        return res.render('registrar', {
          title: 'Registrar Venta',
          success: null,
          error: `Cliente no encontrado: ${clienteResponse.message}`
        });
      }

      // Calcular monto total con truncamiento a 1 decimal
      let montoTotal = 0;
      const productosFormateados = productos.map(prod => {
        const subtotal = parseFloat(prod.precioUnitario) * parseInt(prod.cantidad);
        montoTotal += subtotal;
        
        return {
          idProducto: prod.idProducto,
          cantidad: parseInt(prod.cantidad),
          precioUnitario: parseFloat(prod.precioUnitario),
          descripcion: prod.descripcion || ''
        };
      });

      // Truncar monto total a 1 decimal (no redondear)
      montoTotal = Math.floor(montoTotal * 10) / 10;

      // Preparar datos para enviar al backend
      const salidaData = {
        montoTotal,
        fechaEntrega,
        idCliente: clienteResponse.data.idCliente,
        productos: productosFormateados
      };

      // Crear la salida
      const resultado = await apiService.crearSalida(salidaData);
      
      if (resultado.success) {
        res.render('registrar', {
          title: 'Registrar Venta',
          success: 'Venta registrada exitosamente',
          error: null
        });
      } else {
        res.render('registrar', {
          title: 'Registrar Venta',
          success: null,
          error: resultado.message || 'Error al registrar la venta'
        });
      }

    } catch (error) {
      console.error('Error al procesar registro:', error);
      res.render('registrar', {
        title: 'Registrar Venta',
        success: null,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  // Mostrar lista de ventas con paginación
  async mostrarListaVentas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 30;
      
      const response = await apiService.obtenerSalidas();
      
      if (response.success) {
        const salidas = response.data;
        const totalSalidas = salidas.length;
        const totalPages = Math.ceil(totalSalidas / limit);
        
        // Paginación simple
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const salidasPaginadas = salidas.slice(startIndex, endIndex);
        
        res.render('lista', {
          title: 'Lista de Ventas',
          salidas: salidasPaginadas,
          currentPage: page,
          totalPages,
          totalSalidas,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });
      } else {
        res.render('lista', {
          title: 'Lista de Ventas',
          salidas: [],
          error: response.message || 'Error al obtener las ventas'
        });
      }
    } catch (error) {
      console.error('Error al obtener lista:', error);
      res.render('lista', {
        title: 'Lista de Ventas',
        salidas: [],
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  // Mostrar página de minería (vacía)
  async mostrarMineria(req, res) {
    try {
      res.render('mineria', { 
        title: 'Minería de Datos'
      });
    } catch (error) {
      console.error('Error al mostrar minería:', error);
      res.render('error', { 
        title: 'Error',
        error: 'Error al cargar la página de minería'
      });
    }
  }

  // Generar análisis de minería
  async generarMineria(req, res) {
    try {
      console.log('Iniciando generación de minería...');
      
      const response = await apiService.generarMineria();
      
      if (response.success) {
        res.json({
          success: true,
          data: response.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: response.error || 'Error al generar minería'
        });
      }
      
    } catch (error) {
      console.error('Error al generar minería:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  // API endpoints para AJAX
  async obtenerProductos(req, res) {
    try {
      const response = await apiService.obtenerProductos();
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async buscarClientePorDNI(req, res) {
    try {
      const { dni } = req.params;
      const response = await apiService.buscarClientePorDNI(dni);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new WebController();