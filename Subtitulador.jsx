{
    // Configuraciones iniciales
    var subtitleInterval = 2; // Intervalo de tiempo entre subtítulos (2 segundos)
    var copiedPosition = null; // Almacena la posición copiada de un subtítulo
    var copiedTextProperties = null; // Almacena las propiedades de texto copiadas

    // Función para eliminar espacios en blanco al principio y al final de una cadena
    function trimString(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }

    // Función para leer subtítulos desde un archivo .txt
    function readSubtitlesFromFile(filePath) {
        var file = File(filePath);
        var subtitles = [];

        if (file.exists) {
            file.open("r");
            while (!file.eof) {
                var line = file.readln();
                line = trimString(line); // Usar la función de recorte
                if (line !== "") {  // Ignorar líneas vacías
                    subtitles.push(line);
                }
            }
            file.close();
        } else {
            alert("El archivo de subtítulos no se encontró.");
        }
        
        return subtitles;
    }

    // Función para agregar subtítulos a la composición con una duración de 2 segundos cada uno
    function addSubtitlesToComposition(subtitles) {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            app.beginUndoGroup("Agregar subtítulos desde archivo");

            // Calcula la posición Y inicial (100 píxeles desde la base)
            var positionY = comp.height - 100;

            for (var i = 0; i < subtitles.length; i++) {
                var textLayer = comp.layers.addText(subtitles[i]);
                var textProp = textLayer.property("Source Text");
                var textDocument = textProp.value;

                // Configurar el estilo del texto
                if (copiedTextProperties !== null) {
                    // Si se han copiado las propiedades de texto, se aplican
                    textDocument.fontSize = copiedTextProperties.fontSize;
                    textDocument.font = copiedTextProperties.font;
                    textDocument.fillColor = copiedTextProperties.fillColor;
                } else {
                    // Valores por defecto si no se copió ninguna propiedad
                    textDocument.fontSize = 30;
                    textDocument.fillColor = [1, 1, 1]; // Color blanco
                    textDocument.font = "Arial"; // Fuente predeterminada
                }

                textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
                textProp.setValue(textDocument);

                // Si se ha copiado una posición, se aplica a este subtítulo
                if (copiedPosition !== null) {
                    textLayer.position.setValue(copiedPosition);
                } else {
                    // Posicionar en la parte inferior si no se ha copiado ninguna posición
                    textLayer.position.setValue([comp.width / 2, positionY]);
                }

                // Configurar el tiempo de inicio y fin
                textLayer.startTime = i * subtitleInterval;
                textLayer.outPoint = textLayer.startTime + subtitleInterval; // Duración de 2 segundos
            }

            app.endUndoGroup();
        } else {
            alert("Por favor, selecciona una composición activa.");
        }
    }

    // Crear la interfaz gráfica
    var mainWindow = new Window("palette", "Configuración de Subtítulos", undefined);
    mainWindow.orientation = "column";

    // Botón para seleccionar el archivo de subtítulos
    var fileGroup = mainWindow.add("group", undefined, "Archivo");
    fileGroup.orientation = "row";
    var selectFileButton = fileGroup.add("button", undefined, "Seleccionar Archivo");

    // Botón para agregar subtítulos
    var addButton = mainWindow.add("button", undefined, "Agregar Subtítulos");

    // Botón para copiar la posición de un subtítulo
    var copyPositionButton = mainWindow.add("button", undefined, "Copiar Posición");

    // Botón para aplicar la posición copiada a otros subtítulos
    var applyPositionButton = mainWindow.add("button", undefined, "Aplicar Posición a Otros");

    // Botón para copiar las propiedades de texto
    var copyTextPropertiesButton = mainWindow.add("button", undefined, "Copiar Propiedades de Texto");

    // Botón para aplicar las propiedades de texto copiadas a otros
    var applyTextPropertiesButton = mainWindow.add("button", undefined, "Aplicar Propiedades de Texto a Otros");

    // Evento del botón para seleccionar el archivo
    var txtFile;
    selectFileButton.onClick = function() {
        txtFile = File.openDialog("Selecciona el archivo de subtítulos (.txt)", "*.txt");
    };

    // Evento del botón para agregar subtítulos
    addButton.onClick = function() {
        if (txtFile) {
            var subtitles = readSubtitlesFromFile(txtFile.fsName);
            if (subtitles.length > 0) {
                addSubtitlesToComposition(subtitles);
            } else {
                alert("El archivo de subtítulos está vacío o no tiene texto válido.");
            }
        } else {
            alert("No se seleccionó ningún archivo. Por favor, intenta de nuevo.");
        }
    };

    // Evento del botón para copiar la posición de un subtítulo
    copyPositionButton.onClick = function() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            var selectedLayer = comp.selectedLayers[0]; // Obtener la capa seleccionada

            if (selectedLayer) {
                copiedPosition = selectedLayer.position.value; // Copiar la posición
                alert("Posición copiada.");
            } else {
                alert("Selecciona una capa de subtítulo para copiar la posición.");
            }
        } else {
            alert("Por favor, selecciona una composición activa.");
        }
    };

    // Evento del botón para aplicar la posición copiada a otros subtítulos
    applyPositionButton.onClick = function() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            var allLayers = comp.layers;

            for (var i = 1; i <= allLayers.length; i++) {
                var layer = allLayers[i];

                // Aplicar la posición copiada solo a las capas de texto
                if (layer instanceof TextLayer && copiedPosition !== null) {
                    layer.position.setValue(copiedPosition);
                }
            }

            alert("Posición aplicada a otros subtítulos.");
        } else {
            alert("Por favor, selecciona una composición activa.");
        }
    };

    // Evento del botón para copiar las propiedades de texto
    copyTextPropertiesButton.onClick = function() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            var selectedLayer = comp.selectedLayers[0]; // Obtener la capa seleccionada

            if (selectedLayer && selectedLayer instanceof TextLayer) {
                var textProp = selectedLayer.property("Source Text");
                var textDocument = textProp.value;

                copiedTextProperties = {
                    fontSize: textDocument.fontSize,
                    font: textDocument.font,
                    fillColor: textDocument.fillColor
                };

                alert("Propiedades de texto copiadas.");
            } else {
                alert("Selecciona una capa de subtítulo para copiar las propiedades de texto.");
            }
        } else {
            alert("Por favor, selecciona una composición activa.");
        }
    };

    // Evento del botón para aplicar las propiedades de texto copiadas a otros subtítulos
    applyTextPropertiesButton.onClick = function() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            var allLayers = comp.layers;

            for (var i = 1; i <= allLayers.length; i++) {
                var layer = allLayers[i];

                // Aplicar las propiedades de texto copiadas solo a las capas de texto
                if (layer instanceof TextLayer && copiedTextProperties !== null) {
                    var textProp = layer.property("Source Text");
                    var textDocument = textProp.value;

                    // Aplicar las propiedades copiadas
                    textDocument.fontSize = copiedTextProperties.fontSize;
                    textDocument.font = copiedTextProperties.font;
                    textDocument.fillColor = copiedTextProperties.fillColor;
                    textProp.setValue(textDocument);
                }
            }

            alert("Propiedades de texto aplicadas a otros subtítulos.");
        } else {
            alert("Por favor, selecciona una composición activa.");
        }
    };

    mainWindow.center();
    mainWindow.show();
}
