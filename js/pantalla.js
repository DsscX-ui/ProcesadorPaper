/* Pantalla: botones de ejemplo, Nueva, Guardar y Abrir; vista de solo lectura de los datos
   cargados (agrupada según el diccionario), panel "Revisión de la operación" (errores y advertencias
   de Validaciones, F4) y panel didáctico "Resultados del cálculo".
   No calcula ni valida: lee el resultado de Calculos.calcular y de Validaciones.validar y les da formato. El formulario editable llega en F5.
   Regla de carga: la vista nueva se construye completa FUERA del documento; solo si todo sale bien
   se reemplaza la operación anterior. Si algo falla, la pantalla anterior se conserva.
   Los datos del usuario se insertan siempre con textContent (nunca innerHTML).
   Script clásico. */

(function () {
  var operacion = null;
  var contadorAyuda = 0;

  function $(id) { return document.getElementById(id); }

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) { n.className = clase; }
    if (texto != null) { n.textContent = texto; }
    return n;
  }

  function mensaje(texto, tipo) {
    var caja = $("mensaje");
    caja.textContent = texto;
    caja.className = "mensaje " + (tipo || "");
  }

  // Etiqueta de marca: H, H*, SUPUESTO o POR VERIFICAR.
  function etiquetaMarca(marca) {
    var clases = { "H": "marca-h", "H*": "marca-hx", "S": "marca-s", "PV": "marca-pv" };
    var textos = { "H": "H", "H*": "H*", "S": "SUPUESTO", "PV": "POR VERIFICAR" };
    return el("span", "marca " + (clases[marca] || ""), textos[marca] || String(marca));
  }

  function textoValor(campo, valor) {
    if (valor === null || valor === undefined || valor === "") { return "—"; }
    if (campo.tipo === "sino") { return valor ? "Sí / Yes" : "No"; }
    if (campo.tipo === "equipos") {
      if (!valor.length) { return "—"; }
      var muestra = valor.slice(0, 3).map(function (e) {
        return (e.serie || "(sin serie)") + " [IMEI: " + (e.imeis.length ? e.imeis.join(", ") : "—") + "]";
      }).join("; ");
      return valor.length + " equipo(s): " + muestra + (valor.length > 3 ? "; …" : "");
    }
    if (campo.tipo === "codigo" && campo.lista) {
      var op = NORMATIVA.opcion(campo.lista, String(valor));
      return op ? valor + " — " + op.texto : valor + " (código fuera de la lista)";
    }
    return String(valor);
  }

  // Marca del DATO concreto: la propia de la operación o, si no hay, la de su lista de códigos.
  function marcaDelDato(op, campo, ruta, valor) {
    var propia = op.marcas[ruta];
    if (propia) { return { marca: propia.marca, nota: propia.nota }; }
    if (campo.tipo === "codigo" && campo.lista && valor !== "" && valor != null) {
      var l = NORMATIVA.listas[campo.lista];
      var o = NORMATIVA.opcion(campo.lista, String(valor));
      return { marca: l.marca, nota: "Lista: " + l.fuente + (o && o.nota ? " · " + o.nota : "") + (l.nota ? " · " + l.nota : "") };
    }
    return null;
  }

  function aplica(op, campo) {
    return !campo.solo || campo.solo === op.generales.operacion.tipo;
  }

  // Dos filas por campo: la de datos y una de detalle (ayuda, marca y fuente) que se abre con el botón "?".
  // Así la ayuda funciona con teclado y con toque, no solo al pasar el cursor.
  function fila(cuerpo, op, campo, ruta) {
    var valor = Modelo.leer(op, ruta);
    var tipoOp = op.generales.operacion.tipo;
    var idDetalle = "ayuda-" + (++contadorAyuda);
    var tr = el("tr");
    // Destino de los enlaces del panel «Revisión de la operación» (F4).
    tr.setAttribute("data-ruta", ruta);
    tr.tabIndex = -1;

    var tdCampo = el("td", "campo");
    var boton = el("button", "btn-ayuda", "?");
    boton.type = "button";
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-controls", idDetalle);
    boton.setAttribute("aria-label", "Ayuda: " + campo.es);
    tdCampo.appendChild(boton);
    tdCampo.appendChild(el("span", null, campo.es));
    tdCampo.appendChild(el("span", "en", " / " + campo.en));
    tr.appendChild(tdCampo);

    var tdValor = el("td", "valor", textoValor(campo, valor));
    var md = marcaDelDato(op, campo, ruta, valor);
    if (md) { tdValor.appendChild(document.createTextNode(" ")); tdValor.appendChild(etiquetaMarca(md.marca)); }
    tr.appendChild(tdValor);

    tr.appendChild(el("td", "casilla", DICCIONARIO.casilla(campo, tipoOp) || "—"));

    var tdFuente = el("td", "fuente");
    tdFuente.appendChild(etiquetaMarca(campo.marca));
    tdFuente.appendChild(el("span", null, campo.fuente));
    tr.appendChild(tdFuente);
    cuerpo.appendChild(tr);

    var trDet = el("tr", "detalle");
    trDet.id = idDetalle;
    trDet.hidden = true;
    var td = el("td");
    td.colSpan = 4;
    td.appendChild(el("p", null, campo.ayuda));
    td.appendChild(el("p", "nota", "Campo: " + campo.fuente + " · Obligatorio: " + campo.obl +
      (campo.docs ? " · Documentos: " + campo.docs : "")));
    if (md) {
      var p = el("p", "nota");
      p.appendChild(etiquetaMarca(md.marca));
      p.appendChild(document.createTextNode(" Este dato: " + (md.nota || "—")));
      td.appendChild(p);
    }
    trDet.appendChild(td);
    cuerpo.appendChild(trDet);

    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      trDet.hidden = abierto;
    });
  }

  function tablaNueva() {
    var t = el("table", "datos");
    var thead = el("thead");
    var cab = el("tr");
    ["Campo / Field", "Valor / Value", "Casilla DAM", "Fuente del campo"].forEach(function (x) {
      var th = el("th", null, x);
      th.scope = "col";
      cab.appendChild(th);
    });
    thead.appendChild(cab);
    t.appendChild(thead);
    var cuerpo = el("tbody");
    t.appendChild(cuerpo);
    return { tabla: t, cuerpo: cuerpo };
  }

  // Construye la vista completa de una operación en un fragmento (sin tocar el documento).
  function construirDatos(op) {
    var frag = document.createDocumentFragment();
    DICCIONARIO.grupos.forEach(function (g, i) {
      var campos = DICCIONARIO.campos.filter(function (c) { return c.grupo === g.id && aplica(op, c); });
      if (!campos.length) { return; }
      var det = el("details");
      det.id = "grupo-" + g.id;
      if (i < 2) { det.open = true; }
      var sum = el("summary");
      sum.appendChild(el("span", null, g.es));
      sum.appendChild(el("span", "en", " / " + g.en));
      det.appendChild(sum);

      var deItem = campos.filter(function (c) { return c.ruta.indexOf("items[]") !== -1; });
      var generales = campos.filter(function (c) { return c.ruta.indexOf("items[]") === -1; });
      if (generales.length) {
        var t = tablaNueva();
        generales.forEach(function (c) { fila(t.cuerpo, op, c, c.ruta); });
        det.appendChild(t.tabla);
      }
      if (deItem.length) {
        op.especificos.items.forEach(function (_, n) {
          det.appendChild(el("h4", null, "Ítem " + (n + 1) + " / Item " + (n + 1)));
          var t2 = tablaNueva();
          deItem.forEach(function (c) { fila(t2.cuerpo, op, c, c.ruta.replace("items[]", "items." + n)); });
          det.appendChild(t2.tabla);
        });
      }
      frag.appendChild(det);
    });
    return frag;
  }

  // ---------------------------------------------------------------- Resultados del cálculo
  // Solo lee el objeto "resultado" de Calculos.calcular y le da formato; no calcula nada.
  var Fm = Calculos.formato;

  // Tabla con columnas numéricas alineadas a la derecha. filas: listas de textos o nodos.
  // opciones.total: última fila resaltada; opciones.titulo: leyenda (caption).
  function tablaResultados(encabezados, filas, opciones) {
    opciones = opciones || {};
    // Zona desplazable enfocable: en pantallas estrechas se recorre con el teclado (flechas).
    var envoltura = el("div", "tabla-desplazable");
    envoltura.tabIndex = 0;
    envoltura.setAttribute("role", "region");
    envoltura.setAttribute("aria-label", "Tabla: " + encabezados.slice(0, 3).join(", ") + "…");
    var t = el("table", "datos resultados");
    if (opciones.titulo) { t.appendChild(el("caption", null, opciones.titulo)); }
    var thead = el("thead"), trh = el("tr");
    encabezados.forEach(function (h, i) {
      var th = el("th", i > 0 && opciones.numericas !== false ? "num" : null, h);
      th.scope = "col";
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    t.appendChild(thead);
    var tb = el("tbody");
    filas.forEach(function (f, k) {
      var tr = el("tr", opciones.total && k === filas.length - 1 ? "fila-total" : null);
      f.forEach(function (celda, i) {
        var td = el("td", i > 0 && opciones.numericas !== false ? "num" : null);
        if (celda && celda.nodeType) { td.appendChild(celda); } else { td.textContent = celda == null ? "—" : String(celda); }
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    envoltura.appendChild(t);
    return envoltura;
  }

  // Párrafo de explicación: texto + marcas opcionales (["H", "IT C 5.9"], ["S"], ["PV", "PV-04"]…).
  function explicacion(texto, marcas) {
    var p = el("p", "formula");
    p.appendChild(document.createTextNode(texto));
    (marcas || []).forEach(function (m) {
      p.appendChild(document.createTextNode(" "));
      p.appendChild(etiquetaMarca(m[0]));
      if (m[1]) { p.appendChild(el("span", "nota", " " + m[1])); }
    });
    return p;
  }

  function bloque(titulo) {
    var d = el("div", "bloque-resultado");
    d.appendChild(el("h3", null, titulo));
    return d;
  }

  function construirResultados(op, r) {
    var frag = document.createDocumentFragment();
    var imp = r.tipo === "importacion";

    // --- 1. Carga
    var b1 = bloque("1. Carga: bultos, pesos, volumen y VGM");
    b1.appendChild(tablaResultados(
      ["Ítem", "Cantidad", "Bultos", "N° de bultos", "Peso neto (kg)", "Peso bruto (kg)", "m³ por bulto", "Volumen (m³)"],
      r.items.map(function (it) {
        return [String(it.numero), Fm.cantidad(it.cantidad), String(it.bultos),
          it.bultos ? it.bultoDesde + "–" + it.bultoHasta : "—",
          Fm.kg(it.pesoNeto), Fm.kg(it.pesoBruto), Fm.m3(it.volumenBulto), Fm.m3(it.volumen)];
      }).concat([["Total", "", String(r.totales.bultos), r.totales.numeracion.replace("-", "–"),
        Fm.kg(r.totales.pesoNeto), Fm.kg(r.totales.pesoBruto), "", Fm.m3(r.totales.volumen)]]),
      { total: true }));
    b1.appendChild(explicacion("Bultos = cantidad ÷ unidades por bulto. Pesos = bultos × peso por bulto. " +
      "Volumen = largo × ancho × alto (cm) ÷ 1,000,000 × bultos. Los bultos se numeran de forma correlativa: así coinciden la lista de empaque, el B/L y las marcas.", [["S", "PLAN §6.2"]]));
    b1.appendChild(explicacion("VGM = peso bruto " + Fm.kg(r.vgm.pesoBruto) + " + estiba y trincaje " + Fm.kg(r.vgm.estiba) +
      " + tara " + Fm.kg(r.vgm.tara) + " = " + Fm.kg(r.vgm.total) + " kg.", [["H*", "SOLAS VI/2"]]));
    frag.appendChild(b1);

    // --- 2. Incoterm, seguro y flete en el B/L
    var b2 = bloque("2. Incoterm, seguro y flete en el B/L");
    var regla = r.reglaIncoterm;
    if (regla) {
      b2.appendChild(explicacion(regla.codigo + " (grupo " + regla.grupo + "): el riesgo pasa " + regla.riesgo.toLowerCase() +
        ". Flete principal: lo paga el " + regla.fletePrincipal.toLowerCase() + ". Seguro obligatorio: " + regla.seguro + ".", [["H*", "Incoterms® 2020"]]));
    }
    b2.appendChild(explicacion("Flete en el B/L: " + (r.fleteBl.declarado || "sin dato") + "; lo usual para este Incoterm es " +
      (r.fleteBl.sugerido || "—") + (r.fleteBl.coincide ? " (coincide)." : ". No coincide: ver la advertencia A05 en «Revisión de la operación»."), [["S", "práctica marítima (D8)"]]));
    if (r.seguro.hay) {
      b2.appendChild(explicacion("Suma asegurada = " + Fm.comercial(r.seguro.base) + " × " + Fm.pct(r.seguro.coberturaPct) + " = USD " +
        Fm.comercial(r.seguro.sumaAsegurada) + ". Prima = " + Fm.comercial(r.seguro.sumaAsegurada) + " × " + Fm.pct(r.seguro.tasaPrimaPct) +
        " = USD " + Fm.comercial(r.seguro.prima) + ". " + r.seguro.baseExplicacion, [["S", "PLAN §6.4"]]));
    } else {
      b2.appendChild(explicacion("Sin seguro contratado." + (imp ? " En importación se usa el % de la tabla de SUNAT (PV-06)." : ""), imp ? [["PV", "PV-06"]] : []));
    }
    frag.appendChild(b2);

    if (imp) {
      construirImportacion(frag, r);
    } else {
      construirExportacion(frag, r);
    }

    // --- Cuadres
    var bc = bloque("Por qué cuadran las cifras");
    bc.id = "bloque-cuadres";
    bc.tabIndex = -1;
    bc.appendChild(tablaResultados(["Comprobación", "Suma", "Debe ser", "¿Cuadra?"],
      r.cuadres.map(function (c) { return [c.texto, Fm.damAC(c.a), Fm.damAC(c.b), c.ok ? "✔ Sí" : "✘ NO (E19)"]; })));
    bc.appendChild(explicacion("En cada reparto la última parte recibe el residuo del redondeo; por eso las sumas cuadran al milésimo.", [["S", "PLAN §6.1"]]));
    frag.appendChild(bc);
    return frag;
  }

  function construirImportacion(frag, r) {
    // --- 3. FOB (IT C 5.9)
    var b3 = bloque("3. FOB total según el Incoterm (Formato B, sección 8)");
    var filas = r.fob.terminos.map(function (t) {
      return [t.casilla + " " + t.nombre, (t.signo > 0 ? "+ " : "− ") + Fm.comercial(t.valor)];
    });
    filas.push(["FOB total", Fm.comercial(r.fob.total)]);
    b3.appendChild(tablaResultados(["Casilla", "USD"], filas, { total: true }));
    b3.appendChild(explicacion("Fórmula de " + r.fob.formulaIncoterm + ": se parte del precio de la factura (8.1.1) y se quitan los conceptos que el Incoterm incluye después del embarque.",
      [["H", "IT C 5.9"]]));
    frag.appendChild(b3);

    // --- 4. Ítems (Formato B)
    var b4 = bloque("4. Por ítem (Formato B): FOB y ajustes");
    b4.appendChild(tablaResultados(["Ítem", "Valor en factura", "FOB del ítem", "FOB unitario (B 5.9)", "¿Objeto de ajuste?", "Ajuste del ítem", "Ajuste unitario (B 5.10)", "Serie"],
      r.items.map(function (it) {
        return [String(it.numero), Fm.comercial(it.valor), Fm.damAC(it.fob), Fm.damB(it.fobUnitario), it.objetoAjuste ? "Sí" : "No",
          Fm.damAC(it.ajuste), Fm.damB(it.ajusteUnitario), String(it.serie)];
      })));
    b4.appendChild(explicacion("FOB del ítem = FOB total × valor del ítem ÷ valor de la factura; el último ítem recibe el residuo. FOB unitario = FOB del ítem ÷ cantidad, con 6 decimales.",
      [["H", "IT C 5.9"]]));
    b4.appendChild(explicacion("Ajuste total (8.1.2 a 8.1.4 y 8.2) = USD " + Fm.damAC(r.ajustes.total) +
      ". Se reparte solo entre los ítems objeto de ajuste, según su valor" +
      (r.ajustes.itemsAjustados.length ? " (ítems " + r.ajustes.itemsAjustados.join(", ") + ")." : "."), [["H", "IT C 5.10"]]));
    frag.appendChild(b4);

    // --- 5. Series (Formato A)
    var b5 = bloque("5. Por serie (Formato A): valor en aduana");
    var va = r.valorAduana;
    b5.appendChild(tablaResultados(["Serie", "Ítems", "Subpartida", "Bultos", "Peso bruto", "% peso", "FOB (7.30)", "% FOB", "Flete (7.31)", "Seguro (7.32)", "Ajuste (7.33)", "Valor en aduana (7.34)"],
      r.series.map(function (s) {
        return [s.numero + "/" + r.series.length, s.items.map(function (i) { return i + 1; }).join(", "), s.subpartida, String(s.bultos),
          Fm.kg(s.pesoBruto), Fm.numero(s.pctPesoBruto, 2) + " %", Fm.damAC(s.fob), Fm.numero(s.pctFob, 2) + " %",
          Fm.damAC(s.flete), Fm.damAC(s.seguro), Fm.damAC(s.ajuste), Fm.damAC(s.valorAduana)];
      }).concat([["Total", "", "", String(r.totales.bultos), Fm.kg(r.totales.pesoBruto), "100.00 %", Fm.damAC(va.fob), "100.00 %",
        Fm.damAC(va.flete), Fm.damAC(va.seguro), Fm.damAC(va.ajuste), Fm.damAC(va.total)]]),
      { total: true }));
    b5.appendChild(explicacion("Los ítems se agrupan en series si comparten subpartida, país de origen y los demás datos de IT A 7.1. " +
      "Valor en aduana de la serie (7.34) = FOB + flete + seguro + ajuste; la fila Total corresponde a las casillas A 6.1 a 6.5.", [["H", "IT A 7.1, 7.34, 6.5"]]));
    b5.appendChild(explicacion("El flete se reparte por peso bruto y el " + (r.seguroOrigen === "prima" ? "seguro" : "seguro de la tabla") +
      " por FOB. Compara las columnas «% peso» y «% FOB»: cuando son muy distintas, cambiar el criterio cambia mucho el valor en aduana de cada serie.",
      [["S"], ["PV", "PV-04"]]));
    frag.appendChild(b5);

    // --- 6. Liquidación (Formato C)
    var b6 = bloque("6. Liquidación de tributos (Formato C)");
    var l = r.liquidacion;
    b6.appendChild(tablaResultados(["Serie", "Valor en aduana", "Tasa AV", "Ad valorem (C 4.1)", "Sobretasa + específico + ISC", "Base del IGV", "IGV (C 4.6)", "IPM (C 4.5)", "Antidumping (C 4.7)", "Total"],
      r.series.map(function (s) {
        var x = s.liquidacion;
        return [String(s.numero), Fm.damAC(s.valorAduana), Fm.pct(x.tasaAV), Fm.damAC(x.adValorem),
          Fm.damAC(x.otrosDerechos), Fm.damAC(x.baseIgv), Fm.damAC(x.igv), Fm.damAC(x.ipm),
          Fm.damAC(x.antidumping), Fm.damAC(x.total)];
      }).concat([["Total", Fm.damAC(va.total), "", Fm.damAC(l.adValorem), Fm.damAC(l.otrosDerechos),
        Fm.damAC(l.baseIgv), Fm.damAC(l.igv), Fm.damAC(l.ipm), Fm.damAC(l.antidumping), Fm.damAC(l.total)]]),
      { total: true }));
    b6.appendChild(explicacion("Ad valorem = valor en aduana × tasa (tasas del caso: dato del usuario, PV-11). Base del IGV = valor en aduana + ad valorem + sobretasa + específico + ISC; el antidumping queda fuera.",
      [["S"], ["PV", "PV-11, PV-17"]]));
    b6.appendChild(explicacion("IGV = " + Fm.pct(l.igvPct) + " × base; IPM = " + Fm.pct(l.ipmPct) + " × base. El servicio de despacho (C 4.8) no se calcula.",
      [["H*", "Ley del IGV"], ["PV", "PV-02"]]));
    var p = r.percepcion;
    b6.appendChild(explicacion("Percepción del IGV (fuera del Formato C) = " + Fm.pct(p.tasa) + " × (valor en aduana + tributos " + Fm.damAC(p.base) +
      ") = USD " + Fm.damAC(p.monto) + ". Un solo valor por operación: la tasa depende del importador y, en algunos casos, de la mercancía.",
      [["PV", "PV-01 (D2, D6)"]]));
    b6.appendChild(explicacion("La base de la percepción incluye el antidumping (USD " + Fm.damAC(l.antidumping) + " en esta operación), " +
      "a diferencia de la base del IGV. Se sigue la Ley 29173 sin fuente en la carpeta (decisión D11).",
      [["H*", "Ley 29173"], ["PV", "PV-17"]]));
    var so = r.soles;
    b6.appendChild(explicacion("Pago en soles al tipo de cambio venta " + Fm.numero(so.tipoCambio, 3) + ": tributos S/ " + Fm.comercial(so.tributos) +
      " + percepción S/ " + Fm.comercial(so.percepcion) + " = S/ " + Fm.comercial(so.total) + ".", [["H", "IT D rubro 5"], ["PV", "PV-07, PV-08"]]));
    frag.appendChild(b6);
  }

  function construirExportacion(frag, r) {
    var e = r.exportacion;
    var b3 = bloque("3. Valor FOB de exportación (DAM de salida, rubro 6)");
    b3.appendChild(tablaResultados(["Casilla", "USD"], [
      ["S 6.1 Valor según la cláusula de venta", Fm.damAC(e.s61)],
      ["S 6.3 Otros gastos deducibles", "− " + Fm.damAC(e.s63)],
      ["S 6.4 Total ajustes", "+ " + Fm.damAC(e.s64)],
      ["S 6.5 Valor neto de entrega (FOB)", Fm.damAC(e.s65)]
    ], { total: true }));
    b3.appendChild(explicacion("S 6.5 = S 6.1 − S 6.3 + S 6.4. Se deduce en ventas CFR o CIF y se ajusta en EXW; en FOB no hay diferencias. S 6.5 debe ser igual a la suma de S 7.30.",
      [["H", "IT B 6.1–6.5"]]));
    frag.appendChild(b3);

    var b5 = bloque("4. Por serie (DAM de salida)");
    b5.appendChild(tablaResultados(["Serie", "Ítems", "Subpartida", "País de destino", "Bultos", "Peso neto", "Peso bruto", "FOB (S 7.30)"],
      r.series.map(function (s) {
        return [s.numero + "/" + r.series.length, s.items.map(function (i) { return i + 1; }).join(", "), s.subpartida, s.paisDestino || "—",
          String(s.bultos), Fm.kg(s.pesoNeto), Fm.kg(s.pesoBruto), Fm.damAC(s.fob)];
      }).concat([["Total", "", "", "", String(r.totales.bultos), Fm.kg(r.totales.pesoNeto), Fm.kg(r.totales.pesoBruto), Fm.damAC(e.s65)]]),
      { total: true }));
    b5.appendChild(explicacion("En exportación las series agrupan ítems con igual subpartida y país de destino. Las casillas S 7.31 a 7.34 no se llenan.",
      [["H", "IT B 7.1, 7.27, 7.31–7.34"]]));
    frag.appendChild(b5);
  }

  // ---------------------------------------------------------------- Revisión de la operación (F4)
  // Muestra los errores y advertencias de Validaciones.validar, agrupados por severidad y por regla.
  // Cada ítem lleva botones que llevan al dato afectado en la vista de datos.

  var TEXTO_SEVERIDAD = {
    error: { titulo: "Errores", nota: "bloquean la generación de documentos", icono: "✘" },
    advertencia: { titulo: "Advertencias", nota: "no bloquean; conviene leerlas", icono: "⚠" }
  };
  var MAX_ENLACES = 6;

  // "✘ 3 errores (E05, E07) y 6 advertencias (A01, A08, A19, A20)…": cantidad de avisos y reglas.
  function textoContador(rev) {
    function ids(lista) {
      var v = [];
      lista.forEach(function (h) { if (v.indexOf(h.id) === -1) { v.push(h.id); } });
      return v.length ? " (" + v.join(", ") + ")" : "";
    }
    var e = rev.errores.length, a = rev.advertencias.length;
    var tA = a + (a === 1 ? " advertencia" : " advertencias") + ids(rev.advertencias);
    if (e) {
      return "✘ " + e + (e === 1 ? " error" : " errores") + ids(rev.errores) + " y " + tA +
        ". Los errores bloquean los documentos: corrígelos antes de generarlos.";
    }
    return "✔ Sin errores · " + tA + ", que no bloquean. Los documentos se podrán generar.";
  }

  function botonIr(ruta) {
    var texto = ruta.charAt(0) === "#" ? "Ir a: Por qué cuadran las cifras" : "Ir al dato: " + Validaciones.etiqueta(ruta);
    var b = el("button", "btn-ir", texto);
    b.type = "button";
    b.addEventListener("click", function () { irAlDato(ruta); });
    return b;
  }

  function parrafo(rotulo, texto) {
    var p = el("p", "rev-texto");
    p.appendChild(el("strong", null, rotulo + " "));
    p.appendChild(document.createTextNode(texto));
    return p;
  }

  function construirRevision(rev) {
    var frag = document.createDocumentFragment();
    ["error", "advertencia"].forEach(function (sev) {
      var lista = sev === "error" ? rev.errores : rev.advertencias;
      var ts = TEXTO_SEVERIDAD[sev];
      var caja = el("div", "rev-grupo rev-" + sev);
      var h = el("h3");
      h.appendChild(el("span", "rev-icono", ts.icono + " ")).setAttribute("aria-hidden", "true");
      h.appendChild(document.createTextNode(ts.titulo + " (" + lista.length + ")"));
      h.appendChild(el("span", "nota", " — " + ts.nota));
      caja.appendChild(h);
      if (!lista.length) {
        caja.appendChild(el("p", "vacio", sev === "error" ? "Ninguno. ✔" : "Ninguna."));
        frag.appendChild(caja);
        return;
      }
      // Agrupa por regla, conservando el orden de Validaciones (E01…E19, A01…A20, C01, C02).
      var porId = [], indice = {};
      lista.forEach(function (hz) {
        if (!(hz.id in indice)) { indice[hz.id] = porId.length; porId.push([]); }
        porId[indice[hz.id]].push(hz);
      });
      var ul = el("ul", "rev-reglas");
      porId.forEach(function (grupo) {
        var primero = grupo[0];
        var li = el("li", "rev-regla");
        var cab = el("p", "rev-cabecera");
        cab.appendChild(el("span", "rev-id", primero.id));
        cab.appendChild(el("strong", null, " " + primero.titulo));
        if (grupo.length > 1) { cab.appendChild(document.createTextNode(" (" + grupo.length + ")")); }
        li.appendChild(cab);
        // Si todos comparten el «por qué» y el «cómo», se dicen una sola vez.
        var mismoPorque = grupo.every(function (x) { return x.porque === primero.porque; });
        var mismoComo = grupo.every(function (x) { return x.como === primero.como; });
        var mismaFuente = grupo.every(function (x) { return x.fuente === primero.fuente && x.marca === primero.marca; });
        var ol = el("ol", "rev-items");
        grupo.forEach(function (hz) {
          var it = el("li", "rev-item");
          it.appendChild(el("p", "rev-que", hz.que));
          if (!mismoPorque) { it.appendChild(parrafo("Por qué importa:", hz.porque)); }
          if (!mismoComo && hz.como) { it.appendChild(parrafo("Cómo corregirlo:", hz.como)); }
          if (!mismaFuente) { it.appendChild(fuenteDe(hz)); }
          if (hz.rutas.length) {
            var ir = el("div", "rev-ir");
            hz.rutas.slice(0, MAX_ENLACES).forEach(function (r) { ir.appendChild(botonIr(r)); });
            if (hz.rutas.length > MAX_ENLACES) { ir.appendChild(el("span", "nota", "… y " + (hz.rutas.length - MAX_ENLACES) + " dato(s) más")); }
            it.appendChild(ir);
          }
          ol.appendChild(it);
        });
        li.appendChild(ol);
        if (mismoPorque) { li.appendChild(parrafo("Por qué importa:", primero.porque)); }
        if (mismoComo && primero.como) { li.appendChild(parrafo("Cómo corregirlo:", primero.como)); }
        if (mismaFuente) { li.appendChild(fuenteDe(primero)); }
        ul.appendChild(li);
      });
      caja.appendChild(ul);
      frag.appendChild(caja);
    });
    return frag;
  }

  function fuenteDe(hz) {
    var p = el("p", "nota rev-fuente");
    p.appendChild(document.createTextNode("Fuente: "));
    p.appendChild(etiquetaMarca(hz.marca));
    p.appendChild(document.createTextNode(hz.fuente));
    return p;
  }

  // Lleva al dato: abre su grupo <details>, lo centra en pantalla, lo enfoca y lo resalta.
  function irAlDato(ruta) {
    var destino = null;
    if (ruta.charAt(0) === "#") {
      destino = $(ruta.slice(1));
    } else {
      destino = $("vista-datos").querySelector('tr[data-ruta="' + CSS.escape(ruta) + '"]');
      if (!destino) {
        // Dato sin fila (ej. «no hay ítems»): se abre su grupo.
        var c = ruta === "especificos.items" ? { grupo: "B1" } : DICCIONARIO.buscar(ruta);
        var det = c && $("grupo-" + c.grupo);
        if (det) { destino = det.querySelector("summary"); }
      }
    }
    if (!destino) { return; }
    for (var d = destino.closest("details"); d; d = d.parentElement && d.parentElement.closest("details")) { d.open = true; }
    Array.prototype.forEach.call(document.querySelectorAll(".resaltado"), function (n) { n.classList.remove("resaltado"); });
    destino.classList.add("resaltado");
    destino.scrollIntoView({ block: "center" });
    destino.focus({ preventScroll: true });
  }

  function textoResumen(op) {
    var tipo = NORMATIVA.opcion("tipoOperacion", op.generales.operacion.tipo);
    return (op.meta.referencia || "(sin referencia)") + " · " +
      (tipo ? tipo.texto : "tipo desconocido") + " · " + op.especificos.items.length + " ítem(s) · " +
      Object.keys(op.marcas).length + " dato(s) con marca propia";
  }

  function pintarRevision() {
    var r = DICCIONARIO.revisarContraModelo();
    var cob = DICCIONARIO.revisarCobertura();
    var okCob = !cob.sinRequisito.length && !cob.patronesHuerfanos.length;
    var ok = !r.sinEntrada.length && !r.sinDato.length && okCob;
    var marcas = Object.keys(r.porMarca).sort().map(function (m) { return m + ": " + r.porMarca[m]; }).join(", ");
    $("revision-diccionario").textContent = "Correspondencia diccionario–modelo: " + (ok ? "correcta" : "REVISAR") +
      " · " + r.total + " campos (" + marcas + ")" +
      (r.sinEntrada.length ? " · datos del modelo sin entrada: " + r.sinEntrada.join(", ") : "") +
      (r.sinDato.length ? " · entradas sin dato en el modelo: " + r.sinDato.join(", ") : "") +
      " · Cobertura del plan (§4/§5, PLAN anexo A): " + (okCob ? "completa" : "REVISAR") + ", " + cob.requisitos + " requisitos (" +
      cob.porEstado.dato + " con datos, " + cob.porEstado.derivado + " derivados, " + cob.porEstado.reservado + " reservados a fases posteriores)" +
      (cob.sinRequisito.length ? " · campos sin requisito: " + cob.sinRequisito.join(", ") : "") +
      (cob.patronesHuerfanos.length ? " · requisitos sin campo: " + cob.patronesHuerfanos.join(", ") : "");
    $("revision-diccionario").className = ok ? "ok" : "error";
  }

  // Prepara todo lo nuevo y, solo si no hubo errores, reemplaza lo anterior.
  function cargar(op, texto) {
    var nueva, vista, resultados, revision, panel, resumen, huella;
    try {
      nueva = Modelo.clonar(op);
      vista = construirDatos(nueva);
      var resultado = Calculos.calcular(nueva);
      resultados = construirResultados(nueva, resultado);
      revision = Validaciones.validar(nueva, resultado);
      panel = construirRevision(revision);
      resumen = textoResumen(nueva);
      huella = Modelo.huella(nueva);
    } catch (e) {
      mensaje("No se pudo mostrar la operación (" + (e && e.message ? e.message : String(e)) +
        "). Se conserva lo que había en pantalla.", "error");
      return false;
    }
    operacion = nueva;
    $("vista-datos").textContent = "";
    $("vista-datos").appendChild(vista);
    $("vista-resultados").textContent = "";
    $("vista-resultados").appendChild(resultados);
    $("vista-revision").textContent = "";
    $("vista-revision").appendChild(panel);
    $("revision-contador").textContent = textoContador(revision);
    $("revision-contador").className = "rev-contador " + (Validaciones.hayErrores(revision) ? "rev-con-errores" : "rev-sin-errores");
    $("resumen").textContent = resumen;
    $("huella").textContent = huella;
    mensaje(texto.replace("{huella}", huella), "ok");
    return true;
  }

  function iniciar() {
    EJEMPLOS.forEach(function (ej) {
      var b = el("button", null, ej.titulo);
      b.type = "button";
      b.addEventListener("click", function () { cargar(ej.operacion, "Se cargó el " + ej.titulo + ". Huella: {huella}."); });
      $("botones-ejemplo").appendChild(b);
    });
    $("btn-nueva").addEventListener("click", function () {
      cargar(Modelo.operacionVacia(), "Se creó una operación vacía.");
    });
    $("btn-guardar").addEventListener("click", function () {
      if (!operacion) { mensaje("No hay nada que guardar: primero carga un ejemplo o una operación.", "error"); return; }
      var nombre = Modelo.guardar(operacion);
      mensaje("Se descargó '" + nombre + "'. Huella: " + Modelo.huella(operacion) + ".", "ok");
    });
    // Botón real (enfocable con Tab) que abre el selector de archivos oculto.
    $("btn-abrir").addEventListener("click", function () { $("input-abrir").click(); });
    $("input-abrir").addEventListener("change", function (ev) {
      var entrada = ev.target;
      var archivo = entrada.files && entrada.files[0];
      if (!archivo) { return; }
      try {
        Modelo.abrir(archivo, function (error, datos) {
          try {
            if (error) {
              mensaje(error + " No se cambió lo que había en pantalla.", "error");
            } else {
              cargar(datos, "Se abrió '" + archivo.name + "'. Huella: {huella}.");
            }
          } catch (e) {
            mensaje("Error inesperado al abrir el archivo. No se cambió lo que había en pantalla.", "error");
          }
          entrada.value = "";
        });
      } catch (e) {
        mensaje("No se pudo leer el archivo. No se cambió lo que había en pantalla.", "error");
        entrada.value = "";
      }
    });
    pintarRevision();
    $("vista-datos").appendChild(el("p", "vacio", "No hay una operación cargada. Usa un ejemplo, «Nueva» o «Abrir JSON»."));
    $("vista-resultados").appendChild(el("p", "vacio", "Carga una operación para ver sus cálculos."));
    $("revision-contador").textContent = "Carga una operación para revisarla.";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
