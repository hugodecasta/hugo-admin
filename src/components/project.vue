<template>
    <v-btn
        v-if="btn"
        color="primary"
        class='pa-10 pl-2 pr-2 pt-8 ma-2'
        :to="'/project/'+project.id"
    >
        <v-card-title style="position:relative">
            <v-icon
                v-if="project_progression==100"
                :color="$utils.money.amount_color(account_data.balance_post_taxe)"
                class='mr-2'
            >mdi-check-bold</v-icon>
            <v-icon
                v-if="project.is_rd"
                class='mr-2'
            >mdi-test-tube</v-icon>
            <v-row>
                <v-col>
                    {{project.name}}
                </v-col>
                <v-col
                    v-if="!project.is_rd"
                    :class="$utils.money.amount_class(account_data.balance_post_taxe)"
                >
                    {{$utils.money.amount_display(account_data.balance_post_taxe)}}
                </v-col>
            </v-row>

            <v-progress-linear
                v-if="!project.is_rd && project_progression != 100"
                class='mt-2'
                bottom
                :color="$utils.money.amount_color(account_data.balance_post_taxe)"
                :value="project_progression"
            ></v-progress-linear>

        </v-card-title>
    </v-btn>
    <v-expansion-panel
        :is="standalone ? 'v-card' : 'v-expansion-panel'"
        :class="standalone ? 'pa-5' : ''"
        v-else
    >
        <v-expansion-panel-header
            :is="standalone ? 'div' : 'v-expansion-panel-header'"
            :class="standalone ? 'mb-5' : ''"
        >
            <v-card-title>
                <!-- --------------------------------------------- HEADER -->
                <v-row>
                    <v-col>
                        <template v-if="project.is_rd">
                            <span
                                style="opacity:0.3"
                                class='mr-5'
                            >
                                <v-icon
                                    class='mr-2'
                                    color="primary"
                                >mdi-test-tube</v-icon>
                                R&D
                            </span>
                        </template>
                        {{project.name}}
                        <span
                            v-if="project.pending"
                            class='ml-3'
                            style="opacity:0.5"
                        >
                            Pending
                        </span>
                        <span
                            v-if="project_progression==100"
                            class='ml-10'
                            style="opacity:0.3"
                        >
                            DONE
                        </span>
                    </v-col>
                    <!-- ---------------------- fast actions -->
                    <v-col
                        cols="1"
                        style="display:flex"
                    >
                        <v-btn
                            icon
                            @click="edit"
                        >
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>

                        <v-btn
                            v-if="!standalone"
                            class='ml-5'
                            icon
                            :to="'/project/'+project.id"
                        >
                            <v-icon>mdi-open-in-new</v-icon>
                        </v-btn>
                    </v-col>
                    <!-- ---------------------- ACTIONS -->
                    <v-col>
                        <v-btn
                            v-if="!project.is_rd"
                            class='ml-3'
                            color="primary"
                            @click.stop="add_new('move',
                                    {project:project.id,client:project.client,type:'in',taxed:true}
                                )"
                        >Unload<v-icon right>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn
                            class='ml-3'
                            color="primary"
                            @click.stop="add_new('task',{project:project.id})"
                        >Task<v-icon right>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn
                            color="primary"
                            class='ml-3'
                            @click.stop="add_asset()"
                        >Assets<v-icon right>mdi-plus</v-icon>
                        </v-btn>
                    </v-col>
                    <!-- ---------------------- Budget Overview -->
                    <v-col style="display:flex">
                        <v-spacer></v-spacer>
                        <span style="font-size:13px; opacity:0.5">
                            <span :class="[$utils.money.amount_class(account_data.needed_load_balance),'mr-2']">
                                {{$utils.money.amount_display(account_data.needed_load_balance)}}
                            </span>
                            <span :class="[$utils.money.amount_class(-account_data.applyed_taxed),'mr-7']">
                                {{$utils.money.amount_display(-account_data.applyed_taxed)}}
                            </span>
                        </span>
                        <span :class="$utils.money.amount_class(account_data.balance_post_taxe)">
                            {{$utils.money.amount_display(account_data.balance_post_taxe)}}
                        </span>
                    </v-col>
                </v-row>
            </v-card-title>
        </v-expansion-panel-header>
        <v-divider v-if="standalone"></v-divider>
        <v-expansion-panel-content :is="standalone ? 'div' : 'v-expansion-panel-content'">
            <v-card-text>
                {{project.id}}
                <!-- --------------------------------------------- ASSETS & REFS -->
                <v-row>
                    <v-col
                        cols="12"
                        sm="3"
                    >
                        <list-displayer
                            title="assets"
                            :actionable="true"
                            :items="assets"
                            :show_multis="false"
                            :dense="true"
                            table_name="asset"
                        ></list-displayer>
                        <list-displayer
                            v-if="!project.is_rd"
                            title="invoices"
                            :actionable="false"
                            :items="invoices"
                            :show_multis="false"
                            :dense="true"
                            :add_btn="true"
                            table_name="invoice"
                            @add="add_new('invoice',{project:project.id,client:project.client,amount:account_data.ideal_load_taxed})"
                        ></list-displayer>
                        <list-displayer
                            v-if="!project.is_rd"
                            title="estimates"
                            :items="estimates"
                            :show_multis="false"
                            :dense="true"
                            :add_btn="true"
                            table_name="estimate"
                            @add="add_new('estimate',{project:project.id,client:project.client,amount:account_data.ideal_load_taxed})"
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

                    <!-- --------------------------------------------- TASKS -->
                    <v-col
                        cols="12"
                        sm="4"
                        v-if="tasks.length"
                    >
                        <v-card-title>Tasks</v-card-title>
                        <task-disp
                            v-for="task in tasks"
                            :key="task.id"
                            :task="task"
                            :dense="false"
                        ></task-disp>
                    </v-col>

                    <!-- --------------------------------------------- BUDGET -->
                    <v-col>
                        <v-row>
                            <v-col v-if="!project.is_rd">
                                <v-card dark>

                                    <bud-detail
                                        name="Project Balance"
                                        :icon="account_data.balance_post_taxe == 0 ? 'check' : 
                                account_data.balance_post_taxe > 0 ? 'party-popper' : 
                                account_data.balance_post_taxe < 0 ? 'alert-circle' : null"
                                        :amount="account_data.balance_post_taxe"
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
                                        <template v-for="(disp_data,index) in disper">
                                            <v-divider
                                                :key="index"
                                                v-if="disp_data == '----'"
                                                width='30%'
                                                style='margin:auto;margin-left:10px'
                                            ></v-divider>
                                            <v-divider
                                                :key="index+'-2'"
                                                v-if="disp_data == '----'"
                                                width='30%'
                                                style='margin:auto;margin-right:10px'
                                            ></v-divider>
                                            <v-divider
                                                :key="index+'3'"
                                                v-else-if="disp_data == '--------'"
                                                width='95%'
                                                style='margin:auto;margin-right:10px'
                                                class='mb-1 mt-4'
                                            ></v-divider>
                                            <bud-detail
                                                v-else
                                                :key="index"
                                                :is_detail="true"
                                                :name="disp_data.name"
                                                :type="disp_data.type"
                                                :color="disp_data.color"
                                                :inverse_sign="disp_data.inverse_sign"
                                                :no_sign="disp_data.no_sign"
                                                :icon="disp_data.icon"
                                                :mul="disp_data.mul"
                                                :no_amount="disp_data.no_amount"
                                                :amount="disp_data.no_amount ? 
                                            disp_data.value : $utils.money.amount_round(disp_data.value * (disp_data.mul ? disp_data.mul : 1))"
                                            ></bud-detail>
                                        </template>
                                        <v-divider
                                            width='95%'
                                            style='margin:auto;margin-right:10px'
                                        ></v-divider>
                                    </v-list>

                                </v-card>
                            </v-col>
                            <v-col :cols="tasks.length ? 12 : 5">
                                <v-card-text>
                                    project moves
                                    <v-btn
                                        icon
                                        @click="add_new('move',{project:project.id})"
                                    >
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </v-card-text>
                                <move-disp
                                    v-for="move in moves"
                                    :key="move.id"
                                    :move="move"
                                    :date="true"
                                    :show_details="false"
                                ></move-disp>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
            <random-adder ref='random_adder'></random-adder>
            <entry-updater ref='entry_updater'></entry-updater>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>
import ListDisplayer from '@/db_vues/list-displayer.vue'
import BudDetail from './bud-detail.vue'
import MoveDisp from './move-disp.vue'
import TaskDisp from './task-disp.vue'
import RandomAdder from '@/db_vues/random-adder.vue'
import EntryUpdater from '@/db_vues/entry-updater.vue'
export default {
    props: ['project', 'standalone', 'btn'],
    components: { MoveDisp, BudDetail, ListDisplayer, RandomAdder, EntryUpdater, TaskDisp },
    computed: {
        ref_me() {
            return this.$db.items_referencing_me(this.project, 'project')
        },
        estimates() {
            return Object.values(this.ref_me.estimate)
        },
        assets() {
            return Object.values(this.ref_me.asset)
        },
        base_tasks() {
            return [...Object.values(this.ref_me.task), ...this.$utils.tasks.assets_to_tasks(this.assets)]
        },
        tasks() {
            return this.$utils.tasks.sort(this.base_tasks)
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
            // ---- Invoices
            const invoice_load = -this.$utils.money.moves_final(this.invoice_moves)
            const client_invoice_unload = this.$utils.money.moves_final(this.base_moves
                .filter(m => m.client == this.project.client && m.type == 'in'))
            const client_invoice_balance = client_invoice_unload - invoice_load

            // ---- Labor

            const ideal_labor_hour_cost = this.project.labor_hour_cost
            const hours_spent_prevision = this.project.hours_spent_prevision

            const ideal_labor_load = ideal_labor_hour_cost * hours_spent_prevision
            const ideal_labor_load_taxed = this.$utils.money.add_taxe(ideal_labor_load, this.taxe_rate)

            // - real
            const real_hours_spent = this.project.hours_spent_real
            const hours_spent_span = hours_spent_prevision - real_hours_spent
            const real_hours_load = real_hours_spent * ideal_labor_hour_cost

            // ---- Assets

            const assets_load_prevision = this.project.assets_cost_prevision

            const ideal_assets_load = assets_load_prevision
            const ideal_assets_load_taxed = this.$utils.money.add_taxe(ideal_assets_load, this.taxe_rate)

            // - real
            const real_assets_load = -this.$utils.money.moves_final(this.base_moves.filter(m => m.type == 'out'))
            const assets_load_span = assets_load_prevision - real_assets_load

            // ---- Loads

            const ideal_load = ideal_assets_load + ideal_labor_load
            const ideal_load_taxed = this.$utils.money.add_taxe(ideal_load, this.taxe_rate)

            // - real
            const loaded = invoice_load
            const loaded_span = loaded - ideal_load_taxed

            // ---- Needed Load
            const labor_load = real_hours_spent * ideal_labor_hour_cost

            const needed_load = real_assets_load
            const needed_load_taxed = this.$utils.money.add_taxe(needed_load, this.taxe_rate)

            // - only remove assets cost
            const needed_load_balance = client_invoice_unload - real_assets_load
            const applyed_taxed = client_invoice_unload * this.taxe_rate

            const balance_post_taxe = needed_load_balance - applyed_taxed

            // - Theoric

            const theoric_need = real_assets_load + real_hours_load
            const theoric_need_taxed = this.$utils.money.add_taxe(theoric_need, this.taxe_rate)

            const labor_prop = theoric_need == 0 ? 0 : real_hours_load / theoric_need
            const assets_prop = theoric_need == 0 ? 0 : real_assets_load / theoric_need

            const labor_unload = client_invoice_unload * labor_prop
            const assets_unload = client_invoice_unload * assets_prop
            const labor_balance = labor_unload - labor_load
            const assets_balance = assets_unload - real_assets_load
            const theoric_balance = labor_balance + assets_balance
            const theoric_balance_post_taxe = theoric_balance - applyed_taxed

            const real_labor_hour_cost = labor_unload / real_hours_spent

            return {
                ideal_load_taxed,
                needed_load_balance,
                applyed_taxed,
                balance_post_taxe,
                dispers: {
                    'Project Balance': [
                        { name: 'Applyed Taxe', value: applyed_taxed, mul: -1 },
                        { name: 'Needed Balanced (w/o labor)', value: needed_load_balance, },
                        // { name: 'Needed Load Taxed', value: needed_load_taxed, mul: -1 },
                        { name: 'Needed Load', value: needed_load, mul: -1 },
                        { name: 'Client Unload', value: client_invoice_unload, },
                    ],
                    'Theoric Balance': [
                        { name: 'Theoric Balance Post Taxe', value: theoric_balance_post_taxe },
                        { name: 'Theoric Balance', value: theoric_balance },
                        '----',
                        { name: 'Assets Balance', value: assets_balance },
                        { name: 'Labor Balance', value: labor_balance },
                        '----',
                        { name: 'Theoric Needed Load', value: theoric_need, mul: -1 },
                        { name: 'Assets Need', value: real_hours_load, mul: -1 },
                        { name: 'Labor Need', value: real_assets_load, mul: -1 },
                        '----',
                        { name: 'Assets Unload', value: assets_unload },
                        { name: 'Labor Unload', value: labor_unload },
                    ],
                    'Real Time Cost': [
                        {
                            name: 'Real Hours Cost', value: real_labor_hour_cost, type: ' €/h',
                            mul: real_labor_hour_cost < ideal_labor_hour_cost ? -1 : 1, no_sign: true
                        },
                        { name: 'Ideal Hours Cost', value: ideal_labor_hour_cost, type: ' €/h', no_sign: true },
                    ],
                    'Real Load Spans': [
                        {
                            name: 'Assets Load Span', value: assets_load_span, ...this.neg_alert(assets_load_span),
                        },
                        {
                            name: 'Hours Prediction Span', value: hours_spent_span, type: ' h', inverse_sign: true,
                            ...this.neg_alert(hours_spent_span)
                        },
                    ],
                    'Real Loads': [
                        { name: 'Real Assets Load', value: real_assets_load, color: 'grey', no_sign: true },
                        { name: 'Real Hours Load', value: real_hours_load, no_sign: true, color: 'grey' },
                        { name: 'Real Hours Spent', value: real_hours_spent, type: ' h', no_sign: true, color: 'grey' },
                        '--------',
                    ],
                    'Invoiced': [
                        { name: 'Client Invoice Balance', value: client_invoice_balance, ...this.balance_alert(client_invoice_balance) },
                        { name: 'Client Invoice Unload', value: client_invoice_unload },
                        { name: 'Invoice Load', value: invoice_load, mul: -1 },
                        '----',
                        {
                            name: 'Loaded Span', value: loaded_span, ...this.neg_alert(loaded_span),
                            mul: assets_load_span >= 0 ? 1 : -1,
                        },
                        { name: 'Real Loaded', value: loaded, color: 'grey', color: !invoice_load ? 'grey' : 'light-grey' },
                        { name: 'Ideal Loaded', value: ideal_load_taxed, color: 'grey' },
                        '--------',
                    ],
                    'Ideal Loads': [
                        {
                            name: 'Ideal Load Taxed', value: ideal_load_taxed, color: 'grey', no_sign: true,
                            color: invoice_load ? 'grey' : 'light-grey'
                        },
                        { name: 'Ideal Load', value: ideal_load, color: 'grey', no_sign: true },
                        '----',
                        { name: 'Ideal Assets Load', value: ideal_assets_load, color: 'grey', no_sign: true },
                        { name: 'Ideal Labor Load', value: ideal_labor_load, color: 'grey', no_sign: true },
                    ],
                    'Assets': [
                        { name: 'Ideal Assets Load Taxed', value: ideal_assets_load_taxed, color: 'grey', no_sign: true },
                        { name: 'Ideal Assets Load', value: ideal_assets_load, color: 'grey', no_sign: true },
                        '----',
                        { name: 'Assets Load Prevision', value: assets_load_prevision, no_sign: true },
                    ],
                    'Labor': [
                        { name: 'Ideal Labor Load Taxed', value: ideal_labor_load_taxed, color: 'grey', no_sign: true },
                        { name: 'Ideal Labor Load', value: ideal_labor_load, color: 'grey', no_sign: true },
                        '----',
                        { name: 'Ideal Hours Spent', value: hours_spent_prevision, type: ' h', no_sign: true },
                    ],
                }
            }


        },
        project_progression() {
            if (new Date(this.project.ending_date).getTime() <= this.$utils.time.now) return 100
            const start = new Date(this.project.starting_date).getTime()
            const deadline = this.$utils.tasks.sort(this.tasks.filter(t => t.deadline))[0]?.deadline
            if (!deadline) return null
            const diff = new Date(deadline).getTime() - start
            const now = this.$utils.time.now - start
            return (now / diff) * 100
        },
        dispers() {
            return Object.fromEntries(Object.entries(this.account_data.dispers).filter(([, disper]) => this.can_disp(disper)))
        },
    },
    methods: {
        balance_alert(amount, check_otherwise = true) {
            return { icon: amount != 0 ? 'alert' : check_otherwise ? 'check' : null }
        },
        neg_alert(amount, check_otherwise = true) {
            return { icon: amount < 0 ? 'alert' : check_otherwise ? 'check' : null }
        },
        create_ressource_disper(name, ressource_data) {
            return [
                { name: name + ' Balance', value: ressource_data.load_balance },
                '----',
                { name: name + ' Taxed Unload', value: ressource_data.client_unload.taxed, mul: -1 },
                { name: name + ' Final Unload', value: ressource_data.client_unload.final_coverage },
                { name: name + ' Client Unload Balance', value: ressource_data.client_unload_balance },
                { name: name + ' Client Unload', value: ressource_data.client_unload.coverage },
                '----',
                { name: name + ' Coverage Span', value: ressource_data.invoice_coverage_span },
                { name: name + ' Real Coverage', value: ressource_data.real_invoice_coverage.coverage },
                { name: name + ' Ideal Coverage', value: ressource_data.ideal_invoice_coverage.coverage, color: 'grey' },
                '----',
                { name: name + ' Load', value: ressource_data.load, mul: -1 },
            ].map(elm => elm == '----' ? elm : ({ ...elm, value: this.$utils.money.amount_round(elm.value) }))
        },
        compute_ressource(load, total_load, full_invoice, client_invoice_unload, real_load = null) {

            real_load ??= load

            // ------ IDEAL
            const ideal_invoice_amount = load / (1 - this.taxe_rate)
            const ideal_invoice_coverage = this.compute_invoice_coverage(real_load, real_load, ideal_invoice_amount)

            // ------ REAL
            const real_invoice_coverage = this.compute_invoice_coverage(load, total_load, full_invoice)

            // ------ INVOICE SPAN
            const invoice_coverage_span = real_invoice_coverage.final_coverage - ideal_invoice_coverage.final_coverage

            // ------ UNLOAD
            const client_unload = this.compute_invoice_coverage(load, total_load, client_invoice_unload)
            const client_unload_balance = client_unload.coverage - real_invoice_coverage.coverage

            // ------ BALANCE
            const load_balance = client_unload.final_coverage - ideal_invoice_coverage.final_coverage

            return {
                load,
                ideal_invoice_coverage,
                real_invoice_coverage,
                invoice_coverage_span,
                client_unload,
                client_unload_balance,
                load_balance,
            }
        },
        compute_invoice_coverage(load, total_load, full_invoice) {

            const prop_on_total = total_load == 0 ? 0 : load / total_load

            const coverage = full_invoice * prop_on_total
            const taxed = coverage * this.taxe_rate
            const final_coverage = coverage - taxed

            return { prop_on_total, coverage, taxed, final_coverage }
        },
        can_disp(disper) {
            return disper.reduce((a, b) => a || b.value != 0, false)
        },
        add_new(table_name, pre_object) {
            this.$refs.random_adder.add(table_name, pre_object)
        },
        edit() {
            this.$refs.entry_updater.edit('project', this.project.id)
        },
        async add_asset() {
            const move = await this.$refs.random_adder.add('move', { project: this.project.id, type: 'out' })
            await this.$refs.random_adder.add('asset', {
                project: this.project.id, label: move.label, move: move.id,
                order_date: move.date, description: move.description,
            })
        },
    }
}
</script>

<style>
</style>