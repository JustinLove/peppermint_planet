var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.peppermint_planet/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

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
            info.description = "A red and white striped biome type. A separate client mod is required to create planets.",
            info.date = require('dateformat')(new Date(), 'yyyy/mm/dd')
            info.identifier = info.identifier.replace('client', 'server')
            info.context = 'server'
            info.category = ['', 'biome']
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
          spec.biomes[0].spec = "/pa/terrain/peppermint/peppermint.json"
          /*
          spec.water = {
            "shader": "planet_liquid_transparent", 
            "textures": {
              "DepthColorTexture": "/pa/effects/textures/water_depth_diffuse.papa", 
              "DiffuseTexture": "/pa/effects/textures/water_diffuse.papa", 
              "NoiseTexture": "/pa/effects/textures/CloudNoise.papa", 
              "NormalTexture": "/pa/effects/textures/water_normal.papa"
            }
          }
          */
          return spec
        }
      },
      biome: {
        src: [
          'pa/terrain/lava/lava.json',
          'pa/terrain/ice/ice.json'
        ],
        cwd: media,
        dest: 'pa/terrain/peppermint/peppermint.json',
        process: function(lava, ice) {
          var spec = JSON.parse(JSON.stringify(lava))
          spec.name = 'peppermint'

          spec.layers = [
            {
              "disable": true, 
              "note": "0"
            }, 
            {
              "noise": {
                "ring_latitude_period": 0,
                "ring_longitude_peroid": 400,
                "ring_twist": 1,
                "type": "ring"
              }, 
              "note": "1"
            },
          ]


          spec.decals = []
          var apply = function(decal, noise) {
            spec.decals.push(decal)
            var layer = spec.layers.length
            spec.layers.push({inherit_noise: true, note: layer.toString()})
            decal.layer = layer
            decal.noise_range = noise
            delete decal.biome_distance_range
          }
          apply(ice.decals[0], [0.0, 0.2])
          apply(ice.decals[1], [0.1, 0.4])
          apply(ice.decals[2], [0.0, 0.4])
          apply(ice.decals[3], [0.0, 0.4])
          apply(ice.decals[4], [0.0, 0.4])

          for (var l = 0;l <= 5;l++) {
            apply(lava.decals[l], [0.6, 1.0])
          }

          spec.features = []
          spec.brushes = []
          return spec
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

