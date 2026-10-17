import swaggerJSDoc from "swagger-jsdoc";

const jsonRequest = (schema: string) => ({
    required: true,
    content: {
        "application/json": {
            schema: { $ref: `#/components/schemas/${schema}` }
        }
    }
});

const idParameter = (name: string, description: string) => ({
    name,
    in: "path",
    required: true,
    description,
    schema: { type: "integer", format: "int32" }
});

const standardResponses = (resource: string) => ({
    "200": {
        description: `${resource} obtenido correctamente`
    },
    "404": {
        description: `${resource} no encontrado`,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
            }
        }
    },
    "500": {
        description: "Error interno del servidor",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
            }
        }
    }
});

const paths: Record<string, object> = {
    "/": {
        get: {
            tags: ["Sistema"],
            summary: "Verificar disponibilidad de la API",
            security: [],
            responses: {
                "200": {
                    description: "API disponible",
                    content: {
                        "text/plain": {
                            schema: { type: "string", example: "API funcionando" }
                        }
                    }
                }
            }
        }
    },
    "/api/auth/register": {
        post: {
            tags: ["Autenticación"],
            summary: "Registrar una persona",
            security: [],
            requestBody: jsonRequest("RegisterRequest"),
            responses: {
                "201": {
                    description: "Persona registrada correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Persona" }
                        }
                    }
                },
                "400": {
                    description: "Datos inválidos",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" }
                        }
                    }
                }
            }
        }
    },
    "/api/auth/login": {
        post: {
            tags: ["Autenticación"],
            summary: "Iniciar sesión",
            security: [],
            requestBody: jsonRequest("LoginRequest"),
            responses: {
                "200": {
                    description: "Inicio de sesión correcto",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/AuthResponse" }
                        }
                    }
                },
                "401": {
                    description: "Credenciales inválidas",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" }
                        }
                    }
                }
            }
        }
    }
};

const crudResources: Array<{
    path: string;
    tag: string;
    resource: string;
    schema: string;
    requestSchema: string;
}> = [
    { path: "/api/kartings", tag: "Kartings", resource: "Karting", schema: "Karting", requestSchema: "KartingRequest" },
    { path: "/api/personas", tag: "Personas", resource: "Persona", schema: "Persona", requestSchema: "PersonaRequest" },
    { path: "/api/localidades", tag: "Localidades", resource: "Localidad", schema: "Localidad", requestSchema: "LocalidadRequest" },
    { path: "/api/circuitos", tag: "Circuitos", resource: "Circuito", schema: "Circuito", requestSchema: "CircuitoRequest" },
    { path: "/api/roles", tag: "Roles", resource: "Rol", schema: "Rol", requestSchema: "RolRequest" },
    { path: "/api/tiposLicencias", tag: "Tipos de licencias", resource: "Tipo de licencia", schema: "TipoLicencia", requestSchema: "TipoLicenciaRequest" },
    { path: "/api/tiposKartings", tag: "Tipos de karting", resource: "Tipo de karting", schema: "TipoKarting", requestSchema: "TipoKartingRequest" },
    { path: "/api/torneos", tag: "Torneos", resource: "Torneo", schema: "Torneo", requestSchema: "TorneoRequest" },
    { path: "/api/licencias", tag: "Licencias", resource: "Licencia", schema: "Licencia", requestSchema: "LicenciaRequest" },
    { path: "/api/reservas", tag: "Reservas", resource: "Reserva", schema: "Reserva", requestSchema: "ReservaRequest" }
];

for (const resource of crudResources) {
    paths[resource.path] = {
        get: {
            tags: [resource.tag],
            summary: `Obtener todos los registros de ${resource.resource.toLowerCase()}`,
            responses: {
                "200": {
                    description: "Registros obtenidos correctamente",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: { $ref: `#/components/schemas/${resource.schema}` }
                            }
                        }
                    }
                },
                "500": standardResponses(resource.resource)["500"]
            }
        },
        post: {
            tags: [resource.tag],
            summary: `Crear ${resource.resource.toLowerCase()}`,
            requestBody: jsonRequest(resource.requestSchema),
            responses: {
                "201": {
                    description: "Registro creado correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.schema}` }
                        }
                    }
                },
                "400": { description: "Datos inválidos" },
                "500": standardResponses(resource.resource)["500"]
            }
        }
    };

    paths[`${resource.path}/{id}`] = {
        parameters: [idParameter("id", `Identificador del ${resource.resource.toLowerCase()}`)],
        get: {
            tags: [resource.tag],
            summary: `Obtener ${resource.resource.toLowerCase()} por ID`,
            responses: {
                "200": {
                    description: "Registro obtenido correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.schema}` }
                        }
                    }
                },
                "404": standardResponses(resource.resource)["404"],
                "500": standardResponses(resource.resource)["500"]
            }
        },
        patch: {
            tags: [resource.tag],
            summary: `Actualizar ${resource.resource.toLowerCase()}`,
            requestBody: jsonRequest(resource.requestSchema),
            responses: {
                "200": {
                    description: "Registro actualizado correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.schema}` }
                        }
                    }
                },
                "404": standardResponses(resource.resource)["404"],
                "500": standardResponses(resource.resource)["500"]
            }
        },
        delete: {
            tags: [resource.tag],
            summary: `Eliminar ${resource.resource.toLowerCase()}`,
            responses: {
                "200": {
                    description: "Registro eliminado correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Message" }
                        }
                    }
                },
                "404": standardResponses(resource.resource)["404"],
                "500": standardResponses(resource.resource)["500"]
            }
        }
    };
}

const compositeResources = [
    {
        path: "/api/carreras",
        tag: "Carreras",
        resource: "Carrera",
        schema: "Carrera",
        requestSchema: "CarreraRequest",
        keys: ["fechaCarrera", "Torneos_idTorneos", "Circuitos_idCircuitos"]
    },
    {
        path: "/api/participaciones",
        tag: "Participaciones",
        resource: "Participación",
        schema: "Participacion",
        requestSchema: "ParticipacionRequest",
        keys: ["Carrera_fecha", "Carrera_Torneos_idTorneos", "Carrera_Circuitos_idCircuitos", "Personas_idPersona"]
    },
    {
        path: "/api/inscripciones",
        tag: "Inscripciones",
        resource: "Inscripción",
        schema: "Inscripcion",
        requestSchema: "InscripcionRequest",
        keys: ["Torneos_idTorneos", "Personas_idPersona"]
    }
];

for (const resource of compositeResources) {
    const keyPath = resource.keys.map((key) => `{${key}}`).join("/");
    const fullPath = `${resource.path}/${keyPath}`;
    const parameters = resource.keys.map((key) => ({
        name: key,
        in: "path",
        required: true,
        schema: key.toLowerCase().includes("fecha") ? { type: "string", format: "date" } : { type: "integer", format: "int32" }
    }));

    paths[resource.path] = {
        get: {
            tags: [resource.tag],
            summary: `Obtener todas las ${resource.resource.toLowerCase()}s`,
            responses: {
                "200": {
                    description: "Registros obtenidos correctamente",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: { $ref: `#/components/schemas/${resource.schema}` }
                            }
                        }
                    }
                }
            }
        },
        post: {
            tags: [resource.tag],
            summary: `Crear ${resource.resource.toLowerCase()}`,
            requestBody: jsonRequest(resource.requestSchema),
            responses: {
                "201": {
                    description: "Registro creado correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.schema}` }
                        }
                    }
                }
            }
        }
    };

    paths[fullPath] = {
        parameters,
        get: {
            tags: [resource.tag],
            summary: `Obtener ${resource.resource.toLowerCase()} por clave compuesta`,
            responses: {
                "200": {
                    description: "Registro obtenido correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.schema}` }
                        }
                    }
                },
                "404": standardResponses(resource.resource)["404"]
            }
        },
        put: {
            tags: [resource.tag],
            summary: `Actualizar ${resource.resource.toLowerCase()}`,
            requestBody: jsonRequest(resource.requestSchema),
            responses: {
                "200": {
                    description: "Registro actualizado correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.schema}` }
                        }
                    }
                }
            }
        },
        delete: {
            tags: [resource.tag],
            summary: `Eliminar ${resource.resource.toLowerCase()}`,
            responses: {
                "200": {
                    description: "Registro eliminado correctamente",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Message" }
                        }
                    }
                }
            }
        }
    };
}

// Las inscripciones son el unico recurso compuesto sin update: con la fecha y la hora puestas
// por el servidor no queda ningun campo modificable.
delete (paths["/api/inscripciones/{Torneos_idTorneos}/{Personas_idPersona}"] as Record<string, unknown>).put;

paths["/api/inscripciones/mias"] = {
    get: {
        tags: ["Inscripciones"],
        summary: "Obtener las inscripciones de la persona autenticada",
        description: "Devuelve solo las inscripciones del usuario del token, con el torneo incluido. Es la vía para que un CLIENTE vea en qué torneos está anotado sin poder listar las de todos.",
        responses: {
            "200": {
                description: "Inscripciones propias obtenidas correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Inscripcion" }
                        }
                    }
                }
            },
            "500": standardResponses("Inscripción")["500"]
        }
    }
};

paths["/api/inscripciones/torneo/{idTorneo}"] = {
    get: {
        tags: ["Inscripciones"],
        summary: "Obtener los inscriptos de un torneo",
        description: "Devuelve id, nombre y apellido de cada persona inscripta, en orden de inscripción. Lo pueden ver todos los roles.",
        parameters: [{ name: "idTorneo", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
            "200": {
                description: "Inscriptos obtenidos correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: { idPersona: { type: "integer" }, nombre: { type: "string" }, apellido: { type: "string" } }
                            }
                        }
                    }
                }
            },
            "500": standardResponses("Inscripción")["500"]
        }
    }
};

paths["/api/carreras/torneo/{idTorneo}"] = {
    get: {
        tags: ["Carreras"],
        summary: "Obtener carreras por torneo",
        parameters: [{
            name: "idTorneo",
            in: "path",
            required: true,
            description: "Identificador del torneo",
            schema: { type: "integer", format: "int32" }
        }],
        responses: {
            "200": {
                description: "Carreras del torneo obtenidas correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Carrera" }
                        }
                    }
                }
            },
            "404": standardResponses("Carrera")["404"],
            "500": standardResponses("Carrera")["500"]
        }
    }
};

paths["/api/reservas/mias"] = {
    get: {
        tags: ["Reservas"],
        summary: "Obtener las reservas de la persona autenticada",
        description: "Devuelve solo las reservas del usuario del token. Es la vía para que un CLIENTE vea lo suyo sin poder listar las de todos.",
        responses: {
            "200": {
                description: "Reservas propias obtenidas correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Reserva" }
                        }
                    }
                }
            },
            "500": standardResponses("Reserva")["500"]
        }
    }
};

paths["/api/participaciones/carrera"] = {
    post: {
        tags: ["Participaciones"],
        summary: "Cargar la clasificación completa de una carrera",
        description: "EMPLEADO/ADMIN. Todo o nada: posiciones exactamente de 1 a N, todos inscriptos en el torneo y la carrera ya terminada. Los puntos los calcula el servidor (escala 25-18-15-12-10-8-6-4-2-1). Si la carrera ya tiene resultados responde 409.",
        requestBody: jsonRequest("ResultadosCarreraRequest"),
        responses: {
            "201": {
                description: "Clasificación cargada, ordenada por posición",
                content: {
                    "application/json": {
                        schema: { type: "array", items: { $ref: "#/components/schemas/Participacion" } }
                    }
                }
            },
            "400": { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": standardResponses("Carrera")["404"],
            "409": { description: "La carrera ya tiene resultados", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": standardResponses("Participación")["500"]
        }
    }
};

// El listado de torneos generico + filtros por estado (derivado de las fechas) y por tipo de licencia
(paths["/api/torneos"] as { get: { parameters?: object[] } }).get.parameters = [{
    name: "estado",
    in: "query",
    required: false,
    description: "Filtra por estado calculado contra el día de hoy",
    schema: { type: "string", enum: ["proximo", "en_curso", "finalizado"] }
}, {
    name: "idTipoLicencia",
    in: "query",
    required: false,
    description: "Filtra por tipo de licencia del torneo. Se puede combinar con estado",
    schema: { type: "integer" }
}];

paths["/api/participaciones/carrera/{Carrera_fecha}/{Carrera_Torneos_idTorneos}/{Carrera_Circuitos_idCircuitos}"] = {
    get: {
        tags: ["Participaciones"],
        summary: "Obtener la clasificación de una carrera",
        description: "Cualquier usuario logueado. Ordenada por posición; sin resultados cargados devuelve una lista vacía.",
        parameters: [
            { name: "Carrera_fecha", in: "path", required: true, schema: { type: "string", format: "date" } },
            idParameter("Carrera_Torneos_idTorneos", "Torneo de la carrera"),
            idParameter("Carrera_Circuitos_idCircuitos", "Circuito de la carrera")
        ],
        responses: {
            "200": {
                description: "Clasificación obtenida correctamente",
                content: {
                    "application/json": {
                        schema: { type: "array", items: { $ref: "#/components/schemas/ClasificacionCarreraItem" } }
                    }
                }
            },
            "404": standardResponses("Carrera")["404"],
            "500": standardResponses("Participación")["500"]
        }
    }
};

paths["/api/participaciones/torneo/{idTorneo}/tabla-general"] = {
    get: {
        tags: ["Participaciones"],
        summary: "Obtener la tabla general de un torneo",
        description: "Desempate F1: a igual puntaje gana quien tenga más 1° puestos, después más 2°, etc. Empate total comparte posición (1, 1, 3).",
        parameters: [{
            name: "idTorneo",
            in: "path",
            required: true,
            description: "Identificador del torneo",
            schema: { type: "integer", format: "int32" }
        }],
        responses: {
            "200": {
                description: "Tabla general obtenida correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TablaGeneralItem" }
                        }
                    }
                }
            },
            "404": standardResponses("Torneo")["404"],
            "500": standardResponses("Participación")["500"]
        }
    }
};

paths["/api/auth/localidades"] = {
    get: {
        tags: ["Autenticación"],
        summary: "Listar localidades (pública)",
        description: "Sin token: el formulario de registro necesita las localidades antes de que la persona tenga sesión.",
        security: [],
        responses: {
            "200": {
                description: "Localidades obtenidas correctamente",
                content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Localidad" } } } }
            },
            "500": standardResponses("Localidad")["500"]
        }
    }
};

paths["/api/personas/empleado"] = {
    post: {
        tags: ["Personas"],
        summary: "Crear un empleado",
        description: "ADMIN. Igual que crear una persona, pero con el rol EMPLEADO ya asignado.",
        requestBody: jsonRequest("PersonaRequest"),
        responses: {
            "201": { description: "Empleado creado correctamente", content: { "application/json": { schema: { $ref: "#/components/schemas/Persona" } } } },
            "400": { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": standardResponses("Persona")["500"]
        }
    }
};

paths["/api/personas/{id}/rol"] = {
    parameters: [idParameter("id", "Identificador de la persona")],
    post: {
        tags: ["Personas"],
        summary: "Asignar un rol a una persona",
        description: "ADMIN. El rol se indica por nombre (CLIENTE, EMPLEADO o ADMIN).",
        requestBody: jsonRequest("AsignarRolRequest"),
        responses: {
            "200": { description: "Rol asignado correctamente", content: { "application/json": { schema: { $ref: "#/components/schemas/Persona" } } } },
            "400": { description: "El rol no existe o falta nombreRol", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": standardResponses("Persona")["404"],
            "500": standardResponses("Persona")["500"]
        }
    }
};

paths["/api/reservas/fechas"] = {
    get: {
        tags: ["Reservas"],
        summary: "Obtener las reservas de un rango de fechas",
        description: "EMPLEADO/ADMIN. Devuelve las reservas completas cuya fecha cae entre fechaInicio y fechaFin.",
        parameters: [
            { name: "fechaInicio", in: "query", required: true, schema: { type: "string", format: "date" } },
            { name: "fechaFin", in: "query", required: true, schema: { type: "string", format: "date" } }
        ],
        responses: {
            "200": {
                description: "Reservas del rango obtenidas correctamente",
                content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Reserva" } } } }
            },
            "500": standardResponses("Reserva")["500"]
        }
    }
};

paths["/api/licencias/mias"] = {
    get: {
        tags: ["Licencias"],
        summary: "Obtener las licencias de la persona autenticada",
        description: "Devuelve solo las licencias del usuario del token. Es la vía para que un CLIENTE vea las suyas.",
        responses: {
            "200": {
                description: "Licencias propias obtenidas correctamente",
                content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Licencia" } } } }
            },
            "500": standardResponses("Licencia")["500"]
        }
    }
};

const integerId = { type: "integer", format: "int32" };
const date = { type: "string", format: "date" };
const dateTime = { type: "string", format: "date-time" };
const tiempo = { type: "string", pattern: "^\\d{2}:[0-5]\\d:[0-5]\\d$", example: "00:12:35" };
const posicion = { type: "integer", minimum: 1 };
const hora = { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$", example: "14:00" };
const objectSchema = (properties: Record<string, object>, required: string[] = []) => ({
    type: "object",
    properties,
    required
});
// En las respuestas todos los campos vienen siempre, salvo los includes que solo agregan algunas rutas.
// Sin required el frontend genera todos los tipos como opcionales.
const responseSchema = (properties: Record<string, object>, opcionales: string[] = []) =>
    objectSchema(properties, Object.keys(properties).filter((key) => !opcionales.includes(key)));
// Prisma serializa las columnas DATE y TIME como fecha ISO completa y los Decimal como string
const fechaRespuesta = { ...dateTime, example: "2026-10-14T00:00:00.000Z" };
const horaRespuesta = { ...dateTime, example: "1970-01-01T14:00:00.000Z" };
const decimal = { type: "string", example: "20000" };
const nombreRol = { type: "string", enum: ["CLIENTE", "EMPLEADO", "ADMIN"] };
const ref = (schema: string) => ({ $ref: `#/components/schemas/${schema}` });
const personaProps = { idPersona: integerId, nombre: { type: "string" }, apellido: { type: "string" }, dni: { type: "string" }, fechaNacimiento: fechaRespuesta, mail: { type: "string", format: "email" }, telefono: { type: "string" }, Localidades_idLocalidades: integerId, idRol: integerId };

const schemas = {
    Error: objectSchema({ message: { type: "string", example: "Recurso no encontrado" } }, ["message"]),
    Message: responseSchema({ message: { type: "string", example: "Registro eliminado correctamente" } }),
    LoginRequest: objectSchema({
        mail: { type: "string", format: "email", example: "piloto@example.com" },
        contraseña: { type: "string", format: "password", example: "secreto" }
    }, ["mail", "contraseña"]),
    RegisterRequest: objectSchema({
        nombre: { type: "string" },
        apellido: { type: "string" },
        dni: { type: "string" },
        fechaNacimiento: date,
        mail: { type: "string", format: "email" },
        telefono: { type: "string" },
        contraseña: { type: "string", format: "password", minLength: 8 },
        Localidades_idLocalidades: integerId
    }, ["nombre", "apellido", "dni", "fechaNacimiento", "mail", "telefono", "contraseña", "Localidades_idLocalidades"]),
    AuthResponse: responseSchema({
        token: { type: "string", description: "Token JWT" },
        persona: ref("PersonaAuth")
    }),
    // la persona del login viene con su rol incluido
    PersonaAuth: responseSchema({ ...personaProps, rol: responseSchema({ idRol: integerId, nombre: nombreRol }) }),
    KartingRequest: objectSchema({
        categoria: { type: "string" },
        modelo: { type: "string" },
        estado: { type: "string" },
        fechaAdquisicion: date,
        TiposKarting_idTiposKarting: integerId
    }, ["categoria", "modelo", "estado", "fechaAdquisicion", "TiposKarting_idTiposKarting"]),
    Karting: responseSchema({ idKartings: integerId, categoria: { type: "string" }, modelo: { type: "string" }, estado: { type: "string" }, fechaAdquisicion: fechaRespuesta, TiposKarting_idTiposKarting: integerId }),
    PersonaRequest: objectSchema({ nombre: { type: "string" }, apellido: { type: "string" }, dni: { type: "string" }, fechaNacimiento: date, mail: { type: "string", format: "email" }, telefono: { type: "string" }, contraseña: { type: "string", format: "password", minLength: 8 }, Localidades_idLocalidades: integerId }, ["nombre", "apellido", "dni", "fechaNacimiento", "mail", "telefono", "contraseña", "Localidades_idLocalidades"]),
    AsignarRolRequest: objectSchema({ nombreRol }, ["nombreRol"]),
    Persona: responseSchema(personaProps),
    LocalidadRequest: objectSchema({ nombre: { type: "string" } }, ["nombre"]),
    Localidad: responseSchema({ idLocalidades: integerId, nombre: { type: "string" } }),
    CircuitoRequest: objectSchema({ distancia: integerId, dificultad: { type: "string" }, maximo: integerId }, ["distancia", "dificultad", "maximo"]),
    Circuito: responseSchema({ idCircuitos: integerId, distancia: integerId, dificultad: { type: "string" }, maximo: integerId }),
    RolRequest: objectSchema({ nombre: { type: "string" } }, ["nombre"]),
    Rol: responseSchema({ idRol: integerId, nombre: { type: "string" } }),
    TipoLicenciaRequest: objectSchema({ nombre: { type: "string" }, descripcion: { type: "string" }, nivel: integerId }, ["nombre", "descripcion", "nivel"]),
    TipoLicencia: responseSchema({ idTipoLicencia: integerId, nombre: { type: "string" }, descripcion: { type: "string" }, nivel: integerId }),
    TipoKartingRequest: objectSchema({ nombre: { type: "string" }, descripcion: { type: "string" }, precioHora: { type: "number", example: 20000 }, TiposLicencias_idTipoLicenciaMinima: integerId }, ["nombre", "descripcion", "precioHora", "TiposLicencias_idTipoLicenciaMinima"]),
    TipoKarting: responseSchema({ idTiposKarting: integerId, nombre: { type: "string" }, descripcion: { type: "string" }, precioHora: decimal, TiposLicencias_idTipoLicenciaMinima: integerId }),
    TorneoRequest: objectSchema({ nombre: { type: "string", maxLength: 45 }, descripcion: { type: "string", maxLength: 45 }, cupoMaximo: { type: "integer", minimum: 1 }, fechaInicio: date, fechaFin: date, TiposLicencias_idTipoLicencia: integerId }, ["nombre", "descripcion", "cupoMaximo", "fechaInicio", "fechaFin", "TiposLicencias_idTipoLicencia"]),
    // tiposlicencias solo viene en el listado; estado no viene al crear/actualizar ni dentro de una inscripcion
    Torneo: responseSchema({ idTorneos: integerId, nombre: { type: "string" }, descripcion: { type: "string" }, cupoMaximo: { type: "integer" }, fechaInicio: fechaRespuesta, fechaFin: fechaRespuesta, TiposLicencias_idTipoLicencia: integerId, tiposlicencias: ref("TipoLicencia"), estado: { type: "string", enum: ["proximo", "en_curso", "finalizado"], readOnly: true, description: "Calculado contra el día de hoy" } }, ["tiposlicencias", "estado"]),
    LicenciaRequest: objectSchema({ fechaEmision: date, fechaVencimiento: date, Personas_idPersona: integerId, TiposLicencias_idTipoLicencia: integerId }, ["fechaEmision", "fechaVencimiento", "Personas_idPersona", "TiposLicencias_idTipoLicencia"]),
    Licencia: responseSchema({ idLicencias: integerId, fechaEmision: fechaRespuesta, fechaVencimiento: fechaRespuesta, Personas_idPersona: integerId, TiposLicencias_idTipoLicencia: integerId }),
    // Personas_idPersona no es obligatorio: para un CLIENTE lo impone el servidor con
    // el id del token, y lo que venga en el body se descarta.
    ReservaRequest: objectSchema({ fechaReserva: date, horaInicio: hora, horaFin: hora, Personas_idPersona: integerId, Circuitos_idCircuitos: integerId, Kartings_idKartings: integerId }, ["fechaReserva", "horaInicio", "horaFin", "Circuitos_idCircuitos", "Kartings_idKartings"]),
    Reserva: responseSchema({ idReservas: integerId, fechaReserva: fechaRespuesta, horaInicio: horaRespuesta, horaFin: horaRespuesta, monto: { ...decimal, description: "Calculado por el servidor: precioHora del tipo de karting por la cantidad de horas" }, Personas_idPersona: integerId, Circuitos_idCircuitos: integerId, Kartings_idKartings: integerId }),
    CarreraRequest: objectSchema({ fechaCarrera: date, horaInicio: hora, horaFin: hora, kartings: { type: "array", minItems: 1, items: integerId, description: "Ids de los karts que corren la carrera" }, Torneos_idTorneos: integerId, Circuitos_idCircuitos: integerId }, ["fechaCarrera", "horaInicio", "horaFin", "kartings", "Torneos_idTorneos", "Circuitos_idCircuitos"]),
    // circuitos solo viene en /carreras/torneo/{idTorneo}
    Carrera: responseSchema({ fechaCarrera: fechaRespuesta, horaInicio: horaRespuesta, horaFin: horaRespuesta, kartings: { type: "array", items: ref("Karting") }, Torneos_idTorneos: integerId, Circuitos_idCircuitos: integerId, circuitos: ref("Circuito") }, ["circuitos"]),
    ParticipacionRequest: objectSchema({ Carrera_Torneos_idTorneos: integerId, Carrera_Circuitos_idCircuitos: integerId, Carrera_fecha: date, Personas_idPersona: integerId, tiempo, posicion_final: posicion }, ["Carrera_Torneos_idTorneos", "Carrera_Circuitos_idCircuitos", "Carrera_fecha", "Personas_idPersona", "tiempo", "posicion_final"]),
    ResultadosCarreraRequest: objectSchema({ Carrera_Torneos_idTorneos: integerId, Carrera_Circuitos_idCircuitos: integerId, Carrera_fecha: date, resultados: { type: "array", minItems: 1, items: objectSchema({ Personas_idPersona: integerId, posicion_final: posicion, tiempo }) } }),
    Participacion: responseSchema({ Carrera_Torneos_idTorneos: integerId, Carrera_Circuitos_idCircuitos: integerId, Carrera_fecha: fechaRespuesta, Personas_idPersona: integerId, puntos: { type: "integer", description: "Calculado por el servidor según la posición" }, tiempo, posicion_final: posicion }),
    // nombre y apellido faltan si la persona se borro despues de correr
    TablaGeneralItem: responseSchema({
        posicion: integerId,
        idPersona: integerId,
        nombre: { type: "string", example: "Juan" },
        apellido: { type: "string", example: "Pérez" },
        puntosTotales: integerId,
        victorias: { type: "integer", description: "Cantidad de 1° puestos (primer criterio de desempate)" }
    }, ["nombre", "apellido"]),
    ClasificacionCarreraItem: responseSchema({ posicion, idPersona: integerId, nombre: { type: "string" }, apellido: { type: "string" }, tiempo, puntos: { type: "integer" } }),
    // La fecha y la hora no se mandan: las pone el servidor. Para un CLIENTE el
    // Personas_idPersona tambien se ignora y sale del token.
    InscripcionRequest: objectSchema({ Torneos_idTorneos: integerId, Personas_idPersona: integerId }, ["Torneos_idTorneos"]),
    // torneos viene en el listado y en /inscripciones/mias, no al crear
    Inscripcion: responseSchema({ Torneos_idTorneos: integerId, Personas_idPersona: integerId, fecha_inscripcion: fechaRespuesta, hora_inscripcion: horaRespuesta, torneos: ref("Torneo") }, ["torneos"])
};

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Management Karting API",
            version: "1.0.0",
            description: "Documentación de la API de gestión de karting."
        },
        servers: [{ url: "http://localhost:3000", description: "Servidor local" }],
        tags: [
            { name: "Sistema" },
            { name: "Autenticación" },
            ...crudResources.map(({ tag }) => ({ name: tag })),
            ...compositeResources.map(({ tag }) => ({ name: tag }))
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enviar el token como `Authorization: Bearer <token>`."
                }
            },
            schemas
        },
        security: [{ bearerAuth: [] }],
        paths
    },
    apis: []
};

export default swaggerJSDoc(options);
