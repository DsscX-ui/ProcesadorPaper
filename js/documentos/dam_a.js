/* Plantillas: DAM — FORMATO A (+ A1), representación DIDÁCTICA (PLAN §3 doc 4; fase F8a). Solo en español (§11.8).
   - Ingreso de mercancías (importación para el consumo, destinación 10): casillas de IT A.
   - Salida de mercancías (exportación definitiva, destinación 40): casillas de IT B («S x.y» en el plan).
   - IT IV.1: el Formato A lleva los datos generales y la PRIMERA serie; el A1 se usa cuando hay más de una
     serie (aquí, las series 2 a N). Cuántas series caben en cada hoja A1 depende del diseño gráfico del anexo,
     que no está en la copia del instructivo (PV-23): las series siguen una tras otra.
   Cada casilla muestra su número (ej. «7.35»), su rótulo, el valor y, debajo, la fuente (IT A 7.35).
   Cifras con 3 decimales (IT IV.3), en USD (IT IV.4); pesos en kg con 2 decimales (D17); fechas DD MM AAAA (IT IV.6).
   Las casillas que el instructivo manda no llenar, las reservadas y las que no aplican al régimen quedan EN BLANCO
   (D17): conservan número y rótulo; el motivo va en la ayuda emergente de la casilla, no dentro.
   Códigos oficiales sin fuente en la carpeta (PV-09, PV-28): el nombre didáctico y el código EN BLANCO con una marca
   PV pequeña (D18 c), nunca inventado. Otras dudas (DV PV-27, reparto PV-04…) se muestran «POR VERIFICAR».
   Solo LEE la operación y el resultado de Calculos.calcular (series, prorrateos, 6.1–6.5); no calcula ni redondea.
   Script clásico: se registra en Documentos (antes de la hoja resumen). */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;

  // ---------------------------------------------------------------- Presentación (sin calcular)

  // "2026-10-14" → "14 10 2026" (IT IV.6).
  function fechaDam(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    return m ? m[3] + " " + m[2] + " " + m[1] : "";
  }

  // Cifra de la DAM: 3 decimales (IT IV.3).
  function cifra(x) { return x ? Fm.damAC(x) : ""; }

  // Marca pequeña (superíndice «PV» o «S»), con la nota en la ayuda emergente: para códigos oficiales en blanco (D18 c).
  function marcaMini(marca, nota) {
    var m = D.etiquetaMarca(marca, nota);
    m.textContent = marca;
    m.setAttribute("aria-label", (marca === "PV" ? "POR VERIFICAR" : "SUPUESTO") + (nota ? ": " + nota : ""));
    var s = el("sup", "dam-mini");
    s.appendChild(m);
    return s;
  }

  // Código oficial EN BLANCO + marca PV pequeña: «Código: ______ ᴾⱽ» (D18 c).
  function codigoEnBlanco(rotulo, nota) {
    var s = el("span", "dam-codigo", rotulo + ": ");
    s.appendChild(el("span", "dam-blanco"));
    s.appendChild(marcaMini("PV", nota));
    return s;
  }

  // ¿La marca efectiva del dato es POR VERIFICAR? ¿Y la propia de la operación (op.marcas)?
  function esPv(ctx, ruta) { var m = D.marcaEfectiva(ctx, ruta); return !!m && m.marca === "PV"; }
  function pvPropia(ctx, ruta) { var m = ctx.op.marcas[ruta]; return !!m && m.marca === "PV"; }

  // Valor «POR VERIFICAR» visible (también impreso): etiqueta amarilla + motivo corto (PV-xx).
  function porVerificar(motivo) {
    var s = el("span", "dam-pv");
    s.appendChild(D.etiquetaMarca("PV", motivo));
    if (motivo) { s.appendChild(el("span", "dam-pv-motivo", " " + motivo)); }
    return s;
  }

  // Valor + marca efectiva del dato (H* o PV) si la tiene.
  function marcado(ctx, texto, ruta, notaExtra) {
    return D.conMarca(ctx, texto, ruta, notaExtra);
  }

  // Un nodo con varias partes (texto o nodos), separadas por saltos de línea visuales.
  function lineas(partes) {
    var s = el("span");
    partes.filter(function (p) { return p != null && p !== ""; }).forEach(function (p, i) {
      var n = p.nodeType ? p : el("span", null, String(p));
      if (i) { n.classList.add("doc-linea"); }
      s.appendChild(n);
    });
    return s;
  }

  // Casilla numerada. o: { fuente, estado ("no-llenar" | "reservada" | "no-aplica"), motivo, ancho (1–6), nota, rs129, cuadre }.
  // valor: texto, nodo o vacío. Con estado, o sin valor, la casilla queda EN BLANCO (D17): el motivo (el del estado
  // o o.motivo) va solo en la ayuda emergente (title) y en data-estado, no dentro de la casilla.
  var MOTIVOS = { "no-llenar": "No llenar (instructivo)", "reservada": "Reservada a la Administración Aduanera", "no-aplica": "No aplica a este régimen" };
  function casilla(num, rotulo, valor, o) {
    o = o || {};
    var c = el("div", "dam-cas" + (o.ancho ? " dam-w" + o.ancho : ""));
    c.setAttribute("data-casilla", num);
    if (o.estado) { c.setAttribute("data-estado", o.estado); }
    var cab = el("div", "dam-cas-cab");
    if (num) { cab.appendChild(el("span", "dam-num", num)); }
    cab.appendChild(el("span", "dam-rot", rotulo));
    c.appendChild(cab);
    var v = el("div", "dam-valor");
    if (o.estado) {
      // en blanco
    } else if (valor && valor.nodeType) {
      v.appendChild(valor);
    } else if (valor != null && valor !== "") {
      v.textContent = String(valor);
    }
    if (o.cuadre) { v.setAttribute("data-cuadre", o.cuadre); v.classList.add("doc-cifra"); }
    c.appendChild(v);
    if (o.nota) { c.appendChild(el("div", "dam-nota", o.nota)); }
    if (o.rs129) {
      c.appendChild(el("div", "dam-rs129", "7.35 — " + RS129));
    }
    var f = el("div", "dam-fuente", "Fuente: " + (o.fuente || ""));
    c.appendChild(f);
    var motivo = o.motivo || (o.estado ? MOTIVOS[o.estado] : "");
    c.title = (num ? "Casilla " + num + " · " : "") + (o.fuente || "") + (motivo ? " · " + motivo : "");
    return c;
  }

  // RS 129-2026 (CC RS129 art. 1): único cambio de la copia local, párrafo final de IT A 7.35. La nota solo va en las
  // series de importación con subpartida 8517.13.00.00 u 8517.14.00.00 (D18 a); en las demás, la regla queda en la ayuda.
  var RS129 = "párrafo añadido por RS 129-2026, vigente desde el 05-10-2026: en la importación para el consumo de " +
    "celulares (subpartidas 8517.13.00.00 y 8517.14.00.00) se consigna, por cada equipo, su número de serie único y su(s) IMEI, " +
    "que son descripciones mínimas.";
  var SUBPARTIDAS_RS129 = ["8517.13.00.00", "8517.14.00.00"];
  function serieCelulares(ctx, s) {
    return s.items.some(function (i) { return SUBPARTIDAS_RS129.indexOf(String(it(ctx, i).subpartida || "").trim()) !== -1; });
  }

  // Rubro: título + rejilla de casillas (6 columnas).
  function rubro(num, titulo, casillas, clase) {
    var r = el("section", "dam-rubro" + (clase ? " " + clase : ""));
    var h = el("h4", "dam-rubro-tit");
    if (num) { h.appendChild(el("span", "dam-num", num)); h.appendChild(document.createTextNode(" ")); }
    h.appendChild(document.createTextNode(titulo));
    r.appendChild(h);
    var g = el("div", "dam-rejilla");
    casillas.forEach(function (c) { if (c) { g.appendChild(c); } });
    r.appendChild(g);
    return r;
  }

  function opc(lista, codigo, soloTexto) { return D.opcion(lista, codigo, soloTexto); }
  function esImp(ctx) { return ctx.r.tipo === "importacion"; }
  function it(ctx, i) { return ctx.op.especificos.items[i]; }
  function rutaItem(i, campo) { return "especificos.items." + i + "." + campo; }

  // Razón social + identificación de un agente. Si el dato falta o la operación lo marca POR VERIFICAR (PV-28: RUC o
  // código de SUNAT), la identificación queda EN BLANCO con una marca PV pequeña (D18 c); si no, se muestra con su marca.
  function agente(ctx, clave) {
    var p = ctx.op.generales.partes[clave], ruta = "generales.partes." + clave + ".ruc";
    var id = !p.ruc || pvPropia(ctx, ruta) ? codigoEnBlanco("RUC / código", "PV-28: RUC o código de SUNAT del agente (sin fuente en la carpeta).")
      : marcado(ctx, "RUC / código: " + p.ruc, ruta);
    return lineas([p.razonSocial || p.nombre || "", id]);
  }

  // ---------------------------------------------------------------- Cabecera (aduana, N° de orden, destinación…)

  function cabecera(ctx, F, a1) {
    var g = ctx.op.generales, imp = esImp(ctx);
    var lista = [
      casilla("", "Aduana – código", marcado(ctx, opc("aduana", g.aduana.aduana), "generales.aduana.aduana"), { fuente: F + ", ADUANA – CÓDIGO", ancho: 2 }),
      casilla("", "N° de orden", g.aduana.numeroOrden, { fuente: F + ", Nº ORDEN (año + 6 caracteres; lo asigna el declarante)" }),
      casilla("", "Destinación", opc("destinacion", imp ? "10" : "40"), { fuente: F + ", DESTINACIÓN" })
    ];
    if (imp) {
      lista.push(casilla("", "Modalidad", opc("modalidadDespacho", g.aduana.modalidadDespacho), { fuente: "IT A, MODALIDAD" }));
      // Sin lista en IT A para el régimen 10: en blanco con PV pequeña (D18 c).
      lista.push(casilla("", "Tipo de despacho", g.aduana.tipoDespacho ? marcado(ctx, g.aduana.tipoDespacho, "generales.aduana.tipoDespacho") :
        marcaMini("PV", "El IT A no trae lista de tipos de despacho para la importación para el consumo."), { fuente: "IT A, TIPO DESPACHO (sin códigos para el régimen 10)" }));
    } else {
      lista.push(casilla("", "Modalidad", "", { fuente: "IT B, MODALIDAD", estado: "no-aplica" }));
      lista.push(casilla("", "Tipo de despacho", opc("tipoDespachoExportacion", g.aduana.tipoDespacho), { fuente: "IT B, TIPO DESPACHO" }));
    }
    if (a1) {
      // Recordatorio didáctico (F8a.1, auditoría F8a-B1): no es una casilla oficial del A1; el número lo asigna SUNAT (IT A / IT B rubro 2).
      lista.push(casilla("", "Declaración (recordatorio didáctico)", el("strong", "dam-no-numerada", "NO NUMERADA"),
        { fuente: "Rubro 2 del Formato A: el número lo asigna SUNAT; no es una casilla del A1", ancho: 2 }));
    } else {
      lista.push(casilla("", imp ? "Número de declaración de importación" : "Número de declaración de exportación", "", { fuente: F + ", NÚMERO DE DECLARACIÓN", estado: "no-llenar", ancho: 2 }));
    }
    return rubro("", a1 ? "Datos de la declaración (se repiten en cada hoja A1)" : "Cabecera", lista, "dam-cabecera");
  }

  // ---------------------------------------------------------------- Formato A: rubros 1 a 6

  function rubros1a6(ctx, cuerpo) {
    var op = ctx.op, r = ctx.r, g = op.generales, t = op.especificos.transporte, imp = esImp(ctx), F = imp ? "IT A" : "IT B";
    var p = imp ? g.partes.comprador : g.partes.vendedor;
    var rutaParte = imp ? "generales.partes.comprador." : "generales.partes.vendedor.";

    // 1. Identificación
    cuerpo.appendChild(rubro("1.", "Identificación", [
      casilla("1.1", imp ? "Importador" : "Exportador", p.razonSocial, { fuente: F + " 1.1", ancho: 3 }),
      casilla("1.2", "Código y documento de identificación", opc("documentoIdentidad", "4") + " " + (p.idFiscal || "—"), { fuente: F + " 1.2", ancho: 3 }),
      casilla("1.3", "Dirección del " + (imp ? "importador" : "exportador"), [p.direccion, p.ciudad].filter(Boolean).join(", "), { fuente: F + " 1.3", ancho: 4 }),
      casilla("1.4", "Código de ubicación geográfica (UBIGEO)", marcado(ctx, opc("ubigeo", p.ubigeo), rutaParte + "ubigeo"), { fuente: imp ? "IT A 1.4" : "IT B 1.4", ancho: 2 })
    ]));

    // 2. Registro de aduana
    var reg = el("strong", "dam-no-numerada", "NO NUMERADA");
    cuerpo.appendChild(rubro("2.", "Registro de aduana", [
      casilla("2", "Nº declaración · fecha de numeración · canal", reg, { fuente: F + " 2: casilla de uso exclusivo de la Autoridad Aduanera (el número lo asigna SUNAT)", ancho: 6,
        nota: "Documento didáctico: nunca lleva número de declaración ni canal (rojo, naranja o verde)." })
    ]));

    // 3. Transporte
    var c34;
    if (imp) {
      var anticipado = g.aduana.modalidadDespacho === "1-0";
      c34 = casilla("3.4", "Fecha término descarga", t.fechaTerminoDescarga ? marcado(ctx, fechaDam(t.fechaTerminoDescarga), "especificos.transporte.fechaTerminoDescarga") :
        (anticipado ? marcaMini("PV", "PV-26: en despacho anticipado el IT no dice qué va aquí.") : ""), { fuente: "IT A 3.4" });
    } else {
      c34 = casilla("3.4", "Fecha término embarque", fechaDam(t.fechaTerminoEmbarque), { fuente: "IT B 3.4 (fecha en que se embarca el último bulto)" });
    }
    cuerpo.appendChild(rubro("3.", "Transporte", [
      casilla("3.1", "Empresa de transporte – " + (imp ? "RUC" : "código") + " (agente marítimo)", agente(ctx, "agenteMaritimo"), { fuente: F + " 3.1; RUC o código: PV-28", ancho: 3 }),
      casilla("3.2", "Nº manifiesto", marcado(ctx, t.manifiesto, "especificos.transporte.manifiesto"),
        { fuente: imp ? "IT A 3.2 (aduana de ingreso – año – número)" : "IT B 3.2 (aduana de salida – año – número)", ancho: 2 }),
      casilla("3.3", "Vía transporte – código", opc("via", "1"), { fuente: F + " 3.3" }),
      c34,
      casilla("3.5", imp ? "Empresa de transporte (tránsito / reembarque)" : "Empresa de transporte (salida por otra aduana)", "", { fuente: F + " 3.5", estado: "no-aplica" }),
      casilla("3.6", imp ? "Unidad de transporte (tránsito / reembarque)" : "Unidad de transporte (salida por otra aduana)", "", { fuente: F + " 3.6", estado: "no-aplica" }),
      imp ? casilla("3.7", "Aduana destino / salida – código", "", { fuente: "IT A 3.7 (solo tránsito, reembarque, Convenio Peruano-Colombiano o Ley de Amazonía)", estado: "no-aplica", ancho: 2 })
        : casilla("3.7", "Aduana salida – código", marcado(ctx, opc("aduana", g.aduana.aduana), "generales.aduana.aduana"), { fuente: "IT B 3.7", ancho: 2 })
    ]));

    // 4. Almacén aduanero
    cuerpo.appendChild(rubro("4.", "Almacén aduanero", [
      casilla("4.1", "Depósito temporal – " + (imp ? "RUC" : "código"), agente(ctx, "depositoTemporal"), { fuente: F + " 4.1; RUC o código: PV-28", ancho: 3 }),
      imp ? casilla("4.2", "Depósito aduanero – RUC", "", { fuente: "IT A 4.2 (solo si el régimen precedente es depósito aduanero)", estado: "no-aplica", ancho: 2 })
        : casilla("4.2", "Depósito aduanero", "", { fuente: "IT B 4.2", estado: "no-llenar", ancho: 2 }),
      casilla("4.3", "Plazo solicitado", "", { fuente: F + " 4.3 (regímenes con plazo)", estado: "no-aplica" })
    ]));

    // 5. Transacción
    var ef = g.partes.entidadFinanciera;
    var entidad = lineas([ef.nombre || "", ef.codigo && !pvPropia(ctx, "generales.partes.entidadFinanciera.codigo") ?
      marcado(ctx, "Código: " + ef.codigo, "generales.partes.entidadFinanciera.codigo") :
      codigoEnBlanco("Código", "PV-09: código de la tabla de entidades financieras de SUNAT.")]);
    cuerpo.appendChild(rubro("5.", "Transacción", [
      casilla("5.1", "Entidad financiera – código", entidad, { fuente: F + " 5.1", ancho: 3 }),
      casilla("5.2", "Modalidad de pago – código", opc("modalidadPago", g.comercial.modalidadPago), { fuente: imp ? "IT A 5.2 (modif. RS 81-2019)" : "IT B 5.2 (remite a IT A 5.2)", ancho: 3 })
    ]));

    // 6. Valor (lee los totales de calculos.js)
    if (imp) {
      var va = r.valorAduana;
      var seguroNota = r.seguroOrigen === "tabla" ? porVerificar("PV-06: % de la tabla de seguros de SUNAT") : null;
      cuerpo.appendChild(rubro("6.", "Valor aduana (USD)", [
        casilla("6.1", "FOB", cifra(va.fob), { fuente: "IT A 6.1 (FOB según IT C 5.9)", cuadre: "dam61" }),
        casilla("6.2", "Flete", cifra(va.flete), { fuente: "IT A 6.2 (puerto de embarque → puerto de destino)", cuadre: "dam62" }),
        casilla("6.3", "Seguro", seguroNota ? lineas([cifra(va.seguro), seguroNota]) : cifra(va.seguro), { fuente: "IT A 6.3", cuadre: seguroNota ? null : "dam63" }),
        casilla("6.4", "Total ajustes", cifra(va.ajuste), { fuente: "IT A 6.4 (Σ B 5.10)", cuadre: "dam64" }),
        casilla("6.5", "Valor aduana", el("strong", null, cifra(va.total)), { fuente: "IT A 6.5 (= 6.1 + 6.2 + 6.3 + 6.4)", cuadre: "dam65", ancho: 2 })
      ]));
    } else {
      var ex = r.exportacion;
      cuerpo.appendChild(rubro("6.", "Valor aduana (USD)", [
        casilla("6.1", "Valor cláusula de venta", cifra(ex.s61), { fuente: "IT B 6.1 (" + (g.comercial.incoterm || "—") + ")", cuadre: "dam61" }),
        casilla("6.2", "Comisión exterior", "", { fuente: "IT B 6.2 (referencial; solo para acogerse a la restitución de derechos)", estado: "no-aplica" }),
        casilla("6.3", "Otros gastos deducibles", cifra(ex.s63), { fuente: "IT B 6.3 (ventas que no son FOB, ej. CFR o CIF)" }),
        casilla("6.4", "Total ajustes", cifra(ex.s64), { fuente: "IT B 6.4 (ventas que no son FOB, ej. EXW)" }),
        casilla("6.5", "Valor neto de entrega (FOB)", el("strong", null, cifra(ex.s65)), { fuente: "IT B 6.5 (= 6.1 − 6.3 + 6.4; = Σ 7.30)", cuadre: "dam65", ancho: 2 })
      ]));
    }
  }

  // ---------------------------------------------------------------- Rubro 7: una serie

  // Descripción 7.35 de la serie: un párrafo por ítem (denominación, descripción, marca y modelo) y equipos (RS 129).
  function descripcionSerie(ctx, s) {
    var caja = el("div", "dam-desc");
    s.items.forEach(function (i) {
      var x = it(ctx, i), ri = ctx.r.items[i];
      var p = el("p", null);
      p.appendChild(el("strong", null, "Ítem " + ri.numero + ": " + (x.nombre || "—")));
      if (x.descripcion) { p.appendChild(document.createTextNode(" — " + x.descripcion)); }
      var mm = [x.marca ? "Marca " + x.marca : "", x.modelo ? "Modelo " + x.modelo : ""].filter(Boolean).join(" · ");
      if (mm) { p.appendChild(document.createTextNode(" · " + mm)); }
      caja.appendChild(p);
      if (x.equipos && x.equipos.length) {
        var ul = el("ul", "dam-equipos");
        x.equipos.forEach(function (eq, k) {
          ul.appendChild(el("li", null, "Equipo " + (k + 1) + ": serie " + (eq.serie || "—") + "; IMEI " + (eq.imeis.join(", ") || "—")));
        });
        caja.appendChild(ul);
      }
    });
    return caja;
  }

  // Cantidad física + unidad. «U» va como SUPUESTO pequeño; otra unidad, con la marca efectiva del dato.
  function unidadFisica(ctx, s, i0) {
    var txt = Fm.damCantidad(s.cantidadFisica) + " " + (s.unidadFisica || "");
    if (s.unidadFisica !== "U") { return marcado(ctx, txt, rutaItem(i0, "unidadFisica")); }
    var n = el("span", null, txt);
    n.appendChild(marcaMini("S", "Supuesto: RS 129-2026 (anexo VI 6.4) cita «U» como ejemplo; no valida la unidad de A 7.16 (código: PV-09)."));
    return n;
  }

  function serie(ctx, s) {
    var op = ctx.op, r = ctx.r, g = op.generales, t = op.especificos.transporte, o = op.especificos.origen, imp = esImp(ctx);
    var F = imp ? "IT A" : "IT B", total = r.series.length, i0 = s.items[0], x0 = it(ctx, i0);
    var nl = function (num, rot, fuenteExtra) { return casilla(num, rot, "", { fuente: F + " " + num + (fuenteExtra || ""), estado: "no-llenar" }); };
    var na = function (num, rot, fuenteExtra, ancho) { return casilla(num, rot, "", { fuente: F + " " + num + (fuenteExtra || ""), estado: "no-aplica", ancho: ancho }); };
    var numItems = s.items.map(function (i) { return r.items[i].numero; });

    var subp = lineas([D.subpartidaMarcada(ctx, s.items), lineas(["DV: ", porVerificar("PV-27: cálculo del dígito verificador")])]);
    var bultos = String(s.bultos);
    // Clase de bulto: el nombre didáctico y el código de SUNAT en blanco (PV-09; D18 c).
    var clase = lineas([opc("claseBulto", x0.claseBulto, true), codigoEnBlanco("Código", "PV-09: código de la clase de bulto en la tabla de SUNAT.")]);
    // Unidad física: «U» es un SUPUESTO (D18 c): RS129 anexo VI 6.4 la cita como ejemplo, no valida A 7.16 (PV-09).
    var fisica = s.cantidadFisica ? unidadFisica(ctx, s, i0)
      : porVerificar("PV-09: la unidad física de la subpartida difiere de la comercial");
    var factura = (g.comercial.facturaNumero || "—") + " · " + fechaDam(g.comercial.facturaFecha);

    var cas = [
      casilla("7.1", "Nº serie / total series", s.numero + "/" + total, { fuente: F + " 7.1" }),
      imp ? casilla("7.2", "Ítems Formato B", numItems.slice(0, 5).join(", "), { fuente: "IT A 7.2 (hasta 5 ítems en el formato)" }) : nl("7.2", "Ítems Formato B"),
      na("7.3", "Nº de declaración precedente – serie", " (sin régimen precedente)", 2),
      imp ? na("7.4", "Nº certificado de reposición – ítem") : nl("7.4", "Nº certificado de reposición – ítem"),
      imp ? casilla("7.5", "Código de ultractividad", "", { fuente: "IT A 7.5 (solo si corresponde, art. 144 LGA)" }) : nl("7.5", "Código de ultractividad"),
      casilla("7.6", "Puerto embarque – código", D.puertoMarcado(ctx, "puertoEmbarque"), { fuente: F + " 7.6", ancho: 2 }),
      imp ? casilla("7.7", "Fecha embarque", fechaDam(t.fechaEmbarque), { fuente: "IT A 7.7" }) : nl("7.7", "Fecha embarque"),
      casilla("7.8", "Documento de transporte – detalle", t.blNumero, { fuente: F + " 7.8 (B/L)", ancho: 2 }),
      imp ? casilla("7.9", "Nº certificado de origen / fecha", o.solicitaPreferencia ? (o.certificadoNumero || "—") + " · " + fechaDam(o.certificadoFecha) : "",
        { fuente: "IT A 7.9 (cuando sea exigible)", ancho: 2, motivo: o.solicitaPreferencia ? "" : "Sin certificado de origen" }) : nl("7.9", "Nº certificado de origen / fecha"),
      imp ? casilla("7.10", "Cantidad unidad comercial", Fm.damCantidad(s.cantidad), { fuente: "IT A 7.10 (Σ de la serie)" }) : nl("7.10", "Cantidad unidad comercial"),
      nl("7.11", "—"),
      casilla("7.12", "Cantidad de bultos", bultos, { fuente: F + " 7.12" }),
      casilla("7.13", "Clase de bultos", clase, { fuente: F + " 7.13", ancho: 2 }),
      casilla("7.14", "Peso neto kilos", Fm.kg(s.pesoNeto), { fuente: F + " 7.14 (kg, 2 decimales [S])" }),
      casilla("7.15", "Peso bruto kilos", Fm.kg(s.pesoBruto), { fuente: F + " 7.15 (kg, 2 decimales [S])" }),
      casilla("7.16", "Cantidad unidad física – unidad", fisica, { fuente: F + " 7.16", ancho: 2 }),
      na("7.17", imp ? "Cantidad unidad equivalente / producción" : "Cantidad unidad producción", ""),
      na("7.18", "Ítem CIP", ""),
      casilla("7.19", imp ? "Subpartida nacional – DV" : "Subpartida arancelaria – DV", subp, { fuente: F + " 7.19; arancel: PV-10", ancho: 2 })
    ];
    if (imp) {
      cas.push(casilla("7.20", "Tipo", x0.tipoA720 || "", { fuente: "IT A 7.20 (ISC diferenciado, antidumping…)" }));
      cas.push(na("7.21", "Subpartida Naladisa / Nabandina – DV", " (ALADI / Convenio Peruano-Colombiano)", 2));
      cas.push(casilla("7.22", "TM", "", { fuente: "IT A 7.22 (margen ALADI / CAN)" }));
      cas.push(casilla("7.23", "TPI", o.solicitaPreferencia ? marcado(ctx, x0.tpi || "—", rutaItem(i0, "tpi")) : "", { fuente: "IT A 7.23; códigos: PV-09" }));
      cas.push(casilla("7.24", "TPN", "", { fuente: "IT A 7.24 (cuando corresponda)" }));
      cas.push(casilla("7.25", "Código liberatorio", "", { fuente: "IT A 7.25 (cuando corresponda)" }));
      cas.push(casilla("7.26", "País de origen", marcado(ctx, opc("pais", s.paisOrigen), rutaItem(i0, "paisOrigen")), { fuente: "IT A 7.26", ancho: 2 }));
      cas.push(casilla("7.27", "País de adquisición", marcado(ctx, opc("pais", g.ruta.paisAdquisicion), "generales.ruta.paisAdquisicion"), { fuente: "IT A 7.27", ancho: 2 }));
      cas.push(nl("7.28", "Régimen aplicable"));
      var mon = el("span", null, cifra(s.fob) + " " + (g.comercial.moneda || ""));
      if (esPv(ctx, "generales.comercial.moneda")) { mon.appendChild(marcaMini("PV", "PV-09: código de la moneda en la tabla de SUNAT (USD es el código ISO 4217).")); }
      cas.push(casilla("7.29", "FOB en moneda de transacción – código", mon, { fuente: "IT A 7.29 (moneda: PV-09)", ancho: 2 }));
      cas.push(casilla("7.30", "FOB US$", cifra(s.fob), { fuente: "IT A 7.30 (Σ FOB de los ítems del Formato B)" }));
      cas.push(casilla("7.31", "Flete US$", lineas([cifra(s.flete), porVerificar("PV-04: reparto por peso bruto [S]")]), { fuente: "IT A 7.31", ancho: 2 }));
      cas.push(casilla("7.32", "Seguro US$ – tipo de seguro", lineas([cifra(s.seguro), "Tipo " + opc("tipoSeguro", r.seguro.tipoSeguro), porVerificar("PV-04: reparto por FOB [S]")]), { fuente: "IT A 7.32", ancho: 2 }));
      cas.push(casilla("7.33", "Ajuste valor US$", cifra(s.ajuste), { fuente: "IT A 7.33 (Σ B 5.10 de la serie)" }));
      cas.push(casilla("7.34", "Valor aduana US$", el("strong", null, cifra(s.valorAduana)), { fuente: "IT A 7.34 (= 7.30 + 7.31 + 7.32 + 7.33)" }));
    } else {
      cas.push(casilla("7.20", "Tipo (estado de la mercancía)", marcado(ctx, opc("estado", x0.estado), rutaItem(i0, "estado")), { fuente: "IT B 7.20; código en exportación: PV-09", ancho: 2 }));
      ["7.21", "7.22", "7.23", "7.24", "7.25"].forEach(function (n) {
        cas.push(nl(n, { "7.21": "Subpartida Naladisa / Nabandina – DV", "7.22": "TM", "7.23": "TPI", "7.24": "TPN", "7.25": "Código liberatorio" }[n]));
      });
      cas.push(casilla("7.26", "País de origen (UBIGEO del lugar de fabricación)", marcado(ctx, opc("ubigeo", x0.ubigeoOrigen), rutaItem(i0, "ubigeoOrigen")), { fuente: "IT B 7.26", ancho: 2 }));
      cas.push(casilla("7.27", "País de destino", lineas([marcado(ctx, opc("pais", s.paisDestino), "generales.ruta.puertoDescarga.locode"),
        lineas(["Puerto de desembarque (se transmite): ", D.puertoMarcado(ctx, "puertoDescarga")])]), { fuente: "IT B 7.27", ancho: 2 }));
      cas.push(casilla("7.28", "Régimen de restitución o reposición", "", { fuente: "IT B 7.28 (códigos 12 y 13)", motivo: "No se acoge a restitución ni reposición [S]" }));
      cas.push(nl("7.29", "FOB en moneda de transacción – código"));
      cas.push(casilla("7.30", "FOB US$", el("strong", null, cifra(s.fob)), { fuente: "IT B 7.30 (Σ = 6.5)" }));
      cas.push(nl("7.31", "Flete US$"));
      cas.push(nl("7.32", "Seguro US$ – tipo de seguro"));
      cas.push(nl("7.33", "Ajuste valor US$"));
      cas.push(nl("7.34", "Valor aduana US$"));
    }
    var cel = imp && serieCelulares(ctx, s);
    cas.push(casilla("7.35", "Descripción de mercancía", descripcionSerie(ctx, s), { fuente: F + " 7.35" + (imp ? " (modif. RS 129-2026)" : " (en español)") + "; descripciones mínimas: PV-21", ancho: 6,
      rs129: cel, motivo: imp && !cel ? "RS 129-2026: " + RS129 + " No aplica a esta serie." : "" }));
    cas.push(casilla("7.36", "Número de factura – fecha", factura, { fuente: F + " 7.36 (hasta 3 documentos)", ancho: 2 }));
    var info = imp ? lineas(["k) Unidad de carga: " + opc("unidadCarga", "02"), "l) Región de destino: " + opc("regionDestino", g.aduana.regionDestino)]) : "";
    cas.push(casilla("7.37", "Información complementaria", info, { fuente: F + " 7.37" + (imp ? " k) y l)" : ""), ancho: 4 }));
    cas.push(casilla("7.38", "Observación", "", { fuente: F + " 7.38", ancho: 3, motivo: "Incidencias encontradas por el funcionario aduanero (IT 7.38)" }));
    // 7.39 (D18 d; auditoría F8a.1-M1): el IT dice que se indica el código del tipo de incidencia por serie, pero no quién
    // la llena: en blanco, sin atribuirla a la Administración Aduanera.
    cas.push(casilla("7.39", "Tipo de observación", "", { fuente: F + " 7.39", ancho: 3, motivo: "Código del tipo de incidencia por serie; quién la llena: [verificar]" }));

    var bloque = rubro("7.", "Declaración de mercancías — serie " + s.numero + "/" + total, cas, "dam-serie");
    bloque.setAttribute("data-serie", String(s.numero));
    return bloque;
  }

  // ---------------------------------------------------------------- Rubros 8, 9 y reservados

  function rubros8yMas(ctx, cuerpo) {
    var op = ctx.op, r = ctx.r, imp = esImp(ctx), F = imp ? "IT A" : "IT B", cont = D.contenedor(ctx);
    var declarante = lineas([agente(ctx, "agenteAduana"), "Fecha de formulación: " + fechaDam(op.generales.aduana.fechaFormulacion),
      "Firma y sello del representante legal: ______________________"]);
    cuerpo.appendChild(rubro("8.", "Declarante", [
      casilla("8", "Despachador de aduana · RUC · fecha · firma", declarante, { fuente: F + " 8; RUC o código: PV-28", ancho: 6 })
    ]));
    var c9 = el("span");
    c9.appendChild(el("span", "doc-marcas", op.especificos.marcasEmbarque || "—"));
    var cn = el("span", "doc-linea", "Contenedor: ");
    cn.appendChild(D.cifra(cont.numero, "contenedor"));
    cn.appendChild(document.createTextNode(" · Precinto: "));
    cn.appendChild(D.cifra(cont.precinto, "precinto"));
    c9.appendChild(cn);
    cuerpo.appendChild(rubro("9.", "Nº contenedores / precintos", [
      casilla("9", "Marcas y números de los bultos, contenedor(es) y precinto(s)", c9, { fuente: F + " 9", ancho: 6 })
    ]));
    var reservadas = [
      casilla("10", "Diligencia aduanera", "", { fuente: F + " 10", estado: "reservada", ancho: 2 }),
      casilla("11", "Control de funcionario aduanero", "", { fuente: F + " 11", estado: "reservada", ancho: 2 }),
      casilla("12", imp ? "Control de embarque / tornaguía" : "Regularización / control de embarque", "", { fuente: F + " 12", estado: "reservada", ancho: 2 })
    ];
    if (imp) {
      reservadas.push(casilla("13", "Depósito aduanero", "", { fuente: "IT A 13 (régimen de depósito aduanero)", estado: "no-aplica", ancho: 2 }));
    } else {
      // IT B 13 reserva el rubro para la recepción en zona primaria, pero no dice quién lo llena: EN BLANCO, sin atribuir
      // responsable (D18 b). El total de bultos sigue en «Resultados» y en la hoja resumen.
      var z = "Reservada para la recepción de la mercancía de exportación a su ingreso a la zona primaria (IT B 13); quién la llena: [verificar]";
      reservadas.push(casilla("13.1", "Zona primaria: fecha término de recepción", "", { fuente: "IT B 13 y 13.1", ancho: 2, motivo: z }));
      reservadas.push(casilla("13.2", "Zona primaria: cantidad y clase de bultos", "", { fuente: "IT B 13.2 (sin contar contenedor ni paleta)", ancho: 2, motivo: z }));
    }
    reservadas.push(casilla("14", "Transportista", "", { fuente: F + " 14", estado: "no-aplica", ancho: 2 }));
    reservadas.push(casilla("15", "Validación de datos", "", { fuente: F + " 15 (la genera la Aduana al numerar)", estado: "reservada", ancho: 2 }));
    cuerpo.appendChild(rubro("", "Casillas 10 a 15 (Aduana, transportista y validación)", reservadas, "dam-reservadas"));
  }

  // ---------------------------------------------------------------- Hojas

  // "la serie 2" o "las series 2 a 4".
  function seriesA1(ctx) { var n = ctx.r.series.length; return n === 2 ? "la serie 2" : "las series 2 a " + n; }

  function nota(ctx, cuerpo, a1) {
    var imp = esImp(ctx), p = el("p", "doc-nota doc-nota-hr");
    p.appendChild(document.createTextNode((a1 ? "Formato A1: " + seriesA1(ctx) + " (IT IV.1: se usa cuando el despacho comprende más de una serie). " :
      "Formato A: datos generales y la primera serie (IT IV.1)" + (ctx.r.series.length > 1 ? "; " + seriesA1(ctx) + (ctx.r.series.length === 2 ? " va" : " van") + " en el Formato A1. " : ". ")) +
      "Casillas y contenido según el instructivo DESPA-IT.00.04, " + (imp ? "IT A (ingreso)" : "IT B (salida)") +
      "; el diseño gráfico del anexo no está en la copia local, por eso la disposición es didáctica (PV-23). Cifras con 3 decimales en USD (IT IV.3, IV.4); pesos en kg con 2 decimales [S]; fechas DD MM AAAA (IT IV.6). " +
      "La DAM real se transmite electrónicamente y prevalece sobre el papel (IT IV.8). "));
    var leyenda = el("span", "dam-leyenda");
    leyenda.appendChild(document.createTextNode("Casilla en blanco = no se llena, la llena otro o no aplica (el motivo, en la ayuda de la casilla) · "));
    leyenda.appendChild(D.etiquetaMarca("PV"));
    leyenda.appendChild(document.createTextNode(" = no se puede afirmar con las fuentes de la carpeta; "));
    leyenda.appendChild(marcaMini("PV"));
    leyenda.appendChild(document.createTextNode(" junto a un código en blanco = código oficial por verificar · "));
    leyenda.appendChild(D.etiquetaMarca("H*"));
    leyenda.appendChild(document.createTextNode(" = conocimiento general, sin fuente en la carpeta."));
    p.appendChild(leyenda);
    cuerpo.appendChild(p);
  }

  function formatoA(ctx) {
    var imp = esImp(ctx), op = ctx.op;
    var marco = D.hoja(this, ctx, (imp ? "Ingreso de mercancías · importación para el consumo (10)" : "Salida de mercancías · exportación definitiva (40)") +
      " · N° de orden " + (op.generales.aduana.numeroOrden || "—"));
    var cuerpo = marco.cuerpo;
    marco.hoja.classList.add("hoja-dam");
    nota(ctx, cuerpo, false);
    cuerpo.appendChild(cabecera(ctx, imp ? "IT A" : "IT B", false));
    rubros1a6(ctx, cuerpo);
    if (ctx.r.series.length) { cuerpo.appendChild(serie(ctx, ctx.r.series[0])); }
    rubros8yMas(ctx, cuerpo);
    return marco.hoja;
  }

  function formatoA1(ctx) {
    var imp = esImp(ctx), op = ctx.op;
    var marco = D.hoja(this, ctx, (ctx.r.series.length === 2 ? "Serie 2" : "Series 2 a " + ctx.r.series.length) + " · N° de orden " + (op.generales.aduana.numeroOrden || "—"));
    var cuerpo = marco.cuerpo;
    marco.hoja.classList.add("hoja-dam");
    nota(ctx, cuerpo, true);
    cuerpo.appendChild(cabecera(ctx, imp ? "IT A" : "IT B", true));
    ctx.r.series.slice(1).forEach(function (s) { cuerpo.appendChild(serie(ctx, s)); });
    return marco.hoja;
  }

  D.registrar({ id: "dam_a", codigo: "DAM A", es: "DAM — Formato A", en: "representación didáctica",
    titulo: "DECLARACIÓN ADUANERA DE MERCANCÍAS — FORMATO A", tituloEn: "REPRESENTACIÓN DIDÁCTICA",
    nota: "La formula el despachador de aduana. Datos generales y la primera serie (IT IV.1). Representación didáctica, solo en español.",
    generar: formatoA });
  D.registrar({ id: "dam_a1", codigo: "DAM A1", es: "DAM — Formato A1", en: "representación didáctica",
    titulo: "DECLARACIÓN ADUANERA DE MERCANCÍAS — FORMATO A1", tituloEn: "REPRESENTACIÓN DIDÁCTICA",
    nota: "Solo cuando hay más de una serie: series 2 a N (IT IV.1).",
    aplica: function (ctx) { return ctx.r.series.length > 1; },
    generar: formatoA1 });

  // Para pruebas.html.
  D.fechaDam = fechaDam;
})();
