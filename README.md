# LTI - Talent Tracking System | EN

This project is a full-stack application with a React frontend and an Express backend using Prisma as an ORM. The frontend is started with Create React App, and the backend is written in TypeScript.

## Explanation of Directories and Files

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`: The entry point for the backend server.
    - `application/`: Application logic — services, request validation, and the
      typed error classes under `application/errors/`.
    - `domain/`: Domain models. **These are the only files that talk to Prisma.**
    - `presentation/`: Presentation layer (controllers).
    - `routes/`: Route definitions for the API.
  - `api-spec.yaml`: The OpenAPI contract for the API. Nothing serves it as a web
    page yet — read it as a file.
  - `prisma/`: Prisma schema, migrations and the seed.
  - `tsconfig.json`: TypeScript configuration file.

  Tests live next to the code they cover, as `*.test.ts` files — there is no
  separate `tests/` directory. Run them with `npm test`.
- `frontend/`: Contains the client-side code written in React."
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `.env`: Contains the environment variables.
- `docker-compose.yml`: Contains the Docker Compose configuration to manage your application's services.
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend

The frontend is a React application, and its main files are located in the src directory. The public directory contains static assets, and the build directory contains the production build of the application.

### Backend

The backend is an Express application written in TypeScript. The src directory contains the source code, divided into several subdirectories:

- `application`: Application logic, validation and typed errors.
- `domain`: Domain models.
- `presentation`: Presentation layer.
- `routes`: Application routes.

A request flows through the layers in this order:

```
routes/ → presentation/controllers/ → application/services/ → domain/models/
```

The `prisma` directory contains the Prisma schema, the migrations and the seed.

## First steps

To get started with this project, follow these steps:

1. Clone the repository.
2. Install the dependencies for the frontend and backend:

```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Start the database — see the Docker section below. Nothing that reads or
   writes data works without it.
4. Start the backend server:
```
cd backend
npm run dev
```
5. In a new terminal window, start the frontend server:
```
cd frontend
npm start
```

The backend server runs at http://localhost:3010 and the frontend at
http://localhost:3000. The backend port is hardcoded in `backend/src/index.ts` —
there is no environment variable for it.

For a production build instead of the dev server, use `npm run build && npm start`.

## Docker and PostgreSQL

This project uses Docker to run a PostgreSQL database. Here's how to set it up:

Install Docker on your machine if you haven't done so already. You can download it from here.
Navigate to the root directory of the project in your terminal.
Run the following command to start the Docker container:

```
docker-compose up -d
```
This will start a PostgreSQL database in a Docker container. The -d flag runs the container in detached mode, which means it runs in the background.

To access the PostgreSQL database, you can use any PostgreSQL client with the following connection details:

- Host: localhost
- Port: 5435
- User: LTIdbUser
- Password: see `DB_PASSWORD` in the `.env` file at the repository root
- Database: LTIdb

These values come from `.env` at the repository root, which is also what
`docker-compose.yml` reads. If you change them there, you must change the
connection string in `backend/prisma/schema.prisma` too — see the note below.

To stop the Docker container, run the following command:

```
docker-compose down
```
To generate the database using Prisma, follow these steps:

1. The connection string is written literally in
   `backend/prisma/schema.prisma`, in the `url` variable — Prisma does **not**
   read `DATABASE_URL` from `.env`. The reason: `dotenv` looks for `.env` in the
   current working directory (`backend/`) and the file lives in the repository
   root, so it is never read. If you point the database somewhere else, that
   `url` line is what you change.

2. Open a terminal in the `backend` directory.

3. Run the following commands to generate the Prisma client, apply the migrations
   and populate the database with sample data:

```
npx prisma generate
npx prisma migrate dev
npx -y -p typescript@5.4 -p ts-node@10 ts-node --transpile-only prisma/seed.ts
```

That third command is ugly for a reason: the seed lives at
`prisma/seed.ts`, and the `ts-node` pinned in `package.json` is too old to run
it, so a newer one is fetched on the fly. Wrapping it in an npm script would be
an improvement.

The seed is **not idempotent**: it uses plain `create` calls and `Company.name`,
`Candidate.email` and `Employee.email` are unique, so a second run fails with a
`P2002` error. To reseed, empty the database first.

Once you have completed all the steps, you should be able to save new candidates, both via web and via API, view them in the database, and retrieve them using GET by ID.

```
POST http://localhost:3010/candidates
{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```

--------------------------------------------

# LTI - Sistema de Seguimiento de Talento | ES

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como un ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
    - `application/`: Lógica de aplicación — services, validación y las clases
      de error tipadas en `application/errors/`.
    - `domain/`: Modelos de dominio. **Son los únicos ficheros que hablan con
      Prisma.**
    - `presentation/`: Capa de presentación (controllers).
    - `routes/`: Definiciones de rutas de la API.
  - `api-spec.yaml`: El contrato OpenAPI de la API. Todavía no hay nada que lo
    sirva como página web: se lee como fichero.
  - `prisma/`: Esquema de Prisma, migraciones y el seed.
  - `tsconfig.json`: Archivo de configuración de TypeScript.

  Los tests viven junto al código que cubren, como ficheros `*.test.ts` — no hay
  un directorio `tests/` aparte. Se lanzan con `npm test`.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `.env`: Contiene las variables de entorno.
- `docker-compose.yml`: Contiene la configuración de Docker Compose para gestionar los servicios de tu aplicación.
- `README.md`: Este archivo, contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript. El directorio `src` contiene el código fuente, dividido en varios subdirectorios:

- `application`: Lógica de aplicación, validación y errores tipados.
- `domain`: Modelos de dominio.
- `presentation`: Capa de presentación.
- `routes`: Rutas de la aplicación.

Una petición recorre las capas en este orden:

```
routes/ → presentation/controllers/ → application/services/ → domain/models/
```

El directorio `prisma` contiene el esquema, las migraciones y el seed.

## Primeros Pasos

Para comenzar con este proyecto, sigue estos pasos:

1. Clona el repositorio.
2. Instala las dependencias para el frontend y el backend:
```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Levanta la base de datos — mira la sección de Docker más abajo. Sin ella no
   funciona nada que lea o escriba datos.
4. Inicia el servidor backend:
```
cd backend
npm run dev
```
5. En una nueva ventana de terminal, inicia el servidor frontend:
```
cd frontend
npm start
```

El backend corre en http://localhost:3010 y el frontend en
http://localhost:3000. El puerto del backend está escrito a fuego en
`backend/src/index.ts`: no hay variable de entorno para cambiarlo.

Si quieres una build de producción en vez del servidor de desarrollo, usa
`npm run build && npm start`.

## Docker y PostgreSQL

Este proyecto usa Docker para ejecutar una base de datos PostgreSQL. Así es cómo ponerlo en marcha:

Instala Docker en tu máquina si aún no lo has hecho. Puedes descargarlo desde aquí.
Navega al directorio raíz del proyecto en tu terminal.
Ejecuta el siguiente comando para iniciar el contenedor Docker:
```
docker-compose up -d
```
Esto iniciará una base de datos PostgreSQL en un contenedor Docker. La bandera -d corre el contenedor en modo separado, lo que significa que se ejecuta en segundo plano.

Para acceder a la base de datos PostgreSQL, puedes usar cualquier cliente PostgreSQL con los siguientes detalles de conexión:
 - Host: localhost
 - Port: 5435
 - User: LTIdbUser
 - Password: mira `DB_PASSWORD` en el `.env` de la raíz del repositorio
 - Database: LTIdb

Estos valores salen del `.env` de la raíz del repositorio, que es también lo que
lee `docker-compose.yml`. Si los cambias ahí, tienes que cambiar además la cadena
de conexión de `backend/prisma/schema.prisma` — mira la nota de abajo.

Para detener el contenedor Docker, ejecuta el siguiente comando:
```
docker-compose down
```

Para generar la base de datos utilizando Prisma, sigue estos pasos:

1. La cadena de conexión está escrita literalmente en
   `backend/prisma/schema.prisma`, en la variable `url` — Prisma **no** lee
   `DATABASE_URL` del `.env`. El motivo: `dotenv` busca el `.env` en el
   directorio actual (`backend/`) y el fichero está en la raíz del repositorio,
   así que no lo lee nunca. Si apuntas la base de datos a otro sitio, esa línea
   `url` es la que hay que cambiar.

2. Abre una terminal en el directorio `backend`.

3. Ejecuta los siguientes comandos para generar el cliente de Prisma, aplicar las
   migraciones y poblar la base de datos con datos de ejemplo:
```
npx prisma generate
npx prisma migrate dev
npx -y -p typescript@5.4 -p ts-node@10 ts-node --transpile-only prisma/seed.ts
```

Ese tercer comando es feo por un motivo: el seed está en `prisma/seed.ts`, y el
`ts-node` pinneado en `package.json` es demasiado viejo para ejecutarlo, así que
se descarga uno nuevo al vuelo. Encapsularlo en un script de npm sería una
mejora.

El seed **no es idempotente**: usa `create` a pelo y `Company.name`,
`Candidate.email` y `Employee.email` son únicos, así que una segunda ejecución
falla con un error `P2002`. Para volver a sembrar, vacía antes la base de datos.

Una vez has dado todos los pasos, deberías poder guardar nuevos candidatos, tanto via web, como via API, verlos en la base de datos y obtenerlos mediante GET por id.

```
POST http://localhost:3010/candidates
{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```

