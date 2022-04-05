<template>
    <center-container max-width="800px">
        <v-card>
            <v-card-title>
                <v-icon
                    class='mr-3'
                    color="primary"
                >mdi-account</v-icon> Connection
            </v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="form.conn"
                    label="connector"
                ></v-text-field>
                <v-text-field
                    v-model="form.pass"
                    label="password"
                    type="password"
                ></v-text-field>
                <v-btn
                    color="primary"
                    @click="connect"
                    :loading="connecting"
                >connect</v-btn>
            </v-card-text>
        </v-card>
    </center-container>
</template>

<script>
import centerContainer from '@/components/center-container.vue'
export default {
    components: { centerContainer },
    data: () => ({
        form: { conn: '', pass: '' },
        connecting: false,
    }),
    methods: {
        async connect() {
            this.connecting = true
            await this.$keydb_api.auth.connect(this.form)
            this.connecting = false
            this.$router.push('/')
            location.reload()
        }
    },
    mounted() {

    }
}
</script>

<style>
</style>