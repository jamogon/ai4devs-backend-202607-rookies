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

La configuración ya está en orden y tiene tres piezas que **no debes quitar**:

- `roots: ['<rootDir>/src']` en `jest.config.js`, para que jest no rastree todo
  el proyecto ni cuente cada test dos veces tras un `npm run build`.
- `watchman: false` en `jest.config.js`, sin lo cual jest se cuelga varios
  minutos si el daemon de watchman no responde.
- `exclude` de `**/*.test.ts` en `tsconfig.json`, para que los tests no acaben
  compilados en `dist/`.

Hoy hay un solo fichero de test: `src/application/errors/AppError.test.ts`. Si
para lo que te pido necesitas cambiar la configuración, **avísame antes**.

## Y al terminar: rompe el código

Un test en verde no prueba nada. Un test que **sigue en verde con el código
roto** es peor que no tenerlo, porque da calma falsa.

Así que para cada test que escribas, o al menos para los que cubren lo más
arriesgado:

1. Rompe a propósito lo que ese test dice proteger — cambia el signo, quita la
   línea, devuelve `0` en vez de `null`.
2. Lanza `npm test` y **enséñame la salida donde falla**, con el `Expected` y el
   `Received`.
3. Deshaz el cambio y confirma que vuelve a pasar.

Si al romper el código el test sigue pasando, el test está mal: no estaba
comprobando lo que dice comprobar. Dímelo y arréglalo antes de darlo por bueno.

Es la única forma de saber que un test sirve sin esperar a que llegue el bug de
verdad.

Qué quiero probar: $ARGUMENTS
