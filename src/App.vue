<template>
    <v-app>
        <v-btn
            icon
            fixed
            bottom
            left
            style="z-index:100000"
            to="/"
        >
            <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-main v-if="(common.user && db_ready) || connected === false">
            <router-view />
        </v-main>
        <v-progress-linear
            v-else
            color="primary"
            indeterminate
        ></v-progress-linear>
    </v-app>
</template>

<script>

import { mapState } from 'vuex'

export default {
    name: 'App',

    data: () => ({
        connected: null,
        db_ready: false,
    }),

    watch: {
        '$utils.time.now'() {
            this.$forceUpdate()
        }
    },

    computed: {
        ...mapState(['common']),
    },

    async mounted() {
        const connected = await this.$keydb_api.auth.connected()
        this.connected = connected
        if (!connected) {
            return this.$router.push('/connector')
        }
        const token = await this.$keydb_api.auth.get_token()
        await this.$keydb_api.auth.reconnect(token)
        const user = await this.$keydb_api.auth.user.get()
        this.$set(this.common, 'user', user)

        const data_base_config = {
            name: 'hugo_admin',
            urls: {
                project: '/project/${id}',
                supplier: '/supplier/${id}',
            },
            namers: {
                client: '${name}',
                associate: '${name}',
                supplier: '${name}',
                project: '${name}',
                taxe: '${organisme} - ${name} - ${rate}%',
                move: '${label} - ${amount}€',
                estimate: '${number}',
                invoice: '${number}',
                asset: '${label}',
                task: '${label}',
                link: '${name}'
            },
            data: {
                client: {
                    name: { type: 'string' },
                    street: { type: 'string' },
                    zip: { type: 'number' },
                    city: { type: 'string' },
                    telephone: { type: 'phone' },
                    email: { type: 'email' },
                    siren: { type: 'string' },
                },
                associate: {
                    name: { type: 'string' },
                    street: { type: 'string' },
                    zip: { type: 'number' },
                    city: { type: 'string' },
                    telephone: { type: 'phone' },
                    email: { type: 'email' },
                    siren: { type: 'string' },
                },
                supplier: {
                    name: { type: 'string' },
                    logo: { type: 'link' },
                    street: { type: 'string' },
                    zip: { type: 'number' },
                    city: { type: 'string' },
                    telephone: { type: 'phone' },
                    email: { type: 'email' },
                    siren: { type: 'string' },
                },
                project: {
                    name: { type: 'string' },
                    description: { type: 'long-string' },
                    is_rd: { type: 'boolean' },
                    client: { ref: 'client', nullable: true, delete: false, if: 'is_rd=false' },
                    pending: { type: 'boolean', def: true },
                    starting_date: { type: 'date', if: 'pending=false' },
                    associates: { array_of: 'associate' },
                    labor_hour_cost: { type: 'number', def: 70, if: 'is_rd=false' },
                    hours_spent_prevision: { type: 'number', def: 0, if: 'is_rd=false' },
                    hours_spent_real: { type: 'number', def: 0, if: 'is_rd=false' },
                    assets_cost_prevision: { type: 'number', def: 0, if: 'is_rd=false' },
                    ending_date: { type: 'date', if: 'pending=false && starting_date!null' },
                },
                estimate: {
                    number: { type: 'string' },
                    date: { type: 'date' },
                    project: { ref: 'project' },
                    client: { ref: 'client' },
                    signed: { type: 'boolean' },
                    signed_date: { type: 'date', if: 'signed=true' },
                    amount: { type: 'number' },
                    pdf_link: { type: 'string' },
                },
                invoice: {
                    number: { type: 'string' },
                    date: { type: 'date' },
                    estimate: { ref: 'estimate' },
                    project: { ref: 'project' },
                    client: { ref: 'client' },
                    is_advance: { type: 'boolean', if: 'is_balance=false' },
                    is_balance: { type: 'boolean', if: 'is_advance=false' },
                    is_replacer: { type: 'boolean' },
                    replaced_invoice: { ref: 'invoice', if: 'is_replacer=true' },
                    canceled: { type: 'boolean', if: 'closed=false' },
                    closed: { type: 'boolean', if: 'canceled=false' },
                    cancel_date: { type: 'date', if: 'canceled=true && closed=false' },
                    closed_date: { type: 'date', if: 'canceled=false && closed=true' },
                    amount: { type: 'number' },
                    pdf_link: { type: 'string' },
                },
                taxe: {
                    name: { type: 'string' },
                    reduced_name: { type: 'string' },
                    organisme: { type: 'string' },
                    rate: { type: 'number' },
                    active: { type: 'boolean' },
                    start_date: { type: 'date' },
                    end_date: { type: 'date' },
                },
                move: {
                    date: { type: 'date' },
                    label: { type: 'string' },
                    description: { type: 'long-string' },
                    type: { select: ['in', 'out'] },

                    taxed: { type: 'boolean', if: 'type="in"' },
                    is_paid_taxe: { type: 'boolean', if: 'type="out"' },

                    invoice: { ref: 'invoice', if: 'type="in" && taxed=true' },

                    taxes_paied: { array_of: 'taxe', if: 'is_paid_taxe=true && type="out"' },

                    supplier: { ref: 'supplier', nullable: true, delete: false, if: 'type="out"' },

                    project: { ref: 'project', nullable: true, delete: false },
                    client: { ref: 'client', nullable: true, delete: false, if: 'type="in"' },

                    amount: { type: 'number' },
                },
                task: {
                    label: { type: 'string' },
                    description: { type: 'long-string' },
                    project: { ref: 'project' },
                    started: { type: 'boolean' },
                    start_date: { type: 'date', if: 'started=true && done=false' },
                    deadline: { type: 'date' },
                    done: { type: 'boolean' },
                    end_date: { type: 'date', if: 'started=false && done=true' },
                    archived: { type: 'boolean', if: 'end_date!null' },
                },
                asset: {
                    label: { type: 'string' },
                    order_date: { type: 'date' },
                    delivered: { type: 'boolean' },
                    delivered_date: { type: 'date', if: 'delivered=true' },
                    estimated_deliver_date: { type: 'date', if: 'delivered=false' },
                    description: { type: 'long-string' },
                    project: { ref: 'project' },
                    move: { ref: 'move' },
                },
                link: {
                    name: { type: 'string' },
                    link: { type: 'link' },
                    ref: { ref: 'any' },
                },
            }
        }

        await this.$init_db(data_base_config)
        this.db_ready = true
    }
};
</script>

<style>
.flexer {
    display: flex;
    align-items: center;
}
</style>
