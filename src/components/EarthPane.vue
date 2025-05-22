<template>
    <div id="earthContainer"></div>
</template>
<script>
import * as Cesium from 'cesium/Cesium'
import 'cesium/Widgets/widgets.css'

    export default{
        name :"EarthPane",
        mounted(){
            this.initEarth();
        },
        data(){
            return {
                earth:undefined
            }
        },
        methods:{
            initEarth(){
                Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OTkxY2ZlYS01NjQ1LTQwOTktODc4OS1mNTQ3NTk5NGZjY2YiLCJpZCI6MzE4OTUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTYxMDU3NTl9.MfJB6x_8MAk5sq7VEHu-_OYj4K8ZHdWoirMkjJFvNFg';
                this.earth = new Cesium.Viewer('earthContainer',
                {SkyAtmosphere:true}
                );
            }

        }
    }
</script>

<style scoped>
    @import url(~cesium/Widgets/widgets.css);

    #earthContainer {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    background-color: red;
    }
    
</style>