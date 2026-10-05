# Documentos del transporte marítimo internacional (didáctico)

Herramienta **personal y didáctica** para cursos de Negocios Internacionales (Perú).
Todo lo que genera es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**.

## Cómo abrirla

1. Abre la carpeta del proyecto.
2. Haz doble clic en `index.html`. Se abre en el navegador (Chrome o Edge) sin instalar nada.

## Qué puedes hacer ahora (F8a hecha y revisada; F8b pendiente)

La página tiene cuatro pasos, siempre a mano en la **barra fija de arriba**: **1 Datos** (el formulario),
**2 Revisión** (con el contador de errores y advertencias), **3 Resultados** del cálculo y **4 Documentos** (factura comercial, lista de empaque, instrucciones de embarque, borrador de B/L, declaración VGM, DAM Formato A y A1, y hoja resumen).
La barra también dice si hay **cambios sin guardar**.

- **Caso 1 / Caso 2:** cargan los ejemplos de `PLAN.md` §9 (datos 100 % ficticios). Puedes editarlos.
- **Nueva:** crea una operación con los valores sugeridos del plan (consignatario = comprador, notify = consignatario,
  cobertura 110 %, 3 originales del B/L, forma de envío 1/1…), todos editables.
- **Guardar JSON:** descarga la operación como archivo `.json`. **Ese archivo es tu copia de trabajo.**
- **Abrir JSON:** vuelve a cargar un `.json` guardado antes. Se revisa todo el archivo; si tiene algún problema
  (no es JSON, le faltan datos, trae tipos o campos que no corresponden, pesa más de 2 MB o tiene más de 200 ítems)
  se muestra el motivo y **lo que está en pantalla no cambia**.

## Cómo llenar el formulario

1. Empieza por **Identificación del archivo** (la referencia, por ejemplo `OP-2026-003`) y **A1** (importación o exportación).
   Usa el **índice de secciones** (a la izquierda en la computadora; en fichas en el celular) para saltar de una sección a otra.
2. Cada campo muestra su etiqueta en español e inglés, la **casilla DAM** que alimenta y la **marca del campo**
   (H, H*, SUPUESTO o POR VERIFICAR). El asterisco **\*** indica que es obligatorio para esta operación.
   El botón **?** abre su ayuda, su fuente, cuándo se pide y su valor sugerido.
3. **Números:** usa punto decimal (la coma solo separa miles: `1,234.50`). Junto al campo se indica la unidad,
   el máximo y cuántos decimales admite (por ejemplo, cantidad: máx. 1,000,000, hasta 3 decimales). Si escribes un número
   que no se puede usar, el campo se marca en rojo y la revisión queda **en pausa (E20)** hasta que lo corrijas;
   puedes seguir editando lo demás. Si ese campo deja de pedirse (por ejemplo, la tasa de prima al quitar el seguro),
   el dato queda **en suspenso**: no bloquea, se usa el valor anterior y «Revisión» te ofrece descartarlo.
4. **Códigos:** en las listas cerradas del instructivo eliges «código — texto» (por ejemplo `2 — Pago a crédito`).
   Países, puertos, UBIGEO, aduanas, unidades y clases de bulto son listas abiertas: escribe el código (hay sugerencias)
   y se muestra su nombre si está en la lista de ejemplo.
5. **Secciones que dependen de otros datos:** lo que no aplica se oculta y no se exige (su dato se conserva).
   Ejemplos: el Formato B y los tributos solo en importación; los datos de la póliza solo si hay seguro (en CIF y CIP el
   seguro queda en Sí); el pago diferido solo con modalidad 2 (crédito); los datos del intermediario solo si 6.1 = Sí;
   el certificado de origen solo si pides trato preferencial; la casilla 8.1.5 solo en EXW; 8.3.2 y 8.5.x en el grupo D.
6. **Ítems:** cada ítem es una tarjeta con su resumen (producto · cantidad · valor · bultos). Puedes **agregar**,
   **duplicar**, **eliminar** (pide confirmación) y **subir/bajar** ítems; sus marcas se mueven con ellos.
   Si la subpartida es 8517.13.00.00 u 8517.14.00.00 (celulares) aparece el editor de **equipos**: pega una línea por
   equipo con el formato `serie;IMEI;IMEI` (también sirve copiar dos o tres columnas de una hoja de cálculo).
7. **Lo que calcula la herramienta** (destinación, versión del Incoterm, totales de bultos y pesos, VGM, prima, FOB,
   flete usual…) aparece en recuadros de solo lectura dentro de cada sección: no se ingresa.
8. Cada cambio actualiza al instante los totales, la **Revisión** y los **Resultados del cálculo**.

## Respaldo automático y cómo recuperar

- Si la casilla **«Guardar un respaldo automático en este navegador»** está marcada (lo está por defecto), mientras haya
  cambios sin guardar la herramienta copia la operación en el navegador. **Es solo un respaldo**: la copia real es el `.json`.
- Si cierras la pestaña con cambios sin guardar, el navegador te avisa antes de cerrar.
- Al volver a abrir `index.html`, si hay respaldo aparece un recuadro azul: **Recuperar la última operación** la carga
  (y te recuerda guardarla con «Guardar JSON»); **Descartar el respaldo** lo borra. Nunca se carga sola.
- Antes de **Nueva**, de cargar un ejemplo o de **Abrir** otro archivo con cambios sin guardar, la herramienta pide confirmación.
- Si desmarcas la casilla, el respaldo se borra y no se vuelve a guardar en ese navegador.

## Cómo leer el panel «Revisión de la operación»

Mientras escribes, la herramienta revisa la operación con las reglas de `PLAN.md` §7:

- **Contador** (arriba, en verde o rojo): cuántos errores y advertencias hay y sus códigos.
  Ejemplo con el caso 1: «✔ Sin errores · 6 advertencias (A01, A08, A19, A20)».
- **Errores (E01–E21), en rojo:** bloquean los documentos. Mientras haya uno, los documentos no se generan.
  E20 significa que un número no se pudo usar (no es número, supera su máximo o tiene decimales de más): la revisión y
  los resultados quedan en pausa hasta corregirlo. Cada error también se marca en rojo junto a su campo del formulario.
- **Advertencias (A01–A20), en naranja:** no bloquean. Explican algo que conviene revisar o un dato POR VERIFICAR.
  C01 y C02 son avisos del propio cálculo: C01, un reparto hecho en partes iguales porque su base suma 0
  (por ejemplo, flete con pesos brutos en 0); C02, ajustes sin ningún ítem marcado como objeto de ajuste.
- Cada aviso dice **qué pasa**, **por qué importa** y **cómo corregirlo**, con su **fuente** y su **marca**
  (H, H*, SUPUESTO o POR VERIFICAR). Si varios avisos son de la misma regla, se agrupan bajo su código.
- El botón **→ Ir al dato** abre la sección del formulario (y la tarjeta del ítem), centra el campo, lo resalta y pone el cursor en él.
- **A19** resume cuántos datos de la DAM llevan la marca H* o POR VERIFICAR, con enlaces a los primeros.
- Resultado esperado: caso 1 → A01, A08, A19 y A20; caso 2 → A01, A08 y A19; ningún error.

## Cómo comprobar los cálculos y las validaciones (pruebas.html)

1. Haz doble clic en `pruebas.html` (o usa el enlace de `index.html`).
2. Arriba debe decir **"620 de 620 pruebas correctas"** en verde.
3. Cada grupo compara el valor esperado (las cifras de `PLAN.md` §9.1 y §9.2, controles de RUC, contenedor,
   IMEI y UN/LOCODE, y casos borde) con el obtenido. Una prueba que falla se ve en rojo y dice "✘ FALLA".
4. Los grupos F3-M1 a F3-M5 son pruebas de regresión de las correcciones de la auditoría de F3 (bultos exactos,
   tipo de cambio ausente, repartos con base cero, límites numéricos y explicación de la percepción); los grupos
   F4-M1 a F4-B1, de la auditoría de F4 (lugar convenido, series de celulares repetidas y seguro incompleto en CIF/CIP);
   los grupos F4.2, de los pendientes de las re-auditorías (variantes del lugar convenido y números como 1e-21).
6. Los grupos F5-1 a F5-9 prueban el formulario sin clics: que se genera desde el diccionario (un control por campo),
   que leer → escribir → leer conserva la operación, que cambiar la cantidad del ítem 1 del caso 1 cambia el valor de la
   factura y los bultos, los números pendientes (E20), las secciones condicionales, el editor de equipos, los ítems y
   sus marcas, los errores junto al campo y el rendimiento con 50 ítems. Los grupos F5.1 son las regresiones de la
   auditoría de F5 (dato no válido en un campo que deja de pedirse; largo máximo de series e IMEI).
   Los grupos F6-1 a F6-4 prueban los documentos: que las cifras que muestra cada uno cuadran con el cálculo, el importe
   en letras, que con errores no se generan y que la trazabilidad sale del diccionario. Los grupos F7-1 y F7-2 comprueban
   que bultos, peso bruto, volumen, contenedor y precinto del B/L y de las instrucciones son los de la lista de empaque,
   el VGM (carga + estiba + tara) y el contenido del borrador de B/L. El grupo F7.1 son las regresiones de la auditoría de F6/F7.
   El grupo F8a comprueba que las casillas del Formato A (series, 6.1–6.5, 7.30–7.34, S 7.26…) son las de `PLAN.md` §9.1 y §9.2
   y que la hoja A1 solo aparece con más de una serie. El grupo F8a.1 son las regresiones de la auditoría de F8a y el F8a.2,
   las de la revisión de Aarón (D17/D18: pesos con 2 decimales, casillas en blanco, nota RS 129 solo en celulares, 7.39 y S 13); el F8a.3, las de la
   auditoría de F8a.2 (estado de S 7.20 sin código y ayuda «?» accesible de cada casilla en blanco).
5. Los grupos 12 a 15 prueban las validaciones: los avisos exactos de cada caso y, para cada error E01–E19 y cada
   advertencia alcanzable, una copia del caso alterada a propósito que debe producir ese código.

Los números se muestran con coma de miles y punto decimal (decisión D10): `20,040.00`; en la DAM, `18,123.870` (Formatos A y C) y `21.705231` (Formato B).

**Huella de los datos:** es una comprobación rápida (cambia en cuanto editas un dato). Si cambia, los datos cambiaron; si coincide, casi
seguro son iguales, pero no es una garantía absoluta. Huellas esperadas al cargar los ejemplos:
caso 1 = `7945E0E3`, caso 2 = `C17FBFFE`.

## Cómo generar e imprimir los documentos

1. Carga un ejemplo o llena tu operación. Si la **Revisión** no tiene errores, en **4 Documentos** aparecen las pestañas:
   **FC** factura comercial, **PL** lista de empaque, **IE** instrucciones de embarque, **B/L** borrador del conocimiento de
   embarque (con la leyenda «BORRADOR – DRAFT»), **VGM** declaración de masa bruta verificada, **DAM A** y **DAM A1** (Formato A de la
   declaración aduanera; el A1 solo si hay más de una serie) y **HR** hoja resumen. Con algún error no se genera ninguno: la sección
   explica por qué y te lleva a «Revisión». Las advertencias no bloquean; la hoja resumen las lista.
2. Cada documento se ve en una hoja A4. En el celular la hoja se reduce al ancho de la pantalla; **Ver en tamaño real**
   la muestra a su tamaño (desliza dentro del recuadro gris).
3. **Imprimir este documento** o **Imprimir todos** abre el diálogo del navegador: Destino **Guardar como PDF**,
   Tamaño **A4**, márgenes **predeterminados**. Ctrl+P también imprime todos. Nunca se imprimen el formulario ni los paneles.
4. Cada página impresa lleva la marca de agua, el aviso «DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES», la
   referencia de la operación, la fecha de generación y «Página X de Y» (con «Imprimir todos», X de Y cuenta todas las
   hojas del archivo). Las marcas H* y POR VERIFICAR también salen impresas.
5. **Para estudiar:** la hoja resumen trae el **cuadro de cuadre** (lee las cifras que muestra cada documento y marca ✔ si
   coinciden), la **matriz Incoterms® 2020** con tu regla resaltada, los resultados clave, las advertencias, el recuento
   de datos H* y POR VERIFICAR (A19) y la **tabla de trazabilidad**, generada desde `js/diccionario.js`.

## Cómo leer la DAM didáctica (Formato A y A1)

- Es una **representación didáctica**: las casillas y su contenido siguen el instructivo DESPA-IT.00.04 (IT A para la
  importación, IT B para la exportación), pero el diseño gráfico oficial no está en la copia local (PV-23). La DAM real se
  transmite por vía electrónica y prevalece (IT IV.8). Solo en español.
- **Formato A** = cabecera (aduana, N° de orden, destinación, modalidad o tipo de despacho) + rubros 1 a 6 + la **serie 1**
  + rubros 8, 9 y las casillas reservadas. **Formato A1** = las series 2 en adelante (IT IV.1). Una serie agrupa los ítems
  con la misma subpartida (y, en importación, mismo origen, B/L, seguro, moneda…; §6.5).
- Cada casilla muestra su **número** («7.35»), su rótulo, el valor y, abajo en gris pequeño, la **fuente** («IT A 7.35»);
  al pasar el cursor también se ve.
- **Casilla en blanco** (solo número y rótulo) = el instructivo manda «No llenar», la llena otro (Aduana, funcionario,
  zona primaria…) o no aplica al régimen (por ejemplo, S 7.31 a 7.34 en la exportación). El motivo se lee con el botón
  **?** de la cabecera de la casilla (con el teclado: Tab hasta el botón y Enter; en el celular, tocándolo); también al pasar
  el cursor. Ese botón y su ayuda no se imprimen.
- **POR VERIFICAR** (amarillo) = no se puede afirmar con las fuentes de la carpeta: nunca se inventa (dígito verificador de
  la subpartida PV-27; reparto del flete y del seguro entre series PV-04). Una **PV pequeña** junto a un código en blanco
  = código oficial por verificar: se ve el nombre (banco, «Caja de cartón», razón social del agente) y el código queda en
  blanco (PV-09, PV-28; también el código del estado en S 7.20, porque la lista de IT C 5.16 es del Formato B). La «U» de la unidad física lleva una **S** pequeña (supuesto). **H*** = conocimiento general.
- El registro de aduana dice **«NO NUMERADA»**: el número, la fecha de numeración y el canal los pone SUNAT.
- Cifras con **3 decimales** en USD y fechas **DD MM AAAA** (IT IV.3, IV.4, IV.6); los **pesos en kg con 2 decimales**
  (decisión D17). La casilla **7.35** de importación lleva la nota del párrafo añadido por la **RS 129-2026** (series e IMEI
  de celulares, vigente desde el 05-10-2026) solo en las series de celulares (8517.13.00.00 u 8517.14.00.00).
- Para estudiar: compara 6.1 a 6.5 con la suma de las series (7.30 a 7.34) y con la hoja resumen; en el caso 1, la serie 2
  pesa poco y vale mucho, por eso recibe poco flete (reparto por peso) y su valor en aduana (11,346.370) es menor que su
  valor en la factura.

## Estado

En construcción, por fases. El plan completo está en `PLAN.md` (§10: fases; §11: decisiones).
Hechas: F1, F2, F2.1 (correcciones de la auditoría de F2), F3 (cálculos y página de pruebas), F4 (validaciones y
panel de errores y advertencias), F3.1, F4.1 y F4.2 (correcciones de las auditorías de F3 y F4), F5 (formulario editable), F5.1 (correcciones de la auditoría de F5), F6 (factura comercial, lista de empaque y hoja resumen), F7 (instrucciones de embarque, borrador de B/L y VGM), F7.1 (correcciones de la auditoría de F6/F7), F8a (DAM Formato A de ingreso y salida, con A1), F8a.1 (correcciones de la auditoría de F8a), F8a.2 (revisión de Aarón, D17/D18) y F8a.3 (correcciones de la auditoría de F8a.2).
Siguiente: **F8b** (DAM Formato B).
La carpeta `herramienta-comex/` es una versión anterior hecha con otra IA; solo se usa como referencia.
La carpeta `verificacion/` guarda las evidencias de cada fase (capturas y JSON).
