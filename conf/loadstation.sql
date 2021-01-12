-- MySQL dump 10.13  Distrib 8.0.22, for Win64 (x86_64)
--
-- Host: localhost    Database: loadstation
-- ------------------------------------------------------
-- Server version	5.5.53

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
-- Table structure for table `meshsetting`
--

DROP TABLE IF EXISTS `meshsetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meshsetting` (
  `id` int(1) NOT NULL DEFAULT '1',
  `wholeMax` int(5) DEFAULT '0',
  `safeMax` int(5) DEFAULT '0',
  `averageMax` int(5) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meshsetting`
--

LOCK TABLES `meshsetting` WRITE;
/*!40000 ALTER TABLE `meshsetting` DISABLE KEYS */;
INSERT INTO `meshsetting` VALUES (1,100,32,0);
/*!40000 ALTER TABLE `meshsetting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nodestatus`
--

DROP TABLE IF EXISTS `nodestatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nodestatus` (
  `id` int(3) NOT NULL,
  `maxCurrent` int(3) DEFAULT NULL,
  `CurrentValue` int(3) DEFAULT NULL,
  `workStatus` tinyint(2) unsigned DEFAULT '1',
  `workmode` varchar(10) DEFAULT 'normal',
  `connect` tinyint(4) DEFAULT '1',
  `nodeName` varchar(25) DEFAULT NULL,
  `ipADR` varchar(15) DEFAULT NULL,
  `macADR` varchar(18) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nodestatus`
--

LOCK TABLES `nodestatus` WRITE;
/*!40000 ALTER TABLE `nodestatus` DISABLE KEYS */;
INSERT INTO `nodestatus` VALUES (1,32,0,1,'fast',1,'test','192.168.172.44','00:01:6C:06:A6:29'),(2,32,20,1,'normal',1,NULL,'192.168.172.45','FF:FF:FF:FF:FF:FF'),(3,16,20,1,'normal',1,'test2','192.168.172.46','DD:DD:DD:DD:DD:DD'),(12,32,0,0,'normal',1,'test3','255.255.255.255','66:DD:66:DD:66:DD');
/*!40000 ALTER TABLE `nodestatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `username` varchar(25) CHARACTER SET utf8mb4 NOT NULL,
  `password` varchar(64) CHARACTER SET utf8mb4 NOT NULL,
  PRIMARY KEY (`username`,`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('admin','79625b4c690b70f10c7803bd8ae99d22');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-13  0:19:20