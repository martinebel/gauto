var db;
var lat=0;
var lon=0;
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log(navigator.camera);
    getGPS();
    db = window.sqlitePlugin.openDatabase({name: 'gauto.db', location: 'default'});

    db.executeSql('SELECT idtipo,nombretipo from tipos', [], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
        $("#tipo").append('<option value="'+rs.rows.item(x).idtipo+'">'+rs.rows.item(x).nombretipo+'</option>');
        }
        
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
      db.executeSql('SELECT idprovincia,nombreprovincia from provincias order by nombreprovincia', [], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
        $("#provincia").append('<option value="'+rs.rows.item(x).idprovincia+'">'+rs.rows.item(x).nombreprovincia+'</option>');
        }
        
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
}

$(document).on('change', '#provincia', function() { 
    $("#localidad").empty();
    $("#localidad").append('<option selected disabled>Seleccione localidad</option>');
    db.executeSql('SELECT idlocalidad,nombrelocalidad from localidades where idprovincia=? order by nombrelocalidad', [$("#provincia").val()], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
        $("#localidad").append('<option value="'+rs.rows.item(x).idlocalidad+'">'+rs.rows.item(x).nombrelocalidad+'</option>');
        }
        
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
  });


$(document).on('click', '#agregarFoto', function() { 
    navigator.camera.getPicture(cameraSuccess, cameraError, {
        quality: 25,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
    });
});

function cameraSuccess(imageData) {
    $("#listafotos").append('<div class="col-6 g-2"><img src="data:image/jpeg;base64,'+imageData+'" class="img-fluid rounded bd-placeholder-img rounded mx-auto d-block previewFoto" /></div>');
}

function cameraError(message) {
    alert('Failed because: ' + message);
}

$(document).on('click', '#guardar', function() { 
    
    var uniqueId=Date.now();
    var uniqueIdImagen=uniqueId+1;
    var fechaHoy=getFormattedDate(new Date());
    db.executeSql("INSERT OR IGNORE INTO trabajos(id,fechacreacion,latitud,longitud,localidad,tipo,cliente,telefono,estado,subido) VALUES (?,?,?,?,?,?,?,?,?,?)",[uniqueId,fechaHoy,lat,lon,$("#localidad").val(),$("#tipo").val(),$("#cliente").val(),$("#telefono").val(),'1','0']);
     $(".previewFoto").each(function(){
            uniqueIdImagen++;
            db.executeSql("INSERT OR IGNORE INTO imagenes (idtrabajo,idimagen,imagen) VALUES (?,?,?)",[uniqueId,uniqueIdImagen,$(this).attr("src")]);
          });
          window.location.href="index.html";
});

function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return year + '-' + month + '-' + day;
  }


  function getGPS()
  {
    AdvancedGeolocation.start(function(data){

        try{

                var jsonObject = JSON.parse(data);

                switch(jsonObject.provider){
                    case "gps":
                    case "network":
                        if(jsonObject.latitude != "0.0"){
                            lat=jsonObject.latitude ;
                            lon=jsonObject.longitude;
                        }
                        else
                        {
                            msg="No se puede detectar el GPS. Por favor verifique que se encuentre encendido y tenga señal, y vuelva a abrir la aplicación.";
                            window.location.href="error.html?msg="+msg;
                        }
                        break;
                }
            
        }
        catch(exc){
            msg="No se puede detectar el GPS. Por favor verifique que se encuentre encendido y tenga señal, y vuelva a abrir la aplicación.";
            window.location.href="error.html?msg="+msg;
        }
    },
    function(error){
        msg="No se puede detectar el GPS. Por favor verifique que se encuentre encendido y tenga señal, y vuelva a abrir la aplicación. "+ e.msg;
        window.location.href="error.html?msg="+msg;
    },
    {
        "minTime":5000,
        "minDistance":0,
        "noWarn":false,
        "providers":"all",
        "useCache":true,
        "satelliteData":true,
        "buffer":true,
        "bufferSize":10,
        "signalStrength":false
    });
  }