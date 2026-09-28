# Herramienta didáctica de documentos de comercio exterior

Material de clase para los cursos de Negocios Internacionales, en Lima. Sirve para anotar una vez los datos de una importación marítima y ver, en la misma página, la factura comercial, el packing list, el conocimiento de embarque (Bill of Lading) y la DAM de importación para el consumo, Formatos A y B.

Es un ejercicio de aula. No tiene validez oficial y no reemplaza una declaración ante la aduana. Cada hoja lleva la marca «DOCUMENTO DIDÁCTICO – SIN VALIDEZ OFICIAL».

## Cómo abrirla

1. Abre la carpeta del proyecto.
2. Haz doble clic en `index.html`.

El navegador la carga desde el disco: la dirección empieza por `file://`. No hace falta instalar nada ni poner en marcha un servidor. Si JavaScript está desactivado, la página no arma los documentos.

Al abrir ya está cargado el caso de ejemplo: relojes, Shenzhen–Callao.

## Qué hay en la pantalla

Arriba está el formulario (partes, transporte, comercial, ítems y valoración) y el panel **Totales de la operación**. Los totales se recalculan solos al cambiar cantidades, precios, pesos, flete o seguro.

- **Modo didáctico.** Casilla al inicio del formulario. Al activarla, cada campo dice qué es, quién lo llena y de qué documento sale. Si el instructivo no le da casilla en la DAM, la ayuda lo dice.
- **Coherencia.** Separa errores y avisos. Un error bloquea la lectura limpia; un aviso no. Con el ejemplo cargado no hay errores de coherencia. Los avisos «PENDIENTE DE VERIFICAR» se explican en Limitaciones.
- **Cuatro documentos**, más abajo, armados con el formulario: **Factura comercial**, **Packing list**, **Bill of Lading** y **DAM** (Formato A y Formato B). El Bill of Lading es genérico: los rótulos de número de BL, buque y viaje, y la forma de indicar el flete cambian según la naviera.
- **Tabla de trazabilidad.** Una fila por cada dato del modo didáctico. Las columnas indican si ese dato va a la factura, al packing list, al BL o a una casilla de la DAM. Donde no hay casilla, la celda empieza por «sin casilla».

## Guardar y cargar un JSON

Los botones están encima del formulario.

- **Guardar JSON.** El navegador descarga `relojes-shenzhen-callao.json` con los datos que hay en ese momento. Guárdalo donde quieras.
- **Cargar JSON.** Elige ese archivo (u otro JSON guardado con esta página) y el formulario vuelve a llenarse. El precio de la factura y el valor en aduana se recalculan desde los ítems, el flete, el seguro y los ajustes.

Debajo de los botones, un mensaje confirma si la descarga o la carga salió bien. Esta página espera dos ítems: si el archivo trae otra cantidad, no cambia lo que está en pantalla.

El archivo se queda en tu computador. No hay cuenta, base de datos ni copia en internet.

## Imprimir en PDF

El PDF se obtiene con la impresión del navegador:

1. Con la página abierta, elige **Imprimir** (en Chrome o Edge, Ctrl+P).
2. En el destino, elige **Guardar como PDF**.
3. Guarda el archivo.

En el papel salen la factura, el packing list, el Bill of Lading y la DAM (Formatos A y B). El formulario, el panel Coherencia y la tabla de trazabilidad se quedan en la pantalla. Al final del PDF va una hoja de prueba vacía, que no forma parte del caso; en el cuadro de impresión puedes dejar fuera esa página.

En cada página impresa se repite, en diagonal, la marca de agua «DOCUMENTO DIDÁCTICO – SIN VALIDEZ OFICIAL».

## Limitaciones

Lo que sigue aparece en pantalla como **PENDIENTE DE VERIFICAR**. No es un fallo del ejemplo: falta una tabla que no está en esta carpeta, o el instructivo de la carpeta no cierra la regla. La herramienta no inventa el código.

### Tablas que no están en la carpeta

- **Código de aduana** (rótulo ADUANA – CÓDIGO del Formato A). Faltan las tablas de SUNAT; el ejemplo no pone un número.
- **Código del puerto de embarque** (casilla 7.6). Falta la tabla de puertos (Shenzhen).
- **Código de moneda** (casillas 5.5 y 7.29). Los montos van en dólares; el código de SUNAT no está en la carpeta.
- **Ubigeo del importador** (casilla 1.4). Falta la tabla de ubigeos.
- **Código de clase de bulto** (casilla 7.13). Se imprime «cajas de cartón»; falta el código de la tabla.
- **Código de la entidad financiera** (casilla 5.1). El nombre didáctico es «Banco Ficticio Demo»; falta el código de SUNAT.
- **N.º de manifiesto** (casilla 3.2). La estructura pide código de aduana de ingreso, año y número. Sin el código de aduana no se arma un manifiesto falso.
- **Código del proveedor** (casilla 3.1 del Formato B). Se imprime la razón social y «Código: PENDIENTE DE VERIFICAR»; falta la tabla. No es la casilla 3.1 del Formato A (RUC del agente marítimo).
- **Códigos de país:** proveedor (casilla 3.5 del Formato B), origen (casillas 7.26 y 5.7), adquisición (casilla 7.27) y embarque (casilla 5.8). Faltan las tablas de país.

### Reglas que el instructivo de esta carpeta no cierra

- **Dígito verificador de la subpartida** (casilla 7.19). El campo va vacío: el instructivo no explica el cálculo.
- **Unidad física** (casilla 7.16). El ejemplo usa «U» y lo marca SUPUESTO. Falta contrastarla con el arancel, que no está en la carpeta.
- **Tipo de despacho** (rótulo TIPO DESPACHO). El instructivo detalla tipos para admisión temporal, tránsito y reembarque, y no trae una lista equivalente para la importación para el consumo. El ejemplo lo deja en blanco.
- **Casilla 3.4** (fecha de término de la descarga). En la modalidad 1-0 Despacho Anticipado la DAM se formula antes de la descarga. El instructivo no dice si la fecha va vacía, provisional o con otro valor. En el ejemplo la casilla muestra PENDIENTE DE VERIFICAR.

### Notas en la DAM

- **Casilla 7.20 «Tipo».** Vacía. Falta ver si el arancel pide tipo para la subpartida 9102.11.00.00.
- **Casilla 5.16 «Estado»** (ítem del Formato B). El instructivo trae la casilla; el ejemplo no declara un código.
- **Rótulos 8.1.2 a 8.1.5:** pagos indirectos, descuentos retroactivos, otros descuentos, y gastos de transporte, manipulación y entrega en el exterior. Esos nombres se copiaron de un formato B impreso de **2007**, cuando el documento era la DUA, anterior a la DAM. Falta verificarlos contra el formato vigente. En el ejemplo van en cero.
- **Subpartida 9102.11.00.00.** Es un SUPUESTO del caso. Falta verificarla contra el Arancel de Aduanas, que no está en la carpeta. De esa verificación dependen también la unidad física y el dígito de la casilla 7.19.

En Coherencia hay, además, tres avisos de lectura del caso: el notify party no tiene casilla en la DAM, el volumen tampoco, y la casilla 3.1 del Formato A es el RUC del agente marítimo. Esos avisos explican el ejercicio; no son códigos PENDIENTE DE VERIFICAR.

### Cálculo de tributos

Queda fuera de este ejercicio. La página no genera el Formato C: la liquidación de la deuda tributaria no se calcula aquí.

### Sin conexión

La herramienta no consulta SUNAT ni a las navieras. No hay login ni datos en la nube. El JSON y el PDF se quedan en tu computador.

### Caso de ejemplo

Shenzhen–Callao es ficticio. Los nombres, el buque, el número de BL, el contenedor y el precinto no corresponden a una empresa ni a un viaje real. Los RUC solo cumplen el dígito verificador (módulo 11). El bloque **Prueba RUC** comprueba ese dígito en la página; no pregunta a SUNAT si el número existe.

### Fecha de las fuentes

Las reglas corresponden al instructivo DESPA-IT.00.04 y a la RS N.º 000129-2026/SUNAT, consultados el 23/09/2026.

SUNAT modifica el instructivo. Antes de usar la herramienta, revisa el control de cambios del instructivo en el portal de SUNAT.

## Alcance

El recorrido de punta a punta es el caso Shenzhen–Callao. Lo que sigue es lo que hace hoy la página si se intenta otra cosa.

### Qué se probó

Importación para el consumo, vía marítima (código 1), una factura, un proveedor, una serie, dos ítems, Incoterm FOB Shenzhen, versión 4 (Incoterms 2020).

### Qué no se recorrió, y qué ocurre si se intenta

**Más de dos ítems (Formato B1).** El formulario tiene solo Ítem 1 e Ítem 2. No hay control para agregar otro. Cargar un JSON con 0, 1 o 3 ítems (cualquier cantidad distinta de 2) muestra: «Este formulario muestra 2 ítems y el archivo trae N. No se cambió lo que hay en pantalla.» El ejemplo sigue igual. No se genera el Formato B1. Los documentos recorren todos los ítems que haya en memoria: si un tercer ítem llegara al estado por otra vía (no ocurre con el formulario ni con Cargar JSON), factura, packing list, BL y Formato B lo listarían en la misma hoja, la casilla 7.2 diría «1, 2 y 3», 7.1 seguiría en 1/1 y el cierre del Formato B avisaría que el instructivo usa el B1 y que esta pantalla los deja en el mismo Formato B.

**Varias series (Formato A1).** El formulario tiene un solo bloque «Datos comunes de la serie». La casilla 7.1 va fija en **1/1**. No se genera el Formato A1. Un JSON con dos ítems y una lista extra de series se carga; esa lista no se usa y 7.1 sigue en 1/1. Un JSON que entrega el campo `serie` como una lista de dos series también se carga (hay dos ítems): subpartida y país de origen quedan vacíos, Coherencia marca error, y 7.1 sigue diciendo 1/1. No se arma una segunda serie.

**Varios proveedores.** El formulario tiene un proveedor. Un JSON con dos ítems y una lista extra de proveedores se carga; factura, packing list y Formato B siguen con el proveedor único. Un JSON que entrega `partes.proveedor` como lista también se carga: la razón social del formulario queda vacía y la casilla 3.1 del Formato B muestra un guion.

**Otras vías (aérea, terrestre, fluvial, etc.).** El campo Vía es texto libre. Cambiarlo a 4 (aéreo) o 7 (carretera), en el formulario o en el JSON, se acepta. Coherencia avisa que la casilla 3.1 es el RUC del agente marítimo solo cuando la vía es marítima. La casilla 3.3 muestra el código nuevo. La 3.1 se sigue llenando con el agente marítimo y la leyenda de transporte marítimo. La 7.8 sigue diciendo «BL. Conocimiento de embarque.» Se sigue armando el Bill of Lading con buque, contenedor y precinto. No se genera guía aérea ni carta de porte.

**Otros regímenes (exportación, admisión temporal, depósito, tránsito, etc.).** El campo Destinación es texto libre. Poner 21 (exportación definitiva), 70 (admisión temporal) u 80 (depósito aduanero) se acepta. Coherencia no emite mensaje por ese código. El rótulo DESTINACIÓN imprime el valor nuevo. El Formato A sigue titulado «Ingreso de mercancías». Las casillas de esos otros regímenes (4.2, 4.3, 7.17, 3.5 a 3.7, rubro 13) siguen vacías, con la leyenda de que no se llenan. Se siguen armando factura, packing list, BL y DAM Formatos A y B.

**Otros Incoterms.** CIF y CFR se aceptan. Coherencia deja un aviso: la pantalla igual toma la suma de los ítems como FOB de las casillas 6.1 y 7.30, y con otro Incoterm el precio de la factura puede incluir flete o seguro. En la prueba con CIF, la factura dice «Incoterms 2020: CIF Shenzhen» y el total sigue rotulado «Total FOB 10.500,00 USD»; la DAM suma ese FOB más el flete 800 y el seguro 40 (valor en aduana 11.340,000); el BL sigue con «flete por cobrar». El mismo aviso sale con cualquier Incoterm de la tabla distinto de FOB. Un código que no está en la tabla (por ejemplo XXX) también se carga y Coherencia lo marca como error.
