---
description: Lee un ticket de tasks/ y lo aterriza antes de tocar código
---

Lee el ticket que te indico de la carpeta `tasks/` y **aterrízalo**.

**No escribas código. No escribas el contrato todavía.**

Dime:

1. **Qué se pide de verdad**, en una frase. No repitas el título: traduce lo que
   necesita la persona que lo pidió.
2. **Qué campos hacen falta** para resolver su problema — y **cuáles NO**, aunque
   estén en la base de datos. Devolver de más también es un error.
3. **Los casos que el ticket no resuelve.** Búscalos: qué pasa si no hay
   resultados, si falta un dato, si el recurso no existe. Marca los que **tienen
   que decidirse antes de programar**.
4. **Qué hay en el ticket que NO está decidido** y quién debería decidirlo.
5. **Qué modelos y relaciones del `schema.prisma`** hacen falta para resolverlo.
   Comprueba que existen; no lo supongas.

Termina con **las preguntas que harías antes de empezar**. Si el ticket está lo
bastante claro para arrancar, dilo y no inventes preguntas de relleno.

Ticket: $ARGUMENTS
