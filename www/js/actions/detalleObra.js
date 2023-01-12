var db;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    $("#listafotos").owlCarousel({

        nav : true,
        rewind: true,
   
   
    });
    db = window.sqlitePlugin.openDatabase({name: 'gauto.db', location: 'default'});
    db.executeSql('SELECT id,subido,tipos.nombretipo,estados.nombreestado,localidades.nombrelocalidad,provincias.nombreprovincia,trabajos.latitud,trabajos.longitud,trabajos.cliente,trabajos.telefono FROM trabajos inner join tipos on tipos.idtipo=trabajos.tipo inner join estados on estados.idestado=trabajos.estado inner join localidades on localidades.idlocalidad=trabajos.localidad inner join provincias on provincias.idprovincia=localidades.idprovincia where trabajos.id=?', [getParameterByName("id")], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
           
            var estado='';
            var subido='';
            if(rs.rows.item(x).subido==0)
            {
              subido='<p><i class="fa fa-triangle-exclamation"></i> Se debe realizar una actualización de datos!</p>';
            }
        switch(rs.rows.item(x).nombreestado)
        {
            case 'INICIADO':estado='<span class="badge bg-success text-white">INICIADO</span>';break;
            case 'PAUSADO':estado='<span class="badge bg-warning text-white">PAUSADO</span>';break;
            case 'CANCELADO':estado='<span class="badge bg-danger text-white">CANCELADO</span>';break;
            case 'COMPLETADO':estado='<span class="badge bg-secondary text-white">COMPLETADO</span>';break;
        }

        $("#tipo").html(rs.rows.item(x).nombretipo);
        $("#detalle").html('<p>'+estado+'</p><p><i class="fa fa-map-marker"></i> '+rs.rows.item(x).nombrelocalidad+', '+rs.rows.item(x).nombreprovincia+'</p><p><i class="fa fa-user"></i> '+rs.rows.item(x).cliente+'</p><p><i class="fa fa-phone"></i> '+rs.rows.item(x).telefono+'</p>'+subido);
        
        var lat            = rs.rows.item(x).latitud;
        var lon            = rs.rows.item(x).longitud;
        var map = L.map('map').setView([lat,lon], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
        }).addTo(map);

        L.marker([lat,lon]).addTo(map);
        }
        
        
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
      
      db.executeSql("select imagen from imagenes where idtrabajo=?",[getParameterByName("id")], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
            $('#listafotos').trigger('add.owl.carousel', ['<img src="'+rs.rows.item(x).imagen+'" class="imgPreview" />'])
            .trigger('refresh.owl.carousel');
        }
        
      },
      function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
      

}

$(document).on('click', '.imgPreview', function() { 
    $("#modalImg").attr("src",$(this).attr("src"));
    $("#modalPreview").css("height","100vh");
    $("#modalPreview").css("display","block");
  });

  $(document).on('click', '#modalImg', function() { 
    $("#modalPreview").css("display","none");
  });
  $(document).on('click', '#modalPreview', function() { 
    $("#modalPreview").css("display","none");
  });
  