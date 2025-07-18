# 🍒 Cherry Market - API del Backend

Bienvenido al backend de **Cherry Market**. Esta es una API RESTful robusta y segura, construida con Node.js y Express, que sirve como el motor para la aplicación de gestión de inventario y punto de venta.

## Live Demo
* **API Desplegada en Render:** `https://cherry-market-api.onrender.com`

---
## Arquitectura y Características

Este backend está diseñado para ser seguro, eficiente y escalable, manejando toda la lógica de negocio y la persistencia de datos.

### 1. **Autenticación y Seguridad**
* **Registro de Usuarios (`/api/auth/register`):** Permite la creación de nuevas cuentas de administrador. Las contraseñas se encriptan de forma irreversible utilizando el algoritmo **bcrypt**, garantizando que nunca se almacenen en texto plano.
* **Inicio de Sesión (`/api/auth/login`):** Autentica a los usuarios comparando la contraseña ingresada con el hash almacenado.
* **Tokens JWT:** Tras un login exitoso, la API genera un **JSON Web Token (JWT)** firmado con un secreto. Este token actúa como una credencial digital que el frontend debe enviar en cada petición subsecuente.
* **Rutas Protegidas:** Todas las rutas críticas (productos, ventas, reportes) están protegidas por un middleware que verifica la validez del token JWT en cada petición, denegando el acceso a usuarios no autorizados.

### 2. **Gestión de Productos (CRUD)**
* **Funcionalidad CRUD completa** para el inventario, permitiendo crear, leer, actualizar y eliminar productos.

### 3. **Sistema de Ventas Transaccional**
* **Endpoint de Ventas (`/api/sales`):** Maneja el registro de nuevas ventas. La operación se ejecuta dentro de una **transacción de base de datos** para garantizar la integridad de los datos:
    1. Registra la venta en la tabla `sales`.
    2. Registra cada producto vendido en la tabla `sale_items`.
    3. Descuenta el stock correspondiente de la tabla `products`.
    * Si cualquiera de estos pasos falla (ej: stock insuficiente), toda la operación se revierte (`ROLLBACK`), evitando inconsistencias en los datos.

### 4. **Reportes y Analítica**
* **Estadísticas del Dashboard (`/api/dashboard/stats`):** Proporciona un resumen rápido de métricas clave, como las ventas totales del día y el número de productos con bajo stock.
* **Resumen de Ventas por Fecha (`/api/reports/sales-summary`):** Un endpoint flexible que acepta un rango de fechas y devuelve un resumen de las ventas diarias, ideal para alimentar gráficos y reportes.

---
## Stack Tecnológico
* **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
* **Express**: Framework web para construir la API de forma rápida y organizada.
* **PostgreSQL**: Sistema de gestión de bases de datos relacional, potente y de código abierto.
* **pg**: Driver de Node.js para la conexión con la base de datos PostgreSQL.
* **bcryptjs**: Librería para el hasheo seguro de contraseñas.
* **jsonwebtoken (JWT)**: Para la creación y verificación de tokens de sesión.
* **CORS**: Middleware para habilitar el Cross-Origin Resource Sharing de forma segura.
* **dotenv**: Para la gestión de variables de entorno en el desarrollo local.

---
## Cómo Empezar (Desarrollo Local)

### Prerrequisitos
* Node.js (v16 o superior)
* Una instancia local de PostgreSQL instalada y corriendo.

### 1. Clonar el Repositorio
```bash
git clone [https://github.com/juandualibe/CherryMarket-Backend.git](https://github.com/juandualibe/CherryMarket-Backend.git)
cd CherryMarket-Backend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar la Base de Datos Local
Asegúrate de tener una base de datos creada en tu instancia local de PostgreSQL. Por ejemplo, `cherry_market_db`.

### 4. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto y añade las siguientes variables:

```
# URL de conexión para tu base de datos PostgreSQL local
DATABASE_URL="postgresql://TU_USUARIO_POSTGRES:TU_CONTRASEÑA@localhost:5432/cherry_market_db"

# Un secreto largo y aleatorio para firmar los tokens JWT
JWT_SECRET="TU_SECRETO_JWT_AQUI"
```

### 5. Iniciar el Servidor
```bash
npm start
```
El servidor se ejecutará en `http://localhost:5000`.

---
## Documentación de Endpoints de la API

### Autenticación
- `POST /api/auth/register` - **(Pública)** - Registra un nuevo usuario.
- `POST /api/auth/login` - **(Pública)** - Inicia sesión y devuelve un token JWT.

### Productos
- `GET /api/products` - **(Protegida)** - Obtiene la lista de todos los productos.
- `POST /api/products` - **(Protegida)** - Crea un nuevo producto.
- `PUT /api/products/:id` - **(Protegida)** - Actualiza un producto existente.
- `DELETE /api/products/:id` - **(Protegida)** - Elimina un producto.

### Ventas
- `GET /api/sales` - **(Protegida)** - Obtiene el historial completo de ventas con sus detalles.
- `POST /api/sales` - **(Protegida)** - Registra una nueva venta.

### Dashboard
- `GET /api/dashboard/stats` - **(Protegida)** - Obtiene las estadísticas para el dashboard (ventas del día, bajo stock).

### Reportes
- `GET /api/reports/sales-summary` - **(Protegida)** - Obtiene un resumen de ventas agrupado por día dentro de un rango de fechas.
    - Query Params: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD).
