
module.exports = {
    entry: {
        app: './pwa/es6/main/App.js',
        channel_editor: './pwa/es6/eventHooks/ChannelEdit.js',
        show_program: './pwa/es6/eventHooks/Program.js',
    },
    output: {
        filename: './pwa/[name].js'
    },
    devtool: 'source-map'
};