<template>
    <entry-adder
        :table_name="table_name"
        :set_obj="set_obj"
        v-if="show"
        @added="added=>{show=false;adder_promise_ok(added)}"
        @canceled="show=false;adder_promise_ok()"
    ></entry-adder>
</template>

<script>
import entryAdder from "./entry-adder.vue"

export default {
    components: { entryAdder },
    data: () => ({
        show: false,
        set_obj: null,
        table_name: null,

        adder_promise_ok: null
    }),
    methods: {
        add(table_name, pre_object) {
            this.table_name = table_name
            this.set_obj = JSON.parse(JSON.stringify(pre_object))
            this.show = true
            return new Promise(ok => {
                this.adder_promise_ok = ok
            })
        }
    }
}
</script>

<style>
</style>