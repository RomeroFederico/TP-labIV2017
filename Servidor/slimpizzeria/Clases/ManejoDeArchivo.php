<?php

class Archivo {

	public function __construct()
    {

    }

    public static function Subir($archivo)
    {
		//IMPLEMENTAR...
    	$resultado = new stdClass();
    	$resultado->exito = TRUE;

    	if (!file_exists($archivo->nombreTmp))
    	{
    		$resultado->exito = FALSE;
			$resultado->mensaje = "Error al subir la imagen. ";
			return $resultado;
    	}

    	$tipoArchivo = pathinfo($archivo->nombreArchivo, PATHINFO_EXTENSION);

        // AGREGAR AL NOMBRE FECHA + TIPO ARCHIVO
    	date_default_timezone_set("America/Argentina/Buenos_Aires");
		$archivoTmp = $archivo->idUsuario . "_" . date("Ymd_His") . "." . $tipoArchivo;
		$destino = "tmp/" . $archivo->tipo . "/" . $archivoTmp;

		if(getimagesize($archivo->nombreTmp) === false)
		{
			$resultado->exito = FALSE;
			$resultado->mensaje = "El archivo seleccionado no es una imagen. ";
			return $resultado;
		}

		if($tipoArchivo != "jpg" && $tipoArchivo != "jpeg" && $tipoArchivo != "gif" && $tipoArchivo != "png")
		{
				$resultado->exito = FALSE;
				$resultado->mensaje = "Tipo de imagen no permitido. ";
				return $resultado;
		}

		if (file_exists($destino))
		{
			$$resultado->exito = FALSE;
			$resultado->mensaje = "La imagen ya se ha subido. ";
			return $resultado;
		}

		if ($archivo->size > 10000000)
		{
			$resultado->exito = FALSE;
			$resultado->mensaje = "La imagen supera el peso maximo. ";
			return $resultado;
		}

		if (!move_uploaded_file($archivo->nombreTmp, $destino))
		{
			$resultado->exito = FALSE;
			$resultado->mensaje = "La imagen no se pudo guardar. ";
			return $resultado;
		}

		// if (substr_count($archivo->rutaAnterior, "tmp/") > 0)
		// 	Archivo::Borrar($archivo->rutaAnterior);
		
		$resultado->imagenSubida = $archivoTmp;
		$resultado->imagenSubidaRuta = $destino;

		return $resultado;
    }

    public static function Borrar($path)
    {
		//IMPLEMENTAR...
		return unlink($path);
    }

    public static function Mover($pathOrigen, $pathDestino)
    {
		//IMPLEMENTAR...
		if (!file_exists($pathOrigen) || file_exists($pathDestino))
			return FALSE;
		if (copy($pathOrigen, $pathDestino))
			return Archivo::Borrar($pathOrigen);
		return FALSE;
    }
    
}