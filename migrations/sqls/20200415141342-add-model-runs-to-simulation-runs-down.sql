ALTER TABLE simulation_runs
  ADD results_data TEXT,
  ADD status VARCHAR(64);

UPDATE simulation_runs
  SET
    results_data = IF(
      JSON_TYPE(simulation_runs.model_runs->'$[0].results_data') = 'NULL',
      NULL,
      IF(
        simulation_runs.model_runs->>'$[0].results_data' = '',
        NULL,
        simulation_runs.model_runs->>'$[0].results_data')),
    status = simulation_runs.model_runs->>'$[0].status';

ALTER TABLE simulation_runs
  CHANGE status status VARCHAR(64) NOT NULL;

ALTER TABLE simulation_runs
  DROP model_runs;

