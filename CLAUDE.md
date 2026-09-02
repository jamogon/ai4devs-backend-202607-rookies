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
- Errores tipados: clase base `AppError` con `statusCode` y subclases por caso.
  Nunca `throw new Error()` ni relanzar un error capturado como tal.
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

- El seed del README falla. Usa:
  `npx -y -p typescript@5.4 -p ts-node@10 ts-node --transpile-only prisma/seed.ts`
- `npm test` sale en error: no hay ni un test. Un "no tests found" no es una
  regresión tuya.
- La URL de conexión está escrita literal en `schema.prisma`; cambiar el `.env`
  no basta.
