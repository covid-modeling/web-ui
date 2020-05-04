ALTER TABLE simulation_runs
  DROP FOREIGN KEY simulation_runs_ibfk_1,
  DROP FOREIGN KEY simulation_runs_ibfk_2,
  DROP COLUMN region_id,
  DROP COLUMN subregion_id;
