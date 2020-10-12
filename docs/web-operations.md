# Web App Operations

This is internal documentation for the operation of the web application, as
well as local development in "advanced" mode.

## Hosting

This app is hosted on [Vercel][vercel] in the [GitHub COVID
Modelling][vercel-org] organization. For access, ask a current maintainer.

Vercel's preferred way of deploying an application to "production" is to do
it automatically when anything is pushed to the default branch of the
repository. We want a bit more control over deploys than this, so what Vercel
calls our "production" environment is actually what the alias
<https://staging.covid-modeling.org> points to. The real production is
deployed via a repository dispatch event with GitHub Actions. See the [deploy
workflow][deploy-workflow] in the project repo for details.

You can deploy to the tip of the `master` branch to production using a CLI for
sending repository dispatches such as [dpx][dpx]:

```shell
> npx dpx -r covid-modelling/web -t $GITHUB_TOKEN deploy
```

If you're signed into Vercel in your command line environment, you can deploy
to production from there, as well:

```shell
> npx now -b GITHUB_SHA=$(git rev-parse --short HEAD) --prod -A now.prod.json
```

Be **very** careful when deploying in this manner—you are deploying the
current state of your working directory, and _not_ necessarily what's on
GitHub.

Note that the repository has a "prod" branch—this is because Vercel requires
each domain to be tied to some branch. This is a dummy branch and it should
not be pushed to—otherwise, a deploy to prod using the staging-based now.json
file will happen.

### Deploy Locally to Vercel

If you want to deploy your local code to Vercel, an easy way to do that is to
[create an OAuth app for yourself][new-oauth-app]. Give it a callback URL
that points to a Vercel alias you'll use, like
"https://web-jclem.github-covid-modelling.now.sh/api/callback". Then, create
a "now.local.json" (which is .gitignore-d) that includes your OAuth app
credentials and a workflow callback URL pointing to your app:

```json
{
  "regions": ["iad1"],
  "alias": "web-$YOUR_USERNAME.github-covid-modelling.now.sh",
  "build": {
    "env": {
      "BLOB_STORAGE_ACCOUNT": "@staging-blob-storage-account",
      "BLOB_STORAGE_CONTAINER": "@staging-blob-storage-container",
      "BLOB_STORAGE_KEY": "@staging-blob-storage-key",
      "GITHUB_CLIENT_ID": "$YOUR_GITHUB_CLIENT_ID",
      "SENTRY_DSN": "@prod-sentry-dsn",
      "SENTRY_AUTH_TOKEN": "@prod-sentry-token",
      "SENTRY_ORG": "github-disease-modelling",
      "SENTRY_PROJECT": "web-api-ui",
      "SENTRY_ENVIRONMENT": "$YOUR_USERNAME",
      "SESSION_SECRET": "@staging-session-secret"
    }
  },
  "env": {
    "GITHUB_CLIENT_ID": "$YOUR_GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET": "$YOUR_GITHUB_CLIENT_SECRET",
    "GITHUB_API_TOKEN": "@prod-github-api-token",
    "CONTROL_REPO_NWO": "github-covid-modelling/staging-covid19-control-plane",
    "CONTROL_REPO_EVENT_TYPE": "run-simulation",
    "DB_USERNAME": "@staging-mysql-username",
    "DB_PASSWORD": "@staging-mysql-password",
    "DB_HOST": "@staging-mysql-host",
    "DB_DATABASE": "@staging-mysql-database",
    "RUNNER_SHARED_SECRET": "@staging-runner-shared-secret",
    "RUNNER_CALLBACK_URL": "https://web-$YOUR_USERNAME.github-covid-modelling.now.sh",
    "BLOB_STORAGE_ACCOUNT": "@staging-blob-storage-account",
    "BLOB_STORAGE_CONTAINER": "@staging-blob-storage-container",
    "BLOB_STORAGE_KEY": "@staging-blob-storage-key",
    "OAUTH_SECRET": "@staging-oauth-secret",
    "SESSION_SECRET": "@staging-session-secret",
    "SENTRY_DSN": "@prod-sentry-dsn",
    "SENTRY_ENVIRONMENT": "$YOUR_USERNAME"
  }
}
```

Now, you can deploy with `now -A now.local.json`.

## Database

We use an Azure MySQL database, whose credentials can be found in LastPass.
We connect to this using the [serverless-mysql][serverless-mysql] package.
It's not perfect, but it's done well for us, so far. You'll notice
intermittent failure to terminate connections, for example, but we've never
seen it actually affect users.

### Migrations

Migrations are created and run using [db-migrate][db-migrate] inside of some
custom scripts. In order to create a migration locally, you'll want to run
something akin to this:

```shell
> script/db-migrate create name-of-migration --sql-file
```

Notice that we pass the `--sql-file` command: Our migrations are written in
plain SQL instead of db-migrate's JavaScript DSL.

Migrations are run automatically in development every time the web
application starts, so if you need to run a new migration, just use
`docker-compose` to restart the web service:

```shell
> docker-compose restart web
```

You can also manually run them locally:

```shell
> script/db-migrate up
```

In production, migrations are run via a GitHub Actions worksflow. You'll want
to ensure that your migrations are safe to run before the code that requires
them, and use something like [dpx][dpx] to kick off the migration:

```shell
> npx dpx -r github-covid-modelling/web -t $GITHUB_TOKEN db-migrate direction=up count=1 env=staging
```

See the [migration workflow][migration-workflow] for more details.

## Exceptions

We use [Sentry][sentry] to track exceptions and other relevant messages. If
you've got access to our GitHub org, you should automatically have access to
that Sentry org via GitHub OAuth.

## Logs

Logs are streamed to GitHub's internal [Datadog account][datadog]. I haven't
found perusing these to be the best experience, but I wanted to ensure that
we sent them _somewhere_. It's attached to the Vercel org as an
[integration][vercel-integrations]. Datadog integration is not a requirement
and can be disabled if future maintainers don't need it. Though, be aware
that Vercel does not keep logs by default and if you want to keep them, they
must be sent somewhere externally.

## Credentials

There are other credentials—for example, we connect to Azure Blob Storage
directly. All of these are in LastPass, including the ones needed for local
development in [advanced mode][advanced-mode]. Ask another maintainer for
access, should you require it.

[advanced-mode]: ../README.md#advanced-mode-setup-maintainers-only
[datadog]: https://app.datadoghq.com/logs?saved_view=86476
[db-migrate]: http://npm.im/db-migrate
[deploy-workflow]: ../.github/workflows/deploy.yml
[dpx]: https://npm.im/dpx
[migration-workflow]: ../.github/workflows/db-migrate.yml
[new-oauth-app]: https://github.com/organizations/covid-modeling/settings/applications/new
[sentry]: https://sentry.io/organizations/github-disease-modelling/issues/
[serverless-mysql]: https://www.npmjs.com/package/serverless-mysql
[vercel]: https://vercel.com
[vercel-integrations]: https://vercel.com/dashboard/covid-modeling/integrations
[vercel-org]: https://vercel.com/covid-modeling
