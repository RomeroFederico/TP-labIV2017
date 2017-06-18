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

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO pedidos (idCliente, idLocal, fechaPedido, estado, precioTotal, cantidad)
                                                 VALUES (:idCliente, :idLocal, :fechaPedido, :estado, :precioTotal, :cantidad)");

                //$consulta->bindValue(':Id', $obj->id, PDO::PARAM_INT);
                $consulta->bindValue(':idCliente', $obj->idCliente, PDO::PARAM_INT);
                $consulta->bindValue(':idLocal', $obj->idLocal, PDO::PARAM_INT);
                $consulta->bindValue(':fechaPedido', $obj->fechaPedido, PDO::PARAM_STR);
                $consulta->bindValue(':estado', $obj->estado, PDO::PARAM_STR);
                $consulta->bindValue(':precioTotal', $obj->precioTotal, PDO::PARAM_STR);
                $consulta->bindValue(':cantidad', $obj->cantidad, PDO::PARAM_INT);          

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
                    $consulta = $consulta .  "(" . $id . ", " . $productos[$i] . ")";
                    if ($i != count($productos) - 1)
                        $consulta = $consulta . ", ";
                }

                $consulta = "INSERT INTO detalles_pedidos (idPedido, idProducto) VALUES " . $consulta;

                $consulta = $objetoAccesoDatos->RetornarConsulta($consulta);       

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
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

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos ORDER BY idPedido");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Pedido');

            foreach ($consulta as $pedido)
                array_push($pedidos, $pedido);

            return $pedidos;
        }

        public static function TraerTodosLosPedidosConSuLocal($idUsuario, $tipo)
        {
            $pedidos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM pedidos, locales WHERE (pedidos.idCliente = :idUsuario AND pedidos.idLocal = locales.idLocal AND pedidos.estado = :tipo) ORDER BY pedidos.fechaPedido");

            $consulta->bindValue(':idUsuario', $idUsuario, PDO::PARAM_INT);
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