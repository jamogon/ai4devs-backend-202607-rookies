---
description: Escribe el contrato OpenAPI de un endpoint ANTES de implementarlo
---

Vamos a hacer esto **API-first**: primero el contrato, después el código.

**No escribas nada de implementación todavía.** Solo `backend/api-spec.yaml`.

Añade al spec el endpoint que te pido, declarando:

1. **Ruta y método.**
2. **Parámetros**, con su tipo y si son obligatorios.
3. **El cuerpo de la respuesta**, campo a campo, con tipos. Marca explícitamente
   **cuáles pueden venir a `null`** y si un array puede venir vacío.
4. **Todos los status codes**, no solo el camino feliz. Como mínimo `400`, `404`
   y `200`, con el cuerpo de error de cada uno.
5. Un **ejemplo** de respuesta real.

Respeta el estilo del spec que ya existe: camelCase en los campos, y la misma
forma de error que usa el resto del fichero.

Cuando termines, **enséñame solo el fragmento nuevo** y dime qué decisiones has
tomado que yo debería confirmar antes de implementar.

El endpoint: $ARGUMENTS
