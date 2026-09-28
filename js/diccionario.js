/* Diccionario de campos: ÚNICA lista de datos de la herramienta.
   De aquí salen el formulario (F5), la ayuda por campo y la tabla de trazabilidad (F6).
   Cada entrada:
     ruta     ruta del dato en la operación ("[]" = cada ítem)
     es / en  etiqueta bilingüe
     tipo     texto | numero | fecha | codigo (con lista de normativa.js) | sino | lista (varios valores)
     obl      "sí", "no" o la condición en que es obligatorio
     solo     "importacion" / "exportacion" si el campo solo aplica a una operación
     docs     documentos que lo usan: FC PL BL DAM SEG CO HR
     casilla  casilla de la DAM (A = Formato A ingreso, S = Formato A salida, B = Formato B, C = Formato C)
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
    ["B7", "B7. Valoración (USD)", "Valuation (USD)"]
  ].map(function (g) { return { id: g[0], es: g[1], en: g[2] }; });

  var campos = [];
  function d(grupo, ruta, es, en, tipo, extra) {
    var c = {
      grupo: grupo, ruta: ruta, es: es, en: en, tipo: tipo,
      lista: "", obl: "sí", solo: "", docs: "", casilla: "", ayuda: ""
    };
    Object.keys(extra || {}).forEach(function (k) { c[k] = extra[k]; });
    campos.push(c);
  }

  var G = "generales.", E = "especificos.", P = "generales.partes.", I = "especificos.items[].";

  // --- Identificación del archivo
  d("meta", "formato", "Formato del archivo", "File format", "texto", { docs: "", ayuda: "Marca interna que identifica el archivo como una operación de esta herramienta." });
  d("meta", "version", "Versión del archivo", "File version", "numero", { ayuda: "Versión del formato del archivo." });
  d("meta", "meta.referencia", "Referencia interna", "Internal reference", "texto", { docs: "FC PL BL DAM SEG CO HR", casilla: "Pie (sin casilla)", ayuda: "Código propio de la operación; aparece en el pie de todos los documentos." });
  d("meta", "meta.descripcion", "Descripción del caso", "Case description", "texto", { obl: "no", docs: "HR", ayuda: "Resumen breve del caso." });
  d("meta", "meta.ficticio", "Datos ficticios", "Fictitious data", "sino", { docs: "HR", ayuda: "Indica que los datos son ficticios (ejemplo de clase)." });

  // --- A1 Operación
  d("A1", G + "operacion.tipo", "Tipo de operación", "Operation type", "codigo", { lista: "tipoOperacion", docs: "DAM HR", casilla: "Cabecera: destinación 10 / 40", ayuda: "Importación (destinación 10) o exportación (destinación 40)." });
  d("A1", G + "operacion.modalidadCarga", "Modalidad de carga", "Load type", "codigo", { lista: "modalidadCarga", docs: "BL HR", ayuda: "En v1 solo contenedor completo (FCL)." });

  // --- A2 Partes
  d("A2", P + "vendedor.razonSocial", "Vendedor / exportador", "Seller / exporter", "texto", { docs: "FC PL BL DAM SEG CO HR", casilla: "B 3.1 / S 1.1", ayuda: "Quien vende y emite la factura. En el B/L suele ser el embarcador (shipper)." });
  d("A2", P + "vendedor.direccion", "Dirección del vendedor", "Seller address", "texto", { docs: "FC PL BL DAM CO", casilla: "B 3.3 / S 1.3", ayuda: "Dirección exacta: número, calle y distrito (IT C 3.3)." });
  d("A2", P + "vendedor.ciudad", "Ciudad del vendedor", "Seller city", "texto", { docs: "FC PL BL DAM CO", casilla: "B 3.4", ayuda: "Ciudad de la dirección del vendedor." });
  d("A2", P + "vendedor.pais", "País del vendedor", "Seller country", "codigo", { lista: "pais", docs: "FC PL BL DAM CO", casilla: "B 3.5", ayuda: "País de residencia del proveedor." });
  d("A2", P + "vendedor.idFiscal", "Identificación fiscal del vendedor", "Seller tax ID", "texto", { docs: "FC DAM", casilla: "S 1.2 (RUC del exportador)", ayuda: "En exportación, RUC de 11 dígitos del exportador." });
  d("A2", P + "vendedor.ubigeo", "UBIGEO del exportador", "Exporter UBIGEO", "codigo", { lista: "ubigeo", obl: "exportación", solo: "exportacion", docs: "DAM", casilla: "S 1.4", ayuda: "Código de ubicación geográfica del domicilio del exportador." });
  d("A2", P + "vendedor.telefono", "Teléfono del proveedor", "Supplier phone", "texto", { obl: "no", docs: "DAM", casilla: "B 3.6", ayuda: "Código de país, de ciudad y número." });
  d("A2", P + "vendedor.correo", "Correo del proveedor", "Supplier e-mail", "texto", { obl: "no", docs: "DAM", casilla: "B 3.9", ayuda: "Correo electrónico del proveedor, cuando corresponda." });
  d("A2", P + "vendedor.condicion", "Condición del proveedor", "Supplier condition", "codigo", { lista: "condicionProveedor", obl: "importación", solo: "importacion", docs: "DAM", casilla: "B 3.2", ayuda: "Papel del proveedor en la venta: fabricante, distribuidor, comerciante u otro." });

  d("A2", P + "comprador.razonSocial", "Comprador / importador", "Buyer / importer", "texto", { docs: "FC PL BL DAM SEG CO HR", casilla: "A 1.1, B 1.1 / exportación: sin casilla", ayuda: "Quien compra. En importación es el importador ante SUNAT." });
  d("A2", P + "comprador.direccion", "Dirección del comprador", "Buyer address", "texto", { docs: "FC PL BL DAM CO", casilla: "A 1.3", ayuda: "Domicilio del importador o del comprador extranjero." });
  d("A2", P + "comprador.ciudad", "Ciudad del comprador", "Buyer city", "texto", { docs: "FC PL BL CO", ayuda: "Ciudad del comprador." });
  d("A2", P + "comprador.pais", "País del comprador", "Buyer country", "codigo", { lista: "pais", docs: "FC PL BL CO", ayuda: "País del comprador." });
  d("A2", P + "comprador.idFiscal", "Identificación fiscal del comprador", "Buyer tax ID", "texto", { docs: "FC DAM", casilla: "A 1.2, B 1.2 (RUC, código 4)", ayuda: "En importación, RUC de 11 dígitos; el código de documento 4 = RUC se deriva (IT A 1.2)." });
  d("A2", P + "comprador.ubigeo", "UBIGEO del importador", "Importer UBIGEO", "codigo", { lista: "ubigeo", obl: "importación", solo: "importacion", docs: "DAM", casilla: "A 1.4", ayuda: "Código de ubicación geográfica del domicilio del importador." });

  d("A2", P + "consignatario.tipo", "Consignatario", "Consignee", "texto", { docs: "FC BL", casilla: "Sin casilla", ayuda: "'comprador', 'otro' o 'a_la_orden'. Es quien recibe la carga según el B/L." });
  d("A2", P + "consignatario.razonSocial", "Consignatario: nombre", "Consignee name", "texto", { obl: "si no es el comprador", docs: "FC BL", ayuda: "Solo si el consignatario no es el comprador." });
  d("A2", P + "consignatario.direccion", "Consignatario: dirección", "Consignee address", "texto", { obl: "si no es el comprador", docs: "FC BL", ayuda: "Solo si el consignatario no es el comprador." });
  d("A2", P + "notify.tipo", "Parte a notificar", "Notify party", "texto", { docs: "BL", casilla: "Sin casilla", ayuda: "'consignatario' u 'otro'. Recibe el aviso de llegada." });
  d("A2", P + "notify.razonSocial", "Notify: nombre", "Notify name", "texto", { obl: "si no es el consignatario", docs: "BL", ayuda: "Solo si el notify no es el consignatario." });
  d("A2", P + "notify.direccion", "Notify: dirección", "Notify address", "texto", { obl: "si no es el consignatario", docs: "BL", ayuda: "Solo si el notify no es el consignatario." });
  d("A2", P + "naviera.nombre", "Naviera", "Shipping line", "texto", { docs: "BL HR", casilla: "Sin casilla (A 3.1 es el agente marítimo)", ayuda: "Empresa que transporta y emite el B/L." });
  d("A2", P + "agenteMaritimo.razonSocial", "Agente marítimo", "Shipping agent", "texto", { docs: "DAM", casilla: "A 3.1 / S 3.1", ayuda: "Representa a la naviera en el Perú; en vía marítima es la 'empresa de transporte' de la DAM (IT A 3.1)." });
  d("A2", P + "agenteMaritimo.ruc", "Agente marítimo: RUC o código", "Shipping agent tax ID / code", "texto", { docs: "DAM", casilla: "A 3.1 / S 3.1", ayuda: "RUC; en la Aduana Marítima del Callao podría ir el código de SUNAT (PV-28)." });
  d("A2", P + "agenteAduana.razonSocial", "Agente de aduana (declarante)", "Customs broker", "texto", { docs: "DAM", casilla: "A 8 / S 8", ayuda: "Despachador que formula la DAM." });
  d("A2", P + "agenteAduana.ruc", "Agente de aduana: RUC o código", "Customs broker tax ID / code", "texto", { docs: "DAM", casilla: "A 8 / S 8", ayuda: "RUC o código del despachador (PV-28)." });
  d("A2", P + "depositoTemporal.razonSocial", "Depósito temporal", "Temporary warehouse", "texto", { docs: "DAM", casilla: "A 4.1 / S 4.1", ayuda: "Almacén donde está o estará la mercancía." });
  d("A2", P + "depositoTemporal.ruc", "Depósito temporal: RUC o código", "Warehouse tax ID / code", "texto", { docs: "DAM", casilla: "A 4.1 / S 4.1", ayuda: "RUC o código del depósito (PV-28)." });
  d("A2", P + "entidadFinanciera.nombre", "Entidad financiera", "Bank", "texto", { docs: "DAM", casilla: "A 5.1 / S 5.1", ayuda: "Banco que intervino en el pago." });
  d("A2", P + "entidadFinanciera.codigo", "Entidad financiera: código", "Bank code", "texto", { obl: "no", docs: "DAM", casilla: "A 5.1 / S 5.1", ayuda: "Código de SUNAT de la entidad (PV-09)." });
  d("A2", P + "aseguradora.razonSocial", "Aseguradora", "Insurer", "texto", { obl: "si hay seguro", docs: "SEG", ayuda: "Compañía que emite la póliza." });
  d("A2", P + "aseguradora.direccion", "Aseguradora: dirección", "Insurer address", "texto", { obl: "no", docs: "SEG", ayuda: "Dirección de la aseguradora." });
  d("A2", P + "productor.razonSocial", "Productor", "Producer", "texto", { obl: "no", docs: "CO", ayuda: "Solo si el productor no es el exportador." });
  d("A2", P + "productor.direccion", "Productor: dirección", "Producer address", "texto", { obl: "no", docs: "CO", ayuda: "Solo si el productor no es el exportador." });
  d("A2", P + "entidadCO.nombre", "Entidad emisora del CO", "CO issuing body", "texto", { obl: "si hay CO", docs: "CO", ayuda: "Entidad que certifica el origen (PV-12)." });

  // --- A3 Ruta
  d("A3", G + "ruta.puertoEmbarque.nombre", "Puerto de embarque", "Port of loading", "texto", { docs: "FC PL BL DAM SEG CO HR", casilla: "A 7.6 / S 7.6", ayuda: "Puerto donde la carga sube al buque." });
  d("A3", G + "ruta.puertoEmbarque.locode", "Puerto de embarque: código", "Port of loading code", "codigo", { lista: "puerto", docs: "BL DAM HR", casilla: "A 7.6 / S 7.6", ayuda: "UN/LOCODE de 5 letras; las 2 primeras son el país." });
  d("A3", G + "ruta.puertoDescarga.nombre", "Puerto de descarga", "Port of discharge", "texto", { docs: "FC PL BL DAM SEG CO HR", casilla: "Exportación: con S 7.27", ayuda: "Puerto donde la carga baja del buque." });
  d("A3", G + "ruta.puertoDescarga.locode", "Puerto de descarga: código", "Port of discharge code", "codigo", { lista: "puerto", docs: "BL DAM HR", ayuda: "UN/LOCODE de 5 letras." });
  d("A3", G + "ruta.paisAdquisicion", "País de adquisición", "Country of acquisition", "codigo", { lista: "pais", obl: "importación", solo: "importacion", docs: "DAM", casilla: "A 7.27", ayuda: "País donde se compró la mercancía; por defecto, el del proveedor." });
  d("A3", G + "ruta.lugarRecepcion", "Lugar de recepción", "Place of receipt", "texto", { obl: "no", docs: "BL", ayuda: "Solo con transporte combinado." });
  d("A3", G + "ruta.lugarEntrega", "Lugar de entrega", "Place of delivery", "texto", { obl: "no", docs: "BL", ayuda: "Solo con transporte combinado." });

  // --- A4 Condiciones comerciales
  d("A4", G + "comercial.incoterm", "Incoterm", "Incoterm", "codigo", { lista: "incoterm", docs: "FC BL DAM SEG HR", casilla: "B 5.4 / S 6.1–6.5", ayuda: "Regla Incoterms® 2020 pactada: define costos, riesgos y documentos." });
  d("A4", G + "comercial.lugarConvenido", "Lugar convenido", "Named place", "texto", { docs: "FC DAM HR", casilla: "B 5.4", ayuda: "Lugar que acompaña al Incoterm; debe cuadrar con los puertos (E03)." });
  d("A4", G + "comercial.moneda", "Moneda", "Currency", "codigo", { lista: "moneda", docs: "FC DAM SEG HR", casilla: "A 7.29, B 5.5", ayuda: "Moneda del contrato (USD en v1)." });
  d("A4", G + "comercial.facturaNumero", "N° de factura", "Invoice No.", "texto", { docs: "FC PL DAM SEG CO HR", casilla: "A 7.36, B 5.2 / S 7.36", ayuda: "Número de la factura comercial." });
  d("A4", G + "comercial.facturaFecha", "Fecha de factura", "Invoice date", "fecha", { docs: "FC PL DAM SEG CO HR", casilla: "A 7.36, B 5.3 / S 7.36", ayuda: "Fecha de emisión de la factura." });
  d("A4", G + "comercial.modalidadPago", "Modalidad de pago", "Payment terms code", "codigo", { lista: "modalidadPago", docs: "DAM", casilla: "A 5.2 / S 5.2", ayuda: "Cuándo se paga: contado, crédito, anticipado, etc." });
  d("A4", G + "comercial.condicionesPago", "Condiciones de pago (texto)", "Payment terms", "texto", { docs: "FC", ayuda: "Cómo se paga, en palabras, tal como va en la factura." });
  d("A4", G + "comercial.medioPago", "Medio de pago", "Means of payment", "codigo", { lista: "medioPago", obl: "importación", solo: "importacion", docs: "DAM", casilla: "B rubro 4 (otros datos a)", ayuda: "Instrumento de pago; si el FOB supera US$ 500 debe pasar por el sistema financiero (A16)." });
  d("A4", G + "comercial.pagoDiferido.porcentaje", "Pago diferido: %", "Deferred payment %", "numero", { obl: "importación a crédito", solo: "importacion", docs: "DAM", casilla: "B rubro 4 (otros datos h)", ayuda: "Porcentaje del valor que se paga a crédito." });
  d("A4", G + "comercial.pagoDiferido.plazoDias", "Pago diferido: plazo (días)", "Deferred payment term (days)", "numero", { obl: "importación a crédito", solo: "importacion", docs: "DAM", casilla: "B rubro 4 (otros datos i)", ayuda: "Días calendario desde el evento asociado." });
  d("A4", G + "comercial.pagoDiferido.evento", "Pago diferido: evento", "Deferred payment event", "codigo", { lista: "eventoPagoDiferido", obl: "importación a crédito", solo: "importacion", docs: "DAM", casilla: "B rubro 4 (otros datos j)", ayuda: "Desde cuándo se cuenta el plazo." });
  d("A4", G + "comercial.pagoDiferido.fecha", "Pago diferido: fecha del pago", "Deferred payment date", "fecha", { obl: "no", solo: "importacion", docs: "DAM", casilla: "B rubro 4 (otros datos k)", ayuda: "Fecha en que se hizo efectivo el pago." });
  d("A4", G + "comercial.contrato", "N° de contrato u orden de compra", "Contract / PO No.", "texto", { obl: "no", docs: "FC", ayuda: "Referencia comercial opcional." });

  // --- A5 Aduana
  d("A5", G + "aduana.aduana", "Aduana de despacho", "Customs office", "codigo", { lista: "aduana", docs: "DAM", casilla: "Cabecera; S 3.7", ayuda: "Intendencia de aduana del despacho." });
  d("A5", G + "aduana.modalidadDespacho", "Modalidad de despacho", "Clearance mode", "codigo", { lista: "modalidadDespacho", obl: "importación", solo: "importacion", docs: "DAM", casilla: "Cabecera", ayuda: "Anticipado, excepcional, urgente o socorro. En exportación no aplica." });
  d("A5", G + "aduana.tipoDespacho", "Tipo de despacho", "Clearance type", "codigo", { lista: "tipoDespachoExportacion", obl: "exportación", docs: "DAM", casilla: "Cabecera", ayuda: "En exportación, 00 normal. En importación para el consumo el IT no trae lista (queda vacío)." });
  d("A5", G + "aduana.numeroOrden", "N° de orden", "Declarant order No.", "texto", { docs: "DAM", casilla: "Cabecera (Nº ORDEN)", ayuda: "Año + número de 6 caracteres que asigna el declarante." });
  d("A5", G + "aduana.fechaFormulacion", "Fecha de formulación", "Declaration date", "fecha", { docs: "DAM", casilla: "A 8 / S 8", ayuda: "Fecha en que el declarante formula la DAM." });
  d("A5", G + "aduana.tipoCambio", "Tipo de cambio (S/ por USD)", "Exchange rate (PEN per USD)", "numero", { obl: "importación", solo: "importacion", docs: "DAM HR", casilla: "C rubro 5", ayuda: "Tipo venta de la fecha de pago (IT D rubro 5); fuente: PV-07." });
  d("A5", G + "aduana.tipoCambioFecha", "Tipo de cambio: fecha", "Exchange rate date", "fecha", { obl: "no", solo: "importacion", docs: "DAM", ayuda: "Fecha del tipo de cambio." });
  d("A5", G + "aduana.tipoCambioFuente", "Tipo de cambio: fuente", "Exchange rate source", "texto", { obl: "no", solo: "importacion", docs: "DAM", ayuda: "De dónde se tomó el tipo de cambio." });
  d("A5", G + "aduana.regionDestino", "Región de destino", "Destination region", "codigo", { lista: "regionDestino", obl: "importación", solo: "importacion", docs: "DAM", casilla: "A 7.37 l", ayuda: "Departamento donde se consumirá la mercancía." });

  // --- A6 Declaración del valor (solo importación)
  var V = G + "valor.";
  d("A6", V + "nivelComercial", "Nivel comercial", "Trade level", "codigo", { lista: "nivelComercial", obl: "importación", solo: "importacion", docs: "DAM", casilla: "B 1.3", ayuda: "Posición del importador en la cadena de venta." });
  d("A6", V + "naturaleza", "Naturaleza de la transacción", "Nature of transaction", "codigo", { lista: "naturaleza", obl: "importación", solo: "importacion", docs: "DAM", casilla: "B 4.1", ayuda: "Tipo de operación comercial (11 = compraventa a precio firme)." });
  d("A6", V + "formaEnvio", "Forma de envío", "Shipment form", "texto", { obl: "importación", solo: "importacion", docs: "DAM", casilla: "B 4.2", ayuda: "1/1 si llega en un solo embarque." });
  d("A6", V + "tipoValor", "Tipo de valor", "Value type", "codigo", { lista: "tipoValor", obl: "importación", solo: "importacion", docs: "DAM", casilla: "B 5.6", ayuda: "Definitivo o provisional." });
  d("A6", V + "intermediario.hubo", "¿Hubo intermediario?", "Intermediary?", "codigo", { lista: "siNo", obl: "importación", solo: "importacion", docs: "DAM", casilla: "B 6.1", ayuda: "Agente, comisionista u otro que participó en la venta." });
  ["nombre", "direccion", "ciudad", "pais", "tipo", "contacto"].forEach(function (k, i) {
    var et = { nombre: ["Intermediario: nombre", "Intermediary name"], direccion: ["Intermediario: dirección", "Intermediary address"],
      ciudad: ["Intermediario: ciudad", "Intermediary city"], pais: ["Intermediario: país", "Intermediary country"],
      tipo: ["Intermediario: tipo", "Intermediary type"], contacto: ["Intermediario: correo o web", "Intermediary e-mail / web"] }[k];
    d("A6", V + "intermediario." + k, et[0], et[1], "texto", { obl: "si hubo intermediario", solo: "importacion", docs: "DAM", casilla: "B 6." + (i + 2), ayuda: "Solo si 6.1 = Sí." });
  });
  NORMATIVA.preguntasRubro7.forEach(function (p) {
    d("A6", V + "rubro7.p" + p.numero.replace(".", "_"), "Pregunta " + p.numero, "Question " + p.numero, "codigo", {
      lista: "siNo", obl: p.condicion ? p.condicion.toLowerCase() : "importación", solo: "importacion",
      docs: "DAM", casilla: "B " + p.numero, ayuda: p.texto
    });
  });

  // --- B1–B2 Mercancía y embalaje (por ítem)
  d("B1", I + "nombre", "Nombre del producto", "Product name", "texto", { docs: "FC PL BL DAM SEG CO", casilla: "B 5.12", ayuda: "Nombre común de la mercancía." });
  d("B1", I + "descripcion", "Descripción", "Description", "texto", { docs: "FC PL DAM CO", casilla: "A 7.35, B 5.19 / S 7.35", ayuda: "Denominación, presentación, material, uso y otras características (IT A 7.35)." });
  d("B1", I + "marca", "Marca", "Brand", "texto", { docs: "FC PL DAM", casilla: "B 5.13", ayuda: "Marca comercial." });
  d("B1", I + "modelo", "Modelo", "Model", "texto", { docs: "FC PL DAM", casilla: "B 5.14", ayuda: "Código o nombre del modelo." });
  d("B1", I + "subpartida", "Subpartida nacional", "HS code (10 digits)", "texto", { docs: "FC BL DAM CO", casilla: "A 7.19 / S 7.19", ayuda: "10 dígitos; los 6 primeros son del Sistema Armonizado." });
  d("B1", I + "subpartidaVerificada", "Subpartida verificada", "HS code verified", "sino", { docs: "HR", ayuda: "Marca si la subpartida se comprobó en el arancel; si no, sale POR VERIFICAR (A08)." });
  d("B1", I + "paisOrigen", "País de origen", "Country of origin", "codigo", { lista: "pais", docs: "FC DAM CO", casilla: "A 7.26, B 5.7", ayuda: "País donde se fabricó la mercancía." });
  d("B1", I + "ubigeoOrigen", "UBIGEO de fabricación", "Place of manufacture (UBIGEO)", "codigo", { lista: "ubigeo", obl: "exportación", solo: "exportacion", docs: "DAM", casilla: "S 7.26", ayuda: "En exportación, la casilla de origen lleva el UBIGEO del lugar de fabricación (IT B 7.26)." });
  d("B1", I + "estado", "Estado", "Condition", "codigo", { lista: "estado", docs: "DAM", casilla: "B 5.16 / S 7.20", ayuda: "Nuevo, usado, etc." });
  d("B1", I + "cantidad", "Cantidad", "Quantity", "numero", { docs: "FC PL DAM CO", casilla: "A 7.10, B 5.11", ayuda: "Cantidad en unidades comerciales." });
  d("B1", I + "unidadComercial", "Unidad comercial", "Commercial unit", "codigo", { lista: "unidadMedida", docs: "FC PL DAM", casilla: "A 7.10, B 5.11", ayuda: "Unidad en que se vende." });
  d("B1", I + "unidadFisica", "Unidad física", "Physical unit", "codigo", { lista: "unidadMedida", docs: "DAM", casilla: "A 7.16 / S 7.16", ayuda: "Unidad que pide la subpartida en el arancel." });
  d("B1", I + "precioUnitario", "Precio unitario (USD)", "Unit price (USD)", "numero", { docs: "FC DAM HR", casilla: "B 8.1.1 (total)", ayuda: "Precio en el Incoterm pactado." });
  d("B1", I + "series", "Números de serie", "Serial numbers", "lista", { obl: "celulares (E17)", solo: "importacion", docs: "FC DAM", casilla: "A 7.35 (RS129)", ayuda: "Uno por equipo; obligatorio en 8517.13.00.00 y 8517.14.00.00." });
  d("B1", I + "imeis", "IMEI", "IMEI", "lista", { obl: "celulares (E17)", solo: "importacion", docs: "FC DAM", casilla: "A 7.35 (RS129)", ayuda: "Uno o más por equipo; obligatorio en 8517.13.00.00 y 8517.14.00.00." });
  d("B1", I + "claseBulto", "Clase de bulto", "Package type", "codigo", { lista: "claseBulto", docs: "FC PL BL DAM SEG CO HR", casilla: "A 7.13 / S 7.13", ayuda: "Tipo de embalaje (caja, pallet, saco…)." });
  d("B1", I + "unidadesPorBulto", "Unidades por bulto", "Units per package", "numero", { docs: "PL", ayuda: "Cuántas unidades van en cada bulto." });
  d("B1", I + "pesoNetoBulto", "Peso neto por bulto (kg)", "Net weight per package (kg)", "numero", { docs: "FC PL DAM HR", casilla: "A 7.14 (total de la serie)", ayuda: "Peso de la mercancía sin embalaje." });
  d("B1", I + "pesoBrutoBulto", "Peso bruto por bulto (kg)", "Gross weight per package (kg)", "numero", { docs: "FC PL BL DAM CO HR", casilla: "A 7.15 (total de la serie)", ayuda: "Peso con embalaje." });
  d("B1", I + "largoCm", "Largo del bulto (cm)", "Package length (cm)", "numero", { docs: "PL BL HR", casilla: "Sin casilla", ayuda: "Sirve para el volumen." });
  d("B1", I + "anchoCm", "Ancho del bulto (cm)", "Package width (cm)", "numero", { docs: "PL BL HR", casilla: "Sin casilla", ayuda: "Sirve para el volumen." });
  d("B1", I + "altoCm", "Alto del bulto (cm)", "Package height (cm)", "numero", { docs: "PL BL HR", casilla: "Sin casilla", ayuda: "Sirve para el volumen." });
  d("B1", I + "tasaAV", "Tasa ad valorem (%)", "Ad valorem rate (%)", "numero", { obl: "importación", solo: "importacion", docs: "DAM", casilla: "C 4.1", ayuda: "Dato del usuario (PV-11)." });
  d("B1", I + "sobretasa", "Sobretasa (USD)", "Surcharge (USD)", "numero", { obl: "no", solo: "importacion", docs: "DAM", casilla: "C 4.2", ayuda: "Dato del usuario (PV-11)." });
  d("B1", I + "derechoEspecifico", "Derecho específico (USD)", "Specific duty (USD)", "numero", { obl: "no", solo: "importacion", docs: "DAM", casilla: "C 4.3", ayuda: "Dato del usuario (PV-11)." });
  d("B1", I + "isc", "ISC (USD)", "Excise tax (USD)", "numero", { obl: "no", solo: "importacion", docs: "DAM", casilla: "C 4.4", ayuda: "Dato del usuario (PV-11)." });
  d("B1", I + "antidumping", "Antidumping o compensatorio (USD)", "Anti-dumping duty (USD)", "numero", { obl: "no", solo: "importacion", docs: "DAM", casilla: "C 4.7", ayuda: "Dato del usuario (PV-17)." });
  d("B1", I + "tpi", "Código TPI", "Preferential treatment code", "texto", { obl: "con preferencia", solo: "importacion", docs: "DAM", casilla: "A 7.23", ayuda: "Trato preferencial internacional (PV-09)." });
  d("B1", I + "tipoA720", "Código 'Tipo' (ISC o antidumping)", "'Type' code", "texto", { obl: "no", solo: "importacion", docs: "DAM", casilla: "A 7.20", ayuda: "Solo si hay ISC diferenciado o antidumping." });
  d("B1", I + "tasaPercepcion", "Tasa de percepción del IGV (%)", "VAT perception rate (%)", "numero", { obl: "importación", solo: "importacion", docs: "DAM HR", casilla: "Fuera del Formato C", ayuda: "Dato del usuario (PV-01)." });
  d("B1", E + "marcasEmbarque", "Marcas de embarque", "Shipping marks", "texto", { docs: "PL BL SEG CO", casilla: "A 9 / S 9", ayuda: "Texto pintado en los bultos para identificarlos." });

  // --- B3 Contenedor
  var C = E + "contenedor.";
  d("B3", C + "tipo", "Tipo de contenedor", "Container type", "codigo", { lista: "tipoContenedor", docs: "PL BL HR", ayuda: "Tamaño y tipo ISO." });
  d("B3", C + "numero", "N° de contenedor", "Container No.", "texto", { docs: "PL BL DAM SEG HR", casilla: "A 9 / S 9", ayuda: "4 letras + 6 dígitos + dígito de control ISO 6346." });
  d("B3", C + "precinto", "Precinto", "Seal No.", "texto", { docs: "PL BL DAM SEG HR", casilla: "A 9 / S 9", ayuda: "Número del sello de seguridad." });
  d("B3", C + "tara", "Tara (kg)", "Tare (kg)", "numero", { docs: "BL HR", casilla: "Sin casilla", ayuda: "Peso del contenedor vacío (placa del contenedor)." });
  d("B3", C + "estibaTrincaje", "Estiba y trincaje (kg)", "Dunnage and lashing (kg)", "numero", { obl: "no", docs: "BL", casilla: "Sin casilla", ayuda: "Peso de materiales de sujeción, si los hay." });
  d("B3", C + "vgmMetodo", "Método VGM", "VGM method", "codigo", { lista: "metodoVgm", docs: "BL", casilla: "Sin casilla", ayuda: "Cómo se obtuvo la masa bruta verificada." });
  d("B3", C + "vgmResponsable", "VGM: responsable", "VGM signatory", "texto", { docs: "BL", ayuda: "Quien firma la declaración VGM (el embarcador)." });
  d("B3", C + "vgmFecha", "VGM: fecha", "VGM date", "fecha", { docs: "BL", ayuda: "Fecha de la declaración VGM." });

  // --- B4 Transporte
  var T = E + "transporte.";
  d("B4", T + "nave", "Nave", "Vessel", "texto", { docs: "BL SEG CO HR", casilla: "Sin casilla en importación para el consumo", ayuda: "Nombre del buque." });
  d("B4", T + "viaje", "Viaje", "Voyage", "texto", { docs: "BL SEG CO HR", ayuda: "Número de viaje que asigna la naviera." });
  d("B4", T + "booking", "N° de booking", "Booking No.", "texto", { docs: "BL", ayuda: "Reserva de espacio con la naviera." });
  d("B4", T + "blNumero", "N° de B/L", "B/L No.", "texto", { obl: "para la DAM", docs: "BL DAM SEG", casilla: "A 7.8 / S 7.8", ayuda: "Número del conocimiento de embarque." });
  d("B4", T + "blTipo", "Tipo de B/L", "B/L type", "codigo", { lista: "tipoBl", docs: "BL", ayuda: "Nominativo o a la orden." });
  d("B4", T + "blOriginales", "N° de originales", "No. of originals", "numero", { docs: "BL", ayuda: "Juego de originales del B/L (usual: 3)." });
  d("B4", T + "blLugarEmision", "Lugar de emisión del B/L", "Place of issue", "texto", { docs: "BL", ayuda: "Ciudad donde se emite el B/L." });
  d("B4", T + "blFechaEmision", "Fecha de emisión del B/L", "Date of issue", "fecha", { docs: "BL", ayuda: "Fecha en que se emite el B/L." });
  d("B4", T + "fechaShippedOnBoard", "Fecha 'shipped on board'", "Shipped on board date", "fecha", { docs: "BL", ayuda: "Fecha en que la carga quedó a bordo." });
  d("B4", T + "clausulaSlac", "Cláusula SLAC", "Shipper's load, stow and count", "sino", { obl: "no", docs: "BL", ayuda: "El embarcador cargó y contó; la naviera no lo verificó." });
  d("B4", T + "clausulaStc", "Cláusula STC", "Said to contain", "sino", { obl: "no", docs: "BL", ayuda: "La naviera describe la carga según lo declarado." });
  d("B4", T + "shipper", "Embarcador si no es el vendedor", "Shipper (if not seller)", "texto", { obl: "no", docs: "BL", ayuda: "Vacío = el vendedor es el embarcador." });
  d("B4", T + "manifiesto", "N° de manifiesto", "Manifest No.", "texto", { obl: "para la DAM", docs: "DAM", casilla: "A 3.2 / S 3.2", ayuda: "Aduana – año – número (IT A 3.2)." });
  d("B4", T + "fechaEmbarque", "Fecha de embarque", "Shipment date", "fecha", { docs: "BL DAM SEG CO HR", casilla: "A 7.7", ayuda: "Fecha en que la carga se embarcó." });
  d("B4", T + "fechaTerminoEmbarque", "Fecha de término de embarque", "End of loading date", "fecha", { obl: "exportación", solo: "exportacion", docs: "DAM", casilla: "S 3.4", ayuda: "Fecha en que se embarcó el último bulto (IT B 3.4)." });
  d("B4", T + "eta", "Llegada estimada (ETA)", "Estimated arrival (ETA)", "fecha", { docs: "HR", ayuda: "Fecha estimada de llegada al puerto de descarga." });
  d("B4", T + "fechaTerminoDescarga", "Fecha de término de descarga", "End of discharge date", "fecha", { obl: "importación (salvo anticipado: PV-26)", solo: "importacion", docs: "DAM", casilla: "A 3.4", ayuda: "Fecha en que culmina la descarga." });

  // --- B5 Seguro
  var S = E + "seguro.";
  d("B5", S + "hay", "¿Hay seguro?", "Insured?", "sino", { docs: "SEG DAM HR", casilla: "A 7.32 (tipo de seguro)", ayuda: "Obligatorio en CIF y CIP." });
  d("B5", S + "tipoPoliza", "Tipo de póliza", "Policy type", "codigo", { lista: "tipoPoliza", obl: "si hay seguro", docs: "SEG DAM", casilla: "A 7.32 (2 individual / 3 flotante)", ayuda: "Póliza individual o flotante." });
  d("B5", S + "poliza", "N° de póliza", "Policy No.", "texto", { obl: "si hay seguro", docs: "SEG", ayuda: "Número de la póliza." });
  d("B5", S + "certificado", "N° de certificado", "Certificate No.", "texto", { obl: "si hay seguro", docs: "SEG", ayuda: "Número del certificado de seguro del embarque." });
  d("B5", S + "fechaEmision", "Fecha de emisión", "Date of issue", "fecha", { obl: "si hay seguro", docs: "SEG", ayuda: "No debería ser posterior al embarque (A11)." });
  d("B5", S + "clausulas", "Cláusulas ICC", "Institute Cargo Clauses", "codigo", { lista: "clausulasICC", obl: "si hay seguro", docs: "SEG HR", ayuda: "Mínimo (C) en CIF y (A) en CIP." });
  d("B5", S + "guerra", "Cláusula de guerra", "War clauses", "sino", { obl: "no", docs: "SEG", ayuda: "Cobertura adicional de guerra." });
  d("B5", S + "huelgas", "Cláusula de huelgas", "Strikes clauses", "sino", { obl: "no", docs: "SEG", ayuda: "Cobertura adicional de huelgas." });
  d("B5", S + "coberturaPct", "Cobertura (%)", "Cover (%)", "numero", { obl: "si hay seguro", docs: "SEG HR", ayuda: "Mínimo 110 % en CIF y CIP." });
  d("B5", S + "tasaPrimaPct", "Tasa de prima (%)", "Premium rate (%)", "numero", { obl: "si hay seguro", docs: "FC DAM HR", ayuda: "Prima = suma asegurada × tasa." });
  d("B5", S + "lugarPagoSiniestros", "Lugar de pago de siniestros", "Claims payable at", "texto", { obl: "si hay seguro", docs: "SEG", ayuda: "Dónde y en qué moneda se pagan los siniestros." });
  d("B5", S + "agenteReclamos", "Agente de reclamos", "Claims / survey agent", "texto", { obl: "no", docs: "SEG", ayuda: "A quién avisar en destino en caso de daño." });
  d("B5", S + "pctTablaSunat", "% tabla de seguros SUNAT", "SUNAT insurance table %", "numero", { obl: "importación sin seguro", solo: "importacion", docs: "DAM", casilla: "A 7.32", ayuda: "Porcentaje de la tabla de SUNAT cuando no hay póliza (PV-06)." });

  // --- B6 Origen
  var O = E + "origen.";
  d("B6", O + "solicitaPreferencia", "¿Se solicita trato preferencial?", "Preference requested?", "sino", { docs: "CO DAM", ayuda: "Si es Sí, se genera el certificado de origen." });
  d("B6", O + "acuerdo", "Acuerdo comercial", "Trade agreement", "texto", { obl: "si hay CO", docs: "CO", ayuda: "Acuerdo que da la preferencia." });
  d("B6", O + "criterio", "Criterio de origen", "Origin criterion", "texto", { obl: "si hay CO", docs: "CO", ayuda: "Según el acuerdo (PV-12)." });
  d("B6", O + "certificadoNumero", "N° de certificado de origen", "Certificate of origin No.", "texto", { obl: "si hay CO", docs: "CO DAM", casilla: "A 7.9 (en exportación no se llena)", ayuda: "Número del certificado." });
  d("B6", O + "certificadoFecha", "Fecha del certificado de origen", "Certificate of origin date", "fecha", { obl: "si hay CO", docs: "CO DAM", casilla: "A 7.9", ayuda: "Fecha de emisión del certificado." });

  // --- B7 Valoración
  var VA = E + "valoracion.";
  d("B7", VA + "flete", "Flete internacional (USD)", "Ocean freight (USD)", "numero", { obl: "C/D e importación", docs: "FC BL DAM HR", casilla: "B 8.3.1 → A 6.2, 7.31", ayuda: "Del puerto de embarque al de destino." });
  [
    ["gastosExw815", "Gastos hasta el embarque (EXW)", "Pre-carriage costs (EXW)", "B 8.1.5", "Solo en EXW; nombre exacto de la casilla: PV."],
    ["otros816", "Otros gastos no facturados", "Other costs not invoiced", "B 8.1.6", "Ventas sucesivas, diferencias de flete u otros gastos que integran el valor."],
    ["comisiones821", "Comisiones y corretajes", "Commissions and brokerage", "B 8.2.1", "Excepto comisiones de compra."],
    ["envases822", "Envases y embalajes", "Containers and packing", "B 8.2.2", "Si no están en el precio."],
    ["materiales8231", "Materiales incorporados", "Materials incorporated", "B 8.2.3.1", "Suministrados por el importador."],
    ["herramientas8232", "Herramientas y moldes", "Tools and moulds", "B 8.2.3.2", "Suministrados por el importador."],
    ["consumidos8233", "Materiales consumidos", "Materials consumed", "B 8.2.3.3", "Suministrados por el importador."],
    ["ingenieria8234", "Ingeniería y diseño", "Engineering and design", "B 8.2.3.4", "Realizados fuera del Perú."],
    ["canones824", "Cánones y derechos de licencia", "Royalties and licence fees", "B 8.2.4", "Si 7.9 = Sí."],
    ["reversion825", "Producto de reventa que revierte al vendedor", "Subsequent proceeds", "B 8.2.5", "Si 7.10 = Sí."],
    ["gastosDestino832", "Gastos en destino hasta el lugar de importación", "Destination handling costs", "B 8.3.2", "Grupo D, si están distinguidos."],
    ["posteriores851", "Gastos posteriores a la importación", "Post-importation transport", "B 8.5.1", "Deducción si está incluida en el precio."],
    ["montaje852", "Montaje y asistencia técnica", "Assembly and technical assistance", "B 8.5.2", "Deducción si está incluida en el precio."],
    ["tributos853", "Derechos y tributos del Perú", "Peruvian duties and taxes", "B 8.5.3", "Deducción (DDP)."],
    ["intereses854", "Intereses", "Interest", "B 8.5.4", "Deducción por financiamiento."],
    ["otros855", "Otros gastos deducibles", "Other deductions", "B 8.5.5", "Producto digital, diferencias de flete o seguro, etc."]
  ].forEach(function (x) {
    d("B7", VA + x[0], x[1] + " (USD)", x[2] + " (USD)", "numero", { obl: "no", solo: "importacion", docs: "DAM", casilla: x[3], ayuda: x[4] });
  });
  d("B7", VA + "expOtrosDeducibles", "Otros gastos deducibles (exportación, USD)", "Export deductions (USD)", "numero", { obl: "no", solo: "exportacion", docs: "DAM", casilla: "S 6.3", ayuda: "Para llevar a FOB una venta CFR o CIF." });
  d("B7", VA + "expAjustes", "Ajustes (exportación, USD)", "Export adjustments (USD)", "numero", { obl: "no", solo: "exportacion", docs: "DAM", casilla: "S 6.4", ayuda: "Para llevar a FOB una venta EXW." });

  // Busca la entrada de una ruta concreta (acepta índices de ítem: "especificos.items.2.nombre").
  var porRuta = {};
  campos.forEach(function (c) { porRuta[c.ruta] = c; });
  function buscar(ruta) {
    return porRuta[ruta.replace(/\.items\.\d+\./, ".items[].")] || null;
  }

  // Compara el diccionario con el modelo: rutas del modelo sin entrada y entradas sin dato en el modelo.
  function revisarContraModelo() {
    var base = Modelo.operacionVacia();
    base.especificos.items = [Modelo.itemVacio()];
    var rutasModelo = Modelo.hojas(base, "").map(function (h) { return h.ruta.replace(/\.items\.0\./, ".items[]."); })
      .filter(function (r) { return r.indexOf("marcas") !== 0; });
    var sinEntrada = rutasModelo.filter(function (r) { return !porRuta[r]; });
    var sinDato = campos.map(function (c) { return c.ruta; }).filter(function (r) { return rutasModelo.indexOf(r) === -1; });
    return { total: campos.length, sinEntrada: sinEntrada, sinDato: sinDato };
  }

  return { grupos: GRUPOS, campos: campos, buscar: buscar, revisarContraModelo: revisarContraModelo };
})();
