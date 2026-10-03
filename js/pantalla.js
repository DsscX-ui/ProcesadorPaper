/* Pantalla: botones de ejemplo, Nueva, Guardar y Abrir, y vista de solo lectura de los datos
   cargados, agrupada según el diccionario. El formulario editable llega en F5.
   Regla de carga: la vista nueva se construye completa FUERA del documento; solo si todo sale bien
   se reemplaza la operación anterior. Si algo falla, la pantalla anterior se conserva.
   Los datos del usuario se insertan siempre con textContent (nunca innerHTML).
   Script clásico. */

(function () {
  var operacion = null;
  var contadorAyuda = 0;

  function $(id) { return document.getElementById(id); }

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) { n.className = clase; }
    if (texto != null) { n.textContent = texto; }
    return n;
  }

  function mensaje(texto, tipo) {
    var caja = $("mensaje");
    caja.textContent = texto;
    caja.className = "mensaje " + (tipo || "");
  }

  // Etiqueta de marca: H, H*, SUPUESTO o POR VERIFICAR.
  function etiquetaMarca(marca) {
    var clases = { "H": "marca-h", "H*": "marca-hx", "S": "marca-s", "PV": "marca-pv" };
    var textos = { "H": "H", "H*": "H*", "S": "SUPUESTO", "PV": "POR VERIFICAR" };
    return el("span", "marca " + (clases[marca] || ""), textos[marca] || String(marca));
  }

  function textoValor(campo, valor) {
    if (valor === null || valor === undefined || valor === "") { return "—"; }
    if (campo.tipo === "sino") { return valor ? "Sí / Yes" : "No"; }
    if (campo.tipo === "equipos") {
      if (!valor.length) { return "—"; }
      var muestra = valor.slice(0, 3).map(function (e) {
        return (e.serie || "(sin serie)") + " [IMEI: " + (e.imeis.length ? e.imeis.join(", ") : "—") + "]";
      }).join("; ");
      return valor.length + " equipo(s): " + muestra + (valor.length > 3 ? "; …" : "");
    }
    if (campo.tipo === "codigo" && campo.lista) {
      var op = NORMATIVA.opcion(campo.lista, String(valor));
      return op ? valor + " — " + op.texto : valor + " (código fuera de la lista)";
    }
    return String(valor);
  }

  // Marca del DATO concreto: la propia de la operación o, si no hay, la de su lista de códigos.
  function marcaDelDato(op, campo, ruta, valor) {
    var propia = op.marcas[ruta];
    if (propia) { return { marca: propia.marca, nota: propia.nota }; }
    if (campo.tipo === "codigo" && campo.lista && valor !== "" && valor != null) {
      var l = NORMATIVA.listas[campo.lista];
      var o = NORMATIVA.opcion(campo.lista, String(valor));
      return { marca: l.marca, nota: "Lista: " + l.fuente + (o && o.nota ? " · " + o.nota : "") + (l.nota ? " · " + l.nota : "") };
    }
    return null;
  }

  function aplica(op, campo) {
    return !campo.solo || campo.solo === op.generales.operacion.tipo;
  }

  // Dos filas por campo: la de datos y una de detalle (ayuda, marca y fuente) que se abre con el botón "?".
  // Así la ayuda funciona con teclado y con toque, no solo al pasar el cursor.
  function fila(cuerpo, op, campo, ruta) {
    var valor = Modelo.leer(op, ruta);
    var tipoOp = op.generales.operacion.tipo;
    var idDetalle = "ayuda-" + (++contadorAyuda);
    var tr = el("tr");

    var tdCampo = el("td", "campo");
    var boton = el("button", "btn-ayuda", "?");
    boton.type = "button";
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-controls", idDetalle);
    boton.setAttribute("aria-label", "Ayuda: " + campo.es);
    tdCampo.appendChild(boton);
    tdCampo.appendChild(el("span", null, campo.es));
    tdCampo.appendChild(el("span", "en", " / " + campo.en));
    tr.appendChild(tdCampo);

    var tdValor = el("td", "valor", textoValor(campo, valor));
    var md = marcaDelDato(op, campo, ruta, valor);
    if (md) { tdValor.appendChild(document.createTextNode(" ")); tdValor.appendChild(etiquetaMarca(md.marca)); }
    tr.appendChild(tdValor);

    tr.appendChild(el("td", "casilla", DICCIONARIO.casilla(campo, tipoOp) || "—"));

    var tdFuente = el("td", "fuente");
    tdFuente.appendChild(etiquetaMarca(campo.marca));
    tdFuente.appendChild(el("span", null, campo.fuente));
    tr.appendChild(tdFuente);
    cuerpo.appendChild(tr);

    var trDet = el("tr", "detalle");
    trDet.id = idDetalle;
    trDet.hidden = true;
    var td = el("td");
    td.colSpan = 4;
    td.appendChild(el("p", null, campo.ayuda));
    td.appendChild(el("p", "nota", "Campo: " + campo.fuente + " · Obligatorio: " + campo.obl +
      (campo.docs ? " · Documentos: " + campo.docs : "")));
    if (md) {
      var p = el("p", "nota");
      p.appendChild(etiquetaMarca(md.marca));
      p.appendChild(document.createTextNode(" Este dato: " + (md.nota || "—")));
      td.appendChild(p);
    }
    trDet.appendChild(td);
    cuerpo.appendChild(trDet);

    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      trDet.hidden = abierto;
    });
  }

  function tablaNueva() {
    var t = el("table", "datos");
    var thead = el("thead");
    var cab = el("tr");
    ["Campo / Field", "Valor / Value", "Casilla DAM", "Fuente del campo"].forEach(function (x) {
      var th = el("th", null, x);
      th.scope = "col";
      cab.appendChild(th);
    });
    thead.appendChild(cab);
    t.appendChild(thead);
    var cuerpo = el("tbody");
    t.appendChild(cuerpo);
    return { tabla: t, cuerpo: cuerpo };
  }

  // Construye la vista completa de una operación en un fragmento (sin tocar el documento).
  function construirDatos(op) {
    var frag = document.createDocumentFragment();
    DICCIONARIO.grupos.forEach(function (g, i) {
      var campos = DICCIONARIO.campos.filter(function (c) { return c.grupo === g.id && aplica(op, c); });
      if (!campos.length) { return; }
      var det = el("details");
      if (i < 2) { det.open = true; }
      var sum = el("summary");
      sum.appendChild(el("span", null, g.es));
      sum.appendChild(el("span", "en", " / " + g.en));
      det.appendChild(sum);

      var deItem = campos.filter(function (c) { return c.ruta.indexOf("items[]") !== -1; });
      var generales = campos.filter(function (c) { return c.ruta.indexOf("items[]") === -1; });
      if (generales.length) {
        var t = tablaNueva();
        generales.forEach(function (c) { fila(t.cuerpo, op, c, c.ruta); });
        det.appendChild(t.tabla);
      }
      if (deItem.length) {
        op.especificos.items.forEach(function (_, n) {
          det.appendChild(el("h4", null, "Ítem " + (n + 1) + " / Item " + (n + 1)));
          var t2 = tablaNueva();
          deItem.forEach(function (c) { fila(t2.cuerpo, op, c, c.ruta.replace("items[]", "items." + n)); });
          det.appendChild(t2.tabla);
        });
      }
      frag.appendChild(det);
    });
    return frag;
  }

  function textoResumen(op) {
    var tipo = NORMATIVA.opcion("tipoOperacion", op.generales.operacion.tipo);
    return (op.meta.referencia || "(sin referencia)") + " · " +
      (tipo ? tipo.texto : "tipo desconocido") + " · " + op.especificos.items.length + " ítem(s) · " +
      Object.keys(op.marcas).length + " dato(s) con marca propia";
  }

  function pintarRevision() {
    var r = DICCIONARIO.revisarContraModelo();
    var ok = !r.sinEntrada.length && !r.sinDato.length;
    var marcas = Object.keys(r.porMarca).sort().map(function (m) { return m + ": " + r.porMarca[m]; }).join(", ");
    $("revision-diccionario").textContent = "Correspondencia diccionario–modelo: " + (ok ? "correcta" : "REVISAR") +
      " · " + r.total + " campos (" + marcas + ")" +
      (r.sinEntrada.length ? " · datos del modelo sin entrada: " + r.sinEntrada.join(", ") : "") +
      (r.sinDato.length ? " · entradas sin dato en el modelo: " + r.sinDato.join(", ") : "");
    $("revision-diccionario").className = ok ? "ok" : "error";
  }

  // Prepara todo lo nuevo y, solo si no hubo errores, reemplaza lo anterior.
  function cargar(op, texto) {
    var nueva, vista, resumen, huella;
    try {
      nueva = Modelo.clonar(op);
      vista = construirDatos(nueva);
      resumen = textoResumen(nueva);
      huella = Modelo.huella(nueva);
    } catch (e) {
      mensaje("No se pudo mostrar la operación (" + (e && e.message ? e.message : String(e)) +
        "). Se conserva lo que había en pantalla.", "error");
      return false;
    }
    operacion = nueva;
    $("vista-datos").textContent = "";
    $("vista-datos").appendChild(vista);
    $("resumen").textContent = resumen;
    $("huella").textContent = huella;
    mensaje(texto.replace("{huella}", huella), "ok");
    return true;
  }

  function iniciar() {
    EJEMPLOS.forEach(function (ej) {
      var b = el("button", null, ej.titulo);
      b.type = "button";
      b.addEventListener("click", function () { cargar(ej.operacion, "Se cargó el " + ej.titulo + ". Huella: {huella}."); });
      $("botones-ejemplo").appendChild(b);
    });
    $("btn-nueva").addEventListener("click", function () {
      cargar(Modelo.operacionVacia(), "Se creó una operación vacía.");
    });
    $("btn-guardar").addEventListener("click", function () {
      if (!operacion) { mensaje("No hay nada que guardar: primero carga un ejemplo o una operación.", "error"); return; }
      var nombre = Modelo.guardar(operacion);
      mensaje("Se descargó '" + nombre + "'. Huella: " + Modelo.huella(operacion) + ".", "ok");
    });
    // Botón real (enfocable con Tab) que abre el selector de archivos oculto.
    $("btn-abrir").addEventListener("click", function () { $("input-abrir").click(); });
    $("input-abrir").addEventListener("change", function (ev) {
      var entrada = ev.target;
      var archivo = entrada.files && entrada.files[0];
      if (!archivo) { return; }
      try {
        Modelo.abrir(archivo, function (error, datos) {
          try {
            if (error) {
              mensaje(error + " No se cambió lo que había en pantalla.", "error");
            } else {
              cargar(datos, "Se abrió '" + archivo.name + "'. Huella: {huella}.");
            }
          } catch (e) {
            mensaje("Error inesperado al abrir el archivo. No se cambió lo que había en pantalla.", "error");
          }
          entrada.value = "";
        });
      } catch (e) {
        mensaje("No se pudo leer el archivo. No se cambió lo que había en pantalla.", "error");
        entrada.value = "";
      }
    });
    pintarRevision();
    $("vista-datos").appendChild(el("p", "vacio", "No hay una operación cargada. Usa un ejemplo, «Nueva» o «Abrir JSON»."));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
