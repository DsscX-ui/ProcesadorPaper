/* Plantillas: DAM — FORMATO C, LIQUIDACIÓN DE LA DEUDA TRIBUTARIA ADUANERA, representación DIDÁCTICA (PLAN §3 doc 4,
   §6.6; fase F8c). Solo importación para el consumo (IT IV.1: el Formato C se usa en los regímenes que requieren
   cancelar o garantizar tributos; en la exportación no se genera). Solo en español (§11.8). Casillas de IT D.
   - Rubro 3 (valor en aduana): 3.1–3.5 = A 6.1–6.5. Rubro 4 (liquidación): 4.1–4.9 con el TOTAL de la declaración;
     antes, un cuadro con el detalle por serie (la liquidación se calcula por serie y luego se suma, §6.6; el IT D
     solo trae las casillas del total). 4.8 servicio de despacho: POR VERIFICAR (PV-02), sin monto inventado;
     4.9 interés compensatorio: no aplica en v1 [S]. Rubro 5: pago en soles al tipo de cambio venta [H: IT D 5].
   - La percepción del IGV NO es una casilla del Formato C (PV-01): va en un recuadro didáctico «fuera del Formato C».
   - Cifras no enteras con 3 decimales (IT IV.3), en USD (IT IV.4); soles con 2 decimales [S; PV-08]; fechas DD MM AAAA.
   - Misma rejilla y reglas D17/D18 que los Formatos A y B (Documentos.dam): casillas vacías, en 0 o que no aplican
     EN BLANCO con el motivo en la ayuda «?»; códigos oficiales abiertos en blanco con PV pequeña.
   Solo LEE la operación y el resultado de Calculos.calcular (valorAduana, series[].liquidacion, liquidacion,
   percepcion, soles); no calcula ni redondea. Script clásico: se registra después del Formato B y antes de la hoja resumen. */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el, X = D.dam;
  var casilla = X.casilla, rubro = X.rubro, lineas = X.lineas, marcaMini = X.marcaMini, fechaDam = X.fechaDam;
  var F = "IT D";

  // ---------------------------------------------------------------- Presentación (sin calcular)

  function opc(lista, codigo, soloTexto) { return D.opcion(lista, codigo, soloTexto); }
  function esImp(ctx) { return ctx.r.tipo === "importacion"; }

  // Monto USD de una casilla: 3 decimales; en 0, la casilla queda EN BLANCO (D17) y la ayuda lo dice.
  function monto(x) { return x == null || Calculos.esCero(x) ? "" : Fm.damAC(x); }
  var SIN_MONTO = "Sin monto en esta operación (0).";

  // Dato con su marca efectiva (H* o PV) y, si la operación lo marca SUPUESTO, una «S» pequeña con su nota.
  function dato(ctx, texto, ruta) {
    if (texto == null || texto === "") { return ""; }
    var n = X.marcado(ctx, texto, ruta);
    var m = ctx.op.marcas[ruta];
    if (m && m.marca === "S") { n.appendChild(marcaMini("S", "Supuesto: " + (m.nota || "dato del ejemplo."))); }
    return n;
  }

  // Texto con etiquetas de marca (H*, PV) al final: [["H*", nota], ["PV", nota]].
  function conMarcas(texto, marcas) {
    var s = el("span", null, texto);
    marcas.forEach(function (m) { s.appendChild(document.createTextNode(" ")); s.appendChild(D.etiquetaMarca(m[0], m[1])); });
    return s;
  }

  // ---------------------------------------------------------------- Cabecera y rubros 1–2

  function cabecera(ctx, cuerpo) {
    var g = ctx.op.generales;
    cuerpo.appendChild(rubro("", "Cabecera", [
      casilla("", "Aduana – código", X.marcado(ctx, opc("aduana", g.aduana.aduana), "generales.aduana.aduana"), { fuente: F + ", ADUANA – CÓDIGO", ancho: 2 }),
      casilla("", "N° de orden", g.aduana.numeroOrden, { fuente: F + ", Nº ORDEN (año + 6 caracteres; lo asigna el declarante)" }),
      casilla("", "Destinación", opc("destinacion", "10"), { fuente: F + ", DESTINACIÓN" }),
      casilla("", "Modalidad", opc("modalidadDespacho", g.aduana.modalidadDespacho), { fuente: F + ", MODALIDAD" }),
      // Sin lista de tipos de despacho para el régimen 10 (como en el Formato A, D18 c).
      casilla("", "Tipo de despacho", g.aduana.tipoDespacho ? X.marcado(ctx, g.aduana.tipoDespacho, "generales.aduana.tipoDespacho") :
        marcaMini("PV", "El instructivo no trae lista de tipos de despacho para la importación para el consumo."), { fuente: F + ", TIPO DESPACHO" }),
      casilla("", "Número de declaración", "", { fuente: F + ", NÚMERO DE DECLARACIÓN", estado: "no-llenar", ancho: 2 })
    ], "dam-cabecera"));
  }

  function rubros1y2(ctx, cuerpo) {
    var imp = ctx.op.generales.partes.comprador;
    cuerpo.appendChild(rubro("1.", "Identificación", [
      casilla("1.1", "Importador o beneficiario", imp.razonSocial, { fuente: F + " 1 (importador o beneficiario)", ancho: 2 }),
      casilla("1.2", "Código y documento de identificación", opc("documentoIdentidad", "4") + " " + (imp.idFiscal || ""), { fuente: F + " 1.2", ancho: 2 }),
      casilla("1.3", "Almacén / depósito – RUC", X.agente(ctx, "depositoTemporal"), { fuente: F + " 1.3 (razón social y RUC del almacén aduanero); RUC o código: PV-28", ancho: 2 })
    ]));
    cuerpo.appendChild(rubro("2.", "Registro de aduana", [
      casilla("2", "Nº declaración · fecha de numeración · canal", el("strong", "dam-no-numerada", "NO NUMERADA"),
        { fuente: F + " 2: casilla de uso exclusivo de la Autoridad Aduanera", ancho: 6, nota: "Documento didáctico: nunca lleva número de declaración ni canal." })
    ]));
  }

  // ---------------------------------------------------------------- Rubro 3: valor en aduana (= A 6.1–6.5)

  function rubro3(ctx, cuerpo) {
    var va = ctx.r.valorAduana;
    cuerpo.appendChild(rubro("3.", "Valor aduana (US$) — base imponible", [
      casilla("3.1", "FOB", Fm.damAC(va.fob), { fuente: F + " 3.1 (= A 6.1)", cuadre: "c31" }),
      casilla("3.2", "Flete", Fm.damAC(va.flete), { fuente: F + " 3.2 (= A 6.2)", cuadre: "c32" }),
      casilla("3.3", "Seguro", Fm.damAC(va.seguro), { fuente: F + " 3.3 (= A 6.3)", cuadre: "c33" }),
      casilla("3.4", "Ajuste valor", Fm.damAC(va.ajuste), { fuente: F + " 3.4 (= A 6.4)", cuadre: "c34" }),
      casilla("3.5", "Valor aduana", el("strong", null, Fm.damAC(va.total)), { fuente: F + " 3.5 (= 3.1 + 3.2 + 3.3 + 3.4 = A 6.5)", cuadre: "c35", ancho: 2 })
    ]));
  }

  // ---------------------------------------------------------------- Rubro 4: liquidación

  // Cuadro por serie (no es casilla del IT D): la liquidación se hace por serie y luego se suma (§6.6).
  function porSerie(ctx) {
    var r = ctx.r, l = r.liquidacion, va = r.valorAduana;
    var c = function (x, clave) { return D.cifra(Fm.damAC(x), clave); };
    var filas = r.series.map(function (s) {
      var x = s.liquidacion, n = s.numero;
      return [String(n), c(s.valorAduana, "cVa" + n), Fm.pct(x.tasaAV), c(x.adValorem, "c41s" + n), Fm.damAC(x.sobretasa), Fm.damAC(x.derechoEspecifico),
        Fm.damAC(x.isc), c(x.baseIgv, "cBase" + n), c(x.ipm, "c45s" + n), c(x.igv, "c46s" + n), Fm.damAC(x.antidumping), c(x.total, "cTot" + n)];
    });
    var t = D.tabla([
      { es: "Serie", en: "" }, { es: "Valor aduana (A 7.34)", en: "", num: true }, { es: "Tasa AV", en: "", num: true },
      { es: "4.1 AV", en: "", num: true }, { es: "4.2", en: "", num: true }, { es: "4.3", en: "", num: true }, { es: "4.4", en: "", num: true },
      { es: "Base IGV", en: "", num: true }, { es: "4.5 IPM", en: "", num: true }, { es: "4.6 IGV", en: "", num: true },
      { es: "4.7", en: "", num: true }, { es: "Total", en: "", num: true }
    ], filas, { clase: "dam-tabla-c", pie: [{ celdas: ["Total", Fm.damAC(va.total), "", Fm.damAC(l.adValorem), Fm.damAC(l.sobretasa), Fm.damAC(l.derechoEspecifico),
      Fm.damAC(l.isc), D.cifra(Fm.damAC(l.baseIgv), "cBase"), Fm.damAC(l.ipm), Fm.damAC(l.igv), Fm.damAC(l.antidumping), Fm.damAC(l.total)] }] });
    var caja = el("section", "dam-didactico dam-c-series");
    caja.appendChild(el("h4", null, "Liquidación por serie (cuadro didáctico: se calcula por serie y se suma; el IT D solo trae las casillas del total)"));
    caja.appendChild(t);
    var p = el("p");
    p.appendChild(conMarcas("Base del IGV = valor aduana + 4.1 + 4.2 + 4.3 + 4.4; el antidumping (4.7) queda fuera.", [["H*", "Art. 13 de la Ley del IGV: sin fuente en la carpeta."], ["PV", "PV-17: antidumping fuera de la base del IGV [S]."]]));
    p.appendChild(document.createTextNode(" IGV = " + Fm.pct(l.igvPct) + " × base; IPM = " + Fm.pct(l.ipmPct) + " × base. "));
    p.appendChild(conMarcas("Tasas de AV, sobretasa, específico, ISC y antidumping: datos del usuario.", [["PV", "PV-11: tasas del arancel por verificar."]]));
    caja.appendChild(p);
    // Una línea por serie con la aritmética («por qué cuadran las cifras»).
    r.series.forEach(function (s) {
      var x = s.liquidacion, otros = Calculos.esCero(x.otrosDerechos) ? "" : " + " + Fm.damAC(x.otrosDerechos);
      caja.appendChild(el("p", "dam-c-cuenta", "Serie " + s.numero + ": base = " + Fm.damAC(s.valorAduana) + " + " + Fm.damAC(x.adValorem) + " (AV " + Fm.pct(x.tasaAV) + ")" + otros +
        " = " + Fm.damAC(x.baseIgv) + " → IGV " + Fm.damAC(x.igv) + " · IPM " + Fm.damAC(x.ipm) + "."));
    });
    return caja;
  }

  function rubro4(ctx, cuerpo) {
    var l = ctx.r.liquidacion;
    var c4 = function (num, rot, x, fuente, ancho, cuadre) {
      var v = monto(x), o = { fuente: F + " " + num + (fuente ? " " + fuente : ""), ancho: ancho, motivo: v ? "" : SIN_MONTO };
      if (cuadre && v) { o.cuadre = cuadre; }
      return casilla(num, rot, v, o);
    };
    var base = conMarcas(Fm.damAC(l.baseIgv), [["H*", "Art. 13 de la Ley del IGV: valor aduana + derechos (sin fuente en la carpeta)."]]);
    var total = el("strong", null, Fm.damAC(l.total));
    var rub = rubro("4.", "Liquidación de la deuda tributaria aduanera y recargos (US$)", [
      c4("4.1", "Ad / valorem", l.adValorem, "(valor aduana × tasa de cada serie; PV-11)", 2, "c41"),
      c4("4.2", "Sobretasa A/V", l.sobretasa, "(PV-11)"),
      c4("4.3", "Derecho específico", l.derechoEspecifico, "(PV-11)"),
      c4("4.4", "Impuesto Selectivo al Consumo", l.isc, "(PV-11)", 2),
      casilla("", "Base del IGV (cálculo, sin casilla)", base, { fuente: "PLAN §6.6: valor aduana + 4.1 + 4.2 + 4.3 + 4.4 (sin 4.7)", ancho: 2 }),
      c4("4.5", "Impuesto de Promoción Municipal", l.ipm, "(" + Fm.pct(l.ipmPct) + " × base del IGV [H*])", 2, "c45"),
      c4("4.6", "Impuesto General a las Ventas", l.igv, "(" + Fm.pct(l.igvPct) + " × base del IGV [H*])", 2, "c46"),
      c4("4.7", "Derechos antidumping", l.antidumping, "(o compensatorios; fuera de la base del IGV: PV-17)", 2),
      casilla("4.8", "Servicio despacho", X.porVerificar("PV-02: monto y base del servicio de despacho"), { fuente: F + " 4.8; PV-02", ancho: 2,
        motivo: "La herramienta no calcula este concepto ni inventa su monto (PV-02)." }),
      casilla("4.9", "Interés compensatorio", "", { fuente: F + " 4.9", ancho: 2, estado: "no-aplica",
        motivo: "No aplica en v1 [S]: la herramienta no trata regímenes ni casos que generen interés compensatorio." }),
      casilla("4.10", "—", "", { fuente: F + " 4.10", motivo: "Casilla sin rótulo en el instructivo." }),
      casilla("4.11", "—", "", { fuente: F + " 4.11", motivo: "Casilla sin rótulo en el instructivo." }),
      casilla("4.12", "—", "", { fuente: F + " 4.12", motivo: "Casilla sin rótulo en el instructivo." }),
      casilla("4.13", "—", "", { fuente: F + " 4.13", motivo: "Casilla sin rótulo en el instructivo." }),
      casilla("", "Total", total, { fuente: F + " 4, Total (4.1 a 4.7; sin 4.8, POR VERIFICAR)", ancho: 2, cuadre: "cTotal",
        nota: "No incluye el servicio de despacho (4.8, PV-02)." })
    ]);
    // El cuadro por serie va dentro del rubro, antes de la rejilla de totales.
    rub.insertBefore(porSerie(ctx), rub.querySelector(".dam-rejilla"));
    cuerpo.appendChild(rub);
  }

  // ---------------------------------------------------------------- Rubro 5: formas de pago (soles)

  function rubro5(ctx, cuerpo) {
    var g = ctx.op.generales, so = ctx.r.soles, A = "generales.aduana.";
    var tc = so.disponible ? dato(ctx, Fm.numero(so.tipoCambio, 3), A + "tipoCambio") : "";
    var fecha = fechaDam(g.aduana.tipoCambioFecha);
    var fuente = g.aduana.tipoCambioFuente ? dato(ctx, g.aduana.tipoCambioFuente, A + "tipoCambioFuente") : "";
    var soles = "";
    if (so.disponible) {
      var fuerte = el("strong");
      fuerte.appendChild(D.cifra("S/ " + Fm.comercial(so.tributos), "cSoles"));
      fuerte.appendChild(marcaMini("S", "Supuesto: soles con 2 decimales y redondeo mitad hacia arriba (PV-08)."));
      soles = lineas([fuerte, "= US$ " + Fm.damAC(ctx.r.liquidacion.total) + " × " + Fm.numero(so.tipoCambio, 3)]);
    }
    cuerpo.appendChild(rubro("5.", "Formas de pago (en soles, al tipo de cambio venta de la fecha de pago)", [
      casilla("", "Forma de pago (1 cheque · 2 efectivo · 3 doc. valorado · 4 pago electrónico)", "", { fuente: F + " 5 (este recuadro se llena en forma manual)", ancho: 2,
        motivo: "La elige el declarante al pagar y se llena a mano (IT D 5); la herramienta no la pide." }),
      casilla("", "Tipo de cambio venta (S/ por US$)", tc, { fuente: F + " 5 (tipo venta de la fecha de pago); fuente: PV-07", motivo: tc ? "" : "Sin tipo de cambio válido (E15)." }),
      casilla("", "Fecha del tipo de cambio", fecha, { fuente: F + " 5", motivo: fecha ? "" : "Sin dato: debe ser la fecha en que se efectúa el pago (IT D 5)." }),
      casilla("", "Fuente del tipo de cambio", fuente, { fuente: "PV-07 (quién publica el tipo de cambio)", ancho: 2, motivo: fuente ? "" : "Sin dato (PV-07)." }),
      casilla("", "Total tributos en soles (total del rubro 4 × tipo de cambio)", soles, { fuente: F + " 5; 2 decimales [S; PV-08]", ancho: 6, motivo: soles ? "" : "No calculado: falta un tipo de cambio válido (E15)." })
    ]));
  }

  // ---------------------------------------------------------------- Rubros 6–8

  function rubros6a8(ctx, cuerpo) {
    var g = ctx.op.generales;
    cuerpo.appendChild(rubro("6.", "Declarante", [
      casilla("6", "Despachador de aduana · código · fecha de formulación", lineas([X.agente(ctx, "agenteAduana"), "Fecha de formulación: " + fechaDam(g.aduana.fechaFormulacion)]),
        { fuente: F + " 6; RUC o código: PV-28", ancho: 4 }),
      casilla("", "Firma y sello del representante legal", "", { fuente: F + " 6", ancho: 2, motivo: "Firma y sello del representante legal ante SUNAT: documento didáctico, sin firma." })
    ]));
    cuerpo.appendChild(rubro("", "Casillas 7 y 8 (Aduana y banco)", [
      casilla("7", "Para ser llenado por Aduanas (fianzas)", "", { fuente: F + " 7", estado: "reservada", ancho: 3 }),
      casilla("8", "Para ser llenado por banco / caja", "", { fuente: F + " 8", estado: "reservada", ancho: 3,
        motivo: "Reservada al banco recaudador o a la caja de la Autoridad Aduanera (IT D 8)." })
    ], "dam-reservadas"));
  }

  // ---------------------------------------------------------------- Percepción: FUERA del Formato C

  function percepcion(ctx, cuerpo) {
    var p = ctx.r.percepcion, so = ctx.r.soles;
    var caja = el("section", "dam-didactico dam-fuera");
    caja.setAttribute("data-fuera", "percepcion");
    var h = el("h4", null, "Percepción del IGV — FUERA DEL FORMATO C (cuadro didáctico) ");
    h.appendChild(D.etiquetaMarca("PV", "PV-01: la percepción no figura entre las casillas del Formato C; su tasa depende del importador."));
    caja.appendChild(h);
    caja.appendChild(el("p", null, "No es una casilla del Formato C: se muestra aquí porque el importador la paga junto con los tributos. " +
      "Es un solo valor por operación (decisiones D2 y D6): la tasa depende del importador y, en algunos casos, de la mercancía (bienes usados, exclusiones)."));
    var b = el("p");
    b.appendChild(document.createTextNode("Base = valor aduana " + Fm.damAC(p.valorAduana) + " + tributos del Formato C " + Fm.damAC(p.tributos) +
      " (incluye antidumping " + Fm.damAC(p.antidumping) + " "));
    b.appendChild(D.etiquetaMarca("H*", "Ley 29173: el antidumping integra la base de la percepción (sin fuente en la carpeta; decisión D11)."));
    b.appendChild(document.createTextNode(" "));
    b.appendChild(D.etiquetaMarca("PV", "PV-17: verificar el tratamiento del antidumping."));
    b.appendChild(document.createTextNode(") = "));
    b.appendChild(D.cifra(Fm.damAC(p.base), "cPercepcionBase"));
    caja.appendChild(b);
    var m = el("p");
    m.appendChild(document.createTextNode("Percepción = " + Fm.pct(p.tasa) + " "));
    m.appendChild(D.etiquetaMarca("PV", "PV-01: tasa supuesta para el caso; depende del importador."));
    m.appendChild(document.createTextNode(" × " + Fm.damAC(p.base) + " = US$ "));
    m.appendChild(el("strong")).appendChild(D.cifra(Fm.damAC(p.monto), "cPercepcion"));
    if (so.disponible) {
      m.appendChild(document.createTextNode(" → S/ "));
      m.appendChild(D.cifra(Fm.comercial(so.percepcion), "cPercepcionSoles"));
      m.appendChild(document.createTextNode(" (× " + Fm.numero(so.tipoCambio, 3) + ")."));
    }
    caja.appendChild(m);
    if (so.disponible) {
      caja.appendChild(el("p", null, "Total a pagar en soles (tributos del Formato C + percepción) = S/ " + Fm.comercial(so.tributos) +
        " + S/ " + Fm.comercial(so.percepcion) + " = S/ " + Fm.comercial(so.total) + ". No incluye el servicio de despacho (4.8, PV-02)."));
    }
    cuerpo.appendChild(caja);
  }

  // ---------------------------------------------------------------- Hoja

  function nota(ctx, cuerpo) {
    var p = el("p", "doc-nota doc-nota-hr");
    p.appendChild(document.createTextNode("Formato C: la liquidación de la deuda tributaria aduanera (IT IV.1), solo en la importación. " +
      "La formula el despachador de aduana con los valores del Formato A (3.1–3.5 = A 6.1–6.5). Casillas y contenido según el instructivo DESPA-IT.00.04, IT D; " +
      "el diseño gráfico del anexo no está en la copia local, por eso la disposición es didáctica (PV-23). Cifras no enteras con 3 decimales en USD (IT IV.3, IV.4); " +
      "soles con 2 decimales [S]; fechas DD MM AAAA (IT IV.6). La DAM real se transmite electrónicamente y prevalece (IT IV.8). "));
    p.appendChild(X.leyenda());
    cuerpo.appendChild(p);
  }

  function formatoC(ctx) {
    var m = D.hoja(this, ctx, "Liquidación · importación para el consumo (10) · N° de orden " + (ctx.op.generales.aduana.numeroOrden || "—"));
    m.hoja.classList.add("hoja-dam");
    var cuerpo = m.cuerpo;
    nota(ctx, cuerpo);
    cabecera(ctx, cuerpo);
    rubros1y2(ctx, cuerpo);
    rubro3(ctx, cuerpo);
    rubro4(ctx, cuerpo);
    rubro5(ctx, cuerpo);
    rubros6a8(ctx, cuerpo);
    percepcion(ctx, cuerpo);
    return m.hoja;
  }

  D.registrar({ id: "dam_c", codigo: "DAM C", es: "DAM — Formato C", en: "liquidación",
    titulo: "DECLARACIÓN ADUANERA DE MERCANCÍAS — FORMATO C", tituloEn: "LIQUIDACIÓN · REPRESENTACIÓN DIDÁCTICA",
    nota: "Solo en la importación. Liquidación de los tributos (IT D): valor en aduana, tributos por serie y pago en soles. La percepción va fuera del formato.",
    aplica: esImp,
    generar: formatoC });
})();
