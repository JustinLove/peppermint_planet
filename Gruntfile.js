var spec = require('./lib/spec')
var Biome = require('./lib/biome')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.peppermint_planet.server/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

var terrain = function(biome, lava, ice, period, twist) {
  var threshold = 70
  var border = function(d) {
    return Math.cos(2*Math.PI*(threshold+d)/period)/2 + 0.5
  }

  biome.addLayer({
    "noise": {
      "ring_latitude_period": 0,
      "ring_longitude_peroid": period,
      "ring_twist": twist,
      "type": "ring"
    }
  })

  biome.apply(ice.decals[0], [0.0, border(+10)])
  biome.apply(ice.decals[1], [border(+30), border(+20)])
  biome.apply(ice.decals[2], [0.0, border(+10)])
  biome.apply(ice.decals[3], [0.0, border(+10)])
  biome.apply(ice.decals[4], [0.0, border(+10)])

  for (var l = 0;l <= 5;l++) {
    biome.apply(lava.decals[l], [border(-10), 1.0])
  }

  var brushLayer = biome.addLayer({inherit_noise: true})
  for (l = 0;l < 11;l++) {
    lava.brushes[l].pole_distance_range = [period/1.9-50, null]
    biome.place(lava.brushes[l], [border(-20), 1.0], brushLayer)
  }

  biome.drop({
    "feature_spec": "/pa/features/tree/tree.json", 
    "noise_range": [0.0, border(+40)],
    "cluster_count_range": [ 0, 1 ], 
    "cluster_size": 15, 
  })
}

var metal = function(biome, period) {
  var valley = function(d) {
    return 1 - (Math.cos(2*Math.PI*d/period)/2 + 0.5)
  }
  biome.drop({
    "feature_spec": "/pa/effects/features/metal_splat_02.json", 
    "noise_range": [0.0, valley(4)],
    "cluster_count_range": [ 0, 1 ], 
    "cluster_size": 1, 
  })
  biome.drop({
    "feature_spec": "/pa/effects/features/metal_splat_02.json", 
    "noise_range": [0.4, 0.6],
    "cluster_count_range": [ 0, 1 ], 
    "cluster_size": 15, 
    "pole_distance_range": [0, 200],
  })
}

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      static: {
        files: [
          {
            expand: true,
            src: '**',
            dest: './',
            cwd: 'static/'
          }
        ],
      },
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
      modinfo: {
        files: [
          {
            src: ['modinfo.json'],
            dest: modPath,
          },
        ],
        options: {
          process: function(content, srcpath) {
            var info = JSON.parse(content)
            info.description = "Play a red and white striped biome type. A separate client mod is required to create planets.",
            info.date = require('dateformat')(new Date(), 'yyyy/mm/dd')
            info.identifier = info.identifier.replace('client', 'server')
            info.context = 'server'
            info.category = ['biome']
            info.companions = ["com.wondible.pa.peppermint_planet.client"]
            delete(info.scenes)
            delete(info.priority)
            console.log(info.identifier, info.version, info.date)
            return JSON.stringify(info, null, 2)
          }
        }
      },
    },
    clean: ['pa', modPath],
    jsonlint: {
      all: {
        src: [
          'pa/terrain/**/*.json',
          'modinfo.json',
        ]
      },
    },
    // copy files from PA, transform, and put into mod
    proc: {
      biome_type: {
        src: [
          'pa/terrain/lava.json'
        ],
        cwd: media,
        dest: 'pa/terrain/peppermint.json',
        process: function(spec) {
          spec.name = 'peppermint'
          delete spec.enable_lava
          spec.biomes[1] = JSON.parse(JSON.stringify(spec.biomes[0]))
          spec.biomes[0].spec = "/pa/terrain/peppermint/peppermint.json"
          spec.biomes[0].temperature = [-1, 0, 1]
          spec.biomes[1].spec = "/pa/terrain/peppermint/peppermint_spice.json"
          spec.biomes[1].temperature = [0, 1, 1]
          spec.water = {
            "shader": "planet_liquid_transparent", 
            "textures": {
              "DepthColorTexture": "/pa/effects/textures/water_depth_diffuse.papa", 
              "DiffuseTexture": "/pa/effects/textures/water_diffuse.papa", 
              "NoiseTexture": "/pa/effects/textures/CloudNoise.papa", 
              "NormalTexture": "/pa/effects/textures/water_normal.papa"
            }
          }
          return spec
        }
      },
      peppermint: {
        src: [
          'pa/terrain/lava/lava.json',
          'pa/terrain/ice/ice.json'
        ],
        cwd: media,
        dest: 'pa/terrain/peppermint/peppermint.json',
        process: function(lava, ice) {
          var biome = new Biome(lava, 'peppermint')
          biome.planet_size_range = [0, 200]
          terrain(biome, lava, ice, 300, 1)
          biome.planet_size_range = [200, 400]
          terrain(biome, lava, ice, 350, 2)
          biome.planet_size_range = [400, 600]
          terrain(biome, lava, ice, 400, 3)
          biome.planet_size_range = [600, 800]
          terrain(biome, lava, ice, 500, 4)
          biome.planet_size_range = [800, 1000]
          terrain(biome, lava, ice, 600, 5)
          biome.planet_size_range = [1000, null]
          terrain(biome, lava, ice, 800, 6)
          return biome.spec
        }
      },
      peppermint_spice: {
        src: [
          'pa/terrain/lava/lava.json',
          'pa/terrain/ice/ice.json'
        ],
        cwd: media,
        dest: 'pa/terrain/peppermint/peppermint_spice.json',
        process: function(lava, ice) {
          var biome = new Biome(lava, 'peppermint_spice')
          biome.planet_size_range = [0, 200]
          terrain(biome, lava, ice, 300, 1)
          metal(biome, 300)
          biome.planet_size_range = [200, 400]
          terrain(biome, lava, ice, 350, 2)
          metal(biome, 350)
          biome.planet_size_range = [400, 600]
          terrain(biome, lava, ice, 400, 3)
          metal(biome, 400)
          biome.planet_size_range = [600, 800]
          terrain(biome, lava, ice, 500, 4)
          metal(biome, 500)
          biome.planet_size_range = [800, 1000]
          terrain(biome, lava, ice, 600, 5)
          metal(biome, 600)
          biome.planet_size_range = [1000, null]
          terrain(biome, lava, ice, 800, 6)
          metal(biome, 800)
          return biome.spec
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  grunt.registerTask('client', ['copy:static', 'proc', 'jsonlint']);
  grunt.registerTask('server', ['copy:mod', 'copy:modinfo']);

  // Default task(s).
  grunt.registerTask('default', ['client']);

};

