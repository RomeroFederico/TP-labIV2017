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
        public $estado;
        public $telefono;

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
                $this->estado = $usuario->estado;
                $this->telefono = $usuario->telefono;
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

        public static function ComprobarEmail($email)
        {
    		//IMPLEMENTAR...
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE (email = :email)");

            $consulta->bindValue(':email', $email, PDO::PARAM_STR);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Usuario');
        }

        public static function RegistrarUsuario($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO usuarios (nombre, apellido, email, password, sexo, telefono, direccion, localidad, provincia, pais, img, estado, tipo) 
                                                 VALUES (:Nombre, :Apellido, :Email, :Password, :Sexo, :Telefono, :Direccion, :Localidad, :Provincia, :Pais, :Img, :Estado, :Tipo)");

                //$consulta->bindValue(':Id', $obj->id, PDO::PARAM_INT);
                $consulta->bindValue(':Nombre', $obj->nombre, PDO::PARAM_STR);
                $consulta->bindValue(':Apellido', $obj->apellido, PDO::PARAM_STR);
                $consulta->bindValue(':Email', $obj->email, PDO::PARAM_STR);
                $consulta->bindValue(':Password', $obj->password, PDO::PARAM_STR);
                $consulta->bindValue(':Sexo', $obj->sexo, PDO::PARAM_STR);
                $consulta->bindValue(':Telefono', $obj->telefono, PDO::PARAM_STR);
                $consulta->bindValue(':Direccion', $obj->direccion, PDO::PARAM_STR);
                $consulta->bindValue(':Localidad', $obj->localidad, PDO::PARAM_STR);
                $consulta->bindValue(':Provincia', $obj->provincia, PDO::PARAM_STR);
                $consulta->bindValue(':Pais', $obj->pais, PDO::PARAM_STR);
                $consulta->bindValue(':Img', $obj->img, PDO::PARAM_STR);
                $consulta->bindValue(':Estado', $obj->estado, PDO::PARAM_INT);
                $consulta->bindValue(':Tipo', $obj->tipo, PDO::PARAM_STR);            

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return $objetoAccesoDatos->RetornarUltimoIdInsertado();
        }

        public static function ModificarUsuario($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("UPDATE usuarios SET nombre = :Nombre, apellido = :Apellido, email = :Email, password = :Password, sexo = :Sexo, telefono = :Telefono, direccion = :Direccion, localidad = :Localidad, provincia = :Provincia, pais = :Pais, img = :Img, estado = :Estado, tipo = :Tipo 
                                                                  WHERE (idUsuario = :Id)");

                $consulta->bindValue(':Id', $obj->idUsuario, PDO::PARAM_INT);
                $consulta->bindValue(':Nombre', $obj->nombre, PDO::PARAM_STR);
                $consulta->bindValue(':Apellido', $obj->apellido, PDO::PARAM_STR);
                $consulta->bindValue(':Email', $obj->email, PDO::PARAM_STR);
                $consulta->bindValue(':Password', $obj->password, PDO::PARAM_STR);
                $consulta->bindValue(':Sexo', $obj->sexo, PDO::PARAM_STR);
                $consulta->bindValue(':Telefono', $obj->telefono, PDO::PARAM_STR);
                $consulta->bindValue(':Direccion', $obj->direccion, PDO::PARAM_STR);
                $consulta->bindValue(':Localidad', $obj->localidad, PDO::PARAM_STR);
                $consulta->bindValue(':Provincia', $obj->provincia, PDO::PARAM_STR);
                $consulta->bindValue(':Pais', $obj->pais, PDO::PARAM_STR);
                $consulta->bindValue(':Img', $obj->img, PDO::PARAM_STR);
                $consulta->bindValue(':Estado', $obj->estado, PDO::PARAM_INT);
                $consulta->bindValue(':Tipo', $obj->tipo, PDO::PARAM_STR);            

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
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