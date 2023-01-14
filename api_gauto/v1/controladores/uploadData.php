<?php

require_once('datos/ConexionBD.php');

class uploadData
{

  const ESTADO_CREACION_EXITOSA = 1;
  const ESTADO_CREACION_FALLIDA = 2;
  const ESTADO_ERROR_BD = 3;
  const ESTADO_URL_INCORRECTA = 6;
  const ESTADO_FALLA_DESCONOCIDA = 7;
  const ESTADO_PARAMETROS_INCORRECTOS = 8;

  public static function post($peticion)
  {
    return self::registrar();
  }

  private function registrar()
  {
    $cuerpo = file_get_contents('php://input');
    $usuario = json_decode($cuerpo);

    foreach ($usuario->trabajos as $item) {
      $comando = "INSERT INTO `trabajos`(`id`, `fechacreacion`, `latitud`, `longitud`, `localidad`, `tipo`, `cliente`, `telefono`, `estado`) 
  VALUES (?,?,?,?,?,?,?,?,'1')";
      $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      $sentencia->bindParam(1, $item->id, PDO::PARAM_STR);
      $sentencia->bindParam(2, $item->fechacreacion, PDO::PARAM_STR);
      $sentencia->bindParam(3, $item->latitud, PDO::PARAM_STR);
      $sentencia->bindParam(4, $item->longitud, PDO::PARAM_STR);
      $sentencia->bindParam(5, $item->localidad, PDO::PARAM_INT);
      $sentencia->bindParam(6, $item->tipo, PDO::PARAM_INT);
      $sentencia->bindParam(7, $item->cliente, PDO::PARAM_STR);
      $sentencia->bindParam(8, $item->telefono, PDO::PARAM_STR);
      $sentencia->execute();
    }
    http_response_code(200);
    $respuesta["respuesta"] = "ok";
    return ["datos" => $respuesta];
  }

}