/* Plantilla: LISTA DE EMPAQUE / PACKING LIST (PLAN §3 doc 2, §5 columna PL).
   Por ítem: tipo de bulto, N° de bultos con numeración correlativa (1–200, 201–360…), unidades por bulto,
   pesos por bulto y totales, medidas y volumen. Totales, marcas, contenedor y precinto.
   Solo lee la operación y el resultado de Calculos.calcular; no calcula ni redondea.
   Cifras de cuadre (data-cuadre): bultos, pesoNeto, pesoBruto, volumen, contenedor, precinto.
   Script clásico: se registra en Documentos. */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;

  // Medidas del bulto tal como se ingresaron (cm, hasta 1 decimal): "50 × 20 × 60".
  function medidas(it) {
    if (it.largoCm == null || it.anchoCm == null || it.altoCm == null) { return "—"; }
    return [it.largoCm, it.anchoCm, it.altoCm].map(function (x) { return Fm.cantidad(Calculos.aFijo(x, 1)); }).join(" × ");
  }

  // Medidas y, debajo, el volumen por bulto que calculó calculos.js.
  function medidasYVolumen(it, ri) {
    var s = el("span", null, medidas(it));
    s.appendChild(el("span", "doc-linea", Fm.m3(ri.volumenBulto) + " m³"));
    return s;
  }

  function generar(ctx) {
    var op = ctx.op, r = ctx.r, g = op.generales, e = op.especificos, c = g.comercial;
    var marco = D.hoja(this, ctx, "Factura N° / Invoice No. " + (c.facturaNumero || "—") + " · Fecha / Date: " + D.fecha(c.facturaFecha));
    var cuerpo = marco.cuerpo;

    var partes = el("div", "doc-columnas");
    var emb = D.embarcador(ctx), cons = D.consignatario(ctx);
    partes.appendChild(D.datos(["Embarcador / vendedor", "Shipper / seller"], [["Nombre", "Name", emb.nombre], ["Dirección", "Address", emb.direccion]], "doc-parte"));
    partes.appendChild(D.datos(["Consignatario", "Consignee"], [["Nombre", "Name", cons.nombre], ["Dirección", "Address", cons.direccion]], "doc-parte"));
    cuerpo.appendChild(partes);

    var t = e.transporte, cont = D.contenedor(ctx);
    var embq = el("div", "doc-columnas");
    embq.appendChild(D.datos(["Embarque", "Shipment"], [
      ["Puerto de embarque", "Port of loading", D.puerto(g.ruta.puertoEmbarque)],
      ["Puerto de descarga", "Port of discharge", D.puerto(g.ruta.puertoDescarga)],
      t.nave || t.viaje ? ["Nave / viaje", "Vessel / voyage", [t.nave, t.viaje].filter(Boolean).join(" / ")] : null,
      t.booking ? ["N° de booking", "Booking No.", t.booking] : null
    ]));
    embq.appendChild(D.datos(["Contenedor", "Container"], [
      ["N° de contenedor", "Container No.", D.conMarca(ctx, D.cifra(cont.numero, "contenedor"), "especificos.contenedor.numero")],
      ["Tipo (ISO)", "Size/type (ISO)", cont.tipo],
      ["Precinto", "Seal No.", D.cifra(cont.precinto, "precinto")],
      ["Modalidad", "Load type", "FCL (contenedor completo / full container load)"]
    ]));
    cuerpo.appendChild(embq);

    var columnas = [
      { es: "Ítem", en: "Item" },
      { es: "Descripción", en: "Description", clase: "doc-desc" },
      { es: "Tipo de bulto", en: "Package type" },
      { es: "Bultos", en: "Pkgs", num: true },
      { es: "C/No.", en: "Pkg Nos.", clase: "doc-nw" },
      { es: "Unid./bulto", en: "Units/pkg", num: true },
      { es: "Cantidad", en: "Quantity", num: true },
      { es: "Peso por bulto kg (neto / bruto)", en: "Weight per pkg (net / gross)", num: true },
      { es: "Peso neto kg", en: "Net weight", num: true },
      { es: "Peso bruto kg", en: "Gross weight", num: true },
      { es: "Medidas cm · m³/bulto", en: "Dimensions · m³/pkg", clase: "doc-nw" },
      { es: "Volumen m³", en: "Volume", num: true }
    ];
    var filas = r.items.map(function (ri, i) {
      var it = op.especificos.items[i];
      var desc = el("span");
      desc.appendChild(el("strong", null, it.nombre || "—"));
      if (it.marca || it.modelo) { desc.appendChild(el("span", "doc-linea", [it.marca, it.modelo].filter(Boolean).join(" ")) ); }
      return [String(ri.numero), desc, D.opcion("claseBulto", it.claseBulto, true), String(ri.bultos),
        ri.bultos ? ri.bultoDesde + "–" + ri.bultoHasta : "—",
        it.unidadesPorBulto == null ? "—" : Fm.cantidad(Calculos.aFijo(it.unidadesPorBulto, 3)),
        Fm.cantidad(ri.cantidad) + " " + (it.unidadComercial || ""),
        Fm.kg(ri.pesoNetoBulto) + " / " + Fm.kg(ri.pesoBrutoBulto), Fm.kg(ri.pesoNeto), Fm.kg(ri.pesoBruto),
        medidasYVolumen(it, ri), Fm.m3(ri.volumen)];
    });
    var pie = [{ span: 3, celdas: ["Total / Total", D.cifra(String(r.totales.bultos), "bultos"), r.totales.numeracion.replace("-", "–"), "", "", "",
      D.cifra(Fm.kg(r.totales.pesoNeto), "pesoNeto"), D.cifra(Fm.kg(r.totales.pesoBruto), "pesoBruto"), "", D.cifra(Fm.m3(r.totales.volumen), "volumen")] }];
    cuerpo.appendChild(D.tabla(columnas, filas, { pie: pie, clase: "doc-items doc-packing" }));

    var nota = el("p", "doc-nota", "Numeración correlativa de los bultos (C/No.): cada ítem continúa donde terminó el anterior, igual que en las marcas. " +
      "Peso de la línea = bultos × peso por bulto; volumen = m³ por bulto (3 decimales) × bultos (PLAN §6.2). " +
      "Las cifras salen de calculos.js y coinciden con la factura comercial y la hoja resumen.");
    cuerpo.appendChild(nota);

    var resumen = el("div", "doc-columnas");
    var totBultos = el("span");
    totBultos.appendChild(D.cifra(String(r.totales.bultos), "bultos"));
    totBultos.appendChild(document.createTextNode(" " + D.clasesBulto(ctx).toLowerCase() + " · C/No. " + r.totales.numeracion.replace("-", "–")));
    resumen.appendChild(D.datos(["Totales del embarque", "Shipment totals"], [
      ["Bultos", "Packages", totBultos],
      ["Peso neto", "Net weight", Fm.kg(r.totales.pesoNeto) + " kg"],
      ["Peso bruto", "Gross weight", Fm.kg(r.totales.pesoBruto) + " kg"],
      ["Volumen", "Measurement", Fm.m3(r.totales.volumen) + " m³"]
    ]));
    resumen.appendChild(D.datos(["Marcas de embarque", "Shipping marks"], [["Marcas", "Marks", el("span", "doc-marcas", e.marcasEmbarque || "—")]]));
    cuerpo.appendChild(resumen);
    cuerpo.appendChild(el("p", "doc-linea-firma", "Preparado por / Prepared by: ______________________________   Fecha / Date: " + D.fecha(c.facturaFecha)));
    return marco.hoja;
  }

  D.registrar({
    id: "packing", codigo: "PL", es: "Lista de empaque", en: "Packing list",
    titulo: "LISTA DE EMPAQUE", tituloEn: "PACKING LIST",
    nota: "La emite el vendedor/exportador. Detalla qué hay en cada bulto, sus pesos y medidas.",
    generar: generar
  });
})();
