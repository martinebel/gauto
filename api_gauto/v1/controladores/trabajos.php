<?php

require_once('datos/ConexionBD.php');

class trabajos
{

  const ESTADO_CREACION_EXITOSA = 1;
  const ESTADO_CREACION_FALLIDA = 2;
  const ESTADO_ERROR_BD = 3;
  const ESTADO_URL_INCORRECTA = 6;
  const ESTADO_FALLA_DESCONOCIDA = 7;
  const ESTADO_PARAMETROS_INCORRECTOS = 8;

  public static function get($peticion)
  {
      return self::getUnTrabajo($peticion[0]);
  }

  public static function post($peticion)
  {
    return self::getTrabajosConFiltros();
  }

  public static function put($peticion)
  {
    return self::modificar();
  }

  private function getUnTrabajo($trabajoID)
  {
    $final=array();
    $imagenes=array();
    $comando = "select * from imagenes where idtrabajo=?";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      $sentencia->bindParam(1, $trabajoID, PDO::PARAM_INT);
    $sentencia->execute();
    $data=$sentencia->fetchAll(PDO::FETCH_ASSOC);
    foreach($data as $row)
    {
      array_push($imagenes, array(
        "idimagen"=>$row["idimagen"],
        "imagen"=>$row["imagen"]
      )
      );
    }

      $comando = "SELECT trabajos.*,estados.nombreestado,tipos.nombretipo,localidades.nombrelocalidad,provincias.idprovincia,provincias.nombreprovincia
      FROM trabajos
      inner join estados on estados.idestado=trabajos.estado
      inner join tipos on tipos.idtipo=trabajos.tipo
      inner join localidades on localidades.idlocalidad=trabajos.localidad
      inner join provincias on localidades.idprovincia=provincias.idprovincia
       WHERE trabajos.id=?";
      $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      $sentencia->bindParam(1, $trabajoID, PDO::PARAM_INT);
    
    $sentencia->execute();
    $data=$sentencia->fetchAll(PDO::FETCH_ASSOC);
    foreach($data as $row)
    {
      array_push($final,array(
        "id"=>$row["id"],
        "fechacreacion"=>$row["fechacreacion"],
        "latitud"=>$row["latitud"],
        "longitud"=>$row["longitud"],
        "localidad"=>$row["localidad"],
        "tipo"=>$row["tipo"],
        "cliente"=>$row["cliente"],
        "telefono"=>$row["telefono"],
        "estado"=>$row["estado"],
        "nombreestado"=>$row["nombreestado"],
        "nombretipo"=>$row["nombretipo"],
        "nombrelocalidad"=>$row["nombrelocalidad"],
        "provincia"=>$row["idprovincia"],
        "nombreprovincia"=>$row["nombreprovincia"],
        "imagenes"=>$imagenes
      ));
    }
      http_response_code(200);
      return ["trabajo"=>$final];
    }



  private function getTrabajosConFiltros()
  {

    $cuerpo = file_get_contents('php://input');
    $filtros = json_decode($cuerpo);
    $cadenaFiltros = " 1=1 ";
    if($filtros->tipo!='*')
    {
      $cadenaFiltros .= ' and trabajos.tipo='.$filtros->tipo;
    }
    if($filtros->estado!='*')
    {
      $cadenaFiltros .= ' and trabajos.estado='.$filtros->estado;
    }
    if($filtros->provincia!='*')
    {
      $cadenaFiltros .= ' and provincias.idprovincia='.$filtros->provincia;
    }

    $final=array();
    $imagenes=array();
      $comando = "SELECT trabajos.*,estados.nombreestado,tipos.nombretipo,localidades.nombrelocalidad,provincias.idprovincia,provincias.nombreprovincia
      FROM trabajos
      inner join estados on estados.idestado=trabajos.estado
      inner join tipos on tipos.idtipo=trabajos.tipo
      inner join localidades on localidades.idlocalidad=trabajos.localidad
      inner join provincias on localidades.idprovincia=provincias.idprovincia
       WHERE ".$cadenaFiltros;
      $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      
      
    
    $sentencia->execute();
    $data=$sentencia->fetchAll(PDO::FETCH_ASSOC);
    foreach($data as $row)
    {
      $imagenes=array();
      $comando = "select * from imagenes where idtrabajo=?";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      $sentencia->bindParam(1, $row["id"], PDO::PARAM_INT);
    $sentencia->execute();
    $dataImagenes=$sentencia->fetchAll(PDO::FETCH_ASSOC);
    foreach($dataImagenes as $rowImagen)
    {
      array_push($imagenes, array(
        "idimagen"=>$rowImagen["idimagen"],
        "imagen"=>$rowImagen["imagen"]
      )
      );
    }
      array_push($final,array(
        "id"=>$row["id"],
        "fechacreacion"=>$row["fechacreacion"],
        "latitud"=>$row["latitud"],
        "longitud"=>$row["longitud"],
        "localidad"=>$row["localidad"],
        "tipo"=>$row["tipo"],
        "cliente"=>$row["cliente"],
        "telefono"=>$row["telefono"],
        "estado"=>$row["estado"],
        "nombreestado"=>$row["nombreestado"],
        "nombretipo"=>$row["nombretipo"],
        "nombrelocalidad"=>$row["nombrelocalidad"],
        "provincia"=>$row["idprovincia"],
        "nombreprovincia"=>$row["nombreprovincia"],
        "imagenes"=>$imagenes
      ));
    }
      http_response_code(200);
      return ["trabajos"=>$final];
  }

  private function modificar()
  {
    $cuerpo = file_get_contents('php://input');
    $usuario = json_decode($cuerpo);
    $comando="update autorizaciones set estado=?,IdVendedorAutoriza=? where IdAutorizacion=?";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->bindParam(1, $usuario->Estado, PDO::PARAM_INT);
    $sentencia->bindParam(2, $usuario->IdVendedorAutoriza, PDO::PARAM_INT);
    $sentencia->bindParam(3, $usuario->IdAutorizacion, PDO::PARAM_INT);
    $sentencia->execute();
    http_response_code(200);
    return "1";
  }





}
