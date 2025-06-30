
import { authUrl } from '$lib/index.js';
import { redirect, type Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {

    if (event.url.pathname == '/logout') {
        event.cookies.delete('auth_token', { path: '/' })
        throw redirect(303, '/')
    }
    const token = event.url.searchParams.get('token');
    
    if (token) {
        event.cookies.set('auth_token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60
        });
        throw redirect(303, '/');
    }
    const authToken = event.cookies.get('auth_token');

    if (!authToken && event.url.pathname !== '/login') {
        throw redirect(303, authUrl);
    }
    return resolve(event);
};