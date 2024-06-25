<template>
  <div class="top-bar">
    <menu-bar @toggle-weather="toggleWeather"></menu-bar>
    <search-bar></search-bar>
    <Weather v-show="showWeather"/>
  </div>
</template>

<script>
import MenuBar from './menu.vue';
import SearchBar from './search_bar.vue';
import Weather from './components/weather.vue'

export default {
  components: {
    MenuBar,
    SearchBar,
    Weather
  },
  data() {
    return {
      showWeather: false
    };
  },
  methods: {
    toggleWeather() {
      this.showWeather = !this.showWeather;
    }
  }
};
</script>

<style>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  top: 10px;
  left: 10px;
  z-index: 10;
}
</style>
