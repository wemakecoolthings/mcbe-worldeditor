import { world } from '@minecraft/server';

let undoSave = new Map(); // List of blockVolume lists
let saveList = new Map();

export async function saveAction(player, blockSelections) {
    if (!undoSave.has(player.id)) {
        let id = 1;
        await saveStructures(player, blockSelections, id);
        undoSave.set(player.id, id);
    } else {
        let lastAction = undoSave.get(player.id);
        let newAction = Number(lastAction) + 1;
        await saveStructures(player, blockSelections, newAction);
        undoSave.set(player.id, newAction);
        player.sendMessage(`${newAction}`);
    }
}

async function saveStructures(player, blockSelections, actionId) {
    for (let i = 0; i < blockSelections.length; i++) {
        let section = blockSelections[i];
        let structureId = `worldeditor:${player.name.replace(' ', '_')}_save${actionId}_${i}`;
        let minLoc = section.getMin();
        saveList.set(structureId, minLoc);
        world.structureManager.createFromWorld(
            structureId,
            world.getDimension("overworld"),
            section.getMax(),
            minLoc,
            { includeBlocks: true, includeEntities: false }
        );
    }
}

export async function revertAction(player) {
    if (undoSave.has(player.id)) {
        let orgLoc = player.location;
        let lastAction = undoSave.get(player.id);

        if (lastAction == 0) {
            player.sendMessage(`§aThere is nothing left to undo!`);
            return;
        }

        let lastActionID = `worldeditor:${player.name.replace(' ', '_')}_save${lastAction}`;
        let structures = world.structureManager.getWorldStructureIds();

        let totalSavesInAction = structures.filter(id => id.includes(lastActionID)).length;
        let undoneSaves = 0;

        for (let structureId of structures) {
            if (structureId.includes(lastActionID)) {
                undoneSaves += 1;
                player.onScreenDisplay.setActionBar(`§dUndoing saved sections... §7§o[${undoneSaves} / ${totalSavesInAction}]`);
                let loc = saveList.get(structureId);
                player.teleport(loc);
                world.structureManager.place(
                    structureId,
                    world.getDimension("overworld"),
                    loc,
                    { includeBlocks: true, includeEntities: false }
                );
                world.structureManager.delete(structureId);
            }
        }

        undoSave.set(player.id, lastAction - 1);
        await player.teleport(orgLoc);
        player.sendMessage(`§a1 action undone!`);
    } else {
        player.sendMessage(`§aThere is nothing left to undo!`);
    }
}