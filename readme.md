# VERTX Single Page App Template

## Quick Start
0. Open a terminal/command prompt/powershell
1. Configure NPM to use the VERTX registry \
`npm config set registry https://packages.vertx.cloud/`  
 *The VERTX npm packages are currently only available from this registry, not npmjs.org*.
2. [Fork](#manually-forking-the-template) or clone the repo \
`git clone https://github.com/visr-dynamics/vertex-spa-template.git my-project-name`  
or [see the manual forking instructions below](#manually-forking-the-template).
4. Enter the project folder  
`cd my-project-name`
5. Install build tools and dependencies with npm install  
`npm i` or `npm install`
6. Start the development server  
`npm run dev`
7. Go to http://localhost:3000/ in a browser  
You should see the "Hello VERTX" page.

## Development
### IDE 
You can use any development environment you like, but we recommend [Visual Studio Code](https://code.visualstudio.com/) for webpack development. We like it because:
* It has an integrated terminal (`Ctrl` + `'` on Windows), making it easier to run `npm` commands, and stop/restart the webpack dev server, as well as easier Docker builds etc.
* It supports browser debugging, lessening the requirement to use browser devtools to debug TypeScript code.
* It has great IntelliSense for TS/HTML/SCSS files, as well as errors from Webpack builds.

### Build and Run
The template is a relatively simple SPA template using TypeScript, SCSS and Webpack. **It does not depend on React, Angular, or any other frameworks**. However, the VERTX examples are plain enough that they should be easily adaptable into frameworks if desired.

The build starts with `npm run dev`, which runs the `dev` script in `package.json`. In turn, this runs `webpack-dev-server`, which will compile the project using `webpack` and host the webapp on a local URL.

Webpack loads the `webpack.config.js` file, which tells Webpack how to build and run the project.  
This config is preconfigured to:
* Compile `src/index.ts` (including dependencies) into a `main.js` output file.
* Compile any `.scss` (sass) files included in `index.ts` to a single `main.css` output file.
* Copy `src/html` files directly to the output.
* Copy some "old" non-module JavaScript dependencies directly to the output

If you want to modify or extend the config, or are just interested in Webpack, you can learn more [here](https://webpack.js.org/concepts/).

Because we ran `webpack-dev-server`, the output will be hosted on a local webserver at `http://localhost:3000` (by default).

### From Browser to Code
If this is your first time with Web Development, it's useful to know how your TypeScript code ends up running in the browser.

When you visit this server, the browser will download and render `index.html`.  
Eventually, the browser will encounter the `<script src="/js/main/main.js"></script>` tag from the html file.  
This tells the browser to download and run the `main.js` file - this is the file that Webpack compiled, starting at `src/index.ts`.  
If you're curious, you can have a look at this file to see how the TypeScript converts to JavaScript, and how the different files have been imported into a single file.

In this template, there are some additional `<script>` tags included before `main.js`. These are loaded the 'old fashioned' way, rather than by Webpack.
> **NOTE**  
> While libraries like Babylon.js and Bootstrap *can* be imported via Webpack, for technical reasons, **babylon must be loaded before VERTX, and before your webpack main**.

### The App Class
The `App` class is the main entrypoint of our app (`index.ts`) only creates a `new App()` and calls `app.run()`.

The `run` method does a few simple things:
* Initializes the `VertexAuth` class, which provides sign-in/sign-out, user info, and session management.
* Initializes the UI - showing the relevant parts based on state, and setting up button event handlers etc.  
  This includes linking up the "Select Space" button to the `App.openSpace_click` function.

After the user selects a space (`App.onSpaceSelected`), we initialize Vertex and a BABYLON context, then we unhide the Canvas so it's visible on the page.

### Next Steps
After connecting to a VERTX space (`VertexBabylon.InitVertexAsync()`), create a Node with a `Transform` and `GltfComponent`, and add the node to the space!

You can use VERTX's Space Viewer to join the same space, and you should see the created node. Similarly, a node created from the Space Viewer should show up in your app.

You probably want to add some code to improve the Babylon experience, such as some camera or movement controls.

Finally, you should try to register a custom Component System so you can use your own components beyond Transform and GltfComponent.

## Deployment
> **IMPORTANT**  
> You **will** encounter login errors when running the app on a URL other than `http://localhost:3000`.  
> This is because you need to register your Web App with VERTX before you can sign users in.
> 
> Please contact us for assistance with App Registration

### Basic Build
The Webpack output is a static web project (e.g. no backend is required, just a static file host).

If you are comfortable hosting these files yourself, you can run `npm run build` to get Webpack to build the project.  
The output will appear in a folder named `wwwroot`.  

### Docker
This template also includes a `Dockerfile`, which will run the Webpack build within a container, and host the results using a web server called "Caddy".  

You can build an image using `docker build -t my-app:latest .`, or use the convenience script `npm run docker-build`.  
> **NOTE**  
> You should edit the `docker-build` and `docker-push` scripts within `package.json` to provide your own image name.

You can test your image by running the docker image locally:
1. `docker run --name my-app-container -p 3000:80 my-app:latest`  
  Replace `my-app` with your image name
2. Visit `http://localhost:3000` to check the build.

If you are encountering issues, make sure to stop the webpack dev server first, otherwise port 3000 will already be in use.

Once you're happy, you can push the image to Dockerhub or your own private Docker registry.  

You can host your container however you like, but `Azure App Service` or `Azure Containers` are one fast way to run a container in the cloud.

## Manually Forking the Template
We recommend that you keep this git repository linked to your project, in case you ever want to pull in any changes to this base template.

If your repository is hosted on Github, this is easy - just fork this project using the Github website.  
For all other cases, you need to manually add this repo as an additional 'remote' in git.

Normally, a git repo only has one remote, called 'origin'. 'origin' is the URL of the repo that you originally cloned. However, you can add additional remotes, and you can push/pull branches between different remotes.

### If you originally cloned the template
If you cloned this repo directly, but want to turn it into your own repo, you will need to do the following steps:
* Change the `origin` remote to another name, such as `vertex-github`
* Add a new remote called `origin`, pointed at your own repo.

You will then push your code to the new `origin` (your own repo) as usual.  
If you want to merge in changes to the template, you can then pull `master` from `vertex-github` instead of from `origin`, and merge it.

1. Verify your current remotes:  
```
git remote -v

<output>: 
origin  https://github.com/visr-dynamics/vertex-spa-template.git (fetch)
origin  https://github.com/visr-dynamics/vertex-spa-template.git (push)
```
2. Rename `origin` to another name
```
git remote rename origin vertex-github
git remote -v

<output>:
vertex-github  https://github.com/visr-dynamics/vertex-spa-template.git (fetch)
vertex-github  https://github.com/visr-dynamics/vertex-spa-template.git (push)
```

3. Add a new `origin` remote pointing at your repo
```
git remote add origin https://git.example.com/your-repo-url.git
```


### If you originally created/cloned your own repo
If you started your own repo first but want to pull in the template, simply add this repo as a new origin:
```
git remote add vertex-github https://github.com/visr-dynamics/vertex-spa-template.git
```