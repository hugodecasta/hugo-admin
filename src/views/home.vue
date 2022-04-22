<template>
    <v-card class='ma-10'>
        <v-card-title>Admin</v-card-title>
        <v-divider></v-divider>
        <v-card-text>Routes</v-card-text>
        <v-btn
            v-for="route in routes"
            :key="route.path"
            :to="route.path"
            color="primary"
            class='ma-3'
        >{{route.name}}</v-btn>
        <v-divider></v-divider>
        <v-card-text>Tables</v-card-text>
        <v-btn
            v-for="table in tables"
            :key="table"
            :to="'/table/'+table"
            color="primary"
            class='ma-3'
        >{{table}}s</v-btn>
        <v-divider></v-divider>

        <v-card-title>Dashboard</v-card-title>
        <v-card
            style="display:flex"
            elevation="0"
            class='pa-3'
        >
            <project
                v-for="project in Object.values($db.table_items('project'))
                    .filter(p=>!p.ending_date || new Date(p.ending_date) > $utils.time.now)"
                :key="project.id"
                :btn="true"
                :project="project"
            ></project>
        </v-card>
        <v-row class='pa-5'>
            <v-col>
                <all-tasks></all-tasks>
            </v-col>
            <v-col>
                <budget :dense="true"></budget>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import allTasks from '@/components/all-tasks.vue'
import Project from '@/components/project.vue'
import { mapState } from 'vuex'
import Budget from './budget.vue'
export default {
    components: { allTasks, Budget, Project },
    data: () => ({
        forbidden_routes: ['table-edit', 'project', 'item-edit', 'supplier']
    }),
    computed: {
        ...mapState(['common']),
        routes() {
            return this.$router.options.routes.filter(route => !this.forbidden_routes.includes(route.name))
        },
        tables() {
            return Object.keys(this.$db.config.data)
        }
    },
    mounted() {
    }
}
</script>

<style>
</style>