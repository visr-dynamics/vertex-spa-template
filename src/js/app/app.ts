import { User } from 'oidc-client';
import { SimpleSpaceExplorer as SimpleSpaceExplorer } from "./simple-space-explorer"
import Config from '../config';
import { SessionExpirationArgs, VertexAuth } from './vertex-auth';

export default class App {
    /**
     * returns the VERTX Base URL, including https, without a trailing slash.
     * for example: https://vertx.cloud
     */
    get VERTEX_URL(): string {
        return `https://${Config.VERTEX_URL_BASE}`
    }

    get AUTH_REDIRECT_URL(): string {
        return `${location.protocol}//${location.host}/`;
    }

    auth: VertexAuth;

    getUserAsync(): Promise<User> {
        if (!this.auth)
            return null;
        return this.auth.getUser();
    }

    async run() {

        // the VertexAuth class is a small wrapper around the 'oidc-client' module.
        // it makes it a bit easier to get started for devs less familiar with OpenID/OAuth2 by
        // providing default settings and helper methods.
        // Developers who are more experienced with OAuth2 may wish to use oidc-client or another
        // library instead.
        this.auth = new VertexAuth({
            authority: `https://${Config.VERTEX_URL_BASE}/identity`,
            clientId: Config.VERTEX_CLIENT_ID,
            scope: Config.VERTEX_SCOPE,
            redirectUri: this.AUTH_REDIRECT_URL,
            postLogoutRedirectUri: this.AUTH_REDIRECT_URL
        });

        await this.auth.initAsync();
        await this.initializeUi();

        const isSignedIn = await this.auth.checkTokenActive();
        if (isSignedIn) {
            const user = await this.auth.getUser();
            // If we're logged in, then enable session watching.
            // This will cause an event to be fired to indicate that the session is expiring soon.
            // The app should use this function to let the user know they must re-authenticate soon.

            // in general, the application should take advantage of the 5 minute grace period to allow
            // the user to save any work before the session expires.
            this.auth.watchSession(this.onSessionExpiring.bind(this));

            Vertex.Globals.bearerToken = user.access_token;
            // Vertex.Globals.runtime.setBearerToken(this.user.access_token);
        }
    }

    private async initializeUi() {
        const user = await this.getUserAsync();
        const isSignedIn = user && !user.expired;

        // update the UI to reflect sign-in state
        // if signed in, unhide any elements with class 'signed-in-ui'
        if (isSignedIn) {
            const signedInUi = document.querySelectorAll('.signed-in-ui');
            signedInUi.forEach(ele => ele.classList.remove("hidden"));
        }

        // if not signed in, unhide any elements with class 'signed-out-ui'
        if (!isSignedIn) {
            const signedOutUi = document.querySelectorAll('.signed-out-ui');
            signedOutUi.forEach(ele => ele.classList.remove("hidden"));
        }

        // now attatch listeners to the login/logout buttons
        const signInButtons = document.querySelectorAll('[data-action="auth-sign-in"]');
        signInButtons.forEach(ele => ele.addEventListener("click", this.signIn_click.bind(this)));

        const signOutButtons = document.querySelectorAll('[data-action="auth-sign-out"]');
        signOutButtons.forEach(ele => ele.addEventListener("click", this.signOut_click.bind(this)));

        // populate profile info
        if (isSignedIn) {
            const displayName = document.querySelectorAll('[data-bind="auth_displayname"]');
            displayName.forEach((ele: HTMLElement) => ele.innerText = user.profile.name);

            const pictures = document.querySelectorAll('[data-bind="auth_picture"]');
            pictures.forEach((ele: HTMLImageElement) => ele.src = user.profile.picture || "https://www.gravatar.com/avatar");
        }

        // set up the 'open space' button
        const openSpaceButtons = document.querySelectorAll('[data-action="explorer-show"]');
        openSpaceButtons.forEach(ele => ele.addEventListener('click', this.openSpace_click.bind(this)));
    }

    async explorer_onSpaceSelected(id: string) {
        // When a space is selected, create a BABYLON context and begin rendering whatever!
        Vertex.Globals.vertexStackUrl = Config.VERTEX_URL_BASE;
        Vertex.Globals.spaceId = id;

        await VertexBabylon.InitVertexAsync();

        const runtime = Vertex.Globals.runtime as VertexBabylon.VertexBabylonRuntime;
        const scene = runtime.scene;
        runtime.initUniversalCamera(scene);
        runtime.initLighting(scene);
        runtime.initFloor(scene);

        const renderCanvas = document.getElementById("RenderCanvas") as HTMLCanvasElement;
        renderCanvas.classList.remove("hidden");
        renderCanvas.height = window.innerHeight;
        renderCanvas.width = window.innerWidth;
    }

    openSpace_click(event: MouseEvent) {
        // the scene explorer displays a list of spaces.
        // when the user selects one, it fires the callback in "createExplorer"
        const explorer = new SimpleSpaceExplorer();
        explorer.createExplorer(this.explorer_onSpaceSelected.bind(this));
    }

    signIn_click(event: MouseEvent) {
        this.auth.loginAsync("login");
    }

    signOut_click(event: MouseEvent) {
        this.auth.logoutAsync();
    }

    onSessionExpiring(args: SessionExpirationArgs) {
        console.log("[App] Session Expiring Soon!", args);
    }
}