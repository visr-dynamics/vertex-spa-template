// used to resolve paths in the filesystem
const path = require("path");
// used to allow for scss/css files to be imported by webpack
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// used to copy files from node_modules to output as a build step
const CopyPlugin = require('copy-webpack-plugin');


/** commonly used directories, for convenience */
const dir = {
  /** the src directory */
  src: path.join(__dirname, "src"),
  /** the node_modules directory */
  node_modules: path.join(__dirname, "node_modules"),

  /** the src/js directory */
  jssrc: path.join(__dirname, "src", "js"),
  /** the src/html directory */
  htmlsrc: path.join(__dirname, "src", "html"),
  /** the src/css directory */
  csssrc: path.join(__dirname, "src", "css"),
  /** the src/img directory */
  imgsrc: path.join(__dirname, "src", "img"),

  /** the wwwroot (output) directory */
  wwwroot: path.join(__dirname, "wwwroot"),

  /** the vendor output directory.
   * we put third-party css/js etc inside this folder to keep them tidy
   * and away from our code. as they often have varying internal layouts, 
   * it's easier to organise them this way.
   */
  vendor: path.join(__dirname, "wwwroot", "vendor"),
}

module.exports = {
  mode: "development",
  // specify the webpack entrypoints.
  // if your app evolves to require multiple pages, you can specify more
  // entrypoint files here.
  entry: {
    // declare the 'main' entrypoint
    "main": path.join(dir.jssrc, "index"),
  },
  output: {
    path: dir.wwwroot,
    publicPath: "/",
    filename: "js/[name]/main.js",
    chunkFilename: "[id].js",
  },
  // configure webpack plugins
  plugins: [
    // configure the css importer
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "[id].css",
    }),
    // confgure the copy plugin.
    // this is used to copy non-imported files and resources to the output directory
    new CopyPlugin({
      patterns: [
        // copy all html files from src/html to the output (wwwroot) folder
        {
          from: dir.htmlsrc
          // Note: it's not required to specify the 'to:' path when copying directly to output root
        },

        // copy all files from src/img to wwwroot/img
        {
          from: dir.imgsrc,
          to: path.join(dir.wwwroot, "img")
        },

        // copy non-module vendor (third-party) js files directly to output
        // vertex-client (vendor)
        {
          from: path.join(dir.node_modules, "com.visr-vr.vertex.jsclient", "src"),
          to: path.join(dir.vendor, 'vertex-client'),
        },

        // vertex-babylon-client (vendor)
        {
          from: path.join(dir.node_modules, "com.visr-vr.vertex.jsclient-babylon", "src"),
          to: path.join(dir.vendor, 'vertex-client-babylon'),
        },

        // bootstrap (vendor)
        {
          from: path.join(dir.node_modules, "bootstrap", "dist", "js"),
          to: path.join(dir.vendor, "bootstrap")
        },

        // babylon (vendor)
        {
          from: path.join(dir.node_modules, "babylonjs"),
          to: path.join(dir.vendor, 'babylon')
        },
        // babylon loaders/postprocess
        {
          from: path.join(dir.node_modules, "babylonjs-loaders"),
          to: path.join(dir.vendor, 'babylon')
        },
        {
          from: path.join(dir.node_modules, "babylonjs-post-process"),
          to: path.join(dir.vendor, 'babylon')
        },
      ]
    })
  ],
  module: {
    // declare webpack rules.
    // this tells webpack how to compile 'import'ed files 
    rules: [
      // use the ts-loader to compile TypeScript (ts/tsx) files 
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      // use the css loader to compile sass/scss files into css
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ],
      },
    ],
  },
  resolve: {
    // 'resolve' options control how 'import' statements are handled

    // here, we configure what file extensions to try when importing.
    // for example,
    // import { something } from "mymodule"
    // will look for mymodule.ts, then mymodule.js
    extensions: [
      ".ts",
      ".js",
    ],

    roots: [
      dir.src
    ],

    // aliases can be used when a single javascript file contains multiple modules.
    // normally, module files should contain only one module, with the file name matching the module name.
    // however, some libraries (especially older ones) will bundle multiple modules together.
    // this confuses webpack by default, but by declaring aliases, you can tell webpack which file to find a module in.
    //alias: {
      // the template doesn't require any aliases, but here is an example configuration.
      // this example declares that the module called "bloodhound" can be found in node_modules/typeahead.js/dist/typeahead.bundle.min.js
      // "bloodhound": path.resolve(dir.node_modules, "typeahead.js", "dist", "typeahead.bundle.min.js")
    //}
  },
  devtool: "source-map",
  // dev server settings.
  // these settings only affect the webpack dev server ('npm run dev' or 'npx webpack-dev-server')
  // they have no effect on the web server within the docker image.
  devServer: {
    contentBase: path.join(__dirname),
    inline: true,
    host: "localhost",
    port: 3000,
    // this setting is sometimes useful.
    // by default, webpack dev server only compiles files in-memory - it doesn't write to the disk.
    // this is good for performance but makes it hard to debug/inspect file output issues.
    // enabling this setting forces webpack to write outputs to the disk so you can more easily browse them.
    // this should normally be disabled to increase dev performance

    // writeToDisk: true
  },
};
