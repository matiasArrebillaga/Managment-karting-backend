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

5.**Conectar al frontend**
Esta listo para conectarse al frontend, por default usa el port 3000

## 🧪 Tests de rutas y CRUD

El proyecto utiliza **Jest** como ejecutor de pruebas y **Supertest** para simular peticiones HTTP contra Express.

Las pruebas actuales cubren las rutas de las entidades, incluyendo:

- Autenticación mediante tokens JWT.
- Restricciones de acceso por rol.
- Respuestas `401` cuando no se envía token.
- Operaciones `GET`, `POST`, `PATCH`/`PUT` y `DELETE`.
- Entidades con claves primarias compuestas.
- Registro y login.

### Instalar las dependencias

Si todavía no se instalaron las dependencias del proyecto, ejecuta:

```bash
npm install
```

Jest, Supertest y sus tipos ya están declarados en `devDependencies`, por lo que no es necesario instalarlos manualmente por separado.

### Ejecutar todos los tests

Desde la raíz del proyecto:

```bash
npm test -- --runInBand --forceExit
```

También puede utilizarse directamente:

```bash
npx jest --runInBand --forceExit
```

`--runInBand` ejecuta las pruebas una detrás de otra y facilita el diagnóstico de errores. `--forceExit` se utiliza porque la inicialización actual de Prisma puede dejar una conexión abierta al finalizar Jest.

Una ejecución exitosa muestra un resultado similar a:

```text
Test Suites: 2 passed, 2 total
Tests:       57 passed, 57 total
```

### Ejecutar una suite específica

Suite general de entidades:

```bash
npx jest tests/entities.routes.test.ts --runInBand --forceExit
```

Suite de circuitos:

```bash
npx jest src/entities/circuito/circuito.test.ts --runInBand --forceExit
```

### Ejecutar tests por nombre

Para ejecutar solamente un grupo de pruebas:

```bash
npx jest -t "autenticación" --runInBand --forceExit
```

Por ejemplo, para probar el acceso sin token:

```bash
npx jest -t "sin token" --runInBand --forceExit
```

### Ejecutar tests automáticamente al guardar cambios

```bash
npx jest --watch
```

Para detener el modo observación, presiona `Ctrl + C`.

### Base de datos y datos de prueba

Las pruebas de rutas utilizan servicios y Prisma mockeados. Esto significa que:

- No es necesario tener MariaDB encendida para ejecutar esta suite.
- No se crean registros reales.
- No se modifican ni eliminan datos de la base de datos.
- Los tokens JWT se generan automáticamente durante las pruebas.
- Los roles se prueban mediante tokens con distintos valores (`ADMIN`, `EMPLEADO` y `CLIENTE`).

La configuración se encuentra en [jest.config.ts](./jest.config.ts), y la suite general en [tests/entities.routes.test.ts](./tests/entities.routes.test.ts).

### Cómo se simula la autenticación

Cada test que necesita autenticación genera un token de prueba:

```ts
const token = jwt.sign(
    { idPersona: 1, mail: "test@test.com", rol: "ADMIN" },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
);
```

Luego lo envía como lo haría el frontend:

```ts
.set("Authorization", `Bearer ${token}`)
```

El archivo `tests/env.setup.ts` define una clave JWT de prueba si no existe una variable `JWT_SECRET`.

### Agregar una nueva prueba

Para agregar una prueba:

1. Crea un archivo con extensión `.test.ts` dentro de `tests/` o junto a la entidad.
2. Importa explícitamente la API de Jest:

   ```ts
   import { describe, expect, it, jest } from "@jest/globals";
   ```

3. Importa `request` desde Supertest y la instancia `app`:

   ```ts
   import request from "supertest";
   import app from "../src/app";
   ```

4. Mockea el servicio o dependencia que no quieras ejecutar contra la base real:

   ```ts
   jest.mock("../src/entities/miEntidad/miEntidad.service");
   ```

5. Ejecuta nuevamente la suite:

   ```bash
   npx jest tests/mi-entidad.test.ts --runInBand --forceExit
   ```

### Validación antes de subir cambios

Antes de crear un pull request, ejecuta:

```bash
npm test -- --runInBand --forceExit
npm run build
```

El primer comando verifica el comportamiento de las rutas y el segundo confirma que el código TypeScript compile correctamente.
