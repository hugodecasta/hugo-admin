<template>
    <v-dialog v-model="show">
        <v-card>
            <v-card-title>Add {{table_name}}</v-card-title>
            <v-card-text>
                <form>
                    <entry-displayer
                        elevation="0"
                        :table_name="table_name"
                        :item="adding_obj"
                        :edit="true"
                        :on_the_fly="true"
                        :show_multis="false"
                        :actionable='false'
                        :is_alone="true"
                    ></entry-displayer>
                </form>
                <v-btn
                    color="primary"
                    @click="add"
                >Add</v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="$emit('canceled')"
                >cancel</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import entryDisplayer from './entry-displayer.vue'
import { v4 as uuid } from 'uuid'
export default {
    components: { entryDisplayer },
    props: ['table_name'],
    data: () => ({
        adding_obj: {},
        show: false,
    }),
    watch: {
        show() {
            if (!this.show) this.$emit('canceled')
        }
    },
    methods: {
        add() {
            const obj = JSON.parse(JSON.stringify(this.adding_obj))
            obj.id = uuid()
            this.$set(this.$db.data[this.table_name + 's'], obj.id, obj)
            this.$emit('added')
        }
    },
    mounted() {
        setTimeout(() => this.show = true, 0)
    }
}
</script>

<style>
</style>