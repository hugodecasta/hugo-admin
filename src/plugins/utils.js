import Vue from 'vue'
import { format } from 'date-fns'

const time_state = Vue.observable({ now: Date.now() })

function update_time() {
    const date = new Date()
    Vue.set(time_state, 'now', date.getTime())
}

setInterval(update_time, 1000 * 60 * 30)
update_time()

export default {
    install(vue) {
        vue.mixin({
            beforeCreate() {
                this.$utils = {
                    time: time_state,
                    clean_date(date_str) {
                        const date = new Date(date_str)
                        date.setHours(0, 0, 0)
                        return date
                    },
                    tasks: {
                        sort(tasks) {
                            function task_score(task) {
                                if (task.done) return 0
                                if (!task.deadline) return task.started ? 2 : 1
                                const diff = Date.now() - new Date(task.deadline).getTime()
                                return 10000 + (diff / 1000000) + (task.started ? 0.5 : 0)
                            }
                            return tasks.filter(t => !t.archived).sort((t1, t2) => {
                                return task_score(t2) - task_score(t1)
                            })
                        },
                        assets_to_tasks(assets) {
                            return assets.map(asset => {
                                if (asset.delivered) return null

                                const deliver_test = asset.estimated_deliver_date ?
                                    ' - delivery scheduled for ' + format(new Date(asset.estimated_deliver_date), 'dd/MM/yyyy') :
                                    ''

                                return {
                                    id: asset.id,
                                    no_action_task: true,
                                    label: 'Order - ' + asset.label,
                                    table_override: 'asset',
                                    icon: 'package',
                                    link: '/table/asset/' + asset.id,
                                    description: 'Order checking for ' + asset.label + deliver_test + '\n' + asset.description,
                                    project: asset.project,
                                    deadline: asset.estimated_deliver_date,
                                    started: true,
                                    start_date: asset.order_date,
                                    done: false,
                                    end_date: null,
                                }

                            }).filter(e => e)
                        }
                    },
                    money: {
                        compute_taxe_rate(taxes, move_date) {
                            return taxes.filter(t => {
                                const is_post_date = !t.start_date || new Date(t.start_date) <= move_date
                                const is_pre_date = !t.end_date || new Date(t.end_date) >= move_date
                                return is_post_date && is_pre_date
                            }).reduce((a, b) => a + b.rate, 0) / 100
                        },
                        add_taxe(amount, taxe_rate) {
                            return amount / (1 - taxe_rate)
                        },
                        moves_final(moves) {
                            return moves
                                .filter(m => new Date(m.date) < new Date())
                                .reduce((a, b) => a + (b.type == 'in' ? b.amount : -b.amount), 0)
                        },
                        amount_display(amount, dev = '€', disp_sign = true, inverse_sign = false) {
                            const sign = amount != 0 && disp_sign ? (amount > 0 ^ inverse_sign) ? '+ ' : '- ' : ''
                            const full_part = String(parseInt(amount * 10 * 10))
                            const sub_part = full_part.slice(full_part.length - 2, full_part.length)
                            const int_part = full_part.slice(0, full_part.length - 2)
                            const int_part_final = Array.from(int_part ? int_part : '0').reverse()
                                .reduce((a, b, i) => i != 0 && (i) % 3 == 0 ? a.concat(b + ' ') : a.concat(b), []).reverse().join('')
                                .replace('-', '')
                            const amount_str = int_part_final + ',' + sub_part
                            return sign + amount_str + ' ' + dev

                        },
                        amount_round(amount) {
                            return Math.ceil(amount * 100) / 100
                        },
                        amount_class(amount) {
                            return (amount < 0 ? 'error' : 'success') + '--text'
                        },
                        amount_color(amount) {
                            return (amount < 0 ? 'error' : 'success')
                        },
                        taxe_paid(move) {
                            return move.taxes_paied.map(taxe_id => this.$db.table_item('taxe', taxe_id).reduced_name).join(', ')
                        },
                    }
                }
            }
        })
    }
}