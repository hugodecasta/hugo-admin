<template>
    <v-card-text v-if="!edit">
        <b>{{prop_final_name}}:</b>
        <template v-if="all_links.length">
            <router-link
                v-for="(link_data,index) in all_links"
                :key="index"
                :to="link_data.link"
                class='ml-2'
            >{{link_data.name}}</router-link>
        </template>
        <template v-else>
            <i>- no selection made -</i>
        </template>
    </v-card-text>
    <div
        v-else
        :style="is_multi ? '':'display:flex'"
    >
        <v-card-title class="pl-0">
            {{prop_final_name}}
            <v-btn
                icon
                @click="tmp.push(null)"
                v-if="is_multi"
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-card-title>

        <ref-editor
            v-for="(id, index) in tmp"
            :key="index"
            :root="tmp"
            :index="index"
            :config="config"
        ></ref-editor>

        <template v-if="!is_any">
            <v-btn
                text
                @click="add_ref"
            >{{table_describer}}<v-icon right>mdi-plus</v-icon>
            </v-btn>
            <random-adder ref="adder"></random-adder>
        </template>

    </div>
</template>

<script>
import refEditor from './ref-editor.vue'
import randomAdder from './random-adder.vue'
export default {
    components: { refEditor, randomAdder },
    name: 'ref-viewer',
    props: ['prop_name', 'value', 'config', 'edit', 'on_the_fly', 'item'],
    data: () => ({
        selected_tables: [],
        tmp: [],
    }),
    watch: {
        tmp() {
            this.$emit('input', this.is_multi ? this.tmp : this.tmp[0])
        },
        value: {
            handler() {
                if (this.is_multi) this.$set(this, 'tmp', this.value ?? [])
                else this.$set(this.tmp, 0, this.value)
            },
            immediate: true
        }
    },
    computed: {
        prop_final_name() {
            return this.prop_name.replace(/_/g, ' ')
        },
        is_multi() {
            return !!this.config.array_of
        },
        table_describer() {
            return this.config.array_of ?? this.config.ref
        },
        is_any() {
            return this.table_describer == 'any'
        },
        all_links() {
            const all_ids = this.tmp.filter(e => e)
            const links = all_ids.map((id, i) => {
                const table = this.$db.find_item_table(id)
                const name = this.$db.item_name_id(table, id) + (this.is_any ? ` (${table})` : '')
                const link = this.$db.table_item_url(table, id) ?? '/table/' + table + '/' + id
                this.$set(this.selected_tables, i, table)
                return { link, name }
            })
            return links
        }
    },
    methods: {
        table_for(index) {
            if (!this.is_any) return this.table_describer
            return this.selected_tables[index]
        },
        add_ref() {
            this.$refs.adder.add(this.table_describer)
        }
    }
}
</script>

<style>
</style>