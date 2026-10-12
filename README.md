# Managment Karting Backend

API REST para la gestión de un karting. Permite administrar personas, licencias, kartings, circuitos, reservas, torneos, carreras e inscripciones, con acceso controlado por roles.

Trabajo práctico para la facultad.

## Tecnologías

- Node.js 20.19 o superior
- TypeScript
- Express 5
- Prisma 7 con MariaDB/MySQL
- JWT para la autenticación
- Swagger para la documentación de la API
- Jest y Supertest para los tests

## Funcionalidades

- **Usuarios y roles**: registro, login y tres roles (`ADMIN`, `EMPLEADO`, `CLIENTE`). Cada ruta indica qué roles pueden usarla.
- **Licencias**: cada persona puede tener licencias de distinto nivel. El nivel determina qué kartings puede usar.
- **Kartings y circuitos**: alta y mantenimiento de kartings, tipos de karting (con su precio por hora) y circuitos (con su capacidad máxima).
- **Reservas**: un cliente reserva un karting en un circuito para una fecha y un horario. Se valida la licencia, la disponibilidad del karting y la capacidad del circuito, y se calcula el monto.
- **Torneos**: tienen fechas de inicio y fin y un cupo máximo de inscriptos.
- **Carreras**: pertenecen a un torneo, se corren en un circuito y usan uno o varios kartings.
- **Participaciones**: registran la posición final de cada piloto en una carrera y permiten armar la tabla general del torneo.

## Estructura

```
prisma/          schema, migraciones y seed
src/
  app.ts         configuración de Express y montaje de rutas
  server.ts      punto de entrada
  config/        conexión a Prisma y especificación OpenAPI
  entities/      un módulo por entidad (routes, controller, service, interface)
  middleware/    autenticación, roles y manejo de errores
  utils/         funciones de fechas y de ocupación de horarios
tests/           tests de rutas y de servicios
```

Cada entidad sigue el mismo esquema: la ruta recibe el pedido, el controller lee los datos, el service aplica las reglas de negocio y accede a la base mediante Prisma.

## Instalación

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar los valores:

   | Variable | Uso |
   |---|---|
   | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Conexión de la aplicación a la base |
   | `DATABASE_URL` | Conexión usada por Prisma para migraciones y seed |
   | `JWT_SECRET` | Clave para firmar los tokens |
   | `FRONTEND_URL` | Origen permitido por CORS |
   | `SEED_ADMIN_MAIL`, `SEED_ADMIN_PASSWORD` | Usuario administrador inicial (contraseña de al menos 8 caracteres) |

3. Crear las tablas y cargar los datos iniciales (roles y usuario administrador):

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

## Ejecución

```bash
npm run dev
```

El servidor queda en `http://localhost:3000`.

La documentación de la API está en `http://localhost:3000/api-docs`.

Para producción:

```bash
npm run build
npm start
```

## Autenticación

`POST /api/auth/register` crea un usuario con rol `CLIENTE`, y `POST /api/auth/login` devuelve un token. El resto de las rutas exige ese token en el header:

```
Authorization: Bearer <token>
```

Los usuarios `EMPLEADO` los crea un administrador.

## Tests

Los tests de rutas usan servicios mockeados y los de servicios usan Prisma mockeado, así que no hace falta tener la base levantada.

```bash
npm test -- --runInBand --forceExit
```

Para correr un solo archivo:

```bash
npx jest tests/reserva.service.test.ts --runInBand --forceExit
```

Antes de subir cambios conviene correr también `npm run build` para verificar que compile.
