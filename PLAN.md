# PLAN — Generador didáctico de documentos del transporte marítimo internacional

> **Estado:** plan **v2 aprobado**. Fases hechas: F1, F2 y **F2.1** (correcciones de la auditoría de F2 y decisiones D1–D9, §11). Fase siguiente: **F3** (cálculos y página de pruebas). Revisión de Aarón al final de cada fase.
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
    ├── pantalla.js       ← conecta la interfaz (botones, vista de datos y resultados); no calcula (D3)
    └── documentos/       ← una plantilla por documento; solo leen, no calculan
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
  - Formatos A y C: cifras no enteras con **3 decimales** [H: IT IV.3].
  - Formato B: cifras no enteras con **6 decimales** [H: IT IV.3].
  - Montos en USD [H: IT IV.4].
  - Fechas DD MM AAAA [H: IT IV.6].
- **Método de redondeo:** mitad hacia arriba [S]; el método oficial es PV-08.
- Los cálculos internos se hacen con enteros (centavos o milésimos) para evitar errores de coma flotante [S].
- **Prorrateos:** cada parte se redondea y la diferencia se asigna a la última, para que la suma cuadre exacta [S].
- Pesos en kg con 2 decimales; volumen en m³ con 3 decimales [S].

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
| Fuera del C | **Percepción del IGV** | tasa × (VA + tributos) | PV-01 (no figura entre las casillas del Formato C) |
| C rubro 5 | Pago en soles | monto en USD × tipo de cambio venta de la fecha de pago | [H: IT D rubro 5]; fuente del tipo de cambio: PV-07 |

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
| A10 | FOB dentro de un umbral de despacho simplificado (PV-03). No confundir con los US$ 2 000 de IT C, que son de medios de pago. |
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
| Bultos (S 13.2, sin contar contenedor ni paletas) | 140 cajas |
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
| F1 | Estructura de carpetas + `index.html` con el aviso didáctico | Doble clic → se abre la página con el aviso |
| F2 | `diccionario.js`, `normativa.js` (listas con marca H/H\*/PV), modelo, ejemplos y botones Guardar/Abrir | Cargas un ejemplo, lo guardas y lo reabres: datos idénticos |
| F3 | `calculos.js` + `pruebas.html`, con controles negativos (RUC, ISO 6346, IMEI sintético) | Todo en verde; las cifras coinciden con §9 |
| F4 | Validaciones + panel de errores y advertencias | Cada caso muestra solo sus advertencias esperadas; si alteras un dato a propósito, sale el error esperado |
| F5 | Formulario completo: ítems variables, secciones condicionales, ayuda por campo y marcas H\*/PV visibles | Cambias una cantidad y los totales se actualizan; ves las etiquetas H\* y PV |
| F6 | Factura comercial + lista de empaque + hoja resumen con tabla de trazabilidad | Imprimes a PDF; los totales cuadran con la hoja resumen |
| F7 | Instrucciones de embarque / borrador de B/L + VGM | Bultos, peso bruto, volumen y contenedor = lista de empaque |
| **F8a** | **DAM Formato A** (ingreso y salida, con A1) | Series, casillas y valores = §9.1 y §9.2. **Pausa: revisión de Aarón antes de seguir.** |
| F8b | DAM Formato B (+B1), solo con tu aprobación de F8a | FOB unitarios y sección 8 = §9.1 |
| F8c | DAM Formato C (liquidación) | Tributos = §9.1 |
| F9 | Certificado de seguro + certificado de origen (condicionales) | Con FOB no hay seguro; con CIF sí; sin preferencia no hay CO |
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

**Correcciones de la auditoría de F2 aplicadas en F2.1**

- Abrir revisa la estructura completa contra el modelo: bloques obligatorios, tipo de cada campo, ítems y equipos no nulos, campos desconocidos rechazados y marcas con ruta válida. La operación nueva se prepara completa antes de reemplazar la actual; si algo falla, la pantalla anterior se conserva.
- Límites al abrir: 2 MB, 200 ítems, 10 000 equipos por ítem, 4 IMEI por equipo, 12 niveles de anidamiento y 5 000 caracteres por texto. Mensajes de error en español.
- Formato del archivo: versión 2 (los archivos de la versión 1 se rechazan con un mensaje claro).
- Casillas B 8.1.2, 8.1.3 y 8.1.4 y selección de ítems objeto de ajuste (§4 B1 y B7, §6.5). Los rótulos de 8.1.2 y 8.1.3 no figuran en la copia del instructivo: POR VERIFICAR.
- La revisión del diccionario dice "Correspondencia diccionario–modelo: correcta" (no acredita la cobertura del plan).
- Accesibilidad: botón "Abrir JSON" real, foco visible, ayuda por campo con botón "?" (teclado y toque); en móvil la casilla DAM y la fuente se ven debajo de cada dato.
- La huella se describe como comprobación rápida, no como garantía; la prueba Guardar→Abrir compara además el contenido completo.
