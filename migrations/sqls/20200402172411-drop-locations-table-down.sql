CREATE TABLE locations(
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  location_name TEXT NOT NULL,
  level INT NOT NULL,
  parent_id INT NOT NULL,
  path_to_top_parent TEXT NOT NULL,
  location_ascii_name TEXT NOT NULL,
  location_name_short TEXT NOT NULL,
  location_type_id INT NOT NULL,
  location_type VARCHAR(32) NOT NULL
);
