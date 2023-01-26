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

  private static function registrar()
  {
   
    $myfile = fopen("logs.txt", "a") or die("Unable to open file!");
fwrite($myfile, "\n". "vino algo");
fclose($myfile);

   /* $target_dir = "../web/obras/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
  $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
  if($check !== false) {
    echo "File is an image - " . $check["mime"] . ".";
    $uploadOk = 1;
  } else {
    echo "File is not an image.";
    $uploadOk = 0;
  }
}*/

    /*$cuerpo = file_get_contents('php://input');
    $usuario = json_decode($cuerpo);
    foreach ($usuario->imagenes as $item) {
      $comando = "INSERT INTO `imagenes`(`idtrabajo`, `idimagen`, `imagen`) VALUES (?,?,?)";
      $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
      $sentencia->bindParam(1, $item->idtrabajo, PDO::PARAM_STR);
      $sentencia->bindParam(2, $item->idimagen, PDO::PARAM_STR);
      $sentencia->bindParam(3, $item->imagen, PDO::PARAM_STR);
      $sentencia->execute();
    }*/
    http_response_code(200);
    $respuesta["respuesta"] = "ok";
    return ["imagenes" => $respuesta];
  }
}