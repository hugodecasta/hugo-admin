<template>
    <v-list-item
        style="display:block"
        :class="color ? color+'--text' : $utils.money.amount_class(no_amount ? mul : amount)"
    >
        <v-card-title
            :style="is_detail ? ';font-size:15px':''"
            :class="is_detail ? 'pt-0 pb-0' : ''"
        >
            <v-icon
                v-if="icon"
                class='mr-3'
                :color="color ? color : $utils.money.amount_color(no_amount ? mul : amount)"
            >mdi-{{icon}}</v-icon>
            {{name}}
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <span
                v-if="before"
                class='mr-3'
            >{{before}}</span>
            <template v-if="no_amount">{{amount}}</template>
            <template v-else>{{$utils.money.amount_display(amount,type?type:'€',!(no_sign),inverse_sign)}}</template>
        </v-card-title>
    </v-list-item>
</template>

<script>
export default {
    props: ['name', 'before', 'amount', 'icon', 'is_detail', 'type', 'color', 'inverse_sign', 'no_sign', 'no_amount', 'mul']
}
</script>

<style>
</style>