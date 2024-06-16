import { world, system, BlockTypes, BlockVolume, BlockStates, Block, BlockPermutation } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as maskLib from './mask'

let blockFillLimit = 32768
let hangExceptionVar = 200000;
let jobs = []

export function setBlockMenu(player, pos1, pos2, exe){
    let form = new ModalFormData();
    form.title("Block Set Function")
    form.textField("Block ID: ", "")
    form.slider("Percentage To Replace", 0, 100, 1, 100);
    form.show(player).then(response => {
        if(!response.canceled){
            let block = response.formValues[0];
            let percent = response.formValues[1]
            const placeJob = system.runJob(setBlock(player, block, pos1, pos2, exe, percent));
            jobs.push(placeJob);
        }
    })
}

function* setBlock(player, block, pos1, pos2, exe, percent = 100, findReplace = 0, totalBlocks = 0, ogLoc = "???"){
    
    if(ogLoc == "???"){
        ogLoc = player.location;
    }

    const p1 = pos1
    const p2 = pos2

    let highX = Math.max(p2.x, p1.x);
    let highY = Math.max(p2.y, p1.y);
    let highZ = Math.max(p2.z, p1.z);
    let lowX = Math.min(p2.x, p1.x);
    let lowY = Math.min(p2.y, p1.y);
    let lowZ = Math.min(p2.z, p1.z);

    let i = lowX;
    let j = lowY;
    let k = lowZ;

    if(findReplace > 0){
        player.sendMessage(`§aResuming load at ${i} ${j} ${k} §7§o[${findReplace}/${totalBlocks}]`)
    } else {
        totalBlocks = (highX+1 - lowX) * (highY+1 - lowY) * (highZ+1 - lowZ);
        if(totalBlocks > hangExceptionVar){
            player.sendMessage(`§cYou cannot set more than 200,000 blocks.`)
            return;
        }
    }

    try{
        for(i = lowX; i < highX+1;){
            for(j = lowY; j < highY+1;){
                for(k = lowZ; k < highZ+1;){
                    let percentage = Number(percent);
                    let blockVolume = new BlockVolume({x: i, y: j, z: k}, {x: i, y: j, z: k});
                    if(!maskLib.mask.has(player.id)){
                        if(Math.random() < (percentage/100)){
                            findReplace += 1;
                            exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true})
                        }
                    } else if(maskLib.mask.has(player.id)) {
                        if(Math.random() < (percentage/100)){
                            findReplace += 1;
                            exe.fillBlocks(blockVolume, block, {ignoreChunkBoundErrors: true, blockFilter: {includeTypes: [`${maskLib.mask.get(player.id)}`]}})
                        }
                    }

                    if(findReplace % blockFillLimit == 1 && findReplace != 1){
                        player.sendMessage(`§aLoading blocks.. please wait! §7§o[${findReplace}/${totalBlocks}]`)
                        player.teleport({x: i, y: j, z: k})
                    } 
                        
                    if(findReplace == totalBlocks){
                        player.sendMessage(`§aLoading blocks.. please wait! §7§o[${findReplace}/${totalBlocks}]`)
                        if(findReplace > blockFillLimit){
                            player.teleport(ogLoc)
                        }
                        player.sendMessage(`§a${findReplace} block(s) was set to ${block}`)
                        return;
                    }

                    k += 1;
                }
                j += 1;
            }
            i += 1;
        }
    } catch(e){
        player.sendMessage(`§a${e}`)
        return
    }
}


