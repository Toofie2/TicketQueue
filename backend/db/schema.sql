DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS queueentry;
DROP TABLE IF EXISTS queue;
DROP TABLE IF EXISTS userprofile;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS usercredentials;

CREATE TABLE usercredentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE userprofile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  fullName VARCHAR(100),
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(20),
  preferences VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES usercredentials(id) ON DELETE CASCADE
);

CREATE TABLE service (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  expectedDuration INT NOT NULL,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  category VARCHAR(100),
  venue VARCHAR(255),
  eventTime VARCHAR(20),
  eventDate DATE,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  image VARCHAR(255)
);

CREATE TABLE queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serviceId INT NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (serviceId) REFERENCES service(id) ON DELETE CASCADE
);

CREATE TABLE queueentry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queueId INT NOT NULL,
  userId INT NOT NULL,
  position INT,
  tickets INT NOT NULL DEFAULT 1,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  joinTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('waiting', 'checking_out', 'served', 'canceled') NOT NULL DEFAULT 'waiting',
  FOREIGN KEY (queueId) REFERENCES queue(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES usercredentials(id) ON DELETE CASCADE
);

CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  serviceId INT,
  type VARCHAR(50),
  message VARCHAR(500) NOT NULL,
  status ENUM('sent', 'viewed') NOT NULL DEFAULT 'sent',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES usercredentials(id) ON DELETE CASCADE
);

CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  serviceName VARCHAR(100),
  outcome ENUM('Joined Queue', 'Left Queue', 'Served') NOT NULL,
  eventDate DATE NOT NULL,
  FOREIGN KEY (userId) REFERENCES usercredentials(id) ON DELETE CASCADE
);
