/* Pantalla de F2: botones de ejemplo, Nueva, Guardar y Abrir, y vista de solo lectura
   de los datos cargados, agrupada según el diccionario. El formulario editable llega en F5.
   Script clásico. */

(function () {
  var operacion = null;

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
  function etiquetaMarca(marca, nota) {
    var clases = { "H": "marca-h", "H*": "marca-hx", "S": "marca-s", "PV": "marca-pv" };
    var textos = { "H": "H", "H*": "H*", "S": "SUPUESTO", "PV": "POR VERIFICAR" };
    var span = el("span", "marca " + (clases[marca] || ""), textos[marca] || marca);
    if (nota) { span.title = nota; }
    return span;
  }

  function textoValor(campo, valor) {
    if (valor === null || valor === undefined || valor === "") { return "—"; }
    if (campo.tipo === "sino") { return valor ? "Sí / Yes" : "No"; }
    if (campo.tipo === "lista") { return valor.length ? valor.join(", ") : "—"; }
    if (campo.tipo === "codigo" && campo.lista) {
      var op = NORMATIVA.opcion(campo.lista, String(valor));
      return op ? valor + " — " + op.texto : valor + " (código fuera de la lista)";
    }
    return String(valor);
  }

  // Marca que se muestra junto al valor: la del dato (ejemplo) o, si no hay, la de la lista de códigos.
  function marcaDe(campo, ruta, valor) {
    var propia = operacion.marcas && operacion.marcas[ruta];
    if (propia) { return etiquetaMarca(propia.marca, propia.nota); }
    if (campo.tipo === "codigo" && campo.lista && valor !== "" && valor != null) {
      var l = NORMATIVA.listas[campo.lista];
      var op = NORMATIVA.opcion(campo.lista, String(valor));
      var nota = l.fuente + (op && op.nota ? " · " + op.nota : "") + (l.nota ? " · " + l.nota : "");
      return etiquetaMarca(l.marca, nota);
    }
    return null;
  }

  function aplica(campo) {
    return !campo.solo || campo.solo === operacion.generales.operacion.tipo;
  }

  function fila(tabla, campo, ruta) {
    var valor = Modelo.leer(operacion, ruta);
    var tr = el("tr");
    var tdCampo = el("td", "campo");
    tdCampo.appendChild(el("span", null, campo.es));
    tdCampo.appendChild(el("span", "en", " / " + campo.en));
    tdCampo.title = campo.ayuda;
    tr.appendChild(tdCampo);
    var tdValor = el("td", "valor", textoValor(campo, valor));
    var m = marcaDe(campo, ruta, valor);
    if (m) { tdValor.appendChild(document.createTextNode(" ")); tdValor.appendChild(m); }
    tr.appendChild(tdValor);
    tr.appendChild(el("td", "casilla", campo.casilla || "—"));
    tabla.appendChild(tr);
  }

  function tablaNueva() {
    var t = el("table", "datos");
    var cab = el("tr");
    ["Campo / Field", "Valor / Value", "Casilla DAM"].forEach(function (x) { cab.appendChild(el("th", null, x)); });
    t.appendChild(cab);
    return t;
  }

  function pintarDatos() {
    var cont = $("vista-datos");
    cont.textContent = "";
    if (!operacion) {
      cont.appendChild(el("p", "vacio", "No hay una operación cargada. Usa un ejemplo, 'Nueva' o 'Abrir'."));
      return;
    }
    DICCIONARIO.grupos.forEach(function (g, i) {
      var campos = DICCIONARIO.campos.filter(function (c) { return c.grupo === g.id && aplica(c); });
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
        generales.forEach(function (c) { fila(t, c, c.ruta); });
        det.appendChild(t);
      }
      operacion.especificos.items.forEach(function (_, n) {
        if (!deItem.length) { return; }
        det.appendChild(el("h4", null, "Ítem " + (n + 1) + " / Item " + (n + 1)));
        var t2 = tablaNueva();
        deItem.forEach(function (c) { fila(t2, c, c.ruta.replace("items[]", "items." + n)); });
        det.appendChild(t2);
      });
      cont.appendChild(det);
    });
  }

  function pintarResumen() {
    if (!operacion) {
      $("resumen").textContent = "—";
      $("huella").textContent = "—";
      return;
    }
    var tipo = NORMATIVA.opcion("tipoOperacion", operacion.generales.operacion.tipo);
    $("resumen").textContent = (operacion.meta.referencia || "(sin referencia)") + " · " +
      (tipo ? tipo.texto : "?") + " · " + operacion.especificos.items.length + " ítem(s) · " +
      Object.keys(operacion.marcas || {}).length + " dato(s) con marca propia";
    $("huella").textContent = Modelo.huella(operacion);
  }

  function pintarRevision() {
    var r = DICCIONARIO.revisarContraModelo();
    var ok = !r.sinEntrada.length && !r.sinDato.length;
    $("revision-diccionario").textContent = r.total + " campos en el diccionario · datos del modelo sin entrada: " +
      r.sinEntrada.length + (r.sinEntrada.length ? " (" + r.sinEntrada.join(", ") + ")" : "") +
      " · entradas sin dato en el modelo: " + r.sinDato.length + (r.sinDato.length ? " (" + r.sinDato.join(", ") + ")" : "") +
      (ok ? " · Correcto." : " · REVISAR.");
    $("revision-diccionario").className = ok ? "ok" : "error";
  }

  function cargar(op, texto) {
    operacion = Modelo.clonar(op);
    pintarResumen();
    pintarDatos();
    mensaje(texto, "ok");
  }

  function iniciar() {
    EJEMPLOS.forEach(function (ej) {
      var b = el("button", null, ej.titulo);
      b.type = "button";
      b.addEventListener("click", function () { cargar(ej.operacion, "Se cargó el " + ej.titulo + "."); });
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
    $("input-abrir").addEventListener("change", function (ev) {
      var archivo = ev.target.files && ev.target.files[0];
      if (!archivo) { return; }
      Modelo.abrir(archivo, function (error, datos) {
        if (error) {
          mensaje(error + " No se cambió lo que había en pantalla.", "error");
        } else {
          cargar(datos, "Se abrió '" + archivo.name + "'. Huella: " + Modelo.huella(datos) + ".");
        }
        ev.target.value = "";
      });
    });
    pintarRevision();
    pintarResumen();
    pintarDatos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
