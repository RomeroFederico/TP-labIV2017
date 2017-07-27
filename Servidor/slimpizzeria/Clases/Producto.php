<?php
    class Producto 
    {
        public $idProducto;
        public $descripcion;
        public $precio;
        public $promocion;
        public $img;
        public $tipo;

        public function __construct($id = NULL)
        {
            if ($id !== NULL)
            {
                $producto = Producto::TraerUnProductoPorId($id);
                $this->idProducto = $id;
                $this->descripcion = $producto->descripcion;
                $this->precio = $producto->precio;
                $this->promocion = $producto->promocion;
                $this->tipo = $producto->tipo;
                $this->img = $producto->img;
            }
        }

        public static function TraerUnProductoPorId($id)
        {
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM productos WHERE (idProducto = :idProducto)");

            $consulta->bindValue(':idProducto', $id, PDO::PARAM_INT);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Producto');
        }

        public static function TraerTodosLosProductos()
        {
            $productos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM productos ORDER BY idProducto");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Producto');

            foreach ($consulta as $producto)
                array_push($productos, $producto);

            return $productos;
        }

        public static function RegistrarProducto($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO productos (descripcion, precio, promocion, tipo, img) 
                                                 VALUES (:Descripcion, :Precio, :Promocion, :Tipo, :Img)");

                $consulta->bindValue(':Descripcion', $obj->descripcion, PDO::PARAM_STR);
                $consulta->bindValue(':Precio', $obj->precio, PDO::PARAM_STR);
                $consulta->bindValue(':Promocion', $obj->promocion, PDO::PARAM_STR);
                $consulta->bindValue(':Tipo', $obj->tipo, PDO::PARAM_STR);
                $consulta->bindValue(':Img', $obj->img, PDO::PARAM_STR);          

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
            }

            return $objetoAccesoDatos->RetornarUltimoIdInsertado();
        }

        public static function ModificarProducto($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("UPDATE productos SET descripcion = :Descripcion, precio = :Precio, promocion = :Promocion, tipo = :Tipo, img = :Img 
                                                                  WHERE (idProducto = :IdProducto)");

                $consulta->bindValue(':IdProducto', $obj->idProducto, PDO::PARAM_INT);                                                  
                $consulta->bindValue(':Descripcion', $obj->descripcion, PDO::PARAM_STR);
                $consulta->bindValue(':Precio', $obj->precio, PDO::PARAM_STR);
                $consulta->bindValue(':Promocion', $obj->promocion, PDO::PARAM_STR);
                $consulta->bindValue(':Tipo', $obj->tipo, PDO::PARAM_STR);
                $consulta->bindValue(':Img', $obj->img, PDO::PARAM_STR);         

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
            }

            return TRUE;
        }

        public static function TraerTodosLosProductosLocal($idLocal)
        {
            $productos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM productos, productos_local WHERE productos.idProducto = productos_local.idProducto AND productos_local.idLocal = :IdLocal");

            $consulta->bindValue(':IdLocal', $idLocal, PDO::PARAM_INT);

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $producto)
                array_push($productos, $producto);

            return $productos;
        }

        public static function TraerListadoProductos($productos)
        {
            $productosTraidos = array();

            $consulta = "";

            for ($i = 0; $i < count($productos); $i++)
            {
                if ($i > 0)
                    $consulta = $consulta . " OR ";
                $consulta = $consulta .  "productos.idProducto = " .  $productos[$i];
            }

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM productos WHERE (" . $consulta . ")");
            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $producto)
                array_push($productosTraidos, $producto);

            return $productosTraidos;
        }
    }

?>