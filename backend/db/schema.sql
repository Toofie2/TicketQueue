DROP TABLE IF EXISTS History;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS QueueEntry;
DROP TABLE IF EXISTS Queue;
DROP TABLE IF EXISTS UserProfile;
DROP TABLE IF EXISTS Service;
DROP TABLE IF EXISTS UserCredentials;

CREATE TABLE UserCredentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE UserProfile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  fullName VARCHAR(100),
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(20),
  preferences VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES UserCredentials(id) ON DELETE CASCADE
);

CREATE TABLE Service (
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
  quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE Queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serviceId INT NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE CASCADE
);

CREATE TABLE QueueEntry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queueId INT NOT NULL,
  userId INT NOT NULL,
  position INT,
  tickets INT NOT NULL DEFAULT 1,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  joinTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('waiting', 'served', 'canceled') NOT NULL DEFAULT 'waiting',
  FOREIGN KEY (queueId) REFERENCES Queue(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES UserCredentials(id) ON DELETE CASCADE
);

CREATE TABLE Notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  serviceId INT,
  type VARCHAR(50),
  message VARCHAR(500) NOT NULL,
  status ENUM('sent', 'viewed') NOT NULL DEFAULT 'sent',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES UserCredentials(id) ON DELETE CASCADE
);

CREATE TABLE History (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  serviceName VARCHAR(100),
  outcome ENUM('Joined Queue', 'Left Queue', 'Served') NOT NULL,
  eventDate DATE NOT NULL,
  FOREIGN KEY (userId) REFERENCES UserCredentials(id) ON DELETE CASCADE
);
