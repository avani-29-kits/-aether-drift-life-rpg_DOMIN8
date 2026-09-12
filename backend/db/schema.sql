-- Aether Drift (Life RPG) — MySQL schema
-- Run with: mysql -u root -p < db/schema.sql

CREATE DATABASE IF NOT EXISTS aether_drift
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aether_drift;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- characters  (1:1 with users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS characters (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id            INT UNSIGNED NOT NULL,
  level              INT UNSIGNED NOT NULL DEFAULT 1,
  xp                 INT UNSIGNED NOT NULL DEFAULT 0,
  gold               INT UNSIGNED NOT NULL DEFAULT 0,
  strength           INT UNSIGNED NOT NULL DEFAULT 0,
  intellect          INT UNSIGNED NOT NULL DEFAULT 0,
  agility            INT UNSIGNED NOT NULL DEFAULT 0,
  vitality           INT UNSIGNED NOT NULL DEFAULT 0,
  current_streak     INT UNSIGNED NOT NULL DEFAULT 0,
  longest_streak     INT UNSIGNED NOT NULL DEFAULT 0,
  last_activity_date DATE NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_characters_user (user_id),
  CONSTRAINT fk_characters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- quests  ("Waypoints" in the UI)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quests (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  title         VARCHAR(150) NOT NULL,
  description   TEXT NULL,
  category      ENUM('coding','study','fitness','reading','health','personal','creativity','other')
                  NOT NULL DEFAULT 'other',
  difficulty    ENUM('easy','medium','hard','epic') NOT NULL DEFAULT 'medium',
  xp_reward     INT UNSIGNED NOT NULL DEFAULT 10,
  gold_reward   INT UNSIGNED NOT NULL DEFAULT 5,
  attribute     ENUM('strength','intellect','agility','vitality') NOT NULL DEFAULT 'intellect',
  due_date      DATE NULL,
  completed     TINYINT(1)   NOT NULL DEFAULT 0,
  completed_at  TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_quests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_quests_user_completed (user_id, completed)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- quest_history — immutable ledger of completions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quest_history (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  quest_id     INT UNSIGNED NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  xp_earned    INT UNSIGNED NOT NULL,
  gold_earned  INT UNSIGNED NOT NULL,
  CONSTRAINT fk_history_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_history_quest FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  INDEX idx_history_user (user_id, completed_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- items  (shop catalogue — cosmetics only)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  type        ENUM('theme','avatar_frame','badge','title') NOT NULL,
  price       INT UNSIGNED NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- inventory  (per-user owned items)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  item_id       INT UNSIGNED NOT NULL,
  purchased_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  equipped      TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_inventory_user_item (user_id, item_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- achievements  (catalogue)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(60)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL,
  requirement VARCHAR(255) NOT NULL COMMENT 'human-readable + used by achievement-check service',
  UNIQUE KEY uq_achievements_code (code)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- user_achievements  (unlocks)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_achievements (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  achievement_id INT UNSIGNED NOT NULL,
  unlocked_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ua_achievement FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_achievement (user_id, achievement_id)
) ENGINE=InnoDB;
