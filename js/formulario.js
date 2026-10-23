/* Formulario editable (F5). Se GENERA desde DICCIONARIO (fuente única): no hay listas de campos en el HTML.
   - Un control por campo según su tipo: texto, número (con unidad, máximo y decimales), fecha, código
     (selector con "código — texto" si la lista es cerrada; texto con sugerencias si es abierta), sí/no y equipos.
   - Etiquetas bilingües con <label for>, casilla DAM, marca del campo (H, H*, S o PV) y marca propia del dato.
   - Ayuda desplegable por campo (botón "?", teclado y toque).
   - Campos condicionales (DICCIONARIO.sePide): se ocultan y dejan de ser obligatorios, pero conservan su dato.
   - Ítems en tarjetas: agregar, duplicar, eliminar (con confirmación) y reordenar; las marcas de cada ítem
     se mueven con él.
   - No calcula ni valida: escribe en la operación y avisa a quien lo usa (opciones.alCambiar). Recibe el
     resultado del cálculo y la revisión para mostrar derivados, resúmenes de ítems y errores junto al campo.
   - Un número que no se puede usar (no es número, supera su máximo o tiene decimales de más) NO se escribe en
     la operación: queda "pendiente" y se informa como E20 (decisión D14). Así la operación siempre es válida
     para Guardar y Abrir. Si su campo deja de pedirse, el pendiente queda «en suspenso» (no bloquea, se
     informa y se puede descartar) y se revisa de nuevo si el campo reaparece (F5-M1).
   Los datos del usuario se insertan siempre con textContent o value (nunca innerHTML).
   Script clásico: deja el objeto global Formulario. */

var Formulario = (function () {
  var secuencia = 0;

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) { n.className = clase; }
    if (texto != null) { n.textContent = texto; }
    return n;
  }

  // Etiqueta de marca: H, H*, SUPUESTO o POR VERIFICAR (también la usa pantalla.js).
  function etiquetaMarca(marca) {
    var clases = { "H": "marca-h", "H*": "marca-hx", "S": "marca-s", "PV": "marca-pv" };
    var textos = { "H": "H", "H*": "H*", "S": "SUPUESTO", "PV": "POR VERIFICAR" };
    return el("span", "marca " + (clases[marca] || ""), textos[marca] || String(marca));
  }

  // ---------------------------------------------------------------- Utilidades puras (también en pruebas.html)

  function claveDe(ruta) { return ruta.split(".").pop(); }

  function escribirRuta(obj, ruta, valor) {
    var partes = ruta.split(".");
    var o = obj;
    for (var i = 0; i < partes.length - 1; i++) { o = o[partes[i]]; }
    o[partes[partes.length - 1]] = valor;
  }

  // Unidad que se muestra junto al número, según la etiqueta del diccionario.
  function unidadDe(campo) {
    var m = /\((kg|cm|USD|%|días)\)/.exec(campo.es) || /\((S\/ por USD)\)/.exec(campo.es);
    return m ? m[1] : "";
  }

  // "1,234.50" o "1234.5" → 1234.5. Devuelve { valor, error }. Vacío → null. Cuenta los decimales en el
  // texto escrito (antes de convertirlo), así "1.0000000000000001" no se redondea en silencio.
  function parsearNumero(texto, clave) {
    var t = String(texto == null ? "" : texto).trim();
    if (t === "") { return { valor: null, error: "" }; }
    var limpio = t;
    if (/^[+-]?[1-9]\d{0,2}(,\d{3})+(\.\d+)?$/.test(t)) {
      limpio = t.replace(/,/g, "");
    } else if (t.indexOf(",") !== -1) {
      return { valor: null, error: "Usa punto decimal; la coma solo separa miles (ej. 1,234.50)." };
    }
    if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(limpio)) { return { valor: null, error: "No es un número." }; }
    var lim = Modelo.limitesNumero[clave];
    var frac = (limpio.split(".")[1] || "").replace(/0+$/, "");
    if (lim && frac.length > lim[1]) {
      return { valor: null, error: lim[1] ? "Admite hasta " + lim[1] + " decimales; tiene " + frac.length + "." : "Debe ser un número entero." };
    }
    var n = Number(limpio);
    var problema = Modelo.revisarNumero(clave, n);
    if (problema) { return { valor: null, error: problema.charAt(0).toUpperCase() + problema.slice(1) + "." }; }
    return { valor: n === 0 ? 0 : n, error: "" };
  }

  // Texto del número para el control (sin separador de miles, para editarlo cómodo).
  function textoNumero(v) {
    if (v === null || v === undefined) { return ""; }
    var s = String(v);
    return s.indexOf("e") === -1 ? s : v.toFixed(20).replace(/0+$/, "").replace(/\.$/, "");
  }

  // Equipos (D9): una línea por equipo, "serie;imei1;imei2". También acepta tabulador (pegado desde Excel).
  function textoEquipos(equipos) {
    return equipos.map(function (e) { return [e.serie].concat(e.imeis).join(";"); }).join("\n");
  }

  function parsearEquipos(texto) {
    var lineas = String(texto || "").split(/\r?\n/);
    var equipos = [];
    for (var i = 0; i < lineas.length; i++) {
      var l = lineas[i].trim();
      if (!l) { continue; }
      var p = l.split(/[;\t]/).map(function (x) { return x.trim(); });
      var imeis = p.slice(1).filter(function (x) { return x !== ""; });
      if (imeis.length > Modelo.limites.imeisPorEquipo) {
        return { equipos: null, error: "Línea " + (i + 1) + ": tiene " + imeis.length + " IMEI; el máximo por equipo es " + Modelo.limites.imeisPorEquipo + "." };
      }
      // F5-M2: el mismo límite de largo que aplica Abrir (Modelo.limites.largoTexto), para que Guardar no
      // produzca un archivo que la propia herramienta rechazaría.
      var largo = Modelo.limites.largoTexto;
      if (p[0].length > largo) {
        return { equipos: null, error: "Línea " + (i + 1) + ": la serie tiene " + p[0].length + " caracteres; el máximo es " + largo + "." };
      }
      for (var k = 0; k < imeis.length; k++) {
        if (imeis[k].length > largo) {
          return { equipos: null, error: "Línea " + (i + 1) + ": el IMEI " + (k + 1) + " tiene " + imeis[k].length + " caracteres; el máximo es " + largo + "." };
        }
      }
      equipos.push({ serie: p[0], imeis: imeis });
    }
    if (equipos.length > Modelo.limites.equiposPorItem) {
      return { equipos: null, error: "Hay " + equipos.length + " equipos; el máximo por ítem es " + Modelo.limites.equiposPorItem + "." };
    }
    return { equipos: equipos, error: "" };
  }

  // Mueve las marcas propias de los ítems cuando cambian de posición. mapa(índiceViejo) → índiceNuevo o null (eliminado).
  function reindexarMarcas(marcas, mapa) {
    var nuevas = {};
    Object.keys(marcas).forEach(function (k) {
      var m = /^especificos\.items\.(\d+)\.(.+)$/.exec(k);
      if (!m) { nuevas[k] = marcas[k]; return; }
      var n = mapa(Number(m[1]));
      if (n !== null && n !== undefined) { nuevas["especificos.items." + n + "." + m[2]] = marcas[k]; }
    });
    return nuevas;
  }

  // Operación nueva con los valores "por defecto" del plan (DICCIONARIO: sugerido).
  function operacionNueva() {
    var op = Modelo.operacionVacia();
    DICCIONARIO.campos.forEach(function (c) {
      if (c.sugerido !== undefined && c.ruta.indexOf("items[]") === -1) { escribirRuta(op, c.ruta, c.sugerido); }
    });
    return op;
  }

  function itemNuevo() {
    var it = Modelo.itemVacio();
    DICCIONARIO.campos.forEach(function (c) {
      if (c.sugerido !== undefined && c.ruta.indexOf("items[]") !== -1) { it[claveDe(c.ruta)] = c.sugerido; }
    });
    return it;
  }

  // Campos que no se editan: identifican el archivo (los fija Modelo).
  var SOLO_LECTURA = { formato: true, version: true };
  var AREA_TEXTO = { "meta.descripcion": true, "especificos.items[].descripcion": true, "especificos.marcasEmbarque": true };
  // Subsecciones de la tarjeta de un ítem.
  var EMBALAJE = { claseBulto: 1, unidadesPorBulto: 1, pesoNetoBulto: 1, pesoBrutoBulto: 1, largoCm: 1, anchoCm: 1, altoCm: 1 };

  // Grupo donde se MUESTRA un campo: los datos de ítem (también los tributos B8) van en la tarjeta del ítem (B1).
  function grupoVisible(campo) { return campo.ruta.indexOf("items[]") !== -1 ? "B1" : campo.grupo; }

  function listaDe(campo) { return campo.tipo === "codigo" && campo.lista ? NORMATIVA.listas[campo.lista] : null; }

  // ---------------------------------------------------------------- Construcción

  // crear(op, opciones) → formulario para una COPIA de op. opciones:
  //   alCambiar(tipo, ruta)  "dato" o "estructura"; quien usa el formulario recalcula (con debounce).
  //   confirmar(texto)       → true/false (por defecto window.confirm).
  //   anunciar(texto)        mensaje breve (sugerencias aplicadas, acciones sobre ítems).
  function crear(opBase, opciones) {
    opciones = opciones || {};
    var op = Modelo.clonar(opBase);
    var pendientes = {};       // ruta → texto del problema (E20)
    var filas = {};            // ruta → { campo, i, fila, control, error, marcaDato, req }
    var grupos = {};           // id → { det, sum, cuenta, derivados, enlace }
    var abiertos = new Set(op.especificos.items.length <= 3 ? op.especificos.items : []);
    var resultado = null;
    var id = "f" + (++secuencia);

    function avisar(tipo, ruta) { if (opciones.alCambiar) { opciones.alCambiar(tipo, ruta); } }
    function anunciar(t) { if (opciones.anunciar) { opciones.anunciar(t); } }
    function confirmar(t) { return opciones.confirmar ? opciones.confirmar(t) : window.confirm(t); }

    var raiz = el("div", "formulario");
    raiz.id = id;

    // Listas de sugerencias para las listas abiertas (una por lista).
    var datalists = {};
    function datalist(nombre) {
      if (datalists[nombre]) { return datalists[nombre]; }
      var dl = el("datalist");
      dl.id = id + "-lista-" + nombre;
      NORMATIVA.listas[nombre].opciones.forEach(function (o) {
        var opt = el("option");
        opt.value = o.codigo;
        opt.label = o.codigo + " — " + o.texto;
        dl.appendChild(opt);
      });
      raiz.appendChild(dl);
      datalists[nombre] = dl;
      return dl;
    }

    // ---------- Escritura de datos

    function escribir(ruta, valor) {
      var anterior = Modelo.leer(op, ruta);
      escribirRuta(op, ruta, valor);
      sugerencias(ruta, anterior, valor);
      avisar("dato", ruta);
    }

    // Fija un dato desde la herramienta (sugerencia) y actualiza su control.
    function fijar(ruta, valor, texto) {
      escribirRuta(op, ruta, valor);
      pintarValor(ruta);
      if (texto) { anunciar(texto); }
    }

    // Sugerencias que dependen de otro dato (PLAN §4): siempre editables y solo si no pisan un dato propio.
    function sugerencias(ruta, anterior, valor) {
      if (ruta === "generales.comercial.incoterm") {
        var ant = INCOTERMS.regla(anterior), nue = INCOTERMS.regla(valor);
        var t = op.especificos.transporte;
        if (nue && (!t.fleteBl || (ant && t.fleteBl === ant.fleteBlUsual)) && t.fleteBl !== nue.fleteBlUsual) {
          fijar("especificos.transporte.fleteBl", nue.fleteBlUsual, "Flete en el B/L: se sugiere «" + nue.fleteBlUsual + "», lo usual en " + nue.codigo + " (editable).");
        }
        if (nue && nue.seguroObligatorio && op.especificos.seguro.hay !== true) {
          fijar("especificos.seguro.hay", true, "En " + nue.codigo + " el seguro es obligatorio: «¿Hay seguro?» pasa a Sí.");
        }
      }
      if (ruta === "generales.partes.vendedor.pais") {
        var pa = op.generales.ruta.paisAdquisicion;
        if (!pa || pa === anterior) { fijar("generales.ruta.paisAdquisicion", valor); }
      }
      if (ruta === "generales.operacion.tipo") {
        var a = op.generales.aduana;
        if (valor === "exportacion" && !a.tipoDespacho) { fijar("generales.aduana.tipoDespacho", "00", "Exportación: tipo de despacho 00 (normal) sugerido."); }
        if (valor === "importacion" && a.tipoDespacho === "00") { fijar("generales.aduana.tipoDespacho", ""); }
      }
    }

    // ---------- Controles

    function crearControl(campo, ruta, cid) {
      var c, lista = listaDe(campo);
      if (campo.tipo === "sino") {
        c = el("input");
        c.type = "checkbox";
        c.addEventListener("change", function () { escribir(ruta, c.checked); });
      } else if (campo.tipo === "fecha") {
        c = el("input");
        c.type = "date";
        c.addEventListener("change", function () { escribir(ruta, c.value); });
      } else if (campo.tipo === "numero") {
        c = el("input");
        c.type = "text";
        c.inputMode = "decimal";
        c.autocomplete = "off";
        c.spellcheck = false;
        c.addEventListener("input", function () {
          var p = parsearNumero(c.value, claveDe(ruta));
          if (p.error) {
            pendientes[ruta] = p.error;
            avisar("dato", ruta);
          } else {
            delete pendientes[ruta];
            escribir(ruta, p.valor);
          }
        });
      } else if (campo.tipo === "equipos") {
        c = el("textarea");
        c.rows = 4;
        c.spellcheck = false;
        c.placeholder = "SERIE001;356938035643809;356938035643817";
        c.addEventListener("input", function () {
          var p = parsearEquipos(c.value);
          if (p.error) {
            pendientes[ruta] = p.error;
            avisar("dato", ruta);
          } else {
            delete pendientes[ruta];
            escribir(ruta, p.equipos);
          }
        });
      } else if (lista && !lista.abierta) {
        c = el("select");
        c.appendChild(el("option", null, "— elige —")).value = "";
        // Listas del instructivo: "código — texto". Listas de diseño (marca S, códigos internos): solo el texto.
        lista.opciones.forEach(function (o) {
          c.appendChild(el("option", null, lista.marca === "S" ? o.texto : o.codigo + " — " + o.texto)).value = o.codigo;
        });
        c.addEventListener("change", function () { escribir(ruta, c.value); });
      } else {
        c = el(AREA_TEXTO[campo.ruta] ? "textarea" : "input");
        if (c.tagName === "INPUT") { c.type = "text"; } else { c.rows = 2; }
        c.maxLength = Modelo.limites.largoTexto;
        if (lista) {
          c.setAttribute("list", datalist(campo.lista).id);
          c.autocomplete = "off";
        }
        c.addEventListener("input", function () { escribir(ruta, c.value); });
      }
      c.id = cid;
      c.className = (c.className ? c.className + " " : "") + "cf-control";
      return c;
    }

    // Pone en el control el valor actual de la operación.
    function pintarValor(ruta) {
      var f = filas[ruta];
      if (!f) { return; }
      var v = Modelo.leer(op, ruta), c = f.control, campo = f.campo;
      if (campo.tipo === "sino") { c.checked = v === true; }
      else if (campo.tipo === "numero") { c.value = textoNumero(v); }
      else if (campo.tipo === "equipos") { c.value = textoEquipos(v || []); }
      else if (c.tagName === "SELECT") {
        // Un código fuera de la lista se conserva como opción propia (no se pierde al leer el formulario).
        var extra = c.querySelector("option[data-fuera]");
        if (extra) { c.removeChild(extra); }
        if (v && !NORMATIVA.opcion(campo.lista, String(v))) {
          var o = el("option", null, v + " — (código fuera de la lista)");
          o.value = v;
          o.setAttribute("data-fuera", "1");
          c.appendChild(o);
        }
        c.value = v == null ? "" : String(v);
      } else { c.value = v == null ? "" : String(v); }
      pintarDescripcionCodigo(f);
    }

    // En las listas abiertas, muestra el texto del código escrito ("CN — China").
    function pintarDescripcionCodigo(f) {
      if (!f.descCodigo) { return; }
      var v = Modelo.leer(op, f.ruta);
      var o = v ? NORMATIVA.opcion(f.campo.lista, String(v)) : null;
      f.descCodigo.textContent = !v ? "" : (o ? o.texto : "Código fuera de la lista de ejemplo (lista abierta: se acepta).");
    }

    function textoPista(campo, ruta, tipoOp) {
      var partes = [];
      var cas = DICCIONARIO.casilla(campo, tipoOp);
      if (cas) { partes.push("Casilla DAM: " + cas); }
      if (campo.tipo === "numero") {
        var lim = Modelo.limitesNumero[claveDe(ruta)];
        if (lim) {
          partes.push("máx. " + lim[0].toLocaleString("en-US") + " · " + (lim[1] ? "hasta " + lim[1] + " decimales" : "sin decimales") +
            (lim[2] === 0 ? " · mín. 0" : "") + " · punto decimal");
        }
      }
      if (campo.tipo === "equipos") { partes.push("una línea por equipo: serie;IMEI;IMEI (máx. 4 IMEI)"); }
      return partes.join(" · ");
    }

    // Una fila del formulario: etiqueta bilingüe, marcas, ayuda, control, pista, error y marca propia del dato.
    function construirCampo(campo, ruta, i) {
      var cid = id + "-" + ruta.replace(/[^A-Za-z0-9]+/g, "-");
      var fila = el("div", "cf");
      // Aplica la condición desde la construcción, antes del primer recálculo.
      fila.hidden = !DICCIONARIO.sePide(campo, op, i);
      fila.setAttribute("data-ruta", ruta);
      fila.tabIndex = -1;
      if (campo.tipo === "equipos" || AREA_TEXTO[campo.ruta]) { fila.classList.add("cf-ancho"); }

      var cab = el("div", "cf-cab");
      var label = el("label");
      label.htmlFor = cid;
      label.appendChild(el("span", "cf-es", campo.es));
      label.appendChild(el("span", "en", " / " + campo.en));
      var req = el("span", "cf-req", " *");
      req.setAttribute("aria-hidden", "true");
      req.title = "Obligatorio";
      req.hidden = true;
      label.appendChild(req);
      cab.appendChild(label);
      var marcaCampo = etiquetaMarca(campo.marca);
      marcaCampo.title = "Marca del campo: " + campo.fuente;
      cab.appendChild(marcaCampo);
      var idAyuda = cid + "-ayuda";
      var btn = el("button", "btn-ayuda", "?");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", idAyuda);
      btn.setAttribute("aria-label", "Ayuda: " + campo.es);
      cab.appendChild(btn);
      fila.appendChild(cab);

      var control = crearControl(campo, ruta, cid);
      var caja = el("div", "cf-caja");
      caja.appendChild(control);
      var unidad = campo.tipo === "numero" ? unidadDe(campo) : "";
      if (unidad) { caja.appendChild(el("span", "cf-unidad", unidad)).setAttribute("aria-hidden", "true"); }
      if (campo.tipo === "sino") {
        // Segunda etiqueta solo visual: amplía la zona que se puede tocar (el nombre accesible ya está en la principal).
        var si = caja.appendChild(el("label", "cf-sino", "Sí / Yes"));
        si.htmlFor = cid;
        si.setAttribute("aria-hidden", "true");
      }
      fila.appendChild(caja);

      var lista = listaDe(campo);
      var descCodigo = null;
      if (lista && lista.abierta) { descCodigo = fila.appendChild(el("p", "cf-desc")); }

      var pista = el("p", "cf-pista", textoPista(campo, ruta, op.generales.operacion.tipo));
      pista.id = cid + "-pista";
      if (lista) {
        pista.appendChild(document.createTextNode(pista.textContent ? " · Lista: " : "Lista: "));
        pista.appendChild(etiquetaMarca(lista.marca));
        pista.appendChild(document.createTextNode(lista.fuente + (lista.abierta ? " (lista abierta: puedes escribir otro código)" : "")));
      }
      fila.appendChild(pista);

      var error = el("p", "cf-error");
      error.id = cid + "-error";
      error.hidden = true;
      fila.appendChild(error);

      var marcaDato = el("p", "cf-marca-dato");
      marcaDato.hidden = true;
      fila.appendChild(marcaDato);

      var ayuda = el("div", "cf-ayuda");
      ayuda.id = idAyuda;
      ayuda.hidden = true;
      ayuda.appendChild(el("p", null, campo.ayuda));
      var notaCampo = el("p", "nota");
      notaCampo.appendChild(etiquetaMarca(campo.marca));
      notaCampo.appendChild(document.createTextNode("Campo: " + campo.fuente + " · Obligatorio: " + campo.obl +
        (campo.si ? " · Se pide si: " + campo.si : "") + (campo.docs ? " · Documentos: " + campo.docs : "") +
        (campo.sugerido !== undefined ? " · Valor sugerido: " + (campo.sugerido === true ? "Sí" : String(campo.sugerido)) : "")));
      ayuda.appendChild(notaCampo);
      fila.appendChild(ayuda);

      btn.addEventListener("click", function () {
        var abierto = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", abierto ? "false" : "true");
        ayuda.hidden = abierto;
      });

      control.setAttribute("aria-describedby", pista.id);
      filas[ruta] = { campo: campo, ruta: ruta, i: i, fila: fila, control: control, error: error, req: req,
        marcaDato: marcaDato, descCodigo: descCodigo, pista: pista };
      pintarValor(ruta);
      pintarMarcaDato(ruta);
      return fila;
    }

    // Marca propia del dato (op.marcas): visible bajo el control, con su nota (PV en amarillo).
    function pintarMarcaDato(ruta) {
      var f = filas[ruta], m = op.marcas[ruta];
      f.marcaDato.textContent = "";
      f.marcaDato.hidden = !m;
      if (!m) { return; }
      f.marcaDato.appendChild(document.createTextNode("Este dato: "));
      f.marcaDato.appendChild(etiquetaMarca(m.marca));
      f.marcaDato.appendChild(document.createTextNode(m.nota || ""));
    }

    // ---------- Grupos

    function cajaDerivados(gid) {
      var ds = DICCIONARIO.derivados.filter(function (d) { return d.grupo === gid; });
      if (!ds.length) { return null; }
      var caja = el("div", "derivados");
      caja.appendChild(el("p", "derivados-titulo", "Lo calcula la herramienta (no se ingresa) / Derived"));
      var dl = el("dl");
      var nodos = ds.map(function (d) {
        var dt = el("dt");
        dt.appendChild(el("span", null, d.es));
        dt.appendChild(el("span", "en", " / " + d.en));
        var dd = el("dd");
        var valor = el("span", "derivado-valor");
        dd.appendChild(valor);
        dd.appendChild(document.createTextNode(" "));
        dd.appendChild(etiquetaMarca(d.marca));
        var cas = el("span", "nota", d.fuente);
        dd.appendChild(cas);
        dl.appendChild(dt);
        dl.appendChild(dd);
        return { d: d, dt: dt, dd: dd, valor: valor, cas: cas };
      });
      caja.appendChild(dl);
      return { caja: caja, nodos: nodos };
    }

    function construirGrupo(g) {
      var det = el("details", "grupo-form");
      det.id = id + "-grupo-" + g.id;
      det.setAttribute("data-grupo", g.id);
      var sum = el("summary");
      sum.appendChild(el("span", null, g.es));
      sum.appendChild(el("span", "en", " / " + g.en));
      var cuenta = el("span", "grupo-cuenta");
      sum.appendChild(cuenta);
      det.appendChild(sum);
      var cuerpo = el("div", "grupo-cuerpo");
      det.appendChild(cuerpo);

      var campos = DICCIONARIO.campos.filter(function (c) { return c.grupo === g.id && c.ruta.indexOf("items[]") === -1; });
      var lectura = campos.filter(function (c) { return SOLO_LECTURA[c.ruta]; });
      if (lectura.length) {
        cuerpo.appendChild(el("p", "nota", lectura.map(function (c) { return c.es + ": " + Modelo.leer(op, c.ruta); }).join(" · ") +
          " (los fija la herramienta)."));
      }
      var rejilla = el("div", "rejilla");
      campos.forEach(function (c) { if (!SOLO_LECTURA[c.ruta]) { rejilla.appendChild(construirCampo(c, c.ruta, null)); } });
      cuerpo.appendChild(rejilla);
      var der = cajaDerivados(g.id);
      if (der) { cuerpo.appendChild(der.caja); }
      grupos[g.id] = { det: det, sum: sum, cuenta: cuenta, derivados: der, cuerpo: cuerpo, rejilla: rejilla };
      if (g.id === "B1") { cuerpo.appendChild(construirZonaItems()); }
      return det;
    }

    // ---------- Ítems

    var zonaItems, listaItems, btnAgregar, resumenItems = [];

    function construirZonaItems() {
      zonaItems = el("div", "zona-items");
      zonaItems.appendChild(el("h3", "items-titulo", "Ítems / Items"));
      zonaItems.appendChild(el("p", "nota", "Cada ítem es una línea de la factura. Usa ↑ ↓ para ordenarlos; " +
        "eliminar un ítem pide confirmación. Los tributos del ítem (importación) están al final de cada tarjeta."));
      listaItems = el("div", "lista-items");
      zonaItems.appendChild(listaItems);
      btnAgregar = el("button", "btn-agregar", "+ Agregar ítem / Add item");
      btnAgregar.type = "button";
      btnAgregar.addEventListener("click", function () { agregarItem(); });
      zonaItems.appendChild(btnAgregar);
      construirItems();
      return zonaItems;
    }

    function construirItems(enfocar) {
      // Las filas de los ítems se rehacen; las demás se conservan.
      Object.keys(filas).forEach(function (r) { if (filas[r].i !== null) { delete filas[r]; } });
      listaItems.textContent = "";
      resumenItems = [];
      op.especificos.items.forEach(function (it, i) { listaItems.appendChild(tarjeta(it, i)); });
      if (!op.especificos.items.length) {
        listaItems.appendChild(el("p", "vacio", "Aún no hay ítems. Agrega el primero con el botón de abajo."));
      }
      if (enfocar) { enfocar(); }
    }

    function botonItem(texto, etiquetaAria, fn) {
      var b = el("button", "btn-item", texto);
      b.type = "button";
      b.setAttribute("aria-label", etiquetaAria);
      b.addEventListener("click", fn);
      return b;
    }

    function tarjeta(it, i) {
      var n = i + 1, total = op.especificos.items.length;
      var det = el("details", "item-tarjeta");
      det.id = id + "-item-" + i;
      det.open = abiertos.has(it);
      det.addEventListener("toggle", function () { if (det.open) { abiertos.add(it); } else { abiertos.delete(it); } });
      var sum = el("summary");
      sum.appendChild(el("span", "item-num", "Ítem " + n));
      var res = el("span", "item-resumen");
      sum.appendChild(res);
      det.appendChild(sum);
      resumenItems[i] = res;

      var acciones = el("div", "item-acciones");
      var subir = botonItem("↑ Subir", "Subir el ítem " + n, function () { moverItem(i, -1); });
      var bajar = botonItem("↓ Bajar", "Bajar el ítem " + n, function () { moverItem(i, 1); });
      subir.disabled = i === 0;
      bajar.disabled = i === total - 1;
      subir.setAttribute("data-accion", "subir");
      bajar.setAttribute("data-accion", "bajar");
      acciones.appendChild(subir);
      acciones.appendChild(bajar);
      acciones.appendChild(botonItem("Duplicar", "Duplicar el ítem " + n, function () { duplicarItem(i); })).setAttribute("data-accion", "duplicar");
      acciones.appendChild(botonItem("Eliminar", "Eliminar el ítem " + n, function () { eliminarItem(i); })).setAttribute("data-accion", "eliminar");
      det.appendChild(acciones);

      var deItem = DICCIONARIO.campos.filter(function (c) { return c.ruta.indexOf("items[]") !== -1; });
      [["Mercancía / Goods", function (c) { return c.grupo === "B1" && !EMBALAJE[claveDe(c.ruta)]; }, ""],
        ["Embalaje y pesos / Packing", function (c) { return c.grupo === "B1" && EMBALAJE[claveDe(c.ruta)]; }, ""],
        ["Tributos del ítem (importación) / Duties", function (c) { return c.grupo === "B8"; }, "importacion"]
      ].forEach(function (sec) {
        var fs = el("fieldset", "item-seccion");
        if (sec[2]) { fs.setAttribute("data-solo", sec[2]); }
        fs.appendChild(el("legend", null, sec[0]));
        var rej = el("div", "rejilla");
        deItem.filter(sec[1]).forEach(function (c) {
          rej.appendChild(construirCampo(c, c.ruta.replace("items[]", "items." + i), i));
        });
        fs.appendChild(rej);
        det.appendChild(fs);
      });
      pintarResumenItem(i);
      return det;
    }

    function pintarResumenItem(i) {
      var it = op.especificos.items[i], res = resumenItems[i];
      if (!it || !res) { return; }
      var F = Calculos.formato;
      var ri = resultado && resultado.items[i];
      var cant = it.cantidad == null ? "—" : (ri ? F.cantidad(ri.cantidad) : String(it.cantidad));
      var partes = [it.nombre || "(sin nombre)", cant + " " + (it.unidadComercial || "")];
      partes.push(ri ? "USD " + F.comercial(ri.valor) : "USD —");
      if (ri) { partes.push(ri.bultos + " bultos"); }
      res.textContent = " · " + partes.join(" · ");
    }

    function hayPendientesDeItems() {
      return Object.keys(pendientes).some(function (r) { return r.indexOf("especificos.items.") === 0; });
    }

    // Antes de cambiar la estructura de los ítems, los pendientes de campos OCULTOS de los ítems se descartan
    // de forma explícita (con aviso): sus rutas cambiarían de índice. Los visibles siguen bloqueando.
    function bloqueadoPorPendientes() {
      var ocultos = pendientesOcultos().filter(function (p) { return p.ruta.indexOf("especificos.items.") === 0; });
      if (ocultos.length) { descartarPendientes(ocultos.map(function (p) { return p.ruta; })); }
      if (!hayPendientesDeItems()) { return false; }
      anunciar("Primero corrige los datos de los ítems marcados en rojo (E20); después podrás agregar, mover o eliminar ítems.");
      return true;
    }

    function enfocarAccion(i, accion) {
      return function () {
        var t = document.getElementById(id + "-item-" + i);
        if (!t) { return; }
        t.open = true;
        var b = t.querySelector('[data-accion="' + accion + '"]');
        if (b && b.disabled) { b = t.querySelector("summary"); }
        (b || t.querySelector("summary")).focus();
      };
    }

    function agregarItem() {
      if (bloqueadoPorPendientes()) { return; }
      if (op.especificos.items.length >= Modelo.limites.items) {
        anunciar("La operación ya tiene " + Modelo.limites.items + " ítems, el máximo que admite la herramienta.");
        return;
      }
      var it = itemNuevo();
      op.especificos.items.push(it);
      abiertos.add(it);
      var i = op.especificos.items.length - 1;
      construirItems(function () {
        var primero = filas["especificos.items." + i + ".nombre"];
        if (primero) { primero.fila.scrollIntoView({ block: "center" }); primero.control.focus({ preventScroll: true }); }
      });
      anunciar("Se agregó el ítem " + (i + 1) + ".");
      avisar("estructura");
    }

    function duplicarItem(i) {
      if (bloqueadoPorPendientes()) { return; }
      if (op.especificos.items.length >= Modelo.limites.items) { anunciar("Ya hay " + Modelo.limites.items + " ítems, el máximo."); return; }
      var copia = Modelo.clonar(op.especificos.items[i]);
      // Los equipos (series e IMEI) son únicos por unidad: no se copian.
      var teniaEquipos = copia.equipos.length > 0;
      copia.equipos = [];
      op.especificos.items.splice(i + 1, 0, copia);
      var marcas = reindexarMarcas(op.marcas, function (j) { return j <= i ? j : j + 1; });
      Object.keys(op.marcas).forEach(function (k) {
        var m = /^especificos\.items\.(\d+)\.(.+)$/.exec(k);
        if (m && Number(m[1]) === i && m[2] !== "equipos") { marcas["especificos.items." + (i + 1) + "." + m[2]] = op.marcas[k]; }
      });
      op.marcas = marcas;
      abiertos.add(copia);
      construirItems(enfocarAccion(i + 1, "duplicar"));
      anunciar("Se duplicó el ítem " + (i + 1) + " como ítem " + (i + 2) + (teniaEquipos ? " (sin sus equipos: cada serie e IMEI es único)." : "."));
      avisar("estructura");
    }

    function eliminarItem(i) {
      if (bloqueadoPorPendientes()) { return; }
      var it = op.especificos.items[i];
      if (!confirmar("¿Eliminar el ítem " + (i + 1) + (it.nombre ? " («" + it.nombre + "»)" : "") + "? Se borran sus datos y sus marcas; para recuperarlos tendrías que volver a abrir el archivo guardado.")) { return; }
      op.especificos.items.splice(i, 1);
      op.marcas = reindexarMarcas(op.marcas, function (j) { return j === i ? null : (j > i ? j - 1 : j); });
      abiertos.delete(it);
      var quedan = op.especificos.items.length;
      construirItems(function () {
        if (quedan) { enfocarAccion(Math.min(i, quedan - 1), "eliminar")(); } else { btnAgregar.focus(); }
      });
      anunciar("Se eliminó el ítem " + (i + 1) + ".");
      avisar("estructura");
    }

    function moverItem(i, delta) {
      if (bloqueadoPorPendientes()) { return; }
      var j = i + delta, items = op.especificos.items;
      if (j < 0 || j >= items.length) { return; }
      var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
      op.marcas = reindexarMarcas(op.marcas, function (k) { return k === i ? j : (k === j ? i : k); });
      construirItems(enfocarAccion(j, delta < 0 ? "subir" : "bajar"));
      anunciar("El ítem " + (i + 1) + " pasó a la posición " + (j + 1) + ".");
      avisar("estructura");
    }

    // ---------- Índice de grupos

    var indice = el("nav", "indice-grupos");
    indice.setAttribute("aria-label", "Secciones de la operación");
    var listaIndice = el("ul");
    indice.appendChild(listaIndice);
    var barraGrupos = el("div", "grupos-acciones");
    var btnAbrir = el("button", null, "Abrir todas las secciones");
    btnAbrir.type = "button";
    var btnCerrar = el("button", null, "Cerrar todas");
    btnCerrar.type = "button";
    barraGrupos.appendChild(btnAbrir);
    barraGrupos.appendChild(btnCerrar);

    var cuerpoGrupos = el("div", "grupos");
    DICCIONARIO.grupos.forEach(function (g, k) {
      var det = construirGrupo(g);
      if (k <= 1) { det.open = true; }
      cuerpoGrupos.appendChild(det);
      var li = el("li");
      var a = el("a", null, g.es.replace(/^([A-Z]\d(–[A-Z]\d)?)\. /, "$1 · "));
      a.href = "#" + det.id;
      var badge = el("span", "indice-cuenta");
      a.appendChild(badge);
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        det.open = true;
        det.scrollIntoView({ block: "start" });
        grupos[g.id].sum.focus({ preventScroll: true });
      });
      li.appendChild(a);
      listaIndice.appendChild(li);
      grupos[g.id].enlace = li;
      grupos[g.id].badge = badge;
    });
    btnAbrir.addEventListener("click", function () { Object.keys(grupos).forEach(function (g) { grupos[g].det.open = true; }); });
    btnCerrar.addEventListener("click", function () { Object.keys(grupos).forEach(function (g) { grupos[g].det.open = false; }); });

    var principal = el("div", "formulario-principal");
    principal.appendChild(barraGrupos);
    principal.appendChild(cuerpoGrupos);
    raiz.appendChild(indice);
    raiz.appendChild(principal);

    // ---------------------------------------------------------------- Refresco (tras cada cálculo)

    // Muestra u oculta los campos condicionales, las marcas de obligatorio, los derivados, los resúmenes
    // de ítems y los errores junto a cada campo. r puede ser null (cálculo en pausa).
    function refrescar(r, revision) {
      resultado = r;
      var tipoOp = op.generales.operacion.tipo;
      var visiblesPorGrupo = {};
      Object.keys(filas).forEach(function (ruta) {
        var f = filas[ruta];
        var pide = DICCIONARIO.sePide(f.campo, op, f.i);
        f.fila.hidden = !pide;
        var g = grupoVisible(f.campo);
        if (pide) { visiblesPorGrupo[g] = true; }
        var obl = pide && Validaciones.obligatorio(op, f.campo);
        f.req.hidden = !obl;
        if (obl) { f.control.setAttribute("aria-required", "true"); } else { f.control.removeAttribute("aria-required"); }
      });
      // Seguro forzado a Sí en CIF y CIP (si ya es Sí, no se puede quitar).
      var fh = filas["especificos.seguro.hay"];
      if (fh) {
        var rg = INCOTERMS.regla(op.generales.comercial.incoterm);
        var forzado = !!(rg && rg.seguroObligatorio && op.especificos.seguro.hay === true);
        fh.control.disabled = forzado;
        fh.pista.textContent = forzado ? "Obligatorio en " + rg.codigo + ": el seguro queda en Sí (Incoterms® 2020, A5)." : textoPista(fh.campo, fh.ruta, tipoOp);
      }
      Array.prototype.forEach.call(raiz.querySelectorAll("fieldset[data-solo]"), function (fs) {
        fs.hidden = fs.getAttribute("data-solo") !== tipoOp;
      });
      Object.keys(grupos).forEach(function (gid) {
        var g = grupos[gid];
        var der = g.derivados, hayDerivados = false;
        if (der) {
          der.nodos.forEach(function (n) {
            var aplica = !n.d.solo || n.d.solo === tipoOp;
            n.dt.hidden = n.dd.hidden = !aplica;
            if (aplica) {
              hayDerivados = true;
              n.valor.textContent = n.d.valor(op, r);
              var cas = n.d.cas[tipoOp === "importacion" ? 0 : 1];
              n.cas.textContent = n.d.fuente + (cas ? " · Casilla: " + cas : "");
            }
          });
          der.caja.hidden = !hayDerivados;
        }
        var visible = !!visiblesPorGrupo[gid] || hayDerivados || gid === "B1";
        g.det.hidden = !visible;
        g.enlace.hidden = !visible;
      });
      op.especificos.items.forEach(function (_, i) { pintarResumenItem(i); });
      Object.keys(filas).forEach(function (ruta) { if (filas[ruta].descCodigo) { pintarDescripcionCodigo(filas[ruta]); } });
      marcarErrores(revision);
    }

    // aria-invalid y mensaje junto a cada campo con error; contador de errores por sección.
    function marcarErrores(revision) {
      var porRuta = {};
      ((revision && revision.errores) || []).forEach(function (h) {
        h.rutas.forEach(function (r) { (porRuta[r] = porRuta[r] || []).push(h.id + ": " + h.que); });
      });
      Object.keys(pendientes).forEach(function (r) {
        if (!porRuta[r]) { porRuta[r] = ["E20: " + pendientes[r]]; }
      });
      var porGrupo = {};
      Object.keys(filas).forEach(function (ruta) {
        var f = filas[ruta], msgs = porRuta[ruta];
        var describe = f.pista.id;
        if (msgs) {
          f.error.textContent = "✘ " + msgs.join(" · ");
          f.error.hidden = false;
          f.control.setAttribute("aria-invalid", "true");
          f.fila.classList.add("cf-con-error");
          describe += " " + f.error.id;
          if (!f.fila.hidden) { var g = grupoVisible(f.campo); porGrupo[g] = (porGrupo[g] || 0) + 1; }
        } else if (!f.error.hidden) {
          f.error.hidden = true;
          f.error.textContent = "";
          f.control.removeAttribute("aria-invalid");
          f.fila.classList.remove("cf-con-error");
        }
        f.control.setAttribute("aria-describedby", describe);
      });
      if (porRuta["especificos.items"]) { porGrupo.B1 = (porGrupo.B1 || 0) + 1; }
      Object.keys(grupos).forEach(function (gid) {
        var n = porGrupo[gid] || 0, texto = n ? " · " + n + (n === 1 ? " campo con error" : " campos con error") : "";
        grupos[gid].cuenta.textContent = texto;
        grupos[gid].badge.textContent = n ? " (" + n + ")" : "";
        grupos[gid].badge.title = texto ? texto.slice(3) : "";
      });
    }

    // ---------------------------------------------------------------- Ir al dato

    var resaltada = null;
    // Lleva al control de una ruta: abre su sección (y su tarjeta), lo centra y le da foco.
    // Devuelve { ok, oculto, condicion }.
    function irA(ruta) {
      if (ruta === "especificos.items") {
        grupos.B1.det.open = true;
        btnAgregar.scrollIntoView({ block: "center" });
        btnAgregar.focus({ preventScroll: true });
        return { ok: true };
      }
      var f = filas[ruta];
      if (!f) { return { ok: false }; }
      var g = grupos[grupoVisible(f.campo)];
      g.det.open = true;
      if (f.i !== null) {
        var t = document.getElementById(id + "-item-" + f.i);
        if (t) { t.open = true; }
      }
      if (resaltada) { resaltada.classList.remove("resaltado"); }
      if (f.fila.hidden) {
        g.sum.scrollIntoView({ block: "center" });
        g.sum.focus({ preventScroll: true });
        return { ok: true, oculto: true, condicion: f.campo.si || (f.campo.solo === "importacion" ? "importación" : "exportación") };
      }
      resaltada = f.fila;
      f.fila.classList.add("resaltado");
      f.fila.scrollIntoView({ block: "center" });
      (f.control.disabled ? f.fila : f.control).focus({ preventScroll: true });
      return { ok: true };
    }

    // ---------------------------------------------------------------- Lectura completa (pruebas)

    function valorDeControl(f) {
      var c = f.control;
      switch (f.campo.tipo) {
        case "sino": return c.checked;
        case "numero": return parsearNumero(c.value, claveDe(f.ruta)).valor;
        case "equipos": return parsearEquipos(c.value).equipos;
        default: return c.value;
      }
    }

    // Arma una operación NUEVA leyendo solo los controles (más las marcas, que no son campos).
    // Sirve para comprobar que el formulario muestra exactamente la operación: leer → escribir → leer.
    function leerControles() {
      var nueva = Modelo.operacionVacia();
      nueva.especificos.items = op.especificos.items.map(function () { return Modelo.itemVacio(); });
      Object.keys(SOLO_LECTURA).forEach(function (r) { nueva[r] = op[r]; });
      Object.keys(filas).forEach(function (ruta) { escribirRuta(nueva, ruta, valorDeControl(filas[ruta])); });
      nueva.marcas = Modelo.clonar(op.marcas);
      return nueva;
    }

    // ¿Se pide ahora el campo de esta ruta? (un pendiente de un campo oculto no bloquea; F5-M1)
    function sePideRuta(ruta) {
      var f = filas[ruta];
      return !f || DICCIONARIO.sePide(f.campo, op, f.i);
    }

    // Pendientes que bloquean (E20): solo los de campos que se piden con los datos actuales.
    function pendientesLista() {
      return Object.keys(pendientes).filter(sePideRuta).map(function (r) { return { ruta: r, texto: pendientes[r] }; });
    }

    // Pendientes «en suspenso» (F5-M1): el campo dejó de pedirse. No bloquean; la operación conserva el valor
    // anterior y el texto escrito sigue en el control: si el campo vuelve a pedirse, se revisa de nuevo (E20).
    function pendientesOcultos() {
      return Object.keys(pendientes).filter(function (r) { return !sePideRuta(r); }).map(function (r) {
        return { ruta: r, texto: pendientes[r], conserva: Modelo.leer(op, r) };
      });
    }

    // Descarta el texto no válido de esas rutas: el control vuelve a mostrar el valor de la operación.
    function descartarPendientes(rutas) {
      rutas.forEach(function (r) { delete pendientes[r]; pintarValor(r); });
      if (rutas.length) {
        anunciar("Se descartó el texto no válido de " + rutas.length + " dato(s) que no se piden ahora; se conserva su valor anterior.");
        avisar("dato", rutas[0]);
      }
    }

    return {
      raiz: raiz,
      operacion: function () { return op; },
      pendientes: pendientesLista,
      pendientesOcultos: pendientesOcultos,
      descartarPendientesOcultos: function () { descartarPendientes(pendientesOcultos().map(function (p) { return p.ruta; })); },
      refrescar: refrescar,
      irA: irA,
      control: function (ruta) { return filas[ruta] ? filas[ruta].control : null; },
      fila: function (ruta) { return filas[ruta] ? filas[ruta].fila : null; },
      rutas: function () { return Object.keys(filas); },
      leerControles: leerControles,
      agregarItem: agregarItem,
      duplicarItem: duplicarItem,
      eliminarItem: eliminarItem,
      moverItem: moverItem
    };
  }

  return {
    crear: crear,
    operacionNueva: operacionNueva,
    itemNuevo: itemNuevo,
    parsearNumero: parsearNumero,
    textoNumero: textoNumero,
    parsearEquipos: parsearEquipos,
    textoEquipos: textoEquipos,
    reindexarMarcas: reindexarMarcas,
    etiquetaMarca: etiquetaMarca,
    soloLectura: SOLO_LECTURA
  };
})();
