<template>
    <supplier
        :standalone="true"
        :supplier="$db.table_item('supplier',$route.params.supplier_id)"
    ></supplier>
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