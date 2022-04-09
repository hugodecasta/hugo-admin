<template>
    <v-list-item
        style="display:block"
        :class="[color ? color+'--text' : $utils.money.amount_class(no_amount ? mul : amount)]"
    >
        <v-card-title
            :style="is_detail ? ';font-size:15px':''"
            :class="[is_detail ? 'pt-0 pb-0' : '']"
        >
            <v-row>
                <v-col
                    v-if="name"
                    :cols="dense ? 3 : 7"
                >
                    <slot></slot>
                    <v-icon
                        v-if="
                        icon"
                        class='mr-3'
                        :color="color ? color : $utils.money.amount_color(no_amount ? mul : amount)"
                    >mdi-{{icon}}</v-icon>
                    {{name}}
                </v-col>
                <v-col>

                    <v-row>

                        <v-col v-if="more_amounts">
                            <v-row class='mr-10'>
                                <v-col
                                    v-for="(sub_amount,index) in more_amounts"
                                    :key="index"
                                    :style="'font-size:'+(dense ? '12px' : '15px')"
                                    :class="color ? color+'--text' : $utils.money.amount_class(sub_amount)"
                                >
                                    {{$utils.money.amount_display(sub_amount,type?type:'€',!(no_sign),inverse_sign)}}
                                </v-col>
                            </v-row>
                        </v-col>

                        <v-col
                            style="display:flex"
                            :cols="more_amounts ? 3 : 12"
                        >
                            <v-spacer></v-spacer>
                            <template v-if="no_amount">{{amount}}</template>
                            <template v-else>{{$utils.money.amount_display(amount,type?type:'€',!(no_sign),inverse_sign)}}</template>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-title>
    </v-list-item>
</template>

<script>
export default {
    props: ['name', 'before', 'amount', 'icon',
        'is_detail', 'type', 'color', 'inverse_sign', 'no_sign', 'no_amount', 'mul', 'more_amounts', 'dense']
}
</script>

<style>
</style>