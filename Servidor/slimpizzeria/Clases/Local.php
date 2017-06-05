<?php
    class Local 
    {
        public $idLocal;
        public $idUsuario;
        public $img1;
        public $img2;
        public $img3;
        public $direccion;
        public $localidad;
        public $provincia;
        public $pais;
        public $capacidad;
        public $telefono;

        public function __construct($id = NULL)
        {
            if ($id !== NULL)
            {
                $local = Local::TraerUnLocalPorId($id);
                $this->idLocal = $id;
                $this->idUsuario = $local->idUsuario;
                $this->img1 = $local->img1;
                $this->img2 = $local->img2;
                $this->img2 = $local->img3;
                $this->direccion = $local->direccion;
                $this->localidad = $local->localidad;
                $this->provincia = $local->provincia;
                $this->pais = $local->pais;
                $this->capacidad = $local->capacidad;
                $this->telefono = $local->telefono;
            }
        }

        public static function TraerUnLocalPorId($id)
        {
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM locales WHERE (idLocal = :idLocal)");

            $consulta->bindValue(':idLocal', $id, PDO::PARAM_INT);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Local');
        }

        public static function TraerTodosLosLocales()
        {
            $locales = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM locales ORDER BY idLocal");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Local');

            foreach ($consulta as $local)
                array_push($locales, $local);

            return $locales;
        }
    }

?>