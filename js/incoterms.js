/* Incoterms® 2020: matriz de PLAN.md §6.8 [H*] y fórmulas del FOB total de IT C 5.9 (PLAN.md §6.3) [H].
   Solo datos: el cálculo lo hace js/calculos.js leyendo estas tablas.
   Script clásico: deja el objeto global INCOTERMS. */

var INCOTERMS = (function () {
  // [código, grupo, solo marítimo, lugar convenido, riesgo, flete principal, seguro obligatorio,
  //  despacho de exportación, despacho de importación, flete usual en el B/L]
  var MATRIZ = [
    ["EXW", "E", false, "Local del vendedor", "A disposición en el local del vendedor", "Comprador", "No", "Comprador", "Comprador", "collect"],
    ["FCA", "F", false, "Lugar de entrega en origen", "Al entregar al transportista", "Comprador", "No", "Vendedor", "Comprador", "collect"],
    ["FAS", "F", true, "Puerto de embarque", "Al costado del buque", "Comprador", "No", "Vendedor", "Comprador", "collect"],
    ["FOB", "F", true, "Puerto de embarque", "A bordo del buque", "Comprador", "No", "Vendedor", "Comprador", "collect"],
    ["CFR", "C", true, "Puerto de destino", "A bordo en el puerto de embarque", "Vendedor", "No", "Vendedor", "Comprador", "prepaid"],
    ["CIF", "C", true, "Puerto de destino", "A bordo en el puerto de embarque", "Vendedor", "Sí, lo contrata el vendedor: ICC (C) mín., 110 %", "Vendedor", "Comprador", "prepaid"],
    ["CPT", "C", false, "Lugar de destino", "Al entregar al primer transportista", "Vendedor", "No", "Vendedor", "Comprador", "prepaid"],
    ["CIP", "C", false, "Lugar de destino", "Al entregar al primer transportista", "Vendedor", "Sí, lo contrata el vendedor: ICC (A) mín., 110 %", "Vendedor", "Comprador", "prepaid"],
    ["DAP", "D", false, "Lugar de destino", "A disposición en destino, sin descargar", "Vendedor", "No", "Vendedor", "Comprador", "prepaid"],
    ["DPU", "D", false, "Lugar de destino", "Descargada en destino", "Vendedor", "No", "Vendedor", "Comprador", "prepaid"],
    ["DDP", "D", false, "Lugar de destino", "En destino, despachada para importación", "Vendedor", "No", "Vendedor", "Vendedor", "prepaid"]
  ];

  var reglas = {};
  MATRIZ.forEach(function (f) {
    reglas[f[0]] = {
      codigo: f[0], grupo: f[1], soloMaritimo: f[2], lugar: f[3], riesgo: f[4], fletePrincipal: f[5],
      seguro: f[6], seguroObligatorio: f[6].indexOf("Sí") === 0,
      clausulaMinima: f[0] === "CIF" ? "C" : (f[0] === "CIP" ? "A" : ""),
      despachoExportacion: f[7], despachoImportacion: f[8], fleteBlUsual: f[9],
      marca: "H*", fuente: "ICC, Incoterms® 2020 (PLAN.md §6.8)"
    };
  });

  // FOB total por Incoterm (IT C 5.9). Cada término: casilla del Formato B y signo.
  // "8.1.1" = valor de la factura (Vc); "8.4" = seguro. DDP resta el total de deducciones (8.5.1 a 8.5.5).
  var FORMULAS_FOB = {
    EXW: [["8.1.1", 1], ["8.1.5", 1], ["8.1.6", 1], ["8.5.4", -1], ["8.5.5", -1]],
    FCA: [["8.1.1", 1], ["8.1.6", 1], ["8.5.4", -1], ["8.5.5", -1]],
    FAS: [["8.1.1", 1], ["8.1.6", 1], ["8.5.4", -1], ["8.5.5", -1]],
    FOB: [["8.1.1", 1], ["8.1.6", 1], ["8.5.4", -1], ["8.5.5", -1]],
    CFR: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.5.4", -1], ["8.5.5", -1]],
    CPT: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.5.4", -1], ["8.5.5", -1]],
    CIF: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.4", -1], ["8.5.4", -1], ["8.5.5", -1]],
    CIP: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.4", -1], ["8.5.4", -1], ["8.5.5", -1]],
    DAP: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.3.2", -1], ["8.5.1", -1], ["8.5.4", -1], ["8.5.5", -1]],
    DPU: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.3.2", -1], ["8.5.1", -1], ["8.5.4", -1], ["8.5.5", -1]],
    DDP: [["8.1.1", 1], ["8.1.6", 1], ["8.3.1", -1], ["8.3.2", -1],
      ["8.5.1", -1], ["8.5.2", -1], ["8.5.3", -1], ["8.5.4", -1], ["8.5.5", -1]]
  };

  // Ajuste total (IT C 5.10): suma de estas casillas.
  var CASILLAS_AJUSTE = ["8.1.2", "8.1.3", "8.1.4", "8.2.1", "8.2.2", "8.2.3.1", "8.2.3.2", "8.2.3.3", "8.2.3.4", "8.2.4", "8.2.5"];

  // Casilla del Formato B → dato de la operación (especificos.valoracion), salvo 8.1.1 y 8.4 que se calculan.
  var CAMPO_CASILLA = {
    "8.1.5": "gastosExw815", "8.1.6": "otros816",
    "8.1.2": "ajuste812", "8.1.3": "ajuste813", "8.1.4": "descuentosNoAceptables814",
    "8.2.1": "comisiones821", "8.2.2": "envases822", "8.2.3.1": "materiales8231", "8.2.3.2": "herramientas8232",
    "8.2.3.3": "consumidos8233", "8.2.3.4": "ingenieria8234", "8.2.4": "canones824", "8.2.5": "reversion825",
    "8.3.1": "flete", "8.3.2": "gastosDestino832",
    "8.5.1": "posteriores851", "8.5.2": "montaje852", "8.5.3": "tributos853", "8.5.4": "intereses854", "8.5.5": "otros855"
  };

  var NOMBRE_CASILLA = {
    "8.1.1": "precio neto según factura (Vc)", "8.1.5": "gastos hasta el embarque", "8.1.6": "otros gastos no facturados",
    "8.1.2": "monto no incluido en 8.1.1 (rótulo PV)", "8.1.3": "descuento deducido en la factura (rótulo PV)",
    "8.1.4": "otros descuentos no aceptables",
    "8.2.1": "comisiones", "8.2.2": "envases y embalajes", "8.2.3.1": "materiales incorporados",
    "8.2.3.2": "herramientas y moldes", "8.2.3.3": "materiales consumidos", "8.2.3.4": "ingeniería y diseño",
    "8.2.4": "cánones", "8.2.5": "reventa que revierte",
    "8.3.1": "flete", "8.3.2": "gastos en destino", "8.4": "seguro",
    "8.5.1": "gastos posteriores", "8.5.2": "montaje", "8.5.3": "tributos del Perú", "8.5.4": "intereses", "8.5.5": "otros deducibles"
  };

  return {
    codigos: MATRIZ.map(function (f) { return f[0]; }),
    reglas: reglas,
    formulasFob: FORMULAS_FOB,
    casillasAjuste: CASILLAS_AJUSTE,
    campoCasilla: CAMPO_CASILLA,
    nombreCasilla: NOMBRE_CASILLA,
    fuenteFormulas: "IT C 5.9 y 5.10 (instructivo DESPA-IT.00.04)",
    regla: function (codigo) { return reglas[codigo] || null; }
  };
})();
