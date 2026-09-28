/* Modelo de datos de una operación: estructura vacía, lectura/escritura por ruta,
   Guardar (descarga .json) y Abrir (selector de archivos).
   Solo guarda datos ingresados; lo derivado (totales, FOB, tributos…) se calcula en F3.
   Script clásico: deja el objeto global Modelo. */

var Modelo = (function () {
  var FORMATO = "procesador-paper/operacion";
  var VERSION = 1;

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
          vgmMetodo: "", vgmResponsable: "", vgmFecha: ""
        },
        transporte: {
          nave: "", viaje: "", booking: "",
          blNumero: "", blTipo: "", blOriginales: 3, blLugarEmision: "", blFechaEmision: "",
          fechaShippedOnBoard: "", clausulaSlac: false, clausulaStc: false, shipper: "",
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
          comisiones821: 0, envases822: 0, materiales8231: 0, herramientas8232: 0,
          consumidos8233: 0, ingenieria8234: 0, canones824: 0, reversion825: 0,
          gastosDestino832: 0,
          posteriores851: 0, montaje852: 0, tributos853: 0, intereses854: 0, otros855: 0,
          expOtrosDeducibles: 0, expAjustes: 0
        }
      },
      // Marcas del dato concreto: ruta -> { marca: "S" | "H*" | "PV", nota }.
      marcas: {}
    };
  }

  function itemVacio() {
    return {
      nombre: "", descripcion: "", marca: "", modelo: "",
      subpartida: "", subpartidaVerificada: false,
      paisOrigen: "", ubigeoOrigen: "", estado: "10",
      cantidad: null, unidadComercial: "U", unidadFisica: "U", precioUnitario: null,
      series: [], imeis: [],
      claseBulto: "", unidadesPorBulto: null, pesoNetoBulto: null, pesoBrutoBulto: null,
      largoCm: null, anchoCm: null, altoCm: null,
      tasaAV: null, sobretasa: 0, derechoEspecifico: 0, isc: 0, antidumping: 0,
      tpi: "", tipoA720: "", tasaPercepcion: null
    };
  }

  function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Lee un valor por ruta con puntos: "generales.partes.vendedor.razonSocial" o "especificos.items.0.nombre".
  function leer(obj, ruta) {
    var partes = ruta.split(".");
    var actual = obj;
    for (var i = 0; i < partes.length; i++) {
      if (actual == null) { return undefined; }
      actual = actual[partes[i]];
    }
    return actual;
  }

  // Recorre las hojas (valores que no son objetos) y devuelve [{ ruta, valor }].
  // Las listas simples (series, imeis) cuentan como una hoja; la lista de ítems se recorre.
  function hojas(obj, prefijo, salida) {
    salida = salida || [];
    Object.keys(obj).forEach(function (clave) {
      var valor = obj[clave];
      var ruta = prefijo ? prefijo + "." + clave : clave;
      if (Array.isArray(valor)) {
        if (valor.length && typeof valor[0] === "object" && valor[0] !== null) {
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

  // Huella corta del contenido (FNV-1a de 32 bits). Si dos operaciones tienen la misma huella,
  // sus datos son iguales. Sirve para comprobar Guardar → Abrir.
  function huella(operacion) {
    var texto = jsonCanonico(operacion);
    var h = 0x811c9dc5;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8).toUpperCase();
  }

  // Comprueba que un objeto leído de un archivo es una operación de esta herramienta.
  function revisarArchivo(datos) {
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      return "El archivo no contiene una operación.";
    }
    if (datos.formato !== FORMATO) {
      return "El archivo no es una operación de esta herramienta (falta el campo 'formato').";
    }
    if (datos.version !== VERSION) {
      return "El archivo es de la versión " + datos.version + " y esta herramienta lee la versión " + VERSION + ".";
    }
    if (!datos.generales || !datos.especificos || !Array.isArray(datos.especificos.items)) {
      return "Al archivo le faltan los bloques 'generales', 'especificos' o la lista de ítems.";
    }
    // Las rutas del archivo deben existir en el modelo (evita datos que la herramienta ignoraría).
    var base = operacionVacia();
    var item = itemVacio();
    var desconocidas = hojas(datos, "").map(function (h) { return h.ruta; }).filter(function (ruta) {
      if (ruta.indexOf("marcas.") === 0) { return false; }
      var m = ruta.match(/^especificos\.items\.\d+\.(.+)$/);
      if (m) { return !(m[1] in item); }
      return leer(base, ruta) === undefined;
    });
    if (desconocidas.length) {
      return "El archivo trae campos que esta herramienta no conoce: " + desconocidas.slice(0, 5).join(", ") +
        (desconocidas.length > 5 ? "…" : "") + ".";
    }
    return "";
  }

  function nombreArchivo(operacion) {
    var ref = (operacion.meta && operacion.meta.referencia) || "operacion";
    return ref.replace(/[^A-Za-z0-9_-]+/g, "_") + ".json";
  }

  // Descarga la operación como archivo .json.
  function guardar(operacion) {
    var texto = JSON.stringify(operacion, null, 2);
    var blob = new Blob([texto], { type: "application/json;charset=utf-8" });
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

  // Lee un archivo elegido por el usuario. alTerminar(error, operacion).
  function abrir(archivo, alTerminar) {
    var lector = new FileReader();
    lector.onload = function () {
      var datos;
      try {
        datos = JSON.parse(String(lector.result));
      } catch (e) {
        alTerminar("El archivo no es un JSON válido.", null);
        return;
      }
      var error = revisarArchivo(datos);
      alTerminar(error, error ? null : datos);
    };
    lector.onerror = function () { alTerminar("No se pudo leer el archivo.", null); };
    lector.readAsText(archivo, "UTF-8");
  }

  return {
    formato: FORMATO,
    version: VERSION,
    operacionVacia: operacionVacia,
    itemVacio: itemVacio,
    clonar: clonar,
    leer: leer,
    hojas: hojas,
    huella: huella,
    revisarArchivo: revisarArchivo,
    guardar: guardar,
    abrir: abrir
  };
})();
