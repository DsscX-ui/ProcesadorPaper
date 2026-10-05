/* Plantillas: DAM — FORMATO B (+ B1), DECLARACIÓN DEL VALOR, representación DIDÁCTICA (PLAN §3 doc 4; fase F8b).
   Solo importación para el consumo (IT IV.1: el Formato B acompaña a la importación para el consumo y a las
   admisiones temporales; en la exportación no se genera). Solo en español (§11.8). Casillas de IT C.
   - IT IV.1: el B1 se usa cuando se declaran más de 2 ítems. Aquí el Formato B lleva los rubros 1–4, los ítems 1 y 2
     y los rubros 6–8; el B1, los ítems 3 a N. Cuántos ítems caben en cada hoja B1 depende del diseño gráfico del
     anexo, que no está en la copia del instructivo (PV-23): los ítems siguen uno tras otro.
   - Cifras no enteras con 6 decimales (IT IV.3), en USD (IT IV.4); fechas DD MM AAAA (IT IV.6).
   - Misma rejilla que el Formato A (Documentos.dam, de dam_a.js) y mismas reglas D17/D18: casillas vacías o que no
     aplican EN BLANCO (el motivo, en la ayuda «?»); códigos oficiales abiertos en blanco con PV pequeña; supuestos
     del ejemplo con una «S» pequeña. Los rótulos de 8.1.2, 8.1.3 y 8.1.5 no figuran en la copia del instructivo:
     POR VERIFICAR, nunca inventados.
   Solo LEE la operación y el resultado de Calculos.calcular (FOB y ajuste por ítem, sección 8, formatoB);
   no calcula ni redondea. Script clásico: se registra en Documentos (después del Formato A, antes de la hoja resumen). */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el, X = D.dam;
  var casilla = X.casilla, rubro = X.rubro, lineas = X.lineas, marcaMini = X.marcaMini, fechaDam = X.fechaDam;
  var ITEMS_EN_B = 2;   // IT IV.1: el B1 se usa con más de 2 ítems.

  // ---------------------------------------------------------------- Presentación (sin calcular)

  function opc(lista, codigo, soloTexto) { return D.opcion(lista, codigo, soloTexto); }
  function esImp(ctx) { return ctx.r.tipo === "importacion"; }
  function it(ctx, i) { return ctx.op.especificos.items[i]; }
  function rutaItem(i, campo) { return "especificos.items." + i + "." + campo; }

  // Dato con su marca efectiva (H* o PV) y, si la operación lo marca SUPUESTO, una «S» pequeña con su nota.
  // Vacío → "" (la casilla queda en blanco).
  function dato(ctx, texto, ruta) {
    if (texto == null || texto === "" || texto === "—") { return ""; }
    var n = X.marcado(ctx, texto, ruta);
    var m = ctx.op.marcas[ruta];
    if (m && m.marca === "S") { n.appendChild(marcaMini("S", "Supuesto: " + (m.nota || "dato del ejemplo."))); }
    return n;
  }

  // Monto de la sección 8 (6 decimales). En 0, la casilla queda en blanco (D17) y la ayuda lo dice.
  function monto(x) { return Calculos.esCero(x) ? "" : Fm.damB(x); }

  // Rótulo que no figura en la copia del instructivo: descripción + POR VERIFICAR (no se inventa el nombre oficial).
  function rotuloPv(descripcion) {
    var s = el("span", null, descripcion + " ");
    s.appendChild(D.etiquetaMarca("PV", "El rótulo exacto de la casilla no figura en la copia del instructivo (IT C 8.1): se describe su contenido."));
    return s;
  }

  // Respuesta 1 / 2 (rubros 6 y 7): «2 — No» con su marca.
  function siNo(ctx, codigo, ruta) { return codigo ? dato(ctx, opc("siNo", codigo), ruta) : ""; }

  // ---------------------------------------------------------------- Rubros 1 a 4

  function rubros1a4(ctx, cuerpo) {
    var g = ctx.op.generales, imp = g.partes.comprador, v = g.partes.vendedor, c = g.comercial;
    var P = "generales.partes.";

    // 1. Identificación del importador
    cuerpo.appendChild(rubro("1.", "Identificación", [
      casilla("1.1", "Importador o beneficiario", imp.razonSocial, { fuente: "IT C 1.1", ancho: 3 }),
      casilla("1.2", "Código y documento de identificación", opc("documentoIdentidad", "4") + " " + (imp.idFiscal || ""), { fuente: "IT C 1.2", ancho: 2 }),
      casilla("1.3", "Nivel comercial", dato(ctx, opc("nivelComercial", g.valor.nivelComercial), "generales.valor.nivelComercial"), { fuente: "IT C 1.3" })
    ]));

    // 2. Registro de aduana (reservado; PLAN §3: la DAM didáctica dice «NO NUMERADA»)
    cuerpo.appendChild(rubro("2.", "Registro de aduana", [
      casilla("2", "Registro de aduana", el("strong", "dam-no-numerada", "NO NUMERADA"), { fuente: "IT C 2: casilla reservada para uso exclusivo de la Autoridad Aduanera", ancho: 6,
        nota: "Documento didáctico: nunca lleva número de declaración." })
    ]));

    // 3. Proveedor extranjero
    var correo = v.correo || "", tel = v.telefono || "";
    cuerpo.appendChild(rubro("3.", "Proveedor", [
      casilla("3.1", "Nombre o razón social – código", v.razonSocial, { fuente: "IT C 3.1", ancho: 3,
        motivo: "El código del proveedor se consigna a partir de que la Autoridad Aduanera lo comunica (IT C 3.1); aquí queda en blanco." }),
      casilla("3.2", "Condición", dato(ctx, opc("condicionProveedor", v.condicion), P + "vendedor.condicion"), { fuente: "IT C 3.2", ancho: 3 }),
      casilla("3.3", "Dirección", v.direccion, { fuente: "IT C 3.3 (número, calle, distrito o equivalente)", ancho: 4 }),
      casilla("3.4", "Ciudad", v.ciudad, { fuente: "IT C 3.4", ancho: 2 }),
      casilla("3.5", "País", dato(ctx, opc("pais", v.pais), P + "vendedor.pais"), { fuente: "IT C 3.5", ancho: 2 }),
      casilla("3.6", "Teléfono", tel, { fuente: "IT C 3.6 (código de país, de ciudad y número)", motivo: tel ? "" : "Dato opcional; sin dato en esta operación." }),
      casilla("3.7", "Fax", "", { fuente: "IT C 3.7", motivo: "La herramienta no pide el fax (v1)." }),
      casilla("3.8", "Página web", "", { fuente: "IT C 3.8 (cuando corresponda)", motivo: "Cuando corresponda; la herramienta no la pide (v1)." }),
      casilla("3.9", "E-mail", correo, { fuente: "IT C 3.9 (cuando corresponda)", motivo: correo ? "" : "Dato opcional; sin dato en esta operación." })
    ]));

    // 4. Transacción + «otros datos» que se transmiten electrónicamente (IT C rubro 4, a–k)
    var ef = g.partes.entidadFinanciera;
    var entidad = lineas([ef.nombre || "", ef.codigo && !X.pvPropia(ctx, P + "entidadFinanciera.codigo") ?
      X.marcado(ctx, "Código: " + ef.codigo, P + "entidadFinanciera.codigo") :
      X.codigoEnBlanco("Código", "PV-09: código de la tabla de entidades financieras de SUNAT.")]);
    var credito = c.modalidadPago === "2", pd = c.pagoDiferido, fb = ctx.r.formatoB;
    var soloCredito = "Solo con modalidad de pago 2 (pago a crédito) en A 5.2 (IT C rubro 4, otros datos g–k). Esta operación: " + opc("modalidadPago", c.modalidadPago) + ".";
    var siCredito = function (valor) { return credito ? valor : ""; };
    var OD = "IT C rubro 4, otros datos ";
    var sinResolucion = "Solo si la Autoridad Aduanera emitió una resolución que pueda afectar el valor (anticipada, ajuste de valor permanente, simplificada u otra).";
    cuerpo.appendChild(rubro("4.", "Transacción", [
      casilla("4.1", "Naturaleza", dato(ctx, opc("naturaleza", g.valor.naturaleza), "generales.valor.naturaleza"), { fuente: "IT C 4.1", ancho: 4 }),
      casilla("4.2", "Forma de envío", g.valor.formaEnvio, { fuente: "IT C 4.2 (1/1 = un solo embarque)", ancho: 2 }),
      casilla("a)", "Tipo de medio de pago", dato(ctx, opc("medioPago", c.medioPago), "generales.comercial.medioPago"), { fuente: OD + "a) (modif. RS 81-2019)", ancho: 2 }),
      casilla("b)", "Entidad financiera involucrada", entidad, { fuente: OD + "b)", ancho: 2 }),
      casilla("c)", "Datos de identificación del medio de pago", "", { fuente: OD + "c)", ancho: 2,
        motivo: "N° de operación o de documento que asigna la entidad financiera; la herramienta no lo pide (v1)." }),
      casilla("d)", "Tipo de resolución", "", { fuente: OD + "d)", ancho: 2, motivo: sinResolucion }),
      casilla("e)", "Número de resolución", "", { fuente: OD + "e)", ancho: 2, motivo: sinResolucion }),
      casilla("f)", "Fecha de la resolución", "", { fuente: OD + "f)", ancho: 2, motivo: sinResolucion }),
      casilla("g)", "Indicador de pago diferido parcial", siCredito(fb.pagoDiferidoParcial ? opc("siNo", fb.pagoDiferidoParcial) : ""),
        { fuente: OD + "g) (1 = solo una parte a crédito; 2 = todo a crédito)", motivo: credito ? "" : soloCredito }),
      casilla("h)", "% del pago diferido", siCredito(pd.porcentaje == null ? "" : dato(ctx, pd.porcentaje + " %", "generales.comercial.pagoDiferido.porcentaje")),
        { fuente: OD + "h)", motivo: credito ? "" : soloCredito }),
      casilla("i)", "Plazo del pago diferido", siCredito(pd.plazoDias == null ? "" : dato(ctx, pd.plazoDias + " días", "generales.comercial.pagoDiferido.plazoDias")),
        { fuente: OD + "i) (días calendario desde el evento)", motivo: credito ? "" : soloCredito }),
      casilla("j)", "Evento asociado al plazo", siCredito(dato(ctx, pd.evento ? opc("eventoPagoDiferido", pd.evento) : "", "generales.comercial.pagoDiferido.evento")),
        { fuente: OD + "j)", ancho: 2, motivo: credito ? "" : soloCredito }),
      casilla("k)", "Fecha del pago", siCredito(fechaDam(pd.fecha)), { fuente: OD + "k)", motivo: credito ? "" : soloCredito })
    ]));
  }

  // ---------------------------------------------------------------- Rubro 5: un ítem

  // Cantidad comercial + unidad. «U» va como SUPUESTO pequeño (D18 c, como A 7.16); otra unidad, con su marca.
  function cantidadComercial(ctx, i) {
    var x = it(ctx, i), txt = Fm.damBCantidad(ctx.r.items[i].cantidad) + " " + (x.unidadComercial || "");
    if (x.unidadComercial !== "U") { return X.marcado(ctx, txt, rutaItem(i, "unidadComercial")); }
    var n = el("span", null, txt);
    n.appendChild(marcaMini("S", "Supuesto: RS 129-2026 (anexo VI 6.4) cita «U» como ejemplo; código de la unidad en la tabla de SUNAT: PV-09."));
    return n;
  }

  function item(ctx, i) {
    var op = ctx.op, r = ctx.r, g = op.generales, c = g.comercial, x = it(ctx, i), ri = r.items[i], fb = r.formatoB;
    var total = r.items.length;
    var factura = c.facturaNumero;
    var incoterm = (c.incoterm || "") + " – " + (c.lugarConvenido || "") + " – " + fb.versionIncoterm;
    var moneda = el("span", null, c.moneda || "");
    if (X.esPv(ctx, "generales.comercial.moneda")) { moneda.appendChild(marcaMini("PV", "PV-09: código de la moneda en la tabla de SUNAT (USD es el código ISO 4217).")); }

    var cas = [
      casilla("5.1", "N° ítem / total", ri.numero + "/" + total, { fuente: "IT C 5.1 (numeración consecutiva por declaración)" }),
      casilla("5.2", "N° factura comercial", factura, { fuente: "IT C 5.2", ancho: 2 }),
      casilla("5.3", "Fecha factura", fechaDam(c.facturaFecha), { fuente: "IT C 5.3" }),
      casilla("5.4", "Incoterm – ciudad (– versión)", X.marcado(ctx, incoterm, "generales.comercial.incoterm"),
        { fuente: "IT C 5.4 (modif. RSN 349-2025; versión 4 = Incoterms 2020)", ancho: 2 }),
      casilla("5.5", "Código moneda", moneda, { fuente: "IT C 5.5" }),
      casilla("5.6", "Tipo de valor declarado – código", opc("tipoValor", g.valor.tipoValor), { fuente: "IT C 5.6", ancho: 2 }),
      casilla("5.7", "País origen", dato(ctx, opc("pais", x.paisOrigen), rutaItem(i, "paisOrigen")), { fuente: "IT C 5.7" }),
      casilla("5.8", "País embarque", X.marcado(ctx, opc("pais", fb.paisEmbarque), "generales.ruta.puertoEmbarque.locode"),
        { fuente: "IT C 5.8 (del UN/LOCODE de embarque)" }),
      casilla("5.9", "FOB unitario US$", el("strong", null, Fm.damB(ri.fobUnitario)), { fuente: "IT C 5.9 (FOB del ítem ÷ 5.11)", cuadre: "bFobUnitario" + ri.numero }),
      casilla("5.10", "Ajuste unitario US$", Fm.damB(ri.ajusteUnitario), { fuente: "IT C 5.10 (ajuste del ítem ÷ 5.11)", cuadre: "bAjusteUnitario" + ri.numero }),
      // Datos intermedios del cálculo de IT C 5.9 y 5.10: no son casillas del formato (sin número).
      casilla("", "FOB total del ítem US$ (cálculo, sin casilla)", Fm.damB(ri.fob), { fuente: "IT C 5.9: FOB total × valor del ítem ÷ valor facturado", cuadre: "bFobItem" + ri.numero }),
      casilla("", "Ajuste total del ítem US$ (cálculo, sin casilla)", Fm.damB(ri.ajuste), { fuente: "IT C 5.10: ajuste total repartido entre los ítems objeto de ajuste" }),
      casilla("5.11", "Cantidad unidad comercial – unidad", cantidadComercial(ctx, i), { fuente: "IT C 5.11", ancho: 2 }),
      casilla("5.12", "Nombre del producto", x.nombre, { fuente: "IT C 5.12" }),
      casilla("5.13", "Marca comercial", x.marca, { fuente: "IT C 5.13" }),
      casilla("5.14", "Modelo", x.modelo, { fuente: "IT C 5.14" }),
      casilla("5.15", "Año / aro", "", { fuente: "IT C 5.15", estado: "no-aplica", motivo: "Solo para vehículos automotores y maquinarias (año de fabricación) y bicicletas (aro)." }),
      casilla("5.16", "Estado", dato(ctx, opc("estado", x.estado), rutaItem(i, "estado")), { fuente: "IT C 5.16" }),
      casilla("5.17", "Identificador", "", { fuente: "IT C 5.17", estado: "no-aplica", motivo: "Código 3 = producto digital; no corresponde a esta mercancía." }),
      casilla("5.18", "Posición frente al despacho simplificado / envío gratis", "", { fuente: "IT C 5.18", estado: "no-aplica",
        motivo: "Código 3 (legajamiento de una declaración simplificada) o 4 (envío gratuito); no corresponde." }),
      casilla("5.19", "Características, tipo, clase, variedad, uso o aplicación, presentación, material o composición %", x.descripcion,
        { fuente: "IT C 5.19; descripciones mínimas: PV-21", ancho: 6 }),
      casilla("5.20", "Observaciones", "", { fuente: "IT C 5.20", ancho: 6,
        motivo: "La usan el funcionario aduanero o el importador para complementar lo declarado (por ejemplo, otros medios de pago)." })
    ];
    var bloque = rubro("5.", "Descripción de la mercancía — ítem " + ri.numero + "/" + total, cas, "dam-serie dam-item");
    bloque.setAttribute("data-item", String(ri.numero));
    return bloque;
  }

  // ---------------------------------------------------------------- Rubros 6, 7 y 8

  function rubro6(ctx) {
    var m = ctx.op.generales.valor.intermediario, hubo = m.hubo === "1", R = "generales.valor.intermediario.";
    var solo = "Solo si 6.1 = Sí (1): datos del intermediario (IT C 6).";
    var dI = function (num, rot, valor, ruta, ancho) { return casilla(num, rot, hubo ? dato(ctx, valor, R + ruta) : "", { fuente: "IT C " + num, ancho: ancho, motivo: hubo ? "" : solo }); };
    var c61 = casilla("6.1", "¿Participó en la transacción comercial algún intermediario (agente, comisionista u otro)?", siNo(ctx, m.hubo, R + "hubo"), { fuente: "IT C 6.1", ancho: 3 });
    c61.classList.add("dam-pregunta");
    return rubro("6.", "Intermediario entre importador y proveedor extranjero (1 = sí; 2 = no)", [
      c61,
      dI("6.2", "Nombre del intermediario", m.nombre, "nombre", 3),
      dI("6.3", "Dirección", m.direccion, "direccion", 2),
      dI("6.4", "Ciudad", m.ciudad, "ciudad"),
      dI("6.5", "País", m.pais, "pais"),
      dI("6.6", "Tipo (1 agente de venta, 2 de compra, 3 corredor, 4 otro)", m.tipo, "tipo"),
      dI("6.7", "E-mail, web", m.contacto, "contacto")
    ]);
  }

  function rubro7(ctx) {
    var r7 = ctx.op.generales.valor.rubro7;
    var cas = NORMATIVA.preguntasRubro7.map(function (p) {
      var clave = "p" + p.numero.replace(".", "_"), ruta = "generales.valor.rubro7." + clave;
      var condicionada = p.condicion && !(p.numero === "7.6" ? r7.p7_5 === "1" : r7.p7_1 === "1");
      var n = casilla(p.numero, p.texto, condicionada ? "" : siNo(ctx, r7[clave], ruta), { fuente: "IT C " + p.numero, ancho: 3,
        motivo: condicionada ? p.condicion + " (IT C " + p.numero + ")." : (r7[clave] ? "" : "Sin respuesta: depende de la operación.") });
      n.classList.add("dam-pregunta");
      return n;
    });
    cas.push(casilla("7.15", "—", "", { fuente: "IT C 7.15", estado: "no-llenar", ancho: 3 }));
    cas.push(casilla("7.16–7.20", "—", "", { fuente: "IT C 7.16 a 7.20", estado: "reservada", ancho: 3, motivo: "Reservadas para uso posterior (IT C 7)." }));
    return rubro("7.", "Condiciones de la transacción (1 = sí; 2 = no)", cas);
  }

  // Casilla de la sección 8: monto (en blanco si es 0) con la marca de su dato.
  function c8(ctx, num, rotulo, ancho, extra) {
    var x = ctx.r.formatoB.seccion8[num], campo = INCOTERMS.campoCasilla[num];
    var valor = monto(x);
    if (valor && campo) { valor = dato(ctx, valor, "especificos.valoracion." + campo); }
    var o = { fuente: "IT C " + num + (extra && extra.fuente ? " " + extra.fuente : ""), ancho: ancho, motivo: valor ? "" : (extra && extra.vacio) || "Sin monto en esta operación (0)." };
    if (extra && extra.cuadre) { o.cuadre = extra.cuadre; }
    return casilla(num, rotulo, valor, o);
  }
  function total8(rotulo, ancho, fuente) {
    return casilla("", rotulo, "", { fuente: fuente, ancho: ancho, estado: "reservada", motivo: "Casilla reservada para uso posterior (" + fuente + ")." });
  }

  function rubro8(ctx, cuerpo) {
    var conSeguro = ctx.r.seguro.hay;
    cuerpo.appendChild(rubro("8.", "Determinación del valor (US$) — 8.1 Base de cálculo", [
      c8(ctx, "8.1.1", "Precio neto según factura", 2, { fuente: "(valor de la factura en el Incoterm pactado)", cuadre: "b811" }),
      c8(ctx, "8.1.2", rotuloPv("Monto no incluido en 8.1.1"), 2),
      c8(ctx, "8.1.3", rotuloPv("Monto incluido, distinguido y deducido en la factura"), 2),
      c8(ctx, "8.1.4", "Otros descuentos no aceptables", 2),
      c8(ctx, "8.1.5", rotuloPv("Gastos hasta el lugar de embarque (EXW)"), 2),
      c8(ctx, "8.1.6", "Otros", 1),
      total8("Total base de cálculo", 1, "IT C 8.1")
    ], "dam-seccion8"));
    cuerpo.appendChild(rubro("8.2", "Adiciones (importes no incluidos en 8.1.1 y a cargo del importador; 8.2.3 = bienes y servicios suministrados por el importador)", [
      c8(ctx, "8.2.1", "Comisiones, corretajes, excepto las comisiones de compra", 2),
      c8(ctx, "8.2.2", "Envases y embalajes", 2),
      c8(ctx, "8.2.3.1", "Materiales, componentes, piezas y artículos incorporados", 2),
      c8(ctx, "8.2.3.2", "Herramientas, matrices, moldes y objetos similares", 2),
      c8(ctx, "8.2.3.3", "Materiales consumidos en la producción", 2),
      c8(ctx, "8.2.3.4", "Ingeniería, desarrollo, trabajos artísticos, diseños, planos y croquis realizados fuera del Perú", 2),
      c8(ctx, "8.2.4", "Cánones y derechos de licencia", 2),
      c8(ctx, "8.2.5", "Producto de la reventa, cesión o utilización posterior que revierta al vendedor", 2),
      total8("Total adiciones", 2, "IT C 8.2")
    ], "dam-seccion8"));
    cuerpo.appendChild(rubro("8.3", "Gastos de transporte · 8.4 Seguro", [
      c8(ctx, "8.3.1", "Gastos de transporte desde el lugar de embarque hasta el lugar de importación", 2, { cuadre: "b831" }),
      c8(ctx, "8.3.2", "Gastos de carga, descarga, manipulación en destino y otros gastos de entrega hasta el lugar de importación", 2),
      total8("Total gastos de transporte", 1, "IT C 8.3"),
      c8(ctx, "8.4", "Total gastos de seguro", 1, { cuadre: conSeguro ? "b84" : null,
        vacio: "Mercancía no asegurada: no se consigna monto; el despachador aplica la tabla de porcentajes promedio de seguro en el Formato A (IT C 8.4; PV-06)." })
    ], "dam-seccion8"));
    cuerpo.appendChild(rubro("8.5", "Deducciones (importes incluidos en 8.1.1)", [
      c8(ctx, "8.5.1", "Gastos de entrega posteriores a la importación", 2),
      c8(ctx, "8.5.2", "Construcción, armado, instalación, montaje, mantenimiento y asistencia técnica posteriores a la importación", 2),
      c8(ctx, "8.5.3", "Derechos de aduana y otros tributos", 2),
      c8(ctx, "8.5.4", "Intereses", 2),
      c8(ctx, "8.5.5", "Otros gastos", 2),
      total8("Total deducciones", 2, "IT C 8.5")
    ], "dam-seccion8"));
  }

  // Cuadro didáctico (no es parte del formato): de la sección 8 a las casillas 5.9 y 5.10 (IT C 5.9 y 5.10).
  function cuadroDidactico(ctx, cuerpo) {
    var r = ctx.r, caja = el("section", "dam-didactico");
    caja.appendChild(el("h4", null, "Cómo se llega a 5.9 y 5.10 (cuadro didáctico; no forma parte del formato)"));
    var usados = r.fob.terminos.filter(function (t) { return t.casilla === "8.1.1" || !Calculos.esCero(t.valor); });
    var p = el("p");
    p.appendChild(document.createTextNode("FOB total US$ en " + (r.incoterm || "—") + " (IT C 5.9) = " +
      r.fob.terminos.map(function (t, k) { return (k ? (t.signo > 0 ? " + " : " − ") : "") + t.casilla; }).join("") + " = " +
      usados.map(function (t, k) { return (k ? (t.signo > 0 ? " + " : " − ") : "") + Fm.damB(t.valor); }).join("") + " = "));
    p.appendChild(el("strong")).appendChild(D.cifra(Fm.damB(r.fob.total), "bFobTotal"));
    p.appendChild(document.createTextNode(" (= A 6.1 del Formato A)."));
    caja.appendChild(p);
    var filas = r.items.map(function (ri, i) {
      return [String(ri.numero), it(ctx, i).nombre || "—", Fm.damB(ri.valor), Fm.damB(ri.fob), Fm.damBCantidad(ri.cantidad), Fm.damB(ri.fobUnitario)];
    });
    caja.appendChild(D.tabla([
      { es: "Ítem", en: "" }, { es: "Producto", en: "" }, { es: "Valor en factura", en: "", num: true },
      { es: "FOB del ítem", en: "", num: true }, { es: "Cantidad (5.11)", en: "", num: true }, { es: "FOB unitario (5.9)", en: "", num: true }
    ], filas, { pie: [{ celdas: ["Total", "", Fm.damB(r.totales.valorFactura), Fm.damB(r.fob.total), "", ""] }] }));
    caja.appendChild(el("p", null, "FOB del ítem = FOB total × valor del ítem en factura ÷ " + Fm.damB(r.totales.valorFactura) +
      " (valor facturado); el último ítem recibe el residuo del redondeo para que la suma cuadre (PLAN §6.1). FOB unitario = FOB del ítem ÷ cantidad comercial, con 6 decimales."));
    var aj = r.ajustes;
    caja.appendChild(el("p", null, "Ajuste total US$ (IT C 5.10) = 8.1.2 + 8.1.3 + 8.1.4 + 8.2.1 + 8.2.2 + 8.2.3.1 + 8.2.3.2 + 8.2.3.3 + 8.2.3.4 + 8.2.4 + 8.2.5 = " +
      Fm.damB(aj.total) + (Calculos.esCero(aj.total) ? " (sin ajustes: 5.10 = 0)." :
        "; se reparte solo entre los ítems objeto de ajuste (" + aj.itemsAjustados.join(", ") + ") según su valor facturado (= A 6.4).")));
    cuerpo.appendChild(caja);
  }

  // La herramienta no pide los datos del declarante (v1): la casilla queda EN BLANCO (D17; auditoría F8b-B1),
  // sin líneas de relleno; quién la formula va en la ayuda «?».
  function declarante(cuerpo) {
    cuerpo.appendChild(rubro("", "Declarante del Formato B", [
      casilla("", "Nombre, código y número del documento de identificación y cargo", "",
        { fuente: "IT C, DECLARANTE DEL FORMATO B (RS 80-2019)", ancho: 6,
          motivo: "Sin datos del declarante en esta operación (la herramienta no los pide en v1). Lo formula el importador (persona natural) o el representante legal o la persona autorizada de la empresa importadora; en ningún caso el agente de aduana, que lo suscribe en representación del dueño o consignatario con su clave electrónica." })
    ]));
  }

  // ---------------------------------------------------------------- Hojas

  function itemsB1(ctx) { var n = ctx.r.items.length; return n === ITEMS_EN_B + 1 ? "el ítem " + n : "los ítems " + (ITEMS_EN_B + 1) + " a " + n; }

  function nota(ctx, cuerpo, b1) {
    var p = el("p", "doc-nota doc-nota-hr"), n = ctx.r.items.length;
    p.appendChild(document.createTextNode((b1 ? "Formato B1: " + itemsB1(ctx) + " (IT IV.1: se usa cuando se declaran más de 2 ítems). " :
      "Formato B: la declaración del valor en aduana (IT C), con " + (n > ITEMS_EN_B ? "los ítems 1 y 2; " + itemsB1(ctx) + (n === ITEMS_EN_B + 1 ? " va" : " van") + " en el Formato B1 (IT IV.1). " : (n === 1 ? "su ítem. " : "sus 2 ítems. ")) +
      "La formula el importador o su representante y el agente de aduana la transmite; no se exige presentarla en físico (IT C). ") +
      "Para llenar 5.9 y 5.10 primero se llena la sección 8 (IT C). Casillas y contenido según el instructivo DESPA-IT.00.04, IT C; el diseño gráfico del anexo no está en la copia local, por eso la disposición es didáctica (PV-23). " +
      "Cifras no enteras con 6 decimales en USD (IT IV.3, IV.4); fechas DD MM AAAA (IT IV.6). La DAM real se transmite electrónicamente y prevalece (IT IV.8). "));
    p.appendChild(X.leyenda());
    cuerpo.appendChild(p);
  }

  function marco(def, ctx, sub) {
    var m = D.hoja(def, ctx, sub + " · N° de orden " + (ctx.op.generales.aduana.numeroOrden || "—"));
    m.hoja.classList.add("hoja-dam");
    return m;
  }

  function formatoB(ctx) {
    var m = marco(this, ctx, "Declaración del valor · importación para el consumo (10)"), cuerpo = m.cuerpo;
    nota(ctx, cuerpo, false);
    rubros1a4(ctx, cuerpo);
    ctx.r.items.slice(0, ITEMS_EN_B).forEach(function (ri, i) { cuerpo.appendChild(item(ctx, i)); });
    cuerpo.appendChild(rubro6(ctx));
    cuerpo.appendChild(rubro7(ctx));
    rubro8(ctx, cuerpo);
    cuadroDidactico(ctx, cuerpo);
    declarante(cuerpo);
    return m.hoja;
  }

  function formatoB1(ctx) {
    var n = ctx.r.items.length, g = ctx.op.generales;
    var m = marco(this, ctx, n === ITEMS_EN_B + 1 ? "Ítem " + n : "Ítems " + (ITEMS_EN_B + 1) + " a " + n), cuerpo = m.cuerpo;
    nota(ctx, cuerpo, true);
    // Recordatorio didáctico: el IT no detalla las casillas propias del B1 (PV-23).
    cuerpo.appendChild(rubro("", "Datos de la declaración (recordatorio didáctico en cada hoja B1)", [
      casilla("", "Importador o beneficiario", g.partes.comprador.razonSocial, { fuente: "Rubro 1 del Formato B; recordatorio, no es una casilla del B1", ancho: 3 }),
      casilla("", "N° de orden", g.aduana.numeroOrden, { fuente: "Cabecera del Formato A (IT A, Nº ORDEN)" }),
      casilla("", "Declaración", el("strong", "dam-no-numerada", "NO NUMERADA"), { fuente: "El número lo asigna SUNAT", ancho: 2 })
    ], "dam-cabecera"));
    ctx.r.items.slice(ITEMS_EN_B).forEach(function (ri, k) { cuerpo.appendChild(item(ctx, ITEMS_EN_B + k)); });
    return m.hoja;
  }

  D.registrar({ id: "dam_b", codigo: "DAM B", es: "DAM — Formato B", en: "declaración del valor",
    titulo: "DECLARACIÓN ADUANERA DE MERCANCÍAS — FORMATO B", tituloEn: "DECLARACIÓN DEL VALOR · REPRESENTACIÓN DIDÁCTICA",
    nota: "Solo en la importación. La formula el importador: datos del proveedor, la transacción, los ítems y la determinación del valor (IT C).",
    aplica: esImp,
    generar: formatoB });
  D.registrar({ id: "dam_b1", codigo: "DAM B1", es: "DAM — Formato B1", en: "declaración del valor",
    titulo: "DECLARACIÓN ADUANERA DE MERCANCÍAS — FORMATO B1", tituloEn: "DECLARACIÓN DEL VALOR · REPRESENTACIÓN DIDÁCTICA",
    nota: "Solo con más de 2 ítems: ítems 3 a N (IT IV.1).",
    aplica: function (ctx) { return esImp(ctx) && ctx.r.items.length > ITEMS_EN_B; },
    generar: formatoB1 });
})();
