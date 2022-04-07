export default {
    install(vue) {
        vue.mixin({
            beforeCreate() {
                this.$utils = {
                    money: {
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