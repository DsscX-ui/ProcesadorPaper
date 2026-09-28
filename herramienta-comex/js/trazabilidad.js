/* Tabla de trazabilidad.
   file://: script clásico, sin módulos y sin fetch.
   Cada fila sale de Ayuda.lista (etiqueta y documentos.factura,
   packing, bl, dam). No hay una segunda lista de textos. */

var Trazabilidad = (function () {
  var NOMBRE_BLOQUE = {
    partes: "Partes",
    transporte: "Transporte",
    comercial: "Comercial",
    items: "Ítems",
    valoracion: "Valoración"
  };

  function celda(fila, texto, clase, columna) {
    var td = document.createElement("td");
    td.className = clase;
    td.setAttribute("data-col", columna);
    td.textContent = texto;
    fila.appendChild(td);
    return td;
  }

  function textoDam(entrada) {
    var dam = entrada.documentos.dam;
    if (entrada.sinCasillaDam) {
      return "sin casilla. " + dam;
    }
    return dam;
  }

  function pintar() {
    var tabla = document.getElementById("tabla-trazabilidad");
    var cuenta = document.getElementById("trazabilidad-cuenta");
    var lista;
    var thead;
    var cuerpo;
    var filaCab;
    var titulos;
    var i;
    var th;
    var entrada;
    var fila;
    var tdDam;

    if (!tabla) {
      return;
    }
    if (!window.Ayuda || !Ayuda.lista) {
      tabla.textContent = "";
      if (cuenta) {
        cuenta.textContent = "No se pudo leer la lista del modo didáctico.";
      }
      return;
    }

    lista = Ayuda.lista;
    tabla.textContent = "";

    thead = document.createElement("thead");
    filaCab = document.createElement("tr");
    titulos = ["Bloque", "Dato", "Factura", "Packing list", "BL", "DAM (casilla)"];
    for (i = 0; i < titulos.length; i++) {
      th = document.createElement("th");
      th.scope = "col";
      th.textContent = titulos[i];
      filaCab.appendChild(th);
    }
    thead.appendChild(filaCab);
    tabla.appendChild(thead);

    cuerpo = document.createElement("tbody");
    for (i = 0; i < lista.length; i++) {
      entrada = lista[i];
      fila = document.createElement("tr");
      fila.setAttribute("data-ayuda-id", entrada.id);
      if (entrada.sinCasillaDam) {
        fila.className = "traz-sin-casilla";
      }
      celda(fila, NOMBRE_BLOQUE[entrada.bloque] || entrada.bloque, "traz-bloque", "bloque");
      celda(fila, entrada.etiqueta, "traz-dato", "dato");
      celda(fila, entrada.documentos.factura, "traz-doc", "factura");
      celda(fila, entrada.documentos.packing, "traz-doc", "packing");
      celda(fila, entrada.documentos.bl, "traz-doc", "bl");
      tdDam = celda(fila, textoDam(entrada), "traz-doc traz-dam", "dam");
      if (entrada.sinCasillaDam) {
        tdDam.className += " traz-dam-sin";
      }
      cuerpo.appendChild(fila);
    }
    tabla.appendChild(cuerpo);

    if (cuenta) {
      cuenta.textContent = lista.length + " datos: una fila por cada entrada del modo didáctico.";
    }
  }

  function iniciar() {
    pintar();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", iniciar);
    } else {
      iniciar();
    }
  }

  return {
    pintar: pintar
  };
})();
