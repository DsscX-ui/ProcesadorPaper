# Documentos del transporte marítimo internacional (didáctico)

Herramienta **personal y didáctica** para cursos de Negocios Internacionales (Perú).
Todo lo que genera es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**.

## Cómo abrirla

1. Abre la carpeta del proyecto.
2. Haz doble clic en `index.html`. Se abre en el navegador (Chrome o Edge) sin instalar nada.

## Qué puedes hacer ahora (fase F4 hecha; sigue F5)

- **Caso 1 / Caso 2:** cargan los ejemplos de `PLAN.md` §9 (datos 100 % ficticios).
- **Nueva (vacía):** crea una operación sin datos.
- **Guardar JSON:** descarga la operación como archivo `.json` (es tu copia de trabajo).
- **Abrir JSON:** vuelve a cargar un `.json` guardado antes. Se revisa todo el archivo; si tiene algún
  problema (no es JSON, le faltan datos, trae tipos o campos que no corresponden, pesa más de 2 MB o tiene
  más de 200 ítems) se muestra el motivo y **lo que está en pantalla no cambia**.
- **Límites de los números:** Abrir rechaza, con el motivo, datos fuera de rango o con más decimales de los
  admitidos (ej. cantidad con más de 3 decimales, precio mayor que 1,000,000); el detalle está en `PLAN.md` §6.1.
- Si falta el tipo de cambio (o es 0 o negativo), el pago en soles aparece como **no calculado**, no como 0.00.
- Los datos se muestran agrupados y en solo lectura (el formulario para editarlos llega en F5).
  El botón **?** de cada campo abre su ayuda, la fuente del campo y la nota del dato; en el celular,
  la casilla DAM aparece debajo de cada valor.
- **Resultados del cálculo:** debajo de los datos, la herramienta muestra paso a paso lo que calcula
  (bultos, pesos, volumen, VGM, FOB según el Incoterm, reparto por ítem y por serie, valor en aduana,
  tributos, percepción y pago en soles), cada cifra con su fórmula y su marca (H, H*, SUPUESTO, POR VERIFICAR),
  y una tabla "Por qué cuadran las cifras".

## Cómo leer el panel «Revisión de la operación»

Al cargar una operación, la herramienta la revisa con las reglas de `PLAN.md` §7:

- **Contador** (arriba, en verde o rojo): cuántos errores y advertencias hay y sus códigos.
  Ejemplo con el caso 1: «✔ Sin errores · 6 advertencias (A01, A08, A19, A20)».
- **Errores (E01–E19), en rojo:** bloquean los documentos. Mientras haya uno, los documentos (desde F6) no se generarán.
- **Advertencias (A01–A20), en naranja:** no bloquean. Explican algo que conviene revisar o un dato POR VERIFICAR.
  C01 y C02 son avisos del propio cálculo: C01, un reparto hecho en partes iguales porque su base suma 0
  (por ejemplo, flete con pesos brutos en 0); C02, ajustes sin ningún ítem marcado como objeto de ajuste.
- Cada aviso dice **qué pasa**, **por qué importa** y **cómo corregirlo**, con su **fuente** y su **marca**
  (H, H*, SUPUESTO o POR VERIFICAR). Si varios avisos son de la misma regla, se agrupan bajo su código.
- El botón **→ Ir al dato** abre el grupo de la vista de datos, centra la fila afectada y la resalta en amarillo.
- **A19** resume cuántos datos de la DAM llevan la marca H* o POR VERIFICAR, con enlaces a los primeros.
- En esta fase los datos aún no se editan en pantalla (llega en F5): para corregir, edita el `.json` y ábrelo de nuevo.
- Resultado esperado: caso 1 → A01, A08, A19 y A20; caso 2 → A01, A08 y A19; ningún error.

## Cómo comprobar los cálculos y las validaciones (pruebas.html)

1. Haz doble clic en `pruebas.html` (o usa el enlace de `index.html`).
2. Arriba debe decir **"328 de 328 pruebas correctas"** en verde.
3. Cada grupo compara el valor esperado (las cifras de `PLAN.md` §9.1 y §9.2, controles de RUC, contenedor,
   IMEI y UN/LOCODE, y casos borde) con el obtenido. Una prueba que falla se ve en rojo y dice "✘ FALLA".
4. Los grupos F3-M1 a F3-M5 son pruebas de regresión de las correcciones de la auditoría de F3 (bultos exactos,
   tipo de cambio ausente, repartos con base cero, límites numéricos y explicación de la percepción); los grupos
   F4-M1 a F4-B1, de la auditoría de F4 (lugar convenido, series de celulares repetidas y seguro incompleto en CIF/CIP).
5. Los grupos 12 a 15 prueban las validaciones: los avisos exactos de cada caso y, para cada error E01–E19 y cada
   advertencia alcanzable, una copia del caso alterada a propósito que debe producir ese código.

Los números se muestran con coma de miles y punto decimal (decisión D10): `20,040.00`; en la DAM, `18,123.870` (Formatos A y C) y `21.705231` (Formato B).

**Huella de los datos:** es una comprobación rápida. Si cambia, los datos cambiaron; si coincide, casi
seguro son iguales, pero no es una garantía absoluta. Huellas esperadas al cargar los ejemplos:
caso 1 = `7945E0E3`, caso 2 = `C17FBFFE`.

## Cómo imprimir en PDF

Ctrl+P → Destino: **Guardar como PDF** → Tamaño: **A4**.

## Estado

En construcción, por fases. El plan completo está en `PLAN.md` (§10: fases; §11: decisiones).
Hechas: F1, F2, F2.1 (correcciones de la auditoría de F2), F3 (cálculos y página de pruebas), F4 (validaciones y
panel de errores y advertencias), F3.1 y F4.1 (correcciones de las auditorías de F3 y F4). Siguiente: F5 (formulario completo).
La carpeta `herramienta-comex/` es una versión anterior hecha con otra IA; solo se usa como referencia.
La carpeta `verificacion/` guarda las evidencias de cada fase (capturas y JSON).
