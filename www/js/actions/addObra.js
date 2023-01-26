var db;   //instancia de BD SQLite del telefono
var lat = 0;  //latitud actual
var lon = 0;  //longitud actual


/************************ 
 * Evento inicial del JS
*************************/
document.addEventListener('deviceready', function () {
  //inicializa el plugin de camara
  console.log(navigator.camera);
  //obtiene la posicion GPS actual
  getGPS();
  //intenta abrir la BD SQLite local
  db = window.sqlitePlugin.openDatabase({ name: 'gauto.db', location: 'default' });
  //obtener los tipos de obras
  db.executeSql('SELECT idtipo,nombretipo from tipos', [], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      //cargar los tipos de obras en el combo
      $("#tipo").append('<option value="' + rs.rows.item(x).idtipo + '">' + rs.rows.item(x).nombretipo + '</option>');
    }
  }, function (error) {
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });

  //obtener las provincias
  db.executeSql('SELECT idprovincia,nombreprovincia from provincias order by nombreprovincia', [], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      //cargar las provincias en el combo
      $("#provincia").append('<option value="' + rs.rows.item(x).idprovincia + '">' + rs.rows.item(x).nombreprovincia + '</option>');
    }
  }, function (error) {
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });
});

/***************************************************************** 
 * Evento para manejar el cambio en el combo de provincias
******************************************************************/
$(document).on('change', '#provincia', function () {
  //vacia el combo de localidades
  $("#localidad").empty();
  //agrega un item de placeholder 
  $("#localidad").append('<option selected disabled>Seleccione localidad</option>');
  //obtiene el listado de localidades para la provincia seleccionada
  db.executeSql('SELECT idlocalidad,nombrelocalidad from localidades where idprovincia=? order by nombrelocalidad', [$("#provincia").val()], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      //carga las localidades en el combo
      $("#localidad").append('<option value="' + rs.rows.item(x).idlocalidad + '">' + rs.rows.item(x).nombrelocalidad + '</option>');
    }
  }, function (error) {
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });
});

/***************************************************************** 
 * Evento para manejar el click en el boton "agregar foto"
 * en caso de exito se llama al metodo cameraSucces()
 * en caso de error se llama al metodo cameraError()
******************************************************************/
$(document).on('click', '#agregarFoto', function () {
  navigator.camera.getPicture(cameraSuccess, cameraError, {
    quality: 25, //calidad en que se devuelve la imagen
    destinationType: Camera.DestinationType.FILE_URI, //se devuelve la ruta de la imagen
    encodingType: Camera.EncodingType.JPEG, //se codifica como JPEG
    mediaType: Camera.MediaType.PICTURE, //se aceptan imagenes
  });
});

/***************************************************************** 
 * Metodo que se llama cuando se saca una foto correctamente
******************************************************************/
function cameraSuccess(imageData) {
  //agregar la foto a la lista de fotos
  $("#listafotos").append('<div class="col-6 g-2"><img src="' + imageData + '" data-path="' + imageData + '" class="img-fluid rounded bd-placeholder-img rounded mx-auto d-block previewFoto" /></div>');

}

/***************************************************************** 
 * Metodo que se llama cuando se produce un error en la camara
******************************************************************/
function cameraError(message) {
  alert('Failed because: ' + message);
}

/***************************************************************** 
 * Evento para manejar el click en el boton "guardar"
******************************************************************/
$(document).on('click', '#guardar', function () {
  var cantFotos = $(".previewFoto").length;
  var contador = 0;
  //crear un id para la obra
  var uniqueId = Date.now();
  //crear el id inicial para las imagenes
  var uniqueIdImagen = uniqueId + 1;
  //obtener la fecha de hoy
  var fechaHoy = getFormattedDate(new Date());
  //insertar los datos de la obra
  db.executeSql("INSERT OR IGNORE INTO trabajos(id,fechacreacion,latitud,longitud,localidad,tipo,cliente,telefono,estado,subido) VALUES (?,?,?,?,?,?,?,?,?,?)", [uniqueId, fechaHoy, lat, lon, $("#localidad").val(), $("#tipo").val(), $("#cliente").val(), $("#telefono").val(), '1', '0'],
    function (rs) {
      //recorrer el listado de imagenes 
      if (cantFotos > 0) {
        $(".previewFoto").each(function () {
          //incrementar el id de imagen
          uniqueIdImagen++;
          //insertar datos de la imagen
          db.executeSql("INSERT OR IGNORE INTO imagenes (idtrabajo,idimagen,imagen) VALUES (?,?,?)", [uniqueId, uniqueIdImagen, $(this).data("path")],
            function (ts) {
              contador++;
              if (contador == cantFotos) {
                //al finalizar, ir a la pagina principal
                window.location.href = "index.html";
              }
            }, function (error) {
              alert(error.message);
            });
        });
      }
      else
      {
        window.location.href = "index.html";
      }
    },
    function (error) {
      alert(error.message);
    }
  );


});

/******************************************************************************
 * Metodo para convertir un objeto Date() en una cadena con formato yyyy-mm-dd
*******************************************************************************/
function getFormattedDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '-' + month + '-' + day;
}

/*********************************************
* Metodo para obtener Lat. y Long. del GPS
************************************************/
function getGPS() {
  AdvancedGeolocation.start(function (data) {
    try {
      var jsonObject = JSON.parse(data);
      switch (jsonObject.provider) {
        case "gps":
        case "network":
          if (jsonObject.latitude != "0.0") {
            lat = jsonObject.latitude;
            lon = jsonObject.longitude;
          }
          else {
            msg = "No se puede detectar el GPS. Por favor verifique que se encuentre encendido y tenga señal, y vuelva a abrir la aplicación.";
            window.location.href = "error.html?msg=" + msg;
          }
          break;
      }
    }
    catch (exc) {
      msg = "No se puede detectar el GPS. Por favor verifique que se encuentre encendido y tenga señal, y vuelva a abrir la aplicación.";
      window.location.href = "error.html?msg=" + msg;
    }
  },
    function (error) {
      msg = "No se puede detectar el GPS. Por favor verifique que se encuentre encendido y tenga señal, y vuelva a abrir la aplicación. " + e.msg;
      window.location.href = "error.html?msg=" + msg;
    },
    {
      "minTime": 5000,
      "minDistance": 0,
      "noWarn": false,
      "providers": "all",
      "useCache": true,
      "satelliteData": true,
      "buffer": true,
      "bufferSize": 10,
      "signalStrength": false
    });
}