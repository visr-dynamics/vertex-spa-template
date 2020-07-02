# VERTX Single Page App Template

This guide assumes the use of a terminal (such as PowerShell), [Visual Studio Code](https://code.visualstudio.com) and [node.js](https://nodejs.org). 

## Getting started
1. Configure NPM to use the VERTX registry \
`npm config set registry https://packages.vertx.cloud/`
2. Clone the package  \
`git clone https://git.example.com/template.git`
4. Change directory to the repository\
`cd template`
5. Install the required packages\
`npm i` or `npm install`
6. Open the folder in Visual Studio Code\
You can do this with `code .`
7. Start the development server using `npm run dev`\
Node: you will need to restart the server if you make any changes to `webpack.config.js`
8. In a browser navigate to http://localhost:8080/ and you should be greeted with the welcome page

### Entry
The app’s entry point is `index.ts`, but all application logic should begin in `app.ts`.
In `app.ts` there are two functions to get you started, `onApplicationRun()` and ` onVertexInitialised(string)`
#### `onApplicationRun()`
This will be the first thing to be run when your application starts, before the sign in flow
#### `onVertexInitialised(string)`
This is run once the Vertex initialisation is complete and the space is visible.

## Deployment
Deployment requires [Docker](https://docker/io) to be installed. There are a number of really nice Docker extensions for VSCode, however we will be using the terminal here.
1. Ensure the Dockerfile contains all required build steps. By default this is 
```dockerfile
from caddy:alpine
COPY ./ /usr/share/caddy
```
The first line takes the image base from a lightweight HTTP server, the second copies all files from our current working directory into the image.
2. In the terminal run `docker build -t <IMAGE NAME> .` where `<IMAGE NAME>` is the name you want to give the image. For example, `my-first-app`. \
You should have output a little like this. You can now test the image on your local machine with `docker run —name <CONTAINER NAME> -p 80:80 <IMAGE NAME>:latest`. You can verify this has worked by visiting http://localhost/ in your browser.

Finally to push your image, simply use `docker push docker-registry.example.com/<IMAGE NAME>:latest`