/* Casos de ejemplo de PLAN.md §9. Todos los datos son FICTICIOS.
   Los RUC 200000000XX cumplen el dígito módulo 11 [H*], pero pueden no ser únicos (PV-19).
   Cada caso se arma sobre Modelo.operacionVacia(), así tiene exactamente la misma estructura.
   Script clásico: deja el objeto global EJEMPLOS. */

var EJEMPLOS = (function () {
  function item(datos) {
    return Object.assign(Modelo.itemVacio(), datos);
  }

  // Aplica valores sobre una copia vacía del modelo, bloque por bloque.
  function mezclar(destino, origen) {
    Object.keys(origen).forEach(function (k) {
      var v = origen[k];
      if (v && typeof v === "object" && !Array.isArray(v) && destino[k] && typeof destino[k] === "object") {
        mezclar(destino[k], v);
      } else {
        destino[k] = v;
      }
    });
    return destino;
  }

  var AGENTES = {
    agenteMaritimo: { razonSocial: "Agencia Marítima Didáctica S.A.C. — FICTICIA", ruc: "20000000036" },
    agenteAduana: { razonSocial: "Agencia de Aduanas Didáctica S.A.C. — FICTICIA", ruc: "20000000028" },
    depositoTemporal: { razonSocial: "Depósito Temporal Didáctico S.A.C. — FICTICIA", ruc: "20000000044" },
    entidadFinanciera: { nombre: "Banco Didáctico — FICTICIO", codigo: "" }
  };
  var MARCAS_AGENTES = {
    "generales.partes.agenteMaritimo.ruc": { marca: "PV", nota: "PV-28: en la Aduana Marítima del Callao podría ir el código de SUNAT en lugar del RUC." },
    "generales.partes.agenteAduana.ruc": { marca: "PV", nota: "PV-28" },
    "generales.partes.depositoTemporal.ruc": { marca: "PV", nota: "PV-28" },
    "generales.partes.entidadFinanciera.codigo": { marca: "PV", nota: "PV-09: código de la entidad financiera en la tabla de SUNAT." }
  };

  // Rubro 7 del caso 1 (decisión D7): las respuestas "No" son SUPUESTOS del ejemplo, no una regla.
  // 7.2, 7.3 y 7.6 quedan vacías porque solo se responden si 7.1 o 7.5 son "Sí".
  var MARCAS_RUBRO7_NO = {};
  ["1", "5", "7", "8", "9", "10", "11", "12", "13", "14"].forEach(function (n) {
    MARCAS_RUBRO7_NO["generales.valor.rubro7.p7_" + n] = { marca: "S", nota: "Supuesto del ejemplo (decisión D7); no es una respuesta por defecto." };
  });

  // ---------------- Caso 1: importación CIF Callao (PLAN.md §9.1)
  var caso1 = mezclar(Modelo.operacionVacia(), {
    meta: {
      referencia: "OP-2026-001",
      descripcion: "Caso 1 — Importación CIF Callao: ventiladores (serie 1) y cargadores USB-C (serie 2)."
    },
    generales: {
      operacion: { tipo: "importacion", modalidadCarga: "FCL" },
      partes: Object.assign({
        vendedor: {
          razonSocial: "Ningbo Ejemplo Electric Co., Ltd. — FICTICIA",
          direccion: "No. 1 Example Road, Beilun", ciudad: "Ningbo, Zhejiang", pais: "CN",
          idFiscal: "ID fiscal ficticio", ubigeo: "", telefono: "", correo: "", condicion: "1"
        },
        comprador: {
          razonSocial: "Importadora Didáctica Andina S.A.C. — FICTICIA",
          direccion: "Av. Ejemplo 123, Cercado de Lima", ciudad: "Lima", pais: "PE",
          idFiscal: "20000000001", ubigeo: "150101"
        },
        consignatario: { tipo: "comprador" },
        notify: { tipo: "consignatario" },
        naviera: { nombre: "Naviera Didáctica Line — FICTICIA" },
        aseguradora: { razonSocial: "Aseguradora Ejemplo Co., Ltd. — FICTICIA", direccion: "Ningbo, China" }
      }, AGENTES),
      ruta: {
        puertoEmbarque: { nombre: "Ningbo", locode: "CNNGB" },
        puertoDescarga: { nombre: "Callao", locode: "PECLL" },
        paisAdquisicion: "CN"
      },
      comercial: {
        incoterm: "CIF", lugarConvenido: "Callao", moneda: "USD",
        facturaNumero: "VEN-2026-0457", facturaFecha: "2026-10-05",
        modalidadPago: "6", condicionesPago: "100 % anticipado por transferencia bancaria", medioPago: "09"
      },
      aduana: {
        aduana: "118", modalidadDespacho: "1-0", tipoDespacho: "",
        numeroOrden: "2026-000001", fechaFormulacion: "2026-11-09",
        tipoCambio: 3.5, tipoCambioFecha: "", tipoCambioFuente: "Supuesto didáctico (no es un dato real)",
        regionDestino: "40615"
      },
      valor: {
        nivelComercial: "2", naturaleza: "11", formaEnvio: "1/1", tipoValor: "1",
        intermediario: { hubo: "2" },
        rubro7: {
          p7_1: "2", p7_2: "", p7_3: "", p7_4: "1", p7_5: "2", p7_6: "", p7_7: "2",
          p7_8: "2", p7_9: "2", p7_10: "2", p7_11: "2", p7_12: "2", p7_13: "2", p7_14: "2"
        }
      }
    },
    especificos: {
      items: [
        item({
          nombre: "Ventilador de pie",
          descripcion: "Ventilador de pie 16\", 45 W, 220 V, 3 velocidades; uso doméstico",
          marca: "EJEMPLO", modelo: "VE-16", subpartida: "8414.51.00.00", paisOrigen: "CN", estado: "10",
          cantidad: 200, precioUnitario: 19.50,
          claseBulto: "CAJA_CARTON", unidadesPorBulto: 1, pesoNetoBulto: 4.50, pesoBrutoBulto: 5.20,
          largoCm: 50, anchoCm: 20, altoCm: 60, tasaAV: 6
        }),
        item({
          nombre: "Ventilador de pie",
          descripcion: "Ventilador de pie 18\", 60 W, 220 V, 3 velocidades; uso doméstico",
          marca: "EJEMPLO", modelo: "VE-18", subpartida: "8414.51.00.00", paisOrigen: "CN", estado: "10",
          cantidad: 160, precioUnitario: 24.00,
          claseBulto: "CAJA_CARTON", unidadesPorBulto: 1, pesoNetoBulto: 5.50, pesoBrutoBulto: 6.40,
          largoCm: 50, anchoCm: 25, altoCm: 60, tasaAV: 6
        }),
        item({
          nombre: "Cargador USB-C",
          descripcion: "Adaptador de corriente USB-C 20 W; entrada 100–240 V CA; salida 5 V / 9 V CC; para teléfonos móviles; sin cable",
          marca: "EJEMPLO", modelo: "CG-20", subpartida: "8504.40.90.00", paisOrigen: "CN", estado: "10",
          cantidad: 3000, precioUnitario: 4.10,
          claseBulto: "CAJA_CARTON", unidadesPorBulto: 100, pesoNetoBulto: 6.00, pesoBrutoBulto: 7.50,
          largoCm: 40, anchoCm: 30, altoCm: 40, tasaAV: 0
        })
      ],
      marcasEmbarque: "IDA / OP-2026-001 / CALLAO / C/No. 1-390 / MADE IN CHINA",
      contenedor: {
        tipo: "22G1", numero: "EJMU2610147", precinto: "SD-000123", tara: 2200, estibaTrincaje: 0,
        vgmMetodo: "2", vgmResponsable: "Ningbo Ejemplo Electric Co., Ltd. — FICTICIA", vgmFecha: "2026-10-12"
      },
      transporte: {
        nave: "MV DIDACTIC STAR", viaje: "2641E", booking: "BK-2026-0001",
        blNumero: "DIDL2026000457", blTipo: "nominativo", blOriginales: 3,
        blLugarEmision: "Ningbo", blFechaEmision: "2026-10-14", fechaShippedOnBoard: "2026-10-14",
        clausulaSlac: true, clausulaStc: true, shipper: "", fleteBl: "prepaid",
        manifiesto: "118-2026-POR ASIGNAR", fechaEmbarque: "2026-10-14", fechaTerminoEmbarque: "",
        eta: "2026-11-15", fechaTerminoDescarga: ""
      },
      seguro: {
        hay: true, tipoPoliza: "flotante", poliza: "POL-0001", certificado: "CERT-0457", fechaEmision: "2026-10-13",
        clausulas: "C", guerra: false, huelgas: false, coberturaPct: 110, tasaPrimaPct: 0.30,
        lugarPagoSiniestros: "Lima, Perú, en USD", agenteReclamos: "Ajustadores Didácticos S.A.C. — FICTICIA",
        pctTablaSunat: null
      },
      origen: { solicitaPreferencia: false },
      valoracion: { flete: 1850.00 },
      tributos: { tasaPercepcion: 3.5 }
    },
    marcas: Object.assign({
      "generales.partes.vendedor.condicion": { marca: "S", nota: "Supuesto del caso." },
      "generales.aduana.tipoDespacho": { marca: "PV", nota: "El IT no trae lista de tipos de despacho para importación para el consumo." },
      "generales.aduana.numeroOrden": { marca: "S", nota: "Número ficticio; lo asigna el declarante." },
      "generales.aduana.fechaFormulacion": { marca: "S", nota: "Antes de la llegada (despacho anticipado)." },
      "generales.aduana.tipoCambio": { marca: "S", nota: "Supuesto didáctico, no es un tipo de cambio real (PV-07)." },
      "generales.aduana.regionDestino": { marca: "S", nota: "Se supone que la mercancía se consume en Lima." },
      "generales.valor.nivelComercial": { marca: "S", nota: "Supuesto del caso." },
      "generales.valor.naturaleza": { marca: "S", nota: "Supuesto del caso." },
      "generales.valor.rubro7.p7_4": { marca: "S", nota: "Supuesto del caso (decisiones D1 y D7): en esta compraventa a precio firme el comprador dispone libremente de la mercancía." },
      "especificos.items.0.subpartida": { marca: "PV", nota: "PV-10: SA 8414.51 [H*]; '.00.00' es relleno didáctico." },
      "especificos.items.1.subpartida": { marca: "PV", nota: "PV-10: SA 8414.51 [H*]; '.00.00' es relleno didáctico." },
      "especificos.items.2.subpartida": { marca: "PV", nota: "PV-10: SA 8504.40 [H*]; '.90.00' es una hipótesis no verificada." },
      "especificos.items.0.tasaAV": { marca: "S", nota: "Tasa supuesta (PV-11)." },
      "especificos.items.1.tasaAV": { marca: "S", nota: "Tasa supuesta (PV-11)." },
      "especificos.items.2.tasaAV": { marca: "S", nota: "Tasa supuesta (PV-11)." },
      "especificos.tributos.tasaPercepcion": { marca: "PV", nota: "Tasa supuesta para el caso (PV-01); depende del importador y, en algunos casos, de la mercancía." },
      "especificos.contenedor.numero": { marca: "S", nota: "Prefijo EJMU ficticio (PV-19); dígito de control ISO 6346 calculado." },
      "especificos.contenedor.tara": { marca: "S", nota: "Tara supuesta (PV-16)." },
      "especificos.transporte.manifiesto": { marca: "S", nota: "Estructura aduana–año–número (IT A 3.2); número por asignar." },
      "especificos.transporte.fechaTerminoDescarga": { marca: "PV", nota: "PV-26: despacho anticipado; el IT no dice qué va en la casilla 3.4." },
      "especificos.seguro.tasaPrimaPct": { marca: "S", nota: "Tasa de prima supuesta." },
      "especificos.seguro.agenteReclamos": { marca: "S", nota: "Nombre ficticio." },
      "especificos.valoracion.flete": { marca: "S", nota: "Flete supuesto." }
    }, MARCAS_AGENTES, MARCAS_RUBRO7_NO)
  });

  // ---------------- Caso 2: exportación FOB Callao con certificado de origen (PLAN.md §9.2)
  var caso2 = mezclar(Modelo.operacionVacia(), {
    meta: {
      referencia: "OP-2026-002",
      descripcion: "Caso 2 — Exportación FOB Callao de prendas de algodón a Chile, con certificado de origen."
    },
    generales: {
      operacion: { tipo: "exportacion", modalidadCarga: "FCL" },
      partes: Object.assign({
        vendedor: {
          razonSocial: "Textiles Didácticos del Perú S.A.C. — FICTICIA",
          direccion: "Av. Ejemplo 456, Cercado de Lima", ciudad: "Lima", pais: "PE",
          idFiscal: "20000000010", ubigeo: "150101", telefono: "", correo: "", condicion: ""
        },
        comprador: {
          razonSocial: "Tiendas Ejemplo SpA — FICTICIA",
          direccion: "Av. Ejemplo 789", ciudad: "Santiago", pais: "CL", idFiscal: "RUT ficticio", ubigeo: ""
        },
        consignatario: { tipo: "comprador" },
        notify: { tipo: "consignatario" },
        naviera: { nombre: "Naviera Didáctica Line — FICTICIA" },
        entidadCO: { nombre: "Entidad certificadora autorizada — FICTICIA" }
      }, AGENTES),
      ruta: {
        puertoEmbarque: { nombre: "Callao", locode: "PECLL" },
        puertoDescarga: { nombre: "San Antonio", locode: "CLSAI" }
      },
      comercial: {
        incoterm: "FOB", lugarConvenido: "Callao", moneda: "USD",
        facturaNumero: "TDP-2026-0102", facturaFecha: "2026-10-20",
        modalidadPago: "2", condicionesPago: "100 % por transferencia a 30 días de la fecha del B/L"
      },
      aduana: {
        aduana: "118", modalidadDespacho: "", tipoDespacho: "00",
        numeroOrden: "2026-000002", fechaFormulacion: "2026-10-21"
      }
    },
    especificos: {
      items: [
        item({
          nombre: "Polo",
          descripcion: "Polo 100 % algodón, tejido de punto, cuello redondo, tallas S–XL",
          marca: "EJEMPLO", modelo: "", subpartida: "6109.10.00.00", paisOrigen: "PE", ubigeoOrigen: "150101", estado: "10",
          cantidad: 4000, precioUnitario: 5.20,
          claseBulto: "CAJA_CARTON", unidadesPorBulto: 50, pesoNetoBulto: 9.00, pesoBrutoBulto: 9.80,
          largoCm: 60, anchoCm: 40, altoCm: 35
        }),
        item({
          nombre: "Sudadera con capucha",
          descripcion: "Sudadera con capucha 100 % algodón, tejido de punto, tallas S–XL",
          marca: "EJEMPLO", modelo: "", subpartida: "6110.20.00.00", paisOrigen: "PE", ubigeoOrigen: "150101", estado: "10",
          cantidad: 1500, precioUnitario: 12.50,
          claseBulto: "CAJA_CARTON", unidadesPorBulto: 25, pesoNetoBulto: 12.50, pesoBrutoBulto: 13.40,
          largoCm: 60, anchoCm: 40, altoCm: 45
        })
      ],
      marcasEmbarque: "TE / OP-2026-002 / SAN ANTONIO / C/No. 1-140 / HECHO EN PERÚ",
      contenedor: {
        tipo: "22G1", numero: "EJMU2600025", precinto: "SD-000124", tara: 2200, estibaTrincaje: 0,
        vgmMetodo: "2", vgmResponsable: "Textiles Didácticos del Perú S.A.C. — FICTICIA", vgmFecha: "2026-10-23"
      },
      transporte: {
        nave: "MV DIDACTIC STAR", viaje: "2643S", booking: "BK-2026-0002",
        blNumero: "DIDL2026000102", blTipo: "nominativo", blOriginales: 3,
        blLugarEmision: "Callao", blFechaEmision: "2026-10-24", fechaShippedOnBoard: "2026-10-24",
        clausulaSlac: true, clausulaStc: true, shipper: "", fleteBl: "collect",
        manifiesto: "118-2026-POR ASIGNAR", fechaEmbarque: "2026-10-24", fechaTerminoEmbarque: "2026-10-24",
        eta: "2026-10-30", fechaTerminoDescarga: ""
      },
      seguro: { hay: false, coberturaPct: null },
      origen: {
        solicitaPreferencia: true, acuerdo: "TLC Perú–Chile", criterio: "",
        certificadoNumero: "CO-2026-0001", certificadoFecha: "2026-10-22"
      },
      valoracion: { flete: null }
    },
    marcas: Object.assign({
      "generales.aduana.numeroOrden": { marca: "S", nota: "Número ficticio; lo asigna el declarante." },
      "generales.aduana.fechaFormulacion": { marca: "S", nota: "Supuesto del caso." },
      "generales.partes.entidadCO.nombre": { marca: "S", nota: "Nombre ficticio; emisor real según el acuerdo (PV-12)." },
      "especificos.items.0.subpartida": { marca: "PV", nota: "PV-10: SA 6109.10 [H*]; dígitos nacionales por verificar." },
      "especificos.items.1.subpartida": { marca: "PV", nota: "PV-10: SA 6110.20 [H*]; dígitos nacionales por verificar." },
      "especificos.items.0.estado": { marca: "PV", nota: "PV-09: el código de estado en exportación (S 7.20) no está en el IT." },
      "especificos.items.1.estado": { marca: "PV", nota: "PV-09: el código de estado en exportación (S 7.20) no está en el IT." },
      "especificos.items.0.ubigeoOrigen": { marca: "S", nota: "Se supone que se fabricó en Lima." },
      "especificos.items.1.ubigeoOrigen": { marca: "S", nota: "Se supone que se fabricó en Lima." },
      "especificos.origen.criterio": { marca: "PV", nota: "PV-12: formato y criterio de origen según el TLC Perú–Chile." },
      "especificos.contenedor.numero": { marca: "S", nota: "Prefijo EJMU ficticio (PV-19); dígito de control ISO 6346 calculado." },
      "especificos.contenedor.tara": { marca: "S", nota: "Tara supuesta (PV-16)." },
      "especificos.transporte.manifiesto": { marca: "S", nota: "Estructura aduana–año–número (IT B 3.2); número por asignar." },
      "especificos.transporte.blTipo": { marca: "S", nota: "Supuesto del caso." }
    }, MARCAS_AGENTES)
  });

  // Copias independientes: ningún caso comparte objetos con el otro.
  return [
    { id: "caso1", titulo: "Caso 1 — Importación CIF Callao", operacion: Modelo.clonar(caso1) },
    { id: "caso2", titulo: "Caso 2 — Exportación FOB Callao", operacion: Modelo.clonar(caso2) }
  ];
})();
