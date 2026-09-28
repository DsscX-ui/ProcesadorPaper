/* Bill of Lading en pantalla. Documento didáctico genérico: no es el
   formulario de una naviera. Lee el estado; bultos, peso bruto y volumen
   salen de Calculos (sin peso neto en este BL). Script clásico: objeto
   global Bl (y el alias BL). Sin módulos y sin fetch. */

var Bl = (function () {
  var MARCA = "DOCUMENTO DIDÁCTICO – SIN VALIDEZ OFICIAL";

  function texto(valor) {
    return String(valor == null ? "" : valor).trim();
  }

  function el(tag, className, contenido) {
    var n = document.createElement(tag);
    if (className) {
      n.className = className;
    }
    if (contenido != null && contenido !== "") {
      n.textContent = contenido;
    }
    return n;
  }

  function formatoFecha(iso) {
    var m = texto(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) {
      return texto(iso) || "—";
    }
    return m[3] + "/" + m[2] + "/" + m[1];
  }

  function linea(bloque, etiqueta, valor, className) {
    var p = el("p", className ? "doc-dato " + className : "doc-dato");
    var dt = el("span", "doc-etiqueta", etiqueta);
    p.appendChild(dt);
    p.appendChild(document.createTextNode(" " + valor));
    bloque.appendChild(p);
  }

  function parrafoMultilinea(clase, lineas) {
    var p = el("p", clase);
    var i;
    for (i = 0; i < lineas.length; i++) {
      if (i > 0) {
        p.appendChild(document.createElement("br"));
      }
      p.appendChild(document.createTextNode(lineas[i]));
    }
    return p;
  }

  function celda(tag, className, valor) {
    return el(tag, className, valor);
  }

  function lineasPersona(persona) {
    var lineas = [];
    var dir;
    var ciudadPais;
    if (texto(persona.razonSocial)) {
      lineas.push(texto(persona.razonSocial));
    }
    dir = texto(persona.direccion);
    if (dir) {
      lineas.push(dir);
    }
    ciudadPais = [texto(persona.ciudad), texto(persona.pais)].filter(Boolean).join(", ");
    if (ciudadPais && dir.toLowerCase().indexOf(ciudadPais.toLowerCase()) === -1) {
      lineas.push(ciudadPais);
    }
    return lineas;
  }

  function lineasShipper(partes, proveedor) {
    var alterno = texto(partes.shipperBl);
    var nombre = texto(proveedor.razonSocial);
    if (alterno && alterno.toLowerCase() !== nombre.toLowerCase()) {
      return [alterno];
    }
    return lineasPersona(proveedor);
  }

  function lineasConsignee(importador) {
    var lineas = [];
    if (texto(importador.razonSocial)) {
      lineas.push(texto(importador.razonSocial));
    }
    if (texto(importador.ruc)) {
      lineas.push("RUC " + texto(importador.ruc));
    }
    if (texto(importador.direccion)) {
      lineas.push(texto(importador.direccion));
    }
    return lineas;
  }

  function pintar(operacion) {
    var hoja = document.getElementById("bill-of-lading");
    var op = operacion || {};
    var partes = op.partes || {};
    var proveedor = partes.proveedor || {};
    var importador = partes.importador || {};
    var notify = partes.notify || {};
    var naviera = partes.naviera || {};
    var transporte = op.transporte || {};
    var comercial = op.comercial || {};
    var serie = op.serie || {};
    var items = op.items || [];
    var cifras = window.Calculos ? Calculos.totales(op) : {
      bultos: 0,
      pesoNetoKg: 0,
      pesoBrutoKg: 0,
      volumenM3: 0,
      fleteUsd: 0
    };
    var cuerpo;
    var meta;
    var partesGrid;
    var shipper;
    var consignee;
    var notifyBloque;
    var shipperLineas;
    var consigneeLineas;
    var notifyLineas;
    var equipo;
    var numeroContenedor;
    var tipoContenedor;
    var contenedorTexto;
    var buqueViaje;
    var tabla;
    var thead;
    var trh;
    var tbody;
    var tfoot;
    var i;
    var item;
    var tr;
    var trTotal;
    var thTotal;
    var claseBulto;
    var totalesTexto;
    var flete;
    var emision;
    var lugarFecha;
    var incoterm;

    if (!hoja) {
      return;
    }

    hoja.textContent = "";
    var marca = el("p", "marca-agua", MARCA);
    marca.setAttribute("aria-hidden", "true");
    hoja.appendChild(marca);

    cuerpo = el("div", "cuerpo-documento");
    cuerpo.appendChild(el("p", "kicker", "Conocimiento de embarque"));
    cuerpo.appendChild(el("p", "doc-subtitulo", "Bill of Lading"));
    cuerpo.appendChild(el(
      "p",
      "doc-leyenda",
      "Documento didáctico genérico. El formato no pertenece a una naviera concreta. El número de BL, el rótulo de buque y viaje, y la forma de indicar el flete cambian según la línea."
    ));

    meta = el("div", "doc-meta");
    linea(meta, "Naviera (Carrier):", texto(naviera.nombre) || "—");
    linea(meta, "Número de BL (B/L No.):", texto(transporte.numeroBl) || "—");
    buqueViaje = [texto(transporte.buque), texto(transporte.viaje)].filter(Boolean).join(" / ");
    linea(meta, "Buque / viaje (Vessel / Voyage):", buqueViaje || "—", "doc-ancho");
    linea(meta, "Puerto de embarque:", texto(transporte.puertoEmbarque) || "—");
    linea(meta, "Puerto de destino / descarga:", texto(transporte.puertoDestino) || "—");
    linea(meta, "Fecha de embarque:", formatoFecha(transporte.fechaEmbarque), "doc-ancho");
    cuerpo.appendChild(meta);

    partesGrid = el("div", "doc-partes");

    shipper = el("div", "doc-bloque");
    shipper.appendChild(el("h3", null, "Shipper (embarcador)"));
    shipperLineas = lineasShipper(partes, proveedor);
    shipper.appendChild(parrafoMultilinea("doc-texto", shipperLineas.length ? shipperLineas : ["—"]));
    partesGrid.appendChild(shipper);

    consignee = el("div", "doc-bloque");
    consignee.appendChild(el("h3", null, "Consignee (consignatario)"));
    consigneeLineas = lineasConsignee(importador);
    consignee.appendChild(parrafoMultilinea("doc-texto", consigneeLineas.length ? consigneeLineas : ["—"]));
    partesGrid.appendChild(consignee);

    notifyBloque = el("div", "doc-bloque doc-ancho");
    notifyBloque.appendChild(el("h3", null, "Notify party (aviso de llegada)"));
    notifyLineas = [];
    if (texto(notify.razonSocial)) {
      notifyLineas.push(texto(notify.razonSocial));
    }
    notifyLineas.push("Recibe el aviso de llegada. No es el consignatario.");
    notifyBloque.appendChild(parrafoMultilinea("doc-texto", notifyLineas));
    partesGrid.appendChild(notifyBloque);
    cuerpo.appendChild(partesGrid);

    numeroContenedor = texto(transporte.contenedorNumero);
    tipoContenedor = texto(transporte.contenedorTipo);
    contenedorTexto = numeroContenedor || "—";
    if (numeroContenedor && tipoContenedor) {
      contenedorTexto = numeroContenedor + " (" + tipoContenedor + ")";
    } else if (tipoContenedor) {
      contenedorTexto = tipoContenedor;
    }

    equipo = el("div", "doc-bloque");
    equipo.appendChild(el("h3", null, "Equipo, precinto y marcas"));
    linea(equipo, "Contenedor (Container):", contenedorTexto);
    linea(equipo, "Precinto (Seal):", texto(transporte.precinto) || "—");
    linea(equipo, "Marcas de los bultos (Marks and numbers):", texto(transporte.marcasBultos) || "—");
    claseBulto = texto(serie.claseBulto);
    if (claseBulto) {
      linea(equipo, "Clase de bulto:", claseBulto);
    }
    cuerpo.appendChild(equipo);

    tabla = el("table", "doc-tabla");
    tabla.setAttribute("id", "tabla-bl");
    thead = document.createElement("thead");
    trh = document.createElement("tr");
    trh.appendChild(celda("th", null, "Ítem"));
    trh.appendChild(celda("th", null, "Descripción"));
    trh.appendChild(celda("th", "doc-num", "Bultos"));
    trh.appendChild(celda("th", "doc-num", "Peso bruto"));
    trh.appendChild(celda("th", "doc-num", "Volumen"));
    thead.appendChild(trh);
    tabla.appendChild(thead);

    tbody = document.createElement("tbody");
    for (i = 0; i < items.length; i++) {
      item = items[i] || {};
      tr = document.createElement("tr");
      tr.appendChild(celda("td", null, String(i + 1)));
      tr.appendChild(celda("td", null, texto(item.descripcion) || "—"));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.bultos)));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.pesoBrutoKg) + " kg"));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.volumenM3) + " m³"));
      tbody.appendChild(tr);
    }
    tabla.appendChild(tbody);

    tfoot = document.createElement("tfoot");
    trTotal = document.createElement("tr");
    thTotal = el("th", "doc-total-etiqueta", "Totales");
    thTotal.colSpan = 2;
    trTotal.appendChild(thTotal);
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.bultos)));
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.pesoBrutoKg) + " kg"));
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.volumenM3) + " m³"));
    tfoot.appendChild(trTotal);
    tabla.appendChild(tfoot);
    cuerpo.appendChild(tabla);

    totalesTexto = Calculos.formatoCantidad(cifras.bultos) + " bultos" +
      (claseBulto ? " (" + claseBulto + ")" : "") + ", " +
      Calculos.formatoCantidad(cifras.pesoBrutoKg) + " kg brutos, " +
      Calculos.formatoCantidad(cifras.volumenM3) + " m³";
    cuerpo.appendChild(el("p", "doc-totales-packing", totalesTexto));

    if (texto(transporte.clausulaSaidToContain) === "1" || transporte.clausulaSaidToContain === true ||
        texto(transporte.clausulaSaidToContain).toLowerCase() === "si" ||
        texto(transporte.clausulaSaidToContain).toLowerCase() === "sí") {
      cuerpo.appendChild(el(
        "p",
        "doc-texto doc-clausula",
        "Said to contain (se dice contener): el transportista no verificó el contenido de los bultos. Declara lo que el embarcador manifiesta."
      ));
    }

    flete = el("div", "doc-bloque doc-flete");
    flete.appendChild(el("h3", null, "Flete (Freight)"));
    flete.appendChild(el("p", "doc-texto", "SUPUESTO: flete por cobrar (freight collect)."));
    incoterm = texto(comercial.incoterm).toUpperCase();
    if (incoterm === "FOB") {
      flete.appendChild(el("p", "doc-texto doc-flete-nota", "En un FOB el vendedor no paga el flete marítimo."));
    }
    flete.appendChild(el(
      "p",
      "doc-texto doc-flete-nota",
      "Monto de este ejercicio didáctico, supuesto del caso: " +
        Calculos.formatoValorItem(cifras.fleteUsd) +
        " USD. Son ochocientos dólares (no ochocientos mil). En la DAM el mismo supuesto se escribe con tres decimales (800,000). Varias navieras dejan el monto en blanco. El rótulo (prepaid, collect o as arranged) cambia según la línea."
    ));
    cuerpo.appendChild(flete);

    emision = el("div", "doc-bloque doc-emision");
    emision.appendChild(el("h3", null, "Emisión del conocimiento"));
    if (texto(transporte.numeroOriginalesBl)) {
      linea(emision, "Número de originales:", texto(transporte.numeroOriginalesBl));
    }
    lugarFecha = [];
    if (texto(transporte.lugarEmisionBl)) {
      lugarFecha.push(texto(transporte.lugarEmisionBl));
    }
    if (texto(transporte.fechaEmisionBl) || texto(transporte.fechaEmbarque)) {
      lugarFecha.push(formatoFecha(transporte.fechaEmisionBl || transporte.fechaEmbarque));
    }
    if (lugarFecha.length) {
      linea(emision, "Lugar y fecha de emisión:", lugarFecha.join(", "));
    }
    if (texto(transporte.shippedOnBoard) === "1" || transporte.shippedOnBoard === true ||
        texto(transporte.shippedOnBoard).toLowerCase().indexOf("shipped") !== -1 ||
        texto(transporte.shippedOnBoard).toLowerCase() === "si" ||
        texto(transporte.shippedOnBoard).toLowerCase() === "sí") {
      emision.appendChild(el("p", "doc-texto doc-shipped", "Shipped on board"));
      emision.appendChild(el(
        "p",
        "doc-texto doc-flete-nota",
        "La mercancía se declara embarcada a bordo en la fecha de embarque. El rótulo exacto cambia según la naviera."
      ));
    }
    cuerpo.appendChild(emision);

    hoja.appendChild(cuerpo);
  }

  function intentarPintar() {
    if (window.Modelo && typeof Modelo.obtener === "function") {
      var op = Modelo.obtener();
      if (op) {
        pintar(op);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", intentarPintar);
  } else {
    intentarPintar();
  }

  return {
    pintar: pintar
  };
})();

window.BL = Bl;
