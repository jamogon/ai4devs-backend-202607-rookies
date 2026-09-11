# LTI · Contexto para agentes de código

Material de la sesión S9 de **AI4Devs Backend**. Un backend real —Express +
TypeScript + Prisma + Postgres— sobre el que se monta, paso a paso, el contexto
que necesita un agente de código para trabajar bien: `CLAUDE.md`, subagentes,
slash commands y skills.

El repositorio no es un ejemplo terminado. Es una **secuencia de estados**: cada
rama es una foto del proyecto en un momento de la clase, y la gracia está en
comparar unas con otras.

> **Esta rama (`main`) es solo el mapa.** No empieces a trabajar aquí: el código
> está en el estado de partida, sin Swagger, sin tests y sin nada de `.claude/`.
> Ve a [`limpio`](#el-recorrido).

---

## De dónde viene esto

Es un clon de
[`LIDR-academy/ai4devs-backend-202607-seniors`](https://github.com/LIDR-academy/ai4devs-backend-202607-seniors),
el proyecto LTI de la academia, con capas añadidas encima para la sesión.
Licencia MIT, la original, en [`LICENSE.md`](LICENSE.md).

Todo lo que hay en `.claude/`, en `CLAUDE.md`, en `tasks/` y en
`backend/prisma/seed-edge-cases.ts` es material de la sesión. El resto es el
proyecto de LIDR.

---

## El recorrido

Las ramas están pensadas para verse **en orden**. Cada una añade una capa sobre
la anterior.

| # | Rama | Qué tiene | Para qué la quieres |
|---|---|---|---|
| 0 | `antes` | El proyecto tal cual sale de la academia | Ver de dónde se parte |
| 1 | `limpio` | + Swagger en `/api-docs`, jest configurado, `AppError` tipado, seed de fixtures | **Empieza aquí.** Es el punto de partida de la clase |
| 2 | `preparado/contexto` | + `CLAUDE.md`, 5 agentes, 5 commands, 2 skills, `tasks/` | Ver solo la capa de contexto, aislada |
| 3 | `preparado/swagger-y-tests` | 1 + 2 juntos | El estado completo antes de tocar la tarea |
| 4 | `pruebas` | + fixtures de casos límite y versiones afinadas de los commands | Lo mismo, con las herramientas ya rodadas |
| 5 | `solucion/endpoint` | + TASK-014 resuelta, con tests y contrato | La solución, para contrastar con la tuya |

```
antes ──► limpio ──► preparado/swagger-y-tests ──► pruebas ──► solucion/endpoint
                 └─► preparado/contexto
```

Para moverte entre ellas:

```bash
git switch limpio
```

Y para tener dos abiertas a la vez y compararlas de verdad, sin ir saltando:

```bash
git worktree add ../lti-limpio limpio
git worktree add ../lti-solucion solucion/endpoint
```

---

## Levantarlo

Necesitas Docker y Node 18+.

```bash
# 1. Base de datos (usa el .env de la raíz: puerto 5435)
docker compose up -d

# 2. Dependencias y cliente de Prisma
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# 3. Datos
npm run seed            # datos base — OJO: no es idempotente, ver más abajo
npm run seed:fixtures   # casos límite de TASK-014 — este sí es idempotente

# 4. Arrancar
npm run dev             # http://localhost:3010
```

Documentación interactiva de la API en **http://localhost:3010/api-docs** (desde
la rama `limpio` en adelante).

Tests:

```bash
cd backend && npm test
```

---

## La capa de contexto

Está en las ramas de la 2 en adelante. Es el material de la sesión.

### `CLAUDE.md`

El fichero que lee el agente en cada sesión. No es documentación general: son
las reglas que este proyecto no negocia (arquitectura en capas, nada de `any`,
errores tipados, `select` anidado, transacciones, el contrato manda) y, sobre
todo, **las trampas del repo** — las cosas que hacen perder una tarde y que no
se deducen leyendo el código.

### Subagentes · `.claude/agents/`

| Agente | Cuándo |
|---|---|
| `product-manager` | El encargo llega vago. Aclara qué se pide de verdad y cuándo está terminado |
| `arquitecto-backend` | Antes de decidir dónde va una pieza nueva o si algo no encaja en las capas |
| `experto-bbdd` | Consultas Prisma, rendimiento, índices, transacciones, esquema |
| `experto-tests` | Qué probar y en qué orden, sobre todo si el módulo no tiene tests |
| `revisor-backend` | Después de escribir código, contra las reglas del proyecto |

Ninguno escribe código salvo cuando se le pide explícitamente: opinan, y la
decisión la tomas tú.

### Slash commands · `.claude/commands/`

Son el flujo de la sesión, y el orden importa:

```
/proyecto  →  /tarea  →  /contrato  →  /endpoint  →  /tests
```

| Command | Qué hace |
|---|---|
| `/proyecto` | Analiza el repo y te lo explica como si entraras hoy. No toca código |
| `/tarea` | Lee un ticket de `tasks/` y lo aterriza. Todavía sin contrato ni código |
| `/contrato` | Escribe el OpenAPI del endpoint **antes** de implementarlo |
| `/endpoint` | Implementa lo que ya declara `api-spec.yaml`, respetando las capas |
| `/tests` | Prioriza por riesgo, no por cobertura, y justifica el orden antes de escribir |

### Skills · `.claude/skills/`

Se activan solas cuando toca, sin que las invoques:

- **`contrato-api`** — mantiene `api-spec.yaml` sincronizado con el código y
  avisa si divergen.
- **`escrituras-seguras`** — detecta escrituras que pueden dejar datos a medias
  y consultas N+1.

---

## El ejercicio · TASK-014

En `tasks/TASK-014-candidatos-de-una-posicion.md`. Pide un endpoint para ver los
candidatos de una oferta, con su fase y "cómo lo lleva" cada uno.

El ticket está escrito **a propósito como llegan los tickets de verdad**: notas
de una reunión, sin criterios de aceptación, y con dos preguntas colgando.

- *"¿y si todavía no ha hecho ninguna entrevista?"* — «quedó sin resolver».
- *"igual hace falta paginación"* — «no se decidió nada».

Ahí está el ejercicio. Un agente al que le sueltas el ticket sin más se inventa
una respuesta para las dos y no te dice que se la ha inventado. Ese es el
momento de usar `/tarea` y `product-manager` antes de escribir una línea.

### Cómo se resolvieron en `solucion/endpoint`

**`averageScore: null`**, nunca `0`, cuando no hay nada que promediar —ni una
sola entrevista puntuada—. Un `0` se leería en el Kanban como el peor candidato
posible, y "todavía no lo sabemos" no es eso. Las entrevistas sin puntuar se
descartan en vez de contar como cero. La media se redondea a un decimal.

**Sin paginación.** Una oferta tiene decenas de candidaturas como mucho y el
Kanban las pinta todas de golpe. Filtrar, ordenar y buscar son TASK-021, que el
ticket declara fuera de alcance.

Las dos decisiones están argumentadas dentro de `api-spec.yaml`, que es donde
las va a leer quien consuma la API.

### Verificarlo

El seed principal **no sirve** para comprobar este endpoint: ningún candidato
tiene más de una entrevista, así que una media bien calculada y una mal
calculada dan el mismo número. Para eso está el otro:

```bash
cd backend && npm run seed:fixtures
```

Imprime los ids que ha creado y el valor esperado de cada caso —sin entrevistas,
sin puntuar, una sola nota, media exacta, media periódica, mezcla— más una
posición sin candidaturas. Luego:

```bash
curl http://localhost:3010/positions/<id>/candidates
```

---

## Trampas del repo

Las que cuestan una tarde si nadie te las cuenta. Están todas en `CLAUDE.md`,
resumidas aquí:

- **`npm run seed` no es idempotente.** Usa `create` a pelo contra columnas
  `@unique`, así que una segunda ejecución revienta con `P2002`. Para volver a
  sembrar hay que vaciar antes. `npm run seed:fixtures` sí es idempotente.
- **La URL de conexión está escrita literal en `schema.prisma`.** Cambiar el
  `.env` no basta: `dotenv` busca el fichero en el cwd (`backend/`) y está en la
  raíz, así que hoy no lee nada.
- **Por lo mismo, el puerto se pasa con `PORT`** desde el script de npm, no por
  `.env`. Sin `PORT`, el 3010.
- **`jest.config.js` lleva `watchman: false` y no es decorativo.** Si watchman
  está instalado pero su daemon no responde, jest se cuelga minutos sin imprimir
  nada y muere con un error sin manejar de `fb-watchman`.
- **Swagger lee `api-spec.yaml` una sola vez al arrancar**, y `ts-node-dev` no
  vigila los `.yaml`. Si editas el contrato, reinicia o seguirás viendo la
  documentación vieja.

---

## Licencia

MIT, heredada del proyecto original de LIDR Academy. Ver [`LICENSE.md`](LICENSE.md).
