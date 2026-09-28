/* Factura comercial en pantalla. Lee el estado; los totales salen de Calculos.
   Script clásico: objeto global Factura. Sin módulos y sin fetch. */

var Factura = (function () {
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

  function anioIncoterms(version) {
    var v = texto(version);
    if (v === "4") {
      return "2020";
    }
    return v;
  }

  function linea(bloque, etiqueta, valor) {
    var p = el("p", "doc-dato");
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

  function pintar(operacion) {
    var hoja = document.getElementById("factura-comercial");
    var op = operacion || {};
    var partes = op.partes || {};
    var proveedor = partes.proveedor || {};
    var importador = partes.importador || {};
    var comercial = op.comercial || {};
    var items = op.items || [];
    var cifras = window.Calculos ? Calculos.totales(op) : { valoresItem: [], fobUsd: 0 };
    var cuerpo;
    var partesGrid;
    var vendedor;
    var comprador;
    var meta;
    var tabla;
    var thead;
    var trh;
    var tbody;
    var tfoot;
    var i;
    var item;
    var tr;
    var vendedorLineas;
    var compradorLineas;
    var incotermsAnio;
    var incotermsTermino;
    var moneda;
    var pago;
    var importe;
    var trTotal;
    var thTotal;

    if (!hoja) {
      return;
    }

    hoja.textContent = "";
    var marca = el("p", "marca-agua", MARCA);
    marca.setAttribute("aria-hidden", "true");
    hoja.appendChild(marca);

    cuerpo = el("div", "cuerpo-documento");
    cuerpo.appendChild(el("p", "kicker", "Factura comercial"));

    meta = el("div", "doc-meta");
    linea(meta, "Número de factura:", texto(comercial.numeroFactura) || "—");
    linea(meta, "Fecha:", formatoFecha(comercial.fechaFactura));
    cuerpo.appendChild(meta);

    partesGrid = el("div", "doc-partes");

    vendedor = el("div", "doc-bloque");
    vendedor.appendChild(el("h3", null, "Vendedor (proveedor / shipper)"));
    vendedorLineas = lineasPersona(proveedor);
    vendedor.appendChild(parrafoMultilinea("doc-texto", vendedorLineas.length ? vendedorLineas : ["—"]));
    partesGrid.appendChild(vendedor);

    comprador = el("div", "doc-bloque");
    comprador.appendChild(el("h3", null, "Comprador (importador)"));
    compradorLineas = [];
    if (texto(importador.razonSocial)) {
      compradorLineas.push(texto(importador.razonSocial));
    }
    if (texto(importador.ruc)) {
      compradorLineas.push("RUC " + texto(importador.ruc));
    }
    if (texto(importador.direccion)) {
      compradorLineas.push(texto(importador.direccion));
    }
    comprador.appendChild(parrafoMultilinea("doc-texto", compradorLineas.length ? compradorLineas : ["—"]));
    partesGrid.appendChild(comprador);
    cuerpo.appendChild(partesGrid);

    incotermsAnio = anioIncoterms(comercial.incotermVersion);
    incotermsTermino = [texto(comercial.incoterm), texto(comercial.incotermLugar)].filter(Boolean).join(" ");
    moneda = texto(comercial.moneda) || "—";
    pago = texto(comercial.formaPagoFrase) || texto(comercial.formaPagoDescripcion) || "—";

    cuerpo.appendChild(el(
      "p",
      "doc-destacado",
      "Incoterms " + (incotermsAnio || "—") + ": " + (incotermsTermino || "—")
    ));
    linea(cuerpo, "Moneda:", moneda + " (USD)");
    linea(cuerpo, "Forma de pago:", pago);

    var serie = op.serie || {};
    var transporte = op.transporte || {};
    linea(cuerpo, "País de origen de la mercancía:", texto(serie.paisOrigen) || "—");
    linea(cuerpo, "Puerto de embarque:", texto(transporte.puertoEmbarque) || "—");
    linea(cuerpo, "Puerto de destino:", texto(transporte.puertoDestino) || "—");

    tabla = el("table", "doc-tabla");
    tabla.setAttribute("id", "tabla-factura");
    thead = document.createElement("thead");
    trh = document.createElement("tr");
    trh.appendChild(celda("th", null, "Ítem"));
    trh.appendChild(celda("th", null, "Descripción"));
    trh.appendChild(celda("th", "doc-num", "Cantidad"));
    trh.appendChild(celda("th", null, "Unidad"));
    trh.appendChild(celda("th", "doc-num", "Precio unitario"));
    trh.appendChild(celda("th", "doc-num", "Importe"));
    thead.appendChild(trh);
    tabla.appendChild(thead);

    tbody = document.createElement("tbody");
    for (i = 0; i < items.length; i++) {
      item = items[i] || {};
      importe = cifras.valoresItem[i];
      tr = document.createElement("tr");
      tr.appendChild(celda("td", null, String(i + 1)));
      tr.appendChild(celda("td", null, texto(item.descripcion) || "—"));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.cantidad)));
      tr.appendChild(celda("td", null, texto(item.unidadComercial) || "—"));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoValorItem(item.precioUnitarioUsd) + " USD"));
      tr.appendChild(celda("td", "doc-num", (importe == null ? "—" : Calculos.formatoValorItem(importe) + " USD")));
      tbody.appendChild(tr);
    }
    tabla.appendChild(tbody);

    tfoot = document.createElement("tfoot");
    trTotal = document.createElement("tr");
    thTotal = el("th", "doc-total-etiqueta", "Total FOB");
    thTotal.colSpan = 5;
    trTotal.appendChild(thTotal);
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoValorItem(cifras.fobUsd) + " USD"));
    tfoot.appendChild(trTotal);
    tabla.appendChild(tfoot);
    cuerpo.appendChild(tabla);

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
