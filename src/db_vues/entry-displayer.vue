<template>
    <v-expansion-panel
        :class='["item",dense ?"ma-0": "ma-3"]'
        :is="is_alone ? 'v-card' : 'v-expansion-panel'"
        elevation="0"
    >
        <v-expansion-panel-header v-if="!is_alone">
            <v-card-title :is="dense ? 'span' : 'v-card-title'">{{$db.item_name(table_name,item)}}</v-card-title>
        </v-expansion-panel-header>
        <v-expansion-panel-content :is="is_alone ? 'div' : 'v-expansion-panel-content'">
            <v-card-text>
                <v-row>
                    <v-col>
                        <prop-displayer
                            class='item_prop'
                            v-for="(prop_config,prop_name) in $db.table_data_config(table_name)"
                            :key="prop_name"
                            v-model="(is_edit ? item_editor : item)[prop_name]"
                            :prop_name="prop_name"
                            :config="prop_config"
                            :edit="edit || is_edit"
                            :on_the_fly="true"
                            :item="is_edit ? item_editor : item"
                            ref="item_prop"
                        ></prop-displayer>
                    </v-col>
                    <v-col v-if="!(show_multis === false)">
                        <v-expansion-panels>
                            <v-expansion-panel
                                v-for="(ref_items, ref_table) in $db.items_referencing_me(item,table_name)"
                                :key="ref_table"
                            >
                                <v-expansion-panel-header>{{ref_table}}s</v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <list-displayer
                                        :table_name="ref_table"
                                        :items="ref_items"
                                        :actionable="false"
                                        :show_multis="false"
                                        :dense="true"
                                    ></list-displayer>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions v-if="!(actionable === false)">
                <v-btn
                    icon
                    @click="$emit('delete')"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <template v-if="editable">
                    <template v-if="is_edit">
                        <v-btn
                            @click="validate_edit"
                            color="primary"
                        >OK</v-btn>
                        <v-btn
                            v-if="is_edit"
                            text
                            @click="is_edit=false;item_editor=null"
                            color="primary"
                        >cancel</v-btn>
                    </template>
                    <v-btn
                        icon
                        v-else
                        @click="item_editor=JSON.parse(JSON.stringify(item));is_edit=true"
                    >
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                </template>
            </v-card-actions>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>
import propDisplayer from '@/db_vues/prop-displayer.vue'
import { VCard } from 'vuetify/lib'
export default {
    name: 'entry-displayer',
    components: { propDisplayer, 'list-displayer': () => import('@/db_vues/list-displayer.vue'), VCard },
    props: ['item', 'table_name', 'edit', 'editable', 'on_the_fly', 'show_multis', 'actionable', 'is_alone', 'dense'],
    data: () => ({
        is_edit: false,
        item_editor: null
    }),
    methods: {
        validate_edit() {
            this.$refs.item_prop.forEach(p => p.validate_tmp())
            console.log(this.item_editor)
            this.$db.update_item(this.table_name, JSON.parse(JSON.stringify(this.item_editor)))
            this.item_editor = null
            this.is_edit = false
        }
    }
}
</script>

<style>
</style>