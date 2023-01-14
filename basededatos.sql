SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `gauto` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `gauto`;

CREATE TABLE `estados` (
  `idestado` int(11) NOT NULL,
  `nombreestado` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `imagenes` (
  `idtrabajo` varchar(255) NOT NULL,
  `idimagen` varchar(255) NOT NULL,
  `imagen` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `localidades` (
  `idlocalidad` int(11) NOT NULL,
  `idprovincia` int(11) NOT NULL,
  `nombrelocalidad` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `provincias` (
  `idprovincia` int(10) NOT NULL,
  `nombreprovincia` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `tipos` (
  `idtipo` int(11) NOT NULL,
  `nombretipo` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `trabajos` (
  `id` varchar(255) NOT NULL,
  `fechacreacion` datetime NOT NULL,
  `latitud` text NOT NULL,
  `longitud` text NOT NULL,
  `localidad` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  `cliente` text NOT NULL,
  `telefono` text NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `estados`
  ADD PRIMARY KEY (`idestado`);

ALTER TABLE `imagenes`
  ADD PRIMARY KEY (`idimagen`);

ALTER TABLE `localidades`
  ADD PRIMARY KEY (`idlocalidad`);

ALTER TABLE `provincias`
  ADD PRIMARY KEY (`idprovincia`);

ALTER TABLE `tipos`
  ADD PRIMARY KEY (`idtipo`);

ALTER TABLE `trabajos`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `localidades`
  MODIFY `idlocalidad` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `provincias`
  MODIFY `idprovincia` int(10) NOT NULL AUTO_INCREMENT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
