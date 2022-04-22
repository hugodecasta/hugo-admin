<template>
    <v-card
        elevation="0"
        class='pa-5'
    >
        <v-card-title>Suppliers</v-card-title>
        <v-expansion-panels>
            <supplier
                v-for="(supplier,id) in $db.table_items('supplier')"
                :key="id"
                :supplier="supplier"
            ></supplier>
        </v-expansion-panels>

    </v-card>
</template>

<script>
import Supplier from '@/components/supplier.vue'
export default {
    components: { Supplier },
    data: () => ({
    }),
}
</script>

<style>
</style>