const {DefinePlugin} = require('webpack')

// This garbage is just to fix intellisense for the import.
const sentryPluginImport = /** @type {any}  */ (require('@sentry/webpack-plugin'))
/** @type {typeof import('@sentry/webpack-plugin').default} */
const SentryWebpackPlugin = sentryPluginImport

module.exports = {
  env: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    SENTRY_DSN: process.env.SENTRY_DSN,
    APP_ENVIRONMENT: process.env.APP_ENVIRONMENT
  },

  webpack: (config, options) => {
    const commit = process.env.NOW_GITHUB_COMMIT_SHA || process.env.GITHUB_SHA
    const release = commit || options.buildId

    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'js-yaml-loader'
    })

    config.plugins.push(
      new DefinePlugin({
        'process.env.SENTRY_RELEASE': `"${release}"`
      })
    )

    config = nextSourceMaps(config, options)

    const releaseInfo = {
      release,
      repo: 'covid-modeling/web',
      commit
    }

    console.log('Configuring Sentry release:', JSON.stringify(releaseInfo))

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: ['.', '.next'],
          ignore: ['migrations', 'node_modules'],
          ...releaseInfo
        })
      )
    }

    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }

    return config
  }
}

function nextSourceMaps(config, options) {
  if (!options.dev) {
    config.devtool = 'source-map'

    for (const plugin of config.plugins) {
      if (plugin.constructor.name === 'UglifyJsPlugin') {
        plugin.options.sourceMap = true
        break
      }
    }

    if (config.optimization && config.optimization.minimizer) {
      for (const plugin of config.optimization.minimizer) {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.sourceMap = true
          break
        }
      }
    }
  }

  return config
}
