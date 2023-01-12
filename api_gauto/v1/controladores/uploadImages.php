<?php

require_once('datos/ConexionBD.php');

class uploadImages
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

  public static function put($peticion)
  {
    return self::modificar();
  }


  private function registrar()
  {

    $cuerpo = file_get_contents('php://input');
    $usuario = json_decode($cuerpo);

foreach($usuario->imagenes as $item) {
  $comando = "INSERT INTO `imagenes`(`idtrabajo`, `idimagen`, `imagen`) VALUES (?,?,?)";
              $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
              $sentencia->bindParam(1, $item->idtrabajo, PDO::PARAM_STR);
              $sentencia->bindParam(2, $item->idimagen, PDO::PARAM_STR);
              $sentencia->bindParam(3, $item->imagen, PDO::PARAM_STR);
              $sentencia->execute();
}



http_response_code(200);
$respuesta["IdAutorizacion"] = "ok";
return ["autorizaciones" => $respuesta];

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


  private function crear($datosUsuario)
  {
    $IdAutorizacion=utils::ObtenerSigId("autorizaciones","idautorizacion");
    $fecha=date('Y-m-d H:i:s');
    $detalle=$datosUsuario->Detalle.'<br>Importe: '.$datosUsuario->ImporteTotal.'<br>Descuento Aplicado: '.$datosUsuario->Descuento;
    $IdTipoAutorizacion=0;
    $comando="select * from tipoautorizacion where descripcion=?";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->bindParam(1, $datosUsuario->TipoComprobante, PDO::PARAM_STR);
    $sentencia->execute();
    $data=$sentencia->fetchAll(PDO::FETCH_ASSOC);
    foreach($data as $row)
    {
      $IdTipoAutorizacion=$row["IdTipoAutorizacion"];
    }

    try {

      $pdo = ConexionBD::obtenerInstancia()->obtenerBD();
      $comando = "INSERT INTO `autorizaciones`(`IdAutorizacion`, `IdSucursal`, `Fecha`, `IdTipoAutorizacion`,
        `Estado`, `IdVendedorPide`, `IdVendedorAutoriza`, `Detalle`) VALUES (
          ?,?,?,?,
          0,?,NULL,?)";

      $sentencia = $pdo->prepare($comando);

      $sentencia->bindParam(1, $IdAutorizacion, PDO::PARAM_INT);
      $sentencia->bindParam(2, $datosUsuario->IdSucursal, PDO::PARAM_INT);
      $sentencia->bindParam(3, $fecha, PDO::PARAM_STR);
      $sentencia->bindParam(4, $IdTipoAutorizacion, PDO::PARAM_INT);
      $sentencia->bindParam(5, $datosUsuario->IdVendedor, PDO::PARAM_INT);
      $sentencia->bindParam(6, $detalle, PDO::PARAM_STR);

      if($sentencia->execute())
      {
        //guardar detalle
        foreach ($datosUsuario->Productos as $unProducto) {
          $subtotalLinea=$unProducto->Precio*$unProducto->Cantidad;
          $comando = "INSERT INTO `detalleautorizaciones`(`IdAutorizacion`, `IdProducto`, `Descripcion`,
            `Cantidad`, `PrecioUnitario`, `Subtotal`, `PrecioCosto`) VALUES (
              ?,?,?,
              ?,?,?,?)";
              $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
              $sentencia->bindParam(1, $IdAutorizacion, PDO::PARAM_INT);
              $sentencia->bindParam(2, $unProducto->IdProducto, PDO::PARAM_INT);
              $sentencia->bindParam(3, $unProducto->Descripcion, PDO::PARAM_STR);
              $sentencia->bindParam(4, $unProducto->Cantidad, PDO::PARAM_INT);
              $sentencia->bindParam(5, $unProducto->Precio, PDO::PARAM_STR);
              $sentencia->bindParam(6, $subtotalLinea, PDO::PARAM_STR);
              $sentencia->bindParam(7, $unProducto->Costo, PDO::PARAM_STR);
              $sentencia->execute();
            }

        $respuesta["IdAutorizacion"] = $IdAutorizacion;
        return ["autorizaciones" => $respuesta];
      } else {
        return self::ESTADO_CREACION_FALLIDA;
      }
    } catch (PDOException $e) {
      throw new ExcepcionApi(self::ESTADO_ERROR_BD, $e->getMessage());
    }

  }



}
