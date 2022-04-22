<template>
    <v-row class='ml-10'>
        <v-col v-if="is_any">
            <v-select
                :items="Object.keys($db.config.data)"
                v-model="selected_table"
                label="table"
            ></v-select>
        </v-col>
        <v-col>
            <v-select
                v-if="used_table"
                :items="items"
                v-model="root[index]"
                item-value="id"
                item-text="name"
            ></v-select>
            <v-select
                :disabled="true"
                v-else
            ></v-select>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'ref-editor',
    props: ['root', 'index', 'config'],
    data: () => ({
        selected_table: null
    }),
    computed: {
        id() {
            return this.root[this.index]
        },
        table_describer() {
            return this.config.array_of ?? this.config.ref
        },
        is_any() {
            return this.table_describer == 'any'
        },
        found_table() {
            return this.id ? this.$db.find_item_table(this.id) : null
        },
        used_table() {
            return this.is_any ? this.selected_table ?? this.found_table : this.table_describer
        },
        items() {
            const used_table = this.used_table
            if (!used_table) return []
            return Object.keys(this.$db.table_items(used_table) ?? {}).map(id => ({ id, name: this.$db.item_name_id(used_table, id) }))
        }
    },
}
</script>

<style>
</style>