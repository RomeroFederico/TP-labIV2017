<?php
    class Encuesta 
    {

        public function __construct()
        {

        }

        public static function TraerEncuestaPorId($id)
        {
    		//IMPLEMENTAR...
            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM encuestas WHERE (idEncuesta = :idEncuesta)");

            $consulta->bindValue(':idEncuesta', $id, PDO::PARAM_INT);

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            $consulta->execute();

            if ($consulta->rowCount() != 1)
                return false;

            return $consulta;
        }

        public static function RegistrarEncuesta($obj)
        {
            try
            {
                $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

                $consulta = $objetoAccesoDatos->RetornarConsulta("INSERT INTO encuestas (pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9, pregunta10, 
                                                                                         pregunta11, pregunta12, pregunta13, pregunta14, pregunta15, pregunta16, pregunta17, pregunta18, pregunta19, pregunta20,
                                                                                         fecha, img1, img2, img3) 
                                                 VALUES (:pregunta1, :pregunta2, :pregunta3, :pregunta4, :pregunta5, :pregunta6, :pregunta7, :pregunta8, :pregunta9, :pregunta10, 
                                                         :pregunta11, :pregunta12, :pregunta13, :pregunta14, :pregunta15, :pregunta16, :pregunta17, :pregunta18, :pregunta19, :pregunta20,
                                                         :fecha, :img1, :img2, :img3)");

                //$consulta->bindValue(':Id', $obj->id, PDO::PARAM_INT);
                $consulta->bindValue(':pregunta1', $obj->pregunta1, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta2', $obj->pregunta2, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta3', $obj->pregunta3, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta4', $obj->pregunta4, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta5', $obj->pregunta5, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta6', $obj->pregunta6, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta7', $obj->pregunta7, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta8', $obj->pregunta8, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta9', $obj->pregunta9, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta10', $obj->pregunta10, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta11', $obj->pregunta11, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta12', $obj->pregunta12, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta13', $obj->pregunta13, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta14', $obj->pregunta14, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta15', $obj->pregunta15, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta16', $obj->pregunta16, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta17', $obj->pregunta17, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta18', $obj->pregunta18, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta19', $obj->pregunta19, PDO::PARAM_STR);
                $consulta->bindValue(':pregunta20', $obj->pregunta20, PDO::PARAM_STR);   
                $consulta->bindValue(':fecha', $obj->fecha, PDO::PARAM_STR);
                $consulta->bindValue(':img1', $obj->img1, PDO::PARAM_STR);
                $consulta->bindValue(':img2', $obj->img2, PDO::PARAM_STR);
                $consulta->bindValue(':img3', $obj->img3, PDO::PARAM_STR);      

                $consulta->execute();
            }
            catch (Exception $e) 
            {
                return FALSE;
            }

            return TRUE;
        }

        public static function TraerTodasLasEncuestas()
        {
            $encuestas = array();

            $objetoAccesoDatos = AccesoDatos::dameUnObjetoAcceso();

            $consulta = $objetoAccesoDatos->RetornarConsulta("SELECT * FROM encuestas ORDER BY fecha DESC");

            $consulta->execute();

            $consulta->setFetchMode(PDO::FETCH_ASSOC|PDO::FETCH_PROPS_LATE);

            foreach ($consulta as $encuesta)
                array_push($encuestas, $encuesta);

            return $encuestas;
        }
    }

?>