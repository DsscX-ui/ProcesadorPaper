/* Plantillas del transporte (PLAN §3 doc 3, §5 columna BL; fase F7):
   (a) INSTRUCCIONES DE EMBARQUE / SHIPPING INSTRUCTIONS: las da el embarcador a la naviera o a su agente.
   (b) BORRADOR DE B/L / DRAFT BILL OF LADING: lo emite la naviera; aquí, con la leyenda «BORRADOR – DRAFT».
   (c) DECLARACIÓN VGM / VERIFIED GROSS MASS: la firma el embarcador (SOLAS VI/2 [H*]); VGM = carga + estiba + tara (§6.7).
   Bultos, peso bruto, volumen, contenedor y precinto = lista de empaque (cifras de cuadre data-cuadre).
   Solo leen la operación y el resultado de Calculos.calcular; no calculan ni redondean.
   Script clásico: se registra en Documentos (antes de la hoja resumen). */

(function () {
  var D = Documentos, Fm = Calculos.formato, el = D.el;

  // Consignatario en el B/L según su tipo: nominativo → el consignatario; a la orden → «TO ORDER OF …».
  function consignatarioBl(ctx) {
    var t = ctx.op.especificos.transporte, c = D.consignatario(ctx);
    if (t.blTipo === "a_la_orden" && c.tipo !== "a_la_orden") {
      return { nombre: "A la orden de / To the order of: " + c.nombre, direccion: c.direccion };
    }
    return c;
  }

  // Descripción genérica de la carga: nombres de los productos (sin precios), como suele ir en el B/L.
  function descripcionGenerica(ctx) {
    var nombres = [];
    ctx.op.especificos.items.forEach(function (it) {
      var n = it.nombre || "mercancía";
      if (nombres.indexOf(n) === -1) { nombres.push(n); }
    });
    return nombres.join("; ");
  }

  // Subpartidas del SA (6 dígitos), sin repetir, cada una con sus marcas (H*; PV si la nacional está por verificar).
  function subpartidasSa(ctx) {
    var vistas = [], s = el("span", "doc-linea", "SA / HS: ");
    ctx.op.especificos.items.forEach(function (it, i) {
      var c = D.sa6(it.subpartida);
      if (vistas.indexOf(c) !== -1) { return; }
      if (vistas.length) { s.appendChild(document.createTextNode(", ")); }
      vistas.push(c);
      s.appendChild(D.sa6Marcado(ctx, i));
    });
    return s;
  }

  function flete(ctx) {
    var f = ctx.op.especificos.transporte.fleteBl;
    return f === "prepaid" ? "FREIGHT PREPAID (flete pagado en origen)" : (f === "collect" ? "FREIGHT COLLECT (flete por pagar en destino)" : "—");
  }

  function partesTransporte(ctx, cuerpo) {
    var emb = D.embarcador(ctx), cons = consignatarioBl(ctx), nt = D.notify(ctx);
    var col = el("div", "doc-columnas");
    col.appendChild(D.datos(["Embarcador", "Shipper"], [["Nombre", "Name", emb.nombre], ["Dirección", "Address", emb.direccion]], "doc-parte"));
    col.appendChild(D.datos(["Consignatario", "Consignee"], [["Nombre", "Name", cons.nombre], ["Dirección", "Address", cons.direccion]], "doc-parte"));
    cuerpo.appendChild(col);
    var col2 = el("div", "doc-columnas");
    col2.appendChild(D.datos(["Notificar a", "Notify party"], [["Nombre", "Name", nt.igual ? nt.nombre + " (el consignatario / same as consignee)" : nt.nombre],
      ["Dirección", "Address", nt.direccion]], "doc-parte"));
    var g = ctx.op.generales, t = ctx.op.especificos.transporte;
    col2.appendChild(D.datos(["Ruta", "Routing"], [
      g.ruta.lugarRecepcion ? ["Lugar de recepción", "Place of receipt", g.ruta.lugarRecepcion] : null,
      ["Puerto de embarque", "Port of loading", D.puertoMarcado(ctx, "puertoEmbarque")],
      ["Puerto de descarga", "Port of discharge", D.puertoMarcado(ctx, "puertoDescarga")],
      g.ruta.lugarEntrega ? ["Lugar de entrega", "Place of delivery", g.ruta.lugarEntrega] : null,
      ["Nave / viaje", "Vessel / voyage", [t.nave, t.viaje].filter(Boolean).join(" / ") || "—"]
    ]));
    cuerpo.appendChild(col2);
  }

  // Tabla de la carga: marcas | contenedor/precinto/tipo | N° y tipo de bultos | descripción | peso bruto | volumen.
  function tablaCarga(ctx, cuerpo) {
    var r = ctx.r, e = ctx.op.especificos, cont = D.contenedor(ctx);
    var contenedor = el("span");
    contenedor.appendChild(D.cifra(cont.numero, "contenedor"));
    contenedor.appendChild(el("span", "doc-linea", "Precinto / Seal: "));
    contenedor.lastChild.appendChild(D.cifra(cont.precinto, "precinto"));
    contenedor.appendChild(el("span", "doc-linea", cont.tipo));
    var bultos = el("span");
    bultos.appendChild(D.cifra(String(r.totales.bultos), "bultos"));
    bultos.appendChild(document.createTextNode(" " + D.clasesBulto(ctx).toLowerCase()));
    bultos.appendChild(el("span", "doc-linea", "C/No. " + r.totales.numeracion.replace("-", "–")));
    var desc = el("span");
    // «STC (dice contener)» solo si la cláusula STC está elegida (F7.1, auditoría F7-M2).
    var stc = e.transporte.clausulaStc ? " — STC (dice contener / said to contain):" : ":";
    desc.appendChild(el("strong", null, "1 × " + (cont.tipo.split(" — ")[1] || cont.tipo) + " FCL" + stc));
    desc.appendChild(el("span", "doc-linea", descripcionGenerica(ctx)));
    desc.appendChild(subpartidasSa(ctx));
    desc.appendChild(el("span", "doc-linea", "Factura / Invoice " + (ctx.op.generales.comercial.facturaNumero || "—")));
    var pb = el("span"); pb.appendChild(D.cifra(Fm.kg(r.totales.pesoBruto), "pesoBruto")); pb.appendChild(document.createTextNode(" kg"));
    var vol = el("span"); vol.appendChild(D.cifra(Fm.m3(r.totales.volumen), "volumen")); vol.appendChild(document.createTextNode(" m³"));
    cuerpo.appendChild(D.tabla([
      { es: "Marcas", en: "Marks and numbers" }, { es: "Contenedor", en: "Container / seal" },
      { es: "N° y tipo de bultos", en: "No. and kind of packages" }, { es: "Descripción de la mercancía", en: "Description of goods", clase: "doc-desc" },
      { es: "Peso bruto", en: "Gross weight", num: true }, { es: "Volumen", en: "Measurement", num: true }
    ], [[el("span", "doc-marcas", e.marcasEmbarque || "—"), contenedor, bultos, desc, pb, vol]], { clase: "doc-carga" }));
  }

  // ---------------------------------------------------------------- (a) Instrucciones de embarque
  function instrucciones(ctx) {
    var op = ctx.op, r = ctx.r, t = op.especificos.transporte, c = op.especificos.contenedor;
    var marco = D.hoja(this, ctx, "Booking N° / No. " + (t.booking || "—") + " · Para / To: " + (op.generales.partes.naviera.nombre || "la naviera"));
    var cuerpo = marco.cuerpo;
    partesTransporte(ctx, cuerpo);
    tablaCarga(ctx, cuerpo);
    var col = el("div", "doc-columnas");
    var fl = el("span", null, flete(ctx));
    if (!r.fleteBl.coincide) { fl.appendChild(el("span", "doc-linea", "Lo usual en " + r.incoterm + " es «" + r.fleteBl.sugerido + "» (advertencia A05).")); }
    col.appendChild(D.datos(["Instrucciones para el B/L", "B/L instructions"], [
      ["Tipo de B/L", "B/L type", D.opcion("tipoBl", t.blTipo, true)],
      ["N° de originales", "No. of originals", t.blOriginales == null ? "—" : D.enteroEnLetras(t.blOriginales) + " (" + t.blOriginales + ")"],
      ["Flete", "Freight", fl],
      ["Incoterm® 2020", "Incoterms® rule", (op.generales.comercial.incoterm || "—") + " " + (op.generales.comercial.lugarConvenido || "")],
      ["Cláusulas", "Clauses", [t.clausulaSlac ? "SLAC" : "", t.clausulaStc ? "STC" : ""].filter(Boolean).join(" y ") || "Ninguna"],
      ["Lugar de emisión", "Place of issue", t.blLugarEmision]
    ]));
    var vgm = el("span"); vgm.appendChild(D.cifra(Fm.kg(r.vgm.total), "vgm")); vgm.appendChild(document.createTextNode(" kg (método " + (c.vgmMetodo || "—") + ")"));
    col.appendChild(D.datos(["Carga y fechas", "Cargo and dates"], [
      ["Modalidad", "Load type", "FCL / CY–CY (contenedor completo)"],
      ["Peso neto total", "Total net weight", Fm.kg(r.totales.pesoNeto) + " kg"],
      ["VGM declarado", "Declared VGM", vgm],
      ["Fecha de embarque prevista", "Expected loading date", D.fecha(t.fechaEmbarque)],
      ["Documentos que acompañan", "Documents attached", "Factura comercial, lista de empaque, declaración VGM"]
    ]));
    cuerpo.appendChild(col);
    cuerpo.appendChild(el("p", "doc-nota", "El embarcador pide a la naviera que emita el B/L con estos datos. Bultos, peso bruto, volumen, contenedor y precinto son los de la lista de empaque. " +
      "Si el B/L sale distinto, se corrige el borrador antes de emitir los originales."));
    cuerpo.appendChild(el("p", "doc-linea-firma", "Firma del embarcador / Shipper's signature: ______________________________   Fecha / Date: ____________"));
    return marco.hoja;
  }

  // ---------------------------------------------------------------- (b) Borrador de B/L
  function borradorBl(ctx) {
    var op = ctx.op, r = ctx.r, t = op.especificos.transporte;
    var marco = D.hoja(this, ctx, "B/L N° / No. " + (t.blNumero || "(por asignar)") + " · Booking " + (t.booking || "—"));
    var cuerpo = marco.cuerpo;
    var leyenda = el("p", "doc-borrador", "BORRADOR – DRAFT · para revisión del embarcador; no es un título valor / for shipper's approval, not negotiable");
    cuerpo.appendChild(leyenda);
    cuerpo.appendChild(D.datos(["Transportista", "Carrier"], [["Naviera", "Shipping line", op.generales.partes.naviera.nombre],
      ["Tipo de B/L", "B/L type", D.opcion("tipoBl", t.blTipo, true) + (t.blTipo === "a_la_orden" ? " (negociable por endoso / negotiable)" : " (a nombre del consignatario / straight)")]]));
    partesTransporte(ctx, cuerpo);
    tablaCarga(ctx, cuerpo);
    var clausulas = [];
    if (t.clausulaSlac) { clausulas.push("SHIPPER'S LOAD, STOW AND COUNT (SLAC): el embarcador cargó, estibó y contó; la naviera no lo verificó."); }
    if (t.clausulaStc) { clausulas.push("SAID TO CONTAIN (STC): la descripción es la que declaró el embarcador."); }
    var col = el("div", "doc-columnas");
    col.appendChild(D.datos(["Flete y originales", "Freight and originals"], [
      ["Flete", "Freight", flete(ctx)],
      ["Pagadero en", "Payable at", t.fleteBl === "prepaid" ? D.puertoMarcado(ctx, "puertoEmbarque") : (t.fleteBl === "collect" ? D.puertoMarcado(ctx, "puertoDescarga") : "—")],
      ["N° de originales", "No. of original B/L", t.blOriginales == null ? "—" : D.enteroEnLetras(t.blOriginales) + " (" + t.blOriginales + ")"]
    ]));
    col.appendChild(D.datos(["Emisión y embarque", "Issue and shipment"], [
      ["Lugar y fecha de emisión", "Place and date of issue", (t.blLugarEmision || "—") + ", " + D.fecha(t.blFechaEmision)],
      ["A bordo (shipped on board)", "Shipped on board date", D.fecha(t.fechaShippedOnBoard)],
      ["Cláusulas", "Clauses", clausulas.length ? clausulas.join(" ") : "Ninguna"]
    ]));
    cuerpo.appendChild(col);
    cuerpo.appendChild(el("p", "doc-nota", "Recibido a bordo en aparente buen estado, salvo indicación en contrario, para su transporte y entrega en el puerto de descarga. " +
      "Contra la entrega de uno de los originales debidamente endosado (o a nombre del consignatario, si es nominativo), los demás quedan sin valor. " +
      "Texto ilustrativo: las condiciones reales están al dorso del B/L de cada naviera."));
    cuerpo.appendChild(el("p", "doc-linea-firma", "Por la naviera, como transportista / For the carrier: ______________________________"));
    return marco.hoja;
  }

  // ---------------------------------------------------------------- (c) Declaración VGM
  function declaracionVgm(ctx) {
    var op = ctx.op, r = ctx.r, c = op.especificos.contenedor, t = op.especificos.transporte;
    var marco = D.hoja(this, ctx, "Contenedor / Container " + (c.numero || "—") + " · Booking " + (t.booking || "—"));
    var cuerpo = marco.cuerpo;
    var intro = el("p", "doc-nota doc-nota-hr");
    intro.appendChild(document.createTextNode("Convenio SOLAS, capítulo VI, regla 2: desde el 1-jul-2016 un contenedor lleno no se embarca sin su masa bruta verificada (VGM), declarada por el embarcador. "));
    intro.appendChild(D.etiquetaMarca("H*", "Conocimiento general; sin fuente en la carpeta"));
    cuerpo.appendChild(intro);
    var emb = D.embarcador(ctx), cont = D.contenedor(ctx);
    var col = el("div", "doc-columnas");
    col.appendChild(D.datos(["Embarcador", "Shipper"], [["Nombre", "Name", emb.nombre], ["Dirección", "Address", emb.direccion]], "doc-parte"));
    col.appendChild(D.datos(["Contenedor y embarque", "Container and shipment"], [
      ["N° de contenedor", "Container No.", D.conMarca(ctx, D.cifra(cont.numero, "contenedor"), "especificos.contenedor.numero")],
      ["Tipo (ISO)", "Size/type", cont.tipo],
      ["Precinto", "Seal No.", D.cifra(cont.precinto, "precinto")],
      ["Naviera / nave / viaje", "Carrier / vessel / voyage", [op.generales.partes.naviera.nombre, t.nave, t.viaje].filter(Boolean).join(" / ")],
      ["Puerto de embarque", "Port of loading", D.puertoMarcado(ctx, "puertoEmbarque")]
    ]));
    cuerpo.appendChild(col);
    var v = r.vgm;
    var carga = D.cifra(Fm.kg(v.pesoBruto), "pesoBruto");
    var total = D.cifra(Fm.kg(v.total), "vgm");
    // La tara siempre lleva POR VERIFICAR (PV-16), aunque el dato tenga su propia marca (SUPUESTO en los ejemplos).
    var tara = D.conMarca(ctx, Fm.kg(v.tara), "especificos.contenedor.tara", "(PV-16: la tara real está en la placa del contenedor.)");
    if (!tara.querySelector(".marca-pv")) {
      tara.appendChild(document.createTextNode(" "));
      tara.appendChild(D.etiquetaMarca("PV", "PV-16: la tara real está en la placa del contenedor"));
    }
    cuerpo.appendChild(D.tabla([{ es: "Concepto", en: "Item" }, { es: "kg", en: "kg", num: true }, { es: "De dónde sale", en: "Source" }], [
      ["Peso bruto de la carga (todos los bultos)", carga, "Lista de empaque: Σ bultos × peso bruto por bulto"],
      ["+ Estiba y trincaje (materiales de sujeción)", Fm.kg(v.estiba), "Dato del embarcador (0 si no hay)"],
      ["+ Tara del contenedor", tara, "Placa CSC del contenedor"]
    ], { pie: [{ celdas: ["= VGM (masa bruta verificada) / Verified gross mass", total, "PLAN §6.7"] }], clase: "doc-tabla-vgm" }));
    var metodo = el("span", null, D.opcion("metodoVgm", c.vgmMetodo));
    metodo.appendChild(document.createTextNode(" "));
    metodo.appendChild(D.etiquetaMarca("H*"));
    cuerpo.appendChild(D.datos(["Declaración", "Declaration"], [
      ["Método", "Method", metodo],
      ["Responsable (firma autorizada)", "Authorized signatory", c.vgmResponsable],
      ["Fecha", "Date", D.fecha(c.vgmFecha)]
    ]));
    cuerpo.appendChild(el("p", "doc-nota", "Método 1: se pesa el contenedor lleno en una báscula calibrada. Método 2: se suman los pesos de toda la carga, el embalaje, la estiba y la tara. " +
      "El VGM no debe superar el peso bruto máximo de la placa del contenedor (referencia 30,480 kg, ISO 668; advertencia A07; PV-16)."));
    cuerpo.appendChild(el("p", "doc-linea-firma", "Declaro que la masa bruta verificada indicada es correcta. Firma / Signature: ______________________________"));
    return marco.hoja;
  }

  D.registrar({ id: "instrucciones", codigo: "IE", es: "Instrucciones de embarque", en: "Shipping instructions",
    titulo: "INSTRUCCIONES DE EMBARQUE", tituloEn: "SHIPPING INSTRUCTIONS",
    nota: "Las da el embarcador a la naviera (o a su agente) para que emita el B/L.", generar: instrucciones });
  D.registrar({ id: "bl", codigo: "B/L", es: "Borrador de B/L", en: "Draft bill of lading",
    titulo: "CONOCIMIENTO DE EMBARQUE — BORRADOR", tituloEn: "BILL OF LADING — DRAFT",
    nota: "Lo emite la naviera; el embarcador revisa este borrador antes de recibir los originales.", generar: borradorBl });
  D.registrar({ id: "vgm", codigo: "VGM", es: "Declaración VGM", en: "VGM declaration",
    titulo: "DECLARACIÓN DE MASA BRUTA VERIFICADA (VGM)", tituloEn: "VERIFIED GROSS MASS DECLARATION",
    nota: "La firma el embarcador; sin VGM el contenedor no se embarca (SOLAS VI/2).", generar: declaracionVgm });
})();
