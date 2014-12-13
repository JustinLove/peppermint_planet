module.exports = function(base, name) {
  var spec = JSON.parse(JSON.stringify(base))
  spec.name = name

  spec.layers = [
    {
      "disable": true, 
      "note": "0"
    }, 
  ]
  var addLayer = function(layer) {
    var n = spec.layers.length
    spec.layers.push(layer)
    layer.note = n.toString()
    return n
  }

  spec.decals = []
  var apply = function(decal, noise, layer) {
    spec.decals.push(decal)
    if (decal.pos_range[0] > 1) {
      decal.pos_range = [1,1]
    }
    decal.layer = layer || addLayer({inherit_noise: true})
    decal.noise_range = noise
    delete decal.biome_distance_range
  }

  spec.brushes = []
  var place = function(brush, noise, layer) {
    spec.brushes.push(brush)
    brush.layer = layer || addLayer({inherit_noise: true})
    brush.noise_range = noise
    brush.weight = 1
    brush.weight_scale = 1
    brush.elevation_range = [-1, 1]
    brush.pole_distance_range = [200, null]
    delete brush.weight_hard
    delete brush.biome_distance_range
  }

  spec.features = []
  var drop = function(feature, layer) {
    spec.features.push(feature)
    feature.layer = layer || addLayer({inherit_noise: true})
  }

  return {
    spec: spec,
    addLayer: addLayer,
    apply: apply,
    place: place,
    drop: drop,
  }
}
