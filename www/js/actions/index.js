var db; //instancia de BD SQLite del telefono

/************************ 
 * Evento inicial del JS
*************************/
document.addEventListener('deviceready', function () {
  //intenta abrir el SQLite local
  db = window.sqlitePlugin.openDatabase({ name: 'gauto.db', location: 'default' });

  //consultar las ultimas 10 obras en la BD local
  db.executeSql('SELECT id,tipos.nombretipo,estado,subido,localidades.nombrelocalidad,provincias.nombreprovincia,( SELECT imagenes.imagen FROM imagenes WHERE imagenes.idtrabajo = trabajos.id limit 1 ) as foto FROM trabajos inner join tipos on tipos.idtipo=trabajos.tipo inner join localidades on localidades.idlocalidad=trabajos.localidad inner join provincias on provincias.idprovincia=localidades.idprovincia order by trabajos.id desc limit 10', [], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      var estado = '';
      var subido = '';
      var foto = rs.rows.item(x).foto;
      //si la obra esta pendiente de subrise, poner un icono en la variable 'subido'
      if (rs.rows.item(x).subido == 0) {
        subido = '<span class="badge bg-warning text-white">&nbsp;<i class="fa fa-triangle-exclamation"></i></span>';
      }
      //segun el estado de la obra, poner un icono en la variable 'estado'
      switch (rs.rows.item(x).estado) {
        case 1: estado = '<span class="badge bg-success text-white">INICIADO</span>'; break;
        case 2: estado = '<span class="badge bg-warning text-white">PAUSADO</span>'; break;
        case 3: estado = '<span class="badge bg-danger text-white">CANCELADO</span>'; break;
        case 4: estado = '<span class="badge bg-secondary text-white">COMPLETADO</span>'; break;
      }
      //agregar la obra a la lista
      $(".listaTrabajos").append('<div class="card mb-2 trabajo" data-codigo="' + rs.rows.item(x).id + '"><div class="row g-2"><div class="col-4"><img src="' + foto + '" class="img-fluid rounded-start" /></div><div class="col-8"><div class="card-body"><p>' + estado + subido + '</p><h5 class="card-title">' + rs.rows.item(x).nombretipo + '</h5><p class="card-text">' + rs.rows.item(x).nombrelocalidad + ', ' + rs.rows.item(x).nombreprovincia + '</p></div></div></div></div>');
    }
  }, function (error) {
    //si hay un error de BD, se redirige a la pagina con el mensaje de error
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });

  //obtener la fecha de la ultima actualizacion
  db.executeSql('SELECT ultimaactualizacion from config', [], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      if (rs.rows.item(x).ultimaactualizacion != "0") {
        //crear un objeto Date() con la ultima fecha
        var ultimaActualizacionBD = new Date(rs.rows.item(x).ultimaactualizacion);
        //crear un objeto Date() con la fecha de hoy
        var fechaHoy = new Date();
        //calcular la diferencia en milisegundos entre las fechas
        var diffInMs = new Date(fechaHoy) - new Date(ultimaActualizacionBD)
        //convertir los milisegundos a dias
        var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        //si la diferencia es mayor a cero, mostrar un mensaje
        if (diffInDays > 0) {
          $("#bannerWarnigMensaje").html('La última actualización se hizo hace ' + diffInDays + ' dias.');
          $("#bannerWarning").css("display", "block");
        }
      }
    }
  }, function (error) {
    //si hay un error de BD, se redirige a la pagina con el mensaje de error
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });
});

/***************************************************************** 
 * Evento para manejar el click en cada item del listado de obras
 * Cada item tiene el ID de la obra en el atributo "data-codigo"
******************************************************************/
$(document).on('click', '.card', function () {
  window.location.href = "detalleObra.html?id=" + $(this).data("codigo");
});
