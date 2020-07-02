import { UserManager } from 'oidc-client'

export class VertexAuth {
    private config: VertexAuthConfig = null;
    protected userManager: UserManager = null;

    constructor(config?: VertexAuthConfig) {
        if (config)
            this.config = config;
    }

    public setConfig(config: VertexAuthConfig) {
        if (config)
            this.config = config;
    }
    public async initAsync() {
        this.userManager = new UserManager({
            authority: this.config.authority,
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            post_logout_redirect_uri: this.config.postLogoutRedirectUri,
            response_type: 'code',
            response_mode: 'query',
            scope: this.config.scope,
            // these options require an iframe to identity
            // this will no longer work as browsers adopt new SameSite cookie rules
            // so we will disable them to enable consistent behaviour.
            automaticSilentRenew: false,
            monitorSession: false,
        })

        if (this.isCallback()) {
            let signinResult = await this.userManager.signinRedirectCallback();
            // remove the state etc from the URL
            history.replaceState({}, null, this.config.redirectUri);
        }

        // maintain the local storage
        this.userManager.clearStaleState();
    }

    public watchSession(onExpiring: (args: SessionExpirationArgs) => void) {
        let self = this;
        setInterval(async () => {
            console.log("[VERTX:Auth] Checking session state...")
            let isActive = await self.checkTokenActive.call(self);
            if (!isActive) {
                console.warn("[VERTX:Auth] Session expired, invoking expired callback");
                const remainingTime = this.getRemaningUserTime.call(self);
                onExpiring({
                    remainingTime: remainingTime
                });
            }
        }, 10 * 1000 /* 10 seconds */);
    }

    public getUser() {
        if (!this.userManager)
            return null;

        return this.userManager.getUser();
    }
    /**
     * redirects to the VERTX authentication page, to prompt the user to sign in.
     * 
     * if the 'prompt' parameter is omitted, then VERTX will automatically sign the user in
     * if possible.
     * 
     * if 'prompt' is set to "login", VERTX will always confirm which account to continue with.
     * this is always recommended when the user explicitly clicks a "sign in" button.
     * 
     * if 'prompt' is set to "none", VERTX will attempt to log in silently. if any user interaction
     * is required, an error will be returned.
     * 
     * @param prompt (optional) - nothing, "login" or "none".
     * @returns 
     */
    public loginAsync(prompt?: "login" | "none") {
        return this.userManager.signinRedirect({
            prompt: prompt
        });
    }
    public loginGuestAsync(args?: GuestLoginArgs) {
        args = Object.assign({}, args);
        let params = {};
        params['hint_vertex_guest'] = '1';
        if (args.silentHint === true) {
            params['hint_silent'] = '1';
        }
        if (typeof args.displayNameHint === 'string') {
            params['hint_username'] = args.displayNameHint;
        }
        if (args.acceptedTermsHint === true) {
            params['hint_tandc'] = '1';
        }
        return this.userManager.signinRedirect({
            extraQueryParams: params
        });
    }
    public async logoutAsync(signOutExternal?: boolean): Promise<void> {
        const user = await this.getUser();

        // if we have an id_token_hint, pass it along for a more seamless sign out.

        const tokenHint = user && user.id_token || null;
        return this.userManager.signoutRedirect({
            id_token_hint: tokenHint,
            extraQueryParams: {
                signout_external: signOutExternal
            }
        });
    }
    private isCallback() {
        const params = new URLSearchParams(location.search);
        return params.has("code");
    }
    public async checkTokenActive() {
        // perform some test to validate if the user is still signed in
        let user = await this.userManager.getUser();
        if (!user || user.expired || user.expires_in < 300)
            return false;
        // todo: make a test request to see if the token is still valid
        return true;
    }
    public async getRemaningUserTime() {
        let user = await this.userManager.getUser();
        if (user && !user.expired) 
            return user.expires_in;
        
        return 0;
    }
}
export interface VertexAuthConfig {
    authority: string;
    clientId: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    scope: string;
}
export interface GuestLoginArgs {
    /**
     * Hints Vertex Identity to attempt to perform the guest signin silently.
     * (Vertex Identity will avoid showing any Vertex UI to the user).
     * This will only be honoured if the displayName is considered valid,
     * and if acceptedTerms is true.
     * If silent mode cannot be achieved, the user will see the Vertex Identity
     * prompt for a display name.
     * */
    silentHint?: boolean
    /**
     * Hints the display name for Vertex Identity to use.
     * When silent is true, this is the display name that the guest will be assigned.
     * If silent is false, this value will be used to prefill the guest name text field.
     * */
    displayNameHint?: string
    /**
     * Hints to Vertex Identity that the user has accepted the terms and conditions.
     * This *MUST NOT* be set to true unless the user has already explicitly agreed
     * to the vertex Terms and Conditions.
     * */
    acceptedTermsHint?: boolean
}

export interface SessionExpirationArgs {
    remainingTime: number
}