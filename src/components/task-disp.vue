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
                    v-if="days_left_disp"
                >{{days_left_disp}}</span>
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
        <v-card-text v-if="is_in_progress && !is_infinite">
            <v-progress-linear
                :color="color ? color : action_color"
                :value="progression"
            ></v-progress-linear>
            <div class='days_container'>
                <div
                    class='days_from_beginning'
                    :style="{
                        width:((days_from_beginning*24*60*60*1000)/diff_from_beginning)*100+'%'
                    }"
                >
                    <div
                        v-for="day in days_from_beginning"
                        :key="day"
                        :style="{ borderRight: `1px solid var(--v-${color ? color : 'success'}-base`}"
                        :class="['day',days_from_beginning - day<days_left ? 'comming' : '']"
                    >
                    </div>
                </div>
            </div>
        </v-card-text>
        <v-card-subtitle
            v-if="!dense && task.description"
            v-html="task.description.replace(/\n/g,'<br/>')"
        ></v-card-subtitle>
        <entry-updater ref="updater"></entry-updater>
        <links-displayer
            :table_name="task.table_override ? task.table_override : 'task'"
            :item="task"
            :absolute="true"
            :dark="!is_done"
        ></links-displayer>
    </v-card>
</template>

<script>
import { format } from 'date-fns'
import EntryUpdater from '@/db_vues/entry-updater.vue'
import LinksDisplayer from './links-displayer.vue'
export default {
    props: ['task', 'dense'],
    components: { EntryUpdater, LinksDisplayer },
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
        is_infinite() {
            return !this.is_done && !this.days_left_disp
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
            const deadline = this.$utils.clean_date(this.task.deadline)
            const now = this.$utils.clean_date(this.$utils.time.now)
            const diff = deadline.getTime() - now.getTime()
            return Math.ceil(diff / 1000 / 60 / 60 / 24)
        },
        days_left_disp() {
            if (this.days_left == null) return null
            const days = 'day' + (Math.abs(this.days_left) > 1 ? 's' : '')
            return this.days_left == 0 ? 'today' : this.days_left < 1 ? `${-this.days_left} ${days} late` : `${this.days_left} ${days} left`
        },
        diff_from_beginning() {
            if (!this.is_in_progress || !this.task.deadline) return null
            const start = this.$utils.clean_date(this.task.start_date).getTime()
            const deadline = this.$utils.clean_date(this.task.deadline).getTime() //+ (1000 * 60 * 60 * 24)
            const diff = deadline - start
            return diff
        },
        days_from_beginning() {
            return Math.ceil(this.diff_from_beginning / 1000 / 60 / 60 / 24)
        },
        progression() {
            const start = this.$utils.clean_date(this.task.start_date).getTime()
            const now = this.$utils.time.now - start
            return (now / this.diff_from_beginning) * 100
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
.days_from_beginning {
    margin-top: 5px;
    margin-bottom: -10px;
    width: 100%;
    height: 5px;
    display: flex;
    align-items: center;
    margin-left: auto;
}
.days_from_beginning .day {
    height: 100%;
    width: 100%;
    border-right: 1px solid var(--v-success-base);
}
.days_from_beginning .day.comming {
    opacity: 0.5;
}
</style>