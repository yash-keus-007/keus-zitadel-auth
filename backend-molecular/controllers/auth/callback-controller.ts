import { zitaDelConfig } from "../../config/authConfig";
import { getUserInfo, getTokenFromHeader, getProjectRoles, getDbProjectRoles, addRoleToJsonDB, removeRoleFromJsonDB, codeVerifiers, generatePKCE, generateJWTAssertion, extractUserInfoAndRoles, getRoutePermissions } from "../../utils/helpers"
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { DecodedToken } from "types/auth-types";
import { users } from "../../db/users";

export const callbackController = async (req: any, res: any) => {
    const { code, state } = req.query;
    console.log('Callback received with query:------', code, state);
    if (!code || !state) {
        return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    const codeVerifier = codeVerifiers.get(state);
    if (!codeVerifier) {
        return res.status(400).json({ error: 'Invalid state parameter' });
    }

    try {
        const clientAssertion = generateJWTAssertion();
        console.log('Client Assertion:', clientAssertion);
        const tokenResponse = await axios.post(`${zitaDelConfig.issuer}/oauth/v2/token`, new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: zitaDelConfig.client_id || '',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: clientAssertion,
            code: code as string,
            redirect_uri: zitaDelConfig.redirect_uri || '',
            code_verifier: codeVerifier
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, id_token, refresh_token } = tokenResponse.data;

        const decodedToken = jwt.decode(id_token);
        console.log('Decoded access_token', access_token);
        console.log('Decoded id_token', decodedToken);
        const userInfo = extractUserInfoAndRoles(decodedToken as DecodedToken)
        users.set(userInfo.id, userInfo)
        codeVerifiers.delete(state);

        const frontendUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173');
        frontendUrl.searchParams.set('token', access_token);

        res.status(200).send(
            `<script>(()=>{window.location.href = "${frontendUrl}?token=${access_token}"})()</script>`
        );

    } catch (error: any) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.status(400).json({
            error: 'Token exchange failed',
            message: error.response?.data?.error_description || 'Failed to exchange code for tokens'
        });
    }

}