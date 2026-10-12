-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-10-2026 a las 23:06:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bdpeluqueria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `idCliente` int(11) NOT NULL,
  `tipoDocumento` varchar(3) NOT NULL,
  `numeroDocumento` varchar(10) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(10) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` varchar(10) NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`idCliente`, `tipoDocumento`, `numeroDocumento`, `nombres`, `direccion`, `telefono`, `correo`, `contrasena`, `estado`) VALUES
(1, 'CC', '12345678', 'Juan Perez', 'Calle 10 # 20-30', '3001234567', 'juan123@gmail.com', '$2b$10$NZPHD1IVzhvm.QTMABpfJ.CHLu33OvLPC8jheSSuv05jDVHvaWWtC', 'Activo'),
(2, 'CE', '25865254', 'David Tellez', 'cal 1 # 2 4', '3131234569', 'Elmejor@gmail.com', '$2b$10$.8C.0PIUl/W3QHx97BXMlefC6hZXubO5jLyxS6knAKq60VFu0/ORK', 'Activo'),
(3, 'CC', '33333333', 'Cliente Prueba', 'Calle 30 # 30-30', '3030303030', 'cliente@gmail.com', '$2b$10$oUu1NdiM5zbKyHqBzhj43e.S4Gw1V0z3FnTkIOehj9m5Tr.gKTb.a', 'Activo'),
(4, 'CC', '33333335', 'Cliente Nuevo', 'Calle 30 # 30-38', '3030303035', 'cliente6@gmail.com', '$2b$10$7mmAE9IAvaS3Pvx8FEA2VemCqaOKa5MsR1bRysfYNSxN0creB0Ugu', 'Activo'),
(5, 'CC', '33333355', 'Cliente Prueba', 'Calle 30 # 30-38', '3030303035', 'cliente67@gmail.com', '$2b$10$SOnxZIIjI9TE10fcrj8DCOTsxNg2eXIfnMKQz8LIpCFF/Ib/swK7q', 'Inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `idHorario` int(11) NOT NULL,
  `fecha` varchar(10) NOT NULL,
  `horaInicio` varchar(10) NOT NULL,
  `horaFinal` varchar(10) NOT NULL,
  `estado` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`idHorario`, `fecha`, `horaInicio`, `horaFinal`, `estado`) VALUES
(1, '2026-10-10', '7:00 am', '8:00 am', 'Inactivo'),
(2, '2026-10-10', '8:00 am', '9:00 am', 'Inactivo'),
(3, '2026-10-10', '9:00 am', '10:00 am', 'Inactivo'),
(4, '2026-10-10', '10:00 am', '11:00 am', 'Inactivo'),
(5, '2026-10-10', '11:00 am', '12:00 m', 'Inactivo'),
(6, '2026-10-10', '1:00 pm', '2:00 pm', 'Inactivo'),
(7, '2026-10-10', '2:00 pm', '3:00 pm', 'Inactivo'),
(8, '2026-10-10', '3:00 pm', '4:00 pm', 'Activo'),
(9, '2026-10-10', '4:00 pm', '5:00 pm', 'Activo'),
(10, '2026-10-10', '5:00 pm', '6:00 pm', 'Activo'),
(11, '2026-10-10', '6:00 pm', '7:00 pm', 'Activo'),
(12, '2026-10-10', '7:00 pm', '8:00 pm', 'Activo'),
(13, '2026-10-10', '8:00 pm', '9:00 pm', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reghorarios`
--

CREATE TABLE `reghorarios` (
  `idRegHorario` int(11) NOT NULL,
  `idHorario` int(11) NOT NULL,
  `idTrabajador` int(11) NOT NULL,
  `estado` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reghorarios`
--

INSERT INTO `reghorarios` (`idRegHorario`, `idHorario`, `idTrabajador`, `estado`) VALUES
(1, 1, 1, 'Inactivo'),
(2, 2, 1, 'Inactivo'),
(3, 3, 1, 'Inactivo'),
(4, 4, 1, 'Inactivo'),
(5, 5, 1, 'Inactivo'),
(6, 6, 1, 'Inactivo'),
(7, 7, 1, 'Inactivo'),
(8, 8, 1, 'Activo'),
(9, 9, 1, 'Activo'),
(10, 10, 1, 'Activo'),
(11, 11, 1, 'Activo'),
(12, 12, 1, 'Activo'),
(13, 13, 1, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajadores`
--

CREATE TABLE `trabajadores` (
  `idTrabajador` int(11) NOT NULL,
  `tipoDocumento` varchar(3) NOT NULL,
  `numeroDocumento` varchar(10) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(10) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `estado` varchar(10) NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajadores`
--

INSERT INTO `trabajadores` (`idTrabajador`, `tipoDocumento`, `numeroDocumento`, `nombres`, `direccion`, `telefono`, `correo`, `contrasena`, `rol`, `estado`) VALUES
(1, 'CC', '1098765433', 'Pedro Trabajador', 'Calle 15 # 20-30', '3001234568', 'pedrotrabajador@gmail.com', '$2b$10$UpFxhnRGoeYF7L0OOWvr1.lNEHcDVds8Bg1tYJvkprcfKnjKll1XC', 'trabajador', 'Activo'),
(2, 'CC', '1098765434', 'Maria Gomez', 'Carrera 5 # 10-20', '3001234570', 'mariagomez@gmail.com', '$2b$10$UpFxhnRGoeYF7L0OOWvr1.lNEHcDVds8Bg1tYJvkprcfKnjKll1XC', 'trabajador', 'Activo'),
(3, 'CC', '1070971265', 'Guillermo Ortiz', 'cal 1 # 2 3', '3131234567', '123@gmail.com', '$2b$10$ZSP8AO5tx.qz06011YBoE..tye1.OrFdHfYx03WFR5E5RKU6/8ccS', 'trabajador', 'Activo'),
(4, 'CC', '1111111111', 'Pepito Perez', 'cal 1 # 2 4', '3131234568', 'pepito@gmail.com', '$2b$10$UpFxhnRGoeYF7L0OOWvr1.lNEHcDVds8Bg1tYJvkprcfKnjKll1XC', 'admin', 'Activo'),
(5, 'CC', '55555555', 'Admin Prueba', 'Calle 50 # 50-50', '5050505050', 'admin@gmail.com', '$2b$10$Fx9Vo94gmZzsU/kjmScrCOJ3vY/U4fsL4ceB2mnK8oxQKYESTNwnC', 'admin', 'Activo');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`idCliente`),
  ADD UNIQUE KEY `uq_clientes_correo` (`correo`),
  ADD UNIQUE KEY `uq_clientes_documento` (`numeroDocumento`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`idHorario`);

--
-- Indices de la tabla `reghorarios`
--
ALTER TABLE `reghorarios`
  ADD PRIMARY KEY (`idRegHorario`),
  ADD KEY `idHorario` (`idHorario`),
  ADD KEY `idTrabajador` (`idTrabajador`);

--
-- Indices de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD PRIMARY KEY (`idTrabajador`),
  ADD UNIQUE KEY `uq_trabajadores_correo` (`correo`),
  ADD UNIQUE KEY `uq_trabajadores_documento` (`numeroDocumento`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `idHorario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `reghorarios`
--
ALTER TABLE `reghorarios`
  MODIFY `idRegHorario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  MODIFY `idTrabajador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reghorarios`
--
ALTER TABLE `reghorarios`
  ADD CONSTRAINT `fk_reghorarios_horarios` FOREIGN KEY (`idHorario`) REFERENCES `horarios` (`idHorario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reghorarios_trabajadores` FOREIGN KEY (`idTrabajador`) REFERENCES `trabajadores` (`idTrabajador`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
