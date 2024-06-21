import { BlockVolume, StructureMirrorAxis, StructureRotation, world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import * as actions from './actionSave';
import * as main from './main'

// CONFIG
export let includeEntities = false;
export let includeBlocks = true;
let rotations = new Map();
let flips = new Map();

let copyData = new Map();
let userCopyStatus = new Set();

export function changeConfig(includeBlocksInput = true, includeEntitiesInput = false) {
    includeEntities = includeEntitiesInput;
    includeBlocks = includeBlocksInput;
    player.sendMessage(`§aInclude Blocks: §d${includeBlocks}\n§aInclude Entities: §d${includeEntities}`);
}

export function sendRotateMenu(player){

    if(!userCopyStatus.has(player.id)){
        player.sendMessage(`§cYou must have selection to rotate`);
        return;
    }

    let form = new ActionFormData();
	form.title("§d§lSet Paste Rotation")
	form.button(`§a§l> §0§lRotate 90 Degrees`)
	form.button(`§a§l> §0§lRotate 180 Degrees`)
    form.button(`§a§l> §0§lRotate 270 Degrees`)
    form.button(`§a§l> §0§lCheck Rotation`)
    form.button(`§c§l> §0§lBack`)
	form.show(player).then(response => {

        if(response.selection == 0){
            if (!rotations.has(player.id)) {
                rotations.set(player.id, StructureRotation.Rotate90);
            } else {
                if(rotations.get(player.id) == StructureRotation.Rotate90){
                    rotations.set(player.id, StructureRotation.Rotate180);
                } else if(rotations.get(player.id) == StructureRotation.Rotate180){
                    rotations.set(player.id, StructureRotation.Rotate270);
                } else if(rotations.get(player.id) == StructureRotation.Rotate270){
                    rotations.set(player.id, StructureRotation.None);
                }
            }
            player.sendMessage(`§aSelection rotated §d90 degrees`);
        } else if(response.selection == 1){
            if (!rotations.has(player.id)) {
                rotations.set(player.id, StructureRotation.Rotate180);
            } else {
                if(rotations.get(player.id) == StructureRotation.Rotate90){
                    rotations.set(player.id, StructureRotation.Rotate270);
                } else if(rotations.get(player.id) == StructureRotation.Rotate180){
                    rotations.set(player.id, StructureRotation.None);
                } else if(rotations.get(player.id) == StructureRotation.Rotate270){
                    rotations.set(player.id, StructureRotation.Rotate90);
                }
            }
            player.sendMessage(`§aSelection rotated §d180 degrees`);
        } else if(response.selection == 2){
            if (!rotations.has(player.id)) {
                rotations.set(player.id, StructureRotation.Rotate270);
            } else {
                if(rotations.get(player.id) == StructureRotation.Rotate90){
                    rotations.set(player.id, StructureRotation.None);
                } else if(rotations.get(player.id) == StructureRotation.Rotate180){
                    rotations.set(player.id, StructureRotation.Rotate90);
                } else if(rotations.get(player.id) == StructureRotation.Rotate270){
                    rotations.set(player.id, StructureRotation.Rotate180);
                }
            }
            player.sendMessage(`§aSelection rotated §d270 degrees`);
        } else if(response.selection == 3){
            if (!rotations.has(player.id)) {
                player.sendMessage(`§aThis selection has §dnot §abeen rotated`);
            } else {
                if(rotations.get(player.id) == StructureRotation.Rotate90){
                    player.sendMessage(`§aSelection rotated §d90 degrees`);
                } else if(rotations.get(player.id) == StructureRotation.Rotate180){
                    player.sendMessage(`§aSelection rotated §d180 degrees`);
                } else if(rotations.get(player.id) == StructureRotation.Rotate270){
                    player.sendMessage(`§aSelection rotated §d270 degrees`);
                }
            }
        } else if(response.selection == 4){
            main.sendStructuresMenu(player)
        }
    })
}

export function sendFlipMenu(player){

    if(!userCopyStatus.has(player.id)){
        player.sendMessage(`§cYou must have selection to flip`);
        return;
    }

    let form = new ActionFormData();
	form.title("§d§lSet Paste Mirroring")
    form.button(`§a§l> §0§lRemove Flip Setting`)
	form.button(`§a§l> §0§lFlip (Over X Axis)`)
	form.button(`§a§l> §0§lFlip (Over XZ Axis)`)
    form.button(`§a§l> §0§lFlip (Over Z Axis)`)
    form.button(`§a§l> §0§lCheck Flip Axis`)
    form.button(`§c§l> §0§lBack`)
	form.show(player).then(response => {

        if(response.selection == 0){
            flips.set(player.id, StructureMirrorAxis.None);
            player.sendMessage(`§aSelection is no longer being flipped`);
        } else if(response.selection == 1){
            flips.set(player.id, StructureMirrorAxis.X);
            player.sendMessage(`§aSelection flipped §dover the X Axis`);
        } else if(response.selection == 2){
            flips.set(player.id, StructureMirrorAxis.XZ);
            player.sendMessage(`§aSelection flipped §dover the X & Z Axis`);
        } else if(response.selection == 3){
            flips.set(player.id, StructureMirrorAxis.Z);
            player.sendMessage(`§aSelection flipped §dover the Z Axis`);
        } else if(response.selection == 4){
            if(flips.get(player.id) == StructureMirrorAxis.None || !flips.has(player.id)){
                player.sendMessage(`§aSelection is §dnot §aflipped`);
            } else if(flips.get(player.id) == StructureMirrorAxis.X){
                player.sendMessage(`§aSelection is flipped over the §dX Axis`);
            } else if(flips.get(player.id) == StructureMirrorAxis.XZ){
                player.sendMessage(`§aSelection is flipped over the §dX & Z Axis`);
            } else if(flips.get(player.id) == StructureMirrorAxis.Z){
                player.sendMessage(`§aSelection is flipped over the §dZ Axis`);
            }
        } else if(response.selection == 5){
            main.sendStructuresMenu(player)
        }
    })
}

export function copyArea(player, blockSelections) {
    // Delete previous copy
    let copyID = `worldeditor:${player.name.replace(' ', '_')}_copied`;
    let structures = world.structureManager.getWorldStructureIds();
    for (let structureId of structures) {
        if (structureId.includes(copyID)) {
            world.structureManager.delete(structureId);
            copyData.delete(structureId);
        }
    }

    // Remove previous changes to copy
    rotations.delete(player.id);
    flips.delete(player.id);

    // Save new copy
    const playerPosition = player.location;

    for (let i = 0; i < blockSelections.length; i++) {
        let section = blockSelections[i];
        let structureId = `worldeditor:${player.name.replace(' ', '_')}_copied${i}`;
        let minLoc = section.getMin();
        let maxLoc = section.getMax();

        let relativeMinLoc = {
            x: minLoc.x - playerPosition.x,
            y: minLoc.y - playerPosition.y,
            z: minLoc.z - playerPosition.z
        };

        let relativeMaxLoc = {
            x: maxLoc.x - playerPosition.x,
            y: maxLoc.y - playerPosition.y,
            z: maxLoc.z - playerPosition.z
        };

        copyData.set(structureId, { relativeMinLoc, relativeMaxLoc });
        world.structureManager.createFromWorld(
            structureId,
            world.getDimension("overworld"),
            maxLoc,
            minLoc,
            { includeBlocks: includeBlocks, includeEntities: includeEntities }
        );
    }

    userCopyStatus.add(player.id);
    player.sendMessage(`§aCopied!`);
}

export function cutArea(player, blockSelections) {
    // Delete previous copy
    let copyID = `worldeditor:${player.name.replace(' ', '_')}_copied`;
    let structures = world.structureManager.getWorldStructureIds();
    for (let structureId of structures) {
        if (structureId.includes(copyID)) {
            world.structureManager.delete(structureId);
            copyData.delete(structureId);
        }
    }

    // Remove previous changes to copy
    rotations.delete(player.id);
    flips.delete(player.id);

    // Save new copy
    const playerPosition = player.location;

    for (let i = 0; i < blockSelections.length; i++) {
        let section = blockSelections[i];
        let structureId = `worldeditor:${player.name.replace(' ', '_')}_copied${i}`;
        let minLoc = section.getMin();
        let maxLoc = section.getMax();

        let relativeMinLoc = {
            x: minLoc.x - playerPosition.x,
            y: minLoc.y - playerPosition.y,
            z: minLoc.z - playerPosition.z
        };

        let relativeMaxLoc = {
            x: maxLoc.x - playerPosition.x,
            y: maxLoc.y - playerPosition.y,
            z: maxLoc.z - playerPosition.z
        };

        copyData.set(structureId, { relativeMinLoc, relativeMaxLoc });
        world.structureManager.createFromWorld(
            structureId,
            world.getDimension("overworld"),
            maxLoc,
            minLoc,
            { includeBlocks: includeBlocks, includeEntities: includeEntities }
        );
    }

    // Remove Existing Area
    actions.saveAction(player, blockSelections);
    for (let i = 0; i < blockSelections.length; i++) {
        let section = blockSelections[i];
        main.exe.fillBlocks(section, "minecraft:air", {ignoreChunkBoundErrors: true});
    }

    userCopyStatus.add(player.id);
    player.sendMessage(`§aCut!`);
}

export function pasteArea(player) {
    if (userCopyStatus.has(player.id)) {
        let copyID = `worldeditor:${player.name.replace(' ', '_')}_copied`;
        let structures = world.structureManager.getWorldStructureIds();
        const playerPosition = player.location;

        // Save relatives to undo function
        let blockSelections = [];
        for (let structureId of structures) {
            if (structureId.includes(copyID)) {
                let { relativeMinLoc, relativeMaxLoc } = copyData.get(structureId);

                // Calculate the new positions based on player's current position
                let newMinLoc = calculateNewPosition(playerPosition, relativeMinLoc);
                let newMaxLoc = calculateNewPosition(playerPosition, relativeMaxLoc);

                let newSection = new BlockVolume(newMinLoc, newMaxLoc);
                blockSelections.push(newSection);
            }
        }
        actions.saveAction(player, blockSelections);

        // Determine rotation
        if (!rotations.has(player.id)) {
            rotations.set(player.id, StructureRotation.None);
        }

        // Determine flip
        if (!flips.has(player.id)) {
            flips.set(player.id, StructureMirrorAxis.None);
        }

        for (let structureId of structures) {
            if (structureId.includes(copyID)) {
                let { relativeMinLoc } = copyData.get(structureId);

                // Calculate the new position based on player's current position
                let newMinLoc = calculateNewPosition(playerPosition, relativeMinLoc);

                world.structureManager.place(
                    structureId,
                    world.getDimension("overworld"),
                    newMinLoc,
                    { includeBlocks: includeBlocks, includeEntities: includeEntities, 
                      rotation: rotations.get(player.id), mirror: flips.get(player.id) }
                );
            }
        }

        player.sendMessage(`§aPasted!`);
    } else {
        player.sendMessage(`§aYou must copy a selection first`);
    }
}

function calculateNewPosition(playerPosition, relativeLoc) {
    // Apply the relative position to the player's current position
    return {
        x: Math.round(playerPosition.x + relativeLoc.x),
        y: Math.round(playerPosition.y + relativeLoc.y),
        z: Math.round(playerPosition.z + relativeLoc.z)
    };
}