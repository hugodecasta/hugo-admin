<template>
    <v-app>
        <v-main v-if="(common.user || connected === false) && db_ready">
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

    computed: {
        ...mapState(['common']),
    },

    async mounted() {
        const connected = await this.$keydb_api.auth.connected()
        this.connected = connected
        if (!connected) return this.$router.push('/connector')
        const token = await this.$keydb_api.auth.get_token()
        await this.$keydb_api.auth.reconnect(token)
        const user = await this.$keydb_api.auth.user.get()
        this.$set(this.common, 'user', user)

        const data_base_config = {
            name: 'hugo_admin',
            namers: {
                client: '${name}',
                associate: '${name}',
                supplier: '${name}',
                project: '${name}',
                taxe: '${organisme} - ${name} - ${rate}%',
                move: '${label} - ${amount}€',
                estimate: '${number}',
                invoice: '${number}',
            },
            data: {
                client: {
                    name: { type: 'string' },
                    street: { type: 'string' },
                    zip: { type: 'number' },
                    city: { type: 'string' },
                    telephone: { type: 'string' },
                    email: { type: 'string' },
                    siren: { type: 'string' },
                },
                associate: {
                    name: { type: 'string' },
                    street: { type: 'string' },
                    zip: { type: 'number' },
                    city: { type: 'string' },
                    telephone: { type: 'string' },
                    email: { type: 'string' },
                    siren: { type: 'string' },
                },
                supplier: {
                    name: { type: 'string' },
                    street: { type: 'string' },
                    zip: { type: 'number' },
                    city: { type: 'string' },
                    telephone: { type: 'string' },
                    email: { type: 'string' },
                    siren: { type: 'string' },
                },
                project: {
                    name: { type: 'string' },
                    description: { type: 'long-string' },
                    client: { ref: 'client', nullable: true, delete: false },
                    associates: { array_of: 'associate' },
                    links: { type: 'array' },
                    labor_hour_cost: { type: 'number' },
                    hours_spent_prevision: { type: 'number' },
                    hours_spent_real: { type: 'number' },
                    ressource_cost: { type: 'number' },
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
                    active: { type: 'boolean' }
                },
                move: {
                    date: { type: 'date' },
                    label: { type: 'string' },
                    description: { type: 'long-string' },
                    type: { select: ['in', 'out'] },

                    taxed: { type: 'boolean', if: { prop: 'type', comp: '=', value: 'in' } },
                    is_paid_taxe: { type: 'boolean', if: { prop: 'type', comp: '=', value: 'out' } },

                    invoice: { ref: 'invoice', if: 'type="in" && taxed=true' },

                    taxes_paied: {
                        array_of: 'taxe', if: [
                            { prop: 'is_paid_taxe', comp: '=', value: true },
                            { prop: 'type', comp: '=', value: 'out' }
                        ]
                    },

                    client: { ref: 'client', nullable: true, delete: false, if: { prop: 'type', comp: '=', value: 'in' } },
                    supplier: { ref: 'supplier', nullable: true, delete: false, if: { prop: 'type', comp: '=', value: 'out' } },
                    project: { ref: 'project', nullable: true, delete: false },

                    amount: { type: 'number' },
                },
            }
        }

        await this.$init_db(data_base_config)
        console.log('db', this.$db)
        this.db_ready = true
    }
};
</script>
