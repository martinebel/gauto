var urlAPI='http://10.3.67.188:8081/api_gauto/v1/';
var db;
var msg;
var networkState ;
var lat=0;
var lon=0;
var ultimoTrabajo=0;
document.addEventListener('deviceready', function() {
    //getGPS();
    networkState= navigator.connection.type;
    db = window.sqlitePlugin.openDatabase({name: 'gauto.db', location: 'default'});
    db.executeSql('SELECT max(id) AS mycount FROM trabajos', [], function(rs) {
        ultimoTrabajo = rs.rows.item(0).mycount;
        if(ultimoTrabajo==""){ultimoTrabajo=0;}
        actualizarDatos();
      }, function(error) {
       createDatabase();
      });
  });

  function createDatabase()
  {
    db.sqlBatch([
        'CREATE TABLE IF NOT EXISTS trabajos (id TEXT PRIMARY KEY, fechacreacion TEXT,latitud REAL,longitud REAL,localidad INTEGER,tipo INTEGER,cliente TEXT,telefono TEXT,estado INTEGER,imagen TEXT)',
        'CREATE TABLE IF NOT EXISTS trabajostemp (id TEXT PRIMARY KEY, fechacreacion TEXT,latitud REAL,longitud REAL,localidad INTEGER,tipo INTEGER,cliente TEXT,telefono TEXT,imagen TEXT)',
        'CREATE TABLE IF NOT EXISTS provincias (idprovincia INTEGER PRIMARY KEY,nombreprovincia TEXT)',
        'CREATE TABLE IF NOT EXISTS localidades (idlocalidad INTEGER PRIMARY KEY,idprovincia INTEGER,nombrelocalidad TEXT)',
        'CREATE TABLE IF NOT EXISTS estados (idestado INTEGER PRIMARY KEY,nombreestado TEXT)',
        'CREATE TABLE IF NOT EXISTS tipos (idtipo INTEGER PRIMARY KEY,nombretipo TEXT)',
        'CREATE TABLE IF NOT EXISTS config (ultimaactualizacion TEXT)',
      ], function() {
        actualizarDatos();
      }, function(error) {
        msg="Ocurrió un error de base de datos: "+ error.message
        window.location.href="error.html?msg="+msg;
      });
  }

  function actualizarDatos()
  {
    if (networkState !== Connection.NONE) {

        const options = {
            method: 'get'
          };
          //traer datos desde el servidor
          cordova.plugin.http.sendRequest(urlAPI+'getAllData/0', options, function(response) {
           var res=JSON.parse(response.data);
            db.transaction(function(tx) {
			
                var i;
                //estados
                for(i=0; i<res[0].estados.length; i++){
                   var idestado=res[0].estados[i].idestado;
                   var nombreestado=res[0].estados[i].nombreestado;
                   tx.executeSql("INSERT OR IGNORE INTO estados(idestado,nombreestado) VALUES (?,?)",[idestado,nombreestado]);
               }
               //tipos
               for(i=0; i<res[0].tipos.length; i++){
                var idtipo=res[0].tipos[i].idtipo;
                var nombretipo=res[0].tipos[i].nombretipo;
                tx.executeSql("INSERT OR IGNORE INTO tipos(idtipo,nombretipo) VALUES (?,?)",[idtipo,nombretipo]);
                }
                //provincias
               for(i=0; i<res[0].provincias.length; i++){
                var idprovincia=res[0].provincias[i].idprovincia;
                var nombreprovincia=res[0].provincias[i].nombreprovincia;
                tx.executeSql("INSERT OR IGNORE INTO provincias(idprovincia,nombreprovincia) VALUES (?,?)",[idprovincia,nombreprovincia]);
                }
                //localidades
               for(i=0; i<res[0].localidades.length; i++){
                var idprovincia=res[0].localidades[i].idprovincia;
                var idlocalidad=res[0].localidades[i].idlocalidad;
                var nombrelocalidad=res[0].localidades[i].nombrelocalidad;
                tx.executeSql("INSERT OR IGNORE INTO localidades(idlocalidad,idprovincia,nombrelocalidad) VALUES (?,?,?)",[idlocalidad,idprovincia,nombrelocalidad]);
                }
                //trabajos
               for(i=0; i<res[0].trabajos.length; i++){
                var idtrabajo=res[0].trabajos[i].id;
                var fechacreacion=res[0].trabajos[i].fechacreacion;
                var latitud=res[0].trabajos[i].latitud;
                var longitud=res[0].trabajos[i].longitud;
                var localidad=res[0].trabajos[i].localidad;
                var tipo=res[0].trabajos[i].tipo;
                var cliente=res[0].trabajos[i].cliente;
                var telefono=res[0].trabajos[i].telefono;
                var estado=res[0].trabajos[i].estado;
                var imagen=res[0].trabajos[i].imagen;
                tx.executeSql("INSERT OR IGNORE INTO trabajos(id,fechacreacion,latitud,longitud,localidad,tipo,cliente,telefono,estado,imagen) VALUES (?,?,?,?,?,?,?,?,?,?)",[idtrabajo,fechacreacion,latitud,longitud,localidad,tipo,cliente,telefono,estado,imagen]);
                }
                }, function(error) {
                    msg="Ocurrió un error de base de datos: "+ error
                    window.location.href="error.html?msg="+msg;
                }, function() {
                       //subir los datos pendientes
                       db.executeSql('SELECT id,fechacreacion,latitud,longitud,localidad,tipo,cliente,telefono,imagen FROM trabajostemp', [], function(rs) {
                        for(var x = 0; x < rs.rows.length; x++) {
                          var idtemp= rs.rows.item(x).id;
                          const optionsPost = {
                            method: 'post',
                            data: { 
                              id: rs.rows.item(x).id, 
                              fechacreacion: rs.rows.item(x).fechacreacion ,
                              latitud: rs.rows.item(x).latitud,
                              longitud: rs.rows.item(x).longitud,
                              tipo: rs.rows.item(x).tipo,
                              cliente: rs.rows.item(x).cliente,
                              telefono: rs.rows.item(x).telefono
                            },
                            headers: { }
                          };
                          
                          cordova.plugin.http.sendRequest(urlAPI+'uploadData', optionsPost, function(response) {
                            db.executeSql('DELETE FROM trabajostemp where id=?', [idtemp]);
							
                          }, function(response) {
                            
                            console.log(response.status);
                          });
                        }
                      }, function(error) {
                        window.location.href="index.html";
                      });
                      window.location.href="index.html";
                });
          }, function(response) {
            //error
            window.location.href="index.html";
          });

    }
    else
    {
        window.location.href="index.html";
    }

    /*msg="No se puede conectar con el servidor. Por favor verifique su conexión de datos/WiFi y vuelva a abrir la aplicación.";
    window.location.href="error.html?msg="+msg;*/
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