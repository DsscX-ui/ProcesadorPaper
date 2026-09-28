/* Totales del formulario y dígito verificador del RUC.
   js/validaciones.js lee estos resultados y redacta los mensajes.
   Script clásico: deja el objeto global Calculos. */

var Calculos = (function () {
  var PESOS_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  function sumaEscalada(valores, decimales) {
    var factor = Math.pow(10, decimales);
    var acum = 0;
    var i;
    for (i = 0; i < valores.length; i++) {
      acum += Math.round((Number(valores[i]) || 0) * factor);
    }
    return acum / factor;
  }

  /* Módulo 11 de SUNAT. Si 11 menos el resto da 10, el dígito es 0.
     Si da 11, el dígito es 1. */
  function digitoVerificadorRuc(ruc) {
    var texto = String(ruc == null ? "" : ruc).trim();
    var suma = 0;
    var i;
    var resto;
    var complemento;
    var digito;
    if (!/^\d{11}$/.test(texto)) {
      return {
        valido: false,
        motivo: "El RUC debe tener 11 dígitos.",
        suma: null,
        resto: null,
        digitoCalculado: null,
        digitoDeclarado: null
      };
    }
    for (i = 0; i < 10; i++) {
      suma += Number(texto.charAt(i)) * PESOS_RUC[i];
    }
    resto = suma % 11;
    complemento = 11 - resto;
    if (complemento === 10) {
      digito = 0;
    } else if (complemento === 11) {
      digito = 1;
    } else {
      digito = complemento;
    }
    return {
      valido: digito === Number(texto.charAt(10)),
      motivo: "",
      suma: suma,
      resto: resto,
      digitoCalculado: digito,
      digitoDeclarado: Number(texto.charAt(10))
    };
  }

  function valorItemUsd(item) {
    var cantidad = Number(item && item.cantidad) || 0;
    var precio = Number(item && item.precioUnitarioUsd) || 0;
    return Math.round(cantidad * precio * 1000) / 1000;
  }

  function totales(operacion) {
    var items = (operacion && operacion.items) || [];
    var valoracion = (operacion && operacion.valoracion) || {};
    var unidades = [];
    var bultos = [];
    var netos = [];
    var brutos = [];
    var volumenes = [];
    var valores = [];
    var fob;
    var flete;
    var seguro;
    var ajustes;
    var i;
    for (i = 0; i < items.length; i++) {
      unidades.push(items[i].cantidad);
      bultos.push(items[i].bultos);
      netos.push(items[i].pesoNetoKg);
      brutos.push(items[i].pesoBrutoKg);
      volumenes.push(items[i].volumenM3);
      valores.push(valorItemUsd(items[i]));
    }
    fob = sumaEscalada(valores, 3);
    flete = Math.round((Number(valoracion.fleteUsd) || 0) * 1000) / 1000;
    seguro = Math.round((Number(valoracion.seguroUsd) || 0) * 1000) / 1000;
    ajustes = Math.round((Number(valoracion.ajustesUsd) || 0) * 1000) / 1000;
    return {
      unidades: sumaEscalada(unidades, 3),
      bultos: sumaEscalada(bultos, 3),
      pesoNetoKg: sumaEscalada(netos, 3),
      pesoBrutoKg: sumaEscalada(brutos, 3),
      volumenM3: sumaEscalada(volumenes, 3),
      fobUsd: fob,
      fleteUsd: flete,
      seguroUsd: seguro,
      ajustesUsd: ajustes,
      valorAduanaUsd: Math.round((fob + flete + seguro + ajustes) * 1000) / 1000,
      valoresItem: valores
    };
  }

  function formatoFijo(n, decimales) {
    var numero = Number(n);
    var factor;
    var escalado;
    var negativo;
    var abs;
    var entero;
    var dec;
    var texto;
    if (!isFinite(numero)) {
      return "—";
    }
    factor = Math.pow(10, decimales);
    escalado = Math.round(numero * factor);
    negativo = escalado < 0;
    abs = Math.abs(escalado);
    entero = String(Math.floor(abs / factor));
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    texto = entero;
    if (decimales > 0) {
      dec = String(abs % factor);
      while (dec.length < decimales) {
        dec = "0" + dec;
      }
      texto += "," + dec;
    }
    return negativo ? "-" + texto : texto;
  }

  function formatoRecortado(n, maxDecimales) {
    var fijo = formatoFijo(n, maxDecimales);
    if (fijo === "—") {
      return fijo;
    }
    return fijo.replace(/,(\d*?)0+$/, function (_, digitos) {
      return digitos ? "," + digitos : "";
    });
  }

  function casiIgual(a, b, decimales) {
    var factor = Math.pow(10, decimales == null ? 3 : decimales);
    return Math.round((Number(a) || 0) * factor) === Math.round((Number(b) || 0) * factor);
  }

  function supera(a, b, decimales) {
    var factor = Math.pow(10, decimales == null ? 3 : decimales);
    return Math.round((Number(a) || 0) * factor) > Math.round((Number(b) || 0) * factor);
  }

  return {
    pesosRuc: PESOS_RUC,
    digitoVerificadorRuc: digitoVerificadorRuc,
    valorItemUsd: valorItemUsd,
    totales: totales,
    suma: sumaEscalada,
    casiIgual: casiIgual,
    supera: supera,
    formatoMoneda: function (n) {
      return formatoFijo(n, 3);
    },
    formatoCantidad: function (n) {
      return formatoRecortado(n, 3);
    },
    formatoValorItem: function (n) {
      return formatoFijo(n, 2);
    }
  };
})();
