# LTI · backend

API Express + TypeScript sobre Prisma y Postgres. El trabajo vive en `backend/`.

## Cómo está organizado

```
routes/ → presentation/controllers/ → application/services/ → domain/models/
```

**Solo los modelos de `domain/models/` hablan con Prisma.** Los services y los
controllers pasan por los modelos, nunca por el cliente directamente.

## Reglas

- TypeScript estricto. Nada de `any`, sobre todo en la capa de datos.
- Errores tipados: clase base `AppError` con `statusCode` y subclases por caso,
  en `backend/src/application/errors/`. Nunca `throw new Error()` ni relanzar un
  error capturado como tal.
- Los controllers no llevan lógica de negocio: extraen, validan, llaman al
  service y responden.
- Consultas con `select` anidado. Nunca un bucle con `await` dentro.
- Toda escritura que toque varias tablas va en una `prisma.$transaction`.
- `backend/api-spec.yaml` es el contrato y manda sobre el código. Todo endpoint
  nuevo o modificado se refleja ahí **en el mismo cambio**.
- camelCase en TypeScript y en el JSON público, como está en el spec.

## Congelado

`backend/prisma/schema.prisma` y las migraciones ya aplicadas. Si una tarea
parece exigir un cambio de esquema, para y pregunta.

## Trampas de este repo

- El seed del README falla (la ruta y el comando están mal). Usa `npm run seed`,
  que encapsula el que sí funciona. **No es idempotente**: el seed usa `create` a
  pelo y `Company.name`, `Candidate.email` y `Employee.email` son `@unique`, así
  que un segundo `npm run seed` revienta con `P2002`.
- El seed principal **no sirve para verificar medias**: ningún candidato tiene
  más de una entrevista, así que un cálculo bien hecho y uno mal hecho dan el
  mismo número. Para eso está `npm run seed:fixtures`
  (`prisma/seed-edge-cases.ts`), que crea los casos límite —sin entrevistas, sin
  puntuar, media exacta, media periódica, mezcla— y una posición vacía. Ese sí
  es idempotente: borra sus propias posiciones antes de recrearlas, y al acabar
  imprime los ids y el valor esperado de cada caso.
- La URL de conexión está escrita literal en `schema.prisma`; cambiar el `.env`
  no basta. La causa: `dotenv.config()` busca el `.env` en el cwd (`backend/`) y
  el fichero está en la raíz del repo, así que hoy no lee nada.
- Por lo mismo, el puerto se pasa con `PORT` desde el script de npm, no por
  `.env`. Sin `PORT`, el 3010.
- `jest.config.js` lleva `watchman: false` y no es decorativo: si watchman está
  instalado pero su daemon no responde, jest se cuelga minutos sin imprimir nada
  y muere con un `'error'` sin manejar de `fb-watchman`. No lo quites.
- Swagger UI (`/api-docs`) lee `api-spec.yaml` una sola vez al arrancar, y
  `ts-node-dev` no vigila los `.yaml`. Si editas el contrato, **reinicia** o
  seguirás viendo la documentación vieja.
