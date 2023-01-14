var contadorIniciado = 0;
var contadorPausado = 0;
var contadorCancelado = 0;
var contadorCompletado = 0;

var iconoIniciado = L.icon({
    iconUrl: 'img/marker-iniciado.png',
    shadowUrl: 'img/marker-shadow.png'
});
var iconoPausado = L.icon({
    iconUrl: 'img/marker-pausado.png',
    shadowUrl: 'img/marker-shadow.png'
});
var iconoCancelado = L.icon({
    iconUrl: 'img/marker-cancelado.png',
    shadowUrl: 'img/marker-shadow.png'
});
var iconoCompletado = L.icon({
    iconUrl: 'img/marker-completado.png',
    shadowUrl: 'img/marker-shadow.png'
});

var map = L.map('map').setView([-26.4546, -60.4813], 7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
}).addTo(map);

$.ajax({
    type: 'GET',
    url: '../v1/getAllData/0',
    contentType: "application/json"
})
    .done(function (jqXHR, textStatus, errorThrown) {
        for (var i = 0; i < jqXHR[0].tipos.length; i++) {
            $("#tipo").append('<option value="' + jqXHR[0].tipos[i].idtipo + '">' + jqXHR[0].tipos[i].nombretipo + '</option>');
        }
        for (var i = 0; i < jqXHR[0].estados.length; i++) {
            $("#estado").append('<option value="' + jqXHR[0].estados[i].idestado + '">' + jqXHR[0].estados[i].nombreestado + '</option>');
        }
        for (var i = 0; i < jqXHR[0].provincias.length; i++) {
            $("#provincia").append('<option value="' + jqXHR[0].provincias[i].idprovincia + '">' + jqXHR[0].provincias[i].nombreprovincia + '</option>');
        }
        for (var i = 0; i < jqXHR[0].trabajos.length; i++) {
            switch (jqXHR[0].trabajos[i].estado) {
                case '1':
                    contadorIniciado++;
                    L.marker([jqXHR[0].trabajos[i].latitud, jqXHR[0].trabajos[i].longitud], { id: jqXHR[0].trabajos[i].id, icon: iconoIniciado }).addTo(map).on('click', markerClick);
                    break;
                case '2':
                    contadorPausado++;
                    L.marker([jqXHR[0].trabajos[i].latitud, jqXHR[0].trabajos[i].longitud], { id: jqXHR[0].trabajos[i].id, icon: iconoPausado }).addTo(map).on('click', markerClick);
                    break;
                case '3':
                    contadorCancelado++;
                    L.marker([jqXHR[0].trabajos[i].latitud, jqXHR[0].trabajos[i].longitud], { id: jqXHR[0].trabajos[i].id, icon: iconoCancelado }).addTo(map).on('click', markerClick);
                    break;
                case '4':
                    contadorCompletado++;
                    L.marker([jqXHR[0].trabajos[i].latitud, jqXHR[0].trabajos[i].longitud], { id: jqXHR[0].trabajos[i].id, icon: iconoCompletado }).addTo(map).on('click', markerClick);
                    break;
            }
        }

        $("#contadores").html('<span>Vista Actual:</span>&nbsp;<span class="badge bg-success text-white">' + contadorIniciado + ' INICIADOS</span>&nbsp;<span class="badge bg-warning text-white">' + contadorPausado + ' PAUSADOS</span>&nbsp;<span class="badge bg-danger text-white">' + contadorCancelado + ' CANCELADOS</span>&nbsp;<span class="badge bg-secondary text-white">' + contadorCompletado + ' COMPLETADOS</span>');

    });

function markerClick(e) {
    var id = this.options.id;

    $.ajax({
        type: 'GET',
        url: '../v1/trabajos/' + id,
        contentType: "application/json",
    })
        .done(function (jqXHR, textStatus, errorThrown) {
            for (var i = 0; i < jqXHR.trabajo.length; i++) {
                switch (jqXHR.trabajo[i].estado) {
                    case '1': estado = $("#detalle").append('<p><span class="badge bg-success text-white">INICIADO</span></p>'); break;
                    case '2': estado = $("#detalle").append('<p><span class="badge bg-warning text-white">PAUSADO</span></p>'); break;
                    case '3': estado = $("#detalle").append('<p><span class="badge bg-danger text-white">CANCELADO</span></p>'); break;
                    case '4': estado = $("#detalle").append('<p><span class="badge bg-secondary text-white">COMPLETADO</span></p>'); break;
                }
                $("#detalle").append('<p><i class="fa fa-cog"></i>&nbsp;' + jqXHR.trabajo[i].nombretipo + '</p>');
                $("#detalle").append('<p><i class="fa fa-user"></i>&nbsp;' + jqXHR.trabajo[i].cliente + '</p>');
                $("#detalle").append('<p><i class="fa fa-phone"></i>&nbsp;' + jqXHR.trabajo[i].telefono + '</p>');
                $("#detalle").append('<p><i class="fa fa-map-marker"></i>&nbsp;' + jqXHR.trabajo[i].nombrelocalidad + ', ' + jqXHR.trabajo[i].nombreprovincia + '</p>');
                $("#detalle").append('<div class="owl-carousel owl-theme" id="galeria"></div>');
                $("#galeria").owlCarousel({
                    nav: true,
                    rewind: true,
                });
                for (var k = 0; k < jqXHR.trabajo[i].imagenes.length; k++) {

                    $('#galeria').trigger('add.owl.carousel', ['<img src="' + jqXHR.trabajo[i].imagenes[k].imagen + '" class="imgPreview" />'])
                        .trigger('refresh.owl.carousel');
                }
            }
        });
}


$(document).on('change', '#provincia, #estado, #tipo', function () {
    var esPrimero = true;
    contadorIniciado = 0;
    contadorPausado = 0;
    contadorCancelado = 0;
    contadorCompletado = 0;
    $("#detalles").html('');
    var data = {
        tipo: $("#tipo").val(),
        estado: $("#estado").val(),
        provincia: $("#provincia").val()
    };
    $.ajax({
        type: 'POST',
        url: '../v1/trabajos',
        contentType: "application/json",
        data: JSON.stringify(data)
    })
        .done(function (jqXHR, textStatus, errorThrown) {
            for (var i = 0; i < jqXHR.trabajos.length; i++) {
                if (esPrimero) {
                    esPrimero = false;
                    map.remove();
                    map = L.map('map').setView([jqXHR.trabajos[i].latitud, jqXHR.trabajos[i].longitud], 7);
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: ''
                    }).addTo(map);
                }
                switch (jqXHR.trabajos[i].estado) {
                    case '1':
                        contadorIniciado++;
                        L.marker([jqXHR.trabajos[i].latitud, jqXHR.trabajos[i].longitud], { id: jqXHR.trabajos[i].id, icon: iconoIniciado }).addTo(map).on('click', markerClick);
                        break;
                    case '2':
                        contadorPausado++;
                        L.marker([jqXHR.trabajos[i].latitud, jqXHR.trabajos[i].longitud], { id: jqXHR.trabajos[i].id, icon: iconoPausado }).addTo(map).on('click', markerClick);
                        break;
                    case '3':
                        contadorCancelado++;
                        L.marker([jqXHR.trabajos[i].latitud, jqXHR.trabajos[i].longitud], { id: jqXHR.trabajos[i].id, icon: iconoCancelado }).addTo(map).on('click', markerClick);
                        break;
                    case '4':
                        contadorCompletado++;
                        L.marker([jqXHR.trabajos[i].latitud, jqXHR.trabajos[i].longitud], { id: jqXHR.trabajos[i].id, icon: iconoCompletado }).addTo(map).on('click', markerClick);
                        break;
                }
            }
            $("#contadores").html('<span>Vista Actual:</span>&nbsp;<span class="badge bg-success text-white">' + contadorIniciado + ' INICIADOS</span>&nbsp;<span class="badge bg-warning text-white">' + contadorPausado + ' PAUSADOS</span>&nbsp;<span class="badge bg-danger text-white">' + contadorCancelado + ' CANCELADOS</span>&nbsp;<span class="badge bg-secondary text-white">' + contadorCompletado + ' COMPLETADOS</span>');
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
    $("#modalPreview").css("height", "100%");
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
