<template>
    <div>
        <v-card-title v-if="title">
            {{title}}
            <v-btn
                v-if="add_btn"
                icon
                @click="$emit('add')"
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>

        </v-card-title>
        <v-card-subtitle
            v-if="count==0"
            style="opacity:0.3"
            class="ml-2"
        >no {{table_name}}s yet</v-card-subtitle>
        <v-expansion-panels>
            <entry-displayer
                v-for="(item,id) in filtered"
                :dense="dense"
                :key="id"
                :item="item"
                :table_name="table_name"
                :editable="true"
                :actionable="actionable"
                :show_multis="show_multis"
                @delete="$db.delete_item(table_name,id)"
            >
            </entry-displayer>
        </v-expansion-panels>
    </div>
</template>


<script>
import EntryDisplayer from '@/db_vues/entry-displayer.vue'
export default {
    name: 'list-displayer',
    components: { EntryDisplayer },
    props: ['table_name', 'filters', 'items', 'actionable', 'show_multis', 'dense', 'title', 'add_btn'],
    computed: {
        filtered() {
            return this.items ?? this.$db.table_items_filtered(this.table_name, this.filters ?? [])
        },
        count() {
            return Object.keys(this.filtered).length
        }
    },
}
</script>

<style>
</style>