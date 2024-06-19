import { world } from '@minecraft/server';

let undoSave = new Map(); // Map to store undo actions
let redoSave = new Map(); // Map to store redo actions
let saveList = new Map(); // Map to store structure IDs and their locations

export function saveAction(player, blockSelections) {
    // Clear redo history when a new action is performed
    if (redoSave.has(player.id)) {
        let redoActions = redoSave.get(player.id);
        for (let actionId of redoActions) {
            let redoActionID = `worldeditor:${player.name.replace(' ', '_')}_redo${actionId}`;
            let structures = world.structureManager.getWorldStructureIds();
            for (let structureId of structures) {
                if (structureId.includes(redoActionID)) {
                    world.structureManager.delete(structureId);
                }
            }
        }
        redoSave.delete(player.id);
    }

    let actionId = undoSave.has(player.id) ? undoSave.get(player.id).length + 1 : 1;
    saveStructures(player, blockSelections, actionId);

    if (!undoSave.has(player.id)) {
        undoSave.set(player.id, []);
    }
    undoSave.get(player.id).push(actionId);
}

function saveStructures(player, blockSelections, actionId) {
    for (let i = 0; i < blockSelections.length; i++) {
        let section = blockSelections[i];
        let structureId = `worldeditor:${player.name.replace(' ', '_')}_save${actionId}_${i}`;
        let minLoc = section.getMin();
        let maxLoc = section.getMax();
        saveList.set(structureId, { minLoc, maxLoc });
        world.structureManager.createFromWorld(
            structureId,
            world.getDimension("overworld"),
            maxLoc,
            minLoc,
            { includeBlocks: true, includeEntities: false }
        );
    }
}

export function revertAction(player) {
    if (undoSave.has(player.id)) {
        let undoActions = undoSave.get(player.id);
        if (undoActions.length === 0) {
            player.sendMessage(`§aThere is nothing left to undo!`);
            return;
        }

        let lastAction = undoActions.pop();
        let lastActionID = `worldeditor:${player.name.replace(' ', '_')}_save${lastAction}`;
        let redoActionID = `worldeditor:${player.name.replace(' ', '_')}_redo${lastAction}`;
        let structures = world.structureManager.getWorldStructureIds();

        let totalSavesInAction = structures.filter(id => id.includes(lastActionID)).length;
        let undoneSaves = 0;

        for (let structureId of structures) {
            if (structureId.includes(lastActionID)) {
                undoneSaves += 1;
                player.onScreenDisplay.setActionBar(`§dUndoing saved sections... §7§o[${undoneSaves} / ${totalSavesInAction}]`);
                let { minLoc, maxLoc } = saveList.get(structureId);

                // Save the structure for redo
                let redoStructureId = structureId.replace(lastActionID, redoActionID);
                world.structureManager.createFromWorld(
                    redoStructureId,
                    world.getDimension("overworld"),
                    maxLoc,
                    minLoc,
                    { includeBlocks: true, includeEntities: false }
                );

                // Place the structure back in the world
                world.structureManager.place(
                    structureId,
                    world.getDimension("overworld"),
                    minLoc,
                    { includeBlocks: true, includeEntities: false }
                );
                world.structureManager.delete(structureId);
            }
        }

        // Move the undone action to the redo map
        if (!redoSave.has(player.id)) {
            redoSave.set(player.id, []);
        }
        redoSave.get(player.id).push(lastAction);

        player.sendMessage(`§a1 action undone!`);
    } else {
        player.sendMessage(`§aThere is nothing left to undo!`);
    }
}

export function redoAction(player) {
    if (redoSave.has(player.id)) {
        let redoActions = redoSave.get(player.id);
        if (redoActions.length === 0) {
            player.sendMessage(`§aThere is nothing left to redo!`);
            return;
        }

        let lastAction = redoActions.pop();
        let lastActionID = `worldeditor:${player.name.replace(' ', '_')}_save${lastAction}`;
        let redoActionID = `worldeditor:${player.name.replace(' ', '_')}_redo${lastAction}`;
        let structures = world.structureManager.getWorldStructureIds();

        let totalSavesInAction = structures.filter(id => id.includes(redoActionID)).length;
        let redoneSaves = 0;

        for (let structureId of structures) {
            if (structureId.includes(redoActionID)) {
                redoneSaves += 1;
                player.onScreenDisplay.setActionBar(`§dRedoing saved sections... §7§o[${redoneSaves} / ${totalSavesInAction}]`);
                let saveId = structureId.replace(redoActionID, `worldeditor:${player.name.replace(' ', '_')}_save${lastAction}`);
                let { minLoc, maxLoc } = saveList.get(saveId);

                // Save the structure for redo
                let undoStructureId = structureId.replace(redoActionID, lastActionID);
                world.structureManager.createFromWorld(
                    undoStructureId,
                    world.getDimension("overworld"),
                    maxLoc,
                    minLoc,
                    { includeBlocks: true, includeEntities: false }
                );

                world.structureManager.place(
                    structureId,
                    world.getDimension("overworld"),
                    minLoc,
                    { includeBlocks: true, includeEntities: false }
                );
                world.structureManager.delete(structureId);
            }
        }

        // Move the redone action back to the undo map
        if (!undoSave.has(player.id)) {
            undoSave.set(player.id, []);
        }
        undoSave.get(player.id).push(lastAction);

        player.sendMessage(`§a1 action redone!`);
    } else {
        player.sendMessage(`§aThere is nothing left to redo!`);
    }
}
