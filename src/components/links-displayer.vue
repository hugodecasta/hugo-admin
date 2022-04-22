<template>
    <div :class='["links",absolute ? "links_absolute" : ""]'>
        <v-menu>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    :color="dark ? 'white': 'primary'"
                    elevation="0"
                    icon
                    v-bind="attrs"
                    v-on="on"
                    :small="absolute"
                >
                    <v-icon>mdi-link</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-btn
                    class='mx-5 mt-2 mb-2'
                    color="primary"
                    text
                    @click="add_link"
                >
                    links <v-icon right>mdi-plus</v-icon>
                </v-btn>
                <v-divider v-if="links_count>0"></v-divider>
                <v-list-item
                    v-for="link in links"
                    :key="link.id"
                >
                    <v-btn
                        :href="link.link"
                        target="_blank"
                        text
                    ><u>{{link.name}}</u>
                    </v-btn>
                    <v-list-item-action>
                        <v-btn
                            icon
                            @click="$db.delete_item('link',link.id)"
                        >
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-menu>
        <random-adder ref="adder"></random-adder>
    </div>
</template>

<script>
import randomAdder from '@/db_vues/random-adder.vue'
export default {
    components: { randomAdder },
    props: ['table_name', 'item', 'absolute', 'dark'],
    data: () => ({
        opened: false,
    }),
    computed: {
        links() {
            return this.$db.items_referencing_me(this.item, this.table_name).link
        },
        links_count() {
            return Object.keys(this.links).length
        }
    },
    methods: {
        add_link() {
            this.$refs.adder.add('link', { ref: this.item.id })
        }
    }
}
</script>

<style>
.links {
    opacity: 0.5;
}
.links_absolute {
    position: absolute;
    bottom: 3px;
    right: 7px;
}
</style>