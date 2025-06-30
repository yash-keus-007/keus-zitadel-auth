import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const authConfig = {
    // authority: 'https://test-2x4h3a.us1.zitadel.cloud', //Replace with your issuer URL
    // client_id: '324017227412109143', //Replace with your client id
    // redirect_uri: 'http://localhost:3000/auth/callback', // Point to backend callback
    // response_type: 'code',
    // scope: 'openid profile email',
    // post_logout_redirect_uri: 'http://localhost:5173',
    // userinfo_endpoint: 'https://test-2x4h3a.us1.zitadel.cloud/oidc/v1/userinfo', //Replace with your user-info endpoint
    // response_mode: 'query' as const,
    // code_challenge_method: 'S256',
    // Backend endpoints
    backend_url: 'http://localhost:3001'
  };

  // export const userManager = new UserManager({
  //     userStore: new WebStorageStateStore({ store: window.localStorage }),
  //     ...authConfig,
  //   });

