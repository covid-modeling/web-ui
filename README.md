# COVID Modelling Web UI [![.github/workflows/deploy.yml](https://github.com/covid-modeling/web/workflows/.github/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/covid-modeling/web/actions?query=branch%3Amaster)

This is a [Next.js][nextjs] application that serves the GitHub
COVID modelling web interface. It is hosted on [Vercel][vercel].

The needs of the unified modelling project are changing rapidly, and so we do
not have a set-in-stone development roadmap. This application is built with
the goal of it hopefully being not too difficult to alter or even rewrite
parts of it as requirements change.

To learn more about this project's goals, please see [PROJECT-INTENT.md](PROJECT-INTENT.md)

## Local Development

This app has two development modes: "local" and "advanced" mode. The "local"
mode is a much easier development setup, but does not actually queue
simulation runs with the development control plane. Instead, it uses a
stubbed result. The "advanced" mode is for maintainers only—it requires
access to some shared credentials and accounts.

### Shared Setup (for both local and advanced modes)

1. Install and start [Docker][docker].
1. Get the [OAuth development app][oauth] client ID and secret. You'll be prompted for them shortly.
1. Clone this repository:

   ```shell
   > git clone https://github.com/covid-modeling/web
   > cd web
   ```

1. Install dependencies:

   ```shell
   > npm install
   ```

### Local Mode Setup

1. Run the environment setup script:

   ```shell
   > script/setup
   ```

   This script will ask you a series of questions—you'll want to answer that
   yes, you do want to run in local mode.

1. Start the server:

   ```shell
   > script/server
   ```

1. Setup the database:

   ```shell
   > script/db-create
   ```

   ```shell
   > script/db-migrate up
   ```

1. Fetch case data:

   This script requires some environment variables (see
   `script/fetch-recorded-data --help`), but if you've already got your .env
   set up, you can run the script with [foreman][foreman] to avoid manually
   setting them:

   ```shell
   > npx foreman run script/fetch-recorded-data
   ```

1. Authorize your local user to log in:

   ```shell
   > script/authorize-local-user $my_github_username
   ```

### Advanced Mode Setup (Maintainers Only)

Advanced mode requires a number of secrets documented in [env.yml](env.yml),
whose development values can be accessed by following instructions in the
private [maintainers-only documentation][maintainer-docs].

1. Start an HTTP [ngrok proxy][ngrok] pointing to port 3000 and
   note its URL (such as "https://e028f3f1.ngrok.io"):

   ```shell
   > ngrok http 3000
   ```

1. Run the environment setup script:

   ```shell
   > script/setup
   ```

   This script will ask you a series of questions—you'll want to answer that
   no, you don't want to run in local mode.

   This script will now ask for a number of environment variables, each of
   which can be accessed by following instructions in the [maintainer
   docs][maintainer-docs].

   It'll also ask you for a `RUNNER_CALLBACK_URL`, which should be the value of
   your ngrok proxy.

1. Start the server:

   ```shell
   > script/server
   ```

1. Fetch case data:

   This script requires some environment variables (see
   `script/fetch-recorded-data --help`), but if you've already got your .env
   set up, you can run the script with [foreman][foreman] to avoid manually
   setting them:

   ```shell
   > npx foreman run script/fetch-recorded-data
   ```

1. Authorize your local user to log in:

   ```shell
   > script/authorize-local-user $my_github_username
   ```

### Database & Migrations

In development, database migrations are run automatically when the web
container starts.

To create a database migration:

```shell
# Create a migration
> script/db-migrate create name-of-migration --sql-file
```

We pass the `--sql-file` here because we write migrations in plain SQL in
this project.

### Environment Variables

Environment variables are documented in [env.yml](env.yml).

## Architecture

- Pages are in `pages/{route}.tsx`.
- Components are in `components/{Component}.tsx`.
- API functions are in `pages/api/{route}.tsx`.

### Useful Documentation

- [Next.js pages](https://nextjs.org/docs/basic-features/pages)
- [Next.js API routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel serverless functions](https://zeit.co/docs/v2/serverless-functions/introduction)
- [Vercel environment variables and secrets](https://zeit.co/docs/v2/serverless-functions/env-and-secrets)
- [React documentation](https://reactjs.org/docs/getting-started.html)

## Updating Case Data and Intervention Data

The `case_data` and `intervention_data` tables are populated by the `fetch-recorded-data` script.
This is run nightly on staging and production.

## Contributing

We welcome contributions to this project from the community. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the MIT license. See [LICENSE](LICENSE).

[docker]: https://www.docker.com/get-started
[dpx]: https://npm.im/dpx
[foreman]: https://npm.im/foreman
[maintainer-docs]: https://github.com/covid-modeling/project-docs-internal/blob/master/docs/web-operations.md
[nextjs]: https://nextjs.org
[ngrok]: https://ngrok.com/
[oauth]: https://github.com/organizations/covid-modeling/settings/applications/1253529
[prod]: https://covid-modeling.org
[staging]: https://staging.covid-modeling.org
[vercel]: https://vercel.com
[vercel-org]: https://zeit.co/covid-modeling
