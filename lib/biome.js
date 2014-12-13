var dup = function(spec) {
  return JSON.parse(JSON.stringify(spec))
}

module.exports = function(base, name) {
  var spec = dup(base)
  spec.name = name

  spec.layers = [
    {
      "disable": true, 
      "note": "0"
    }, 
  ]
  var addLayer = function(layer) {
    var n = spec.layers.length
    layer = dup(layer)
    spec.layers.push(layer)
    layer.note = n.toString()
    return n
  }

  spec.decals = []
  var apply = function(decal, noise, layer) {
    decal = dup(decal)
    spec.decals.push(decal)
    if (decal.pos_range[0] > 1) {
      decal.pos_range = [1,1]
    }
    decal.layer = layer || addLayer({inherit_noise: true})
    decal.noise_range = noise
    delete decal.biome_distance_range
    if (this.planet_size_range) {
      decal.planet_size_range = this.planet_size_range
    }
  }

  spec.brushes = []
  var place = function(brush, noise, layer) {
    brush = dup(brush)
    spec.brushes.push(brush)
    brush.layer = layer || addLayer({inherit_noise: true})
    brush.noise_range = noise
    brush.weight = 1
    brush.weight_scale = 1
    brush.elevation_range = [-1, 1]
    delete brush.weight_hard
    delete brush.biome_distance_range
    if (this.planet_size_range) {
      brush.planet_size_range = this.planet_size_range
    }
  }

  spec.features = []
  var drop = function(feature, layer) {
    feature = dup(feature)
    spec.features.push(feature)
    feature.layer = layer || addLayer({inherit_noise: true})
    if (this.planet_size_range) {
      feature.planet_size_range = this.planet_size_range
    }
  }

  return {
    spec: spec,
    addLayer: addLayer,
    apply: apply,
    place: place,
    drop: drop,
  }
}
