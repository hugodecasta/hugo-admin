<template>
    <table-displayer :table_name="table_name"></table-displayer>
</template>

<script>
import TableDisplayer from '@/db_vues/TableDisplayer.vue'
export default {
    components: { TableDisplayer },
    computed: {
        table_name() {
            return this.$route.params.table_name
        }
    }
}
</script>

<style>
</style>