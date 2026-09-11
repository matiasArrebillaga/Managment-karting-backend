# 🏎️ Managment Karting Backend

Este es el backend para el sistema de gestión de carreras de karting.

## ⚙️ Setup y Ejecución

*   **Node.js:** Se requiere una versión estable (recomendada: 18+).
*   **npm o yarn:** El gestor de paquetes asociado a Node.js.

**Verificación:** Asegúrate de tener Node.js y npm instalados. Ejecuta `node -v` y `npm -v` para confirmar la versión.

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Base de Datos (Prisma):**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Ejecutar el servidor:**
   ```bash
   npm run dev
   ```

4. **Mirar la documentacion:**
http://localhost:3000/api-docs/
