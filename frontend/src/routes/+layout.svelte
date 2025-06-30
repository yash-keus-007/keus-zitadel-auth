<script lang="ts">
    import { user } from '$lib/index.js';


    export let data;

    $:{
        if(data && data?.user){
            console.log("user data----",data?.user)
            user.set(data?.user?.profile);
        }
    }

</script>

<slot />