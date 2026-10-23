/* Normativa y listas de códigos.
   Cada entrada lleva su marca:
     "H"  = hecho con fuente en la carpeta (se cita documento y sección)
     "H*" = conocimiento general, sin fuente en la carpeta
     "PV" = POR VERIFICAR
   Fuentes (PLAN.md §8.2):
     IT    = instructivo DESPA-IT.00.04 (herramienta-comex/referencias/despa-it.00.04.htm)
             IT A = Formato A ingreso · IT B = Formato A salida · IT C = Formato B · IT D = Formato C
     RS129 = RS N.º 000129-2026/SUNAT (herramienta-comex/referencias/RS-000129-2026-SUNAT.pdf)
   Script clásico (funciona con doble clic): deja el objeto global NORMATIVA. */

var NORMATIVA = (function () {
  // Crea una lista cerrada. Cada opción: [código, texto] o [código, texto, nota].
  function lista(nombre, marca, fuente, opciones, nota) {
    return {
      nombre: nombre,
      marca: marca,
      fuente: fuente,
      nota: nota || "",
      opciones: opciones.map(function (o) {
        return { codigo: o[0], texto: o[1], nota: o[2] || "" };
      })
    };
  }

  var listas = {
    tipoOperacion: lista("Tipo de operación", "S", "Alcance v1 (PLAN.md §1)", [
      ["importacion", "Importación"],
      ["exportacion", "Exportación"]
    ]),

    modalidadCarga: lista("Modalidad de carga", "S", "Alcance v1 (PLAN.md §1)", [
      ["FCL", "FCL (contenedor completo)"]
    ]),

    incoterm: lista("Incoterm (Incoterms® 2020)", "H*", "ICC, Incoterms® 2020; lugar según IT C 5.4", [
      ["EXW", "En fábrica (… lugar convenido)"],
      ["FCA", "Franco transportista (… lugar convenido)"],
      ["FAS", "Franco al costado del buque (… puerto de carga convenido)"],
      ["FOB", "Franco a bordo (… puerto de carga convenido)"],
      ["CFR", "Costo y flete (… puerto de destino convenido)"],
      ["CIF", "Costo, seguro y flete (… puerto de destino convenido)"],
      ["CPT", "Transporte pagado hasta (… lugar de destino convenido)"],
      ["CIP", "Transporte y seguro pagados hasta (… lugar de destino convenido)"],
      ["DAP", "Entregada en lugar (… lugar de destino convenido)"],
      ["DPU", "Entregada y descargada en lugar (… lugar de destino convenido)"],
      ["DDP", "Entregada derechos pagados (… lugar de destino convenido)"]
    ]),

    versionIncoterm: lista("Versión del Incoterm", "H", "IT C 5.4", [
      ["1", "Incoterms 1990"],
      ["2", "Incoterms 2000"],
      ["3", "Incoterms 2010"],
      ["4", "Incoterms 2020"]
    ]),

    moneda: lista("Moneda", "PV", "PV-09: código en la tabla de monedas de SUNAT", [
      ["USD", "Dólar de los Estados Unidos"]
    ], "v1 solo trabaja en USD (IT IV.4: montos de la DAM en USD)."),

    destinacion: lista("Destinación", "H", "IT A y IT B, casilla DESTINACIÓN", [
      ["10", "Importación para el consumo"],
      ["40", "Exportación definitiva"],
      ["41", "Exportación definitiva", "Diferencia con 40: PV-25"]
    ]),

    modalidadDespacho: lista("Modalidad de despacho (importación)", "H", "IT A, casilla MODALIDAD", [
      ["1-0", "Despacho anticipado"],
      ["0-0", "Despacho excepcional", "La Ley General de Aduanas usa 'diferido' (PV-24)"],
      ["0-1", "Despacho de envío de urgencia"],
      ["0-2", "Despacho de socorro"]
    ], "En exportación la modalidad no aplica (IT B)."),

    tipoDespachoExportacion: lista("Tipo de despacho (exportación definitiva)", "H", "IT B, casilla TIPO DESPACHO", [
      ["00", "Normal"],
      ["02", "Bienes a empresas de transporte internacional – Ley 28462"],
      ["03", "Embarques parciales"],
      ["04", "Bienes a empresas de transporte internacional – Ley 28462 con embarques parciales"]
    ], "Para importación para el consumo el IT no trae lista: la casilla queda vacía (PV)."),

    via: lista("Vía de transporte", "H", "IT A 3.3", [
      ["1", "Marítimo"], ["2", "Fluvial"], ["3", "Lacustre"], ["4", "Aéreo"], ["5", "Postal"],
      ["6", "Ferroviario"], ["7", "Carretera/Terrestre"], ["8", "Tuberías"], ["9", "Otras"]
    ], "v1 solo usa la vía 1."),

    documentoIdentidad: lista("Documento de identificación", "H", "IT A 1.2", [
      ["3", "DNI"], ["4", "RUC"], ["6", "Pasaporte"], ["7", "Carnet de extranjería"],
      ["8", "Organismos internacionales"], ["9", "Salvoconducto"]
    ]),

    modalidadPago: lista("Modalidad de pago", "H", "IT A 5.2 (modif. RS 81-2019)", [
      ["1", "Pago al contado"],
      ["2", "Pago a crédito"],
      ["6", "Pago anticipado"],
      ["7", "Otras (especifique)"],
      ["8", "Pago mixto (especifique)", "Si incluye crédito se declara 2 (IT C, rubro 4). Casos mixtos: PV-29"],
      ["9", "Sin pago"]
    ]),

    medioPago: lista("Medio de pago", "H", "IT C, rubro 4, 'Otros datos' a)", [
      ["01", "Efectivo (sin uso del sistema financiero)"],
      ["02", "Cheques bancarios"],
      ["03", "Orden de pago simple"],
      ["04", "Orden de pago documentaria"],
      ["05", "Remesa simple (cobranza simple)"],
      ["06", "Remesa documentaria (cobranza documentaria)"],
      ["07", "Carta de crédito simple"],
      ["08", "Carta de crédito documentario"],
      ["09", "Transferencias de fondos"],
      ["10", "Depósitos en cuentas"],
      ["11", "Giros"],
      ["12", "Tarjetas de débito"],
      ["13", "Tarjetas de crédito"],
      ["14", "Sin pago (especificar)"]
    ]),

    eventoPagoDiferido: lista("Evento del plazo de pago diferido", "H", "IT C, rubro 4, 'Otros datos' j)", [
      ["01", "Fecha del embarque"],
      ["02", "Fecha de la factura comercial"],
      ["03", "Fecha de arribo (llegada) de la carga"],
      ["99", "Otros"]
    ]),

    tipoSeguro: lista("Tipo de seguro", "H", "IT A 7.32", [
      ["1", "No asegurada"],
      ["2", "Con póliza de seguro individual"],
      ["3", "Con póliza de seguro flotante"],
      ["4", "No asegurada en su totalidad"]
    ]),

    estado: lista("Estado de la mercancía", "H", "IT C 5.16", [
      ["10", "Nuevo / Bueno"], ["12", "Nuevo desarmado"], ["14", "Nuevo semi-armado"],
      ["16", "Nuevo averiado"], ["17", "Nuevo reconstruido"], ["20", "Usado"],
      ["22", "Usado desarmado"], ["24", "Usado semi-armado"], ["26", "Usado averiado"],
      ["27", "Usado reconstruido"], ["28", "Usado remanufacturado"],
      ["99", "Otros (2.ª o 3.ª calidad, obsoleto, etc.)"]
    ], "En exportación (casilla S 7.20) el código es PV-09."),

    nivelComercial: lista("Nivel comercial del importador", "H", "IT C 1.3", [
      ["1", "Fabricante"], ["2", "Mayorista"], ["3", "Minorista"], ["4", "Detallista"], ["5", "Otros"]
    ]),

    condicionProveedor: lista("Condición del proveedor", "H", "IT C 3.2", [
      ["1", "Fabricante"], ["2", "Distribuidor"], ["3", "Comerciante"], ["4", "Otro"]
    ]),

    naturaleza: lista("Naturaleza de la transacción", "H", "IT C 4.1", [
      ["11", "Compra/venta a precio firme, para su exportación al país de importación"],
      ["12", "Compra/venta a precio revisable, para su exportación al país de importación"],
      ["13", "Compra/venta para uso en el exterior y posterior exportación"],
      ["14", "Suministros gratuitos (regalos, muestras, material publicitario)"],
      ["15", "Reparación o transformación"],
      ["16", "Importación efectuada por sucursal sin personería jurídica"],
      ["17", "Entrega bajo consignación, para la venta a la vista o prueba"],
      ["18", "Intercambio compensado"],
      ["19", "Arrendamiento financiero (leasing)"],
      ["20", "Alquiler simple, arrendamiento operativo, préstamo"],
      ["21", "Sustitución de mercancías devueltas"],
      ["22", "Sustitución de mercancías no devueltas (bajo garantía)"],
      ["23", "Mercancías de programas de ayuda de la Comunidad Andina"],
      ["24", "Otras ayudas gubernamentales"],
      ["25", "Otras ayudas (privadas, no gubernamentales)"],
      ["26", "Programas intergubernamentales de fabricación conjunta"],
      ["27", "Suministro en el marco de un contrato general de construcción (envíos parciales)"],
      ["28", "Otras transacciones (especifique)"],
      ["29", "Ventas sucesivas antes de la destinación aduanera"],
      ["30", "Trueque"]
    ]),

    tipoValor: lista("Tipo de valor declarado", "H", "IT C 5.6", [
      ["1", "Valor definitivo"],
      ["2", "Valor provisional"]
    ]),

    siNo: lista("Respuesta", "H", "IT C rubros 6 y 7 (1 = sí, 2 = no)", [
      ["1", "Sí"],
      ["2", "No"]
    ]),

    unidadCarga: lista("Unidad de carga", "H", "IT A 7.37 k)", [
      ["01", "Barcazas o planchones"], ["02", "Contenedores"], ["03", "Furgones"], ["04", "Paletas"],
      ["05", "Remolques y semirremolques"], ["06", "Tanques"],
      ["07", "Vagones o plataformas de ferrocarril"], ["08", "Otros elementos similares"]
    ]),

    regionDestino: lista("Región de destino", "H", "IT A 7.37 l)", [
      ["40106", "Cajamarca"], ["40114", "Lambayeque"], ["40120", "Piura"], ["40124", "Tumbes"],
      ["40201", "Amazonas"], ["40222", "San Martín"], ["40316", "Loreto"], ["40410", "Huánuco"],
      ["40425", "Ucayali"], ["40502", "Áncash"], ["40513", "La Libertad"], ["40607", "Callao"],
      ["40615", "Lima"], ["40712", "Junín"], ["40719", "Pasco"], ["40808", "Cusco"],
      ["40817", "Madre de Dios"], ["40903", "Apurímac"], ["40905", "Ayacucho"],
      ["40909", "Huancavelica"], ["41004", "Arequipa"], ["41011", "Ica"], ["41118", "Moquegua"],
      ["41121", "Puno"], ["41123", "Tacna"]
    ]),

    aduana: lista("Aduana", "H*", "Conocimiento general; tabla de aduanas de SUNAT pendiente (F0b)", [
      ["118", "Intendencia de Aduana Marítima del Callao"]
    ]),

    puerto: lista("Puerto (UN/LOCODE)", "H*", "UN/LOCODE (UNECE); equivalencia con la tabla de SUNAT: PV-09", [
      ["CNNGB", "Ningbo (China)"],
      ["PECLL", "Callao (Perú)"],
      ["CLSAI", "San Antonio (Chile)"]
    ]),

    pais: lista("País (ISO 3166 alfa-2)", "H*", "ISO 3166; equivalencia con la tabla de países de SUNAT: PV-09", [
      ["CN", "China"],
      ["PE", "Perú"],
      ["CL", "Chile"]
    ]),

    ubigeo: lista("UBIGEO", "H*", "INEI; tabla de SUNAT pendiente (F0b)", [
      ["150101", "Lima / Lima / Lima (Cercado de Lima)"]
    ]),

    tipoContenedor: lista("Tipo de contenedor", "H*", "ISO 6346 (código de tamaño y tipo)", [
      ["22G1", "20' DV (dry van)"],
      ["42G1", "40' DV (dry van)"],
      ["45G1", "40' HC (high cube)"],
      ["22R1", "20' RF (refrigerado / reefer)"],
      ["45R1", "40' HC RF (refrigerado / reefer)"]
    ]),

    unidadMedida: lista("Unidad (comercial o física)", "PV", "PV-09; RS129 anexo VI 6.4 cita 'U' como ejemplo", [
      ["U", "Unidad"]
    ]),

    claseBulto: lista("Clase de bulto", "PV", "PV-09: código en la tabla de SUNAT", [
      ["CAJA_CARTON", "Caja de cartón", "Código SUNAT pendiente"]
    ]),

    metodoVgm: lista("Método VGM", "H*", "SOLAS VI/2", [
      ["1", "Método 1: pesaje del contenedor lleno"],
      ["2", "Método 2: suma de pesos de la carga + tara"]
    ]),

    tipoPoliza: lista("Tipo de póliza", "S", "Práctica de seguros; alimenta el tipo de seguro de A 7.32", [
      ["flotante", "Póliza flotante"],
      ["individual", "Póliza individual"]
    ]),

    clausulasICC: lista("Cláusulas de seguro", "H*", "Institute Cargo Clauses 2009", [
      ["A", "ICC (A)"], ["B", "ICC (B)"], ["C", "ICC (C)"]
    ]),

    tipoConsignatario: lista("Consignatario del B/L", "S", "Práctica marítima (PLAN §4 A2)", [
      ["comprador", "El comprador (por defecto)"],
      ["otro", "Otra persona (escribe su nombre y dirección)"],
      ["a_la_orden", "A la orden de… (escribe a la orden de quién)"]
    ]),

    tipoNotify: lista("Parte a notificar", "S", "Práctica marítima (PLAN §4 A2)", [
      ["consignatario", "El consignatario (por defecto)"],
      ["otro", "Otra persona (escribe su nombre y dirección)"]
    ]),

    tipoBl: lista("Tipo de B/L", "S", "Práctica marítima", [
      ["nominativo", "Nominativo"],
      ["a_la_orden", "A la orden"]
    ]),

    fleteBl: lista("Flete en el B/L", "S", "Práctica marítima", [
      ["prepaid", "Freight prepaid"],
      ["collect", "Freight collect"]
    ])
  };

  // Listas ABIERTAS (F5): solo traen ejemplos (países, puertos, UBIGEO, aduanas, unidades y bultos del caso);
  // la tabla completa es de SUNAT o de UN/ISO (F0b). El formulario acepta otros códigos (con sugerencias) y
  // E18 no las revisa. Las demás listas son cerradas: el formulario las muestra como selector.
  ["aduana", "puerto", "pais", "ubigeo", "unidadMedida", "claseBulto"].forEach(function (n) { listas[n].abierta = true; });

  // Preguntas del rubro 7 del Formato B (IT C 7). 7.15 no se llena; 7.16 a 7.20 reservadas.
  var preguntasRubro7 = [
    ["7.1", "¿Existe vinculación entre el importador y el proveedor extranjero?"],
    ["7.2", "¿Ha influido la vinculación en el precio?", "Solo si 7.1 = Sí"],
    ["7.3", "¿Se aproxima el valor a uno del art. 1.2.b) del Acuerdo del Valor de la OMC?", "Solo si 7.1 = Sí"],
    ["7.4", "¿Puede disponer libremente de las mercancías, sin restricciones?"],
    ["7.5", "¿La venta o el precio dependen de condiciones o contraprestaciones?"],
    ["7.6", "¿Puede determinarse el valor de esas condiciones?", "Solo si 7.5 = Sí"],
    ["7.7", "¿Existen pagos indirectos?"],
    ["7.8", "¿Existen descuentos retroactivos?"],
    ["7.9", "¿Existen cánones y derechos de licencia?"],
    ["7.10", "¿Revierte al proveedor parte del producto de la reventa?"],
    ["7.11", "Además de la factura, ¿existe un contrato?"],
    ["7.12", "¿Es un contrato global de suministro de larga duración?"],
    ["7.13", "¿Contiene el contrato una cláusula de revisión del precio?"],
    ["7.14", "¿Es usted intermediario e importa a solicitud de su cliente?"]
  ].map(function (p) {
    return { numero: p[0], texto: p[1], condicion: p[2] || "", marca: "H", fuente: "IT C 7" };
  });

  // Tasas y umbrales. Se usan desde F3 (cálculos) y F4 (validaciones).
  var valores = {
    igv: { valor: 16, unidad: "%", marca: "H*", fuente: "Ley del IGV" },
    ipm: { valor: 2, unidad: "%", marca: "H*", fuente: "Ley del IPM" },
    coberturaMinimaCifCip: { valor: 110, unidad: "%", marca: "H*", fuente: "Incoterms® 2020, CIF y CIP A5" },
    umbralMediosPagoUsd: { valor: 500, unidad: "USD FOB", marca: "H", fuente: "IT C, rubro 4, 'Otros datos' a) (Ley 28194)" },
    decimalesDamAyC: { valor: 3, unidad: "decimales", marca: "H", fuente: "IT IV.3" },
    decimalesDamB: { valor: 6, unidad: "decimales", marca: "H", fuente: "IT IV.3" },
    imei: {
      subpartidas: ["8517.13.00.00", "8517.14.00.00"],
      destinacion: "10",
      vigenteDesde: "2026-10-05",
      marca: "H",
      fuente: "RS129 art. 1 y 1.ª disposición complementaria final"
    },
    capacidadReferencialM3: { valor: { "22G1": 33, "42G1": 67, "45G1": 76 }, marca: "PV", fuente: "PV-16" },
    // A07. Peso bruto máximo referencial (contenedor + carga). 30 480 kg es el valor clásico de ISO 668 [H*];
    // el máximo real figura en la placa CSC de cada contenedor (PV-16).
    pesoBrutoMaximoReferencialKg: { valor: { "22G1": 30480, "42G1": 30480, "45G1": 30480 }, marca: "PV", fuente: "PV-16; ISO 668 [H*]" },
    // A10. Umbral de despacho simplificado: sin fuente en la carpeta (PV-03). Mientras valga null,
    // la advertencia A10 no se activa (no se inventa la cifra).
    umbralDespachoSimplificadoUsd: { valor: null, unidad: "USD FOB", marca: "PV", fuente: "PV-03" }
  };

  return {
    revisadoEl: "2026-09-28",
    fuentes: {
      IT: "DESPA-IT.00.04 v2, copia consolidada hasta RSN 000349-2025-SUNAT (herramienta-comex/referencias/despa-it.00.04.htm)",
      RS129: "RS N.º 000129-2026/SUNAT, vigente desde 05-10-2026 (herramienta-comex/referencias/RS-000129-2026-SUNAT.pdf)",
      pendiente: "Tablas generales de SUNAT, DESPA-PG.01 y DESPA-PG.02: fase F0b"
    },
    listas: listas,
    preguntasRubro7: preguntasRubro7,
    valores: valores,

    // Devuelve la opción de una lista por su código, o null.
    opcion: function (nombreLista, codigo) {
      var l = listas[nombreLista];
      if (!l) { return null; }
      for (var i = 0; i < l.opciones.length; i++) {
        if (l.opciones[i].codigo === codigo) { return l.opciones[i]; }
      }
      return null;
    }
  };
})();
