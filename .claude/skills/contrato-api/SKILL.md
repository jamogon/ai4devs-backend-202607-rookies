---
name: contrato-api
description: Usar cuando se añada, modifique o elimine un endpoint, o cuando cambie la forma de una respuesta. Mantiene backend/api-spec.yaml sincronizado con el código y avisa si divergen.
---

# El contrato manda

En este proyecto `backend/api-spec.yaml` es el contrato de la API y **tiene
prioridad sobre el código**. Si discrepan, el que está mal es el código.

## Cuando alguien toca un endpoint

1. Comprueba si la ruta existe en `api-spec.yaml`.
2. Si no existe, añádela **en el mismo cambio**: método, parámetros, cuerpo de
   la respuesta y todos los status codes que pueda devolver.
3. Si existe pero la forma de la respuesta ha cambiado, actualízala.
4. Si el código y el spec discrepan y no está claro cuál es correcto, **para y
   pregunta**. No decidas tú.

## Lo que hay que declarar siempre

- Todos los status codes, no solo el camino feliz. Como mínimo `400`, `404` y `200`.
- Los campos que pueden venir a `null`.
- Si la respuesta es un array, si puede venir vacío.

## Deuda conocida

`GET /candidates/{id}` existe en el código y **no está en el spec**. No repitas
ese patrón; si tocas ese endpoint, documéntalo.
