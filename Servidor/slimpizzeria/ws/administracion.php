<?php

require_once "../Clases/AccesoDatos.php";
require_once "../Clases/Usuario.php";
require_once "../Clases/Producto.php";
require_once "../Clases/Local.php";
require_once "../Clases/Pedido.php";
require_once "../Clases/Encuesta.php";
require_once "../Clases/ManejoDeArchivo.php";
require_once "../mw/MWparaValidarUsuarioJWT.php";

require __DIR__ . '/vendor/autoload.php';

use \Firebase\JWT\JWT;

use \Psr\Http\Message\ServerRequestInterface as Request; //alias
use \Psr\Http\Message\ResponseInterface as Response; //alias

require 'vendor/autoload.php'; //composer, referencia a slim framework

$app = new \Slim\App; //clase de slim framework

//Evitar Problema con CORS
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($request, $response, $next) {
    try
    { 
        $response = $next($request, $response);
        return $response;
    }
    catch(Exception $e)
    {
        $resultado = new stdClass();
        $resultado->exito = false;
        $resultado->error = $e->getMessage();

        $response = $response->withJson($resultado);
        return $response->withHeader('Content-type', 'application/json');
    }
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*') //La pagina donde este alojado.
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
//Fin Evitar Problemas Con CORS

$app->post('/captcha', function (Request $request, Response $response)
{
    $data = array(
    	'secret' => '6LddPygUAAAAAGvXgGl3hFDxHnlJIYkF_pdywHYi',
    	'response' => $request->getParams()["response"]
    );

    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $ch = curl_init($url);
    $postString = http_build_query($data, '', '&');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postString);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $re = curl_exec($ch);
    curl_close($ch);

    /*$response = http_post_data($url, $postString);*/

    // $resultado = new stdClass();
    // $resultado->valor = $postString;
    // $resultado->exito = false;

    $response = $response->withJson(json_decode($re));
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/login', function (Request $request, Response $response)
{
    $usuario = new stdclass();
    $usuario->email =  $request->getParams()["email"];
    $usuario->password =  $request->getParams()["password"];

    $usuarioLogin = Usuario::TraerUsuarioLogueado($usuario);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($usuarioLogin == false)
        $resultado->mensaje = "No se encontro el usuario ingresado.";
    else
    {
        if ($usuarioLogin->estado == "0")
        {
            $resultado->mensaje = "Acceso invalido, tu cuenta ha sido deshabilitada...";
        }
        else
        {
            $resultado->exito = true;

            //JWT
            $key = "example_key";
            $token = array(
                "iss" => "http://localhost:4200",
                "aud" => "http://localhost:4200",
                "iat" => 1356999524,
                "nbf" => 1357000000,
                "usuario" => $usuarioLogin
            );

            $resultado->token = JWT::encode($token, $key);
        }
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/usuarios/modificar', function (Request $request, Response $response)
{
    $modificar = new stdclass();
    $modificar->idUsuario =  $request->getParams()["idUsuario"];
    $modificar->nombre =  $request->getParams()["nombre"];
    $modificar->apellido =  $request->getParams()["apellido"];
    $modificar->email =  $request->getParams()["email"];
    $modificar->password =  $request->getParams()["password"];
    $modificar->sexo =  $request->getParams()["sexo"];
    $modificar->telefono =  $request->getParams()["telefono"];
    $modificar->direccion =  $request->getParams()["direccion"];
    $modificar->localidad =  $request->getParams()["localidad"];
    $modificar->provincia =  $request->getParams()["provincia"];
    $modificar->pais =  $request->getParams()["pais"];
    $modificar->img =  $request->getParams()["img"];
    $modificar->estado =  $request->getParams()["estado"];
    $modificar->tipo =  $request->getParams()["tipo"];
    $modificar->legajo = $request->getParams()["legajo"];
    $modificar->imgAnterior =  $request->getParams()["imgAnterior"]; 

    if ($modificar->imgAnterior != "" && $modificar->imgAnterior != $modificar->img)
    {     
	Archivo::Mover("tmp/usuarios/" . $modificar->img, "img/usuarios/" . $modificar->img);

	if ($modificar->imgAnterior != 'default.png')
		Archivo::Borrar("img/usuarios/" . $modificar->imgAnterior);
    }

    $resultadoModificar = Usuario::ModificarUsuario($modificar);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($resultadoModificar == false)
        $resultado->mensaje = "Ocurrio un error al querer modificar el usuario. ";
    else
    {
        $resultado->exito = true;
        
        $key = "example_key";
        $token = array(
            "iss" => "http://example.org",
            "aud" => "http://example.com",
            "iat" => 1356999524,
            "nbf" => 1357000000,
            "usuario" => $modificar
        );

        $resultado->token = JWT::encode($token, $key);
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->get('/usuarios', function (Request $request, Response $response)
{
    $usuarios = Usuario::TraerTodosLosUsuarios();

    if (count($usuarios) < 1)
        $usuarios = false;

    $response = $response->withJson($usuarios);

     return $response->withHeader('Content-type', 'application/json');
});

$app->get('/clientes', function (Request $request, Response $response)
{
    $usuarios = Usuario::TraerTodosLosClientes();

    if (count($usuarios) < 1)
        $usuarios = false;

    $response = $response->withJson($usuarios);

     return $response->withHeader('Content-type', 'application/json');
});

$app->get('/clientesempleados/{idEncargado}', function (Request $request, Response $response)
{
    $idEncargado = $request->getAttribute('idEncargado');
    $usuarios = Usuario::TraerTodosLosClientesYEmpleados($idEncargado);

    if (count($usuarios) < 1)
        $usuarios = false;

    $response = $response->withJson($usuarios);

     return $response->withHeader('Content-type', 'application/json');
});

$app->get('/empleados/libres', function (Request $request, Response $response)
{
    $usuarios = Usuario::TraerTodosLosEmpleadosLibres();

    if (count($usuarios) < 1)
        $usuarios = false;

    $response = $response->withJson($usuarios);

     return $response->withHeader('Content-type', 'application/json');
});

$app->get('/encargados/libres', function (Request $request, Response $response)
{
    $usuarios = Usuario::TraerTodosLosEncargadosLibres();

    if (count($usuarios) < 1)
        $usuarios = false;

    $response = $response->withJson($usuarios);

     return $response->withHeader('Content-type', 'application/json');
});

$app->get('/cliente/email/{email}', function (Request $request, Response $response)
{
    $email = $request->getAttribute('email');
    $usuarioTraido = Usuario::BuscarClientePorEmail($email);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($usuarioTraido == false)
        $resultado->mensaje = "El email no es de un cliente!!!";
    else
    {
        $resultado->exito = true;
        $resultado->cliente = $usuarioTraido;
    }

    $response = $response->withJson($resultado);

    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/productos', function (Request $request, Response $response)
{
    $productos = Producto::TraerTodosLosProductos();

    if (count($productos) < 1)
        $productos = false;

    $response = $response->withJson($productos);

    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/productos/registrar', function (Request $request, Response $response)
{
    $miProducto = new stdclass();
    $miProducto->descripcion = $request->getParams()['descripcion'];
    $miProducto->precio = $request->getParams()['precio'];
    $miProducto->tipo = $request->getParams()['tipo'];
    $miProducto->promocion = $request->getParams()['promocion'];
    $miProducto->img = $request->getParams()['img'];

    $idLocal = $request->getParams()['idLocal'];

    if ($miProducto->img != "default.png")
        Archivo::Mover("tmp/productos/" . $miProducto->img, "img/productos/" . $miProducto->img);

    $resultado = new stdclass();
    $resultado->exito = false;
    $resultado->producto = $miProducto;
    $resultado->idLocal = $idLocal;

    $resultadoRegistrar = Producto::RegistrarProducto($miProducto);

    if ($resultadoRegistrar)
    {
        $resultado->id = $resultadoRegistrar;

        $resultadoLocal = Local::RegistrarProducto($idLocal, $resultadoRegistrar);

        if ($resultadoLocal)
        {
            $resultado->exito = true;
            $resultado->mensaje = "Producto registrado con exito.";
        }
        else
            $resultado->mensaje = "Ocurrio un problema al querer registrar el producto en el local.";
    }
    else
        $resultado->mensaje = "Ocurrio un problema al querer registrar el producto.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/productos/modificar', function (Request $request, Response $response)
{
    $miProducto = new stdclass();
    $miProducto->idProducto = $request->getParams()['idProducto'];
    $miProducto->descripcion = $request->getParams()['descripcion'];
    $miProducto->precio = $request->getParams()['precio'];
    $miProducto->tipo = $request->getParams()['tipo'];
    $miProducto->promocion = $request->getParams()['promocion'];
    $miProducto->img = $request->getParams()['img'];
    $miProducto->imgAnterior = $request->getParams()['imgAnterior'];

    $idLocal = $request->getParams()['idLocal'];

    if ($miProducto->imgAnterior != "" && $miProducto->imgAnterior != $miProducto->img)
    {     
	    Archivo::Mover("tmp/productos/" . $miProducto->img, "img/productos/" . $miProducto->img);

        if ($miProducto->imgAnterior != 'default.png')
            Archivo::Borrar("img/productos/" . $miProducto->imgAnterior);
    }

    $resultado = new stdclass();
    $resultado->exito = false;
    $resultado->producto = $miProducto;
    $resultado->idLocal = $idLocal;

    $resultadoModificar = Producto::ModificarProducto($miProducto);

    if ($resultadoModificar == true)
    {
        $resultado->exito = true;
        $resultado->mensaje = "Producto modificado con exito!!!";
    }
    else
        $resultado->mensaje = "Ocurrio un problema al querer modificar el producto.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/locales/nuevo', function (Request $request, Response $response)
{
    $miLocal = new stdclass();
    $miLocal->idUsuario = $request->getParams()['idUsuario'];
    $miLocal->img1 = $request->getParams()['img1'];
    $miLocal->img2 = $request->getParams()['img2'];
    $miLocal->img3 = $request->getParams()['img3'];
    $miLocal->telefono = $request->getParams()['telefono'];
    $miLocal->capacidad = $request->getParams()['capacidad'];
    $miLocal->direccion = $request->getParams()['direccion'];
    $miLocal->localidad = $request->getParams()['localidad'];
    $miLocal->provincia = $request->getParams()['provincia'];
    $miLocal->pais = $request->getParams()['pais'];
    $miLocal->empleados = $request->getParams()['empleados'];
    $miLocal->productos = $request->getParams()['productos'];

    if ($miLocal->img1 != "default.png")
        Archivo::Mover("tmp/locales/" . $miLocal->img1, "img/locales/" . $miLocal->img1);

    if ($miLocal->img2 != "default.png")
        Archivo::Mover("tmp/locales/" . $miLocal->img2, "img/locales/" . $miLocal->img2);

    if ($miLocal->img3 != "default.png")
        Archivo::Mover("tmp/locales/" . $miLocal->img3, "img/locales/" . $miLocal->img3);

    $resultado = new stdclass();
    $resultado->exito = false;

    $resultadoRegistrar = Local::RegistrarLocal($miLocal);

    if ($resultadoRegistrar)
    {
        $resultado->id = $resultadoRegistrar;

        $resultadoEmpleados = Local::RegistrarEmpleados($resultado->id, $miLocal->empleados);

        if ($resultadoEmpleados)
        {
            if (Local::RegistraProductos($resultado->id, $miLocal->productos) == TRUE)
            {
                $resultado->exito = true;
                $resultado->mensaje = "Local registrado con exito.";
            }
            else
                $resultado->mensaje = "Ocurrio un problema al querer registrar los productos del local.";
        }
        else
            $resultado->mensaje = "Ocurrio un problema al querer registrar los empleados del local.";
    }
    else
        $resultado->mensaje = "Ocurrio un problema al querer registrar el local.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/locales/modificar', function (Request $request, Response $response)
{
    $miLocal = new stdclass();
    $miLocal->idLocal = $request->getParams()['idLocal'];
    $miLocal->idUsuario = $request->getParams()['idUsuario'];
    $miLocal->img1 = $request->getParams()['img1'];
    $miLocal->img2 = $request->getParams()['img2'];
    $miLocal->img3 = $request->getParams()['img3'];
    $miLocal->telefono = $request->getParams()['telefono'];
    $miLocal->capacidad = $request->getParams()['capacidad'];
    $miLocal->direccion = $request->getParams()['direccion'];
    $miLocal->localidad = $request->getParams()['localidad'];
    $miLocal->provincia = $request->getParams()['provincia'];
    $miLocal->pais = $request->getParams()['pais'];
    $miLocal->empleados = $request->getParams()['empleados'];
    $miLocal->productos = $request->getParams()['productos'];
    $miLocal->img1Anterior =  $request->getParams()["img1Anterior"]; 
    $miLocal->img2Anterior =  $request->getParams()["img2Anterior"]; 
    $miLocal->img3Anterior =  $request->getParams()["img3Anterior"]; 

    if ($miLocal->img1Anterior != "" && $miLocal->img1Anterior != $miLocal->img1)
    {     
	    Archivo::Mover("tmp/locales/" . $miLocal->img1, "img/locales/" . $miLocal->img1);

        if ($miLocal->img1Anterior != 'default.png')
            Archivo::Borrar("img/locales/" . $miLocal->img1Anterior);
    }

    if ($miLocal->img2Anterior != "" && $miLocal->img2Anterior != $miLocal->img2)
    {     
	    Archivo::Mover("tmp/locales/" . $miLocal->img2, "img/locales/" . $miLocal->img2);

        if ($miLocal->img2Anterior != 'default.png')
            Archivo::Borrar("img/locales/" . $miLocal->img2Anterior);
    }

    if ($miLocal->img3Anterior != "" && $miLocal->img3Anterior != $miLocal->img3)
    {     
	    Archivo::Mover("tmp/locales/" . $miLocal->img3, "img/locales/" . $miLocal->img3);

        if ($miLocal->img3Anterior != 'default.png')
            Archivo::Borrar("img/locales/" . $miLocal->img3Anterior);
    }

    $resultadoModificar = Local::ModificarLocal($miLocal);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($resultadoModificar)
    {
	$resultado->id = $request->getParams()['idLocal'];

        $resultadoEliminarEmpleados = Local::EliminarEmpleados($resultado->id);
        if ($resultadoEliminarEmpleados === TRUE)
            $resultadoEmpleados = Local::RegistrarEmpleados($resultado->id, $miLocal->empleados);
        else
	{
	    $resultado->errorBorrarEmpleados = $resultadoEliminarEmpleados;
            $resultadoEmpleados = FALSE;
	}

        if ($resultadoEmpleados)
        {
            $resultadoEliminarProductos = Local::EliminarProductos($resultado->id);
            if ($resultadoEliminarProductos == TRUE)
                $resultadoProductos = Local::RegistraProductos($resultado->id, $miLocal->productos);
            else
                $resultadoProductos = FALSE;

            if ($resultadoProductos == TRUE)
            {
                $resultado->exito = true;
                $resultado->mensaje = "Local modificado con exito.";
            }
            else
                $resultado->mensaje = "Ocurrio un problema al querer modificar los productos del local.";
        }
        else
            $resultado->mensaje = "Ocurrio un problema al querer modificar los empleados del local.";
    }
    else
        $resultado->mensaje = "Ocurrio un problema al querer modificar el local.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->get('/locales', function (Request $request, Response $response)
{
    $locales = Local::TraerTodosLosLocalesConSuGerente();

    if (count($locales) < 1)
        $locales = false;

    $response = $response->withJson($locales);

     return $response->withHeader('Content-type', 'application/json');
});

$app->post('/local/usuario', function (Request $request, Response $response)
{
    $usuario = new stdClass();
    $usuario->idUsuario = $request->getParams()['idUsuario'];
    $usuario->tipo = $request->getParams()['tipo'];

    if ($usuario->tipo == "Empleado")
        $local = Local::TraerLocalConEmpleado($usuario);
    else
        $local = Local::TraerLocalConGerente($usuario);

    $resultado = new stdClass();
    $resultado->local = $local;

    $response = $response->withJson($resultado);

    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/productos/local/{idLocal}', function (Request $request, Response $response)
{
    $idLocal = $request->getAttribute('idLocal');
    $productos = Producto::TraerTodosLosProductosLocal($idLocal);

    if (count($productos) < 1)
        $productos = false;

    $response = $response->withJson($productos);

    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/productos/local', function (Request $request, Response $response)
{
    $locales = Local::TraerTodosLosLocalesPorProductos();

    if (count($locales) < 1)
        $locales = false;

    $response = $response->withJson($locales);

    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/empleados/local/{idLocal}', function (Request $request, Response $response)
{
    $idLocal = $request->getAttribute('idLocal');
    $empleados = Usuario::TraerTodosLosEmpleadosLocal($idLocal);

    if (count($empleados) < 1)
        $empleados = false;

    $response = $response->withJson($empleados);

    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/usuario/email/{email}', function (Request $request, Response $response)
{
    $email = $request->getAttribute('email');
    $usuarioTraido = Usuario::ComprobarEmail($email);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($usuarioTraido == false)
        $resultado->exito = true;
    else
        $resultado->mensaje = "El email ya se ha ingresado!!!";

    $response = $response->withJson($resultado);

    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/usuario/legajo/{legajo}', function (Request $request, Response $response)
{
    $legajo = $request->getAttribute('legajo');
    $usuarioTraido = Usuario::ComprobarLegajo($legajo);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($usuarioTraido == false)
        $resultado->exito = true;
    else
        $resultado->mensaje = "El legajo ya se ha ingresado!!!";

    $response = $response->withJson($resultado);

    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/registrar/empleado', function (Request $request, Response $response)
{
    $datos = new stdclass();
    $datos->idEmpleado =  $request->getParams()["idUsuario"];
    $datos->idUsuario =  $request->getParams()["idEncargado"];

    $resultado = new stdClass();
    $resultado->exito = false;

    $local = Local::TraerLocalConGerente($datos);

    if ($local != false)
    {
        $datos->idLocal = $local->idLocal;
        Local::RegistrarEmpleado($datos->idLocal, $datos->idEmpleado);
        $resultado->exito = true;
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/oficial/registrar', function (Request $request, Response $response)
{
    $resultado = new stdClass();
    $resultado->exito = false;

    $tipo = $request->getParams()["tipo"];

    $email = $request->getParams()['email'];
    $usuarioTraido = Usuario::ComprobarEmail($email);
    $usuarioTraido2 = false;

    if ($tipo != "Cliente")
    {
        $legajo = $request->getParams()['legajo'];
        $usuarioTraido2 = Usuario::ComprobarLegajo($legajo);
    }

    if ($usuarioTraido == false && $usuarioTraido2 == false)
    {
        $usuarioAlta = new stdclass();
        $usuarioAlta->nombre =  $request->getParams()["nombre"];
        $usuarioAlta->apellido =  $request->getParams()["apellido"];
        $usuarioAlta->email =  $request->getParams()["email"];
        $usuarioAlta->password =  $request->getParams()["password"];
        $usuarioAlta->sexo =  $request->getParams()["sexo"];
        $usuarioAlta->telefono =  $request->getParams()["telefono"];
        $usuarioAlta->direccion =  $request->getParams()["direccion"];
        $usuarioAlta->localidad =  $request->getParams()["localidad"];
        $usuarioAlta->provincia =  $request->getParams()["provincia"];
        $usuarioAlta->pais =  $request->getParams()["pais"];
        $usuarioAlta->img =  $request->getParams()["img"];
        $usuarioAlta->estado =  $request->getParams()["estado"];
        $usuarioAlta->tipo =  $request->getParams()["tipo"];
        $usuarioAlta->legajo =  $request->getParams()["legajo"];
    
        $exitoAlRegistrar = Usuario::RegistrarUsuario($usuarioAlta);
        
        if (!is_numeric($exitoAlRegistrar))
        {
	    $resultado->mensaje = "Error en el alta de usuario.";
	    $resultado->error = $exitoAlRegistrar;
	}
        else
        {
            $resultado->exito = true;
            $resultado->mensaje = "Usuario registrado con exito";
            $resultado->idUsuario =  $exitoAlRegistrar;
            $usuarioAlta->idUsuario = $exitoAlRegistrar;
            // $resultado->usuario = $usuarioAlta;

            //JWT
            $key = "example_key";
            $token = array(
                "iss" => "http://example.org",
                "aud" => "http://example.com",
                "iat" => 1356999524,
                "nbf" => 1357000000,
                "usuario" => $usuarioAlta,
            );

            $resultado->token = JWT::encode($token, $key);
        }
    }
    else
    {
        if ($usuarioTraido != false && $usuarioTraido2 != false)
            $resultado->mensaje = "Ya se ha ingresado un usuario con el email y el legajo indicado.";
        else if ($usuarioTraido != false && $usuarioTraido2 == false)
            $resultado->mensaje = "Ya se ha ingresado un usuario con el email indicado.";
        else
            $resultado->mensaje = "Ya se ha ingresado un usuario con el legajo indicado.";
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/registrar', function (Request $request, Response $response)
{
    // CAPTCHA, LUEGO SE HARA CON MIDDLEWARE

    $data = array(
    	'secret' => '6LddPygUAAAAAGvXgGl3hFDxHnlJIYkF_pdywHYi',
    	'response' => $request->getParams()["response"]
    );

    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $ch = curl_init($url);
    $postString = http_build_query($data, '', '&');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postString);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $re = curl_exec($ch);
    curl_close($ch);

    $resultadoCaptcha = json_decode($re);

    $resultado = new stdClass();
    $resultado->exito = false;

    if ($resultadoCaptcha->success == false)
    {
        $resultado->mensaje = "ACCESO DENEGADO, CAPTCHA NO ACEPTADO. ";

        $response = $response->withJson($resultado);
        return $response->withHeader('Content-type', 'application/json');
    }

    // FIN CAPTCHA

    $tipo = $request->getParams()["tipo"];

    $email = $request->getParams()['email'];
    $usuarioTraido = Usuario::ComprobarEmail($email);
    $usuarioTraido2 = false;

    if ($tipo != "Cliente")
    {
        $legajo = $request->getParams()['legajo'];
        $usuarioTraido2 = Usuario::ComprobarLegajo($legajo);
    }

    // $resultado = new stdclass();
    // $resultado->exito = false;

    if ($usuarioTraido == false && $usuarioTraido2 == false)
    {
        $usuarioAlta = new stdclass();
        $usuarioAlta->nombre =  $request->getParams()["nombre"];
        $usuarioAlta->apellido =  $request->getParams()["apellido"];
        $usuarioAlta->email =  $request->getParams()["email"];
        $usuarioAlta->password =  $request->getParams()["password"];
        $usuarioAlta->sexo =  $request->getParams()["sexo"];
        $usuarioAlta->telefono =  $request->getParams()["telefono"];
        $usuarioAlta->direccion =  $request->getParams()["direccion"];
        $usuarioAlta->localidad =  $request->getParams()["localidad"];
        $usuarioAlta->provincia =  $request->getParams()["provincia"];
        $usuarioAlta->pais =  $request->getParams()["pais"];
        $usuarioAlta->img =  $request->getParams()["img"];
        $usuarioAlta->estado =  $request->getParams()["estado"];
        $usuarioAlta->tipo =  $request->getParams()["tipo"];
        $usuarioAlta->legajo =  $request->getParams()["legajo"];
    
        $exitoAlRegistrar = Usuario::RegistrarUsuario($usuarioAlta);
        
        if (!is_numeric($exitoAlRegistrar))
        {
	    $resultado->mensaje = "Error en el alta de usuario.";
	    $resultado->error = $exitoAlRegistrar;
	}
        else
        {
            $resultado->exito = true;
            $resultado->mensaje = "Usuario registrado con exito";
            $usuarioAlta->idUsuario = $exitoAlRegistrar;
            // $resultado->usuario = $usuarioAlta;

            //JWT
            $key = "example_key";
            $token = array(
                "iss" => "http://example.org",
                "aud" => "http://example.com",
                "iat" => 1356999524,
                "nbf" => 1357000000,
                "usuario" => $usuarioAlta,
            );

            $resultado->token = JWT::encode($token, $key);
        }
    }
    else
    {
        if ($usuarioTraido != false && $usuarioTraido2 != false)
            $resultado->mensaje = "Ya se ha ingresado un usuario con el email y el legajo indicado.";
        else if ($usuarioTraido != false && $usuarioTraido2 == false)
            $resultado->mensaje = "Ya se ha ingresado un usuario con el email indicado.";
        else
            $resultado->mensaje = "Ya se ha ingresado un usuario con el legajo indicado.";
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/pedidos/detalle', function (Request $request, Response $response)
{
    $productos = $request->getParams()['productos'];
    $idLocal = $request->getParams()['idLocal'];

    //$productos = [1, 2];
    $resultado = new stdclass();
    $resultado->exito = false;

    $localTraido = Local::TraerUnLocalPorId($idLocal);

    if ($localTraido)
    {
        $productosTraidos = Producto::TraerListadoProductos($productos);

        if ($productosTraidos)
        {
            $resultado->exito = true;
            $resultado->local = $localTraido;
            $resultado->productos = $productosTraidos;
        }
        else
            $resultado->mensaje = "Ocurrio un problema al traer los datos de los productos.";
    }
    else
        $resultado->mensaje = "Ocurrio un problema al traer los datos del local.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/pedidos/nuevo', function (Request $request, Response $response)
{
    date_default_timezone_set('America/Argentina/Buenos_Aires');

    $miPedido = new stdclass();
    $miPedido->idCliente = $request->getParams()['idCliente'];
    $miPedido->idLocal = $request->getParams()['idLocal'];
    $miPedido->cantidad = $request->getParams()['cantidad'];
    $miPedido->precioTotal = $request->getParams()['precioTotal'];
    $miPedido->estado = $request->getParams()['estado'];
    $miPedido->fechaPedido = strftime("%Y-%m-%d %H:%M:%S", time() );
    $miPedido->productos = $request->getParams()['productos'];
    $miPedido->direccion = $request->getParams()['direccion'];
    $miPedido->localidad = $request->getParams()['localidad'];

    $resultado = new stdclass();
    $resultado->exito = false;

    $resultadoPedido = Pedido::RegistrarPedido($miPedido);

    if ($resultadoPedido)
    {
        $resultado->id = $resultadoPedido;

        $resultadoDetallePedido = Pedido::RegistrarDetallePedido($resultado->id, $miPedido->productos);

        if ($resultadoDetallePedido === TRUE)
        {
            $resultado->exito = true;
            $resultado->mensaje = "Pedido registrado con exito.";
        }
        else
        {
		$resultado->mensaje = "Ocurrio un problema al querer registrar los detalled del pedido.";
		$resultado->error = $resultadoDetallePedido;
	}
    }
    else
        $resultado->mensaje = "Ocurrio un problema al querer registrar el pedido.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/pedidos', function (Request $request, Response $response)
{
    $idCliente = $request->getParams()['idCliente'];
    $tipo = $request->getParams()['tipo'];

    if ($tipo == "Recibidos")
        $tipo = "Recibido";

    $pedidos = Pedido::TraerTodosLosPedidosConSuLocal($idCliente, $tipo);

    $resultado = new stdclass();
    $resultado->exito = false;

    if (count($pedidos) < 1)
        $resultado->mensaje = "No hay pedidos realizados " . $tipo . ".";
    else
    {
        $pedidosId = array();
        for ($i=0; $i < count($pedidos); $i++) { 
            array_push($pedidosId, $pedidos[$i]["idPedido"]);
        }

        $productosTraidos = Pedido::TraerTodosLosDetallesConSusProductos($pedidosId);

        if ($productosTraidos)
        {
            $resultado->exito = true;
            $resultado->pedidos = $pedidos;
            $resultado->detalles = $productosTraidos;
        }
        else
            $resultado->mensaje = "Ocurrio un problema al cargar los detalles de los pedidos " . $tipo . ".";
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/pedidos/local', function (Request $request, Response $response)
{
    $idLocal = $request->getParams()['idLocal'];
    $tipo = $request->getParams()['tipo'];

    if ($tipo == "Recibidos")
        $tipo = "Recibido";

    $pedidos = Pedido::TraerTodosLosPedidosDelLocal($idLocal, $tipo);

    $resultado = new stdclass();
    $resultado->exito = false;

    if (count($pedidos) < 1)
        $resultado->mensaje = "No hay pedidos realizados " . $tipo . ".";
    else
    {
        $pedidosId = array();
        for ($i=0; $i < count($pedidos); $i++) { 
            array_push($pedidosId, $pedidos[$i]["idPedido"]);
        }

        $productosTraidos = Pedido::TraerTodosLosDetallesConSusProductos($pedidosId);

        if ($productosTraidos)
        {
            $resultado->exito = true;
            $resultado->pedidos = $pedidos;
            $resultado->detalles = $productosTraidos;
        }
        else
            $resultado->mensaje = "Ocurrio un problema al cargar los detalles de los pedidos " . $tipo . ".";
    }

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/pedidos/terminar', function (Request $request, Response $response)
{
    date_default_timezone_set('America/Argentina/Buenos_Aires');

    $idPedido = $request->getParams()['idPedido'];

    $fechaEntrega = strftime("%Y-%m-%d %H:%M:%S", time() );

    $resultadoTerminar = Pedido::FinalizarPedido($idPedido, $fechaEntrega);

    $resultado = new stdclass();
    $resultado->exito = false;

    if (!$resultadoTerminar)
        $resultado->mensaje = "Ocurrrio un problema al querer finalizar el pedido.";
    else
        $resultado->exito = true;

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/encuesta/registrar', function (Request $request, Response $response)
{
    date_default_timezone_set('America/Argentina/Buenos_Aires');

    $encuesta = new stdclass();
    $encuesta->pregunta1 = $request->getParams()['pregunta1'];
    $encuesta->pregunta2 = $request->getParams()['pregunta2'];
    $encuesta->pregunta3 = $request->getParams()['pregunta3'];
    $encuesta->pregunta4 = $request->getParams()['pregunta4'];
    $encuesta->pregunta5 = $request->getParams()['pregunta5'];
    $encuesta->pregunta6 = $request->getParams()['pregunta6'];
    $encuesta->pregunta7 = $request->getParams()['pregunta7'];
    $encuesta->pregunta8 = $request->getParams()['pregunta8'];
    $encuesta->pregunta9 = $request->getParams()['pregunta9'];
    $encuesta->pregunta10 = $request->getParams()['pregunta10'];
    $encuesta->pregunta11 = $request->getParams()['pregunta11'];
    $encuesta->pregunta12 = $request->getParams()['pregunta12'];
    $encuesta->pregunta13 = $request->getParams()['pregunta13'];
    $encuesta->pregunta14 = $request->getParams()['pregunta14'];
    $encuesta->pregunta15 = $request->getParams()['pregunta15'];
    $encuesta->pregunta16 = $request->getParams()['pregunta16'];
    $encuesta->pregunta17 = $request->getParams()['pregunta17'];
    $encuesta->pregunta18 = $request->getParams()['pregunta18'];
    $encuesta->pregunta19 = $request->getParams()['pregunta19'];
    $encuesta->pregunta20 = $request->getParams()['pregunta20'];

    $encuesta->fecha = strftime("%Y-%m-%d %H:%M:%S", time());

    $encuesta->img1 = $request->getParams()['img1'];
    $encuesta->img2 = $request->getParams()['img2'];
    $encuesta->img3 = $request->getParams()['img3'];

    if ($encuesta->img1 != "")
        Archivo::Mover("tmp/encuesta/" . $encuesta->img1, "img/encuesta/" . $encuesta->img1);
    else
        $encuesta->img1 = null;

    if ($encuesta->img2 != "")
        Archivo::Mover("tmp/encuesta/" . $encuesta->img2, "img/encuesta/" . $encuesta->img2);
    else
        $encuesta->img2 = null;

    if ($encuesta->img3 != "")
        Archivo::Mover("tmp/encuesta/" . $encuesta->img3, "img/encuesta/" . $encuesta->img3);
    else
        $encuesta->img3 = null;

    $resultadoEncuesta = Encuesta::RegistrarEncuesta($encuesta);

    $resultado = new stdclass();
    $resultado->exito = false;

    if (!$resultadoEncuesta)
        $resultado->mensaje = "Ocurrrio un problema al querer registrar la encuesta.";
    else
        $resultado->exito = true;

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/subir/encuesta/tmp', function (Request $request, Response $response)
{
    $archivoSubir = $_FILES["file"];

    $archivo = new Archivo();

    $archivo->nombreTmp = $archivoSubir["tmp_name"];
    $archivo->nombreArchivo = $archivoSubir["name"];
    $archivo->idUsuario = "encuesta";
    $archivo->tipo = "encuesta";
    $archivo->size = $archivoSubir["size"];

    $response = $response->withJson(Archivo::Subir($archivo));
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/subir/usuarios/tmp/{id}', function (Request $request, Response $response)
{
    $archivoSubir = $_FILES["file"];

    $archivo = new Archivo();

    $archivo->nombreTmp = $archivoSubir["tmp_name"];
    $archivo->nombreArchivo = $archivoSubir["name"];
    $archivo->idUsuario = $request->getAttribute('id');
    $archivo->tipo = "usuarios";
    $archivo->size = $archivoSubir["size"];

    $response = $response->withJson(Archivo::Subir($archivo));
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/subir/locales/tmp', function (Request $request, Response $response)
{
    $archivoSubir = $_FILES["file"];

    $archivo = new Archivo();

    $archivo->nombreTmp = $archivoSubir["tmp_name"];
    $archivo->nombreArchivo = $archivoSubir["name"];
    $archivo->idUsuario = "local";
    $archivo->tipo = "locales";
    $archivo->size = $archivoSubir["size"];

    $response = $response->withJson(Archivo::Subir($archivo));
    return $response->withHeader('Content-type', 'application/json');
});

$app->post('/subir/productos/tmp', function (Request $request, Response $response)
{
    $archivoSubir = $_FILES["file"];

    $archivo = new Archivo();

    $archivo->nombreTmp = $archivoSubir["tmp_name"];
    $archivo->nombreArchivo = $archivoSubir["name"];
    $archivo->idUsuario = "producto";
    $archivo->tipo = "productos";
    $archivo->size = $archivoSubir["size"];

    $response = $response->withJson(Archivo::Subir($archivo));
    return $response->withHeader('Content-type', 'application/json');
});

$app->get('/estadisticas/pedidos/todos', function (Request $request, Response $response)
{
    $pedidos = Pedido::TraerTodosLosPedidosCompleto();

    if (count($pedidos) < 1)
        $pedidos = false;

    $response = $response->withJson($pedidos);

    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->get('/estadisticas/pedidos/usuarios', function (Request $request, Response $response)
{
    $pedidos = Pedido::TraerTodosLosPedidosConSusUsuarios();

    if (count($pedidos) < 1)
        $pedidos = false;

    $response = $response->withJson($pedidos);

    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->get('/estadisticas/pedidos/productos', function (Request $request, Response $response)
{
    $pedidos = Pedido::TraerTodosLosDetallesMasProductos();

    if (count($pedidos) < 1)
        $pedidos = false;

    $response = $response->withJson($pedidos);

    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->get('/estadisticas/encuestas', function (Request $request, Response $response)
{
    $encuestas = Encuesta::TraerTodasLasEncuestas();

    if (count($encuestas) < 1)
        $encuestas = false;

    $response = $response->withJson($encuestas);

    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->get('/estadisticas/ingresos', function (Request $request, Response $response)
{
    $ingresos = Usuario::TraerIngresos();

    if (count($ingresos) < 1)
        $ingresos = false;

    $response = $response->withJson($ingresos);

    return $response->withHeader('Content-type', 'application/json');
})->add(\MWparaAutentificar::class . ':VerificarUsuario');

$app->post('/validar', function (Request $request, Response $response)
{
    date_default_timezone_set('America/Argentina/Buenos_Aires');

    $resultado = new stdclass();
    $resultado->exito = false;

    $arrayConToken = $request->getHeader('HTTP_AUTHORIZATION');
		
	$token = $arrayConToken[0];
	$token = explode(" ", $token)[1];

    try
    {
        $decodificado = JWT::decode(
            $token,
            "example_key",
            ['HS256']
            );
        $resultado->usuario = $decodificado->usuario;
        $usuario = $resultado->usuario;

        $usuarioBaseDeDatos = Usuario::TraerUnUsuarioPorId($usuario->idUsuario);

        if ($usuarioBaseDeDatos == false)
        {
            $resultado->mensaje = "Error en el servidor, conectese mas tarde...";
        }
        else if ($usuarioBaseDeDatos->estado == "0" || $usuario->estado == "0")
        {
            $resultado->mensaje = "Acceso invalido, tu cuenta ha sido deshabilitada!!!";
        }
        else
        {
            $guardarIngreso = new stdclass();
            $guardarIngreso->fecha = strftime("%Y-%m-%d %H:%M:%S", time());
            $guardarIngreso->idUsuario = $usuario->idUsuario;
            $guardarIngreso->email = $usuario->email;
            $guardarIngreso->tipo = $usuario->tipo;

            Usuario::RegistrarIngreso($guardarIngreso);

            $resultado->exito = true;
        }
    } catch (ExpiredException $e) {
        $resultado->mensaje = "Token expirado!!!";
    }

    $response = $response->withJson($resultado);

    return $response->withHeader('Content-type', 'application/json');
});

$app->run();