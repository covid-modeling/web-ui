/** @type {(string | [string, object])[]} */
const plugins = ['postcss-import', 'tailwindcss', 'autoprefixer']

if (process.env.NODE_ENV === 'production') {
  plugins.push([
    '@fullhuman/postcss-purgecss',
    {
      content: ['**/*.tsx', '**/*.module.css', 'css/app.css'],
      whitelistPatterns: [/^ReactVirtualized/, /bg-*/, /text-severity*/]
    }
  ])
}

module.exports = {
  plugins
}
