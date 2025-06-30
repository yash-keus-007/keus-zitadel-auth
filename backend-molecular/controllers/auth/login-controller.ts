import { zitaDelConfig } from "../../config/authConfig";
import { getUserInfo, getTokenFromHeader, getProjectRoles, getDbProjectRoles, addRoleToJsonDB, removeRoleFromJsonDB, codeVerifiers, generatePKCE, generateJWTAssertion, extractUserInfoAndRoles, getRoutePermissions } from "../../utils/helpers"
import crypto from 'crypto';



export const loginController = async (req: any, res: any) => {
    try {
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = crypto.randomBytes(16).toString('hex');

    codeVerifiers.set(state, codeVerifier);

    const clientType = req.query.type || "web";

    let redirectUri = zitaDelConfig.redirect_uri;
    if (clientType == "mobile-app") {
      const protocol = req.protocol;
      const host = req.get("host");
      redirectUri = `${protocol}://${host}/auth/appcallback`;
    }

    console.log('Redirect URI:', redirectUri);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: zitaDelConfig.client_id || '',
        redirect_uri: zitaDelConfig.redirect_uri,
        scope: "openid profile email",
        prompt: 'login',
        idp_hint: 'zitadel',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
     const authUrl = `${zitaDelConfig.issuer}/oauth/v2/authorize?${params.toString()}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating login:", error);
    res.status(500).send("Internal Server Error");
  }
}