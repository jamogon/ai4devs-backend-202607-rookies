---
description: Añade un endpoint respetando las capas del proyecto
---

Añade el endpoint que te pido, respetando la arquitectura de este repo.

**Enséñame el plan antes de tocar ningún fichero.**

Sigue este orden:

1. El método de consulta en el modelo de dominio que corresponda
   (`src/domain/models/`), con `select` anidado. Nunca un bucle con `await`.
2. El service en `src/application/services/`: valida, llama al modelo,
   transforma. Lanza `AppError` si algo no cuadra.
3. El controller en `src/presentation/controllers/`: extrae el parámetro,
   valida el formato, llama al service, responde.
4. La ruta en `src/routes/`, y móntala en `index.ts`.
5. Actualiza `backend/api-spec.yaml` con el contrato.

Status codes: `400` si el parámetro no es válido, `404` si el recurso no
existe, `200` con el resultado (que puede venir vacío).

El endpoint que quiero: $ARGUMENTS
