-- 1. Crear la base de datos si no existe y usarla
CREATE DATABASE IF NOT EXISTS `urbano_db`;
USE `urbano_db`;

-- 2. Tabla CATEGORIAS
CREATE TABLE IF NOT EXISTS `categoria` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL UNIQUE,
  `imagen_portada` VARCHAR(255),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 3. Tabla USUARIOS
CREATE TABLE IF NOT EXISTS `Usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `altura_cm` INT,
  `peso_kg` DECIMAL(5,2),
  `rol` ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 4. Tabla PRODUCTOS
CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `precio` DECIMAL(10,2) NOT NULL,
  `es_nuevo` TINYINT(1) DEFAULT 0,
  `destacado` TINYINT(1) DEFAULT 0,
  `categoria_id` INT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla IMAGENES
CREATE TABLE IF NOT EXISTS `ImagenProductos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(255) NOT NULL,
  `es_principal` TINYINT(1) DEFAULT 0,
  `producto_id` INT,
  PRIMARY KEY (`id`),
  CONSTRAINT `imagenproductos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla VARIANTES
CREATE TABLE IF NOT EXISTS `VariantePrendas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `talle` VARCHAR(50) NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `sku` VARCHAR(100) UNIQUE,
  `imagen_vton_url` VARCHAR(255),
  `producto_id` INT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `varianteprendas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Tabla CARRITOS
CREATE TABLE IF NOT EXISTS `Carritos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `estado` ENUM('activo', 'procesando_pago', 'completado', 'abandonado') DEFAULT 'activo',
  `total` DECIMAL(10,2) DEFAULT 0.00,
  `usuario_id` INT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Tabla ITEM_CARRITO
CREATE TABLE IF NOT EXISTS `ItemCarritos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cantidad` INT NOT NULL DEFAULT 1,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `carrito_id` INT,
  `variante_id` INT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `itemcarritos_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `Carritos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `itemcarritos_ibfk_2` FOREIGN KEY (`variante_id`) REFERENCES `VariantePrendas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- PROCEDIMIENTO PARA AGREGAR "ROL" SI LA TABLA YA EXISTÍA
-- ==========================================================
DROP PROCEDURE IF EXISTS AddRolColumn;
DELIMITER //
CREATE PROCEDURE AddRolColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'urbano_db' AND TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'rol'
    ) THEN
        ALTER TABLE Usuarios ADD COLUMN `rol` ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente';
    END IF;
END //
DELIMITER ;
CALL AddRolColumn();
