<?php

require_once "../Clases/AccesoDatos.php";
require_once "../Clases/Usuario.php";
require_once "../Clases/Producto.php";
require_once "../Clases/Local.php";
require_once "../Clases/Pedido.php";
require_once "../Clases/Encuesta.php";
require_once "../Clases/ManejoDeArchivo.php";

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

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*') //La pagina donde este alojado.
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
//Fin Evitar Problemas Con CORS

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
        $resultado->exito = true;

        //JWT
        $key = "example_key";
        $token = array(
            "iss" => "http://example.org",
            "aud" => "http://example.com",
            "iat" => 1356999524,
            "nbf" => 1357000000,
            "usuario" => $usuarioLogin
        );

        $resultado->token = JWT::encode($token, $key);
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

$app->get('/locales', function (Request $request, Response $response)
{
    $locales = Local::TraerTodosLosLocalesConSuGerente();

    if (count($locales) < 1)
        $locales = false;

    $response = $response->withJson($locales);

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

$app->post('/registrar', function (Request $request, Response $response)
{
    $email = $request->getParams()['email'];
    $usuarioTraido = Usuario::ComprobarEmail($email);

    $resultado = new stdclass();
    $resultado->exito = false;

    if ($usuarioTraido == false)
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
    
        $exitoAlRegistrar = Usuario::RegistrarUsuario($usuarioAlta);
        
        if ($exitoAlRegistrar === false)
            $resultado->mensaje = "Error en el alta de usuario.";
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
        $resultado->mensaje = "Ya se ha ingresado un usuario con el email indicado.";

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

    $resultado = new stdclass();
    $resultado->exito = false;

    $resultadoPedido = Pedido::RegistrarPedido($miPedido);

    if ($resultadoPedido)
    {
        $resultado->id = $resultadoPedido;

        $resultadoDetallePedido = Pedido::RegistrarDetallePedido($resultado->id, $miPedido->productos);

        if ($resultadoDetallePedido)
        {
            $resultado->exito = true;
            $resultado->mensaje = "Pedido registrado con exito.";
        }
        else
            $resultado->mensaje = "Ocurrio un problema al querer registrar los detalled del pedido.";
    }
    else
        $resultado->mensaje = "Ocurrio un problema al querer registrar el pedido.";

    $response = $response->withJson($resultado);
    return $response->withHeader('Content-type', 'application/json');
});

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
});

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
});

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
});

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

$app->run();