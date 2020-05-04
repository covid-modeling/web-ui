ALTER TABLE simulation_runs ADD model_runs JSON;

UPDATE simulation_runs
  SET model_runs = JSON_ARRAY(JSON_OBJECT(
    'model_slug', 'mrc-ide-covid-sim',
    'status', simulation_runs.status,
    'results_data', simulation_runs.results_data));

ALTER TABLE simulation_runs
  DROP status,
  DROP results_data;

ALTER TABLE simulation_runs
  CHANGE model_runs model_runs JSON NOT NULL;
