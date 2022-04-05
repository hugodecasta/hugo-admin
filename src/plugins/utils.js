export default {
    install(vue) {
        vue.mixin({
            beforeCreate() {
                this.$utils = {
                    money: {
                        moves_final(moves) {
                            return moves
                                .filter(m => new Date(m.date) < new Date())
                                .reduce((a, b) => a + (b.type == 'in' ? b.amount : -b.amount), 0)
                        },
                        amount_display(amount, dev = '€', disp_sign = true, inverse_sign = false) {
                            const sign = amount != 0 && disp_sign ? (amount > 0 ^ inverse_sign) ? '+ ' : '- ' : ''
                            return sign + String(amount).replace('.', ',').replace('-', '') + ' ' + dev
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