-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: restaurant_platform
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_summaries`
--

DROP TABLE IF EXISTS `ai_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_summaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `summary_type` varchar(50) NOT NULL,
  `prompt_used` text,
  `result` text,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `ai_summaries_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_summaries`
--

LOCK TABLES `ai_summaries` WRITE;
/*!40000 ALTER TABLE `ai_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('9fc1998a7844');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `resource_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_reviews`
--

DROP TABLE IF EXISTS `restaurant_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `review_text` text NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  `sentiment` enum('POSITIVE','NEUTRAL','NEGATIVE') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `restaurant_reviews_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_reviews`
--

LOCK TABLES `restaurant_reviews` WRITE;
/*!40000 ALTER TABLE `restaurant_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurant_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `cuisine` varchar(100) NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `opening_hours` text,
  `notes` text,
  `lead_status` enum('COLD','CONTACTED','INTERESTED','NOT_INTERESTED','CONVERTED') NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (276,'Le Bernardin','155 W 51st St','New York','NY','USA','212-554-1515','info@le-bernardin.com','le-bernardin.com','French / Seafood',4.90,'Mon-Fri 12:00 PM - 10:30 PM, Sat 5:15 PM - 10:30 PM','3 Michelin stars. Consistently ranked among the best in the world. High-profile chef Eric Ripert.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(277,'The French Laundry','6640 Washington St','Yountville','CA','USA','707-944-2380','reservations@thomaskeller.com','thomaskeller.com/tfl','French / Californian',4.90,'Daily 4:00 PM - 8:30 PM','Thomas Keller\'s iconic Napa Valley restaurant. Extremely difficult to get reservations.','CONTACTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(278,'Alinea','1723 N Halsted St','Chicago','IL','USA','312-867-0110','hospitality@alinearestaurant.com','alinearestaurant.com','Molecular Gastronomy',4.80,'Wed-Sun 5:00 PM - 9:30 PM','Grant Achatz\'s masterpiece. 3 Michelin stars. Known for highly innovative and theatrical dining.','INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(279,'Katz\'s Delicatessen','205 E Houston St','New York','NY','USA','212-254-2246','hello@katzsdelicatessen.com','katzsdelicatessen.com','Deli',4.70,'Mon-Wed 8:00 AM - 10:45 PM, Thu-Sun 8:00 AM - 2:45 AM','Historic NYC institution since 1888. Famous for pastrami on rye.','CONVERTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(280,'Commander\'s Palace','1403 Washington Ave','New Orleans','LA','USA','504-899-8221','info@commanderspalace.com','commanderspalace.com','Creole',4.80,'Mon-Sun 11:30 AM - 9:00 PM','Legendary NOLA dining spot in the Garden District. Emeril Lagasse and Paul Prudhomme are alumni.','INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(281,'Osteria Francescana','Via Stella, 22','Modena','MO','Italy','+39 059 223912','info@osteriafrancescana.it','osteriafrancescana.it','Italian',5.00,'Tue-Sat 12:30 PM - 1:30 PM, 8:00 PM - 9:30 PM','Massimo Bottura\'s 3-Michelin star restaurant. Twice ranked No. 1 in the world.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(282,'Pujol','Tennyson 133, Polanco','Mexico City','CDMX','Mexico','+52 55 5545 4111','contacto@pujol.com.mx','pujol.com.mx','Mexican',4.80,'Mon-Sat 1:30 PM - 10:30 PM','Enrique Olvera\'s flagship. Famous for the Mole Madre, aged for thousands of days.','CONTACTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(283,'Noma','Refshalevej 96','Copenhagen','Capital Region','Denmark','+45 32 96 32 97','booking@noma.dk','noma.dk','New Nordic',4.90,'Tue-Fri 5:00 PM - 11:00 PM','Rene Redzepi\'s legendary restaurant. Pioneer of foraging and fermentation.','NOT_INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(284,'Gaggan Anand','68/1 Soi Langsuan','Bangkok','Bangkok','Thailand','+66 98 883 1773','info@gaggananand.com','gaggananand.com','Progressive Indian',4.70,'Thu-Sun 5:30 PM - 10:30 PM','Reincarnation of the famed Gaggan. Highly experimental and emoji-based menus.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(285,'Joe\'s Stone Crab','11 Washington Ave','Miami Beach','FL','USA','305-673-0365','info@joesstonecrab.com','joesstonecrab.com','Seafood',4.60,'Wed-Sun 11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM','Opened in 1913. The most famous spot for Florida stone crabs.','INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(286,'Franklin Barbecue','900 E 11th St','Austin','TX','USA','512-653-1187','info@franklinbbq.com','franklinbbq.com','BBQ',4.90,'Tue-Sun 11:00 AM - 3:00 PM (or sold out)','Aaron Franklin\'s legendary spot. People wait in line for 4+ hours every morning.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(287,'Peter Luger Steak House','178 Broadway','Brooklyn','NY','USA','718-387-7400','contact@peterluger.com','peterluger.com','Steakhouse',4.40,'Mon-Sun 11:45 AM - 9:45 PM','Old-school, cash-only institution known for dry-aged porterhouse steaks.','CONTACTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(288,'Chez Panisse','1517 Shattuck Ave','Berkeley','CA','USA','510-548-5525','reservations@chezpanisse.com','chezpanisse.com','Californian',4.70,'Mon-Sat 5:30 PM - 10:30 PM','Alice Waters\' historic restaurant that pioneered the farm-to-table movement.','CONVERTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(289,'Husk','76 Queen St','Charleston','SC','USA','843-577-2500','info@huskrestaurant.com','huskrestaurant.com','Southern',4.60,'Mon-Sun 5:00 PM - 10:00 PM','Focused strictly on Southern ingredients. A staple of modern Charleston dining.','INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(290,'Zuni Cafe','1658 Market St','San Francisco','CA','USA','415-552-2522','info@zunicafe.com','zunicafe.com','Californian / French',4.50,'Wed-Sun 11:30 AM - 10:00 PM','Famous for their legendary roast chicken and bread salad.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(291,'St. Elmo Steak House','127 S Illinois St','Indianapolis','IN','USA','317-635-0636','info@stelmos.com','stelmos.com','Steakhouse',4.70,'Mon-Sun 4:00 PM - 10:30 PM','Historic spot famous for their intensely spicy shrimp cocktail.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(292,'The Bluebird Cafe','4104 Hillsboro Pike','Nashville','TN','USA','615-383-1461','info@bluebirdcafe.com','bluebirdcafe.com','American',4.30,'Tue-Sun 5:00 PM - 11:00 PM','More famous for its live country music and songwriter rounds than the food.','CONTACTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(293,'Canlis','2576 Aurora Ave N','Seattle','WA','USA','206-283-3313','dine@canlis.com','canlis.com','Fine Dining',4.80,'Mon-Sat 5:30 PM - 10:00 PM','Seattle\'s premier fine dining establishment with incredible views and wine program.','INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(294,'Bern\'s Steak House','1208 S Howard Ave','Tampa','FL','USA','813-251-2421','reservations@bernssteakhouse.com','bernssteakhouse.com','Steakhouse',4.80,'Tue-Sun 5:00 PM - 10:00 PM','Boasts one of the largest wine collections in the world. Features a separate dessert room.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(295,'Pappy\'s Smokehouse','3106 Olive St','St. Louis','MO','USA','314-535-4340','info@pappyssmokehouse.com','pappyssmokehouse.com','BBQ',4.70,'Wed-Sun 11:00 AM - 4:00 PM','Memphis-style BBQ. Famous for their dry-rubbed ribs.','CONVERTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(296,'Pizzeria Bianco','623 E Adams St','Phoenix','AZ','USA','602-258-8300','info@pizzeriabianco.com','pizzeriabianco.com','Pizza',4.60,'Mon-Sun 11:00 AM - 9:00 PM','Chris Bianco\'s legendary pizzeria, often cited as the best pizza in America.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(297,'Lombardi\'s','32 Spring St','New York','NY','USA','212-941-7994','hello@firstpizza.com','firstpizza.com','Pizza',4.30,'Sun-Thu 11:30 AM - 10:00 PM, Fri-Sat 11:30 AM - 11:00 PM','America\'s first pizzeria, established in 1905 in Little Italy.','CONTACTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(298,'Balthazar','80 Spring St','New York','NY','USA','212-965-1414','reservations@balthazarny.com','balthazarny.com','French Brasserie',4.50,'Mon-Sun 8:00 AM - 11:00 PM','Iconic SoHo brasserie known for celebrity sightings and perfect steak frites.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(299,'Felix Trattoria','1023 Abbot Kinney Blvd','Venice','CA','USA','424-387-8622','info@felixla.com','felixla.com','Italian',4.60,'Mon-Sun 5:00 PM - 10:00 PM','Evan Funke\'s pasta palace. Features a glass-enclosed pasta-making room in the center.','INTERESTED',1,'2026-07-02 14:05:57','2026-07-02 14:05:57'),(300,'Central','Av. Pedro de Osma 301','Lima','Lima','Peru','+51 1 2428515','reservas@centralrestaurante.com.pe','centralrestaurante.com.pe','Peruvian',4.90,'Mon-Sat 12:45 PM - 1:45 PM, 7:45 PM - 8:45 PM','Virgilio Martinez\'s restaurant exploring Peruvian ecosystems. Ranked No. 1 in the world in 2023.','COLD',1,'2026-07-02 14:05:57','2026-07-02 14:05:57');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  `is_approved` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@restaurant.com','Admin','$2b$12$st4Ibly43rUdMRpw7ICpPOSqJp5DcQ3giD4dVs6PMwNX5T8lqACwe','ADMIN',1,1,'2026-07-02 01:55:16','2026-07-02 01:55:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-02 14:36:10
