/* Cálculos: ÚNICO lugar donde se calcula y se redondea (PLAN.md §2 y §6).
   - Aritmética en enteros: cada cifra es un "decimal fijo" { v, d } = v / 10^d (v entero; d decimales).
     Los productos y divisiones intermedios se hacen con BigInt, así no hay errores de coma flotante.
   - Redondeo: mitad hacia arriba, alejándose de cero (PLAN.md §6.1 [S]; método oficial: PV-08).
   - Prorrateo: cada parte se redondea y la diferencia (residuo) va a la última, para que la suma cuadre exacta.
   - calcular(operacion) devuelve un único objeto "resultado" congelado (inmutable). Las plantillas
     de documentos y la pantalla solo lo leen y le dan formato con Calculos.formato.
   Depende de NORMATIVA (tasas) e INCOTERMS (fórmulas y matriz).
   Script clásico: deja el objeto global Calculos. */

var Calculos = (function () {
  // ------------------------------------------------------------------ Decimal fijo y redondeo

  var B10 = BigInt(10);
  function pot10(n) { return B10 ** BigInt(n); }

  // División entera con redondeo "mitad hacia arriba" (alejándose de cero en negativos).
  function dividir(n, den) {
    if (den === BigInt(0)) { throw new Error("División entre cero"); }
    if (den < 0) { n = -n; den = -den; }
    var q = n / den, r = n % den;
    if (r < 0) { r = -r; }
    if (r * BigInt(2) >= den) { q += n < 0 ? BigInt(-1) : BigInt(1); }
    return q;
  }

  function fx(v, d) { return { v: v, d: d }; }

  // Paso de BigInt a Number solo dentro del rango de enteros exactos (±2^53 − 1). Fuera de él la cifra
  // perdería precisión en silencio, así que se rechaza con un mensaje claro (F3-M4). Los límites de
  // entrada de Modelo.limitesNumero evitan llegar aquí con datos razonables.
  var MAX_SEGURO = BigInt(Number.MAX_SAFE_INTEGER);
  function aNumero(b) {
    if (b > MAX_SEGURO || b < -MAX_SEGURO) {
      throw new Error("Una cifra sale del rango que la herramienta calcula con exactitud (" +
        "más de 9,007,199,254,740,991 en su unidad mínima). Revisa montos, cantidades y precios (límites: PLAN §6.1)");
    }
    return Number(b);
  }
  var CERO = fx(0, 0);

  function esCero(x) { return x.v === 0; }

  // Convierte un número o texto decimal a decimal fijo con d decimales, sin pasar por coma flotante.
  // Vacíos (null, "", undefined) cuentan como 0: los datos faltantes los señala la validación (F4).
  function aFijo(valor, d) {
    if (valor === null || valor === undefined || valor === "") { return fx(0, d); }
    var s = typeof valor === "number" ? numeroATexto(valor) : String(valor).trim();
    var m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(s);
    if (!m || (m[2] === "" && !m[3])) { throw new Error("Número no válido: " + s); }
    var frac = (m[3] || "");
    var entero = BigInt((m[2] || "0") + (frac + "0".repeat(d)).slice(0, d));
    if (frac.length > d && Number(frac.charAt(d)) >= 5) { entero += BigInt(1); }
    if (m[1] === "-") { entero = -entero; }
    return fx(aNumero(entero), d);
  }

  function numeroATexto(n) {
    if (!isFinite(n)) { throw new Error("Número no válido: " + n); }
    var s = String(n);
    if (s.indexOf("e") === -1) { return s; }
    return n.toFixed(20).replace(/0+$/, "").replace(/\.$/, "");
  }

  // Cambia la cantidad de decimales (redondea si se quitan).
  function escalar(x, d) {
    if (d === x.d) { return x; }
    if (d > x.d) { return fx(aNumero(BigInt(x.v) * pot10(d - x.d)), d); }
    return fx(aNumero(dividir(BigInt(x.v), pot10(x.d - d))), d);
  }

  function sumar() {
    var lista = Array.prototype.slice.call(arguments);
    if (lista.length === 1 && Array.isArray(lista[0])) { lista = lista[0]; }
    var d = lista.reduce(function (m, x) { return Math.max(m, x.d); }, 0);
    var v = BigInt(0);
    lista.forEach(function (x) { v += BigInt(escalar(x, d).v); });
    return fx(aNumero(v), d);
  }

  function restar(a, b) { return sumar(a, fx(-b.v, b.d)); }
  function negar(a) { return fx(-a.v, a.d); }

  // a × b, redondeado a d decimales.
  function multiplicar(a, b, d) {
    return fx(aNumero(dividir(BigInt(a.v) * BigInt(b.v) * pot10(d), pot10(a.d + b.d))), d);
  }

  // a × porcentaje / 100, redondeado a d decimales.
  function porcentaje(a, pct, d) {
    return fx(aNumero(dividir(BigInt(a.v) * BigInt(pct.v) * pot10(d), pot10(a.d + pct.d) * BigInt(100))), d);
  }

  // a ÷ b, redondeado a d decimales.
  function dividirFijo(a, b, d) {
    if (b.v === 0) { return null; }
    return fx(aNumero(dividir(BigInt(a.v) * pot10(d + b.d), BigInt(b.v) * pot10(a.d))), d);
  }

  function igual(a, b) { var d = Math.max(a.d, b.d); return escalar(a, d).v === escalar(b, d).v; }
  function comparar(a, b) { var d = Math.max(a.d, b.d); return Math.sign(escalar(a, d).v - escalar(b, d).v); }

  // Reparte "total" en proporción a "pesos" (decimales fijos). Cada parte se redondea a los decimales
  // de total; la última recibe el residuo. Si todos los pesos son 0, reparte en partes iguales.
  // Devuelve { partes, iguales } (iguales = true si se usó el reparto en partes iguales).
  function prorratear(total, pesos) {
    var n = pesos.length;
    if (!n) { return { partes: [], iguales: false }; }
    var dp = pesos.reduce(function (m, p) { return Math.max(m, p.d); }, 0);
    var w = pesos.map(function (p) { return BigInt(escalar(p, dp).v); });
    var W = w.reduce(function (s, x) { return s + x; }, BigInt(0));
    var iguales = W === BigInt(0);
    if (iguales) { w = w.map(function () { return BigInt(1); }); W = BigInt(n); }
    var T = BigInt(total.v), acumulado = BigInt(0), partes = [];
    for (var i = 0; i < n; i++) {
      var parte = i < n - 1 ? dividir(T * w[i], W) : T - acumulado;
      acumulado += parte;
      partes.push(fx(aNumero(parte), total.d));
    }
    if (partes[n - 1].v && Math.sign(partes[n - 1].v) !== Math.sign(total.v)) {
      // PV-08: solo si el residuo habitual invierte el signo, usar mayor residuo.
      // Truncar hacia cero y asignar unidades a los restos mayores; en empate, al índice mayor.
      var restos = [], truncadas = [], suma = BigInt(0);
      w.forEach(function (peso, i) {
        var numerador = T * peso, q = numerador / W, resto = numerador % W;
        truncadas.push(q); suma += q;
        restos.push({ i: i, resto: resto < BigInt(0) ? -resto : resto });
      });
      restos.sort(function (a, b) { return a.resto === b.resto ? b.i - a.i : (a.resto > b.resto ? -1 : 1); });
      var pendiente = T - suma, paso = pendiente < BigInt(0) ? BigInt(-1) : BigInt(1), j = 0;
      while (pendiente !== BigInt(0)) {
        truncadas[restos[j % n].i] += paso; pendiente -= paso; j++;
      }
      partes = truncadas.map(function (p) { return fx(aNumero(p), total.d); });
    }
    return { partes: partes, iguales: iguales };
  }

  // ------------------------------------------------------------------ Formato de números
  // Decisión D10 (PLAN.md §6.1 y §11): coma de miles y punto decimal ("20,040.00"; DAM A/C "18,123.870";
  // DAM B "21.705231"). Es la convención de las facturas comerciales en USD y de la DAM impresa en el Perú.
  var SEP_MILES = ",";

  // Texto canónico sin separador de miles ("18123.870"): para comparar en las pruebas.
  function decimal(x, dec) {
    var r = escalar(x, dec);
    var neg = r.v < 0;
    var s = String(Math.abs(r.v));
    if (dec > 0) {
      s = s.padStart(dec + 1, "0");
      s = s.slice(0, -dec) + "." + s.slice(-dec);
    }
    return (neg ? "-" : "") + s;
  }

  // Texto para mostrar: separador de miles y la cantidad de decimales pedida.
  function numero(x, dec) {
    var t = decimal(x, dec);
    var neg = t.charAt(0) === "-";
    if (neg) { t = t.slice(1); }
    var partes = t.split(".");
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, SEP_MILES);
    return (neg ? "−" : "") + partes.join(".");
  }

  // Cantidades: sin decimales si son enteras; si no, hasta 3 (IT IV.3).
  function cantidad(x) {
    var t = numero(x, Math.min(x.d, 3));
    return t.indexOf(".") === -1 ? t : t.replace(/\.?0+$/, "");
  }

  var formato = {
    separadorMiles: SEP_MILES,
    decimal: decimal,
    numero: numero,
    comercial: function (x) { return numero(x, 2); },   // documentos comerciales: 2 decimales [S]
    damAC: function (x) { return numero(x, 3); },       // DAM, Formatos A y C: 3 decimales [H: IT IV.3]
    damB: function (x) { return numero(x, 6); },        // DAM, Formato B: 6 decimales [H: IT IV.3]
    kg: function (x) { return numero(x, 2); },          // kg con 2 decimales [S]
    m3: function (x) { return numero(x, 3); },          // m³ con 3 decimales [S]
    m3Bulto: function (x) { return numero(x, igual(x, escalar(x, 3)) ? 3 : 6); },
    cantidad: cantidad,
    // Cantidades en la DAM, Formatos A y C (F8a.1): enteras sin decimales ("360"); no enteras con 3 decimales ("360.500") [H: IT IV.3].
    damCantidad: function (x) { var r = escalar(x, 3); return numero(r, r.v % 1000 === 0 ? 0 : 3); },
    // Cantidad del Formato B: entera sin decimales; no entera con 6 decimales [H: IT IV.3].
    damBCantidad: function (x) { var r = escalar(x, 6); return numero(r, r.v % 1000000 === 0 ? 0 : 6); },
    pct: function (x) { var t = numero(x, Math.min(x.d, 4)); return (t.indexOf(".") === -1 ? t : t.replace(/\.?0+$/, "")) + " %"; }
  };

  // ------------------------------------------------------------------ Utilidades de control

  // RUC: 11 dígitos; dígito verificador módulo 11 [H*; PV-18]. Prefijos usuales 10 y 20 (A09).
  function controlRuc(ruc) {
    var s = String(ruc == null ? "" : ruc);
    if (!/^\d{11}$/.test(s)) { return { valido: false, formato: false, motivo: "No tiene 11 dígitos numéricos." }; }
    var pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], suma = 0;
    for (var i = 0; i < 10; i++) { suma += Number(s.charAt(i)) * pesos[i]; }
    var dv = 11 - (suma % 11);
    if (dv === 10) { dv = 0; } else if (dv === 11) { dv = 1; }
    var prefijoUsual = /^(10|20)/.test(s);
    var ok = dv === Number(s.charAt(10));
    return {
      valido: ok, formato: true, digitoEsperado: dv, prefijoUsual: prefijoUsual,
      motivo: ok ? (prefijoUsual ? "" : "Prefijo distinto de 10 o 20.") : "El dígito verificador debería ser " + dv + "."
    };
  }

  // Contenedor: 4 letras + 6 dígitos + dígito de control ISO 6346 [H*].
  function controlContenedor(numero) {
    var s = String(numero == null ? "" : numero).replace(/[\s-]/g, "").toUpperCase();
    if (!/^[A-Z]{4}\d{7}$/.test(s)) { return { valido: false, formato: false, motivo: "Debe tener 4 letras y 7 dígitos." }; }
    var suma = 0;
    for (var i = 0; i < 10; i++) {
      var c = s.charAt(i);
      var v = i < 4 ? letraIso6346(c) : Number(c);
      suma += v * Math.pow(2, i);
    }
    var dv = (suma % 11) % 10;
    var ok = dv === Number(s.charAt(10));
    return { valido: ok, formato: true, digitoEsperado: dv, motivo: ok ? "" : "El dígito de control debería ser " + dv + "." };
  }

  // Valor de una letra en ISO 6346: A = 10, B = 12…; se saltan los múltiplos de 11 (11, 22, 33).
  function letraIso6346(c) {
    var v = 10;
    for (var k = 65; k < c.charCodeAt(0); k++) {
      v++;
      if (v % 11 === 0) { v++; }
    }
    return v;
  }

  // IMEI: 15 dígitos con dígito de control Luhn [H*] (A17).
  function controlImei(imei) {
    var s = String(imei == null ? "" : imei);
    if (!/^\d{15}$/.test(s)) { return { valido: false, formato: false, motivo: "No tiene 15 dígitos." }; }
    var dv = digitoLuhn(s.slice(0, 14));
    var ok = dv === Number(s.charAt(14));
    return { valido: ok, formato: true, digitoEsperado: dv, motivo: ok ? "" : "El dígito Luhn debería ser " + dv + "." };
  }

  function digitoLuhn(cuerpo) {
    var suma = 0;
    for (var i = 0; i < cuerpo.length; i++) {
      var n = Number(cuerpo.charAt(cuerpo.length - 1 - i));
      if (i % 2 === 0) { n *= 2; if (n > 9) { n -= 9; } }
      suma += n;
    }
    return (10 - (suma % 10)) % 10;
  }

  // UN/LOCODE: 2 letras de país + 3 caracteres (letras o dígitos 2–9) [H*] (E11).
  function controlLocode(codigo, pais) {
    var s = String(codigo == null ? "" : codigo).toUpperCase();
    if (!/^[A-Z]{2}[A-Z2-9]{3}$/.test(s)) { return { valido: false, motivo: "Debe tener 2 letras de país y 3 caracteres (letras o dígitos 2–9)." }; }
    if (pais && s.slice(0, 2) !== String(pais).toUpperCase()) {
      return { valido: false, motivo: "El país del código (" + s.slice(0, 2) + ") no es " + pais + "." };
    }
    return { valido: true, motivo: "" };
  }

  var control = { ruc: controlRuc, contenedor: controlContenedor, imei: controlImei, digitoLuhn: digitoLuhn, locode: controlLocode };

  // ------------------------------------------------------------------ Cálculo de la operación

  // Congela un objeto y todo lo que contiene.
  function congelar(o) {
    if (o && typeof o === "object" && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { congelar(o[k]); });
    }
    return o;
  }

  function pctNormativa(nombre) { return aFijo(NORMATIVA.valores[nombre].valor, 4); }

  // Rechaza datos numéricos fuera de los límites de entrada (F3-M4): mejor un mensaje claro que una cifra inexacta.
  function revisarEntrada(op) {
    Modelo.hojas(op, "").forEach(function (h) {
      if (typeof h.valor !== "number") { return; }
      var problema = Modelo.revisarNumero(h.ruta.split(".").pop(), h.valor);
      if (problema) { throw new Error("Dato fuera de rango en " + h.ruta + ": " + problema); }
    });
  }

  function calcular(op) {
    var avisos = [];
    // concepto: para los repartos en partes iguales (C01) indica qué se repartió (fob, flete, seguro, ajustes).
    function avisar(codigo, texto, concepto) { avisos.push({ codigo: codigo, texto: texto, concepto: concepto || "" }); }
    revisarEntrada(op);

    var tipo = op.generales.operacion.tipo;
    var esImportacion = tipo === "importacion";
    var incoterm = op.generales.comercial.incoterm;
    var regla = INCOTERMS.regla(incoterm);
    var val = op.especificos.valoracion;
    var seg = op.especificos.seguro;
    var cont = op.especificos.contenedor;

    // --- Mercancía y embalaje por ítem (§6.2)
    var siguienteBulto = 1;
    var items = op.especificos.items.map(function (it, i) {
      var cant = aFijo(it.cantidad, 3);
      var precio = aFijo(it.precioUnitario, 6);
      var valor = multiplicar(cant, precio, 2);                 // valor de línea, 2 decimales
      var porBulto = aFijo(it.unidadesPorBulto, 3);
      var bultos = 0, bultosExactos = true;
      if (porBulto.v > 0) {
        // Con los enteros exactos (milésimos) de cantidad y unidades por bulto, sin redondear antes (F3-M1).
        var nC = BigInt(cant.v), nP = BigInt(porBulto.v);
        if (nC > 0) {
          bultosExactos = nC % nP === BigInt(0);
          bultos = aNumero((nC + nP - BigInt(1)) / nP);          // techo de la división
          if (!bultosExactos) {
            avisar("E06", "Ítem " + (i + 1) + ": la cantidad no es múltiplo de las unidades por bulto; se redondea hacia arriba.");
          }
        }
      } else if (cant.v > 0) {
        avisar("E07", "Ítem " + (i + 1) + ": faltan las unidades por bulto.");
      }
      var nB = fx(bultos, 0);
      // Medidas exactas en cm³; un solo redondeo al convertir el volumen total de la línea a m³.
      var cm3 = multiplicar(multiplicar(aFijo(it.largoCm, 1), aFijo(it.anchoCm, 1), 2), aFijo(it.altoCm, 1), 3);
      var volBulto = dividirFijo(cm3, fx(1000000, 0), 6);              // hasta 6 decimales para mostrar
      var volumen = dividirFijo(multiplicar(cm3, nB, 3), fx(1000000, 0), 3);
      var desde = bultos ? siguienteBulto : 0, hasta = bultos ? siguienteBulto + bultos - 1 : 0;
      siguienteBulto += bultos;
      return {
        indice: i, numero: i + 1,
        cantidad: cant, precioUnitario: precio, valor: valor,
        bultos: bultos, bultoDesde: desde, bultoHasta: hasta,
        pesoNetoBulto: aFijo(it.pesoNetoBulto, 2), pesoBrutoBulto: aFijo(it.pesoBrutoBulto, 2),
        pesoNeto: multiplicar(aFijo(it.pesoNetoBulto, 2), nB, 2),
        pesoBruto: multiplicar(aFijo(it.pesoBrutoBulto, 2), nB, 2),
        volumenBulto: volBulto,
        volumen: volumen,
        objetoAjuste: it.objetoAjuste === true,
        bultosExactos: bultosExactos            // false: la cantidad no es múltiplo de las unidades por bulto (E06)
      };
    });

    // Tope del valor total de la factura (F3-M4): con él todas las cifras monetarias quedan en rango seguro.
    var sumaFactura = items.reduce(function (acc, x) { return acc + BigInt(x.valor.v); }, BigInt(0));
    if (sumaFactura > BigInt(Modelo.maxFacturaUsd) * BigInt(100) || sumaFactura < -BigInt(Modelo.maxFacturaUsd) * BigInt(100)) {
      throw new Error("El valor total de la factura supera USD 1,000,000,000, el máximo que admite la herramienta (PLAN §6.1)");
    }

    var totales = {
      valorFactura: sumar(items.map(function (x) { return x.valor; }).concat([fx(0, 2)])),
      bultos: items.reduce(function (s, x) { return s + x.bultos; }, 0),
      pesoNeto: sumar(items.map(function (x) { return x.pesoNeto; }).concat([fx(0, 2)])),
      pesoBruto: sumar(items.map(function (x) { return x.pesoBruto; }).concat([fx(0, 2)])),
      volumen: sumar(items.map(function (x) { return x.volumen; }).concat([fx(0, 3)]))
    };
    totales.numeracion = totales.bultos ? "1-" + totales.bultos : "—";

    // --- VGM (§6.7)
    var tara = aFijo(cont.tara, 2), estiba = aFijo(cont.estibaTrincaje, 2);
    var sumaVgm = sumar(totales.pesoBruto, estiba, tara);
    var pesada = cont.vgmMasaPesada == null ? null : aFijo(cont.vgmMasaPesada, 2);
    var vgm = { metodo: cont.vgmMetodo, pesoBruto: totales.pesoBruto, estiba: estiba, tara: tara,
      suma: sumaVgm, pesada: pesada, total: cont.vgmMetodo === "1" && pesada ? pesada : sumaVgm,
      diferencia: cont.vgmMetodo === "1" && pesada ? restar(pesada, sumaVgm) : null };

    // --- Flete prepaid/collect (D8)
    var fleteBl = {
      declarado: op.especificos.transporte.fleteBl || "",
      sugerido: regla ? regla.fleteBlUsual : "",
      coincide: !regla || !op.especificos.transporte.fleteBl || op.especificos.transporte.fleteBl === regla.fleteBlUsual
    };

    // --- Valores de la sección 8 del Formato B (USD, 2 decimales)
    var flete = aFijo(val.flete, 2);
    function casilla(c) { return aFijo(val[INCOTERMS.campoCasilla[c]], 2); }

    // --- Seguro (§6.4)
    var seguro = { hay: seg.hay === true, tipoSeguro: "1", base: fx(0, 2), baseExplicacion: "", coberturaPct: aFijo(seg.coberturaPct, 4),
      sumaAsegurada: fx(0, 2), tasaPrimaPct: aFijo(seg.tasaPrimaPct, 4), prima: fx(0, 2) };
    if (seguro.hay) {
      seguro.tipoSeguro = seg.tipoPoliza === "flotante" ? "3" : (seg.tipoPoliza === "individual" ? "2" : "");
      if (incoterm === "CIF" || incoterm === "CIP") {
        seguro.base = totales.valorFactura;
        seguro.baseExplicacion = "En " + incoterm + " la base es el valor de la factura (Vc) [H*: Incoterms® 2020].";
      } else {
        seguro.base = sumar(fobDesdeFormula(null).total, esImportacion ? flete : fx(0, 2));
        seguro.baseExplicacion = "Fuera de CIF y CIP la base es FOB + flete [S, editable].";
      }
      seguro.sumaAsegurada = porcentaje(seguro.base, seguro.coberturaPct, 2);
      seguro.prima = porcentaje(seguro.sumaAsegurada, seguro.tasaPrimaPct, 2);
    }

    // FOB total por Incoterm (IT C 5.9). prima = null mientras no se conoce (no la usa salvo CIF/CIP).
    function fobDesdeFormula(prima) {
      var formula = INCOTERMS.formulasFob[incoterm] || INCOTERMS.formulasFob.FOB;
      var terminos = formula.map(function (t) {
        var c = t[0], valor;
        if (c === "8.1.1") { valor = totales.valorFactura; }
        else if (c === "8.4") { valor = prima || fx(0, 2); }
        else { valor = casilla(c); }
        return { casilla: c, nombre: INCOTERMS.nombreCasilla[c], signo: t[1], valor: valor };
      });
      var total = sumar(terminos.map(function (t) { return t.signo > 0 ? t.valor : negar(t.valor); }));
      return { terminos: terminos, total: escalar(total, 2) };
    }

    // --- Desglose del precio en la factura comercial (F6, PLAN §5: «flete: desglose C/D»; «prima: desglose CIF/CIP»).
    // Solo en los grupos C y D: el precio pactado (Vc) incluye el flete (y en CIF/CIP la prima; en el grupo D,
    // además, los gastos en destino de 8.3.2). La primera línea es el resto del precio: Vc − lo incluido.
    function desgloseFactura() {
      if (!regla || (regla.grupo !== "C" && regla.grupo !== "D")) { return { lineas: [], total: totales.valorFactura }; }
      var incluidos = [{ id: "flete", es: "Flete internacional", en: "Ocean freight", valor: flete }];
      if (regla.seguroObligatorio) {
        incluidos.push({ id: "seguro", es: "Seguro (prima)", en: "Insurance (premium)", valor: seguro.prima });
      }
      if (regla.grupo === "D") {
        var gd = aFijo(val.gastosDestino832, 2);
        if (!esCero(gd)) { incluidos.push({ id: "gastosDestino", es: "Gastos en destino", en: "Destination charges", valor: gd }); }
      }
      var resto = escalar(restar(totales.valorFactura, sumar(incluidos.map(function (x) { return x.valor; }))), 2);
      var base = regla.codigo === "CFR" || regla.codigo === "CIF" ? { id: "base", es: "Valor FOB", en: "FOB value" } :
        (regla.codigo === "CPT" || regla.codigo === "CIP" ? { id: "base", es: "Valor FCA", en: "FCA value" } :
          { id: "base", es: "Valor de la mercancía", en: "Value of goods" });
      base.valor = resto;
      return { lineas: [base].concat(incluidos), total: totales.valorFactura };
    }

    var resultado = {
      version: 1,
      tipo: tipo,
      incoterm: incoterm,
      reglaIncoterm: regla,
      items: items,
      totales: totales,
      vgm: vgm,
      fleteBl: fleteBl,
      seguro: seguro,
      // Países de embarque y de destino (PLAN §4 C): prefijo del UN/LOCODE de cada puerto [H*]; vacío si el puerto no
      // tiene UN/LOCODE. Un solo cálculo: lo usan el Formato B (5.8), las series de exportación (S 7.27) y el
      // certificado de origen (F9, «país de destino»).
      ruta: {
        paisEmbarque: (op.generales.ruta.puertoEmbarque.locode || "").slice(0, 2),
        paisDestino: (op.generales.ruta.puertoDescarga.locode || "").slice(0, 2)
      },
      factura: { desglose: desgloseFactura() },
      avisos: avisos,
      repartosIguales: {}    // concepto → true si se repartió en partes iguales por base cero (C01)
    };

    if (!regla) { avisar("E02", "Incoterm vacío o fuera de los 11 de Incoterms® 2020; se usa la fórmula de FOB."); }

    if (esImportacion) {
      calcularImportacion(op, resultado, fobDesdeFormula, flete, casilla, avisar);
    } else {
      calcularExportacion(op, resultado, avisar);
    }
    // Las referencias a "regla" (de INCOTERMS) se copian para no congelar la tabla compartida.
    resultado.reglaIncoterm = regla ? JSON.parse(JSON.stringify(regla)) : null;
    return congelar(resultado);
  }

  // Agrupa ítems en series según una clave; conserva el orden de aparición (§6.5).
  function agrupar(items, clave) {
    var series = [], porClave = {};
    items.forEach(function (it, i) {
      var k = clave(i);
      if (!(k in porClave)) { porClave[k] = series.length; series.push({ numero: series.length + 1, clave: k, items: [] }); }
      series[porClave[k]].items.push(it.indice);
      it.serie = porClave[k] + 1;
    });
    return series;
  }

  // Parte de cada serie en el peso bruto y en el FOB (%, 2 decimales): explica por qué un reparto
  // por peso y otro por valor dan resultados distintos (PV-04).
  function participaciones(series, pesoBrutoTotal, fobTotal) {
    var cien = fx(100, 0);
    series.forEach(function (s) {
      s.pctPesoBruto = dividirFijo(multiplicar(s.pesoBruto, cien, 2), pesoBrutoTotal, 2) || fx(0, 2);
      s.pctFob = dividirFijo(multiplicar(s.fob, cien, 3), fobTotal, 2) || fx(0, 2);
    });
  }

  // F3-M3: si un reparto de un monto no nulo entre 2 o más partes cayó a partes iguales (base cero),
  // se avisa (C01) y se anota en r.repartosIguales para que la pantalla explique el criterio real.
  function vigilarReparto(rep, total, concepto, texto, r, avisar) {
    var iguales = rep.iguales && rep.partes.length > 1 && total.v !== 0;
    r.repartosIguales[concepto] = iguales;
    if (iguales) { avisar("C01", texto, concepto); }
  }

  function sumaDe(lista, campo, d) {
    return sumar(lista.map(function (x) { return x[campo]; }).concat([fx(0, d)]));
  }

  // F8a: cantidades de la serie para el Formato A. 7.10 = Σ cantidades comerciales, «aunque la unidad no sea la
  // misma en todos los ítems» [H: IT A 7.10]. 7.16 (cantidad física) solo se da si todos los ítems usan como
  // unidad física su misma unidad comercial; si no, queda null y la DAM la muestra POR VERIFICAR (PV-09).
  function cantidadesSerie(s, its, op) {
    var datos = s.items.map(function (i) { return op.especificos.items[i]; });
    s.cantidad = sumaDe(its, "cantidad", 3);
    var unidad = datos[0] ? datos[0].unidadFisica : "";
    var mismas = datos.every(function (d) { return d.unidadFisica === unidad && d.unidadFisica === d.unidadComercial; });
    s.cantidadFisica = mismas ? s.cantidad : null;
    s.unidadFisica = mismas ? unidad : "";
  }

  function calcularImportacion(op, r, fobDesdeFormula, flete, casilla, avisar) {
    var items = r.items;
    var g = op.generales;
    var prima = r.seguro.prima;

    // --- FOB total (IT C 5.9) y reparto por ítem
    var fob = fobDesdeFormula(prima);
    if (fob.total.v <= 0 && items.length) { avisar("E12", "El FOB derivado es menor o igual que cero."); }
    var fobTotal = escalar(fob.total, 3);
    var repFob = prorratear(fobTotal, items.map(function (x) { return x.valor; }));
    vigilarReparto(repFob, fobTotal, "fob", "El valor de la factura es 0: el FOB se reparte en partes iguales entre los ítems.", r, avisar);
    items.forEach(function (it, i) {
      it.fob = repFob.partes[i];
      it.fobUnitario = dividirFijo(it.fob, it.cantidad, 6) || fx(0, 6);
    });

    // --- Ajustes (IT C 5.10): solo entre los ítems objeto de ajuste
    var componentes = INCOTERMS.casillasAjuste.map(function (c) {
      return { casilla: c, nombre: INCOTERMS.nombreCasilla[c], valor: casilla(c) };
    });
    var ajusteTotal = escalar(sumar(componentes.map(function (c) { return c.valor; })), 3);
    var ajustados = items.filter(function (it) { return it.objetoAjuste; });
    if (ajusteTotal.v !== 0 && !ajustados.length && items.length) {
      avisar("C02", "Hay ajustes pero ningún ítem está marcado como objeto de ajuste: se reparten entre todos.");
      ajustados = items;
    }
    var repAj = prorratear(ajusteTotal, ajustados.map(function (x) { return x.valor; }));
    vigilarReparto(repAj, ajusteTotal, "ajustes", "El valor facturado de los ítems ajustados es 0: los ajustes se reparten en partes iguales entre ellos.", r, avisar);
    items.forEach(function (it) { it.ajuste = fx(0, 3); });
    ajustados.forEach(function (it, k) { it.ajuste = repAj.partes[k]; });
    items.forEach(function (it) { it.ajusteUnitario = dividirFijo(it.ajuste, it.cantidad, 6) || fx(0, 6); });

    // --- Series (IT A 7.1): subpartida, documento de transporte, CO, tipo de seguro, moneda, país de origen y de adquisición.
    var comun = [op.especificos.transporte.blNumero, op.especificos.origen.certificadoNumero, r.seguro.tipoSeguro,
      g.comercial.moneda, g.ruta.paisAdquisicion].join("|");
    var series = agrupar(items, function (i) {
      var it = op.especificos.items[i];
      return [it.subpartida, it.paisOrigen, comun].join("|");
    });

    series.forEach(function (s) {
      var its = s.items.map(function (i) { return items[i]; });
      var primero = op.especificos.items[s.items[0]];
      s.subpartida = primero.subpartida;
      s.paisOrigen = primero.paisOrigen;
      s.bultos = its.reduce(function (a, x) { return a + x.bultos; }, 0);
      s.pesoNeto = sumaDe(its, "pesoNeto", 2);
      s.pesoBruto = sumaDe(its, "pesoBruto", 2);
      s.fob = sumaDe(its, "fob", 3);
      s.ajuste = sumaDe(its, "ajuste", 3);
      cantidadesSerie(s, its, op);
    });

    // --- Flete por peso bruto y seguro por FOB entre series [S; PV-04]
    var repFlete = prorratear(escalar(flete, 3), series.map(function (s) { return s.pesoBruto; }));
    var seguroTotal, seguroOrigen;
    if (r.seguro.hay) {
      seguroTotal = escalar(prima, 3);
      seguroOrigen = "prima";
    } else {
      var pctTabla = aFijo(op.especificos.seguro.pctTablaSunat, 4);
      seguroTotal = porcentaje(fobTotal, pctTabla, 3);
      seguroOrigen = "tabla";
      avisar("A15", "Importación sin seguro: se aplica el % de la tabla de SUNAT (" + formato.pct(pctTabla) + ", PV-06) sobre el FOB.");
    }
    var repSeguro = prorratear(seguroTotal, series.map(function (s) { return s.fob; }));
    vigilarReparto(repFlete, escalar(flete, 3), "flete", "El peso bruto total es 0: el flete se reparte en partes iguales entre las series.", r, avisar);
    vigilarReparto(repSeguro, seguroTotal, "seguro", "El FOB de las series suma 0: el seguro se reparte en partes iguales entre las series.", r, avisar);
    series.forEach(function (s, k) {
      s.flete = repFlete.partes[k];
      s.seguro = repSeguro.partes[k];
      s.valorAduana = sumar(s.fob, s.flete, s.seguro, s.ajuste);
    });

    participaciones(series, r.totales.pesoBruto, fobTotal);

    var valorAduana = {
      fob: sumaDe(series, "fob", 3),
      flete: sumaDe(series, "flete", 3),
      seguro: sumaDe(series, "seguro", 3),
      ajuste: sumaDe(series, "ajuste", 3)
    };
    valorAduana.total = sumar(valorAduana.fob, valorAduana.flete, valorAduana.seguro, valorAduana.ajuste);

    // --- Liquidación por serie (§6.6, Formato C)
    var igvPct = pctNormativa("igv"), ipmPct = pctNormativa("ipm");
    series.forEach(function (s) {
      var its = s.items.map(function (i) { return op.especificos.items[i]; });
      var tasaAV = aFijo(its[0].tasaAV, 4);
      var distintas = its.some(function (it) { return !igual(aFijo(it.tasaAV, 4), tasaAV) || it.tpi !== its[0].tpi || it.tipoA720 !== its[0].tipoA720; });
      if (distintas) { avisar("E16", "Serie " + s.numero + ": sus ítems tienen distinta tasa o código de tributos; se usa la del primer ítem."); }
      function sumaItems(campo) { return sumar(its.map(function (it) { return aFijo(it[campo], 3); }).concat([fx(0, 3)])); }
      var l = { tasaAV: tasaAV, tributosDistintos: distintas };   // tributosDistintos: E16
      l.adValorem = porcentaje(s.valorAduana, tasaAV, 3);
      l.sobretasa = sumaItems("sobretasa");
      l.derechoEspecifico = sumaItems("derechoEspecifico");
      l.isc = sumaItems("isc");
      l.antidumping = sumaItems("antidumping");
      l.otrosDerechos = sumar(l.sobretasa, l.derechoEspecifico, l.isc);   // C 4.2 + 4.3 + 4.4
      l.baseIgv = sumar(s.valorAduana, l.adValorem, l.sobretasa, l.derechoEspecifico, l.isc);
      l.igv = porcentaje(l.baseIgv, igvPct, 3);
      l.ipm = porcentaje(l.baseIgv, ipmPct, 3);
      l.total = sumar(l.adValorem, l.sobretasa, l.derechoEspecifico, l.isc, l.ipm, l.igv, l.antidumping);
      s.liquidacion = l;
    });
    function sumaLiq(campo) { return sumar(series.map(function (s) { return s.liquidacion[campo]; }).concat([fx(0, 3)])); }
    var liq = {
      igvPct: igvPct, ipmPct: ipmPct,
      adValorem: sumaLiq("adValorem"), sobretasa: sumaLiq("sobretasa"), derechoEspecifico: sumaLiq("derechoEspecifico"),
      isc: sumaLiq("isc"), otrosDerechos: sumaLiq("otrosDerechos"), antidumping: sumaLiq("antidumping"), baseIgv: sumaLiq("baseIgv"),
      igv: sumaLiq("igv"), ipm: sumaLiq("ipm"), total: sumaLiq("total")
    };

    // Percepción del IGV: un valor por operación (D2, D6), fuera del Formato C (PV-01).
    // Base = valor en aduana + tributos del Formato C, incluido el antidumping (D11: [H*] Ley 29173,
    // sin fuente en la carpeta; PV-17).
    var tasaPer = aFijo(op.especificos.tributos.tasaPercepcion, 4);
    var basePer = sumar(valorAduana.total, liq.total);
    var percepcion = { tasa: tasaPer, valorAduana: valorAduana.total, tributos: liq.total, antidumping: liq.antidumping,
      base: basePer, monto: porcentaje(basePer, tasaPer, 3) };

    // Pago en soles: monto en USD × tipo de cambio venta (IT D rubro 5); 2 decimales [S; PV-08].
    // Sin un tipo de cambio válido (vacío, 0 o negativo) los pagos quedan "no calculados" (null), no en 0 (F3-M2).
    var tcValido = typeof g.aduana.tipoCambio === "number" && g.aduana.tipoCambio > 0;
    var tc = tcValido ? aFijo(g.aduana.tipoCambio, 3) : null;
    var soles = { disponible: tcValido, tipoCambio: tc, tributos: null, percepcion: null, total: null };
    if (tcValido) {
      soles.tributos = multiplicar(liq.total, tc, 2);
      soles.percepcion = multiplicar(percepcion.monto, tc, 2);
      soles.total = sumar(soles.tributos, soles.percepcion);
    } else {
      avisar("E15", "Importación sin tipo de cambio válido: el pago en soles no se calcula.");
    }

    // Cuadres internos (E19): deben cumplirse siempre.
    var cuadres = [
      { id: "fob-items", texto: "Σ FOB de los ítems (Formato B) = FOB total", a: sumaDe(items, "fob", 3), b: fobTotal },
      { id: "ajuste-items", texto: "Σ ajustes de los ítems = ajuste total (B 5.10)", a: sumaDe(items, "ajuste", 3), b: ajusteTotal },
      { id: "fob-series", texto: "Σ FOB de las series (A 7.30) = A 6.1", a: valorAduana.fob, b: fobTotal },
      { id: "flete-series", texto: "Σ flete de las series (A 7.31) = flete (A 6.2)", a: valorAduana.flete, b: escalar(flete, 3) },
      { id: "seguro-series", texto: "Σ seguro de las series (A 7.32) = seguro (A 6.3)", a: valorAduana.seguro, b: seguroTotal },
      { id: "va-series", texto: "Σ valor en aduana de las series (A 7.34) = A 6.5", a: sumaDe(series, "valorAduana", 3), b: valorAduana.total }
    ];
    cuadres.forEach(function (c) {
      c.ok = igual(c.a, c.b);
      if (!c.ok) { avisar("E19", "Descuadre interno: " + c.texto); }
    });

    // --- Formato B (F8b): lo que muestra la plantilla dam_b.js, que solo lee.
    // Sección 8: cada casilla con su monto (USD, 2 decimales); 8.1.1 = Vc; 8.4 = prima si hay seguro (IT C 8.4:
    // sin seguro no se consigna monto). País de embarque (B 5.8) = país del UN/LOCODE de embarque [H*];
    // versión del Incoterm 4 = 2020 (IT C 5.4, fija en v1). Indicador de pago diferido parcial (IT C rubro 4,
    // otros datos g): 1 = Sí si solo una parte se paga a crédito; 2 = No si se paga todo a crédito.
    var seccion8 = { "8.1.1": r.totales.valorFactura, "8.4": r.seguro.hay ? prima : fx(0, 2) };
    Object.keys(INCOTERMS.campoCasilla).forEach(function (c) { seccion8[c] = casilla(c); });
    var pd = g.comercial.pagoDiferido;
    r.formatoB = {
      seccion8: seccion8,
      paisEmbarque: r.ruta.paisEmbarque,
      versionIncoterm: "4",
      pagoDiferidoParcial: g.comercial.modalidadPago !== "2" || pd.porcentaje == null ? "" : (pd.porcentaje < 100 ? "1" : "2")
    };

    r.fob = { terminos: fob.terminos, total: fob.total, formulaIncoterm: INCOTERMS.formulasFob[r.incoterm] ? r.incoterm : "FOB" };
    r.ajustes = { componentes: componentes, total: ajusteTotal, itemsAjustados: ajustados.map(function (x) { return x.numero; }) };
    r.series = series;
    r.seguroOrigen = seguroOrigen;
    r.valorAduana = valorAduana;
    r.liquidacion = liq;
    r.percepcion = percepcion;
    r.soles = soles;
    r.cuadres = cuadres;
  }

  function calcularExportacion(op, r, avisar) {
    var items = r.items;
    var val = op.especificos.valoracion;
    // S 6.1 valor según la cláusula de venta; S 6.3 deducciones; S 6.4 ajustes; S 6.5 = FOB (IT B 6.1–6.5).
    var s61 = escalar(r.totales.valorFactura, 3);
    // IT B 6.3: en CFR/CIF las deducciones son las líneas incluidas en el precio del
    // desglose de la factura (una sola fuente). En CPT/CIP/D no se calculan solas (PV-31).
    var esCfrCif = r.incoterm === "CFR" || r.incoterm === "CIF";
    var incluidos = r.factura.desglose.lineas.slice(1);
    var derivado = escalar(sumar(incluidos.map(function (l) { return l.valor; }).concat([fx(0, 2)])), 3);
    var dato = val.expOtrosDeducibles;
    var origen = esCfrCif && (dato === null || dato === 0) ? "desglose" : "dato";
    var s63 = origen === "desglose" ? derivado : escalar(aFijo(dato, 2), 3);
    var s64 = escalar(aFijo(val.expAjustes, 2), 3);
    var s65 = sumar(restar(s61, s63), s64);
    if (s65.v <= 0 && items.length) { avisar("E12", "El FOB (S 6.5) es menor o igual que cero."); }

    // FOB por ítem: S 6.5 repartido según el valor del ítem (mismo criterio que IT C 5.9) [S].
    var rep = prorratear(s65, items.map(function (x) { return x.valor; }));
    vigilarReparto(rep, s65, "fob", "El valor de la factura es 0: el FOB de exportación (S 6.5) se reparte en partes iguales entre los ítems.", r, avisar);
    items.forEach(function (it, i) {
      it.fob = rep.partes[i];
      it.fobUnitario = dividirFijo(it.fob, it.cantidad, 6) || fx(0, 6);
    });

    // Series (IT B 7.1, 7.27): subpartida y país de destino.
    var destino = r.ruta.paisDestino;
    var series = agrupar(items, function (i) { return op.especificos.items[i].subpartida + "|" + destino; });
    series.forEach(function (s) {
      var its = s.items.map(function (i) { return items[i]; });
      s.subpartida = op.especificos.items[s.items[0]].subpartida;
      s.paisDestino = destino;
      s.bultos = its.reduce(function (a, x) { return a + x.bultos; }, 0);
      s.pesoNeto = sumaDe(its, "pesoNeto", 2);
      s.pesoBruto = sumaDe(its, "pesoBruto", 2);
      s.fob = sumaDe(its, "fob", 3);
      cantidadesSerie(s, its, op);
    });

    participaciones(series, r.totales.pesoBruto, s65);

    var cuadres = [
      { id: "fob-items", texto: "Σ FOB de los ítems = S 6.5", a: sumaDe(items, "fob", 3), b: s65 },
      { id: "fob-series", texto: "Σ FOB de las series (S 7.30) = S 6.5", a: sumaDe(series, "fob", 3), b: s65 }
    ];
    cuadres.forEach(function (c) {
      c.ok = igual(c.a, c.b);
      if (!c.ok) { avisar("E19", "Descuadre interno: " + c.texto); }
    });

    r.exportacion = { s61: s61, s63: s63, s64: s64, s65: s65,
      deducciones: { origen: origen, derivado: derivado,
        incluidos: incluidos.map(function (l) { return { id: l.id, es: l.es, valor: l.valor }; }),
        coincide: !incluidos.length || igual(s63, derivado) } };
    r.series = series;
    r.cuadres = cuadres;
  }

  return {
    // Núcleo de decimal fijo (también lo usa pruebas.html)
    aFijo: aFijo, escalar: escalar, sumar: sumar, restar: restar, multiplicar: multiplicar,
    porcentaje: porcentaje, dividir: dividirFijo, prorratear: prorratear, igual: igual, comparar: comparar,
    esCero: esCero, cero: CERO,
    formato: formato,
    control: control,
    calcular: calcular
  };
})();
