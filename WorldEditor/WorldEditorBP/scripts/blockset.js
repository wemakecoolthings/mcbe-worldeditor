import { system, BlockVolume } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as maskLib from './mask'
import * as editor from './events'

const blockFillLimit = 32768
let pickBlock = new Map();

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
            player.addTag("record");
            player.sendMessage(`§dPick a block by right clicking with your axe!`);
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
            player.addTag("record_replace");
            player.sendMessage(`§dPick a replace block!\nSneak to grab air!`);
        }
    })
}

export function setPickBlock(player, blockPermutation){
    player.sendMessage(`§dBlock Found!`);
    system.run(() => {
        if(player.hasTag("record")){
            pickBlock.set(player.id, blockPermutation)
            setBlock(player, blockPermutation, editor.pos1.get(player.id), editor.pos2.get(player.id), editor.exe);
            player.removeTag("record");
        } else if(player.hasTag("record_replace")){
            pickBlock.set(player.id, blockPermutation)    
            player.addTag("record_final")     
            player.removeTag("record_replace");
            player.sendMessage(`§dPick a block to set!`);
        } else if(player.hasTag("record_final")){
            let block1 = pickBlock.get(player.id)   
            setBlock(player, blockPermutation, editor.pos1.get(player.id), editor.pos2.get(player.id), editor.exe, "replace_perm", block1); 
            player.removeTag("record_final")     
        }
    })
}

async function setBlock(player, block, pos1, pos2, exe, isReplace = "none", replaceBlock = ""){

    const startPos = player.location;
    const p1 = pos1
    const p2 = pos2

    // Halt Movement
    exe.runCommand(`inputpermission set "${player.name}" movement disabled`)

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

    // Calculate total number of blocks
    const totalBlocks = sizeX * sizeY * sizeZ;

    // Create sections
    let sections = [];
    for (let x = lowX; x <= highX; x += sizeX) {
        for (let y = lowY; y <= highY; y += sizeY) {
            for (let z = lowZ; z <= highZ; z += sizeZ) {
                let currentX = x;
                let currentY = y;
                let currentZ = z;
 
                while (currentX <= highX) {
                    let maxSectionX = Math.min(sizeX, Math.floor(blockFillLimit / (sizeY * sizeZ)));
                    let endX = Math.min(currentX + maxSectionX - 1, highX);
 
                    while (currentY <= highY) {
                        let maxSectionY = Math.min(sizeY, Math.floor(blockFillLimit / (maxSectionX * sizeZ)));
                        let endY = Math.min(currentY + maxSectionY - 1, highY);
 
                        while (currentZ <= highZ) {
                            let maxSectionZ = Math.min(sizeZ, Math.floor(blockFillLimit / (maxSectionX * maxSectionY)));
                            let endZ = Math.min(currentZ + maxSectionZ - 1, highZ);
 
                            const blockVolume = new BlockVolume(
                                { x: currentX, y: currentY, z: currentZ },
                                { x: endX, y: endY, z: endZ }
                            );
                            sections.push(blockVolume);
 
                            currentZ = endZ + 1;
                        }
 
                        currentY = endY + 1;
                        currentZ = z; // Reset Z for next Y section
                    }
 
                    currentX = endX + 1;
                    currentY = y; // Reset Y for next X section
                }
            }
        }
    }

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
                    exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true, blockFilter: {includeTypes: [maskLib.mask.get(player.id)]}});
                } else {
                    exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true});
                }
                
            }

            player.teleport(startPos);
            exe.runCommand(`inputpermission set "${player.name}" movement enabled`) // Resume Movement

            if(replaceCounter > 0){
                player.sendMessage(`§dFinished Block Load §7§o[${loaded}/${totalBlocks}] §l[${replaceCounter} ${replaceBlock}]`);
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
