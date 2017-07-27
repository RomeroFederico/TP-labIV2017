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

        public static function RegistrarLocal($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO locales (idUsuario, img1, img2, img3, telefono, capacidad, direccion, localidad, provincia, pais) 
                                                 VALUES (:IdUsuario, :Img1, :Img2, :Img3, :Telefono, :Capacidad, :Direccion, :Localidad, :Provincia, :Pais)");

                $consulta->bindValue(':IdUsuario', $obj->idUsuario, PDO::PARAM_INT);
                $consulta->bindValue(':Img1', $obj->img1, PDO::PARAM_STR);
                $consulta->bindValue(':Img2', $obj->img2, PDO::PARAM_STR);
                $consulta->bindValue(':Img3', $obj->img3, PDO::PARAM_STR);
                $consulta->bindValue(':Telefono', $obj->telefono, PDO::PARAM_STR);
                $consulta->bindValue(':Capacidad', $obj->capacidad, PDO::PARAM_INT);
                $consulta->bindValue(':Direccion', $obj->direccion, PDO::PARAM_STR);
                $consulta->bindValue(':Localidad', $obj->localidad, PDO::PARAM_STR);
                $consulta->bindValue(':Provincia', $obj->provincia, PDO::PARAM_STR);
                $consulta->bindValue(':Pais', $obj->pais, PDO::PARAM_STR);             

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
            }

            return $objetoAccesoDatos->RetornarUltimoIdInsertado();
        }

        public static function ModificarLocal($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("UPDATE locales SET idUsuario = :IdUsuario, img1 = :Img1, img2 = :Img2, img3 = :Img3, telefono = :Telefono, capacidad = :Capacidad, direccion = :Direccion, localidad = :Localidad, provincia = :Provincia, pais = :Pais  
                                                                  WHERE (idLocal = :IdLocal)");
                                                                  
                $consulta->bindValue(':IdLocal', $obj->idLocal, PDO::PARAM_INT);
                $consulta->bindValue(':IdUsuario', $obj->idUsuario, PDO::PARAM_INT);
                $consulta->bindValue(':Img1', $obj->img1, PDO::PARAM_STR);
                $consulta->bindValue(':Img2', $obj->img2, PDO::PARAM_STR);
                $consulta->bindValue(':Img3', $obj->img3, PDO::PARAM_STR);
                $consulta->bindValue(':Telefono', $obj->telefono, PDO::PARAM_STR);
                $consulta->bindValue(':Capacidad', $obj->capacidad, PDO::PARAM_INT);
                $consulta->bindValue(':Direccion', $obj->direccion, PDO::PARAM_STR);
                $consulta->bindValue(':Localidad', $obj->localidad, PDO::PARAM_STR);
                $consulta->bindValue(':Provincia', $obj->provincia, PDO::PARAM_STR);
                $consulta->bindValue(':Pais', $obj->pais, PDO::PARAM_STR);         

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
            }

            return TRUE;
        }

        public static function EliminarEmpleados($id)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("DELETE FROM empleados_local WHERE (idLocal = :IdLocal)");     

                $consulta->bindValue(':IdLocal', $id, PDO::PARAM_INT);  

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return $e;
            }

            return TRUE;
        }

        public static function RegistrarEmpleado($idLocal , $idEmpleado)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = "INSERT INTO empleados_local (idLocal, idUsuario) VALUES (" . $idLocal . ", " . $idEmpleado . ") ";

                $consulta = $objetoAccesoDatos->RetornarConsulta($consulta);       

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
        }

        public static function RegistrarEmpleados($id , $empleados)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = "";

                for ($i = 0; $i < count($empleados); $i++)
                {
                    $consulta = $consulta .  "(" . $id . ", " . $empleados[$i] . ")";
                    if ($i != count($empleados) - 1)
                        $consulta = $consulta . ", ";
                }

                $consulta = "INSERT INTO empleados_local (idLocal, idUsuario) VALUES " . $consulta;

                $consulta = $objetoAccesoDatos->RetornarConsulta($consulta);       

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
        }

        public static function EliminarProductos($id)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("DELETE FROM productos_local WHERE (idLocal = :IdLocal)");     

                $consulta->bindValue(':IdLocal', $id, PDO::PARAM_INT);  

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
        }

        public static function RegistrarProducto($idLocal , $idProducto)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = "INSERT INTO productos_local (idLocal, idProducto) VALUES (" . $idLocal . ", " . $idProducto . ") ";

                $consulta = $objetoAccesoDatos->RetornarConsulta($consulta);       

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
        }

        public static function RegistraProductos($id , $productos)
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

                $consulta = "INSERT INTO productos_local (idLocal, idProducto) VALUES " . $consulta;

                $consulta = $objetoAccesoDatos->RetornarConsulta($consulta);       

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
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

        public static function TraerLocalConEmpleado($empleado)
        {
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT locales.*, usuarios.idUsuario, usuarios.nombre, usuarios.apellido,
                                                              usuarios.sexo, usuarios.email, usuarios.telefono as telefonoUsuario, usuarios.legajo, 
                                                              usuarios.direccion as direccionUsuario, usuarios.localidad as localidadUsuario,
                                                              usuarios.provincia as provinciaUsuario, usuarios.pais as paisUsuario, usuarios.img as usuarioImg  
                                                              FROM locales, empleados_local, usuarios 
                                                              WHERE (locales.idUsuario = usuarios.idUsuario AND locales.idLocal = empleados_local.idLocal AND empleados_local.idUsuario = :idUsuario)");

            $consulta->bindValue(':idUsuario', $empleado->idUsuario, PDO::PARAM_INT);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Local');
        }

        public static function TraerLocalConGerente($gerente)
        {
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM locales WHERE (locales.idUsuario = :idUsuario)");

            $consulta->bindValue(':idUsuario', $gerente->idUsuario, PDO::PARAM_INT);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta->fetchObject('Local');
        }

        public static function TraerTodosLosLocalesConSuGerente()
        {
            $locales = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT locales.*, usuarios.idUsuario, usuarios.nombre, usuarios.apellido,
                                                              usuarios.sexo, usuarios.email, usuarios.telefono as telefonoUsuario, usuarios.legajo, 
                                                              usuarios.direccion as direccionUsuario, usuarios.localidad as localidadUsuario,
                                                              usuarios.provincia as provinciaUsuario, usuarios.pais as paisUsuario, usuarios.img as usuarioImg 
                                                              FROM locales, usuarios
                                                              WHERE locales.idUsuario = usuarios.idUsuario
                                                              ORDER BY idLocal");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $local)
                array_push($locales, $local);

            return $locales;
        }

        public static function TraerTodosLosLocalesPorProductos()
        {
            $locales = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT locales.direccion, locales.localidad, productos_local.idProducto, locales.idLocal FROM locales, productos_local WHERE locales.idLocal = productos_local.idLocal");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $local)
                array_push($locales, $local);

            return $locales;
        }
    }

?>