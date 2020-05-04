CREATE TABLE simulation_runs(
  id INT AUTO_INCREMENT PRIMARY KEY,

  # The location ID of the run
  location_id INT NOT NULL,
  
  # The current run status
  status VARCHAR(64) NOT NULL,

  # The ID of the user that prompted the run
  github_user_id INT NOT NULL,

  # The configuration of the run
  configuration JSON NOT NULL,

  # A URL pointing to the results in blob storage
  results_data TEXT,

  # Inserted/updated metadata
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
