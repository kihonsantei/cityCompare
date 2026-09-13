# ucas_vue_cesium

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Runs state regression tests (Node.js 18+)
```
node --test tests/state-regressions.cjs
```

Tests cover picking, city deletion, and map label updates using the real Vue/Pinia
state logic with lightweight Leaflet drawing stubs. Browser interaction is not
covered by this suite.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
