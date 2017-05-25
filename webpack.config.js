// npm-run uglifycss pwa/style.css > pwa/style.min.css & npm-run webpack & npm-run html-minifier pwa/dev-index.html -o pwa/index.html --collapse-whitespace --remove-comments
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    entry: './pwa/es6/App.js',
    output: {
        filename: './pwa/app.js'
    },
    devtool: 'source-map',
    plugins: [
        new BabiliPlugin(),
    ]
};