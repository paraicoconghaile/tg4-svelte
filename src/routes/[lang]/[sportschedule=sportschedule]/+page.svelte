<script lang="ts">
    import SportSchedule from '$lib/components/schedule/SportSchedule.svelte';

    let { data } = $props();
</script>

<SportSchedule schedule={data.schedule} />