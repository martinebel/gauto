<?php

require_once('datos/ConexionBD.php');

class getAllData
{

  const ESTADO_CREACION_EXITOSA = 1;
  const ESTADO_CREACION_FALLIDA = 2;
  const ESTADO_ERROR_BD = 3;
  const ESTADO_URL_INCORRECTA = 6;
  const ESTADO_FALLA_DESCONOCIDA = 7;
  const ESTADO_PARAMETROS_INCORRECTOS = 8;

  public static function get($peticion)
  {
    return self::obtenerTodo($peticion[0]);
  }

  private function obtenerTodo($clientID)
  {
    $estados = array();
    $tipos = array();
    $provincias = array();
    $localidades = array();
    $trabajos = array();
    $imagenes = array();
    $final = array();

    $comando = "SELECT * from estados";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->execute();
    $estados = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    $comando = "SELECT * from localidades";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->execute();
    $localidades = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    $comando = "SELECT * from provincias";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->execute();
    $provincias = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    $comando = "SELECT * from tipos";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->execute();
    $tipos = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    $comando = "SELECT * from trabajos where id>?";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->bindParam(1, $clientID, PDO::PARAM_INT);
    $sentencia->execute();
    $trabajos = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    $comando = "SELECT * from imagenes where idtrabajo>?";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->bindParam(1, $clientID, PDO::PARAM_INT);
    $sentencia->execute();
    $imagenes = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    array_push($final, array(
      "estados" => $estados,
      "tipos" => $tipos,
      "provincias" => $provincias,
      "localidades" => $localidades,
      "trabajos" => $trabajos,
      "imagenes" => $imagenes
    )
    );
    http_response_code(200);
    return ($final);
  }

}