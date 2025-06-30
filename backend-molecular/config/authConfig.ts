import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config(); 

type JWTDataType = {
    appId?: string;
    keyId?: string;
    key?: string;
    type?: string;
    clientId?: string;
}

let jwtKeyData:JWTDataType = {};
try {
    const keyPath = path.join(__dirname, '../assets/jwt-key.json'); // Adjust path as needed
    if (fs.existsSync(keyPath)) {
        jwtKeyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    }
} catch (error) {
    console.warn('JWT key file not found or invalid, using environment variables');
}

export const zitaDelConfig = {
    authority: process.env.ZITADEL_ISSUER,
    issuer: process.env.ZITADEL_ISSUER, 
    client_id: process.env.APP_CLIENT_ID, 
    clientSecret: process.env.APP_CLIENT_SECRET, 
    redirect_uri: process.env.ZITADEL_REDIRECT_URI || 'http://localhost:3001/auth/callback/zitadel',
    response_type: 'code',
    scope: process.env.ZITADEL_PROJECT_SCOPE,
    post_logout_redirect_uri: 'http://localhost:5173',
    userinfo_endpoint: `${process.env.ZITADEL_ISSUER}/oidc/v1/userinfo`, // Replace with your user-info endpoint
    response_mode: 'query',
    code_challenge_method: 'S256',
    uiConstants: {
        endpoint: "http://localhost:5173",
    },
    projectId: process.env.PROJECT_ID, 
    
    serviceUser: {
        client_id: process.env.SERVICE_USER_CLIENT_ID, 
        client_secret: process.env.SERVICE_USER_CLIENT_SECRET,
        scope: process.env.SERVICE_USER_SCOPE,
        audience: process.env.SERVICE_USER_AUDIENCE, 
        grant_type: process.env.SERVICE_USER_GRANT_TYPE,
    },
    jwt: {
        appId: jwtKeyData.appId || process.env.ZITADEL_APP_ID,
        keyId: jwtKeyData.keyId || process.env.ZITADEL_KEY_ID,
        key: jwtKeyData.key || process.env.ZITADEL_PRIVATE_KEY,
        type: jwtKeyData.type || 'application',
        clientId: jwtKeyData.clientId || process.env.ZITADEL_CLIENT_ID
    },
}

export const serverConfig = {
    uiConstants: {
        endpoint: "http://localhost:5173",
    },

}
