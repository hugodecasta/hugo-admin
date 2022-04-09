<template>
    <v-card
        light
        outlined
        class="mb-3"
        :disabled="!move_data.past"
    >
        <v-card-title>
            {{move_data.label}}
            <v-card-subtitle v-if="date">
                {{format(new Date(move.date),'dd/MM/yyyy')}}
            </v-card-subtitle>
            <span
                v-if="!move_data.past"
                class="ml-3"
            >
                (future)
            </span>
            <v-spacer></v-spacer>
            <div
                v-if="move_data.is_paid_taxe && move_data.type == 'out'"
                style="opacity:0.3"
            >
                {{taxe_paid(move_data)}}
            </div>
            <!-- -------------------- DETAILS -->
            <v-card-subtitle v-if="move_data.taxed && show_details && move_data.type == 'in'">
                <div :class="amount_class(move_data.base_amount)">{{amount_display(move_data.base_amount)}}</div>
                <div :class="amount_class(move_data.total_taxe)">
                    <div
                        v-for="(taxe,name) in move_data.taxes"
                        :key="name"
                        class='ml-3'
                    >
                        {{amount_display(taxe*-1)}} <span class='ml-2'>({{name}})</span>
                    </div>
                    <b>{{amount_display(move_data.total_taxe)}}</b> ({{amount_display(move_data.taxe_rate,'%',false)}})
                </div>
                <div :class="amount_class(move_data.final_amount)">{{amount_display(move_data.final_amount)}}</div>
            </v-card-subtitle>
            <v-spacer></v-spacer>
            <span :class="amount_class(move_data.base_amount)">
                {{amount_display(move_data.base_amount)}}
            </span>
        </v-card-title>
    </v-card>
</template>

<script>
import { format } from 'date-fns'
export default {
    props: ['move', 'show_details', 'date'],
    computed: {
        all_taxes() {
            return Object.values(this.$db.table_items('taxe'))
        },
        move_data() {
            const base_amount = this.move.amount * (this.move.type == 'in' ? 1 : -1)
            const taxe_rate = this.amount_round(this.all_taxes.reduce((a, b) => a + b.rate, 0))
            const taxes = Object.fromEntries(this.all_taxes
                .filter(({ active }) => active)
                .map(tax => [
                    tax.reduced_name,
                    this.move.taxed && this.move.type == 'in' ? this.amount_round(base_amount * (tax.rate / 100)) : 0
                ]))
            const total_taxe = -Object.values(taxes).reduce((a, b) => a + b, 0)
            const final_amount = this.amount_round(base_amount + total_taxe)
            const past = new Date(this.move.date) < new Date()
            return { base_amount, taxe_rate, taxes, total_taxe, final_amount, past, ...this.move }
        }
    },
    methods: {
        format,
        amount_display(amount, dev = '€', disp_sign = true) {
            return (amount > 0 && disp_sign ? '+ ' : '') + String(amount).replace('.', ',').replace('-', disp_sign ? '- ' : '') + ' ' + dev
        },
        amount_round(amount) {
            return Math.ceil(amount * 100) / 100
        },
        amount_class(amount) {
            return (amount < 0 ? 'error' : 'success') + '--text'
        },
        taxe_paid(move) {
            return move.taxes_paied.map(taxe_id => this.$db.table_item('taxe', taxe_id).reduced_name).join(', ')
        },
    }
}
</script>

<style>
</style>