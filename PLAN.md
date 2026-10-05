# PLAN — Generador didáctico de documentos del transporte marítimo internacional

> **Estado:** plan **v2 aprobado**. Fases hechas: F1, F2, **F2.1** (correcciones de la auditoría de F2 y decisiones D1–D9, §11), **F3** (cálculos y `pruebas.html`), **F4** (validaciones y panel «Revisión de la operación»), **F3.1** (correcciones de la auditoría de F3), **F4.1** (correcciones de la auditoría de F4) , **F4.2** (pendientes menores de las re-auditorías) **F5** (formulario editable), **F5.1** (correcciones de la auditoría de F5) **F6** (factura comercial, lista de empaque y hoja resumen) **F7** (instrucciones de embarque, borrador de B/L y VGM) y **F7.1** (correcciones de la auditoría de F6/F7) **F8a** (DAM Formato A de ingreso y salida, con A1) **F8a.1** (correcciones de la auditoría de F8a) **F8a.2** (revisión de Aarón del Formato A, decisiones D17 y D18) **F8a.3** (correcciones de la auditoría de F8a.2) **F8b** (DAM Formato B de la declaración del valor, con B1) **F8b.1** (correcciones de la auditoría de F8b) **F8c** (DAM Formato C de la liquidación) **F8c.1** (correcciones de la auditoría de F8c) **F9** (certificado de seguro y certificado de origen) y **F9.1** (correcciones de la auditoría de F9; `pruebas.html`: 755 de 755 pruebas correctas). **Fase actual: F10 (ajustes de impresión, `LEEME.md` y revisión final) pendiente de lanzar.** Revisión de Aarón al final de cada fase.
> **Aviso:** todo lo que genere esta herramienta es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**.

**Marcas que usa este plan (y que se verán en la herramienta)**

| Marca | Significado | Cómo se verá en la herramienta |
|---|---|---|
| **[H]** | Hecho con fuente en la carpeta. Se cita el documento y la sección (§8.2). | Sin resaltar. La fuente aparece con el botón "?" de cada campo (accesible con teclado y toque) y en la tabla de trazabilidad. |
| **[H\*]** | Hecho de conocimiento general, **sin fuente en la carpeta**. | Etiqueta gris "H\*" junto al dato, con la nota "conocimiento general; no verificado con fuentes de la carpeta". |
| **[S]** | Supuesto: decisión de diseño o dato ficticio. | Etiqueta "SUPUESTO" en los datos del ejemplo. |
| **[PV-xx]** | POR VERIFICAR. No se afirma. | Resaltado amarillo con la etiqueta "POR VERIFICAR". |

**Abreviaturas de fuentes** (detalle en §8.2)

- **IT** = instructivo DESPA-IT.00.04. Se cita por literal:
  - **IT A**: Formato A, ingreso de mercancías.
  - **IT B**: Formato A, salida de mercancías.
  - **IT C**: Formato B.
  - **IT D**: Formato C.
  - **IT IV.n**: numeral n de las reglas generales.
- **RS129** = Resolución de Superintendencia N.º 000129-2026/SUNAT.

En §4 a §7 se escribe "Formato A" o "casilla A 7.1" para el formulario de la DAM. "IT A" siempre se refiere a la sección del instructivo.

---

## 1. Objetivo y alcance

Ingresas **una sola vez** los datos de una operación marítima (importación o exportación, Perú) y la herramienta genera los documentos. Todos leen de la misma fuente de datos, así que pesos, bultos, volumen, valores y partes coinciden siempre.

**Alcance de la versión 1**

- Una operación = 1 factura, 1 proveedor, 1 B/L, **1 contenedor FCL** y N ítems [S].
- Moneda del contrato: **USD** [S].
- Importación para el consumo (**destinación 10**) y exportación definitiva (**destinación 40**), vía marítima (**código 1**) [H: IT A y B "DESTINACIÓN"; IT A 3.3].
- **DAM con sus tres formatos** [H: IT IV.1]:
  - **A** (datos generales y series), con hoja **A1** si hay más de una serie. Hay versión de ingreso y de salida.
  - **B** (declaración del valor; solo importación), con hoja **B1** si hay más de 2 ítems.
  - **C** (liquidación de tributos; solo importación).
- Acepta los 11 Incoterms® 2020, con reglas específicas para los 4 exclusivamente marítimos [H\*].
- **Regla de IMEI y número de serie** para celulares (subpartidas 8517.13.00.00 y 8517.14.00.00): solo como validación y prueba, sin caso de ejemplo [H: RS129 art. 1].
- La herramienta **no consulta** SUNAT, VUCE ni el arancel. Tasas, subpartidas y códigos los ingresa el usuario o salen de listas cerradas con su marca [H], [H\*] o [PV].

**Fuera de alcance en v1:**

- Carga LCL o consolidada, varios contenedores, varias facturas o proveedores.
- Otras monedas, carta de crédito, drawback o restitución (casilla B 7.28).
- Declaración simplificada (DS, código 18; RS129 anexo V).
- Certificados sanitarios o fitosanitarios.
- Clasificación arancelaria automática y conexión con sistemas reales.

---

## 2. Stack propuesto y justificación

**Elección:** una página web **local**: HTML + CSS + JavaScript, **sin librerías, sin instalación y sin servidor**.

**Cómo la usarías:** doble clic en `index.html` → se abre en Chrome o Edge → llenas el formulario o cargas un ejemplo → revisas los documentos → *Imprimir → Guardar como PDF*. Cada operación se guarda en un archivo `.json` con los botones "Guardar" y "Abrir".

| Criterio | **HTML + JS local (elegido)** | Excel / Google Sheets | Python (Streamlit u otro) |
|---|---|---|---|
| Instalación | Ninguna, solo el navegador | Ninguna | Python + librerías |
| Número variable de ítems | Fácil | Frágil (rangos fijos) | Fácil |
| Validaciones cruzadas | Completas | Limitadas | Completas |
| Documentos imprimibles en A4 | CSS de impresión nativo | Se descuadran con facilidad | Requiere librería de PDF |
| Revisión en GitHub | Archivos de texto legibles | Archivo binario | Texto |
| Funciona sin internet | Sí | Excel sí, Sheets no | Sí |

**Desventaja honesta:** el mantenimiento del JavaScript lo haré yo. Tú solo necesitarías editar `normativa.js` (tasas, listas y umbrales) y los ejemplos.

**Decisiones técnicas para que funcione con doble clic** [H\*]: Chrome bloquea los módulos JS y `fetch` cuando se abren archivos locales con `file://`. Por eso:

- Scripts JS "clásicos", sin módulos y sin `fetch`.
- Los ejemplos van incrustados en un archivo JS. Las operaciones del usuario se abren con el selector de archivos.
- Autoguardado opcional en el navegador, solo como respaldo. La copia real es siempre el `.json`.

**Estructura prevista**

```
ProcesadorPaper/
├── index.html            ← se abre con doble clic
├── pruebas.html          ← verifica cálculos y reglas (verde/rojo)
├── LEEME.md              ← guía de uso, fecha de las fuentes y límites
├── PLAN.md
├── fuentes/              ← documentos oficiales descargados de SUNAT (F0b), con fecha
├── css/estilos.css       ← pantalla + impresión A4 + marca de agua
└── js/
    ├── diccionario.js    ← ÚNICA lista de campos: rótulo, ayuda, documentos, casilla DAM, fuente y marca
    ├── normativa.js      ← tasas, umbrales y listas de códigos, cada uno con fuente y marca H/H*/PV
    ├── incoterms.js      ← matriz Incoterms® 2020 (§6.8) y fórmulas FOB de IT C 5.9 (§6.3)
    ├── modelo.js         ← estructura de datos vacía, guardar y abrir
    ├── ejemplos.js       ← casos 1 y 2 (§9)
    ├── calculos.js       ← ÚNICO lugar donde se calcula y redondea
    ├── validaciones.js   ← errores y advertencias (§7)
    ├── formulario.js     ← formulario editable, GENERADO desde diccionario.js (F5); no calcula
    ├── pantalla.js       ← conecta la interfaz (botones, formulario, revisión, resultados, documentos, respaldo); no calcula (D3)
    └── documentos/       ← una plantilla por documento; solo leen, no calculan (F6+)
        ├── comun.js      ← registro, marco de la hoja A4 (marca de agua, aviso, pie), formato e importe en letras
        ├── factura.js    ← factura comercial (FC)
        ├── packing.js    ← lista de empaque (PL)
        ├── bl.js         ← instrucciones de embarque, borrador de B/L y declaración VGM (BL, F7)
        └── resumen.js    ← hoja resumen, de cuadre y de trazabilidad (HR); va al final porque lee a las demás
```

- **`herramienta-comex/`** es solo referencia: no se copia ni se reutiliza su código.
- Mientras no se habilite F0b, las fuentes se citan desde `herramienta-comex/referencias/`.

**Principios**

- **Fuente única:** datos (`.json`) → `calculos.js` → un único resultado → cada plantilla solo lo muestra.
- **Diccionario único:** el formulario, la ayuda por campo y la tabla de trazabilidad (§5) salen de `diccionario.js`. Así no hay dos listas que puedan contradecirse.

---

## 3. Documentos que genera

| # | Documento | Quién lo emite en la realidad | Cuándo se genera | Nota |
|---|---|---|---|---|
| 1 | Factura comercial (*Commercial Invoice*) | Vendedor/exportador | Siempre | — |
| 2 | Lista de empaque (*Packing List*) | Vendedor/exportador | Siempre | — |
| 3 | Instrucciones de embarque + borrador de B/L + **declaración VGM** | Embarcador (instrucciones y VGM); naviera (B/L) | Siempre | VGM obligatorio en contenedores según SOLAS, desde el 1-jul-2016 [H\*]. |
| 4 | **DAM (representación didáctica)**: Formato A (+A1); en importación también B (+B1) y C | Despachador de aduana; el Formato B lo formula el importador [H: IT C, "Declarante del Formato B"] | Siempre | Casillas numeradas como en IT A a D [H]. La DAM real prevalece en su versión electrónica [H: IT IV.8]. |
| 5 | Certificado de seguro de transporte | Aseguradora, a pedido de quien contrata el seguro | Obligatorio en CIF y CIP; opcional en los demás | — |
| 6 | Certificado de origen (formato referencial) | Entidad certificadora o autocertificación, según el acuerdo | Solo si se solicita trato preferencial | Formato por acuerdo: PV-12. |
| 7 | **Hoja resumen, de cuadre y de trazabilidad** | No es un documento comercial | Siempre | Muestra que bultos, pesos, volumen y valores coinciden en todos los documentos. Incluye la matriz Incoterm y la tabla de trazabilidad (§5). |

**Considerados y no incluidos en v1:**

- Certificados sanitarios o fitosanitarios: dependen del producto.
- Factura electrónica de exportación de SUNAT (PV-14).
- Manifiesto de carga: lo transmite el transportista; solo se usa su estructura de número en la casilla A 3.2.
- Aviso de llegada y carta de crédito.

**Marcas en cada documento**

- Marca de agua diagonal.
- Encabezado "DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES" y pie con la referencia de la operación y la fecha de generación.
- En la DAM, el recuadro "Registro de aduana" dice **"NO NUMERADA"**: el número lo asigna SUNAT [H: IT A rubro 2]. Sí se llena el **N° de orden**, porque lo asigna el declarante [H: IT A "Nº ORDEN"].
- Cada casilla de la DAM muestra su número (ej. "7.35").
- Las casillas modificadas por normas recientes llevan una nota de fuente, por ejemplo: "7.35 — párrafo añadido por RS 129-2026, vigente desde el 05-10-2026".
- Los datos [H\*] muestran la etiqueta gris y los datos PV, el resaltado amarillo, también en el PDF impreso.

---

## 4. Campos de entrada

Obl. = obligatorio. Cond. = obligatorio solo en el caso indicado. Las casillas de la DAM se escriben así: A = Formato A de importación, S = Formato A de exportación, B = Formato B, C = Formato C.

### A. Datos generales de la operación

**A1. Operación**

| Campo | Formato / opciones | Obl. |
|---|---|---|
| Tipo de operación | Importación / Exportación | Sí |
| Referencia interna | Texto (ej. OP-2026-001) | Sí |
| Modalidad de carga | FCL (única opción en v1) | Sí |

**A2. Partes.** Cada parte tiene razón social, dirección, ciudad, país (ISO 3166 alfa-2 [H\*]) e identificación fiscal.

| Parte | Notas | Casilla DAM | Obl. |
|---|---|---|---|
| Vendedor / proveedor / exportador | En importación: dirección exacta, ciudad, país, teléfono y correo opcionales, **condición** (1 fabricante, 2 distribuidor, 3 comerciante, 4 otro) [H: IT C 3.2]. En exportación: RUC. | B 3.1–3.9 / S 1.1–1.4 | Sí |
| Comprador / importador | En importación: RUC, **código de documento** (derivado: 4 = RUC) [H: IT A 1.2] y **UBIGEO** [H\*]. | A 1.1–1.4, B 1.1–1.2 | Sí |
| Consignatario | Por defecto, el comprador; o "A la orden de…" | Sin casilla | Sí |
| Parte a notificar (*Notify party*) | Por defecto, el consignatario | Sin casilla | Sí |
| Naviera | Nombre | Sin casilla (A 3.1 es el agente marítimo) | Sí |
| **Agente marítimo** | Razón social + RUC o código (PV-28) | A 3.1 / S 3.1 | Sí |
| Agente de aduana (declarante) | Razón social + RUC o código (PV-28) | A 8 / S 8 | Sí |
| **Depósito temporal** | Razón social + RUC o código (PV-28) | A 4.1 / S 4.1 | Sí |
| **Entidad financiera** | Nombre + código (PV-09) | A 5.1 / S 5.1 | Sí |
| Aseguradora | — | — | Cond.: si hay seguro |
| Productor | Si es distinto del exportador | — | Cond.: si hay CO |
| Entidad emisora del CO | — | — | Cond.: si hay CO |

**A3. Ruta**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Puerto de embarque | Nombre + UN/LOCODE [H\*]. Que SUNAT use el mismo código: PV-09. | A 7.6 / S 7.6 | Sí |
| Puerto de descarga | Nombre + UN/LOCODE [H\*] | Exportación: se transmite con S 7.27 [H] | Sí |
| País de embarque | Derivado del puerto de embarque | B 5.8 | — |
| País de adquisición | Por defecto, el país del proveedor | A 7.27 | Sí (import.) |
| País de destino | Derivado del puerto de descarga | S 7.27 | — |
| Lugar de recepción / de entrega | Solo si hay transporte combinado | — | No |

**A4. Condiciones comerciales**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Incoterm | Lista de los 11 de Incoterms® 2020 | B 5.4 | Sí |
| Lugar convenido | Texto; se valida contra los puertos (§7, E03) | B 5.4 | Sí |
| Versión del Incoterm | Derivada: 4 = Incoterms 2020 [H: IT C 5.4] | B 5.4 | — |
| Moneda + código | USD (v1); código PV-09 | A 7.29, B 5.5 | Sí |
| N° y fecha de factura | Texto + fecha | A 7.36, B 5.2–5.3 / S 7.36 | Sí |
| Modalidad de pago | Lista cerrada: 1 contado, 2 crédito, 6 anticipado, 7 otras, 8 mixto, 9 sin pago [H: IT A 5.2]. Pago mixto: PV-29. | A 5.2 / S 5.2 | Sí |
| Medio de pago | Lista cerrada 01–14 (ej. 09 transferencia de fondos) [H: IT C, rubro 4, "Otros datos" a] | B, rubro 4 | Cond.: importación |
| Datos de pago diferido | % del pago diferido, plazo, evento, fecha [H: IT C, "Otros datos" g–k] | B, rubro 4 | Cond.: importación con modalidad 2 |
| N° de contrato u orden de compra | Texto | — | No |

**A5. Aduana (Perú)**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Aduana de despacho | Código + nombre (ej. 118 – Marítima del Callao [H\*]) | Cabecera; S 3.7 | Sí |
| Destinación | Derivada: 10 o 40 [H]. El código 41 existe, pero su diferencia con el 40 es PV-25. | Cabecera | — |
| Modalidad de despacho | Importación: 1-0 anticipado, 0-0 "excepcional" (PV-24), 0-1 urgencia, 0-2 socorro [H: IT A]. Exportación: **no aplica** [H: IT B]. | Cabecera | Cond.: importación |
| Tipo de despacho | Importación: sin lista en el IT, queda vacío (PV). Exportación: 00 normal [H: IT B]. | Cabecera | Cond.: exportación |
| N° de orden | Año + 6 caracteres; lo asigna el declarante [H: IT A "Nº ORDEN"]; valor [S] | Cabecera | Sí |
| Fecha de formulación | Fecha | A 8 / S 8 | Sí |
| Tipo de cambio S/ por USD + fecha + fuente | 3 decimales. Se usa el tipo venta de la fecha de pago [H: IT D rubro 5]; la fuente es PV-07. | C rubro 5 | Cond.: importación |
| Región de destino | Lista cerrada (ej. 40615 Lima) [H: IT A 7.37 l] | A 7.37 | Cond.: importación |

**A6. Declaración del valor (Formato B, solo importación)**

| Campo | Opciones | Casilla | Obl. |
|---|---|---|---|
| Nivel comercial del importador | 1 fabricante, 2 mayorista, 3 minorista, 4 detallista, 5 otros [H: IT C 1.3] | B 1.3 | Sí |
| Naturaleza de la transacción | Lista (ej. 11 compra/venta a precio firme) [H: IT C 4.1] | B 4.1 | Sí |
| Forma de envío | 1/1 por defecto [H: IT C 4.2] | B 4.2 | Sí |
| Tipo de valor | 1 definitivo, 2 provisional [H: IT C 5.6] | B 5.6 | Sí |
| ¿Hubo intermediario? | Sí / No (No por defecto); si es Sí, sus datos [H: IT C 6.1–6.7] | B 6 | Sí |
| Condiciones de la transacción | Preguntas 7.1 a 7.14 (vinculación, pagos indirectos, cánones, etc.) [H: IT C 7]. **Sin respuesta por defecto:** dependen de la operación. 7.2 y 7.3 solo se responden si 7.1 = Sí; 7.6, si 7.5 = Sí. Las respuestas de los ejemplos son [S] (D1, D7). | B 7 | Sí |

### B. Datos específicos del embarque

**B1. Mercancía (uno por ítem)**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Nombre del producto | Nombre común (ej. "ventilador de pie") | B 5.12 | Sí |
| Descripción y características | Según la estructura de A 7.35: denominación, presentación, material, uso y otras. En exportación, en español [H: IT B 7.35]. Descripciones mínimas: PV-21. | A 7.35, B 5.19 / S 7.35 | Sí |
| Marca y modelo | Texto | B 5.13–5.14 | Sí |
| Subpartida nacional | 10 dígitos + casilla "verificada". Sus 6 primeros dígitos son del SA [H\*]. | A 7.19 / S 7.19 | Sí |
| Dígito verificador de la subpartida | Queda vacío con la marca PV-27 | A 7.19 | — |
| País de origen | ISO alfa-2 [H\*]. En exportación, la casilla lleva el UBIGEO del lugar de fabricación [H: IT B 7.26]. | A 7.26, B 5.7 / S 7.26 | Sí |
| Estado | Lista cerrada (10 nuevo, 20 usado, etc.) [H: IT C 5.16]. En exportación, el código de S 7.20 es PV-09. | B 5.16 / S 7.20 | Sí |
| Cantidad + unidad comercial | Número + código de unidad | A 7.10, B 5.11 | Sí |
| Unidad física | Según la subpartida (ej. "U"; RS129 anexo VI 6.4 la cita como ejemplo) (PV-09) | A 7.16 / S 7.16 | Sí |
| Precio unitario | USD, en el Incoterm pactado | B 8.1.1 (total) | Sí |
| **Equipos: número de serie e IMEI** | Un registro por equipo: `equipos: [{serie, imeis: [..]}]`; un equipo puede tener más de un IMEI (D9) [H: RS129 art. 1] | A 7.35 | Cond.: E17 |
| ¿Ítem objeto de ajuste? | Sí / No (Sí por defecto). Solo los ítems marcados reciben los ajustes (§6.5) [H: IT C 5.10] | B 5.10 | Cond.: si hay ajustes |

**B2. Embalaje y pesos (uno por ítem)**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Tipo de bulto + código de clase de bulto | Caja de cartón, pallet, saco…; código PV-09 | A 7.13 / S 7.13 | Sí |
| Unidades por bulto | Entero > 0 | — | Sí |
| Peso neto por bulto (kg) | 2 decimales | A 7.14 (total de la serie) | Sí |
| Peso bruto por bulto (kg) | 2 decimales | A 7.15 (total de la serie) | Sí |
| Medidas del bulto (cm) | Largo × ancho × alto | Sin casilla | Sí |
| Marcas de embarque | Texto, una para todo el embarque | A 9 / S 9 | Sí |

**B3. Contenedor (uno en v1)**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Tipo | 20' DV (ISO 22G1) / 40' DV (42G1) / 40' HC (45G1) [H\*] | — | Sí |
| Número | ISO 6346: 4 letras + 6 dígitos + dígito de control [H\*] | A 9 / S 9 | Sí |
| Precinto | Texto | A 9 / S 9 | Sí |
| Unidad de carga | Derivada: 02 contenedores [H: IT A 7.37 k] | A 7.37 | — |
| Tara (kg) | Según la placa del contenedor (PV-16) | Sin casilla | Sí |
| Estiba y trincaje (kg) | Por defecto 0 | Sin casilla | No |
| Método VGM + responsable + fecha | 1 (pesaje del contenedor lleno) / 2 (suma de pesos) [H\*] | Sin casilla | Sí |

**B4. Transporte**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| Nave y viaje | Texto | Sin casilla en importación para el consumo | Sí |
| N° de booking | Texto | — | Sí |
| N° de B/L | Texto (en el borrador puede ir vacío) | A 7.8 / S 7.8 | Cond.: DAM |
| Tipo de B/L y N° de originales | Nominativo / A la orden; 3 por defecto | — | Sí |
| Lugar y fecha de emisión del B/L; fecha "shipped on board" | Texto + fechas | — | Sí |
| Cláusulas SLAC / STC | Sí / No | — | No |
| Flete en el B/L | *Prepaid* / *collect*. Dato editable; la herramienta sugiere el usual según el Incoterm (§6.8) y A05 avisa si difiere (D8) | — | Sí |
| Embarcador (*shipper*) si no es el vendedor | Texto | — | No |
| N° de manifiesto | Aduana – año – número [H: IT A 3.2]; número [S] | A 3.2 / S 3.2 | Cond.: DAM |
| Fecha de embarque | Fecha | A 7.7 | Sí |
| Fecha de término de embarque (exportación) | Fecha del último bulto a bordo [H: IT B 3.4] | S 3.4 | Cond.: exportación |
| ETA y fecha de término de descarga | Fechas. En despacho anticipado, la casilla 3.4 es PV-26. | A 3.4 | Sí / Cond. |

**B5. Seguro**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| ¿Hay seguro? | Sí / No (forzado a "Sí" en CIF y CIP) | — | Sí |
| Tipo de seguro | Derivado: 1 no asegurada, 2 póliza individual, 3 póliza flotante, 4 no asegurada en su totalidad [H: IT A 7.32] | A 7.32 | — |
| N° de póliza, N° de certificado y fecha de emisión | Texto + fecha | — | Cond. |
| Cláusulas | ICC (A) / (B) / (C) 2009 + guerra + huelgas [H\*] | — | Cond. |
| % de cobertura | Por defecto 110 % | — | Cond. |
| Tasa de prima (%) | Número | — | Cond. |
| Lugar de pago de siniestros y agente de reclamos | Texto | — | Cond. |
| % de la tabla SUNAT si no hay póliza | Número (PV-06) | A 7.32 | Cond.: importación sin seguro |

**B6. Origen y preferencias**

| Campo | Formato | Casilla DAM | Obl. |
|---|---|---|---|
| ¿Se solicita trato preferencial? | Sí / No | — | Sí |
| Acuerdo comercial | Texto | — | Cond. |
| Criterio de origen | Texto (PV-12) | — | Cond. |
| N° y fecha del certificado | Texto + fecha. En exportación, la casilla S 7.9 no se llena [H: IT B 7.9]. | A 7.9 | Cond. |
| Código TPI | PV-09 | A 7.23 | Cond.: importación con preferencia |

**B7. Valoración (USD)**

| Campo | Casilla | Obl. |
|---|---|---|
| Flete internacional | B 8.3.1 → A 6.2 y 7.31 | Cond.: CFR, CIF, CPT, CIP, grupo D y toda importación |
| Seguro (prima) | B 8.4 → A 6.3 y 7.32 | Cond.: si hay seguro |
| Gastos hasta el lugar de embarque, solo en EXW (nombre exacto de la casilla: PV) | B 8.1.5 | Cond.: EXW |
| Otros gastos no facturados (FCA, FAS u otros) | B 8.1.6 | No (0 por defecto) |
| Monto no incluido en 8.1.1 (rótulo exacto: **POR VERIFICAR**; por la pregunta 7.7 podría ser "pagos indirectos") [H: IT C 8.1 y 5.10] | B 8.1.2 → ajuste | No (0 por defecto) |
| Descuento incluido, distinguido y deducido en la factura (rótulo exacto: **POR VERIFICAR**; por la pregunta 7.8 podría ser "descuentos retroactivos") [H: IT C 8.1 y 5.10] | B 8.1.3 → ajuste | No (0 por defecto) |
| Otros descuentos no aceptables [H: IT C 8.1] | B 8.1.4 → ajuste | No (0 por defecto) |
| Adiciones: comisiones, envases, cánones, etc. | B 8.2.1–8.2.5 → A 6.4 y 7.33 | No (0 por defecto) |
| Gastos de descarga y entrega en destino | B 8.3.2 | Cond.: grupo D |
| Deducciones: gastos posteriores, montaje, tributos, intereses, otros | B 8.5.1–8.5.5 | No (0 por defecto) |
| Exportación: otros gastos deducibles / ajustes | S 6.3 / S 6.4 | Cond.: exportación que no es FOB |

**B8. Tributos (solo importación; las tasas van por ítem y deben coincidir dentro de una serie, E16; la percepción, por operación)**

| Campo | Casilla | Fuente de la tasa |
|---|---|---|
| Tasa ad valorem (%) | C 4.1 | Dato del usuario (PV-11) |
| Sobretasa, derecho específico, ISC | C 4.2–4.4; código "Tipo" en A 7.20 | Dato del usuario (PV-11) |
| Derechos antidumping o compensatorios | C 4.7; A 7.20 y 7.37 f) | Dato del usuario (PV-17) |
| Tasa de percepción del IGV (%) — **un solo valor por operación** (D2, D6). Nota visible: la tasa depende del importador y, en algunos casos, de la mercancía (bienes usados, exclusiones). | Fuera del Formato C | Dato del usuario (PV-01) |

### C. Datos derivados (no se ingresan; los calcula la herramienta)

- Destinación, versión del Incoterm, código de documento, países de embarque y destino, tipo de seguro y unidad de carga.
- **Agrupación de ítems en series** (§6.5).
- Bultos, pesos y volumen.
- FOB total, FOB por ítem y FOB unitario, ajustes por ítem, flete y seguro por serie, valor en aduana y tributos.
- Suma asegurada y prima.
- Flete *prepaid* o *collect* **sugerido** según el Incoterm (el valor del B/L es un dato editable, D8).
- VGM y numeración correlativa de bultos.

---

## 5. Tabla de trazabilidad (qué campo alimenta cada documento)

FC = factura comercial · PL = lista de empaque · BL = instrucciones de embarque / B/L / VGM · SEG = certificado de seguro · CO = certificado de origen · HR = hoja resumen.

En la herramienta, esta tabla **se genera desde `diccionario.js`** y se imprime en la hoja resumen. Cada entrada del diccionario declara su `marca` (H, H\*, S o PV) y su `fuente` (ej. "IT C 5.9", "RS129 art. 1" o "—"); la casilla DAM se guarda por operación (importación / exportación) y solo se muestra la que aplica.

| Campo o grupo | FC | PL | BL | DAM (casilla) | SEG | CO | HR |
|---|:-:|:-:|:-:|---|:-:|:-:|:-:|
| Tipo de operación | | | | Cabecera: destinación 10 / 40 | | | ● |
| Referencia interna | ● | ● | ● | Pie (sin casilla) | ● | ● | ● |
| Vendedor / proveedor / exportador | ● | ● | ● *Shipper* | B 3.1–3.9 / S 1.1–1.4 | ● asegurado en CIF/CIP | ● | ● |
| Comprador / importador | ● | ● | ● *Consignee* si es nominativo | A 1.1–1.4, B 1.1–1.2 / exportación: sin casilla | ● beneficiario | ● | ● |
| Consignatario y notify | ● | | ● | Sin casilla | | | |
| Naviera | | | ● | Sin casilla | | | ● |
| Agente marítimo | | | | A 3.1 / S 3.1 | | | |
| Agente de aduana (declarante), N° de orden | | | | A 8 / S 8, cabecera | | | |
| Depósito temporal | | | | A 4.1 / S 4.1 | | | |
| Entidad financiera, modalidad y medio de pago | ● condiciones | | | A 5.1–5.2 / S 5.1–5.2; B rubro 4 | | | |
| Puerto de embarque | ● | ● | ● | A 7.6 / S 7.6 | ● trayecto | ● ruta | ● |
| Puerto de descarga | ● | ● | ● | Exportación: con S 7.27 | ● trayecto | ● ruta | ● |
| País de origen | ● | | | A 7.26, B 5.7 / S 7.26 (UBIGEO) | | ● | |
| País de adquisición / embarque / destino | | | | A 7.27, B 5.8 / S 7.27 | | ● destino | |
| Incoterm + lugar + versión | ● | | ● prepaid/collect | B 5.4 / S 6.1–6.5 | ● activa el documento | | ● |
| Moneda | ● | | | A 7.29, B 5.5 | ● | | ● |
| N° y fecha de factura | ● | ● | | A 7.36, B 5.2–5.3 / S 7.36 | ● | ● | ● |
| Aduana, destinación, modalidad, tipo de despacho | | | | Cabecera; S 3.7 | | | |
| Tipo de cambio | | | | C rubro 5 | | | ● |
| Nombre, descripción, marca, modelo | ● | ● | ● genérica | A 7.35; B 5.12–5.14, 5.19 / S 7.35 | ● genérica | ● | |
| Números de serie e IMEI (8517.13 / 8517.14) | ● | | | A 7.35 (RS129) | | | |
| Subpartida + dígito verificador | ● SA | | ● SA, opcional | A 7.19 / S 7.19 | | ● SA | |
| Estado | | | | B 5.16 / S 7.20 | | | |
| Cantidad y unidad comercial / física | ● | ● | | A 7.10, 7.16; B 5.11 / S 7.16 | | ● | |
| Precio unitario y valor | ● | | | B 8.1.1, 5.9; A 7.29–7.30 / S 6.1, 7.30 | ● base | ● | ● |
| Ajustes | | | | A 6.4, 7.33; B 5.10 y sección 8 | | | ● |
| Tributos, TPI | | | | A 7.20, 7.23; C 3.1–4.9 | | | ● |
| Tipo, clase y N° de bultos | ● | ● | ● | A 7.12–7.13 / S 7.12–7.13, S 13.2 | ● | ● | ● |
| Peso neto | ● | ● | | A 7.14 / S 7.14 | | | ● |
| Peso bruto | ● | ● | ● | A 7.15 / S 7.15 | | ● | ● |
| Medidas y volumen | | ● | ● | Sin casilla | | | ● |
| Marcas | | ● | ● | A 9 / S 9 | ● | ● | |
| Contenedor y precinto | | ● | ● | A 9, 7.37 k / S 9 | ● | | ● |
| Tara y VGM | | | ● VGM | Sin casilla | | | ● |
| Nave y viaje | | | ● | Sin casilla (sí el manifiesto: A 3.2 / S 3.2) | ● | ● | ● |
| Fechas de embarque / llegada / descarga | | | ● | A 7.7, 3.4 / S 3.4 | ● | ● | ● |
| N° de B/L | | | ● | A 7.8 / S 7.8 | ● | | |
| Flete | ● desglose C/D | | ● prepaid/collect | A 6.2, 7.31; B 8.3.1 | | | ● |
| Prima / seguro | ● desglose CIF/CIP | | | A 6.3, 7.32; B 8.4 | ● | | ● |
| Póliza, cláusulas, % de cobertura | | | | Tipo de seguro en A 7.32 | ● | | ● |
| Acuerdo, criterio, N° de CO | | | | A 7.9, 7.23 / S 7.9 no se llena | | ● | |
| Región de destino | | | | A 7.37 l | | | |
| Declaración del valor (nivel, condición, naturaleza, envío, tipo de valor, rubros 6 y 7) | | | | B 1.3, 3.2, 4.1, 4.2, 5.6, 6, 7 | | | |

---

## 6. Cálculos

### 6.1 Decimales y redondeo

- **Documentos comerciales** (factura, lista de empaque, B/L, seguro, CO, hoja resumen): montos con 2 decimales [S].
- **DAM:**
  - Formatos A y C: cifras no enteras con **3 decimales** [H: IT IV.3]. **Excepción (D17, decisión de Aarón):** los pesos en kg de A 7.14 y 7.15 (y S 7.14, 7.15) van con **2 decimales** [S], como en los documentos comerciales («1,780.00»).
  - Formato B: cifras no enteras con **6 decimales** [H: IT IV.3].
  - Montos en USD [H: IT IV.4].
  - Fechas DD MM AAAA [H: IT IV.6].
- **Método de redondeo:** mitad hacia arriba [S]; el método oficial es PV-08.
- Los cálculos internos se hacen con enteros (centavos o milésimos) para evitar errores de coma flotante [S].
- **Prorrateos:** cada parte se redondea y la diferencia se asigna a la última, para que la suma cuadre exacta [S].
- Pesos en kg con 2 decimales; volumen en m³ con 3 decimales [S]. El volumen por bulto se redondea a 3 decimales y el de la línea es ese valor × bultos, para que la lista de empaque cuadre a la vista.
- **Implementación (F3):** cada cifra es un decimal fijo (entero + cantidad de decimales); productos y divisiones con `BigInt`. La mitad se redondea alejándose de cero [S; PV-08]. Si la base de un prorrateo es 0 y hay un monto no nulo que repartir entre 2 o más partes (FOB por ítem, ajustes, flete o seguro por serie, FOB de exportación), se reparte en partes iguales y se informa con la advertencia C01 [S; D12].
- **Bultos (F3.1):** se calculan con los enteros exactos de cantidad y unidades por bulto (milésimos), sin redondear antes el cociente: 3,000.001 unidades en cajas de 100 son 31 bultos y avisan E06.
- **Rango seguro y límites de entrada (F3.1)** [S]: ninguna cifra interna puede salir del rango de enteros exactos de JavaScript (±2^53 − 1 en su unidad mínima); si saliera, el cálculo se detiene con un mensaje claro en lugar de redondear en silencio. Para que eso no ocurra con datos razonables, cada dato numérico tiene un máximo y una cantidad máxima de decimales (`Modelo.limitesNumero`), que se aplican al **Abrir** y al **calcular**: cantidad ≤ 1,000,000 (3 decimales); precio unitario ≤ 1,000,000 (6); unidades por bulto ≤ 1,000,000 (3); pesos por bulto, tara y estiba ≤ 100,000 kg (2); medidas ≤ 10,000 cm (1); montos de la sección 8 y de exportación ≤ USD 1,000,000,000 (2); sobretasa, derecho específico, ISC y antidumping ≤ USD 1,000,000,000 (3); porcentajes ≤ 1,000 (4); tipo de cambio ≤ 1,000 (3); N° de originales ≤ 100 y plazo ≤ 10,000 días (enteros). Además, el **valor total de la factura no puede superar USD 1,000,000,000**.
- **Pago en soles sin tipo de cambio válido (F3.1):** si el tipo de cambio está vacío, es 0 o negativo, los pagos en soles quedan **no calculados** (no 0.00) y se informa E15.
- **Formato de números en pantalla y documentos** [S] (decisión D10): **coma de miles y punto decimal**: "20,040.00" (documentos comerciales), "18,123.870" (DAM, Formatos A y C), "21.705231" (Formato B); negativos con "−". Es la convención que el estudiante ve en las facturas comerciales en USD y en la DAM impresa. Las cantidades enteras van sin decimales ("3,000"). Las tablas de este plan conservan el espacio como separador por legibilidad; la herramienta usa la coma.

### 6.2 Mercancía y embalaje

- **Valor de línea** = cantidad × precio unitario.
- **Valor de la factura (Vc)** = Σ valores de línea. Es el valor en el Incoterm pactado y corresponde a la casilla B 8.1.1.
- **Bultos de línea** = cantidad ÷ unidades por bulto. En v1 la división debe ser exacta [S].
- **Peso neto de línea** = bultos × peso neto por bulto. El peso bruto se calcula igual.
- **Volumen por bulto** (m³) = largo × ancho × alto (cm) ÷ 1 000 000. **Volumen de línea** = volumen por bulto × bultos.
- **Totales** = Σ líneas. Los bultos se numeran de forma correlativa.

### 6.3 FOB y valor en aduana

**Importación: FOB total según el Incoterm** [H: IT C 5.9]

| Incoterm | FOB total = | En palabras |
|---|---|---|
| EXW | 8.1.1 + 8.1.5 + 8.1.6 − 8.5.4 − 8.5.5 | Precio + gastos hasta el embarque |
| FCA, FAS, FOB | 8.1.1 + 8.1.6 − 8.5.4 − 8.5.5 | Precio (+ otros gastos no facturados) |
| CFR, CPT | 8.1.1 + 8.1.6 − 8.3.1 − 8.5.4 − 8.5.5 | Precio − flete |
| CIF, CIP | 8.1.1 + 8.1.6 − 8.3.1 − 8.4 − 8.5.4 − 8.5.5 | Precio − flete − seguro |
| DAP, DPU | 8.1.1 + 8.1.6 − 8.3.1 − 8.3.2 − 8.5.1 − 8.5.4 − 8.5.5 | Precio − flete − gastos en destino − gastos posteriores. **No se resta el seguro.** |
| DDP | 8.1.1 + 8.1.6 − 8.3.1 − 8.3.2 − (8.5.1 + … + 8.5.5) | Además se restan los derechos y tributos incluidos (8.5.3) |

- **Valor en aduana** = FOB + flete + seguro + ajustes (suma de las casillas 6.1 a 6.4) [H: IT A 6.5]. Por serie: 7.30 + 7.31 + 7.32 + 7.33 [H: IT A 7.34].
- **Flete:** desde el puerto de embarque hasta el puerto de destino [H: IT A 6.2]. Si el flete real del B/L difiere del de la factura, la diferencia va a 8.1.6 o a 8.5.5 [H: IT C 8.3.1]. En v1 se asume que coinciden [S].
- **Seguro:** la prima pagada. Si no hay póliza, se usa la "Tabla de Porcentajes Promedio de Seguro" [H: IT C 8.4]; sus porcentajes son PV-06.
- **Exportación, FOB por ítem:** S 6.5 se reparte según el valor de cada ítem, con el mismo criterio de IT C 5.9 [S]; S 7.30 = Σ FOB de los ítems de la serie.
- **Exportación:** valor según la cláusula de venta (S 6.1) − otros gastos deducibles (S 6.3; en CFR o CIF) + ajustes (S 6.4; en EXW) = **valor neto de entrega, que es el FOB** (S 6.5). Su suma debe ser igual a la de S 7.30 [H: IT B 6.1–6.5].

### 6.4 Seguro

- **Suma asegurada** = base × % de cobertura.
  - En CIF y CIP, la base es Vc y la cobertura mínima es 110 % [H\*: Incoterms® 2020].
  - En los demás Incoterms, la base es FOB + flete [S, editable].
- **Prima** = suma asegurada × tasa de prima, con 2 decimales. Aparece en la factura (desglose CIF/CIP), en la DAM y en la hoja resumen, no en el certificado.
- **Tipo de seguro** para A 7.32: se deriva de los datos (póliza flotante = 3, individual = 2, sin seguro = 1) [H].

### 6.5 Ítems, series y prorrateo (DAM)

- **Ítem** (Formato B): cada tipo de mercancía de igual especie, calidad, valor, origen y procedencia. No se agrupan mercancías distintas aunque tengan la misma subpartida [H: IT C 5.1].
- **Serie** (Formato A): la herramienta **agrupa automáticamente** los ítems que comparten subpartida nacional, documento de transporte, certificado de origen, tipo de seguro, moneda, país de origen y país de adquisición [H: IT A 7.1, 7.8, 7.9, 7.26, 7.27]. En exportación, subpartida y país de destino [H: IT B 7.1, 7.27].
- **FOB por ítem** = FOB total × (valor del ítem en el Incoterm ÷ Vc) [H: IT C 5.9]. **FOB unitario** = FOB del ítem ÷ cantidad comercial, con 6 decimales [H: IT C 5.9].
- **Ajuste por ítem** [H: IT C 5.10]:
  - Ajuste total = 8.1.2 + 8.1.3 + 8.1.4 + 8.2.1 + 8.2.2 + 8.2.3.1 + 8.2.3.2 + 8.2.3.3 + 8.2.3.4 + 8.2.4 + 8.2.5.
  - Se reparte **solo entre los ítems marcados como "objeto de ajuste"**, en proporción al valor facturado de cada uno sobre el valor facturado de los ítems ajustados. Los ítems no marcados reciben 0.
  - Ajuste unitario (B 5.10) = ajuste del ítem ÷ cantidad comercial, con 6 decimales.
  - Si hay ajuste y ningún ítem está marcado, se reparte entre todos y se informa (F4 lo convertirá en advertencia) [S].
- **Ajuste de la serie** (A 7.33) = Σ ajustes de sus ítems; A 6.4 = Σ 7.33 [H: IT A 6.4, 7.33].
- **FOB de la serie** (A 7.30) = Σ FOB de sus ítems [H: IT A 7.29–7.30].
- **Flete de la serie** (A 7.31) = flete × (peso bruto de la serie ÷ peso bruto total) [S; PV-04: el IT no fija el criterio].
- **Seguro de la serie** (A 7.32) = seguro × (FOB de la serie ÷ FOB total) [S; PV-04].
- **Valor en aduana de la serie** (A 7.34) = 7.30 + 7.31 + 7.32 + 7.33 [H].
- **Bultos:** si un bulto lleva mercancía de dos series, se cuenta en la primera y se pone 0 en las demás [H: IT A 7.12]. En v1 no ocurre, porque cada bulto lleva un solo ítem [S].

### 6.6 Liquidación (Formato C, importación, por serie y luego sumada)

| Casilla | Concepto | Fórmula | Fuente de la tasa |
|---|---|---|---|
| C 3.1–3.5 | FOB, flete, seguro, ajuste, valor en aduana (VA) | Los mismos valores de §6.3 [H: IT D 3] | — |
| C 4.1 | Ad valorem (AV) | VA × tasa AV | Dato del usuario (PV-11) |
| C 4.2 | Sobretasa A/V | Dato | PV-11 |
| C 4.3 | Derecho específico | Dato | PV-11 |
| C 4.4 | ISC | Dato | PV-11 |
| — | **Base del IGV** | VA + AV + sobretasa + derecho específico + ISC | [H\*: art. 13 de la Ley del IGV]. El antidumping queda fuera [S; PV-17]. |
| C 4.6 | IGV | 16 % × base | [H\*], en `normativa.js` |
| C 4.5 | IPM | 2 % × base | [H\*], en `normativa.js` |
| C 4.7 | Antidumping o compensatorio | Dato | PV-17 |
| C 4.8 | Servicio de despacho | No se calcula; se muestra "POR VERIFICAR" | PV-02 |
| C 4.9 | Interés compensatorio | No aplica en v1 [S] | — |
| Fuera del C | **Percepción del IGV** | tasa × (VA + tributos del Formato C, incluido el antidumping); un valor por operación (D2) | PV-01 (no figura entre las casillas del Formato C); antidumping en la base: [H\*: Ley 29173, sin fuente en la carpeta] y PV-17, visibles en la herramienta (D11) |
| C rubro 5 | Pago en soles | monto en USD × tipo de cambio venta de la fecha de pago, con 2 decimales [S; PV-08] | [H: IT D rubro 5]; fuente del tipo de cambio: PV-07 |

### 6.7 VGM

VGM = peso bruto total de la carga + estiba y trincaje + tara del contenedor [H\*].

### 6.8 Matriz Incoterms® 2020 que usará la herramienta [H\*]

| Incoterm | Solo marítimo | Lugar convenido | Riesgo se transmite | Flete principal | Seguro obligatorio | Despacho de exportación | Despacho de importación | Flete en B/L (usual) |
|---|:-:|---|---|---|---|---|---|---|
| EXW | No | Local del vendedor | A disposición en el local del vendedor | Comprador | No | Comprador | Comprador | Collect |
| FCA | No | Lugar de entrega en origen | Al entregar al transportista | Comprador | No | Vendedor | Comprador | Collect |
| FAS | Sí | Puerto de embarque | Al costado del buque | Comprador | No | Vendedor | Comprador | Collect |
| FOB | Sí | Puerto de embarque | A bordo del buque | Comprador | No | Vendedor | Comprador | Collect |
| CFR | Sí | Puerto de destino | A bordo en el puerto de embarque | Vendedor | No | Vendedor | Comprador | Prepaid |
| CIF | Sí | Puerto de destino | A bordo en el puerto de embarque | Vendedor | **Sí**, lo contrata el vendedor, ICC (C) mín., 110 % | Vendedor | Comprador | Prepaid |
| CPT | No | Lugar de destino | Al entregar al primer transportista | Vendedor | No | Vendedor | Comprador | Prepaid |
| CIP | No | Lugar de destino | Al entregar al primer transportista | Vendedor | **Sí**, lo contrata el vendedor, ICC (A) mín., 110 % | Vendedor | Comprador | Prepaid |
| DAP | No | Lugar de destino | A disposición en destino, sin descargar | Vendedor | No | Vendedor | Comprador | Prepaid |
| DPU | No | Lugar de destino | Descargada en destino | Vendedor | No | Vendedor | Comprador | Prepaid |
| DDP | No | Lugar de destino | En destino, despachada para importación | Vendedor | No | Vendedor | **Vendedor** | Prepaid |

- La columna "Flete en B/L (usual)" es práctica habitual, no una regla de Incoterms; si no coincide, solo hay advertencia.
- El tipo de lugar convenido de cada término coincide con la tabla de IT C 5.4 [H].

---

## 7. Validaciones

**Errores (bloquean la generación de documentos)**

| ID | Regla |
|---|---|
| E01 | Campo obligatorio vacío, según el documento que lo usa |
| E02 | Incoterm fuera de los 11 de Incoterms® 2020 |
| E03 | Lugar convenido incoherente: en FAS o FOB debe ser el puerto de embarque; en CFR o CIF, el puerto de destino [H: IT C 5.4] |
| E04 | CIF o CIP sin datos de seguro, cobertura menor al 110 %, o CIP con cláusulas distintas de ICC (A) |
| E05 | Peso bruto por bulto menor que el peso neto por bulto |
| E06 | Cantidad que no es múltiplo de las unidades por bulto (v1) |
| E07 | Cantidades, precios, pesos o medidas ≤ 0 |
| E08 | Subpartida nacional que no tiene 10 dígitos |
| E09 | Número de contenedor con dígito de control ISO 6346 incorrecto |
| E10 | RUC del importador (en importación) o del exportador (en exportación) que no tiene 11 dígitos numéricos |
| E11 | UN/LOCODE mal formado o que no coincide con el país. En importación el puerto de descarga debe empezar por "PE"; en exportación, el de embarque. |
| E12 | FOB derivado ≤ 0 |
| E13 | ETA anterior a la fecha de embarque |
| E14 | Moneda distinta de USD (v1) |
| E15 | Importación sin tipo de cambio |
| E16 | Ítems agrupados en la misma serie con distinta tasa o código de tributos (AV, ISC, TPI, "Tipo" de A 7.20) |
| E17 | Subpartida 8517.13.00.00 u 8517.14.00.00, destinación 10 y fecha de formulación desde el 05-10-2026: el número de equipos registrados no coincide con la cantidad, algún equipo no tiene serie o IMEI, o hay series o IMEI repetidos (D9) [H: RS129 art. 1 y 1.ª disposición complementaria final] |
| E18 | Código fuera de su lista cerrada: destinación, modalidad, vía, tipo de seguro, estado, modalidad y medio de pago, nivel comercial, naturaleza, tipo de valor, versión del Incoterm |
| E19 | Descuadre interno de la DAM: Σ FOB de ítems ≠ FOB total, Σ 7.30 ≠ 6.1, o Σ 7.34 ≠ 6.5. Delata un error de cálculo de la herramienta. |
| E20 | (F5, decisión D14) Dato que la herramienta no puede calcular: en el formulario, un número que no es número, supera su máximo o tiene más decimales de los admitidos (§6.1), o un cálculo que sale del rango exacto. La revisión queda «en pausa» (solo E20) y los resultados no se muestran hasta corregirlo; la edición sigue libre [S]. |
| E21 | (F7.1, auditoría F7-M1) B/L nominativo con consignatario «a la orden de…»: el documento mezclaría dos modalidades incompatibles [H\*] |

**Advertencias (se puede generar, pero se muestran en pantalla y en la hoja resumen)**

| ID | Regla |
|---|---|
| A01 | **Aviso didáctico** (no bloquea): FAS, FOB, CFR o CIF con contenedor. Explica que en estas reglas el riesgo pasa al costado o a bordo del buque, pero la carga en contenedor suele entregarse antes, en la terminal o el depósito; por eso la nota de orientación de ICC recomienda FCA (en lugar de FAS o FOB), CPT (en lugar de CFR) o CIP (en lugar de CIF) [H\*]. |
| A02 | EXW en exportación desde Perú: el despacho de exportación correspondería al comprador extranjero |
| A03 | DDP en importación a Perú: el vendedor extranjero actuaría como importador |
| A04 | Grupo D en importación: revisar 8.3.2 y 8.5.x (§6.3) |
| A05 | Flete *prepaid* o *collect* distinto al usual para el Incoterm |
| A06 | Volumen mayor que la capacidad referencial del contenedor: 20' ≈ 33 m³, 40' ≈ 67 m³, 40' HC ≈ 76 m³ (PV-16) |
| A07 | VGM mayor que el peso bruto máximo referencial del contenedor (PV-16) |
| A08 | Subpartida no marcada como verificada: se muestra "POR VERIFICAR" |
| A09 | RUC con prefijo distinto de 10 o 20, o que no cumple el dígito verificador módulo 11 [H\*; PV-18] |
| A10 | FOB dentro de un umbral de despacho simplificado (PV-03). No confundir con los umbrales de medios de pago de IT C, rubro 4, «Otros datos» a): FOB > US$ 500 (o S/ 2 000) obliga a usar medios de pago (A16). Las consecuencias de no usarlos dependen del régimen y del momento: en importación para el consumo con FOB > US$ 2 000 (o S/ 7 000), antes del levante, reembarque o multa a elección del importador; después del levante, multa; en ambos casos, además, efectos tributarios. En el tramo inferior y en otros regímenes, los efectos tributarios de los supuestos de la tabla del instructivo [H: IT C, rubro 4, «Otros datos» a), tabla de supuestos] (F4.2). |
| A11 | Fecha del certificado de seguro posterior al embarque (referencia: art. 28(e) de UCP 600 [H\*]) |
| A12 | Seguro en un Incoterm que no lo exige: se informa quién lo contrata |
| A13 | Certificado de origen con fecha posterior al embarque (PV-12) |
| A14 | País de origen del ítem distinto del país del exportador (revisar el CO) |
| A15 | Importación sin seguro: se aplicará el % de la tabla SUNAT (PV-06) |
| A16 | FOB mayor que US$ 500 con medio de pago 01 (efectivo): la Ley 28194 exige medios de pago del sistema financiero [H: IT C, rubro 4, "Otros datos" a] |
| A17 | IMEI que no tiene 15 dígitos o no cumple el dígito de control Luhn [H\*] |
| A18 | DAP o DPU: se informa que el seguro no se resta del FOB [H: IT C 5.9] |
| A19 | Resumen: cantidad de datos con marca [H\*] y PV en la DAM |
| A20 | Despacho anticipado sin fecha de término de descarga: la casilla A 3.4 queda en PV-26 |

**Implementación (F4, `js/validaciones.js`)**

- Las validaciones **solo leen** los datos y el resultado de `calculos.js`; comparan con listas y umbrales de `normativa.js`. Cada aviso trae ID, qué pasa, por qué importa, cómo corregirlo, ruta(s) del dato, fuente y marca (H, H\*, S o PV); si la regla es PV, el mensaje dice "POR VERIFICAR".
- **E01** usa el diccionario: el campo es obligatorio si aplica a la operación (`solo`), se cumple su condición (`obl`) y lo usa algún documento que se generará (`docs`; SEG solo con seguro y CO solo con trato preferencial). Un dato vacío **a propósito y marcado PV** en la operación (ej. criterio de origen del caso 2, PV-12) no es error. **A19 cuenta solo los datos que usa la DAM**: el criterio de origen no tiene casilla, así que A19 no lo cuenta; lo muestra «POR VERIFICAR» el certificado de origen (F9.1). La falta de tipo de cambio la informa E15 (no E01). El **modelo** del producto es obligatorio solo en importación (B 5.14); en exportación no tiene casilla [S].
- **E17** aplica desde la fecha de formulación 05-10-2026 (RS129, `normativa.js`), con el modelo de equipos de D9. Series e IMEI se comparan sin espacios exteriores y respetando mayúsculas (F4.1).
- **E04** también informa cada dato del seguro que falta en CIF y CIP (esos datos no se repiten como E01; F4.1). **E03** compara el nombre completo del puerto o su UN/LOCODE (F4.1).
- **E18** revisa los campos de código cuya lista es cerrada (marca H del instructivo o S del alcance v1); las listas abiertas o pendientes (H\*, PV) no se revisan.
- **A07** usa 30 480 kg como peso bruto máximo referencial de los tres tipos de contenedor [H\*: ISO 668; PV-16]. **A10** no se activa mientras el umbral de PV-03 no tenga cifra con fuente (`normativa.js`: `null`); `pruebas.html` comprueba la lógica con un umbral ficticio.
- Los avisos del cálculo de D12 se muestran como advertencias adicionales a las de la tabla (decisión D13):

| ID | Regla |
|---|---|
| C01 | Reparto en partes iguales por base cero: FOB por ítem (importación o exportación), ajustes entre los ítems ajustados, flete o seguro entre series. El mensaje dice qué se repartió y lleva al dato de la base (precio o peso bruto) [S; D12]. |
| C02 | Hay ajustes (8.1.2 a 8.2.5) pero ningún ítem está marcado como objeto de ajuste: se reparten entre todos [S; IT C 5.10; D12]. |

- `Validaciones.hayErrores(revision)` es la función que consultarán los documentos (F6+) para bloquearse si hay errores.
- Panel **«Revisión de la operación»** en `index.html`: contador (errores bloquean, advertencias no), lista por severidad y por regla, y botón «Ir al dato» que abre la sección del formulario (y la tarjeta del ítem), centra el campo, le da foco y lo resalta (F5).
- **Formulario (F5):** la revisión se recalcula mientras se escribe (espera de 250 ms). Cada error marca su campo (`aria-invalid` y mensaje junto al campo, enlazado con `aria-describedby`) y el índice de secciones cuenta los errores. `Validaciones.obligatorio(op, campo)` es la misma regla de E01 y decide el asterisco «obligatorio» del formulario. E20 la produce `Validaciones.revisionDetenida`.

---

## 8. Riesgos, fuentes y puntos POR VERIFICAR

### 8.1 Riesgos del proyecto

| Riesgo | Mitigación |
|---|---|
| Confundir un documento didáctico con uno real | Marca de agua, encabezado y pie; DAM "NO NUMERADA"; sin logos reales |
| Que un dato ficticio coincida con uno real | Nombres con sufijo "— FICTICIA"; RUC 200000000XX; PV-19 |
| Que el redondeo descuadre los documentos | Un solo módulo de cálculo con enteros; `pruebas.html` con las cifras de §9; error E19 |
| Cambios normativos (tasas, códigos, arancel, instructivo) | Todo en `normativa.js`, con fuente, fecha y marca; LEEME con la fecha de las fuentes |
| Que las copias de las fuentes estén desactualizadas | F0b (PV-30) |
| Pérdida de datos | El `.json` es la copia principal |
| Crecimiento del alcance | Lista explícita de lo que queda fuera de v1 (§1) |
| Diferencias de impresión entre navegadores | Probar en Chrome y Edge, en A4 |

### 8.2 Fuentes

| Abrev. | Documento | Versión / fecha | Ubicación |
|---|---|---|---|
| IT | Instructivo "Declaración Aduanera de Mercancías (DAM)" DESPA-IT.00.04, versión 2 (RSNAA 041-2010/SUNAT/A) | Copia consolidada; la última modificación que incluye es la RSN 000349-2025-SUNAT (31-12-2025) | `herramienta-comex/referencias/despa-it.00.04.htm` |
| CC | Control de cambios de la RS 129-2026 sobre el IT | Publicación 10-07-2026; vigencia 05-10-2026 | `herramienta-comex/referencias/cc-it.00.04-129-2026.htm` |
| RS129 | Resolución de Superintendencia N.º 000129-2026/SUNAT (08-07-2026) | Vigencia 05-10-2026 | `herramienta-comex/referencias/RS-000129-2026-SUNAT.pdf` |
| — | Tablas generales de SUNAT, DESPA-PG.01 y DESPA-PG.02 | **Pendientes (F0b)** | `fuentes/` |

Estado al 28-09-2026: el acceso a `www.sunat.gob.pe` desde el entorno sigue bloqueado (el proxy responde 403). Las copias de la carpeta no están contrastadas con el portal (PV-30).

### 8.3 Lista POR VERIFICAR

Estado: **Cerrado** = resuelto con fuente · **Parcial** = resuelto en parte · **Abierto**.

| ID | Qué verificar | Estado | Fuente / qué queda abierto |
|---|---|---|---|
| PV-01 | Tasas y base de la percepción del IGV | Abierto | No figura en el Formato C (IT D 4) |
| PV-02 | Tasa de despacho aduanero | Parcial | Existe la casilla C 4.8 "Servicio despacho" (IT D 4.8). Falta el monto. |
| PV-03 | Umbrales de despacho simplificado y obligación del Formato B | Parcial | El Formato B es la declaración del valor y no se exige presentarlo en físico (IT C, introducción). La DS es el código 18 (RS129 anexo VI). Falta el umbral. |
| PV-04 | Prorrateo | Parcial | FOB y ajustes por valor (IT C 5.9, 5.10). Falta el criterio para flete y seguro entre series (IT A 7.31, 7.32). |
| PV-05 | Agrupación en series | **Cerrado** | IT A 7.1, 7.8, 7.9, 7.26, 7.27; IT C 5.1; IT B 7.1, 7.27 |
| PV-06 | Tabla de seguros | Parcial | Nombre y uso (IT C 8.4; IT A 6.3, 7.32). Faltan los porcentajes. |
| PV-07 | Tipo de cambio | Parcial | Tipo venta de la fecha de pago (IT D rubro 5); factor de conversión de otras monedas a la fecha de numeración (IT C, introducción). Falta quién lo publica; el texto dice "nuevos soles". |
| PV-08 | Redondeo | Parcial | Decimales, USD y fechas (IT IV.3, IV.4, IV.6). Falta el método. |
| PV-09 | Códigos de tablas | Parcial | Cerrados en el IT: vía, documento, modalidades, pago, seguro, estado, nivel, condición, naturaleza, tipo de valor, versión del Incoterm, unidad de carga, región, destinación, tipo de despacho de exportación. Abiertos: aduana, puerto, país, moneda, clase de bulto, unidad física, TPI, depósito, agente, entidad financiera y estado en exportación (S 7.20). |
| PV-10 | Arancel y subpartidas | Parcial | Arancel 2022, D.S. 404-2021-EF, citado en julio de 2026 (RS129 art. 2). Faltan los 4 dígitos nacionales de los ejemplos y la posible actualización por SA 2027. |
| PV-11 | Tasas ad valorem, sobretasa, derecho específico, ISC | Abierto | El Formato C solo trae las casillas (IT D 4.1–4.4) |
| PV-12 | Certificado de origen por acuerdo | Parcial | Lado DAM: IT A 7.9, 7.23; IT B 7.9. Faltan formato, emisor y criterio. |
| PV-13 | DAM de exportación | Parcial | IT B: destinación, modalidad, tipo de despacho, 3.4, 6.1–6.5, 7.26. Falta el plazo de regularización. |
| PV-14 | Requisitos de la factura y factura electrónica de exportación | Abierto | IT A 7.36 solo pide número y fecha |
| PV-15 | UN/LOCODE de otros puertos (ej. Chancay) | Abierto | — |
| PV-16 | Capacidad, tara y peso máximo de contenedores | Abierto | — |
| PV-17 | Antidumping en la base del IGV y de la percepción | Abierto | IT D 4.7 e IT A 7.37 f) no lo resuelven |
| PV-18 | Algoritmo del dígito verificador del RUC | Abierto | Se usa módulo 11 como advertencia [H\*] |
| PV-19 | Que "EJMU" y los RUC 200000000XX no pertenezcan a nadie real | Abierto | — |
| PV-20 | Mercancía restringida | Parcial | N° de documento de control (IT A 7.37 a). Falta la regla por producto. |
| PV-21 | Descripciones mínimas | Parcial | Estructura (IT A 7.35, IT B 7.35); lista de instructivos (IT C 5); IMEI (RS129 art. 1). Falta la regla para ventiladores y cargadores. |
| PV-22 | Ajustes y valoración en grupo D | **Cerrado** (estructura) | IT C 5.9 y sección 8; IT A 6.4, 6.5 |
| PV-23 | Casillas de la DAM | **Cerrado** (contenido) | IT A a D. El diseño gráfico del anexo no está en la copia. |
| PV-24 | Nombre del código 0-0: el IT dice "Despacho Excepcional"; la Ley General de Aduanas (D. Leg. 1053) usa "diferido" [H\*] | Abierto | — |
| PV-25 | Diferencia entre las destinaciones 40 y 41 | Abierto | IT B solo lista ambas |
| PV-26 | Qué va en la casilla A 3.4 en despacho anticipado | Abierto | — |
| PV-27 | Cálculo del dígito verificador de la subpartida (A 7.19) | Abierto | — |
| PV-28 | Si sigue vigente la nota del art. 7 de la RSNAA 578-2010: en la Aduana Marítima del Callao va el código y no el RUC en A 3.1, 4.1, 4.2 y 8 | Abierto | Nota final del IT |
| PV-29 | Código de modalidad de pago para pagos mixtos (ej. 30 % adelanto + 70 % contra copia del B/L) | Abierto | IT A 5.2; IT C "Otros datos" g–k. El caso 1 evita el problema con pago anticipado. |
| PV-30 | Que las copias de la carpeta sean fieles y vigentes frente al portal de SUNAT | Abierto (bloqueado) | F0b |

### 8.4 Hechos que usa la herramienta

**[H] Con fuente en la carpeta**

- Destinación 10 = importación para el consumo; 40 y 41 = exportación definitiva (IT A y B, "DESTINACIÓN").
- Vía 1 = marítimo (IT A 3.3).
- Modalidades de importación 1-0, 0-0, 0-1 y 0-2 (IT A); en exportación, no aplica (IT B).
- Tipo de despacho de exportación 00 = normal (IT B).
- Listas de códigos:
  - Documento: 4 = RUC (IT A 1.2).
  - Modalidad de pago (IT A 5.2) y medio de pago (IT C, "Otros datos" a).
  - Tipo de seguro (IT A 7.32).
  - Estado (IT C 5.16).
  - Nivel comercial (IT C 1.3), condición del proveedor (IT C 3.2), naturaleza (IT C 4.1), forma de envío (IT C 4.2) y tipo de valor (IT C 5.6).
  - Versión del Incoterm 4 = 2020 (IT C 5.4).
  - Unidad de carga 02 = contenedores (IT A 7.37 k).
  - Región de destino (IT A 7.37 l).
- Formatos A, A1, B, B1 y C (IT IV.1); decimales, USD y fechas (IT IV.3, IV.4, IV.6).
- Reglas de ítem y serie (IT C 5.1; IT A 7.1); fórmulas del FOB (IT C 5.9); valor en aduana (IT A 6.5, 7.34); valor de exportación (IT B 6.1–6.5).
- Pago de tributos en soles al tipo de cambio venta de la fecha de pago (IT D rubro 5).
- Medios de pago obligatorios si el FOB supera US$ 500 (IT C, "Otros datos" a).
- IMEI y número de serie en 8517.13.00.00 y 8517.14.00.00, vigente desde el 05-10-2026 (RS129 art. 1 y 1.ª disposición complementaria final).
- Arancel de Aduanas 2022, D.S. 404-2021-EF, citado como base legal en julio de 2026 (RS129 art. 2).

**[H\*] Conocimiento general, sin fuente en la carpeta** (se muestran con la etiqueta "H\*")

- Contenido de Incoterms® 2020 (ICC), incluida la recomendación de FCA para contenedores.
- IGV 16 % + IPM 2 %; base del IGV según el art. 13 de la Ley del IGV.
- Aduana 118 = Intendencia de Aduana Marítima del Callao.
- UN/LOCODE CNNGB, PECLL, CLSAI; códigos de país ISO 3166 alfa-2; UBIGEO 150101 = Lima, Lima, Lima.
- Subpartidas SA de 6 dígitos: 8414.51, 8504.40, 6109.10, 6110.20.
- ISO 6346, VGM según SOLAS, UCP 600 art. 28(e).
- Dígito verificador del RUC por módulo 11; IMEI de 15 dígitos con dígito Luhn.
- Que la Ley General de Aduanas use "despacho diferido".

---

## 9. Casos de ejemplo (datos 100 % ficticios)

Dos casos que, entre ambos, cubren todos los documentos, las destinaciones 10 y 40 y los Formatos A, A1, B, B1 y C.

- **Caso 1:** importación CIF de 3 ítems en 2 series. Ejercita la agrupación, el prorrateo, el seguro y los tributos; no lleva CO.
- **Caso 2:** exportación FOB de 2 ítems en 2 series. Ejercita el certificado de origen; no lleva seguro.

La regla del IMEI se prueba solo en `pruebas.html`, con datos sintéticos.

Los RUC de ambos casos son ficticios y cumplen el módulo 11 [H\*]:

| RUC | Rol |
|---|---|
| 20000000001 | Importador (caso 1) |
| 20000000010 | Exportador (caso 2) |
| 20000000028 | Agente de aduana (ambos casos) |
| 20000000036 | Agente marítimo (ambos casos) |
| 20000000044 | Depósito temporal (ambos casos) |

### 9.1 Caso 1 — Importación CIF Callao

**Datos generales**

| Campo | Valor |
|---|---|
| Referencia | OP-2026-001 · Importación · FCL |
| Proveedor | Ningbo Ejemplo Electric Co., Ltd. — FICTICIA · No. 1 Example Road, Beilun, Ningbo, Zhejiang, China · condición 1 fabricante [S] |
| Importador | Importadora Didáctica Andina S.A.C. — FICTICIA · Av. Ejemplo 123, Cercado de Lima, Lima · RUC 20000000001 · UBIGEO 150101 [H\*] |
| Consignatario / notify | = importador (B/L nominativo) |
| Naviera / agente marítimo | Naviera Didáctica Line — FICTICIA / Agencia Marítima Didáctica S.A.C. — FICTICIA |
| Agente de aduana / depósito temporal | Agencia de Aduanas Didáctica S.A.C. — FICTICIA / Depósito Temporal Didáctico S.A.C. — FICTICIA |
| Entidad financiera | Banco Didáctico — FICTICIO (código PV-09) |
| Aseguradora | Aseguradora Ejemplo Co., Ltd. — FICTICIA |
| Ruta | Ningbo, CN (CNNGB [H\*]) → Callao, PE (PECLL [H\*]) · país de embarque y de adquisición: CN |
| Incoterm | **CIF Callao, Incoterms® 2020** → B 5.4 "CIF – Callao – 4" |
| Moneda y pago | USD · **100 % anticipado por transferencia**: modalidad 6, medio 09 [H] (cambió respecto a v1; ver PV-29) |
| Factura | VEN-2026-0457 · 05-10-2026 |
| Aduana | 118 [H\*] · destinación 10 · modalidad 1-0 anticipado · tipo de despacho vacío (PV) · N° de orden 2026-000001 [S] · formulación 09-11-2026 [S] · región de destino 40615 Lima |
| Formato B | Nivel comercial 2 mayorista [S] · naturaleza 11 · envío 1/1 · valor definitivo (1) · sin intermediario · rubro 7: **7.4 = Sí** [S]; 7.2, 7.3 y 7.6 vacías (solo se responden si hay vinculación o condiciones); el resto "No" [S, supuesto del ejemplo, no una regla] (D1, D7) · ajustes 0 |
| Tipo de cambio | 3.500 S/ por USD (**supuesto didáctico, no es un dato real**) |

**Mercancía**

| Ítem | Producto y descripción | Subpartida | Origen / estado | Cantidad | P. unit. CIF | Valor | Serie |
|---|---|---|---|---|---|---|---|
| 1 | Ventilador de pie 16", 45 W, 220 V, 3 velocidades, uso doméstico · EJEMPLO VE-16 | 8414.51.00.00 | CN / 10 | 200 U | 19.50 | 3 900.00 | 1 |
| 2 | Ventilador de pie 18", 60 W, 220 V, 3 velocidades, uso doméstico · EJEMPLO VE-18 | 8414.51.00.00 | CN / 10 | 160 U | 24.00 | 3 840.00 | 1 |
| 3 | **Cargador USB-C** (adaptador de corriente) 20 W; entrada 100–240 V CA; salida 5 V / 9 V CC; para teléfonos móviles; sin cable · EJEMPLO CG-20 | **8504.40.90.00** | CN / 10 | 3 000 U | 4.10 | 12 300.00 | 2 |

- **Subpartidas:**
  - SA 8414.51 = ventiladores con motor eléctrico incorporado de potencia ≤ 125 W [H\*].
  - SA 8504.40 = convertidores estáticos, donde se clasifican los cargadores [H\*].
  - Los 4 dígitos nacionales son **POR VERIFICAR** (PV-10). En 8414.51, ".00.00" es relleno didáctico. En 8504.40, ".90.00" es mi hipótesis: supongo un desdoblamiento nacional en "UPS" (.10) y "los demás" (.90), sin verificar.
- **Unidad física "U":** PV-09.
- **Sin IMEI ni permisos:** el cargador no activa la regla del IMEI (no es 8517.13 ni 8517.14). Permisos del producto: PV-20.

**Tributos (supuestos):** ad valorem 6 % en la serie 1 y 0 % en la serie 2. Tasas distintas por serie, para probar que se calcula por serie. ISC, sobretasa, derecho específico y antidumping: 0. Percepción: 3.5 % para toda la operación (PV-01; D2).

**Embalaje**

| Ítem | Bulto | Unid./bulto | Bultos | PN/bulto (kg) | PB/bulto (kg) | Medidas (cm) | m³/bulto |
|---|---|---|---|---|---|---|---|
| 1 | Caja de cartón | 1 | 200 | 4.50 | 5.20 | 50 × 20 × 60 | 0.060 |
| 2 | Caja de cartón | 1 | 160 | 5.50 | 6.40 | 50 × 25 × 60 | 0.075 |
| 3 | Caja de cartón | 100 | 30 | 6.00 | 7.50 | 40 × 30 × 40 | 0.048 |

**Marcas:** IDA / OP-2026-001 / CALLAO / C/No. 1-390 / MADE IN CHINA

**Contenedor, transporte y seguro**

- **Contenedor:** 1 × 20' DV (22G1).
  - N° **EJMU 261014 7** (dígito de control ISO 6346 calculado; prefijo ficticio, PV-19).
  - Precinto SD-000123. Tara 2 200 kg [S]. VGM por método 2. Unidad de carga 02.
- **Nave y B/L:**
  - Nave MV DIDACTIC STAR, viaje 2641E. Booking BK-2026-0001.
  - B/L DIDL2026000457, nominativo, 3 originales, emitido en Ningbo el 14-10-2026, "shipped on board" 14-10-2026, con cláusulas SLAC y STC.
- **Manifiesto:** 118-2026-[número por asignar] [S].
- **Fechas y flete:**
  - Flete USD 1 850.00 *prepaid*.
  - Embarque 14-10-2026. ETA 15-11-2026.
  - Término de descarga: vacío (PV-26, despacho anticipado).
- **Seguro:**
  - Póliza flotante POL-0001 (tipo de seguro 3), certificado CERT-0457 del 13-10-2026.
  - ICC (C) 2009. Cobertura 110 %. Prima 0.30 % [S].

**Resultados esperados** (servirán para `pruebas.html`)

| Concepto | Valor |
|---|---|
| Bultos | 390 cajas |
| Peso neto / peso bruto | 1 960.00 kg / 2 289.00 kg |
| Volumen | 25.440 m³ |
| Valor de la factura (CIF, B 8.1.1) | USD 20 040.00 |
| Suma asegurada (110 %) / prima (0.30 %) | USD 22 044.00 / USD 66.13 |
| FOB total (IT C 5.9, CIF) = 20 040.00 − 1 850.00 − 66.13 | USD 18 123.87 |
| Valor en aduana (A 6.5) | USD 20 040.000 |
| VGM = 2 289 + 0 + 2 200 | 4 489.00 kg |

*Formato B (ítems):* FOB repartido según el valor del ítem.

| Ítem | FOB del ítem | FOB unitario (B 5.9) |
|---|---|---|
| 1 | 3 527.100 | 17.635500 |
| 2 | 3 472.837 | 21.705231 |
| 3 | 11 123.933 (residuo) | 3.707978 |

*Formato A (series):* flete por peso bruto y seguro por FOB [S; PV-04].

| Serie | Ítems | Bultos | PN | PB | FOB (7.30) | Flete (7.31) | Seguro (7.32) | Valor en aduana (7.34) |
|---|---|---|---|---|---|---|---|---|
| 1/2 | 1, 2 | 360 | 1 780.00 | 2 064.00 | 6 999.937 | 1 668.152 | 25.541 | 8 693.630 |
| 2/2 | 3 | 30 | 180.00 | 225.00 | 11 123.933 | 181.848 | 40.589 | 11 346.370 |
| **Total** | | **390** | **1 960.00** | **2 289.00** | **18 123.870** | **1 850.000** | **66.130** | **20 040.000** |

*Formato C (liquidación, USD):*

| Serie | Valor en aduana | AV (C 4.1) | Base IGV | IGV 16 % (C 4.6) | IPM 2 % (C 4.5) |
|---|---|---|---|---|---|
| 1 | 8 693.630 | 521.618 (6 %) | 9 215.248 | 1 474.440 | 184.305 |
| 2 | 11 346.370 | 0.000 (0 %) | 11 346.370 | 1 815.419 | 226.927 |
| **Total** | **20 040.000** | **521.618** | **20 561.618** | **3 289.859** | **411.232** |

- Total de tributos (AV + IGV + IPM): **USD 4 222.709**.
- Percepción de 3.5 % [S] sobre 24 262.709: **USD 849.195**, fuera del Formato C.
- **Por qué este caso sirve de prueba:** la serie 1 tiene el 90.17 % del peso, pero solo el 38.62 % del valor. Por eso un reparto por peso y otro por valor dan resultados muy distintos. Por ejemplo, el valor en aduana de la serie 2 (11 346.370) es menor que su valor en la factura (12 300.00), porque el flete se reparte por peso. Es el efecto que explica PV-04.
- **Advertencias esperadas:** A01, A08, A19 y A20. Errores esperados: ninguno.

### 9.2 Caso 2 — Exportación FOB Callao con certificado de origen

**Datos generales**

| Campo | Valor |
|---|---|
| Referencia | OP-2026-002 · Exportación · FCL |
| Exportador (y productor) | Textiles Didácticos del Perú S.A.C. — FICTICIA · Av. Ejemplo 456, Cercado de Lima, Lima · RUC **20000000010** (cambió respecto a v1 para cumplir el módulo 11) · UBIGEO 150101 [H\*] |
| Comprador | Tiendas Ejemplo SpA — FICTICIA · Santiago, Chile · RUT ficticio (sin casilla en la DAM de exportación) |
| Agente marítimo / agente de aduana / depósito temporal | Los mismos del caso 1 |
| Ruta | Callao, PE (PECLL) → San Antonio, CL (CLSAI [H\*]) · país de destino CL |
| Incoterm | **FOB Callao, Incoterms® 2020** |
| Moneda y pago | USD · 100 % a 30 días de la fecha del B/L: modalidad 2, crédito [H] · Banco Didáctico — FICTICIO |
| Factura | TDP-2026-0102 · 20-10-2026 (la factura real de exportación es electrónica; PV-14) |
| Aduana | 118 [H\*] (despacho y salida, S 3.7) · destinación 40 · modalidad: no aplica · tipo de despacho 00 · N° de orden 2026-000002 [S] · formulación 21-10-2026 [S] |

**Mercancía y embalaje**

| Ítem | Descripción (en español) | Subpartida | Cantidad | P. unit. FOB | Valor | Bultos | PN/bulto | PB/bulto | Medidas (cm) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Polo 100 % algodón, tejido de punto, cuello redondo, tallas S–XL, marca EJEMPLO | 6109.10.00.00 | 4 000 U (50/caja) | 5.20 | 20 800.00 | 80 | 9.00 | 9.80 | 60 × 40 × 35 |
| 2 | Sudadera con capucha 100 % algodón, tejido de punto, tallas S–XL, marca EJEMPLO | 6110.20.00.00 | 1 500 U (25/caja) | 12.50 | 18 750.00 | 60 | 12.50 | 13.40 | 60 × 40 × 45 |

- SA 6109.10 y 6110.20 son [H\*]; los 4 dígitos nacionales son PV-10.
- Origen: S 7.26 = UBIGEO 150101 (lugar de fabricación) [S].
- Estado: nuevo; el código de S 7.20 es PV-09.

**Resto de datos**

- Marcas: TE / OP-2026-002 / SAN ANTONIO / C/No. 1-140 / HECHO EN PERÚ.
- Contenedor 20' DV **EJMU 260002 5**, precinto SD-000124, tara 2 200 kg.
- Nave MV DIDACTIC STAR, viaje 2643S. Booking BK-2026-0002. B/L DIDL2026000102.
- Manifiesto 118-2026-[número por asignar] [S].
- Flete *collect*. Embarque y término de embarque (S 3.4): 24-10-2026. ETA 30-10-2026.
- Sin seguro (FOB no lo exige).
- CO: TLC Perú–Chile; formato y criterio de origen PV-12; N° CO-2026-0001 (ficticio), del 22-10-2026. La casilla S 7.9 no se llena [H].
- Las casillas S 7.31 a 7.34 no se llenan [H]. No se generan los Formatos B ni C [H: IT IV.1].

**Resultados esperados**

| Concepto | Valor |
|---|---|
| Bultos (total de embalaje, sin contar contenedor ni paletas; se ve en «Resultados», la lista de empaque y la hoja resumen). La casilla S 13.2 queda **en blanco** (D18 b) | 140 cajas |
| Peso neto / peso bruto | 1 470.00 kg / 1 588.00 kg |
| Volumen | 6.720 + 6.480 = 13.200 m³ |
| S 6.1 = 6.5 (FOB) | USD 39 550.000 |
| Serie 1/2 (6109.10): FOB 7.30 / bultos / PN / PB | 20 800.000 / 80 / 720.00 / 784.00 |
| Serie 2/2 (6110.20): FOB 7.30 / bultos / PN / PB | 18 750.000 / 60 / 750.00 / 804.00 |
| VGM = 1 588 + 0 + 2 200 | 3 788.00 kg |

Advertencias esperadas: **A01**, **A08** y **A19**. Errores esperados: ninguno.

---

## 10. Fases de construcción

Cada fase termina en un commit y en una verificación que puedes hacer tú, sin programar.

| Fase | Entregable | Cómo lo verificas |
|---|---|---|
| F0 | Este plan (v2) | Lo apruebas o corriges |
| F0b | **Verificación de fuentes**, cuando esté habilitado `www.sunat.gob.pe`: comparar las copias de la carpeta (PV-30) y descargar a `fuentes/` las tablas generales, DESPA-PG.01 y DESPA-PG.02, con fecha. Luego actualizar §8.3. | Revisas la tabla PV actualizada, con citas a los archivos de `fuentes/`. Idealmente, antes de F8a. |
| F1 ✔ | Estructura de carpetas + `index.html` con el aviso didáctico | Doble clic → se abre la página con el aviso |
| F2 ✔ | `diccionario.js`, `normativa.js` (listas con marca H/H\*/PV), modelo, ejemplos y botones Guardar/Abrir | Cargas un ejemplo, lo guardas y lo reabres: datos idénticos |
| F3 ✔ | `calculos.js` + `incoterms.js` + `pruebas.html`, con controles negativos (RUC, ISO 6346, IMEI sintético); panel "Resultados del cálculo" en `index.html` | Todo en verde (175/175); las cifras coinciden con §9 |
| F4 ✔ | Validaciones + panel de errores y advertencias | Cada caso muestra solo sus advertencias esperadas; si alteras un dato a propósito, sale el error esperado |
| F5 ✔ | Formulario completo: ítems variables, secciones condicionales, ayuda por campo y marcas H\*/PV visibles | Cambias una cantidad y los totales se actualizan; ves las etiquetas H\* y PV |
| F6 ✔ | Factura comercial + lista de empaque + hoja resumen con tabla de trazabilidad | Imprimes a PDF; los totales cuadran con la hoja resumen |
| F7 ✔ | Instrucciones de embarque / borrador de B/L + VGM | Bultos, peso bruto, volumen y contenedor = lista de empaque |
| **F8a** ✔ | **DAM Formato A** (ingreso y salida, con A1) | Series, casillas y valores = §9.1 y §9.2. **Pausa: revisión de Aarón antes de seguir.** Revisada en F8a.2 (D17, D18). |
| **F8b** ✔ | DAM Formato B (+B1), solo con tu aprobación de F8a | FOB unitarios y sección 8 = §9.1 |
| **F8c** ✔ | DAM Formato C (liquidación) | Tributos = §9.1 |
| **F9** ✔ | Certificado de seguro + certificado de origen (condicionales) | Con FOB no hay seguro; con CIF sí; sin preferencia no hay CO |
| F10 | Ajustes de impresión, `LEEME.md` (fuentes, fechas, límites) y revisión final | Generas los PDF de ambos casos de principio a fin |

---

## 11. Decisiones

**Tomadas por Aarón**

1. Se aplican los cambios 1 a 10 de la comparación con `herramienta-comex/`.
2. Formatos B y C: sí, pero primero se construye y revisa el Formato A (F8a).
3. IMEI: solo regla y prueba, sin tercer caso.
4. Códigos sin fuente en la carpeta: se usan con la marca [H\*], visible en la herramienta.
5. Caso 1: el segundo producto es tecnológico (cargador USB-C) y su subpartida queda POR VERIFICAR.
6. Fuentes de SUNAT: se verifican y descargan cuando se habilite el dominio (F0b).

**Respuestas a los pendientes de la v1**

7. Stack: página HTML local. Confirmado.
8. Idioma: **etiquetas bilingües español/inglés en cada campo** (ej. "Peso bruto / Gross weight"), sin traducir el documento completo. La DAM, solo en español.
9. Versión 1: un contenedor FCL y solo USD.
10. Casos: los dos propuestos; el caso 1 con 3 ítems.
11. Ritmo: revisión al final de **cada** fase.
12. Material del curso: no hay por ahora.
13. Añadido: aviso didáctico A01 (FAS, FOB, CFR o CIF con contenedor → recomendación ICC de FCA, CPT o CIP). Solo informa, no bloquea.
14. F0b (fuentes SUNAT) queda para una sesión nueva; no bloquea F1–F7.

**Decisiones tomadas en la sesión del 03-10-2026** (delegadas por Aarón al orquestador de la sesión)

| # | Tema | Decisión |
|---|---|---|
| D1 | Formato B, pregunta 7.4 (libre disposición) | "Sí" en compraventas normales como el caso 1; sigue siendo editable. |
| D2 | Tasa de percepción del IGV | Un solo valor por operación, no por ítem. |
| D3 | `js/pantalla.js` | Se añade a la estructura (§2). |
| D4 | UBIGEO del exportador (S 1.4) | Se mantiene el campo. |
| D5 | Auditoría de F2 (Codex) | Se aceptan A1, A3, M1–M7 y B1–B3 (commit "F2.1"). A2: cada entrada del diccionario lleva `marca` y `fuente` explícitas ("S"/"—" cuando no hay norma). |
| D6 | Percepción (matiz) | Se mantiene D2 como alcance v1, con nota visible: la tasa depende del importador y, en algunos casos, de la mercancía (bienes usados, exclusiones); sigue PV-01. |
| D7 | Rubro 7 del Formato B | 7.4 = "Sí" en el caso 1 [S]; 7.2, 7.3 y 7.6 vacías (condicionales); el resto "No" como supuesto del ejemplo, no como regla. |
| D8 | Flete *prepaid*/*collect* | Campo editable `fleteBl` con valor sugerido según el Incoterm (§6.8); A05 avisa si difiere. Caso 1: *prepaid*; caso 2: *collect*. |
| D9 | IMEI | Un registro por equipo: `equipos: [{serie, imeis: [..]}]`; E17 compara el número de equipos con la cantidad y revisa la unicidad de series e IMEI. |
| D10 | Formato de números | Coma de miles y punto decimal: `20,040.00`; DAM A/C `18,123.870`; B `21.705231` (§6.1). |
| D11 | Antidumping en la base de la percepción | Se mantiene incluido, con marca H\* (Ley 29173, sin fuente en la carpeta) y PV-17 visibles. En los casos vale 0. |
| D12 | Supuestos de F3 | Aceptados como [S]: FOB por ítem en exportación por valor; soles con 2 decimales; tabla SUNAT sobre FOB; ajustes sin ítems marcados → todos con aviso (C01/C02 en F4); base 0 → partes iguales con aviso. |
| D13 | Dudas de F4 | Aceptadas: modelo obligatorio solo en importación [S]; dato vacío marcado PV no es E01 (lo cuenta A19); A07 con 30,480 kg [H\*: ISO 668; PV-16]; A10 inactiva hasta cerrar PV-03; advertencias C01/C02 (§7); las tablas de §9 conservan su notación; A19 cuenta tributos en 0 marcados PV. |
| D14 | Dudas de F3.1 | Límites numéricos [S] y rechazo de decimales de más al abrir; C01 solo con ≥ 2 partes; con el formulario, un cálculo fuera de rango se muestra como error en «Revisión» sin congelar la edición. |
| D15 | Dudas de F5 | E20 «cálculo en pausa»; consignatario/notify como listas de diseño; tipo de despacho en importación no se pide; respaldo activo por defecto con casilla para desactivarlo; fechas según el idioma del navegador. |
| D16 | Dudas de F6/F7 | «Página X de Y» global con «Imprimir todos»; primera línea del desglose en C/D = Vc − lo incluido [S]; en la hoja resumen las cifras de la DAM con 3 decimales y las comerciales con 2; se retira la hoja de prueba de F1; Edge y lector de pantalla: POR VERIFICAR con Aarón. |
| D17 | Revisión de Aarón del Formato A (05-10-2026) | (1) Rejilla didáctica **aprobada**. (2) Casillas vacías, que no se llenan, reservadas o que no aplican: **en blanco**, sin relleno gris ni texto del motivo dentro; conservan número y rótulo; el motivo va en la ayuda emergente de la casilla. (3) Pesos A/S 7.14 y 7.15 con **2 decimales** (§6.1). |
| D18 | Formato A tras las opiniones de Claude y Codex (05-10-2026) | **(a)** Nota «párrafo añadido por RS 129-2026, vigente desde el 05-10-2026» en A 7.35 **solo** en series de importación con subpartida 8517.13.00.00 u 8517.14.00.00; en las demás, la regla queda en la ayuda de la casilla. **(b)** S 13.1 y S 13.2 en blanco, con los rótulos de IT B 13, sin atribuir quién las llena ([verificar] en la ayuda); el total de bultos sigue en «Resultados» y en la hoja resumen. **(c)** Códigos abiertos: nombre didáctico + código oficial **en blanco** con una marca PV pequeña, sin inventar (entidad financiera y clase de bulto PV-09; agentes PV-28: razón social, RUC/código en blanco; tipo de despacho en importación en blanco). Unidad física «U» como [S] (RS129 la cita como ejemplo; no valida A 7.16). Moneda «USD» con PV-09. **(d)** 7.39: sin «Reservada a la Administración Aduanera»; rótulo «Tipo de observación»; en blanco; quién la llena: [verificar] (cierra F8a.1-M1). |

**Correcciones de la auditoría de F2 aplicadas en F2.1**

- Abrir revisa la estructura completa contra el modelo: bloques obligatorios, tipo de cada campo, ítems y equipos no nulos, campos desconocidos rechazados y marcas con ruta válida. La operación nueva se prepara completa antes de reemplazar la actual; si algo falla, la pantalla anterior se conserva.
- Límites al abrir: 2 MB, 200 ítems, 10 000 equipos por ítem, 4 IMEI por equipo, 12 niveles de anidamiento y 5 000 caracteres por texto. Mensajes de error en español.
- Formato del archivo: versión 2 (los archivos de la versión 1 se rechazan con un mensaje claro).
- Casillas B 8.1.2, 8.1.3 y 8.1.4 y selección de ítems objeto de ajuste (§4 B1 y B7, §6.5). Los rótulos de 8.1.2 y 8.1.3 no figuran en la copia del instructivo: POR VERIFICAR.
- La revisión del diccionario dice "Correspondencia diccionario–modelo: correcta" (no acredita la cobertura del plan).
- Accesibilidad: botón "Abrir JSON" real, foco visible, ayuda por campo con botón "?" (teclado y toque); en móvil la casilla DAM y la fuente se ven debajo de cada dato.
- La huella se describe como comprobación rápida, no como garantía; la prueba Guardar→Abrir compara además el contenido completo.

**Correcciones de la auditoría de F3 (Codex), aplicadas en F3.1**

- F3-M1: bultos con enteros exactos, sin redondeo previo del cociente (§6.1).
- F3-M2: sin tipo de cambio válido, el pago en soles queda «no calculado» (null), no 0.
- F3-M3: los repartos con base cero (FOB, ajustes, flete, seguro, exportación) avisan C01 y la pantalla explica el criterio usado.
- F3-M4: rango seguro de enteros vigilado en cada conversión y límites de entrada coherentes, aplicados al abrir y al calcular (§6.1).
- F3-M5: la percepción se explica como «valor en aduana 20,040.000 + tributos 4,222.709 = 24,262.709», con la marca del antidumping [H\*: Ley 29173; PV-17] junto a la base.
- Cada corrección tiene pruebas de regresión en `pruebas.html` (grupos F3-M1 a F3-M5).

**Correcciones de la auditoría de F4 (Codex), aplicadas en F4.1**

- F4-M1: E03 ya no acepta el nombre del puerto como parte de otra palabra («Puerto de Otrocallao»). El lugar convenido debe ser, palabra por palabra, el nombre completo del puerto o su UN/LOCODE exacto; solo se admiten las variantes «Puerto de/del …», «Port of …» y el país del puerto al final («Callao, Perú»).
- F4-M2 y F4-M3: E17 comprueba la unicidad de series e IMEI con `Set` (una serie «constructor» ya no es un duplicado) y sin espacios exteriores («ABC» y « ABC » son la misma serie). Las mayúsculas se respetan: «abc» y «ABC» son distintas mientras no se decida otra cosa.
- F4-B1: en CIF y CIP, cada dato del seguro que falta (póliza, certificado, fecha, cláusulas, cobertura, tasa de prima, lugar de pago de siniestros, aseguradora) es **E04** y no se repite como E01; un dato vacío marcado PV sigue sin ser error (D13).
- F4-B2: la explicación de A10 cita los dos umbrales de medios de pago de la copia local de IT C, rubro 4, «Otros datos» a): US$ 500 (obligación de usar medios de pago, A16) y US$ 2 000 (consecuencias). La cifra US$ 2 000 sí figura en el instructivo, pero solo para las consecuencias, que F4.2 precisa en §7 (régimen y momento del levante).
- Regresiones en `pruebas.html` (grupos F4-M1, F4-M2 y F4-M3, F4-B1).

**Decisiones de diseño del formulario (F5)** [S]

- **Fuente única:** `js/formulario.js` genera el formulario desde `diccionario.js`; el HTML no repite campos. El diccionario suma tres datos por campo: `si` (condición para pedirlo), `sugerido` (valor por defecto del §4) y la lista `DERIVADOS` (datos del §4 C que se muestran en solo lectura junto a su sección: destinación, código de documento, países de embarque y destino, versión del Incoterm, unidad de carga, tipo de seguro, suma asegurada y prima, flete usual, FOB, VGM y totales de la mercancía).
- **Controles:** listas cerradas (marca H o S) → selector «código — texto» (las listas de diseño, marca S, muestran solo el texto); listas **abiertas** de `normativa.js` (países, puertos, UBIGEO, aduanas, unidades y clases de bulto: solo traen ejemplos) → texto con sugerencias, que acepta otros códigos. Consignatario y parte a notificar pasan de texto libre a listas cerradas de diseño (`tipoConsignatario`, `tipoNotify`, marca S) con los mismos valores de antes.
- **Números:** campo de texto con teclado decimal; punto decimal y coma de miles opcional («1,234.50»); junto al campo se indican la unidad, el máximo y los decimales admitidos (§6.1). Un número que no se puede usar **no entra en la operación**: queda pendiente, el campo se marca y la revisión pasa a **E20** «en pausa» (D14). Así la operación en memoria, el `.json` guardado y el respaldo siempre son válidos para **Abrir**; Guardar se niega mientras haya datos pendientes.
- **Secciones condicionales:** un campo que no se pide se oculta y deja de ser obligatorio, pero **conserva su dato** (al volver a pedirlo reaparece). Las casillas 8.1.5, 8.3.2 y 8.5.1–8.5.3 se piden según la fórmula del FOB del Incoterm (IT C 5.9) y nunca se ocultan si tienen un monto. En importación no se pide el tipo de despacho (el IT no trae lista). En CIF y CIP «¿Hay seguro?» queda en Sí y no se puede quitar.
- **Sugerencias dinámicas** (siempre editables, nunca pisan un dato propio): flete *prepaid*/*collect* según el Incoterm (D8), seguro = Sí al elegir CIF o CIP, país de adquisición = país del proveedor, tipo de despacho 00 al pasar a exportación. Operación nueva: consignatario = comprador, notify = consignatario, USD, forma de envío 1/1, intermediario = No, cobertura 110 %, 3 originales, estiba 0; ítem nuevo: estado 10 y objeto de ajuste = Sí.
- **Ítems:** tarjetas con resumen (producto · cantidad · valor · bultos); agregar, duplicar, eliminar (con confirmación) y subir/bajar. Las marcas propias de cada ítem se mueven con él. Duplicar no copia los equipos (cada serie e IMEI es único). Con datos pendientes en los ítems no se cambia su estructura (primero se corrigen).
- **Equipos (D9):** editor de texto, una línea por equipo «serie;IMEI;IMEI» (también con tabulador, para pegar desde una hoja de cálculo); solo aparece con 8517.13.00.00 u 8517.14.00.00 (o si el ítem ya tiene equipos).
- **Respaldo automático** (§2): `localStorage` del navegador, solo cuando hay cambios sin guardar y si la casilla está activa (por defecto, sí). Al abrir la página se **ofrece** «Recuperar la última operación» o «Descartar el respaldo»; nunca se carga solo. Un respaldo dañado o que no pasa la revisión de **Abrir** se descarta. Antes de Nueva, de cargar un ejemplo, de Abrir o de cerrar la pestaña con cambios sin guardar, se pide confirmación.
- **Página:** barra de pasos fija (1 Datos · 2 Revisión con contador · 3 Resultados · 4 Documentos) con el estado «cambios sin guardar»; índice de secciones lateral en escritorio y en fichas en el celular, con los errores de cada sección. La hoja de prueba de impresión de F1 solo se imprime (no ocupa la pantalla) hasta que F6 traiga los documentos.

**Documentos (F6)** [S]

- **Plantillas** (`js/documentos/`): solo leen la operación, el resultado de `calculos.js` y la revisión. No calculan ni redondean: las cifras se muestran con `Calculos.formato` (§6.1). El **desglose del precio** de la factura (C/D: flete; CIF/CIP: FOB + flete + seguro; grupo D: además los gastos en destino de 8.3.2) lo calcula `calculos.js` (`resultado.factura.desglose`); su primera línea es el resto del precio (Vc − lo incluido), que en CIF importación coincide con el FOB de IT C 5.9. El **importe en letras** («SON: … Y 00/100 DÓLARES AMERICANOS») es formato: lee los centavos exactos del total ya calculado.
- **Cifras de cuadre:** cada plantilla marca con `data-cuadre` las cifras que deben coincidir (bultos, pesos, volumen, valor, contenedor, precinto, VGM). La hoja resumen lee lo que **muestra** cada documento generado y lo compara con el cálculo (✔ / ✘); `pruebas.html` hace lo mismo.
- **Bloqueo:** con errores (o con el cálculo en pausa, E20) no se genera ningún documento; se explica por qué y se enlaza a «Revisión». Las advertencias no bloquean y la hoja resumen las lista.
- **Factura:** subpartida del SA a 6 dígitos [H\*] (§5); los 10 dígitos nacionales van en la DAM. Precio unitario con 2 decimales como mínimo y todos los que traiga el dato (hasta 6), sin redondear.
- **Lista de empaque:** pesos por bulto «neto / bruto» y m³ por bulto bajo las medidas, para que la tabla quepa en A4 vertical.
- **Hoja resumen:** cifras de la DAM con 3 decimales (IT IV.3) y comerciales con 2; no se vuelven a redondear. La **tabla de trazabilidad** se genera desde `DICCIONARIO.cobertura` (anexo A): una fila por requisito con campos aplicables a la operación; documentos = unión de `docs` de sus campos; DAM = sus casillas para el tipo de operación; marca = marcas de los campos.
- **Pantalla e impresión:** pestañas por documento (flechas, Inicio y Fin), hoja A4 a escala del ancho disponible (o «tamaño real» con desplazamiento dentro del visor), «Imprimir este documento» e «Imprimir todos» (Ctrl+P imprime todos). Al imprimir: `@page` A4 con márgenes, el aviso didáctico arriba de cada página, la referencia y la fecha de generación abajo y «Página X de Y» (en «Imprimir todos», X de Y cuenta todas las hojas del archivo); encabezados de tabla repetidos y filas sin cortar; cada documento empieza en una página nueva. La hoja de prueba de F1 se retiró.

**Instrucciones de embarque, B/L y VGM (F7)** [S]

- `js/documentos/bl.js` genera tres hojas (columna BL de §5): **instrucciones de embarque** del embarcador a la naviera; **borrador de B/L** con la leyenda «BORRADOR – DRAFT» (no es un título valor); **declaración VGM** del embarcador (método 1 o 2, responsable, fecha; VGM = peso bruto de la carga + estiba y trincaje + tara, §6.7, calculado en `calculos.js`; SOLAS VI/2 [H\*]; tara PV-16).
- Consignatario en el B/L: nominativo → el consignatario elegido; **a la orden** → «A la orden de / To the order of: …». Si el consignatario es «a la orden de…» y el notify es «el consignatario», el B/L pide indicar a quién notificar.
- Descripción **genérica** de la carga (nombres de los productos, SA a 6 dígitos y N° de factura, sin precios), con «STC / said to contain»; flete *prepaid* o *collect* según el dato `fleteBl` (D8) y «pagadero en» el puerto de embarque o de descarga; N° de originales en letras («TRES (3)»); cláusulas SLAC y STC explicadas.
- Bultos, peso bruto, volumen, contenedor y precinto llevan `data-cuadre`: el cuadro de cuadre de la hoja resumen y `pruebas.html` (grupos F7) comprueban que son los de la lista de empaque.

**Certificado de seguro y certificado de origen (F9)** [S salvo donde se cita]

- `js/documentos/seguro.js` (**SEG**, §3 doc 5) solo se genera si «¿Hay seguro?» = Sí (forzado en CIF y CIP); con FOB sin seguro no hay certificado. `js/documentos/origen.js` (**CO**, §3 doc 6) solo si se solicita trato preferencial. Ambos se registran antes de la hoja resumen: aparecen como pestañas «SEG» y «CO», entran en «Imprimir todos» y, como todos los documentos, no se generan si la revisión tiene errores (E04 en CIF/CIP sin datos del seguro; E01 con preferencia sin datos del CO).
- Los dos son **formatos referenciales didácticos**: no reproducen el modelo de ninguna aseguradora ni el formulario de ningún acuerdo. El CO lo dice en un recuadro visible también impreso: «FORMATO REFERENCIAL — el formato oficial depende del acuerdo comercial» con **POR VERIFICAR (PV-12)**.
- **SEG:** aseguradora, póliza (tipo, N°), N° de certificado y fecha de emisión; asegurado y beneficiario según el Incoterm [H\*: en CIF/CIP el vendedor a favor del comprador; en el grupo D el vendedor; en los demás el comprador, como dice A12]; lugar de pago de siniestros y agente de reclamos; viaje (nave, puertos con UN/LOCODE H\*, fecha de embarque, N° de B/L); Incoterm, factura, contenedor y precinto; mercancía con descripción genérica, bultos y peso bruto de la lista de empaque; moneda, base, cobertura, **suma asegurada** (§6.4, con importe en letras) y cláusulas ICC 2009 + guerra + huelgas [H\*]. La **prima no va en el cuerpo** (§6.4): la muestra un cuadro didáctico al final («no forma parte del certificado»: base × cobertura = suma asegurada × tasa = prima) que dice dónde aparece (factura CIF/CIP, DAM A 6.3, 7.32 y B 8.4, hoja resumen).
- **CO:** exportador, productor (si está vacío, «el mismo exportador»), importador, transporte y ruta (país de destino = prefijo del UN/LOCODE de descarga [H\*]), mercancías por ítem (bultos, descripción, SA a 6 dígitos con sus marcas, cantidad, peso bruto, valor de la línea, país de origen y **criterio de origen**), factura, marcas, observaciones (en blanco), declaración del exportador y certificación (entidad emisora, N° y fecha). El criterio vacío a propósito y marcado PV (caso 2) se muestra «POR VERIFICAR» con su nota; nota didáctica del CO en la DAM (A 7.9 y 7.23 en importación; S 7.9 no se llena).
- Nada se inventa: un dato vacío queda **en blanco** con el motivo en la ayuda «?» (D17; `Documentos.datos` admite `{ blanco, ayuda }` y `Documentos.filaDato` decide entre valor con marca H\*/PV, POR VERIFICAR visible o en blanco); la ayuda «?» es la misma de la DAM (`Documentos.ayuda`, accesible con teclado). Las advertencias de la revisión que tocan al certificado se muestran dentro de él sin repetir la regla: **A11** y **A12** en SEG; **A13** y **A14** en CO.
- Montos con 2 decimales (§6.1). `calculos.js` añade `ruta.paisEmbarque` y `ruta.paisDestino` (§4 C, un solo cálculo que ahora también usan B 5.8 y las series de exportación, S 7.27). Cifras de cuadre: SEG `valorFactura`, `bultos`, `pesoBruto`, `contenedor`, `precinto`, `sumaAsegurada`, `prima`; CO `bultos`, `pesoBruto`, `valorFactura`; la factura marca su línea «Seguro (prima)» del desglose CIF/CIP.
- **Hoja resumen:** «Documentos condicionales» dice por qué hay o no SEG y CO; el cuadro de cuadre añade las filas «Suma asegurada» y «Prima» cuando hay seguro y las columnas SEG y CO; la trazabilidad marca SEG o CO «no aplica» cuando no se generan. En `diccionario.js`, precio unitario → SEG y CO, unidad comercial → CO y peso bruto → SEG (lo que muestran los certificados; §5).
- Regresiones en `pruebas.html` (grupo F9, 43 pruebas): caso 1 → SEG sin CO; caso 2 → CO sin SEG; suma asegurada 22,044.00 y prima 66.13; cuadre con la lista de empaque y la factura; criterio POR VERIFICAR; variantes FOB sin seguro ni preferencia, CIF (43,505.00 / 130.52), FOB con seguro voluntario (A12), A11, A13, importación con preferencia, bloqueo por E04 y E01, inyección de HTML.
- A19 solo cuenta datos que usa la DAM: el criterio de origen vacío y marcado PV no es error (E01) y el certificado lo muestra POR VERIFICAR, pero A19 no lo cuenta (no se amplió A19; §7 corregido en F9.1).

**Correcciones de la auditoría de F9 (Codex), aplicadas en F9.1**

- F9-X1: en el certificado de seguro, el asegurado y el beneficiario (deducidos del Incoterm) llevan una marca **visible e impresa**: H\* + «Supuesto según el Incoterm; confirmar con la póliza». La explicación larga sigue en la ayuda «?».
- F9-X2: la explicación de quién corre el riesgo usa la matriz de `js/incoterms.js` (`regla.riesgo`): CIF «a bordo en el puerto de embarque», CIP «al entregar al primer transportista» [H\*]; ya no dice «desde el embarque» para CIP.
- F9-X3: `diccionario.js` declara SEG o CO en todos los campos que muestran las plantillas: dirección, ciudad y país del vendedor y del comprador, lugar convenido, tipo de contenedor, tasa de prima y flete (SEG); identificación fiscal del vendedor y del comprador, Incoterm, marca, modelo y «subpartida verificada» (CO); UN/LOCODE de los puertos (SEG y CO). Ninguno cambia la obligatoriedad (todos los usaba ya otro documento). La tabla §5 del plan queda como referencia; la de la hoja resumen sale del diccionario.
- F9-X4: §7 corregido: A19 cuenta solo los datos que usa la DAM (no se amplió); el criterio de origen vacío y marcado PV no es E01 y lo muestra el CO.
- F9-X5: el cuadro didáctico del seguro va entero en una página (sin título huérfano) y el cierre del CO (observaciones, declaración, certificación y nota de la DAM) va junto, sin dejar una página solo con la nota. El ajuste general de impresión (la lista de empaque hace que Chrome reduzca a ~89 % el PDF de «Imprimir todos», ya desde F8c) queda para **F10**.
- Regresiones en `pruebas.html` (grupo F9.1, 11 pruebas, con filas concretas de la tabla de trazabilidad de la hoja resumen).

**DAM Formato C (F8c)** [S salvo donde se cita]

- `js/documentos/dam_c.js` genera el **Formato C** (liquidación de la deuda tributaria aduanera), **solo en la importación** (IT IV.1: regímenes que cancelan o garantizan tributos; en la exportación no se genera). Casillas de **IT D** con número, rótulo, valor y fuente, en la misma rejilla de los Formatos A y B (`Documentos.dam`, que ahora también exporta `agente`) y con las reglas D17/D18.
- Cabecera (aduana, N° de orden, destinación, modalidad, tipo de despacho en blanco con PV pequeña; número de declaración «No llenar»); rubro 1 (1.1 importador [verificar], 1.2 documento, 1.3 almacén = depósito temporal con RUC en blanco y PV-28); rubro 2 en blanco (reservado a la Autoridad Aduanera; desde F8c.1).
- **Rubro 3:** 3.1–3.5 = A 6.1–6.5; un monto en 0 (en el caso 1, 3.4) queda en blanco con «Sin monto» en la ayuda (desde F8c.1).
- **Rubro 4:** primero un **cuadro didáctico por serie** (valor aduana, tasa AV, 4.1–4.4, base del IGV, 4.5, 4.6, 4.7 y total; la liquidación se hace por serie y se suma, §6.6; el IT D solo trae las casillas del total) con la aritmética de cada serie a la vista; luego la rejilla con los **totales**: 4.1–4.7 (en 0 → en blanco, «Sin monto» en la ayuda), la **base del IGV** como casilla sin número con H\* (antidumping fuera: PV-17), **4.8 = POR VERIFICAR (PV-02)** sin monto, **4.9 en blanco** (no aplica en v1 [S]), 4.10–4.12 sin rótulo en el IT (en blanco) y **4.13 Total** (4.1 a 4.7; no incluye 4.8; IT D: «4.13 Total», corregido en F8c.1).
- **Rubro 5:** forma de pago en blanco (se llena a mano, IT D 5); tipo de cambio venta con su marca (S en el caso 1), fecha (en blanco si no hay dato) y fuente (PV-07); total en soles = total del rubro 4 × tipo de cambio, con 2 decimales [S; PV-08].
- Rubros 6 (despachador de aduana, código en blanco PV-28, fecha de formulación; firma en blanco), 7 y 8 reservados, en blanco.
- **Percepción del IGV fuera del Formato C:** recuadro didáctico rotulado «FUERA DEL FORMATO C» después del formato: base = valor aduana + tributos del Formato C (incluido el antidumping, H\* Ley 29173 + PV-17, D11), tasa con PV-01 (un valor por operación, D2/D6), monto en USD y en soles, y el total a pagar en soles (tributos + percepción).
- La plantilla **solo lee** `r.valorAduana`, `r.series[].liquidacion`, `r.liquidacion`, `r.percepcion` y `r.soles` (no hizo falta añadir totales a `calculos.js`). Las cifras llevan `data-cuadre` propias (`c31`…`c35`, `c41`, `c45`, `c46`, `cTotal`, por serie `cVa1`, `c41s1`, `cBase1`…; `cSoles`, `cPercepcion`…), que no son del cuadro de cuadre de la hoja resumen (no se añade columna).
- Regresiones en `pruebas.html` (grupo F8c, 32 pruebas: cifras de §9.1 por serie y totales, 3.1–3.5 = A 6.1–6.5, 4.8 POR VERIFICAR, 4.9 en blanco, soles, percepción fuera del formato con sus marcas, caso 2 sin Formato C, bloqueo con errores, mutación ISC + antidumping, XSS).

**Correcciones de la auditoría de F8c (Codex), aplicadas en F8c.1**

- F8c-X1: el total del rubro 4 va en la casilla **4.13 «Total»**, como dice la copia local de IT D (antes: 4.13 vacía «sin rótulo» y un Total sin número). Conserva `data-cuadre="cTotal"` y la nota «No incluye el servicio de despacho (4.8, PV-02)». 4.10–4.12 siguen sin rótulo y en blanco.
- F8c-X2: el rubro 2 (Registro de aduana, uso exclusivo de la Autoridad Aduanera) queda **en blanco** (D17), con estado «reservada» y el motivo en la ayuda «?»; sin «NO NUMERADA» ni nota interior (el aviso didáctico general identifica el documento).
- F8c-X3: en las casillas oficiales del Formato C, un monto en 0 queda **en blanco** con «Sin monto en esta operación (0)» en la ayuda (`Calculos.esCero`), también en el rubro 3 (3.4 en el caso 1). Los cuadros didácticos conservan los ceros explícitos. El Formato A **no cambia** (A 6.4, 7.33 siguen con «0.000»).
- **[verificar]** La numeración «1.1» del importador es una inferencia de la plantilla: IT D muestra «Importador» bajo el rubro 1 y luego 1.2 y 1.3, sin numerarlo de forma explícita; confirmarlo con el anexo (PV-23).
- Regresiones en `pruebas.html` (grupo F8c: 4.13 = Total = 4,222.709, 4.10–4.12 en blanco, rubro 2 en blanco, 3.4 en blanco con ayuda).

**Dudas abiertas para Aarón (tras F8c.1)**

- Importes en 0 en las casillas monetarias de la DAM: el Formato B y el Formato C los dejan **en blanco** (D17), pero el Formato A muestra «0.000» (A 6.4, 7.33, S 6.3, S 6.4). ¿Se unifica el Formato A al mismo criterio? Hasta que decida, el A no cambia.
- Rubro 2 del Formato A y del B: siguen mostrando «NO NUMERADA» (aprobado en F8a/F8b); en el C queda en blanco (F8c-X2). ¿Se unifican?

**Correcciones de la auditoría de F8b (Codex), aplicadas en F8b.1**

- F8b-B1: la casilla «Declarante del Formato B» queda **en blanco** (D17) mientras la herramienta no pida los datos del declarante; conserva rótulo, fuente y ayuda «?». Regresión en `pruebas.html` (grupo F8b.1).

**DAM Formato B y B1 (F8b)** [S salvo donde se cita]

- `js/documentos/dam_b.js` genera el **Formato B** (declaración del valor) y el **B1**, **solo en la importación** (en la exportación no hay Formato B [H: IT IV.1]). El B lleva los rubros 1–4, los **ítems 1 y 2**, los rubros 6, 7 y 8 y el «Declarante del Formato B»; el **B1**, los ítems 3 a N, y solo aparece con **más de 2 ítems** [H: IT IV.1, comprobado en la copia local]. Cuántos ítems caben en cada hoja B1 depende del diseño del anexo (PV-23): los ítems siguen uno tras otro, con un recordatorio didáctico (importador, N° de orden, «NO NUMERADA») que no es casilla del B1.
- Casillas de **IT C** con su número, rótulo, valor y fuente, en la misma rejilla del Formato A (`Documentos.dam`, que exporta `dam_a.js`) y con las mismas reglas D17/D18: casillas vacías o que no aplican **en blanco** con el motivo en la ayuda «?»; códigos oficiales abiertos en blanco con PV pequeña (entidad financiera PV-09; moneda PV-09; código del proveedor, que lo comunica la Aduana); supuestos del ejemplo con una «S» pequeña (nivel comercial, condición, naturaleza, respuestas del rubro 7: D1, D7; flete; unidad «U»).
- Rubro 4: 4.1, 4.2 y los «otros datos» a)–k) de IT C rubro 4 (sin número de casilla en el IT: se rotulan con su letra). g)–k) solo con modalidad de pago 2; g) = 1 si solo una parte se paga a crédito, 2 si todo (lo deriva `calculos.js`). c) a f) quedan en blanco (la herramienta no pide esos datos en v1).
- Rubro 5 por ítem: 5.1–5.20. 5.4 = «Incoterm – ciudad – versión» (4 = 2020). 5.8 = país del UN/LOCODE de embarque [H\*]. 5.9 y 5.10 con 6 decimales (IT IV.3); cantidad de 5.11 entera sin decimales. El **FOB total del ítem** y el **ajuste total del ítem** se muestran en casillas **sin número** («cálculo, sin casilla»): son datos intermedios de IT C 5.9 y 5.10, no casillas del formato. 5.15, 5.17, 5.18 y 5.20 en blanco.
- Rubro 7: el texto de cada pregunta (de `normativa.js`); 7.2, 7.3 y 7.6 en blanco si 7.1 o 7.5 no son «Sí»; 7.15 «No llenar»; 7.16–7.20 reservadas.
- Sección 8: todas sus casillas con su rótulo de IT C; un monto 0 queda en blanco («Sin monto en esta operación», en la ayuda). Los rótulos de **8.1.2, 8.1.3 y 8.1.5** no figuran en la copia del instructivo: se describe su contenido con **POR VERIFICAR** (§4 B7). 8.4 = prima si hay seguro; sin seguro, en blanco (IT C 8.4). «Total base de cálculo», «Total adiciones», «Total gastos de transporte» y «Total deducciones» son casillas reservadas para uso posterior: en blanco.
- **Cuadro didáctico** al final del B (no forma parte del formato): la fórmula del FOB total del Incoterm con sus cifras («20,040.000000 − 1,850.000000 − 66.130000 = 18,123.870000», = A 6.1), una tabla ítem por ítem (valor en factura → FOB del ítem → cantidad → FOB unitario 5.9) y el ajuste total de IT C 5.10.
- La plantilla **solo lee**: `calculos.js` entrega `items[].fob`, `fobUnitario`, `ajuste`, `ajusteUnitario`, `fob.terminos` y el nuevo `formatoB` (`seccion8` con el monto de cada casilla, `paisEmbarque`, `versionIncoterm`, `pagoDiferidoParcial`). Formato nuevo `Calculos.formato.damBCantidad`. El anexo A pasa «país de embarque» y «versión del Incoterm» de *reservado* a **derivado**.
- Hoja resumen: el cuadro de cuadre solo tiene columna para los documentos que muestran alguna de sus cifras (las hojas DAM A1, B y B1 no muestran ninguna). Con una columna por documento la tabla no cabía en A4 y Chrome reducía todo el PDF de «Imprimir todos» (ya ocurría en F8a.2, ~87 %); ahora se imprime a escala real.
- Regresiones en `pruebas.html` (grupo F8b, 43 pruebas: cifras de §9.1, B1 con 3 y 4 ítems y sin B1 con 1 o 2, exportación sin B, mutaciones de ajustes, pago a crédito, intermediario y vinculación, XSS, cuadro de cuadre de la hoja resumen).

**Correcciones de la auditoría de F8a.2 (Codex), aplicadas en F8a.3**

- F8a.2-M1: S 7.20 muestra el texto del estado («Nuevo / Bueno») y deja el código **en blanco** con PV pequeña (D18 c): la lista de IT C 5.16 es la del Formato B y no confirma el código de la exportación (PV-09).
- F8a.2-M2: los motivos que salieron de las casillas en blanco (D17) y las notas de las marcas pequeñas ya no quedan solo en `title`: cada casilla con motivo lleva un botón **«?»** en su cabecera (fuera del área de valor; `aria-expanded` y `aria-controls`, teclado y toque, el mismo patrón del formulario) que despliega la explicación. El botón y la ayuda no se imprimen; las casillas siguen en blanco.
- F8a.2-B1: §9.2 ya no asocia los 140 bultos a S 13.2: son el total de embalaje de «Resultados», la lista de empaque y la hoja resumen; S 13.2 queda en blanco (D18 b).
- Regresiones en `pruebas.html` (grupo F8a.3).

**Revisión de Aarón del Formato A, aplicada en F8a.2 (D17 y D18)**

- `casilla()` de `dam_a.js`: con estado «no-llenar», «reservada» o «no-aplica», o sin valor, la casilla queda **en blanco** (sin clase `dam-gris`); el estado va en `data-estado` y el motivo en la ayuda emergente (`title`), junto con la fuente (desde F8a.3, también en la ayuda «?» accesible). Lo mismo para las que antes decían «—» o «— (no se acoge)» (A 7.5, 7.9 sin CO, 7.20, 7.22–7.25; S 7.28, 7.37) y para A 3.4 en despacho anticipado (PV pequeña, PV-26 en la ayuda).
- Pesos 7.14 y 7.15 con `Calculos.formato.kg` (2 decimales).
- Marca pequeña (superíndice «PV» o «S», nota en la ayuda) para los códigos oficiales en blanco: 5.1, 7.13, 3.1, 4.1, 8, tipo de despacho en importación y moneda de 7.29; «U» de 7.16 con «S». Un código escrito por el usuario y sin marca PV propia sí se muestra (con la marca de su campo). La leyenda de la nota explica la casilla en blanco y la PV pequeña.
- S 13.1 y 13.2 y A/S 7.39 según D18 b y d; nota RS 129 según D18 a.
- Regresiones en `pruebas.html` (grupo F8a.2; los grupos F8a y F8a.1 se ajustan a D17/D18).

**Correcciones de la auditoría de F8a (Codex), aplicadas en F8a.1**

- F8a-M1: las cantidades de la DAM (A 7.10, 7.16) usan `Calculos.formato.damCantidad`: enteras sin decimales («360») y no enteras con 3 decimales («360.500») [H: IT IV.3].
- F8a-M2: la marca de la subpartida se deriva de la marca explícita del dato **y** de «subpartida verificada» (la misma condición de A08), en la factura, el B/L y la DAM 7.19. Sin marca explícita y sin verificar, la nota dice que **ni el SA de 6 dígitos ni los dígitos nacionales** están confirmados (y el SA no lleva H\*); con marca explícita, la nota es la del dato. Verificada y sin marca PV → sin POR VERIFICAR (el DV sigue PV-27).
- F8a-M3: S 13.1 ya no se atribuye a la Aduana: «Reservada para la recepción de la mercancía en zona primaria» y POR VERIFICAR quién la llena (como S 13.2). *(F8a.2, D18 b: ahora S 13.1 y 13.2 quedan en blanco y eso va en la ayuda.)*
- F8a-B1: la cabecera didáctica del A1 lleva «NO NUMERADA» como recordatorio (no es una casilla oficial del A1).
- Regresiones en `pruebas.html` (grupo F8a.1).

**DAM Formato A y A1 (F8a)** [S salvo donde se cita]

- `js/documentos/dam_a.js` genera dos hojas: **Formato A** (cabecera, rubros 1–6, la **serie 1**, rubros 8, 9 y casillas 10–15) y **Formato A1** (series 2 a N), que solo aparece con más de una serie [H: IT IV.1]. Cuántas series caben en cada hoja A1 depende del diseño gráfico del anexo, que no está en la copia (PV-23): aquí las series siguen una tras otra y la cabecera (aduana, N° de orden, destinación, modalidad / tipo de despacho) se repite en el A1 [S].
- Casillas de **IT A** (ingreso, destinación 10) e **IT B** (salida, destinación 40), con su número, rótulo, valor y **fuente** visible (también impresa) y en la ayuda emergente. Las que el IT manda «No llenar», las reservadas y las que no aplican al régimen quedan **en blanco** con el motivo en la ayuda (D17; antes, en gris con el motivo) (ej. S 7.31–7.34, S 7.9, S 7.29; A 3.5–3.7, 4.2, 4.3, 7.3, 7.4, 7.17, 7.18, 7.21, 7.28; 10–15).
- **POR VERIFICAR** visible, nunca inventado: dígito verificador de 7.19 (PV-27); reparto de 7.31 y 7.32 entre series (PV-04); 7.16 si la unidad física difiere de la comercial (PV-09). Desde F8a.2 (D18 c), los códigos oficiales abiertos (entidad financiera y clase de bulto PV-09, agentes PV-28, tipo de despacho en importación, A 3.4 en despacho anticipado PV-26) quedan en blanco con una PV pequeña; moneda con PV-09 pequeña; «U» como [S].
- **RS 129-2026:** de la copia local del control de cambios, el único cambio es el párrafo final de **A 7.35** (series e IMEI de 8517.13.00.00 y 8517.14.00.00). La casilla A 7.35 lleva la nota «párrafo añadido por RS 129-2026, vigente desde el 05-10-2026» solo en las series con 8517.13.00.00 u 8517.14.00.00 (D18 a) y, si el ítem tiene equipos, los lista. No hay cambios en IT B.
- La plantilla **solo lee** `calculos.js`: series, 7.30–7.34 y 6.1–6.5 (importación) o S 6.1–6.5 (exportación). Para 7.10 y 7.16 `calculos.js` suma por serie la cantidad comercial y, si todos los ítems usan como unidad física su unidad comercial, la cantidad física (si no, `null` → PV). Formato: 3 decimales (IT IV.3) en cantidades no enteras; pesos con 2 decimales (D17); fechas «DD MM AAAA» (IT IV.6).
- Contenido de casillas sin dato en v1: 7.2 = números de ítem de la operación (el Formato B los numerará igual en F8b) [S]; 7.5, 7.20, 7.22–7.25 en blanco si no corresponden; 7.37 importación = k) unidad de carga 02 y l) región de destino; S 7.27 = país de destino y el puerto de desembarque «que se transmite»; S 7.28 en blanco (no se acoge) [S]; S 13.1 y 13.2 en blanco (D18 b).
- Rubro 9 lleva el contenedor y el precinto con `data-cuadre`: el cuadro de cuadre de la hoja resumen comprueba que son los de la lista de empaque.
- Regresiones en `pruebas.html` (grupo F8a).

**Correcciones de la auditoría de F6/F7 (Codex), aplicadas en F7.1**

- F7-M1: nuevo error **E21**: B/L nominativo con consignatario «a la orden de…» (bloquea los documentos hasta elegir B/L a la orden o un consignatario concreto).
- F7-M2: «STC (dice contener / said to contain)» solo aparece en la descripción de la carga si la cláusula STC está elegida.
- F6-M1: las plantillas muestran la **marca efectiva** de cada dato (la de la operación; si no tiene, la de su lista o la del diccionario): UN/LOCODE con H\*; el SA de 6 dígitos con H\* y, si la subpartida nacional está marcada PV, «POR VERIFICAR» con la explicación de que lo pendiente son los 4 dígitos nacionales (PV-10).
- F6-M2: la lista de empaque imprime la descripción de cada ítem y, cuando difieren del embarcador o del consignatario, el vendedor y el comprador; la factura imprime el consignatario y la parte a notificar (§5), y el diccionario asigna el notify a FC y BL.
- F6-B1: la tabla de trazabilidad tiene una columna «Fuente» con las citas del diccionario (sin repetir por grupo).
- Observación del orquestador: al imprimir, el aviso «DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES» aparece **una sola vez** por página (margen superior de `@page`, 10 pt); el recuadro de la hoja solo se ve en pantalla.
- Regresiones en `pruebas.html` (grupo F7.1 y mutación E21).

**Correcciones de la auditoría de F5 (Codex), aplicadas en F5.1**

- F5-M1: un número no válido en un campo que **deja de pedirse** (ej. tasa de prima con «¿Hay seguro?» = No) ya no deja la operación en pausa. Queda **en suspenso**: no bloquea, la operación conserva el valor anterior, el panel «Revisión» lo informa con un botón para descartar el texto no válido, y si el campo vuelve a pedirse se revisa de nuevo (E20). Antes de agregar, mover o eliminar ítems, los pendientes ocultos de los ítems se descartan con aviso.
- F5-M2: el editor de equipos rechaza series o IMEI de más de 5 000 caracteres (el mismo límite de **Abrir**). Además, **Guardar** y el respaldo automático comprueban con `Modelo.revisarArchivo` que la operación se podrá abrir.
- Regresiones en `pruebas.html` (grupos F5.1-M1 y F5.1-M2).

**Pendientes de las re-auditorías de F3.1 y F4.1, resueltos en F4.2**

- F31-B1: los decimales de un número se cuentan desde la mantisa y el exponente de su escritura (`1e-21` tiene 21 decimales), sin redondearlo antes; `1e-21` y `1e-25` ya no eluden el límite al abrir ni al calcular.
- F41-B1: E03 solo quita el prefijo «Puerto de …», «Puerto del …» o «Port of …» al inicio y el país del puerto (nombre o código) al final; las palabras internas se conservan («Callao of», «Callao Puerto» y «Port Callao of the» dan E03).
- F41-B2: la explicación de A10 (§7) distingue régimen y momento del levante en las consecuencias de no usar medios de pago.
- Regresiones en `pruebas.html` (grupos F4.2).

**Pendientes de la re-auditoría de F2.1, resueltos en F4**

- F21-M1: matriz de cobertura §4/§5 → rutas del diccionario en el **anexo A**; `DICCIONARIO.revisarCobertura()` la comprueba (cada campo cubierto por un requisito y cada requisito con campos) y el resultado se ve en `index.html` y en `pruebas.html`.
- F21-B1: las notas de las marcas respetan el límite de 5 000 caracteres al abrir un archivo.

---

## Anexo A. Matriz de cobertura del plan (§4 y §5 → diccionario)

Generada desde `DICCIONARIO.cobertura` (`js/diccionario.js`). "dato" = se ingresa; **derivado** = lo calcula `calculos.js`; *reservado* = se mostrará en una fase posterior. `x.*` cubre todas las rutas que empiezan por `x.`; `items[]` = cada ítem.

| §4 | Fila de §5 | Requisito | Rutas del diccionario | Estado |
|---|---|---|---|---|
| — | — | Identificación del archivo (control interno, no es requisito del §4) | `formato`, `version`, `meta.descripcion`, `meta.ficticio` | dato |
| A1 | Tipo de operación | Tipo de operación | `generales.operacion.tipo` | dato |
| A1 | Referencia interna | Referencia interna | `meta.referencia` | dato |
| A1 | — | Modalidad de carga (FCL) | `generales.operacion.modalidadCarga` | dato |
| A2 | Vendedor / proveedor / exportador | Vendedor: datos, condición, RUC y UBIGEO | `generales.partes.vendedor.*` | dato |
| A2 | Comprador / importador | Comprador: datos, RUC y UBIGEO | `generales.partes.comprador.*` | dato |
| A2 | Comprador / importador | Código de documento (4 = RUC) | — | **derivado**: Fijo en v1 (IT A 1.2); se mostrará en la DAM (F8a) |
| A2 | Consignatario y notify | Consignatario y parte a notificar | `generales.partes.consignatario.*`, `generales.partes.notify.*` | dato |
| A2 | Naviera | Naviera | `generales.partes.naviera.*` | dato |
| A2 | Agente marítimo | Agente marítimo | `generales.partes.agenteMaritimo.*` | dato |
| A2 | Agente de aduana, N° de orden | Agente de aduana (declarante) | `generales.partes.agenteAduana.*` | dato |
| A2 | Depósito temporal | Depósito temporal | `generales.partes.depositoTemporal.*` | dato |
| A2 | Entidad financiera, modalidad y medio de pago | Entidad financiera | `generales.partes.entidadFinanciera.*` | dato |
| A2 | — | Aseguradora | `generales.partes.aseguradora.*` | dato |
| A2 | Acuerdo, criterio, N° de CO | Productor y entidad emisora del CO | `generales.partes.productor.*`, `generales.partes.entidadCO.*` | dato |
| A3 | Puerto de embarque | Puerto de embarque (nombre y UN/LOCODE) | `generales.ruta.puertoEmbarque.*` | dato |
| A3 | Puerto de descarga | Puerto de descarga (nombre y UN/LOCODE) | `generales.ruta.puertoDescarga.*` | dato |
| A3 | País de adquisición / embarque / destino | País de adquisición | `generales.ruta.paisAdquisicion` | dato |
| A3 | País de adquisición / embarque / destino | País de embarque (B 5.8) | — | **derivado**: calculos.js: formatoB.paisEmbarque (del UN/LOCODE de embarque); se muestra en el Formato B (F8b) |
| A3 | País de adquisición / embarque / destino | País de destino (S 7.27) | — | **derivado**: calculos.js: series[].paisDestino |
| A3 | — | Lugar de recepción y de entrega | `generales.ruta.lugarRecepcion`, `generales.ruta.lugarEntrega` | dato |
| A4 | Incoterm + lugar + versión | Incoterm y lugar convenido | `generales.comercial.incoterm`, `generales.comercial.lugarConvenido` | dato |
| A4 | Incoterm + lugar + versión | Versión del Incoterm (4 = 2020) | — | **derivado**: calculos.js: formatoB.versionIncoterm (fija en v1, IT C 5.4); se muestra en B 5.4 (F8b) |
| A4 | Moneda | Moneda | `generales.comercial.moneda` | dato |
| A4 | N° y fecha de factura | N° y fecha de factura | `generales.comercial.facturaNumero`, `generales.comercial.facturaFecha` | dato |
| A4 | Entidad financiera, modalidad y medio de pago | Modalidad y condiciones de pago | `generales.comercial.modalidadPago`, `generales.comercial.condicionesPago` | dato |
| A4 | Entidad financiera, modalidad y medio de pago | Medio de pago y pago diferido | `generales.comercial.medioPago`, `generales.comercial.pagoDiferido.*` | dato |
| A4 | — | N° de contrato u orden de compra | `generales.comercial.contrato` | dato |
| A5 | Aduana, destinación, modalidad, tipo de despacho | Aduana, modalidad y tipo de despacho | `generales.aduana.aduana`, `generales.aduana.modalidadDespacho`, `generales.aduana.tipoDespacho` | dato |
| A5 | Aduana, destinación, modalidad, tipo de despacho | Destinación (10 / 40) | — | *reservado*: Se deriva del tipo de operación; se mostrará en la DAM (F8a) |
| A5 | Agente de aduana, N° de orden | N° de orden y fecha de formulación | `generales.aduana.numeroOrden`, `generales.aduana.fechaFormulacion` | dato |
| A5 | Tipo de cambio | Tipo de cambio, fecha y fuente | `generales.aduana.tipoCambio`, `generales.aduana.tipoCambioFecha`, `generales.aduana.tipoCambioFuente` | dato |
| A5 | Región de destino | Región de destino | `generales.aduana.regionDestino` | dato |
| A6 | Declaración del valor | Nivel comercial, naturaleza, forma de envío y tipo de valor | `generales.valor.nivelComercial`, `generales.valor.naturaleza`, `generales.valor.formaEnvio`, `generales.valor.tipoValor` | dato |
| A6 | Declaración del valor | Intermediario (rubro 6) | `generales.valor.intermediario.*` | dato |
| A6 | Declaración del valor | Condiciones de la transacción (rubro 7) | `generales.valor.rubro7.*` | dato |
| B1 | Nombre, descripción, marca, modelo | Nombre, descripción, marca y modelo | `especificos.items[].nombre`, `especificos.items[].descripcion`, `especificos.items[].marca`, `especificos.items[].modelo` | dato |
| B1 | Subpartida + dígito verificador | Subpartida nacional y casilla «verificada» | `especificos.items[].subpartida`, `especificos.items[].subpartidaVerificada` | dato |
| B1 | Subpartida + dígito verificador | Dígito verificador de la subpartida | — | *reservado*: Queda vacío con PV-27 en la DAM (F8a) |
| B1 | País de origen | País de origen (y UBIGEO de fabricación en exportación) | `especificos.items[].paisOrigen`, `especificos.items[].ubigeoOrigen` | dato |
| B1 | Estado | Estado | `especificos.items[].estado` | dato |
| B1 | Cantidad y unidad comercial / física | Cantidad, unidad comercial y unidad física | `especificos.items[].cantidad`, `especificos.items[].unidadComercial`, `especificos.items[].unidadFisica` | dato |
| B1 | Precio unitario y valor | Precio unitario | `especificos.items[].precioUnitario` | dato |
| B1 | Números de serie e IMEI | Equipos: serie e IMEI (D9) | `especificos.items[].equipos` | dato |
| B1 | Ajustes | Ítem objeto de ajuste | `especificos.items[].objetoAjuste` | dato |
| B2 | Tipo, clase y N° de bultos | Clase de bulto y unidades por bulto | `especificos.items[].claseBulto`, `especificos.items[].unidadesPorBulto` | dato |
| B2 | Peso neto / Peso bruto | Pesos neto y bruto por bulto | `especificos.items[].pesoNetoBulto`, `especificos.items[].pesoBrutoBulto` | dato |
| B2 | Medidas y volumen | Medidas del bulto | `especificos.items[].largoCm`, `especificos.items[].anchoCm`, `especificos.items[].altoCm` | dato |
| B2 | Marcas | Marcas de embarque | `especificos.marcasEmbarque` | dato |
| B3 | Contenedor y precinto | Tipo, número y precinto del contenedor | `especificos.contenedor.tipo`, `especificos.contenedor.numero`, `especificos.contenedor.precinto` | dato |
| B3 | Contenedor y precinto | Unidad de carga (02) | — | *reservado*: Fija en v1 (IT A 7.37 k); se mostrará en la DAM (F8a) |
| B3 | Tara y VGM | Tara, estiba y datos de la declaración VGM | `especificos.contenedor.tara`, `especificos.contenedor.estibaTrincaje`, `especificos.contenedor.vgmMetodo`, `especificos.contenedor.vgmResponsable`, `especificos.contenedor.vgmFecha` | dato |
| B4 | Nave y viaje | Nave, viaje, booking y manifiesto | `especificos.transporte.nave`, `especificos.transporte.viaje`, `especificos.transporte.booking`, `especificos.transporte.manifiesto` | dato |
| B4 | N° de B/L | Datos del B/L (número, tipo, originales, emisión, cláusulas, embarcador) | `especificos.transporte.blNumero`, `especificos.transporte.blTipo`, `especificos.transporte.blOriginales`, `especificos.transporte.blLugarEmision`, `especificos.transporte.blFechaEmision`, `especificos.transporte.fechaShippedOnBoard`, `especificos.transporte.clausulaSlac`, `especificos.transporte.clausulaStc`, `especificos.transporte.shipper` | dato |
| B4 | Flete | Flete en el B/L, prepaid o collect (D8) | `especificos.transporte.fleteBl` | dato: El valor sugerido lo calcula calculos.js: fleteBl.sugerido |
| B4 | Fechas de embarque / llegada / descarga | Fechas de embarque, término de embarque, ETA y término de descarga | `especificos.transporte.fechaEmbarque`, `especificos.transporte.fechaTerminoEmbarque`, `especificos.transporte.eta`, `especificos.transporte.fechaTerminoDescarga` | dato |
| B5 | Póliza, cláusulas, % de cobertura | Seguro: póliza, cláusulas, cobertura, prima, siniestros y tabla SUNAT | `especificos.seguro.*` | dato |
| B5 | Prima / seguro | Tipo de seguro (A 7.32), suma asegurada y prima | — | **derivado**: calculos.js: seguro.tipoSeguro, seguro.sumaAsegurada, seguro.prima |
| B6 | Acuerdo, criterio, N° de CO | Trato preferencial, acuerdo, criterio y certificado de origen | `especificos.origen.*` | dato |
| B6 | Tributos, TPI | Código TPI | `especificos.items[].tpi` | dato |
| B7 | Flete | Flete internacional | `especificos.valoracion.flete` | dato |
| B7 | Ajustes | Sección 8 del Formato B: gastos, ajustes, adiciones y deducciones | `especificos.valoracion.gastosExw815`, `especificos.valoracion.otros816`, `especificos.valoracion.ajuste812`, `especificos.valoracion.ajuste813`, `especificos.valoracion.descuentosNoAceptables814`, `especificos.valoracion.comisiones821`, `especificos.valoracion.envases822`, `especificos.valoracion.materiales8231`, `especificos.valoracion.herramientas8232`, `especificos.valoracion.consumidos8233`, `especificos.valoracion.ingenieria8234`, `especificos.valoracion.canones824`, `especificos.valoracion.reversion825`, `especificos.valoracion.gastosDestino832`, `especificos.valoracion.posteriores851`, `especificos.valoracion.montaje852`, `especificos.valoracion.tributos853`, `especificos.valoracion.intereses854`, `especificos.valoracion.otros855` | dato |
| B7 | Precio unitario y valor | Exportación: otros gastos deducibles y ajustes (S 6.3, S 6.4) | `especificos.valoracion.expOtrosDeducibles`, `especificos.valoracion.expAjustes` | dato |
| B8 | Tributos, TPI | Tasas y montos de tributos por ítem y código «Tipo» | `especificos.items[].tasaAV`, `especificos.items[].sobretasa`, `especificos.items[].derechoEspecifico`, `especificos.items[].isc`, `especificos.items[].antidumping`, `especificos.items[].tipoA720` | dato |
| B8 | Tributos, TPI | Tasa de percepción del IGV (por operación, D2) | `especificos.tributos.tasaPercepcion` | dato |
| C | Tipo, clase y N° de bultos | Bultos, numeración, pesos, volumen y VGM | — | **derivado**: calculos.js: items[], totales, vgm |
| C | Precio unitario y valor | Series, FOB por ítem y unitario, ajustes, flete y seguro por serie, valor en aduana | — | **derivado**: calculos.js: items[].fob, series[], valorAduana, exportacion |
| C | Tributos, TPI | Liquidación, percepción y pago en soles | — | **derivado**: calculos.js: liquidacion, percepcion, soles |
