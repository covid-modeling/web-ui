CREATE TABLE regions(
  id VARCHAR(32) PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id VARCHAR(32),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,

  FOREIGN KEY (parent_id) REFERENCES regions(id) ON DELETE CASCADE
)
