<template>
    <v-card elevation="0">
        <task-disp
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :dense="false"
        ></task-disp>
    </v-card>
</template>

<script>
import taskDisp from './task-disp.vue'
export default {
    components: { taskDisp },
    computed: {
        assets() {
            return Object.values(this.$db.table_items('asset'))
        },
        base_tasks() {
            return [
                ...Object.values(this.$db.table_items('task')).map(t => t.project ? { ...t, link: '/project/' + t.project } : t),
                ...this.$utils.tasks.assets_to_tasks(this.assets)
            ]
        },
        tasks() {
            return this.$utils.tasks.sort(this.base_tasks)
        },

    }
}
</script>

<style>
</style>