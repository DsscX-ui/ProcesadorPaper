# Documentos del transporte marítimo internacional (didáctico)

Herramienta **personal y didáctica** para cursos de Negocios Internacionales (Perú).
Todo lo que genera es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**: los datos de los ejemplos son ficticios y ningún
documento sirve para un trámite, un embarque ni un despacho.

## Qué hace

Ingresas **una sola vez** los datos de una operación marítima (importación o exportación, Perú, 1 contenedor FCL, USD) y la
herramienta **calcula** (bultos, pesos, volumen, VGM, FOB, flete y seguro por serie, valor en aduana, tributos, percepción),
**revisa** la operación (errores que bloquean y advertencias que explican) y **genera los documentos**, todos leídos de la
misma fuente de datos, así que pesos, bultos, valores y partes coinciden siempre:

factura comercial, lista de empaque, instrucciones de embarque, borrador de B/L, declaración VGM, DAM Formato A (y A1),
en la importación DAM Formato B (y B1) y Formato C, certificado de seguro (si hay seguro), certificado de origen (si se pide
trato preferencial) y una **hoja resumen** con el cuadre entre documentos y la trazabilidad de cada dato.

## Cómo abrirla (sin servidor ni internet)

1. Abre la carpeta del proyecto.
2. Haz doble clic en `index.html`. Se abre en el navegador (probada en **Google Chrome**; Edge no está verificado, ver
   «Límites conocidos») sin instalar nada: no usa servidor, librerías ni conexión a internet.

## Flujo de trabajo

La página tiene cuatro pasos, siempre a mano en la **barra fija de arriba** (que también dice si hay **cambios sin guardar**):

1. **Ejemplo o datos:** carga **Caso 1** o **Caso 2**, crea una operación **Nueva** o usa **Abrir JSON**.
2. **1 Datos** (formulario): edita lo que quieras; cada cambio recalcula todo al instante.
3. **2 Revisión:** contador de errores y advertencias; cada aviso explica qué pasa y te lleva al dato («→ Ir al dato»).
4. **3 Resultados del cálculo:** las cifras paso a paso (FOB, series, prorrateos, tributos), con su fórmula.
5. **4 Documentos:** una pestaña por documento, en hoja A4.
6. **Imprimir / PDF:** «Imprimir este documento» o «Imprimir todos» → Guardar como PDF (ver «Cómo generar e imprimir»).
7. **Guardar JSON** para conservar tu trabajo.

## Los dos casos de ejemplo (`PLAN.md` §9, datos 100 % ficticios)

- **Caso 1 — Importación CIF Callao** (`OP-2026-001`): proveedor de Ningbo (China) → importador de Lima; 3 ítems
  (ventiladores de pie de 16" y 18" y un cargador USB-C) en **2 series**; con póliza de seguro. Genera 12 documentos: FC, PL,
  IE, B/L, VGM, DAM A, A1, B, B1, C, **SEG** y HR (sin CO). Cifras clave: factura 20,040.00; FOB 18,123.870; tributos 4,222.709;
  percepción 849.195; suma asegurada 22,044.00 y prima 66.13. Advertencias esperadas: A01, A08, A19 y A20.
- **Caso 2 — Exportación FOB Callao con certificado de origen** (`OP-2026-002`): exportador de Lima → comprador de Santiago
  (Chile), por San Antonio; 2 ítems (polos y sudaderas de algodón) en 2 series; TLC Perú–Chile, sin seguro. Genera 9
  documentos: FC, PL, IE, B/L, VGM, DAM A, A1, **CO** y HR (sin SEG ni Formatos B y C). Cifras clave: factura 39,550.00;
  peso bruto 1,588.00 kg; 140 bultos. Advertencias esperadas: A01, A08 y A19. El criterio de origen queda vacío a propósito
  (POR VERIFICAR).

## Guardar, Abrir y respaldo

- **Caso 1 / Caso 2:** cargan los ejemplos. Puedes editarlos.
- **Nueva:** crea una operación con los valores sugeridos del plan (consignatario = comprador, notify = consignatario,
  cobertura 110 %, 3 originales del B/L, forma de envío 1/1…), todos editables.
- **Guardar JSON:** descarga la operación como archivo `.json`. **Ese archivo es tu copia de trabajo.**
- **Abrir JSON:** vuelve a cargar un `.json` guardado antes. Se revisa todo el archivo; si tiene algún problema
  (no es JSON, le faltan datos, trae tipos o campos que no corresponden, pesa más de 2 MB o tiene más de 200 ítems)
  se muestra el motivo y **lo que está en pantalla no cambia**.
- **Respaldo del navegador:** ver «Respaldo automático y cómo recuperar». Es solo un respaldo; la copia real es el `.json`.

## Marcas que verás (H, H*, S, PV)

| Marca | Qué significa | Cómo se ve |
|---|---|---|
| **H** | Hecho con fuente en la carpeta (se cita el documento y la sección, por ejemplo «IT A 7.35») | Sin resaltar; la fuente está en el botón «?» y en la trazabilidad |
| **H\*** | Conocimiento general, **sin fuente en la carpeta** (por ejemplo, Incoterms®, IGV 16 %, UN/LOCODE) | Etiqueta gris «H\*» |
| **S** | **SUPUESTO**: decisión de diseño o dato ficticio del ejemplo | Etiqueta «SUPUESTO» (en la DAM, una **S** pequeña) |
| **PV** | **POR VERIFICAR** (PV-01 a PV-31, `PLAN.md` §8.3): no se puede afirmar con las fuentes de la carpeta; **nunca se inventa** | Resaltado amarillo «POR VERIFICAR» (en la DAM, una **PV** pequeña junto a un código en blanco) |

Las marcas H\* y POR VERIFICAR también salen impresas. La hoja resumen (A19) cuenta cuántos datos de la DAM las llevan.

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
- **Errores (E01–E23), en rojo:** bloquean los documentos. Mientras haya uno, los documentos no se generan.
  E20 significa que un número no se pudo usar (no es número, supera su máximo o tiene decimales de más): la revisión y
  los resultados quedan en pausa hasta corregirlo. Cada error también se marca en rojo junto a su campo del formulario.
- **Advertencias (A01–A26), en naranja:** no bloquean. Explican algo que conviene revisar o un dato POR VERIFICAR.
  C01 y C02 son avisos del propio cálculo: C01, un reparto hecho en partes iguales porque su base suma 0
  (por ejemplo, flete con pesos brutos en 0); C02, ajustes sin ningún ítem marcado como objeto de ajuste.
- Cada aviso dice **qué pasa**, **por qué importa** y **cómo corregirlo**, con su **fuente** y su **marca**
  (H, H*, SUPUESTO o POR VERIFICAR). Si varios avisos son de la misma regla, se agrupan bajo su código.
- El botón **→ Ir al dato** abre la sección del formulario (y la tarjeta del ítem), centra el campo, lo resalta y pone el cursor en él.
- **A19** resume cuántos datos de la DAM llevan la marca H* o POR VERIFICAR, con enlaces a los primeros.
- Resultado esperado: caso 1 → A01, A08, A19 y A20; caso 2 → A01, A08 y A19; ningún error.
- Caso AA4 FINAL (`casos/AA4_portuaria_camote_CIF_FINAL.json`) → A01, A08, A19, A23, A25; S 6.5 = **34,050.000**. El RUC 10754001220 de ALFAZ se conserva por decisión del usuario (A25 lo advierte). La regresión incluye el defecto original y verifica que el cuadre lo detecta.
- En exportación se cruza el valor de factura con S 6.1; en CFR/CIF, el Valor FOB de la factura más S 6.4 debe coincidir con S 6.5. El cuadro compara cada documento con sus propios decimales (2 o 3). CPT/CIP/D queda por verificar (PV-31).

## Cómo comprobar los cálculos y las validaciones (pruebas.html)

1. Haz doble clic en `pruebas.html` (o usa el enlace de `index.html`).
2. Arriba debe decir **"777 de 777 pruebas correctas"** en verde.
3. Cada grupo compara el valor esperado (las cifras de `PLAN.md` §9.1 y §9.2, controles de RUC, contenedor,
   IMEI y UN/LOCODE, y casos borde) con el obtenido. Una prueba que falla se ve en rojo y dice "✘ FALLA".
4. Los grupos F3-M1 a F3-M5 son pruebas de regresión de las correcciones de la auditoría de F3 (bultos exactos,
   tipo de cambio ausente, repartos con base cero, límites numéricos y explicación de la percepción); los grupos
   F4-M1 a F4-B1, de la auditoría de F4 (lugar convenido, series de celulares repetidas y seguro incompleto en CIF/CIP);
   los grupos F4.2, de los pendientes de las re-auditorías (variantes del lugar convenido y números como 1e-21).
5. Los grupos F5-1 a F5-9 prueban el formulario sin clics: que se genera desde el diccionario (un control por campo),
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
   auditoría de F8a.2 (estado de S 7.20 sin código y ayuda «?» accesible de cada casilla en blanco). El grupo F8b comprueba el
   Formato B: FOB unitario 5.9 de cada ítem (17.635500 · 21.705231 · 3.707978), sección 8 (8.1.1, 8.3.1 = 1,850.000000,
   8.4 = 66.130000) y FOB total 18,123.870000 = A 6.1 (`PLAN.md` §9.1); que el B1 aparece con 3 ítems y desaparece con 2 o
   menos; que la exportación no genera Formato B; y alteraciones a propósito (ajustes, pago a crédito, intermediario). El grupo F8b.1 comprueba
   que la casilla del declarante del Formato B queda en blanco. El grupo F8c comprueba el Formato C: tributos por serie y totales de
   `PLAN.md` §9.1 (IGV 3,289.859 · IPM 411.232 · total 4,222.709), 3.1–3.5 = A 6.1–6.5, 4.13 = Total, 4.8 POR VERIFICAR, la percepción (849.195)
   fuera del formato, el pago en soles con tipo de cambio 3.500 y que la exportación no genera Formato C. El grupo F9 comprueba los
   certificados: el caso 1 (CIF con póliza) genera SEG y no CO; el caso 2 (FOB sin seguro, TLC Perú–Chile) genera CO y no SEG;
   suma asegurada 22,044.00 y prima 66.13 (= desglose de la factura); bultos, peso bruto y contenedor = lista de empaque; criterio
   de origen POR VERIFICAR; y variantes: FOB sin seguro ni preferencia (sin SEG ni CO), CIF (SEG con 43,505.00 y 130.52), FOB con
   seguro voluntario (A12), fechas posteriores al embarque (A11, A13), importación con preferencia (CO), datos que faltan (E04, E01:
   no se genera nada) y texto con etiquetas HTML (se muestra como texto). El grupo F9.1 son las regresiones de la auditoría de F9
   (marca del asegurado y del beneficiario, riesgo en CIF y CIP, filas SEG y CO de la trazabilidad). El grupo F10 comprueba la
   impresión: que ningún documento de ambos casos es más ancho que el área útil de A4 (182 mm; si lo fuera, Chrome reduciría
   todo el PDF), el estilo compacto de la lista de empaque, que dentro de las hojas solo hay botones «?» (no se imprimen) y el
   área táctil del «?». El grupo F10.1 comprueba la lista de ayudas fuera de la hoja (un botón por «?», mismo texto, ids únicos,
   44 px de alto) y que el dígito verificador de la subpartida figura como POR VERIFICAR, no como dato derivado.
6. Los grupos 12 a 15 prueban las validaciones: los avisos exactos de cada caso y, para cada error E01–E23 y cada
   advertencia alcanzable, una copia del caso alterada a propósito que debe producir ese código.

Los números se muestran con coma de miles y punto decimal (decisión D10): `20,040.00`; en la DAM, `18,123.870` (Formatos A y C) y `21.705231` (Formato B).

**Huella de los datos:** es una comprobación rápida (cambia en cuanto editas un dato). Si cambia, los datos cambiaron; si coincide, casi
seguro son iguales, pero no es una garantía absoluta. Huellas esperadas al cargar los ejemplos:
caso 1 = `7945E0E3`, caso 2 = `C17FBFFE`.

## Cómo generar e imprimir los documentos

1. Carga un ejemplo o llena tu operación. Si la **Revisión** no tiene errores, en **4 Documentos** aparecen las pestañas:
   **FC** factura comercial, **PL** lista de empaque, **IE** instrucciones de embarque, **B/L** borrador del conocimiento de
   embarque (con la leyenda «BORRADOR – DRAFT»), **VGM** declaración de masa bruta verificada, **DAM A** y **DAM A1** (Formato A de la
   declaración aduanera; el A1 solo si hay más de una serie), **DAM B** y **DAM B1** (Formato B, declaración del valor: solo en la
   importación; el B1 solo si hay más de 2 ítems), **DAM C** (Formato C, liquidación de tributos: solo en la importación), **SEG**
   certificado de seguro (solo si «¿Hay seguro?» = Sí; obligatorio en CIF y CIP), **CO** certificado de origen (solo si se pide
   trato preferencial) y **HR** hoja resumen (dice por qué hay o no SEG y CO). Con algún error no se genera ninguno: la sección
   explica por qué y te lleva a «Revisión». Las advertencias no bloquean; la hoja resumen las lista.
2. Cada documento se ve en una hoja A4. En el celular la hoja se reduce al ancho de la pantalla; **Ver en tamaño real**
   la muestra a su tamaño (desliza dentro del recuadro gris). Los botones **?** de la hoja tienen un área de toque mayor que
   el círculo que se ve (24 × 24 px a tamaño real y en los certificados). Con la hoja reducida (celular), los «?» de la DAM
   quedan demasiado juntos para el dedo; por eso, **debajo de la hoja** aparece **«Ayudas de las casillas de esta hoja»**: una
   lista, en letra normal, con un botón grande por casilla que abre la misma ayuda. También puedes usar **Ver en tamaño real**.
   Esa lista solo se ve con la hoja reducida y no se imprime.
3. **Imprimir este documento** o **Imprimir todos** abre el diálogo del navegador: Destino **Guardar como PDF**,
   Tamaño **A4**, márgenes **predeterminados**, escala **predeterminada (100 %)**. Ctrl+P también imprime todos. Nunca se
   imprimen el formulario, los paneles ni los botones «?». Desde F10 **todos los documentos caben en el ancho de A4**: el PDF
   sale al 100 %, sin reducir ni recortar, tanto con un documento como con «Imprimir todos» (antes «Imprimir todos» salía
   al ~89 % por la lista de empaque).
   Páginas medidas en Chrome (verificacion/F10/resultado.txt) — caso 1: FC 1, PL 1, IE 1, B/L 1, VGM 1, DAM A 2, A1 1, B 3,
   B1 1, C 2, SEG 2 (el certificado en la 1.ª, el cuadro didáctico de la prima en la 2.ª), HR 4 = **20 páginas**; caso 2: FC 1,
   PL 1, IE 1, B/L 1, VGM 1, DAM A 2, A1 1, CO 2 (observaciones, declaración, certificación y nota van juntas en la 2.ª),
   HR 3 = **13 páginas**. Si tu operación tiene más ítems, habrá más páginas.
4. Cada página impresa lleva la marca de agua, el aviso «DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES», la
   referencia de la operación, la fecha de generación y «Página X de Y» (con «Imprimir todos», X de Y cuenta todas las
   hojas del archivo). Las marcas H* y POR VERIFICAR también salen impresas.
5. **Para estudiar:** la hoja resumen trae el **cuadro de cuadre** (lee las cifras que muestra cada documento y marca ✔ si
   coinciden), la **matriz Incoterms® 2020** con tu regla resaltada, los resultados clave, las advertencias, el recuento
   de datos H* y POR VERIFICAR (A19) y la **tabla de trazabilidad**, generada desde `js/diccionario.js`.

## Cómo leer la DAM didáctica (Formatos A, A1, B, B1 y C)

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
  **?** de la cabecera de la casilla (con el teclado: Tab hasta el botón y Enter; en el celular, tocándolo o desde la lista
  «Ayudas de las casillas de esta hoja», debajo de la hoja); también al pasar el cursor. Ese botón y su ayuda no se imprimen.
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

### Formato B y B1 (declaración del valor, solo importación)

- Lo formula el **importador** (o su representante; nunca el agente de aduana, que lo transmite) y declara **cómo se llega al
  valor**: quién vende (rubro 3: proveedor y su condición), cómo se pagó (rubro 4: naturaleza, forma de envío, medio de pago y,
  si es a crédito, los datos del pago diferido), cada **ítem** (rubro 5), si hubo intermediario (6), las condiciones de la venta
  (7: vinculación, cánones, etc.) y la **determinación del valor** (sección 8). En la exportación no hay Formato B (IT IV.1).
- **Formato B** = rubros 1 a 4, los **ítems 1 y 2** y los rubros 6 a 8. **Formato B1** = los ítems 3 en adelante: solo aparece
  con **más de 2 ítems** (IT IV.1). Un ítem = un tipo de mercancía (igual especie, calidad, valor, origen); no es lo mismo que
  una serie del Formato A (7.2 dice qué ítems forman cada serie).
- Cifras con **6 decimales** (IT IV.3): el FOB unitario del ventilador de 16" es **17.635500**.
- La casilla **5.9** (FOB unitario) sale de la **sección 8**: FOB total según el Incoterm (en CIF: 8.1.1 − 8.3.1 − 8.4) repartido
  según el valor de cada ítem y dividido entre su cantidad. El **cuadro didáctico** del final del Formato B lo muestra paso a paso
  (no es parte del formato). El «FOB total del ítem» y el «ajuste total del ítem» van en casillas **sin número**: son pasos
  del cálculo, no casillas del instructivo.
- Los rótulos de **8.1.2, 8.1.3 y 8.1.5** no están en la copia del instructivo: se describe su contenido con **POR VERIFICAR**.
  Un monto 0 de la sección 8 deja la casilla en blanco. Las respuestas del rubro 7 del caso 1 son supuestos del ejemplo (**S**
  pequeña; decisiones D1 y D7): 7.4 = Sí; 7.2, 7.3 y 7.6 quedan en blanco porque solo se responden si hay vinculación o condiciones.

### Formato C (liquidación de tributos, solo importación)

- Lo formula el despachador de aduana y dice **cuánto se paga**: el valor en aduana (rubro 3: 3.1 a 3.5, los mismos de A 6.1 a 6.5),
  los tributos (rubro 4) y el pago en soles (rubro 5). En la exportación no hay Formato C (IT IV.1).
- El **cuadro por serie** del rubro 4 muestra cómo se calcula: por cada serie, ad valorem = valor en aduana × tasa; **base del IGV** =
  valor en aduana + ad valorem + sobretasa + específico + ISC (el antidumping queda fuera); IGV 16 % y IPM 2 % sobre esa base. Luego se
  suma: las casillas 4.1 a 4.7 y la **4.13 Total** son los totales de la declaración (caso 1: 4,222.709).
- **4.8 servicio de despacho** dice POR VERIFICAR (PV-02): la herramienta no inventa su monto. **4.9** queda en blanco (no aplica en v1).
  Un monto en 0 deja su casilla en blanco (también 3.4 si no hay ajustes); el rubro 2 (registro de aduana) queda en blanco: lo llena la Aduana.
- **Rubro 5:** total en soles = total en USD × tipo de cambio venta, con 2 decimales (supuesto); la fecha y la fuente del tipo de cambio
  (PV-07) también se muestran. La forma de pago se llena a mano al pagar.
- La **percepción del IGV** no es una casilla del Formato C: va en el recuadro naranja «FUERA DEL FORMATO C», con su base (valor en
  aduana + tributos, **incluido** el antidumping: H* Ley 29173, PV-17), su tasa (PV-01, un valor por operación) y el total en soles.

### Certificado de seguro (SEG) y certificado de origen (CO)

- Son **formatos referenciales didácticos**: cada aseguradora tiene su modelo de certificado y cada acuerdo comercial fija el
  formulario del certificado de origen, quién lo emite y los criterios de origen (**PV-12**, recuadro «FORMATO REFERENCIAL»).
- **SEG** solo aparece si hay seguro. En CIF y CIP lo contrata el vendedor a favor del comprador; con seguro voluntario en otro
  Incoterm, el documento muestra la advertencia **A12** y como asegurado a quien corre el riesgo. Asegurado y beneficiario
  llevan la marca H\* «Supuesto según el Incoterm; confirmar con la póliza». **Suma asegurada** = base × % de
  cobertura (caso 1: 20,040.00 × 110 % = 22,044.00). La **prima** (66.13) no va en el cuerpo del certificado (PLAN §6.4): el cuadro
  didáctico del final muestra cómo se calcula y en qué documentos aparece (factura, DAM, hoja resumen).
- **CO** solo aparece si se pide trato preferencial. El caso 2 deja el **criterio de origen** vacío a propósito y marcado
  POR VERIFICAR: el certificado lo muestra así, sin inventarlo. El país de destino sale del UN/LOCODE del puerto de descarga.
- Lo que no está en el formulario queda **en blanco** con el motivo en el botón «?» (D17). Si la fecha del certificado es posterior
  al embarque, el documento muestra la advertencia de la revisión (**A11** seguro, **A13** origen).
- Bultos, peso bruto, valor, contenedor y precinto son los de la lista de empaque y la factura; la hoja resumen los compara
  (filas «Suma asegurada» y «Prima» con seguro; columnas SEG y CO).

## Fuentes usadas y sus fechas

Las fuentes normativas son **copias locales** en `herramienta-comex/referencias/` (`PLAN.md` §8.2). La herramienta no consulta
SUNAT, VUCE ni el arancel.

| Abrev. | Documento | Versión / fecha | Archivo |
|---|---|---|---|
| IT | Instructivo «Declaración Aduanera de Mercancías (DAM)» DESPA-IT.00.04, versión 2 (RSNAA 041-2010/SUNAT/A) | Copia consolidada; la última modificación que incluye es la RSN 000349-2025-SUNAT (31-12-2025) | `despa-it.00.04.htm` |
| CC | Control de cambios de la RS 129-2026 sobre el IT | Publicación 10-07-2026; vigencia 05-10-2026 | `cc-it.00.04-129-2026.htm` |
| RS129 | Resolución de Superintendencia N.º 000129-2026/SUNAT (08-07-2026) | Vigencia 05-10-2026 | `RS-000129-2026-SUNAT.pdf` |
| — | Tablas generales de SUNAT, DESPA-PG.01 y DESPA-PG.02 | **Pendientes (F0b): POR VERIFICAR** | (no están en la carpeta) |

- Las copias **no se han contrastado con el portal de SUNAT** (PV-30): al 28-09-2026 el acceso a `www.sunat.gob.pe` desde el
  entorno de construcción estaba bloqueado (fase F0b pendiente).
- Lo que se cita sin copia en la carpeta va con la marca **H\*** y sin fecha: Incoterms® 2020 (ICC), Ley del IGV e IPM,
  Ley 29173 (percepción), D. Leg. 1053 (Ley General de Aduanas), códigos UN/LOCODE, ISO 3166, ISO 6346, ISO 668, SOLAS (VGM),
  UCP 600 y el dígito verificador del RUC por módulo 11. Su versión y vigencia quedan **POR VERIFICAR**. El Arancel 2022
  (D.S. 404-2021-EF) se cita según el art. 2 de la RS129.

## Límites conocidos

- **Documento didáctico, no válido para trámites.** Datos ficticios (sufijo «— FICTICIA», RUC 200000000XX); la DAM sale «NO NUMERADA».
- **Fuentes sin contrastar** con el portal de SUNAT (F0b sin acceso a sunat.gob.pe; PV-30).
- **Diseño de la DAM:** las casillas y su contenido siguen el instructivo, pero el diseño gráfico oficial del anexo no está en la
  copia local (PV-23): la disposición es didáctica.
- **Alcance v1:** un contenedor FCL, una factura y un proveedor, USD, vía marítima, destinaciones 10 y 40; sin LCL, carta de crédito,
  drawback, despacho simplificado ni certificados sanitarios (`PLAN.md` §1).
- **Navegadores:** probada en Google Chrome (escritorio y ancho de celular de 390 px). **Edge y la lectura con lector de pantalla no
  están verificados** (D16). Con «Imprimir todos», «Página X de Y» cuenta todas las hojas del archivo, no las de cada documento (D16).
- **Puntos POR VERIFICAR abiertos** (`PLAN.md` §8.3): PV-01 percepción · PV-02 tasa de despacho · PV-03 despacho simplificado ·
  PV-04 prorrateo de flete y seguro entre series · PV-06 tabla de seguros · PV-07 tipo de cambio · PV-08 método de redondeo ·
  PV-09 códigos de tablas abiertas · PV-10 arancel y 4 dígitos nacionales · PV-11 tasas · PV-12 certificado de origen por acuerdo ·
  PV-13 DAM de exportación · PV-14 factura · PV-15 UN/LOCODE de otros puertos · PV-16 contenedores · PV-17 antidumping ·
  PV-18 dígito del RUC · PV-19 que los datos ficticios no sean reales · PV-20 mercancía restringida · PV-21 descripciones mínimas ·
  PV-24 nombre del código 0-0 · PV-25 destinaciones 40 y 41 · PV-26 casilla A 3.4 · PV-27 dígito verificador de la subpartida ·
  PV-28 código o RUC en el Callao · PV-29 pagos mixtos · PV-30 fidelidad de las copias · PV-31 deducciones S 6.3 en CPT/CIP/D. Cerrados: PV-05, PV-22 (estructura) y
  PV-23 (contenido; el diseño gráfico sigue sin copia).

## Dudas abiertas para Aarón

La herramienta mantiene el comportamiento actual en cada una hasta que decidas:

1. **Ceros en la DAM:** el Formato A muestra «0.000» (A 6.4, 7.33, S 6.3, S 6.4) y los Formatos B y C dejan los montos en 0 en blanco. ¿Se unifica?
2. **Registro de aduana:** los Formatos A, A1 y B dicen «NO NUMERADA»; en el C el rubro 2 queda en blanco. ¿Se unifica?
3. **Numeración «1.1» del importador en el Formato C** [verificar]: el instructivo no la numera de forma explícita (PV-23).
4. **Fecha del tipo de cambio del caso 1:** el ejemplo no la trae (tipo de cambio 3.500, supuesto didáctico) y en el Formato C queda en blanco; ¿se agrega una fecha al ejemplo? (PV-07).
5. **Firma «____» en la casilla A 8** (despachador): ¿línea de firma o casilla en blanco?
6. **Redacción de la prima en el certificado de seguro** (`PLAN.md` §6.4): hoy la prima no va en el cuerpo del certificado, solo en el cuadro didáctico.
7. **Campo propio de «asegurado»:** hoy se deduce del Incoterm (marca H\* «confirmar con la póliza»).
8. **Marca PV-12 del criterio de origen** en el certificado de origen.
9. **6 decimales en el Formato B** (IT IV.3) frente a 3 en A y C.
10. **8.1.2, 8.1.3 y 8.1.5 del Formato B:** sus rótulos no están en la copia del instructivo (POR VERIFICAR).
11. **«FOB total del ítem» y «ajuste total del ítem»** del Formato B van en casillas sin número.
12. **Edge y lector de pantalla** sin verificar (D16).
13. **F0b:** contrastar las fuentes con el portal de SUNAT cuando haya acceso (PV-30).
14. **Paginación:** el certificado de origen ocupa 2 páginas (el cierre con las firmas va junto en la 2.ª); para dejarlo en 1 habría que
    reducir la letra. El certificado de seguro deja en la 2.ª página solo el cuadro didáctico de la prima.

## Estado

**Todas las fases están terminadas (F1 a F10); queda solo la revisión de Aarón.** El plan completo está en `PLAN.md`
(§10: fases; §11: decisiones). F0b (verificación de fuentes en el portal de SUNAT) sigue pendiente de acceso.
Hechas: F1, F2, F2.1 (correcciones de la auditoría de F2), F3 (cálculos y página de pruebas), F4 (validaciones y
panel de errores y advertencias), F3.1, F4.1 y F4.2 (correcciones de las auditorías de F3 y F4), F5 (formulario editable), F5.1 (correcciones de la auditoría de F5), F6 (factura comercial, lista de empaque y hoja resumen), F7 (instrucciones de embarque, borrador de B/L y VGM), F7.1 (correcciones de la auditoría de F6/F7), F8a (DAM Formato A de ingreso y salida, con A1), F8a.1 (correcciones de la auditoría de F8a), F8a.2 (revisión de Aarón, D17/D18), F8a.3 (correcciones de la auditoría de F8a.2), F8b (DAM Formato B de la declaración del valor, con B1), F8b.1 (correcciones de la auditoría de F8b), F8c (DAM Formato C, liquidación), F8c.1 (correcciones de la auditoría de F8c), F9 (certificado de seguro y certificado de origen), F9.1 (correcciones de la auditoría de F9) **F10** (ajustes de impresión, esta guía y revisión final) y **F10.1** (correcciones de la auditoría de F10: ayudas «?» para el celular y cobertura del dígito verificador).
La carpeta `herramienta-comex/` es una versión anterior hecha con otra IA; solo se usa como referencia (y guarda las copias de las fuentes).
La carpeta `verificacion/` guarda las evidencias de cada fase (capturas, PDF y resultados de las pruebas en Chrome).

Los montos, tasas, tributos, tara, estiba y plazos admiten valores desde 0; el porcentaje de pago diferido no supera 100. En el formulario usa punto decimal: «0,500» se rechaza; para 0.5 escribe «0.500».

E23 bloquea fechas inexistentes o mal escritas en los campos que se piden; A22 advierte cronologías imposibles de VGM, embarque, a bordo, B/L y término. No se compara la formulación de la DAM con el embarque: la regla de numeración requiere verificación.

A23 avisa si el tipo de contenedor carece de capacidad interior o peso bruto máximo de referencia. Los reefer 22R1 y 45R1 están en el selector, sin capacidades inventadas: revisa placa CSC y naviera (PV-16).

Los archivos se guardan en formato de operación v3 (masa VGM pesada, temperatura y ventilación). Abrir acepta v2 y lo migra a v3 con aviso; guarda de nuevo para conservar el formato actualizado. Otras versiones se rechazan.

VGM: el método 1 utiliza la masa pesada del contenedor lleno; el método 2 suma carga, estiba y tara. El método 1 muestra la suma y su diferencia solo como referencia; no se aplica una tolerancia sin fuente.

A24 avisa de un reefer sin consigna o de una temperatura en un contenedor seco. Temperatura y ventilación se piden para los reefer; la temperatura aparece en las instrucciones y en el borrador de B/L. AA4 FINAL usa formato v3 con −20 °C, ya indicado en la evidencia.

A25 avisa si un RUC 10 acompaña una razón social de sociedad (importador, exportador o agentes). El RUC de ALFAZ se conserva por decisión expresa. A26 avisa si la prima supera 5 %: umbral didáctico configurable en `NORMATIVA.valores.tasaPrimaPlausibleMaxPct`, no es norma.
