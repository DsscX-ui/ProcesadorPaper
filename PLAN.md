# PLAN — Generador didáctico de documentos del transporte marítimo internacional

> **Estado:** Fase 0 (solo planificación). No hay código. Espera la aprobación de Aarón.
> **Aviso:** todo lo que genere esta herramienta es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**.

**Convenciones de este plan**

- **Hecho:** dato normativo o de práctica que considero firme (lista en §8.3).
- **Supuesto:** decisión de diseño o dato ficticio que elegí yo. Se puede cambiar.
- **POR VERIFICAR (PV-xx):** dato normativo que no afirmo sin fuente oficial. Lista completa en §8.2.

---

## 1. Objetivo y alcance

Ingresas **una sola vez** los datos de una operación marítima (importación o exportación, Perú) y la herramienta genera los documentos. Todos leen de la misma fuente de datos, así que pesos, bultos, volumen, valores y partes coinciden siempre.

**Alcance de la versión 1 (supuestos para mantenerla simple)**

- Una operación = 1 factura, 1 B/L, **1 contenedor FCL** y N ítems de mercancía.
- Moneda del contrato: **USD**.
- Importación para el consumo (**régimen 10**) y exportación definitiva (**régimen 40**), vía marítima.
- Acepta los 11 Incoterms® 2020, con reglas específicas para los 4 exclusivamente marítimos (FAS, FOB, CFR, CIF).
- La herramienta **no consulta** SUNAT, VUCE ni ningún arancel. Tasas, subpartidas y códigos los ingresas tú. La herramienta los muestra como "dato del usuario" y, si no están marcados como verificados, como "POR VERIFICAR".

**Fuera de alcance en v1:** carga LCL o consolidada, varios contenedores, varias facturas, otras monedas, carta de crédito, drawback, DAV, certificados sanitarios o fitosanitarios, clasificación arancelaria automática y conexión con sistemas reales.

---

## 2. Stack propuesto y justificación

**Elección:** una página web **local**: HTML + CSS + JavaScript, **sin librerías, sin instalación y sin servidor**.

**Cómo la usarías:** doble clic en `index.html` → se abre en Chrome o Edge → llenas el formulario o cargas el ejemplo → revisas los documentos → *Imprimir → Guardar como PDF*. Cada operación se guarda en un archivo `.json` con los botones "Guardar" y "Abrir".

| Criterio | **HTML + JS local (elegido)** | Excel / Google Sheets | Python (Streamlit u otro) |
|---|---|---|---|
| Instalación | Ninguna, solo el navegador | Ninguna | Python + librerías |
| Número variable de ítems | Fácil | Frágil (rangos fijos) | Fácil |
| Validaciones cruzadas | Completas | Limitadas | Completas |
| 7 documentos imprimibles en A4 | CSS de impresión nativo | Se descuadran con facilidad | Requiere librería de PDF |
| Revisión en GitHub | Archivos de texto legibles | Archivo binario | Texto |
| Funciona sin internet | Sí | Excel sí, Sheets no | Sí |

**Desventaja honesta:** el mantenimiento del JavaScript lo haré yo. Tú solo necesitarías editar `normativa.js` (tasas y umbrales) y los ejemplos. Excel sería viable si prefieres algo que ya dominas, pero perderías validaciones y la maquetación sería frágil.

**Decisiones técnicas para que funcione con doble clic** (hecho técnico: Chrome bloquea los módulos JS y `fetch` cuando abres archivos locales con `file://`):

- Scripts JS "clásicos", sin módulos y sin `fetch`.
- Los ejemplos van incrustados en un archivo JS. Las operaciones del usuario se abren con el selector de archivos.
- Autoguardado opcional en el navegador, solo como respaldo. La copia real es siempre el `.json`.

**Estructura prevista**

```
ProcesadorPaper/
├── index.html            ← se abre con doble clic
├── pruebas.html          ← verifica los cálculos (verde/rojo)
├── LEEME.md              ← guía de uso
├── PLAN.md
├── css/estilos.css       ← pantalla + impresión A4 + marca de agua
└── js/
    ├── normativa.js      ← tasas, umbrales y listas con fecha de revisión y marca PV
    ├── incoterms.js      ← matriz de reglas Incoterms® 2020 (§6.8)
    ├── modelo.js         ← estructura de datos vacía
    ├── ejemplos.js       ← casos 1 y 2 (§9)
    ├── calculos.js       ← ÚNICO lugar donde se calcula y redondea
    ├── validaciones.js   ← errores y advertencias (§7)
    └── documentos/       ← una plantilla por documento; solo leen, no calculan
```

**Principio de fuente única:** datos (`.json`) → `calculos.js` → un único resultado → cada plantilla solo lo muestra. Ninguna plantilla calcula ni redondea por su cuenta.

---

## 3. Documentos que genera

| # | Documento | Quién lo emite en la realidad | Cuándo se genera | Cambio respecto a tu lista |
|---|---|---|---|---|
| 1 | Factura comercial (*Commercial Invoice*) | Vendedor/exportador | Siempre | — |
| 2 | Lista de empaque (*Packing List*) | Vendedor/exportador | Siempre | — |
| 3 | Instrucciones de embarque + borrador de B/L + **declaración VGM** | Embarcador (instrucciones y VGM); naviera (B/L) | Siempre | **Añado el VGM:** la masa bruta verificada es obligatoria para contenedores según SOLAS desde el 1-jul-2016 y sale de los mismos pesos. |
| 4 | DAM (representación didáctica) | Despachador de aduana ante SUNAT | Siempre; régimen 10 o 40 | **Aclaro:** la DAM real se transmite electrónicamente. Aquí solo se simula su contenido (cabecera, series y liquidación), sin reproducir las casillas oficiales (PV-23). |
| 5 | Certificado de seguro de transporte | Aseguradora, a pedido de quien contrata el seguro | Obligatorio en CIF y CIP; opcional en los demás si marcas "hay seguro" | — |
| 6 | Certificado de origen (formato referencial) | Entidad certificadora o autocertificación, según el acuerdo | Solo si se solicita trato preferencial | El formato real depende del acuerdo (PV-12). |
| 7 | **Hoja resumen y de cuadre** (nuevo) | No es un documento comercial | Siempre | **Añado:** una tabla muestra que bultos, pesos, volumen y valores coinciden en todos los documentos, junto con la matriz de costos y riesgos del Incoterm. Sirve para estudiar y detecta errores de plantilla. |

**Considerados y no incluidos en v1:**

- DAV: su obligatoriedad y formato son PV-03.
- Certificados sanitarios o fitosanitarios: dependen del producto.
- Factura electrónica de exportación de SUNAT: es un comprobante de pago electrónico, no un formato comercial (PV-14).
- Manifiesto de carga: lo transmite el transportista.
- Aviso de llegada y carta de crédito.

**Marca didáctica en cada documento**

- Marca de agua diagonal.
- Encabezado: "DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES".
- Pie con la referencia de la operación y la fecha de generación.
- La DAM lleva "NO NUMERADA" en lugar de un número (el número lo asigna SUNAT).
- Los datos pendientes de verificación se resaltan en amarillo con la etiqueta "POR VERIFICAR".

---

## 4. Campos de entrada

Obl. = obligatorio. Cond. = obligatorio solo en el caso indicado.

### A. Datos generales de la operación

**A1. Operación**

| Campo | Formato / opciones | Obl. |
|---|---|---|
| Tipo de operación | Importación / Exportación | Sí |
| Referencia interna | Texto (ej. OP-2026-001) | Sí |
| Modalidad de carga | FCL (única opción en v1) | Sí |

**A2. Partes.** Cada parte tiene razón social, dirección, ciudad, país (ISO 3166 alfa-2) e identificación fiscal.

| Parte | Notas | Obl. |
|---|---|---|
| Vendedor / exportador | En exportación: RUC de 11 dígitos | Sí |
| Comprador / importador | En importación: RUC de 11 dígitos | Sí |
| Consignatario | Por defecto, el comprador; o "A la orden de…" | Sí |
| Parte a notificar (*Notify party*) | Por defecto, el consignatario | Sí |
| Transportista / naviera | Nombre | Sí |
| Agente de aduana | Nombre + código (ficticio; PV-09) | Sí |
| Aseguradora | — | Cond.: si hay seguro |
| Productor | Si es distinto del exportador | Cond.: si hay CO |
| Entidad emisora del CO | — | Cond.: si hay CO |

**A3. Ruta**

| Campo | Formato | Obl. |
|---|---|---|
| Puerto de embarque | Nombre + UN/LOCODE de 5 letras (ej. PECLL) | Sí |
| Puerto de descarga | Nombre + UN/LOCODE | Sí |
| Lugar de recepción / lugar de entrega | Solo si hay transporte combinado | No |
| País de procedencia / país de destino | Derivados del UN/LOCODE (2 primeras letras) | — |

**A4. Condiciones comerciales**

| Campo | Formato | Obl. |
|---|---|---|
| Incoterm | Lista de los 11 de Incoterms® 2020 | Sí |
| Lugar convenido | Texto; se valida contra los puertos (§7, E03) | Sí |
| Moneda | USD (v1) | Sí |
| Condiciones de pago | Texto (modalidad + plazo) | Sí |
| N° y fecha de factura | Texto + fecha | Sí |
| N° de contrato u orden de compra | Texto | No |

**A5. Aduana (Perú)**

| Campo | Formato | Obl. |
|---|---|---|
| Aduana de despacho | Código + nombre (ej. 118 – Marítima del Callao) | Sí |
| Régimen | Derivado: 10 (importación) / 40 (exportación) | — |
| Modalidad de despacho | Anticipado / Diferido / Urgente (en exportación: PV-13) | Cond.: importación |
| Tipo de cambio S/ por USD + fecha + fuente | Número con 3 decimales (PV-07) | Cond.: importación |
| Depósito temporal | Texto (código: PV-09) | No |

### B. Datos específicos del embarque

**B1. Mercancía (uno por ítem)**

| Campo | Formato | Obl. |
|---|---|---|
| Descripción comercial | Nombre, material, uso, características (PV-21) | Sí |
| Marca y modelo | Texto | Sí |
| Subpartida nacional | 10 dígitos (####.##.##.##) + casilla "verificada" | Sí |
| País de origen | ISO alfa-2 | Sí |
| Estado | Nuevo / Usado | Sí |
| Cantidad + unidad física | Número + unidad (ej. U, KG; código: PV-09) | Sí |
| Precio unitario | USD, en el Incoterm pactado | Sí |
| Tasa ad valorem aplicada (%) | Dato del usuario (PV-11) | Cond.: importación |
| ISC, derechos antidumping o compensatorios | Monto o % (PV-11, PV-17) | Cond.: importación |
| Código TPI (preferencia) | Texto (PV-09) | Cond.: importación con preferencia |

**B2. Embalaje y pesos (uno por ítem)**

| Campo | Formato | Obl. |
|---|---|---|
| Tipo de bulto | Caja de cartón, pallet, saco… | Sí |
| Unidades por bulto | Entero > 0 | Sí |
| Peso neto por bulto (kg) | 2 decimales | Sí |
| Peso bruto por bulto (kg) | 2 decimales | Sí |
| Medidas del bulto (cm) | Largo × ancho × alto | Sí |
| Marcas de embarque (*shipping marks*) | Texto, una para todo el embarque | Sí |

**B3. Contenedor (uno en v1)**

| Campo | Formato | Obl. |
|---|---|---|
| Tipo | 20' DV (ISO 22G1) / 40' DV (42G1) / 40' HC (45G1) | Sí |
| Número | ISO 6346: 4 letras + 6 dígitos + dígito de control | Sí |
| Precinto | Texto | Sí |
| Tara (kg) | Según la placa del contenedor (PV-16) | Sí |
| Estiba y trincaje (kg) | Por defecto 0 | No |
| Método VGM + responsable + fecha | 1 (pesaje del contenedor lleno) / 2 (suma de pesos) | Sí |

**B4. Transporte**

| Campo | Formato | Obl. |
|---|---|---|
| Nave y viaje | Texto | Sí |
| N° de booking | Texto | Sí |
| N° de B/L | Texto (en el borrador puede ir vacío) | No |
| Tipo de B/L y N° de originales | Nominativo / A la orden; por defecto 3 | Sí |
| Flete internacional (USD) | Monto | Cond.: CFR, CIF, CPT, CIP, grupo D y todas las importaciones |
| Gastos hasta a bordo (USD) | Monto | Cond.: EXW, FCA, FAS |
| Gastos en destino (USD) | Monto | Cond.: grupo D |
| Fecha de embarque (a bordo) y ETA | Fechas | Sí |

**B5. Seguro**

| Campo | Formato | Obl. |
|---|---|---|
| ¿Hay seguro? | Sí / No (forzado a "Sí" en CIF y CIP) | Sí |
| N° de póliza, N° de certificado y fecha de emisión | Texto + fecha | Cond. |
| Cláusulas | ICC (A) / (B) / (C) 2009 + guerra + huelgas | Cond. |
| % de cobertura | Por defecto 110 % | Cond. |
| Tasa de prima (%) | Número | Cond. |
| Lugar de pago de siniestros y agente de reclamos | Texto | Cond. |
| % de la tabla SUNAT si no hay póliza | Número (PV-06) | Cond.: importación sin seguro |

**B6. Origen**

| Campo | Formato | Obl. |
|---|---|---|
| ¿Se solicita trato preferencial? | Sí / No | Sí |
| Acuerdo comercial | Texto | Cond. |
| Criterio de origen | Texto (PV-12) | Cond. |
| N° y fecha del certificado | Texto + fecha | Cond. |

### C. Datos derivados (no se ingresan; los calcula la herramienta)

Régimen, países de procedencia y destino, código SA de 6 dígitos, bultos, pesos y volumen por ítem y totales, flete *prepaid* o *collect*, quién contrata el seguro, FOB, valor en aduana, suma asegurada, prima, prorrateos, tributos, VGM y numeración correlativa de bultos.

---

## 5. Qué campo alimenta cada documento

FC = factura comercial · PL = lista de empaque · BL = instrucciones de embarque / borrador de B/L / VGM · DAM · SEG = certificado de seguro · CO = certificado de origen · HR = hoja resumen

| Campo o grupo | FC | PL | BL | DAM | SEG | CO | HR |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Tipo de operación | | | | ● régimen | | | ● |
| Referencia interna (pie de página) | ● | ● | ● | ● | ● | ● | ● |
| Vendedor / exportador | ● | ● | ● *Shipper* | ● | ● asegurado en CIF/CIP | ● | ● |
| Comprador / importador | ● | ● | ● | ● | ● beneficiario | ● | ● |
| Consignatario / notify | ● | | ● | | | | |
| Naviera | | | ● | ● | | | ● |
| Agente de aduana | | | | ● | | | |
| Aseguradora | | | | | ● | | |
| Productor / entidad emisora | | | | | | ● | |
| Puertos + UN/LOCODE | ● | ● | ● | ● | ● trayecto | ● ruta | ● |
| País de destino / procedencia | ● | | | ● | | ● | |
| Incoterm + lugar convenido | ● | | ● prepaid/collect | ● valoración | ● activa el documento | | ● |
| Moneda | ● | | | ● | ● | | ● |
| Condiciones de pago | ● | | | | | | |
| N° y fecha de factura | ● | ● | | ● | ● | ● | ● |
| Aduana, régimen, modalidad, tipo de cambio | | | | ● | | | |
| Descripción, marca, modelo | ● | ● | ● genérica | ● | ● genérica | ● | |
| Subpartida (10 díg.) / SA (6 díg.) | ● SA | | ● SA, opcional | ● 10 díg. | | ● SA | |
| País de origen, estado | ● origen | | | ● | | ● origen | |
| Cantidad y unidad | ● | ● | | ● | | ● | |
| Precio unitario y valor | ● | | | ● | ● base | ● | ● |
| Tasas de tributos, TPI | | | | ● | | | |
| Tipo y N° de bultos | ● | ● | ● | ● | ● | ● | ● |
| Peso neto | ● | ● | | ● | | | ● |
| Peso bruto | ● | ● | ● | ● | | ● | ● |
| Medidas y volumen | | ● | ● | | | | ● |
| Marcas de embarque | | ● | ● | | ● | ● | |
| Contenedor, tipo, precinto | | ● | ● | ● | ● | | ● |
| Tara, método VGM | | | ● VGM | | | | ● |
| Nave, viaje, fechas | | | ● | ● | ● | ● | ● |
| Booking, N° de B/L, originales | | | ● | ● N° B/L | ● N° B/L | | |
| Flete | ● desglose C/D | | ● prepaid/collect | ● importación | | | ● |
| Póliza, cláusulas, % de cobertura | | | | | ● | | ● |
| Prima | ● desglose CIF/CIP | | | ● importación | | | ● |
| Acuerdo, criterio, N° de CO | | | | ● TPI | | ● | |

---

## 6. Cálculos

### 6.1 Redondeo (supuesto de diseño)

- Montos: 2 decimales, redondeo "mitad hacia arriba". Los totales son la suma de las líneas ya redondeadas.
- Pesos en kg: 2 decimales. Volumen en m³: 3 decimales.
- Prorrateos: se redondea cada serie y la diferencia se asigna a la última serie, para que la suma cuadre exacta.
- La regla oficial de redondeo de SUNAT es PV-08.

### 6.2 Mercancía y embalaje

- **Valor de línea** = cantidad × precio unitario.
- **Valor de la factura (Vc)** = Σ valores de línea. Es el valor en el Incoterm pactado.
- **Bultos de línea** = cantidad ÷ unidades por bulto. En v1 la división debe ser exacta (supuesto: evita inventar el peso de un bulto incompleto).
- **Peso neto de línea** = bultos × peso neto por bulto. El peso bruto se calcula igual.
- **Volumen por bulto (m³)** = largo × ancho × alto (cm) ÷ 1 000 000. **Volumen de línea** = volumen por bulto × bultos.
- **Totales** = Σ líneas. Los bultos se numeran de forma correlativa (ej. "C/No. 1–250: ítem 1").

### 6.3 Valores FOB y CIF

| Incoterm | FOB = |
|---|---|
| EXW, FCA, FAS | Vc + gastos hasta a bordo |
| FOB | Vc |
| CFR, CPT | Vc − flete |
| CIF, CIP | Vc − flete − prima |
| DAP, DPU, DDP | Vc − flete − prima − gastos en destino (advertencia A04) |

- **Flete** = solo el flete internacional. Los gastos previos al embarque forman parte del FOB.
- **Valor CIF** = FOB + flete + seguro. En importación es el **valor en aduana** (supuesto: método 1, valor de transacción, sin ajustes; PV-22).
- **Seguro para el valor en aduana:** la prima de la póliza. Si no hay póliza, se aplica el % de la tabla SUNAT que ingresa el usuario (PV-06).
- **Exportación:** la DAM declara el FOB.

### 6.4 Seguro

- **Suma asegurada** = base × % de cobertura.
  - En CIF y CIP, la base es Vc y la cobertura mínima es 110 % (hecho, Incoterms® 2020).
  - En los demás Incoterms, la base es FOB + flete (supuesto didáctico, editable).
- **Prima** = suma asegurada × tasa de prima. La prima aparece en la hoja resumen y en el desglose de la factura, no en el certificado.

### 6.5 Prorrateo por serie (DAM)

- Supuesto v1: 1 ítem = 1 serie. La agrupación real es PV-05.
- **Flete de la serie** = flete × (peso bruto de la serie ÷ peso bruto total).
- **Seguro de la serie** = seguro × (valor de la serie ÷ Vc).
- **FOB de la serie** se deriva según §6.3.
- El criterio oficial de prorrateo es PV-04.

### 6.6 Tributos de importación (régimen 10, por serie y luego sumados)

| Concepto | Fórmula | Fuente de la tasa |
|---|---|---|
| Valor en aduana (VA) | CIF de la serie | §6.3 |
| Ad valorem (AV) | VA × tasa AV | Dato del usuario (PV-11) |
| ISC | Según la subpartida | Dato del usuario (PV-11) |
| Antidumping / compensatorio | Monto | Dato del usuario (PV-17) |
| Base del IGV | VA + AV + ISC | — |
| IGV | 16 % × base del IGV | Hecho, en `normativa.js` |
| IPM | 2 % × base del IGV | Hecho, en `normativa.js` |
| Percepción del IGV | tasa × (VA + tributos [+ antidumping?]) | Dato del usuario (PV-01, PV-17) |
| Tasa de despacho aduanero | No se calcula en v1; se muestra "POR VERIFICAR" | PV-02 |
| Conversión a S/ | monto en USD × tipo de cambio | PV-07, PV-08 |

### 6.7 VGM

VGM = peso bruto total de la carga + estiba y trincaje + tara del contenedor.

### 6.8 Matriz Incoterms® 2020 que usará la herramienta (hechos)

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

La columna "Flete en B/L (usual)" es práctica habitual, no una regla de Incoterms. Por eso, si no coincide, la herramienta solo muestra una advertencia.

---

## 7. Validaciones

**Errores (bloquean la generación de documentos)**

| ID | Regla |
|---|---|
| E01 | Campo obligatorio vacío, según el documento que lo usa |
| E02 | Incoterm fuera de los 11 de Incoterms® 2020 |
| E03 | Lugar convenido incoherente: en FAS o FOB debe ser el puerto de embarque; en CFR o CIF, el puerto de descarga |
| E04 | CIF o CIP sin datos de seguro, cobertura menor al 110 %, o CIP con cláusulas distintas de ICC (A) |
| E05 | Peso bruto por bulto menor que el peso neto por bulto |
| E06 | Cantidad que no es múltiplo de las unidades por bulto (v1) |
| E07 | Cantidades, precios, pesos o medidas ≤ 0 |
| E08 | Subpartida nacional que no tiene 10 dígitos |
| E09 | Número de contenedor con dígito de control ISO 6346 incorrecto |
| E10 | RUC del importador (en importación) o del exportador (en exportación) que no tiene 11 dígitos numéricos |
| E11 | UN/LOCODE mal formado o que no coincide con el país. En importación el puerto de descarga debe empezar por "PE"; en exportación, el de embarque. |
| E12 | FOB derivado ≤ 0 (ej. flete + prima ≥ Vc) |
| E13 | ETA anterior a la fecha de embarque |
| E14 | Moneda distinta de USD (v1) |
| E15 | Importación sin tipo de cambio |

**Advertencias (se puede generar, pero se muestran en pantalla y en la hoja resumen)**

| ID | Regla |
|---|---|
| A01 | FAS, FOB, CFR o CIF con contenedor. La nota de orientación de ICC recomienda FCA, CPT o CIP cuando la mercancía se entrega en una terminal antes de ir a bordo. |
| A02 | EXW en exportación desde Perú: el despacho de exportación correspondería al comprador extranjero. Conviene considerar FCA. |
| A03 | DDP en importación a Perú: el vendedor extranjero actuaría como importador |
| A04 | Grupo D en importación: los gastos posteriores a la llegada deben separarse del valor en aduana (PV-22) |
| A05 | Flete *prepaid* o *collect* distinto al usual para el Incoterm |
| A06 | Volumen mayor que la capacidad referencial del contenedor: 20' ≈ 33 m³, 40' ≈ 67 m³, 40' HC ≈ 76 m³ (PV-16) |
| A07 | VGM mayor que el peso bruto máximo referencial del contenedor (PV-16) |
| A08 | Subpartida no marcada como verificada: se muestra "POR VERIFICAR" en los documentos |
| A09 | RUC con prefijo distinto de 10 o 20. El dígito verificador no se valida en v1 (PV-18). |
| A10 | FOB dentro de un umbral de despacho simplificado (PV-03) |
| A11 | Fecha del certificado de seguro posterior al embarque. Referencia: con carta de crédito, el art. 28(e) de UCP 600 exige que la cobertura sea efectiva a más tardar en la fecha de embarque. |
| A12 | Seguro en un Incoterm que no lo exige: se informa quién lo contrata |
| A13 | Certificado de origen con fecha posterior al embarque (PV-12) |
| A14 | País de origen del ítem distinto del país del exportador (revisar el CO) |
| A15 | Importación sin seguro: se aplicará el % de la tabla SUNAT (PV-06) |

---

## 8. Riesgos y puntos POR VERIFICAR

### 8.1 Riesgos del proyecto

| Riesgo | Mitigación |
|---|---|
| Confundir un documento didáctico con uno real | Marca de agua, encabezado y pie; DAM "NO NUMERADA"; sin logos reales |
| Que un dato ficticio coincida con uno real (RUC, prefijo de contenedor, empresas) | Nombres con sufijo "— FICTICIA"; RUC 2000000000X; PV-19 |
| Que el redondeo descuadre los documentos | Un solo módulo de cálculo; `pruebas.html` con las cifras de §9 |
| Cambios normativos (tasas, umbrales, arancel) | Todo en `normativa.js`, con fecha de revisión y fuente; nada normativo dentro de las plantillas |
| Pérdida de datos | El `.json` es la copia principal; el autoguardado es solo respaldo |
| Crecimiento del alcance (LCL, varios contenedores, D/L) | Lista explícita de lo que queda fuera de v1 (§1) |
| Diferencias de impresión entre navegadores | Probar en Chrome y Edge, en A4 |
| Valoración compleja en grupo D y con ajustes | Advertencias A03 y A04; PV-22 |

### 8.2 Lista POR VERIFICAR (no afirmo estos datos; requieren fuente oficial)

| ID | Qué verificar | Fuente sugerida |
|---|---|---|
| PV-01 | Tasas de percepción del IGV en importación (se citan 3.5 %, 5 % y 10 %) y su base | SUNAT |
| PV-02 | Tasa de despacho aduanero: monto y cuándo aplica | SUNAT |
| PV-03 | Umbrales: importación simplificada (ref. USD 2 000 FOB), exportación simplificada (ref. USD 5 000 FOB) y obligación de la DAV | Procedimientos de SUNAT |
| PV-04 | Criterio oficial de prorrateo de flete y seguro entre series | DESPA-PG.01 (versión vigente) |
| PV-05 | Reglas para agrupar ítems en series de la DAM | SUNAT |
| PV-06 | Tabla de porcentajes de seguro de SUNAT cuando no hay póliza | SUNAT |
| PV-07 | Tipo de cambio: fuente, fecha aplicable y tipo (compra o venta) | SUNAT / SBS |
| PV-08 | Redondeo oficial de tributos y de la conversión a soles | SUNAT |
| PV-09 | Tablas de códigos: vía de transporte, unidades, tipo de bulto, TPI, depósito temporal, agentes de aduana y aduanas distintas de 118 | Tablas de SUNAT |
| PV-10 | Subpartidas de 10 dígitos del ejemplo (solo los 6 dígitos SA son firmes) y arancel vigente, incluida una posible actualización por SA 2027 desde el 01-01-2027 | Arancel de Aduanas / SUNAT |
| PV-11 | Tasa ad valorem por subpartida (niveles referenciales 0 %, 6 %, 11 %), ISC, derechos específicos y antidumping | SUNAT, Indecopi |
| PV-12 | Certificado de origen por acuerdo: formato, emisor (entidad certificadora vía VUCE, autocertificación, certificado digital), criterio de origen, declaración jurada de origen y emisión posterior | MINCETUR / VUCE, texto del acuerdo |
| PV-13 | DAM de exportación: plazo de regularización, datos exigidos y si aplican las modalidades de despacho | DESPA-PG.02 (versión vigente) |
| PV-14 | Requisitos de la factura comercial para el despacho y obligación de factura electrónica de exportación | SUNAT, normativa CAN |
| PV-15 | UN/LOCODE de otros puertos (ej. Chancay) | Lista UN/LOCODE de UNECE |
| PV-16 | Capacidad, tara y peso máximo de contenedores (varían por naviera y fabricante) | Naviera, placa CSC |
| PV-17 | Si el antidumping integra la base del IGV y de la percepción | SUNAT |
| PV-18 | Algoritmo del dígito verificador del RUC | SUNAT |
| PV-19 | Que el prefijo ficticio "EJMU" no esté registrado a un propietario real | Registro BIC |
| PV-20 | Restricciones o permisos del producto (mercancía restringida) | SUNAT, sector competente |
| PV-21 | Descripciones mínimas exigidas por SUNAT según el producto | SUNAT |
| PV-22 | Ajustes al valor (art. 8 del Acuerdo de Valor de la OMC) y valoración en grupo D; v1 asume el método 1 sin ajustes | SUNAT, OMC |
| PV-23 | Estructura y numeración de las casillas de la DAM impresa (Formato A y anexos) | SUNAT |

### 8.3 Datos que considero hechos (se usarán sin marca PV)

- Incoterms® 2020: 11 reglas, 4 exclusivamente marítimas, contenido de la matriz de §6.8, seguro mínimo ICC (C) en CIF e ICC (A) en CIP, cobertura mínima del 110 % y la recomendación de FCA para contenedores.
- IGV 16 % + IPM 2 % sobre la base imponible de importación.
- Régimen 10 = importación para el consumo; régimen 40 = exportación definitiva; modalidades anticipado, diferido y urgente; Ley General de Aduanas (D. Leg. 1053).
- Aduana 118 = Intendencia de Aduana Marítima del Callao.
- La subpartida nacional peruana tiene 10 dígitos; los 6 primeros son del Sistema Armonizado.
- VGM obligatorio (SOLAS, desde el 1-jul-2016), métodos 1 y 2.
- Dígito de control de contenedores según ISO 6346.
- UN/LOCODE: CNNGB (Ningbo), PECLL (Callao), CLSAI (San Antonio).

---

## 9. Casos de ejemplo (datos 100 % ficticios)

Propongo **dos casos**. Entre ambos cubren los 7 documentos y los regímenes 10 y 40:

- Caso 1: importación CIF (seguro + tributos, sin CO).
- Caso 2: exportación FOB (CO, sin seguro).

### 9.1 Caso 1 — Importación CIF Callao (principal)

**Datos generales**

| Campo | Valor |
|---|---|
| Referencia | OP-2026-001 · Importación · FCL |
| Vendedor | Ventiladores Ejemplo (Ningbo) Co., Ltd. — FICTICIA · No. 1 Example Road, Ningbo, China · ID fiscal ficticio |
| Comprador / importador | Importadora Didáctica Andina S.A.C. — FICTICIA · Av. Ejemplo 123, Lima, Perú · RUC 20000000001 (ficticio) |
| Consignatario / notify | = comprador (B/L nominativo) |
| Naviera | Naviera Didáctica Line — FICTICIA |
| Agente de aduana | Agencia de Aduanas Didáctica S.A.C. — FICTICIA · código 9999 (ficticio) |
| Aseguradora | Aseguradora Ejemplo Co., Ltd. — FICTICIA |
| Ruta | Ningbo, CN (CNNGB) → Callao, PE (PECLL) |
| Incoterm | **CIF Callao, Incoterms® 2020** |
| Moneda y pago | USD · 30 % de adelanto y 70 % contra copia del B/L, por transferencia |
| Factura | VEN-2026-0457 · 05-10-2026 |
| Aduana | 118 – Marítima del Callao · régimen 10 · despacho anticipado (supuesto) |
| Tipo de cambio | 3.500 S/ por USD (**supuesto didáctico, no es un dato real**) |

**Mercancía**

| Ítem | Descripción | Subpartida | Origen | Estado | Cantidad | P. unit. CIF | Valor |
|---|---|---|---|---|---|---|---|
| 1 | Ventilador de pie 16", 45 W, 220 V, marca EJEMPLO, modelo VE-16 | 8414.51.00.00 ⚠ | CN | Nuevo | 250 U | 19.50 | 4 875.00 |
| 2 | Ventilador de pie 18", 60 W, 220 V, marca EJEMPLO, modelo VE-18 | 8414.51.00.00 ⚠ | CN | Nuevo | 200 U | 24.00 | 4 800.00 |

⚠ La subpartida SA 8414.51 es firme (ventiladores con motor eléctrico incorporado de potencia ≤ 125 W). Los dígitos ".00.00" son **relleno didáctico, POR VERIFICAR** (PV-10). Como ambos ítems comparten subpartida, en una DAM real probablemente irían en una sola serie (PV-05).

**Tributos (supuestos):** ad valorem 6 %, ISC 0, antidumping 0, percepción 3.5 %. No se solicita preferencia, así que no se genera CO.

**Embalaje**

| Ítem | Bulto | Unid./bulto | Bultos | PN/bulto (kg) | PB/bulto (kg) | Medidas (cm) | m³/bulto |
|---|---|---|---|---|---|---|---|
| 1 | Caja de cartón | 1 | 250 | 4.50 | 5.20 | 50 × 20 × 60 | 0.060 |
| 2 | Caja de cartón | 1 | 200 | 5.50 | 6.40 | 50 × 25 × 60 | 0.075 |

**Marcas:** IDA / OP-2026-001 / CALLAO / C/No. 1-450 / MADE IN CHINA

**Contenedor y transporte**

- Contenedor: 1 × 20' DV (22G1).
- N° **EJMU 261014 7**: dígito de control calculado según ISO 6346; el prefijo es ficticio (PV-19).
- Precinto SD-000123. Tara 2 200 kg (supuesto). VGM por método 2.
- Nave MV DIDACTIC STAR, viaje 2641E. Booking BK-2026-0001. B/L DIDL2026000457, nominativo, 3 originales.
- Flete USD 1 850.00 *prepaid*. Embarque 14-10-2026. ETA 15-11-2026.

**Seguro**

- Póliza flotante POL-0001 y certificado CERT-0457, emitido el 13-10-2026.
- Cláusulas ICC (C) 2009, el mínimo en CIF. Cobertura 110 %. Prima 0.30 % (supuesto).
- Trayecto: a bordo en Ningbo → Callao. Siniestros pagaderos en Lima, en USD.

**Resultados esperados** (servirán para `pruebas.html`)

| Concepto | Valor |
|---|---|
| Bultos | 450 cajas |
| Peso neto / peso bruto | 2 225.00 kg / 2 580.00 kg |
| Volumen | 30.000 m³ |
| Valor de la factura (CIF) | USD 9 675.00 |
| Suma asegurada (110 %) | USD 10 642.50 |
| Prima (0.30 %) | USD 31.93 |
| FOB = 9 675.00 − 1 850.00 − 31.93 | USD 7 793.07 |
| Valor en aduana | USD 9 675.00 |
| VGM = 2 580 + 0 + 2 200 | 4 780.00 kg |

| Serie | CIF | Flete prorr. | Seguro prorr. | FOB | AV 6 % | Base IGV | IGV 16 % | IPM 2 % |
|---|---|---|---|---|---|---|---|---|
| 1 | 4 875.00 | 932.17 | 16.09 | 3 926.74 | 292.50 | 5 167.50 | 826.80 | 103.35 |
| 2 | 4 800.00 | 917.83 | 15.84 | 3 866.33 | 288.00 | 5 088.00 | 814.08 | 101.76 |
| **Total** | **9 675.00** | **1 850.00** | **31.93** | **7 793.07** | **580.50** | **10 255.50** | **1 640.88** | **205.11** |

- Total de tributos (AV + IGV + IPM): **USD 2 426.49**.
- Percepción de 3.5 % (supuesto) sobre 12 101.49: **USD 423.55**.
- Advertencias esperadas: **A01** (CIF con contenedor) y **A08** (subpartidas no verificadas). Errores esperados: ninguno.

### 9.2 Caso 2 — Exportación FOB Callao con certificado de origen

**Datos generales**

| Campo | Valor |
|---|---|
| Referencia | OP-2026-002 · Exportación · FCL |
| Exportador (y productor) | Textiles Didácticos del Perú S.A.C. — FICTICIA · Av. Ejemplo 456, Lima · RUC 20000000002 (ficticio) |
| Comprador | Tiendas Ejemplo SpA — FICTICIA · Santiago, Chile · RUT ficticio |
| Ruta | Callao, PE (PECLL) → San Antonio, CL (CLSAI) |
| Incoterm | **FOB Callao, Incoterms® 2020** |
| Moneda y pago | USD · transferencia del 100 % a 30 días de la fecha del B/L |
| Factura | TDP-2026-0102 · 20-10-2026 (la factura real de exportación es electrónica; PV-14) |
| Aduana | 118 · régimen 40 |

**Mercancía y embalaje**

| Ítem | Descripción | Subpartida | Cantidad | P. unit. FOB | Valor | Bultos | PN/bulto | PB/bulto | Medidas (cm) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Polo 100 % algodón, tejido de punto, cuello redondo, tallas S–XL, marca EJEMPLO | 6109.10.00.00 ⚠ | 4 000 U (50/caja) | 5.20 | 20 800.00 | 80 | 9.00 | 9.80 | 60 × 40 × 35 |
| 2 | Sudadera con capucha 100 % algodón, tejido de punto, tallas S–XL, marca EJEMPLO | 6110.20.00.00 ⚠ | 1 500 U (25/caja) | 12.50 | 18 750.00 | 60 | 12.50 | 13.40 | 60 × 40 × 45 |

⚠ Las subpartidas SA 6109.10 y 6110.20 son firmes. Los 4 dígitos nacionales son **POR VERIFICAR** (PV-10). Origen: PE, estado nuevo.

**Resto de datos**

- Marcas: TE / OP-2026-002 / SAN ANTONIO / C/No. 1-140 / HECHO EN PERÚ.
- Contenedor 20' DV **EJMU 260002 5**, precinto SD-000124, tara 2 200 kg.
- Nave MV DIDACTIC STAR, viaje 2643S. Booking BK-2026-0002. B/L DIDL2026000102.
- Flete *collect* (lo contrata el comprador). Embarque 24-10-2026. ETA 30-10-2026.
- Sin seguro (FOB no lo exige).
- Se solicita preferencia. Acuerdo: TLC Perú–Chile. Formato y criterio de origen: **POR VERIFICAR** (PV-12). CO N° CO-2026-0001 (ficticio), del 22-10-2026.

**Resultados esperados**

| Concepto | Valor |
|---|---|
| Bultos | 140 cajas |
| Peso neto / peso bruto | 1 470.00 kg / 1 588.00 kg |
| Volumen | 6.720 + 6.480 = 13.200 m³ |
| Valor FOB (DAM 40) | USD 39 550.00 |
| VGM = 1 588 + 0 + 2 200 | 3 788.00 kg |

Advertencias esperadas: **A01** (FOB con contenedor) y **A08**. Errores esperados: ninguno.

---

## 10. Fases de construcción

Cada fase termina en un commit y en una verificación que puedes hacer tú, sin programar.

| Fase | Entregable | Cómo lo verificas |
|---|---|---|
| F0 | Este plan | Lo apruebas o corriges |
| F1 | Estructura de carpetas + `index.html` con el aviso didáctico | Doble clic → se abre la página con el aviso |
| F2 | Modelo de datos, `normativa.js`, ejemplos y botones Guardar/Abrir | Cargas el ejemplo, guardas el `.json`, lo reabres y los datos son idénticos |
| F3 | `calculos.js` + `pruebas.html` | Abres `pruebas.html`: todo en verde y las cifras coinciden con §9 |
| F4 | Validaciones + panel de errores y advertencias | Cada caso muestra solo sus advertencias esperadas; si cambias un dígito del contenedor aparece E09 |
| F5 | Formulario completo (añadir y quitar ítems; secciones que aparecen según la operación y el Incoterm) | Cambias una cantidad y los totales se actualizan |
| F6 | Factura comercial + lista de empaque + hoja resumen | Imprimes a PDF y los totales cuadran con la hoja resumen |
| F7 | Instrucciones de embarque / borrador de B/L + VGM | Bultos, peso bruto, volumen y contenedor = lista de empaque |
| F8 | DAM didáctica (régimen 10 y 40) | Series y liquidación = §9.1; el FOB de exportación = §9.2 |
| F9 | Certificado de seguro + certificado de origen (condicionales) | Con FOB no hay seguro; con CIF sí; sin preferencia no hay CO |
| F10 | Ajustes de impresión, `LEEME.md` y revisión final de terminología y PV | Generas los PDF de ambos casos de principio a fin |

---

## 11. Decisiones que necesito de ti antes de empezar

1. **Stack:** ¿apruebas la página HTML local, o prefieres Excel?
2. **Idioma de los documentos:** recomiendo bilingüe español/inglés en factura, lista de empaque, B/L, seguro y CO, y solo español en la DAM y la hoja resumen. ¿De acuerdo?
3. **Alcance v1:** 1 contenedor FCL y solo USD. ¿Suficiente para tus cursos?
4. **Ejemplos:** ¿dos casos (importación CIF + exportación FOB) o solo uno?
5. **Ritmo:** ¿reviso contigo al final de cada fase, o por bloques (F1–F3, F4–F5, F6–F10)?
6. **Material del curso:** si tienes formatos, tasas o criterios que usa tu profesor, los usaría para cerrar puntos PV antes de programar.
