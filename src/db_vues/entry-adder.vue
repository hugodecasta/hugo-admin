<template>
    <v-dialog v-model="show">
        <v-card>
            <v-card-title>Add {{table_name}}</v-card-title>
            <v-card-text>
                <form>
                    <entry-displayer
                        elevation="0"
                        :table_name="table_name"
                        :item="real_adding_object"
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
import { v4 as uuid } from 'uuid'
export default {
    name: 'entry-adder',
    components: { entryDisplayer: () => import('./entry-displayer.vue') },
    props: ['table_name', 'set_obj'],
    data: () => ({
        show: false,
        real_adding_object: {}
    }),
    watch: {
        show() {
            if (!this.show) this.$emit('canceled')
        },
        set_obj: {
            handler() {
                this.$set(this, 'real_adding_object', this.set_obj ?? {})
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        add() {
            const obj = JSON.parse(JSON.stringify(this.real_adding_object))
            obj.id = uuid()
            this.$set(this.$db.data[this.table_name + 's'], obj.id, obj)
            this.$emit('added', obj)
        }
    },
    mounted() {
        setTimeout(() => this.show = true, 0)
    }
}
</script>

<style>
</style>