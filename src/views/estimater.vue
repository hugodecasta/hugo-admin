<template>
    <v-card
        elevation="0"
        style="max-width:800px;margin:auto"
    >
        <v-card-title class='mb-10'>Estimater</v-card-title>
        <v-card-text>
            <v-text-field
                v-model="form.hours_cost"
                label='€ / h'
                placeholder="0"
            ></v-text-field>
            <v-text-field
                v-model="form.hours_spent_prevision"
                label='Hours spent prevision'
                placeholder="0"
            ></v-text-field>
            <v-text-field
                v-model="form.assets_cost_prevision"
                label='Assets cost prevision'
                placeholder="0"
            ></v-text-field>

            <bud-detail
                name="Needed Load"
                :amount="estimation_data.total_load"
            ></bud-detail>
            <bud-detail
                name="Needed Load w Taxe"
                :amount="estimation_data.total_load_taxed"
            ></bud-detail>
        </v-card-text>
        <v-card-text>
            <v-btn
                color="primary"
                block
                @click="create_project"
            >Create Project And Estimate</v-btn>
        </v-card-text>
        <random-adder ref="random_adder"></random-adder>
    </v-card>
</template>

<script>
import BudDetail from '@/components/bud-detail.vue'
import RandomAdder from '@/db_vues/random-adder.vue'
export default {
    components: { BudDetail, RandomAdder },
    data: () => ({
        form: {
            hours_cost: 0,
            hours_spent_prevision: 0,
            assets_cost_prevision: 0,
        }
    }),
    computed: {
        all_taxes() {
            return Object.values(this.$db.table_items('taxe'))
        },
        taxe_rate() {
            return this.all_taxes.filter(t => t.active).reduce((a, b) => a + b.rate, 0) / 100
        },
        estimation_data() {

            const hours_cost = parseFloat(this.form.hours_cost)
            const hours_spent_prevision = parseFloat(this.form.hours_spent_prevision)
            const assets_cost_prevision = parseFloat(this.form.assets_cost_prevision)

            const labor_load = hours_cost * hours_spent_prevision
            const assets_load = assets_cost_prevision

            const total_load = labor_load + assets_load
            const total_load_taxed = this.$utils.money.add_taxe(total_load, this.taxe_rate)

            return { total_load, total_load_taxed, hours_cost, hours_spent_prevision, assets_cost_prevision }
        }
    },
    methods: {
        async create_project() {
            const project = await this.$refs.random_adder.add('project', {
                labor_hour_cost: this.estimation_data.hours_cost,
                hours_spent_prevision: this.estimation_data.hours_spent_prevision,
                assets_cost_prevision: this.estimation_data.assets_cost_prevision,
            })
            await this.$refs.random_adder.add('estimate', {
                project: project.id,
                amount: this.estimation_data.total_load_taxed
            })
            this.$router.push('/project/' + project.id)
        }
    }
}
</script>

<style>
</style>