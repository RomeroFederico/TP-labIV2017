<?php

require_once "AutentificadorJWT.php";
class MWparaAutentificar
{
	// VERIFICO SI ES UN USUARIO VALIDO CON EL TOKEN. NO COMPRUEBA SU TIPO.
	public function VerificarUsuario($request, $response, $next) {
         
		$objDelaRespuesta = new stdclass();
		$objDelaRespuesta->respuesta="";
		
		$arrayConToken = $request->getHeader('HTTP_AUTHORIZATION');
		
		$token=$arrayConToken[0];
		$token= explode(" ", $token)[1];			

		$objDelaRespuesta->esValido=true; 
		try 
		{
			AutentificadorJWT::verificarToken($token);
			$objDelaRespuesta->esValido=true;      
		}
		catch (Exception $e)
		{      
			$objDelaRespuesta->excepcion=$e->getMessage();
			$objDelaRespuesta->header = $request->getHeaders();
			$objDelaRespuesta->esValido=false;     
		}

		if($objDelaRespuesta->esValido)
		{		    
			$response = $next($request, $response);
		}   
		else
		{
			$objDelaRespuesta->respuesta="Solo usuarios registrados";
			$objDelaRespuesta->elToken=$token;
		}  
	  
		if($objDelaRespuesta->respuesta!="")
		{
			$nueva = $response->withJson($objDelaRespuesta, 401);  
			return $nueva;
		}
		  
		return $response;   
	}
}