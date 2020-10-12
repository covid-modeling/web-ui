# User Flow

This document describes the means by which a user accesses the web application,
queues a simulation run, and then views the results.
It summarizes the calls made between components of the system and the data that is passed by those calls.

<details>
  <summary>Sequence Diagram Source</summary>

```mermaid
sequenceDiagram
  participant User
  participant Web
  participant GitHub
  participant Runner
  participant Database
  participant BlobStorage
  User->>Web: /login
  Web->>GitHub: OAuth [client ID, state]
  GitHub-->>Web: OAuth [code, state]
  Web->>GitHub: Request API token [code, client ID+secret]
  GitHub-->>Web: OK [API token]
  Web->>GitHub: Look up user [API token]
  GitHub-->>Web: OK [user]
  Web->>Database: Check user authorization [user]
  Database-->>Web: OK
  User->>Web: Configure [sim params]
  User->>Web: Request run
  Web->>Database: Request case data for region [sim params]
  Database-->>Web: Return case data for region [cases]
  Web->>Database: Record run pending, associate with user [user, sim params]
  Database-->>Web: OK [run ID]
  Web->>GitHub: Dispatch [sim params, model URL, callback URL, run ID]
  GitHub-->>Web: OK
  GitHub->>+Runner: Run sim [sim params, model URL, workflow ID]
  Runner->>Web: Run started [run ID, workflow ID, shared secret]
  Web->>Database: Record run started [run ID, workflow ID, sim params]
  Database-->>Web: OK
  Runner->>BlobStorage: Store results [sim results]
  BlobStorage-->>Runner: OK [results location]
  Runner->>Web: Run complete [run ID, results location, shared secret]
  Runner-->>-GitHub: Run complete
  Web->>Database: Run complete [run ID, results location, workflow ID]
  Database-->>Web: OK
  User->>+Web: View simulations
  Web->>Database: Look up user [user]
  Database-->>Web: Return [user, sim params]
  User->>+Web: View simulation results
  Web->>Database: Look up user and simulation [run ID, user]
  Database-->>Web: Return [user, sim params]
  Web->>BlobStorage: Fetch results [results location]
  BlobStorage-->>Web: Results [sim results]
  Web->>Database: Request fatality data for region [sim params]
  Database-->>Web: Return fatality data for region [cases]
  Web-->>User: Display [sim results, cases]
```

</details>

![User flow sequence diagram](images/user-flow.png)

## Legend for data labels

The labels in `[square brackets]` describe the data being passed between components of the system.

- `API token`: GitHub API token for a logged-in user
- `cases`: Infection and death counts for a region. These are recorded in the DB from public sources.
- `callback URL`: URL of the web application
- `client ID`: GitHub client ID for the web application
- `client secret`: GitHub client secret for the web application
- `code`: OAuth access code for a logged-in user
- `model URL`: GitHub Package Registry URL for a Docker image that runs an epidemiological model
- `run ID`: ID number for a simulation run in the database
- `shared secret`: A secret key for shared communication between the web application and model runner.
- `sim params`: Parameters for running a simulation. These include a region, user-supplied label, list of proposed policy interventions and dates, and epidemiological parameters.
- `sim results`: Results of running a simulation. These include the simulation parameters along with predicted infection and death counts over a time period.
- `results location`: Azure Blob Storage location for a set of simulation results
- `state`: OAuth state. Sent as a JWT encrypted with a session secret and nonce.
- `user`: GitHub user ID and login name. After login, these are stored in a session cookie.
- `workflow ID`: GitHub Actions workflow run ID number for a simulation run on the control plane repository
