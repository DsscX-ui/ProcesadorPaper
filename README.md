# ProcesadorPaper: documentos del transporte marítimo (didáctico)

Herramienta **personal y didáctica** para cursos de Negocios Internacionales (Perú). Ingresas una vez los datos de una operación marítima y genera factura comercial, lista de empaque, instrucciones de embarque, B/L, VGM, DAM, certificado de seguro, certificado de origen (si aplica) y una hoja resumen.

> **Importante:** todo lo que genera es **DIDÁCTICO y NO VÁLIDO PARA TRÁMITES REALES**. Los datos de los ejemplos son ficticios.

No necesitas instalar nada ni tener internet: es una página web (HTML, CSS y JavaScript) que se abre con doble clic. Funciona en **Windows, Mac y Linux**. Está probada en **Google Chrome**.

## 1. Descargar el proyecto (sin saber usar GitHub)
1. Abre en el navegador: <https://github.com/DsscX-ui/ProcesadorPaper>
2. Arriba a la izquierda, revisa el botón de la rama. Debe decir **`claude/clever-newton-lg56hj`**. Si dice otra cosa, haz clic en él y elige esa rama. (Hoy es la única rama del proyecto, así que normalmente ya aparece.)
3. Haz clic en el botón verde **Code** y luego en **Download ZIP**.
4. El archivo `.zip` se guarda en tu carpeta **Descargas**.

No necesitas crear una cuenta en GitHub para descargarlo.

## 2. Descomprimir el ZIP
- **Windows:** clic derecho sobre el `.zip` > **Extraer todo...** > **Extraer**.
- **Mac:** doble clic sobre el `.zip`. Aparece una carpeta al lado.
- **Linux:** clic derecho > **Extraer aquí**, o en una terminal: `unzip ProcesadorPaper-*.zip`

Trabaja siempre con la **carpeta extraída**, no dentro del `.zip`.

## 3. Abrir la herramienta
1. Entra a la carpeta extraída.
2. Haz doble clic en **`index.html`**. Si se abre con otro programa, clic derecho > **Abrir con** > **Google Chrome**.

## 4. Usarla paso a paso
1. **Cargar un ejemplo:** usa los botones **Caso 1** o **Caso 2**, o el botón **Abrir JSON** y elige un archivo de la carpeta **`casos/`** (por ejemplo `AA4_portuaria_camote_CIF_FINAL.json`).
2. **Editar:** cambia los datos en el formulario (**1 Datos**). Todo se recalcula al instante. Usa punto decimal (`1,234.50`).
3. **Revisar:** en **2 Revisión** los errores (rojo) bloquean los documentos; las advertencias (naranja) no.
4. **Guardar tu trabajo:** botón **Guardar JSON**. Ese archivo `.json` es tu copia real; guárdalo en una carpeta segura. Para seguir otro día, ábrelo con **Abrir JSON**.
5. **Sacar el PDF:** en **4 Documentos**, pulsa **Imprimir este documento** o **Imprimir todos**. En la ventana de impresión, en **Destino**, elige **Guardar como PDF** y pulsa **Guardar**.

## 5. Comprobar que funciona (opcional)
Haz doble clic en **`pruebas.html`** (en la misma carpeta). Ejecuta las pruebas automáticas de los cálculos y muestra el resultado en pantalla.

## 6. Problemas frecuentes
- **Windows dice que el archivo está bloqueado o la página sale en blanco:** clic derecho sobre el `.zip` descargado > **Propiedades** > marca **Desbloquear** > **Aceptar**, y vuelve a extraerlo. Abre `index.html` desde la carpeta extraída.
- **Mac no deja abrir el archivo:** clic derecho sobre `index.html` > **Abrir con** > **Google Chrome**.
- **Microsoft Edge:** puede funcionar, pero **no está verificado**. Si algo se ve mal, usa Chrome.
- **Celular (Android o iPhone):** **no está probado**. Abrir archivos locales y guardar PDF ahí es complicado; usa una computadora.
- **Perdí mis cambios:** al volver a abrir `index.html` puede aparecer un recuadro azul con **Recuperar la última operación**. Es solo un respaldo del navegador; guarda siempre con **Guardar JSON**.

## 7. Manual completo
El manual detallado (formulario, marcas H, H\*, SUPUESTO y POR VERIFICAR, cómo leer la DAM, fuentes y límites) está en **[LEEME.md](LEEME.md)**. El plan técnico está en [PLAN.md](PLAN.md).
