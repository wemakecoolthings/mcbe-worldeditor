import { BlockVolume, StructureMirrorAxis, StructureRotation, world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import * as actions from './actionSave'; // Assuming this module handles saving actions
import * as main from './main'; // Assuming this module handles main functionalities

// Configuration and state management
export let includeEntities = false;
export let includeBlocks = true;
let rotations = new Map();
let flips = new Map();
let copyData = new Map();
let userCopyStatus = new Set();

// Function to change configuration (includeBlocks and includeEntities)
export function changeConfig(player, includeBlocksInput = true, includeEntitiesInput = false) {
    includeEntities = includeEntitiesInput;
    includeBlocks = includeBlocksInput;
    player.sendMessage(`§aInclude Blocks: §d${includeBlocks}\n§aInclude Entities: §d${includeEntities}`);
}

// Function to show rotation menu
export function sendRotateMenu(player) {
    if (!userCopyStatus.has(player.id)) {
        player.sendMessage(`§cYou must have a selection to rotate.`);
        return;
    }

    let form = new ActionFormData();
    form.title("§d§lSet Paste Rotation");
    form.button(`§a§l> §0§lRotate 90 Degrees`);
    form.button(`§a§l> §0§lRotate 180 Degrees`);
    form.button(`§a§l> §0§lRotate 270 Degrees`);
    form.button(`§a§l> §0§lCheck Rotation`);
    form.button(`§c§l> §0§lBack`);

    form.show(player).then(response => {
        if (response.selection === 0) {
            rotateSelection(player, StructureRotation.Rotate90);
        } else if (response.selection === 1) {
            rotateSelection(player, StructureRotation.Rotate180);
        } else if (response.selection === 2) {
            rotateSelection(player, StructureRotation.Rotate270);
        } else if (response.selection === 3) {
            checkRotation(player);
        } else if (response.selection === 4) {
            main.sendStructuresMenu(player); // Assuming this function exists in your main module
        }
    });
}

// Function to handle rotation logic
function rotateSelection(player, rotation) {
    if (!rotations.has(player.id)) {
        rotations.set(player.id, rotation);
    } else {
        // Toggle through rotations or reset to None
        const currentRotation = rotations.get(player.id);
        if (currentRotation === rotation) {
            rotations.set(player.id, StructureRotation.None);
        } else if (currentRotation === StructureRotation.Rotate90 && rotation === StructureRotation.Rotate270) {
            rotations.set(player.id, StructureRotation.Rotate180);
        } else if (currentRotation === StructureRotation.Rotate180 && rotation === StructureRotation.Rotate90) {
            rotations.set(player.id, StructureRotation.Rotate270);
        } else {
            rotations.set(player.id, rotation);
        }
    }

    // Inform the player about the selected rotation
    if (rotation !== StructureRotation.None) {
        player.sendMessage(`§aSelection rotated §d${getRotationAngle(rotation)} degrees.`);
    } else {
        player.sendMessage(`§aRotation reset.`);
    }
}

// Function to check current rotation state
function checkRotation(player) {
    if (!rotations.has(player.id) || rotations.get(player.id) === StructureRotation.None) {
        player.sendMessage(`§aThis selection has not been rotated.`);
    } else {
        const currentRotation = rotations.get(player.id);
        player.sendMessage(`§aSelection rotated §d${getRotationAngle(currentRotation)} degrees.`);
    }
}

function getRotationAngle(rotation) {
    switch (rotation) {
        case StructureRotation.Rotate90:
            return 90;
        case StructureRotation.Rotate180:
            return 180;
        case StructureRotation.Rotate270:
            return 270;
        default:
            return 0; // This should not happen if properly handled elsewhere
    }
}

// Function to show flip menu
export function sendFlipMenu(player) {
    if (!userCopyStatus.has(player.id)) {
        player.sendMessage(`§cYou must have a selection to flip.`);
        return;
    }

    let form = new ActionFormData();
    form.title("§d§lSet Paste Mirroring");
    form.button(`§a§l> §0§lRemove Flip Setting`);
    form.button(`§a§l> §0§lFlip (Over X Axis)`);
    form.button(`§a§l> §0§lFlip (Over XZ Axis)`);
    form.button(`§a§l> §0§lFlip (Over Z Axis)`);
    form.button(`§a§l> §0§lCheck Flip Axis`);
    form.button(`§c§l> §0§lBack`);

    form.show(player).then(response => {
        if (response.selection === 0) {
            flips.set(player.id, StructureMirrorAxis.None);
            player.sendMessage(`§aSelection is no longer being flipped.`);
        } else if (response.selection === 1) {
            flips.set(player.id, StructureMirrorAxis.X);
            player.sendMessage(`§aSelection flipped over the §dX Axis.`);
        } else if (response.selection === 2) {
            flips.set(player.id, StructureMirrorAxis.XZ);
            player.sendMessage(`§aSelection flipped over the §dX & Z Axis.`);
        } else if (response.selection === 3) {
            flips.set(player.id, StructureMirrorAxis.Z);
            player.sendMessage(`§aSelection flipped over the §dZ Axis.`);
        } else if (response.selection === 4) {
            checkFlipAxis(player);
        } else if (response.selection === 5) {
            main.sendStructuresMenu(player); // Assuming this function exists in your main module
        }
    });
}

// Function to check current flip state
function checkFlipAxis(player) {
    if (!flips.has(player.id) || flips.get(player.id) === StructureMirrorAxis.None) {
        player.sendMessage(`§aSelection is not flipped.`);
    } else {
        const currentFlip = flips.get(player.id);
        if (currentFlip === StructureMirrorAxis.X) {
            player.sendMessage(`§aSelection is flipped over the §dX Axis.`);
        } else if (currentFlip === StructureMirrorAxis.XZ) {
            player.sendMessage(`§aSelection is flipped over the §dX & Z Axis.`);
        } else if (currentFlip === StructureMirrorAxis.Z) {
            player.sendMessage(`§aSelection is flipped over the §dZ Axis.`);
        }
    }
}

// Function to copy an area
export function copyArea(player, blockSelections) {
    // Delete previous copy
    const copyID = `worldeditor:${player.name.replace(' ', '_')}_copied`;
    const structures = world.structureManager.getWorldStructureIds();
    for (const structureId of structures) {
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

    blockSelections.forEach((section, i) => {
        const structureId = `worldeditor:${player.name.replace(' ', '_')}_copied_${i}`;
        const minLoc = section.getMin();
        const maxLoc = section.getMax();

        const relativeMinLoc = {
            x: minLoc.x - playerPosition.x,
            y: minLoc.y - playerPosition.y,
            z: minLoc.z - playerPosition.z
        };

        const relativeMaxLoc = {
            x: maxLoc.x - playerPosition.x,
            y: maxLoc.y - playerPosition.y,
            z: maxLoc.z - playerPosition.z
        };

        copyData.set(structureId, { relativeMinLoc, relativeMaxLoc });

        world.structureManager.createFromWorld(
            structureId,
            player.dimension,
            maxLoc,
            minLoc,
            { includeBlocks, includeEntities }
        );
    });

    userCopyStatus.add(player.id);
    player.sendMessage(`§aCopied!`);
}

export function cutArea(player, blockSelections) {
    const exe = player.dimension

    // Delete previous copies
    const copyID = `worldeditor:${player.name.replace(' ', '_')}_copied`;
    const structures = world.structureManager.getWorldStructureIds();
    for (const structureId of structures) {
        if (structureId.includes(copyID)) {
            world.structureManager.delete(structureId);
            // Ensure to delete corresponding data from copyData map as well
            copyData.delete(structureId); // Make sure copyData is accessible here
        }
    }

    // Remove previous changes to copy
    rotations.delete(player.id);
    flips.delete(player.id);

    // Save new copy
    const playerPosition = player.location;

    blockSelections.forEach((section, i) => {
        const structureId = `worldeditor:${player.name.replace(' ', '_')}_copied_${i}`;
        const minLoc = section.getMin();
        const maxLoc = section.getMax();

        const relativeMinLoc = {
            x: minLoc.x - playerPosition.x,
            y: minLoc.y - playerPosition.y,
            z: minLoc.z - playerPosition.z
        };

        const relativeMaxLoc = {
            x: maxLoc.x - playerPosition.x,
            y: maxLoc.y - playerPosition.y,
            z: maxLoc.z - playerPosition.z
        };

        // Save relative positions to copyData for potential paste operation
        copyData.set(structureId, { relativeMinLoc, relativeMaxLoc });

        // Create structure in the world's dimension
        world.structureManager.createFromWorld(
            structureId,
            player.dimension, // Assuming player.dimension is correctly set
            maxLoc,
            minLoc,
            { includeBlocks: includeBlocks, includeEntities: includeEntities }
        );
    });

    // Remove existing area by filling with air
    actions.saveAction(player, blockSelections);
    blockSelections.forEach(section => {
        exe.fillBlocks(section, "minecraft:air", { ignoreChunkBoundErrors: true });
    });

    // Update user copy status and provide feedback
    userCopyStatus.add(player.id);
    player.sendMessage(`§aCut!`);
}

// Function to paste an area
export function pasteArea(player) {
    if (userCopyStatus.has(player.id)) {
        const copyID = `worldeditor:${player.name.replace(' ', '_')}_copied`;
        const structures = world.structureManager.getWorldStructureIds();
        const playerPosition = player.location;

        // Determine rotation
        const rotation = rotations.has(player.id) ? rotations.get(player.id) : StructureRotation.None;

        // Determine flip
        const flip = flips.has(player.id) ? flips.get(player.id) : StructureMirrorAxis.None;

        // Save relative positions to undo function
        const blockSelections = [];
        for (const structureId of structures) {
            if (structureId.includes(copyID)) {
                const { relativeMinLoc, relativeMaxLoc } = copyData.get(structureId);

                // Calculate new positions based on player's current position
                const newMinLoc = calculateNewUndoPosition(playerPosition, relativeMinLoc, rotation, flip);
                const newMaxLoc = calculateNewUndoPosition(playerPosition, relativeMaxLoc, rotation, flip);

                const newSection = new BlockVolume(newMinLoc, newMaxLoc);
                blockSelections.push(newSection);
            }
        }

        actions.saveAction(player, blockSelections);

        for (const structureId of structures) {
            if (structureId.includes(copyID)) {
                const { relativeMinLoc, relativeMaxLoc } = copyData.get(structureId);

                // Calculate new position based on player's current position
                const newMinLoc = calculateNewUndoPosition(playerPosition, relativeMinLoc, rotation, flip);
                const newMaxLoc = calculateNewUndoPosition(playerPosition, relativeMaxLoc, rotation, flip);

                // Find the smallest coordinates
                const smallestLoc = {
                    x: Math.min(newMinLoc.x, newMaxLoc.x),
                    y: Math.min(newMinLoc.y, newMaxLoc.y),
                    z: Math.min(newMinLoc.z, newMaxLoc.z)
                };

                world.structureManager.place(
                    structureId,
                    player.dimension,
                    smallestLoc,
                    { includeBlocks, includeEntities, rotation, mirror: flip }
                );
            }
        }

        player.sendMessage(`§aPasted!`);
    } else {
        player.sendMessage(`§aYou must copy a selection first.`);
    }
}

// Function to calculate new position based on player's current position and relative location
function calculateNewPosition(playerPosition, relativeLoc) {
    return {
        x: Math.round(playerPosition.x + relativeLoc.x),
        y: Math.round(playerPosition.y + relativeLoc.y),
        z: Math.round(playerPosition.z + relativeLoc.z)
    };
}

function calculateNewUndoPosition(playerPosition, relativeLoc, rotation, flip) {
    let newPosition = {
        x: playerPosition.x + relativeLoc.x,
        y: playerPosition.y + relativeLoc.y,
        z: playerPosition.z + relativeLoc.z
    };

    // Apply flip
    if (flip === StructureMirrorAxis.X || flip === StructureMirrorAxis.XZ) {
        newPosition.x = playerPosition.x - relativeLoc.x;
    }
    if (flip === StructureMirrorAxis.Z || flip === StructureMirrorAxis.XZ) {
        newPosition.z = playerPosition.z - relativeLoc.z;
    }

    // Apply rotation
    if (rotation === StructureRotation.Rotate90) {
        [newPosition.x, newPosition.z] = [playerPosition.x - relativeLoc.z, playerPosition.z + relativeLoc.x];
    } else if (rotation === StructureRotation.Rotate180) {
        newPosition.x = playerPosition.x + relativeLoc.x;
        newPosition.z = playerPosition.z + relativeLoc.z;
    } else if (rotation === StructureRotation.Rotate270) {
        [newPosition.x, newPosition.z] = [playerPosition.x + relativeLoc.z, playerPosition.z - relativeLoc.x];
    }

    // Round the coordinates
    newPosition.x = Math.round(newPosition.x);
    newPosition.y = Math.round(newPosition.y);
    newPosition.z = Math.round(newPosition.z);
    
    return newPosition;
}