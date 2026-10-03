# Documentos del transporte marítimo internacional (didáctico)

Herramienta **personal y didáctica** para cursos de Negocios Internacionales (Perú).
Todo lo que genera es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**.

## Cómo abrirla

1. Abre la carpeta del proyecto.
2. Haz doble clic en `index.html`. Se abre en el navegador (Chrome o Edge) sin instalar nada.

## Qué puedes hacer ahora (fase F2.1)

- **Caso 1 / Caso 2:** cargan los ejemplos de `PLAN.md` §9 (datos 100 % ficticios).
- **Nueva (vacía):** crea una operación sin datos.
- **Guardar JSON:** descarga la operación como archivo `.json` (es tu copia de trabajo).
- **Abrir JSON:** vuelve a cargar un `.json` guardado antes. Se revisa todo el archivo; si tiene algún
  problema (no es JSON, le faltan datos, trae tipos o campos que no corresponden, pesa más de 2 MB o tiene
  más de 200 ítems) se muestra el motivo y **lo que está en pantalla no cambia**.
- Los datos se muestran agrupados y en solo lectura (el formulario para editarlos llega en F5).
  El botón **?** de cada campo abre su ayuda, la fuente del campo y la nota del dato; en el celular,
  la casilla DAM aparece debajo de cada valor.

**Huella de los datos:** es una comprobación rápida. Si cambia, los datos cambiaron; si coincide, casi
seguro son iguales, pero no es una garantía absoluta. Huellas esperadas al cargar los ejemplos:
caso 1 = `7945E0E3`, caso 2 = `C17FBFFE`.

## Cómo imprimir en PDF

Ctrl+P → Destino: **Guardar como PDF** → Tamaño: **A4**.

## Estado

En construcción, por fases. El plan completo está en `PLAN.md` (§10: fases; §11: decisiones).
Hechas: F1, F2 y F2.1 (correcciones de la auditoría de F2). Siguiente: F3 (cálculos y página de pruebas).
La carpeta `herramienta-comex/` es una versión anterior hecha con otra IA; solo se usa como referencia.
La carpeta `verificacion/` guarda las evidencias de cada fase (capturas y JSON).
