/* Textos fijos del modo didáctico.
   file://: script clásico, sin módulos y sin fetch.
   El paso 8 debe leer Ayuda.lista y sus documentos
   (factura, packing, bl, dam). No copies estos textos a otro archivo. */

var Ayuda = (function () {
  var SIN_CASILLA = "No tiene casilla en la DAM. El instructivo no le asigna casilla en la importación para el consumo.";
  var BLOQUES = { partes: true, transporte: true, comercial: true, items: true, valoracion: true };
  var lista = [];
  var porId = {};
  var porRuta = {};

  function dato(o) {
    var entrada;
    var i;
    var obligatorias = ["id", "bloque", "etiqueta", "queEs", "quien", "documento", "factura", "packing", "bl", "dam"];
    for (i = 0; i < obligatorias.length; i++) {
      if (!o[obligatorias[i]]) {
        throw new Error("Ayuda incompleta: " + (o.id || "sin id") + " / " + obligatorias[i]);
      }
    }
    if (!BLOQUES[o.bloque]) {
      throw new Error("Bloque no previsto: " + o.id);
    }
    if (o.sinCasillaDam === true && o.dam.indexOf("No tiene casilla en la DAM") !== 0) {
      throw new Error("Debe empezar diciendo que no tiene casilla: " + o.id);
    }
    entrada = {
      id: o.id,
      bloque: o.bloque,
      etiqueta: o.etiqueta,
      rutas: o.rutas || [],
      ancla: o.ancla || "",
      selector: o.selector || "",
      porItem: o.porItem === true,
      calculado: o.calculado === true,
      amplia: o.amplia === true || o.sinCasillaDam === true,
      sinCasillaDam: o.sinCasillaDam === true,
      queEs: o.queEs,
      quien: o.quien,
      documento: o.documento,
      documentos: {
        factura: o.factura,
        packing: o.packing,
        bl: o.bl,
        dam: o.dam
      }
    };
    if (porId[entrada.id]) {
      throw new Error("Id repetido: " + entrada.id);
    }
    porId[entrada.id] = entrada;
    for (i = 0; i < entrada.rutas.length; i++) {
      if (porRuta[entrada.rutas[i]]) {
        throw new Error("Ruta repetida: " + entrada.rutas[i]);
      }
      porRuta[entrada.rutas[i]] = entrada;
    }
    lista.push(entrada);
    return entrada;
  }

  function linea(titulo, texto, claseExtra) {
    var span = document.createElement("span");
    var fuerte = document.createElement("strong");
    span.className = "ayuda-linea" + (claseExtra ? " " + claseExtra : "");
    fuerte.textContent = titulo + " ";
    span.appendChild(fuerte);
    span.appendChild(document.createTextNode(texto));
    return span;
  }

  function crearCaja(entrada) {
    var caja = document.createElement("span");
    var claseDam = "ayuda-dam" + (entrada.sinCasillaDam ? " ayuda-dam-sin" : "");
    caja.className = "ayuda-campo" + (entrada.amplia ? " ayuda-amplia" : "");
    caja.setAttribute("data-ayuda-id", entrada.id);
    caja.setAttribute("data-bloque", entrada.bloque);
    caja.hidden = true;
    caja.appendChild(linea("Qué es.", entrada.queEs));
    caja.appendChild(linea("Quién lo llena.", entrada.quien));
    caja.appendChild(linea("De qué documento sale.", entrada.documento));
    caja.appendChild(linea("En la DAM.", entrada.documentos.dam, claseDam));
    return caja;
  }

  function buscarNodos(entrada) {
    var nodos = [];
    var i;
    var hallados;
    var el;
    for (i = 0; i < entrada.rutas.length; i++) {
      el = document.querySelector('#formulario [data-ruta="' + entrada.rutas[i] + '"]');
      if (el) {
        nodos.push(el);
      }
    }
    if (entrada.ancla) {
      el = document.getElementById(entrada.ancla);
      if (el) {
        nodos.push(el);
      }
    }
    if (entrada.selector) {
      hallados = document.querySelectorAll(entrada.selector);
      for (i = 0; i < hallados.length; i++) {
        nodos.push(hallados[i]);
      }
    }
    return nodos;
  }

  function montar() {
    var i;
    var j;
    var entrada;
    var nodos;
    var padre;
    for (i = 0; i < lista.length; i++) {
      entrada = lista[i];
      nodos = buscarNodos(entrada);
      for (j = 0; j < nodos.length; j++) {
        padre = nodos[j].closest(".campo") || nodos[j].parentNode;
        if (!padre.querySelector('.ayuda-campo[data-ayuda-id="' + entrada.id + '"]')) {
          padre.appendChild(crearCaja(entrada));
        }
      }
    }
  }

  function aplicarModo(activo) {
    var cajas = document.querySelectorAll(".ayuda-campo");
    var nota = document.getElementById("nota-didactica");
    var i;
    document.body.classList.toggle("modo-didactico", activo);
    for (i = 0; i < cajas.length; i++) {
      cajas[i].hidden = !activo;
    }
    if (nota) {
      nota.hidden = !activo;
    }
  }

  function problemas() {
    var faltan = [];
    var campos;
    var i;
    var ruta;
    if (typeof document === "undefined") {
      return faltan;
    }
    campos = document.querySelectorAll("#formulario [data-ruta]");
    for (i = 0; i < campos.length; i++) {
      ruta = campos[i].getAttribute("data-ruta");
      if (!porRuta[ruta]) {
        faltan.push("sin texto: " + ruta);
      }
    }
    for (i = 0; i < lista.length; i++) {
      if (!buscarNodos(lista[i]).length) {
        faltan.push("sin campo en pantalla: " + lista[i].id);
      }
    }
    return faltan;
  }

  function iniciar() {
    var interruptor = document.getElementById("modo-didactico");
    var huecos;
    montar();
    huecos = problemas();
    if (huecos.length) {
      console.warn("Ayuda", huecos);
    }
    if (!interruptor) {
      return;
    }
    interruptor.addEventListener("change", function () {
      aplicarModo(interruptor.checked);
    });
    aplicarModo(interruptor.checked);
  }

  dato({
    id: "partes.proveedor.razonSocial",
    bloque: "partes",
    etiqueta: "Proveedor / shipper",
    rutas: ["partes.proveedor.razonSocial"],
    amplia: true,
    queEs: "Es quien vende la mercancía. En la factura es el vendedor. En el conocimiento de embarque es el shipper: quien entrega la carga a la naviera. No es el agente marítimo ni la naviera.",
    quien: "Lo escribe el exportador, porque él emite la factura y el packing list. La naviera copia ese nombre como shipper. El agente de aduanas lo declara en la DAM.",
    documento: "Sale de la factura comercial y del packing list. En el BL figura como shipper.",
    factura: "Sí. Vendedor, quien emite la factura.",
    packing: "Sí. Quien emite el packing list.",
    bl: "Sí. Shipper.",
    dam: "Formato B, casilla 3.1: nombre o razón social de quien extiende la factura. No es la casilla 3.1 del Formato A: esa, en marítimo, es el RUC del agente marítimo."
  });

  dato({
    id: "partes.proveedor.direccion",
    bloque: "partes",
    etiqueta: "Dirección del proveedor",
    rutas: ["partes.proveedor.direccion"],
    queEs: "Domicilio del proveedor en el extranjero: calle, número y distrito, o el equivalente en ese país.",
    quien: "Lo escribe el exportador en sus documentos. El agente de aduanas lo transcribe a la DAM.",
    documento: "Sale de la factura o del membrete del proveedor.",
    factura: "Sí, si la factura trae el domicilio.",
    packing: "A veces, en el membrete.",
    bl: "A veces, junto al shipper. No todas las navieras imprimen la dirección completa.",
    dam: "Formato B, casilla 3.3."
  });

  dato({
    id: "partes.proveedor.ciudad",
    bloque: "partes",
    etiqueta: "Ciudad del proveedor",
    rutas: ["partes.proveedor.ciudad"],
    queEs: "Ciudad que corresponde a la dirección del proveedor. En el ejemplo es Shenzhen. No es, por sí sola, el lugar del Incoterm: ese lugar se declara aparte, en la casilla 5.4.",
    quien: "La toma el agente de aduanas de la factura o del domicilio del proveedor.",
    documento: "Sale de la factura o del domicilio del proveedor.",
    factura: "Sí, en el domicilio del vendedor.",
    packing: "A veces, en el membrete.",
    bl: "No es un rótulo propio del BL. El puerto de embarque es otro dato.",
    dam: "Formato B, casilla 3.4."
  });

  dato({
    id: "partes.proveedor.pais",
    bloque: "partes",
    etiqueta: "País del proveedor",
    rutas: ["partes.proveedor.pais"],
    queEs: "País donde reside el proveedor, escrito en palabras. En el Formato B la casilla 3.5 pide el código de ese país, no el nombre suelto. El nombre se guarda para leer el caso.",
    quien: "Lo escribe el exportador en la factura. El agente declara el código en la DAM.",
    documento: "El nombre sale de la factura. El código no sale de la factura: sale de la tabla de países de aduana.",
    factura: "Sí. País del vendedor.",
    packing: "A veces, en el membrete.",
    bl: "A veces, junto a la dirección del shipper.",
    dam: "Formato B, casilla 3.5, que pide el código del país de residencia del proveedor. El código está en el campo de al lado y queda PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "partes.proveedor.codigoPais",
    bloque: "partes",
    etiqueta: "Código de país del proveedor",
    rutas: ["partes.proveedor.codigoPais"],
    queEs: "Código de aduana del país donde reside el proveedor. No está en las tablas de esta carpeta. Por eso el ejemplo no inventa un número y dice PENDIENTE DE VERIFICAR.",
    quien: "Lo consigna el agente de aduanas cuando declara. Hasta tener la tabla oficial, se deja la marca.",
    documento: "El país, en palabras, sale de la factura. El código no: lo asigna la tabla de SUNAT, que no está en referencias/.",
    factura: "No figura el código.",
    packing: "No figura el código.",
    bl: "No figura el código.",
    dam: "Formato B, casilla 3.5. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "partes.proveedor.condicion",
    bloque: "partes",
    etiqueta: "Condición del proveedor",
    rutas: ["partes.proveedor.condicion"],
    queEs: "Qué papel cumple el proveedor extranjero en esta venta. En el instructivo, 1 es fabricante, 2 distribuidor, 3 comerciante y 4 otro. En el ejemplo es 1, fabricante: quien elabora la mercancía.",
    quien: "La declara el agente de aduanas según lo que sea el proveedor en esta operación, no según un rótulo fijo de la empresa.",
    documento: "No es un rótulo de la factura. Se deduce de la relación comercial y se declara en la DAM.",
    factura: "No suele traer este código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 3.2."
  });

  dato({
    id: "partes.proveedor.condicionDescripcion",
    bloque: "partes",
    etiqueta: "Descripción de la condición",
    rutas: ["partes.proveedor.condicionDescripcion"],
    queEs: "Las palabras del código de condición. Si el código es 1, el instructivo dice fabricante. Si fuera 4 (otro), en importación para el consumo hay que precisar cuál es esa condición.",
    quien: "La anota el agente de aduanas como lectura del código. No es un dato distinto.",
    documento: "No sale de un documento aparte: explica la casilla 3.2 del Formato B.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 3.2. El código va en la casilla; esta frase es su lectura."
  });

  dato({
    id: "partes.importador.razonSocial",
    bloque: "partes",
    etiqueta: "Importador / consignee",
    rutas: ["partes.importador.razonSocial"],
    amplia: true,
    queEs: "Es el comprador de la factura y, en este BL, el consignee: a quien se consigna la carga. En la DAM es el importador. No es el notify party. El notify solo recibe el aviso de llegada; en el ejemplo es la agencia de aduanas, y no tiene casilla en la DAM. Que la agencia avise no la hace dueña de la mercancía.",
    quien: "El nombre lo pactan comprador y vendedor, y el exportador lo escribe en la factura. La naviera lo imprime como consignee. El agente de aduanas lo declara como importador. El importador responde por ese dato.",
    documento: "Sale de la factura, como comprador. En el BL de este caso va como consignee.",
    factura: "Sí. Comprador.",
    packing: "Sí, como destinatario del embarque, cuando el packing lo nombra.",
    bl: "Sí. En este caso es el consignee.",
    dam: "Formato A: 1.1 nombre, y el mismo nombre en el Formato B, casilla 1.1. El documento y el RUC van en 1.2; la dirección en 1.3; el ubigeo en 1.4."
  });

  dato({
    id: "partes.importador.codigoDocumento",
    bloque: "partes",
    etiqueta: "Código de documento del importador",
    rutas: ["partes.importador.codigoDocumento"],
    queEs: "Código del tipo de documento del importador. En el instructivo, 4 es RUC. También existen, entre otros, 3 DNI, 6 pasaporte y 7 carnet de extranjería. En el ejemplo el importador es una empresa, así que el código es 4.",
    quien: "Lo declara el agente de aduanas junto con el número de RUC.",
    documento: "El RUC figura en la factura si el comprador lo consigna. El código 4 es de la tabla del instructivo, no un número que invente la factura.",
    factura: "Puede figurar el RUC. El código 4 no es un rótulo de la factura.",
    packing: "No figura el código.",
    bl: "No figura el código.",
    dam: "Formato A, casilla 1.2, junto con el número de documento. Se repite en el Formato B, casilla 1.2."
  });

  dato({
    id: "partes.importador.ruc",
    bloque: "partes",
    etiqueta: "RUC del importador",
    rutas: ["partes.importador.ruc"],
    queEs: "Número de RUC del importador, once dígitos. Es el mismo en la factura y en la casilla 1.2. El del ejemplo es ficticio: solo cumple el dígito verificador. Esta herramienta no consulta si existe en SUNAT.",
    quien: "Lo entrega el importador. Lo escribe el exportador si la factura lo pide, y lo declara el agente de aduanas. En la realidad, cuando hay RUC, debe ser el registrado ante SUNAT.",
    documento: "Sale de la identificación del comprador. Debe coincidir en la factura y en la DAM.",
    factura: "Sí. RUC del comprador.",
    packing: "No es un dato del packing list.",
    bl: "No es un rótulo habitual del BL.",
    dam: "Formato A, casilla 1.2, con el código de documento 4. El mismo RUC en el Formato B, casilla 1.2. No es el RUC del agente de aduanas: ese va en el rubro 8."
  });

  dato({
    id: "partes.importador.direccion",
    bloque: "partes",
    etiqueta: "Dirección del importador",
    rutas: ["partes.importador.direccion"],
    queEs: "Domicilio en el Perú del dueño o consignatario de la mercancía. En el ejemplo, Lima.",
    quien: "Lo declara el agente de aduanas con el dato que le da el importador.",
    documento: "Sale de los datos del comprador en la factura, si allí consta el domicilio en el Perú.",
    factura: "Sí, cuando la factura trae la dirección del comprador.",
    packing: "A veces.",
    bl: "A veces, bajo el consignee. Depende de la naviera.",
    dam: "Formato A, casilla 1.3."
  });

  dato({
    id: "partes.importador.ubigeo",
    bloque: "partes",
    etiqueta: "Ubigeo del importador",
    rutas: ["partes.importador.ubigeo"],
    queEs: "Código de ubicación geográfica del domicilio del importador: departamento, provincia y distrito. La tabla de ubigeo no está en esta carpeta. El ejemplo dice PENDIENTE DE VERIFICAR y no inventa el código.",
    quien: "Lo declara el agente de aduanas. No lo asigna el exportador.",
    documento: "La dirección, en palabras, puede salir de la factura. El código de ubigeo no sale de la factura.",
    factura: "No figura el código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 1.4. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "partes.notify.razonSocial",
    bloque: "partes",
    etiqueta: "Notify party",
    rutas: ["partes.notify.razonSocial"],
    sinCasillaDam: true,
    queEs: "Es a quien la naviera avisa que la carga llegó o que hay una novedad. No es el consignee. El consignee de este BL es el importador: quien recibe la mercancía y figura como comprador en la factura. En el ejemplo el notify party es la agencia de aduanas. Que sea la misma empresa que el agente de aduanas no la convierte en consignee ni en importador. No tiene casilla en la DAM.",
    quien: "Lo indica quien pide el BL, casi siempre el embarcador. La naviera lo imprime. El agente de aduanas no lo pasa a la DAM, porque el instructivo no le dio casilla.",
    documento: "Sale solo del conocimiento de embarque. No sale de la factura ni del packing list.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "Sí. Campo propio: notify party.",
    dam: SIN_CASILLA
  });

  dato({
    id: "partes.agenteAduanas.razonSocial",
    bloque: "partes",
    etiqueta: "Agente de aduanas",
    rutas: ["partes.agenteAduanas.razonSocial"],
    amplia: true,
    queEs: "Es el despachador que formula la DAM: el declarante. No es el agente marítimo y no es la naviera. En el ejemplo coincide con el notify party, pero son papeles distintos: notify es un aviso del BL; declarante es quien suscribe la declaración.",
    quien: "Lo escribe el propio agente de aduanas en el rubro del declarante. El instructivo dice que el agente suscribe el Formato B y que el dueño responde por esos datos.",
    documento: "No sale de la factura ni del BL. Es un dato del despacho.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura como agente de aduanas. En el ejemplo el mismo nombre está en el notify party, que es otro campo.",
    dam: "Rubro 8, declarante: nombre del agente de aduanas. No es una casilla 8.1."
  });

  dato({
    id: "partes.agenteAduanas.ruc",
    bloque: "partes",
    etiqueta: "RUC del agente de aduanas",
    rutas: ["partes.agenteAduanas.ruc"],
    queEs: "RUC del despachador, no el del importador ni el del agente marítimo. El del ejemplo es ficticio y solo cumple el dígito verificador.",
    quien: "Lo consigna el agente de aduanas al firmar la declaración.",
    documento: "Sale de la identificación del despachador, no de la factura.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rubro 8, declarante. El RUC del importador va en 1.2. El del agente marítimo va en 3.1."
  });

  dato({
    id: "partes.agenteAduanas.fechaFormulacion",
    bloque: "partes",
    etiqueta: "Fecha de formulación",
    rutas: ["partes.agenteAduanas.fechaFormulacion"],
    queEs: "Fecha en que el agente formula la declaración. En el ejemplo, 25 de agosto de 2026: el embarque es el 10 de agosto y la modalidad es 1-0, despacho anticipado, así que se formula antes de la llegada. En la DAM el instructivo pide día, mes y año.",
    quien: "La pone el agente de aduanas al formular la DAM.",
    documento: "No sale de la factura ni del BL. Es la fecha del despacho.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rubro 8, declarante, junto al nombre y al RUC del agente."
  });

  dato({
    id: "partes.agenteMaritimo.razonSocial",
    bloque: "partes",
    etiqueta: "Agente marítimo",
    rutas: ["partes.agenteMaritimo.razonSocial"],
    amplia: true,
    queEs: "Es el representante de la naviera en el puerto peruano. No es la naviera. La naviera (en el ejemplo, Pacífico Demo Line) es quien emite el BL y no tiene casilla propia. El agente marítimo (en el ejemplo, Agencia Marítima Demo S.A.C.) es quien responde en el Perú por ese buque. Tampoco es el agente de aduanas: ese declara la DAM; este representa a la línea naviera.",
    quien: "El nombre lo conoce el agente de aduanas por el aviso de llegada o por el manifiesto. En importación para el consumo el instructivo pide registrar el RUC, no obliga a una casilla de nombre aparte. El nombre se guarda aquí para saber de quién es ese RUC.",
    documento: "Sale del aviso de la agencia marítima o del manifiesto. No es un rótulo fijo de la factura.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "A veces la naviera imprime a su agente en el destino. No es el notify party ni el consignee.",
    dam: "Formato A, casilla 3.1. En transporte marítimo se consigna el RUC del agente marítimo. En importación para el consumo el instructivo dice que solo se registra el RUC."
  });

  dato({
    id: "partes.agenteMaritimo.ruc",
    bloque: "partes",
    etiqueta: "RUC del agente marítimo",
    rutas: ["partes.agenteMaritimo.ruc"],
    amplia: true,
    queEs: "RUC del agente marítimo, no el de la naviera y no el del importador. En transporte marítimo es el dato que la casilla 3.1 pide para una importación para el consumo. El de la naviera no va ahí: la naviera no tiene casilla en la DAM.",
    quien: "Lo declara el agente de aduanas con el RUC de la agencia marítima que atiende el buque.",
    documento: "Sale de la identificación del agente marítimo, del aviso de llegada o del manifiesto.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No es el nombre de la naviera. El BL lo emite la naviera; el RUC de su agente en el Perú es este.",
    dam: "Formato A, casilla 3.1. En transporte marítimo: RUC del agente marítimo. No es el rubro 8 ni la casilla 1.2."
  });

  dato({
    id: "partes.naviera.nombre",
    bloque: "partes",
    etiqueta: "Naviera",
    rutas: ["partes.naviera.nombre"],
    sinCasillaDam: true,
    queEs: "Es la empresa de transporte marítimo que emite el conocimiento de embarque y opera el buque. No es el agente marítimo. El agente marítimo es su representante en el puerto peruano, y su RUC va en la casilla 3.1 del Formato A. El nombre de la naviera no entra en esa casilla. No tiene casilla en la DAM.",
    quien: "La propia naviera se identifica al emitir el BL. El embarcador elige la línea. El agente de aduanas no copia ese nombre a una casilla de la DAM.",
    documento: "Sale del conocimiento de embarque. El rótulo (carrier, shipping line) cambia según la naviera.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "Sí. Quien emite el conocimiento de embarque.",
    dam: SIN_CASILLA + " No es la casilla 3.1 del Formato A: en transporte marítimo esa casilla pide el RUC del agente marítimo."
  });

  dato({
    id: "transporte.buqueViaje",
    bloque: "transporte",
    etiqueta: "Buque / viaje",
    rutas: ["transporte.buque", "transporte.viaje"],
    sinCasillaDam: true,
    queEs: "El buque es el nombre de la nave. El viaje es el número que la naviera le da a esa salida (en el ejemplo, DEMO PACIFIC / 026E, y los dos son SUPUESTO: no corresponden a un viaje real). Van juntos en el BL. No tiene casilla en la DAM.",
    quien: "Los asigna la naviera al programar el zarpe. El embarcador los ve en el booking y en el BL. El agente de aduanas no los escribe en una casilla de importación para el consumo.",
    documento: "Salen del conocimiento de embarque. El rótulo (vessel/voyage, ocean vessel) cambia según la naviera. No salen de la factura.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "Sí. Buque y viaje.",
    dam: SIN_CASILLA + " La casilla 3.6 (unidad de transporte) es solo de tránsito o reembarque. En una importación para el consumo queda vacía: no sirve para anotar el buque ni el viaje."
  });

  dato({
    id: "transporte.puertoEmbarque",
    bloque: "transporte",
    etiqueta: "Puerto de embarque",
    rutas: ["transporte.puertoEmbarque"],
    queEs: "Puerto donde la mercancía empieza el viaje con destino al Perú. En el ejemplo, Shenzhen. No es el puerto de destino.",
    quien: "Lo declara el agente de aduanas con el dato del BL. La naviera lo imprime en el conocimiento.",
    documento: "Sale del BL. También puede verse en la factura como lugar de carga, si el Incoterm lo nombra.",
    factura: "A veces, como lugar de carga o lugar del Incoterm. No siempre con la palabra puerto.",
    packing: "A veces.",
    bl: "Sí. Puerto de carga.",
    dam: "Formato A, casilla 7.6: puerto de embarque inicial con destino al país. El código de puerto está al lado y es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "transporte.codigoPuertoEmbarque",
    bloque: "transporte",
    etiqueta: "Código del puerto de embarque",
    rutas: ["transporte.codigoPuertoEmbarque"],
    queEs: "Código de aduana del puerto de embarque. La tabla de puertos no está en esta carpeta. El ejemplo no inventa el código: dice PENDIENTE DE VERIFICAR.",
    quien: "Lo consigna el agente de aduanas. El nombre del puerto lo da el BL; el código, la tabla oficial.",
    documento: "El nombre sale del BL. El código no sale del BL de esta carpeta.",
    factura: "No figura el código.",
    packing: "No figura el código.",
    bl: "El BL trae el nombre del puerto, no este código de SUNAT.",
    dam: "Formato A, casilla 7.6. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "transporte.puertoDestino",
    bloque: "transporte",
    etiqueta: "Puerto de destino",
    rutas: ["transporte.puertoDestino"],
    queEs: "Puerto donde se descarga la mercancía. En el ejemplo, el Callao. No es el puerto de embarque: ese es Shenzhen y va en la casilla 7.6.",
    quien: "Lo acuerdan comprador y vendedor, y la naviera lo imprime en el BL como puerto de descarga.",
    documento: "Sale del BL, como puerto de descarga.",
    factura: "A veces, si el contrato nombra el puerto de llegada. En un FOB el lugar del Incoterm es el de embarque, no este.",
    packing: "A veces, como destino del embarque.",
    bl: "Sí. Puerto de descarga.",
    dam: "No hay una casilla numerada de puerto de destino. La 7.6 es el puerto de embarque. La aduana de llegada va en el rótulo ADUANA – CÓDIGO."
  });

  dato({
    id: "transporte.aduana",
    bloque: "transporte",
    etiqueta: "Aduana",
    rutas: ["transporte.aduana"],
    queEs: "Intendencia de aduana donde se hace el despacho. En el ejemplo, la Intendencia de Aduana Marítima del Callao. Es un rótulo del Formato A, no una casilla 1.x.",
    quien: "La indica el agente de aduanas según dónde se numera la declaración.",
    documento: "No sale de la factura. Se conoce por el puerto de llegada y por el despacho.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura como intendencia. El BL trae el puerto de descarga.",
    dam: "Rótulo ADUANA – CÓDIGO del Formato A: nombre de la intendencia. El código está en el campo de al lado y es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "transporte.codigoAduana",
    bloque: "transporte",
    etiqueta: "Código de aduana",
    rutas: ["transporte.codigoAduana"],
    queEs: "Código de la intendencia de aduana. No está en las tablas de esta carpeta. Por eso el ejemplo dice PENDIENTE DE VERIFICAR, y el número de manifiesto tampoco puede cerrarse: el instructivo arma el manifiesto con ese código, el año y el número.",
    quien: "Lo consigna el agente de aduanas cuando tiene la tabla oficial. Aquí no se inventa.",
    documento: "No sale de la factura ni del BL.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rótulo ADUANA – CÓDIGO del Formato A. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "transporte.via",
    bloque: "transporte",
    etiqueta: "Vía de transporte",
    rutas: ["transporte.via"],
    queEs: "Cómo viaja la mercancía. El código 1, en el instructivo, es marítimo. La misma tabla trae fluvial, lacustre, aéreo, postal, ferroviario, carretera y otros.",
    quien: "Lo declara el agente de aduanas. En este caso es marítimo porque el BL es de una nave.",
    documento: "Se reconoce por el BL: si hay buque y conocimiento de embarque marítimo, la vía es 1.",
    factura: "No trae este código.",
    packing: "No figura.",
    bl: "El documento mismo dice que el transporte es marítimo, sin usar el código 1.",
    dam: "Formato A, casilla 3.3. El código 1 es marítimo, según el instructivo."
  });

  dato({
    id: "transporte.viaDescripcion",
    bloque: "transporte",
    etiqueta: "Descripción de la vía",
    rutas: ["transporte.viaDescripcion"],
    queEs: "Lectura del código de la vía. Si el código es 1, el instructivo dice marítimo.",
    quien: "La anota el agente de aduanas como lectura del código. No es un dato distinto.",
    documento: "Explica la casilla 3.3. El BL no usa esta palabra como código.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "El BL muestra un transporte por nave, no este rótulo de la DAM.",
    dam: "Formato A, casilla 3.3. Esta frase es la lectura del código."
  });

  dato({
    id: "transporte.numeroBl",
    bloque: "transporte",
    etiqueta: "Número de BL",
    rutas: ["transporte.numeroBl"],
    amplia: true,
    queEs: "Número del conocimiento de embarque, el documento de transporte marítimo. En el ejemplo es SUPUESTO. Una serie de la DAM corresponde a un solo documento de transporte.",
    quien: "Lo asigna la naviera al emitir el BL. El agente de aduanas lo copia a la casilla 7.8. El número, y hasta el nombre del campo, cambian según la naviera.",
    documento: "Sale del conocimiento de embarque. La factura puede citarlo, pero quien lo crea es la naviera.",
    factura: "A veces lo cita, cuando ya existe. No lo crea el vendedor.",
    packing: "A veces lo cita.",
    bl: "Sí. Es el número del propio documento.",
    dam: "Formato A, casilla 7.8: documento de transporte. En marítimo es el conocimiento de embarque. Una serie, un solo documento."
  });

  dato({
    id: "transporte.contenedorTipo",
    bloque: "transporte",
    etiqueta: "Tipo de contenedor",
    rutas: ["transporte.contenedorTipo"],
    queEs: "Tamaño o clase del contenedor. En el ejemplo, un 20 pies, y es SUPUESTO. Sirve para leer el BL. El dato que el rubro 9 pide declarar es el número del contenedor y el del precinto.",
    quien: "Lo asigna la naviera al confirmar el equipo. El embarcador lo ve en el booking y en el BL.",
    documento: "Sale del BL. El rótulo del equipo cambia según la naviera.",
    factura: "No figura.",
    packing: "A veces, si el packing indica en qué contenedor va la carga.",
    bl: "Sí. Descripción del equipo.",
    dam: "El rubro 9 declara el número de contenedor y el precinto. El instructivo no numera una subcasilla solo para el tipo (20 pies)."
  });

  dato({
    id: "transporte.contenedorNumero",
    bloque: "transporte",
    etiqueta: "Número de contenedor",
    rutas: ["transporte.contenedorNumero"],
    queEs: "Identificación del contenedor. En el ejemplo, TEMU0000001, SUPUESTO: no es un equipo real. Debe ser el mismo número en el BL y en el rubro 9.",
    quien: "Lo asigna la naviera. El agente de aduanas lo copia al rubro 9.",
    documento: "Sale del conocimiento de embarque.",
    factura: "No figura.",
    packing: "A veces.",
    bl: "Sí.",
    dam: "Rubro 9, junto con el precinto. Es un rubro, no una casilla 9.1."
  });

  dato({
    id: "transporte.precinto",
    bloque: "transporte",
    etiqueta: "Precinto",
    rutas: ["transporte.precinto"],
    queEs: "Sello que cierra el contenedor. En el ejemplo, DM123456, SUPUESTO. Debe coincidir con el del BL.",
    quien: "Lo coloca quien sella el contenedor en origen y la naviera lo imprime en el BL. El agente de aduanas lo declara en el rubro 9.",
    documento: "Sale del BL. También puede constar en el packing list.",
    factura: "No figura.",
    packing: "A menudo sí.",
    bl: "Sí.",
    dam: "Rubro 9, junto al número de contenedor. No es una casilla 9.1."
  });

  dato({
    id: "transporte.marcasBultos",
    bloque: "transporte",
    etiqueta: "Marcas de los bultos",
    rutas: ["transporte.marcasBultos"],
    queEs: "Marcas y números pintados o etiquetados en los bultos para identificarlos en el embarque. En el ejemplo didáctico: PACÍFICO DEMO / CALLAO / C/1-30 (importador, puerto de destino y rango de cajas 1 a 30). Es un dato comercial de identificación, no un código SUNAT.",
    quien: "Lo acuerda el exportador con el importador y lo imprime en el packing list y, a menudo, en el BL. El agente de aduanas lo declara en el rubro 9, junto con el contenedor y el precinto.",
    documento: "Sale del packing list y suele repetirse en el BL.",
    factura: "No suele figurar.",
    packing: "Sí. Es el campo de marcas y números de los bultos.",
    bl: "Sí, en el bloque de marcas y números, con el rótulo que use la naviera.",
    dam: "Rubro 9. El instructivo pide las marcas y números que identifican los bultos, o el (los) número(s) de contenedor(es) y precinto(s). Es un rubro, no una casilla 9.1."
  });

  dato({
    id: "transporte.fechaEmbarque",
    bloque: "transporte",
    etiqueta: "Fecha de embarque",
    rutas: ["transporte.fechaEmbarque"],
    queEs: "Fecha en que la mercancía se embarca con destino al Perú. En el ejemplo, 10 de agosto de 2026. En la DAM se escribe día, mes y año.",
    quien: "La confirma la naviera en el BL. El agente de aduanas la pasa a la casilla 7.7.",
    documento: "Sale del conocimiento de embarque.",
    factura: "No es la fecha de la factura. La factura del ejemplo es del 1 de agosto.",
    packing: "A veces figura la fecha del packing, que tampoco es esta.",
    bl: "Sí. Fecha de embarque o shipped on board, según la naviera.",
    dam: "Formato A, casilla 7.7."
  });

  dato({
    id: "transporte.numeroOriginalesBl",
    bloque: "transporte",
    etiqueta: "Número de originales del BL",
    rutas: ["transporte.numeroOriginalesBl"],
    queEs: "Cuántos ejemplares originales del conocimiento de embarque emite la naviera. En el ejemplo didáctico es 3/3: tres originales de un juego de tres. El número exacto y el rótulo cambian según la línea. No es un dato de la DAM.",
    quien: "Lo fija la naviera al emitir el BL. El importador o el banco suelen exigir un juego completo de originales para liberar la carga.",
    documento: "Sale del propio conocimiento de embarque.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "Sí. Suele ir cerca de la firma o del lugar de emisión.",
    dam: "No tiene casilla en el instructivo de ingreso."
  });

  dato({
    id: "transporte.lugarEmisionBl",
    bloque: "transporte",
    etiqueta: "Lugar de emisión del BL",
    rutas: ["transporte.lugarEmisionBl"],
    queEs: "Ciudad o puerto donde la naviera emite el conocimiento de embarque. En el ejemplo, Shenzhen, el mismo puerto de embarque. El rótulo cambia según la línea (Place of issue, Issued at, etc.).",
    quien: "Lo imprime la naviera o su agente en origen.",
    documento: "Sale del BL. No sale de la factura.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "Sí, junto con la fecha de emisión.",
    dam: "No tiene casilla. La DAM usa el puerto de embarque (7.6) y la fecha de embarque (7.7), que pueden coincidir o no con el lugar y la fecha de emisión del BL."
  });

  dato({
    id: "transporte.fechaEmisionBl",
    bloque: "transporte",
    etiqueta: "Fecha de emisión del BL",
    rutas: ["transporte.fechaEmisionBl"],
    queEs: "Fecha en que se emite el conocimiento de embarque. En el ejemplo, 10/08/2026, la misma del embarque. No es la fecha de la factura (01/08/2026) ni la del término de descarga.",
    quien: "La fija la naviera al firmar el BL.",
    documento: "Sale del BL.",
    factura: "No es la fecha de la factura.",
    packing: "No figura.",
    bl: "Sí, con el lugar de emisión.",
    dam: "No tiene casilla propia. La casilla 7.7 pide la fecha de embarque, no necesariamente la de emisión del papel."
  });

  dato({
    id: "transporte.shippedOnBoard",
    bloque: "transporte",
    etiqueta: "Shipped on board",
    rutas: ["transporte.shippedOnBoard"],
    amplia: true,
    queEs: "Anotación del BL que declara la mercancía embarcada a bordo del buque en la fecha de embarque. En el ejemplo se muestra la frase «Shipped on board». El rótulo exacto cambia según la naviera (on board, shipped on board date, etc.). No sustituye al Incoterm FOB, aunque en un FOB el riesgo pasa cuando la carga está a bordo.",
    quien: "La confirma la naviera en el BL.",
    documento: "Sale del conocimiento de embarque.",
    factura: "No figura como frase; el Incoterm FOB es otro dato.",
    packing: "No figura.",
    bl: "Sí, cuando la línea lo imprime.",
    dam: "No tiene casilla. La fecha de embarque va a 7.7."
  });

  dato({
    id: "transporte.clausulaSaidToContain",
    bloque: "transporte",
    etiqueta: "Cláusula «said to contain»",
    rutas: ["transporte.clausulaSaidToContain"],
    amplia: true,
    queEs: "Frase habitual del BL: el transportista declara lo que el embarcador dice que hay dentro (said to contain) y no verifica el contenido de los bultos. En el ejemplo se muestra esa cláusula. No inventa cantidades: las cantidades salen del shipper y del packing list.",
    quien: "La incluye la naviera en el BL para limitar su responsabilidad sobre el contenido no verificado.",
    documento: "Sale del conocimiento de embarque.",
    factura: "No figura.",
    packing: "El packing list detalla el contenido; el BL, con esta cláusula, no lo garantiza.",
    bl: "Sí, cuando la línea la imprime.",
    dam: "No tiene casilla. La descripción de la mercancía en 7.35 sale de la factura y del packing, no de esta cláusula."
  });

  dato({
    id: "transporte.fechaTerminoDescarga",
    bloque: "transporte",
    etiqueta: "Término de la descarga",
    rutas: ["transporte.fechaTerminoDescarga"],
    queEs: "Fecha en que culmina la descarga de la mercancía. El instructivo dice eso y no indica, para la modalidad 1-0 Despacho Anticipado, si la casilla va vacía, provisional o con otra fecha cuando se formula antes de descargar. En el ejemplo el campo va vacío y la casilla 3.4 muestra PENDIENTE DE VERIFICAR. No es la fecha de embarque ni la de la factura.",
    quien: "La registra el terminal o el agente marítimo al acabar la descarga. Si la declaración se formula antes, el instructivo no dice qué anotar: en el ejemplo el campo queda vacío.",
    documento: "Sale del aviso de descarga o del manifiesto, no de la factura ni del BL emitido en origen.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura: el BL se emite al embarcar, antes de la descarga.",
    dam: "Formato A, casilla 3.4. En el ejemplo queda PENDIENTE DE VERIFICAR: no hay regla específica para el anticipado."
  });

  dato({
    id: "transporte.manifiesto",
    bloque: "transporte",
    etiqueta: "Número de manifiesto",
    rutas: ["transporte.manifiesto"],
    amplia: true,
    queEs: "Número con el que la aduana identifica la llegada del medio de transporte. El instructivo pide tres partes: código de la aduana de ingreso, año y número. Como el código de aduana está PENDIENTE DE VERIFICAR, el ejemplo no arma un número falso: deja esa marca.",
    quien: "Lo numera la administración aduanera. El agente de aduanas lo consigna cuando ya existe.",
    documento: "Sale del manifiesto de carga, no de la factura ni del packing list.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "El BL se relaciona con el manifiesto, pero el número de manifiesto no es el número de BL.",
    dam: "Formato A, casilla 3.2. El código de aduana de esa estructura es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "transporte.deposito.razonSocial",
    bloque: "transporte",
    etiqueta: "Depósito temporal",
    rutas: ["transporte.deposito.razonSocial"],
    queEs: "Almacén donde espera la carga mientras se numera el despacho. No es el depósito aduanero como régimen: ese sería otra destinación. En el ejemplo el nombre es ficticio.",
    quien: "Lo declara el agente de aduanas según el terminal o el depósito que recibió la carga.",
    documento: "Sale del dato de almacenamiento, no de la factura.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No es un rótulo del BL.",
    dam: "Formato A, casilla 4.1, junto con el RUC. Las casillas 4.2 y 4.3 quedan vacías en este caso: no hay depósito aduanero como régimen ni un plazo de aquellos regímenes."
  });

  dato({
    id: "transporte.deposito.ruc",
    bloque: "transporte",
    etiqueta: "RUC del depósito temporal",
    rutas: ["transporte.deposito.ruc"],
    queEs: "RUC del depósito temporal. En el ejemplo es ficticio, distinto del RUC del agente marítimo, y solo cumple el dígito verificador.",
    quien: "Lo declara el agente de aduanas.",
    documento: "Sale de la identificación del almacén, no de la factura.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 4.1, junto al nombre del depósito temporal."
  });

  dato({
    id: "comercial.incoterm",
    bloque: "comercial",
    etiqueta: "Incoterm",
    rutas: ["comercial.incoterm"],
    amplia: true,
    queEs: "Término de venta de los Incoterms 2020: dice hasta dónde llegan el riesgo y los gastos del vendedor. En el ejemplo es FOB. FOB no es CIF. En FOB el vendedor entrega la mercancía a bordo en el puerto de embarque; el flete marítimo lo paga el comprador. Según la ICC, para carga en contenedor se recomienda FCA en lugar de FOB, aunque en la práctica FOB se usa mucho en el comercio con China. En FOB nadie está obligado a asegurar: el comprador asume el riesgo desde que la carga está a bordo y decide si contrata seguro. En este ejemplo decidió hacerlo. Por eso el flete y el seguro se ven aparte, y no van escondidos dentro del precio.",
    quien: "Lo pactan comprador y vendedor. El exportador lo escribe en la factura. El agente de aduanas lo declara en la DAM.",
    documento: "Sale de la factura comercial.",
    factura: "Sí. Término de venta.",
    packing: "No. El packing list no lleva el precio ni el Incoterm como condición de venta.",
    bl: "El BL puede decir si el flete va prepaid o collect. Esa marca no reemplaza al Incoterm de la factura.",
    dam: "Formato B, casilla 5.4, primera subcasilla: el término. La segunda subcasilla es el lugar y la versión."
  });

  dato({
    id: "comercial.incotermLugar",
    bloque: "comercial",
    etiqueta: "Lugar del Incoterm",
    rutas: ["comercial.incotermLugar"],
    queEs: "Lugar convenido del Incoterm. En un FOB es el puerto de embarque: Shenzhen. No es el Callao. El Callao es el puerto de destino, no el lugar FOB.",
    quien: "Lo pactan las partes y el exportador lo escribe en la factura, junto al término.",
    documento: "Sale de la factura.",
    factura: "Sí. Junto al Incoterm.",
    packing: "No como condición de venta.",
    bl: "El puerto de carga del BL debe ser coherente con un FOB en ese puerto, pero el BL no declara el Incoterm.",
    dam: "Formato B, casilla 5.4, segunda subcasilla, junto con el código de versión: en el ejemplo, Shenzhen-4."
  });

  dato({
    id: "comercial.incotermVersion",
    bloque: "comercial",
    etiqueta: "Versión de los Incoterms",
    rutas: ["comercial.incotermVersion"],
    queEs: "Código de la versión de los Incoterms que acompaña al lugar. En este ejercicio, 4 es Incoterms 2020. Esa versión ya incluye DPU. Con la versión 4 no corresponden términos retirados como DAF, DES, DEQ o DDU.",
    quien: "Lo declara el agente de aduanas en la misma casilla del Incoterm. El exportador suele escribir «Incoterms 2020» en palabras, en la factura.",
    documento: "La factura dice la versión en palabras. El código 4 es el de la DAM.",
    factura: "Sí, en palabras: Incoterms 2020.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 5.4, segunda subcasilla, después del lugar. En el ejemplo se lee Shenzhen-4."
  });

  dato({
    id: "comercial.moneda",
    bloque: "comercial",
    etiqueta: "Moneda",
    rutas: ["comercial.moneda"],
    queEs: "Moneda en que está pactado el precio. En el ejemplo, dólares de los Estados Unidos. La DAM expresa los importes de valor en esa moneda y, en las casillas de dólares, los convierte a la lectura en USD del formato.",
    quien: "La pactan comprador y vendedor. El exportador la escribe en la factura.",
    documento: "Sale de la factura comercial.",
    factura: "Sí.",
    packing: "No. El packing list no lleva precios.",
    bl: "No es la moneda de la mercancía. Si el BL imprime un flete, puede traer su propia moneda, y varias navieras no imprimen monto.",
    dam: "El nombre se lee en la factura. El código de moneda va en el Formato B, casilla 5.5, y en el Formato A, casilla 7.29. Ese código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "comercial.codigoMoneda",
    bloque: "comercial",
    etiqueta: "Código de moneda",
    rutas: ["comercial.codigoMoneda"],
    queEs: "Código de la tabla de monedas de SUNAT. Esa tabla no está en esta carpeta. El ejemplo no inventa el código: dice PENDIENTE DE VERIFICAR. Los montos del caso sí están en dólares.",
    quien: "Lo consigna el agente de aduanas. El nombre de la moneda lo da la factura.",
    documento: "La factura dice dólares. El código no sale de la factura.",
    factura: "No figura el código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 5.5, y Formato A, casilla 7.29. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "comercial.numeroFactura",
    bloque: "comercial",
    etiqueta: "Número de factura",
    rutas: ["comercial.numeroFactura"],
    queEs: "Número que el exportador le pone a la factura comercial. En el ejemplo, HZ-2026-0812. Identifica la venta. No es el número de BL ni el de la DAM.",
    quien: "Lo asigna el exportador al emitir la factura. El agente de aduanas lo copia a la DAM.",
    documento: "Sale de la factura comercial.",
    factura: "Sí. Es su número.",
    packing: "A menudo el packing cita el mismo número de factura.",
    bl: "A veces se cita en la descripción de la carga. No es el número del BL.",
    dam: "Formato B, casillas 5.2 (número) y 5.3 (fecha). Formato A, casilla 7.36: factura y fecha."
  });

  dato({
    id: "comercial.fechaFactura",
    bloque: "comercial",
    etiqueta: "Fecha de la factura",
    rutas: ["comercial.fechaFactura"],
    queEs: "Fecha de emisión de la factura. En el ejemplo, 1 de agosto de 2026. No es la fecha de embarque (10 de agosto) ni la de formulación de la DAM.",
    quien: "La pone el exportador. El agente de aduanas la declara junto al número.",
    documento: "Sale de la factura comercial.",
    factura: "Sí.",
    packing: "El packing puede tener otra fecha. No sustituye a esta.",
    bl: "No es la fecha del BL.",
    dam: "Formato B, casilla 5.3, y Formato A, casilla 7.36, junto al número. En la DAM: día, mes y año."
  });

  dato({
    id: "comercial.formaPago",
    bloque: "comercial",
    etiqueta: "Forma de pago",
    rutas: ["comercial.formaPago"],
    queEs: "Código de la modalidad de pago de la transacción. En el instructivo, 1 es pago al contado, 2 crédito, 6 anticipado, 7 otras (hay que precisar), 8 pago mixto (hay que precisar) y 9 sin pago. En el ejemplo es 1.",
    quien: "La declara el agente de aduanas según lo pactado en la venta.",
    documento: "La condición de pago sale de la factura. El código es el de la DAM.",
    factura: "Sí, en palabras. En el ejemplo la frase es un SUPUESTO: pago al contado por transferencia.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 5.2. Si el código fuera 7 u 8, el instructivo pide precisar la forma."
  });

  dato({
    id: "comercial.formaPagoDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción de la forma de pago",
    rutas: ["comercial.formaPagoDescripcion"],
    queEs: "Lectura del código de pago. Si el código es 1, el instructivo dice pago al contado.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica la casilla 5.2. La frase larga de la factura es el campo de al lado, y es un SUPUESTO comercial.",
    factura: "La factura puede decir la condición en palabras.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 5.2. Esta frase es la lectura del código."
  });

  dato({
    id: "comercial.formaPagoFrase",
    bloque: "comercial",
    etiqueta: "Frase de pago en la factura",
    rutas: ["comercial.formaPagoFrase"],
    queEs: "Frase comercial que se imprimirá en la factura. En el ejemplo es un SUPUESTO: pago al contado por transferencia. No es el código de la DAM. El código es el 1, en el campo de forma de pago.",
    quien: "La redacta quien arma la factura del ejercicio, a partir de lo pactado. No la impone el instructivo con ese texto.",
    documento: "Va en la factura comercial. No va en el packing list ni en el BL.",
    factura: "Sí. Condición de pago, en palabras.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "La frase no tiene una casilla propia. El código de la modalidad de pago sí: Formato A, casilla 5.2."
  });

  dato({
    id: "comercial.naturaleza",
    bloque: "comercial",
    etiqueta: "Naturaleza de la transacción",
    rutas: ["comercial.naturaleza"],
    queEs: "Tipo de operación comercial. En el instructivo, 11 es compra/venta a precio firme para exportación al país de importación. Es el código del ejemplo. Si hubiera ventas sucesivas, el instructivo pide el código 29.",
    quien: "La declara el agente de aduanas en el Formato B.",
    documento: "Se reconoce por el contrato y por la factura: hay un precio firme de compraventa. El código es de la DAM.",
    factura: "La factura muestra una compraventa con precio. No suele imprimir el código 11.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 4.1."
  });

  dato({
    id: "comercial.naturalezaDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción de la naturaleza",
    rutas: ["comercial.naturalezaDescripcion"],
    queEs: "Lectura del código de naturaleza. El 11, en el instructivo, es compra/venta a precio firme para exportación al país de importación.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica la casilla 4.1 del Formato B.",
    factura: "No figura el código. La factura sí muestra el precio firme.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 4.1. Esta frase es la lectura del código."
  });

  dato({
    id: "comercial.nivelComercial",
    bloque: "comercial",
    etiqueta: "Nivel comercial del importador",
    rutas: ["comercial.nivelComercial"],
    queEs: "En qué eslabón de la cadena vende el importador. En el ejemplo el código es 2, mayorista, y es un SUPUESTO del caso: el instructivo pide el nivel, y aquí se asumió mayorista para poder llenar el campo.",
    quien: "Lo declara el importador, a través del agente de aduanas, en el Formato B.",
    documento: "No sale de la factura extranjera. Es un dato del importador en el Perú.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 1.3."
  });

  dato({
    id: "comercial.nivelComercialDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción del nivel comercial",
    rutas: ["comercial.nivelComercialDescripcion"],
    queEs: "Lectura del nivel comercial. En el ejemplo, mayorista, marcado SUPUESTO.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica la casilla 1.3 del Formato B.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 1.3. Esta frase es la lectura del código."
  });

  dato({
    id: "comercial.tipoValor",
    bloque: "comercial",
    etiqueta: "Tipo de valor",
    rutas: ["comercial.tipoValor"],
    queEs: "Si el valor que se declara es definitivo o todavía provisional. En el ejemplo el código es 1, definitivo: el precio de la factura no queda por revisar.",
    quien: "Lo declara el agente de aduanas en el Formato B.",
    documento: "Se sigue de la factura: el precio está cerrado. El código es de la DAM.",
    factura: "La factura trae un precio cerrado. No imprime el código 1.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 5.6."
  });

  dato({
    id: "comercial.tipoValorDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción del tipo de valor",
    rutas: ["comercial.tipoValorDescripcion"],
    queEs: "Lectura del tipo de valor. En el ejemplo, definitivo.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica la casilla 5.6 del Formato B.",
    factura: "No figura el código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato B, casilla 5.6. Esta frase es la lectura del código."
  });

  dato({
    id: "comercial.formaEnvio",
    bloque: "comercial",
    etiqueta: "Forma de envío",
    rutas: ["comercial.formaEnvio"],
    queEs: "Si la venta viaja en un solo embarque o en varios. En el ejemplo, 1/1: un solo embarque, el primero y único.",
    quien: "La declara el agente de aduanas según cómo se pactó el envío.",
    documento: "Se ve en que hay un solo BL para toda la factura.",
    factura: "La factura no suele traer la fracción 1/1.",
    packing: "Un packing de un solo embarque es coherente con 1/1.",
    bl: "Un solo BL para toda la venta es coherente con 1/1.",
    dam: "Formato B, casilla 4.2."
  });

  dato({
    id: "comercial.formaEnvioDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción de la forma de envío",
    rutas: ["comercial.formaEnvioDescripcion"],
    queEs: "Lectura de la forma de envío. 1/1 significa un solo embarque.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica la casilla 4.2 del Formato B.",
    factura: "No figura.",
    packing: "No figura el código.",
    bl: "No figura el código.",
    dam: "Formato B, casilla 4.2. Esta frase es la lectura del código."
  });

  dato({
    id: "comercial.destinacion",
    bloque: "comercial",
    etiqueta: "Destinación",
    rutas: ["comercial.destinacion"],
    queEs: "Régimen aduanero que se pide. El código 10, en el instructivo, es importación para el consumo. Es un rótulo del Formato A, no una casilla 1.x. Otros regímenes de esa lista son, por ejemplo, 20 y 21 (admisión temporal), 70 (depósito), 80 (tránsito) y 89 (reembarque). Este caso es 10.",
    quien: "La elige el importador con su agente de aduanas. No la decide el exportador.",
    documento: "No sale de la factura. Es la destinación del despacho.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rótulo DESTINACIÓN del Formato A, código 10. No es una casilla numerada 1.x."
  });

  dato({
    id: "comercial.destinacionDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción de la destinación",
    rutas: ["comercial.destinacionDescripcion"],
    queEs: "Lectura del código de destinación. El 10 es importación para el consumo.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica el rótulo DESTINACIÓN del Formato A.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rótulo DESTINACIÓN del Formato A. Esta frase es la lectura del código 10."
  });

  dato({
    id: "comercial.modalidad",
    bloque: "comercial",
    etiqueta: "Modalidad",
    rutas: ["comercial.modalidad"],
    amplia: true,
    queEs: "Modalidad del despacho. Es un rótulo del Formato A, no una casilla 1.x. Para importación para el consumo el instructivo lista 0-0 despacho excepcional, 1-0 despacho anticipado, 0-1 envío de urgencia y 0-2 socorro. El caso que está cargado usa 1-0.",
    quien: "La declara el agente de aduanas según el momento del despacho.",
    documento: "No sale de la factura ni del BL. Es una elección del despacho.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rótulo MODALIDAD del Formato A. No es una casilla numerada."
  });

  dato({
    id: "comercial.modalidadDescripcion",
    bloque: "comercial",
    etiqueta: "Descripción de la modalidad",
    rutas: ["comercial.modalidadDescripcion"],
    queEs: "Lectura del código de modalidad. En el instructivo, para importación para el consumo, 1-0 es despacho anticipado. Es lo que trae el caso cargado.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica el rótulo MODALIDAD del Formato A.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Rótulo MODALIDAD del Formato A. Esta frase es la lectura del código."
  });

  dato({
    id: "comercial.tipoDespacho",
    bloque: "comercial",
    etiqueta: "Tipo de despacho",
    rutas: ["comercial.tipoDespacho"],
    queEs: "Casilla que el ejemplo deja vacía. El instructivo detalla códigos de tipo de despacho para admisión temporal, tránsito y reembarque. No trae una lista equivalente para importación para el consumo. Por eso queda PENDIENTE DE VERIFICAR si el formato impreso igual exige uno. No se inventa un código.",
    quien: "Nadie lo llena en este caso, hasta verificar si el régimen 10 lo pide.",
    documento: "No sale de la factura, ni del packing list, ni del BL.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "PENDIENTE DE VERIFICAR. El instructivo no trae, en esta carpeta, una lista de tipo de despacho para importación para el consumo. El ejemplo lo deja vacío."
  });

  dato({
    id: "comercial.entidadFinanciera",
    bloque: "comercial",
    etiqueta: "Entidad financiera",
    rutas: ["comercial.entidadFinanciera"],
    queEs: "Banco o entidad por donde se canaliza el pago. El nombre del ejemplo es ficticio. No es el importador ni el proveedor.",
    quien: "La indica el importador. El agente de aduanas la declara en la DAM.",
    documento: "Sale de la forma de pago acordada, no del BL.",
    factura: "Puede coincidir con el banco que la factura mencione. En el ejemplo el nombre es ficticio.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 5.1. El código de la entidad está al lado y es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "comercial.codigoEntidadFinanciera",
    bloque: "comercial",
    etiqueta: "Código de la entidad financiera",
    rutas: ["comercial.codigoEntidadFinanciera"],
    queEs: "Código de la entidad financiera en la tabla de SUNAT. Esa tabla no está en esta carpeta. El ejemplo dice PENDIENTE DE VERIFICAR y no inventa el código.",
    quien: "Lo consignaría el agente de aduanas. Aquí se deja la marca.",
    documento: "No sale de la factura como código oficial.",
    factura: "No figura el código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 5.1. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.subpartida",
    bloque: "items",
    etiqueta: "Subpartida nacional",
    rutas: ["serie.subpartida"],
    amplia: true,
    queEs: "Clasificación arancelaria de la mercancía, con diez dígitos. En el ejemplo, 9102.11.00.00, es un SUPUESTO y además PENDIENTE DE VERIFICAR contra el Arancel de Aduanas, que no está en esta carpeta. Los dos ítems comparten la subpartida: por eso forman una sola serie. Si fuera 8517.13.00.00 u 8517.14.00.00, la casilla 7.35 pediría además el número de serie y el IMEI de cada equipo. Esos relojes no están en ese caso. Ese párrafo rige desde el 5 de octubre de 2026.",
    quien: "La clasifica el agente de aduanas, con la descripción real de la mercancía. El importador también responde por esa clasificación. El exportador describe el producto; no asigna la subpartida nacional peruana.",
    documento: "La descripción sale de la factura. La subpartida nacional no viene impresa como código peruano en una factura extranjera.",
    factura: "No trae la subpartida nacional de diez dígitos.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.19. El dígito verificador de esa casilla queda vacío: el instructivo de esta carpeta no explica cómo calcularlo, y no se inventa. Marca PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.digitoSubpartida",
    bloque: "items",
    etiqueta: "Dígito verificador de la subpartida",
    rutas: ["serie.digitoSubpartida"],
    queEs: "Dígito que acompaña a la subpartida en la casilla 7.19. El instructivo de esta carpeta no explica cómo se calcula. El campo se deja vacío, con la marca PENDIENTE DE VERIFICAR. No se inventa un dígito.",
    quien: "Nadie lo calcula en esta herramienta. En un despacho real lo exige el formato, con la regla oficial.",
    documento: "No sale de la factura, ni del packing list, ni del BL.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.19, junto a la subpartida. PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.paisOrigen",
    bloque: "items",
    etiqueta: "País de origen",
    rutas: ["serie.paisOrigen"],
    queEs: "País donde se fabricó la mercancía, en palabras. En el ejemplo, China. Una serie admite un solo país de origen. No es lo mismo que el país del proveedor, aunque aquí coincidan porque se le compra al fabricante.",
    quien: "Lo declara el exportador en la factura, si consta el origen, y el agente de aduanas lo pasa a la DAM con el código oficial.",
    documento: "Sale de la factura, cuando ella indica el origen.",
    factura: "Sí, si la factura declara el origen.",
    packing: "A veces.",
    bl: "A veces, en la descripción de la carga.",
    dam: "Formato A, casilla 7.26, y Formato B, casilla 5.7. El código de país es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.codigoPaisOrigen",
    bloque: "items",
    etiqueta: "Código del país de origen",
    rutas: ["serie.codigoPaisOrigen"],
    queEs: "Código de aduana del país de origen. La tabla no está en esta carpeta. PENDIENTE DE VERIFICAR. No se inventa.",
    quien: "Lo consigna el agente de aduanas. El nombre lo da la factura.",
    documento: "El nombre puede salir de la factura. El código, no.",
    factura: "No figura el código.",
    packing: "No figura el código.",
    bl: "No figura el código.",
    dam: "Formato A, casilla 7.26, y Formato B, casilla 5.7. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.paisAdquisicion",
    bloque: "items",
    etiqueta: "País de adquisición",
    rutas: ["serie.paisAdquisicion"],
    queEs: "País donde se compra la mercancía, que puede no ser el de fabricación. En el ejemplo coincide con el origen, China, porque se le compra al fabricante.",
    quien: "Lo declara el agente de aduanas según el país del vendedor.",
    documento: "Se sigue del país del proveedor en la factura.",
    factura: "Se deduce del país del vendedor.",
    packing: "No es un rótulo propio.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.27. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.codigoPaisAdquisicion",
    bloque: "items",
    etiqueta: "Código del país de adquisición",
    rutas: ["serie.codigoPaisAdquisicion"],
    queEs: "Código de aduana del país de adquisición. PENDIENTE DE VERIFICAR: la tabla no está en esta carpeta.",
    quien: "Lo consignaría el agente de aduanas. Aquí se deja la marca.",
    documento: "El país, en palabras, se sigue de la factura. El código, no.",
    factura: "No figura el código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.27. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.paisEmbarque",
    bloque: "items",
    etiqueta: "País de embarque",
    rutas: ["serie.paisEmbarque"],
    queEs: "País desde el cual la mercancía se embarca con destino al Perú. En el ejemplo, China. Una escala en otro puerto no cambia este país: cuenta el embarque con destino al Perú.",
    quien: "Lo declara el agente de aduanas según el BL.",
    documento: "Sale del puerto de embarque del BL: Shenzhen está en China.",
    factura: "Puede coincidir con el país del vendedor. Quien fija el embarque es el BL.",
    packing: "A veces.",
    bl: "Sí, como país del puerto de carga.",
    dam: "Formato B, casilla 5.8. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.codigoPaisEmbarque",
    bloque: "items",
    etiqueta: "Código del país de embarque",
    rutas: ["serie.codigoPaisEmbarque"],
    queEs: "Código de aduana del país de embarque. PENDIENTE DE VERIFICAR: la tabla no está en esta carpeta.",
    quien: "Lo consignaría el agente de aduanas. Aquí se deja la marca.",
    documento: "El país sale del BL. El código, no.",
    factura: "No figura el código.",
    packing: "No figura el código.",
    bl: "El BL trae el país o el puerto en palabras, no este código.",
    dam: "Formato B, casilla 5.8. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.unidadFisica",
    bloque: "items",
    etiqueta: "Unidad física",
    rutas: ["serie.unidadFisica"],
    queEs: "Unidad en que el arancel cuenta la mercancía. En el ejemplo se usó U, de unidades. Es un SUPUESTO y queda PENDIENTE DE VERIFICAR contra el arancel, que no está en esta carpeta. No se da por buena solo porque la factura diga unidades.",
    quien: "La declara el agente de aduanas según el arancel. El exportador usa la unidad comercial de la factura, que puede coincidir o no.",
    documento: "La factura dice la unidad comercial. La unidad física oficial sale del arancel.",
    factura: "Trae la unidad comercial, no necesariamente el código de unidad física.",
    packing: "Cuenta bultos y unidades comerciales. No trae el código arancelario de unidad.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.16. La unidad del ejemplo es SUPUESTO y el código queda PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.claseBulto",
    bloque: "items",
    etiqueta: "Clase de bulto",
    rutas: ["serie.claseBulto"],
    queEs: "Cómo va empacada la carga, en palabras. En el ejemplo, cajas de cartón. El código de la tabla de SUNAT no está en el instructivo de esta carpeta.",
    quien: "La describe el exportador en el packing list. El agente de aduanas la declara, y el código oficial lo pondrá cuando tenga la tabla.",
    documento: "Sale del packing list y del BL.",
    factura: "A veces menciona el empaque. El detalle de bultos es del packing.",
    packing: "Sí.",
    bl: "Sí. Clase y número de bultos.",
    dam: "Formato A, casilla 7.13. Se imprime «cajas de cartón». El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "serie.codigoClaseBulto",
    bloque: "items",
    etiqueta: "Código de clase de bulto",
    rutas: ["serie.codigoClaseBulto"],
    queEs: "Código de la tabla de clases de bulto. No está en el instructivo de esta carpeta. PENDIENTE DE VERIFICAR. No se inventa.",
    quien: "Lo consignaría el agente de aduanas. Aquí se deja la marca.",
    documento: "El nombre sale del packing list. El código, no.",
    factura: "No figura el código.",
    packing: "No figura el código. El packing dice «cajas».",
    bl: "No figura el código.",
    dam: "Formato A, casilla 7.13. El código es PENDIENTE DE VERIFICAR."
  });

  dato({
    id: "items.descripcion",
    bloque: "items",
    etiqueta: "Descripción del ítem",
    rutas: ["items.0.descripcion", "items.1.descripcion"],
    porItem: true,
    amplia: true,
    queEs: "Qué es la mercancía, con lo que el instructivo pide para identificarla: denominación, presentación, material y uso. Cada ítem es un modelo. Los dos van en la misma serie porque comparten subpartida, BL, origen, moneda y tipo de seguro. La casilla 7.35 es la descripción de la serie. El párrafo de 2026, que pide serie e IMEI, solo obliga a las subpartidas 8517.13.00.00 y 8517.14.00.00. No aplica a estos relojes.",
    quien: "La escribe el exportador en la factura. El agente de aduanas la declara, sin quitar el material ni el uso.",
    documento: "Sale de la factura comercial. El packing repite la descripción sin precios.",
    factura: "Sí. Descripción de cada línea.",
    packing: "Sí. La misma mercancía, sin precio.",
    bl: "Una descripción breve de la carga. No suele repetir toda la ficha técnica.",
    dam: "Formato A, casilla 7.35, y Formato B, casilla 5.19: la descripción larga. En el Formato B, 5.12 lleva solo el nombre común (en el ejemplo, «Reloj de pulsera»); 5.13 la marca DEMO y 5.14 el modelo AURA o LIMA. La casilla 7.35 es del instructivo base. El párrafo de serie e IMEI es la modificación de 2026 y aquí no se activa."
  });

  dato({
    id: "items.marca",
    bloque: "items",
    etiqueta: "Marca",
    rutas: ["items.0.marca", "items.1.marca"],
    porItem: true,
    queEs: "Marca comercial del producto. En el ejemplo, DEMO, ficticia. Los dos modelos comparten marca.",
    quien: "La escribe el exportador en la factura. El agente de aduanas la declara en el Formato B.",
    documento: "Sale de la factura.",
    factura: "Sí.",
    packing: "Sí, para identificar la caja.",
    bl: "A veces, dentro de la descripción.",
    dam: "Formato B, casilla 5.13. En el ejemplo la marca no se repite en la casilla 7.37: puede quedar vacía, porque marca y modelo van al Formato B."
  });

  dato({
    id: "items.modelo",
    bloque: "items",
    etiqueta: "Modelo",
    rutas: ["items.0.modelo", "items.1.modelo"],
    porItem: true,
    queEs: "Modelo del producto. En el ejemplo, AURA en el ítem 1 y LIMA en el ítem 2. Por eso son dos ítems y una sola serie.",
    quien: "Lo escribe el exportador. El agente de aduanas lo declara en el Formato B.",
    documento: "Sale de la factura.",
    factura: "Sí.",
    packing: "Sí.",
    bl: "A veces, dentro de la descripción.",
    dam: "Formato B, casilla 5.14."
  });

  dato({
    id: "items.cantidad",
    bloque: "items",
    etiqueta: "Cantidad",
    rutas: ["items.0.cantidad", "items.1.cantidad"],
    porItem: true,
    queEs: "Cuántas unidades comerciales trae el ítem. En el ejemplo, 500 y 300. La serie suma 800. No es el número de bultos: los bultos son las cajas.",
    quien: "La escribe el exportador en la factura y en el packing. El agente de aduanas declara el total de la serie y la cantidad de cada ítem.",
    documento: "Sale de la factura y debe coincidir con el packing list.",
    factura: "Sí. Cantidad de cada línea.",
    packing: "Sí. Las mismas unidades, sin precio.",
    bl: "El BL suele declarar bultos, no las 800 unidades sueltas.",
    dam: "Por ítem, Formato B, casilla 5.11. El total de la serie, Formato A, casilla 7.10 (cantidad en unidad comercial) y casilla 7.16 (cantidad en unidad física). En el ejemplo ambas quedan en 800 porque la unidad asumida es U."
  });

  dato({
    id: "items.unidadComercial",
    bloque: "items",
    etiqueta: "Unidad comercial",
    rutas: ["items.0.unidadComercial", "items.1.unidadComercial"],
    porItem: true,
    queEs: "Unidad en que se vendió el ítem. En el ejemplo, U. Puede no ser la misma que la unidad física del arancel. Aquí se asumió que sí coinciden, y la unidad física queda PENDIENTE DE VERIFICAR.",
    quien: "La escribe el exportador en la factura. El agente la declara en el Formato B.",
    documento: "Sale de la factura.",
    factura: "Sí.",
    packing: "Sí.",
    bl: "No suele repetir la unidad comercial de la factura.",
    dam: "Formato B, casilla 5.11, junto a la cantidad. La unidad física de la serie es la casilla 7.16."
  });

  dato({
    id: "items.bultos",
    bloque: "items",
    etiqueta: "Bultos",
    rutas: ["items.0.bultos", "items.1.bultos"],
    porItem: true,
    queEs: "Número de bultos del ítem: las cajas, no los relojes. En el ejemplo, 20 y 10. La serie suma 30. Ese 30 tiene que ser el mismo en el packing, en el BL y en la casilla 7.12.",
    quien: "Los cuenta el exportador al embalar y los escribe en el packing list. La naviera los declara en el BL. El agente de aduanas los pasa a la DAM.",
    documento: "Sale del packing list y del BL.",
    factura: "La factura puede no detallar bultos. El documento del empaque es el packing list.",
    packing: "Sí.",
    bl: "Sí. Número de bultos.",
    dam: "Formato A, casilla 7.12: la suma de la serie. La clase de esos bultos es la casilla 7.13."
  });

  dato({
    id: "items.pesoNetoKg",
    bloque: "items",
    etiqueta: "Peso neto",
    rutas: ["items.0.pesoNetoKg", "items.1.pesoNetoKg"],
    porItem: true,
    queEs: "Peso de la mercancía sin el empaque, en kilogramos. En el ejemplo, 80 kg y 48 kg. La serie suma 128 kg. El neto no puede ser mayor que el bruto.",
    quien: "Lo pesa el exportador y lo escribe en el packing list. El agente de aduanas declara el total de la serie.",
    documento: "Sale del packing list. La factura de este ejercicio no es el documento del peso.",
    factura: "No lo necesita.",
    packing: "Sí.",
    bl: "El BL declara sobre todo el peso bruto. El neto es del packing.",
    dam: "Formato A, casilla 7.14: suma de los pesos netos de la serie, en kg."
  });

  dato({
    id: "items.pesoBrutoKg",
    bloque: "items",
    etiqueta: "Peso bruto",
    rutas: ["items.0.pesoBrutoKg", "items.1.pesoBrutoKg"],
    porItem: true,
    queEs: "Peso de la mercancía con su empaque, en kilogramos. En el ejemplo, 95 kg y 58 kg. La serie suma 153 kg. Ese 153 tiene que coincidir en el packing, en el BL y en la casilla 7.15.",
    quien: "Lo pesa el exportador. La naviera lo imprime en el BL. El agente de aduanas lo declara.",
    documento: "Sale del packing list y del BL.",
    factura: "No lo necesita.",
    packing: "Sí.",
    bl: "Sí.",
    dam: "Formato A, casilla 7.15, en kg."
  });

  dato({
    id: "items.volumenM3",
    bloque: "items",
    etiqueta: "Volumen",
    rutas: ["items.0.volumenM3", "items.1.volumenM3"],
    porItem: true,
    sinCasillaDam: true,
    queEs: "Espacio que ocupa la carga, en metros cúbicos. En el ejemplo, 1,2 m³ y 0,7 m³; la serie suma 1,9 m³. No es el peso. El peso neto va a la casilla 7.14 y el bruto a la 7.15. El volumen no. No tiene casilla en la DAM.",
    quien: "Lo mide quien arma el packing list, el exportador. La naviera puede imprimirlo en el BL. El agente de aduanas no lo pasa a una casilla de la DAM.",
    documento: "Sale del packing list y del BL. La factura no lo necesita.",
    factura: "No. La factura no lo necesita.",
    packing: "Sí. Metros cúbicos por ítem y el total.",
    bl: "Sí. Volumen de la carga. El rótulo (measurement, CBM) cambia según la naviera.",
    dam: SIN_CASILLA
  });

  dato({
    id: "items.precioUnitarioUsd",
    bloque: "items",
    etiqueta: "Precio unitario",
    rutas: ["items.0.precioUnitarioUsd", "items.1.precioUnitarioUsd"],
    porItem: true,
    amplia: true,
    queEs: "Precio de una unidad, en dólares, según la factura. En el ejemplo, 12,00 y 15,00. Multiplicado por la cantidad da el valor del ítem: 6.000,00 y 4.500,00. En este FOB, la suma de los ítems es el total de la factura y el FOB: 10.500,000. No es el valor en aduana: a ese todavía le faltan el flete, el seguro y los ajustes.",
    quien: "Lo pactan comprador y vendedor. Lo escribe el exportador en la factura. El agente de aduanas lo declara con seis decimales en el Formato B.",
    documento: "Sale de la factura comercial. El packing list no lleva precios.",
    factura: "Sí. Precio de cada línea.",
    packing: "No.",
    bl: "No.",
    dam: "Formato B, casilla 5.9: FOB unitario en dólares, con seis decimales (12,000000 y 15,000000). El FOB total de la serie es otra casilla: 7.30 en el Formato A y 8.1.1 en el Formato B."
  });

  dato({
    id: "items.valorLinea",
    bloque: "items",
    etiqueta: "Valor del ítem",
    selector: "#formulario [data-valor-item]",
    porItem: true,
    calculado: true,
    queEs: "Cantidad por precio unitario. La pantalla lo calcula: no se vuelve a escribir a mano. En el ejemplo, 6.000,00 y 4.500,00. Sumados son el FOB de la factura. Todavía no son el valor en aduana.",
    quien: "Lo calcula quien arma la factura, y esta pantalla lo repite. El agente de aduanas declara el unitario y el total, no un tercer precio distinto.",
    documento: "Sale de la factura: es el importe de la línea.",
    factura: "Sí. Importe de cada línea.",
    packing: "No.",
    bl: "No.",
    dam: "No es una casilla distinta del precio. El unitario va en el Formato B, casilla 5.9. El FOB de la serie, que es la suma, va en 7.30 y en 8.1.1."
  });

  dato({
    id: "valoracion.fob",
    bloque: "valoracion",
    etiqueta: "FOB",
    ancla: "valor-fob-detalle",
    calculado: true,
    amplia: true,
    queEs: "Es el precio de la factura en este Incoterm FOB: la suma de los ítems, 10.500,000 USD. No incluye el flete marítimo ni el seguro, porque en un FOB eso lo paga el comprador. No es el CIF comercial: el CIF sumaría además el flete y el seguro. Tampoco es el valor en aduana: ese suma FOB, flete, seguro y ajustes. La diferencia entre CIF y valor en aduana está explicada junto a la cifra de valor en aduana.",
    quien: "Lo escribe el exportador como total de la factura. La pantalla lo recalcula desde los ítems. El agente de aduanas lo declara. No se vuelve a tipear un total distinto.",
    documento: "Sale de la factura comercial. El packing list no lleva este monto.",
    factura: "Sí. Total FOB.",
    packing: "No.",
    bl: "No es un monto del BL. En un FOB el vendedor no paga el flete marítimo.",
    dam: "Formato A, casillas 6.1 (total de la declaración) y 7.30 (FOB de la serie), con tres decimales. Formato B, casilla 8.1.1 (sección 8, también tres decimales). Los seis decimales son solo del FOB unitario en Formato B, casilla 5.9."
  });

  dato({
    id: "valoracion.fleteUsd",
    bloque: "valoracion",
    etiqueta: "Flete",
    rutas: ["valoracion.fleteUsd"],
    amplia: true,
    queEs: "Costo del transporte desde el puerto de embarque hasta el puerto de destino. En el ejemplo, 800,000 USD, y es un SUPUESTO. En un FOB el vendedor no paga este flete: lo paga el comprador. Por eso no está dentro de los 10.500,000. En el BL se anota como flete por cobrar (collect). Varias navieras no imprimen el monto, y el nombre del campo cambia: flete prepaid, collect o as arranged.",
    quien: "Lo cotiza la naviera o el agente de carga. Lo paga, en un FOB, el comprador. El agente de aduanas declara el monto en la DAM aunque el BL no lo imprima.",
    documento: "El monto puede salir de la cotización del flete. En el BL de este ejercicio se indica la condición «flete por cobrar». La factura FOB no lo incluye.",
    factura: "No, en este FOB. Un CIF sí lo traería dentro del precio.",
    packing: "No.",
    bl: "La condición de flete sí. El monto, solo si esa naviera lo imprime. En el ejemplo se guarda el monto para seguirlo hasta la casilla 6.2.",
    dam: "Formato A, casillas 6.2 y 7.31. Formato B, casilla 8.3.1: flete hasta el lugar de importación."
  });

  dato({
    id: "valoracion.seguroUsd",
    bloque: "valoracion",
    etiqueta: "Seguro",
    rutas: ["valoracion.seguroUsd"],
    queEs: "Prima del seguro de la mercancía, en dólares. En el ejemplo, 40,000 USD, SUPUESTO. En un FOB no va incluida en el precio del vendedor. Esta herramienta no arma la póliza: solo guarda el monto para la DAM.",
    quien: "La contrata el comprador en un FOB. El agente de aduanas declara el monto y el tipo de seguro.",
    documento: "Sale de la póliza o de la nota del seguro. No sale de la factura FOB ni del packing list.",
    factura: "No, en este FOB.",
    packing: "No.",
    bl: "No es un monto habitual del BL.",
    dam: "Formato A, casillas 6.3 y 7.32. Formato B, casilla 8.4. El tipo de seguro va junto a la 7.32."
  });

  dato({
    id: "valoracion.tipoSeguro",
    bloque: "valoracion",
    etiqueta: "Tipo de seguro",
    rutas: ["valoracion.tipoSeguro"],
    queEs: "Código del tipo de seguro de la serie. En el instructivo, 1 es no asegurada, 2 con póliza individual, 3 con póliza flotante y 4 no asegurada en su totalidad. En el ejemplo es 2. Una serie admite un solo tipo de seguro.",
    quien: "Lo declara el agente de aduanas según la póliza que tenga el importador.",
    documento: "Sale de la forma en que se aseguró la carga, no de la factura FOB.",
    factura: "No figura el código.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.32, junto al monto del seguro. El código 2 es «con póliza de seguro individual»."
  });

  dato({
    id: "valoracion.tipoSeguroDescripcion",
    bloque: "valoracion",
    etiqueta: "Descripción del tipo de seguro",
    rutas: ["valoracion.tipoSeguroDescripcion"],
    queEs: "Lectura del tipo de seguro. El código 2, en el instructivo, es con póliza de seguro individual.",
    quien: "La anota el agente de aduanas como lectura del código.",
    documento: "Explica la casilla 7.32. La póliza misma no se genera en esta herramienta.",
    factura: "No figura.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 7.32. Esta frase es la lectura del código 2."
  });

  dato({
    id: "valoracion.ajustesUsd",
    bloque: "valoracion",
    etiqueta: "Ajustes",
    rutas: ["valoracion.ajustesUsd"],
    amplia: true,
    queEs: "Suma de los ajustes de valor: lo que se añade o se resta al precio para llegar al valor en aduana (comisiones, regalías, envases facturados aparte, y otras partidas del Formato B). En el ejemplo es 0. Por eso, en este caso, el valor en aduana coincide con la suma FOB + flete + seguro. Si el ajuste no fuera cero, esa coincidencia se rompe.",
    quien: "Los determina el agente de aduanas al revisar la transacción. En el ejemplo no hay nada que añadir ni que deducir, y se declara cero.",
    documento: "Salen de la revisión del valor, no de una línea de la factura de estos relojes. La factura solo trae el precio FOB.",
    factura: "No hay una línea de ajuste en este ejemplo.",
    packing: "No figura.",
    bl: "No figura.",
    dam: "Formato A, casilla 6.4 (total de ajustes) y casilla 7.33 (ajuste de la serie). En el Formato B el ajuste unitario es la casilla 5.10. En el ejemplo los tres quedan en cero."
  });

  dato({
    id: "valoracion.valorAduana",
    bloque: "valoracion",
    etiqueta: "Valor en aduana",
    ancla: "valor-aduana-detalle",
    calculado: true,
    amplia: true,
    queEs: "Es la base que usa la DAM, no el nombre del contrato. El CIF comercial, en Incoterms 2020, es un término de venta: el precio ya incluye costo, seguro y flete hasta el puerto de destino. Este embarque no está pactado CIF; está pactado FOB Shenzhen. Si se suman FOB + flete + seguro se obtiene una cifra que en clase se llama CIF comercial. El valor en aduana es otra suma: FOB + flete + seguro + ajustes. En este ejemplo las dos cifras coinciden (11.340,000) solo porque el ajuste es cero. Si hubiera un ajuste, dejarían de ser iguales. La pantalla usa las dos palabras con su nombre: valor en aduana en la DAM, y CIF solo como lectura comercial.",
    quien: "Lo calcula el agente de aduanas con la factura, el flete y el seguro. La pantalla lo recalcula. No lo escribe el proveedor como si el contrato fuera CIF.",
    documento: "No es una cifra de la factura FOB ni del packing list ni del BL. Se arma en la DAM con piezas que salen de esos documentos y del seguro.",
    factura: "No. La factura trae el FOB, 10.500,000.",
    packing: "No.",
    bl: "No.",
    dam: "Formato A, casilla 6.5: suma de 6.1, 6.2, 6.3 y 6.4. Por serie, casilla 7.34: suma de 7.30, 7.31, 7.32 y 7.33. El Formato A usa tres decimales."
  });

  dato({
    id: "partes.shipperBl",
    bloque: "partes",
    etiqueta: "Shipper del BL, si es distinto",
    rutas: ["partes.shipperBl"],
    amplia: true,
    sinCasillaDam: true,
    queEs: "En el ejemplo el shipper y el proveedor son la misma empresa, y este campo se deja vacío. Si quien entrega la carga a la naviera no es quien emite la factura, aquí va el nombre del shipper. El instructivo permite que no sean la misma persona: es un aviso, no un error.",
    quien: "Lo escribe quien arma el conocimiento de embarque. El agente de aduanas declara al proveedor en el Formato B aunque el shipper sea otro.",
    documento: "Sale del BL, en el rótulo de shipper. La factura sigue a nombre del proveedor.",
    factura: "No. La factura la emite el proveedor.",
    packing: "No, si el packing lo emite el proveedor.",
    bl: "Sí. Shipper, cuando no es el proveedor.",
    dam: SIN_CASILLA + " El proveedor va al Formato B, casillas 3.1 a 3.5. No es la casilla 3.1 del Formato A."
  });

  dato({
    id: "items.series",
    bloque: "items",
    etiqueta: "Números de serie (casilla 7.35)",
    rutas: ["items.0.series", "items.1.series"],
    porItem: true,
    amplia: true,
    queEs: "Número de serie único de cada equipo, uno por línea. Solo lo exige la casilla 7.35 si la subpartida es 8517.13.00.00 o 8517.14.00.00. Es el párrafo añadido en 2026 y rige desde el 5 de octubre de 2026. Un reloj 9102 no lo necesita: con esa subpartida estos campos no se muestran.",
    quien: "Los toma el agente de aduanas de la factura, del packing o de la lista del proveedor. El importador responde por que sean los del equipo.",
    documento: "No salen del BL. Salen de la identificación de cada equipo y se declaran en la DAM.",
    factura: "A veces el proveedor los lista. No es un campo fijo de toda factura comercial.",
    packing: "A veces van en el detalle del bulto.",
    bl: "No es un rótulo del BL.",
    dam: "Formato A, casilla 7.35, párrafo de 2026. Solo para 8517.13.00.00 y 8517.14.00.00. La casilla en sí es del instructivo base; el párrafo de serie e IMEI es la modificación de 2026."
  });

  dato({
    id: "items.imeis",
    bloque: "items",
    etiqueta: "IMEI (casilla 7.35)",
    rutas: ["items.0.imeis", "items.1.imeis"],
    porItem: true,
    amplia: true,
    queEs: "Código IMEI de cada teléfono, uno por línea, tantos como unidades. La casilla 7.35 lo pide junto con el número de serie solo en 8517.13.00.00 y 8517.14.00.00. Rige desde el 5 de octubre de 2026. Los relojes del ejemplo no lo activan.",
    quien: "Los toma el agente de aduanas de la identificación del equipo. El importador responde por esa lista.",
    documento: "No sale del BL ni es un total del packing. Es una descripción mínima del teléfono, equipo por equipo.",
    factura: "A veces el proveedor los anota. No es un importe.",
    packing: "A veces acompañan la serie en el detalle.",
    bl: "No es un rótulo del BL.",
    dam: "Formato A, casilla 7.35, párrafo de 2026, vigente desde el 5 de octubre de 2026. No aplica a la subpartida 9102.11.00.00 de los relojes."
  });

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", iniciar);
    } else {
      iniciar();
    }
  }

  return {
    lista: lista,
    porId: function (id) {
      return porId[id] || null;
    },
    porRuta: function (ruta) {
      return porRuta[ruta] || null;
    },
    problemas: problemas
  };
})();
