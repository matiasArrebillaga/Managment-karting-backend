# Documentación del proyecto — Management Karting

**Materia:** Desarrollo de Software (DSW)  
**Proyecto:** Management Karting  
**Estado:** En desarrollo

## 1. Propuesta y alcance

Management Karting es una aplicación web full stack para la gestión de un karting. Permite administrar personas, licencias, kartings, circuitos, reservas, torneos, carreras e inscripciones, con acceso controlado según los roles de usuario.

El proyecto se desarrolla como trabajo práctico grupal de la materia Desarrollo de Software. El frontend y el backend son componentes independientes que se comunican mediante una API.

- **Propuesta actualizada:** https://github.com/MirkoRecchi/Kartings-Management/blob/main/proposal.md

## 2. Repositorios y Pull Requests

- **Repositorio backend:** https://github.com/matiasArrebillaga/Managment-karting-backend
- **Pull Request del backend para la entrega:** [Agregar URL]
- **Repositorio frontend:** https://github.com/matiasArrebillaga/Managment-karting-frontend
- **Pull Request del frontend para la entrega:** [Agregar URL]

## 3. Tecnologías utilizadas

### Backend

- Node.js 20.19 o superior.
- TypeScript.
- Express 5.
- Prisma 7 con MariaDB/MySQL.
- JWT para autenticación.
- Swagger para documentación de la API.
- Jest y Supertest para pruebas automatizadas.

### Frontend

- **Framework y tecnologías:** React 19 + TypeScript, Vite, MUI (Material UI) y React Router.
- **Guía de estilo:** se usa oxlint como linter en lugar de la guía de Airbnb sugerida por el enunciado.
- **Documentación del frontend:** [Agregar enlace al repositorio o README].

## 4. Funcionalidades principales

- **Usuarios y roles:** registro, inicio de sesión y tres roles (`ADMIN`, `EMPLEADO` y `CLIENTE`). Las rutas tienen acceso restringido según los permisos correspondientes.
- **Licencias:** cada persona puede tener licencias de distintos niveles, que determinan qué kartings puede utilizar.
- **Kartings y circuitos:** alta y mantenimiento de kartings, tipos de karting con precio por hora y circuitos con capacidad máxima.
- **Reservas:** permite reservar un karting en un circuito para una fecha y horario. Se valida la licencia del cliente, la disponibilidad del karting y la capacidad del circuito, y se calcula el monto.
- **Torneos:** administración de fechas de inicio y fin y del cupo máximo de inscriptos.
- **Carreras:** pertenecen a un torneo, se realizan en un circuito y utilizan uno o varios kartings.
- **Participaciones:** registran la posición final de cada piloto en una carrera y permiten construir la tabla general del torneo.

## 5. Documentación técnica del backend

### 5.1. Arquitectura

El backend está organizado por capas y módulos por entidad.

- **Routes:** definen los endpoints disponibles.
- **Controllers:** reciben las solicitudes y gestionan los datos de entrada.
- **Services:** implementan las reglas de negocio y acceden a la base de datos mediante Prisma.
- **Interfaces y tipos:** describen las estructuras de datos utilizadas por los módulos.
- **Middlewares:** gestionan la autenticación, la autorización por roles y el manejo de errores.

### 5.2. Estructura del proyecto

```text
prisma/          schema, migraciones y seed
src/
  app.ts         configuración de Express y montaje de rutas
  server.ts      punto de entrada
  config/        conexión a Prisma y especificación OpenAPI
  entities/      módulos por entidad
                 (routes, controller, service, interface)
  middleware/    autenticación, roles y manejo de errores
  utils/         funciones de fechas y ocupación de horarios
tests/           tests de rutas y servicios
```

### 5.3. Instalación y ejecución

Consultar el README principal del backend para las instrucciones completas: [README del backend](../README.md).

Requisitos previos:

- Node.js 20.19 o superior.
- MariaDB o MySQL.
- npm.

Instalar las dependencias:

```bash
npm install
```

Copiar `.env.example` a `.env` y completar las variables de entorno:

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de la base de datos |
| `DB_PORT` | Puerto de la base de datos |
| `DB_USERNAME` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `DB_DATABASE` | Nombre de la base de datos |
| `DATABASE_URL` | Conexión utilizada por Prisma |
| `JWT_SECRET` | Clave para firmar los tokens |
| `FRONTEND_URL` | Origen permitido por CORS |
| `SEED_ADMIN_MAIL` | Correo del administrador inicial |
| `SEED_ADMIN_PASSWORD` | Contraseña del administrador inicial, de al menos 8 caracteres |

Crear las tablas y cargar los datos iniciales:

```bash
npx prisma migrate dev
npx prisma db seed
```

Iniciar el servidor en desarrollo:

```bash
npm run dev
```

Por defecto, el servidor queda disponible en:

`http://localhost:3000`

Para compilar y ejecutar en producción:

```bash
npm run build
npm start
```

### 5.4. Autenticación y autorización

El sistema utiliza JWT para autenticar a los usuarios y roles para controlar el acceso a las rutas.

- `POST /api/auth/register`: registra un usuario con rol `CLIENTE`.
- `POST /api/auth/login`: inicia sesión y devuelve un token JWT.
- Las rutas protegidas requieren el encabezado:

```http
Authorization: Bearer <token>
```

- Los usuarios con rol `EMPLEADO` son creados por un administrador.
- Los permisos de acceso dependen del rol requerido por cada ruta.

### 5.5. Documentación de la API

- **Swagger local:** `http://localhost:3000/api-docs`
- **Swagger del entorno desplegado:** [Agregar URL cuando esté disponible].

## 6. Gestión y seguimiento del proyecto

El desarrollo debe contar con seguimiento de tareas, funcionalidades, errores y reuniones del equipo, de acuerdo con los requisitos de la materia.

- **Metodología de trabajo:** [Completar con la metodología utilizada].
- **Tablero de Jira:** [Agregar enlace al tablero de seguimiento de features y bugs].
- **Minutas de reuniones:** [Agregar enlace a la carpeta o documentos].
- **Seguimiento de entregas:** [Agregar enlace, si corresponde].

### 6.1. Minutas

- [Fecha de reunión]: [Enlace a la minuta].
- [Fecha de reunión]: [Enlace a la minuta].
- [Fecha de reunión]: [Enlace a la minuta].

Las minutas deben registrar los avances, las decisiones tomadas y los acuerdos de coordinación del equipo.

## 7. Evidencias de pruebas automatizadas

### 7.1. Backend

Los tests de rutas utilizan servicios mockeados y los tests de servicios utilizan Prisma mockeado. Por lo tanto, no es necesario tener la base de datos levantada para ejecutar estos tests.

Ejecutar todos los tests:

```bash
npm test -- --runInBand --forceExit
```

Ejecutar un archivo específico:

```bash
npx jest tests/reserva.service.test.ts --runInBand --forceExit
```

Verificar la compilación antes de subir cambios:

```bash
npm run build
```

Evidencias:

- **Resultado de ejecución de tests:** [Agregar enlace a captura o log].
- **GitHub Actions:** [workflow "Tests y Build"](https://github.com/matiasArrebillaga/Managment-karting-backend/actions/workflows/test.yml), corre los tests y el build en cada push y PR a `develop`.
- **Resultado de compilación:** [Agregar evidencia, si corresponde].

### 7.2. Frontend

- **Tests unitarios de componentes:** [Agregar enlace a la evidencia].
- **Test end-to-end:** [Agregar enlace a la evidencia].
- **Resultado de ejecución de tests del frontend:** [Agregar captura o log].

Las evidencias deben corresponder a ejecuciones reales de las pruebas.

## 8. Entorno de demostración y entrega

- **URL del deploy:** [Agregar enlace al sistema desplegado].
- **Video de demostración:** [Agregar enlace al video].
- **Swagger desplegado:** [Agregar enlace].
- **Credenciales de prueba:** [Indicar cómo obtenerlas de forma segura].
- **Contacto para coordinar la defensa:** [Completar según las indicaciones de la cátedra].

Para la instancia de aprobación, el enunciado de la materia solicita, entre otros elementos, un video explicativo del sistema, documentación de la API, evidencias de tests automatizados, enlaces de deploy, credenciales para utilizar la aplicación desplegada y la propuesta actualizada con los Pull Requests correspondientes.

No publicar contraseñas reales ni secretos en un repositorio público.

## 9. Evidencias responsive — KAN-70

Incorporar capturas del frontend real después de finalizar el rediseño de la interfaz.

Las capturas deben demostrar la adaptación de la aplicación a los anchos de pantalla solicitados.

**Ubicación:** `docs/evidencias/responsive/`

### 9.1. Celular — 375 px

- [ ] Home: `home-375.png`
- [ ] Pantalla de gestión con tabla: `gestion-375.png`
- [ ] Menú móvil abierto: `menu-movil-375.png`
- [ ] Diálogo en celular: `dialogo-375.png`

### 9.2. Tablet — 768 px

- [ ] Home: `home-768.png`
- [ ] Pantalla de gestión con tabla: `gestion-768.png`

### 9.3. Escritorio — 1280 px

- [ ] Home: `home-1280.png`
- [ ] Pantalla de gestión con tabla: `gestion-1280.png`

Las imágenes deben obtenerse directamente de la aplicación implementada. No utilizar imágenes ilustrativas como evidencia del funcionamiento real.

## 10. Checklist de entrega

### Documentación y gestión

- [ ] Propuesta actualizada con los enlaces a los Pull Requests del backend y frontend.
- [ ] Tablero de Jira enlazado.
- [ ] Minutas de reuniones incorporadas o enlazadas.
- [ ] README principal del backend enlaza este documento.
- [ ] README principal del frontend enlaza esta documentación central.

### Backend

- [ ] Instrucciones de instalación y ejecución verificadas.
- [ ] API documentada con Swagger.
- [ ] Evidencia de ejecución de tests automatizados.
- [ ] Compilación verificada mediante `npm run build`.
- [ ] Autenticación y autorización por roles verificadas.

### Frontend

- [ ] Instrucciones de instalación y ejecución documentadas.
- [ ] Interfaz comprobada en los breakpoints solicitados.
- [ ] Evidencia de al menos un test unitario de componente.
- [ ] Evidencia de al menos un test end-to-end.
- [ ] Acceso a las distintas partes del frontend controlado según los roles.

### Demostración y aprobación

- [ ] Deploy accesible.
- [ ] Video de demostración disponible.
- [ ] Credenciales de prueba preparadas y compartidas de forma segura.
- [ ] Capturas responsive de KAN-70 incorporadas.
- [ ] Documentación preparada para la defensa oral.

---

**Última actualización:** [Completar fecha].


