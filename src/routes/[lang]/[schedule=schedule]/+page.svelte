<script lang="ts">
    import Schedule from '$lib/components/schedule/Schedule.svelte';

    let { data } = $props();
</script>

<Schedule schedule={data.schedule} />