---
description: Escribe tests priorizando por riesgo, no por cobertura
---

Escribe tests para lo que te pido.

**Antes de escribir nada**, dime en qué orden vas a probar y por qué. Prioriza
por riesgo, no por cobertura:

1. Lo que puede **perder datos** — escrituras compuestas sin transacción.
2. Lo que puede **devolver datos de más** — validaciones flojas.
3. Los **cálculos con casos límite** — medias sin elementos, nulos, listas vacías.
4. Lo demás.

## Reglas

- **Tests de caracterización.** Si el código ya existe y funciona, el test
  documenta **lo que hace hoy**, incluido lo que parezca un error. No arregles
  el código mientras escribes el test: si algo está mal, el test lo documenta y
  me lo dices aparte.
- **Mockea el módulo del modelo**, no `@prisma/client`. Los modelos de
  `domain/models/` son la frontera de datos.
- **Nunca importes `src/index.ts`**: llama a `app.listen()` sin condición y
  levantaría un servidor.
- Arrange · Act · Assert, y un nombre que describa el comportamiento, no el método.

## Ojo con la configuración

Este repo no tiene ningún test todavía. `tsconfig.json` no excluye los `.test.ts`
y `jest.config.js` no tiene `roots`, así que tras un build jest los contaría dos
veces. Si vas a añadir el primero, **avísame** antes de tocar la configuración.

Qué quiero probar: $ARGUMENTS
