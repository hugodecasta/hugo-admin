import { io } from 'socket.io-client'
import Vue from 'vue'
import { format } from 'date-fns'

// ----------------------------------------------------- Global database

let global_database_carrier_init = false
const global_database_carrier = new Vue({
    data: () => ({
        is_init: false,
        init_promise: null,

        config: {},
        multis: {},
        data: {},

        cache_id_to_table: {},
    }),
    methods: {

        // ----------------------- BASE

        check_init() {
            if (!this.is_init) throw new Error('DB must be initialized before any table call')
        },

        table_items(table_name) {
            this.check_init()
            return this.data[table_name + 's']
        },
        table_item(table_name, id) {
            return this.table_items(table_name)[id]
        },
        table_items_filtered(table_name, filters) {
            this.check_init()
            const conjonctions = filters ?? []
            return Object.fromEntries(Object.entries(this.table_items(table_name)).filter(([, dat]) => {
                for (const disjonctions of conjonctions) {
                    let conj_ok = false
                    for (const test of disjonctions) {
                        const { prop, regex } = test
                        conj_ok = dat[prop]?.match?.(new RegExp(regex)) || dat[prop]?.includes?.(regex)
                        if (conj_ok) break
                    }
                    if (!conj_ok) return false
                }
                return true
            }))
        },
        table_items_list(table_name, list) {
            return Object.fromEntries(list.map(id => [id, this.table_item(table_name, id)]))
        },
        table_multis(table_name) {
            this.check_init()
            return [...(this.multis[table_name] ?? []), ...(this.multis['any'] ?? [])]
        },
        update_item(table_name, item) {
            this.check_init()
            const props = Object.keys(this.config.data[table_name])
            const obj = { id: item.id, ...Object.fromEntries(props.map(prop => [prop, item[prop]])) }
            console.log('update', obj, table_name)
            this.$set(this.table_items(table_name), item.id, obj)
        },

        // ----------------------- SUBS

        table_data_config(table_name) {
            this.check_init()
            return this.config.data[table_name]
        },
        table_namer(table_name) {
            this.check_init()
            return this.config.namers[table_name]
        },
        item_name(table_name, item) {
            if (!item) return undefined
            const namer = this.table_namer(table_name)
            if (!namer) return '<missing item name pattern>'
            const name = namer.replace(/\$\{(.*?)\}/g, (m, g) => item[g])
            return name
        },
        table_item_url(table_name, item_id) {
            const item = this.table_item(table_name, item_id)
            const url_pattern = this.config.urls[table_name]
            if (!url_pattern) return null
            return url_pattern.replace(/\$\{(.*?)\}/g, (m, g) => item[g])
        },
        item_name_id(table_name, id) {
            return this.item_name(table_name, this.table_item(table_name, id))
        },

        // ----------------------- REFERENCES

        items_referencing_me(item, table_name) {
            this.check_init()
            const { id } = item
            const multis = this.table_multis(table_name)
            if (!multis) return {}
            return Object.fromEntries(multis.map(refer => {
                const { table, prop } = refer
                const items = this.table_items_filtered(table, [[{ prop, regex: id }]])
                return [table, items]
            }))
        },

        referencers(item, table_name, referencer_table_name) {
            return this.items_referencing_me(item, table_name)[referencer_table_name]
        },

        get_referenced_items(table_name, item, referenced_table_name) {
            this.check_init()
        },

        find_item_table(item_id) {
            const find_table = () => {
                const plural_name = Object.keys(this.data).find(table_name => !!this.data[table_name][item_id])
                return Array.from(plural_name).slice(0, plural_name.length - 1).join('')
            }
            const table = this.cache_id_to_table[item_id] ?? find_table()
            this.cache_id_to_table[item_id] = table
            return table
        },

        find_item(item_id) {
            const table = this.find_item_table(item_id)
            return this.table_item(table, item_id)
        },

        // ----------------------- EDIT

        delete_item(table_name, id, force = false) {
            console.log(table_name, id)
            if (!force && !confirm(`delete ${table_name} "${this.item_name_id(table_name, id)}" ?`)) return
            const item = this.table_item(table_name, id)
            const ref_me = this.items_referencing_me(item, table_name)
            const ref_tables = Object.entries(ref_me).filter(([, content]) => content.length).map(([table_name]) => table_name)
            if (ref_tables.length && !force) {
                let action_delete = true
                if (!confirm(`There are still data attached to this ${table_name}: ${ref_tables.join(', ')} delete theme ?`)) {
                    if (!confirm('Set their reference to null ?')) return
                    else action_delete = false
                }

                ref_tables.forEach(ref_table => {
                    const items = ref_me[ref_table]
                    if (action_delete) Object.keys(items).forEach(id => this.delete_item(ref_table, id, true))
                    else Object.values(items).forEach(item => {
                        const props = Object.keys(item).filter(prop => item[prop] == id)
                        props.forEach(prop => item[prop] = null)
                    })
                })
            }
            this.$delete(this.table_items(table_name), id)
        },

        // ----------------------- INIT

        async bind_database(data_base_config) {

            // ---------- data

            const config_aibiss_key = data_base_config.name + '_config'

            const config_object_path = 'config'
            const multi_object_path = 'multis'
            const data_object_path = 'data'

            // ---------- bind config

            if (!await this.$keydb_api.key.exists(config_aibiss_key)) {
                console.log('create db config')
                await this.$keydb_api.key.set(config_aibiss_key, data_base_config)
            }
            const online_config = await this.$key_binder(config_aibiss_key, config_object_path)
            if (JSON.stringify(online_config) != JSON.stringify(data_base_config)) {
                console.log('update db config')
                await this.$keydb_api.key.set(config_aibiss_key, data_base_config)
            }

            // ---------- check multis

            const { root: multi_root, prop: multi_prop } = this.$resolve_path(multi_object_path)
            this.$set(multi_root, multi_prop, {})
            const multi_obj = multi_root[multi_prop]
            for (const table_name in data_base_config.data) {

                const refs = Object.entries(data_base_config.data[table_name])
                    .filter(([, config]) => 'ref' in config || 'array_of' in config)
                    .map(([prop, config]) => ({ prop, ...config }))

                refs.forEach((refer) => {
                    const { ref, array_of } = refer
                    const target_table = ref ?? array_of
                    if (!multi_obj[target_table]) this.$set(multi_obj, target_table, [])
                    multi_obj[target_table].push({ table: table_name, ...refer })
                })
            }

            // ---------- check tables

            await Promise.all(Object.keys(data_base_config.data).map(async table_name => {
                const table_aibiss_key = data_base_config.name + '_table_' + table_name
                const table_object_path = data_object_path + '.' + table_name + 's'
                if (!await this.$keydb_api.key.exists(table_aibiss_key)) {
                    console.log('create table', table_name)
                    await this.$keydb_api.key.set(table_aibiss_key, {})
                }
                await this.$key_binder(table_aibiss_key, table_object_path)
            }))

            const data_base_full = {
                config: this.config,
                multis: this.multis,
                data: this.data,
            }

            const bytes = JSON.stringify(data_base_full).length
            console.log('db loaded', (bytes / 1024) + 'kB')

            this.is_init = true
        },

        // ----------------------- FORMAT

        date_format(date) {
            try {
                return format(new Date(date), 'dd/MM/yyyy')
            } catch (e) {
                return '- no date -'
            }
        },
    }
})

// ----------------------------------------------------- MAIN API CLASS

class KEYDBAPI {

    constructor(api_host = 'https://keydb.hugocastaneda.fr', contact_api_host = 'https://contacter.hugocastaneda.fr') {
        this.credentials = null
        this.socket = io(api_host)
        this.key_api_host = api_host + '/api/key'
        this.api_host = api_host
        this.contact_api_host = contact_api_host
    }


    // ----------------- UTILS

    __get_cookie(key) {
        return Object.fromEntries(document.cookie.split('; ').map(cd => cd.split('=')))[key]
    }

    // ----------------- INNER API CALLERS



    async __auth_user_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        options.headers = { ...options.headers, ...this.create_auth_header() }
        const url = [this.api_host, "/api/auth", endpoint].join('/')
        const resp = await fetch(url, options)
        if (!resp.ok) throw new Error(await resp.text())
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }




    async __users_roles_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        options.headers = { ...options.headers, ...this.create_auth_header() }
        const url = [this.api_host, "/api/auth", "admin", endpoint].join('/')
        const resp = await fetch(url, options)
        if (!resp.ok) throw new Error(await resp.text())
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }
    async __admin_users_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        options.headers = { ...options.headers, ...this.create_auth_header() }
        const url = [this.api_host, "/api/auth", "admin", endpoint].join('/')
        const resp = await fetch(url, options)
        if (!resp.ok) throw new Error(await resp.text())
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }

    async __auth_api(endpoint, method, data, headers, data_format = 'json', rec = null) {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        options.headers = { ...options.headers, ...this.create_auth_header() }
        const url = [this.api_host, "/api/auth", endpoint].join('/')
        const resp = await fetch(url, options)
        if (rec == 'resp') return resp
        if (!resp.ok) throw new Error(await resp.text())
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }

    async __contact_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        options.headers = { ...options.headers, ...this.create_auth_header() }
        const resp = await fetch(this.contact_api_host + '/' + endpoint, options)
        if (!resp.ok) throw new Error(await resp.text())
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }

    async __key_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        options.headers = { ...options.headers, ...this.create_auth_header() }
        const resp = await fetch(this.key_api_host + '/' + endpoint, options)
        if (!resp.ok) throw new Error(await resp.text())
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }



    // ----------------- EXTERNAL CALLERS

    key = {
        exists: (key) => {
            return this.__key_api(key + '/exists')
        },

        set: (key, data = {}) => {
            return this.__key_api(key, 'put', data)
        },

        delete: (key) => {
            return this.__key_api(key, 'delete')
        },

        get: (key) => {
            return this.__key_api(key)
        },

        listen: (cb) => {
            this.socket.on('update', ({ key, event, data }) => {
                cb(key, event, data)
            })
        }
    }

    create_auth_header() {
        return { 'Authorization': localStorage.getItem('db_auth_token') ?? undefined }
    }

    contact = {
        email: (contact, subject, html) => this.__contact_api("api/send/email", "post", { contact, data: { subject, html } },),
        sms: (contact, text) => this.__contact_api("api/send/sms", "post", { contact, data: { text } },),
    }

    auth = {
        connected: () => {
            const headers = null
            return this.__auth_api("connect", "get", null, headers, null)
        },
        connect: async (data = null) => {
            const headers = null
            const token = await this.__auth_api("connect", "post", data, headers, "json")
            localStorage.setItem('db_auth_token', token)
            this.auth.reconnect(token)
            return token
        },
        reconnect: (token) => {
            this.socket.emit('auth', token)
        },
        get_token: () => {
            const headers = null
            return this.__auth_api("token", "get", null, headers, null)
        },
        change_password: (data = null) => {
            const headers = null
            return this.__auth_api("pass", "post", data, headers, "json")
        },

        user: {
            disconnect: () => {
                const headers = null
                this.socket.emit('unauth')
                return this.__auth_user_api("connect", "delete", null, headers, null)
            },
            get: () => {
                const headers = null
                return this.__auth_user_api("", "get", null, headers, null)
            },
            is_admin: () => {
                const headers = null
                return this.__auth_user_api("is_admin", "get", null, headers, null)
            },

        },

        admin: {


            users: {
                create: (data = null) => {
                    const headers = null
                    return this.__admin_users_api("create", "post", data, headers, "json")
                },
                delete: (conn) => {
                    const headers = null
                    return this.__admin_users_api("user/" + conn, "delete", null, headers, null)
                },
                list: () => {
                    const headers = null
                    return this.__admin_users_api("list", "get", null, headers, null)
                },

                roles: {
                    add: (conn, role) => {
                        const headers = null
                        return this.__users_roles_api("role/" + conn + "/" + role, "put", null, headers, null)
                    },
                    delete: (conn, role) => {
                        const headers = null
                        return this.__users_roles_api("role/" + conn + "/" + role, "delete", null, headers, null)
                    },

                },
            },
        },
    }

    // ----------------- INSTALLER

    install(vue) {
        const apis = this
        vue.mixin({
            beforeCreate() {
                this.$keydb_api = apis

                function resolve_path(path) {
                    const path_elms = path.split('.')
                    const root_elms = [...path_elms]
                    const prop = root_elms.pop()
                    let root_obj = this
                    root_elms.forEach(elm => {
                        if (!root_obj[elm]) this.$set(root_obj, elm, {})
                        root_obj = root_obj[elm]
                    })
                    return { root: root_obj, prop }
                }

                async function key_binder(key_name, object_path, watcher = null, delete_watcher = null) {
                    const key_content = await apis.key.get(key_name)

                    const path_elms = object_path.split('.')
                    const root_elms = [...path_elms]
                    const prop = root_elms.pop()
                    let root_obj = this
                    root_elms.forEach(elm => {
                        if (!root_obj[elm]) this.$set(root_obj, elm, {})
                        root_obj = root_obj[elm]
                    })

                    const set = (data) => {
                        this.$set(root_obj, prop, data)
                        if (watcher) watcher(data)
                    }

                    set(key_content)

                    let last_version = key_content
                    apis.key.listen((key, event, data) => {
                        if (key != key_name) return
                        if (event == 'set') {
                            last_version = JSON.parse(JSON.stringify(data))
                            set(data)
                        }
                        if (event == 'delete') {
                            this.$delete(root_obj, prop)
                            if (delete_watcher) delete_watcher()
                        }
                    })

                    let set_to = null
                    this.$watch(() => root_obj[prop], (val) => {
                        clearTimeout(set_to)
                        set_to = setTimeout(async () => {
                            try {
                                await apis.key.set(key_name, val)
                            } catch (e) {
                                this.$set(obj, prop, JSON.parse(JSON.stringify(last_version)))
                            }
                        }, 100)
                    }, { deep: true })

                    return root_obj[prop]
                }

                if (!global_database_carrier_init) {
                    global_database_carrier.$key_binder = key_binder
                    global_database_carrier.$resolve_path = resolve_path
                    global_database_carrier.$keydb_api = apis
                    global_database_carrier_init = true
                }

                this.$key_binder = key_binder
                this.$resolve_path = resolve_path

                this.$db = global_database_carrier
                this.$init_db = async function () {
                    if (!global_database_carrier.init_promise)
                        global_database_carrier.init_promise = global_database_carrier.bind_database(...arguments)
                    return await global_database_carrier.init_promise
                }
            },
        })
    }
}

// ----------------------------------------------------- VUE INSTALL

const key_api = new KEYDBAPI()
export default key_api