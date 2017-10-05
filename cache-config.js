module.exports = {
  cacheId: 'olho-nagua',
  navigateFallback: '/index.html',
  handleFetch: true,
  verbose: true,
  stripPrefix: 'dist',
  root: 'dist/',
  staticFileGlobs: [
    'dist/index.html',
    'dist/**/*.{html,css,js,jpg,jpeg,png,svg,ttf,woff,woff2}',
    'dist/styles/fonts/*.{woff}*',
    'dist/manifest.json'
  ],
  runtimeCaching: [{
    urlPattern: /^https:\/\/fonts.(?:googleapis|gstatic).com\/.*/,
    handler: 'cacheFirst',
    urlPattern: /^https:\/\/api.insa.gov.br\/.*/,
    handler: 'networkFirst'
  }]
};
