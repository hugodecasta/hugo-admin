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
    </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data: () => ({
        forbidden_routes: ['table-edit', 'project']
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