---
name: escrituras-seguras
description: Usar cuando se escriba o modifique código que guarde datos en más de una tabla, o cuando aparezca un bucle con await dentro. Detecta escrituras que pueden dejar datos a medias y consultas N+1.
---

# Escrituras que pueden dejar datos a medias

En este proyecto **no hay ni una transacción**. Y hay al menos un sitio donde
hace falta.

## Qué buscar

**Varias escrituras seguidas sin transacción.** Si un flujo guarda en más de una
tabla y algo falla por el camino, quedan datos incompletos y nadie se entera.

Ejemplo real en el repo: `candidateService.addCandidate` guarda el candidato, sus
estudios, su experiencia y su CV en `await` sueltos. Si falla el tercero, el
candidato ya está en la base de datos, a medias.

El arreglo es envolver en `prisma.$transaction`, o usar `create` anidado si es
un solo agregado.

**Bucles con `await` dentro.** Una consulta por elemento. Con doscientos
elementos, doscientas idas a la base de datos.

El arreglo es un `select` o `create` anidado. `Candidate.save()` ya lo hace bien:
`educations: { create: [...] }`.

## Qué haces al detectarlo

Avisa **antes** de que el código se escriba, no después. Di qué se rompe
concretamente: no "esto no es atómico", sino "si falla al guardar la tercera
educación, el candidato ya está creado y le faltan estudios".

Si el código que estás tocando **ya tenía** el problema y no es lo que te han
pedido arreglar, **dilo pero no lo cambies**. Es deuda conocida, no tu encargo.
