var db;
var lat=0;
var lon=0;
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
  var ultimaActualizacionBD;
  var cantObrasPendientes=0;
    db = window.sqlitePlugin.openDatabase({name: 'gauto.db', location: 'default'});

    //mostrar las ultimas 10 obras en la BD local
    db.executeSql('SELECT id,tipos.nombretipo,estado,imagen,localidades.nombrelocalidad,provincias.nombreprovincia FROM trabajos inner join tipos on tipos.idtipo=trabajos.tipo inner join localidades on localidades.idlocalidad=trabajos.localidad inner join provincias on provincias.idprovincia=localidades.idprovincia order by trabajos.id desc limit 10', [], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
           
            var estado='';
        switch(rs.rows.item(x).nombreestado)
        {
            case '1':estado='<span class="badge bg-success text-white">INICIADO</span>';break;
            case '2':estado='<span class="badge bg-warning text-white">PAUSADO</span>';break;
            case '3':estado='<span class="badge bg-danger text-white">CANCELADO</span>';break;
            case '4':estado='<span class="badge bg-secondary text-white">COMPLETADO</span>';break;
        }

        $(".listaTrabajos").append('<div class="card mb-2 trabajo" data-codigo="'+rs.rows.item(x).id+'"><div class="row g-2"><div class="col-4"><img src="'+rs.rows.item(x).imagen+'" class="img-fluid rounded-start" /></div><div class="col-8"><div class="card-body"><p>'+estado+'</p><h5 class="card-title">'+rs.rows.item(x).nombretipo+'</h5><p class="card-text">'+rs.rows.item(x).nombrelocalidad+', '+rs.rows.item(x).nombreprovincia+'</p></div></div></div></div>');
        }
        
        
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });

      //calcular cuando fue la ultima actualizacion
      db.executeSql('SELECT ultimaactualizacion from config', [], function(rs) {
        for(var x = 0; x < rs.rows.length; x++) {
          
            if(rs.rows.item(x).ultimaactualizacion!="0")
            {
              ultimaActualizacionBD = new Date(rs.rows.item(x).ultimaactualizacion); 
              var fechaHoy = new Date();
              var diffInMs   = new Date(fechaHoy) - new Date(ultimaActualizacionBD)
              var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
              if(diffInDays>0){
                $("#bannerWarnigMensaje").html('La última actualización se hizo hace '+diffInDays+' dias.');
                $("#bannerWarning").css("display","block");
              }
            }
        }
        
        
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
      
      
}

$(document).on('click', '.card', function() { 
  window.location.href="detalleTrabajo.html?id="+$(this).data("codigo");
});
