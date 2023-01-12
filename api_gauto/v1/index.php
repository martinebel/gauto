<?php
date_default_timezone_set('America/Araguaina');
require 'controladores/getAllData.php'; //para que la app copie datos desde el servidor
require 'controladores/uploadData.php'; //para que la app suba los datos al servidor
require 'controladores/uploadImages.php'; //para que la app suba las fotos al servidor
require 'vistas/VistaXML.php';
require 'vistas/VistaJson.php';
require 'utilidades/ExcepcionApi.php';

// Constantes de estado
const ESTADO_CREACION_EXITOSA = 1;
const ESTADO_CREACION_FALLIDA = 2;
const ESTADO_ERROR_BD = 3;
const ESTADO_EXISTENCIA_RECURSO = 4;
const ESTADO_METODO_NO_PERMITIDO = 5;
const ESTADO_URL_INCORRECTA = 6;
const ESTADO_FALLA_DESCONOCIDA = 7;
const ESTADO_PARAMETROS_INCORRECTOS = 8;


// Preparar manejo de excepciones
$formato = isset($_GET['formato']) ? $_GET['formato'] : 'json';

switch ($formato) {
    case 'xml':
        $vista = new VistaXML();
        break;
    case 'json':
    default:
        $vista = new VistaJson();
}

set_exception_handler(function ($exception) use ($vista) {
    $cuerpo = array(

        "mensaje" => $exception->getMessage()
    );
    if ($exception->getCode()) {
        $vista->estado = $exception->getCode();
    } else {
        $vista->estado = 500;
    }

    $vista->imprimir($cuerpo);
}
);

// Extraer segmento de la url
if (isset($_GET['PATH_INFO']))
    $peticion = explode('/', $_GET['PATH_INFO']);
else
    throw new ExcepcionApi(ESTADO_URL_INCORRECTA, utf8_encode("No se reconoce la peticion"));

// Obtener recurso
$recurso = array_shift($peticion);
$recursos_existentes = array('getAllData','uploadData','uploadImages');

// Comprobar si existe el recurso
if (!in_array($recurso, $recursos_existentes)) {
    throw new ExcepcionApi(ESTADO_EXISTENCIA_RECURSO,
        "No se reconoce el recurso al que intenta acceder");
}

$metodo = strtolower($_SERVER['REQUEST_METHOD']);

// Filtrar m�todo
switch ($metodo) {
    case 'get':
    case 'post':
    case 'put':
    case 'delete':
        if (method_exists($recurso, $metodo)) {
            $respuesta = call_user_func(array($recurso, $metodo), $peticion);
            $vista->imprimir($respuesta);
            break;
        }
    default:
        // M�todo no aceptado
        $vista->estado = 405;
        $cuerpo = [
            "estado" => ESTADO_METODO_NO_PERMITIDO,
            "mensaje" => utf8_encode("Metodo no permitido")
        ];
        $vista->imprimir($cuerpo);

}
