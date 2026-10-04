/* Plantilla: HOJA RESUMEN, DE CUADRE Y DE TRAZABILIDAD / SUMMARY, RECONCILIATION AND TRACEABILITY SHEET
   (PLAN §3 doc 7 y §5). No es un documento comercial: sirve para estudiar la operación.
   - Cuadro de cuadre: lee las cifras que MUESTRA cada documento generado (data-cuadre) y las compara con el
     resultado de calculos.js. ✔ = todos los documentos dicen lo mismo.
   - Matriz Incoterms® 2020 (§6.8) con el término elegido resaltado.
   - Resultados clave, advertencias de la revisión y recuento H* y PV de la DAM (A19).
   - Tabla de trazabilidad GENERADA desde diccionario.js (campo → FC PL BL DAM SEG CO HR), no escrita a mano.
   Solo lee; no calcula ni redondea. Script clásico: se registra en Documentos (al final: necesita los demás). */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;
  var COLUMNAS_DOC = ["FC", "PL", "BL", "DAM", "SEG", "CO", "HR"];

  // ---------------------------------------------------------------- Trazabilidad (desde el diccionario)
  // Una fila por requisito de la matriz de cobertura (DICCIONARIO.cobertura, PLAN anexo A) que tiene campos
  // aplicables a esta operación. Documentos = unión de «docs» de esos campos; DAM = sus casillas para el tipo
  // de operación; marca = marcas de los campos.
  function cubre(patron, ruta) {
    return patron.slice(-2) === ".*" ? ruta.indexOf(patron.slice(0, -1)) === 0 : patron === ruta;
  }

  function trazabilidad(op) {
    var tipo = op.generales.operacion.tipo;
    var filas = [];
    DICCIONARIO.cobertura.forEach(function (req) {
      if (!req.rutas.length || req.seccion === "—") { return; }
      var campos = DICCIONARIO.campos.filter(function (c) {
        return (!c.solo || c.solo === tipo) && req.rutas.some(function (p) { return cubre(p, c.ruta); });
      });
      if (!campos.length) { return; }
      var docs = {}, casillas = [], marcas = [], fuentes = [];
      campos.forEach(function (c) {
        (c.docs || "").split(" ").filter(Boolean).forEach(function (d) { docs[d] = true; });
        var cas = DICCIONARIO.casilla(c, tipo);
        if (cas && (c.docs || "").indexOf("DAM") !== -1 && casillas.indexOf(cas) === -1) { casillas.push(cas); }
        if (marcas.indexOf(c.marca) === -1) { marcas.push(c.marca); }
        if (c.fuente && c.fuente !== "—" && fuentes.indexOf(c.fuente) === -1) { fuentes.push(c.fuente); }
      });
      filas.push({ seccion: req.seccion, requisito: req.requisito, docs: docs, casilla: casillas.join("; "), marcas: marcas, fuentes: fuentes,
        campos: campos.length });
    });
    return filas;
  }

  // ---------------------------------------------------------------- Cuadre entre documentos

  // Cifras que deben coincidir: clave → [es, en, valor esperado según calculos.js (texto con el formato del documento)].
  function esperadas(ctx) {
    var r = ctx.r, c = ctx.op.especificos.contenedor;
    var lista = [
      ["bultos", "Bultos", "Packages", String(r.totales.bultos)],
      ["pesoNeto", "Peso neto (kg)", "Net weight", Fm.kg(r.totales.pesoNeto)],
      ["pesoBruto", "Peso bruto (kg)", "Gross weight", Fm.kg(r.totales.pesoBruto)],
      ["volumen", "Volumen (m³)", "Measurement", Fm.m3(r.totales.volumen)],
      ["valorFactura", "Valor de la factura (USD)", "Invoice value", Fm.comercial(r.totales.valorFactura)],
      ["contenedor", "N° de contenedor", "Container No.", c.numero || "—"],
      ["precinto", "Precinto", "Seal No.", c.precinto || "—"],
      ["vgm", "VGM (kg)", "Verified gross mass", Fm.kg(r.vgm.total)]
    ];
    return lista;
  }

  // Compara lo que muestra cada documento con el cálculo. Devuelve { filas, docs, todoCuadra }.
  function cuadre(ctx) {
    var docs = ctx.generados.map(function (g) { return { def: g.def, cifras: D.cifras(g.hoja) }; });
    var todo = true;
    var filas = esperadas(ctx).map(function (e) {
      var celdas = docs.map(function (d) { return e[0] in d.cifras ? d.cifras[e[0]] : null; });
      var mostradas = celdas.filter(function (x) { return x !== null; });
      var ok = mostradas.every(function (x) { return x === e[3]; });
      if (!ok) { todo = false; }
      return { clave: e[0], es: e[1], en: e[2], esperado: e[3], celdas: celdas, ok: ok, enDocs: mostradas.length };
    }).filter(function (f) { return f.enDocs > 0; });
    return { filas: filas, docs: docs, todoCuadra: todo };
  }

  // ---------------------------------------------------------------- Plantilla

  function seccion(cuerpo, es, en, clase) {
    var s = el("section", "doc-seccion" + (clase ? " " + clase : ""));
    s.appendChild(el("h4", null)).appendChild(D.rotulo(es, en));
    cuerpo.appendChild(s);
    return s;
  }

  function generar(ctx) {
    var op = ctx.op, r = ctx.r, rv = ctx.rv, g = op.generales, e = op.especificos;
    var imp = r.tipo === "importacion";
    var marco = D.hoja(this, ctx, (op.meta.referencia || "(sin referencia)") + " · " + D.opcion("tipoOperacion", g.operacion.tipo, true) +
      " · " + (g.comercial.incoterm || "—") + " " + (g.comercial.lugarConvenido || ""));
    var cuerpo = marco.cuerpo;
    cuerpo.appendChild(el("p", "doc-nota doc-nota-hr", "Hoja de estudio: no es un documento comercial. Muestra que bultos, pesos, volumen y valores coinciden en todos los documentos, " +
      "la regla Incoterms® elegida, los resultados clave del cálculo y de dónde sale cada dato (trazabilidad)."));

    // --- 1. Operación
    var t = e.transporte;
    var id = el("div", "doc-columnas");
    id.appendChild(D.datos(["Operación", "Operation"], [
      ["Referencia", "Reference", op.meta.referencia],
      ["Descripción", "Description", op.meta.descripcion],
      ["Tipo y destinación", "Type and customs regime", D.opcion("tipoOperacion", g.operacion.tipo, true) + " · destinación " + (imp ? "10" : "40") + " · " + D.opcion("modalidadCarga", g.operacion.modalidadCarga, true)],
      ["Incoterm® 2020", "Incoterms® rule", (g.comercial.incoterm || "—") + " " + (g.comercial.lugarConvenido || "")],
      ["Factura", "Invoice", (g.comercial.facturaNumero || "—") + " · " + D.fecha(g.comercial.facturaFecha)]
    ]));
    id.appendChild(D.datos(["Partes y transporte", "Parties and transport"], [
      ["Vendedor", "Seller", g.partes.vendedor.razonSocial],
      ["Comprador", "Buyer", g.partes.comprador.razonSocial],
      ["Ruta", "Route", D.puerto(g.ruta.puertoEmbarque) + " → " + D.puerto(g.ruta.puertoDescarga)],
      ["Naviera, nave y viaje", "Carrier, vessel, voyage", [g.partes.naviera.nombre, t.nave, t.viaje].filter(Boolean).join(" · ")],
      ["Embarque / llegada (ETA)", "Shipment / ETA", D.fecha(t.fechaEmbarque) + " / " + D.fecha(t.eta)]
    ]));
    cuerpo.appendChild(id);

    // --- 2. Cuadro de cuadre
    var cq = cuadre(ctx);
    var s2 = seccion(cuerpo, "1. Cuadro de cuadre entre documentos", "Reconciliation", "doc-cuadre");
    var colsCuadre = [{ es: "Dato", en: "Item" }, { es: "Cálculo", en: "calculos.js", num: true }]
      .concat(cq.docs.map(function (d) { return { es: d.def.codigo, en: d.def.en, num: true }; }))
      .concat([{ es: "¿Cuadra?", en: "Match" }]);
    s2.appendChild(D.tabla(colsCuadre, cq.filas.map(function (f) {
      var celdas = [D.rotulo(f.es, f.en), f.esperado].concat(f.celdas.map(function (x) { return x === null ? "·" : x; }));
      celdas.push(el("span", f.ok ? "doc-ok" : "doc-mal", f.ok ? "✔ Sí" : "✘ NO"));
      return celdas;
    }), { clase: "doc-tabla-cuadre" }));
    s2.appendChild(el("p", "doc-nota", (cq.todoCuadra ? "✔ Todo cuadra: " : "✘ Hay diferencias: ") +
      "cada columna es la cifra que MUESTRA ese documento (leída de la hoja generada); «·» = ese documento no la muestra. " +
      "Documentos: " + cq.docs.map(function (d) { return d.def.codigo + " = " + d.def.es; }).join(" · ") + ". " +
      "Todas salen de un único cálculo (calculos.js), por eso coinciden."));
    if (imp && r.factura.desglose.lineas.length) {
      s2.appendChild(el("p", "doc-nota", "Precio de la factura según el Incoterm: " + r.factura.desglose.lineas.map(function (l) {
        return l.es + " " + Fm.comercial(l.valor);
      }).join(" + ") + " = " + Fm.comercial(r.totales.valorFactura) + " USD (el mismo desglose de la factura comercial)."));
    }

    // --- 3. Matriz Incoterms® 2020
    var s3 = seccion(cuerpo, "2. Matriz Incoterms® 2020 de la operación", "Incoterms® 2020 matrix", "doc-matriz");
    var elegido = g.comercial.incoterm;
    var filasM = INCOTERMS.codigos.map(function (cod) {
      var x = INCOTERMS.regla(cod);
      return { clase: cod === elegido ? "doc-elegido" : null, celdas: [(cod === elegido ? "▶ " : "") + cod, x.soloMaritimo ? "Sí" : "No", x.lugar, x.riesgo,
        x.fletePrincipal, x.seguro, x.despachoExportacion, x.despachoImportacion, x.fleteBlUsual] };
    });
    s3.appendChild(D.tabla([
      { es: "Regla", en: "Rule" }, { es: "Solo marítimo", en: "Sea only" }, { es: "Lugar convenido", en: "Named place" },
      { es: "Riesgo se transmite", en: "Risk transfer" }, { es: "Flete principal", en: "Main carriage" },
      { es: "Seguro obligatorio", en: "Insurance" }, { es: "Desp. export.", en: "Export clr." },
      { es: "Desp. import.", en: "Import clr." }, { es: "Flete B/L usual", en: "Freight" }
    ], filasM, { clase: "doc-tabla-matriz" }));
    var nm = el("p", "doc-nota");
    nm.appendChild(document.createTextNode("▶ = regla elegida (" + (elegido || "—") + "). Contenido de Incoterms® 2020 (ICC) "));
    nm.appendChild(D.etiquetaMarca("H*"));
    nm.appendChild(document.createTextNode(" PLAN §6.8. La columna «Flete B/L usual» es práctica habitual, no una regla de Incoterms: en esta operación el B/L dice «" +
      (r.fleteBl.declarado || "—") + "»" + (r.fleteBl.coincide ? " (coincide)." : " (no coincide: A05).")));
    s3.appendChild(nm);

    // --- 4. Resultados clave
    var s4 = seccion(cuerpo, "3. Resultados clave", "Key results", "doc-resultados");
    var filasR;
    if (imp) {
      var va = r.valorAduana, l = r.liquidacion, p = r.percepcion;
      filasR = [
        ["Valor de la factura (" + (g.comercial.incoterm || "") + ", B 8.1.1)", "Invoice value", Fm.comercial(r.totales.valorFactura)],
        ["FOB total (IT C 5.9; A 6.1)", "FOB value", Fm.damAC(r.fob.total)],
        ["Flete (A 6.2) + seguro (A 6.3) + ajustes (A 6.4)", "Freight + insurance + adjustments", Fm.damAC(va.flete) + " + " + Fm.damAC(va.seguro) + " + " + Fm.damAC(va.ajuste)],
        ["Valor en aduana (A 6.5)", "Customs value", Fm.damAC(va.total)],
        ["Ad valorem + IGV + IPM" + (Calculos.esCero(l.otrosDerechos) ? "" : " + sobretasa, específico e ISC") +
          (Calculos.esCero(l.antidumping) ? "" : " + antidumping") + " = tributos (Formato C)", "Duties and taxes",
          Fm.damAC(l.adValorem) + " + " + Fm.damAC(l.igv) + " + " + Fm.damAC(l.ipm) +
          (Calculos.esCero(l.otrosDerechos) ? "" : " + " + Fm.damAC(l.otrosDerechos)) +
          (Calculos.esCero(l.antidumping) ? "" : " + " + Fm.damAC(l.antidumping)) + " = " + Fm.damAC(l.total)],
        ["Percepción del IGV (" + Fm.pct(p.tasa) + "; fuera del Formato C)", "VAT perception", Fm.damAC(p.monto)],
        ["Pago en soles (tipo de cambio " + (r.soles.disponible ? Fm.numero(r.soles.tipoCambio, 3) : "—") + ")", "Payment in PEN",
          r.soles.disponible ? "S/ " + Fm.comercial(r.soles.tributos) + " + S/ " + Fm.comercial(r.soles.percepcion) + " = S/ " + Fm.comercial(r.soles.total) : "no calculado (E15)"]
      ];
    } else {
      var x = r.exportacion;
      filasR = [
        ["Valor de la factura (" + (g.comercial.incoterm || "") + ")", "Invoice value", Fm.comercial(r.totales.valorFactura)],
        ["Valor según la cláusula de venta (S 6.1)", "Value under the sale term", Fm.damAC(x.s61)],
        ["− otros gastos deducibles (S 6.3) + ajustes (S 6.4)", "Deductions and adjustments", "− " + Fm.damAC(x.s63) + " + " + Fm.damAC(x.s64)],
        ["Valor FOB (S 6.5)", "FOB value", Fm.damAC(x.s65)],
        ["Series de la DAM de salida", "Declaration lines", String(r.series.length) + " (" + r.series.map(function (s) { return s.subpartida; }).join(", ") + ")"]
      ];
    }
    filasR.push(["VGM = peso bruto + estiba + tara (kg)", "Verified gross mass", Fm.kg(r.vgm.pesoBruto) + " + " + Fm.kg(r.vgm.estiba) + " + " + Fm.kg(r.vgm.tara) + " = " + Fm.kg(r.vgm.total)]);
    if (r.seguro.hay) {
      filasR.push(["Suma asegurada (" + Fm.pct(r.seguro.coberturaPct) + ") y prima (" + Fm.pct(r.seguro.tasaPrimaPct) + ")", "Sum insured and premium",
        Fm.comercial(r.seguro.sumaAsegurada) + " / " + Fm.comercial(r.seguro.prima)]);
    }
    s4.appendChild(D.tabla([{ es: "Concepto", en: "Concept" }, { es: "USD (salvo indicación)", en: "Amount", num: true }],
      filasR.map(function (f) { return [D.rotulo(f[0], f[1]), f[2]]; }), { clase: "doc-tabla-resultados" }));
    s4.appendChild(el("p", "doc-nota", "Las cifras de la DAM van con 3 decimales (IT IV.3) y las comerciales con 2 (PLAN §6.1): se muestran tal como las calcula calculos.js, sin redondearlas otra vez." +
      (imp ? " Tasas de tributos y percepción: datos del usuario (PV-11, PV-01)." : "")));

    // --- 5. Advertencias
    var s5 = seccion(cuerpo, "4. Advertencias de la revisión (no bloquean)", "Warnings", "doc-advertencias");
    if (!rv.advertencias.length) {
      s5.appendChild(el("p", null, "Ninguna."));
    } else {
      var ul = el("ul", "doc-lista");
      rv.advertencias.forEach(function (h) {
        var li = el("li");
        li.appendChild(el("strong", null, h.id + " "));
        li.appendChild(document.createTextNode(h.titulo + ": " + h.que + " "));
        li.appendChild(D.etiquetaMarca(h.marca));
        ul.appendChild(li);
      });
      s5.appendChild(ul);
    }

    // --- 6. Recuento H* / PV (A19)
    var s6 = seccion(cuerpo, "5. Datos de la DAM con marca H* y POR VERIFICAR (A19)", "Data marked H* and to be verified", "doc-a19");
    var m = rv.marcas || { hx: [], pv: [] };
    var pa = el("p");
    pa.appendChild(D.etiquetaMarca("H*"));
    pa.appendChild(document.createTextNode(" " + m.hx.length + " dato(s): " + (m.hx.map(Validaciones.etiqueta).join(" · ") || "ninguno") + "."));
    s6.appendChild(pa);
    var pb = el("p");
    pb.appendChild(D.etiquetaMarca("PV"));
    pb.appendChild(document.createTextNode(" " + m.pv.length + " dato(s): " + (m.pv.map(Validaciones.etiqueta).join(" · ") || "ninguno") + "."));
    s6.appendChild(pb);

    // --- 7. Trazabilidad
    var s7 = seccion(cuerpo, "6. Tabla de trazabilidad: qué dato alimenta cada documento", "Traceability", "doc-trazabilidad");
    var activos = { SEG: e.seguro.hay === true, CO: e.origen.solicitaPreferencia === true };
    var filasT = trazabilidad(op).map(function (f) {
      var celdas = [f.seccion, f.requisito];
      COLUMNAS_DOC.forEach(function (d) {
        if (d === "DAM") { celdas.push(f.docs.DAM ? (f.casilla || "●") : ""); } else { celdas.push(f.docs[d] ? "●" : ""); }
      });
      celdas.push(f.marcas.join(" "));
      celdas.push(f.fuentes.join("; ") || "—");
      return celdas;
    });
    s7.appendChild(D.tabla([{ es: "§4", en: "" }, { es: "Campo o grupo", en: "Field", clase: "doc-desc" },
      { es: "FC", en: "" }, { es: "PL", en: "" }, { es: "BL", en: "" }, { es: "DAM (casilla)", en: "" },
      { es: "SEG", en: activos.SEG ? "" : "no aplica" }, { es: "CO", en: activos.CO ? "" : "no aplica" }, { es: "HR", en: "" }, { es: "Marca", en: "" }, { es: "Fuente", en: "Source", clase: "doc-fuente" }],
    filasT, { clase: "doc-tabla-traza" }));
    s7.appendChild(el("p", "doc-nota", "Generada desde js/diccionario.js (" + filasT.length + " grupos de campos de " +
      (imp ? "importación" : "exportación") + "): no está escrita a mano. FC factura · PL lista de empaque · BL instrucciones de embarque, B/L y VGM · " +
      "DAM casilla de la DAM (" + (imp ? "A, B y C de ingreso" : "S = Formato A de salida") + ") · SEG certificado de seguro · CO certificado de origen · HR esta hoja. " +
      "Marca del campo: H con fuente en la carpeta, H* conocimiento general, S supuesto o diseño, PV por verificar. Las cifras derivadas (bultos, pesos, FOB, tributos) las calcula calculos.js."));
    return marco.hoja;
  }

  D.registrar({
    id: "resumen", codigo: "HR", es: "Hoja resumen", en: "Summary sheet",
    titulo: "HOJA RESUMEN, DE CUADRE Y DE TRAZABILIDAD", tituloEn: "SUMMARY, RECONCILIATION AND TRACEABILITY",
    nota: "No es un documento comercial: muestra por qué cuadran las cifras y de dónde sale cada dato.",
    generar: generar
  });

  // Para pruebas.html y la propia hoja.
  D.trazabilidad = trazabilidad;
  D.cuadre = cuadre;
})();
