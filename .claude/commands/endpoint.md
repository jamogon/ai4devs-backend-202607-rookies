---
description: Implementa un endpoint respetando las capas y el contrato ya escrito
---

Implementa el endpoint **que ya está declarado en `backend/api-spec.yaml`**.

El spec es el contrato: si algo no coincide, el que está mal es el código.

**Enséñame el plan antes de tocar ningún fichero.**

Sigue este orden:

1. El método de consulta en el modelo de dominio que corresponda
   (`src/domain/models/`), con `select` anidado. Nunca un bucle con `await`.
2. El service en `src/application/services/`: valida, llama al modelo,
   transforma. Lanza `AppError` si algo no cuadra.
3. El controller en `src/presentation/controllers/`: extrae el parámetro,
   valida el formato, llama al service, responde.
4. La ruta en `src/routes/`, y móntala en `index.ts`.

Al terminar, **comprueba que la respuesta coincide campo por campo con el spec**.
Si no coincide, dime cuál de los dos está mal antes de cambiar nada.

El endpoint: $ARGUMENTS
