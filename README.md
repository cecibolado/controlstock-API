# ControlStock

Aplicación de control de inventario con backend Express/MongoDB y frontend React/TypeScript.

## Estructura

```text
backend/       API Express, controladores, modelos y rutas
frontend/      Aplicación React, páginas y configuración de Vite
.env           Configuración local de MongoDB y puertos (no subir al repositorio)
```

## Desarrollo

Instalá las dependencias desde la raíz del proyecto:

```bash
npm install
```

Configurá `.env` en la raíz:

```env
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@TU_CLUSTER/controlstock?retryWrites=true&w=majority
MONGODB_DB=controlstock
PORT=3000
```

Iniciá el backend y el frontend en dos terminales, desde la raíz:

```bash
npm run dev
npm run dev:front
```

Abrí `http://localhost:5173`. Vite envía las solicitudes `/api` al backend.

## Producción local

```bash
npm run build:front
npm start
```

El backend sirve el frontend compilado en `http://localhost:3000`.

## Páginas

- **Resumen:** métricas y productos con stock bajo.
- **Inventario:** búsqueda, filtros, paginación y edición de productos y stock.
- **Movimientos:** historial de las entradas y salidas registradas al ajustar stock.
- **Configuración:** nombre del espacio de trabajo y estado de conexión con la API.

El historial empieza a registrar movimientos cuando se ajusta stock con esta versión. Los ajustes anteriores no se guardaron y no se pueden reconstruir.
