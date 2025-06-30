<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";


    onMount(()=>{
        console.log("path name",$page?.url?.pathname)
    })
</script>