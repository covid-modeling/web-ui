ALTER TABLE simulation_runs
  ADD region_id VARCHAR(32),
  ADD subregion_id VARCHAR(32),
  ADD FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT,
  ADD FOREIGN KEY (subregion_id) REFERENCES regions(id) ON DELETE RESTRICT,
  ADD INDEX (region_id),
  ADD INDEX (subregion_id);
