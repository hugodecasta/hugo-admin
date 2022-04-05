<template>
    <div class='pa-5'>
        <v-card-title>
            {{plural_name}}
            <v-btn
                icon
                v-if="!(no_add === true)"
                color='primary'
                @click="add=true"
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text>
            <list-displayer
                :table_name="table_name"
                :filters="filters"
            ></list-displayer>
        </v-card-text>
        <entry-adder
            :table_name="table_name"
            v-if="add"
            @added="add=false"
            @canceled="add=false"
        ></entry-adder>
    </div>
</template>

<script>
import listDisplayer from '@/db_vues/list-displayer.vue'
import EntryAdder from './entry-adder.vue'
export default {
    name: 'table-displayer',
    props: ['table_name', 'no_add', 'filters'],
    components: { listDisplayer, EntryAdder },
    data: () => ({ add: false }),
    computed: {
        plural_name() {
            return this.table_name + 's'
        },
    },
}
</script>

<style>
</style>