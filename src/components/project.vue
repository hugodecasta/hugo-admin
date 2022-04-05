<template>
    <v-expansion-panel>
        <v-expansion-panel-header>
            <v-card-title>{{project.name}}</v-card-title>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <v-card-text>
                <v-row>
                    <v-col
                        cols="12"
                        sm="3"
                    >
                        <list-displayer
                            title="estimates"
                            :actionable="false"
                            :items="estimates"
                            :show_multis="false"
                            :dense="true"
                            table_name="estimate"
                        ></list-displayer>
                        <list-displayer
                            title="invoices"
                            :actionable="false"
                            :items="invoices"
                            :show_multis="false"
                            :dense="true"
                            table_name="invoice"
                        ></list-displayer>
                        <list-displayer
                            title="associates"
                            :actionable="false"
                            :items="associates"
                            :show_multis="false"
                            :dense="true"
                            table_name="associate"
                        ></list-displayer>
                    </v-col>
                    <v-col
                        cols="12"
                        sm="5"
                    >
                        <v-card dark>

                            <bud-detail
                                name="Project Balance"
                                :icon="account_data.project_balance == 0 ? 'check' : 
                                account_data.project_balance > 0 ? 'party-popper' : 
                                account_data.project_balance < 0 ? 'alert-circle' : null"
                                :amount="account_data.project_balance"
                            ></bud-detail>

                            <v-divider></v-divider>

                            <v-list
                                width="100%"
                                dense
                                v-for="(disper, name) in dispers"
                                :key="name"
                            >
                                <v-list-item
                                    :key="'sub-'+name"
                                    style="opacity:0.3;font-weight:light"
                                >{{name}}</v-list-item>
                                <bud-detail
                                    v-for="disp_data in disper"
                                    :key="disp_data.prop"
                                    :is_detail="true"
                                    :name="disp_data.name"
                                    :type="disp_data.type"
                                    :color="disp_data.color"
                                    :inverse_sign="disp_data.inverse_sign"
                                    :no_sign="disp_data.no_sign"
                                    :amount="account_data[disp_data.prop] * (disp_data.mul ? disp_data.mul : 1)"
                                ></bud-detail>
                                <v-divider
                                    width='95%'
                                    style='margin:auto;margin-right:10px'
                                ></v-divider>
                            </v-list>

                        </v-card>
                    </v-col>
                    <v-col
                        cols="12"
                        sm="4"
                    >
                        <move-disp
                            v-for="move in moves"
                            :key="move.id"
                            :move="move"
                            :date="true"
                            :show_details="false"
                        ></move-disp>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>
import ListDisplayer from '@/db_vues/list-displayer.vue'
import BudDetail from './bud-detail.vue'
import MoveDisp from './move-disp.vue'
export default {
    props: ['project'],
    components: { MoveDisp, BudDetail, ListDisplayer },
    data: () => ({
        account_data_disp: {
            'balance': [
                { prop: 'total_taxe', name: 'Total Taxe Duty', mul: -1 },
                { prop: 'total_balance', name: 'Total Balance' },
                { prop: 'invoice_total_coverage', name: 'Total Invoice Coverage' },
                { prop: 'total_cost', name: 'Total Load', mul: -1 }
            ],
            'total': [
                { prop: 'invoice_total_coverage_span', name: 'Invoice Total Coverage Span' },
                { prop: 'invoice_total_coverage', name: 'Invoice Coverage' },
                { prop: 'total_ideal_invoice_coverage', name: 'Invoice Total Ideal coverage', color: 'grey' },
                { prop: 'total_prevision', name: 'Total Prevision', mul: -1 },
                { prop: 'total_cost', name: 'Total Load', mul: -1 }
            ],
            'labor': [
                { prop: 'real_hour_cost', name: 'Real Hour Cost', type: '€ /h' },
                { prop: 'hour_cost', name: 'Needed Hour Cost', type: '€ /h' },
                { prop: 'labor_balance', name: 'Labor Balance' },
                { prop: 'invoice_labor_unload', name: 'Invoice Labor Unload' },
                { prop: 'labor_invoice_balance', name: 'Invoice Balance' },
                { prop: 'invoice_labor_coverage', name: 'Invoice Labor coverage' },
                { prop: 'labor_ideal_invoice_coverage', name: 'Invoice Labor Ideal coverage', color: 'grey' },
                { prop: 'hours_spent_span', name: 'Hour Spent Span', type: 'h', inverse_sign: true },
                { prop: 'hours_spent_real', name: 'Hour Spent Real', mul: -1, type: 'h', no_sign: true },
                { prop: 'hours_spent_prevision', name: 'Hour Spent Prevision', mul: -1, type: 'h', no_sign: true },
                { prop: 'labor_load', name: 'Labor Load', mul: -1 }
            ],
            'ressources': [
                { prop: 'ressource_balance', name: 'Ressource Balance' },
                { prop: 'ressource_invoice_balance', name: 'Invoice Balance' },
                { prop: 'invoice_ressource_unload', name: 'Invoice Ressource Unload' },
                { prop: 'invoice_ressource_coverage', name: 'Invoice Ressource coverage' },
                { prop: 'ressource_ideal_invoice_coverage', name: 'Invoice Ressource Ideal coverage', color: 'grey' },
                { prop: 'ressource_prevision_span', name: 'Prevision Span' },
                { prop: 'ressource_load', name: 'Ressource Load', mul: -1 },
                { prop: 'ressource_load_prevision', name: 'Ressource Load Prevision', mul: -1 },
            ],
            'invoice': [
                { prop: 'client_invoice_balance', name: 'Client Invoice balance', mul: -1 },
                { prop: 'client_invoice_unload', name: 'Client Invoice Unload' },
                { prop: 'invoice_load', name: 'Invoice Load', mul: -1 },
            ],
        }
    }),
    computed: {
        dispers() {
            return Object.fromEntries(Object.entries(this.account_data_disp).filter(([, disper]) => this.can_disp(disper)))
        },
        ref_me() {
            return this.$db.items_referencing_me(this.project, 'project')
        },
        estimates() {
            return Object.values(this.ref_me.estimate)
        },
        all_taxes() {
            return Object.values(this.$db.table_items('taxe'))
        },
        taxe_rate() {
            return this.all_taxes.filter(t => t.active).reduce((a, b) => a + b.rate, 0) / 100
        },
        invoices() {
            return Object.values(this.ref_me.invoice)
        },
        associates() {
            return Object.values(this.$db.table_items_list('associate', this.project.associates ?? []))
        },
        invoice_moves() {
            return this.invoices.filter(inv => !inv.canceled).map(invoice => ({
                date: invoice.date, label: 'Invoice - ' + invoice.number,
                type: 'out', project: this.project.id, amount: invoice.amount
            }))
        },
        base_moves() {
            return Object.values(this.ref_me.move)
        },
        moves() {
            return [...this.base_moves, ...this.invoice_moves].sort((a, b) => new Date(b.date) - new Date(a.date))
        },
        account_data() {
            const invoice_load = -this.$utils.money.moves_final(this.invoice_moves)
            const client_invoice_unload = this.$utils.money.moves_final(this.moves.filter(m => m.client == this.project.client))
            const client_invoice_balance = invoice_load - client_invoice_unload
            const client_invoice_unload_taxe = -invoice_load * this.taxe_rate
            const invoice_post_taxe = client_invoice_unload + client_invoice_unload_taxe

            const hour_cost = this.project.labor_hour_cost
            const hours_spent_prevision = this.project.hours_spent_prevision
            const hours_spent_real = this.project.hours_spent_real
            const hours_spent_span = hours_spent_prevision - hours_spent_real
            const labor_load = hour_cost * hours_spent_real
            const labor_ideal_invoice_coverage = this.$utils.money.amount_round(labor_load / (1 - this.taxe_rate))

            const ressource_load_prevision = this.project.ressource_cost
            const ressource_load = this.$utils.money.moves_final(this.base_moves.filter(m => m.type == 'out')) * -1
            const ressource_prevision_span = ressource_load_prevision - ressource_load
            const ressource_ideal_invoice_coverage = this.$utils.money.amount_round(ressource_load_prevision / (1 - this.taxe_rate))

            const total_cost = labor_load + ressource_load
            const total_prevision = labor_load + ressource_load_prevision
            const total_ideal_invoice_coverage = this.$utils.money.amount_round(Math.max(
                total_cost / (1 - this.taxe_rate),
                labor_ideal_invoice_coverage + ressource_ideal_invoice_coverage
            ))
            const invoice_total_coverage = client_invoice_unload
            const invoice_total_coverage_span = this.$utils.money.amount_round(invoice_total_coverage - total_ideal_invoice_coverage)
            const total_balance = invoice_total_coverage - total_cost
            const total_taxe = invoice_total_coverage * this.taxe_rate
            const project_balance = this.$utils.money.amount_round(total_balance - total_taxe)

            const final_cost = ressource_load

            const labor_load_prop = labor_load / total_cost
            const ressource_load_prop = ressource_load / total_cost

            const invoice_labor_coverage = this.$utils.money.amount_round(client_invoice_unload * labor_load_prop)
            const invoice_ressource_coverage = this.$utils.money.amount_round(client_invoice_unload * ressource_load_prop)

            const invoice_post_taxe_labor_coverage = this.$utils.money.amount_round(invoice_post_taxe * labor_load_prop)
            const invoice_post_taxe_ressource_coverage = this.$utils.money.amount_round(invoice_post_taxe * ressource_load_prop)

            const labor_balance = labor_load - invoice_post_taxe_ressource_coverage
            const ressource_balance = ressource_load - invoice_post_taxe_ressource_coverage

            const invoice_labor_unload = this.$utils.money.amount_round(labor_load - invoice_post_taxe_labor_coverage)
            const invoice_ressource_unload = this.$utils.money.amount_round(ressource_load - invoice_post_taxe_ressource_coverage)

            const real_hour_cost = this.$utils.money.amount_round(invoice_labor_unload / hours_spent_real)

            const labor_invoice_balance = this.$utils.money.amount_round(invoice_labor_coverage - labor_ideal_invoice_coverage)
            const ressource_invoice_balance = this.$utils.money.amount_round(invoice_ressource_coverage - ressource_ideal_invoice_coverage)

            return {
                invoice_load, client_invoice_unload, client_invoice_balance,
                client_invoice_unload_taxe, invoice_post_taxe,

                labor_load,
                invoice_labor_unload, invoice_post_taxe_labor_coverage,
                labor_ideal_invoice_coverage, invoice_labor_coverage, labor_invoice_balance,
                hours_spent_prevision, hours_spent_real, hours_spent_span,
                hour_cost, real_hour_cost,
                labor_balance,

                ressource_load_prevision, ressource_load, ressource_prevision_span,
                invoice_ressource_unload, invoice_post_taxe_ressource_coverage,
                invoice_ressource_coverage, ressource_ideal_invoice_coverage, ressource_invoice_balance,
                ressource_balance,

                total_cost, total_prevision,
                total_ideal_invoice_coverage,
                invoice_total_coverage, invoice_total_coverage_span, total_balance,
                total_taxe,

                project_balance
            }
        },
        client() {
        }
    },
    methods: {
        compute_ressources(load, total, full_invoice) {
            const prop = load / total

            const real_invoice_coverage = full_invoice * prop
            const invoice_taxed = real_invoice_coverage * this.taxe_rate
            const invoice_post_taxe = real_invoice_coverage - invoice_taxed

            const ideal_invoice_coverage = this.$utils.money.amount_round(load / (1 - this.taxe_rate))
            const invoice_coverage_balance = invoice_coverage - real_invoice_coverage

            const invoice_unload = load - invoice_post_taxe

            return {
                ideal_invoice_coverage, real_invoice_coverage, invoice_coverage_balance,
                load, invoice_unload
            }
        },
        can_disp(disper) {
            return disper.reduce((a, b) => a || this.account_data[b.prop] != 0, false)
        }
    }
}
</script>

<style>
</style>