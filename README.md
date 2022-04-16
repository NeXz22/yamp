# yamp

YAMP (yet another mobbing program) is yet another tool for mob-programming-sessions.

Built with Angular, PrimeNG, Express (JS) & Socket.IO

Use the app under http://add-me-later.com/ 
or deploy the app on your own server by cloning the repo 
or forking it.


# Development
 
Frontend (_in '/frontend/'_): `npm ci` & `ng serve`

Server (_in '/server/'_): `npm ci` & `node index.js` (run in dev-mode with env: `dev=true`)

# Production

Running `ng build` in frontend-root-directory compiles frontend-app into _'dist-frontend'_-folder 
in the _'server'_-root-directory.