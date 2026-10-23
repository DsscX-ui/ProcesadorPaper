/* Modelo de datos de una operación: estructura vacía, lectura por ruta,
   Guardar (descarga .json) y Abrir (selector de archivos) con revisión estricta.
   Solo guarda datos ingresados; lo derivado (totales, FOB, tributos…) lo calcula js/calculos.js.
   Script clásico: deja el objeto global Modelo. */

var Modelo = (function () {
  var FORMATO = "procesador-paper/operacion";
  // Versión 3: masa VGM pesada, temperatura y ventilación; Abrir migra los archivos v2.
  var VERSION = 3;

  // Límites al abrir un archivo (PLAN.md §11, decisión M7). Evitan bloquear la pestaña.
  var LIMITES = {
    bytes: 2 * 1024 * 1024,   // 2 MB
    items: 200,
    equiposPorItem: 10000,
    imeisPorEquipo: 4,
    profundidad: 12,
    largoTexto: 5000,
    marcas: 5000
  };

  // Límites de cada dato numérico (F3-M4): [valor absoluto máximo, decimales máximos, mínimo opcional]. Los usan Abrir
  // y Calculos.calcular, así ninguna cifra sale del rango de enteros exactos de JavaScript (±2^53 − 1)
  // ni se redondea en silencio. Además, el valor total de la factura no puede superar USD 1,000,000,000
  // (lo comprueba calculos.js). Se aplican por nombre del dato (última parte de la ruta).
  var MONTO = [1000000000, 2, 0], PCT = [1000, 4, 0], TRIBUTO = [1000000000, 3, 0];
  var LIMITES_NUMERO = {
    // Sin mínimo: los datos del ítem siguen con E07 y tipoCambio sigue con E15.
    cantidad: [1000000, 3], precioUnitario: [1000000, 6], unidadesPorBulto: [1000000, 3],
    pesoNetoBulto: [100000, 2], pesoBrutoBulto: [100000, 2],
    largoCm: [10000, 1], anchoCm: [10000, 1], altoCm: [10000, 1],
    tara: [100000, 2, 0], estibaTrincaje: [100000, 2, 0], blOriginales: [100, 0, 0],
    vgmMasaPesada: [100000, 2, 0], temperaturaC: [100, 1], // la temperatura admite negativos
    tasaAV: PCT, tasaPercepcion: PCT, coberturaPct: PCT, tasaPrimaPct: PCT, pctTablaSunat: PCT, porcentaje: [100, 4, 0],
    plazoDias: [10000, 0, 0], tipoCambio: [1000, 3],
    sobretasa: TRIBUTO, derechoEspecifico: TRIBUTO, isc: TRIBUTO, antidumping: TRIBUTO,
    flete: MONTO, gastosExw815: MONTO, otros816: MONTO, ajuste812: MONTO, ajuste813: MONTO,
    descuentosNoAceptables814: MONTO, comisiones821: MONTO, envases822: MONTO, materiales8231: MONTO,
    herramientas8232: MONTO, consumidos8233: MONTO, ingenieria8234: MONTO, canones824: MONTO,
    reversion825: MONTO, gastosDestino832: MONTO, posteriores851: MONTO, montaje852: MONTO,
    tributos853: MONTO, intereses854: MONTO, otros855: MONTO, expOtrosDeducibles: MONTO, expAjustes: MONTO
  };
  var MAX_FACTURA_USD = 1000000000;

  // Cantidad de decimales con que está escrito un número (0.3 → 1; 1e-7 → 7; 1.5e-21 → 22).
  // Se cuentan desde la mantisa y el exponente de String(n), sin redondear antes (F31-B1):
  // toFixed(20) convertía 1e-21 en 0 y lo dejaba pasar.
  function decimalesDe(n) {
    var m = /^(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/.exec(String(Math.abs(n)));
    if (!m) { return Infinity; }
    var frac = m[2] || "", exp = m[3] ? Number(m[3]) : 0;
    return Math.max(0, frac.length - exp);
  }

  // Revisa un dato numérico contra su límite. Devuelve "" si está bien o el problema en español.
  function revisarNumero(clave, valor) {
    if (valor === null || valor === undefined) { return ""; }
    if (typeof valor !== "number" || !isFinite(valor)) { return "número no válido"; }
    var lim = LIMITES_NUMERO[clave];
    if (!lim) { return ""; }
    if (lim[2] != null && valor < lim[2]) {
      return "el valor " + valor + " es negativo; debe ser " + lim[2] + " o mayor";
    }
    if (Math.abs(valor) > lim[0]) {
      return "el valor " + valor + " supera el máximo de " + lim[0].toLocaleString("en-US") + " que admite la herramienta";
    }
    if (decimalesDe(valor) > lim[1]) {
      return "tiene más de " + lim[1] + " decimales (" + valor + "); la herramienta no lo redondea en silencio";
    }
    return "";
  }

  function parte() {
    return { razonSocial: "", direccion: "", ciudad: "", pais: "", idFiscal: "", ubigeo: "" };
  }

  function operacionVacia() {
    return {
      formato: FORMATO,
      version: VERSION,
      meta: { referencia: "", descripcion: "", ficticio: true },
      generales: {
        operacion: { tipo: "importacion", modalidadCarga: "FCL" },
        partes: {
          vendedor: Object.assign(parte(), { telefono: "", correo: "", condicion: "" }),
          comprador: parte(),
          consignatario: { tipo: "comprador", razonSocial: "", direccion: "" },
          notify: { tipo: "consignatario", razonSocial: "", direccion: "" },
          naviera: { nombre: "" },
          agenteMaritimo: { razonSocial: "", ruc: "" },
          agenteAduana: { razonSocial: "", ruc: "" },
          depositoTemporal: { razonSocial: "", ruc: "" },
          entidadFinanciera: { nombre: "", codigo: "" },
          aseguradora: { razonSocial: "", direccion: "" },
          productor: { razonSocial: "", direccion: "" },
          entidadCO: { nombre: "" }
        },
        ruta: {
          puertoEmbarque: { nombre: "", locode: "" },
          puertoDescarga: { nombre: "", locode: "" },
          paisAdquisicion: "",
          lugarRecepcion: "",
          lugarEntrega: ""
        },
        comercial: {
          incoterm: "", lugarConvenido: "", moneda: "USD",
          facturaNumero: "", facturaFecha: "",
          modalidadPago: "", condicionesPago: "", medioPago: "",
          pagoDiferido: { porcentaje: null, plazoDias: null, evento: "", fecha: "" },
          contrato: ""
        },
        aduana: {
          aduana: "", modalidadDespacho: "", tipoDespacho: "", numeroOrden: "", fechaFormulacion: "",
          tipoCambio: null, tipoCambioFecha: "", tipoCambioFuente: "", regionDestino: ""
        },
        valor: {
          nivelComercial: "", naturaleza: "", formaEnvio: "", tipoValor: "",
          intermediario: { hubo: "", nombre: "", direccion: "", ciudad: "", pais: "", tipo: "", contacto: "" },
          rubro7: {
            p7_1: "", p7_2: "", p7_3: "", p7_4: "", p7_5: "", p7_6: "", p7_7: "",
            p7_8: "", p7_9: "", p7_10: "", p7_11: "", p7_12: "", p7_13: "", p7_14: ""
          }
        }
      },
      especificos: {
        items: [],
        marcasEmbarque: "",
        contenedor: {
          tipo: "", numero: "", precinto: "", tara: null, estibaTrincaje: 0,
          vgmMetodo: "", vgmResponsable: "", vgmFecha: "",
          vgmMasaPesada: null, temperaturaC: null, ventilacion: ""
        },
        transporte: {
          nave: "", viaje: "", booking: "",
          blNumero: "", blTipo: "", blOriginales: 3, blLugarEmision: "", blFechaEmision: "",
          fechaShippedOnBoard: "", clausulaSlac: false, clausulaStc: false, shipper: "",
          fleteBl: "",
          manifiesto: "", fechaEmbarque: "", fechaTerminoEmbarque: "", eta: "", fechaTerminoDescarga: ""
        },
        seguro: {
          hay: false, tipoPoliza: "", poliza: "", certificado: "", fechaEmision: "",
          clausulas: "", guerra: false, huelgas: false, coberturaPct: 110, tasaPrimaPct: null,
          lugarPagoSiniestros: "", agenteReclamos: "", pctTablaSunat: null
        },
        origen: { solicitaPreferencia: false, acuerdo: "", criterio: "", certificadoNumero: "", certificadoFecha: "" },
        valoracion: {
          flete: null,
          gastosExw815: 0, otros816: 0,
          ajuste812: 0, ajuste813: 0, descuentosNoAceptables814: 0,
          comisiones821: 0, envases822: 0, materiales8231: 0, herramientas8232: 0,
          consumidos8233: 0, ingenieria8234: 0, canones824: 0, reversion825: 0,
          gastosDestino832: 0,
          posteriores851: 0, montaje852: 0, tributos853: 0, intereses854: 0, otros855: 0,
          expOtrosDeducibles: 0, expAjustes: 0
        },
        // Un solo valor por operación (decisiones D2 y D6): depende del importador y,
        // en algunos casos, de la mercancía; PV-01.
        tributos: { tasaPercepcion: null }
      },
      // Marcas del dato concreto: ruta -> { marca: "S" | "H" | "H*" | "PV", nota }.
      marcas: {}
    };
  }

  function itemVacio() {
    return {
      nombre: "", descripcion: "", marca: "", modelo: "",
      subpartida: "", subpartidaVerificada: false,
      paisOrigen: "", ubigeoOrigen: "", estado: "10",
      cantidad: null, unidadComercial: "U", unidadFisica: "U", precioUnitario: null,
      // Ítem objeto de ajuste (IT C 5.10): recibe parte de los ajustes de B 8.1.2–8.2.5.
      objetoAjuste: true,
      // Un registro por equipo (decisión D9; RS129 art. 1): número de serie y uno o más IMEI.
      equipos: [],
      claseBulto: "", unidadesPorBulto: null, pesoNetoBulto: null, pesoBrutoBulto: null,
      largoCm: null, anchoCm: null, altoCm: null,
      tasaAV: null, sobretasa: 0, derechoEspecifico: 0, isc: 0, antidumping: 0,
      tpi: "", tipoA720: ""
    };
  }

  function equipoVacio() {
    return { serie: "", imeis: [] };
  }

  function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Lee un valor por ruta con puntos: "generales.partes.vendedor.razonSocial" o "especificos.items.0.nombre".
  function leer(obj, ruta) {
    var partes = ruta.split(".");
    var actual = obj;
    for (var i = 0; i < partes.length; i++) {
      if (actual == null || typeof actual !== "object") { return undefined; }
      if (!Object.prototype.hasOwnProperty.call(actual, partes[i])) { return undefined; }
      actual = actual[partes[i]];
    }
    return actual;
  }

  // Recorre las hojas y devuelve [{ ruta, valor }]. Las listas de ítems se recorren;
  // las demás listas (equipos) cuentan como una sola hoja.
  function hojas(obj, prefijo, salida) {
    salida = salida || [];
    Object.keys(obj).forEach(function (clave) {
      var valor = obj[clave];
      var ruta = prefijo ? prefijo + "." + clave : clave;
      if (Array.isArray(valor)) {
        if (clave === "items") {
          valor.forEach(function (el, i) { hojas(el, ruta + "." + i, salida); });
        } else {
          salida.push({ ruta: ruta, valor: valor });
        }
      } else if (valor !== null && typeof valor === "object") {
        hojas(valor, ruta, salida);
      } else {
        salida.push({ ruta: ruta, valor: valor });
      }
    });
    return salida;
  }

  // Texto JSON con las claves ordenadas: el mismo contenido da siempre el mismo texto.
  function jsonCanonico(valor) {
    if (Array.isArray(valor)) {
      return "[" + valor.map(jsonCanonico).join(",") + "]";
    }
    if (valor !== null && typeof valor === "object") {
      return "{" + Object.keys(valor).sort().map(function (k) {
        return JSON.stringify(k) + ":" + jsonCanonico(valor[k]);
      }).join(",") + "}";
    }
    return JSON.stringify(valor);
  }

  // Huella corta del contenido (FNV-1a de 32 bits). Es una comprobación rápida, no una garantía:
  // dos contenidos distintos podrían compartir huella (es poco probable). Para una comparación
  // completa se usa iguales(), que compara el texto canónico entero.
  function huella(operacion) {
    var texto = jsonCanonico(operacion);
    var h = 0x811c9dc5;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8).toUpperCase();
  }

  function iguales(a, b) {
    return jsonCanonico(a) === jsonCanonico(b);
  }

  // ---------------------------------------------------------------- Revisión del archivo

  function tipoDe(v) {
    if (v === null) { return "null"; }
    if (Array.isArray(v)) { return "lista"; }
    return typeof v; // string, number, boolean, object
  }

  var NOMBRE_TIPO = { string: "texto", number: "número", boolean: "sí/no (true/false)", object: "bloque", lista: "lista", "null": "vacío (null)" };

  // Profundidad máxima del JSON, sin recursión (un archivo muy anidado no agota la pila).
  function profundidad(raiz) {
    var max = 0;
    var pila = [[raiz, 1]];
    while (pila.length) {
      var par = pila.pop();
      var v = par[0], n = par[1];
      if (v !== null && typeof v === "object") {
        if (n > max) { max = n; }
        if (n > LIMITES.profundidad) { return n; }
        var hijos = Array.isArray(v) ? v : Object.keys(v).map(function (k) { return v[k]; });
        for (var i = 0; i < hijos.length; i++) { pila.push([hijos[i], n + 1]); }
      }
    }
    return max;
  }

  // Compara un valor con su plantilla (el mismo dato en el modelo vacío).
  // Reglas: los bloques deben tener exactamente las mismas claves; los textos son texto,
  // los sí/no son booleanos y los números aceptan número o vacío (null).
  function revisarValor(plantilla, valor, ruta, errores) {
    if (errores.length >= 8) { return; }
    var tp = tipoDe(plantilla), tv = tipoDe(valor);

    if (tp === "string" || tp === "boolean") {
      if (tv !== tp) { errores.push(ruta + ": se esperaba " + NOMBRE_TIPO[tp] + " y llegó " + NOMBRE_TIPO[tv]); return; }
      if (tp === "string" && valor.length > LIMITES.largoTexto) {
        errores.push(ruta + ": el texto supera " + LIMITES.largoTexto + " caracteres");
      }
      return;
    }
    if (tp === "number" || tp === "null") {
      if (tv !== "number" && tv !== "null") { errores.push(ruta + ": se esperaba un número o vacío y llegó " + NOMBRE_TIPO[tv]); return; }
      if (tv === "number") {
        var problema = revisarNumero(ruta.split(".").pop(), valor);
        if (problema) { errores.push(ruta + ": " + problema); }
      }
      return;
    }
    if (tp === "object") {
      if (tv !== "object") { errores.push(ruta + ": se esperaba un bloque y llegó " + NOMBRE_TIPO[tv]); return; }
      Object.keys(plantilla).forEach(function (k) {
        if (!Object.prototype.hasOwnProperty.call(valor, k)) { errores.push((ruta ? ruta + "." : "") + k + ": falta"); }
      });
      Object.keys(valor).forEach(function (k) {
        var r = (ruta ? ruta + "." : "") + k;
        if (!Object.prototype.hasOwnProperty.call(plantilla, k)) { errores.push(r + ": campo desconocido"); return; }
        revisarValor(plantilla[k], valor[k], r, errores);
      });
      return;
    }
    // Listas: solo existen "items", "equipos" e "imeis"; cada una tiene su plantilla de elemento.
    if (tp === "lista") {
      if (tv !== "lista") { errores.push(ruta + ": se esperaba una lista y llegó " + NOMBRE_TIPO[tv]); return; }
      var clave = ruta.split(".").pop();
      var elemento, limite;
      if (clave === "items") { elemento = itemVacio(); limite = LIMITES.items; }
      else if (clave === "equipos") { elemento = equipoVacio(); limite = LIMITES.equiposPorItem; }
      else if (clave === "imeis") { elemento = ""; limite = LIMITES.imeisPorEquipo; }
      else { errores.push(ruta + ": lista no prevista"); return; }
      if (valor.length > limite) {
        errores.push(ruta + ": tiene " + valor.length + " elementos; el máximo es " + limite);
        return;
      }
      for (var i = 0; i < valor.length && errores.length < 8; i++) {
        if (valor[i] === null) { errores.push(ruta + "." + i + ": elemento vacío (null)"); continue; }
        revisarValor(elemento, valor[i], ruta + "." + i, errores);
      }
    }
  }

  // Marcas propias de los datos: { ruta: { marca, nota } }, con rutas que existan en la operación.
  function revisarMarcas(datos, errores) {
    var m = datos.marcas;
    if (tipoDe(m) !== "object") { errores.push("marcas: se esperaba un bloque"); return; }
    var claves = Object.keys(m);
    if (claves.length > LIMITES.marcas) { errores.push("marcas: hay más de " + LIMITES.marcas); return; }
    for (var i = 0; i < claves.length && errores.length < 8; i++) {
      var k = claves[i], v = m[k];
      if (tipoDe(v) !== "object" || ["S", "H", "H*", "PV"].indexOf(v.marca) === -1 || typeof v.nota !== "string" ||
          Object.keys(v).some(function (x) { return x !== "marca" && x !== "nota"; })) {
        errores.push("marcas." + k + ": debe ser { marca: S | H | H* | PV, nota: texto }");
        continue;
      }
      // La nota es un texto más: mismo límite que cualquier texto de la operación (F21-B1).
      if (v.nota.length > LIMITES.largoTexto) {
        errores.push("marcas." + k + ".nota: el texto supera " + LIMITES.largoTexto + " caracteres");
        continue;
      }
      var dato = leer(datos, k);
      if (dato === undefined || (dato !== null && typeof dato === "object" && !Array.isArray(dato))) {
        errores.push("marcas." + k + ": la ruta no corresponde a un dato de la operación");
      }
    }
  }

  // Comprueba que un objeto leído de un archivo es una operación completa y bien formada.
  // Devuelve "" si está bien, o un texto con el problema (en español).
  function revisarArchivo(datos) {
    if (tipoDe(datos) !== "object") {
      return "El archivo no contiene una operación (se esperaba un bloque { … }).";
    }
    if (datos.formato !== FORMATO) {
      return "El archivo no es una operación de esta herramienta (falta o no coincide el campo 'formato').";
    }
    if (datos.version !== VERSION) {
      return "El archivo es de la versión " + String(datos.version) + " y esta herramienta lee las versiones 2 (la actualiza) y 3. Vuelve a guardar con una versión compatible.";
    }
    var p = profundidad(datos);
    if (p > LIMITES.profundidad) {
      return "El archivo está anidado en más de " + LIMITES.profundidad + " niveles; no es una operación de esta herramienta.";
    }
    var plantilla = operacionVacia();
    var errores = [];
    // Primero los bloques obligatorios, para dar un mensaje claro si falta uno entero.
    var faltan = ["meta", "generales", "especificos", "marcas"].filter(function (k) { return tipoDe(datos[k]) !== "object"; });
    if (faltan.length) {
      return "Al archivo le faltan bloques obligatorios o no son bloques: " + faltan.join(", ") + ".";
    }
    var marcas = plantilla.marcas;
    delete plantilla.marcas;
    var sinMarcas = Object.assign({}, datos);
    delete sinMarcas.marcas;
    revisarValor(plantilla, sinMarcas, "", errores);
    plantilla.marcas = marcas;
    if (!errores.length) {
      var equipos = 0;
      datos.especificos.items.forEach(function (it) { equipos += it.equipos.length; });
      if (equipos > LIMITES.equiposPorItem * 2) {
        errores.push("especificos.items: " + equipos + " equipos en total; el máximo es " + LIMITES.equiposPorItem * 2);
      }
    }
    if (!errores.length) { revisarMarcas(datos, errores); }
    if (errores.length) {
      return "El archivo no tiene la estructura esperada (" + errores.length + (errores.length >= 8 ? " o más" : "") +
        " problema(s)): " + errores.slice(0, 5).join("; ") + (errores.length > 5 ? "; …" : "") + ".";
    }
    return "";
  }

  function nombreArchivo(operacion) {
    var ref = (operacion.meta && operacion.meta.referencia) || "operacion";
    return ref.replace(/[^A-Za-z0-9_-]+/g, "_") + ".json";
  }

  function bytesUtf8(texto) { return new TextEncoder().encode(texto).length; }

  // Nunca ofrece una descarga que Abrir rechazaría por estructura o tamaño en UTF-8.
  function textoParaGuardar(operacion) {
    try {
      var problema = revisarArchivo(operacion);
      if (problema) { return { texto: "", compacto: false, error: problema }; }
      var texto = JSON.stringify(operacion, null, 2);
      if (bytesUtf8(texto) <= LIMITES.bytes) { return { texto: texto, compacto: false, error: "" }; }
      texto = JSON.stringify(operacion);
      if (bytesUtf8(texto) <= LIMITES.bytes) { return { texto: texto, compacto: true, error: "" }; }
      return { texto: "", compacto: true, error: "La operación supera 2 MB incluso en JSON compacto; reduce equipos o ítems antes de guardar." };
    } catch (e) {
      return { texto: "", compacto: false, error: "No se pudo preparar el archivo: " + e.message };
    }
  }

  // Descarga la operación como archivo .json.
  function guardar(operacion) {
    var salida = textoParaGuardar(operacion);
    if (salida.error) { throw new Error(salida.error); }
    var blob = new Blob([salida.texto], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo(operacion);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    return enlace.download;
  }

  // Un único salto de esquema; no completa bloques faltantes ni corrige datos mal formados.
  function migrar(datos) {
    var nuevo = clonar(datos), c = nuevo.especificos && nuevo.especificos.contenedor;
    if (tipoDe(c) === "object") {
      var campos = { vgmMasaPesada: null, temperaturaC: null, ventilacion: "" };
      Object.keys(campos).forEach(function (k) { if (!Object.prototype.hasOwnProperty.call(c, k)) { c[k] = campos[k]; } });
    }
    nuevo.version = VERSION;
    return nuevo;
  }

  // Interpreta el texto de un archivo. Devuelve { error, operacion }; nunca lanza excepciones.
  function interpretar(texto) {
    try {
      if (bytesUtf8(texto) > LIMITES.bytes) {
        return { error: "El archivo supera el tamaño máximo de 2 MB.", operacion: null };
      }
      var datos;
      try {
        datos = JSON.parse(texto.charCodeAt(0) === 0xFEFF ? texto.slice(1) : texto);
      } catch (e) {
        return { error: "El archivo no es un JSON válido (revisa comas, comillas y llaves).", operacion: null };
      }
      var aviso = "";
      if (datos && datos.formato === FORMATO && datos.version === 2) {
        datos = migrar(datos);
        aviso = "Archivo de la versión 2: se actualizó a la 3 al abrirlo. Guárdalo para conservar el formato nuevo.";
      }
      var error = revisarArchivo(datos);
      return error ? { error: error, operacion: null, aviso: "" } : { error: "", operacion: datos, aviso: aviso };
    } catch (e) {
      return { error: "No se pudo revisar el archivo: " + (e && e.message ? e.message : String(e)) + ".", operacion: null };
    }
  }

  // Lee un archivo elegido por el usuario. alTerminar(error, operacion, aviso).
  function abrir(archivo, alTerminar) {
    if (archivo.size > LIMITES.bytes) {
      alTerminar("El archivo pesa " + (archivo.size / 1048576).toFixed(1) + " MB; el máximo es 2 MB.", null);
      return;
    }
    var lector = new FileReader();
    lector.onload = function () {
      var r = interpretar(String(lector.result));
      alTerminar(r.error, r.operacion, r.aviso);
    };
    lector.onerror = function () { alTerminar("No se pudo leer el archivo.", null); };
    lector.readAsText(archivo, "UTF-8");
  }

  return {
    formato: FORMATO,
    version: VERSION,
    limites: LIMITES,
    limitesNumero: LIMITES_NUMERO,
    maxFacturaUsd: MAX_FACTURA_USD,
    revisarNumero: revisarNumero,
    operacionVacia: operacionVacia,
    itemVacio: itemVacio,
    equipoVacio: equipoVacio,
    clonar: clonar,
    leer: leer,
    hojas: hojas,
    jsonCanonico: jsonCanonico,
    huella: huella,
    iguales: iguales,
    revisarArchivo: revisarArchivo,
    interpretar: interpretar,
    bytesUtf8: bytesUtf8,
    textoParaGuardar: textoParaGuardar,
    guardar: guardar,
    abrir: abrir
  };
})();
