<?php

require_once('datos/ConexionBD.php');
require_once('controladores/utils.php');

class autorizaciones
{
  const NOMBRE_TABLA = "autorizaciones";

  const ESTADO_CREACION_EXITOSA = 1;
  const ESTADO_CREACION_FALLIDA = 2;
  const ESTADO_ERROR_BD = 3;
  const ESTADO_URL_INCORRECTA = 6;
  const ESTADO_FALLA_DESCONOCIDA = 7;
  const ESTADO_PARAMETROS_INCORRECTOS = 8;

  public static function get($peticion)
  {

    if (empty($peticion[0]))
    {
      return self::getAutorizaciones();
    }
    else
    {
      return self::getAutorizaciones($peticion[0]);
    }

  }

  public static function post($peticion)
  {
    return self::registrar();
  }

  public static function put($peticion)
  {
    return self::modificar();
  }

  private function getAutorizaciones($clientID = NULL)
  {
    $array=array();
    $arrayDetalle=array();
    $costototal=0;
    $ventaactual=0;
    $ventatotal=0;
    $porcentajefinal =0;
    if($clientID){
      $comando = "SELECT autorizaciones.*,sucursales.nombre as DescSucursal,v1.Nombre as DescVendedorPide,v2.nombre as DescVendedorAutoriza
      FROM autorizaciones
      inner join sucursales on sucursales.IdSucursal=autorizaciones.IdSucursal
      inner join vendedores v1 on v1.IdVendedor=autorizaciones.idvendedorpide
      left outer join vendedores v2 on v2.IdVendedor=autorizaciones.idvendedorautoriza
       WHERE idautorizacion=? and Estado=0";
      $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      $sentencia->bindParam(1, $clientID, PDO::PARAM_INT);
    }
    else {
      $comando = "SELECT autorizaciones.*,sucursales.nombre as DescSucursal,v1.Nombre as DescVendedorPide,v2.nombre as DescVendedorAutoriza
      FROM autorizaciones
      inner join sucursales on sucursales.IdSucursal=autorizaciones.IdSucursal
      inner join vendedores v1 on v1.IdVendedor=autorizaciones.idvendedorpide
      left outer join vendedores v2 on v2.IdVendedor=autorizaciones.idvendedorautoriza
      where Estado=0";
      $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    }
    $sentencia->execute();
    $data=$sentencia->fetchAll(PDO::FETCH_ASSOC);
    $arrayDetalle=array();
    $comando = "select * from autorizacionescolor order by porcentaje desc";
    $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
    $sentencia->execute();
    $dataColores=$sentencia->fetchAll(PDO::FETCH_ASSOC);
      foreach($data as $row)
      {
        $comando = "SELECT * from detalleautorizaciones where IdAutorizacion=?";
        $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
        $sentencia->bindParam(1, $row['IdAutorizacion'], PDO::PARAM_INT);
        $sentencia->execute();
        $dataDetalle=$sentencia->fetchAll(PDO::FETCH_ASSOC);
          foreach($dataDetalle as $rowDetalle)
          {
            $rentabilidad = $rowDetalle["PrecioUnitario"] / $rowDetalle["PrecioCosto"];
    				$rentabilidad = $rentabilidad - 1; $rentabilidad = $rentabilidad * 100;
            $costototal += $rowDetalle["PrecioCosto"] * $rowDetalle["Cantidad"];
            $ventaactual += $rowDetalle["PrecioUnitario"] * $rowDetalle["Cantidad"];
            $colorfinal='80ff80';

              foreach($dataColores as $rowColor)
              {
                if ($rentabilidad < $rowColor["porcentaje"])
      					{
      						$colorfinal=$rowColor["hexColor"];
      					}
              }
            array_push($arrayDetalle,array(
              "IdProducto"=>$rowDetalle["IdProducto"],
              "Descripcion"=>$rowDetalle["Descripcion"],
              "Cantidad"=>$rowDetalle["Cantidad"],
              "PrecioUnitario"=>$rowDetalle["PrecioUnitario"],
              "Subtotal"=>$rowDetalle["Subtotal"],
              "PrecioCosto"=>$rowDetalle["PrecioCosto"],
              "Rentabilidad"=>number_format($rentabilidad),
        			"Color"=>$colorfinal
            ));
          }

          if($costototal!=0){
            $porcentajefinal = (($ventaactual * 100) / $costototal) / 100;
            $porcentajefinal = $porcentajefinal - 1; $porcentajefinal = $porcentajefinal * 100;
          }
        array_push($array,array(
          "IdAutorizacion"=>$row["IdAutorizacion"],
          "IdSucursal"=>$row["IdSucursal"],
          "Fecha"=>$row["Fecha"],
          "IdTipoAutorizacion"=>$row["IdTipoAutorizacion"],
          "Estado"=>$row["Estado"],
          "IdVendedorPide"=>$row["IdVendedorPide"],
          "IdVendedorAutoriza"=>$row["IdVendedorAutoriza"],
          "Detalle"=>$row["Detalle"],
          "DescSucursal"=>$row["DescSucursal"],
          "DescVendedorPide"=>$row["DescVendedorPide"],
          "DescVendedorAutoriza"=>$row["DescVendedorAutoriza"],
          "CostoTotal"=>number_format($costototal,2),
        	"VentaActual"=>number_format($ventaactual,2),
        	"PorcentajeFinal"=>number_format($porcentajefinal,2),
          "detalle"=>$arrayDetalle));
      }
      http_response_code(200);
      return ["autorizaciones"=>$array];
    }



  private function registrar()
  {

    $cuerpo = file_get_contents('php://input');
    $usuario = json_decode($cuerpo);

    $resultado = self::crear($usuario);

    switch ($resultado) {

      case self::ESTADO_CREACION_FALLIDA:
      throw new ExcepcionApi(self::ESTADO_CREACION_FALLIDA, "Ha ocurrido un error");
      break;
      default:
      http_response_code(200);
      return $resultado;
    }
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
