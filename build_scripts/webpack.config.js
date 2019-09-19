const BabiliPlugin = require("babili-webpack-plugin");
const WebpackAutoInject = require('webpack-auto-inject-version');

module.exports = {
    entry: {
        app: './pwa/src/es6/main/App.js',
        channel_editor: './pwa/src/es6/eventHooks/ChannelEdit.js',
        show_program: './pwa/src/es6/eventHooks/Program.js',
        sw: './pwa/sw.js',
    },
    output: {
        filename: './pwa/[name].js'
    },
    // devtool: 'source-map',
    plugins: [
        // new BabiliPlugin(),
        new WebpackAutoInject(),
    ]
};