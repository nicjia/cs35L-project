-- Tells MySQL to use this database (make sure the name matches yours)
USE cs35l_project;

-- Creates your 'users' table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: The following tables are managed by Sequelize ORM and will be auto-created.
-- This is for documentation purposes only.

-- Notifications table
-- CREATE TABLE IF NOT EXISTS Notifications (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   userId INT NOT NULL,
--   fromUserId INT,
--   type ENUM('reminder', 'overdue', 'bump', 'friend_request', 'friend_accepted', 'completed') NOT NULL,
--   message VARCHAR(500) NOT NULL,
--   isRead BOOLEAN DEFAULT FALSE,
--   referenceId INT,
--   referenceType VARCHAR(255),
--   createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
--   FOREIGN KEY (fromUserId) REFERENCES Users(id) ON DELETE SET NULL
-- );

-- Friends table
-- CREATE TABLE IF NOT EXISTS Friends (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   requesterId INT NOT NULL,
--   addresseeId INT NOT NULL,
--   status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
--   createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (requesterId) REFERENCES Users(id) ON DELETE CASCADE,
--   FOREIGN KEY (addresseeId) REFERENCES Users(id) ON DELETE CASCADE
-- );

-- Bumps table
-- CREATE TABLE IF NOT EXISTS Bumps (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   taskId INT NOT NULL,
--   fromUserId INT NOT NULL,
--   toUserId INT NOT NULL,
--   message VARCHAR(255),
--   createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
--   FOREIGN KEY (fromUserId) REFERENCES Users(id) ON DELETE CASCADE,
--   FOREIGN KEY (toUserId) REFERENCES Users(id) ON DELETE CASCADE
-- );
