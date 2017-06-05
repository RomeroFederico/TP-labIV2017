<?php

require_once "../Clases/AccesoDatos.php";
require_once "../Clases/Usuario.php";
require_once "../Clases/Producto.php";

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

$app->run();