/* Pantalla: conecta la interfaz. Botones de ejemplo, Nueva, Guardar y Abrir; formulario editable (F5,
   js/formulario.js, generado desde el diccionario); panel "Revisión de la operación" (Validaciones, F4)
   y panel didáctico "Resultados del cálculo" (F3); barra de pasos, respaldo automático en el navegador
   y aviso de cambios sin guardar; sección «Documentos» (F6+): pestañas, hoja A4 escalada e impresión.
   No calcula ni valida: tras cada cambio del formulario (con una pequeña espera) llama a Calculos.calcular
   y Validaciones.validar y les da formato. Si un dato no se puede calcular, la revisión queda «en pausa»
   (E20, decisión D14) sin bloquear la edición.
   Regla de carga: lo nuevo se construye completo FUERA del documento; solo si todo sale bien
   se reemplaza la operación anterior. Si algo falla, la pantalla anterior se conserva.
   Los datos del usuario se insertan siempre con textContent (nunca innerHTML).
   Script clásico. */

(function () {
  var form = null;              // Formulario de la operación cargada
  var huellaGuardada = null;    // huella del último estado cargado, abierto o guardado (null = nunca guardado)
  var ultimaRevision = null;
  var temporizador = null;
  var ESPERA_MS = 250;          // espera tras teclear antes de recalcular
  var CLAVE_RESPALDO = "procesadorPaper.respaldo";
  var CLAVE_PREFERENCIA = "procesadorPaper.autoguardado";

  function $(id) { return document.getElementById(id); }

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) { n.className = clase; }
    if (texto != null) { n.textContent = texto; }
    return n;
  }

  var temporizadorBarra = null;
  function mensaje(texto, tipo) {
    var caja = $("mensaje");
    caja.textContent = texto;
    caja.className = "mensaje " + (tipo || "");
    // Eco visual breve en la barra fija (el lector de pantalla ya lo oye en #mensaje).
    var eco = $("barra-mensaje");
    eco.textContent = texto;
    eco.className = "barra-mensaje " + (tipo || "");
    clearTimeout(temporizadorBarra);
    temporizadorBarra = setTimeout(function () { eco.textContent = ""; }, 7000);
  }

  var etiquetaMarca = Formulario.etiquetaMarca;

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
    b4.appendChild(explicacion(r.repartosIguales.fob ?
      "FOB del ítem: como el valor de la factura es 0, el FOB total se reparte en partes iguales (advertencia C01); el último ítem recibe el residuo. FOB unitario = FOB del ítem ÷ cantidad, con 6 decimales." :
      "FOB del ítem = FOB total × valor del ítem ÷ valor de la factura; el último ítem recibe el residuo. FOB unitario = FOB del ítem ÷ cantidad, con 6 decimales.",
      r.repartosIguales.fob ? [["H", "IT C 5.9"], ["S", "D12"]] : [["H", "IT C 5.9"]]));
    b4.appendChild(explicacion("Ajuste total (8.1.2 a 8.1.4 y 8.2) = USD " + Fm.damAC(r.ajustes.total) +
      ". Se reparte solo entre los ítems objeto de ajuste, " + (r.repartosIguales.ajustes ? "en partes iguales porque su valor facturado suma 0 (C01)" : "según su valor") +
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
    b5.appendChild(explicacion("El flete se reparte " + (r.repartosIguales.flete ? "en partes iguales, porque el peso bruto total es 0 (C01)," : "por peso bruto") +
      " y el " + (r.seguroOrigen === "prima" ? "seguro" : "seguro de la tabla") +
      (r.repartosIguales.seguro ? " en partes iguales, porque el FOB de las series suma 0 (C01)." : " por FOB.") + " Compara las columnas «% peso» y «% FOB»: cuando son muy distintas, cambiar el criterio cambia mucho el valor en aduana de cada serie.",
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
    // F3-M5: la base se descompone (valor en aduana + tributos = base) y lleva junto la marca del antidumping (D11).
    b6.appendChild(explicacion("Percepción del IGV (fuera del Formato C): base = valor en aduana " + Fm.damAC(p.valorAduana) +
      " + tributos " + Fm.damAC(p.tributos) + " = " + Fm.damAC(p.base) + "; percepción = " + Fm.pct(p.tasa) + " × " + Fm.damAC(p.base) +
      " = USD " + Fm.damAC(p.monto) + ". Un solo valor por operación: la tasa depende del importador y, en algunos casos, de la mercancía.",
      [["PV", "PV-01 (D2, D6)"]]));
    b6.appendChild(explicacion("Los tributos de esa base incluyen el antidumping (USD " + Fm.damAC(p.antidumping) + " en esta operación), " +
      "a diferencia de la base del IGV: incluye antidumping, según la Ley 29173, sin fuente en la carpeta (decisión D11).",
      [["H*", "Ley 29173"], ["PV", "PV-17: verificar"]]));
    var so = r.soles;
    b6.appendChild(so.disponible ?
      explicacion("Pago en soles al tipo de cambio venta " + Fm.numero(so.tipoCambio, 3) + ": tributos S/ " + Fm.comercial(so.tributos) +
        " + percepción S/ " + Fm.comercial(so.percepcion) + " = S/ " + Fm.comercial(so.total) + ".", [["H", "IT D rubro 5"], ["PV", "PV-07, PV-08"]]) :
      explicacion("Pago en soles: no calculado, falta un tipo de cambio válido (vacío, 0 o negativo; error E15). No significa que no haya nada que pagar.",
        [["H", "IT D rubro 5"]]));
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
    b3.appendChild(explicacion(r.repartosIguales.fob ?
      "FOB por ítem: como el valor de la factura es 0, S 6.5 se reparte en partes iguales entre los ítems (advertencia C01)." :
      "FOB por ítem: S 6.5 se reparte según el valor de cada ítem; el último recibe el residuo.", [["S", "PLAN §6.3, D12"]]));
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
  // Cada ítem lleva botones que llevan al dato afectado en el formulario.

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
    if (rev.detenida) {
      return "✘ Cálculo en pausa: " + e + (e === 1 ? " dato por corregir" : " datos por corregir") + " (E20). " +
        "Los demás avisos y los resultados vuelven al corregirlo" + (e === 1 ? "." : "s.");
    }
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
        caja.appendChild(el("p", "vacio", sev === "error" ? "Ninguno. ✔" :
          (rev.detenida ? "En pausa: se revisan de nuevo al corregir los datos de E20 (puedes seguir editando el resto)." : "Ninguna.")));
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


  // ---------------------------------------------------------------- Ir al dato
  // Lleva al control del formulario: abre su sección (y la tarjeta del ítem), lo centra y le da foco.
  function irAlDato(ruta) {
    if (ruta.charAt(0) === "#") {
      var destino = $(ruta.slice(1));
      if (!destino) { return; }
      Array.prototype.forEach.call(document.querySelectorAll(".bloque-resultado.resaltado"), function (n) { n.classList.remove("resaltado"); });
      destino.classList.add("resaltado");
      destino.scrollIntoView({ block: "center" });
      destino.focus({ preventScroll: true });
      return;
    }
    if (!form) { return; }
    var r = form.irA(ruta);
    if (r.oculto) {
      mensaje("«" + Validaciones.etiqueta(ruta) + "» no se pide con los datos actuales (se pide en: " + r.condicion +
        "). Se abrió su sección; cambia ese dato para que aparezca.", "ok");
    }
  }

  // ---------------------------------------------------------------- Cálculo y revisión en vivo

  // Calcula y revisa la operación del formulario. Si hay datos pendientes (no se pudieron usar) o el cálculo
  // se detiene por un dato fuera de rango, devuelve una revisión «en pausa» (E20) y resultado null.
  function evaluar(f) {
    var op = f.operacion(), pend = f.pendientes();
    if (pend.length) { return { r: null, rv: Validaciones.revisionDetenida(pend) }; }
    try {
      var r = Calculos.calcular(op);
      return { r: r, rv: Validaciones.validar(op, r) };
    } catch (e) {
      return { r: null, rv: Validaciones.revisionDetenida([Validaciones.problemaDeCalculo(e)]) };
    }
  }

  // F5-M1: datos no válidos en campos que ya no se piden. No bloquean, pero se informan (no se descartan
  // en silencio): la operación conserva su valor anterior y el texto vuelve a revisarse si el campo reaparece.
  function avisoSuspendidos(f) {
    var lista = f.pendientesOcultos();
    if (!lista.length) { return null; }
    var caja = el("div", "rev-suspendidos");
    caja.appendChild(el("p", null, "En suspenso (no bloquean): " + lista.length + " dato(s) con un número no válido en campos que ahora no se piden."));
    var ul = el("ul");
    lista.forEach(function (p) {
      ul.appendChild(el("li", null, "«" + Validaciones.etiqueta(p.ruta) + "»: " + p.texto + " Se usa el valor anterior (" +
        (p.conserva === null || p.conserva === undefined || p.conserva === "" ? "vacío" : String(p.conserva)) +
        "). Si el campo vuelve a pedirse, se revisa otra vez (E20)."));
    });
    caja.appendChild(ul);
    var b = el("button", "btn-ir", "Descartar el texto no válido y conservar el valor anterior");
    b.type = "button";
    b.addEventListener("click", function () { f.descartarPendientesOcultos(); });
    caja.appendChild(b);
    return caja;
  }

  // Prepara los paneles en fragmentos (sin tocar el documento).
  function prepararPaneles(f, est) {
    var resultados;
    if (est.r) {
      resultados = construirResultados(f.operacion(), est.r);
    } else {
      resultados = document.createDocumentFragment();
      resultados.appendChild(el("p", "rev-pausa", "Cálculo en pausa: hay " + est.rv.errores.length +
        " dato(s) que la herramienta no puede calcular (E20, ver «Revisión»). Al corregirlos, las cifras vuelven."));
    }
    var revision = construirRevision(est.rv);
    var susp = avisoSuspendidos(f);
    if (susp) { revision.insertBefore(susp, revision.firstChild); }
    return { resultados: resultados, revision: revision };
  }

  function textoResumen(op) {
    var tipo = NORMATIVA.opcion("tipoOperacion", op.generales.operacion.tipo);
    return (op.meta.referencia || "(sin referencia)") + " · " +
      (tipo ? tipo.texto : "tipo desconocido") + " · " + op.especificos.items.length + " ítem(s) · " +
      Object.keys(op.marcas).length + " dato(s) con marca propia";
  }

  function cambiosSinGuardar() {
    return !!form && (form.pendientes().length > 0 || Modelo.huella(form.operacion()) !== huellaGuardada);
  }

  function pintarEstadoGuardado() {
    var b = $("barra-guardado");
    if (!form) { b.textContent = ""; return; }
    var sucio = cambiosSinGuardar();
    b.textContent = sucio ? "● Cambios sin guardar" : "✔ Sin cambios por guardar";
    b.className = "barra-guardado " + (sucio ? "sucio" : "limpio");
    $("huella").textContent = Modelo.huella(form.operacion());
    $("resumen").textContent = textoResumen(form.operacion());
  }

  // ---------------------------------------------------------------- Documentos (F6+)
  // Genera los documentos con Documentos.generar (las plantillas solo leen) y los muestra en pestañas,
  // cada uno en una hoja A4 escalada al ancho disponible. Con errores no se generan (PLAN §7).
  var docActivo = "factura";     // pestaña elegida (se conserva entre recálculos)
  var tamanoReal = false;        // false = la hoja se ajusta al ancho; true = tamaño real con desplazamiento
  var ANCHO_A4_PX = 210 * 96 / 25.4;

  // Texto seguro para la propiedad CSS content (el pie impreso lleva la referencia, que es un dato del usuario).
  function textoCss(t) {
    return '"' + String(t).replace(/[\\"]/g, "\\$&").replace(/[\u0000-\u001f\u007f]/g, " ") + '"';
  }

  function estiloPie(texto) {
    var st = $("estilo-pie-impresion");
    if (!st) {
      st = document.createElement("style");
      st.id = "estilo-pie-impresion";
      document.head.appendChild(st);
    }
    st.textContent = "@page { @bottom-left { content: " + textoCss(texto) + "; font-family: system-ui, Arial, sans-serif; font-size: 7pt; color: #555; } }";
  }

  function ajustarEscala() {
    Array.prototype.forEach.call(document.querySelectorAll("#vista-documentos .doc-panel.activa"), function (panel) {
      var visor = panel.querySelector(".doc-visor"), hoja = panel.querySelector(".hoja-doc");
      if (!visor || !hoja) { return; }
      visor.classList.toggle("real", tamanoReal);
      var disponible = visor.clientWidth - 16;
      var f = tamanoReal ? 1 : Math.min(1, disponible / ANCHO_A4_PX);
      hoja.style.zoom = f < 1 ? f.toFixed(3) : "";
      // F10: la escala también va como variable CSS para agrandar el área táctil de los «?» de la hoja (css/estilos.css).
      if (f < 1) { hoja.style.setProperty("--escala-hoja", f.toFixed(3)); } else { hoja.style.removeProperty("--escala-hoja"); }
      // F10.1 (auditoría F10-X1): con la hoja reducida, las ayudas «?» también se ofrecen fuera de la hoja, a tamaño normal.
      var lista = panel.querySelector(".doc-ayudas-lista");
      if (lista) { lista.hidden = !(f < 1); }
    });
    var b = $("btn-doc-tamano");
    if (b) {
      b.textContent = tamanoReal ? "Ajustar al ancho" : "Ver en tamaño real";
      b.setAttribute("aria-pressed", tamanoReal ? "true" : "false");
    }
  }

  function activarDocumento(id, enfocar) {
    docActivo = id;
    Array.prototype.forEach.call(document.querySelectorAll("#vista-documentos [role=tab]"), function (t) {
      var si = t.getAttribute("data-doc") === id;
      t.setAttribute("aria-selected", si ? "true" : "false");
      t.tabIndex = si ? 0 : -1;
      if (si && enfocar) { t.focus(); }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#vista-documentos .doc-panel"), function (pn) {
      pn.classList.toggle("activa", pn.getAttribute("data-doc") === id);
    });
    ajustarEscala();
  }

  // Marca qué hojas se imprimen: un documento o todos. Lo deshace «afterprint».
  function prepararImpresion(soloId) {
    var paneles = Array.prototype.slice.call(document.querySelectorAll("#vista-documentos .doc-panel"));
    var primera = true;
    paneles.forEach(function (pn) {
      var va = !soloId || pn.getAttribute("data-doc") === soloId;
      pn.classList.toggle("a-imprimir", va);
      pn.classList.toggle("primera", va && primera);
      if (va) { primera = false; }
    });
  }

  function imprimir(soloId) {
    if (Documentos.bloqueados(ultimaRevision)) { mensaje("No hay documentos que imprimir: corrige primero los errores de «Revisión».", "error"); return; }
    prepararImpresion(soloId);
    impresionPreparada = true;
    window.print();
  }
  var impresionPreparada = false;

  function construirDocumentos(gen) {
    var frag = document.createDocumentFragment();
    if (!gen.docs.some(function (d) { return d.def.id === docActivo; })) { docActivo = gen.docs[0].def.id; }
    var controles = el("div", "doc-controles");
    var tabs = el("div", "doc-pestanas");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Documentos generados");
    gen.docs.forEach(function (d) {
      var t = el("button", "doc-pestana");
      t.type = "button";
      t.id = "pestana-" + d.def.id;
      t.setAttribute("role", "tab");
      t.setAttribute("data-doc", d.def.id);
      t.setAttribute("aria-controls", "panel-" + d.def.id);
      t.appendChild(el("span", "doc-codigo", d.def.codigo));
      t.appendChild(document.createTextNode(" " + d.def.es));
      t.addEventListener("click", function () { activarDocumento(d.def.id); });
      tabs.appendChild(t);
    });
    tabs.addEventListener("keydown", function (ev) {
      var lista = Array.prototype.slice.call(tabs.querySelectorAll("[role=tab]"));
      var i = lista.indexOf(document.activeElement);
      if (i === -1) { return; }
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: lista.length - 1 }[ev.key];
      if (j === undefined) { return; }
      ev.preventDefault();
      j = (j + lista.length) % lista.length;
      activarDocumento(lista[j].getAttribute("data-doc"), true);
    });
    controles.appendChild(tabs);
    var acciones = el("div", "botones doc-acciones");
    var b1 = el("button", "btn-imprimir", "🖨 Imprimir este documento");
    b1.type = "button";
    b1.addEventListener("click", function () { imprimir(docActivo); });
    var b2 = el("button", "btn-imprimir", "🖨 Imprimir todos (" + gen.docs.length + ")");
    b2.type = "button";
    b2.addEventListener("click", function () { imprimir(null); });
    var b3 = el("button", null, "Ver en tamaño real");
    b3.type = "button";
    b3.id = "btn-doc-tamano";
    b3.addEventListener("click", function () { tamanoReal = !tamanoReal; ajustarEscala(); });
    acciones.appendChild(b1);
    acciones.appendChild(b2);
    acciones.appendChild(b3);
    controles.appendChild(acciones);
    frag.appendChild(controles);
    gen.docs.forEach(function (d) {
      var pn = el("div", "doc-panel");
      pn.id = "panel-" + d.def.id;
      pn.setAttribute("role", "tabpanel");
      pn.setAttribute("data-doc", d.def.id);
      pn.setAttribute("aria-labelledby", "pestana-" + d.def.id);
      pn.appendChild(el("p", "nota doc-ayuda-vista", d.def.nota + " Vista previa en hoja A4 (210 × 297 mm)."));
      var visor = el("div", "doc-visor");
      visor.tabIndex = 0;
      visor.setAttribute("role", "region");
      visor.setAttribute("aria-label", "Hoja A4: " + d.def.es);
      visor.appendChild(d.hoja);
      pn.appendChild(visor);
      var lista = Documentos.listaAyudas(d.hoja, d.def.id);
      if (lista) { pn.appendChild(lista); }
      frag.appendChild(pn);
    });
    return frag;
  }

  function pintarDocumentos(est) {
    var p = $("estado-documentos"), vista = $("vista-documentos");
    vista.textContent = "";
    if (!form || !est) { p.textContent = "Carga una operación para generar sus documentos."; p.className = ""; return; }
    var gen;
    try {
      gen = Documentos.generar(form.operacion(), est.r, est.rv);
    } catch (e) {
      p.textContent = "No se pudieron generar los documentos (" + (e && e.message ? e.message : String(e)) + "). Los datos no cambiaron.";
      p.className = "error";
      return;
    }
    if (gen.bloqueado) {
      p.textContent = gen.detenida ?
        "Documentos NO generados: el cálculo está en pausa (E20). Corrige el dato marcado y se generarán solos." :
        "Documentos NO generados: hay " + gen.errores + " error(es) en «Revisión». Los errores bloquean los documentos para que no salgan cifras que no cuadran.";
      p.className = "error";
      var caja = el("div", "doc-bloqueo");
      caja.appendChild(el("p", null, "¿Por qué? Cada error de la revisión indica un dato que falta o que no cuadra (por ejemplo, un peso bruto menor que el neto). " +
        "Un documento con ese dato sería incorrecto. Las advertencias, en cambio, no bloquean."));
      var a = el("a", "btn-ir", "Ir a «Revisión de la operación» y corregir");
      a.href = "#paso-revision";
      caja.appendChild(a);
      vista.appendChild(caja);
      return;
    }
    var nA = est.rv.advertencias.length;
    p.textContent = "✔ " + gen.docs.length + " documentos generados" + (nA ? " (con " + nA + " advertencia(s), listadas en la hoja resumen)." : ".");
    p.className = "ok";
    estiloPie(Documentos.textoPie(gen.ctx));
    vista.appendChild(construirDocumentos(gen));
    activarDocumento(docActivo);
  }

  // Aplica al documento lo ya preparado.
  function pintar(f, est, paneles) {
    ultimaRevision = est.rv;
    $("vista-resultados").textContent = "";
    $("vista-resultados").appendChild(paneles.resultados);
    $("vista-revision").textContent = "";
    $("vista-revision").appendChild(paneles.revision);
    var texto = textoContador(est.rv), conErrores = Validaciones.hayErrores(est.rv);
    // Solo se cambia el texto si cambió: así el lector de pantalla no lo repite en cada tecla.
    if ($("revision-contador").textContent !== texto) { $("revision-contador").textContent = texto; }
    $("revision-contador").className = "rev-contador " + (conErrores ? "rev-con-errores" : "rev-sin-errores");
    var e = est.rv.errores.length, a = est.rv.advertencias.length;
    $("barra-contador").textContent = est.rv.detenida ? "✘ en pausa" : (e ? "✘ " + e + " error" + (e === 1 ? "" : "es") : "✔ 0 errores") + " · ⚠ " + a;
    $("barra-contador").className = "barra-contador " + (conErrores ? "con-errores" : "sin-errores");
    pintarEstadoGuardado();
    pintarDocumentos(est);
  }

  function recalcular() {
    temporizador = null;
    if (!form) { return; }
    var est = evaluar(form);
    form.refrescar(est.r, est.rv);
    pintar(form, est, prepararPaneles(form, est));
    respaldar();
  }

  // Cada cambio del formulario: recalcula tras una pequeña espera (los cambios de ítems, enseguida).
  function programarCalculo(tipo) {
    clearTimeout(temporizador);
    temporizador = setTimeout(recalcular, tipo === "estructura" ? 0 : ESPERA_MS);
    pintarEstadoGuardado();
  }

  // Prepara todo lo nuevo y, solo si no hubo errores, reemplaza lo anterior.
  // guardada: la operación coincide con un archivo o ejemplo (no hay cambios sin guardar).
  function cargar(op, texto, guardada) {
    var nuevo, est, paneles;
    try {
      nuevo = Formulario.crear(op, {
        alCambiar: programarCalculo,
        anunciar: function (t) { mensaje(t, "ok"); },
        confirmar: function (t) { return window.confirm(t); }
      });
      est = evaluar(nuevo);
      nuevo.refrescar(est.r, est.rv);
      paneles = prepararPaneles(nuevo, est);
    } catch (e) {
      mensaje("No se pudo mostrar la operación (" + (e && e.message ? e.message : String(e)) +
        "). Se conserva lo que había en pantalla.", "error");
      return false;
    }
    clearTimeout(temporizador);
    form = nuevo;
    huellaGuardada = guardada === false ? null : Modelo.huella(form.operacion());
    $("formulario").textContent = "";
    $("formulario").appendChild(form.raiz);
    pintar(form, est, paneles);
    mensaje(texto.replace("{huella}", Modelo.huella(form.operacion())), "ok");
    return true;
  }

  // Antes de reemplazar la operación: si hay cambios sin guardar, se pide confirmación.
  function puedeReemplazar(accion) {
    if (!cambiosSinGuardar()) { return true; }
    return window.confirm("La operación «" + (form.operacion().meta.referencia || "sin referencia") + "» tiene cambios sin guardar. " +
      "Si " + accion + ", se perderán (salvo el respaldo automático del navegador, si está activo). ¿Continuar?");
  }

  // ---------------------------------------------------------------- Respaldo automático (PLAN §2: solo respaldo)
  // Se guarda en el navegador (localStorage) cuando hay cambios sin guardar. La copia real es el .json.

  function almacen() {
    try { var a = window.localStorage; a.getItem(CLAVE_PREFERENCIA); return a; } catch (e) { return null; }
  }
  function autoguardadoActivo() { var a = almacen(); return !!a && a.getItem(CLAVE_PREFERENCIA) !== "no"; }

  function respaldar() {
    var a = almacen();
    if (!a || !form || !autoguardadoActivo() || !cambiosSinGuardar()) { return; }
    if (Modelo.revisarArchivo(form.operacion())) { return; }   // F5-M2: solo se respalda una operación que Abrir aceptaría
    try {
      a.setItem(CLAVE_RESPALDO, JSON.stringify({ guardadoEl: new Date().toISOString(), operacion: form.operacion() }));
    } catch (e) {
      mensaje("No se pudo guardar el respaldo automático en el navegador (espacio lleno o bloqueado). Guarda el .json.", "error");
    }
  }

  // Lee el respaldo; si está dañado o ya no es una operación válida, lo descarta. Devuelve { fecha, operacion } o null.
  function leerRespaldo() {
    var a = almacen();
    if (!a) { return null; }
    var texto = a.getItem(CLAVE_RESPALDO);
    if (!texto) { return null; }
    try {
      var datos = JSON.parse(texto);
      if (datos && datos.operacion && !Modelo.revisarArchivo(datos.operacion)) { return datos; }
    } catch (e) { /* se descarta abajo */ }
    a.removeItem(CLAVE_RESPALDO);
    return null;
  }

  function borrarRespaldo() { var a = almacen(); if (a) { a.removeItem(CLAVE_RESPALDO); } }

  function fechaHora(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return "fecha desconocida"; }
    function dos(n) { return (n < 10 ? "0" : "") + n; }
    return dos(d.getDate()) + "-" + dos(d.getMonth() + 1) + "-" + d.getFullYear() + " a las " + dos(d.getHours()) + ":" + dos(d.getMinutes());
  }

  function ofrecerRespaldo() {
    var datos = leerRespaldo(), caja = $("respaldo");
    if (!datos) { caja.hidden = true; return; }
    var op = datos.operacion;
    $("respaldo-texto").textContent = "Hay un respaldo automático de este navegador: «" + (op.meta.referencia || "sin referencia") +
      "», " + op.especificos.items.length + " ítem(s), del " + fechaHora(datos.guardadoEl) + ". No se carga solo: elige si lo recuperas.";
    caja.hidden = false;
  }

  // ---------------------------------------------------------------- Inicio

  function pintarRevisionDiccionario() {
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
      cob.porEstado.dato + " con datos, " + cob.porEstado.derivado + " derivados" +
      (cob.porEstado.pv ? ", " + cob.porEstado.pv + " representado(s) con POR VERIFICAR, sin valor resuelto" : "") +
      (cob.porEstado.reservado ? ", " + cob.porEstado.reservado + " reservados a fases posteriores" : "") + ")" +
      (cob.sinRequisito.length ? " · campos sin requisito: " + cob.sinRequisito.join(", ") : "") +
      (cob.patronesHuerfanos.length ? " · requisitos sin campo: " + cob.patronesHuerfanos.join(", ") : "");
    $("revision-diccionario").className = ok ? "ok" : "error";
  }

  function iniciar() {
    EJEMPLOS.forEach(function (ej) {
      var b = el("button", null, ej.titulo);
      b.type = "button";
      b.addEventListener("click", function () {
        if (!puedeReemplazar("cargas el ejemplo")) { return; }
        cargar(ej.operacion, "Se cargó el " + ej.titulo + ". Huella: {huella}. Edita cualquier dato: los totales y la revisión se actualizan solos.");
      });
      $("botones-ejemplo").appendChild(b);
    });
    $("btn-nueva").addEventListener("click", function () {
      if (!puedeReemplazar("creas una operación nueva")) { return; }
      cargar(Formulario.operacionNueva(), "Se creó una operación nueva con los valores sugeridos del plan (editables). Empieza por «Referencia interna».");
    });
    $("btn-guardar").addEventListener("click", function () {
      if (!form) { mensaje("No hay nada que guardar: primero carga un ejemplo o una operación.", "error"); return; }
      clearTimeout(temporizador);
      recalcular();
      var pend = form.pendientes();
      if (pend.length) {
        mensaje("Hay " + pend.length + " dato(s) que no se pudieron usar (E20 en «Revisión»). Corrígelos antes de guardar: " +
          "el archivo llevaría el valor anterior y no el que ves.", "error");
        return;
      }
      // F5-M2: lo que se descarga debe poder abrirse con la propia herramienta.
      var problema = Modelo.revisarArchivo(form.operacion());
      if (problema) { mensaje("No se guardó: " + problema + " Corrige ese dato y vuelve a guardar.", "error"); return; }
      var nombre = Modelo.guardar(form.operacion());
      huellaGuardada = Modelo.huella(form.operacion());
      pintarEstadoGuardado();
      mensaje("Se descargó '" + nombre + "'. Huella: " + huellaGuardada + ". Ese archivo es tu copia de trabajo.", "ok");
    });
    // Botón real (enfocable con Tab) que abre el selector de archivos oculto.
    $("btn-abrir").addEventListener("click", function () {
      if (!puedeReemplazar("abres otro archivo")) { return; }
      $("input-abrir").click();
    });
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

    // Respaldo automático: casilla, recuperar y descartar.
    var chk = $("chk-autoguardado");
    if (!almacen()) {
      chk.checked = false;
      chk.disabled = true;
      $("nota-autoguardado").textContent = "Este navegador no permite guardar un respaldo (almacenamiento bloqueado). Usa «Guardar JSON».";
    } else {
      chk.checked = autoguardadoActivo();
    }
    chk.addEventListener("change", function () {
      var a = almacen();
      if (!a) { return; }
      if (chk.checked) {
        a.removeItem(CLAVE_PREFERENCIA);
        respaldar();
        mensaje("Respaldo automático activado: mientras haya cambios sin guardar, se copian en este navegador.", "ok");
      } else {
        a.setItem(CLAVE_PREFERENCIA, "no");
        borrarRespaldo();
        $("respaldo").hidden = true;
        mensaje("Respaldo automático desactivado y respaldo borrado. Tu copia es el .json.", "ok");
      }
    });
    $("btn-recuperar").addEventListener("click", function () {
      var datos = leerRespaldo();
      if (!datos) { $("respaldo").hidden = true; mensaje("El respaldo ya no está disponible.", "error"); return; }
      if (!puedeReemplazar("recuperas el respaldo")) { return; }
      if (cargar(datos.operacion, "Se recuperó la última operación del respaldo (" + fechaHora(datos.guardadoEl) + "). " +
          "Guárdala con «Guardar JSON»: el respaldo del navegador no reemplaza al archivo.", false)) {
        $("respaldo").hidden = true;
      }
    });
    $("btn-descartar-respaldo").addEventListener("click", function () {
      borrarRespaldo();
      $("respaldo").hidden = true;
      mensaje("Se descartó el respaldo automático.", "ok");
    });

    // Aviso del navegador antes de cerrar la pestaña con cambios sin guardar.
    window.addEventListener("beforeunload", function (ev) {
      if (cambiosSinGuardar()) {
        respaldar();
        ev.preventDefault();
        ev.returnValue = "";
      }
    });

    pintarRevisionDiccionario();
    $("formulario").appendChild(el("p", "vacio", "No hay una operación cargada. Usa «Nueva», un ejemplo o «Abrir JSON»."));
    $("vista-resultados").appendChild(el("p", "vacio", "Carga una operación para ver sus cálculos."));
    $("revision-contador").textContent = "Carga una operación para revisarla.";
    pintarDocumentos(null);
    ofrecerRespaldo();
    window.addEventListener("resize", ajustarEscala);
    // Ctrl+P sin pasar por los botones: se imprimen todos los documentos.
    window.addEventListener("beforeprint", function () {
      if (!impresionPreparada) { prepararImpresion(null); }
    });
    window.addEventListener("afterprint", function () { impresionPreparada = false; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
