/* Plantilla: FACTURA COMERCIAL / COMMERCIAL INVOICE (PLAN §3 doc 1, §5 columna FC).
   Solo lee la operación, el resultado de Calculos.calcular y la revisión; no calcula ni redondea.
   Cifras de cuadre (data-cuadre): valorFactura, bultos, pesoNeto, pesoBruto y, en el desglose, baseFactura y prima (CIF/CIP).
   Script clásico: se registra en Documentos. */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;

  function generar(ctx) {
    var op = ctx.op, r = ctx.r, g = op.generales, e = op.especificos, c = g.comercial;
    var regla = r.reglaIncoterm;
    var marco = D.hoja(this, ctx, "N° / No. " + (c.facturaNumero || "—") + " · Fecha / Date: " + D.fecha(c.facturaFecha));
    var cuerpo = marco.cuerpo;

    // --- Partes
    var partes = el("div", "doc-columnas");
    var v = g.partes.vendedor;
    partes.appendChild(D.parte(["Vendedor / exportador", "Seller / exporter"], v,
      [v.telefono || v.correo ? ["Contacto", "Contact", [v.telefono, v.correo].filter(Boolean).join(" · ")] : null]));
    partes.appendChild(D.parte(["Comprador / importador", "Buyer / importer"], g.partes.comprador));
    cuerpo.appendChild(partes);
    // Consignatario y parte a notificar (PLAN §5: «Consignatario y notify → FC»; F7.1, auditoría F6-M2).
    var cons = D.consignatario(ctx), nt = D.notify(ctx);
    var transp = el("div", "doc-columnas");
    transp.appendChild(D.datos(["Consignatario", "Consignee"], [["Nombre", "Name", cons.tipo === "comprador" ? cons.nombre + " (el comprador / same as buyer)" : cons.nombre],
      cons.tipo === "comprador" ? null : ["Dirección", "Address", cons.direccion]]));
    transp.appendChild(D.datos(["Notificar a", "Notify party"], [["Nombre", "Name", nt.igual && cons.tipo !== "a_la_orden" ? nt.nombre + " (el consignatario / same as consignee)" : nt.nombre],
      nt.igual ? null : ["Dirección", "Address", nt.direccion]]));
    cuerpo.appendChild(transp);

    // --- Condiciones de la venta y del embarque
    var cond = el("div", "doc-columnas");
    var incoterm = el("span");
    incoterm.appendChild(el("strong", null, (c.incoterm || "—") + " " + (c.lugarConvenido || "")));
    incoterm.appendChild(document.createTextNode(" — Incoterms® 2020 "));
    incoterm.appendChild(D.etiquetaMarca("H*", "Incoterms® 2020 (ICC): conocimiento general, sin fuente en la carpeta"));
    cond.appendChild(D.datos(["Condiciones de la venta", "Terms of sale"], [
      ["Incoterm® y lugar convenido", "Incoterms® rule and named place", incoterm],
      ["Moneda", "Currency", D.opcion("moneda", c.moneda)],
      ["Condiciones de pago", "Payment terms", c.condicionesPago],
      ["Modalidad de pago", "Payment method", D.opcion("modalidadPago", c.modalidadPago)],
      r.tipo === "importacion" && c.medioPago ? ["Medio de pago", "Means of payment", D.opcion("medioPago", c.medioPago)] : null,
      c.contrato ? ["Contrato u orden de compra", "Contract / PO", c.contrato] : null
    ]));
    var t = e.transporte;
    cond.appendChild(D.datos(["Embarque", "Shipment"], [
      ["Puerto de embarque", "Port of loading", D.puertoMarcado(ctx, "puertoEmbarque")],
      ["Puerto de descarga", "Port of discharge", D.puertoMarcado(ctx, "puertoDescarga")],
      t.nave || t.viaje ? ["Nave / viaje", "Vessel / voyage", [t.nave, t.viaje].filter(Boolean).join(" / ")] : null,
      t.fechaEmbarque ? ["Fecha de embarque", "Shipment date", D.fecha(t.fechaEmbarque)] : null,
      ["Medio de transporte", "Mode of transport", "Marítimo, contenedor completo (FCL) / Sea, FCL"]
    ]));
    cuerpo.appendChild(cond);

    // --- Ítems
    var columnas = [
      { es: "N°", en: "No." },
      { es: "Descripción de la mercancía", en: "Description of goods", clase: "doc-desc" },
      { es: "SA (6 díg.)", en: "HS code", clase: "doc-nw" },
      { es: "Origen", en: "Origin" },
      { es: "Cantidad", en: "Quantity", num: true },
      { es: "Unidad", en: "Unit" },
      { es: "Precio unit. USD", en: "Unit price", num: true },
      { es: "Valor USD", en: "Amount", num: true }
    ];
    var filas = r.items.map(function (ri, i) {
      var it = op.especificos.items[i];
      var desc = el("span");
      desc.appendChild(el("strong", null, it.nombre || "—"));
      if (it.descripcion) { desc.appendChild(document.createTextNode(" — " + it.descripcion)); }
      var mm = [it.marca ? "Marca / Brand: " + it.marca : "", it.modelo ? "Modelo / Model: " + it.modelo : ""].filter(Boolean).join(" · ");
      if (mm) { desc.appendChild(el("span", "doc-linea", mm)); }
      return [String(ri.numero), desc, D.sa6Marcado(ctx, i), it.paisOrigen || "—", Fm.cantidad(ri.cantidad),
        it.unidadComercial || "—", D.precio(ri.precioUnitario), Fm.comercial(ri.valor)];
    });
    var totalTexto = "Valor total " + (c.incoterm || "") + " " + (c.lugarConvenido || "") + " (USD) / Total invoice value";
    var pie = [];
    r.factura.desglose.lineas.forEach(function (l) {
      // La prima lleva cifra de cuadre (F9): la hoja resumen la compara con el certificado de seguro.
      pie.push({ span: 7, celdas: [l.es + " / " + l.en + " (incluido en el precio)", l.id === "base" ? D.cifra(Fm.comercial(l.valor), "baseFactura") : (l.id === "seguro" ? D.cifra(Fm.comercial(l.valor), "prima") : Fm.comercial(l.valor))], clase: "doc-desglose" });
    });
    pie.push({ span: 7, celdas: [totalTexto, D.cifra(Fm.comercial(r.totales.valorFactura), "valorFactura")] });
    var tablaItems = D.tabla(columnas, filas, { pie: pie, clase: "doc-items" });
    cuerpo.appendChild(tablaItems);
    var nota = el("p", "doc-nota");
    nota.appendChild(document.createTextNode("SA = primeros 6 dígitos de la subpartida nacional (Sistema Armonizado) "));
    nota.appendChild(D.etiquetaMarca("H*"));
    if (D.hayPvSubpartida(ctx)) {
      nota.appendChild(document.createTextNode(" · "));
      nota.appendChild(D.etiquetaMarca("PV"));
      nota.appendChild(document.createTextNode(" junto al SA: la subpartida del ítem está por verificar (A08; PV-10); la nota de cada marca dice qué parte falta confirmar (si no se verificó, tampoco el SA de 6 dígitos)"));
    }
    nota.appendChild(document.createTextNode(r.factura.desglose.lineas.length ?
      " · Desglose del precio según el Incoterm: lo que el vendedor paga hasta el lugar convenido (flete" + (regla && regla.seguroObligatorio ? " y seguro" : "") + ") está incluido en el total; las cifras salen de calculos.js." :
      " · En " + (c.incoterm || "este Incoterm") + " el precio no incluye flete internacional ni seguro: no hay desglose."));
    cuerpo.appendChild(nota);

    var letras = el("p", "doc-letras");
    letras.appendChild(el("strong", null, D.enLetras(r.totales.valorFactura, c.moneda)));
    cuerpo.appendChild(letras);

    // --- Equipos: series e IMEI (RS 129-2026), si los hay
    var conEquipos = op.especificos.items.map(function (it, i) { return { it: it, i: i }; }).filter(function (x) { return x.it.equipos.length; });
    if (conEquipos.length) {
      var filasEq = [];
      conEquipos.forEach(function (x) {
        x.it.equipos.forEach(function (eq, k) {
          filasEq.push([String(x.i + 1), String(k + 1), eq.serie || "—", eq.imeis.join(" · ") || "—"]);
        });
      });
      cuerpo.appendChild(D.tabla([{ es: "Ítem", en: "Item" }, { es: "Equipo", en: "Unit" }, { es: "N° de serie", en: "Serial No." }, { es: "IMEI", en: "IMEI" }],
        filasEq, { titulo: ["Números de serie e IMEI (RS 129-2026, art. 1)", "Serial numbers and IMEI"], clase: "doc-equipos" }));
    }

    // --- Bultos, pesos y marcas
    var emb = el("div", "doc-columnas");
    var bultos = el("span");
    bultos.appendChild(D.cifra(String(r.totales.bultos), "bultos"));
    bultos.appendChild(document.createTextNode(" (" + D.clasesBulto(ctx) + "), numerados " + r.totales.numeracion.replace("-", "–")));
    var pn = el("span"); pn.appendChild(D.cifra(Fm.kg(r.totales.pesoNeto), "pesoNeto")); pn.appendChild(document.createTextNode(" kg"));
    var pb = el("span"); pb.appendChild(D.cifra(Fm.kg(r.totales.pesoBruto), "pesoBruto")); pb.appendChild(document.createTextNode(" kg"));
    emb.appendChild(D.datos(["Bultos y pesos", "Packages and weights"], [
      ["Total de bultos", "Total packages", bultos],
      ["Peso neto total", "Total net weight", pn],
      ["Peso bruto total", "Total gross weight", pb]
    ]));
    emb.appendChild(D.datos(["Marcas de embarque", "Shipping marks"], [["Marcas", "Marks", el("span", "doc-marcas", e.marcasEmbarque || "—")]]));
    cuerpo.appendChild(emb);

    // --- Declaración y firma
    var decl = el("div", "doc-firma");
    decl.appendChild(el("p", null, "Declaramos que esta factura muestra el precio real de la mercancía descrita y que los datos son correctos. / " +
      "We certify that this invoice shows the actual price of the goods described and that all particulars are true and correct."));
    decl.appendChild(el("p", "doc-linea-firma", "Firma y sello del vendedor / Seller's signature and stamp: ______________________________"));
    cuerpo.appendChild(decl);
    return marco.hoja;
  }

  D.registrar({
    id: "factura", codigo: "FC", es: "Factura comercial", en: "Commercial invoice",
    titulo: "FACTURA COMERCIAL", tituloEn: "COMMERCIAL INVOICE",
    nota: "La emite el vendedor/exportador. Precio, Incoterm y condiciones de la venta.",
    generar: generar
  });
})();
