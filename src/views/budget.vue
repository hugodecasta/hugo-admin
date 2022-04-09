<template>
    <v-card
        elevation="0"
        max-width="1500px"
        style="margin:auto"
    >
        <v-card-title
            class='mb-10'
            v-if="!dense"
        >
            Budget
        </v-card-title>
        <v-card-text :class='[dense? "pa-0" : ""]'>
            <v-card
                outlined
                dark
                class="mb-2"
            >
                <bud-detail
                    :amount="budget_data.final"
                    name="Budget"
                >
                    <v-btn
                        icon
                        v-if="dense"
                        color="grey"
                        to="/budget"
                    >
                        <v-icon>mdi-open-in-new</v-icon>
                    </v-btn>
                </bud-detail>
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
                <bud-detail
                    :amount="budget_data.ca"
                    name="CA"
                    :is_detail="true"
                ></bud-detail>

                <!-- ----- DENSE -->
                <template v-if="dense">
                    <v-divider></v-divider>
                    <v-list-item style="display:block;opacity:0.5">
                        <v-card-title
                            style="font-size:13px;"
                            class='pb-0'
                        >
                            <v-row>
                                <v-col cols="3"></v-col>
                                <v-col>
                                    <v-row>
                                        <v-col>
                                            <v-row>
                                                <v-col>CA</v-col>
                                                <v-col>Balance</v-col>
                                                <v-col>Taxe</v-col>
                                            </v-row>
                                        </v-col>
                                        <v-col
                                            cols="4"
                                            style="display:flex"
                                        >
                                            <v-spacer></v-spacer>Budget
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <bud-detail
                        class='mt-3'
                        :dense="true"
                        :is_detail="true"
                        :name="'Y - '+all_times[0][0]"
                        :amount="get_year(all_times[0][0]).final"
                        :more_amounts="[
                        get_year(all_times[0][0]).ca,
                        get_year(all_times[0][0]).balance,
                        -get_year(all_times[0][0]).taxed
                    ].filter(e=>e)"
                    ></bud-detail>
                    <v-divider class='mb-3'></v-divider>
                    <bud-detail
                        v-for="[trim] in all_times[0][1]"
                        :key="trim"
                        :dense="true"
                        :is_detail="true"
                        :name="'T - '+trim"
                        :amount="year_trim(all_times[0][0],trim).final"
                        :more_amounts="[
                        year_trim(all_times[0][0],trim).ca,
                        year_trim(all_times[0][0],trim).balance,
                        -year_trim(all_times[0][0],trim).taxed
                    ].filter(e=>e)"
                    ></bud-detail>
                </template>

            </v-card>

            <!-- ----------- YEARS -->
            <template v-if="!dense">

                <div
                    v-for="[year, trims] in all_times"
                    :key="year"
                >
                    <v-card-title class="mt-10 mb-10">
                        <v-row>
                            <v-col style="display:flex;align-items:center">
                                <div>{{year}}</div>
                                <v-divider
                                    class='ml-7 mb-1'
                                    style="flex-grow:1 !important"
                                ></v-divider>
                            </v-col>
                            <v-col
                                v-if="get_year(year)"
                                cols="5"
                            >
                                <bud-detail
                                    :amount="get_year(year).final"
                                    :more_amounts="[
                                    get_year(year).ca,
                                    get_year(year).balance,
                                    -get_year(year).taxed
                                ].filter(e=>e)"
                                ></bud-detail>
                            </v-col>
                        </v-row>

                    </v-card-title>
                    <div
                        v-for="[trim,months] in trims"
                        :key="trim"
                        class='px-5'
                    >
                        <v-card
                            class=' ma-3'
                            dark
                            :disabled="!year_trim_exists(year,trim)"
                        >
                            <v-card-title>
                                T{{trim}} - {{year}}
                                <template v-if="year_trim_exists(year,trim)">
                                    <bud-detail
                                        :amount="year_trim(year,trim).final"
                                        :more_amounts="[
                                            year_trim(year,trim).ca,
                                            year_trim(year,trim).balance,
                                            -year_trim(year,trim).taxed
                                        ].filter(e=>e)"
                                        name="Trim gain"
                                    ></bud-detail>
                                </template>
                            </v-card-title>

                            <v-divider v-if="year_trim_exists(year,trim)"></v-divider>

                            <div
                                class='pa-5'
                                v-if="year_trim_exists(year,trim)"
                            >
                                <span
                                    v-for="month_id in months"
                                    :key="month_id"
                                >
                                    <template v-if="year_trim_month_exists(year,trim,month_id)">
                                        <bud-detail
                                            :amount="year_trim_month(year,trim,month_id).final"
                                            :more_amounts="[
                                            year_trim_month(year,trim,month_id).ca,
                                            year_trim_month(year,trim,month_id).balance,
                                            -year_trim_month(year,trim,month_id).taxed
                                        ]"
                                            :name="year_trim_month(year,trim,month_id).month_name"
                                        ></bud-detail>
                                        <move-disp
                                            class='ml-10'
                                            v-for="move in year_trim_month(year,trim,month_id).moves"
                                            :date="true"
                                            :move="move.move"
                                            :key="month_id+move.move.id"
                                        ></move-disp>
                                    </template>
                                    <bud-detail
                                        v-else
                                        :amount="0"
                                        color="grey"
                                        style="opacity:0.5"
                                        :name="months_names[month_id-1]"
                                    ></bud-detail>
                                </span>
                            </div>
                        </v-card>

                    </div>
                </div>
            </template>

        </v-card-text>
    </v-card>
</template>

<script>
import BudDetail from '@/components/bud-detail.vue'
import MoveDisp from '@/components/move-disp.vue'
export default {
    components: { BudDetail, MoveDisp },
    props: ['dense'],
    data: () => ({
        months_names: ['Jan', 'Fev', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }),
    computed: {
        all_taxes() {
            return Object.values(this.$db.table_items('taxe'))
        },
        taxe_rate() {
            return this.all_taxes.filter(t => t.active).reduce((a, b) => a + b.rate, 0) / 100
        },
        moves() {
            return Object.values(this.$db.table_items('move')).sort((a, b) => new Date(a.date) - new Date(b.date))
        },
        all_times() {
            const months_names = this.months_names
            const all_trims = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]
            const start_year = 2021
            const end_year = (new Date()).getFullYear()
            const end_month = (new Date()).getMonth() + 1
            const end_trim = all_trims.findIndex(t => t.includes(end_month)) + 1

            const times = Array(end_year - start_year + 1).fill(0).map((_, i) => {
                const year = start_year + i
                const trims = all_trims.map((months_ids, i) => {
                    const months = [...months_ids].reverse()
                    return [(i + 1), months]
                }).filter(([trim]) => year != end_year || trim <= end_trim).reverse()
                return [year, trims]
            }).reverse()

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
                const ca = is_taxed && is_in ? amount : 0
                const final = balance - taxed
                const payed_past_taxe = is_taxe_pay ? amount : 0

                return {
                    balance, taxed, final, payed_past_taxe, move, ca
                }
            })

            const months_data = moves_data.reduce((months, move_data) => {

                const [year, month] = move_data.move.date.split('-')
                const month_desi = month + '-' + year
                const month_name = this.months_names[month - 1]
                if (!months[month_desi]) months[month_desi] = {
                    month_desi, balance: 0, taxed: 0, final: 0, taxe_remove: 0, month: parseInt(month), year, moves: [],
                    month_name
                }
                const month_data = months[month_desi]

                month_data.balance += move_data.balance
                month_data.taxed += move_data.taxed
                month_data.final += move_data.final
                month_data.ca = (month_data.ca ?? 0) + move_data.ca
                month_data.taxe_remove += move_data.payed_past_taxe
                month_data.moves.unshift(move_data)

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
                trim_data.ca = (trim_data.ca ?? 0) + month_data.ca
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
                year_data.ca = (year_data.ca ?? 0) + trim_data.ca
                year_data.taxe_remove += trim_data.taxe_remove
                year_data.trims[trim_data.trim_id] = trim_data

                return years
            }, {})

            const budget_data = Object.values(years_data).reduce((budget, year_data) => {

                budget.balance += year_data.balance - year_data.taxe_remove
                budget.taxed += year_data.taxed - year_data.taxe_remove
                budget.final += year_data.final
                budget.ca += year_data.ca
                budget.years[year_data.year] = year_data

                return budget
            }, { balance: 0, taxed: 0, final: 0, taxe_remove: 0, ca: 0, years: {} })

            return budget_data

        }
    },
    methods: {
        year_trim(year, trim) {
            return this.budget_data.years[year].trims[trim]
        },
        get_year(year) {
            return this.budget_data.years[year]
        },
        year_trim_exists(year, trim) {
            return !!(this.budget_data.years[year] && this.budget_data.years[year].trims[trim])
        },
        year_trim_month_exists(year, trim, month_id) {
            return !!(this.year_trim_exists(year, trim) && this.budget_data.years[year].trims[trim].months[month_id])
        },
        year_trim_month(year, trim, month_id) {
            return this.budget_data.years[year].trims[trim].months[month_id]
        }
    },
    mounted() {
        this.budget_data
    }
}
</script>

<style>
</style>