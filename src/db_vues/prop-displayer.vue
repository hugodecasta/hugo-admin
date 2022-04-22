<template>
    <span v-if="is_displayed">
        <span v-if="is_string">
            <v-text-field
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                @keydown.enter="validate_tmp"
            ></v-text-field>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{value}}</v-card-text>
        </span>
        <span v-if="type == 'phone'">
            <v-text-field
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                @keydown.enter="validate_tmp"
            ></v-text-field>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: <a :href="'tel:'+value">{{value}}</a></v-card-text>
        </span>
        <span v-if="type == 'email'">
            <v-text-field
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                @keydown.enter="validate_tmp"
            ></v-text-field>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: <a :href="'mailto:'+value">{{value}}</a></v-card-text>
        </span>
        <span v-if="type == 'link'">
            <v-text-field
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                @keydown.enter="validate_tmp"
            ></v-text-field>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: <a
                    :href="value"
                    target="_blank"
                >{{value.length>100 ? 'click to goto link' : value}}</a></v-card-text>
        </span>
        <span v-else-if="type == 'long-string'">
            <v-textarea
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                @keydown.enter="validate_tmp"
            ></v-textarea>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{value}}</v-card-text>
        </span>
        <span v-else-if="type == 'boolean'">
            <v-checkbox
                v-if="edit"
                :label="prop_final_name"
                v-model="tmp"
            ></v-checkbox>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{value ? 'yes' : 'no'}}</v-card-text>
        </span>
        <span v-else-if="type == 'date'">
            <div v-if="edit">
                <b>{{prop_final_name}}</b>
                <v-btn
                    icon
                    @click="tmp = undefined"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-date-picker
                    first-day-of-week="1"
                    class='ml-5'
                    dense
                    v-model="tmp"
                ></v-date-picker>
            </div>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{$db.date_format(value)}}</v-card-text>
        </span>
        <span v-else-if="type == 'number'">
            <v-text-field
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                :rules="[v=>!isNaN(parseFloat(v))]"
                @keydown.enter="validate_tmp"
            ></v-text-field>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{value}}</v-card-text>
        </span>
        <span v-else-if="is_ref">
            <ref-viewer
                :prop_name='prop_name'
                v-model='tmp'
                :config='config'
                :edit='edit'
                :on_the_fly='on_the_fly'
                :item='item'
            ></ref-viewer>
        </span>
        <span v-else-if="is_select">
            <v-select
                :label="prop_final_name"
                v-if="edit"
                v-model="tmp"
                :items='config.select'
                @change="validate_tmp"
            >
            </v-select>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{value}}</v-card-text>
        </span>
        <span v-else-if="is_array">
            <v-combobox
                v-if="edit"
                v-model="tmp"
                :items="[]"
                :label="prop_final_name"
                multiple
            >
                <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        @click="select"
                        @click:close="remove_item(item)"
                    >
                        <strong>{{ item }}</strong>
                    </v-chip>
                </template>
            </v-combobox>
            <v-card-text v-else> <b>{{prop_final_name}}</b>: {{value && value.length ? value.join(', ') : '- no items -'}}</v-card-text>
        </span>
    </span>
</template>

<script>
import refViewer from './ref-viewer.vue'
export default {
    components: { refViewer },
    name: 'prop-displayer',
    props: ['prop_name', 'value', 'config', 'edit', 'on_the_fly', 'item'],
    data: () => ({
        tmp: null
    }),
    watch: {
        edit: {
            handler() {
                this.reset()
            },
        },
        value: {
            handler() {
                this.reset()
            },
            immediate: true
        },
        tmp() {
            this.on_the_fly ? this.validate_tmp() : null
        }
    },
    computed: {
        is_displayed() {
            const if_data = this.config.if
            if (!if_data) return true
            const eval_if = (if_data) => {
                if (Array.isArray(if_data)) return if_data.map(eval_if).reduce((a, b) => a && b, true)
                if (typeof if_data == 'string') {
                    return eval_if(if_data.split(' && ').map(elm => {
                        const [, prop, comp, value] = /(.*?)(=|<|>|!)(.*?)$/g.exec(elm)
                        return { prop, comp, value: JSON.parse(value) }
                    }))
                }
                const { prop, comp, value } = if_data
                const prop_value = this.item[prop]
                return {
                    '=': (value == false && !prop_value) || prop_value == value,
                    '!': prop_value != value
                }[comp]
            }
            return eval_if(if_data)
        },
        prop_final_name() {
            return this.prop_name.replace(/_/g, ' ')
        },
        type() {
            return this.config.type
        },
        nullable() {
            return this.config.nullable
        },
        is_string() {
            return this.config.type == 'string'
        },
        is_array() {
            return this.config.type == 'array'
        },
        is_ref() {
            return !!this.config.ref || !!this.config.array_of
        },
        is_select() {
            return !!this.config.select
        },
        array_of_table() {
            return this.config.array_of
        },
        ref_table() {
            return this.config.ref
        },
    },
    methods: {
        reset() {
            this.tmp = this.value
            if (this.tmp === undefined) {
                this.tmp = this.config.def
                this.$emit('input', this.tmp)
            }
            if (this.is_array_of && (!this.tmp || !Array.isArray(this.tmp))) this.tmp = []
        },
        validate_tmp() {
            if (this.config.type == 'number') this.tmp = JSON.parse(this.tmp)
            this.$emit('input', this.tmp)
        },
        remove_item(item) {
            this.tmp.splice(this.tmp.indexOf(item), 1)
        },
        remove_ref_item(id) {
            this.tmp.splice(this.tmp.indexOf(id), 1)
        }
    },
}
</script>

<style>
.item_prop .v-card__text {
    padding-bottom: 10px !important;
    padding-top: 5px !important;
}
</style>