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
        public $legajo;

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
                $this->legajo = $usuario->legajo;
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

        public static function BuscarClientePorEmail($email)
        {
    		//IMPLEMENTAR...
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE (email = :email AND tipo = 'Cliente')");

            $consulta->bindValue(':email', $email, PDO::PARAM_STR);

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

        public static function ComprobarLegajo($legajo)
        {
    		//IMPLEMENTAR...
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE (legajo = :legajo)");

            $consulta->bindValue(':legajo', $legajo, PDO::PARAM_INT);

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

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO usuarios (nombre, apellido, email, password, sexo, telefono, direccion, localidad, provincia, pais, img, estado, tipo, legajo) 
                                                 VALUES (:Nombre, :Apellido, :Email, :Password, :Sexo, :Telefono, :Direccion, :Localidad, :Provincia, :Pais, :Img, :Estado, :Tipo, :Legajo)");

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
                $consulta->bindValue(':Legajo', $obj->legajo, PDO::PARAM_INT);              

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
            }

            return $objetoAccesoDatos->RetornarUltimoIdInsertado();
        }

        public static function ModificarUsuario($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("UPDATE usuarios SET nombre = :Nombre, apellido = :Apellido, email = :Email, password = :Password, sexo = :Sexo, telefono = :Telefono, direccion = :Direccion, localidad = :Localidad, provincia = :Provincia, pais = :Pais, img = :Img, estado = :Estado, tipo = :Tipo, legajo = :Legajo 
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
                $consulta->bindValue(':Legajo', $obj->legajo, PDO::PARAM_INT);          

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
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

        public static function TraerTodosLosClientes()
        {
            $usuarios = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE usuarios.tipo = 'Cliente' ORDER BY idUsuario");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Usuario');

            foreach ($consulta as $usuario)
                array_push($usuarios, $usuario);

            return $usuarios;
        }

        public static function TraerTodosLosClientesYEmpleados($idEncargado)
        {
            $usuarios = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("(SELECT *
                                                              FROM usuarios 
                                                              WHERE usuarios.tipo = 'Cliente')
                                                              UNION
                                                              (SELECT usuarios.* 
                                                              FROM usuarios, empleados_local, locales 
                                                              WHERE usuarios.tipo = 'Empleado' AND locales.idUsuario = :IdEncargado AND locales.idLocal = empleados_local.idLocal AND usuarios.idUsuario = empleados_local.idUsuario)
                                                              ORDER BY idUsuario");

            $consulta->bindValue(':IdEncargado', $idEncargado, PDO::PARAM_INT);

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Usuario');

            foreach ($consulta as $usuario)
                array_push($usuarios, $usuario);

            return $usuarios;
        }

        public static function TraerTodosLosEmpleadosLibres()
        {
            $usuarios = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE usuarios.tipo = 'Empleado' AND usuarios.idUsuario NOT IN (SELECT idUsuario from empleados_local) ORDER BY usuarios.idUsuario");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Usuario');

            foreach ($consulta as $usuario)
                array_push($usuarios, $usuario);

            return $usuarios;
        }

        public static function TraerTodosLosEncargadosLibres()
        {
            $usuarios = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios WHERE usuarios.tipo = 'Encargado' AND usuarios.idUsuario NOT IN (SELECT idUsuario from locales) ORDER BY usuarios.idUsuario");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_CLASS|PDO::FETCH_PROPS_LATE, 'Usuario');

            foreach ($consulta as $usuario)
                array_push($usuarios, $usuario);

            return $usuarios;
        }

        public static function TraerTodosLosEmpleadosLocal($idLocal)
        {
            $empleados = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM usuarios, empleados_local WHERE usuarios.idUsuario = empleados_local.idUsuario AND empleados_local.idLocal = :IdLocal");

            $consulta->bindValue(':IdLocal', $idLocal, PDO::PARAM_INT);

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $empleado)
                array_push($empleados, $empleado);

            return $empleados;
        }

        public static function RegistrarIngreso($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO ingresos (idUsuario, email, fecha, tipo) 
                                                 VALUES (:IdUsuario, :Email, :Fecha, :Tipo)");

                $consulta->bindValue(':IdUsuario', $obj->idUsuario, PDO::PARAM_INT);
                $consulta->bindValue(':Email', $obj->email, PDO::PARAM_STR);
                $consulta->bindValue(':Fecha', $obj->fecha, PDO::PARAM_STR);
                $consulta->bindValue(':Tipo', $obj->tipo, PDO::PARAM_STR);            

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return false;
            }

            return $objetoAccesoDatos->RetornarUltimoIdInsertado();
        }

        public static function TraerIngresos()
        {
            $ingresos = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM ingresos ORDER BY fecha DESC");
            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $ingreso)
                array_push($ingresos, $ingreso);

            return $ingresos;
        }
    }

?>