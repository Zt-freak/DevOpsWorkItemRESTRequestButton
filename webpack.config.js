const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const entries = {};

const ComponentsDir = path.join(__dirname, "src/Components");
fs.readdirSync(ComponentsDir).filter(dir => {
    if (fs.statSync(path.join(ComponentsDir, dir)).isDirectory()) {
        entries[dir] = "./" + path.relative(process.cwd(), path.join(ComponentsDir, dir, dir));
    }
});

module.exports = {
    entry: entries,
    output: {
        filename: "[name]/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css?$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.woff?$/,
                type: 'asset/inline'
            },
            {
                test: /\.html?$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
           patterns: [
               { from: "**/*.html", context: "src/Components" }
           ]
        })
    ]
};
