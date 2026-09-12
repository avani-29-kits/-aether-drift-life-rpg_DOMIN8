-- Aether Drift — seed data for shop items and achievements
-- Run with: mysql -u root -p < db/seed.sql
-- Safe to re-run: uses INSERT IGNORE on unique keys.

USE aether_drift;

INSERT IGNORE INTO items (name, description, type, price) VALUES
  ('Knight Badge',        'A badge for the disciplined.',              'badge',        100),
  ('Scholar Badge',       'Awarded to the endlessly curious.',         'badge',        100),
  ('Flame Avatar Frame',  'A frame that flickers like firelight.',     'avatar_frame', 500),
  ('Mystic Frame',        'Swirling arcane border for your avatar.',   'avatar_frame', 400),
  ('Cyber Theme',         'Neon-drenched interface skin.',             'theme',        250),
  ('Wanderer Title',      'Display "The Wanderer" under your name.',   'title',        150);

INSERT IGNORE INTO achievements (code, name, description, requirement) VALUES
  ('first_quest',   'First Quest',    'Complete your first Waypoint.',            'quests_completed >= 1'),
  ('week_warrior',  'Week Warrior',   'Maintain a 7-day streak.',                 'current_streak >= 7'),
  ('level_10',      'Level 10',      'Reach character level 10.',                'level >= 10'),
  ('scholar',       'Scholar',        'Complete 25 Intellect quests.',            'intellect_quests_completed >= 25'),
  ('strong_one',    'Strong One',     'Complete 25 Strength quests.',             'strength_quests_completed >= 25'),
  ('quest_master',  'Quest Master',   'Complete 100 Waypoints in total.',         'quests_completed >= 100');
