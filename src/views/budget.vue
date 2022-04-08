<template>
    <v-card elevation="0">
        <v-card-title class='mb-10'>Budget</v-card-title>
        <v-card-text>

            <v-card
                outlined
                dark
            >
                <bud-detail
                    :amount="budget_data.final"
                    name="Budget"
                ></bud-detail>
                <bud-detail
                    :amount="-budget_data.taxed"
                    name="Remaining Taxes"
                    :is_detail="true"
                ></bud-detail>
                <bud-detail
                    :amount="budget_data.balance"
                    name="Budget Base"
                    :is_detail="true"
                ></bud-detail>
            </v-card>

            <v-card-subtitle></v-card-subtitle>

            <!-- ----------- YEARS -->
            <v-expansion-panels>
                <v-expansion-panel
                    v-for="[year,year_infos] in all_times"
                    :key="year"
                    :disabled="!budget_data.years[year]"
                >
                    <v-expansion-panel-header>
                        <v-card-title>{{year}}</v-card-title>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content v-if="budget_data.years[year]">
                        <!-- ----------- TRIMESTERS -->
                        <v-expansion-panels>
                            <v-expansion-panel
                                v-for="[trimester,trim_infos] in year_infos"
                                :key="trimester"
                                :disabled="!budget_data.years[year].trims[trimester]"
                            >
                                <v-expansion-panel-header>
                                    <v-card-subtitle :is="budget_data.years[year].trims[trimester] ? 'v-card-title' : 'div'">
                                        T{{trimester}}
                                    </v-card-subtitle>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content v-if="budget_data.years[year].trims[trimester]">
                                    <!-- ----------- MONTHS -->
                                    <v-expansion-panels>
                                        <v-expansion-panel
                                            v-for="[month,month_info] in trim_infos"
                                            :key="month"
                                            :disabled="!budget_data.years[year].trims[trimester].months[month_info.month_id]"
                                        >
                                            <v-expansion-panel-header>
                                                <v-card-title>{{month}}</v-card-title>
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <!-- ----------- MONTH -->
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

        </v-card-text>
    </v-card>
</template>

<script>
import BudDetail from '@/components/bud-detail.vue'
export default {
    components: { BudDetail },
    computed: {
        all_taxes() {
            return Object.values(this.$db.table_items('taxe'))
        },
        taxe_rate() {
            return this.all_taxes.filter(t => t.active).reduce((a, b) => a + b.rate, 0) / 100
        },
        moves() {
            return Object.values(this.$db.table_items('move'))
        },
        all_times() {
            const months_names = ['Jan', 'Fev', 'mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const all_trims = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]
            const start_year = 2021
            const end_year = (new Date()).getFullYear()

            const times = Array(end_year - start_year + 1).fill(0).map((_, i) => {
                const year = start_year + i
                const trims = all_trims.map((months_ids, i) => {
                    const months = months_ids.map(month_id => [
                        months_names[month_id - 1],
                        { month_id }
                    ]).reverse()
                    return [(i + 1), months]
                }).reverse()
                return [year, trims]
            }).reverse()

            console.log(times)

            return times
        },
        budget_data() {

            const trim_pay = {}

            const moves_data = this.moves.map(move => {
                const is_in = move.type == 'in'
                const is_taxed = move.taxed
                const is_taxe_pay = move.is_paid_taxe
                const amount = move.amount

                const balance = is_taxe_pay ? 0 : amount * (is_in ? 1 : -1)
                const taxed = Math.ceil(amount * (is_in && is_taxed ? this.taxe_rate : 0))
                const final = balance - taxed
                const payed_past_taxe = is_taxe_pay ? amount : 0

                return {
                    balance, taxed, final, payed_past_taxe, move
                }
            })

            const months_data = moves_data.reduce((months, move_data) => {

                const [year, month] = move_data.move.date.split('-')
                const month_desi = month + '-' + year
                if (!months[month_desi]) months[month_desi] = {
                    month_desi, balance: 0, taxed: 0, final: 0, taxe_remove: 0, month: parseInt(month), year, moves: [],
                }
                const month_data = months[month_desi]

                month_data.balance += move_data.balance
                month_data.taxed += move_data.taxed
                month_data.final += move_data.final
                month_data.taxe_remove += move_data.payed_past_taxe
                month_data.moves.push(move_data)

                return months
            }, {})

            const all_trims = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]

            const trims_data = Object.values(months_data).reduce((trims, month_data) => {

                const year = month_data.year
                const trim_id = all_trims.findIndex(trim => trim.includes(month_data.month)) + 1
                const trim_desi = trim_id + '-' + year
                if (!trims[trim_desi]) trims[trim_desi] = {
                    trim_desi, balance: 0, taxed: 0, final: 0, taxe_remove: 0, months: {}, year, trim_id: trim_id
                }
                const trim_data = trims[trim_desi]

                trim_data.balance += month_data.balance
                trim_data.taxed += month_data.taxed
                trim_data.final += month_data.final
                trim_data.taxe_remove += month_data.taxe_remove
                trim_data.months[month_data.month] = month_data

                return trims
            }, {})

            const years_data = Object.values(trims_data).reduce((years, trim_data) => {

                const year = trim_data.year
                if (!years[year]) years[year] = { year, balance: 0, taxed: 0, final: 0, taxe_remove: 0, trims: {} }
                const year_data = years[year]

                year_data.balance += trim_data.balance
                year_data.taxed += trim_data.taxed
                year_data.final += trim_data.final
                year_data.taxe_remove += trim_data.taxe_remove
                year_data.trims[trim_data.trim_id] = trim_data

                return years
            }, {})

            const budget_data = Object.values(years_data).reduce((budget, year_data) => {

                budget.balance += year_data.balance - year_data.taxe_remove
                budget.taxed += year_data.taxed - year_data.taxe_remove
                budget.final += year_data.final
                budget.years[year_data.year] = year_data

                return budget
            }, { balance: 0, taxed: 0, final: 0, taxe_remove: 0, years: {} })

            console.log(budget_data)

            return budget_data

        }
    },
    methods: {
    },
    mounted() {
        this.budget_data
    }
}
</script>

<style>
</style>