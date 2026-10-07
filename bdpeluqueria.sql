-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-10-2026 a las 23:12:04
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
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `idcita` int(11) NOT NULL,
  `idcliente` int(11) NOT NULL,
  `idhorario` int(11) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'ACTIVA',
  `idhorario_activo` int(11) GENERATED ALWAYS AS (if(`estado` = 'ACTIVA',`idhorario`,NULL)) VIRTUAL
) ;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`idcita`, `idcliente`, `idhorario`, `estado`) VALUES
(1, 1, 1, 'ACTIVA'),
(2, 2, 2, 'ACTIVA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `idcliente` int(11) NOT NULL,
  `tipoDocumento` varchar(3) NOT NULL,
  `numeroDocumento` varchar(10) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(10) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` varchar(10) NOT NULL DEFAULT 'Activo'
) ;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`idcliente`, `tipoDocumento`, `numeroDocumento`, `nombres`, `direccion`, `telefono`, `correo`, `contrasena`, `estado`) VALUES
(1, 'CC', '12345678', 'Juan Perez', 'Calle 10 # 20-30', '3001234567', 'juan123@gmail.com', '$2b$10$NZPHD1IVzhvm.QTMABpfJ.CHLu33OvLPC8jheSSuv05jDVHvaWWtC', 'Activo'),
(2, 'CE', '25865254', 'David Tellez', 'cal 1 # 2 4', '3131234569', 'Elmejor@gmail.com', '$2b$10$.8C.0PIUl/W3QHx97BXMlefC6hZXubO5jLyxS6knAKq60VFu0/ORK', 'Activo'),
(10, 'CC', '33333333', 'Cliente Prueba', 'Calle 30 # 30-30', '3030303030', 'cliente@gmail.com', '$2b$10$oUu1NdiM5zbKyHqBzhj43e.S4Gw1V0z3FnTkIOehj9m5Tr.gKTb.a', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `idhorario` int(11) NOT NULL,
  `idtrabajador` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `horaInicio` time NOT NULL,
  `horaFin` time NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'DISPONIBLE'
) ;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`idhorario`, `idtrabajador`, `fecha`, `horaInicio`, `horaFin`, `estado`) VALUES
(1, 1, '2026-09-28', '08:00:00', '10:00:00', 'RESERVADO'),
(2, 2, '2026-09-28', '08:00:00', '10:00:00', 'RESERVADO'),
(3, 3, '2026-09-28', '08:00:00', '10:00:00', 'DISPONIBLE'),
(4, 4, '2026-09-28', '08:00:00', '10:00:00', 'DISPONIBLE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajadores`
--

CREATE TABLE `trabajadores` (
  `idtrabajador` int(11) NOT NULL,
  `tipoDocumento` varchar(3) NOT NULL,
  `numeroDocumento` varchar(10) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(10) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `estado` varchar(10) NOT NULL DEFAULT 'Activo'
) ;

--
-- Volcado de datos para la tabla `trabajadores`
--

INSERT INTO `trabajadores` (`idtrabajador`, `tipoDocumento`, `numeroDocumento`, `nombres`, `direccion`, `telefono`, `correo`, `contrasena`, `rol`, `estado`) VALUES
(1, 'CC', '1098765433', 'Pedro Trabajador', 'Calle 15 # 20-30', '3001234568', 'pedrotrabajador@gmail.com', '$2b$10$UpFxhnRGoeYF7L0OOWvr1.lNEHcDVds8Bg1tYJvkprcfKnjKll1XC', 'trabajador', 'Activo'),
(2, 'CC', '1098765434', 'Maria Gomez', 'Carrera 5 # 10-20', '3001234570', 'mariagomez@gmail.com', '$2b$10$UpFxhnRGoeYF7L0OOWvr1.lNEHcDVds8Bg1tYJvkprcfKnjKll1XC', 'trabajador', 'Activo'),
(3, 'CC', '1070971265', 'Guillermo Ortiz', 'cal 1 # 2 3', '3131234567', '123@gmail.com', '$2b$10$ZSP8AO5tx.qz06011YBoE..tye1.OrFdHfYx03WFR5E5RKU6/8ccS', 'trabajador', 'Activo'),
(4, 'CC', '1111111111', 'Pepito Perez', 'cal 1 # 2 4', '3131234568', 'pepito@gmail.com', '$2b$10$UpFxhnRGoeYF7L0OOWvr1.lNEHcDVds8Bg1tYJvkprcfKnjKll1XC', 'admin', 'Activo');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`idcita`),
  ADD UNIQUE KEY `uq_citas_horario_activo` (`idhorario_activo`),
  ADD KEY `idx_citas_cliente` (`idcliente`),
  ADD KEY `idx_citas_horario` (`idhorario`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`idcliente`),
  ADD UNIQUE KEY `uq_clientes_correo` (`correo`),
  ADD UNIQUE KEY `uq_clientes_documento` (`numeroDocumento`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`idhorario`),
  ADD KEY `idx_horarios_trabajador` (`idtrabajador`);

--
-- Indices de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD PRIMARY KEY (`idtrabajador`),
  ADD UNIQUE KEY `uq_trabajadores_correo` (`correo`),
  ADD UNIQUE KEY `uq_trabajadores_documento` (`numeroDocumento`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `idcita` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `idcliente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `idhorario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  MODIFY `idtrabajador` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`idcliente`) REFERENCES `clientes` (`idcliente`),
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`idhorario`) REFERENCES `horarios` (`idhorario`);

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`idtrabajador`) REFERENCES `trabajadores` (`idtrabajador`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
