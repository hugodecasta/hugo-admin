<template>
    <v-dialog v-model="show">
        <v-card>
            <v-card-title>Add {{table_name}}</v-card-title>
            <v-card-text>
                <form>
                    <entry-displayer
                        elevation="0"
                        :table_name="table_name"
                        :item="update_object"
                        :edit="true"
                        :on_the_fly="true"
                        :show_multis="false"
                        :actionable='false'
                        :is_alone="true"
                    ></entry-displayer>
                </form>
                <v-btn
                    color="primary"
                    @click="update"
                >Update</v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="show = false;$emit('canceled')"
                >cancel</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import entryDisplayer from './entry-displayer.vue'
export default {
    components: { entryDisplayer },
    data: () => ({
        show: false,
        update_object: null,
        table_name: null,
    }),
    watch: {
        show() {
            if (!this.show) this.$emit('canceled')
        },
    },
    methods: {
        edit(table_name, id) {
            this.table_name = table_name
            this.update_object = JSON.parse(JSON.stringify(this.$db.table_item(table_name, id)))
            this.show = true
        },
        update() {
            const obj = JSON.parse(JSON.stringify(this.update_object))
            this.$db.update_item(this.table_name, obj)
            this.$emit('updated', obj)
            this.show = false
        }
    },
}
</script>

<style>
</style>