/* Estado de la operación, pantalla del formulario y JSON.
   Abrir con doble clic (file://): sin servidor, sin módulos y sin fetch.
   Guardar descarga un Blob. Cargar lee el archivo con FileReader. */

var Modelo = (function () {
  var estado = null;
  var ITEMS_DEL_FORMULARIO = 2;

  function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function leerRuta(obj, ruta) {
    var partes = ruta.split(".");
    var actual = obj;
    var i;
    for (i = 0; i < partes.length; i++) {
      if (actual == null) {
        return undefined;
      }
      actual = actual[partes[i]];
    }
    return actual;
  }

  function asignarRuta(obj, ruta, valor) {
    var partes = ruta.split(".");
    var actual = obj;
    var i;
    for (i = 0; i < partes.length - 1; i++) {
      if (actual[partes[i]] == null || typeof actual[partes[i]] !== "object") {
        return false;
      }
      actual = actual[partes[i]];
    }
    actual[partes[partes.length - 1]] = valor;
    return true;
  }

  function mostrarMensaje(texto) {
    var caja = document.getElementById("mensaje-archivo");
    if (caja) {
      caja.textContent = texto;
    }
  }

  function leerCampo(el) {
    if (el.getAttribute("data-tipo") === "numero") {
      if (String(el.value).trim() === "") {
        return 0;
      }
      var n = Number(el.value);
      return isFinite(n) ? n : 0;
    }
    return el.value;
  }

  function camposDelFormulario() {
    return document.querySelectorAll("#formulario [data-ruta]");
  }

  function volcarFormularioAlEstado() {
    var campos = camposDelFormulario();
    var i;
    for (i = 0; i < campos.length; i++) {
      asignarRuta(estado, campos[i].getAttribute("data-ruta"), leerCampo(campos[i]));
    }
  }

  function volcarEstadoAlFormulario() {
    var campos = camposDelFormulario();
    var i;
    var valor;
    for (i = 0; i < campos.length; i++) {
      valor = leerRuta(estado, campos[i].getAttribute("data-ruta"));
      campos[i].value = valor == null ? "" : valor;
    }
    pintarDerivados();
  }

  function ponerTotal(id, texto, numero) {
    var nodo = document.getElementById(id);
    var cifra;
    if (!nodo) {
      return;
    }
    cifra = nodo.querySelector(".total-cifra");
    if (cifra) {
      cifra.textContent = texto;
    }
    nodo.setAttribute("data-numero", String(numero));
  }

  function pintarDerivados() {
    var cifras = Calculos.totales(estado);
    var comercial = estado.comercial || {};
    var lectura = document.getElementById("lectura-incoterm");
    var nota = document.getElementById("nota-caso");
    var fobDetalle = document.getElementById("valor-fob-detalle");
    var aduanaDetalle = document.getElementById("valor-aduana-detalle");
    var valores = document.querySelectorAll("[data-valor-item]");
    var i;

    ponerTotal("total-unidades", Calculos.formatoCantidad(cifras.unidades), cifras.unidades);
    ponerTotal("total-bultos", Calculos.formatoCantidad(cifras.bultos), cifras.bultos);
    ponerTotal("total-neto", Calculos.formatoCantidad(cifras.pesoNetoKg), cifras.pesoNetoKg);
    ponerTotal("total-bruto", Calculos.formatoCantidad(cifras.pesoBrutoKg), cifras.pesoBrutoKg);
    ponerTotal("total-volumen", Calculos.formatoCantidad(cifras.volumenM3), cifras.volumenM3);
    ponerTotal("total-fob", "FOB " + Calculos.formatoMoneda(cifras.fobUsd), cifras.fobUsd);
    ponerTotal("total-flete", "Flete " + Calculos.formatoMoneda(cifras.fleteUsd), cifras.fleteUsd);
    ponerTotal("total-seguro", "Seguro " + Calculos.formatoMoneda(cifras.seguroUsd), cifras.seguroUsd);
    ponerTotal("total-ajustes", "Ajustes " + Calculos.formatoMoneda(cifras.ajustesUsd), cifras.ajustesUsd);
    ponerTotal("total-aduana", "Valor en aduana " + Calculos.formatoMoneda(cifras.valorAduanaUsd), cifras.valorAduanaUsd);

    for (i = 0; i < valores.length; i++) {
      var indice = Number(valores[i].getAttribute("data-valor-item"));
      var monto = cifras.valoresItem[indice];
      valores[i].textContent = monto == null ? "—" : Calculos.formatoValorItem(monto);
    }

    if (fobDetalle) {
      fobDetalle.textContent = Calculos.formatoMoneda(cifras.fobUsd);
    }
    if (aduanaDetalle) {
      aduanaDetalle.textContent = Calculos.formatoMoneda(cifras.valorAduanaUsd);
    }
    if (lectura) {
      lectura.textContent = [comercial.incoterm, comercial.incotermLugar].filter(Boolean).join(" ") +
        (comercial.incotermVersion ? "-" + comercial.incotermVersion : "");
    }
    if (nota && estado.meta && estado.meta.nota) {
      nota.textContent = estado.meta.nota;
    }
    if (window.Validaciones) {
      Validaciones.pintar(estado);
    }
    if (window.Factura && typeof Factura.pintar === "function") {
      Factura.pintar(estado);
    }
    if (window.Packing && typeof Packing.pintar === "function") {
      Packing.pintar(estado);
    }
    if (window.Bl && typeof Bl.pintar === "function") {
      Bl.pintar(estado);
    } else if (window.BL && typeof BL.pintar === "function") {
      BL.pintar(estado);
    }
    if (window.Dam && typeof Dam.pintar === "function") {
      Dam.pintar(estado);
    } else if (window.DAM && typeof DAM.pintar === "function") {
      DAM.pintar(estado);
    }
  }

  function filasRucEjemplo() {
    var fuente = window.EJEMPLO_RELOJES;
    var definidos = [
      { rol: "Importador", ruta: "partes.importador.ruc" },
      { rol: "Agente de aduanas", ruta: "partes.agenteAduanas.ruc" },
      { rol: "Agente marítimo", ruta: "partes.agenteMaritimo.ruc" },
      { rol: "Depósito temporal", ruta: "transporte.deposito.ruc" }
    ];
    var filas = [];
    var i;
    for (i = 0; i < definidos.length; i++) {
      var ruc = leerRuta(fuente, definidos[i].ruta);
      var resultado = Calculos.digitoVerificadorRuc(ruc);
      var texto;
      if (resultado.digitoCalculado == null) {
        texto = definidos[i].rol + ": " + ruc + " · " + resultado.motivo;
      } else {
        texto = definidos[i].rol + ": " + ruc +
          " · suma " + resultado.suma +
          " · resto " + resultado.resto +
          " · dígito calculado " + resultado.digitoCalculado +
          " · declarado " + resultado.digitoDeclarado +
          " · " + (resultado.valido ? "cumple" : "no cumple");
      }
      filas.push({
        rol: definidos[i].rol,
        ruc: ruc,
        cumple: resultado.valido === true,
        debeFallar: false,
        suma: resultado.suma,
        resto: resultado.resto,
        digitoCalculado: resultado.digitoCalculado,
        digitoDeclarado: resultado.digitoDeclarado,
        texto: texto
      });
    }
    /* Control negativo: dígito correcto sería 2; se declara 6 a propósito. */
    var rucNegativo = "20998887776";
    var resultadoNeg = Calculos.digitoVerificadorRuc(rucNegativo);
    var textoNeg;
    if (resultadoNeg.digitoCalculado == null) {
      textoNeg = "Control negativo: " + rucNegativo + " · " + resultadoNeg.motivo;
    } else {
      textoNeg = "Control negativo: " + rucNegativo +
        " · suma " + resultadoNeg.suma +
        " · resto " + resultadoNeg.resto +
        " · dígito calculado " + resultadoNeg.digitoCalculado +
        " · declarado " + resultadoNeg.digitoDeclarado +
        " · " + (resultadoNeg.valido ? "cumple" : "no cumple");
    }
    filas.push({
      rol: "Control negativo",
      ruc: rucNegativo,
      cumple: resultadoNeg.valido === true,
      debeFallar: true,
      suma: resultadoNeg.suma,
      resto: resultadoNeg.resto,
      digitoCalculado: resultadoNeg.digitoCalculado,
      digitoDeclarado: resultadoNeg.digitoDeclarado,
      texto: textoNeg
    });
    return filas;
  }

  function pintarPruebaRuc() {
    var lista = document.getElementById("prueba-ruc-lista");
    var resumen = document.getElementById("prueba-ruc-resumen");
    var bloque = document.getElementById("prueba-ruc");
    var filas = filasRucEjemplo();
    var ejemplosOk = 0;
    var ejemplosTotal = 0;
    var negativoFalla = false;
    var i;
    if (!lista || !resumen) {
      console.log("Prueba RUC", filas);
      return filas;
    }
    lista.textContent = "";
    for (i = 0; i < filas.length; i++) {
      var li = document.createElement("li");
      li.textContent = filas[i].texto;
      if (filas[i].debeFallar) {
        /* Éxito didáctico: el control negativo debe fallar. */
        li.className = filas[i].cumple ? "ruc-falla" : "ruc-cumple";
        if (!filas[i].cumple) {
          negativoFalla = true;
        }
      } else {
        li.className = filas[i].cumple ? "ruc-cumple" : "ruc-falla";
        ejemplosTotal += 1;
        if (filas[i].cumple) {
          ejemplosOk += 1;
        }
      }
      lista.appendChild(li);
    }
    if (ejemplosOk === ejemplosTotal && negativoFalla) {
      resumen.textContent = "Los " + ejemplosTotal +
        " RUC del ejemplo cumplen el módulo 11 y el control negativo 20998887776 no cumple (como debe).";
      resumen.className = "ruc-cumple";
    } else if (ejemplosOk === ejemplosTotal && !negativoFalla) {
      resumen.textContent = "Atención: los RUC del ejemplo cumplen, pero el control negativo 20998887776 no falló.";
      resumen.className = "ruc-falla";
    } else {
      resumen.textContent = "Atención: " + (ejemplosTotal - ejemplosOk) + " de " + ejemplosTotal +
        " RUC del ejemplo no cumplen el módulo 11" +
        (negativoFalla ? "; el control negativo 20998887776 no cumple." : "; además el control negativo no falló.");
      resumen.className = "ruc-falla";
    }
    if (bloque) {
      bloque.setAttribute("data-cumplen", String(ejemplosOk));
      bloque.setAttribute("data-total", String(ejemplosTotal));
      bloque.setAttribute("data-negativo-falla", negativoFalla ? "1" : "0");
    }
    console.log("Prueba RUC", filas);
    return filas;
  }

  function operacionValida(datos) {
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      return "El JSON no es una operación.";
    }
    if (!datos.partes || !datos.transporte || !datos.comercial || !datos.valoracion || !datos.serie) {
      return "Faltan partes de la operación: partes, transporte, comercial, serie o valoración.";
    }
    if (!Array.isArray(datos.items)) {
      return "La operación no trae la lista de ítems.";
    }
    if (datos.items.length !== ITEMS_DEL_FORMULARIO) {
      return "Este formulario muestra " + ITEMS_DEL_FORMULARIO + " ítems y el archivo trae " + datos.items.length + ". No se cambió lo que hay en pantalla.";
    }
    return "";
  }

  function aplicarOperacion(datos, mensaje) {
    estado = clonar(datos);
    volcarEstadoAlFormulario();
    mostrarMensaje(mensaje);
  }

  function guardarJson() {
    var json;
    var blob;
    var url;
    var enlace;
    volcarFormularioAlEstado();
    json = JSON.stringify(estado, null, 2);
    blob = new Blob([json], { type: "application/json;charset=utf-8" });
    url = URL.createObjectURL(blob);
    enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "relojes-shenzhen-callao.json";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
    mostrarMensaje("Se descargó el JSON con los datos que hay ahora en el formulario.");
  }

  function cargarDesdeArchivo(evento) {
    var archivo = evento.target.files && evento.target.files[0];
    var lector;
    if (!archivo) {
      return;
    }
    lector = new FileReader();
    lector.onload = function () {
      var datos;
      var error;
      try {
        datos = JSON.parse(String(lector.result));
      } catch (e) {
        mostrarMensaje("No se pudo leer el JSON. Revisa que el archivo sea el que descargó esta página.");
        evento.target.value = "";
        return;
      }
      error = operacionValida(datos);
      if (error) {
        mostrarMensaje(error);
        evento.target.value = "";
        return;
      }
      aplicarOperacion(datos, "Se cargó el JSON. El FOB y el valor en aduana se recalculan desde los ítems, el flete, el seguro y los ajustes.");
      evento.target.value = "";
    };
    lector.onerror = function () {
      mostrarMensaje("No se pudo leer el archivo.");
      evento.target.value = "";
    };
    lector.readAsText(archivo, "UTF-8");
  }

  function alEditar(evento) {
    var el = evento.target;
    if (!el || !el.getAttribute || !el.getAttribute("data-ruta")) {
      return;
    }
    volcarFormularioAlEstado();
    pintarDerivados();
  }

  function iniciar() {
    var formulario = document.getElementById("formulario");
    var boton = document.getElementById("btn-guardar");
    var entrada = document.getElementById("input-cargar");
    pintarPruebaRuc();
    if (!window.EJEMPLO_RELOJES) {
      mostrarMensaje("No está el caso de ejemplo. Revisa que el script de datos se haya cargado.");
      return;
    }
    if (!formulario || !boton || !entrada) {
      return;
    }
    aplicarOperacion(window.EJEMPLO_RELOJES, "Caso de ejemplo cargado: relojes, Shenzhen–Callao.");
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
    });
    formulario.addEventListener("input", alEditar);
    formulario.addEventListener("change", alEditar);
    boton.addEventListener("click", guardarJson);
    entrada.addEventListener("change", cargarDesdeArchivo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

  return {
    iniciar: iniciar,
    obtener: function () {
      return estado;
    }
  };
})();
