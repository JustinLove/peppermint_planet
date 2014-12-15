# Peppermint Planet

A red and white striped biome type. Snowy white lanes run between the poles, separated by spiraling lava mountains with occasional passes.

The biome generates metal spots near the poles and down the center of each valley.  The distribution isn't great. Metal spots are controlled by the temperature slider; turn it down if you planet to apply classic or manual metal.

The planet supports water (why not), but we have no control over the height field.

## Playing Custom Biomes

A client mod is needed for the system editor, server mod to actually play on it.  When setting up human lobbies, I strongly recommend using a stock biome system until all players have joined and downloaded mods, and then changing the system.

## Development

The generated project includes a `package.json` that lists the dependencies, but you'll need to run `npm install` to download them.

PA will upload **all files** in the mod directory, including `node_modules` and maybe even `.git` - you probably don't want to use this in `server_mods` directly, unless you really like waiting.  The template is set up run to run as a project within a peer directory of `server_mods` - I use `server_mods_dev/mod_name`.  The task `grunt copy:mod` will copy the mod files to `../../server_mods/identifier`, you can change the `modPath` in the Gruntfile if you want to run it from somewhere else.

### Available Tasks

- copy:static - copy static files into mods files for publishing
- copy:mod - copy the mod files into server_mods
- copy:modinfo - repo is configured for client, this makes the server modinfo
- clean - remove the mods pa directory and server instance to avoid leftover files
- proc - read one or more files from PA and munge into one in the mod.
- jsonlint - verify file syntax
- client - copy:static, proc, jsonlint
- server - copy:mod, copy:modinfo
- default - client
