<?php
    class AccesoDatos
    {
        private static $_objetoAccesoDatos;
        private $_objetoPDO;

        private function __construct()
        {
            try 
            {
                $this->_objetoPDO = new PDO('mysql:host=localhost;dbname=tp_pizzeria;charset=utf8', 'root', '', array(PDO::ATTR_EMULATE_PREPARES => false,PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
                //$this->_objetoPDO = new PDO('mysql:host=sql105.eshost.com.ar;dbname=eshos_19178150_login_pdo;charset=utf8', 'eshos_19178150', 'bloodyte', array(PDO::ATTR_EMULATE_PREPARES => false,PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
                //$this->_objetoPDO = new PDO('mysql:host=mysql.hostinger.com.ar;dbname=u875660301_login;charset=utf8', 'u875660301_fede', 'bloodyte', array(PDO::ATTR_EMULATE_PREPARES => false,PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

                $this->_objetoPDO->exec("SET CHARACTER SET utf8");
            } 
            catch (PDOException $e) 
            {
     
                print "Error!!!<br/>" . $e->getMessage();
                die();
            }
        }
     
        public function RetornarConsulta($sql)
        { 
    		//IMPLEMENTAR...
            return $this->_objetoPDO->prepare($sql);
        }
        
        public function RetornarUltimoIdInsertado()
        { 
    		//IMPLEMENTAR...
            return $this->_objetoPDO->lastInsertId();
        }
     
        public static function dameUnObjetoAcceso()
        { 
    		//IMPLEMENTAR...
            if (!isset(self::$_objetoAccesoDatos)) {       
                self::$_objetoAccesoDatos = new AccesoDatos(); 
            }

            return self::$_objetoAccesoDatos;  
        }
     
        public function __clone()
        { 
     		//IMPLEMENTAR...
            trigger_error('La clonaci&oacute;n de este objeto no est&aacute; permitida!!!', E_USER_ERROR);
        }
    }
?>