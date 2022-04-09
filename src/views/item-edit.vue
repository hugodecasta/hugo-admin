<template>
    <entry-displayer
        class='pa-10'
        :item="$db.table_item(table_name,item_id)"
        :table_name="table_name"
        :editable="true"
        :actionable="true"
        :show_multis="true"
        :is_alone="true"
        @delete="$db.delete_item(table_name,id)"
    >
    </entry-displayer>
</template>

<script>
import EntryDisplayer from '@/db_vues/entry-displayer.vue'
export default {
    components: { EntryDisplayer },
    computed: {
        table_name() {
            return this.$route.params.table_name
        },
        item_id() {
            return this.$route.params.item_id
        },
    }
}
</script>

<style>
</style>