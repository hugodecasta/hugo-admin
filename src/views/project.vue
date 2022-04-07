<template>
    <project
        :standalone="true"
        :project="$db.table_item('project',$route.params.project_id)"
    ></project>
</template>

<script>
import Project from '@/components/project.vue'
export default {
    components: { Project },
    data: () => ({
    }),
}
</script>

<style>
</style>