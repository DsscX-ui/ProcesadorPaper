/* Diccionario de campos: ÚNICA lista de datos de la herramienta.
   De aquí salen el formulario (F5), la ayuda por campo y la tabla de trazabilidad (F6).
   Cada entrada:
     ruta     ruta del dato en la operación ("[]" = cada ítem)
     es / en  etiqueta bilingüe
     tipo     texto | numero | fecha | codigo (con lista de normativa.js) | sino | equipos
     marca    procedencia del CAMPO (no del valor concreto, que lleva su propia marca en la operación):
              "H" (fuente en la carpeta), "H*" (conocimiento general), "S" (decisión de diseño o práctica
              comercial sin norma) o "PV" (POR VERIFICAR)
     fuente   cita corta: "IT C 5.9", "RS129 art. 1", "SOLAS VI/2"… o "—" si no hay norma
     obl      "sí", "no" o la condición en que es obligatorio
     solo     "importacion" / "exportacion" si el campo solo aplica a una operación
     docs     documentos que lo usan: FC PL BL DAM SEG CO HR
     casilla  { importacion, exportacion }: casilla DAM en cada operación ("" = sin casilla)
              A = Formato A ingreso, S = Formato A salida, B = Formato B, C = Formato C
     ayuda    qué es, en una frase
   Script clásico: deja el objeto global DICCIONARIO. */

var DICCIONARIO = (function () {
  var GRUPOS = [
    ["meta", "Identificación del archivo", "File identification"],
    ["A1", "A1. Operación", "Operation"],
    ["A2", "A2. Partes", "Parties"],
    ["A3", "A3. Ruta", "Route"],
    ["A4", "A4. Condiciones comerciales", "Commercial terms"],
    ["A5", "A5. Aduana (Perú)", "Customs (Peru)"],
    ["A6", "A6. Declaración del valor (Formato B)", "Customs value declaration"],
    ["B1", "B1–B2. Mercancía y embalaje (por ítem)", "Goods and packing (per item)"],
    ["B3", "B3. Contenedor", "Container"],
    ["B4", "B4. Transporte", "Transport"],
    ["B5", "B5. Seguro", "Insurance"],
    ["B6", "B6. Origen y preferencias", "Origin and preferences"],
    ["B7", "B7. Valoración (USD)", "Valuation (USD)"],
    ["B8", "B8. Tributos (importación)", "Duties and taxes (import)"]
  ].map(function (g) { return { id: g[0], es: g[1], en: g[2] }; });

  var MARCAS = ["H", "H*", "S", "PV"];
  var campos = [];

  // d(grupo, ruta, es, en, tipo, marca, fuente, extra). extra.cas = [casilla importación, casilla exportación];
  // un solo texto en extra.cas vale para ambas operaciones.
  function d(grupo, ruta, es, en, tipo, marca, fuente, extra) {
    extra = extra || {};
    var cas = extra.cas == null ? ["", ""] : (typeof extra.cas === "string" ? [extra.cas, extra.cas] : extra.cas);
    campos.push({
      grupo: grupo, ruta: ruta, es: es, en: en, tipo: tipo, marca: marca, fuente: fuente,
      lista: extra.lista || "", obl: extra.obl || "sí", solo: extra.solo || "", docs: extra.docs || "",
      casilla: { importacion: cas[0], exportacion: cas[1] }, ayuda: extra.ayuda || ""
    });
  }

  var G = "generales.", E = "especificos.", P = "generales.partes.", I = "especificos.items[].";
  var SC = "Sin casilla";

  // --- Identificación del archivo
  d("meta", "formato", "Formato del archivo", "File format", "texto", "S", "—", { ayuda: "Marca interna que identifica el archivo como una operación de esta herramienta." });
  d("meta", "version", "Versión del archivo", "File version", "numero", "S", "—", { ayuda: "Versión del formato del archivo." });
  d("meta", "meta.referencia", "Referencia interna", "Internal reference", "texto", "S", "—", { docs: "FC PL BL DAM SEG CO HR", cas: "Pie (sin casilla)", ayuda: "Código propio de la operación; aparece en el pie de todos los documentos." });
  d("meta", "meta.descripcion", "Descripción del caso", "Case description", "texto", "S", "—", { obl: "no", docs: "HR", ayuda: "Resumen breve del caso." });
  d("meta", "meta.ficticio", "Datos ficticios", "Fictitious data", "sino", "S", "—", { docs: "HR", ayuda: "Indica que los datos son ficticios (ejemplo de clase)." });

  // --- A1 Operación
  d("A1", G + "operacion.tipo", "Tipo de operación", "Operation type", "codigo", "H", "IT A y B, DESTINACIÓN", { lista: "tipoOperacion", docs: "DAM HR", cas: ["Cabecera: destinación 10", "Cabecera: destinación 40"], ayuda: "Importación (destinación 10) o exportación (destinación 40)." });
  d("A1", G + "operacion.modalidadCarga", "Modalidad de carga", "Load type", "codigo", "S", "Alcance v1 (PLAN §1)", { lista: "modalidadCarga", docs: "BL HR", ayuda: "En v1 solo contenedor completo (FCL)." });

  // --- A2 Partes
  d("A2", P + "vendedor.razonSocial", "Vendedor / exportador", "Seller / exporter", "texto", "H", "IT C 3.1 / IT B 1.1", { docs: "FC PL BL DAM SEG CO HR", cas: ["B 3.1", "S 1.1"], ayuda: "Quien vende y emite la factura. En el B/L suele ser el embarcador (shipper)." });
  d("A2", P + "vendedor.direccion", "Dirección del vendedor", "Seller address", "texto", "H", "IT C 3.3 / IT B 1.3", { docs: "FC PL BL DAM CO", cas: ["B 3.3", "S 1.3"], ayuda: "Dirección exacta: número, calle y distrito (IT C 3.3)." });
  d("A2", P + "vendedor.ciudad", "Ciudad del vendedor", "Seller city", "texto", "H", "IT C 3.4", { docs: "FC PL BL DAM CO", cas: ["B 3.4", ""], ayuda: "Ciudad de la dirección del vendedor." });
  d("A2", P + "vendedor.pais", "País del vendedor", "Seller country", "codigo", "H", "IT C 3.5", { lista: "pais", docs: "FC PL BL DAM CO", cas: ["B 3.5", ""], ayuda: "País de residencia del proveedor." });
  d("A2", P + "vendedor.idFiscal", "Identificación fiscal del vendedor", "Seller tax ID", "texto", "H", "IT B 1.2", { docs: "FC DAM", cas: ["", "S 1.2 (RUC del exportador)"], ayuda: "En exportación, RUC de 11 dígitos del exportador. En importación solo va en la factura." });
  d("A2", P + "vendedor.ubigeo", "UBIGEO del exportador", "Exporter UBIGEO", "codigo", "H", "IT B 1.4", { lista: "ubigeo", obl: "exportación", solo: "exportacion", docs: "DAM", cas: ["", "S 1.4"], ayuda: "Código de ubicación geográfica del domicilio del exportador (decisión D4)." });
  d("A2", P + "vendedor.telefono", "Teléfono del proveedor", "Supplier phone", "texto", "H", "IT C 3.6", { obl: "no", docs: "DAM", cas: ["B 3.6", ""], ayuda: "Código de país, de ciudad y número." });
  d("A2", P + "vendedor.correo", "Correo del proveedor", "Supplier e-mail", "texto", "H", "IT C 3.9", { obl: "no", docs: "DAM", cas: ["B 3.9", ""], ayuda: "Correo electrónico del proveedor, cuando corresponda." });
  d("A2", P + "vendedor.condicion", "Condición del proveedor", "Supplier condition", "codigo", "H", "IT C 3.2", { lista: "condicionProveedor", obl: "importación", solo: "importacion", docs: "DAM", cas: ["B 3.2", ""], ayuda: "Papel del proveedor en la venta: fabricante, distribuidor, comerciante u otro." });

  d("A2", P + "comprador.razonSocial", "Comprador / importador", "Buyer / importer", "texto", "H", "IT A 1.1, IT C 1.1", { docs: "FC PL BL DAM SEG CO HR", cas: ["A 1.1, B 1.1", ""], ayuda: "Quien compra. En importación es el importador ante SUNAT; en exportación no tiene casilla." });
  d("A2", P + "comprador.direccion", "Dirección del comprador", "Buyer address", "texto", "H", "IT A 1.3", { docs: "FC PL BL DAM CO", cas: ["A 1.3", ""], ayuda: "Domicilio del importador o del comprador extranjero." });
  d("A2", P + "comprador.ciudad", "Ciudad del comprador", "Buyer city", "texto", "S", "—", { docs: "FC PL BL CO", ayuda: "Ciudad del comprador." });
  d("A2", P + "comprador.pais", "País del comprador", "Buyer country", "codigo", "H*", "ISO 3166 alfa-2", { lista: "pais", docs: "FC PL BL CO", ayuda: "País del comprador." });
  d("A2", P + "comprador.idFiscal", "Identificación fiscal del comprador", "Buyer tax ID", "texto", "H", "IT A 1.2", { docs: "FC DAM", cas: ["A 1.2, B 1.2 (RUC, código 4)", ""], ayuda: "En importación, RUC de 11 dígitos; el código de documento 4 = RUC se deriva (IT A 1.2)." });
  d("A2", P + "comprador.ubigeo", "UBIGEO del importador", "Importer UBIGEO", "codigo", "H*", "INEI (tabla SUNAT: F0b)", { lista: "ubigeo", obl: "importación", solo: "importacion", docs: "DAM", cas: ["A 1.4", ""], ayuda: "Código de ubicación geográfica del domicilio del importador." });

  d("A2", P + "consignatario.tipo", "Consignatario", "Consignee", "texto", "S", "—", { docs: "FC BL", cas: SC, ayuda: "'comprador', 'otro' o 'a_la_orden'. Es quien recibe la carga según el B/L." });
  d("A2", P + "consignatario.razonSocial", "Consignatario: nombre", "Consignee name", "texto", "S", "—", { obl: "si no es el comprador", docs: "FC BL", ayuda: "Solo si el consignatario no es el comprador." });
  d("A2", P + "consignatario.direccion", "Consignatario: dirección", "Consignee address", "texto", "S", "—", { obl: "si no es el comprador", docs: "FC BL", ayuda: "Solo si el consignatario no es el comprador." });
  d("A2", P + "notify.tipo", "Parte a notificar", "Notify party", "texto", "S", "—", { docs: "BL", cas: SC, ayuda: "'consignatario' u 'otro'. Recibe el aviso de llegada." });
  d("A2", P + "notify.razonSocial", "Notify: nombre", "Notify name", "texto", "S", "—", { obl: "si no es el consignatario", docs: "BL", ayuda: "Solo si el notify no es el consignatario." });
  d("A2", P + "notify.direccion", "Notify: dirección", "Notify address", "texto", "S", "—", { obl: "si no es el consignatario", docs: "BL", ayuda: "Solo si el notify no es el consignatario." });
  d("A2", P + "naviera.nombre", "Naviera", "Shipping line", "texto", "S", "—", { docs: "BL HR", cas: "Sin casilla (A 3.1 es el agente marítimo)", ayuda: "Empresa que transporta y emite el B/L." });
  d("A2", P + "agenteMaritimo.razonSocial", "Agente marítimo", "Shipping agent", "texto", "H", "IT A 3.1", { docs: "DAM", cas: ["A 3.1", "S 3.1"], ayuda: "Representa a la naviera en el Perú; en vía marítima es la 'empresa de transporte' de la DAM (IT A 3.1)." });
  d("A2", P + "agenteMaritimo.ruc", "Agente marítimo: RUC o código", "Shipping agent tax ID / code", "texto", "PV", "PV-28", { docs: "DAM", cas: ["A 3.1", "S 3.1"], ayuda: "RUC; en la Aduana Marítima del Callao podría ir el código de SUNAT (PV-28)." });
  d("A2", P + "agenteAduana.razonSocial", "Agente de aduana (declarante)", "Customs broker", "texto", "H", "IT A 8", { docs: "DAM", cas: ["A 8", "S 8"], ayuda: "Despachador que formula la DAM." });
  d("A2", P + "agenteAduana.ruc", "Agente de aduana: RUC o código", "Customs broker tax ID / code", "texto", "PV", "PV-28", { docs: "DAM", cas: ["A 8", "S 8"], ayuda: "RUC o código del despachador (PV-28)." });
  d("A2", P + "depositoTemporal.razonSocial", "Depósito temporal", "Temporary warehouse", "texto", "H", "IT A 4.1", { docs: "DAM", cas: ["A 4.1", "S 4.1"], ayuda: "Almacén donde está o estará la mercancía." });
  d("A2", P + "depositoTemporal.ruc", "Depósito temporal: RUC o código", "Warehouse tax ID / code", "texto", "PV", "PV-28", { docs: "DAM", cas: ["A 4.1", "S 4.1"], ayuda: "RUC o código del depósito (PV-28)." });
  d("A2", P + "entidadFinanciera.nombre", "Entidad financiera", "Bank", "texto", "H", "IT A 5.1", { docs: "DAM", cas: ["A 5.1", "S 5.1"], ayuda: "Banco que intervino en el pago." });
  d("A2", P + "entidadFinanciera.codigo", "Entidad financiera: código", "Bank code", "texto", "PV", "PV-09", { obl: "no", docs: "DAM", cas: ["A 5.1", "S 5.1"], ayuda: "Código de SUNAT de la entidad (PV-09)." });
  d("A2", P + "aseguradora.razonSocial", "Aseguradora", "Insurer", "texto", "S", "—", { obl: "si hay seguro", docs: "SEG", ayuda: "Compañía que emite la póliza." });
  d("A2", P + "aseguradora.direccion", "Aseguradora: dirección", "Insurer address", "texto", "S", "—", { obl: "no", docs: "SEG", ayuda: "Dirección de la aseguradora." });
  d("A2", P + "productor.razonSocial", "Productor", "Producer", "texto", "PV", "PV-12", { obl: "no", docs: "CO", ayuda: "Solo si el productor no es el exportador." });
  d("A2", P + "productor.direccion", "Productor: dirección", "Producer address", "texto", "PV", "PV-12", { obl: "no", docs: "CO", ayuda: "Solo si el productor no es el exportador." });
  d("A2", P + "entidadCO.nombre", "Entidad emisora del CO", "CO issuing body", "texto", "PV", "PV-12", { obl: "si hay CO", docs: "CO", ayuda: "Entidad que certifica el origen (PV-12)." });

  // --- A3 Ruta
  d("A3", G + "ruta.puertoEmbarque.nombre", "Puerto de embarque", "Port of loading", "texto", "H", "IT A 7.6", { docs: "FC PL BL DAM SEG CO HR", cas: ["A 7.6", "S 7.6"], ayuda: "Puerto donde la carga sube al buque." });
  d("A3", G + "ruta.puertoEmbarque.locode", "Puerto de embarque: código", "Port of loading code", "codigo", "H*", "UN/LOCODE (PV-09)", { lista: "puerto", docs: "BL DAM HR", cas: ["A 7.6", "S 7.6"], ayuda: "UN/LOCODE de 5 caracteres; los 2 primeros son el país." });
  d("A3", G + "ruta.puertoDescarga.nombre", "Puerto de descarga", "Port of discharge", "texto", "H", "IT B 7.27", { docs: "FC PL BL DAM SEG CO HR", cas: ["", "Con S 7.27 (transmisión)"], ayuda: "Puerto donde la carga baja del buque." });
  d("A3", G + "ruta.puertoDescarga.locode", "Puerto de descarga: código", "Port of discharge code", "codigo", "H*", "UN/LOCODE (PV-09)", { lista: "puerto", docs: "BL DAM HR", cas: ["", "Con S 7.27 (transmisión)"], ayuda: "UN/LOCODE de 5 caracteres." });
  d("A3", G + "ruta.paisAdquisicion", "País de adquisición", "Country of acquisition", "codigo", "H", "IT A 7.27", { lista: "pais", obl: "importación", solo: "importacion", docs: "DAM", cas: ["A 7.27", ""], ayuda: "País donde se compró la mercancía; por defecto, el del proveedor." });
  d("A3", G + "ruta.lugarRecepcion", "Lugar de recepción", "Place of receipt", "texto", "S", "—", { obl: "no", docs: "BL", ayuda: "Solo con transporte combinado." });
  d("A3", G + "ruta.lugarEntrega", "Lugar de entrega", "Place of delivery", "texto", "S", "—", { obl: "no", docs: "BL", ayuda: "Solo con transporte combinado." });

  // --- A4 Condiciones comerciales
  d("A4", G + "comercial.incoterm", "Incoterm", "Incoterm", "codigo", "H", "IT C 5.4; Incoterms® 2020 [H*]", { lista: "incoterm", docs: "FC BL DAM SEG HR", cas: ["B 5.4", "S 6.1–6.5"], ayuda: "Regla Incoterms® 2020 pactada: define costos, riesgos y documentos." });
  d("A4", G + "comercial.lugarConvenido", "Lugar convenido", "Named place", "texto", "H", "IT C 5.4", { docs: "FC DAM HR", cas: ["B 5.4", ""], ayuda: "Lugar que acompaña al Incoterm; debe cuadrar con los puertos (E03)." });
  d("A4", G + "comercial.moneda", "Moneda", "Currency", "codigo", "H", "IT A 7.29, IT IV.4", { lista: "moneda", docs: "FC DAM SEG HR", cas: ["A 7.29, B 5.5", ""], ayuda: "Moneda del contrato (USD en v1)." });
  d("A4", G + "comercial.facturaNumero", "N° de factura", "Invoice No.", "texto", "H", "IT A 7.36, IT C 5.2", { docs: "FC PL DAM SEG CO HR", cas: ["A 7.36, B 5.2", "S 7.36"], ayuda: "Número de la factura comercial." });
  d("A4", G + "comercial.facturaFecha", "Fecha de factura", "Invoice date", "fecha", "H", "IT A 7.36, IT C 5.3", { docs: "FC PL DAM SEG CO HR", cas: ["A 7.36, B 5.3", "S 7.36"], ayuda: "Fecha de emisión de la factura." });
  d("A4", G + "comercial.modalidadPago", "Modalidad de pago", "Payment terms code", "codigo", "H", "IT A 5.2", { lista: "modalidadPago", docs: "DAM", cas: ["A 5.2", "S 5.2"], ayuda: "Cuándo se paga: contado, crédito, anticipado, etc." });
  d("A4", G + "comercial.condicionesPago", "Condiciones de pago (texto)", "Payment terms", "texto", "S", "—", { docs: "FC", ayuda: "Cómo se paga, en palabras, tal como va en la factura." });
  d("A4", G + "comercial.medioPago", "Medio de pago", "Means of payment", "codigo", "H", "IT C rubro 4, otros datos a)", { lista: "medioPago", obl: "importación", solo: "importacion", docs: "DAM", cas: ["B rubro 4 (otros datos a)", ""], ayuda: "Instrumento de pago; si el FOB supera US$ 500 debe pasar por el sistema financiero (A16)." });
  d("A4", G + "comercial.pagoDiferido.porcentaje", "Pago diferido: %", "Deferred payment %", "numero", "H", "IT C rubro 4, otros datos h)", { obl: "importación a crédito", solo: "importacion", docs: "DAM", cas: ["B rubro 4 (otros datos h)", ""], ayuda: "Porcentaje del valor que se paga a crédito." });
  d("A4", G + "comercial.pagoDiferido.plazoDias", "Pago diferido: plazo (días)", "Deferred payment term (days)", "numero", "H", "IT C rubro 4, otros datos i)", { obl: "importación a crédito", solo: "importacion", docs: "DAM", cas: ["B rubro 4 (otros datos i)", ""], ayuda: "Días calendario desde el evento asociado." });
  d("A4", G + "comercial.pagoDiferido.evento", "Pago diferido: evento", "Deferred payment event", "codigo", "H", "IT C rubro 4, otros datos j)", { lista: "eventoPagoDiferido", obl: "importación a crédito", solo: "importacion", docs: "DAM", cas: ["B rubro 4 (otros datos j)", ""], ayuda: "Desde cuándo se cuenta el plazo." });
  d("A4", G + "comercial.pagoDiferido.fecha", "Pago diferido: fecha del pago", "Deferred payment date", "fecha", "H", "IT C rubro 4, otros datos k)", { obl: "no", solo: "importacion", docs: "DAM", cas: ["B rubro 4 (otros datos k)", ""], ayuda: "Fecha en que se hizo efectivo el pago." });
  d("A4", G + "comercial.contrato", "N° de contrato u orden de compra", "Contract / PO No.", "texto", "S", "—", { obl: "no", docs: "FC", ayuda: "Referencia comercial opcional." });

  // --- A5 Aduana
  d("A5", G + "aduana.aduana", "Aduana de despacho", "Customs office", "codigo", "H*", "Tabla de aduanas SUNAT (F0b)", { lista: "aduana", docs: "DAM", cas: ["Cabecera", "Cabecera; S 3.7"], ayuda: "Intendencia de aduana del despacho." });
  d("A5", G + "aduana.modalidadDespacho", "Modalidad de despacho", "Clearance mode", "codigo", "H", "IT A, MODALIDAD", { lista: "modalidadDespacho", obl: "importación", solo: "importacion", docs: "DAM", cas: ["Cabecera", ""], ayuda: "Anticipado, excepcional, urgente o socorro. En exportación no aplica (IT B)." });
  d("A5", G + "aduana.tipoDespacho", "Tipo de despacho", "Clearance type", "codigo", "H", "IT B, TIPO DESPACHO", { lista: "tipoDespachoExportacion", obl: "exportación", docs: "DAM", cas: ["Cabecera (sin lista en el IT: PV)", "Cabecera"], ayuda: "En exportación, 00 normal. En importación para el consumo el IT no trae lista (queda vacío)." });
  d("A5", G + "aduana.numeroOrden", "N° de orden", "Declarant order No.", "texto", "H", "IT A, Nº ORDEN", { docs: "DAM", cas: "Cabecera (Nº ORDEN)", ayuda: "Año + número de 6 caracteres que asigna el declarante." });
  d("A5", G + "aduana.fechaFormulacion", "Fecha de formulación", "Declaration date", "fecha", "H", "IT A 8", { docs: "DAM", cas: ["A 8", "S 8"], ayuda: "Fecha en que el declarante formula la DAM." });
  d("A5", G + "aduana.tipoCambio", "Tipo de cambio (S/ por USD)", "Exchange rate (PEN per USD)", "numero", "H", "IT D rubro 5 (fuente: PV-07)", { obl: "importación", solo: "importacion", docs: "DAM HR", cas: ["C rubro 5", ""], ayuda: "Tipo venta de la fecha de pago (IT D rubro 5); quién lo publica: PV-07." });
  d("A5", G + "aduana.tipoCambioFecha", "Tipo de cambio: fecha", "Exchange rate date", "fecha", "H", "IT D rubro 5", { obl: "no", solo: "importacion", docs: "DAM", ayuda: "Fecha del tipo de cambio." });
  d("A5", G + "aduana.tipoCambioFuente", "Tipo de cambio: fuente", "Exchange rate source", "texto", "PV", "PV-07", { obl: "no", solo: "importacion", docs: "DAM", ayuda: "De dónde se tomó el tipo de cambio." });
  d("A5", G + "aduana.regionDestino", "Región de destino", "Destination region", "codigo", "H", "IT A 7.37 l)", { lista: "regionDestino", obl: "importación", solo: "importacion", docs: "DAM", cas: ["A 7.37 l", ""], ayuda: "Departamento donde se consumirá la mercancía." });

  // --- A6 Declaración del valor (solo importación)
  var V = G + "valor.";
  d("A6", V + "nivelComercial", "Nivel comercial", "Trade level", "codigo", "H", "IT C 1.3", { lista: "nivelComercial", obl: "importación", solo: "importacion", docs: "DAM", cas: ["B 1.3", ""], ayuda: "Posición del importador en la cadena de venta." });
  d("A6", V + "naturaleza", "Naturaleza de la transacción", "Nature of transaction", "codigo", "H", "IT C 4.1", { lista: "naturaleza", obl: "importación", solo: "importacion", docs: "DAM", cas: ["B 4.1", ""], ayuda: "Tipo de operación comercial (11 = compraventa a precio firme)." });
  d("A6", V + "formaEnvio", "Forma de envío", "Shipment form", "texto", "H", "IT C 4.2", { obl: "importación", solo: "importacion", docs: "DAM", cas: ["B 4.2", ""], ayuda: "1/1 si llega en un solo embarque." });
  d("A6", V + "tipoValor", "Tipo de valor", "Value type", "codigo", "H", "IT C 5.6", { lista: "tipoValor", obl: "importación", solo: "importacion", docs: "DAM", cas: ["B 5.6", ""], ayuda: "Definitivo o provisional." });
  d("A6", V + "intermediario.hubo", "¿Hubo intermediario?", "Intermediary?", "codigo", "H", "IT C 6.1", { lista: "siNo", obl: "importación", solo: "importacion", docs: "DAM", cas: ["B 6.1", ""], ayuda: "Agente, comisionista u otro que participó en la venta." });
  ["nombre", "direccion", "ciudad", "pais", "tipo", "contacto"].forEach(function (k, i) {
    var et = { nombre: ["Intermediario: nombre", "Intermediary name"], direccion: ["Intermediario: dirección", "Intermediary address"],
      ciudad: ["Intermediario: ciudad", "Intermediary city"], pais: ["Intermediario: país", "Intermediary country"],
      tipo: ["Intermediario: tipo", "Intermediary type"], contacto: ["Intermediario: correo o web", "Intermediary e-mail / web"] }[k];
    d("A6", V + "intermediario." + k, et[0], et[1], "texto", "H", "IT C 6." + (i + 2), { obl: "si hubo intermediario", solo: "importacion", docs: "DAM", cas: ["B 6." + (i + 2), ""], ayuda: "Solo si 6.1 = Sí." });
  });
  NORMATIVA.preguntasRubro7.forEach(function (p) {
    d("A6", V + "rubro7.p" + p.numero.replace(".", "_"), "Pregunta " + p.numero, "Question " + p.numero, "codigo", "H", "IT C " + p.numero, {
      lista: "siNo", obl: p.condicion ? p.condicion.toLowerCase() : "importación", solo: "importacion",
      docs: "DAM", cas: ["B " + p.numero, ""],
      ayuda: p.texto + (p.condicion ? " (" + p.condicion + ".)" : "") + " La respuesta depende de la operación; no hay valor por defecto."
    });
  });

  // --- B1–B2 Mercancía y embalaje (por ítem)
  d("B1", I + "nombre", "Nombre del producto", "Product name", "texto", "H", "IT C 5.12", { docs: "FC PL BL DAM SEG CO", cas: ["B 5.12", ""], ayuda: "Nombre común de la mercancía." });
  d("B1", I + "descripcion", "Descripción", "Description", "texto", "H", "IT A 7.35, IT B 7.35", { docs: "FC PL DAM CO", cas: ["A 7.35, B 5.19", "S 7.35"], ayuda: "Denominación, presentación, material, uso y otras características (IT A 7.35). En exportación, en español." });
  d("B1", I + "marca", "Marca", "Brand", "texto", "H", "IT C 5.13", { docs: "FC PL DAM", cas: ["B 5.13", ""], ayuda: "Marca comercial." });
  d("B1", I + "modelo", "Modelo", "Model", "texto", "H", "IT C 5.14", { docs: "FC PL DAM", cas: ["B 5.14", ""], ayuda: "Código o nombre del modelo." });
  d("B1", I + "subpartida", "Subpartida nacional", "HS code (10 digits)", "texto", "H", "IT A 7.19; arancel: PV-10", { docs: "FC BL DAM CO", cas: ["A 7.19", "S 7.19"], ayuda: "10 dígitos; los 6 primeros son del Sistema Armonizado." });
  d("B1", I + "subpartidaVerificada", "Subpartida verificada", "HS code verified", "sino", "S", "—", { docs: "HR", ayuda: "Marca si la subpartida se comprobó en el arancel; si no, sale POR VERIFICAR (A08)." });
  d("B1", I + "paisOrigen", "País de origen", "Country of origin", "codigo", "H", "IT A 7.26, IT C 5.7", { lista: "pais", docs: "FC DAM CO", cas: ["A 7.26, B 5.7", ""], ayuda: "País donde se fabricó la mercancía." });
  d("B1", I + "ubigeoOrigen", "UBIGEO de fabricación", "Place of manufacture (UBIGEO)", "codigo", "H", "IT B 7.26", { lista: "ubigeo", obl: "exportación", solo: "exportacion", docs: "DAM", cas: ["", "S 7.26"], ayuda: "En exportación, la casilla de origen lleva el UBIGEO del lugar de fabricación (IT B 7.26)." });
  d("B1", I + "estado", "Estado", "Condition", "codigo", "H", "IT C 5.16 (exportación: PV-09)", { lista: "estado", docs: "DAM", cas: ["B 5.16", "S 7.20"], ayuda: "Nuevo, usado, etc." });
  d("B1", I + "cantidad", "Cantidad", "Quantity", "numero", "H", "IT A 7.10, IT C 5.11", { docs: "FC PL DAM CO", cas: ["A 7.10, B 5.11", ""], ayuda: "Cantidad en unidades comerciales." });
  d("B1", I + "unidadComercial", "Unidad comercial", "Commercial unit", "codigo", "H", "IT C 5.11 (códigos: PV-09)", { lista: "unidadMedida", docs: "FC PL DAM", cas: ["A 7.10, B 5.11", ""], ayuda: "Unidad en que se vende." });
  d("B1", I + "unidadFisica", "Unidad física", "Physical unit", "codigo", "PV", "PV-09; RS129 anexo VI 6.4", { lista: "unidadMedida", docs: "DAM", cas: ["A 7.16", "S 7.16"], ayuda: "Unidad que pide la subpartida en el arancel." });
  d("B1", I + "precioUnitario", "Precio unitario (USD)", "Unit price (USD)", "numero", "H", "IT C 8.1.1", { docs: "FC DAM HR", cas: ["B 8.1.1 (total)", "S 6.1 (total)"], ayuda: "Precio en el Incoterm pactado." });
  d("B1", I + "objetoAjuste", "Ítem objeto de ajuste", "Item subject to adjustment", "sino", "H", "IT C 5.10", { obl: "si hay ajustes", solo: "importacion", docs: "DAM", cas: ["B 5.10", ""], ayuda: "Si es Sí, el ítem recibe parte de los ajustes (B 8.1.2–8.1.4 y 8.2), en proporción a su valor entre los ítems ajustados." });
  d("B1", I + "equipos", "Equipos: serie e IMEI", "Devices: serial and IMEI", "equipos", "H", "RS129 art. 1", { obl: "celulares (E17)", solo: "importacion", docs: "FC DAM", cas: ["A 7.35 (RS129)", ""], ayuda: "Un registro por equipo, con su número de serie y uno o más IMEI. Obligatorio en 8517.13.00.00 y 8517.14.00.00 desde el 05-10-2026." });
  d("B1", I + "claseBulto", "Clase de bulto", "Package type", "codigo", "H", "IT A 7.13 (códigos: PV-09)", { lista: "claseBulto", docs: "FC PL BL DAM SEG CO HR", cas: ["A 7.13", "S 7.13"], ayuda: "Tipo de embalaje (caja, pallet, saco…)." });
  d("B1", I + "unidadesPorBulto", "Unidades por bulto", "Units per package", "numero", "S", "—", { docs: "PL", ayuda: "Cuántas unidades van en cada bulto (en v1 la división debe ser exacta)." });
  d("B1", I + "pesoNetoBulto", "Peso neto por bulto (kg)", "Net weight per package (kg)", "numero", "H", "IT A 7.14", { docs: "FC PL DAM HR", cas: ["A 7.14 (total de la serie)", "S 7.14 (total de la serie)"], ayuda: "Peso de la mercancía sin embalaje." });
  d("B1", I + "pesoBrutoBulto", "Peso bruto por bulto (kg)", "Gross weight per package (kg)", "numero", "H", "IT A 7.15", { docs: "FC PL BL DAM CO HR", cas: ["A 7.15 (total de la serie)", "S 7.15 (total de la serie)"], ayuda: "Peso con embalaje." });
  d("B1", I + "largoCm", "Largo del bulto (cm)", "Package length (cm)", "numero", "S", "—", { docs: "PL BL HR", cas: SC, ayuda: "Sirve para el volumen." });
  d("B1", I + "anchoCm", "Ancho del bulto (cm)", "Package width (cm)", "numero", "S", "—", { docs: "PL BL HR", cas: SC, ayuda: "Sirve para el volumen." });
  d("B1", I + "altoCm", "Alto del bulto (cm)", "Package height (cm)", "numero", "S", "—", { docs: "PL BL HR", cas: SC, ayuda: "Sirve para el volumen." });
  d("B1", E + "marcasEmbarque", "Marcas de embarque", "Shipping marks", "texto", "H", "IT A 9", { docs: "PL BL SEG CO", cas: ["A 9", "S 9"], ayuda: "Texto pintado en los bultos para identificarlos." });

  // --- B3 Contenedor
  var C = E + "contenedor.";
  d("B3", C + "tipo", "Tipo de contenedor", "Container type", "codigo", "H*", "ISO 6346", { lista: "tipoContenedor", docs: "PL BL HR", ayuda: "Tamaño y tipo ISO." });
  d("B3", C + "numero", "N° de contenedor", "Container No.", "texto", "H*", "ISO 6346; casilla: IT A 9", { docs: "PL BL DAM SEG HR", cas: ["A 9", "S 9"], ayuda: "4 letras + 6 dígitos + dígito de control ISO 6346." });
  d("B3", C + "precinto", "Precinto", "Seal No.", "texto", "H", "IT A 9", { docs: "PL BL DAM SEG HR", cas: ["A 9", "S 9"], ayuda: "Número del sello de seguridad." });
  d("B3", C + "tara", "Tara (kg)", "Tare (kg)", "numero", "PV", "PV-16", { docs: "BL HR", cas: SC, ayuda: "Peso del contenedor vacío (placa del contenedor)." });
  d("B3", C + "estibaTrincaje", "Estiba y trincaje (kg)", "Dunnage and lashing (kg)", "numero", "H*", "SOLAS VI/2", { obl: "no", docs: "BL", cas: SC, ayuda: "Peso de materiales de sujeción, si los hay." });
  d("B3", C + "vgmMetodo", "Método VGM", "VGM method", "codigo", "H*", "SOLAS VI/2", { lista: "metodoVgm", docs: "BL", cas: SC, ayuda: "Cómo se obtuvo la masa bruta verificada." });
  d("B3", C + "vgmResponsable", "VGM: responsable", "VGM signatory", "texto", "H*", "SOLAS VI/2", { docs: "BL", ayuda: "Quien firma la declaración VGM (el embarcador)." });
  d("B3", C + "vgmFecha", "VGM: fecha", "VGM date", "fecha", "H*", "SOLAS VI/2", { docs: "BL", ayuda: "Fecha de la declaración VGM." });

  // --- B4 Transporte
  var T = E + "transporte.";
  d("B4", T + "nave", "Nave", "Vessel", "texto", "S", "—", { docs: "BL SEG CO HR", cas: ["Sin casilla en importación para el consumo", SC], ayuda: "Nombre del buque." });
  d("B4", T + "viaje", "Viaje", "Voyage", "texto", "S", "—", { docs: "BL SEG CO HR", ayuda: "Número de viaje que asigna la naviera." });
  d("B4", T + "booking", "N° de booking", "Booking No.", "texto", "S", "—", { docs: "BL", ayuda: "Reserva de espacio con la naviera." });
  d("B4", T + "blNumero", "N° de B/L", "B/L No.", "texto", "H", "IT A 7.8", { obl: "para la DAM", docs: "BL DAM SEG", cas: ["A 7.8", "S 7.8"], ayuda: "Número del conocimiento de embarque." });
  d("B4", T + "blTipo", "Tipo de B/L", "B/L type", "codigo", "S", "—", { lista: "tipoBl", docs: "BL", ayuda: "Nominativo o a la orden." });
  d("B4", T + "blOriginales", "N° de originales", "No. of originals", "numero", "S", "—", { docs: "BL", ayuda: "Juego de originales del B/L (usual: 3)." });
  d("B4", T + "blLugarEmision", "Lugar de emisión del B/L", "Place of issue", "texto", "S", "—", { docs: "BL", ayuda: "Ciudad donde se emite el B/L." });
  d("B4", T + "blFechaEmision", "Fecha de emisión del B/L", "Date of issue", "fecha", "S", "—", { docs: "BL", ayuda: "Fecha en que se emite el B/L." });
  d("B4", T + "fechaShippedOnBoard", "Fecha 'shipped on board'", "Shipped on board date", "fecha", "S", "—", { docs: "BL", ayuda: "Fecha en que la carga quedó a bordo." });
  d("B4", T + "clausulaSlac", "Cláusula SLAC", "Shipper's load, stow and count", "sino", "S", "—", { obl: "no", docs: "BL", ayuda: "El embarcador cargó y contó; la naviera no lo verificó." });
  d("B4", T + "clausulaStc", "Cláusula STC", "Said to contain", "sino", "S", "—", { obl: "no", docs: "BL", ayuda: "La naviera describe la carga según lo declarado." });
  d("B4", T + "shipper", "Embarcador si no es el vendedor", "Shipper (if not seller)", "texto", "S", "—", { obl: "no", docs: "BL", ayuda: "Vacío = el vendedor es el embarcador." });
  d("B4", T + "fleteBl", "Flete en el B/L", "Freight payable", "codigo", "S", "Práctica marítima; usual según Incoterm (PLAN §6.8) [H*]", { lista: "fleteBl", docs: "BL HR", cas: SC, ayuda: "Prepaid (lo paga el embarcador en origen) o collect (lo paga el consignatario en destino). Lo usual: prepaid en C y D; collect en E y F. Si difiere, advertencia A05 (decisión D8)." });
  d("B4", T + "manifiesto", "N° de manifiesto", "Manifest No.", "texto", "H", "IT A 3.2", { obl: "para la DAM", docs: "DAM", cas: ["A 3.2", "S 3.2"], ayuda: "Aduana – año – número (IT A 3.2)." });
  d("B4", T + "fechaEmbarque", "Fecha de embarque", "Shipment date", "fecha", "H", "IT A 7.7", { docs: "BL DAM SEG CO HR", cas: ["A 7.7", ""], ayuda: "Fecha en que la carga se embarcó." });
  d("B4", T + "fechaTerminoEmbarque", "Fecha de término de embarque", "End of loading date", "fecha", "H", "IT B 3.4", { obl: "exportación", solo: "exportacion", docs: "DAM", cas: ["", "S 3.4"], ayuda: "Fecha en que se embarcó el último bulto (IT B 3.4)." });
  d("B4", T + "eta", "Llegada estimada (ETA)", "Estimated arrival (ETA)", "fecha", "S", "—", { docs: "HR", ayuda: "Fecha estimada de llegada al puerto de descarga." });
  d("B4", T + "fechaTerminoDescarga", "Fecha de término de descarga", "End of discharge date", "fecha", "H", "IT A 3.4 (anticipado: PV-26)", { obl: "importación (salvo anticipado: PV-26)", solo: "importacion", docs: "DAM", cas: ["A 3.4", ""], ayuda: "Fecha en que culmina la descarga." });

  // --- B5 Seguro
  var S = E + "seguro.";
  d("B5", S + "hay", "¿Hay seguro?", "Insured?", "sino", "H", "IT A 7.32", { docs: "SEG DAM HR", cas: ["A 7.32 (tipo de seguro)", ""], ayuda: "Obligatorio en CIF y CIP." });
  d("B5", S + "tipoPoliza", "Tipo de póliza", "Policy type", "codigo", "H", "IT A 7.32", { lista: "tipoPoliza", obl: "si hay seguro", docs: "SEG DAM", cas: ["A 7.32 (2 individual / 3 flotante)", ""], ayuda: "Póliza individual o flotante." });
  d("B5", S + "poliza", "N° de póliza", "Policy No.", "texto", "S", "—", { obl: "si hay seguro", docs: "SEG", ayuda: "Número de la póliza." });
  d("B5", S + "certificado", "N° de certificado", "Certificate No.", "texto", "S", "—", { obl: "si hay seguro", docs: "SEG", ayuda: "Número del certificado de seguro del embarque." });
  d("B5", S + "fechaEmision", "Fecha de emisión", "Date of issue", "fecha", "H*", "UCP 600 art. 28(e)", { obl: "si hay seguro", docs: "SEG", ayuda: "No debería ser posterior al embarque (A11)." });
  d("B5", S + "clausulas", "Cláusulas ICC", "Institute Cargo Clauses", "codigo", "H*", "ICC 2009; Incoterms® 2020", { lista: "clausulasICC", obl: "si hay seguro", docs: "SEG HR", ayuda: "Mínimo (C) en CIF y (A) en CIP." });
  d("B5", S + "guerra", "Cláusula de guerra", "War clauses", "sino", "H*", "ICC 2009", { obl: "no", docs: "SEG", ayuda: "Cobertura adicional de guerra." });
  d("B5", S + "huelgas", "Cláusula de huelgas", "Strikes clauses", "sino", "H*", "ICC 2009", { obl: "no", docs: "SEG", ayuda: "Cobertura adicional de huelgas." });
  d("B5", S + "coberturaPct", "Cobertura (%)", "Cover (%)", "numero", "H*", "Incoterms® 2020, CIF/CIP A5", { obl: "si hay seguro", docs: "SEG HR", ayuda: "Mínimo 110 % en CIF y CIP." });
  d("B5", S + "tasaPrimaPct", "Tasa de prima (%)", "Premium rate (%)", "numero", "S", "—", { obl: "si hay seguro", docs: "FC DAM HR", ayuda: "Prima = suma asegurada × tasa." });
  d("B5", S + "lugarPagoSiniestros", "Lugar de pago de siniestros", "Claims payable at", "texto", "S", "—", { obl: "si hay seguro", docs: "SEG", ayuda: "Dónde y en qué moneda se pagan los siniestros." });
  d("B5", S + "agenteReclamos", "Agente de reclamos", "Claims / survey agent", "texto", "S", "—", { obl: "no", docs: "SEG", ayuda: "A quién avisar en destino en caso de daño." });
  d("B5", S + "pctTablaSunat", "% tabla de seguros SUNAT", "SUNAT insurance table %", "numero", "PV", "IT C 8.4; porcentajes: PV-06", { obl: "importación sin seguro", solo: "importacion", docs: "DAM", cas: ["A 7.32", ""], ayuda: "Porcentaje de la tabla de SUNAT cuando no hay póliza (PV-06)." });

  // --- B6 Origen
  var O = E + "origen.";
  d("B6", O + "solicitaPreferencia", "¿Se solicita trato preferencial?", "Preference requested?", "sino", "S", "—", { docs: "CO DAM", ayuda: "Si es Sí, se genera el certificado de origen." });
  d("B6", O + "acuerdo", "Acuerdo comercial", "Trade agreement", "texto", "PV", "PV-12", { obl: "si hay CO", docs: "CO", ayuda: "Acuerdo que da la preferencia." });
  d("B6", O + "criterio", "Criterio de origen", "Origin criterion", "texto", "PV", "PV-12", { obl: "si hay CO", docs: "CO", ayuda: "Según el acuerdo (PV-12)." });
  d("B6", O + "certificadoNumero", "N° de certificado de origen", "Certificate of origin No.", "texto", "H", "IT A 7.9, IT B 7.9", { obl: "si hay CO", docs: "CO DAM", cas: ["A 7.9", "S 7.9 (no se llena)"], ayuda: "Número del certificado." });
  d("B6", O + "certificadoFecha", "Fecha del certificado de origen", "Certificate of origin date", "fecha", "H", "IT A 7.9", { obl: "si hay CO", docs: "CO DAM", cas: ["A 7.9", "S 7.9 (no se llena)"], ayuda: "Fecha de emisión del certificado." });

  // --- B7 Valoración
  var VA = E + "valoracion.";
  d("B7", VA + "flete", "Flete internacional (USD)", "Ocean freight (USD)", "numero", "H", "IT C 8.3.1; IT A 6.2", { obl: "C/D e importación", docs: "FC BL DAM HR", cas: ["B 8.3.1 → A 6.2, 7.31", ""], ayuda: "Del puerto de embarque al de destino." });
  // [clave, es, en, casilla, marca, fuente, ayuda]
  [
    ["gastosExw815", "Gastos hasta el embarque (EXW)", "Pre-carriage costs (EXW)", "B 8.1.5", "PV", "IT C 5.9 (rótulo: PV)", "Solo en EXW; suma al FOB. Nombre exacto de la casilla: POR VERIFICAR."],
    ["otros816", "Otros gastos no facturados", "Other costs not invoiced", "B 8.1.6", "H", "IT C 8.1.6", "Ventas sucesivas, diferencias de flete u otros gastos que integran el valor; suma al FOB."],
    ["ajuste812", "Casilla 8.1.2: monto no incluido en 8.1.1 (rótulo por verificar)", "Box 8.1.2 (label to be verified)", "B 8.1.2", "PV", "IT C 5.10 y 8.1 (rótulo: PV)", "Se consigna si no está incluido en 8.1.1 y forma parte del ajuste (IT C 5.10). El rótulo de la casilla no figura en la copia del instructivo; por la pregunta 7.7 podría tratarse de pagos indirectos: POR VERIFICAR."],
    ["ajuste813", "Casilla 8.1.3: descuento incluido y deducido en la factura (rótulo por verificar)", "Box 8.1.3 (label to be verified)", "B 8.1.3", "PV", "IT C 5.10 y 8.1 (rótulo: PV)", "Se consigna si está incluido, distinguido y deducido en la factura, y forma parte del ajuste (IT C 5.10). Por la pregunta 7.8 podría tratarse de descuentos retroactivos: POR VERIFICAR."],
    ["descuentosNoAceptables814", "Otros descuentos no aceptables", "Other non-acceptable discounts", "B 8.1.4", "H", "IT C 8.1 y 5.10", "Descuentos a más de un importador o país, posteriores al embarque, o por cantidad no importada en su totalidad; forma parte del ajuste."],
    ["comisiones821", "Comisiones y corretajes", "Commissions and brokerage", "B 8.2.1", "H", "IT C 8.2.1", "Excepto comisiones de compra."],
    ["envases822", "Envases y embalajes", "Containers and packing", "B 8.2.2", "H", "IT C 8.2.2", "Si no están en el precio."],
    ["materiales8231", "Materiales incorporados", "Materials incorporated", "B 8.2.3.1", "H", "IT C 8.2.3.1", "Suministrados por el importador."],
    ["herramientas8232", "Herramientas y moldes", "Tools and moulds", "B 8.2.3.2", "H", "IT C 8.2.3.2", "Suministrados por el importador."],
    ["consumidos8233", "Materiales consumidos", "Materials consumed", "B 8.2.3.3", "H", "IT C 8.2.3.3", "Suministrados por el importador."],
    ["ingenieria8234", "Ingeniería y diseño", "Engineering and design", "B 8.2.3.4", "H", "IT C 8.2.3.4", "Realizados fuera del Perú."],
    ["canones824", "Cánones y derechos de licencia", "Royalties and licence fees", "B 8.2.4", "H", "IT C 8.2.4", "Si 7.9 = Sí."],
    ["reversion825", "Producto de reventa que revierte al vendedor", "Subsequent proceeds", "B 8.2.5", "H", "IT C 8.2.5", "Si 7.10 = Sí."],
    ["gastosDestino832", "Gastos en destino hasta el lugar de importación", "Destination handling costs", "B 8.3.2", "H", "IT C 8.3.2", "Grupo D, si están distinguidos."],
    ["posteriores851", "Gastos posteriores a la importación", "Post-importation transport", "B 8.5.1", "H", "IT C 8.5.1", "Deducción si está incluida en el precio."],
    ["montaje852", "Montaje y asistencia técnica", "Assembly and technical assistance", "B 8.5.2", "H", "IT C 8.5.2", "Deducción si está incluida en el precio."],
    ["tributos853", "Derechos y tributos del Perú", "Peruvian duties and taxes", "B 8.5.3", "H", "IT C 5.9 (DDP)", "Deducción (DDP)."],
    ["intereses854", "Intereses", "Interest", "B 8.5.4", "H", "IT C 5.9", "Deducción por financiamiento."],
    ["otros855", "Otros gastos deducibles", "Other deductions", "B 8.5.5", "H", "IT C 8.3.1, 8.4 y 5.9", "Producto digital, diferencias de flete o seguro, etc."]
  ].forEach(function (x) {
    d("B7", VA + x[0], x[1] + " (USD)", x[2] + " (USD)", "numero", x[4], x[5], { obl: "no", solo: "importacion", docs: "DAM", cas: [x[3], ""], ayuda: x[6] });
  });
  d("B7", VA + "expOtrosDeducibles", "Otros gastos deducibles (exportación, USD)", "Export deductions (USD)", "numero", "H", "IT B 6.3", { obl: "no", solo: "exportacion", docs: "DAM", cas: ["", "S 6.3"], ayuda: "Para llevar a FOB una venta CFR o CIF." });
  d("B7", VA + "expAjustes", "Ajustes (exportación, USD)", "Export adjustments (USD)", "numero", "H", "IT B 6.4", { obl: "no", solo: "exportacion", docs: "DAM", cas: ["", "S 6.4"], ayuda: "Para llevar a FOB una venta EXW." });

  // --- B8 Tributos (solo importación). Las tasas por ítem deben coincidir dentro de una serie (E16).
  d("B8", I + "tasaAV", "Tasa ad valorem (%)", "Ad valorem rate (%)", "numero", "PV", "IT D 4.1; tasa: PV-11", { obl: "importación", solo: "importacion", docs: "DAM", cas: ["C 4.1", ""], ayuda: "Dato del usuario (PV-11)." });
  d("B8", I + "sobretasa", "Sobretasa (USD)", "Surcharge (USD)", "numero", "PV", "IT D 4.2; monto: PV-11", { obl: "no", solo: "importacion", docs: "DAM", cas: ["C 4.2", ""], ayuda: "Dato del usuario (PV-11)." });
  d("B8", I + "derechoEspecifico", "Derecho específico (USD)", "Specific duty (USD)", "numero", "PV", "IT D 4.3; monto: PV-11", { obl: "no", solo: "importacion", docs: "DAM", cas: ["C 4.3", ""], ayuda: "Dato del usuario (PV-11)." });
  d("B8", I + "isc", "ISC (USD)", "Excise tax (USD)", "numero", "PV", "IT D 4.4; monto: PV-11", { obl: "no", solo: "importacion", docs: "DAM", cas: ["C 4.4", ""], ayuda: "Dato del usuario (PV-11)." });
  d("B8", I + "antidumping", "Antidumping o compensatorio (USD)", "Anti-dumping duty (USD)", "numero", "PV", "IT D 4.7; PV-17", { obl: "no", solo: "importacion", docs: "DAM", cas: ["C 4.7", ""], ayuda: "Dato del usuario. En v1 queda fuera de la base del IGV (PV-17)." });
  d("B8", I + "tpi", "Código TPI", "Preferential treatment code", "texto", "PV", "IT A 7.23; códigos: PV-09", { obl: "con preferencia", solo: "importacion", docs: "DAM", cas: ["A 7.23", ""], ayuda: "Trato preferencial internacional (PV-09)." });
  d("B8", I + "tipoA720", "Código 'Tipo' (ISC o antidumping)", "'Type' code", "texto", "H", "IT A 7.20", { obl: "no", solo: "importacion", docs: "DAM", cas: ["A 7.20", ""], ayuda: "Solo si hay ISC diferenciado o antidumping." });
  d("B8", E + "tributos.tasaPercepcion", "Tasa de percepción del IGV (%)", "VAT perception rate (%)", "numero", "PV", "PV-01", { obl: "importación", solo: "importacion", docs: "DAM HR", cas: ["Fuera del Formato C", ""], ayuda: "Un solo valor por operación (decisiones D2 y D6). La tasa depende del importador y, en algunos casos, de la mercancía (bienes usados, exclusiones); no figura en el Formato C (PV-01)." });

  // Revisión interna: toda entrada declara marca y fuente.
  campos.forEach(function (c) {
    if (MARCAS.indexOf(c.marca) === -1 || !c.fuente) { throw new Error("Diccionario: marca o fuente inválida en " + c.ruta); }
  });

  // Busca la entrada de una ruta concreta (acepta índices de ítem: "especificos.items.2.nombre").
  var porRuta = {};
  campos.forEach(function (c) { porRuta[c.ruta] = c; });
  function buscar(ruta) {
    return porRuta[ruta.replace(/\.items\.\d+\./, ".items[].")] || null;
  }

  // Casilla DAM de un campo en la operación indicada ("importacion" o "exportacion").
  function casilla(campo, tipo) {
    return campo.casilla[tipo] || "";
  }

  // Compara el diccionario con el modelo: rutas del modelo sin entrada y entradas sin dato en el modelo.
  // Solo demuestra la correspondencia diccionario–modelo; no la cobertura del plan.
  function revisarContraModelo() {
    var base = Modelo.operacionVacia();
    base.especificos.items = [Modelo.itemVacio()];
    var rutasModelo = Modelo.hojas(base, "").map(function (h) { return h.ruta.replace(/\.items\.0\./, ".items[]."); })
      .filter(function (r) { return r.indexOf("marcas") !== 0; });
    var sinEntrada = rutasModelo.filter(function (r) { return !porRuta[r]; });
    var sinDato = campos.map(function (c) { return c.ruta; }).filter(function (r) { return rutasModelo.indexOf(r) === -1; });
    var porMarca = {};
    campos.forEach(function (c) { porMarca[c.marca] = (porMarca[c.marca] || 0) + 1; });
    return { total: campos.length, sinEntrada: sinEntrada, sinDato: sinDato, porMarca: porMarca };
  }

  return { grupos: GRUPOS, campos: campos, buscar: buscar, casilla: casilla, revisarContraModelo: revisarContraModelo };
})();
