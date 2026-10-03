/* Validaciones: errores (E01–E19) y advertencias (A01–A20) de PLAN.md §7.
   - Solo LEEN: los datos de la operación y el resultado de Calculos.calcular. No calculan cifras propias;
     comparan datos con listas, umbrales de normativa.js y lo que ya calculó js/calculos.js.
   - Cada hallazgo dice qué pasa, por qué importa y cómo corregirlo, con la ruta del dato afectado,
     la fuente y la marca (H, H*, S o PV). Donde la regla es POR VERIFICAR, el mensaje lo dice.
   - Los errores bloquearán la generación de documentos (F6+): usar Validaciones.hayErrores(revision).
   Depende de NORMATIVA, INCOTERMS, DICCIONARIO y Calculos (formato y controles).
   Script clásico: deja el objeto global Validaciones. */

var Validaciones = (function () {
  var F = Calculos.formato, CTRL = Calculos.control;

  var NOMBRE_DOC = {
    FC: "factura comercial", PL: "lista de empaque", BL: "instrucciones de embarque / B/L / VGM",
    DAM: "DAM", SEG: "certificado de seguro", CO: "certificado de origen", HR: "hoja resumen"
  };

  // ------------------------------------------------------------------ Catálogo de reglas
  // regla(id, título, marca, fuente, por qué importa, cómo corregirlo por defecto)
  var REGLAS = {};
  var ORDEN = [];
  function regla(id, titulo, marca, fuente, porque, como) {
    REGLAS[id] = {
      id: id, severidad: id.charAt(0) === "E" ? "error" : "advertencia",
      titulo: titulo, marca: marca, fuente: fuente, porque: porque, como: como || ""
    };
    ORDEN.push(id);
  }

  regla("E01", "Dato obligatorio vacío", "S", "PLAN §4 y diccionario (obligatorio según el documento que usa el campo)",
    "Sin este dato los documentos que lo usan saldrían incompletos o con casillas en blanco.",
    "Complétalo.");
  regla("E02", "Incoterm fuera de Incoterms® 2020", "H", "IT C 5.4 (tabla de Incoterms); Incoterms® 2020 [H*]",
    "El Incoterm decide quién paga el flete y el seguro, dónde pasa el riesgo y con qué fórmula se obtiene el FOB (IT C 5.9).",
    "Usa uno de los 11: EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU o DDP.");
  regla("E03", "Lugar convenido incoherente con los puertos", "H", "IT C 5.4",
    "En FAS y FOB el lugar convenido es el puerto de carga; en CFR y CIF, el puerto de destino. Si no coinciden, la factura y el Formato B (B 5.4) se contradicen con el B/L.",
    "");
  regla("E04", "Seguro incompleto en CIF o CIP", "H*", "Incoterms® 2020, CIF y CIP A5",
    "En CIF y CIP el vendedor está obligado a contratar el seguro: mínimo ICC (C) en CIF e ICC (A) en CIP, por el 110 % del valor del contrato.",
    "");
  regla("E05", "Peso bruto menor que el peso neto", "H*", "Conocimiento general: el peso bruto incluye el embalaje (IT A 7.14 y 7.15)",
    "El peso bruto es la mercancía más su embalaje; nunca puede ser menor que el neto. El error se arrastraría a la lista de empaque, el B/L, el VGM y la DAM.",
    "Revisa ambos pesos por bulto: el bruto debe ser mayor o igual que el neto.");
  regla("E06", "Cantidad que no llena bultos completos", "S", "PLAN §6.2 (alcance v1)",
    "En v1 cada bulto lleva la misma cantidad de unidades; si la división no es exacta, la herramienta tendría que inventar un bulto incompleto y los pesos dejarían de cuadrar.",
    "");
  regla("E07", "Cantidad, precio, peso o medida igual o menor que cero", "S", "PLAN §7",
    "Con un cero o un negativo el valor, el peso o el volumen de la línea pierden sentido y se descuadran los documentos.",
    "Escribe un número mayor que cero.");
  regla("E08", "Subpartida nacional sin 10 dígitos", "H", "IT A 7.19",
    "La DAM pide la subpartida nacional de 10 dígitos; con ella se buscan los tributos y las restricciones de la mercancía.",
    "Escribe los 10 dígitos (por ejemplo 8414.51.00.00); los puntos son opcionales.");
  regla("E09", "N° de contenedor con dígito de control incorrecto", "H*", "ISO 6346",
    "El último dígito del número de contenedor es un control calculado con las letras y los números anteriores; si no cuadra, el número tiene una errata y no coincidiría con el B/L.",
    "");
  regla("E10", "RUC sin 11 dígitos numéricos", "H*", "RUC de 11 dígitos [H*]; casillas IT A 1.2 / IT B 1.2",
    "El RUC identifica al importador o al exportador ante SUNAT en la DAM; con otra longitud no es un RUC.",
    "Escribe los 11 dígitos, sin espacios ni guiones.");
  regla("E11", "UN/LOCODE mal formado o de otro país", "H*", "UN/LOCODE (UNECE); equivalencia con la tabla de SUNAT: PV-09",
    "El código del puerto identifica el país (2 letras) y el lugar (3 caracteres). En una importación a Perú el puerto de descarga es peruano; en una exportación, el de embarque.",
    "");
  regla("E12", "FOB igual o menor que cero", "H", "IT C 5.9 (importación) / IT B 6.5 (exportación)",
    "El FOB es la base del valor en aduana y de las casillas de valor de la DAM. Si sale 0 o negativo, los gastos restados superan el precio.",
    "Revisa el precio de la factura, el flete, el seguro y las deducciones de la sección 8.");
  regla("E13", "Llegada estimada (ETA) anterior al embarque", "S", "PLAN §7",
    "Un buque no puede llegar antes de zarpar: la fecha se arrastraría al B/L, a la hoja resumen y a la DAM.",
    "Corrige la fecha de embarque o la ETA.");
  regla("E14", "Moneda distinta de USD", "H", "IT IV.4 (montos de la DAM en USD); alcance v1 [S]",
    "La DAM se llena en dólares (IT IV.4) y v1 no convierte monedas.",
    "Usa USD.");
  regla("E15", "Importación sin tipo de cambio", "H", "IT D rubro 5 (fuente del tipo de cambio: PV-07)",
    "Los tributos se pagan en soles al tipo de cambio venta de la fecha de pago (IT D rubro 5). Sin él no se puede calcular el pago en soles.",
    "Escribe el tipo de cambio (S/ por USD, 3 decimales).");
  regla("E16", "Ítems de una misma serie con tributos distintos", "H", "IT A 7.1 y 7.20",
    "Una serie de la DAM liquida sus tributos una sola vez; si sus ítems tienen distinta tasa o código, la liquidación sería falsa para alguno.",
    "");
  regla("E17", "Celulares sin serie o IMEI completos (RS 129-2026)", "H", "RS129 art. 1 y 1.ª disposición complementaria final",
    "Desde el 05-10-2026, en las subpartidas 8517.13.00.00 y 8517.14.00.00 la descripción de la DAM debe identificar cada equipo con su número de serie y su IMEI.",
    "");
  regla("E18", "Código fuera de su lista cerrada", "H", "Listas cerradas del instructivo (IT A, B, C y D) y del alcance v1",
    "La DAM solo acepta los códigos de su tabla; un código inventado sería rechazado.",
    "");
  regla("E19", "Descuadre interno de la DAM", "S", "PLAN §6.1 (prorrateo con residuo)",
    "Las sumas por ítem y por serie deben dar exactamente el total. Un descuadre delata un error de cálculo de la herramienta, no de tus datos.",
    "Avisa del caso (guarda el .json) para corregir la herramienta; no imprimas documentos con este error.");

  regla("A01", "Regla marítima con contenedor: considera FCA, CPT o CIP", "H*", "ICC, nota de orientación de Incoterms® 2020",
    "En FAS, FOB, CFR y CIF el riesgo pasa al costado o a bordo del buque, pero la carga en contenedor se entrega antes, en la terminal o el depósito. Entre la entrega y la carga a bordo el riesgo queda en una zona gris.",
    "");
  regla("A02", "EXW en una exportación desde Perú", "H*", "Incoterms® 2020 (matriz PLAN §6.8)",
    "En EXW el despacho de exportación le corresponde al comprador extranjero, que no suele poder hacerlo en el Perú.",
    "Considera FCA: el vendedor entrega la mercancía despachada para la exportación.");
  regla("A03", "DDP en una importación a Perú", "H*", "Incoterms® 2020 (matriz PLAN §6.8)",
    "En DDP el vendedor extranjero hace el despacho de importación y paga los tributos: tendría que actuar como importador en el Perú.",
    "Considera DAP o DPU: el comprador despacha la importación.");
  regla("A04", "Grupo D en importación: revisa los gastos en destino", "H", "IT C 5.9 y sección 8",
    "En DAP, DPU y DDP el precio incluye tramos posteriores a la llegada; para obtener el FOB se restan los gastos en destino (8.3.2) y las deducciones (8.5.x).",
    "Comprueba que 8.3.2 y 8.5.1 a 8.5.5 tengan los montos que figuran en la factura.");
  regla("A05", "Flete del B/L distinto del usual para el Incoterm", "S", "Práctica marítima (PLAN §6.8, D8)",
    "Lo usual es prepaid cuando el vendedor paga el flete (grupos C y D) y collect cuando lo paga el comprador (E y F). No es una regla de Incoterms, pero una diferencia suele delatar un error.",
    "");
  regla("A06", "Volumen mayor que la capacidad referencial del contenedor", "PV", "PV-16",
    "Si la carga no cabe, hará falta otro contenedor o uno más grande. La capacidad usada es referencial y está POR VERIFICAR (PV-16).",
    "Revisa las medidas de los bultos o elige un contenedor mayor.");
  regla("A07", "VGM mayor que el peso bruto máximo referencial", "PV", "PV-16; ISO 668 [H*]",
    "Un contenedor no puede superar su peso bruto máximo (el de su placa CSC). El valor usado es referencial y está POR VERIFICAR (PV-16).",
    "Revisa los pesos o reparte la carga en otro contenedor.");
  regla("A08", "Subpartida no verificada: POR VERIFICAR", "PV", "PV-10 (arancel y subpartidas)",
    "La subpartida decide los tributos y las restricciones; mientras no se compruebe en el arancel, se muestra POR VERIFICAR.",
    "Compruébala en el Arancel de Aduanas y marca la casilla «verificada».");
  regla("A09", "RUC con prefijo o dígito verificador inusual", "H*", "Módulo 11 del RUC [H*]; PV-18",
    "Los RUC suelen empezar por 10 (personas) o 20 (empresas) y su último dígito es un control. El algoritmo está POR VERIFICAR (PV-18), así que solo se advierte.",
    "Revisa el número con la constancia de RUC.");
  regla("A10", "FOB dentro del umbral de despacho simplificado", "PV", "PV-03",
    "Por debajo de cierto valor podría corresponder un despacho simplificado. El umbral está POR VERIFICAR (PV-03); no confundir con los US$ 500 de medios de pago.",
    "Consulta el procedimiento vigente antes de elegir el tipo de despacho.");
  regla("A11", "Certificado de seguro posterior al embarque", "H*", "UCP 600 art. 28(e)",
    "Un seguro fechado después del embarque podría no cubrir el tramo inicial; los bancos lo rechazan en una carta de crédito salvo que indique cobertura desde el embarque.",
    "Revisa la fecha del certificado.");
  regla("A12", "Seguro en un Incoterm que no lo exige", "H*", "Incoterms® 2020 (matriz PLAN §6.8)",
    "Solo CIF y CIP obligan a contratar seguro. En los demás es voluntario y lo contrata quien corre el riesgo en el transporte principal.",
    "");
  regla("A13", "Certificado de origen posterior al embarque", "PV", "PV-12",
    "Algunos acuerdos aceptan certificados emitidos después del embarque solo con requisitos adicionales. La regla del acuerdo está POR VERIFICAR (PV-12).",
    "Revisa la fecha del certificado y las reglas del acuerdo.");
  regla("A14", "País de origen distinto del país del vendedor", "S", "PLAN §7; origen preferencial: PV-12",
    "No es un error (un distribuidor puede vender mercancía de otro país), pero si se pide trato preferencial el origen debe acreditarse con el certificado del país de origen.",
    "Revisa el país de origen y, si hay certificado de origen, quién lo emite.");
  regla("A15", "Importación sin seguro: se usa la tabla de SUNAT", "PV", "IT C 8.4; porcentajes: PV-06",
    "Sin póliza, el seguro del valor en aduana se calcula con la «Tabla de Porcentajes Promedio de Seguro». Sus porcentajes están POR VERIFICAR (PV-06).",
    "Si contrataste un seguro, regístralo; si no, comprueba el % de la tabla.");
  regla("A16", "Pago en efectivo de un FOB mayor que US$ 500", "H", "IT C rubro 4, «Otros datos» a) (Ley 28194)",
    "Por la Ley 28194, si el FOB supera US$ 500 el pago debe hacerse con medios del sistema financiero (transferencia, cheque, carta de crédito…).",
    "Cambia el medio de pago 01 (efectivo) por uno del sistema financiero.");
  regla("A17", "IMEI con formato o dígito de control dudoso", "H*", "IMEI de 15 dígitos con dígito Luhn [H*]",
    "Un IMEI tiene 15 dígitos y el último es un control (Luhn). Uno mal copiado no identificaría al equipo.",
    "Copia el IMEI de la caja o del equipo (*#06#).");
  regla("A18", "DAP o DPU: el seguro no se resta del FOB", "H", "IT C 5.9",
    "En las fórmulas de DAP y DPU el instructivo resta el flete y los gastos en destino, pero no el seguro: si el precio lo incluye, queda dentro del FOB.",
    "Es solo informativo; no hay nada que corregir.");
  regla("A19", "Resumen de datos H* y POR VERIFICAR en la DAM", "S", "PLAN, marcas H* y PV",
    "Estos datos no tienen fuente en la carpeta (H*) o están POR VERIFICAR (PV): la DAM didáctica los muestra con su etiqueta para que no se tomen como hechos comprobados.",
    "Revisa las etiquetas H* y POR VERIFICAR en la vista de datos.");
  regla("A20", "Despacho anticipado sin fecha de término de descarga", "PV", "IT A 3.4; PV-26",
    "En el despacho anticipado la DAM se numera antes de la llegada, así que aún no hay fecha de término de descarga. Qué va en la casilla A 3.4 está POR VERIFICAR (PV-26).",
    "Déjala vacía hasta la descarga; la DAM mostrará POR VERIFICAR.");
  // Avisos del cálculo (decisión D12) convertidos en advertencias, como pide PLAN §6.5.
  regla("C01", "Reparto en partes iguales (base cero)", "S", "PLAN §6.1 (D12)",
    "Un monto (FOB, flete, seguro o ajustes) debía repartirse en proporción a una base (valor, peso bruto o FOB) que suma 0; como no hay proporción, se repartió en partes iguales.",
    "");
  regla("C02", "Ajustes sin ítems marcados: se reparten entre todos", "S", "IT C 5.10; PLAN §6.5 (D12)",
    "Los ajustes (8.1.2 a 8.2.5) solo se reparten entre los ítems «objeto de ajuste» (IT C 5.10); como no hay ninguno marcado, se repartieron entre todos.",
    "Marca los ítems a los que corresponde el ajuste.");

  // ------------------------------------------------------------------ Utilidades

  function vacio(v) { return v === null || v === undefined || (typeof v === "string" && v.trim() === ""); }

  // "2026-10-05" → "05-10-2026" (formato DD-MM-AAAA de PLAN §6.1).
  function fechaTexto(f) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || "");
    return m ? m[3] + "-" + m[2] + "-" + m[1] : String(f);
  }
  function esFecha(f) { return /^\d{4}-\d{2}-\d{2}$/.test(f || ""); }

  function normalizar(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  }

  // E03 (F4-M1, F41-B1): el lugar convenido coincide con el puerto si, palabra por palabra, es su nombre
  // completo o su UN/LOCODE exacto. Solo se admiten estas variantes explícitas: el prefijo «Puerto de …»,
  // «Puerto del …» o «Port of …» AL INICIO, y el país del puerto (nombre o código) AL FINAL («Callao, Perú»,
  // «Callao PE»). Las palabras internas no se tocan: «Callao Norte», «Callao of» o «Port Callao of the» no coinciden.
  var PREFIJOS_LUGAR = [["puerto", "del"], ["puerto", "de"], ["port", "of"]];
  function palabrasLugar(texto, pais) {
    var p = normalizar(texto).replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
    for (var k = 0; k < PREFIJOS_LUGAR.length; k++) {
      var pre = PREFIJOS_LUGAR[k];
      if (p.length > pre.length && pre.every(function (w, i) { return p[i] === w; })) { p = p.slice(pre.length); break; }
    }
    // El país solo se descarta al final y nunca como el nombre entero.
    var finales = [];
    if (pais) {
      var nombrePais = normalizar((NORMATIVA.opcion("pais", pais) || {}).texto || "").replace(/[^a-z0-9]+/g, " ").trim();
      if (nombrePais) { finales.push(nombrePais.split(" ")); }
      finales.push([normalizar(pais)]);
    }
    for (var f = 0; f < finales.length; f++) {
      var suf = finales[f], n = p.length - suf.length;
      if (n > 0 && suf.every(function (w, i) { return p[n + i] === w; })) { p = p.slice(0, n); break; }
    }
    return p.join(" ");
  }
  function lugarCoincide(lugar, puerto) {
    var pais = String(puerto.locode || "").slice(0, 2).toUpperCase();
    if (!vacio(puerto.locode) && normalizar(lugar).replace(/\s/g, "") === normalizar(puerto.locode)) { return true; }
    if (vacio(puerto.nombre)) { return false; }
    var a = palabrasLugar(lugar, pais), b = palabrasLugar(puerto.nombre, pais);
    return a !== "" && a === b;
  }

  function soloDigitos(t) { return String(t || "").replace(/[.\s-]/g, ""); }

  // Etiqueta legible de una ruta: "Ítem 2 · Peso bruto por bulto (kg)".
  function etiqueta(ruta) {
    if (ruta === "especificos.items") { return "Mercancía (ítems)"; }
    var c = DICCIONARIO.buscar(ruta);
    var m = /\.items\.(\d+)\./.exec(ruta);
    var nombre = c ? c.es : ruta;
    return m ? "Ítem " + (Number(m[1]) + 1) + " · " + nombre : nombre;
  }

  function rutaItem(i, campo) { return "especificos.items." + i + "." + campo; }

  // Condiciones de obligatoriedad del diccionario (campo "obl"), evaluadas sobre la operación.
  var CONDICIONES = {
    "sí": function () { return true; },
    "no": function () { return false; },
    "importación": function (x) { return x.imp; },
    "exportación": function (x) { return !x.imp; },
    "si no es el comprador": function (x) { return x.op.generales.partes.consignatario.tipo !== "comprador"; },
    "si no es el consignatario": function (x) { return x.op.generales.partes.notify.tipo !== "consignatario"; },
    "si hay seguro": function (x) { return x.op.especificos.seguro.hay === true; },
    "si hay co": function (x) { return x.op.especificos.origen.solicitaPreferencia === true; },
    "importación a crédito": function (x) { return x.imp && x.op.generales.comercial.modalidadPago === "2"; },
    "si hubo intermediario": function (x) { return x.op.generales.valor.intermediario.hubo === "1"; },
    "solo si 7.1 = sí": function (x) { return x.op.generales.valor.rubro7.p7_1 === "1"; },
    "solo si 7.5 = sí": function (x) { return x.op.generales.valor.rubro7.p7_5 === "1"; },
    "si hay ajustes": function () { return false; },          // sí/no: nunca está vacío
    "celulares (e17)": function () { return false; },         // lo revisa E17
    "para la dam": function () { return true; },              // la DAM se genera siempre (PLAN §3)
    "importación (salvo anticipado: pv-26)": function (x) { return x.imp && x.op.generales.aduana.modalidadDespacho !== "1-0"; },
    "importación sin seguro": function (x) { return x.imp && x.op.especificos.seguro.hay !== true; },
    "c/d e importación": function (x) { return x.imp || (x.regla && (x.regla.grupo === "C" || x.regla.grupo === "D")); },
    "con preferencia": function (x) { return x.imp && x.op.especificos.origen.solicitaPreferencia === true; }
  };

  // Campos cuya falta revisa una regla propia (así no se avisa dos veces).
  var REGLA_PROPIA = { "generales.aduana.tipoCambio": "E15" };

  // Documentos activos de la operación: SEG solo con seguro; CO solo si se pide trato preferencial.
  function documentosActivos(x) {
    return { FC: true, PL: true, BL: true, DAM: true, HR: true,
      SEG: x.op.especificos.seguro.hay === true, CO: x.op.especificos.origen.solicitaPreferencia === true };
  }

  // Marca del dato concreto: la propia de la operación, la de su lista de códigos o la del campo.
  function marcaDelDato(op, campo, ruta, valor) {
    if (op.marcas[ruta]) { return op.marcas[ruta].marca; }
    if (campo.tipo === "codigo" && campo.lista && !vacio(valor)) { return NORMATIVA.listas[campo.lista].marca; }
    return campo.marca;
  }

  // Recorre los campos del diccionario que aplican a la operación: fn(campo, ruta, valor).
  function recorrerCampos(op, fn) {
    var tipo = op.generales.operacion.tipo;
    DICCIONARIO.campos.forEach(function (c) {
      if (c.solo && c.solo !== tipo) { return; }
      if (c.ruta.indexOf("items[]") !== -1) {
        op.especificos.items.forEach(function (_, i) {
          var r = c.ruta.replace("items[]", "items." + i);
          fn(c, r, Modelo.leer(op, r));
        });
      } else {
        fn(c, c.ruta, Modelo.leer(op, c.ruta));
      }
    });
  }

  // ------------------------------------------------------------------ Reglas

  function revisarObligatorios(x, agregar) {
    var activos = documentosActivos(x);
    if (!x.op.especificos.items.length) {
      agregar("E01", "La operación no tiene mercancía: no hay ningún ítem.", ["especificos.items"],
        { porque: "Sin ítems no hay factura, lista de empaque ni DAM que generar.", como: "Agrega al menos un ítem con su producto, cantidad, precio y embalaje." });
    }
    recorrerCampos(x.op, function (c, ruta, valor) {
      if (!vacio(valor) || REGLA_PROPIA[ruta] || c.tipo === "equipos" || c.tipo === "sino") { return; }
      // En CIF y CIP los datos del seguro que faltan los informa E04 (F4-B1).
      if (c.obl === "si hay seguro" && x.regla && x.regla.seguroObligatorio) { return; }
      var cond = CONDICIONES[c.obl.toLowerCase()];
      if (!cond || !cond(x)) { return; }
      var docs = c.docs ? c.docs.split(" ") : [];
      var usados = docs.filter(function (d) { return activos[d]; });
      if (docs.length && !usados.length) { return; }
      // Un dato vacío a propósito y marcado POR VERIFICAR no es un error: lo cuenta A19.
      if (x.op.marcas[ruta] && x.op.marcas[ruta].marca === "PV") { return; }
      var casilla = DICCIONARIO.casilla(c, x.op.generales.operacion.tipo);
      agregar("E01", "Falta «" + etiqueta(ruta) + "».", [ruta], {
        porque: "Es obligatorio" + (c.obl !== "sí" ? " (" + c.obl + ")" : "") +
          (usados.length ? " y lo usa" + (usados.length > 1 ? "n" : "") + ": " + usados.map(function (d) { return NOMBRE_DOC[d]; }).join(", ") : "") +
          (casilla && casilla !== "Sin casilla" ? " (casilla " + casilla + ")" : "") + "." +
          (c.marca === "PV" ? " El campo está POR VERIFICAR (" + c.fuente + "): escribe el dato y su nota." : ""),
        como: "Complétalo. " + (c.ayuda || ""),
        fuente: c.fuente, marca: c.marca
      });
    });
  }

  function revisarIncoterm(x, agregar) {
    var g = x.op.generales.comercial;
    if (!vacio(g.incoterm) && !x.regla) {
      agregar("E02", "El Incoterm «" + g.incoterm + "» no es una de las 11 reglas de Incoterms® 2020.", ["generales.comercial.incoterm"]);
    }
    if (!x.regla || vacio(g.lugarConvenido)) { return; }
    var exige = { FAS: "embarque", FOB: "embarque", CFR: "descarga", CIF: "descarga" }[x.regla.codigo];
    if (exige) {
      var puerto = x.op.generales.ruta[exige === "embarque" ? "puertoEmbarque" : "puertoDescarga"];
      var coincide = lugarCoincide(g.lugarConvenido, puerto);
      if (!coincide && (!vacio(puerto.nombre) || !vacio(puerto.locode))) {
        agregar("E03", "En " + x.regla.codigo + " el lugar convenido debe ser el puerto de " + exige + " («" + (puerto.nombre || puerto.locode) +
          "»), pero dice «" + g.lugarConvenido + "».",
          ["generales.comercial.lugarConvenido", exige === "embarque" ? "generales.ruta.puertoEmbarque.nombre" : "generales.ruta.puertoDescarga.nombre"],
          { como: "Corrige el lugar convenido o el puerto de " + exige + " para que coincidan (ej. «" + x.regla.codigo + " " + (puerto.nombre || "Callao") + "»)." });
      }
    }
    // Avisos didácticos del Incoterm
    if (["FAS", "FOB", "CFR", "CIF"].indexOf(x.regla.codigo) !== -1 && x.op.generales.operacion.modalidadCarga === "FCL") {
      var alt = { FAS: "FCA", FOB: "FCA", CFR: "CPT", CIF: "CIP" }[x.regla.codigo];
      agregar("A01", "La operación usa " + x.regla.codigo + " con carga en contenedor (FCL). Es un aviso didáctico: no bloquea.",
        ["generales.comercial.incoterm"],
        { como: "La nota de orientación de la ICC recomienda " + alt + " en lugar de " + x.regla.codigo + " para carga en contenedor. Si se mantiene " + x.regla.codigo + ", que las partes lo hagan sabiendo dónde pasa el riesgo." });
    }
    if (x.regla.codigo === "EXW" && !x.imp) {
      agregar("A02", "Exportación desde el Perú pactada en EXW.", ["generales.comercial.incoterm"]);
    }
    if (x.regla.codigo === "DDP" && x.imp) {
      agregar("A03", "Importación a Perú pactada en DDP.", ["generales.comercial.incoterm"]);
    }
    if (x.regla.grupo === "D" && x.imp) {
      agregar("A04", "Importación en " + x.regla.codigo + " (grupo D).",
        ["especificos.valoracion.gastosDestino832", "especificos.valoracion.posteriores851"]);
    }
    if (x.imp && (x.regla.codigo === "DAP" || x.regla.codigo === "DPU")) {
      agregar("A18", "Importación en " + x.regla.codigo + ": el FOB se obtiene sin restar el seguro.", ["generales.comercial.incoterm"]);
    }
    if (!x.r.fleteBl.coincide) {
      agregar("A05", "El B/L dice «" + x.r.fleteBl.declarado + "», pero lo usual en " + x.regla.codigo + " es «" + x.r.fleteBl.sugerido + "».",
        ["especificos.transporte.fleteBl"],
        { como: "Si el flete lo paga " + (x.r.fleteBl.sugerido === "prepaid" ? "el vendedor en origen, usa prepaid" : "el comprador en destino, usa collect") +
          ". Si la diferencia es intencional, puedes mantenerla." });
    }
  }

  function revisarSeguro(x, agregar) {
    var s = x.op.especificos.seguro;
    var cod = x.regla ? x.regla.codigo : "";
    if (cod === "CIF" || cod === "CIP") {
      if (s.hay !== true) {
        agregar("E04", "La operación es " + cod + ", pero no tiene seguro.", ["especificos.seguro.hay"],
          { como: "Marca «¿Hay seguro?» = Sí y completa la póliza, las cláusulas, la cobertura y la tasa de prima." });
      } else {
        var minimo = NORMATIVA.valores.coberturaMinimaCifCip.valor;
        if (typeof s.coberturaPct === "number" && s.coberturaPct < minimo) {
          agregar("E04", "La cobertura es " + s.coberturaPct + " %, menor que el " + minimo + " % mínimo de " + cod + ".", ["especificos.seguro.coberturaPct"],
            { como: "Sube la cobertura al " + minimo + " % o más." });
        }
        // F4-B1: en CIF y CIP los datos del seguro que faltan son E04 (no E01); un dato vacío marcado PV no cuenta (D13).
        DICCIONARIO.campos.forEach(function (c) {
          if (c.obl !== "si hay seguro") { return; }
          var v = Modelo.leer(x.op, c.ruta);
          if (!vacio(v) || (x.op.marcas[c.ruta] && x.op.marcas[c.ruta].marca === "PV")) { return; }
          agregar("E04", "La operación es " + cod + " y falta «" + c.es + "» del seguro.", [c.ruta],
            { como: "Complétalo: en " + cod + " el seguro es obligatorio y el certificado lo necesita. " + (c.ayuda || "") });
        });
        if (cod === "CIP" && !vacio(s.clausulas) && s.clausulas !== "A") {
          agregar("E04", "En CIP el seguro debe tener cláusulas ICC (A), pero dice ICC (" + s.clausulas + ").", ["especificos.seguro.clausulas"],
            { como: "Cambia las cláusulas a ICC (A): cobertura «todo riesgo», la mínima de CIP en Incoterms® 2020." });
        }
      }
    } else if (s.hay === true && x.regla) {
      var quien = x.regla.grupo === "D" ? "el vendedor (en el grupo D corre el riesgo hasta el destino)" :
        "el comprador (en " + cod + " corre el riesgo desde la entrega en origen)";
      agregar("A12", "La operación es " + cod + " y tiene seguro, aunque esta regla no lo exige.", ["especificos.seguro.hay"],
        { como: "Normalmente lo contrata " + quien + ". Revisa que el certificado nombre al asegurado correcto." });
    }
    var embarque = x.op.especificos.transporte.fechaEmbarque;
    if (s.hay === true && esFecha(s.fechaEmision) && esFecha(embarque) && s.fechaEmision > embarque) {
      agregar("A11", "El certificado de seguro es del " + fechaTexto(s.fechaEmision) + " y el embarque del " + fechaTexto(embarque) + ".",
        ["especificos.seguro.fechaEmision", "especificos.transporte.fechaEmbarque"]);
    }
    if (x.imp && x.r.seguroOrigen === "tabla") {
      agregar("A15", "No hay seguro contratado: el seguro de la DAM se calcula con el " +
        (s.pctTablaSunat == null ? "% (vacío)" : s.pctTablaSunat + " %") + " de la tabla de SUNAT sobre el FOB.",
        ["especificos.seguro.pctTablaSunat"]);
    }
  }

  function revisarItems(x, agregar) {
    var op = x.op;
    var POSITIVOS = [["cantidad", "la cantidad"], ["precioUnitario", "el precio unitario"], ["unidadesPorBulto", "las unidades por bulto"],
      ["pesoNetoBulto", "el peso neto por bulto"], ["pesoBrutoBulto", "el peso bruto por bulto"],
      ["largoCm", "el largo del bulto"], ["anchoCm", "el ancho del bulto"], ["altoCm", "el alto del bulto"]];
    op.especificos.items.forEach(function (it, i) {
      var ri = x.r.items[i], n = "Ítem " + (i + 1);
      POSITIVOS.forEach(function (p) {
        if (typeof it[p[0]] === "number" && it[p[0]] <= 0) {
          agregar("E07", n + ": " + p[1] + " es " + it[p[0]] + ".", [rutaItem(i, p[0])]);
        }
      });
      if (typeof it.pesoNetoBulto === "number" && typeof it.pesoBrutoBulto === "number" &&
          Calculos.comparar(ri.pesoBrutoBulto, ri.pesoNetoBulto) < 0) {
        agregar("E05", n + ": el peso bruto por bulto (" + F.kg(ri.pesoBrutoBulto) + " kg) es menor que el neto (" + F.kg(ri.pesoNetoBulto) + " kg).",
          [rutaItem(i, "pesoBrutoBulto"), rutaItem(i, "pesoNetoBulto")]);
      }
      if (!ri.bultosExactos) {
        agregar("E06", n + ": " + F.cantidad(ri.cantidad) + " unidades no se reparten en bultos de " + it.unidadesPorBulto + " (sobran unidades).",
          [rutaItem(i, "cantidad"), rutaItem(i, "unidadesPorBulto")],
          { como: "Ajusta la cantidad a un múltiplo de " + it.unidadesPorBulto + " o cambia las unidades por bulto." });
      }
      if (!vacio(it.subpartida) && !/^\d{10}$/.test(soloDigitos(it.subpartida))) {
        agregar("E08", n + ": la subpartida «" + it.subpartida + "» tiene " + soloDigitos(it.subpartida).replace(/\D/g, "").length + " dígitos.",
          [rutaItem(i, "subpartida")]);
      }
      if (!it.subpartidaVerificada) {
        agregar("A08", n + ": la subpartida " + (it.subpartida || "(vacía)") + " no está marcada como verificada.", [rutaItem(i, "subpartidaVerificada")]);
      }
      if (!vacio(it.paisOrigen) && !vacio(op.generales.partes.vendedor.pais) && it.paisOrigen !== op.generales.partes.vendedor.pais) {
        agregar("A14", n + ": origen " + it.paisOrigen + ", pero el vendedor está en " + op.generales.partes.vendedor.pais + ".",
          [rutaItem(i, "paisOrigen"), "generales.partes.vendedor.pais"]);
      }
    });
  }

  function revisarIdentificadores(x, agregar) {
    var g = x.op.generales, e = x.op.especificos;
    // E10 y A09: RUC del importador (importación) o del exportador (exportación).
    var rutaRuc = x.imp ? "generales.partes.comprador.idFiscal" : "generales.partes.vendedor.idFiscal";
    var quien = x.imp ? "importador" : "exportador";
    var ruc = Modelo.leer(x.op, rutaRuc);
    if (!vacio(ruc)) {
      var cr = CTRL.ruc(ruc);
      if (!cr.formato) {
        agregar("E10", "El RUC del " + quien + " («" + ruc + "») no tiene 11 dígitos numéricos.", [rutaRuc]);
      } else {
        avisarRuc(cr, "del " + quien, rutaRuc, agregar);
      }
    }
    // Agentes: RUC o código (PV-28). Solo se controla si es un número de 11 dígitos.
    [["agenteMaritimo", "del agente marítimo"], ["agenteAduana", "del agente de aduana"], ["depositoTemporal", "del depósito temporal"]].forEach(function (a) {
      var r = g.partes[a[0]].ruc;
      if (/^\d{11}$/.test(r || "")) { avisarRuc(CTRL.ruc(r), a[1], "generales.partes." + a[0] + ".ruc", agregar); }
    });
    // E09: contenedor
    if (!vacio(e.contenedor.numero)) {
      var cc = CTRL.contenedor(e.contenedor.numero);
      if (!cc.valido) {
        agregar("E09", "El contenedor «" + e.contenedor.numero + "» no es válido: " + cc.motivo, ["especificos.contenedor.numero"],
          { como: cc.formato ? "Revisa el número con el B/L o la placa del contenedor; si el resto es correcto, el dígito de control sería " + cc.digitoEsperado + "." :
            "Escribe 4 letras (dueño y categoría, ej. EJMU) + 6 dígitos + 1 dígito de control." });
      }
    }
    // E11: UN/LOCODE
    [["puertoEmbarque", "embarque", !x.imp], ["puertoDescarga", "descarga", x.imp]].forEach(function (p) {
      var cod = g.ruta[p[0]].locode, ruta = "generales.ruta." + p[0] + ".locode";
      if (vacio(cod)) { return; }
      var forma = CTRL.locode(cod);
      if (!forma.valido) {
        agregar("E11", "El código del puerto de " + p[1] + " («" + cod + "») está mal formado: " + forma.motivo, [ruta],
          { como: "Usa el UN/LOCODE de 5 caracteres (ej. PECLL para Callao)." });
      } else if (p[2] && !CTRL.locode(cod, "PE").valido) {
        agregar("E11", "En una " + (x.imp ? "importación" : "exportación") + " el puerto de " + p[1] + " debe ser peruano (código PE…), pero es «" + cod + "».", [ruta],
          { como: "Revisa la ruta: ¿están invertidos los puertos de embarque y descarga?" });
      }
    });
    // A17: IMEI
    e.items.forEach(function (it, i) {
      var malos = [];
      it.equipos.forEach(function (eq) { eq.imeis.forEach(function (im) { if (!CTRL.imei(im).valido) { malos.push(im); } }); });
      if (malos.length) {
        agregar("A17", "Ítem " + (i + 1) + ": " + malos.length + " IMEI con formato o dígito Luhn dudoso (" + malos.slice(0, 3).join(", ") + (malos.length > 3 ? "…" : "") + ").",
          [rutaItem(i, "equipos")]);
      }
    });
  }

  function avisarRuc(cr, quien, ruta, agregar) {
    if (!cr.valido) {
      agregar("A09", "El RUC " + quien + " no cumple el dígito verificador módulo 11 (" + cr.motivo + ")", [ruta]);
    } else if (!cr.prefijoUsual) {
      agregar("A09", "El RUC " + quien + " empieza por un prefijo distinto de 10 o 20.", [ruta]);
    }
  }

  function revisarValores(x, agregar) {
    var op = x.op, r = x.r;
    if (op.especificos.items.length) {
      var fob = x.imp ? r.fob.total : r.exportacion.s65;
      if (Calculos.comparar(fob, Calculos.cero) <= 0) {
        agregar("E12", "El FOB " + (x.imp ? "total (IT C 5.9)" : "(S 6.5)") + " es USD " + F.comercial(fob) + ".",
          x.imp ? ["especificos.valoracion.flete", "especificos.items.0.precioUnitario"] : ["especificos.valoracion.expOtrosDeducibles"]);
      }
      // A10: solo si el umbral tiene una cifra con fuente (hoy es null: PV-03).
      var umbral = NORMATIVA.valores.umbralDespachoSimplificadoUsd.valor;
      if (umbral != null && Calculos.comparar(fob, Calculos.aFijo(umbral, 2)) <= 0 && Calculos.comparar(fob, Calculos.cero) > 0) {
        agregar("A10", "El FOB (USD " + F.comercial(fob) + ") no supera el umbral referencial de USD " + F.comercial(Calculos.aFijo(umbral, 2)) + ".", ["generales.aduana.tipoDespacho"]);
      }
      // A16: FOB > US$ 500 pagado en efectivo (importación; el medio de pago es del Formato B).
      var limite = NORMATIVA.valores.umbralMediosPagoUsd.valor;
      if (x.imp && op.generales.comercial.medioPago === "01" && Calculos.comparar(fob, Calculos.aFijo(limite, 2)) > 0) {
        agregar("A16", "El FOB es USD " + F.comercial(fob) + " y el medio de pago es 01 (efectivo).", ["generales.comercial.medioPago"]);
      }
    }
    if (!vacio(op.generales.comercial.moneda) && op.generales.comercial.moneda !== "USD") {
      agregar("E14", "La moneda es «" + op.generales.comercial.moneda + "».", ["generales.comercial.moneda"]);
    }
    if (x.imp && (op.generales.aduana.tipoCambio == null || op.generales.aduana.tipoCambio <= 0)) {
      agregar("E15", op.generales.aduana.tipoCambio == null ? "Falta el tipo de cambio." : "El tipo de cambio es " + op.generales.aduana.tipoCambio + ".",
        ["generales.aduana.tipoCambio"]);
    }
    // E16: lo detecta calculos.js al liquidar cada serie.
    if (x.imp && r.series) {
      r.series.forEach(function (s) {
        if (s.liquidacion && s.liquidacion.tributosDistintos) {
          agregar("E16", "Serie " + s.numero + " (ítems " + s.items.map(function (i) { return i + 1; }).join(", ") + "): los ítems tienen distinta tasa ad valorem, TPI o código «Tipo».",
            s.items.map(function (i) { return rutaItem(i, "tasaAV"); }),
            { como: "Si de verdad tributan distinto, revisa la subpartida (quizás no es la misma); si no, iguala la tasa y los códigos." });
        }
      });
    }
    // E19: cuadres internos del resultado.
    (r.cuadres || []).forEach(function (c) {
      if (!c.ok) {
        agregar("E19", "No cuadra: " + c.texto + " (" + F.damAC(c.a) + " frente a " + F.damAC(c.b) + ").", ["#bloque-cuadres"]);
      }
    });
    // C01 y C02: avisos del cálculo (D12).
    r.avisos.forEach(function (a) {
      if (a.codigo === "C01") {
        var c01 = {
          fob: ["especificos.items.0.precioUnitario", "Revisa cantidades y precios unitarios: el reparto debería seguir el valor de cada ítem."],
          ajustes: ["especificos.items.0.precioUnitario", "Revisa los precios de los ítems objeto de ajuste: el ajuste debería repartirse según su valor."],
          flete: ["especificos.items.0.pesoBrutoBulto", "Revisa los pesos brutos por bulto: el flete debería repartirse según el peso bruto de cada serie."],
          seguro: ["especificos.items.0.precioUnitario", "Revisa precios y gastos: el seguro debería repartirse según el FOB de cada serie."]
        }[a.concepto] || ["especificos.items.0.precioUnitario", "Revisa los datos de la base del reparto."];
        agregar("C01", a.texto, [c01[0]], { como: c01[1] });
      }
      if (a.codigo === "C02") { agregar("C02", a.texto, ["especificos.items.0.objetoAjuste"]); }
    });
  }

  function revisarFechasYCarga(x, agregar) {
    var t = x.op.especificos.transporte, cont = x.op.especificos.contenedor, r = x.r;
    if (esFecha(t.eta) && esFecha(t.fechaEmbarque) && t.eta < t.fechaEmbarque) {
      agregar("E13", "La ETA (" + fechaTexto(t.eta) + ") es anterior al embarque (" + fechaTexto(t.fechaEmbarque) + ").",
        ["especificos.transporte.eta", "especificos.transporte.fechaEmbarque"]);
    }
    var o = x.op.especificos.origen;
    if (o.solicitaPreferencia === true && esFecha(o.certificadoFecha) && esFecha(t.fechaEmbarque) && o.certificadoFecha > t.fechaEmbarque) {
      agregar("A13", "El certificado de origen es del " + fechaTexto(o.certificadoFecha) + " y el embarque del " + fechaTexto(t.fechaEmbarque) + ".",
        ["especificos.origen.certificadoFecha", "especificos.transporte.fechaEmbarque"]);
    }
    if (x.imp && x.op.generales.aduana.modalidadDespacho === "1-0" && vacio(t.fechaTerminoDescarga)) {
      agregar("A20", "Despacho anticipado (1-0) sin fecha de término de descarga: la casilla A 3.4 quedará POR VERIFICAR.",
        ["especificos.transporte.fechaTerminoDescarga"]);
    }
    var cap = NORMATIVA.valores.capacidadReferencialM3.valor[cont.tipo];
    if (cap != null && Calculos.comparar(r.totales.volumen, Calculos.aFijo(cap, 3)) > 0) {
      agregar("A06", "La carga ocupa " + F.m3(r.totales.volumen) + " m³ y la capacidad referencial del " + cont.tipo + " es ≈ " + cap + " m³ (POR VERIFICAR, PV-16).",
        ["especificos.contenedor.tipo"]);
    }
    var max = NORMATIVA.valores.pesoBrutoMaximoReferencialKg.valor[cont.tipo];
    if (max != null && Calculos.comparar(r.vgm.total, Calculos.aFijo(max, 2)) > 0) {
      agregar("A07", "El VGM es " + F.kg(r.vgm.total) + " kg y el peso bruto máximo referencial del " + cont.tipo + " es " + F.kg(Calculos.aFijo(max, 2)) + " kg (POR VERIFICAR, PV-16).",
        ["especificos.contenedor.tara", "especificos.contenedor.tipo"]);
    }
  }

  // E17: celulares (RS 129-2026): un equipo registrado por unidad, con serie e IMEI, sin repetidos.
  function revisarImei(x, agregar) {
    var cfg = NORMATIVA.valores.imei;
    var fecha = x.op.generales.aduana.fechaFormulacion;
    if (!x.imp || !esFecha(fecha) || fecha < cfg.vigenteDesde) { return; }
    var objetivo = cfg.subpartidas.map(soloDigitos);
    // F4-M2/M3: unicidad con Set (sin propiedades heredadas) y sin espacios exteriores; se muestra el texto original.
    var series = new Set(), imeis = new Set();
    x.op.especificos.items.forEach(function (it, i) {
      if (objetivo.indexOf(soloDigitos(it.subpartida)) === -1) { return; }
      var problemas = [];
      var cant = x.r.items[i].cantidad;
      if (!Calculos.igual(cant, Calculos.aFijo(it.equipos.length, 0))) {
        problemas.push("hay " + it.equipos.length + " equipo(s) registrado(s) para una cantidad de " + F.cantidad(cant));
      }
      var sinSerie = 0, sinImei = 0, serieRep = [], imeiRep = [];
      it.equipos.forEach(function (eq) {
        var serie = String(eq.serie || "").trim();
        if (!serie) { sinSerie++; } else if (series.has(serie)) { serieRep.push(eq.serie); } else { series.add(serie); }
        if (!eq.imeis.length || eq.imeis.some(vacio)) { sinImei++; }
        eq.imeis.forEach(function (im) {
          var k = String(im || "").trim();
          if (k) { if (imeis.has(k)) { imeiRep.push(im); } else { imeis.add(k); } }
        });
      });
      if (sinSerie) { problemas.push(sinSerie + " equipo(s) sin número de serie"); }
      if (sinImei) { problemas.push(sinImei + " equipo(s) sin IMEI"); }
      if (serieRep.length) { problemas.push("series repetidas: " + serieRep.slice(0, 3).join(", ")); }
      if (imeiRep.length) { problemas.push("IMEI repetidos: " + imeiRep.slice(0, 3).join(", ")); }
      if (problemas.length) {
        agregar("E17", "Ítem " + (i + 1) + " (subpartida " + it.subpartida + ", DAM formulada el " + fechaTexto(fecha) + "): " + problemas.join("; ") + ".",
          [rutaItem(i, "equipos"), rutaItem(i, "cantidad")],
          { como: "Registra un equipo por unidad importada, cada uno con su número de serie y su IMEI (puede tener dos), sin repetir ninguno." });
      }
    });
  }

  // E18: códigos de listas cerradas (marca H: tablas del instructivo; marca S: alcance v1).
  function revisarCodigos(x, agregar) {
    recorrerCampos(x.op, function (c, ruta, valor) {
      if (c.tipo !== "codigo" || !c.lista || vacio(valor)) { return; }
      var lista = NORMATIVA.listas[c.lista];
      if (lista.marca !== "H" && lista.marca !== "S") { return; }   // listas abiertas o pendientes (H*, PV)
      if (NORMATIVA.opcion(c.lista, String(valor))) { return; }
      var muestra = lista.opciones.slice(0, 8).map(function (o) { return o.codigo + " " + o.texto; }).join(" · ");
      agregar("E18", "«" + etiqueta(ruta) + "» tiene el código «" + valor + "», que no está en la lista «" + lista.nombre + "».", [ruta],
        { como: "Usa uno de: " + muestra + (lista.opciones.length > 8 ? " · …" : "") + ".", fuente: lista.fuente, marca: lista.marca });
    });
  }

  // A19: datos con marca H* y POR VERIFICAR que usa la DAM de esta operación.
  function resumenMarcas(op) {
    var hx = [], pv = [];
    recorrerCampos(op, function (c, ruta, valor) {
      if ((c.docs || "").split(" ").indexOf("DAM") === -1) { return; }
      var tienePV = op.marcas[ruta] && op.marcas[ruta].marca === "PV";
      if (vacio(valor) && !tienePV) { return; }
      if (c.tipo === "equipos" && !valor.length) { return; }
      var m = marcaDelDato(op, c, ruta, valor);
      if (m === "H*") { hx.push(ruta); } else if (m === "PV") { pv.push(ruta); }
    });
    return { hx: hx, pv: pv };
  }

  function revisarResumen(x, agregar) {
    var m = x.marcas;
    agregar("A19", "La DAM de esta operación usa " + m.hx.length + " dato(s) con marca H* (conocimiento general, sin fuente en la carpeta) y " +
      m.pv.length + " dato(s) POR VERIFICAR.", m.pv.concat(m.hx));
  }

  var REVISIONES = [revisarObligatorios, revisarIncoterm, revisarSeguro, revisarItems, revisarIdentificadores,
    revisarValores, revisarFechasYCarga, revisarImei, revisarCodigos, revisarResumen];

  // ------------------------------------------------------------------ API

  // Revisa una operación con su resultado de cálculo. Devuelve
  // { hallazgos, errores, advertencias, marcas: { hx, pv } }. Cada hallazgo:
  // { id, severidad, titulo, que, porque, como, rutas, fuente, marca }.
  function validar(op, resultado) {
    var x = {
      op: op, r: resultado,
      imp: op.generales.operacion.tipo === "importacion",
      regla: INCOTERMS.regla(op.generales.comercial.incoterm)
    };
    x.marcas = resumenMarcas(op);
    var hallazgos = [];
    function agregar(id, que, rutas, extra) {
      var rg = REGLAS[id];
      extra = extra || {};
      hallazgos.push({
        id: id, severidad: rg.severidad, titulo: rg.titulo, que: que,
        porque: extra.porque || rg.porque, como: extra.como || rg.como,
        rutas: rutas || [], fuente: extra.fuente || rg.fuente, marca: extra.marca || rg.marca
      });
    }
    REVISIONES.forEach(function (fn) { fn(x, agregar); });
    hallazgos.sort(function (a, b) { return ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id); });
    return {
      hallazgos: hallazgos,
      errores: hallazgos.filter(function (h) { return h.severidad === "error"; }),
      advertencias: hallazgos.filter(function (h) { return h.severidad === "advertencia"; }),
      marcas: x.marcas
    };
  }

  // ¿Hay errores que bloquean los documentos? Los documentos (F6+) deben consultarla antes de generarse.
  function hayErrores(revision) {
    return !!(revision && revision.errores && revision.errores.length);
  }

  // IDs distintos presentes, en orden (útil para pruebas y para la hoja resumen).
  function ids(revision) {
    var vistos = [];
    revision.hallazgos.forEach(function (h) { if (vistos.indexOf(h.id) === -1) { vistos.push(h.id); } });
    return vistos;
  }

  return {
    reglas: REGLAS,
    orden: ORDEN,
    condiciones: CONDICIONES,
    validar: validar,
    hayErrores: hayErrores,
    ids: ids,
    etiqueta: etiqueta
  };
})();
