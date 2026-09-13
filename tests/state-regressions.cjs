const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { transformSync } = require('@babel/core')
const { parse, compileScript } = require('@vue/compiler-sfc')
const { effectScope, nextTick } = require('vue')
const { createPinia, setActivePinia, disposePinia } = require('pinia')

// Run the real component setup and stores with Vue's scheduler. Only Leaflet's
// DOM-dependent drawing objects are replaced; no browser or new packages needed.
const sourceRoot = path.resolve(__dirname, '../src')
const modules = new Map()
const leaflet = {
  Icon: { Default: Object.assign(function () {}, { mergeOptions() {} }) },
  divIcon: options => options,
  marker: (latlng, options) => ({ latlng, options }),
  layerGroup: layers => ({ layers })
}
function loadSource(filename) {
  if (!path.extname(filename)) filename += '.js'
  if (modules.has(filename)) return modules.get(filename).exports
  const module = { exports: {} }
  modules.set(filename, module)
  let source = fs.readFileSync(filename, 'utf8')
  if (filename.endsWith('.vue')) {
    source = compileScript(parse(source).descriptor, { id: filename }).content
  }
  const { code } = transformSync(source, {
    filename,
    configFile: false,
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })
  const localRequire = id => {
    if (id.endsWith('.css')) return {}
    if (id === 'leaflet') return leaflet
    if (id.startsWith('@/')) return loadSource(path.join(sourceRoot, id.slice(2)))
    if (id.startsWith('.')) return loadSource(path.resolve(path.dirname(filename), id))
    return require(id)
  }
  const run = vm.runInThisContext(`(function(require, module, exports, console) {\n${code}\n})`, { filename })
  run(localRequire, module, module.exports, { log() {}, warn() {} })
  return module.exports
}
const SettingPane = loadSource(path.join(sourceRoot, 'core/SettingPane.vue')).default
const { DrawBallMap } = loadSource(path.join(sourceRoot, 'stores/MapComponentStore.js'))

function setup(t) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const scope = effectScope()
  const pane = scope.run(() => SettingPane.setup({}, { expose() {} }))
  pane.ballstate.currentleftid = 1
  pane.ballstate.currentrightid = 2
  pane.noweditball.value = 'left'
  t.after(() => {
    scope.stop()
    disposePinia(pinia)
  })
  return pane
}

test('switching the edited pane cancels center picking without changing either city', async t => {
  const p = setup(t)
  const before = JSON.stringify(p.mapviewstore.views)
  p.handlePickClick()
  await nextTick()
  p.noweditball.value = 'right'
  assert.equal(p.pickcenterstore.isPicking, false)
  // A late click from the old map must be ignored.
  p.pickcenterstore.finishPicking([110, 30])
  await nextTick()
  assert.equal(JSON.stringify(p.mapviewstore.views), before)
})

test('switching a map view cancels feature picking and permits a fresh pick', async t => {
  const p = setup(t)
  p.createmapcoorddetemineFeature()
  await nextTick()
  p.ballstate.currentleftid = '2'
  assert.equal(p.coorddetermine.isPicking, false)
  p.coorddetermine.finishPicking({ distance: 5000, bearing: 90 })
  await nextTick()
  assert.equal(p.componentliststore.style[1].geometry.length, 1)
  assert.equal(p.componentliststore.style[2].geometry.length, 1)
  p.createmapcoorddetemineFeature()
  await nextTick()
  p.coorddetermine.finishPicking({ distance: 600, bearing: 20 })
  await nextTick()
  assert.equal(p.componentliststore.style[2].geometry[1].dist, 600)
})

test('a finished center pick commits to its original city even before the next render', async t => {
  const p = setup(t)
  const otherCenter = [...p.mapviewstore.views[2].center]
  p.handlePickClick()
  await nextTick()
  p.pickcenterstore.finishPicking([110, 30])
  p.noweditball.value = 'right'
  await nextTick()
  assert.deepEqual(p.mapviewstore.views[1].center, [110, 30])
  assert.deepEqual(p.mapviewstore.views[2].center, otherCenter)
})

test('a finished feature pick keeps its original city and feature name', async t => {
  const p = setup(t)
  p.tocreatename.value = '目标点'
  p.createmapcoorddetemineFeature()
  await nextTick()
  p.coorddetermine.finishPicking({ distance: 650, bearing: 45 })
  p.noweditball.value = 'right'
  p.tocreatename.value = '另一个点'
  await nextTick()
  assert.deepEqual(p.componentliststore.style[1].geometry[1], {
    name: '目标点', type: 'point', dist: 650, direction: 45
  })
  assert.equal(p.componentliststore.style[2].geometry.length, 1)
})

test('changing the other map does not interrupt a pick on the edited map', async t => {
  const p = setup(t)
  p.createmapcoorddetemineFeature()
  await nextTick()
  p.ballstate.currentrightid = 0
  assert.equal(p.coorddetermine.isPicking, true)
  p.coorddetermine.finishPicking({ distance: 700, bearing: 80 })
  await nextTick()
  assert.equal(p.componentliststore.style[1].geometry[1].dist, 700)
})

test('deleting a shared city clears both bindings, picking, styles, zoom and layers', async t => {
  const p = setup(t)
  p.ballstate.currentrightid = '1'
  const drawing = DrawBallMap()
  p.createmapcoorddetemineFeature()
  await nextTick()
  p.deleteNowBall()
  assert.equal(p.ballstate.currentleftid, 0)
  assert.equal(p.ballstate.currentrightid, 0)
  assert.equal(p.coorddetermine.isPicking, false)
  assert.equal(p.currenteditid.value, 0)
  p.coorddetermine.finishPicking({ distance: 800, bearing: 40 })
  await nextTick()
  assert.equal(p.mapviewstore.views[1], undefined)
  assert.equal(p.componentliststore.style[1], undefined)
  assert.equal(p.usemapzoomstroe.getZoomState(1), null)
  assert.deepEqual(drawing.getlayerref('left').value, [])
  assert.deepEqual(drawing.getlayerref('right').value, [])
  p.noweditball.value = 'right'
  assert.deepEqual(p.currenteditview.value, {})
})

test('deleting one city preserves the other city and cancels center picking', async t => {
  const p = setup(t)
  p.handlePickClick()
  await nextTick()
  p.mapviewstore.deleteOldView('1')
  assert.equal(p.pickcenterstore.isPicking, false)
  p.pickcenterstore.finishPicking([110, 30])
  await nextTick()
  assert.equal(p.ballstate.currentrightid, 2)
  assert.equal(p.mapviewstore.views[2].name, '上海')
  assert.equal(p.currenteditid.value, 0)
})

test('renaming a city immediately refreshes labels in both maps', async t => {
  const p = setup(t)
  p.ballstate.currentrightid = '1'
  const drawing = DrawBallMap()
  await nextTick()
  p.currenteditview.value.name = '北京新名称'
  await nextTick()
  for (const side of ['left', 'right']) {
    const centerMarker = drawing.getlayerref(side).value[0]
    assert.ok(centerMarker.options.icon.html.includes('北京新名称'))
  }
})
