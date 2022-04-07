<template>
    <v-card
        elevation="0"
        class='pa-5'
    >
        <v-card-title>Projects</v-card-title>
        <v-expansion-panels>
            <project
                v-for="(project,id) in $db.table_items('project')"
                :key="id"
                :project="project"
            ></project>
        </v-expansion-panels>

    </v-card>
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