CREATE TABLE case_data(
  id INT AUTO_INCREMENT PRIMARY KEY,
  region_id VARCHAR(32) NOT NULL,
  subregion_id VARCHAR(32),
  date DATE NOT NULL,
  confirmed INT NOT NULL,
  recovered INT NOT NULL,
  deaths INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (region_id),
  INDEX (subregion_id),
  UNIQUE INDEX (region_id, subregion_id, date)
)
