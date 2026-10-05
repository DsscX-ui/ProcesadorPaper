/* Documentos (F6+): parte común de las plantillas.
   - Registro de plantillas: cada archivo de js/documentos/ llama a Documentos.registrar({ id, codigo, es, en, generar }).
   - Marco de cada hoja A4: marca de agua, aviso «DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES»,
     título bilingüe y pie con la referencia de la operación y la fecha de generación (PLAN §3, «Marcas en cada
     documento»). Al imprimir, el aviso, el pie y «Página X de Y» van en los márgenes de cada página (css/estilos.css).
   - Utilidades de presentación: fechas, códigos de las listas, subpartida SA, precio unitario, importe en letras.
   Las plantillas SOLO LEEN: la operación (datos), el resultado de Calculos.calcular y la revisión de
   Validaciones.validar. No calculan ni redondean: las cifras se muestran con Calculos.formato (PLAN §6.1).
   Los datos del usuario se insertan siempre con textContent (nunca innerHTML).
   Cifras de cuadre: cada plantilla marca con data-cuadre="clave" las cifras que deben coincidir entre documentos
   (bultos, pesos, volumen, valor, contenedor…); la hoja resumen y pruebas.html las leen del documento generado.
   Script clásico: deja el objeto global Documentos. */

var Documentos = (function () {
  var registro = [];
  var Fm = Calculos.formato;

  // def: { id, codigo (FC, PL, BL, HR…), es, en, nota, generar(ctx) → elemento <article class="hoja-doc"> }
  function registrar(def) { registro.push(def); }
  function lista() { return registro.slice(); }

  // ---------------------------------------------------------------- DOM

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) { n.className = clase; }
    if (texto != null) { n.textContent = texto; }
    return n;
  }

  // Rótulo bilingüe (PLAN §11.8): «Peso bruto / Gross weight».
  function rotulo(es, en, clase) {
    var s = el("span", clase || "doc-rot");
    s.appendChild(document.createTextNode(es));
    if (en) { s.appendChild(el("span", "en", " / " + en)); }
    return s;
  }

  // Etiqueta de marca (H*, POR VERIFICAR…): la misma del formulario.
  function etiquetaMarca(marca, nota) {
    var m = Formulario.etiquetaMarca(marca);
    if (nota) { m.title = nota; }
    return m;
  }

  // Marca propia de un dato (op.marcas) si es H* o PV: debe verse también en el documento impreso (PLAN §3).
  function marcaDato(ctx, ruta) {
    var m = ctx.op.marcas[ruta];
    if (!m || (m.marca !== "PV" && m.marca !== "H*")) { return null; }
    return etiquetaMarca(m.marca, m.nota);
  }

  // Marca EFECTIVA de un dato (F7.1, auditoría F6-M1): la propia de la operación (op.marcas); si no tiene, la de
  // su lista de códigos (campos «codigo») o la del campo en el diccionario. Devuelve { marca, nota } o null.
  function marcaEfectiva(ctx, ruta) {
    var m = ctx.op.marcas[ruta];
    if (m) { return { marca: m.marca, nota: m.nota || "" }; }
    var c = DICCIONARIO.buscar(ruta);
    if (!c) { return null; }
    var lista = c.tipo === "codigo" && c.lista ? NORMATIVA.listas[c.lista] : null;
    if (lista && lista.marca) { return { marca: lista.marca, nota: lista.nombre + (lista.fuente ? ": " + lista.fuente : "") }; }
    return { marca: c.marca, nota: "Fuente: " + c.fuente };
  }

  // Etiqueta de la marca efectiva si es H* o PV (las que deben verse también impresas, PLAN §3); si no, null.
  function etiquetaEfectiva(ctx, ruta, notaExtra) {
    var m = marcaEfectiva(ctx, ruta);
    if (!m || (m.marca !== "PV" && m.marca !== "H*")) { return null; }
    return etiquetaMarca(m.marca, m.nota + (notaExtra ? " " + notaExtra : ""));
  }

  // Valor con su marca efectiva (si es H* o PV). valor: texto o nodo.
  function conMarca(ctx, valor, ruta, notaExtra) {
    var s = el("span");
    if (valor && valor.nodeType) { s.appendChild(valor); } else { s.appendChild(document.createTextNode(valor == null || valor === "" ? "—" : String(valor))); }
    var m = ruta ? etiquetaEfectiva(ctx, ruta, notaExtra) : null;
    if (m) { s.appendChild(document.createTextNode(" ")); s.appendChild(m); }
    return s;
  }

  // Puerto con la marca de su UN/LOCODE (H*: lista abierta; PV-09): «Callao (PECLL) H*». cual: "puertoEmbarque"…
  function puertoMarcado(ctx, cual) {
    return conMarca(ctx, puerto(ctx.op.generales.ruta[cual]), "generales.ruta." + cual + ".locode");
  }

  // Estado de la subpartida de uno o varios ítems (F8a.1, auditoría F8a-M2), armonizado con A08:
  //  - marca explícita PV del dato (op.marcas) → POR VERIFICAR con la nota de quien la puso;
  //  - sin esa marca, «subpartida verificada» = No → POR VERIFICAR la subpartida COMPLETA (ni el SA de 6 dígitos
  //    ni los dígitos nacionales están confirmados);
  //  - verificada y sin marca PV → sin POR VERIFICAR.
  // Devuelve { pv: bool, explicita: bool, nota }.
  function estadoSubpartida(ctx, indices) {
    var notas = [], explicita = false, sinVerificar = false;
    [].concat(indices).forEach(function (i) {
      var m = ctx.op.marcas["especificos.items." + i + ".subpartida"];
      if (m && m.marca === "PV") { explicita = true; if (m.nota && notas.indexOf(m.nota) === -1) { notas.push(m.nota); } }
      else if (ctx.op.especificos.items[i].subpartidaVerificada !== true) { sinVerificar = true; }
    });
    if (sinVerificar) { notas.push("Subpartida no verificada en el arancel (A08; PV-10): ni el SA de 6 dígitos ni los dígitos nacionales están confirmados."); }
    return { pv: explicita || sinVerificar, explicita: explicita && !sinVerificar, nota: notas.join(" ") };
  }

  // Subpartida del SA (6 dígitos) con sus marcas. indices: ítem o ítems que comparten ese SA.
  // H* (Sistema Armonizado, conocimiento general) solo si la subpartida no está «sin verificar» por completo;
  // POR VERIFICAR según estadoSubpartida (la nota dice qué parte falta, sin suponerlo).
  function sa6Marcado(ctx, indices) {
    var lista = [].concat(indices), it = ctx.op.especificos.items[lista[0]];
    var e = estadoSubpartida(ctx, lista);
    var s = el("span", null, sa6(it.subpartida));
    if (!e.pv || e.explicita) {
      s.appendChild(document.createTextNode(" "));
      s.appendChild(etiquetaMarca("H*", "SA de 6 dígitos (Sistema Armonizado): conocimiento general, sin fuente en la carpeta."));
    }
    if (e.pv) {
      s.appendChild(document.createTextNode(" "));
      s.appendChild(etiquetaMarca("PV", e.nota));
    }
    return s;
  }

  // Subpartida nacional completa (DAM 7.19) con POR VERIFICAR si corresponde.
  function subpartidaMarcada(ctx, indices) {
    var lista = [].concat(indices), e = estadoSubpartida(ctx, lista);
    var s = el("span", null, ctx.op.especificos.items[lista[0]].subpartida || "—");
    if (e.pv) { s.appendChild(document.createTextNode(" ")); s.appendChild(etiquetaMarca("PV", e.nota)); }
    return s;
  }

  // ¿Alguna subpartida de la operación está POR VERIFICAR? (para la nota que explica la marca en el documento)
  function hayPvSubpartida(ctx) {
    return ctx.op.especificos.items.some(function (it, i) { return estadoSubpartida(ctx, i).pv; });
  }


  // Cifra de cuadre: el texto mostrado lleva data-cuadre para que la hoja resumen y las pruebas lo lean.
  function cifra(texto, clave, clase) {
    var s = el("span", "doc-cifra" + (clase ? " " + clase : ""), texto);
    s.setAttribute("data-cuadre", clave);
    return s;
  }

  // Botón «?» + panel desplegable con una explicación (aria-expanded / aria-controls; teclado y toque, el mismo patrón
  // del formulario). Lo usan las casillas de la DAM (F8a.3) y los datos de los certificados (F9). No se imprime.
  // cab: dónde va el botón; contenedor: dónde va el panel; etiqueta: nombre accesible del botón.
  var nAyuda = 0;
  function ayuda(cab, contenedor, etiqueta, textos) {
    var id = "dam-ayuda-" + (++nAyuda);
    var btn = el("button", "dam-ayuda-btn", "?");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", id);
    btn.setAttribute("aria-label", etiqueta);
    cab.appendChild(btn);
    var panel = el("div", "dam-ayuda");
    panel.id = id;
    panel.hidden = true;
    textos.filter(Boolean).forEach(function (t) { panel.appendChild(el("p", null, t)); });
    contenedor.appendChild(panel);
    btn.addEventListener("click", function () {
      var abierto = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", abierto ? "false" : "true");
      panel.hidden = abierto;
    });
    return btn;
  }

  // F10.1 (auditoría F10-X1): en un celular la hoja A4 se ve al ~40 % y los «?» de la DAM quedan a 13 px unos de otros:
  // no caben objetivos de 24 × 24 px sin taparse. Por eso, mientras la hoja está reducida, debajo de ella se muestra la
  // lista de sus ayudas, fuera de la hoja y sin escalar: un botón por casilla (alto mínimo 44 px, uno debajo de otro) que
  // abre el mismo texto de la ayuda de la hoja (copiado con textContent). Ids propios («lista-» + id de la ayuda), así que
  // no se duplican; el «?» de la hoja sigue funcionando igual. No se imprime.
  // La muestra pantalla.js (ajustarEscala) solo mientras la hoja está reducida.
  function listaAyudas(hoja, docId) {
    var botones = hoja.querySelectorAll(".dam-ayuda-btn");
    if (!botones.length) { return null; }
    var caja = el("details", "doc-ayudas-lista");
    caja.hidden = true;
    caja.appendChild(el("summary", null, "Ayudas de las casillas de esta hoja (" + botones.length + "), para leerlas en el celular"));
    caja.appendChild(el("p", "nota", "Son las mismas ayudas de los botones «?» de la hoja, en letra normal. También puedes usar «Ver en tamaño real»."));
    var ul = el("ul");
    Array.prototype.forEach.call(botones, function (b) {
      // La hoja aún no está en el documento (se arma en un fragmento): se busca el panel dentro de ella.
      var original = hoja.querySelector('[id="' + b.getAttribute("aria-controls") + '"]');
      if (!original) { return; }
      var li = el("li");
      var btn = el("button", "doc-ayuda-item", (b.getAttribute("aria-label") || "Ayuda").replace(/^Ayuda de la casilla /, "Casilla ").replace(/^Ayuda: /, ""));
      btn.type = "button";
      var id = "lista-" + original.id;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", id);
      var texto = el("div", "doc-ayuda-texto");
      texto.id = id;
      texto.hidden = true;
      Array.prototype.forEach.call(original.querySelectorAll("p"), function (q) { texto.appendChild(el("p", null, q.textContent)); });
      btn.addEventListener("click", function () {
        var abierto = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", abierto ? "false" : "true");
        texto.hidden = abierto;
      });
      li.appendChild(btn);
      li.appendChild(texto);
      ul.appendChild(li);
    });
    caja.appendChild(ul);
    caja.setAttribute("data-doc", docId);
    return caja;
  }

  // Lista de datos «rótulo: valor» en una caja. filas: [[es, en, valor (texto o nodo), opciones], …]
  // opciones (F9): { blanco: true → un valor vacío queda EN BLANCO (D17) en lugar de «—»; ayuda: [textos] → botón «?»
  // junto al rótulo con la explicación (el motivo de la casilla en blanco, de dónde sale el dato…) }.
  function datos(titulo, filas, clase) {
    var caja = el("section", "doc-caja" + (clase ? " " + clase : ""));
    if (titulo) { caja.appendChild(el("h4", null)).appendChild(rotulo(titulo[0], titulo[1])); }
    var dl = el("dl", "doc-datos");
    filas.forEach(function (f) {
      if (!f) { return; }
      var o = f[3] || {};
      var dt = el("dt");
      dt.appendChild(rotulo(f[0], f[1]));
      var dd = el("dd");
      if (f[2] && f[2].nodeType) { dd.appendChild(f[2]); }
      else if (f[2] == null || f[2] === "") { if (o.blanco) { dd.setAttribute("data-estado", "en-blanco"); } else { dd.textContent = "—"; } }
      else { dd.textContent = String(f[2]); }
      if (o.ayuda && o.ayuda.filter(Boolean).length) { ayuda(dt, dd, "Ayuda: " + f[0], o.ayuda); }
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    caja.appendChild(dl);
    return caja;
  }

  // Fila de datos de un certificado (F9) para el campo «ruta» del formulario: nada se inventa.
  //  - con valor: el texto (o nodo) con la marca del dato si es H* o PV (o.efectiva: también la de su campo o lista);
  //  - vacío y marcado PV en la operación: «POR VERIFICAR» visible (también impreso) con la nota de la marca;
  //  - vacío sin marca: EN BLANCO (D17) y el motivo en la ayuda «?».
  // o: { efectiva, motivo (por qué puede estar vacío), ayuda: [textos para un dato con valor] }.
  function filaDato(ctx, es, en, ruta, valor, o) {
    o = o || {};
    var vacio = valor == null || valor === "";
    if (vacio) {
      var m = ctx.op.marcas[ruta];
      if (m && m.marca === "PV") {
        var pv = el("span", "doc-pv");
        pv.appendChild(etiquetaMarca("PV", m.nota));
        if (m.nota) { pv.appendChild(el("span", "doc-pv-motivo", " " + m.nota)); }
        return [es, en, pv, { ayuda: ["Dato vacío a propósito y marcado POR VERIFICAR en la operación: no es un error (PLAN §7, E01) y no se inventa."].concat(o.ayuda || []) }];
      }
      return [es, en, "", { blanco: true, ayuda: ["En blanco: el dato no está en el formulario (D17: no se inventa)." + (o.motivo ? " " + o.motivo : "")] }];
    }
    var nodo = o.efectiva ? conMarca(ctx, valor, ruta) : el("span");
    if (!o.efectiva) {
      if (valor.nodeType) { nodo.appendChild(valor); } else { nodo.textContent = String(valor); }
      var mm = marcaDato(ctx, ruta);
      if (mm) { nodo.appendChild(document.createTextNode(" ")); nodo.appendChild(mm); }
    }
    return [es, en, nodo, { ayuda: o.ayuda }];
  }

  // Advertencias de la revisión con ese ID (A11, A13…): las plantillas las MUESTRAN; no repiten la regla (validaciones.js).
  function advertencias(ctx, id) {
    return ((ctx.rv && ctx.rv.advertencias) || []).filter(function (h) { return h.id === id; });
  }

  // Recuadro con una advertencia de la revisión dentro del documento (no bloquea): «⚠ A11 · título: qué pasa» + marca.
  function avisoRevision(h) {
    var p = el("p", "doc-adv");
    p.setAttribute("data-aviso", h.id);
    p.appendChild(el("strong", null, "⚠ " + h.id + " · " + h.titulo + ": "));
    p.appendChild(document.createTextNode(h.que + " "));
    p.appendChild(etiquetaMarca(h.marca, h.fuente ? "Fuente: " + h.fuente : ""));
    return p;
  }

  // Tabla del documento. columnas: [{ es, en, num (alinear a la derecha), clase }]; filas: listas de textos o nodos.
  // opciones.pie: filas de totales (tfoot). Encabezado repetido en cada página impresa (thead) y filas sin cortar.
  function tabla(columnas, filas, opciones) {
    opciones = opciones || {};
    var t = el("table", "doc-tabla" + (opciones.clase ? " " + opciones.clase : ""));
    if (opciones.titulo) { t.appendChild(el("caption", null)).appendChild(rotulo(opciones.titulo[0], opciones.titulo[1])); }
    var thead = el("thead"), tr = el("tr");
    columnas.forEach(function (c) {
      var th = el("th", (c.num ? "num " : "") + (c.clase || ""));
      th.scope = "col";
      th.appendChild(rotulo(c.es, c.en));
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    t.appendChild(thead);
    function cuerpo(lista, contenedor, claseFila) {
      lista.forEach(function (f) {
        var fila = el("tr", [claseFila, f.clase].filter(Boolean).join(" ") || null);
        var col = 0;   // columna real (la primera celda puede ocupar f.span columnas)
        (f.celdas || f).forEach(function (celda, i) {
          var cc = columnas[col] || {};
          var td = el("td", (cc.num && !(f.span && i === 0) ? "num " : "") + (cc.clase || ""));
          if (celda && celda.nodeType) { td.appendChild(celda); } else { td.textContent = celda == null ? "" : String(celda); }
          if (f.span && i === 0) { td.colSpan = f.span; col += f.span; } else { col += 1; }
          fila.appendChild(td);
        });
        contenedor.appendChild(fila);
      });
    }
    var tb = el("tbody");
    cuerpo(filas, tb);
    t.appendChild(tb);
    if (opciones.pie && opciones.pie.length) {
      var tf = el("tfoot");
      cuerpo(opciones.pie, tf, "doc-total");
      t.appendChild(tf);
    }
    return t;
  }

  // ---------------------------------------------------------------- Formato (sin calcular)

  // "2026-10-05" → "05-10-2026". Vacío → "—".
  function fecha(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    return m ? m[3] + "-" + m[2] + "-" + m[1] : (iso ? String(iso) : "—");
  }

  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function fechaHora(d) {
    return dos(d.getDate()) + "-" + dos(d.getMonth() + 1) + "-" + d.getFullYear() + " " + dos(d.getHours()) + ":" + dos(d.getMinutes());
  }

  // Texto de un código de una lista de normativa.js: "CN — China"; si no está en la lista, el código tal cual.
  function opcion(nombreLista, codigo, soloTexto) {
    if (codigo == null || codigo === "") { return "—"; }
    var o = NORMATIVA.opcion(nombreLista, String(codigo));
    if (!o) { return String(codigo); }
    return soloTexto ? o.texto : o.codigo + " — " + o.texto;
  }

  // Subpartida del Sistema Armonizado: los 6 primeros dígitos de la nacional ("8414.51.00.00" → "8414.51") [H*].
  function sa6(subpartida) {
    var d = String(subpartida || "").replace(/\D/g, "");
    return d.length >= 6 ? d.slice(0, 4) + "." + d.slice(4, 6) : (subpartida || "—");
  }

  // Precio unitario: 2 decimales como mínimo; si el dato trae más (hasta 6), se muestran todos, sin redondear.
  function precio(x) {
    var t = Fm.numero(x, 6);
    return t.replace(/(\.\d\d\d*?)0+$/, "$1");
  }

  // Puerto: "Callao (PECLL)".
  function puerto(p) {
    if (!p) { return "—"; }
    return (p.nombre || "—") + (p.locode ? " (" + p.locode + ")" : "");
  }

  // ---------------------------------------------------------------- Importe en letras (español)
  // Convierte un monto ya calculado (decimal fijo con 2 decimales) en el texto de la factura:
  // "SON: VEINTE MIL CUARENTA Y 00/100 DÓLARES AMERICANOS". No redondea: lee los centavos tal cual.
  var UNIDADES = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE",
    "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS",
    "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
  var DECENAS = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  var CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS",
    "OCHOCIENTOS", "NOVECIENTOS"];

  // 0–999. apocope: "UN" en lugar de "UNO" delante de MIL o MILLONES ("VEINTIÚN MIL", "TREINTA Y UN MIL").
  function hasta999(n, apocope) {
    if (n === 100) { return "CIEN"; }
    var c = Math.floor(n / 100), r = n % 100, partes = [];
    if (c) { partes.push(CENTENAS[c]); }
    if (r) {
      var t;
      if (r < 30) { t = UNIDADES[r]; }
      else { t = DECENAS[Math.floor(r / 10)] + (r % 10 ? " Y " + UNIDADES[r % 10] : ""); }
      if (apocope) { t = t.replace(/VEINTIUNO$/, "VEINTIÚN").replace(/UNO$/, "UN"); }
      partes.push(t);
    }
    return partes.join(" ");
  }

  // 0–999 999 (con apócope opcional en la última palabra).
  function hasta999999(n, apocope) {
    var miles = Math.floor(n / 1000), resto = n % 1000, partes = [];
    if (miles === 1) { partes.push("MIL"); }
    else if (miles > 1) { partes.push(hasta999(miles, true) + " MIL"); }
    if (resto) { partes.push(hasta999(resto, apocope)); }
    return partes.join(" ");
  }

  function enteroEnLetras(n) {
    if (n === 0) { return "CERO"; }
    var millones = Math.floor(n / 1000000), resto = n % 1000000, partes = [];
    if (millones === 1) { partes.push("UN MILLÓN"); }
    else if (millones > 1) { partes.push(hasta999999(millones, true) + " MILLONES"); }
    if (resto) { partes.push(hasta999999(resto, false)); }
    return partes.join(" ");
  }

  // x: decimal fijo de Calculos ({ v, d }); se leen sus centavos exactos (2 decimales).
  function enLetras(x, moneda) {
    var t = Fm.decimal(x, 2);                    // "20040.00": texto exacto, sin separador de miles
    var neg = t.charAt(0) === "-";
    if (neg) { t = t.slice(1); }
    var p = t.split(".");
    var entero = Number(p[0]);
    var nombre = moneda === "USD" || !moneda ? "DÓLARES AMERICANOS" : String(moneda);
    return "SON: " + (neg ? "MENOS " : "") + enteroEnLetras(entero) + " Y " + p[1] + "/100 " + nombre;
  }

  // ---------------------------------------------------------------- Partes (comunes a varios documentos)

  function idFiscal(parte) {
    if (!parte.idFiscal) { return "—"; }
    return (parte.pais === "PE" ? "RUC " : "") + parte.idFiscal;
  }

  // Bloque de una parte: nombre, dirección, ciudad y país, identificación fiscal. filasExtra: más filas.
  function parte(titulo, p, filasExtra) {
    return datos(titulo, [
      ["Nombre o razón social", "Name", p.razonSocial],
      ["Dirección", "Address", [p.direccion, p.ciudad].filter(Boolean).join(", ")],
      ["País", "Country", opcion("pais", p.pais)],
      ["Identificación fiscal", "Tax ID", idFiscal(p)]
    ].concat(filasExtra || []), "doc-parte");
  }

  // Consignatario según el tipo elegido (lista cerrada tipoConsignatario).
  function consignatario(ctx) {
    var c = ctx.op.generales.partes.consignatario, comp = ctx.op.generales.partes.comprador;
    if (c.tipo === "a_la_orden") {
      return { nombre: "A la orden de / To the order of: " + (c.razonSocial || "—"), direccion: c.direccion || "", tipo: c.tipo };
    }
    if (c.tipo === "otro") { return { nombre: c.razonSocial || "—", direccion: c.direccion || "", tipo: c.tipo }; }
    return { nombre: comp.razonSocial || "—", direccion: [comp.direccion, comp.ciudad, opcion("pais", comp.pais, true)].filter(function (x) { return x && x !== "—"; }).join(", "), tipo: "comprador" };
  }

  // Parte a notificar según el tipo elegido (lista cerrada tipoNotify).
  function notify(ctx) {
    var n = ctx.op.generales.partes.notify;
    if (n.tipo === "otro") { return { nombre: n.razonSocial || "—", direccion: n.direccion || "" }; }
    var c = consignatario(ctx);
    return { nombre: c.tipo === "a_la_orden" ? "— (B/L a la orden: indicar a quién notificar)" : c.nombre, direccion: c.tipo === "a_la_orden" ? "" : c.direccion, igual: true };
  }

  // Embarcador (shipper): el vendedor, salvo que se indique otro (B4).
  function embarcador(ctx) {
    var t = ctx.op.especificos.transporte, v = ctx.op.generales.partes.vendedor;
    if (t.shipper) { return { nombre: t.shipper, direccion: "" }; }
    return { nombre: v.razonSocial || "—", direccion: [v.direccion, v.ciudad, opcion("pais", v.pais, true)].filter(function (x) { return x && x !== "—"; }).join(", ") };
  }

  // Clases de bulto distintas de la operación, en orden ("Caja de cartón"). No suma: los totales vienen de calculos.js.
  function clasesBulto(ctx) {
    var vistas = [];
    ctx.op.especificos.items.forEach(function (it) {
      var t = opcion("claseBulto", it.claseBulto, true);
      if (vistas.indexOf(t) === -1) { vistas.push(t); }
    });
    return vistas.join(", ");
  }

  // Contenedor: "EJMU2610147 · 22G1 — 20' DV (dry van)".
  function contenedor(ctx) {
    var c = ctx.op.especificos.contenedor;
    return { numero: c.numero || "—", tipo: opcion("tipoContenedor", c.tipo), precinto: c.precinto || "—" };
  }

  // ---------------------------------------------------------------- Marco de la hoja

  // Crea la hoja A4 de un documento con su marco. Devuelve { hoja, cuerpo }.
  // def: plantilla; ctx: contexto; subtitulo: texto bajo el título (N° y fecha, por ejemplo).
  function hoja(def, ctx, subtitulo) {
    var a = el("article", "hoja-doc");
    a.setAttribute("data-doc", def.id);
    a.setAttribute("aria-label", def.es + " / " + def.en);
    var agua = el("div", "doc-marca-agua", "DOCUMENTO DIDÁCTICO · NO VÁLIDO");
    agua.setAttribute("aria-hidden", "true");
    a.appendChild(agua);
    a.appendChild(el("p", "doc-aviso", "DOCUMENTO DIDÁCTICO – NO VÁLIDO PARA TRÁMITES REALES"));
    var cab = el("header", "doc-cab");
    var h = el("h3", "doc-titulo");
    h.appendChild(document.createTextNode(def.titulo || def.es.toUpperCase()));
    h.appendChild(el("span", "en", " / " + (def.tituloEn || def.en.toUpperCase())));
    cab.appendChild(h);
    if (subtitulo) { cab.appendChild(el("p", "doc-sub", subtitulo)); }
    a.appendChild(cab);
    var cuerpo = el("div", "doc-cuerpo");
    a.appendChild(cuerpo);
    var pie = el("footer", "doc-pie");
    pie.appendChild(document.createTextNode("Referencia de la operación / Reference: " + (ctx.op.meta.referencia || "(sin referencia)") +
      " · Generado / Generated: " + ctx.generado + " · " + def.es + " · Datos ficticios, uso didáctico"));
    a.appendChild(pie);
    return { hoja: a, cuerpo: cuerpo };
  }

  // Texto del pie de cada página impresa (lo usa pantalla.js para el recuadro de margen de @page).
  function textoPie(ctx) {
    return "Ref. " + (ctx.op.meta.referencia || "(sin referencia)") + " · Generado: " + ctx.generado + " · Documento didáctico, no válido para trámites reales";
  }

  // ---------------------------------------------------------------- Generación

  // ¿Se pueden generar los documentos? Con errores (o cálculo en pausa, E20) no se generan (PLAN §7).
  function bloqueados(revision) {
    return !revision || Validaciones.hayErrores(revision) || !!revision.detenida;
  }

  // Contexto de las plantillas. fecha: Date de generación (por defecto, ahora).
  function contexto(op, resultado, revision, fechaGen) {
    return { op: op, r: resultado, rv: revision, generado: fechaHora(fechaGen || new Date()), generados: [] };
  }

  // Genera todos los documentos registrados, en orden. Devuelve { bloqueado, motivo, docs: [{ def, hoja }] }.
  // La hoja resumen (registrada al final) recibe en ctx.generados los documentos anteriores para leer sus cifras.
  function generar(op, resultado, revision, fechaGen) {
    if (bloqueados(revision) || !resultado) {
      var n = revision && revision.errores ? revision.errores.length : 0;
      return { bloqueado: true, docs: [], errores: n, detenida: !!(revision && revision.detenida) };
    }
    var ctx = contexto(op, resultado, revision, fechaGen);
    registro.forEach(function (def) {
      if (def.aplica && !def.aplica(ctx)) { return; }
      ctx.generados.push({ def: def, hoja: def.generar(ctx) });
    });
    return { bloqueado: false, docs: ctx.generados, ctx: ctx };
  }

  // Cifras de cuadre que muestra una hoja: { clave: texto }. Si una clave aparece varias veces con textos
  // distintos, se devuelve "≠" (el propio documento no cuadra consigo mismo).
  function cifras(hojaDoc) {
    var res = {};
    Array.prototype.forEach.call(hojaDoc.querySelectorAll("[data-cuadre]"), function (n) {
      var k = n.getAttribute("data-cuadre"), t = n.textContent;
      res[k] = k in res && res[k] !== t ? "≠" : t;
    });
    return res;
  }

  return {
    registrar: registrar, lista: lista, generar: generar, cifras: cifras, bloqueados: bloqueados, textoPie: textoPie,
    // utilidades para las plantillas
    el: el, rotulo: rotulo, etiquetaMarca: etiquetaMarca, marcaDato: marcaDato, marcaEfectiva: marcaEfectiva, etiquetaEfectiva: etiquetaEfectiva,
    conMarca: conMarca, puertoMarcado: puertoMarcado, sa6Marcado: sa6Marcado, subpartidaMarcada: subpartidaMarcada, estadoSubpartida: estadoSubpartida, hayPvSubpartida: hayPvSubpartida, cifra: cifra,
    datos: datos, filaDato: filaDato, ayuda: ayuda, advertencias: advertencias, avisoRevision: avisoRevision, tabla: tabla, hoja: hoja, parte: parte, idFiscal: idFiscal,
    listaAyudas: listaAyudas, consignatario: consignatario, notify: notify, embarcador: embarcador, clasesBulto: clasesBulto, contenedor: contenedor,
    fecha: fecha, fechaHora: fechaHora, enteroEnLetras: enteroEnLetras, opcion: opcion, sa6: sa6, precio: precio, puerto: puerto, enLetras: enLetras
  };
})();
