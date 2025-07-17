# 🍒 Cherry Market - Backend

Este es el backend de la aplicación de punto de venta y gestión de inventario para Cherry Market. Proporciona una API RESTful para manejar productos, ventas y autenticación.

## Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework para construir la API.
- **MySQL2**: Driver para la conexión con la base de datos MySQL.
- **CORS**: Middleware para habilitar el Cross-Origin Resource Sharing.
- **dotenv**: Para manejar variables de entorno.

---

## Cómo Empezar

### Prerrequisitos
- Node.js (v16 o superior)
- Una instancia de base de datos MySQL

### Instalación y Ejecución
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
    ```
2.  **Navegar a la carpeta del backend:**
    ```bash
    cd tu-repositorio/backend
    ```
3.  **Instalar dependencias:**
    ```bash
    npm install
    ```
4.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz de la carpeta `backend` y añade la siguiente variable con la URL de tu base de datos local:
    ```
    DATABASE_URL="mysql://tu_usuario:tu_contraseña@localhost:3306/cherry_market_db"
    ```
5.  **Iniciar el servidor:**
    ```bash
    npm start
    ```
El servidor se ejecutará en `http://localhost:5000`.

---

## Endpoints de la API

### Productos
- `GET /api/products`: Obtiene la lista de todos los productos.
- `POST /api/products`: Crea un nuevo producto.
- `PUT /api/products/:id`: Actualiza un producto existente.
- `DELETE /api/products/:id`: Elimina un producto.

### Ventas
- `POST /api/sales`: Registra una nueva venta y actualiza el stock de los productos.
