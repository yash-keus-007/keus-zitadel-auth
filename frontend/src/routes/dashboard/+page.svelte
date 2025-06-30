<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { authConfig } from '$lib/authConfig.js';
    import { Token, user } from '$lib/index.js';
    import axios from 'axios';
    import { page } from '$app/stores';

  onMount(() => {
    console.log('Dashboard tem page mounted');
    // setTimeout(() => {
    //     if(!$user?.routePermissions?.includes($page.url.pathname)){
    //         // alert("you do not have permission to access this page");
    //         history.back();
    //     }
    //     else{
    //         // alert("you have permission to access this page");
    //     }
    // }, 0);
  });

  const handleSyncRoles = async () => {
        await axios.post(
            `${authConfig.backend_url}/api/sync-roles`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${$Token}`,
                },
            },
        );
    };

  const handleRead = async () => {
    console.log('Read button clicked');
    try {
    const res = await axios.post(`${authConfig.backend_url}/api/dashboard/dashboard-read`,{userId: $user.id}, {
      headers: {
        Authorization: `Bearer ${$Token}`
      }
    });

    if (!res.data.success) {
      console.error("Backend error:", res.data.message);
      alert(`Error: ${res.data.message}`);
      return;
    }

    console.log("Response from backend:", res.data);
    alert(`✅ ${res.data.message}`);

  } catch (err:any) {
    console.error("Request failed:", err.message);
    alert("you do not have permission to perform this action");
  }
  };
  const handleCreate = () => {
    console.log('Create button clicked');
  };
  const handleDelete = () => {
    console.log('Delete button clicked');
  };
  const handleEdit = () => {
    goto("dashboard/update");
    console.log('Edit button clicked');
  }; 

</script>



This is a Dashboard page.

<button on:click={()=>goto("../")}> Home </button>




<div>
    <button on:click={handleRead} > Read </button>
    <button > Create </button>
    <button > Delete </button>
    <button on:click={handleEdit}> Edit </button>
    <button> Get project roles </button>
    <div>
            <button on:click={handleSyncRoles}> Sync Roles </button>
     </div>
</div>