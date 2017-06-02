<?php
    class Usuario 
    {
        public $idUsuario;
        public $nombre;
        public $apellido;
        public $sexo;
        public $email;
        public $password;
        public $tipo;
        public $direccion;
        public $localidad;
        public $provincia;
        public $pais;
        public $img;

        public function __construct($id = NULL)
        {
            if ($id !== NULL)
            {
                $usuario = Usuario::TraerUnUsuarioPorId($id);
                $this->idUsario = $id;
                $this->nombre = $usuario->nombre;
                $this->apellido = $usuario->apellido;
                $this->sexo = $usuario->sexo;
                $this->email = $usuario->email;
                $this->password = $usuario->password;
                $this->tipo = $usuario->tipo;
                $this->direccion = $usuario->direccion;
                $this->localidad = $usuario->localidad;
                $this->provincia = $usuario->provincia;
                $this->pais = $usuario->pais;
                $this->img = $usuario->img;
            }
        }

        public static function TraerUnUsuarioPorId($id)
        {
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE (idUsuario = :idUsuario)");

            $consulta->bindValue(':idUsuario', $id, PDO::PARAM_INT);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Usuario');
        }

        public static function TraerUsuarioLogueado($obj)
        {
    		//IMPLEMENTAR...
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE (email = :email AND password = :password)");

            $consulta->bindValue(':email', $obj->email, PDO::PARAM_STR);
            $consulta->bindValue(':password', $obj->password, PDO::PARAM_STR);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Usuario');
        }

        public static function TraerTodosLosUsuarios()
        {
            $usuarios = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios ORDER BY idUsuario");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Usuario');

            foreach ($consulta as $usuario)
                array_push($usuarios, $usuario);

            return $usuarios;
        }
    }

?>