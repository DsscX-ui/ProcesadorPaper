/* Errores de coherencia y avisos del caso.
   Lee Calculos. No usa módulos ni fetch: script clásico, objeto global Validaciones.
   Un error bloquea la lectura limpia. Un aviso no. */

var Validaciones = (function () {
  var INCOTERMS = {
    EXW: true, FCA: true, FAS: true, FOB: true, CFR: true, CIF: true,
    CPT: true, CIP: true, DAF: true, DES: true, DEQ: true, DAT: true,
    DAP: true, DDU: true, DDP: true, DPU: true
  };
  var OBSOLETOS_2020 = { DAF: true, DES: true, DEQ: true, DDU: true };
  var PAGOS = { "1": true, "2": true, "6": true, "7": true, "8": true, "9": true };
  var VIAS = {
    "1": "marítimo",
    "2": "fluvial",
    "3": "lacustre",
    "4": "aéreo",
    "5": "postal",
    "6": "ferroviario",
    "7": "carretera"
  };
  var TELEFONOS = {
    "8517130000": "8517.13.00.00",
    "8517140000": "8517.14.00.00"
  };

  function num(valor) {
    var n = Number(valor);
    return isFinite(n) ? n : 0;
  }

  function leer(obj, ruta) {
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

  function texto(valor) {
    return String(valor == null ? "" : valor).trim();
  }

  function marcaPendiente(valor) {
    var t = texto(valor).toUpperCase();
    return t === "" || t === "PENDIENTE DE VERIFICAR";
  }

  function sinAcento(valor) {
    return texto(valor).toLowerCase()
      .replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i")
      .replace(/ó/g, "o").replace(/ú/g, "u").replace(/ü/g, "u");
  }

  function normNombre(valor) {
    return sinAcento(valor).replace(/\s+/g, " ");
  }

  function trozos(valor) {
    return texto(valor).split(/[\n,;]+/).map(function (parte) {
      return parte.trim();
    }).filter(function (parte) {
      return parte.length > 0;
    });
  }

  function digitosSubpartida(valor) {
    return texto(valor).replace(/\D/g, "");
  }

  function formatoSubpartida(digitos) {
    if (digitos.length !== 10) {
      return digitos;
    }
    return digitos.slice(0, 4) + "." + digitos.slice(4, 6) + "." + digitos.slice(6, 8) + "." + digitos.slice(8);
  }

  function esEntero(n) {
    return isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9;
  }

  function kg(n) {
    return Calculos.formatoCantidad(n);
  }

  function dinero(n) {
    return Calculos.formatoMoneda(n);
  }

  function push(lista, mensaje) {
    lista.push(mensaje);
  }

  function distintos(a, b) {
    var x = texto(a);
    var y = texto(b);
    return x !== "" && y !== "" && x !== y;
  }

  function evaluarValores(op, cifras, errores, avisos) {
    var comercial = op.comercial || {};
    var valoracion = op.valoracion || {};
    var incoterm = texto(comercial.incoterm).toUpperCase();
    var sumaItems = Calculos.suma(cifras.valoresItem, 3);
    var declarado = valoracion.fobDeclaradoUsd;

    if (!Calculos.casiIgual(sumaItems, cifras.fobUsd, 3)) {
      push(errores, "Error. La suma de los valores de los ítems (" + dinero(sumaItems) +
        " USD) no coincide con el FOB (" + dinero(cifras.fobUsd) +
        " USD). En este Incoterm la suma de la factura es el FOB de las casillas 6.1 y 7.30.");
    }
    if (declarado != null && texto(declarado) !== "" && !Calculos.casiIgual(declarado, cifras.fobUsd, 3)) {
      push(errores, "Error. El FOB escrito aparte (" + dinero(declarado) +
        " USD) no coincide con la suma de los ítems (" + dinero(cifras.fobUsd) +
        " USD). En FOB, esa suma es el total de la factura y el FOB.");
    }
    if (!Calculos.casiIgual(
      cifras.fobUsd + cifras.fleteUsd + cifras.seguroUsd + cifras.ajustesUsd,
      cifras.valorAduanaUsd,
      3
    )) {
      push(errores, "Error. El valor en aduana (" + dinero(cifras.valorAduanaUsd) +
        " USD) no es la suma de FOB, flete, seguro y ajustes. La casilla 6.5 suma 6.1, 6.2, 6.3 y 6.4. La 7.34 suma 7.30, 7.31, 7.32 y 7.33.");
    }
    if (num(valoracion.fleteUsd) < 0) {
      push(errores, "Error. El flete no puede ser negativo.");
    }
    if (num(valoracion.seguroUsd) < 0) {
      push(errores, "Error. El seguro no puede ser negativo.");
    }
    if (num(valoracion.ajustesUsd) < 0) {
      push(errores, "Error. Los ajustes no pueden ser negativos.");
    }
    if (incoterm && incoterm !== "FOB") {
      push(avisos, "Aviso. El Incoterm no es FOB. La pantalla igual toma la suma de los ítems como FOB de las casillas 6.1 y 7.30. Con otro Incoterm el precio de la factura puede incluir flete o seguro: esa igualdad hay que mirarla a mano.");
    }
    if (incoterm === "FOB" && !Calculos.casiIgual(cifras.ajustesUsd, 0, 3)) {
      push(avisos, "Aviso. El ajuste no es cero. El valor en aduana ya no coincide con el CIF comercial (FOB + flete + seguro). No es un error: el ajuste va a la casilla 6.4.");
    }
  }

  function evaluarCantidades(op, cifras, errores) {
    var items = op.items || [];
    var i;
    var neto;
    var bruto;
    var hayPeso;
    for (i = 0; i < items.length; i++) {
      neto = num(items[i].pesoNetoKg);
      bruto = num(items[i].pesoBrutoKg);
      if (num(items[i].cantidad) < 0) {
        push(errores, "Error. La cantidad del ítem " + (i + 1) + " no puede ser negativa.");
      }
      if (num(items[i].bultos) < 0) {
        push(errores, "Error. Los bultos del ítem " + (i + 1) + " no pueden ser negativos.");
      }
      if (num(items[i].volumenM3) < 0) {
        push(errores, "Error. El volumen del ítem " + (i + 1) + " no puede ser negativo.");
      }
      if (num(items[i].precioUnitarioUsd) < 0) {
        push(errores, "Error. El precio unitario del ítem " + (i + 1) + " no puede ser negativo.");
      }
      if (neto < 0) {
        push(errores, "Error. El peso neto del ítem " + (i + 1) + " no puede ser negativo.");
      }
      if (bruto < 0) {
        push(errores, "Error. El peso bruto del ítem " + (i + 1) + " no puede ser negativo.");
      }
      if (Calculos.supera(neto, bruto, 3)) {
        push(errores, "Error. Ítem " + (i + 1) + ": el peso neto (" + kg(neto) +
          " kg) es mayor que el peso bruto (" + kg(bruto) +
          " kg). El neto no puede superar al bruto.");
      }
    }
    if (Calculos.supera(cifras.pesoNetoKg, cifras.pesoBrutoKg, 3)) {
      push(errores, "Error. La suma de pesos netos (" + kg(cifras.pesoNetoKg) +
        " kg) no cuadra con la suma de pesos brutos (" + kg(cifras.pesoBrutoKg) +
        " kg): el neto la supera. Esas sumas son las de la casilla 7.14, la 7.15, el packing list y el BL.");
    }
    hayPeso = Calculos.supera(cifras.pesoNetoKg, 0, 3) || Calculos.supera(cifras.pesoBrutoKg, 0, 3);
    if (hayPeso && Calculos.casiIgual(cifras.bultos, 0, 3)) {
      push(errores, "Error. Hay peso declarado, pero la suma de bultos es 0. No cuadra con la casilla 7.12, el packing list ni el BL.");
    }
    /* Una sola serie: la suma de bultos de los ítems es la casilla 7.12.
       Si más adelante hubiera dos series en un mismo bulto, el instructivo
       manda declarar esos bultos solo en la primera y cero en las demás. */
    if (op.serie && op.serie.bultosDeclarados != null && texto(op.serie.bultosDeclarados) !== "" &&
        !Calculos.casiIgual(op.serie.bultosDeclarados, cifras.bultos, 3)) {
      push(errores, "Error. La suma de bultos de los ítems (" + kg(cifras.bultos) +
        ") no coincide con el total declarado (" + kg(op.serie.bultosDeclarados) +
        "). La casilla 7.12, el packing list y el BL tienen que decir lo mismo.");
    }
  }

  function evaluarRucs(op, errores) {
    var pesos = Calculos.pesosRuc.join("-");
    var campos = [
      {
        ruta: "partes.importador.ruc",
        nombre: "importador",
        detalle: "Es el mismo RUC en la factura y en la casilla 1.2."
      },
      {
        ruta: "partes.agenteAduanas.ruc",
        nombre: "agente de aduanas",
        detalle: "El rubro 8 es el declarante."
      },
      {
        ruta: "partes.agenteMaritimo.ruc",
        nombre: "agente marítimo",
        detalle: "En transporte marítimo la casilla 3.1 pide este RUC."
      },
      {
        ruta: "transporte.deposito.ruc",
        nombre: "depósito temporal",
        detalle: "Va en la casilla 4.1."
      }
    ];
    var i;
    var ruc;
    var resultado;
    var factura;
    for (i = 0; i < campos.length; i++) {
      ruc = texto(leer(op, campos[i].ruta));
      resultado = Calculos.digitoVerificadorRuc(ruc);
      if (resultado.valido) {
        continue;
      }
      if (resultado.digitoCalculado == null) {
        push(errores, "Error. El RUC del " + campos[i].nombre + " debe tener 11 dígitos. " +
          (ruc ? "Ahora dice «" + ruc + "». " : "Está vacío. ") + campos[i].detalle);
      } else {
        push(errores, "Error. El RUC del " + campos[i].nombre +
          " no cumple el dígito verificador. RUC " + ruc +
          ". Suma " + resultado.suma +
          ". Resto " + resultado.resto +
          ". Dígito calculado " + resultado.digitoCalculado +
          ". Dígito declarado " + resultado.digitoDeclarado +
          ". Módulo 11, pesos " + pesos + ". " + campos[i].detalle);
      }
    }
    factura = leer(op, "partes.importador.rucFactura");
    if (distintos(factura, leer(op, "partes.importador.ruc"))) {
      push(errores, "Error. El RUC de la factura no coincide con el de la casilla 1.2. Tienen que ser el mismo.");
    }
  }

  function evaluarSubpartida(op, errores) {
    var serie = op.serie || {};
    var items = op.items || [];
    var cruda = texto(serie.subpartida);
    var digitos = digitosSubpartida(cruda);
    var i;
    var deItem;
    if (digitos.length !== 10) {
      push(errores, "Error. La subpartida nacional debe tener 10 dígitos. «" +
        (cruda || "(vacía)") + "» tiene " + digitos.length + ".");
    }
    for (i = 0; i < items.length; i++) {
      if (!texto(items[i].subpartida)) {
        continue;
      }
      deItem = digitosSubpartida(items[i].subpartida);
      if (deItem !== digitos) {
        push(errores, "Error. El ítem " + (i + 1) +
          " no tiene la misma subpartida que la serie. Una serie lleva una sola subpartida nacional.");
      }
    }
  }

  function evaluarImei(op, errores) {
    var digitos = digitosSubpartida(leer(op, "serie.subpartida"));
    var bonita = TELEFONOS[digitos];
    var items = op.items || [];
    var fallos = [];
    var vistosSerie = {};
    var vistosImei = {};
    var repetidos = [];
    var i;
    var j;
    var cant;
    var series;
    var imeis;
    var clave;
    var detalle;
    if (!bonita) {
      return;
    }
    for (i = 0; i < items.length; i++) {
      cant = num(items[i].cantidad);
      series = trozos(items[i].series);
      imeis = trozos(items[i].imeis);
      if (!esEntero(cant) || cant < 1 || series.length !== cant || imeis.length !== cant) {
        if (series.length === 0 && imeis.length === 0) {
          fallos.push("el ítem " + (i + 1) + " (" + kg(cant) + " equipos) no trae serie ni IMEI");
        } else {
          fallos.push("el ítem " + (i + 1) + " declara " + kg(cant) +
            " equipos, con " + series.length + " series y " + imeis.length + " IMEI");
        }
      }
      if (series.length === cant && imeis.length === cant && esEntero(cant) && cant >= 1) {
        for (j = 0; j < series.length; j++) {
          clave = "S|" + series[j];
          if (vistosSerie[clave]) {
            repetidos.push("serie " + series[j]);
          }
          vistosSerie[clave] = true;
          clave = "I|" + imeis[j];
          if (vistosImei[clave]) {
            repetidos.push("IMEI " + imeis[j]);
          }
          vistosImei[clave] = true;
        }
      }
    }
    if (fallos.length || repetidos.length) {
      detalle = fallos.join("; ");
      if (detalle) {
        detalle = detalle.charAt(0).toUpperCase() + detalle.slice(1);
      }
      push(errores, "Error. La subpartida " + bonita +
        " exige, en la casilla 7.35, un número de serie único y el IMEI de cada equipo. Es el párrafo añadido en 2026 y rige desde el 5 de octubre de 2026." +
        (detalle ? " " + detalle + "." : "") +
        (repetidos.length ? " Repetidos: " + repetidos.slice(0, 5).join(", ") + "." : "") +
        " Una subpartida de relojes (9102) no activa esta regla.");
    }
  }

  function evaluarPago(op, errores) {
    var comercial = op.comercial || {};
    var codigo = texto(comercial.formaPago);
    var precisa;
    if (!PAGOS[codigo]) {
      push(errores, "Error. La forma de pago «" + (codigo || "(vacía)") +
        "» no está en el instructivo. Los códigos son 1, 2, 6, 7, 8 y 9.");
      return;
    }
    if (codigo === "7" || codigo === "8") {
      precisa = texto(comercial.formaPagoFrase) || texto(comercial.formaPagoDescripcion);
      if (precisa.length < 3) {
        push(errores, "Error. Con la forma de pago " + codigo +
          " hay que precisar el texto, como pide el instructivo (7: otras; 8: pago mixto).");
      }
    }
  }

  function evaluarIncoterm(op, errores, avisos) {
    var comercial = op.comercial || {};
    var incoterm = texto(comercial.incoterm).toUpperCase();
    var version = texto(comercial.incotermVersion);
    if (!incoterm) {
      push(errores, "Error. Falta el Incoterm de la casilla 5.4.");
    } else if (!INCOTERMS[incoterm]) {
      push(errores, "Error. El Incoterm «" + incoterm +
        "» no está en la tabla del instructivo.");
    }
    if (!version) {
      push(errores, "Error. Falta la versión del Incoterm (1 = 1990, 2 = 2000, 3 = 2010, 4 = 2020).");
    } else if (version !== "1" && version !== "2" && version !== "3" && version !== "4") {
      push(errores, "Error. La versión del Incoterm «" + version +
        "» no es 1, 2, 3 ni 4.");
    }
    if (version === "4" && OBSOLETOS_2020[incoterm]) {
      push(avisos, "Aviso. " + incoterm +
        " no rige con la versión 4 (Incoterms 2020). Con ese código se usan los términos vigentes, incluido DPU. DAF, DES, DEQ y DDU quedan advertidos.");
    }
    if (version === "4" && incoterm === "DAT") {
      push(avisos, "Aviso. DAT no es un término de Incoterms 2020. Con la versión 4 el término vigente es DPU.");
    }
  }

  function evaluarIdentidadSerie(op, errores) {
    var transporte = op.transporte || {};
    var serie = op.serie || {};
    var comercial = op.comercial || {};
    var items = op.items || [];
    var i;
    if (!texto(transporte.numeroBl)) {
      push(errores, "Error. Falta el documento de transporte de la serie. En este caso es un solo BL (casilla 7.8).");
    }
    if (!texto(serie.paisOrigen)) {
      push(errores, "Error. Falta el país de origen de la serie (casilla 7.26). Una serie tiene un solo país de origen.");
    }
    if (!texto(comercial.moneda)) {
      push(errores, "Error. Falta la moneda de la serie (casilla 7.29). Una serie tiene una sola moneda.");
    }
    for (i = 0; i < items.length; i++) {
      if (distintos(items[i].numeroBl, transporte.numeroBl)) {
        push(errores, "Error. El ítem " + (i + 1) + " trae un BL distinto del de la serie. Una serie admite un solo documento de transporte.");
      }
      if (distintos(items[i].paisOrigen, serie.paisOrigen)) {
        push(errores, "Error. El ítem " + (i + 1) + " trae un país de origen distinto del de la serie. Una serie admite un solo país de origen.");
      }
      if (distintos(items[i].moneda, comercial.moneda)) {
        push(errores, "Error. El ítem " + (i + 1) + " trae una moneda distinta de la de la serie. Una serie admite una sola moneda.");
      }
    }
    if (distintos(transporte.contenedorNumeroDam, transporte.contenedorNumero)) {
      push(errores, "Error. El contenedor del BL no coincide con el del rubro 9 de la DAM.");
    }
    if (distintos(transporte.precintoDam, transporte.precinto)) {
      push(errores, "Error. El precinto del BL no coincide con el del rubro 9 de la DAM.");
    }
  }

  function evaluarVia(op, errores, avisos) {
    var transporte = op.transporte || {};
    var codigo = texto(transporte.via);
    var descripcion = texto(transporte.viaDescripcion);
    var palabra;
    if (!VIAS[codigo]) {
      push(errores, "Error. La vía «" + (codigo || "(vacía)") +
        "» no es un código del instructivo (1 marítimo, 2 fluvial, 3 lacustre, 4 aéreo, 5 postal, 6 ferroviario, 7 carretera).");
      return;
    }
    palabra = sinAcento(VIAS[codigo]);
    if (descripcion && sinAcento(descripcion).indexOf(palabra) === -1) {
      push(avisos, "Aviso. La descripción de la vía («" + descripcion +
        "») no coincide con el código " + codigo + ", que en el instructivo es " + VIAS[codigo] + ".");
    }
    if (codigo === "1") {
      push(avisos, "Aviso. En transporte marítimo (vía, código 1) la casilla 3.1 del Formato A es el RUC del agente marítimo. No es la naviera ni el proveedor.");
    } else {
      push(avisos, "Aviso. La casilla 3.1 del Formato A es el RUC del agente marítimo solo cuando la vía es marítima (código 1).");
    }
  }

  function evaluarPendientes(op, avisos) {
    var paises = [
      { ruta: "partes.proveedor.codigoPais", nombre: "proveedor" },
      { ruta: "serie.codigoPaisOrigen", nombre: "origen" },
      { ruta: "serie.codigoPaisAdquisicion", nombre: "adquisición" },
      { ruta: "serie.codigoPaisEmbarque", nombre: "embarque" }
    ];
    var sueltos = [
      { ruta: "transporte.codigoAduana", etiqueta: "Código de aduana", nota: "Las tablas de SUNAT no están en esta carpeta." },
      { ruta: "transporte.codigoPuertoEmbarque", etiqueta: "Código del puerto de embarque (casilla 7.6)", nota: "Las tablas de SUNAT no están en esta carpeta." },
      { ruta: "comercial.codigoMoneda", etiqueta: "Código de moneda (casillas 5.5 y 7.29)", nota: "Las tablas de SUNAT no están en esta carpeta." },
      { ruta: "partes.importador.ubigeo", etiqueta: "Ubigeo del importador (casilla 1.4)", nota: "La tabla de ubigeos no está en esta carpeta." },
      { ruta: "serie.codigoClaseBulto", etiqueta: "Código de clase de bulto (casilla 7.13)", nota: "La tabla de SUNAT no está en esta carpeta." },
      { ruta: "comercial.codigoEntidadFinanciera", etiqueta: "Código de la entidad financiera (casilla 5.1)", nota: "La tabla de SUNAT no está en esta carpeta." },
      { ruta: "transporte.manifiesto", etiqueta: "N.º de manifiesto (casilla 3.2)", nota: "Falta el código de aduana de ingreso: la estructura es ese código, el año y el número." }
    ];
    var pendientes = [];
    var unidad;
    var i;
    for (i = 0; i < sueltos.length; i++) {
      if (marcaPendiente(leer(op, sueltos[i].ruta))) {
        push(avisos, "Aviso. " + sueltos[i].etiqueta + ": PENDIENTE DE VERIFICAR. " + sueltos[i].nota);
      }
    }
    for (i = 0; i < paises.length; i++) {
      if (marcaPendiente(leer(op, paises[i].ruta))) {
        pendientes.push(paises[i].nombre);
      }
    }
    if (pendientes.length === paises.length) {
      push(avisos, "Aviso. Códigos de país (proveedor, origen, adquisición y embarque): PENDIENTE DE VERIFICAR. Las tablas de SUNAT no están en esta carpeta.");
    } else {
      for (i = 0; i < pendientes.length; i++) {
        push(avisos, "Aviso. Código de país (" + pendientes[i] +
          "): PENDIENTE DE VERIFICAR. Las tablas de SUNAT no están en esta carpeta.");
      }
    }
    push(avisos, "Aviso. Dígito verificador de la subpartida (casilla 7.19): PENDIENTE DE VERIFICAR. El instructivo no explica cómo se calcula, así que un número escrito aquí no queda comprobado.");
    unidad = texto(leer(op, "serie.unidadFisica")) || "(vacía)";
    push(avisos, "Aviso. Unidad física (casilla 7.16): «" + unidad +
      "». PENDIENTE DE VERIFICAR contra el arancel, que no está en esta carpeta.");
    if (marcaPendiente(leer(op, "comercial.tipoDespacho"))) {
      push(avisos, "Aviso. Tipo de despacho: PENDIENTE DE VERIFICAR. El instructivo no trae la lista para importación para el consumo, así que el ejemplo lo deja en blanco.");
    }
    /* Casilla 3.4 en despacho anticipado: aviso, no error. */
    var modalidad34 = texto(leer(op, "comercial.modalidad"));
    var desc34 = sinAcento(leer(op, "comercial.modalidadDescripcion"));
    var anticipado34 = modalidad34 === "1-0" || desc34.indexOf("anticipado") !== -1;
    if (anticipado34 && marcaPendiente(leer(op, "transporte.fechaTerminoDescarga"))) {
      push(avisos, "Aviso. Casilla 3.4 (fecha de término de la descarga): PENDIENTE DE VERIFICAR. En el despacho anticipado la DAM se formula antes de la descarga; el instructivo no indica cómo tratar la casilla en ese caso.");
    }
  }

  function evaluarAvisosCaso(op, avisos) {
    var proveedor = normNombre(leer(op, "partes.proveedor.razonSocial"));
    var shipper = normNombre(leer(op, "partes.shipperBl"));
    push(avisos, "Aviso. El notify party no pasa a la DAM. El instructivo no le da casilla. Sí va en el conocimiento de embarque.");
    push(avisos, "Aviso. El volumen no pasa a la DAM. No aparece en el instructivo. Sí va en el packing list y en el BL.");
    if (shipper && proveedor && shipper !== proveedor) {
      push(avisos, "Aviso. El shipper del BL («" + texto(leer(op, "partes.shipperBl")) +
        "») y el proveedor del Formato B («" + texto(leer(op, "partes.proveedor.razonSocial")) +
        "») no son la misma persona. El instructivo lo permite: no es un error.");
    }
  }

  function evaluar(operacion) {
    var errores = [];
    var avisosPendientes = [];
    var avisos = [];
    var cifras;
    if (!operacion || typeof operacion !== "object") {
      return {
        errores: ["Error. No hay una operación cargada."],
        avisosPendientes: [],
        avisos: []
      };
    }
    cifras = Calculos.totales(operacion);
    evaluarValores(operacion, cifras, errores, avisos);
    evaluarCantidades(operacion, cifras, errores);
    evaluarRucs(operacion, errores);
    evaluarSubpartida(operacion, errores);
    evaluarImei(operacion, errores);
    evaluarPago(operacion, errores);
    evaluarIncoterm(operacion, errores, avisos);
    evaluarIdentidadSerie(operacion, errores);
    evaluarVia(operacion, errores, avisos);
    evaluarPendientes(operacion, avisosPendientes);
    evaluarAvisosCaso(operacion, avisos);
    return {
      errores: errores,
      avisosPendientes: avisosPendientes,
      avisos: avisos
    };
  }

  function pintarLista(ul, textos, clase) {
    var i;
    var li;
    if (!ul) {
      return;
    }
    ul.textContent = "";
    for (i = 0; i < textos.length; i++) {
      li = document.createElement("li");
      li.className = clase;
      li.textContent = textos[i];
      ul.appendChild(li);
    }
  }

  function mostrar(nodo, visible) {
    if (nodo) {
      nodo.hidden = !visible;
    }
  }

  function pintar(operacion) {
    var resultado = evaluar(operacion);
    var seccion;
    var resumen;
    var imei;
    var i;
    if (typeof document === "undefined") {
      return resultado;
    }
    seccion = document.getElementById("validaciones");
    resumen = document.getElementById("validaciones-resumen");
    pintarLista(document.getElementById("lista-errores"), resultado.errores, "msg-error");
    pintarLista(document.getElementById("lista-avisos-pendientes"), resultado.avisosPendientes, "msg-aviso");
    pintarLista(document.getElementById("lista-avisos"), resultado.avisos, "msg-aviso");
    mostrar(document.getElementById("errores-vacio"), resultado.errores.length === 0);
    mostrar(document.getElementById("avisos-pendientes-vacio"), resultado.avisosPendientes.length === 0);
    mostrar(document.getElementById("avisos-vacio"), resultado.avisos.length === 0);
    if (resumen) {
      if (resultado.errores.length === 0) {
        resumen.textContent = "Sin errores de coherencia.";
        resumen.className = "validaciones-resumen resumen-ok";
      } else if (resultado.errores.length === 1) {
        resumen.textContent = "Hay 1 error de coherencia. Corrígelo antes de dar por buena la operación.";
        resumen.className = "validaciones-resumen resumen-mal";
      } else {
        resumen.textContent = "Hay " + resultado.errores.length +
          " errores de coherencia. Corrígelos antes de dar por buena la operación.";
        resumen.className = "validaciones-resumen resumen-mal";
      }
    }
    if (seccion) {
      seccion.setAttribute("data-errores", String(resultado.errores.length));
      seccion.setAttribute("data-avisos-pendientes", String(resultado.avisosPendientes.length));
      seccion.setAttribute("data-avisos", String(resultado.avisos.length));
      seccion.setAttribute("data-lectura", resultado.errores.length ? "bloqueada" : "limpia");
    }
    imei = document.querySelectorAll(".campo-imei");
    for (i = 0; i < imei.length; i++) {
      imei[i].hidden = !TELEFONOS[digitosSubpartida(leer(operacion, "serie.subpartida"))];
    }
    return resultado;
  }

  return {
    evaluar: evaluar,
    pintar: pintar
  };
})();
