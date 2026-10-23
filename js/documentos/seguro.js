/* Plantilla: CERTIFICADO DE SEGURO DE TRANSPORTE / CARGO INSURANCE CERTIFICATE (PLAN §3 doc 5, §5 columna SEG;
   fase F9). Formato referencial didáctico: no reproduce el formulario de ninguna aseguradora.
   - Solo se genera si hay seguro (¿Hay seguro? = Sí; el formulario lo fuerza en CIF y CIP). Con FOB sin seguro no hay
     certificado (en la importación la DAM usa la tabla de SUNAT: A15, PV-06).
   - Suma asegurada = base × % de cobertura (§6.4), de calculos.js. La PRIMA no va en el cuerpo del certificado
     (§6.4: «aparece en la factura, en la DAM y en la hoja resumen, no en el certificado»): se muestra en el cuadro
     didáctico del final, que no forma parte del certificado, junto con dónde aparece en los demás documentos.
   - Lo que no está en los datos queda EN BLANCO con el motivo en la ayuda «?» (D17), o POR VERIFICAR si la
     operación lo marca PV. Se muestran las advertencias A11 (fecha posterior al embarque) y A12 (seguro voluntario) de la
     revisión, sin repetir su regla.
   Solo lee la operación, el resultado de Calculos.calcular y la revisión; no calcula ni redondea.
   Cifras de cuadre (data-cuadre): valorFactura, bultos, pesoBruto, contenedor, precinto, sumaAsegurada, prima.
   Script clásico: se registra en Documentos (antes de la hoja resumen). */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;
  var S = "especificos.seguro.";

  // Quién contrata el seguro (asegurado) y a favor de quién (beneficiario), según la regla Incoterms® [H*]:
  // CIF y CIP → el vendedor, a favor del comprador (Incoterms® 2020, A5; PLAN §5: «asegurado en CIF/CIP», «beneficiario»);
  // grupo D → el vendedor (corre el riesgo hasta el destino); E, F, CFR y CPT → el comprador (lo mismo que dice A12).
  // El momento en que pasa el riesgo sale de la matriz de js/incoterms.js (regla.riesgo): en CIF «a bordo en el puerto
  // de embarque», en CIP «al entregar al primer transportista» (F9.1, auditoría F9-X2).
  function partesSeguro(ctx) {
    var r = ctx.r.reglaIncoterm, p = ctx.op.generales.partes;
    if (r && r.seguroObligatorio) {
      return { asegurado: p.vendedor, beneficiario: p.comprador, quien: "vendedor",
        nota: "En " + r.codigo + " el vendedor contrata el seguro a favor del comprador, que corre el riesgo desde la entrega (" +
          r.riesgo.charAt(0).toLowerCase() + r.riesgo.slice(1) + ") (Incoterms® 2020, A5) [H*]. La póliza real fija el asegurado y el beneficiario." };
    }
    if (r && r.grupo === "D") {
      return { asegurado: p.vendedor, beneficiario: p.vendedor, quien: "vendedor",
        nota: "En " + r.codigo + " el seguro no es obligatorio; lo contrataría el vendedor, que corre el riesgo hasta el destino (A12) [H*]." };
    }
    return { asegurado: p.comprador, beneficiario: p.comprador, quien: "comprador",
      nota: "En " + (r ? r.codigo : "este Incoterm") + " el seguro no es obligatorio; lo contrataría el comprador, que corre el riesgo desde la entrega en origen (A12) [H*]. La póliza real fija el asegurado." };
  }

  // Nombre y dirección de una parte del seguro con la marca VISIBLE E IMPRESA de que el rol se dedujo del Incoterm
  // (F9.1, auditoría F9-X1): H* (regla Incoterms®, conocimiento general) + «supuesto según el Incoterm; confirmar con la
  // póliza». La explicación larga sigue en la ayuda «?».
  function parteDeducida(p, nota) {
    var s = nombreYDireccion(p);
    var m = el("span", "doc-deducido");
    m.appendChild(D.etiquetaMarca("H*", nota));
    m.appendChild(document.createTextNode(" Supuesto según el Incoterm; confirmar con la póliza."));
    s.appendChild(m);
    return s;
  }

  function nombreYDireccion(p) {
    var s = el("span");
    s.appendChild(el("strong", null, p.razonSocial || "—"));
    var dir = [p.direccion, p.ciudad, D.opcion("pais", p.pais, true)].filter(function (x) { return x && x !== "—"; }).join(", ");
    if (dir) { s.appendChild(el("span", "doc-linea", dir)); }
    return s;
  }

  // Sí / No de una cláusula adicional; sin respuesta → en blanco (D17).
  function sino(v, si, no) { return v === true ? si : (v === false ? no : ""); }

  function generar(ctx) {
    var op = ctx.op, r = ctx.r, g = op.generales, e = op.especificos, s = e.seguro, t = e.transporte, c = g.comercial;
    var regla = r.reglaIncoterm;
    var marco = D.hoja(this, ctx, "Certificado N° / Certificate No. " + (s.certificado || "—") + " · Póliza N° / Policy No. " + (s.poliza || "—") +
      " · Fecha de emisión / Date of issue: " + D.fecha(s.fechaEmision));
    var cuerpo = marco.cuerpo;
    cuerpo.appendChild(el("p", "doc-nota doc-nota-hr", "Formato referencial didáctico: cada aseguradora tiene su propio modelo de certificado. " +
      "Aquí se reúnen los datos que suele llevar, tomados del formulario; lo que falta queda en blanco (botón «?»)."));
    // Advertencias de la revisión que tocan a este certificado (no se repite la regla): A11 fecha posterior al
    // embarque; A12 seguro en un Incoterm que no lo exige (quién lo contrata).
    ["A11", "A12"].forEach(function (id) { D.advertencias(ctx, id).forEach(function (h) { cuerpo.appendChild(D.avisoRevision(h)); }); });

    // --- Aseguradora y póliza
    var ps = partesSeguro(ctx);
    var col1 = el("div", "doc-columnas");
    col1.appendChild(D.datos(["Aseguradora", "Insurer"], [
      D.filaDato(ctx, "Nombre o razón social", "Name", "generales.partes.aseguradora.razonSocial", g.partes.aseguradora.razonSocial),
      D.filaDato(ctx, "Dirección", "Address", "generales.partes.aseguradora.direccion", g.partes.aseguradora.direccion, { motivo: "La dirección de la aseguradora es opcional." })
    ], "doc-parte"));
    col1.appendChild(D.datos(["Póliza y certificado", "Policy and certificate"], [
      D.filaDato(ctx, "Tipo de póliza", "Policy type", S + "tipoPoliza", s.tipoPoliza ? D.opcion("tipoPoliza", s.tipoPoliza, true) : ""),
      D.filaDato(ctx, "N° de póliza", "Policy No.", S + "poliza", s.poliza),
      D.filaDato(ctx, "N° de certificado", "Certificate No.", S + "certificado", s.certificado),
      D.filaDato(ctx, "Fecha de emisión", "Date of issue", S + "fechaEmision", s.fechaEmision ? D.fecha(s.fechaEmision) : "",
        { ayuda: ["No debería ser posterior a la fecha de embarque: el riesgo debe estar cubierto desde que la carga sale (UCP 600, art. 28(e)) [H*]; si lo es, la revisión avisa A11."] })
    ]));
    cuerpo.appendChild(col1);

    var col2 = el("div", "doc-columnas");
    col2.appendChild(D.datos(["Asegurado (quien contrata el seguro)", "Assured"], [
      ["Nombre y dirección", "Name and address", parteDeducida(ps.asegurado, ps.nota), { ayuda: [ps.nota] }],
      ["Rol en la venta", "Role", ps.quien === "vendedor" ? "Vendedor / exportador" : "Comprador / importador"]
    ], "doc-parte"));
    col2.appendChild(D.datos(["Beneficiario (pago de siniestros a)", "Claims payable to"], [
      ["Nombre y dirección", "Name and address", parteDeducida(ps.beneficiario, ps.nota), { ayuda: [ps.nota] }],
      D.filaDato(ctx, "Lugar y moneda de pago de siniestros", "Claims payable at", S + "lugarPagoSiniestros", s.lugarPagoSiniestros)
    ], "doc-parte"));
    cuerpo.appendChild(col2);

    // --- Viaje (trayecto asegurado)
    var cont = D.contenedor(ctx);
    var incoterm = el("span");
    incoterm.appendChild(el("strong", null, (c.incoterm || "—") + " " + (c.lugarConvenido || "")));
    incoterm.appendChild(document.createTextNode(" — seguro: " + (regla ? regla.seguro : "—") + " "));
    incoterm.appendChild(D.etiquetaMarca("H*", "Incoterms® 2020 (ICC): conocimiento general, sin fuente en la carpeta (PLAN §6.8)."));
    var contenedor = el("span");
    contenedor.appendChild(D.cifra(cont.numero, "contenedor"));
    contenedor.appendChild(document.createTextNode(" · precinto / seal "));
    contenedor.appendChild(D.cifra(cont.precinto, "precinto"));
    var viaje = el("div", "doc-columnas");
    viaje.appendChild(D.datos(["Viaje asegurado", "Voyage"], [
      ["Medio de transporte", "Conveyance", "Marítimo, contenedor completo (FCL) / Sea, FCL"],
      D.filaDato(ctx, "Nave / viaje", "Vessel / voyage", "especificos.transporte.nave", [t.nave, t.viaje].filter(Boolean).join(" / ")),
      ["Desde (puerto de embarque)", "From", D.puertoMarcado(ctx, "puertoEmbarque")],
      ["Hasta (puerto de descarga)", "To", D.puertoMarcado(ctx, "puertoDescarga")],
      D.filaDato(ctx, "Fecha de embarque", "Sailing date", "especificos.transporte.fechaEmbarque", t.fechaEmbarque ? D.fecha(t.fechaEmbarque) : ""),
      D.filaDato(ctx, "N° de B/L", "B/L No.", "especificos.transporte.blNumero", t.blNumero, { motivo: "En el borrador el N° de B/L puede ir vacío (§4 B4)." })
    ]));
    viaje.appendChild(D.datos(["Venta y contenedor", "Sale and container"], [
      ["Incoterm® que pide el seguro", "Incoterms® rule", incoterm],
      D.filaDato(ctx, "Factura comercial", "Commercial invoice", "generales.comercial.facturaNumero",
        c.facturaNumero ? c.facturaNumero + " · " + D.fecha(c.facturaFecha) : ""),
      ["Contenedor", "Container", contenedor],
      ["Tipo (ISO)", "Size/type (ISO)", cont.tipo]
    ]));
    cuerpo.appendChild(viaje);

    // --- Mercancía asegurada (descripción genérica, como en el B/L; bultos y peso = lista de empaque)
    var nombres = [];
    e.items.forEach(function (it) { if (it.nombre && nombres.indexOf(it.nombre) === -1) { nombres.push(it.nombre); } });
    var bultos = el("span");
    bultos.appendChild(D.cifra(String(r.totales.bultos), "bultos"));
    bultos.appendChild(document.createTextNode(" " + D.clasesBulto(ctx).toLowerCase() + " · C/No. " + r.totales.numeracion.replace("-", "–")));
    var pb = el("span"); pb.appendChild(D.cifra(Fm.kg(r.totales.pesoBruto), "pesoBruto")); pb.appendChild(document.createTextNode(" kg"));
    var merc = el("div", "doc-columnas");
    merc.appendChild(D.datos(["Mercancía asegurada", "Subject-matter insured"], [
      ["Descripción", "Description", nombres.join("; ") || "", { blanco: true }],
      ["Bultos", "Packages", bultos],
      ["Peso bruto", "Gross weight", pb]
    ]));
    merc.appendChild(D.datos(["Marcas de embarque", "Shipping marks"], [["Marcas", "Marks", el("span", "doc-marcas", e.marcasEmbarque || "—")]]));
    cuerpo.appendChild(merc);

    // --- Valor asegurado y condiciones
    var sa = el("span");
    sa.appendChild(document.createTextNode("USD "));
    sa.appendChild(D.cifra(Fm.comercial(r.seguro.sumaAsegurada), "sumaAsegurada"));
    var base = el("span");
    base.appendChild(document.createTextNode("USD "));
    base.appendChild(D.cifra(Fm.comercial(r.seguro.base), regla && regla.seguroObligatorio ? "valorFactura" : "baseSeguro"));
    base.appendChild(el("span", "doc-linea", r.seguro.baseExplicacion));
    var clausulas = s.clausulas ? D.opcion("clausulasICC", s.clausulas, true) + " — Institute Cargo Clauses 2009" : "";
    var cond = el("div", "doc-columnas");
    cond.appendChild(D.datos(["Valor asegurado", "Amount insured"], [
      ["Moneda", "Currency", D.opcion("moneda", c.moneda)],
      [regla && regla.seguroObligatorio ? "Valor de la factura (base)" : "Base del seguro", "Basis of valuation", base],
      D.filaDato(ctx, "Cobertura", "Cover", S + "coberturaPct", s.coberturaPct == null ? "" : Fm.pct(r.seguro.coberturaPct), { efectiva: true }),
      ["Suma asegurada", "Sum insured", sa]
    ]));
    cond.appendChild(D.datos(["Condiciones de la cobertura", "Conditions"], [
      D.filaDato(ctx, "Cláusulas", "Clauses", S + "clausulas", clausulas, { efectiva: true,
        ayuda: ["(A) «todo riesgo» con exclusiones; (B) y (C) riesgos nombrados, (C) la más limitada. Mínimo (C) en CIF y (A) en CIP (Incoterms® 2020) [H*]."] }),
      D.filaDato(ctx, "Cláusulas de guerra", "War clauses", S + "guerra", sino(s.guerra, "Incluidas / Included", "No incluidas / Not included"), { motivo: "Dato opcional sin respuesta." }),
      D.filaDato(ctx, "Cláusulas de huelgas", "Strikes clauses", S + "huelgas", sino(s.huelgas, "Incluidas / Included", "No incluidas / Not included"), { motivo: "Dato opcional sin respuesta." }),
      D.filaDato(ctx, "Agente de reclamos en destino", "Claims / survey agent", S + "agenteReclamos", s.agenteReclamos,
        { motivo: "Dato opcional: a quién avisar en destino en caso de daño." })
    ]));
    cuerpo.appendChild(cond);
    var letras = el("p", "doc-letras");
    letras.appendChild(el("strong", null, D.enLetras(r.seguro.sumaAsegurada, c.moneda)));
    cuerpo.appendChild(letras);

    // --- Declaración y firma
    var decl = el("div", "doc-firma");
    decl.appendChild(el("p", null, "La aseguradora certifica que la mercancía descrita está asegurada por la póliza indicada, en sus términos y condiciones. " +
      "En caso de daño, avisar de inmediato al agente de reclamos y conservar los derechos frente al transportista. / " +
      "This is to certify that the goods described are insured under the policy stated, subject to its terms and conditions."));
    decl.appendChild(el("p", "doc-linea-firma", "Firma autorizada de la aseguradora / Authorised signature: ______________________________"));
    cuerpo.appendChild(decl);

    cuerpo.appendChild(cuadro(ctx));
    return marco.hoja;
  }

  // Cuadro didáctico (no forma parte del certificado): por qué cuadran la suma asegurada y la prima y dónde aparece
  // la prima en los demás documentos. Cifras de calculos.js (§6.4).
  function cuadro(ctx) {
    var r = ctx.r, sg = r.seguro, regla = r.reglaIncoterm, imp = r.tipo === "importacion";
    var caja = el("section", "dam-didactico doc-cuadro-seguro");
    caja.appendChild(el("h4", null, "Cuadro didáctico — no forma parte del certificado: suma asegurada y prima (PLAN §6.4)"));
    var prima = D.cifra(Fm.comercial(sg.prima), "prima");
    var filas = [
      ["Base del seguro", sg.baseExplicacion, Fm.comercial(sg.base)],
      ["× cobertura", "Dato del formulario (mínimo 110 % en CIF y CIP)", Fm.pct(sg.coberturaPct)],
      ["= Suma asegurada", "Lo que pagaría la aseguradora si se pierde toda la carga", Fm.comercial(sg.sumaAsegurada)],
      ["× tasa de prima", "Dato del formulario", Fm.pct(sg.tasaPrimaPct)],
      [el("strong", null, "= Prima"), "El costo del seguro: lo paga quien lo contrata", prima]
    ];
    caja.appendChild(D.tabla([{ es: "Paso", en: "Step" }, { es: "De dónde sale", en: "Source", clase: "doc-desc" }, { es: "USD / %", en: "Amount", num: true }],
      filas, { clase: "doc-tabla-seguro" }));
    var donde = [];
    if (regla && regla.seguroObligatorio) { donde.push("la factura comercial (desglose del precio " + regla.codigo + ": «Seguro (prima)»)"); }
    if (imp) {
      donde.push("la DAM: A 6.3 y B 8.4 (con 3 y 6 decimales: " + Fm.damAC(r.valorAduana.seguro) + "), repartida entre las series en A 7.32 [S; PV-04]; tipo de seguro A 7.32 = " +
        D.opcion("tipoSeguro", sg.tipoSeguro));
    }
    donde.push("la hoja resumen (resultados clave y cuadro de cuadre)");
    caja.appendChild(el("p", null, "La prima aparece en " + donde.join("; ") + ". " +
      (imp ? "En la importación forma parte del valor en aduana (FOB + flete + seguro + ajustes, IT A 6.5)." :
        (r.incoterm === "CIF" ? "En la exportación CIF la prima está incluida en el precio y se deduce en S 6.3 para llegar al FOB (S 6.5)." :
          r.incoterm === "CIP" ? "En CIP la prima está en el precio; revisa S 6.3 (A21)." : "No forma parte del precio ni del FOB de la DAM de salida." ))));
    return caja;
  }

  D.registrar({
    id: "seguro", codigo: "SEG", es: "Certificado de seguro", en: "Insurance certificate",
    titulo: "CERTIFICADO DE SEGURO DE TRANSPORTE", tituloEn: "CARGO INSURANCE CERTIFICATE",
    nota: "Lo emite la aseguradora a pedido de quien contrata el seguro. Solo se genera si hay seguro (obligatorio en CIF y CIP).",
    aplica: function (ctx) { return ctx.op.especificos.seguro.hay === true; },
    generar: generar
  });
})();
