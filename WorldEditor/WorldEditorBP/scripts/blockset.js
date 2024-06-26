import { system, BlockVolume } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as maskLib from './mask'
import * as editor from './main'
import * as undoManager from './actionSave'
import * as shapes from './shapes'

export let pickBlock = new Map();
let permutationRecord = new Map();
let directedFunction = new Map();
let replaceNearSave = new Map();

export function setFunction(player, func){
    directedFunction.set(player.id, func)
}

export function setPermRecord(player, record){
    permutationRecord.set(player.id, record)
}

export function resetPermRecord(player){
    permutationRecord.set(player.id, "record_replace")
}

export function setBlockMenu(player, pos1, pos2){
    let form = new ActionFormData();
    form.title("§d§lBlock Set Function")
    form.body(`Please pick a method to set your block!`)
    form.button(`§a§l> §r§lType a Block ID!`)
    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
    form.show(player).then(response => {
        let exe = player.dimension;
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

export function sendReplaceNearMenu(player){
    let form = new ActionFormData();
    form.title("§d§lBlock Set Function")
    form.button(`§a§l> §r§lReplacenear All`)
    form.button(`§a§l> §r§lReplacenear Specified`)
    form.show(player).then(response => {
        if(response.selection == 0){
            let form = new ActionFormData();
            form.title("§d§lBlock Set Function")
            form.body(`Please pick a method to set your block!`)
            form.button(`§a§l> §r§lType a Block ID!`)
            form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
            form.show(player).then(response => {
                if(response.selection == 0){
                    let form = new ModalFormData();
                    form.title("Block Set Function")
                    form.textField("Block ID: ", "")
                    form.slider(`Radius`, 1, 50, 1, 5)
                    form.show(player).then(response => {
                        if(!response.canceled){
                            let block = response.formValues[0];
                            let radius = response.formValues[1];
                            replaceNear(player, player.location, block, radius);
                        }
                    })
                } else if(response.selection == 1){
                    let form = new ModalFormData();
                    form.title("Block Set Function")
                    form.slider(`Radius`, 1, 50, 1, 5)
                    form.show(player).then(response => {
                        if(!response.canceled){
                            let radius = response.formValues[0];
                            permutationRecord.set(player.id, "record")
                            directedFunction.set(player.id, "replacenear")
                            let newLoc = player.location;
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            replaceNearSave.set(player.id, {newLoc, radius})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 1){
            let form = new ActionFormData();
            form.title("§d§lBlock Set Function")
            form.body(`Please pick a method to set your block!`)
            form.button(`§a§l> §r§lType a Block ID!`)
            form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
            form.show(player).then(response => {
                if(response.selection == 0){
                    let form = new ModalFormData();
                    form.title("Block Set Function")
                    form.textField("Block To Replace ID: ", "")
                    form.textField("Block To Set ID: ", "")
                    form.slider(`Radius`, 1, 50, 1, 5)
                    form.show(player).then(response => {
                        if(!response.canceled){
                            let block = response.formValues[0];
                            let newBlock = response.formValues[1];
                            let radius = response.formValues[2];
                            replaceNearSpecified(player, player.location, newBlock, block, radius);
                        }
                    })
                } else if(response.selection == 1){
                    let form = new ModalFormData();
                    form.title("Block Set Function")
                    form.slider(`Radius`, 1, 50, 1, 5)
                    form.show(player).then(response => {
                        if(!response.canceled){
                            let radius = response.formValues[0];
                            permutationRecord.set(player.id, "record_replace")
                            directedFunction.set(player.id, "replacenear")
                            let newLoc = player.location;
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            replaceNearSave.set(player.id, {newLoc, radius})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        }
    })
}

function replaceNearSpecified(player, location, block, replaceBlock, radius) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Calculate the bounding box for the replacement
    const minX = cx - radius;
    const maxX = cx + radius;
    const minY = cy - radius;
    const maxY = cy + radius;
    const minZ = cz - radius;
    const maxZ = cz + radius;

    // Create sections for the area to be replaced
    const pos1 = { x: minX, y: minY, z: minZ };
    const pos2 = { x: maxX, y: maxY, z: maxZ };
    const sections = createSections(pos1, pos2);

    // Save sections for undo functionality if needed
    undoManager.saveAction(player, sections);

    // Calculate total number of blocks
    const totalBlocks = getBlockTotal(pos1, pos2);

    // Check if the total number of blocks exceeds the limit
    if (totalBlocks >= 5000000) {
        player.sendMessage(`§cYou cannot set more than the limit of 5,000,000 blocks.`);
        return;
    }

    let loaded = 0;
    let replaceCounter = 0;
    const batchSize = 100; // Number of sections to process per tick

    // Function to process sections in batches
    function processSections(batchIndex) {
        if (batchIndex >= sections.length) {
            player.sendMessage(`§dFinished replacing blocks within a radius of ${radius} §7§o[${replaceCounter} replaced]`);
            return;
        }

        const endIndex = Math.min(batchIndex + batchSize, sections.length);

        for (let t = batchIndex; t < endIndex; t++) {
            let blockVolume = sections[t];
            loaded += blockVolume.getCapacity();

            player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}/${totalBlocks}] §l[${replaceCounter} Replaced]`);

            // Determine if replaceBlock is a permutation or block type
            if (typeof replaceBlock == "string") {
                replaceCounter += dimension.getBlocks(blockVolume, { includeTypes: [replaceBlock] }, true).getCapacity();
                dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true, blockFilter: { includeTypes: [replaceBlock] } });
            } else {
                replaceCounter += dimension.getBlocks(blockVolume, { includePermutations: [replaceBlock] }, true).getCapacity();
                dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true, blockFilter: { includePermutations: [replaceBlock] } });
            }
        }

        // Schedule the next batch
        system.runTimeout(() => processSections(endIndex), 1);
    }

    // Start processing sections in batches
    processSections(0);
}

function replaceNear(player, location, block, radius) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Calculate the bounding box for the replacement
    const minX = cx - radius;
    const maxX = cx + radius;
    const minY = cy - radius;
    const maxY = cy + radius;
    const minZ = cz - radius;
    const maxZ = cz + radius;

    // Create sections for the area to be replaced
    const pos1 = { x: minX, y: minY, z: minZ };
    const pos2 = { x: maxX, y: maxY, z: maxZ };
    const sections = createSections(pos1, pos2);

    // Save sections for undo functionality if needed
    undoManager.saveAction(player, sections);

    // Calculate total number of blocks
    const totalBlocks = getBlockTotal(pos1, pos2);

    // Check if the total number of blocks exceeds the limit
    if (totalBlocks >= 5000000) {
        player.sendMessage(`§cYou cannot set more than the limit of 5,000,000 blocks.`);
        return;
    }

    let loaded = 0;
    let replaceCounter = 0;
    const batchSize = 100; // Number of sections to process per tick

    // Function to process sections in batches
    function processSections(batchIndex) {
        if (batchIndex >= sections.length) {
            player.sendMessage(`§dFinished replacing blocks within a radius of ${radius} §7§o[${replaceCounter} replaced]`);
            return;
        }

        const endIndex = Math.min(batchIndex + batchSize, sections.length);

        for (let t = batchIndex; t < endIndex; t++) {
            let blockVolume = sections[t];
            loaded += blockVolume.getCapacity();

            player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}/${totalBlocks}] §l[${replaceCounter} Replaced]`);

            // Replace blocks except air
            replaceCounter += dimension.getBlocks(blockVolume, { excludeTypes: ["minecraft:air"] }, true).getCapacity();
            dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true, blockFilter: { excludeTypes: ["minecraft:air"] } });
        }

        // Schedule the next batch
        system.runTimeout(() => processSections(endIndex), 1);
    }

    // Start processing sections in batches
    processSections(0);
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

                if(!directedFunction.has(player.id)){
                    setBlock(player, block, editor.pos1.get(player.id), editor.pos2.get(player.id), player.dimension);
                } else if(directedFunction.get(player.id) == "shape") { // Redirect Function
                    shapes.filterShapeCreate(player, block);
                } else if(directedFunction.get(player.id) == "replacenear") { // Redirect Function
                    let { newLoc, radius } = replaceNearSave.get(player.id)
                    replaceNear(player, newLoc, block, radius)
                    const blockVolume = new BlockVolume(newLoc, newLoc);
                    player.dimension.fillBlocks(blockVolume, "air", { ignoreChunkBoundErrors: true });
                    directedFunction.delete(player.id)
                }

                directedFunction.delete(player.id)
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

                if(!directedFunction.has(player.id)){
                    setBlock(player, block, editor.pos1.get(player.id), editor.pos2.get(player.id), player.dimension, replace, block2); 
                } else if(directedFunction.get(player.id) == "replacenear") { // Redirect Function
                    let { newLoc, radius } = replaceNearSave.get(player.id)
                    replaceNearSpecified(player, newLoc, block, block2, radius)
                    const blockVolume = new BlockVolume(newLoc, newLoc);
                    player.dimension.fillBlocks(blockVolume, "air", { ignoreChunkBoundErrors: true });
                    directedFunction.delete(player.id)
                }

                permutationRecord.delete(player.id)
                editor.setPickBlock(0)
            }
        } else {
            player.sendMessage(`§cPick block record seems to have stopped working.`);
        }
    })
}

export function setBlockReplaceMenu(player, pos1, pos2){
    let form = new ActionFormData();
    form.title("§d§lBlock Set Function")
    form.body(`Please pick a method to set your block!`)
    form.button(`§a§l> §r§lType a Block ID!`)
    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
    form.show(player).then(response => {
        let exe = player.dimension;
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

function setBlock(player, block, pos1, pos2, exe, isReplace = "none", replaceBlock = ""){

    // Save Initial Position
    const startPos = player.location;

    // Get Sections
    let sections = createSections(pos1, pos2);
    undoManager.saveAction(player, sections)

    // Calculate total number of blocks
    const totalBlocks = getBlockTotal(pos1, pos2);

    // Option Check for out of bounds blocks on small loops
    try{
        for(let i = 0; i < sections.length; i++){
            exe.getBlocks(sections[i], {}, false) == undefined
        }
    } catch(e){
        player.sendMessage(`§cWarning, this selection contains unloaded chunks and sections may not set correctly!`);
    }

    // Overall limit
    if(totalBlocks >= 5000000){
        player.sendMessage(`§cYou cannot set more than the limit of 5,000,000 blocks.`);
        return;
    }

    // Halt Movement
    exe.runCommand(`inputpermission set "${player.name}" movement disabled`)

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