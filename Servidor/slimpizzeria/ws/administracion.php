<?php

require_once "../Clases/AccesoDatos.php";
require_once "../Clases/Usuario.php";
require_once "../Clases/Producto.php";
require_once "../Clases/Local.php";

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

$app->run();