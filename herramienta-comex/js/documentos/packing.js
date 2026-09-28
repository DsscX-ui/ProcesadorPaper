/* Packing list en pantalla. Lee el estado; bultos, pesos y volumen salen de Calculos.
   Sin precios. Script clásico: objeto global Packing. Sin módulos y sin fetch. */

var Packing = (function () {
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
    var hoja = document.getElementById("packing-list");
    var op = operacion || {};
    var partes = op.partes || {};
    var proveedor = partes.proveedor || {};
    var importador = partes.importador || {};
    var comercial = op.comercial || {};
    var serie = op.serie || {};
    var items = op.items || [];
    var cifras = window.Calculos ? Calculos.totales(op) : {
      bultos: 0,
      pesoNetoKg: 0,
      pesoBrutoKg: 0,
      volumenM3: 0
    };
    var cuerpo;
    var meta;
    var partesGrid;
    var exportador;
    var destinatario;
    var exportadorLineas;
    var destinatarioLineas;
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
    var totalesTexto;
    var claseBulto;

    if (!hoja) {
      return;
    }

    hoja.textContent = "";
    var marca = el("p", "marca-agua", MARCA);
    marca.setAttribute("aria-hidden", "true");
    hoja.appendChild(marca);

    cuerpo = el("div", "cuerpo-documento");
    cuerpo.appendChild(el("p", "kicker", "Packing list"));
    cuerpo.appendChild(el("p", "doc-subtitulo", "Lista de empaque"));

    var transporte = op.transporte || {};
    meta = el("div", "doc-meta");
    linea(meta, "Número de factura:", texto(comercial.numeroFactura) || "—");
    linea(meta, "Fecha:", formatoFecha(comercial.fechaFactura));
    claseBulto = texto(serie.claseBulto);
    if (claseBulto) {
      linea(meta, "Clase de bulto:", claseBulto);
    }
    linea(meta, "Número de contenedor:", texto(transporte.contenedorNumero) || "—");
    linea(meta, "Número de precinto:", texto(transporte.precinto) || "—");
    linea(meta, "Marcas de los bultos:", texto(transporte.marcasBultos) || "—");
    cuerpo.appendChild(meta);

    partesGrid = el("div", "doc-partes");

    exportador = el("div", "doc-bloque");
    exportador.appendChild(el("h3", null, "Exportador (proveedor / shipper)"));
    exportadorLineas = lineasPersona(proveedor);
    exportador.appendChild(parrafoMultilinea("doc-texto", exportadorLineas.length ? exportadorLineas : ["—"]));
    partesGrid.appendChild(exportador);

    destinatario = el("div", "doc-bloque");
    destinatario.appendChild(el("h3", null, "Destinatario (importador)"));
    destinatarioLineas = [];
    if (texto(importador.razonSocial)) {
      destinatarioLineas.push(texto(importador.razonSocial));
    }
    if (texto(importador.ruc)) {
      destinatarioLineas.push("RUC " + texto(importador.ruc));
    }
    if (texto(importador.direccion)) {
      destinatarioLineas.push(texto(importador.direccion));
    }
    destinatario.appendChild(parrafoMultilinea("doc-texto", destinatarioLineas.length ? destinatarioLineas : ["—"]));
    partesGrid.appendChild(destinatario);
    cuerpo.appendChild(partesGrid);

    tabla = el("table", "doc-tabla");
    tabla.setAttribute("id", "tabla-packing");
    thead = document.createElement("thead");
    trh = document.createElement("tr");
    trh.appendChild(celda("th", null, "Ítem"));
    trh.appendChild(celda("th", null, "Descripción"));
    trh.appendChild(celda("th", "doc-num", "Cantidad"));
    trh.appendChild(celda("th", "doc-num", "Bultos"));
    trh.appendChild(celda("th", "doc-num", "Peso neto"));
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
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.cantidad) +
        (texto(item.unidadComercial) ? " " + texto(item.unidadComercial) : "")));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.bultos)));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.pesoNetoKg) + " kg"));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.pesoBrutoKg) + " kg"));
      tr.appendChild(celda("td", "doc-num", Calculos.formatoCantidad(item.volumenM3) + " m³"));
      tbody.appendChild(tr);
    }
    tabla.appendChild(tbody);

    totalesTexto = Calculos.formatoCantidad(cifras.bultos) + " bultos, " +
      Calculos.formatoCantidad(cifras.pesoNetoKg) + " kg netos, " +
      Calculos.formatoCantidad(cifras.pesoBrutoKg) + " kg brutos, " +
      Calculos.formatoCantidad(cifras.volumenM3) + " m³";

    tfoot = document.createElement("tfoot");
    trTotal = document.createElement("tr");
    thTotal = el("th", "doc-total-etiqueta", "Totales");
    thTotal.colSpan = 3;
    trTotal.appendChild(thTotal);
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.bultos)));
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.pesoNetoKg) + " kg"));
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.pesoBrutoKg) + " kg"));
    trTotal.appendChild(celda("td", "doc-num doc-total-cifra", Calculos.formatoCantidad(cifras.volumenM3) + " m³"));
    tfoot.appendChild(trTotal);
    tabla.appendChild(tfoot);
    cuerpo.appendChild(tabla);

    cuerpo.appendChild(el("p", "doc-totales-packing", totalesTexto));

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
