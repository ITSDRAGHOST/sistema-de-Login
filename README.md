# Sistema de Login con JWT

Pequeño sistema de autenticación hecho con **Node.js**, **Express** y **jsonwebtoken**. Permite registrar usuarios, iniciar sesión para obtener un token y consultar los datos del usuario enviando ese token por header.

Práctica de la materia Tecnologías de Construcción de Servicios Web, UVM.

## Integrantes

- Brian de la Cruz de la Cruz
- Karla Jessica Cecilia Urbina Alcasena

## Tecnologías

- Node.js (ES Modules)
- [Express](https://expressjs.com/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

## Instalación y ejecución

```bash
npm install
npm start
```

El servidor queda disponible en `http://localhost:3000`.

> Los usuarios se guardan en memoria, por lo que se borran al reiniciar el servidor.

## Endpoints

| Método | Ruta        | Descripción                                   | Requiere token |
|--------|-------------|-----------------------------------------------|----------------|
| POST   | `/register` | Crea un usuario (nombre, contraseña y país)   | No             |
| POST   | `/login`    | Valida credenciales y devuelve un token       | No             |
| GET    | `/user`     | Devuelve los datos del usuario del token      | Sí             |
| PUT    | `/user`     | Actualiza los datos del usuario (opcional)    | Sí             |
| DELETE | `/user`     | Elimina al usuario (opcional)                 | Sí             |

### POST /register

Body (JSON):

```json
{
  "nombre": "brian",
  "password": "1234",
  "pais": "México"
}
```

Respuesta `201 Created`:

```json
{
  "id": "…",
  "nombre": "brian",
  "pais": "México"
}
```

### POST /login

Body (JSON):

```json
{
  "nombre": "brian",
  "password": "1234"
}
```

Respuesta `200 OK`:

```json
{
  "token": "eyJhbGciOi…"
}
```

El token expira en 1 hora.

### GET /user

Enviar el token en el header:

```
Authorization: Bearer <token>
```

También se acepta el header `x-access-token: <token>`.

Respuesta `200 OK`:

```json
{
  "id": "…",
  "nombre": "brian",
  "pais": "México"
}
```

### PUT /user (opcional)

Con el mismo header. Body (JSON) con los campos a actualizar:

```json
{
  "pais": "Colombia"
}
```

### DELETE /user (opcional)

Con el mismo header. Responde `204 No Content`.

## Códigos de respuesta

| Código | Significado                                   |
|--------|-----------------------------------------------|
| 200    | Operación correcta                            |
| 201    | Usuario creado                                |
| 204    | Usuario eliminado                             |
| 400    | Faltan campos obligatorios                    |
| 401    | Token no enviado o credenciales incorrectas   |
| 403    | Token inválido o expirado                     |
| 404    | Usuario no encontrado                         |
| 409    | El usuario ya existe                          |

## Evidencia

En la carpeta [`Evidencia`](./Evidencia) se encuentran las capturas de las pruebas realizadas en Postman: registro de usuario, login con token y consulta de datos en `/user` enviando el token por header.

## Estructura del proyecto

```
.
├── Evidencia/
├── server.js
├── package.json
└── README.md
```
