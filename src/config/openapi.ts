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
        keys: ["fechaCarrera", "Kartings_idKartings", "Torneos_idTorneos", "Circuitos_idCircuitos"]
    },
    {
        path: "/api/participaciones",
        tag: "Participaciones",
        resource: "Participación",
        schema: "Participacion",
        requestSchema: "ParticipacionRequest",
        keys: ["Carrera_fecha", "Carrera_Kartings_idKartings", "Carrera_Torneos_idTorneos", "Carrera_Circuitos_idCircuitos", "Personas_idPersona"]
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

const integerId = { type: "integer", format: "int32" };
const date = { type: "string", format: "date" };
const dateTime = { type: "string", format: "date-time" };
const objectSchema = (properties: Record<string, object>, required: string[] = []) => ({
    type: "object",
    properties,
    required
});

const schemas = {
    Error: objectSchema({ message: { type: "string", example: "Recurso no encontrado" } }, ["message"]),
    Message: objectSchema({ message: { type: "string", example: "Registro eliminado correctamente" } }),
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
        contraseña: { type: "string", format: "password" },
        Localidades_idLocalidades: integerId,
        idRol: integerId
    }, ["nombre", "apellido", "dni", "fechaNacimiento", "mail", "telefono", "contraseña", "Localidades_idLocalidades", "idRol"]),
    AuthResponse: objectSchema({
        token: { type: "string", description: "Token JWT" },
        persona: { $ref: "#/components/schemas/Persona" }
    }),
    KartingRequest: objectSchema({
        categoria: { type: "string" },
        modelo: { type: "string" },
        estado: { type: "string" },
        fechaAdquisicion: date,
        TiposKarting_idTiposKarting: integerId
    }),
    Karting: objectSchema({ idKartings: integerId, categoria: { type: "string" }, modelo: { type: "string" }, estado: { type: "string" }, fechaAdquisicion: date, TiposKarting_idTiposKarting: integerId }),
    PersonaRequest: objectSchema({ nombre: { type: "string" }, apellido: { type: "string" }, dni: { type: "string" }, fechaNacimiento: date, mail: { type: "string", format: "email" }, telefono: { type: "string" }, contraseña: { type: "string", format: "password" }, Localidades_idLocalidades: integerId, idRol: integerId }),
    Persona: objectSchema({ idPersona: integerId, nombre: { type: "string" }, apellido: { type: "string" }, dni: { type: "string" }, fechaNacimiento: date, mail: { type: "string", format: "email" }, telefono: { type: "string" }, Localidades_idLocalidades: integerId, idRol: integerId }),
    LocalidadRequest: objectSchema({ nombre: { type: "string" } }),
    Localidad: objectSchema({ idLocalidades: integerId, nombre: { type: "string" } }),
    CircuitoRequest: objectSchema({ distancia: integerId, dificultad: { type: "string" }, maximo: integerId }),
    Circuito: objectSchema({ idCircuitos: integerId, distancia: integerId, dificultad: { type: "string" }, maximo: integerId }),
    RolRequest: objectSchema({ nombre: { type: "string" } }),
    Rol: objectSchema({ idRol: integerId, nombre: { type: "string" } }),
    TipoLicenciaRequest: objectSchema({ nombre: { type: "string" }, nivel: integerId }),
    TipoLicencia: objectSchema({ idTipoLicencia: integerId, nombre: { type: "string" }, nivel: integerId }),
    TipoKartingRequest: objectSchema({ nombre: { type: "string" }, descripcion: { type: "string" }, TiposLicencias_idTipoLicenciaMinima: integerId }),
    TipoKarting: objectSchema({ idTiposKarting: integerId, nombre: { type: "string" }, descripcion: { type: "string" }, TiposLicencias_idTipoLicenciaMinima: integerId }),
    TorneoRequest: objectSchema({ nombre: { type: "string" }, fechaInicio: date, fechaFin: date }),
    Torneo: objectSchema({ idTorneos: integerId, nombre: { type: "string" }, fechaInicio: date, fechaFin: date }),
    LicenciaRequest: objectSchema({ fechaEmision: date, fechaVencimiento: date, Personas_idPersona: integerId, TiposLicencias_idTipoLicencia: integerId }),
    Licencia: objectSchema({ idLicencias: integerId, fechaEmision: date, fechaVencimiento: date, Personas_idPersona: integerId, TiposLicencias_idTipoLicencia: integerId }),
    ReservaRequest: objectSchema({ fechaReserva: date, monto: { type: "number" }, Personas_idPersona: integerId, Circuitos_idCircuitos: integerId, Kartings_idKartings: integerId }),
    Reserva: objectSchema({ idReservas: integerId, fechaReserva: date, monto: { type: "number" }, Personas_idPersona: integerId, Circuitos_idCircuitos: integerId, Kartings_idKartings: integerId }),
    CarreraRequest: objectSchema({ fechaCarrera: date, horaInicio: dateTime, horaFin: dateTime, Kartings_idKartings: integerId, Torneos_idTorneos: integerId, Circuitos_idCircuitos: integerId }),
    Carrera: objectSchema({ fechaCarrera: date, horaInicio: dateTime, horaFin: dateTime, Kartings_idKartings: integerId, Torneos_idTorneos: integerId, Circuitos_idCircuitos: integerId }),
    ParticipacionRequest: objectSchema({ Carrera_Kartings_idKartings: integerId, Carrera_Torneos_idTorneos: integerId, Carrera_Circuitos_idCircuitos: integerId, Carrera_fecha: date, Personas_idPersona: integerId, puntos: integerId, tiempo: { type: "string" }, posicion_final: { type: "string" } }),
    Participacion: objectSchema({ Carrera_Kartings_idKartings: integerId, Carrera_Torneos_idTorneos: integerId, Carrera_Circuitos_idCircuitos: integerId, Carrera_fecha: date, Personas_idPersona: integerId, puntos: integerId, tiempo: { type: "string" }, posicion_final: { type: "string" } }),
    InscripcionRequest: objectSchema({ Torneos_idTorneos: integerId, Personas_idPersona: integerId, fecha_inscipcion: date, hora_inscripcion: dateTime }),
    Inscripcion: objectSchema({ Torneos_idTorneos: integerId, Personas_idPersona: integerId, fecha_inscipcion: date, hora_inscripcion: dateTime })
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
        paths
    },
    apis: []
};

export default swaggerJSDoc(options);
