# 🍒 Cherry Market - API RESTful (Backend)

Bienvenido al backend de **Cherry Market**, una API RESTful robusta, segura y escalable diseñada para soportar la gestión de un punto de venta (POS) y el control de inventario. Construida con **Node.js**, **Express** y **PostgreSQL**, esta API maneja la lógica de negocio, autenticación, transacciones y reportes, integrándose perfectamente con el frontend de Cherry Market.

## 🚀 Live Demo
- **API Desplegada en Render**: [https://cherry-market-api.onrender.com](https://cherry-market-api.onrender.com)
- **Nota**: El plan gratuito de Render puede causar una demora inicial de ~30 segundos en la primera solicitud del día mientras el servidor "despierta".

## 🎯 Características Principales
El backend proporciona una infraestructura completa para la gestión de un negocio comercial, con énfasis en seguridad, integridad de datos y facilidad de integración.

### 1. Autenticación y Seguridad
- **Registro de Usuarios (`/api/auth/register`)**: Permite crear nuevos usuarios con contraseñas encriptadas mediante **bcrypt**. Los usuarios reciben el rol `cashier` por defecto.
- **Inicio de Sesión (`/api/auth/login`)**: Autentica usuarios y genera un token **JWT** firmado, válido por 1 hora, que incluye el ID, nombre de usuario y rol.
- **Rutas Protegidas**: Un middleware verifica la validez del token JWT en todas las rutas no públicas, denegando acceso a usuarios no autenticados.
- **Roles de Usuario**: Soporta roles `admin` y `cashier`, utilizados por el frontend para restringir acceso a ciertas funcionalidades.

### 2. Gestión de Productos (`/api/products`)
- **CRUD Completo**: Permite crear, leer, actualizar y eliminar productos.
- **Validaciones**: Asegura que los campos obligatorios (nombre y precio) estén presentes.
- **Relación con Categorías**: Los productos pueden asociarse a categorías mediante un `category_id`.
- **Borrado Físico**: La eliminación de productos es permanente (`DELETE`), con validación para evitar eliminar productos inexistentes.

### 3. Gestión de Categorías (`/api/categories`)
- **CRUD Completo**: Permite crear, leer, actualizar y eliminar categorías de productos.
- **Validaciones**: Evita categorías duplicadas mediante restricciones de clave única en la base de datos.
- **Integración**: Las categorías se vinculan a productos para una mejor organización del inventario.

### 4. Sistema de Ventas Transaccional (`/api/sales`)
- **Registro de Ventas**: Procesa ventas con un carrito de ítems, registrando la transacción en las tablas `sales` y `sale_items`.
- **Soporte para Ítems Manuales**: Permite registrar ítems sin ID de producto (con nombre y precio personalizados), ideal para productos no inventariados.
- **Gestión de Stock**: Actualiza el stock de productos no manuales dentro de una transacción, revirtiendo la operación si el stock es insuficiente.
- **Transacciones Atómicas**: Utiliza transacciones de PostgreSQL (`BEGIN`, `COMMIT`, `ROLLBACK`) para garantizar la integridad de los datos.

### 5. Reportes y Analítica
- **Estadísticas del Dashboard (`/api/dashboard/stats`)**: Proporciona métricas clave:
  - Ventas totales del día (en la zona horaria de Argentina).
  - Cantidad de productos con stock bajo (<10 unidades).
- **Resumen de Ventas (`/api/reports/sales-summary`)**: Devuelve ventas agrupadas por día en un rango de fechas, ideal para gráficos.
- **Productos Más Vendidos (`/api/reports/top-selling-products`)**: Lista los productos con mayor cantidad vendida, con un límite configurable.

### 6. Seguridad y Configuración
- **CORS**: Configurado para permitir solicitudes solo desde dominios autorizados (localhost y el frontend desplegado).
- **Variables de Entorno**: Usa `dotenv` para gestionar configuraciones sensibles como la URL de la base de datos y el secreto JWT.
- **Conexión SSL**: Soporta conexiones seguras a PostgreSQL en producción.

## 🛠️ Stack Tecnológico
| Tecnología         | Descripción                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Node.js**        | Entorno de ejecución para JavaScript en el servidor.                       |
| **Express**        | Framework para construir APIs RESTful.                                     |
| **PostgreSQL**     | Base de datos relacional para almacenamiento de datos.                     |
| **pg**             | Driver para conectar Node.js con PostgreSQL.                               |
| **bcryptjs**       | Encriptación de contraseñas.                                               |
| **jsonwebtoken**   | Generación y verificación de tokens JWT.                                   |
| **cors**           | Control de solicitudes cross-origin.                                       |
| **dotenv**         | Gestión de variables de entorno.                                           |

## 🛠️ Instalación y Ejecución (Desarrollo Local)
### Prerrequisitos
- **Node.js** (v16 o superior)
- **PostgreSQL** (instancia local corriendo)
- **npm** (incluido con Node.js)

### Pasos
1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/juandualibe/CherryMarket-Backend.git
   cd CherryMarket-Backend
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar la Base de Datos**  
   Crea una base de datos en PostgreSQL (ej. cherry_market_db) y asegúrate de que las tablas estén creadas. Consulta el esquema en la documentación o scripts SQL (si están disponibles).

4. **Configurar Variables de Entorno**  
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   DATABASE_URL=postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/cherry_market_db
   JWT_SECRET=TU_SECRETO_JWT_AQUI
   PORT=5000
   ```

5. **Iniciar el Servidor**
   ```bash
   npm start
   ```
   El servidor se ejecutará en [http://localhost:5000](http://localhost:5000).

### Estructura de Carpetas
```plaintext
├── controllers/           # Controladores para manejar la lógica de las rutas
├── services/              # Servicios para interactuar con la base de datos
├── routes/                # Definición de rutas de la API
├── authMiddleware.js      # Middleware de autenticación JWT
├── db.js                  # Configuración del pool de conexiones PostgreSQL
├── index.js               # Punto de entrada del servidor
├── .env                   # Variables de entorno
├── package.json           # Dependencias y scripts
├── README.md              # Documentación del proyecto
```

## 📚 Documentación de Endpoints

### Autenticación (Públicos)
**POST /api/auth/register**  
Registra un nuevo usuario.  
Body:  
```json
{ "username": "string", "password": "string" }
```  
Respuesta:  
```json
{ "message": "Usuario registrado exitosamente.", "user": { "id": number, "username": "string" } }
```

**POST /api/auth/login**  
Inicia sesión y devuelve un token JWT.  
Body:  
```json
{ "username": "string", "password": "string" }
```  
Respuesta:  
```json
{ "message": "Inicio de sesión exitoso.", "token": "string" }
```

### Productos (Protegidos)
**GET /api/products**  
Obtiene todos los productos con sus categorías.  
Respuesta:  
```json
[{ "id": number, "name": "string", "price": number, "stock": number, "barcode": "string", "category_id": number, "category_name": "string" }]
```

**POST /api/products**  
Crea un nuevo producto.  
Body:  
```json
{ "name": "string", "price": number, "stock": number, "barcode": "string", "category_id": number }
```  
Respuesta:  
```json
{ "message": "Producto creado exitosamente", "product": {...} }
```

**PUT /api/products/:id**  
Actualiza un producto.  
Body:  
```json
{ "name": "string", "price": number, "stock": number, "barcode": "string", "category_id": number }
```  
Respuesta:  
```json
{ "message": "Producto actualizado exitosamente.", "product": {...} }
```

**DELETE /api/products/:id**  
Elimina un producto.  
Respuesta:  
```json
{ "message": "Producto eliminado exitosamente." }
```

### Categorías (Protegidos)
**GET /api/categories**  
Obtiene todas las categorías.  
Respuesta:  
```json
[{ "id": number, "name": "string" }]
```

**POST /api/categories**  
Crea una nueva categoría.  
Body:  
```json
{ "name": "string" }
```  
Respuesta:  
```json
{ "id": number, "name": "string" }
```

**PUT /api/categories/:id**  
Actualiza una categoría.  
Body:  
```json
{ "name": "string" }
```  
Respuesta:  
```json
{ "id": number, "name": "string" }
```

**DELETE /api/categories/:id**  
Elimina una categoría.  
Respuesta:  
```json
{ "message": "Categoría eliminada exitosamente." }
```

### Ventas (Protegidos)
**GET /api/sales**  
Obtiene el historial de ventas con detalles de ítems.  
Respuesta:  
```json
[{ "id": number, "sale_date": "string", "total_amount": number, "items": [{ "productId": number, "name": "string", "quantity": number, "priceAtSale": number }] }]
```

**POST /api/sales**  
Registra una nueva venta.  
Body:  
```json
{ "cart": [{ "id": number, "name": "string", "quantity": number, "price": number, "isManual": boolean }], "total": number }
```  
Respuesta:  
```json
{ "message": "Venta registrada exitosamente", "saleId": number }
```

### Dashboard (Protegidos)
**GET /api/dashboard/stats**  
Obtiene estadísticas del dashboard.  
Respuesta:  
```json
{ "totalSalesToday": number, "lowStockCount": number }
```

### Reportes (Protegidos)
**GET /api/reports/sales-summary**  
Obtiene un resumen de ventas por día.  
Query: `startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`  
Respuesta:  
```json
[{ "date": "YYYY-MM-DD", "total": number }]
```

**GET /api/reports/top-selling-products**  
Obtiene los productos más vendidos.  
Query: `limit=number`  
Respuesta:  
```json
[{ "name": "string", "total_sold": number }]
```

## 📝 Notas y Mejoras Futuras
- **Validaciones Adicionales**: Añadir más controles en endpoints críticos (ej. límites de stock negativos).  
- **Paginación**: Implementar paginación en endpoints que devuelven listas grandes (ej. /api/sales).  
- **Testing**: Incorporar pruebas unitarias e integrales con Jest y Supertest.  
- **Documentación Automática**: Usar Swagger para generar documentación interactiva de la API.

## 🤝 Contribuir
Haz un fork del repositorio.  
Crea una rama para tu feature  
```bash
git checkout -b feature/nueva-funcionalidad
```  
Realiza tus cambios y haz commit  
```bash
git commit -m "Añade nueva funcionalidad"
```  
Sube los cambios  
```bash
git push origin feature/nueva-funcionalidad
```  
Abre un Pull Request en GitHub.

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

## 📬 Contacto
Desarrollado por Juan Dualibe. Para consultas, contáctame en [juandualibe@gmail.com](mailto:juandualibe@gmail.com).

