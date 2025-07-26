
# 🍒 Cherry Market - Panel de Administración (Frontend)

Bienvenido al frontend de **Cherry Market**, una aplicación de página única (SPA) diseñada para la gestión eficiente de un punto de venta (POS) y el control de inventario. Construida con **React** y **Material-UI**, esta interfaz ofrece una experiencia de usuario moderna, profesional, completamente responsiva y optimizada para entornos comerciales. Este proyecto se integra con una API RESTful backend para proporcionar funcionalidades robustas y seguras.

## 🚀 Live Demo
- **Frontend Desplegado en Vercel**: [https://cherry-market-frontend.vercel.app](https://cherry-market-frontend.vercel.app)
- **Backend Desplegado en Render**: [https://cherry-market-api.onrender.com](https://cherry-market-api.onrender.com)
- **Nota**: El backend utiliza un plan gratuito en Render, lo que puede causar una demora inicial de ~30 segundos en la primera solicitud del día mientras el servidor "despierta".

## 🎯 Características Principales
Cherry Market ofrece un flujo de usuario completo, desde la autenticación hasta la gestión avanzada de ventas e inventario, con un enfoque en usabilidad y rendimiento.

### 1. Autenticación y Gestión de Sesiones
- **Página de Registro (`/register`)**: Permite a nuevos usuarios crear cuentas con un nombre de usuario y contraseña. Las credenciales se envían de forma segura al backend para su almacenamiento encriptado.
- **Página de Inicio de Sesión (`/login`)**: Autentica a los usuarios mediante tokens **JWT** (JSON Web Tokens), garantizando sesiones seguras. Incluye funcionalidad para mostrar/ocultar la contraseña.
- **Sesión Persistente**: Utiliza `localStorage` para mantener la sesión activa, permitiendo a los usuarios permanecer autenticados al refrescar la página o cerrar el navegador.
- **Rutas Protegidas**: Las rutas del panel de administración (`/dashboard`, `/pos`, `/management`, `/history`, `/categories`) están protegidas, redirigiendo a usuarios no autenticados a `/login`.
- **Autorización por Roles**: Los usuarios con rol `admin` tienen acceso a funciones exclusivas (gestión de productos, historial de ventas, gestión de categorías), mientras que los usuarios con rol `cashier` están limitados al dashboard y al punto de venta.

### 2. Diseño y Navegación
- **Layout Responsivo**: Implementado con **Material-UI**, el diseño se adapta a cualquier dispositivo. En escritorio, muestra un menú lateral fijo; en móviles, un menú "hamburger" optimiza el espacio.
- **Navegación Fluida**: Utiliza **React Router DOM** para gestionar rutas dinámicas con URLs limpias (ej. `/dashboard`, `/pos`).
- **Tema Personalizado**: Un tema global de Material-UI asegura una paleta de colores consistente y una experiencia visual profesional.
- **Notificaciones**: **React Toastify** muestra alertas amigables para acciones como registro de ventas, errores o actualizaciones exitosas.

### 3. Dashboard Interactivo (`/dashboard`)
- **Estadísticas en Tiempo Real**: Muestra métricas clave como:
  - Ventas totales del día.
  - Cantidad de productos con bajo stock (<10 unidades).
- **Gráfico de Ventas (Admin)**: Un gráfico de barras generado con **Recharts** visualiza las ventas diarias de la última semana, exclusivo para administradores.
- **Top 5 Productos Vendidos**: Lista los productos más vendidos, con datos actualizados desde el backend.

### 4. Punto de Venta (`/pos`)
- **Catálogo de Productos**: Muestra todos los productos disponibles con:
  - Búsqueda en tiempo real por nombre o categoría.
  - Visualización en tarjetas con nombre, precio, stock y categoría.
- **Carrito de Compras Dinámico**:
  - Añade productos al carrito con validación de stock.
  - Permite modificar cantidades o eliminar ítems.
  - Soporta ítems manuales (sin ID de producto) con nombre, precio y cantidad personalizados.
  - Calcula el total de la venta en tiempo real.
- **Calculadora Integrada**: Una calculadora interactiva permite realizar cálculos rápidos, con soporte para operaciones básicas, porcentajes y cambio de signo, controlada por teclado o botones.
- **Finalización de Ventas**: Registra la venta en el backend, actualiza el stock y notifica al usuario del éxito de la operación.

### 5. Gestión de Inventario (`/management`)
- **CRUD Completo**: Permite crear, leer, actualizar y eliminar productos (exclusivo para administradores).
- **Formulario Modal**: La creación y edición de productos se realiza en un modal intuitivo con campos para nombre, precio, stock, código de barras y categoría.
- **Validaciones**: Garantiza que los campos obligatorios (nombre y precio) estén completos antes de enviar la solicitud al backend.

### 6. Gestión de Categorías (`/categories`)
- **CRUD de Categorías**: Permite crear, editar, actualizar y eliminar categorías de productos (exclusivo para administradores).
- **Interfaz de Lista**: Muestra todas las categorías con opciones para editar o eliminar directamente desde la lista.
- **Notificaciones**: Informa al usuario sobre acciones exitosas o errores (ej. categoría duplicada).

### 7. Historial de Ventas (`/history`)
- **Lista de Ventas**: Muestra todas las transacciones con detalles como ID, fecha y total (exclusivo para administradores).
- **Filtro por Rango de Fechas**: Utiliza selectores de fecha de **Material-UI** para consultar ventas en un período específico.
- **Detalles Expandibles**: Cada venta incluye un acordeón que muestra los ítems vendidos, sus cantidades y precios.

## 🛠️ Stack Tecnológico
| Tecnología         | Descripción                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **React**          | Librería para construir la interfaz de usuario.                             |
| **React Router DOM** | Gestión de rutas y navegación.                                             |
| **Material-UI**    | Componentes de UI responsivos y personalizables.                           |
| **Axios**          | Cliente HTTP para interactuar con la API backend.                           |
| **Recharts**       | Creación de gráficos interactivos en el dashboard.                         |
| **React Toastify** | Notificaciones amigables para el usuario.                                  |
| **date-fns**       | Manejo y formateo de fechas en selectores y reportes.                      |
| **JWT Decode**     | Decodificación de tokens JWT para gestionar roles y autenticación.         |

## 🛠️ Instalación y Ejecución (Desarrollo Local)
### Prerrequisitos
- **Node.js** (v16 o superior)
- **npm** (incluido con Node.js)
- Acceso al backend de Cherry Market (local o desplegado)

### Pasos
1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/juandualibe/CherryMarket-Frontend.git
   cd CherryMarket-Frontend
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**  
   Crea un archivo `.env` en la raíz del proyecto con la siguiente variable:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```
   Ajusta `REACT_APP_API_URL` según la URL del backend (local o desplegado).

4. **Iniciar la Aplicación**
   ```bash
   npm start
   ```
   La aplicación se ejecutará en [http://localhost:3000](http://localhost:3000).

5. **Compilar para Producción**
   ```bash
   npm run build
   ```
   Genera una versión optimizada en la carpeta `build`.

### Estructura de Carpetas
```plaintext
├── public/                # Archivos estáticos públicos
├── src/                   # Código fuente
│   ├── assets/            # Recursos estáticos (ej. logo)
│   ├── components/        # Componentes reutilizables
│   │   ├── categories/    # Componentes para gestión de categorías
│   │   ├── common/        # Componentes compartidos (ej. Layout)
│   │   ├── products/      # Componentes para gestión de productos
│   │   ├── sales/         # Componentes para el punto de venta
│   │   ├── ui/            # Componentes de UI genéricos (ej. Calculator)
│   ├── pages/             # Páginas principales (ej. Dashboard, PosView)
│   ├── services/          # Servicios de API (ej. api.js)
│   ├── theme/             # Configuración del tema de Material-UI
│   ├── App.js             # Componente raíz con enrutamiento
│   ├── index.js           # Punto de entrada de la aplicación
├── .env                   # Variables de entorno
├── package.json           # Dependencias y scripts
├── README.md              # Documentación del proyecto
```

### Notas y Mejoras Futuras
- **Optimización de Performance**: Implementar lazy loading para componentes pesados.  
- **Filtros Avanzados**: Añadir filtros adicionales en el historial de ventas (ej. por producto o categoría).  
- **Testing**: Incorporar pruebas unitarias con Jest y React Testing Library.  
- **Internacionalización**: Soporte para múltiples idiomas usando i18n.

## 🤝 Contribuir
1. Haz un fork del repositorio.  
2. Crea una rama para tu feature  
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y haz commit  
   ```bash
   git commit -m "Añade nueva funcionalidad"
   ```
4. Sube los cambios  
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un Pull Request en GitHub.

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

## 📬 Contacto
Desarrollado por Juan Dualibe. Para consultas, contáctame en [juandualibe@gmail.com](mailto:juandualibe@gmail.com).
