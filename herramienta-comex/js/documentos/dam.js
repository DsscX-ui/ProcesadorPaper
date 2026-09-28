/* DAM en pantalla: Formato A (datos generales y serie 1/1) y Formato B
   (declaración del valor). No genera el Formato C ni el A1 ni el B1.
   Lee el estado. Los montos del Formato A y de la sección 8 salen de
   Calculos.formatoMoneda (tres decimales). Los unitarios 5.9 y 5.10 van
   con seis decimales. Script clásico: objeto global Dam (alias DAM). */

var Dam = (function () {
  var MARCA = "DOCUMENTO DIDÁCTICO – SIN VALIDEZ OFICIAL";
  var ORDEN_SUPUESTO = "000123";
  var NOTA_2026 = "En el caso de la importación para el consumo de equipos terminales móviles o teléfonos inteligentes y demás teléfonos móviles (celulares) clasificados en las subpartidas nacionales 8517.13.00.00 y 8517.14.00.00, adicionalmente, se consigna por cada equipo su número de serie único y el (los) número(s) o código(s) de identidad internacional del equipo terminal móvil - IMEI (international mobile equipment identity), los cuales constituyen descripciones mínimas.";
  var DOCUMENTOS = {
    "3": "DNI",
    "4": "RUC",
    "6": "Pasaporte",
    "7": "Carnet de Extranjería",
    "8": "Organismos Internacionales",
    "9": "Salvoconducto"
  };
  /* Rótulos 8.1.2–8.1.5 tomados de un Formato B impreso de 2007 (DUA, anterior a la DAM).
     No mostrar URL en la UI; pendiente de verificar contra el formato vigente. */
  var LEYENDA_34 = "El instructivo dice: «3.4 Fecha Término Descarga .- Se indica la fecha en que culmina la descarga de la mercancía.» No hay instrucción específica para la modalidad 1-0 Despacho Anticipado cuando la formulación es anterior a la descarga.";

  function texto(valor) {
    return String(valor == null ? "" : valor).trim();
  }

  function el(tag, className, contenido) {
    var n = document.createElement(tag);
    if (className) {
      n.className = className;
    }
    if (contenido != null && contenido !== "") {
      n.textContent = contenido;
    }
    return n;
  }

  function agregarTextoMarcado(nodo, linea) {
    var re = /(PENDIENTE DE VERIFICAR|SUPUESTO)/g;
    var last = 0;
    var m;
    var encontrado = false;
    while ((m = re.exec(linea))) {
      encontrado = true;
      if (m.index > last) {
        nodo.appendChild(document.createTextNode(linea.slice(last, m.index)));
      }
      nodo.appendChild(el("strong", m[1] === "SUPUESTO" ? "dam-supuesto" : "dam-pendiente", m[1]));
      last = m.index + m[1].length;
    }
    if (!encontrado) {
      nodo.appendChild(document.createTextNode(linea));
      return;
    }
    if (last < linea.length) {
      nodo.appendChild(document.createTextNode(linea.slice(last)));
    }
  }

  function parrafo(clase, lineas) {
    var p = el("p", clase);
    var i;
    var alguna = false;
    for (i = 0; i < lineas.length; i++) {
      if (lineas[i] == null || lineas[i] === "") {
        continue;
      }
      if (alguna) {
        p.appendChild(document.createElement("br"));
      }
      agregarTextoMarcado(p, lineas[i]);
      alguna = true;
    }
    return p;
  }

  function fechaDam(iso) {
    var m = texto(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) {
      return texto(iso) || "—";
    }
    return m[3] + " " + m[2] + " " + m[1];
  }

  function moneda(n) {
    if (window.Calculos && typeof Calculos.formatoMoneda === "function") {
      return Calculos.formatoMoneda(n);
    }
    return String(n);
  }

  function cantidad(n) {
    if (window.Calculos && typeof Calculos.formatoCantidad === "function") {
      return Calculos.formatoCantidad(n);
    }
    return String(n);
  }

  function formatoSeis(n) {
    var numero = Number(n);
    var factor = 1000000;
    var escalado;
    var negativo;
    var abs;
    var entero;
    var dec;
    if (!isFinite(numero)) {
      return "—";
    }
    escalado = Math.round(numero * factor);
    negativo = escalado < 0;
    abs = Math.abs(escalado);
    entero = String(Math.floor(abs / factor));
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    dec = String(abs % factor);
    while (dec.length < 6) {
      dec = "0" + dec;
    }
    return (negativo ? "-" : "") + entero + "," + dec;
  }

  function cifrasDe(op) {
    if (window.Calculos && typeof Calculos.totales === "function") {
      return Calculos.totales(op);
    }
    return {
      unidades: 0,
      bultos: 0,
      pesoNetoKg: 0,
      pesoBrutoKg: 0,
      fobUsd: 0,
      fleteUsd: 0,
      seguroUsd: 0,
      ajustesUsd: 0,
      valorAduanaUsd: 0,
      valoresItem: []
    };
  }

  function lineasDocumento(codigo, numero) {
    var c = texto(codigo);
    var n = texto(numero);
    var nombre = c && DOCUMENTOS[c] ? DOCUMENTOS[c] : "";
    var codigoLinea;
    if (!c) {
      codigoLinea = "Código: PENDIENTE DE VERIFICAR";
    } else if (nombre) {
      codigoLinea = "Código " + c + " – " + nombre;
    } else {
      codigoLinea = "Código " + c;
    }
    if (!n) {
      return [codigoLinea];
    }
    return [codigoLinea, n];
  }

  function fraseDocumento(codigo, numero) {
    return lineasDocumento(codigo, numero).join(" ");
  }

  function lineaSuscribe(agente) {
    var nombre = texto(agente && agente.razonSocial) || "—";
    var ruc = texto(agente && agente.ruc);
    if (!ruc) {
      return "Suscribe en representación: " + nombre;
    }
    return "Suscribe en representación: " + nombre + ", RUC " + ruc;
  }

  function fechaUsable(iso) {
    var m = texto(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    var anio;
    var mes;
    var dia;
    var fecha;
    if (!m) {
      return false;
    }
    anio = Number(m[1]);
    mes = Number(m[2]);
    dia = Number(m[3]);
    fecha = new Date(Date.UTC(anio, mes - 1, dia));
    return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
  }

  function nombreComun(item) {
    var propio = texto(item && item.nombreProducto);
    if (propio) {
      return propio;
    }
    return "PENDIENTE DE VERIFICAR";
  }

  function conCodigo(nombre, codigo) {
    var lineas = [texto(nombre) || "—"];
    var c = texto(codigo);
    lineas.push("Código: " + (c || "PENDIENTE DE VERIFICAR"));
    return lineas;
  }

  function esTelefono(subpartida) {
    var d = texto(subpartida).replace(/\D/g, "");
    return d === "8517130000" || d === "8517140000";
  }

  function trozos(valor) {
    return texto(valor).split(/\s*\n\s*/).filter(function (t) {
      return t !== "";
    });
  }

  function listaNumeros(n) {
    var nums = [];
    var i;
    if (!n) {
      return "—";
    }
    for (i = 1; i <= n; i++) {
      nums.push(String(i));
    }
    if (nums.length === 1) {
      return nums[0];
    }
    return nums.slice(0, -1).join(", ") + " y " + nums[nums.length - 1];
  }

  function anioDeclaracion(agente) {
    var m = texto(agente && agente.fechaFormulacion).match(/^(\d{4})/);
    return m ? m[1] : "2026";
  }

  function prepararHoja(id) {
    var hoja = document.getElementById(id);
    var marcas;
    var cuerpo;
    var i;
    if (!hoja) {
      return null;
    }
    hoja.textContent = "";
    if (hoja.className.indexOf("dam-hoja") === -1) {
      hoja.className += " dam-hoja";
    }
    marcas = el("div", "dam-marcas");
    marcas.setAttribute("aria-hidden", "true");
    for (i = 0; i < 3; i++) {
      marcas.appendChild(el("p", "marca-agua", MARCA));
    }
    hoja.appendChild(marcas);
    cuerpo = el("div", "cuerpo-documento");
    hoja.appendChild(cuerpo);
    return cuerpo;
  }

  function grupo(cuerpo, titulo) {
    var sec = el("section", "dam-rubro");
    var grid;
    if (titulo) {
      sec.appendChild(el("h3", null, titulo));
    }
    grid = el("div", "dam-casillas");
    sec.appendChild(grid);
    cuerpo.appendChild(sec);
    return grid;
  }

  function agregarCasilla(contenedor, datos) {
    var clase = "dam-casilla";
    var caja;
    var cab;
    if (datos.ancho) {
      clase += " dam-ancho";
    }
    if (datos.vacia) {
      clase += " dam-vacia";
    }
    if (datos.clase) {
      clase += " " + datos.clase;
    }
    caja = el("div", clase);
    if (datos.num) {
      caja.setAttribute("data-casilla", datos.num);
    } else if (datos.id) {
      caja.setAttribute("data-casilla", datos.id);
    }
    if (datos.idItem) {
      caja.setAttribute("data-item", String(datos.idItem));
    }
    cab = el("p", "dam-cab");
    if (datos.num) {
      cab.appendChild(el("span", "dam-num", datos.num));
    }
    cab.appendChild(el("span", "dam-rotulo", datos.rotulo || ""));
    caja.appendChild(cab);
    if (datos.lineas && datos.lineas.length) {
      caja.appendChild(parrafo("dam-valor", datos.lineas));
    }
    if (datos.leyenda) {
      caja.appendChild(parrafo("dam-leyenda", [datos.leyenda]));
    }
    contenedor.appendChild(caja);
    return caja;
  }

  function vacia(contenedor, num, rotulo, leyenda) {
    return agregarCasilla(contenedor, {
      num: num,
      rotulo: rotulo,
      vacia: true,
      leyenda: leyenda
    });
  }

  function dinero(contenedor, num, rotulo, monto, extra) {
    var lineas = [moneda(monto) + " USD"];
    if (extra) {
      lineas.push(extra);
    }
    return agregarCasilla(contenedor, {
      num: num,
      rotulo: rotulo,
      lineas: lineas
    });
  }

  function cierreSinC(cuerpo, fraseSerie) {
    if (fraseSerie) {
      cuerpo.appendChild(el("p", "dam-cierre", fraseSerie));
    }
    cuerpo.appendChild(el(
      "p",
      "dam-sin-c",
      "No se genera el Formato C. La liquidación de la deuda tributaria queda fuera de este ejercicio."
    ));
  }

  function lineasDescripcion(items, telefono) {
    var lineas = [];
    var i;
    var series;
    var imeis;
    for (i = 0; i < items.length; i++) {
      lineas.push("Ítem " + (i + 1) + ": " + (texto(items[i] && items[i].descripcion) || "—"));
    }
    if (!lineas.length) {
      lineas.push("—");
    }
    if (!telefono) {
      return lineas;
    }
    lineas.push("Esta subpartida está en el párrafo de 2026. Por cada equipo: número de serie único e IMEI.");
    for (i = 0; i < items.length; i++) {
      series = trozos(items[i] && items[i].series);
      imeis = trozos(items[i] && items[i].imeis);
      lineas.push("Ítem " + (i + 1) + " — series: " + (series.length ? series.join("; ") : "sin dato"));
      lineas.push("Ítem " + (i + 1) + " — IMEI: " + (imeis.length ? imeis.join("; ") : "sin dato"));
    }
    return lineas;
  }

  function nota2026(telefono, subpartida) {
    var nota = el("aside", "dam-nota-2026");
    var aplica = el("p", "dam-nota-aplica");
    nota.appendChild(el("h4", null, "Párrafo de 2026 en la casilla 7.35. No es una casilla nueva."));
    nota.appendChild(el(
      "p",
      "dam-nota-vigencia",
      "Vigencia: el párrafo rige desde el 5 de octubre de 2026 (Resolución de Superintendencia N.º 000129-2026/SUNAT)."
    ));
    nota.appendChild(el("p", "dam-cita", NOTA_2026));
    if (telefono) {
      aplica.textContent = "Esta serie sí activa el párrafo: la subpartida es " +
        (texto(subpartida) || "8517.13.00.00 o 8517.14.00.00") +
        ". Arriba deben constar el número de serie único y el IMEI de cada equipo.";
    } else {
      aplica.textContent = "En esta serie no se activa. La subpartida no es 8517.13.00.00 ni 8517.14.00.00. La descripción de los relojes no lleva número de serie ni IMEI.";
    }
    nota.appendChild(aplica);
    return nota;
  }

  function pintarRotulos(cuerpo, op) {
    var transporte = op.transporte || {};
    var comercial = op.comercial || {};
    var agente = (op.partes || {}).agenteAduanas || {};
    var grid = grupo(cuerpo, "Rótulos");
    var tipo = texto(comercial.tipoDespacho);
    agregarCasilla(grid, {
      id: "aduana",
      rotulo: "ADUANA – CÓDIGO",
      lineas: conCodigo(transporte.aduana, transporte.codigoAduana)
    });
    agregarCasilla(grid, {
      id: "orden",
      rotulo: "N.º ORDEN",
      lineas: [
        anioDeclaracion(agente) + " " + ORDEN_SUPUESTO,
        "SUPUESTO"
      ],
      leyenda: "Año y seis caracteres, como pide el instructivo. El número es del ejercicio; no es una orden real."
    });
    agregarCasilla(grid, {
      id: "destinacion",
      rotulo: "DESTINACIÓN",
      lineas: [texto(comercial.destinacion) || "—", texto(comercial.destinacionDescripcion)]
    });
    agregarCasilla(grid, {
      id: "modalidad",
      rotulo: "MODALIDAD",
      lineas: [texto(comercial.modalidad) || "—", texto(comercial.modalidadDescripcion)]
    });
    agregarCasilla(grid, {
      id: "tipo-despacho",
      rotulo: "TIPO DESPACHO",
      lineas: tipo ? [tipo] : [],
      vacia: !tipo,
      leyenda: tipo ? "" : "PENDIENTE DE VERIFICAR. El instructivo detalla tipos para admisión temporal, tránsito y reembarque. No trae una lista para la importación para el consumo."
    });
    agregarCasilla(grid, {
      id: "numero-declaracion",
      rotulo: "NÚMERO DE DECLARACIÓN DE IMPORTACIÓN",
      vacia: true,
      leyenda: "No llenar"
    });
  }

  function pintarIdentificacion(cuerpo, importador) {
    var grid = grupo(cuerpo, "1. Identificación");
    agregarCasilla(grid, {
      num: "1.1",
      rotulo: "Importador",
      lineas: [texto(importador.razonSocial) || "—"]
    });
    agregarCasilla(grid, {
      num: "1.2",
      rotulo: "Código y documento de identificación",
      lineas: lineasDocumento(importador.codigoDocumento, importador.ruc)
    });
    agregarCasilla(grid, {
      num: "1.3",
      rotulo: "Dirección del importador",
      lineas: [texto(importador.direccion) || "—"]
    });
    agregarCasilla(grid, {
      num: "1.4",
      rotulo: "Código de ubicación geográfica",
      lineas: [texto(importador.ubigeo) || "PENDIENTE DE VERIFICAR"],
      leyenda: "Ubigeo. El código no está en las fuentes de esta carpeta."
    });
  }

  function pintarRegistro(cuerpo) {
    var grid = grupo(cuerpo, "2. Registro de aduana");
    agregarCasilla(grid, {
      num: "2",
      rotulo: "Registro de aduana",
      ancho: true,
      vacia: true,
      lineas: ["N.º de declaración:", "Fecha de numeración:", "Sujeto a:"],
      leyenda: "Uso exclusivo de la autoridad aduanera. No se llena."
    });
  }

  function pintarTransporte(cuerpo, op) {
    var transporte = op.transporte || {};
    var maritimo = (op.partes || {}).agenteMaritimo || {};
    var grid = grupo(cuerpo, "3. Transporte");
    agregarCasilla(grid, {
      num: "3.1",
      rotulo: "Empresa de transporte – RUC",
      lineas: [
        texto(maritimo.razonSocial) || "—",
        "RUC " + (texto(maritimo.ruc) || "—")
      ],
      leyenda: "En transporte marítimo se consigna el RUC del agente marítimo."
    });
    agregarCasilla(grid, {
      num: "3.2",
      rotulo: "N.º de manifiesto",
      lineas: [texto(transporte.manifiesto) || "PENDIENTE DE VERIFICAR"],
      leyenda: texto(transporte.manifiestoNota) || "Código de aduana de ingreso, año y número."
    });
    agregarCasilla(grid, {
      num: "3.3",
      rotulo: "Vía de transporte – código",
      lineas: [(texto(transporte.via) || "—") + (texto(transporte.viaDescripcion) ? ". " + texto(transporte.viaDescripcion) : "")]
    });
    agregarCasilla(grid, {
      num: "3.4",
      rotulo: "Fecha término de la descarga",
      lineas: fechaUsable(transporte.fechaTerminoDescarga) ? [fechaDam(transporte.fechaTerminoDescarga)] : ["PENDIENTE DE VERIFICAR"],
      leyenda: fechaUsable(transporte.fechaTerminoDescarga)
        ? "El instructivo dice: «3.4 Fecha Término Descarga .- Se indica la fecha en que culmina la descarga de la mercancía.»"
        : LEYENDA_34
    });
    vacia(grid, "3.5", "Empresa de transporte (tránsito/reembarque) – código", "Tránsito o reembarque. En la importación para el consumo no se llena.");
    vacia(grid, "3.6", "Unidad de transporte (tránsito/reembarque)", "Nombre de la nave o matrícula en tránsito o reembarque. En la importación para el consumo queda vacía. El buque del conocimiento de embarque no se copia aquí.");
    vacia(grid, "3.7", "Aduana de destino/salida – código", "Tránsito, reembarque, Convenio Peruano-Colombiano o Ley de Amazonía. No se llena.");
  }

  function pintarAlmacen(cuerpo, op) {
    var deposito = (op.transporte || {}).deposito || {};
    var grid = grupo(cuerpo, "4. Almacén aduanero");
    agregarCasilla(grid, {
      num: "4.1",
      rotulo: "Depósito temporal – RUC",
      lineas: [
        texto(deposito.razonSocial) || "—",
        "RUC " + (texto(deposito.ruc) || "—")
      ]
    });
    vacia(grid, "4.2", "Depósito aduanero – RUC", "Régimen de depósito aduanero, o régimen precedente. En este caso no se llena.");
    vacia(grid, "4.3", "Plazo solicitado", "Depósito, admisión temporal, tránsito o reembarque. No se llena.");
  }

  function pintarTransaccion(cuerpo, comercial) {
    var grid = grupo(cuerpo, "5. Transacción");
    agregarCasilla(grid, {
      num: "5.1",
      rotulo: "Entidad financiera – código",
      lineas: conCodigo(comercial.entidadFinanciera, comercial.codigoEntidadFinanciera),
      leyenda: "Nombre ficticio del ejercicio. El código de la tabla no está en esta carpeta."
    });
    agregarCasilla(grid, {
      num: "5.2",
      rotulo: "Modalidad de pago – código",
      lineas: [(texto(comercial.formaPago) || "—") + (texto(comercial.formaPagoDescripcion) ? ". " + texto(comercial.formaPagoDescripcion) : "")]
    });
  }

  function pintarValor(cuerpo, cifras) {
    var grid = grupo(cuerpo, "6. Valor aduana");
    dinero(grid, "6.1", "FOB", cifras.fobUsd);
    dinero(grid, "6.2", "Flete", cifras.fleteUsd);
    dinero(grid, "6.3", "Seguro", cifras.seguroUsd);
    dinero(grid, "6.4", "Total ajustes", cifras.ajustesUsd);
    dinero(grid, "6.5", "Valor aduana", cifras.valorAduanaUsd);
  }

  function pintarSerie(cuerpo, op, cifras) {
    var transporte = op.transporte || {};
    var comercial = op.comercial || {};
    var serie = op.serie || {};
    var items = op.items || [];
    var grid = grupo(cuerpo, "7. Declaración de mercancías");
    var telefono = esTelefono(serie.subpartida);
    var unidad = "";
    var i;
    var caja735;
    var valor735;
    for (i = 0; i < items.length; i++) {
      if (!texto(items[i].unidadComercial)) {
        continue;
      }
      if (!unidad) {
        unidad = texto(items[i].unidadComercial);
      } else if (unidad !== texto(items[i].unidadComercial)) {
        unidad = "";
        break;
      }
    }
    agregarCasilla(grid, {
      num: "7.1",
      rotulo: "N.º de serie / total de series",
      lineas: ["1/1"],
      leyenda: "Una sola serie. No se usa el Formato A1."
    });
    agregarCasilla(grid, {
      num: "7.2",
      rotulo: "Ítems del Formato B",
      lineas: [listaNumeros(items.length)]
    });
    vacia(grid, "7.3", "N.º de declaración precedente – serie", "No hay declaración precedente. No se llena.");
    vacia(grid, "7.4", "Número de certificado de reposición – ítem", "No hay certificado de reposición. No se llena.");
    vacia(grid, "7.5", "Código aplicable a la ultractividad", "No hay ultractividad. No se llena.");
    agregarCasilla(grid, {
      num: "7.6",
      rotulo: "Puerto de embarque – código",
      lineas: conCodigo(transporte.puertoEmbarque, transporte.codigoPuertoEmbarque)
    });
    agregarCasilla(grid, {
      num: "7.7",
      rotulo: "Fecha de embarque",
      lineas: [fechaDam(transporte.fechaEmbarque)]
    });
    agregarCasilla(grid, {
      num: "7.8",
      rotulo: "Documento de transporte – detalle",
      lineas: [texto(transporte.numeroBl) || "—", "BL. Conocimiento de embarque."]
    });
    vacia(grid, "7.9", "N.º de certificado de origen / fecha", "En blanco. El certificado de origen está fuera de alcance.");
    agregarCasilla(grid, {
      num: "7.10",
      rotulo: "Cantidad y unidad comercial",
      lineas: [cantidad(cifras.unidades) + (unidad ? " " + unidad : "")]
    });
    vacia(grid, "7.11", "No llenar", "No llenar, como dice el instructivo.");
    agregarCasilla(grid, {
      num: "7.12",
      rotulo: "Cantidad de bultos",
      lineas: [cantidad(cifras.bultos)]
    });
    agregarCasilla(grid, {
      num: "7.13",
      rotulo: "Clase de bultos",
      lineas: conCodigo(serie.claseBulto, serie.codigoClaseBulto)
    });
    agregarCasilla(grid, {
      num: "7.14",
      rotulo: "Peso neto, kilos",
      lineas: [cantidad(cifras.pesoNetoKg) + " kg"]
    });
    agregarCasilla(grid, {
      num: "7.15",
      rotulo: "Peso bruto, kilos",
      lineas: [cantidad(cifras.pesoBrutoKg) + " kg"]
    });
    agregarCasilla(grid, {
      num: "7.16",
      rotulo: "Cantidad y unidad física",
      lineas: [cantidad(cifras.unidades) + (texto(serie.unidadFisica) ? " " + texto(serie.unidadFisica) : "")],
      leyenda: texto(serie.unidadFisicaNota) || "SUPUESTO. PENDIENTE DE VERIFICAR contra el arancel."
    });
    vacia(grid, "7.17", "Cantidad, unidad equivalente o de producción", "Reposición o admisión temporal para perfeccionamiento activo. No se llena.");
    vacia(grid, "7.18", "Ítem CIP", "Cuadro insumo-producto. No se llena.");
    agregarCasilla(grid, {
      num: "7.19",
      rotulo: "Subpartida nacional – dígito verificador",
      lineas: [
        texto(serie.subpartida) || "—",
        texto(serie.subpartidaNota),
        "Dígito verificador: " + (texto(serie.digitoSubpartida) || "PENDIENTE DE VERIFICAR")
      ]
    });
    vacia(grid, "7.20", "Tipo", "Vacía. PENDIENTE DE VERIFICAR si el arancel pide tipo para esta subpartida.");
    vacia(grid, "7.21", "Subpartida NALADISA/NABANDINA – DV", "Sin NALADISA ni NABANDINA. No se llena.");
    vacia(grid, "7.22", "TM", "Sin tipo de margen. No se llena.");
    vacia(grid, "7.23", "TPI", "Sin trato preferencial internacional. No se llena.");
    vacia(grid, "7.24", "TPN", "Sin trato preferencial nacional. No se llena.");
    vacia(grid, "7.25", "Código liberatorio", "Sin código liberatorio. No se llena.");
    agregarCasilla(grid, {
      num: "7.26",
      rotulo: "País de origen",
      lineas: conCodigo(serie.paisOrigen, serie.codigoPaisOrigen)
    });
    agregarCasilla(grid, {
      num: "7.27",
      rotulo: "País de adquisición",
      lineas: conCodigo(serie.paisAdquisicion, serie.codigoPaisAdquisicion)
    });
    vacia(grid, "7.28", "Régimen aplicable", "No llenar");
    agregarCasilla(grid, {
      num: "7.29",
      rotulo: "FOB en moneda de la transacción – código",
      lineas: [
        moneda(cifras.fobUsd) + " USD",
        texto(comercial.moneda),
        "Código de moneda: " + (texto(comercial.codigoMoneda) || "PENDIENTE DE VERIFICAR")
      ]
    });
    dinero(grid, "7.30", "FOB US$", cifras.fobUsd);
    dinero(grid, "7.31", "Flete US$", cifras.fleteUsd);
    agregarCasilla(grid, {
      num: "7.32",
      rotulo: "Seguro US$ – tipo de seguro",
      lineas: [
        moneda(cifras.seguroUsd) + " USD",
        "Tipo " + (texto((op.valoracion || {}).tipoSeguro) || "—") + ". " +
          (texto((op.valoracion || {}).tipoSeguro) === "2"
            ? "Con póliza de seguro individual"
            : texto((op.valoracion || {}).tipoSeguroDescripcion))
      ]
    });
    dinero(grid, "7.33", "Ajuste valor US$", cifras.ajustesUsd);
    dinero(grid, "7.34", "Valor aduana US$", cifras.valorAduanaUsd);
    caja735 = agregarCasilla(grid, {
      num: "7.35",
      rotulo: "Descripción de mercancía",
      ancho: true,
      clase: "dam-735",
      lineas: lineasDescripcion(items, telefono),
      leyenda: "Denominación comercial, presentación, material y uso, como pide el instructivo. Marca y modelo van también al Formato B."
    });
    valor735 = caja735.querySelector(".dam-valor");
    if (valor735) {
      valor735.className += " dam-desc";
    }
    caja735.appendChild(nota2026(telefono, serie.subpartida));
    agregarCasilla(grid, {
      num: "7.36",
      rotulo: "Número de factura comercial – fecha",
      lineas: [
        texto(comercial.numeroFactura) || "—",
        fechaDam(comercial.fechaFactura)
      ]
    });
    agregarCasilla(grid, {
      num: "7.37",
      rotulo: "Información complementaria",
      ancho: true,
      vacia: true,
      leyenda: "Disponible. En el ejemplo queda vacía: marca y modelo van al Formato B."
    });
    vacia(grid, "7.38", "Observación", "Uso del funcionario. Vacía.");
    vacia(grid, "7.39", "Tipo de observación", "Uso del funcionario. Vacía.");
  }

  function pintarDeclarante(cuerpo, op) {
    var agente = (op.partes || {}).agenteAduanas || {};
    var grid = grupo(cuerpo, "8. Declarante");
    agregarCasilla(grid, {
      num: "8",
      rotulo: "Declarante",
      ancho: true,
      lineas: [
        texto(agente.razonSocial) || "—",
        "RUC " + (texto(agente.ruc) || "—"),
        "Fecha de formulación: " + fechaDam(agente.fechaFormulacion)
      ],
      leyenda: "Agente de aduanas. La firma y el sello no se consignan en esta pantalla."
    });
  }

  function pintarContenedores(cuerpo, op) {
    var transporte = op.transporte || {};
    var grid = grupo(cuerpo, "9. N.º de contenedores / precintos");
    var lineas = [
      "Contenedor: " + (texto(transporte.contenedorNumero) || "—"),
      "Precinto: " + (texto(transporte.precinto) || "—")
    ];
    if (texto(transporte.contenedorTipo)) {
      lineas.push("Tipo: " + texto(transporte.contenedorTipo));
    }
    if (texto(transporte.contenedorNota)) {
      lineas.push(texto(transporte.contenedorNota));
    }
    if (texto(transporte.marcasBultos)) {
      lineas.push("Marcas de los bultos: " + texto(transporte.marcasBultos));
    }
    agregarCasilla(grid, {
      num: "9",
      rotulo: "Contenedores y precintos",
      ancho: true,
      lineas: lineas,
      leyenda: "Es un rubro, no una subcasilla 9.1. Marcas y números de los bultos, o número de contenedor y precinto."
    });
  }

  function pintarReservados(cuerpo) {
    var grid = grupo(cuerpo, "10 a 15");
    vacia(grid, "10", "Diligencia aduanera", "Uso exclusivo del funcionario aduanero. No se llena.");
    vacia(grid, "11", "Control de funcionario aduanero", "Uso exclusivo de la autoridad aduanera. Tránsito, o regularización de admisión. No se llena.");
    vacia(grid, "12", "Control de embarque / tornaguía", "Uso exclusivo de la autoridad aduanera, en tránsito o reembarque. No se llena.");
    vacia(grid, "13", "Depósito aduanero", "Reservada para el régimen de depósito aduanero. No se llena.");
    vacia(grid, "14", "Transportista", "La llena el transportista en tránsito o reembarque. No se llena.");
    vacia(grid, "15", "Validación de datos", "Uso exclusivo de la Administración Aduanera en la numeración. No se llena.");
  }

  function pintarFormatoA(op) {
    var cuerpo = prepararHoja("dam-formato-a");
    var importador;
    if (!cuerpo) {
      return;
    }
    importador = (op.partes || {}).importador || {};
    cuerpo.appendChild(el("p", "kicker", "DAM. Formato A"));
    cuerpo.appendChild(el("p", "doc-subtitulo", "Ingreso de mercancías. Datos generales y primera serie."));
    cuerpo.appendChild(el(
      "p",
      "doc-leyenda",
      "Casillas en el orden del instructivo DESPA-IT.00.04. Las que no corresponden a esta importación para el consumo se ven con su leyenda y vacías. Un código que no está en las fuentes de esta carpeta dice PENDIENTE DE VERIFICAR."
    ));
    pintarRotulos(cuerpo, op);
    pintarIdentificacion(cuerpo, importador);
    pintarRegistro(cuerpo);
    pintarTransporte(cuerpo, op);
    pintarAlmacen(cuerpo, op);
    pintarTransaccion(cuerpo, op.comercial || {});
    pintarValor(cuerpo, cifrasDe(op));
    pintarSerie(cuerpo, op, cifrasDe(op));
    pintarDeclarante(cuerpo, op);
    pintarContenedores(cuerpo, op);
    pintarReservados(cuerpo);
    cierreSinC(cuerpo, "Serie 1/1. No se usa el Formato A1.");
  }

  function pintarItemB(cuerpo, item, indice, total, op, cifras) {
    var comercial = op.comercial || {};
    var serie = op.serie || {};
    var grid = grupo(cuerpo, "5. Descripción de la mercancía. Ítem " + (indice + 1) + "/" + total);
    var lugarVersion = [texto(comercial.incotermLugar), texto(comercial.incotermVersion)].filter(Boolean).join("-");
    var leyendaVersion = texto(comercial.incotermVersion) === "4"
      ? "La segunda subcasilla lleva la ciudad y la versión. El 4 es Incoterms 2020, según el instructivo."
      : "La segunda subcasilla lleva la ciudad y el código de versión del Incoterm.";
    item = item || {};
    agregarCasilla(grid, {
      num: "5.1",
      rotulo: "N.º de ítem / total",
      lineas: [(indice + 1) + "/" + total],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.2",
      rotulo: "N.º de factura comercial",
      lineas: [texto(comercial.numeroFactura) || "—"],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.3",
      rotulo: "Fecha de la factura",
      lineas: [fechaDam(comercial.fechaFactura)],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.4",
      rotulo: "Incoterm – ciudad",
      lineas: [texto(comercial.incoterm) || "—", lugarVersion || "—"],
      leyenda: leyendaVersion,
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.5",
      rotulo: "Código de moneda",
      lineas: [texto(comercial.codigoMoneda) || "PENDIENTE DE VERIFICAR", texto(comercial.moneda)],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.6",
      rotulo: "Tipo de valor declarado",
      lineas: [(texto(comercial.tipoValor) || "—") + (texto(comercial.tipoValorDescripcion) ? ". " + texto(comercial.tipoValorDescripcion) : "")],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.7",
      rotulo: "País de origen",
      lineas: conCodigo(serie.paisOrigen, serie.codigoPaisOrigen),
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.8",
      rotulo: "País de embarque",
      lineas: conCodigo(serie.paisEmbarque, serie.codigoPaisEmbarque),
      leyenda: "País donde se embarcó la mercancía con destino al Perú. Una escala no cambia este país.",
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.9",
      rotulo: "FOB unitario US$",
      lineas: [formatoSeis(item.precioUnitarioUsd)],
      leyenda: "Seis decimales, como pide el instructivo para el Formato B.",
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.10",
      rotulo: "Ajuste unitario",
      lineas: [ajusteUnitario(item, cifras)],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.11",
      rotulo: "Cantidad y unidad comercial",
      lineas: [cantidad(item.cantidad) + (texto(item.unidadComercial) ? " " + texto(item.unidadComercial) : "")],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.12",
      rotulo: "Nombre del producto",
      ancho: true,
      lineas: [nombreComun(item)],
      leyenda: "Nombre común. La marca va en 5.13, el modelo en 5.14 y la descripción larga en 5.19.",
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.13",
      rotulo: "Marca comercial",
      lineas: [texto(item.marca) || "—"],
      idItem: indice + 1
    });
    agregarCasilla(grid, {
      num: "5.14",
      rotulo: "Modelo",
      lineas: [texto(item.modelo) || "—"],
      idItem: indice + 1
    });
    vaciaItem(grid, "5.15", "Año / aro", "Año de fabricación de vehículos automotores y maquinarias. En bicicletas, la dimensión del aro. En los relojes queda vacía.", indice + 1);
    vaciaItem(grid, "5.16", "Estado", "El instructivo trae la casilla. El ejemplo no declara un código. PENDIENTE DE VERIFICAR.", indice + 1);
    vaciaItem(grid, "5.17", "Identificador", "El instructivo consigna el código 3, producto digital. El ejemplo no lo declara.", indice + 1);
    vaciaItem(grid, "5.18", "Posición frente al despacho simplificado / envío gratis", "El ejemplo no declara despacho simplificado ni envío gratis.", indice + 1);
    agregarCasilla(grid, {
      num: "5.19",
      rotulo: "Características, tipo, clase, variedad, uso o aplicación, presentación, material",
      ancho: true,
      lineas: [texto(item.descripcion) || "—"],
      leyenda: "Alineada con la casilla 7.35: material, uso y presentación van en la descripción.",
      idItem: indice + 1
    });
    vaciaItem(grid, "5.20", "Observaciones", "Casilla del funcionario o del importador para completar lo declarado. En el ejemplo queda vacía.", indice + 1);
  }

  function ajusteUnitario(item, cifras) {
    var cantidadItem;
    var valor;
    if (!cifras.ajustesUsd) {
      return formatoSeis(0);
    }
    cantidadItem = Number(item.cantidad) || 0;
    valor = window.Calculos && typeof Calculos.valorItemUsd === "function" ? Calculos.valorItemUsd(item) : 0;
    if (!cantidadItem || !cifras.fobUsd) {
      return "—";
    }
    return formatoSeis((cifras.ajustesUsd * (valor / cifras.fobUsd)) / cantidadItem);
  }

  function vaciaItem(grid, num, rotulo, leyenda, item) {
    var caja = vacia(grid, num, rotulo, leyenda);
    if (item) {
      caja.setAttribute("data-item", String(item));
    }
    return caja;
  }

  function pregunta(lista, num, enunciado, respuesta, leyenda) {
    var li = el("li", "dam-pregunta" + (respuesta ? "" : " dam-vacia"));
    var cuerpo = el("div", "dam-enunciado");
    li.setAttribute("data-casilla", num);
    li.appendChild(el("span", "dam-num", num));
    cuerpo.appendChild(parrafo("dam-enunciado-texto", [enunciado]));
    if (leyenda) {
      cuerpo.appendChild(parrafo("dam-leyenda", [leyenda]));
    }
    li.appendChild(cuerpo);
    li.appendChild(el("span", "dam-respuesta", respuesta || ""));
    lista.appendChild(li);
  }

  function pintarIntermediario(cuerpo) {
    var sec = el("section", "dam-rubro");
    var lista;
    sec.appendChild(el("h3", null, "6. Intermediario entre importador y proveedor extranjero"));
    sec.appendChild(el(
      "p",
      "dam-leyenda dam-leyenda-rubro",
      "Marque 1 en caso afirmativo y 2 en caso negativo. En el ejemplo la respuesta es No, que corresponde al 2. No hay intermediario: el resto queda vacío."
    ));
    lista = el("ol", "dam-preguntas");
    sec.appendChild(lista);
    cuerpo.appendChild(sec);
    pregunta(lista, "6.1", "¿Participó en la Transacción Comercial algún intermediario denominado también Agente, Comisionista u otro?", "No");
    pregunta(lista, "6.2", "Nombre del intermediario", "", "Sólo si la 6.1 es afirmativa. No se llena.");
    pregunta(lista, "6.3", "Dirección", "", "Sólo si la 6.1 es afirmativa. No se llena.");
    pregunta(lista, "6.4", "Ciudad", "", "Sólo si la 6.1 es afirmativa. No se llena.");
    pregunta(lista, "6.5", "País", "", "Sólo si la 6.1 es afirmativa. No se llena.");
    pregunta(lista, "6.6", "Tipo", "", "Sólo si la 6.1 es afirmativa. No se llena.");
    pregunta(lista, "6.7", "E-mail, web", "", "Sólo si la 6.1 es afirmativa. No se llena.");
  }

  function pintarCondiciones(cuerpo) {
    var sec = el("section", "dam-rubro");
    var lista;
    sec.appendChild(el("h3", null, "7. Condiciones de la transacción"));
    sec.appendChild(el(
      "p",
      "dam-leyenda dam-leyenda-rubro",
      "Marque 1 en caso afirmativo y 2 en caso negativo. En el ejemplo las respuestas son No, que corresponde al 2. Por eso no hay adiciones."
    ));
    lista = el("ol", "dam-preguntas");
    sec.appendChild(lista);
    cuerpo.appendChild(sec);
    pregunta(lista, "7.1", "¿Existe Vinculación entre el importador y el proveedor extranjero?", "No");
    pregunta(lista, "7.2", "¿Ha influido la vinculación en el precio de las mercancías importadas?", "No", "Si respondió afirmativamente en la casilla anterior.");
    pregunta(lista, "7.3", "¿Se aproxima mucho el valor de transacción de las mercancías importadas a un valor de los mencionados en el Art. 1.2.b) del Acuerdo del Valor de la OMC?", "No", "Si respondió afirmativamente en la casilla 7.1.");
    pregunta(lista, "7.4", "¿Puede Ud. disponer libremente de las mercancías importadas, sin restricciones para su cesión o utilización, de acuerdo a lo señalado en el art. 1.1.a) del Acuerdo del Valor de la OMC?", "No");
    pregunta(lista, "7.5", "La venta o el precio de las mercancías importadas ¿depende de condiciones o contraprestaciones, con relación a dichas mercancías?", "No");
    pregunta(lista, "7.6", "¿Puede determinarse el valor de las condiciones o contraprestaciones?", "No");
    pregunta(lista, "7.7", "¿Existen pagos indirectos por las mercancías importadas?", "No");
    pregunta(lista, "7.8", "¿Existen descuentos retroactivos?", "No");
    pregunta(lista, "7.9", "¿Existen Cánones y Derechos de Licencia (Regalías) relativos a las mercancías importadas que el importador está obligado a pagar, directa o indirectamente, como condición de la venta?", "No");
    pregunta(lista, "7.10", "¿Está la venta condicionada por un acuerdo según el cual, después de la nacionalización, una parte del producto de la reventa, cesión o utilización posterior de las mercancías importadas, revierte directa o indirectamente al proveedor?", "No");
    pregunta(lista, "7.11", "Además de la factura comercial ¿existe un contrato relativo a las mercancías importadas?", "No");
    pregunta(lista, "7.12", "¿Es un contrato global de suministro de larga duración? (Proyectos de inversión que requieren de una serie de importaciones de bienes que se irán ejecutando en varios meses o años).", "No");
    pregunta(lista, "7.13", "¿Contiene el contrato alguna cláusula de revisión del precio?", "No");
    pregunta(lista, "7.14", "¿Es usted intermediario y está importando a solicitud de su cliente?", "No");
    pregunta(lista, "7.15", "No llenar", "");
    pregunta(lista, "7.16 a 7.20", "Reservadas para uso posterior.", "", "El instructivo no les da enunciado. No se llenan.");
  }

  function dineroCero(grid, num, rotulo, leyenda) {
    return agregarCasilla(grid, {
      num: num,
      rotulo: rotulo,
      lineas: [moneda(0) + " USD"],
      leyenda: leyenda || ""
    });
  }

  function rotuloPendiente(grid, num, rotulo, leyenda) {
    return dineroCero(grid, num, rotulo, leyenda);
  }

  function leyendaRotuloImpreso() {
    return "Rótulos tomados de un formato B de 2007 (DUA, anterior a la DAM). PENDIENTE DE VERIFICAR contra el formato vigente.";
  }

  function pintarSeccion8(cuerpo, cifras) {
    var grid = grupo(cuerpo, "8. Determinación del valor");
    var notaAjuste = "";
    cuerpo.querySelector(".dam-rubro:last-child").insertBefore(
      el("p", "dam-leyenda dam-leyenda-rubro", "Valor en aduana del Formato B, método del valor de transacción. En este ejercicio los importes de la sección 8 se escriben con tres decimales, igual que el Formato A."),
      cuerpo.querySelector(".dam-rubro:last-child").querySelector(".dam-casillas")
    );
    if (cifras.ajustesUsd) {
      notaAjuste = "Hay un ajuste en la valoración. Las casillas 8.1.2 a 8.1.5 siguen en cero. PENDIENTE DE VERIFICAR en cuál repartirlo.";
    }
    agregarCasilla(grid, {
      num: "8.1",
      rotulo: "Base de cálculo",
      ancho: true,
      vacia: true,
      leyenda: "Encabezado de la sección. El monto va en las subcasillas."
    });
    dinero(grid, "8.1.1", "Precio neto según factura", cifras.fobUsd);
    rotuloPendiente(grid, "8.1.2", "Pagos indirectos", leyendaRotuloImpreso());
    rotuloPendiente(grid, "8.1.3", "Descuentos Retroactivos", leyendaRotuloImpreso());
    rotuloPendiente(grid, "8.1.4", "Otros Descuentos", leyendaRotuloImpreso());
    rotuloPendiente(grid, "8.1.5", "Gastos Transp, manipul. y entrega en el exterior", leyendaRotuloImpreso());
    dineroCero(grid, "8.1.6", "Otros", "Ventas sucesivas, diferencia de flete, valor mayor al facturado u otros gastos no detallados. En el ejemplo, cero.");
    agregarCasilla(grid, {
      id: "total-base",
      rotulo: "Total base de cálculo",
      ancho: true,
      vacia: true,
      leyenda: "Casilla reservada para uso posterior."
    });
    agregarCasilla(grid, {
      num: "8.2",
      rotulo: "Adiciones",
      ancho: true,
      vacia: true,
      leyenda: "Importes no incluidos en 8.1.1 y a cargo del importador. En el ejemplo no hay."
    });
    dineroCero(grid, "8.2.1", "Comisiones, corretajes, excepto las comisiones de compra");
    dineroCero(grid, "8.2.2", "Envases y embalajes");
    agregarCasilla(grid, {
      num: "8.2.3",
      rotulo: "Bienes y servicios suministrados por el importador, gratuitamente o a precio reducido",
      ancho: true,
      vacia: true,
      leyenda: "Utilizados en la producción y venta para la exportación de las mercancías importadas. El importe va en las subcasillas."
    });
    dineroCero(grid, "8.2.3.1", "Materiales, componentes, piezas, partes, elementos y artículos análogos incorporados a las mercancías importadas");
    dineroCero(grid, "8.2.3.2", "Herramientas, matrices, moldes y objetos similares utilizados para la producción de las mercancías importadas");
    dineroCero(grid, "8.2.3.3", "Materiales consumidos en la producción de las mercancías importadas");
    dineroCero(grid, "8.2.3.4", "Trabajos de ingeniería, desarrollo, creación y perfeccionamiento, trabajos artísticos, diseños, planos y croquis realizados fuera del Perú");
    dineroCero(grid, "8.2.4", "Cánones y derechos de licencia", "Si la casilla 7.9 fuera afirmativa. En el ejemplo es No, y el importe es cero.");
    dineroCero(grid, "8.2.5", "Cualquier parte del producto de la reventa, cesión o utilización posterior que revierta al vendedor", "Si la casilla 7.10 fuera afirmativa. En el ejemplo es No, y el importe es cero.");
    agregarCasilla(grid, {
      id: "total-adiciones",
      rotulo: "Total adiciones",
      ancho: true,
      vacia: true,
      leyenda: "Casilla reservada para uso posterior."
    });
    agregarCasilla(grid, {
      num: "8.3",
      rotulo: "Gastos de transporte",
      ancho: true,
      vacia: true,
      leyenda: "Encabezado. El flete va en 8.3.1."
    });
    dinero(grid, "8.3.1", "Gastos de transporte desde el lugar de embarque hasta el lugar de importación", cifras.fleteUsd);
    dineroCero(grid, "8.3.2", "Gastos de carga, descarga, manipulación en destino y otros gastos de entrega hasta el lugar de importación");
    agregarCasilla(grid, {
      id: "total-transporte",
      rotulo: "Total gastos de transporte",
      ancho: true,
      vacia: true,
      leyenda: "Casilla reservada para uso posterior."
    });
    dinero(grid, "8.4", "Total gastos de seguro", cifras.seguroUsd);
    agregarCasilla(grid, {
      num: "8.5",
      rotulo: "Deducciones. Importes incluidos en 8.1.1",
      ancho: true,
      vacia: true,
      leyenda: "En el ejemplo no hay deducciones."
    });
    dineroCero(grid, "8.5.1", "Gastos de entrega posteriores a la importación");
    dineroCero(grid, "8.5.2", "Gastos de construcción, armado, instalación, montaje, mantenimiento y asistencia técnica realizados después de la importación");
    dineroCero(grid, "8.5.3", "Derechos de aduana y otros tributos");
    dineroCero(grid, "8.5.4", "Intereses");
    dineroCero(grid, "8.5.5", "Otros gastos");
    agregarCasilla(grid, {
      id: "total-deducciones",
      rotulo: "Total deducciones",
      ancho: true,
      vacia: true,
      leyenda: "Casilla reservada para uso posterior." + (notaAjuste ? " " + notaAjuste : "")
    });
  }

  function pintarDeclaranteB(cuerpo, op) {
    var importador = (op.partes || {}).importador || {};
    var agente = (op.partes || {}).agenteAduanas || {};
    var grid = grupo(cuerpo, "Declarante del Formato B");
    agregarCasilla(grid, {
      id: "declarante-b",
      rotulo: "Responsable de los datos",
      ancho: true,
      lineas: [
        texto(importador.razonSocial) || "—",
        fraseDocumento(importador.codigoDocumento, importador.ruc),
        lineaSuscribe(agente)
      ],
      leyenda: "El dueño o consignatario responde por los datos. El instructivo precisa, además, que en ningún caso se considera declarante del Formato B al agente de aduana."
    });
  }

  function pintarFormatoB(op) {
    var cuerpo = prepararHoja("dam-formato-b");
    var partes;
    var importador;
    var proveedor;
    var comercial;
    var items;
    var cifras;
    var grid;
    var i;
    if (!cuerpo) {
      return;
    }
    partes = op.partes || {};
    importador = partes.importador || {};
    proveedor = partes.proveedor || {};
    comercial = op.comercial || {};
    items = op.items || [];
    cifras = cifrasDe(op);
    cuerpo.appendChild(el("p", "kicker", "DAM. Formato B"));
    cuerpo.appendChild(el("p", "doc-subtitulo", "Declaración del valor. Ingreso de mercancías."));
    cuerpo.appendChild(el(
      "p",
      "doc-leyenda",
      "Un proveedor y un Incoterm. " + items.length + " ítem" + (items.length === 1 ? "" : "s") +
        ". Con dos ítems no se usa el Formato B1. Los FOB unitarios van con seis decimales; la sección 8, con los tres decimales del Formato A."
    ));
    grid = grupo(cuerpo, "1. Identificación");
    agregarCasilla(grid, {
      num: "1.1",
      rotulo: "Importador o beneficiario",
      lineas: [texto(importador.razonSocial) || "—"]
    });
    agregarCasilla(grid, {
      num: "1.2",
      rotulo: "Código y documento de identificación",
      lineas: lineasDocumento(importador.codigoDocumento, importador.ruc)
    });
    agregarCasilla(grid, {
      num: "1.3",
      rotulo: "Nivel comercial",
      lineas: [
        (texto(comercial.nivelComercial) || "—") + (texto(comercial.nivelComercialDescripcion) ? ". " + texto(comercial.nivelComercialDescripcion) : ""),
        texto(comercial.nivelComercialNota)
      ]
    });
    grid = grupo(cuerpo, "2. Registro de aduana");
    agregarCasilla(grid, {
      num: "2",
      rotulo: "Registro de aduana",
      ancho: true,
      vacia: true,
      leyenda: "Uso exclusivo de la autoridad aduanera. No se llena."
    });
    grid = grupo(cuerpo, "3. Proveedor");
    agregarCasilla(grid, {
      num: "3.1",
      rotulo: "Nombre o razón social – código",
      lineas: [texto(proveedor.razonSocial) || "—", "Código: PENDIENTE DE VERIFICAR"],
      leyenda: "El instructivo pide también el código, a partir de su comunicación por la autoridad. Esa tabla no está en esta carpeta."
    });
    agregarCasilla(grid, {
      num: "3.2",
      rotulo: "Condición",
      lineas: [(texto(proveedor.condicion) || "—") + (texto(proveedor.condicionDescripcion) ? ". " + texto(proveedor.condicionDescripcion) : "")]
    });
    agregarCasilla(grid, {
      num: "3.3",
      rotulo: "Dirección",
      lineas: [texto(proveedor.direccion) || "—"]
    });
    agregarCasilla(grid, {
      num: "3.4",
      rotulo: "Ciudad",
      lineas: [texto(proveedor.ciudad) || "—"]
    });
    agregarCasilla(grid, {
      num: "3.5",
      rotulo: "País",
      lineas: conCodigo(proveedor.pais, proveedor.codigoPais)
    });
    vacia(grid, "3.6", "Teléfono", "Sólo si hay dato. El ejemplo no lo trae.");
    vacia(grid, "3.7", "Fax", "Sólo si hay dato. El ejemplo no lo trae.");
    vacia(grid, "3.8", "Página web", "Cuando corresponda. El ejemplo no la trae.");
    vacia(grid, "3.9", "E-mail", "Cuando corresponda. El ejemplo no lo trae.");
    grid = grupo(cuerpo, "4. Transacción");
    agregarCasilla(grid, {
      num: "4.1",
      rotulo: "Naturaleza",
      lineas: [(texto(comercial.naturaleza) || "—") + (texto(comercial.naturalezaDescripcion) ? ". " + texto(comercial.naturalezaDescripcion) : "")]
    });
    agregarCasilla(grid, {
      num: "4.2",
      rotulo: "Forma de envío",
      lineas: [(texto(comercial.formaEnvio) || "—") + (texto(comercial.formaEnvioDescripcion) ? ". " + texto(comercial.formaEnvioDescripcion) : "")]
    });
    for (i = 0; i < items.length; i++) {
      pintarItemB(cuerpo, items[i], i, items.length, op, cifras);
    }
    pintarIntermediario(cuerpo);
    pintarCondiciones(cuerpo);
    pintarSeccion8(cuerpo, cifras);
    pintarDeclaranteB(cuerpo, op);
    cierreSinC(cuerpo, items.length <= 2 ? "No se usa el Formato B1." : "El instructivo usa el Formato B1 cuando hay más de dos ítems. Esta pantalla los sigue en el mismo Formato B.");
  }

  function pintar(operacion) {
    var op = operacion || {};
    pintarFormatoA(op);
    pintarFormatoB(op);
  }

  function intentarPintar() {
    if (window.Modelo && typeof Modelo.obtener === "function") {
      var op = Modelo.obtener();
      if (op) {
        pintar(op);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", intentarPintar);
  } else {
    intentarPintar();
  }

  return {
    pintar: pintar
  };
})();

window.DAM = Dam;
