<template>
    <v-card
        :dark="!is_done"
        elevation="0"
        class="mb-3"
        :outlined="is_done"
        :color="!is_started ? 'black' : ''"
    >

        <!-- <v-btn
            fab
            x-small
            icon
            @click="edit"
            absolute
            class='edit_task_btn'
        >
            <v-icon>mdi-pencil</v-icon>
        </v-btn> -->

        <v-progress-linear
            v-if="color && !dense"
            absolute
            value="100"
            height="6"
            bottom
            :color="color"
        ></v-progress-linear>
        <v-card-title>
            <v-icon
                v-if="icon"
                :color="color"
                class='mr-3'
            >mdi-{{icon}}</v-icon>
            <span>{{task.label}}</span>
            <v-btn
                icon
                v-if="task.link"
                x-small
                class='ml-3'
                color="grey"
                :to="task.link"
            >
                <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <template v-if="!is_done">
                <span
                    :class='["mr-3",color_class]'
                    v-if="days_left"
                >{{days_left}} days left</span>
                <span
                    class='mr-3'
                    v-else
                >
                    <v-icon>mdi-all-inclusive</v-icon>
                </span>
            </template>
            <v-btn
                v-if="!dense && !task.no_action_task"
                fab
                small
                :icon="is_in_progress"
                elevation="0"
                :color="color ? color : action_color"
                @click="action"
            >
                <v-icon>mdi-{{action_icon}}</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text v-if="is_in_progress">
            <v-progress-linear
                :color="color ? color : action_color"
                :value="progression"
            ></v-progress-linear>
        </v-card-text>
        <v-card-subtitle
            v-if="!dense && task.description"
            v-html="task.description.replace(/\n/g,'<br/>')"
        ></v-card-subtitle>
        <entry-updater ref="updater"></entry-updater>
    </v-card>
</template>

<script>
import { format } from 'date-fns'
import EntryUpdater from '@/db_vues/entry-updater.vue'
export default {
    props: ['task', 'dense'],
    components: { EntryUpdater },
    watch: {
        '$utils.time.now'() {
            this.$forceUpdate()
        }
    },
    computed: {
        is_started() {
            return this.task.started && !!this.task.start_date
        },
        is_done() {
            return this.task.done && !!this.task.end_date
        },
        is_in_progress() {
            return this.is_started && !this.is_done
        },
        is_time_alert() {
            return (!this.is_started && this.days_left && this.days_left < 3) || (this.is_in_progress && this.days_left < 0)
        },
        is_time_speed() {
            return this.is_in_progress && this.days_left && this.days_left < 2
        },
        icon() {
            return this.is_time_alert ? 'alert' : this.is_time_speed ? 'timer' : this.task.icon
        },
        color() {
            return this.is_time_alert ? 'error' : null
        },
        color_class() {
            return this.color ? this.color + '--text' : null
        },
        action_icon() {
            return this.is_done ? 'archive' : this.is_started ? 'check-bold' : 'play'
        },
        action_color() {
            return this.is_done ? 'white' : this.is_started ? 'success' : 'info'
        },
        days_left() {
            if (!this.task.deadline) return null
            const diff = (new Date(this.task.deadline)).getTime() - this.$utils.time.now
            return Math.ceil(diff / 1000 / 60 / 60 / 24)
        },
        progression() {
            if (!this.is_in_progress || !this.task.deadline) return null
            const start = new Date(this.task.start_date).getTime()
            const deadline = new Date(this.task.deadline).getTime()
            const diff = deadline - start
            const now = this.$utils.time.now - start
            return (now / diff) * 100
        }
    },
    methods: {
        action() {
            if (this.is_done) {
                this.$set(this.task, 'archived', true)
            }
            else if (this.is_started) {
                this.$set(this.task, 'end_date', format(new Date(), 'yyyy-MM-dd'))
                this.$set(this.task, 'done', true)
            }
            else {
                this.$set(this.task, 'start_date', format(new Date(), 'yyyy-MM-dd'))
                this.$set(this.task, 'started', true)
            }
            this.$db.update_item('task', this.task)
        },
        edit() {
            this.$refs.updater.edit('task', this.task.id)
        }
    }
}
</script>

<style>
.edit_task_btn {
    bottom: 5px;
    right: 20px;
    opacity: 0.1;
}
.edit_task_btn:hover {
    opacity: 1;
}
</style>