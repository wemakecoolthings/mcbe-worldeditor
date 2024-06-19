import { system, BlockVolume } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as maskLib from './mask'
import * as editor from './main'
import * as undoManager from './undo'

const blockFillLimit = 32768
let pickBlock = new Map();
let permutationRecord = new Map();

export function resetPermRecord(player){
    permutationRecord.set(player.id, "record_replace")
}

export function setBlockMenu(player, pos1, pos2, exe){
    let form = new ActionFormData();
    form.title("Block Set Function")
    form.body(`Please pick a method to set your block!`)
    form.button(`§a§l> §r§lType a Block ID!`)
    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
    form.show(player).then(response => {
        if(response.selection == 0){
            let form = new ModalFormData();
            form.title("Block Set Function")
            form.textField("Block ID: ", "")
            form.show(player).then(response => {
                if(!response.canceled){
                    let block = response.formValues[0];
                    setBlock(player, block, pos1, pos2, exe);
                }
            })
        } else if(response.selection == 1){
            permutationRecord.set(player.id, "record")
            player.sendMessage(`§aUse worldeditor to grab block!`);
            editor.setPickBlock(1)
        }
    })
}

export function setBlockReplaceMenu(player, pos1, pos2, exe){
    let form = new ActionFormData();
    form.title("Block Set Function")
    form.body(`Please pick a method to set your block!`)
    form.button(`§a§l> §r§lType a Block ID!`)
    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
    form.show(player).then(response => {
        if(response.selection == 0){
            let form = new ModalFormData();
            form.title("Block Set Function")
            form.textField("Block To Replace ID: ", "")
            form.textField("Block To Set ID: ", "")
            form.show(player).then(response => {
                if(!response.canceled){
                    let toReplace = response.formValues[0];
                    let block = response.formValues[1];
                    setBlock(player, block, pos1, pos2, exe, "replace_block", toReplace);
                }
            })
        } else if(response.selection == 1){
            player.sendMessage(`§dUse worldeditor to grab block!`);
            permutationRecord.set(player.id, "record_replace")
            editor.setPickBlock(1)
        }
    })
}

export function setPickBlock(player, block){
    if(typeof block == "string"){
        player.sendMessage(`§d${block} found!`);
    } else {
        player.sendMessage(`§d${block.type.id} found!`);
    }
    system.run(() => {
        if(permutationRecord.has(player.id)){
            if(permutationRecord.get(player.id) == "record"){
                pickBlock.set(player.id, block)
                setBlock(player, block, editor.pos1.get(player.id), editor.pos2.get(player.id), editor.exe);
                permutationRecord.delete(player.id)
                editor.setPickBlock(0)
            } else if(permutationRecord.get(player.id) == "record_replace"){
                pickBlock.set(player.id, block)    
                permutationRecord.set(player.id, "record_final");
                player.sendMessage(`§aUse worldeditor to grab another block\n§7Sneak worldeditor to undo selection!`);
            } else if(permutationRecord.get(player.id) == "record_final"){
                let block2 = pickBlock.get(player.id)  
                let replace = "replace_perm";
                if(typeof block2 == "string"){
                    replace = "replace_block"
                } 
                setBlock(player, block, editor.pos1.get(player.id), editor.pos2.get(player.id), editor.exe, replace, block2); 
                permutationRecord.delete(player.id)
                editor.setPickBlock(0)
            }
        } else {
            player.sendMessage(`§cPick block record seems to have stopped working.`);
        }
    })
}

async function setBlock(player, block, pos1, pos2, exe, isReplace = "none", replaceBlock = ""){

    // Save Initial Position
    const startPos = player.location;

    // Halt Movement
    exe.runCommand(`inputpermission set "${player.name}" movement disabled`)

    // Get Sections
    let sections = createSections(pos1, pos2);
    await undoManager.saveAction(player, sections)

    // Calculate total number of blocks
    const totalBlocks = getBlockTotal(pos1, pos2);

    let loaded = 0;
    let chunkLoad = 0;
    let replaceCounter = 0;
    const chunkLimit = 1000000;

    // Ensure initial chunks are loaded
    if(loaded == 0){
        player.teleport(pos1);
    }

    system.run(() => {
        try{

            let blockDisplay = replaceBlock;
            if(typeof replaceBlock != "string"){
                blockDisplay = replaceBlock.type.id
            }

            for (let t = 0; t < sections.length; t++) {
                let blockVolume = sections[t];
                loaded += blockVolume.getCapacity();
                chunkLoad += blockVolume.getCapacity();

                if(replaceCounter > 0){
                    player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}/${totalBlocks}] §l[${replaceCounter} Replaced]`);
                } else {
                    player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}/${totalBlocks}]`);
                }

                // Ensure newer chunks are loaded
                if(chunkLoad > chunkLimit){
                    chunkLoad = 0;
                    player.teleport(blockVolume.getMax());
                }

                // Fill Blocks
                if(isReplace == "replace_perm"){
                    replaceCounter += exe.getBlocks(blockVolume, {includePermutations: [replaceBlock]}, true).getCapacity();
                    exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true, blockFilter: {includePermutations: [replaceBlock]}});
                } else if(isReplace == "replace_block"){
                    replaceCounter += exe.getBlocks(blockVolume, {includeTypes: [replaceBlock]}, true).getCapacity();
                    exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true, blockFilter: {includeTypes: [replaceBlock]}});
                } else if(maskLib.mask.has(player.id)){ // Check for mask
                    let mask = maskLib.mask.get(player.id);
                    if(typeof mask == "string"){
                        blockDisplay = mask;
                        replaceCounter += exe.getBlocks(blockVolume, {includeTypes: [mask]}, true).getCapacity();
                        exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true, blockFilter: {includeTypes: [mask]}});
                    } else {
                        blockDisplay = mask.type.id;
                        replaceCounter += exe.getBlocks(blockVolume, {includePermutations: [mask]}, true).getCapacity();
                        exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true, blockFilter: {includePermutations: [mask]}});
                    }
                } else {
                    exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true});
                }
                
            }

            player.teleport(startPos);
            exe.runCommand(`inputpermission set "${player.name}" movement enabled`) // Resume Movement

            if(replaceCounter > 0){
                player.sendMessage(`§dFinished Block Load §7§o[${loaded}/${totalBlocks}] §l[${replaceCounter} ${blockDisplay}]`);
            } else {
                player.sendMessage(`§dFinished Block Load §7§o[${loaded}/${totalBlocks}]`);
            }
        } catch(e){
            player.teleport(startPos);
            exe.runCommand(`inputpermission set "${player.name}" movement enabled`) // Resume Movement
            player.sendMessage(`§cAn error occured while loading blocks: ${e}`);
        }
    })
}

export function getBlockTotal(pos1, pos2){
    const p1 = pos1
    const p2 = pos2
    const highX = Math.max(p2.x, p1.x);
    const highY = Math.max(p2.y, p1.y);
    const highZ = Math.max(p2.z, p1.z);
    const lowX = Math.min(p2.x, p1.x);
    const lowY = Math.min(p2.y, p1.y);
    const lowZ = Math.min(p2.z, p1.z);
    const sizeX = highX - lowX + 1;
    const sizeY = highY - lowY + 1;
    const sizeZ = highZ - lowZ + 1;
    const totalBlocks = sizeX * sizeY * sizeZ;
    return totalBlocks;
}

export function createSections(pos1, pos2, blockFillLimit = 32768){

    // Determine Coordinates
    const p1 = pos1;
    const p2 = pos2;
    const highX = Math.max(p2.x, p1.x);
    const highY = Math.max(p2.y, p1.y);
    const highZ = Math.max(p2.z, p1.z);
    const lowX = Math.min(p2.x, p1.x);
    const lowY = Math.min(p2.y, p1.y);
    const lowZ = Math.min(p2.z, p1.z);

    // Calculate dimensions of the region
    const sizeX = highX - lowX + 1;
    const sizeY = highY - lowY + 1;
    const sizeZ = highZ - lowZ + 1;

    // Create sections
    let sections = [];
    for (let x = lowX; x <= highX; x += sizeX) {
        for (let y = lowY; y <= highY; y += sizeY) {
            for (let z = lowZ; z <= highZ; z += sizeZ) {
                let currentX = x;
                let currentY = y;
                let currentZ = z;

                while (currentX <= highX) {
                    let maxSectionX = Math.min(64, sizeX, Math.floor(blockFillLimit / (sizeY * sizeZ)));
                    let endX = Math.min(currentX + maxSectionX - 1, highX);

                    while (currentZ <= highZ) {
                        let maxSectionZ = Math.min(64, sizeZ, Math.floor(blockFillLimit / (maxSectionX * sizeY)));
                        let endZ = Math.min(currentZ + maxSectionZ - 1, highZ);

                        while (currentY <= highY) {
                            let maxSectionY = Math.min(sizeY, Math.floor(blockFillLimit / (maxSectionX * maxSectionZ)));
                            let endY = Math.min(currentY + maxSectionY - 1, highY);

                            const blockVolume = new BlockVolume(
                                { x: currentX, y: currentY, z: currentZ },
                                { x: endX, y: endY, z: endZ }
                            );
                            sections.push(blockVolume);

                            currentY = endY + 1;
                        }

                        currentZ = endZ + 1;
                        currentY = y; // Reset Y for next Z section
                    }

                    currentX = endX + 1;
                    currentZ = z; // Reset Z for next X section
                }
            }
        }
    }

    return sections;
}