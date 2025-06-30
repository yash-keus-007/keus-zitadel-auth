<script lang="ts">
    import { goto } from "$app/navigation";
    import { authConfig } from "$lib/authConfig.js";
    import { auth, user } from "$lib/index.js";
    import { onMount } from "svelte";
    import axios from "axios";

    let isAuthenticated = false;
    let userProfile: any = null;

    // Check if user is already authenticated (has token from backend)
    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            // Store token and fetch user profile
            localStorage.setItem("access_token", token);
            // fetchUserProfile(token);
            // Clean up URL
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
            );
        } else {
            // Check if we have a stored token
            const storedToken = localStorage.getItem("access_token");
            if (storedToken) {
                // fetchUserProfile(storedToken);
            }
        }
    });

    const handleSyncRoles = async () => {
        await axios.post(
            `${authConfig.backend_url}/api/sync-roles`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            },
        );
    };

    const handleLogin = () => {
        // Redirect to backend login endpoint
        window.location.href = `${authConfig.backend_url}/auth/login`;
    };

    const handleLogout = async () => {
        localStorage.removeItem("access_token");
        isAuthenticated = false;
        userProfile = null;
        // Redirect to backend logout
        // await fetch(`${authConfig.backend_url}/auth/logout`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });
        user.set(null);
        auth.set(false);
        console.log("User logged out");
        // window.location.href = `/logout`;

        await axios.get(
            `${authConfig.backend_url}/auth/logout`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            },  
        );
        window.location.href = `/logout`;
    };

    // const fetchUserProfile = async (token: string) => {
    //     try {
    //         const response = await fetch(`${authConfig.backend_url}/auth/profile`, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         });

    //         console.log('Fetching user profile with token:', token);
    //         console.log('Response status:', response);

    //         if (response.ok) {
    //             const data = await response.json();
    //             userProfile = data.profile;
    //             isAuthenticated = true;
    //             auth.set(true);
    //         } else {
    //             // Token might be expired
    //             localStorage.removeItem('access_token');
    //             isAuthenticated = false;
    //             auth.set(false);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching profile:', error);
    //         localStorage.removeItem('access_token');
    //         isAuthenticated = false;
    //         auth.set(false);
    //     }
    // }
</script>

<main>
    <h1>Zitadel Authentication Demo</h1>

    {#if $user}
        <div class="profile">
            <h2>Welcome, {$user.name}!</h2>
            <p><strong>Email:</strong> {$user.email}</p>
            <p><strong>ID:</strong> {$user.id}</p>
            <p>
                <strong>Roles:</strong>
                {#if $user.roles && $user.roles.length > 0}
                    {#each $user.roles as role, index}
                        {role +
                            `${index == $user.roles.length - 1 ? "" : ", "}`}
                    {/each}
                {:else}
                    <p>No roles assigned</p>
                {/if}
            </p>
            <!-- {#if $user.picture}
                <img src={$user.picture} alt="Profile" width="100" height="100" />
            {/if}
            <p><strong>Roles:</strong> {$user.roles.join(', ')}</p> -->
            <button on:click={handleLogout} class="logout-btn">Logout</button>
        </div>

        <button on:click={() => goto("./dashboard")}> Dashboard </button>
        <button on:click={() => goto("./system")}> System </button>
        <button on:click={() => goto("./settings")}> Settings </button>
        <button on:click={() => goto("./system")}> System </button>
        <button on:click={() => goto("./dev-tool")}> Dev-Tool </button>
<!-- 
        <div>
            <button on:click={handleSyncRoles}> Sync Roles </button>
        </div> -->
    {:else}
        <div class="login">
            <p>Please log in to continue</p>
            <button on:click={handleLogin} class="login-btn"
                >Login with Google via Zitadel</button
            >
        </div>
    {/if}
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }

    .profile {
        background: #f5f5f5;
        padding: 2rem;
        border-radius: 8px;
        margin-top: 2rem;
    }

    .login {
        padding: 2rem;
    }

    .login-btn,
    .logout-btn {
        background: #007cba;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        margin: 1rem;
    }

    .login-btn:hover,
    .logout-btn:hover {
        background: #005a8b;
    }

    .logout-btn {
        background: #dc3545;
    }

    .logout-btn:hover {
        background: #c82333;
    }

    img {
        border-radius: 50%;
        margin: 1rem 0;
    }
</style>
