var db; //instancia de BD SQLite del telefono
var msg;  //mensaje de error
var networkState; //estado de red del telefono
var ultimoTrabajo = 0; //ID de la ultima obra almacenada en el SQLite
var cantTemp = 0; //cantidad de obras que se tienen que subir al server
var contadorSubidos = 0;  //contador de obras subidas
var fechaHoy = new Date();  //fecha de hoy
var fechaFormateada = getFormattedDate(fechaHoy); //fecha de hoy en formato yyyy/mm/dd

/************************ 
 * Evento inicial del JS
*************************/
document.addEventListener('deviceready', function () {
  //consulta y almacena estado de red del telefono
  networkState = navigator.connection.type;
  //intenta abrir/crear el SQLite local
  db = window.sqlitePlugin.openDatabase({ name: 'gauto.db', location: 'default' });
  //consultar el ultimo id de obra en el SQLite
  db.executeSql('SELECT count(id) AS mycount FROM trabajos where subido=0', [], function (rs) {
    cantTemp = rs.rows.item(0).mycount;
    //se llama a la funcion que actualiza los datos
    actualizarDatos();
  }, function (error) {
    //si hay un error de BD, es porque la tabla no existe. se deben crear las tablas
    createDatabase();
  });
});

/*********************************************************
 * Metodo para crear tablas en SQLite local del telefono
**********************************************************/
function createDatabase() {
  db.sqlBatch([
    'CREATE TABLE IF NOT EXISTS trabajos (id TEXT PRIMARY KEY, fechacreacion TEXT,latitud REAL,longitud REAL,localidad INTEGER,tipo INTEGER,cliente TEXT,telefono TEXT,estado INTEGER,subido INTEGER)',
    'CREATE TABLE IF NOT EXISTS imagenes (idimagen TEXT PRIMARY KEY,idtrabajo TEXT,imagen TEXT)',
    'CREATE TABLE IF NOT EXISTS provincias (idprovincia INTEGER PRIMARY KEY,nombreprovincia TEXT)',
    'CREATE TABLE IF NOT EXISTS localidades (idlocalidad INTEGER PRIMARY KEY,idprovincia INTEGER,nombrelocalidad TEXT)',
    'CREATE TABLE IF NOT EXISTS estados (idestado INTEGER PRIMARY KEY,nombreestado TEXT)',
    'CREATE TABLE IF NOT EXISTS tipos (idtipo INTEGER PRIMARY KEY,nombretipo TEXT)',
    'CREATE TABLE IF NOT EXISTS config (ultimaactualizacion TEXT)',
    ['INSERT INTO config (ultimaactualizacion) VALUES (?1)', ['0']]
  ], function () {
    //se llama a la funcion que actualiza los datos
    actualizarDatos();
  }, function (error) {
    //si hay un error de BD, se redirige a la pagina con el mensaje de error
    msg = "Ocurrió un error de base de datos: " + error.message
    window.location.href = "error.html?msg=" + msg;
  });
}

/*********************************************************
 * Metodo para conectarse al server y descargar los datos
**********************************************************/
function actualizarDatos() {
  if (networkState !== Connection.NONE) {
    const options = { method: 'get' };
    //hacer la llamada a la API. se le pasa como parámetro el ID de la ultima obra que se tiene en el SQLite
    cordova.plugin.http.sendRequest(urlAPI + 'getAllData', options, function (response) {
      //convertir a JSON lo que responde la API
      var res = JSON.parse(response.data);
      db.transaction(function (tx) {
        var i;
        //recorrer el item "estados" del JSON e insertar en la tabla
        for (i = 0; i < res[0].estados.length; i++) {
          var idestado = res[0].estados[i].idestado;
          var nombreestado = res[0].estados[i].nombreestado;
          tx.executeSql("INSERT OR IGNORE INTO estados(idestado,nombreestado) VALUES (?,?)", [idestado, nombreestado]);
        }
        //recorrer el item "tipos" del JSON e insertar en la tabla
        for (i = 0; i < res[0].tipos.length; i++) {
          var idtipo = res[0].tipos[i].idtipo;
          var nombretipo = res[0].tipos[i].nombretipo;
          tx.executeSql("INSERT OR IGNORE INTO tipos(idtipo,nombretipo) VALUES (?,?)", [idtipo, nombretipo]);
        }
        //recorrer el item "provincias" del JSON e insertar en la tabla
        for (i = 0; i < res[0].provincias.length; i++) {
          var idprovincia = res[0].provincias[i].idprovincia;
          var nombreprovincia = res[0].provincias[i].nombreprovincia;
          tx.executeSql("INSERT OR IGNORE INTO provincias(idprovincia,nombreprovincia) VALUES (?,?)", [idprovincia, nombreprovincia]);
        }
        //recorrer el item "localidades" del JSON e insertar en la tabla
        for (i = 0; i < res[0].localidades.length; i++) {
          var idprovincia = res[0].localidades[i].idprovincia;
          var idlocalidad = res[0].localidades[i].idlocalidad;
          var nombrelocalidad = res[0].localidades[i].nombrelocalidad;
          tx.executeSql("INSERT OR IGNORE INTO localidades(idlocalidad,idprovincia,nombrelocalidad) VALUES (?,?,?)", [idlocalidad, idprovincia, nombrelocalidad]);
        }

      }, function (error) {
        //si hay un error de BD, se redirige a la pagina con el mensaje de error
        msg = "Ocurrió un error de base de datos: " + error
        window.location.href = "error.html?msg=" + msg;
      }, function () {
        //si hay obras pendientes de ser subidas, llamar al metodo que arma array de imagenes
        if (cantTemp > 0) { prepararImagenes(); }
        else {
          //si no hay obras pendientes de ser subidas, guardar la fecha de esta actualizacion.
          db.executeSql('UPDATE config SET ultimaactualizacion=?', [fechaFormateada], function (response) {
            window.location.href = "index.html";
          }, function (response) { });
        }
      });
    }, function (response) {
      //si hay un error con la API, ir directo a la pagina principal
      msg = response;
      window.location.href = "error.html?msg=" + msg;
    });
  }
  else {
    //si no hay red, ir directo a la pagina principal
    window.location.href = "index.html";
  }
}

/***********************************************************************
 * Metodo para armar un array JSON con las imagenes pendientes de subir
************************************************************************/
function prepararImagenes() {
  alert("entro");
  //inicializar un JSON
  var JSONfinal = {};
  //obtener las imagenes de obras pendientes
  db.executeSql('SELECT imagenes.idimagen,imagenes.idtrabajo,imagenes.imagen from imagenes', [], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      alert(rs.rows.item(x).imagen);
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        alert('file system open: ' + fs.name);
        fs.root.getFile(rs.rows.item(x).imagen, { create: true, exclusive: false }, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
              // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
              var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
              var oReq = new XMLHttpRequest();
              oReq.open("POST", urlAPI+"uploadImages", true);
              oReq.onload = function (oEvent) {
                // all done!
              };
              // Pass the blob in to XHR's send method
              oReq.send(blob);
              alert('subi ' + rs.rows.item(x).imagen);
              var dataJSON = {
                idimagen: rs.rows.item(x).idimagen,
                idobra: rs.rows.item(x).idtrabajo,
                filename: rs.rows.item(x).imagen.split('/').pop()
              };
              //agregar el array al JSON
              JSONfinal.push(dataJSON);
              db.executeSql('DELETE FROM imagenes where idimagen=?', [rs.rows.item(x).idimagen]);
              if (x == rs.rows.length) {
                prepararPendientes(JSONfinal);
              }
            };
            // Read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
          }, function (err) { alert('error getting fileentry file!' + err); });
        }, function (err) { alert('error getting file! ' + err); });
      }, function (err) { alert('error getting persistent fs! ' + err); });
    }
  }, function (error) {
    //si hay un error, ir directo a la pagina principal
    window.location.href = "index.html";
  });
}

/***********************************************************************
 * Metodo para armar un array JSON con las obras pendientes de subir
************************************************************************/
function prepararPendientes(JSONImagenes) {
  //inicializar un JSON
  var JSONfinal = { trabajos: [], imagenes: [] };
  JSONfinal.imagenes.push(JSONImagenes);
  //obtener las obras pendientes
  db.executeSql('SELECT id,fechacreacion,latitud,longitud,localidad,tipo,cliente,telefono FROM trabajos where subido=0', [], function (rs) {
    for (var x = 0; x < rs.rows.length; x++) {
      //copiar los datos de la obra en un array
      var dataJSON = {
        id: rs.rows.item(x).id,
        fechacreacion: rs.rows.item(x).fechacreacion,
        latitud: rs.rows.item(x).latitud,
        longitud: rs.rows.item(x).longitud,
        tipo: rs.rows.item(x).tipo,
        cliente: rs.rows.item(x).cliente,
        telefono: rs.rows.item(x).telefono,
        localidad: rs.rows.item(x).localidad
      };
      //agregar el array al JSON
      JSONfinal.trabajos.push(dataJSON);
    }
    //llamar al metodo que sube el JSON
    alert(JSONfinal);
    subirDatos(JSONfinal);
  }, function (error) {
    //si hubo un, ir directo a la pagina principal
    window.location.href = "index.html";
  });
}

/***********************************************************************
 * Metodo para subir al server el array JSON de obras pendientes
************************************************************************/
function subirDatos(datos) {
  //formatear el JSON
  cordova.plugin.http.setDataSerializer('utf8');
  const serializedData = JSON.stringify(datos);
  const headers = { 'Content-Type': 'application/json' };
  //hacer la llamada a la API
  cordova.plugin.http.post(urlAPI + 'uploadData', serializedData, headers, function (response) {
    //si la respuesta fue correcta, recorrer el array de obras
    $.each(datos.trabajos, function (key, value) {
      //actualizo la obra, pongo en 1 la bandera que indica si fue subido
      db.executeSql("DELETE FROM trabajos where id=?", [value.id], function (tt) {
        //actualizo la fecha de ultima actualizacion
        db.executeSql('UPDATE config SET ultimaactualizacion=?', [fechaFormateada], function (tt) {
          //incremento el contador de obras subidas
          contadorSubidos++;
          //si terminamos de subir los pendientes, vamos a la pagina principal
          if (contadorSubidos == cantTemp) { window.location.href = "index.html"; }
        }, function (error) {
          //si hay un error al actualizar la fecha, se redirige a la pagina con el mensaje de error
          msg = "Ocurrió un error de base de datos: " + error
          window.location.href = "error.html?msg=" + msg;
        });
      }, function (error) {
        //si hay un error al actualizar la obra, se redirige a la pagina con el mensaje de error
        msg = "Ocurrió un error de base de datos: " + error
        window.location.href = "error.html?msg=" + msg;
      });
    });
  }, function (response) {
    //si hubo un error en la API, ir directo a la pagina principal
    window.location.href = "index.html";
  });
}

/******************************************************************************
 * Metodo para convertir un objeto Date() en una cadena con formato yyyy/mm/dd
*******************************************************************************/
function getFormattedDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '/' + month + '/' + day;
}