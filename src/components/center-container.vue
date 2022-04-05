<template>
    <v-container
        fill-height
        fluid
        :style="'max-width:'+(maxWidth ? maxWidth : 'auto')"
    >
        <v-row
            align="center"
            justify="center"
        >
            <v-col>
                <slot></slot>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    props: ['max-width']
}
</script>

<style>
</style>