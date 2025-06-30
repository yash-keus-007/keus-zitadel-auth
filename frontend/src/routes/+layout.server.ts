import type { LayoutServerLoad } from "./$types.js"

export const load: LayoutServerLoad = async ({ cookies }) => {
    let accessToken = cookies.get('auth_token')
    return {
        accessToken
    }
}