<?php
    class Pedido 
    {
        public $idPedido;
        public $idCliente;
        public $idLocal;
        public $fechaPedido;
        public $fechaEntrega;
        public $estado;
        public $precioTotal;
        public $cantidad;
        //Agrego la direccion donde se envia.
        public $direccionEnvio;
        public $localidadEnvio;

        public function __construct($id = NULL)
        {
            if ($id !== NULL)
            {
                $pedido = Pedido::TraerUnPedidoPorId($id);
                $this->idPedido = $id;
                $this->idCliente = $pedido->idCliente;
                $this->idLocal = $pedido->idLocal;
                $this->fechaPedido = $pedido->fechaPedido;
                $this->fechaEntrega = $pedido->fechaEntrega;
                $this->estado = $pedido->estado;
                $this->precioTotal = $pedido->precioTotal;
                $this->cantidad = $pedido->cantidad;
                $this->direccionEnvio = $pedido->direccionEnvio;
                $this->localidadEnvio = $pedido->localidadEnvio;
            }
        }

        public static function TraerUnPedidoPorId($id)
        {
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos WHERE (idPedido = :idPedido)");

            $consulta->bindValue(':idPedido', $id, PDO::PARAM_INT);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Pedido');
        }

        public static function RegistrarPedido($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO pedidos (idCliente, idLocal, fechaPedido, estado, precioTotal, cantidad, direccionEnvio, localidadEnvio)
                                                 VALUES (:idCliente, :idLocal, :fechaPedido, :estado, :precioTotal, :cantidad, :direccion, :localidad)");

                //$consulta->bindValue(':Id', $obj->id, PDO::PARAM_INT);
                $consulta->bindValue(':idCliente', $obj->idCliente, PDO::PARAM_INT);
                $consulta->bindValue(':idLocal', $obj->idLocal, PDO::PARAM_INT);
                $consulta->bindValue(':fechaPedido', $obj->fechaPedido, PDO::PARAM_STR);
                $consulta->bindValue(':estado', $obj->estado, PDO::PARAM_STR);
                $consulta->bindValue(':precioTotal', $obj->precioTotal, PDO::PARAM_STR);
                $consulta->bindValue(':cantidad', $obj->cantidad, PDO::PARAM_INT);
                $consulta->bindValue(':direccion', $obj->direccion, PDO::PARAM_STR);
                $consulta->bindValue(':localidad', $obj->localidad, PDO::PARAM_STR);          

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return $objetoAccesoDatos->RetornarUltimoIdInsertado();
        }

        public static function RegistrarDetallePedido($id, $productos)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = "";

                for ($i = 0; $i < count($productos); $i++)
                {
                    $consulta = $consulta .  "(" . $id . ", " . $productos[$i]['producto'] . ", " . $productos[$i]['cantidad'] . ")";
                    if ($i != count($productos) - 1)
                        $consulta = $consulta . ", ";
                }

                $consulta = "INSERT INTO detalles_pedidos (idPedido, idProducto, cantidad) VALUES " . $consulta;

		$miconsulta = $consulta;

                $consulta = $objetoAccesoDatos->RetornarConsulta($consulta);       

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $miconsulta;
            }

            return TRUE;
        }

        public static function FinalizarPedido($idPedido, $fechaEntrega)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("UPDATE pedidos SET estado = 'Recibido', fechaEntrega = :fechaEntrega WHERE (idPedido = :idPedido)");

                $consulta->bindValue(':idPedido', $idPedido, PDO::PARAM_INT); 
                $consulta->bindValue(':fechaEntrega', $fechaEntrega, PDO::PARAM_STR);

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
        }

        public static function TraerTodosLosPedidos()
        {
            $pedidos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos ORDER BY idPedido DESC");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Pedido');

            foreach ($consulta as $pedido)
                array_push($pedidos, $pedido);

            return $pedidos;
        }

        public static function TraerTodosLosPedidosCompleto()
        {
            $pedidos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos, locales WHERE (pedidos.idLocal = locales.idLocal) ORDER BY pedidos.fechaPedido DESC");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Pedido');

            foreach ($consulta as $pedido)
                array_push($pedidos, $pedido);

            return $pedidos;
        }

        public static function TraerTodosLosPedidosConSusUsuarios()
        {
                $pedidos = array();

                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos, usuarios WHERE (pedidos.idCliente = usuarios.idUsuario) ORDER BY pedidos.fechaPedido DESC");

                $consulta->execute();

                $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Pedido');

                foreach ($consulta as $pedido)
                    array_push($pedidos, $pedido);

                return $pedidos;
            
        }

        public static function TraerTodosLosDetallesMasProductos()
        {
                $detalles = array();

                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT productos.*, pedidos.*, detalles_pedidos.cantidad AS cantidadProducto FROM detalles_pedidos, productos, pedidos WHERE (detalles_pedidos.idProducto = productos.idProducto AND detalles_pedidos.idPedido = pedidos.idPedido) ORDER BY pedidos.fechaPedido DESC");

                $consulta->execute();

                $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

                foreach ($consulta as $detalle)
                    array_push($detalles, $detalle);

                return $detalles;
        }

        public static function TraerTodosLosPedidosConSuLocal($idUsuario, $tipo)
        {
            $pedidos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos, locales WHERE (pedidos.idCliente = :idUsuario AND pedidos.idLocal = locales.idLocal AND pedidos.estado = :tipo) ORDER BY pedidos.fechaPedido DESC");

            $consulta->bindValue(':idUsuario', $idUsuario, PDO::PARAM_INT);
            $consulta->bindValue(':tipo', $tipo, PDO::PARAM_STR);

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $pedido)
                array_push($pedidos, $pedido);

            return $pedidos;
        }

        public static function TraerTodosLosPedidosDelLocal($idLocal, $tipo)
        {
            $pedidos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT pedidos.*, locales.*, usuarios.nombre, usuarios.apellido, usuarios.email, usuarios.telefono as telefonoUsuario, usuarios.img as imgUsuario FROM pedidos, locales, usuarios WHERE (pedidos.idCliente = usuarios.idUsuario AND pedidos.idLocal = :IdLocal AND pedidos.idLocal = locales.idLocal AND pedidos.estado = :tipo) ORDER BY pedidos.fechaPedido DESC");

            $consulta->bindValue(':IdLocal', $idLocal, PDO::PARAM_INT);
            $consulta->bindValue(':tipo', $tipo, PDO::PARAM_STR);

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $pedido)
                array_push($pedidos, $pedido);

            return $pedidos;
        }

        public static function TraerTodosLosDetallesConSusProductos($ids)
        {
            $detalles = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = "";

            for ($i = 0; $i < count($ids); $i++)
            {
                if ($i > 0)
                    $consulta = $consulta . " OR ";
                $consulta = $consulta .  "detalles_pedidos.idPedido = " .  $ids[$i];
            }

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM detalles_pedidos, productos WHERE (detalles_pedidos.idProducto = productos.idProducto AND (" . $consulta . "))");
            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $detalle)
                array_push($detalles, $detalle);

            return $detalles;
        }
    }

?>