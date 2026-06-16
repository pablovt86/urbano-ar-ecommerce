-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: urbano_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `estado` enum('activo','procesando_pago','completado','abandonado') DEFAULT 'activo',
  `total` decimal(10,2) DEFAULT 0.00,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (1,'completado',62000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4),(2,'completado',173000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4),(3,'completado',120000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2),(4,'completado',90000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5),(5,'completado',230000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11),(6,'completado',181000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4),(7,'completado',149000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',9),(8,'completado',116000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2),(9,'completado',64000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11),(10,'completado',99000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',3),(11,'completado',56000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11),(12,'completado',330000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',10),(13,'completado',32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5),(14,'completado',55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4),(15,'completado',15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',7),(16,'completado',126000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8),(17,'completado',60000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8),(18,'completado',35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',10),(19,'completado',30000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',7),(20,'completado',30000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5),(21,'completado',35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',6),(22,'completado',30000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11),(23,'completado',15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8),(24,'completado',30000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5),(25,'completado',236000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',6),(26,'completado',80000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11),(27,'completado',32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8),(28,'completado',156000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',3),(29,'completado',125000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8),(30,'completado',55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4),(31,'completado',100000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5),(32,'completado',32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2),(33,'completado',70000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',6),(34,'completado',70000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11),(35,'completado',55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5),(36,'completado',110000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',3),(37,'completado',142000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2),(38,'completado',30000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',9),(39,'completado',64000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',10),(40,'completado',55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:04',8),(41,'completado',111000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',4),(42,'completado',174000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',10),(43,'completado',170000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',2),(44,'completado',174000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',3),(45,'completado',124000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',4),(46,'completado',65000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',11),(47,'completado',209000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',11),(48,'completado',220000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',3),(49,'completado',110000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',4),(50,'completado',138000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',7);
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `imagen_portada` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (23,'Torso','hoodie.png','2026-06-15 02:38:51','2026-06-15 02:38:51'),(24,'Piernas','JeansWoman1.jpg','2026-06-15 02:38:51','2026-06-15 02:38:51'),(25,'Accesorios','DressOrange.jpg','2026-06-15 02:38:51','2026-06-15 02:38:51');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracionprobadors`
--

DROP TABLE IF EXISTS `configuracionprobadors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracionprobadors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_overlay` varchar(255) DEFAULT NULL,
  `anchor_top_left_x` float DEFAULT NULL,
  `anchor_top_left_y` float DEFAULT NULL,
  `anchor_top_right_x` float DEFAULT NULL,
  `anchor_top_right_y` float DEFAULT NULL,
  `anchor_bottom_left_x` float DEFAULT NULL,
  `anchor_bottom_left_y` float DEFAULT NULL,
  `anchor_bottom_right_x` float DEFAULT NULL,
  `anchor_bottom_right_y` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `configuracionprobadors_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracionprobadors`
--

LOCK TABLES `configuracionprobadors` WRITE;
/*!40000 ALTER TABLE `configuracionprobadors` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracionprobadors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guiatalles`
--

DROP TABLE IF EXISTS `guiatalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guiatalles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `talle` varchar(255) NOT NULL,
  `sexo_modelo` enum('unisex','hombre','mujer') DEFAULT 'unisex',
  `altura_min_cm` int(11) NOT NULL,
  `altura_max_cm` int(11) NOT NULL,
  `peso_min_kg` decimal(5,2) NOT NULL,
  `peso_max_kg` decimal(5,2) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `guiatalles_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guiatalles`
--

LOCK TABLES `guiatalles` WRITE;
/*!40000 ALTER TABLE `guiatalles` DISABLE KEYS */;
INSERT INTO `guiatalles` VALUES (1,'S','unisex',150,165,45.00,64.00,1),(2,'M','unisex',160,175,65.00,75.00,1),(3,'L','unisex',170,185,76.00,85.00,1),(4,'XL','unisex',170,190,86.00,100.00,1),(5,'XXL','unisex',180,210,101.00,130.00,1),(6,'S','unisex',150,165,45.00,64.00,2),(7,'M','unisex',160,175,65.00,75.00,2),(8,'L','unisex',170,185,76.00,85.00,2),(9,'XL','unisex',170,190,86.00,100.00,2),(10,'XXL','unisex',180,210,101.00,130.00,2),(11,'S','unisex',150,165,45.00,64.00,3),(12,'M','unisex',160,175,65.00,75.00,3),(13,'L','unisex',170,185,76.00,85.00,3),(14,'XL','unisex',170,190,86.00,100.00,3),(15,'XXL','unisex',180,210,101.00,130.00,3),(16,'S','unisex',150,165,45.00,64.00,4),(17,'M','unisex',160,175,65.00,75.00,4),(18,'L','unisex',170,185,76.00,85.00,4),(19,'XL','unisex',170,190,86.00,100.00,4),(20,'XXL','unisex',180,210,101.00,130.00,4),(21,'S','unisex',150,165,45.00,64.00,5),(22,'M','unisex',160,175,65.00,75.00,5),(23,'L','unisex',170,185,76.00,85.00,5),(24,'XL','unisex',170,190,86.00,100.00,5),(25,'XXL','unisex',180,210,101.00,130.00,5),(26,'S','unisex',150,165,45.00,64.00,6),(27,'M','unisex',160,175,65.00,75.00,6),(28,'L','unisex',170,185,76.00,85.00,6),(29,'XL','unisex',170,190,86.00,100.00,6),(30,'XXL','unisex',180,210,101.00,130.00,6),(31,'S','unisex',150,165,45.00,64.00,7),(32,'M','unisex',160,175,65.00,75.00,7),(33,'L','unisex',170,185,76.00,85.00,7),(34,'XL','unisex',170,190,86.00,100.00,7),(35,'XXL','unisex',180,210,101.00,130.00,7),(36,'S','unisex',150,165,45.00,64.00,8),(37,'M','unisex',160,175,65.00,75.00,8),(38,'L','unisex',170,185,76.00,85.00,8),(39,'XL','unisex',170,190,86.00,100.00,8),(40,'XXL','unisex',180,210,101.00,130.00,8),(41,'S','unisex',150,165,45.00,64.00,9),(42,'M','unisex',160,175,65.00,75.00,9),(43,'L','unisex',170,185,76.00,85.00,9),(44,'XL','unisex',170,190,86.00,100.00,9),(45,'XXL','unisex',180,210,101.00,130.00,9),(46,'S','unisex',150,165,45.00,64.00,10),(47,'M','unisex',160,175,65.00,75.00,10),(48,'L','unisex',170,185,76.00,85.00,10),(49,'XL','unisex',170,190,86.00,100.00,10),(50,'XXL','unisex',180,210,101.00,130.00,10),(56,'S','unisex',150,165,45.00,64.00,12),(57,'M','unisex',160,175,65.00,75.00,12),(58,'L','unisex',170,185,76.00,85.00,12),(59,'XL','unisex',170,190,86.00,100.00,12),(60,'XXL','unisex',180,210,101.00,130.00,12),(61,'S','unisex',150,165,45.00,64.00,13),(62,'M','unisex',160,175,65.00,75.00,13),(63,'L','unisex',170,185,76.00,85.00,13),(64,'XL','unisex',170,190,86.00,100.00,13),(65,'XXL','unisex',180,210,101.00,130.00,13),(66,'S','unisex',150,165,45.00,64.00,14),(67,'M','unisex',160,175,65.00,75.00,14),(68,'L','unisex',170,185,76.00,85.00,14),(69,'XL','unisex',170,190,86.00,100.00,14),(70,'XXL','unisex',180,210,101.00,130.00,14),(71,'S','unisex',150,165,45.00,64.00,15),(72,'M','unisex',160,175,65.00,75.00,15),(73,'L','unisex',170,185,76.00,85.00,15),(74,'XL','unisex',170,190,86.00,100.00,15),(75,'XXL','unisex',180,210,101.00,130.00,15),(76,'S','unisex',155,168,50.00,65.00,1),(77,'M','unisex',169,178,66.00,78.00,1),(78,'L','unisex',179,185,79.00,90.00,1),(79,'XL','unisex',186,195,91.00,105.00,1),(80,'S','unisex',155,168,50.00,65.00,1),(81,'M','unisex',169,178,66.00,78.00,1),(82,'L','unisex',179,185,79.00,90.00,1),(83,'XL','unisex',186,195,91.00,105.00,1);
/*!40000 ALTER TABLE `guiatalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenproductos`
--

DROP TABLE IF EXISTS `imagenproductos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenproductos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0,
  `producto_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `imagenproductos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenproductos`
--

LOCK TABLES `imagenproductos` WRITE;
/*!40000 ALTER TABLE `imagenproductos` DISABLE KEYS */;
INSERT INTO `imagenproductos` VALUES (1,'BrownLeatherJacket.png',1,1),(2,'DressOrange.png',1,2),(3,'JeansWoman1.png',1,3),(4,'fleece-jacket-isolated-on-transparent-background-free-png.webp',1,4),(5,'hoodie.png',1,5),(6,'JeansWoman1.png',1,6),(7,'LongFuzzyCoat.png',1,7),(8,'LongFuzzyCoatWithoutCenter_(1).png',1,8),(9,'LongTrechCoat.png',1,9),(10,'LongTrenchCoatWithoutCenter.png',1,10),(12,'Manjeans2WithoutCenter.png',1,12),(13,'TopColoresSinMangas.png',1,13),(14,'TrenchRed.png',1,14),(15,'TrendyUpperComboWoman1.png',1,15);
/*!40000 ALTER TABLE `imagenproductos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itemcarritos`
--

DROP TABLE IF EXISTS `itemcarritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itemcarritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `carrito_id` int(11) DEFAULT NULL,
  `variante_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carrito_id` (`carrito_id`),
  KEY `variante_id` (`variante_id`),
  CONSTRAINT `itemcarritos_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `itemcarritos_ibfk_2` FOREIGN KEY (`variante_id`) REFERENCES `varianteprendas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itemcarritos`
--

LOCK TABLES `itemcarritos` WRITE;
/*!40000 ALTER TABLE `itemcarritos` DISABLE KEYS */;
INSERT INTO `itemcarritos` VALUES (1,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',1,NULL),(2,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',1,NULL),(3,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',1,NULL),(4,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2,NULL),(5,1,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2,NULL),(6,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',2,NULL),(7,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',3,NULL),(8,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',3,NULL),(9,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',3,NULL),(10,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4,NULL),(11,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',4,NULL),(12,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5,NULL),(13,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5,NULL),(14,2,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',5,NULL),(15,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',6,NULL),(16,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',6,NULL),(17,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',6,NULL),(18,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',7,NULL),(19,2,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',7,NULL),(20,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',7,NULL),(21,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8,NULL),(22,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8,NULL),(23,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',8,NULL),(24,2,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',9,NULL),(25,2,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',10,NULL),(26,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',10,NULL),(27,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',11,NULL),(28,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',12,NULL),(29,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',12,NULL),(30,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',12,NULL),(31,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',13,NULL),(32,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',14,NULL),(33,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',15,NULL),(34,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',16,NULL),(35,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',16,NULL),(36,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',16,NULL),(37,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',17,NULL),(38,1,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',17,NULL),(39,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',18,NULL),(40,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',19,NULL),(41,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',20,NULL),(42,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',21,NULL),(43,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',22,NULL),(44,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',23,NULL),(45,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',24,NULL),(46,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',25,NULL),(47,2,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',25,NULL),(48,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',25,NULL),(49,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',26,NULL),(50,1,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',26,NULL),(51,1,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',26,NULL),(52,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',27,NULL),(53,2,28000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',28,NULL),(54,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',28,NULL),(55,2,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',28,NULL),(56,2,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',29,NULL),(57,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',29,NULL),(58,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',30,NULL),(59,2,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',31,NULL),(60,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',31,NULL),(61,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',32,NULL),(62,2,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',33,NULL),(63,2,35000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',34,NULL),(64,1,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',35,NULL),(65,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',36,NULL),(66,2,55000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',37,NULL),(67,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',37,NULL),(68,2,15000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',38,NULL),(69,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',39,NULL),(70,1,32000.00,'2026-06-15 02:27:03','2026-06-15 02:27:03',39,NULL),(71,1,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',40,NULL),(72,1,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',41,NULL),(73,2,28000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',41,NULL),(74,2,32000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',42,NULL),(75,2,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',42,NULL),(76,1,32000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',43,NULL),(77,2,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',43,NULL),(78,1,28000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',43,NULL),(79,2,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',44,NULL),(80,2,32000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',44,NULL),(81,2,32000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',45,NULL),(82,1,28000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',45,NULL),(83,1,32000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',45,NULL),(84,1,35000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',46,NULL),(85,2,15000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',46,NULL),(86,2,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',47,NULL),(87,1,35000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',47,NULL),(88,2,32000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',47,NULL),(89,1,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',48,NULL),(90,2,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',48,NULL),(91,1,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',48,NULL),(92,1,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',49,NULL),(93,1,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',49,NULL),(94,2,55000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',50,NULL),(95,1,28000.00,'2026-06-15 02:27:04','2026-06-15 02:27:04',50,NULL);
/*!40000 ALTER TABLE `itemcarritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `es_nuevo` tinyint(1) DEFAULT 0,
  `destacado` tinyint(1) DEFAULT 0,
  `tipo_prenda` enum('superior','inferior','completo') NOT NULL DEFAULT 'superior',
  `tipo_overlay` enum('torso','piernas','cuerpo_completo','long_coat') DEFAULT 'torso',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Chaqueta Marrón Brown Leather','Campera de cuero premium con terminaciones urbanas de alta calidad.',45000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(2,'Vestido Orange Dress Glam','Vestido urbano estilizado exclusivo de temporada de diseño vibrante.',35000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(3,'Jean Denim Woman Blue 1','Jean clásico para mujer de calce confortable y alta durabilidad.',32000.00,0,0,'inferior','piernas','2026-06-15 02:38:51','2026-06-15 02:38:51',24),(4,'Chaqueta Fleece Isolated Grey','Buzo abrigado textil premium con aislamiento térmico moderno.',28000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(5,'Buzo Hoodie Casual Black','Buzo frisado premium con capucha y cordones de ajuste urbano.',26000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(6,'Pantalón Vaquero Base Femenino','Jean de corte regular texturizado ideal para combinar en capas.',27000.00,0,0,'inferior','piernas','2026-06-15 02:38:51','2026-06-15 02:38:51',24),(7,'Abrigo Largo Fuzzy Coat','Sobretodo con textura suave al tacto y máxima resistencia al frío.',55000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(8,'Tapado Fuzzy Premium Open Center','Prenda versátil de calce holgado y costuras interiores reforzadas.',58000.00,0,0,'superior','long_coat','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(9,'Sobretodo Elegante Long Trench','Corte relajado unisex de alta costura adaptable a cualquier look.',62000.00,0,0,'completo','long_coat','2026-06-15 02:38:51','2026-06-15 02:38:51',25),(10,'Sobretodo Trench Open Center Gray','Diseño streetwear minimalista inspirado en la cultura de capas.',59000.00,0,0,'completo','long_coat','2026-06-15 02:38:51','2026-06-15 02:38:51',25),(11,'Jean Denim Classic Man 1','Jean vaquero para hombre texturado con moldería recta moderna.',31000.00,0,0,'inferior','piernas','0000-00-00 00:00:00','0000-00-00 00:00:00',24),(12,'Jean Slim Man Style 2','Jean gris oscuro desgastado estilo vintage urbano.',29000.00,0,0,'inferior','piernas','2026-06-15 02:38:51','2026-06-15 02:38:51',24),(13,'Top Colores Veraniego Sin Mangas','Prenda superior ligera ideal para días de verano confortables.',15000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23),(14,'Campera Trench Red Intense','Impermeable estilizado con detalles de diseño exclusivo.',48000.00,0,0,'completo','long_coat','2026-06-15 02:38:51','2026-06-15 02:38:51',25),(15,'Combo Upper Trendy Woman 1','Enfoque de diseño integrado inspirado en la cultura elegante.',39000.00,0,0,'superior','torso','2026-06-15 02:38:51','2026-06-15 02:38:51',23);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `altura_cm` int(11) DEFAULT NULL,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `rol` enum('admin','cliente') NOT NULL DEFAULT 'cliente',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Admin Urbano','admin@urbano.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'admin','2026-06-15 02:27:03','2026-06-15 02:27:03'),(2,'Cliente 1','cliente1@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(3,'Cliente 2','cliente2@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(4,'Cliente 3','cliente3@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(5,'Cliente 4','cliente4@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(6,'Cliente 5','cliente5@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(7,'Cliente 6','cliente6@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(8,'Cliente 7','cliente7@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(9,'Cliente 8','cliente8@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(10,'Cliente 9','cliente9@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03'),(11,'Cliente 10','cliente10@gmail.com','$2b$10$KHUPahveh/BlOh.wOA4HwuI1YvEFpxOpK4eqy2BGCc6CybPP/8hc6',NULL,NULL,'cliente','2026-06-15 02:27:03','2026-06-15 02:27:03');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `varianteprendas`
--

DROP TABLE IF EXISTS `varianteprendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `varianteprendas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `talle` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(255) DEFAULT NULL,
  `imagen_vton_url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `varianteprendas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `varianteprendas`
--

LOCK TABLES `varianteprendas` WRITE;
/*!40000 ALTER TABLE `varianteprendas` DISABLE KEYS */;
INSERT INTO `varianteprendas` VALUES (66,1,'M','Marrón',12,'JKT-BRN-M','BrownLeatherJacket.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(67,2,'M','Naranja',12,'DRESS-ORN-M','DressOrange.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(68,3,'M','Azul',12,'JEAN-BLUE-M','JeansWoman1.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(69,4,'L','Gris',15,'FLEECE-L','fleece-jacket-isolated-on-transparent-background-free-png.webp','0000-00-00 00:00:00','0000-00-00 00:00:00'),(70,5,'M','Negro',15,'HOODIE-M','hoodie.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(71,6,'M','Azul',10,'JEAN-BASE-M','JeansWoman1.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(72,7,'M','Gris',10,'FUZZY-M','LongFuzzyCoat.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(73,8,'XL','Beige',8,'FUZZY-XL','LongFuzzyCoatWithoutCenter_(1).png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(74,9,'M','Negro',8,'TRENCH-M','LongTrenchCoatWithoutCenter.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(75,10,'M','Gris',8,'TRENCH-OPEN-M','LongTrenchCoatWithoutCenter.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(76,11,'M','Azul',12,'JEAN-M-1','ManJeans1.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(77,12,'M','Gris',12,'JEAN-SLIM-M','Manjeans2WithoutCenter.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(78,13,'M','Verde',12,'TOP-M','TopColoresSinMangas.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(79,14,'M','Rojo',10,'TRENCH-RED-M','TrenchRed.png','0000-00-00 00:00:00','0000-00-00 00:00:00'),(80,15,'M','Multicolor',10,'COMBO-M','TrendyUpperComboWoman1.png','0000-00-00 00:00:00','0000-00-00 00:00:00');
/*!40000 ALTER TABLE `varianteprendas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-15 14:32:53
