CREATE TABLE intervention_data(
  id INT AUTO_INCREMENT PRIMARY KEY,
  region_id VARCHAR(32) NOT NULL,
  subregion_id VARCHAR(32),
  policy VARCHAR(255) NOT NULL,
  notes TEXT,
  source TEXT,
  issue_date DATE,
  start_date DATE NOT NULL,
  ease_date DATE,
  expiration_date DATE,
  end_date DATE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (region_id),
  INDEX (subregion_id)
)
