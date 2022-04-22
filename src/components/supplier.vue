<template>
    <v-expansion-panel
        :is="standalone ? 'v-card' : 'v-expansion-panel'"
        :class="standalone ? 'pa-5' : ''"
        elevation="0"
    >
        <!-- --------------------------------------------- HEADER -->
        <v-expansion-panel-header
            :is="standalone ? 'div' : 'v-expansion-panel-header'"
            :class="standalone ? 'mb-5' : ''"
        >
            <v-card-title>
                <v-row>
                    <v-col
                        col="6"
                        class='flexer'
                    >
                        <v-img
                            v-if="supplier.logo"
                            :src="supplier.logo"
                            width="70px"
                            height="70px"
                            max-width="70px"
                            max-height="70px"
                            contain
                            class='mr-10'
                            style="border-radius:10px"
                        />
                        {{supplier.name}}
                    </v-col>
                    <!-- -------------------quick access -->
                    <v-col
                        cols="3"
                        class='flexer'
                    >
                        <links-displayer
                            table_name="supplier"
                            :item="supplier"
                        ></links-displayer>
                        <v-btn
                            icon
                            @click="update"
                        >
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="!standalone"
                            icon
                            :to="'/supplier/'+supplier.id"
                        >
                            <v-icon>mdi-open-in-new</v-icon>
                        </v-btn>
                        <!-- ------------------- orders -->
                        <v-spacer />
                        <v-btn color="primary">
                            <v-icon left>mdi-plus</v-icon>
                            asset
                        </v-btn>
                        <!-- -------------------contact -->
                    </v-col>
                    <v-col
                        cols="3"
                        class='flexer'
                    >
                        <v-spacer />
                        <v-btn
                            icon
                            v-if="supplier.email"
                            @click.stop=""
                            :href="'mailto:'+supplier.email"
                            class='mr-3'
                        >
                            <v-icon>mdi-email</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            v-if="supplier.telephone"
                            @click.stop=""
                            :href="'tel:'+supplier.telephone"
                        >
                            <v-icon>mdi-phone</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
        </v-expansion-panel-header>
        <!-- --------------------------------------------- CONTENT -->
        <v-expansion-panel-content :is="standalone ? 'div' : 'v-expansion-panel-content'">
            <v-row>
                <v-col cols="4">
                    <entry-displayer
                        :item="supplier"
                        table_name="supplier"
                        :is_alone="true"
                        :actionable="false"
                        :show_multis="false"
                    ></entry-displayer>
                </v-col>
                <v-col cols="4">
                    <task-disp
                        v-for="task in this.$utils.tasks.assets_to_tasks(this.assets)"
                        :key="task.id"
                        :task="task"
                        :dense="false"
                    >
                    </task-disp>
                    <v-card
                        v-for="asset in assets.filter(a=>a.delivered)"
                        :key="asset.id"
                        outlined
                    >
                        <v-card-title>
                            <v-icon class='mr-3'>mdi-package</v-icon>
                            {{asset.label}}
                            <v-spacer />
                            <v-icon>mdi-check</v-icon>
                        </v-card-title>
                        <v-card-subtitle>{{asset.description}}</v-card-subtitle>
                    </v-card>
                </v-col>
                <v-col cols="4">
                    <move-disp
                        v-for="move in $db.referencers(supplier,'supplier','move')"
                        :key="move.id"
                        :move="move"
                    ></move-disp>
                </v-col>
            </v-row>
        </v-expansion-panel-content>
        <entry-updater ref='entry_updater'></entry-updater>
    </v-expansion-panel>
</template>

<script>
import EntryUpdater from '@/db_vues/entry-updater.vue'
import LinksDisplayer from './links-displayer.vue'
import EntryDisplayer from '@/db_vues/entry-displayer.vue'
import MoveDisp from './move-disp.vue'
import TaskDisp from './task-disp.vue'
export default {
    props: ['supplier', 'standalone'],
    components: { EntryUpdater, LinksDisplayer, EntryDisplayer, MoveDisp, TaskDisp },
    computed: {
        assets() {
            return Object.values(this.$db.referencers(this.supplier, 'supplier', 'move'))
                .map(move => Object.values(this.$db.referencers(move, 'move', 'asset'))).flat()
        }
    },
    methods: {
        update() {
            this.$refs.entry_updater.edit('supplier', this.supplier.id)
        },
    }
}
</script>

<style>
</style>