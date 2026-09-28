# Proyecto: herramienta didáctica de documentos de comercio exterior

## Contexto
Herramienta PERSONAL y DIDÁCTICA para mis cursos de Negocios Internacionales (Lima, Perú). Escribo una vez los datos de una importación marítima y se generan: factura comercial, packing list, Bill of Lading y DAM de importación para el consumo. Sin uso oficial, pero debe ser PRECISA. El usuario no es programador: explica cada decisión de forma breve y didáctica, en español.

## Fuentes
- La estructura de la DAM (casillas, numeración, códigos) sale SOLO de referencias/: el instructivo consolidado despa-it.00.04.htm como base, más las modificaciones de cc-it.00.04-129-2026.htm y RS-000129-2026-SUNAT.pdf aplicadas encima. Marca qué casillas vienen de la modificación de 2026. Si falta algo, márcalo "PENDIENTE DE VERIFICAR". Nunca inventes casillas.
- BL, factura y packing list: campos estándar internacionales; indica cuáles varían según la naviera.
- Incoterms 2020. Subpartida nacional de 10 dígitos.
- Los datos inciertos se marcan como SUPUESTO.

## Reglas técnicas
- Local, simple, mantenible, con pocas dependencias. Plantillas separadas de la lógica.
- Todos los PDF llevan la marca de agua "DOCUMENTO DIDÁCTICO – SIN VALIDEZ OFICIAL".
- Datos en JSON (guardar/cargar operaciones). Sin base de datos, login ni nube.

## Forma de trabajo
- Pasos pequeños. En cada paso: qué hiciste, por qué y cómo lo verifico.
- Pide permiso antes de instalar dependencias, borrar archivos o hacer commits.
- Un commit por cada paso verificado, con un mensaje claro en español.
- No agregues funciones fuera del alcance acordado sin mi autorización.
- Entrega en el chat los PDF generados y capturas del formulario en cada paso visible.

## Fuera de alcance (por ahora)
Cálculo de tributos, certificado de origen, póliza de seguro, conexión con SUNAT o navieras.
