<template>
    <v-card
        elevation="0"
        class='pa-5'
    >

        <v-card
            outlined
            dark
        >
            <v-card-title
                class='ma-5'
                :style="{
                fontSize:'25px',
                color:(budget_data.final_budget<0 ? 'var(--v-error-base)' : 'var(--v-success-base)')
            }"
            >
                <v-icon
                    v-if="budget_data.final_budget<0"
                    color="error"
                    class='mr-5'
                >mdi-alert</v-icon>
                Budget
                <v-spacer></v-spacer>
                {{amount_display(budget_data.final_budget)}}
                <v-icon
                    v-if="budget_data.final_budget<0"
                    color="error"
                    class='ml-5'
                >mdi-alert</v-icon>
            </v-card-title>
            <v-divider></v-divider>

            <v-list width="100%">
                <template v-for="disp_data in budget_displays">
                    <v-list-item
                        :key="disp_data.prop"
                        style="display:block"
                        :class="amount_class(budget_data[disp_data.prop])"
                    >
                        <v-card-title>
                            {{disp_data.name}}
                            <v-spacer></v-spacer>
                            <span
                                v-if="disp_data.prop == 'full_taxe' && !show_details"
                                class='mr-3'
                            >{{budget_data.remaining_taxes.join(', ')}}</span>
                            <span
                                v-if="disp_data.prop == 'full_taxe'"
                                class='mr-3'
                            >
                                ({{amount_display(budget_data.full_taxe_rate,'%',false)}})
                            </span>
                            {{amount_display(budget_data[disp_data.prop])}}
                        </v-card-title>
                    </v-list-item>

                    <!--  ------ disp taxes details -->
                    <template v-if="show_details && disp_data.prop == 'full_taxe'">
                        <v-list-item
                            v-for="(taxe_data,taxe_name) in budget_data.taxe_details"
                            :key="disp_data.prop+'-'+taxe_name"
                            style="display:block"
                            class="error--text"
                        >
                            <v-card-title
                                style="font-size:15px;font-weight:normal"
                                class='pt-0 pb-0'
                            >
                                {{taxe_name}}
                                <v-spacer></v-spacer>
                                <span class='mr-3'>
                                    ({{amount_display(taxe_data.rate,'%',false)}})
                                </span>
                                {{amount_display(amount_round(taxe_data.taxed*-1))}}
                            </v-card-title>
                        </v-list-item>

                        <v-list-item
                            :key="disp_data.prop+'-taxepaied'"
                            style="display:block"
                            v-if="budget_data.taxes_data.paied"
                            :class="[amount_class(budget_data.taxes_data.paied),'mb-5']"
                        >

                            <v-card-title
                                style="font-size:15px;font-weight:normal"
                                class='pt-0 pb-0'
                            >
                                already paied
                                <v-spacer></v-spacer>
                                {{amount_display(budget_data.taxes_data.paied)}}
                            </v-card-title>
                        </v-list-item>

                        <v-list-item
                            :key="disp_data.prop+'-basetaxed'"
                            style="display:block"
                            :class="[amount_class(budget_data.taxe_base),'mb-5']"
                        >

                            <v-card-title
                                style="font-size:15px;font-weight:normal"
                                class='pt-0 pb-0'
                            >
                                Taxed base
                                <v-spacer></v-spacer>
                                {{amount_display(budget_data.taxe_base)}}
                            </v-card-title>
                        </v-list-item>

                    </template>
                </template>

            </v-list>
        </v-card>

        <!-- ------------------------------------------ MOVES -->

        <v-card-text>

            <v-switch
                v-model="show_details"
                label="show details"
            ></v-switch>

            <v-card
                outlined
                v-for="move in all_moves_data"
                :key="move.id"
                class="mb-3"
                :disabled="!move.past"
            >
                <v-card-title>
                    {{move.label}} <span
                        v-if="!move.past"
                        class="ml-3"
                    >(future)</span>
                    <v-spacer></v-spacer>
                    <div
                        v-if="move.is_paid_taxe && move.type == 'out'"
                        style="opacity:0.3"
                    >
                        {{taxe_paid(move)}}
                    </div>
                    <!-- -------------------- DETAILS -->
                    <v-card-subtitle v-if="move.taxed && show_details && move.type == 'in'">
                        <div :class="amount_class(move.base_amount)">{{amount_display(move.base_amount)}}</div>
                        <div :class="amount_class(move.total_taxe)">
                            <div
                                v-for="(taxe,name) in move.taxes"
                                :key="name"
                                class='ml-3'
                            >
                                {{amount_display(taxe*-1)}} <span class='ml-2'>({{name}})</span>
                            </div>
                            <b>{{amount_display(move.total_taxe)}}</b> ({{amount_display(move.taxe_rate,'%',false)}})
                        </div>
                        <div :class="amount_class(move.final_amount)">{{amount_display(move.final_amount)}}</div>
                    </v-card-subtitle>
                    <v-spacer></v-spacer>
                    <span :class="amount_class(move.base_amount)">
                        {{amount_display(move.base_amount)}}
                    </span>
                </v-card-title>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    data: () => ({
        show_details: false,
        budget_displays: [
            { prop: 'full_taxe', name: 'Taxes' },
            { prop: 'base_budget', name: 'Base' }
        ]
    }),
    computed: {
        all_moves() {
            return Object.values(this.$db.table_items('move')).sort((a, b) => new Date(b.date) - new Date(a.date))
        },
        all_moves_data() {
            const now = new Date()
            return Object.values(this.$db.table_items('move'))
                .map(move => ({ ...move, past: new Date(move.date) < now }))
                .map(this.move_data)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
        },
        all_moves_data_past() {
            return this.all_moves_data.filter(move => move.past)
        },
        all_taxes() {
            const taxes = this.$db.table_items('taxe')
            const taxes_values = Object.values(taxes)
            const full = taxes_values.filter(({ active }) => active).reduce((a, b) => a + b.rate, 0)
            return Object.values(taxes).map(taxe => ({ ...taxe, prop: taxe.rate / full }))
        },
        budget_data() {
            const base_budget = this.amount_round(this.all_moves_data_past.reduce((a, b) => a + b.base_amount, 0))

            const taxes_data = this.all_moves_data_past.reverse().reduce((bud, move) => {

                const is_taxable = move.taxed == true && move.type == 'in'
                const is_taxe_pay = move.is_paid_taxe == true && move.type == 'out'
                if (is_taxable) bud.base += move.base_amount

                if (is_taxe_pay) bud.paied += -move.base_amount

                this.all_taxes.forEach(({ id, name, reduced_name, rate, prop, active }) => {
                    if (!active) return
                    if (!bud.taxes[reduced_name]) bud.taxes[reduced_name] = { rate, taxed: 0 }
                    const paying_this_taxe = is_taxe_pay && move.taxes_paied.includes(id)
                    const adder = is_taxable ?
                        (move.base_amount * (rate / 100)) :
                        paying_this_taxe ? -bud.taxes[reduced_name].taxed
                            : 0
                    bud.taxes[reduced_name].taxed += adder
                })

                if (Math.ceil(Object.values(bud.taxes).reduce((a, b) => a + b.taxed, 0)) == 0) {
                    bud.base = 0
                    this.all_taxes.forEach(({ reduced_name, active }) => {
                        if (!active) return
                        bud.taxes[reduced_name].taxed = 0
                        bud.paied = 0
                    })
                }

                return bud
            }, { base: 0, taxes: {}, paied: 0 })

            const full_taxe_rate = this.all_taxes.filter(({ active }) => active).reduce((a, b) => a + b.rate, 0)

            const remaining_taxes = Object.entries(taxes_data.taxes).filter(([, { taxed }]) => taxed > 0).map(([name]) => name)

            this.all_taxes.forEach(({ reduced_name, active }) => {
                if (!active) return
                taxes_data.taxes[reduced_name].taxed = Math.ceil(taxes_data.taxes[reduced_name].taxed)
            })

            const full_taxe = -Object.values(taxes_data.taxes).reduce((a, b) => a + b.taxed, 0)

            const final_budget = this.amount_round(base_budget + full_taxe)

            return {
                base_budget, taxe_base: taxes_data.base, remaining_taxes,
                full_taxe_rate,
                taxe_details: taxes_data.taxes, taxes_data, full_taxe, final_budget
            }
        },
    },
    methods: {
        amount_display(amount, dev = '€', disp_sign = true) {
            return (amount > 0 && disp_sign ? '+ ' : '') + String(amount).replace('.', ',').replace('-', disp_sign ? '- ' : '') + ' ' + dev
        },
        amount_round(amount) {
            return Math.ceil(amount * 100) / 100
        },
        amount_class(amount) {
            return (amount < 0 ? 'error' : 'success') + '--text'
        },
        move_data(move) {
            const base_amount = move.amount * (move.type == 'in' ? 1 : -1)
            const taxe_rate = this.amount_round(this.all_taxes.reduce((a, b) => a + b.rate, 0))
            const taxes = Object.fromEntries(this.all_taxes
                .filter(({ active }) => active)
                .map(tax => [tax.reduced_name, move.taxed && move.type == 'in' ? this.amount_round(base_amount * (tax.rate / 100)) : 0]))
            const total_taxe = -Object.values(taxes).reduce((a, b) => a + b, 0)
            const final_amount = this.amount_round(base_amount + total_taxe)
            return { base_amount, taxe_rate, taxes, total_taxe, final_amount, ...move }
        },
        taxe_paid(move) {
            return move.taxes_paied.map(taxe_id => this.$db.table_item('taxe', taxe_id).reduced_name).join(', ')
        }
    }
}
</script>

<style>
</style>