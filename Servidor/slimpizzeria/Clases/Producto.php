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
    }

?>