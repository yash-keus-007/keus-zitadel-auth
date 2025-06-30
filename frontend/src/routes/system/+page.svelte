<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    onMount(() => {
        console.log('System page mounted');
    });
    
</script>
    This is a System Page.
<button on:click={()=>goto("../")}> Home </button>