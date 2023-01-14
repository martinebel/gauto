var db; //instancia de BD SQLite del telefono

/************************ 
 * Evento inicial del JS
*************************/
document.addEventListener('deviceready', function () {
  //inicializar el carrousel de fotos
  $("#listafotos").owlCarousel({
    nav: true,
    rewind: true,
  });

  //conectar al SQLite local
  db = window.sqlitePlugin.openDatabase({ name: 'gauto.db', location: 'default' });
  //obtener los datos de la obra que se está viendo (su id viene el el parametro de la URL)
  db.executeSql('SELECT id,subido,tipos.nombretipo,estados.nombreestado,localidades.nombrelocalidad,provincias.nombreprovincia,trabajos.latitud,trabajos.longitud,trabajos.cliente,trabajos.telefono FROM trabajos inner join tipos on tipos.idtipo=trabajos.tipo inner join estados on estados.idestado=trabajos.estado inner join localidades on localidades.idlocalidad=trabajos.localidad inner join provincias on provincias.idprovincia=localidades.idprovincia where trabajos.id=?', [getParameterByName("id")], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      var estado = '';
      var subido = '';
      //si la obra esta pendiente de subrise, poner un icono en la variable 'subido'
      if (rs.rows.item(x).subido == 0) {
        subido = '<p><i class="fa fa-triangle-exclamation"></i> Se debe realizar una actualización de datos!</p>';
      }
      //segun el estado de la obra, poner un icono en la variable 'estado'
      switch (rs.rows.item(x).nombreestado) {
        case 'INICIADO': estado = '<span class="badge bg-success text-white">INICIADO</span>'; break;
        case 'PAUSADO': estado = '<span class="badge bg-warning text-white">PAUSADO</span>'; break;
        case 'CANCELADO': estado = '<span class="badge bg-danger text-white">CANCELADO</span>'; break;
        case 'COMPLETADO': estado = '<span class="badge bg-secondary text-white">COMPLETADO</span>'; break;
      }
      //mostrar el tipo de obra
      $("#tipo").html(rs.rows.item(x).nombretipo);
      //mostrar los detalles de la obra
      $("#detalle").html('<p>' + estado + '</p><p><i class="fa fa-map-marker"></i> ' + rs.rows.item(x).nombrelocalidad + ', ' + rs.rows.item(x).nombreprovincia + '</p><p><i class="fa fa-user"></i> ' + rs.rows.item(x).cliente + '</p><p><i class="fa fa-phone"></i> ' + rs.rows.item(x).telefono + '</p>' + subido);

      //cargar el mapa y poner un marker en la latitud y longitud de la obra
      var lat = rs.rows.item(x).latitud;
      var lon = rs.rows.item(x).longitud;
      var map = L.map('map').setView([lat, lon], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      }).addTo(map);
      L.marker([lat, lon]).addTo(map);
    }
  }, function (error) {
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });

  //obtener las imagenes de la obra
  db.executeSql("select imagen from imagenes where idtrabajo=?", [getParameterByName("id")], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      //agregar la imagen en el carrousel
      $('#listafotos').trigger('add.owl.carousel', ['<img src="' + rs.rows.item(x).imagen + '" class="imgPreview" />'])
        .trigger('refresh.owl.carousel');
    }
  },
    function (error) {
      msg = "Ocurrió un error de base de datos: " + error.message
      window.location.href = "error.html?msg=" + msg;
    });
});

/*******************************************************************
 * Evento para manejar el click en cada item del carrousel de fotos
********************************************************************/
$(document).on('click', '.imgPreview', function () {
  //scrollear hasta la parte superior
  $(window).scrollTop(0);
  //cargar la imagen
  $("#modalImg").attr("src", $(this).attr("src"));
  //ajustar el tamaño 
  $("#modalPreview").css("height", "100vh");
  //mostrar la imagen
  $("#modalPreview").css("display", "block");
});

/*******************************************************************
* Eventos para manejar el click en la vista previa de la foto
********************************************************************/
$(document).on('click', '#modalImg', function () {
  //ocultar la imagen
  $("#modalPreview").css("display", "none");
});
$(document).on('click', '#modalPreview', function () {
  $("#modalPreview").css("display", "none");
});

/************************************************
* Metodo para extraer el parametro de la URL
*************************************************/
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}