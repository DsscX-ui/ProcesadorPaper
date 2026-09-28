/* Caso didáctico ficticio: relojes, Shenzhen–Callao.
   Nombres, RUC, buque, BL, contenedor y precinto no son de empresas ni de viajes reales.
   Los RUC solo cumplen el dígito verificador (módulo 11, pesos 5-4-3-2-7-6-5-4-3-2).
   Esta herramienta no consulta SUNAT.

   Depósito temporal: 20998887772.
   El borrador del plan traía 20998887776. Ese último dígito no corresponde:
   para la base 2099888777 el módulo 11 da 2, no 6. No hizo falta cambiar
   los otros tres (20987654326, 20123456786 y 20555666773): ya cumplían.

   Modalidad 1-0, Despacho Anticipado (el borrador decía 0-0).
   Incoterm FOB Shenzhen, versión 4 = Incoterms 2020.

   Fechas del anticipado (la modalidad 1-0 se mantiene):
   Antes: formulación 2026-09-08 y término de descarga 2026-09-05.
   La declaración quedaba después de la descarga (patrón excepcional).
   Ahora: formulación 2026-08-25, antes de la llegada. El embarque
   sigue el 2026-08-10. fechaTerminoDescarga queda vacía. El instructivo
   solo dice que la casilla 3.4 es la fecha en que culmina la descarga;
   no dice qué anotar en el anticipado si se formula antes. La DAM muestra
   3.4 como PENDIENTE DE VERIFICAR. No se inventa vacío, provisional ni N/A.

   Script clásico a propósito: al abrir index.html con doble clic no hay
   servidor, ni módulos, ni fetch. Este archivo deja la variable global
   EJEMPLO_RELOJES. */

var EJEMPLO_RELOJES = {
  meta: {
    caso: "relojes-shenzhen-callao",
    ficticio: true,
    nota: "Caso didáctico ficticio. No corresponde a una empresa, un RUC vigente ni un viaje real. Los RUC de prueba solo cumplen el dígito verificador; la herramienta no consulta SUNAT."
  },
  partes: {
    proveedor: {
      razonSocial: "Shenzhen Horizon Watches Co., Ltd.",
      direccion: "Shenzhen, China",
      ciudad: "Shenzhen",
      pais: "China",
      codigoPais: "PENDIENTE DE VERIFICAR",
      condicion: "1",
      condicionDescripcion: "fabricante"
    },
    importador: {
      razonSocial: "Importadora Pacífico Demo S.A.C.",
      codigoDocumento: "4",
      ruc: "20987654326",
      direccion: "Lima",
      ubigeo: "PENDIENTE DE VERIFICAR"
    },
    notify: {
      razonSocial: "Agencia de Aduanas Demo del Callao S.A.C."
    },
    agenteAduanas: {
      razonSocial: "Agencia de Aduanas Demo del Callao S.A.C.",
      ruc: "20123456786",
      /* Antes 2026-09-08 (después de la descarga). Ahora antes de la llegada. */
      fechaFormulacion: "2026-08-25"
    },
    agenteMaritimo: {
      razonSocial: "Agencia Marítima Demo S.A.C.",
      ruc: "20555666773"
    },
    naviera: {
      nombre: "Pacífico Demo Line"
    }
  },
  transporte: {
    buque: "DEMO PACIFIC",
    viaje: "026E",
    buqueNota: "SUPUESTO",
    puertoEmbarque: "Shenzhen",
    codigoPuertoEmbarque: "PENDIENTE DE VERIFICAR",
    puertoDestino: "Callao",
    aduana: "Intendencia de Aduana Marítima del Callao",
    codigoAduana: "PENDIENTE DE VERIFICAR",
    via: "1",
    viaDescripcion: "Marítimo",
    numeroBl: "DMOPAC2026001234",
    blNota: "SUPUESTO",
    contenedorTipo: "20 pies",
    contenedorNumero: "TEMU0000001",
    precinto: "DM123456",
    marcasBultos: "PACÍFICO DEMO / CALLAO / C/1-30",
    contenedorNota: "SUPUESTO",
    manifiesto: "PENDIENTE DE VERIFICAR",
    manifiestoNota: "Estructura del instructivo: código de aduana de ingreso, año y número. El código de aduana no está en las fuentes de esta carpeta.",
    fechaEmbarque: "2026-08-10",
    numeroOriginalesBl: "3/3",
    lugarEmisionBl: "Shenzhen",
    fechaEmisionBl: "2026-08-10",
    shippedOnBoard: "Sí",
    clausulaSaidToContain: "Sí",
    /* Antes 2026-09-05. Vacío: no hay fecha usable para pintar la casilla 3.4. */
    fechaTerminoDescarga: "",
    deposito: {
      razonSocial: "Depósito Temporal Demo S.A.C.",
      ruc: "20998887772"
    }
  },
  comercial: {
    incoterm: "FOB",
    incotermLugar: "Shenzhen",
    incotermVersion: "4",
    moneda: "Dólares de los Estados Unidos",
    codigoMoneda: "PENDIENTE DE VERIFICAR",
    numeroFactura: "HZ-2026-0812",
    fechaFactura: "2026-08-01",
    formaPago: "1",
    formaPagoDescripcion: "pago al contado",
    formaPagoFrase: "pago al contado por transferencia",
    formaPagoNota: "SUPUESTO",
    naturaleza: "11",
    naturalezaDescripcion: "compra/venta a precio firme para exportación al país de importación",
    nivelComercial: "2",
    nivelComercialDescripcion: "mayorista",
    nivelComercialNota: "SUPUESTO",
    tipoValor: "1",
    tipoValorDescripcion: "definitivo",
    formaEnvio: "1/1",
    formaEnvioDescripcion: "un solo embarque",
    destinacion: "10",
    destinacionDescripcion: "importación para el consumo",
    modalidad: "1-0",
    modalidadDescripcion: "Despacho Anticipado",
    tipoDespacho: "",
    tipoDespachoNota: "PENDIENTE DE VERIFICAR",
    entidadFinanciera: "Banco Ficticio Demo",
    codigoEntidadFinanciera: "PENDIENTE DE VERIFICAR"
  },
  serie: {
    subpartida: "9102.11.00.00",
    subpartidaNota: "SUPUESTO",
    digitoSubpartida: "",
    digitoSubpartidaNota: "PENDIENTE DE VERIFICAR",
    paisOrigen: "China",
    codigoPaisOrigen: "PENDIENTE DE VERIFICAR",
    paisAdquisicion: "China",
    codigoPaisAdquisicion: "PENDIENTE DE VERIFICAR",
    paisEmbarque: "China",
    codigoPaisEmbarque: "PENDIENTE DE VERIFICAR",
    unidadFisica: "U",
    unidadFisicaNota: "SUPUESTO. PENDIENTE DE VERIFICAR contra el arancel.",
    claseBulto: "cajas de cartón",
    codigoClaseBulto: "PENDIENTE DE VERIFICAR"
  },
  items: [
    {
      descripcion: "Reloj de pulsera de cuarzo, caja de metal común, visualización mecánica, marca DEMO, modelo AURA. Uso personal.",
      nombreProducto: "Reloj de pulsera",
      marca: "DEMO",
      modelo: "AURA",
      cantidad: 500,
      unidadComercial: "U",
      bultos: 20,
      pesoNetoKg: 80,
      pesoBrutoKg: 95,
      volumenM3: 1.2,
      precioUnitarioUsd: 12
    },
    {
      descripcion: "Reloj de pulsera de cuarzo, caja de metal común, visualización mecánica, marca DEMO, modelo LIMA. Uso personal.",
      nombreProducto: "Reloj de pulsera",
      marca: "DEMO",
      modelo: "LIMA",
      cantidad: 300,
      unidadComercial: "U",
      bultos: 10,
      pesoNetoKg: 48,
      pesoBrutoKg: 58,
      volumenM3: 0.7,
      precioUnitarioUsd: 15
    }
  ],
  valoracion: {
    fleteUsd: 800,
    fleteNota: "SUPUESTO. En el conocimiento de embarque: flete por cobrar.",
    seguroUsd: 40,
    tipoSeguro: "2",
    tipoSeguroDescripcion: "póliza individual",
    seguroNota: "SUPUESTO",
    ajustesUsd: 0
  }
};
