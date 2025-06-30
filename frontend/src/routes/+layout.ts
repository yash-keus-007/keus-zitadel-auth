import { Token } from "$lib/index.js";
import type { Load } from "@sveltejs/kit";

export const ssr = false;


export const load: Load = async ({ data }) => {


    console.log("Loading layout data:", data);
    let accessToken:string = data?.accessToken || "";
    if (accessToken) {
        Token.set(accessToken);
        console.log("Access token set:", accessToken.split("%3Ftoken%3")[0]);
        let user = await fetch("http://localhost:3001/auth/profile", {
            headers: {
                "authorization": `Bearer ${accessToken.split("%3Ftoken%3")[0].split("?token=")[0]}`,
            }
        })
        user = await user.json();
        console.log("User data:", user);
        return {
            user
        }
    }

}