/* Plantilla: CERTIFICADO DE ORIGEN (FORMATO REFERENCIAL) / CERTIFICATE OF ORIGIN (PLAN §3 doc 6, §5 columna CO;
   fase F9).
   - Solo se genera si se solicita trato preferencial (B6). Sin preferencia no hay certificado.
   - El formato, los campos, el emisor y el criterio de origen dependen de cada acuerdo comercial: PV-12. Este modelo
     NO reproduce el formulario oficial de ningún acuerdo; lo dice en un recuadro visible (también impreso).
   - El criterio de origen se muestra tal como está en los datos: si está vacío a propósito y marcado PV (caso 2),
     sale «POR VERIFICAR» con su nota (no es error E01, PLAN §7). Nada se inventa: lo que falta queda en blanco (D17).
   - Se muestran las advertencias A13 (fecha posterior al embarque) y A14 (origen distinto del país del vendedor) de la
     revisión, sin repetir su regla.
   Solo lee la operación, el resultado de Calculos.calcular y la revisión; no calcula ni redondea.
   Cifras de cuadre (data-cuadre): bultos, pesoBruto, valorFactura.
   Script clásico: se registra en Documentos (antes de la hoja resumen). */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;
  var O = "especificos.origen.";

  // País de origen de las mercancías (ISO alfa-2 de cada ítem), sin repetir: «PE — Perú».
  function paisesOrigen(ctx) {
    var vistos = [];
    ctx.op.especificos.items.forEach(function (it) { if (it.paisOrigen && vistos.indexOf(it.paisOrigen) === -1) { vistos.push(it.paisOrigen); } });
    return vistos.map(function (p) { return D.opcion("pais", p); }).join(", ");
  }

  // Criterio de origen (un dato por operación; se repite en cada fila porque así lo pide cada mercancía del CO).
  function criterio(ctx) {
    var v = ctx.op.especificos.origen.criterio, m = ctx.op.marcas[O + "criterio"];
    if (v) { return D.conMarca(ctx, v, O + "criterio"); }
    if (m && m.marca === "PV") { return D.etiquetaMarca("PV", m.nota); }
    return "";
  }

  // País de destino derivado del UN/LOCODE de descarga (calculos.js, r.ruta) con su marca H*; vacío → "".
  function paisDestino(ctx) {
    var p = ctx.r.ruta.paisDestino;
    if (!p) { return ""; }
    var s = el("span", null, D.opcion("pais", p) + " ");
    s.appendChild(D.etiquetaMarca("H*", "Prefijo del UN/LOCODE del puerto de descarga: conocimiento general, sin fuente en la carpeta."));
    return s;
  }

  function generar(ctx) {
    var op = ctx.op, r = ctx.r, g = op.generales, e = op.especificos, o = e.origen, t = e.transporte, c = g.comercial;
    var imp = r.tipo === "importacion";
    var marco = D.hoja(this, ctx, "N° / No. " + (o.certificadoNumero || "—") + " · Fecha / Date: " + D.fecha(o.certificadoFecha) +
      " · Acuerdo / Agreement: " + (o.acuerdo || "—"));
    var cuerpo = marco.cuerpo;

    var ref = el("div", "doc-borrador doc-referencial");
    ref.appendChild(document.createTextNode("FORMATO REFERENCIAL — el formato oficial depende del acuerdo comercial "));
    ref.appendChild(D.etiquetaMarca("PV", "PV-12: formato, emisor y criterio de origen según el acuerdo; falta la fuente."));
    ref.appendChild(el("span", "doc-linea", "Cada acuerdo (aquí: " + (o.acuerdo || "sin acuerdo indicado") + ") fija su propio formulario, quién lo emite " +
      "(entidad certificadora o autocertificación) y los criterios de origen (PV-12). Este modelo reúne los datos usuales de la operación; no es el formulario oficial."));
    cuerpo.appendChild(ref);
    // Advertencias de la revisión que tocan a este certificado (no se repite la regla): A13 fecha posterior al
    // embarque; A14 país de origen distinto del país del vendedor.
    ["A13", "A14"].forEach(function (id) { D.advertencias(ctx, id).forEach(function (h) { cuerpo.appendChild(D.avisoRevision(h)); }); });

    // --- Partes
    var prod = g.partes.productor;
    var col1 = el("div", "doc-columnas");
    col1.appendChild(D.parte(["1. Exportador", "Exporter"], g.partes.vendedor));
    col1.appendChild(D.datos(["2. Productor", "Producer"], prod.razonSocial ? [
      D.filaDato(ctx, "Nombre o razón social", "Name", "generales.partes.productor.razonSocial", prod.razonSocial),
      D.filaDato(ctx, "Dirección", "Address", "generales.partes.productor.direccion", prod.direccion)
    ] : [
      ["Nombre o razón social", "Name", "El mismo exportador / Same as exporter",
        { ayuda: ["El formulario pide el productor solo si es distinto del exportador (§4 A2); como está vacío, se entiende que es el mismo."] }]
    ], "doc-parte"));
    cuerpo.appendChild(col1);
    var col2 = el("div", "doc-columnas");
    col2.appendChild(D.parte(["3. Importador", "Importer"], g.partes.comprador));
    col2.appendChild(D.datos(["4. Transporte y ruta", "Means of transport and route"], [
      ["Medio de transporte", "Means of transport", "Marítimo, contenedor completo (FCL) / Sea, FCL"],
      D.filaDato(ctx, "Nave / viaje", "Vessel / voyage", "especificos.transporte.nave", [t.nave, t.viaje].filter(Boolean).join(" / ")),
      ["Puerto de embarque", "Port of loading", D.puertoMarcado(ctx, "puertoEmbarque")],
      ["Puerto de descarga", "Port of discharge", D.puertoMarcado(ctx, "puertoDescarga")],
      ["País de destino", "Country of destination", paisDestino(ctx),
        { blanco: true, ayuda: [r.ruta.paisDestino ? "Derivado: prefijo del UN/LOCODE del puerto de descarga (calculos.js) [H*]." : "En blanco: el puerto de descarga no tiene UN/LOCODE."] }],
      D.filaDato(ctx, "Fecha de embarque", "Shipment date", "especificos.transporte.fechaEmbarque", t.fechaEmbarque ? D.fecha(t.fechaEmbarque) : "")
    ]));
    cuerpo.appendChild(col2);

    // --- Mercancías
    var columnas = [
      { es: "Ítem", en: "Item" },
      { es: "Bultos", en: "Packages" },
      { es: "Descripción de la mercancía", en: "Description of goods", clase: "doc-desc" },
      { es: "SA (6 díg.)", en: "HS code", clase: "doc-nw" },
      { es: "Cantidad", en: "Quantity", num: true },
      { es: "Peso bruto kg", en: "Gross weight", num: true },
      { es: "Valor USD", en: "Value", num: true },
      { es: "País de origen", en: "Country of origin" },
      { es: "Criterio de origen", en: "Origin criterion" }
    ];
    var filas = r.items.map(function (ri, i) {
      var it = e.items[i];
      var desc = el("span");
      desc.appendChild(el("strong", null, it.nombre || "—"));
      if (it.descripcion) { desc.appendChild(el("span", "doc-linea", it.descripcion)); }
      if (it.marca || it.modelo) { desc.appendChild(el("span", "doc-linea", [it.marca, it.modelo].filter(Boolean).join(" "))); }
      var bultos = ri.bultos + " " + D.opcion("claseBulto", it.claseBulto, true).toLowerCase() + (ri.bultos ? " (C/No. " + ri.bultoDesde + "–" + ri.bultoHasta + ")" : "");
      return [String(ri.numero), bultos, desc, D.sa6Marcado(ctx, i), Fm.cantidad(ri.cantidad) + " " + (it.unidadComercial || ""),
        Fm.kg(ri.pesoBruto), Fm.comercial(ri.valor), it.paisOrigen || "", criterio(ctx)];
    });
    var bt = el("span");
    bt.appendChild(D.cifra(String(r.totales.bultos), "bultos"));
    bt.appendChild(document.createTextNode(" bultos"));
    var pie = [{ span: 5, celdas: [bt, D.cifra(Fm.kg(r.totales.pesoBruto), "pesoBruto"), D.cifra(Fm.comercial(r.totales.valorFactura), "valorFactura"), "", ""] }];
    cuerpo.appendChild(D.tabla(columnas, filas, { pie: pie, clase: "doc-items doc-origen", titulo: ["5. Mercancías", "Goods"] }));
    var nota = el("p", "doc-nota");
    nota.appendChild(document.createTextNode("Valor = valor de la línea en la factura " + (c.incoterm || "") + " (calculos.js). SA = primeros 6 dígitos de la subpartida "));
    nota.appendChild(D.etiquetaMarca("H*"));
    nota.appendChild(document.createTextNode(". Criterio de origen: un dato de la operación, según el acuerdo (PV-12)" +
      (o.criterio ? "." : (op.marcas[O + "criterio"] && op.marcas[O + "criterio"].marca === "PV" ?
        "; está vacío a propósito y marcado POR VERIFICAR: no se inventa." : "; está vacío: la celda queda en blanco (D17)."))));
    cuerpo.appendChild(nota);

    var col3 = el("div", "doc-columnas");
    col3.appendChild(D.datos(["6. Factura comercial", "Commercial invoice"], [
      D.filaDato(ctx, "N° y fecha", "No. and date", "generales.comercial.facturaNumero", c.facturaNumero ? c.facturaNumero + " · " + D.fecha(c.facturaFecha) : "")
    ]));
    col3.appendChild(D.datos(["7. Marcas de embarque", "Shipping marks"], [["Marcas", "Marks", el("span", "doc-marcas", e.marcasEmbarque || "—")]]));
    cuerpo.appendChild(col3);
    cuerpo.appendChild(D.datos(["8. Observaciones", "Remarks"], [["Observaciones", "Remarks", "", { blanco: true,
      ayuda: ["En blanco: la herramienta no pide observaciones para el certificado (D17)."] }]]));

    // --- Declaración del exportador y certificación de la entidad emisora
    var col4 = el("div", "doc-columnas");
    var decl = el("section", "doc-caja doc-firma-caja");
    decl.appendChild(el("h4", null)).appendChild(D.rotulo("9. Declaración del exportador", "Exporter's declaration"));
    decl.appendChild(el("p", null, "El exportador declara que las mercancías descritas son originarias de " + (paisesOrigen(ctx) || "—") +
      " y cumplen las reglas de origen del acuerdo indicado. / The exporter declares that the goods described originate in the country stated " +
      "and meet the rules of origin of the agreement."));
    decl.appendChild(el("p", "doc-linea-firma", "Firma / Signature: ____________________   Fecha / Date: ____________"));
    col4.appendChild(decl);
    var cert = el("section", "doc-caja doc-firma-caja");
    cert.appendChild(el("h4", null)).appendChild(D.rotulo("10. Certificación", "Certification"));
    var filasCert = D.datos(null, [
      D.filaDato(ctx, "Entidad emisora", "Issuing body", "generales.partes.entidadCO.nombre", g.partes.entidadCO.nombre,
        { ayuda: ["Quién emite o certifica el origen depende del acuerdo: entidad certificadora o autocertificación (PV-12)."] }),
      D.filaDato(ctx, "N° de certificado", "Certificate No.", O + "certificadoNumero", o.certificadoNumero),
      D.filaDato(ctx, "Fecha de emisión", "Date of issue", O + "certificadoFecha", o.certificadoFecha ? D.fecha(o.certificadoFecha) : "",
        { ayuda: ["Si es posterior al embarque, la revisión avisa A13 (PV-12: algunos acuerdos admiten certificados emitidos después, con reglas propias)."] })
    ]);
    filasCert.classList.add("doc-sin-borde");
    cert.appendChild(filasCert);
    cert.appendChild(el("p", "doc-linea-firma", "Sello y firma / Stamp and signature: ____________________"));
    col4.appendChild(cert);
    cuerpo.appendChild(col4);

    // --- Nota didáctica: el CO en la DAM
    var dam = el("p", "doc-nota doc-nota-hr");
    dam.textContent = imp ?
      "En la DAM de importación, el N° y la fecha de este certificado van en la casilla A 7.9 y el código del tratamiento preferencial (TPI) en A 7.23 [H: IT A 7.9, 7.23]; " +
        "los ítems con distinto certificado van en series distintas (IT A 7.1)." :
      "En la DAM de exportación la casilla S 7.9 no se llena [H: IT B 7.9]: el certificado acompaña a la mercancía y lo usa el importador en su país para pedir la preferencia.";
    cuerpo.appendChild(dam);
    return marco.hoja;
  }

  D.registrar({
    id: "origen", codigo: "CO", es: "Certificado de origen", en: "Certificate of origin",
    titulo: "CERTIFICADO DE ORIGEN (FORMATO REFERENCIAL)", tituloEn: "CERTIFICATE OF ORIGIN",
    nota: "Lo emite la entidad certificadora o el propio exportador, según el acuerdo (PV-12). Solo se genera si se solicita trato preferencial.",
    aplica: function (ctx) { return ctx.op.especificos.origen.solicitaPreferencia === true; },
    generar: generar
  });
})();
