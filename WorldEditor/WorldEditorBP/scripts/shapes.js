import { world, system, BlockTypes, BlockVolume } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as blockset from './blockset'
import * as editor from './main'
import * as actions from './actionSave'

let shapeData = new Map();

// Config Limits
let sphereLimit = 15;
let circleLimit = 50;
let cubeLimit = 50;
let squareLimit = 50;
let pyramidLimit = 25;
let triangleLimit = 25;
let helixLimit = 100;

export function sendShapesMenu(player){
    let form = new ActionFormData();
    form.title(`§d§lShape Functions`)
    form.button(`§a§l> §0§lCreate Sphere`)
    form.button(`§a§l> §0§lCreate Circle`)
    form.button(`§a§l> §0§lCreate Cube`)
    form.button(`§a§l> §0§lCreate Square`)
    form.button(`§a§l> §0§lCreate Pyramid`)
    form.button(`§a§l> §0§lCreate Triangle`)
    form.button(`§a§l> §0§lCreate Helix`)
    form.show(player).then(response => {
        if(response.selection == 0){
            let form = new ModalFormData();
            form.title(`§d§lSphere Function`)
            form.slider("Sphere Size", 1, sphereLimit, 1, 5);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let isFilled = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lSphere Function`)
                    form.button(`§a§l> §r§lType a Block ID!`)
                    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
                    form.show(player).then(response2 => {
                        if(response2.selection == 0){
                            let form = new ModalFormData();
                            form.title("Block Set Function")
                            form.textField("Block ID: ", "")
                            form.show(player).then(response3 => {
                                if(!response3.canceled){
                                    let block = response3.formValues[0];
                                    let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                                    createSphere(player, newLoc, radius, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, isFilled, shape: "sphere"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 1){
            let form = new ModalFormData();
            form.title(`§d§lCircle Function`)
            form.slider("Circle Size", 1, circleLimit, 1, 5);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let isFilled = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lCircle Function`)
                    form.button(`§a§l> §r§lType a Block ID!`)
                    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
                    form.show(player).then(response2 => {
                        if(response2.selection == 0){
                            let form = new ModalFormData();
                            form.title("Block Set Function")
                            form.textField("Block ID: ", "")
                            form.show(player).then(response3 => {
                                if(!response3.canceled){
                                    let block = response3.formValues[0];
                                    let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                                    createCircle(player, newLoc, radius, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, isFilled, shape: "circle"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 2){
            let form = new ModalFormData();
            form.title(`§d§lCube Function`)
            form.slider("Cube Size", 1, cubeLimit, 1, 5);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let isFilled = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lCube Function`)
                    form.button(`§a§l> §r§lType a Block ID!`)
                    form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
                    form.show(player).then(response2 => {
                        if(response2.selection == 0){
                            let form = new ModalFormData();
                            form.title("Block Set Function")
                            form.textField("Block ID: ", "")
                            form.show(player).then(response3 => {
                                if(!response3.canceled){
                                    let block = response3.formValues[0];
                                    let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                                    createCube(player, newLoc, radius, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, isFilled, shape: "cube"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        }
    })
}

export function filterShapeCreate(player, block){
    let { newLoc, radius, isFilled, shape } = shapeData.get(player.id);
    const blockVolume = new BlockVolume(newLoc, newLoc);
    player.dimension.fillBlocks(blockVolume, "air", { ignoreChunkBoundErrors: true });
    if(shape == "sphere"){
        createSphere(player, newLoc, radius, block, isFilled)
    } else if(shape == "circle"){
        createCircle(player, newLoc, radius, block, isFilled)
    } else if(shape == "cube"){
        createCube(player, newLoc, radius, block, isFilled)
    } else if(shape == "square"){
        createSquare(player, newLoc, radius, block, isFilled)
    } else if(shape == "pyramid"){
        createPyramid(player, newLoc, radius, block, isFilled)
    } else if(shape == "triangle"){
        createTriangle(player, newLoc, radius, block, isFilled)
    } else if(shape == "helix"){
        createHelix(player, newLoc, radius, block, isFilled)
    }
}

function createCircle(player, location, radius, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    let displayName = block
    if(typeof block != "string"){
        displayName = block.type.id
    }

    // Save Data
    let sections = []
    for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
            const dist = Math.sqrt(x * x + z * z);
            const pos = { x: cx + x, y: cy, z: cz + z };

            // Create a BlockVolume for the current block
            const blockVolume = new BlockVolume(pos, pos);
                
            if(isFilled == false){
                if ((dist - radius) ** 2 < 0.5) {
                    sections.push(blockVolume)
                }
            } else {
                if (dist-0.5 <= radius) {
                    sections.push(blockVolume)
                }
            }
        }
    }
    actions.saveAction(player, sections)

    // Iterate over each block position in the circle's bounding box
    let loaded = 0;
    for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
            const dist = Math.sqrt(x * x + z * z);
            const pos = { x: cx + x, y: cy, z: cz + z };

            // Create a BlockVolume for the current block
            const blockVolume = new BlockVolume(pos, pos);
                
            if(isFilled == false){
                if ((dist - radius) ** 2 < 0.5) {
                    loaded += 1
                    player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}]`);
                    dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true });
                }
            } else {
                if (dist-0.5 <= radius) {
                    loaded += 1
                    player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}]`);
                    dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true });
                }
            }
        }
    }

    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} ${ displayName} circle §awas created with a radius §d${radius}`);
}

function createSphere(player, location, radius, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    let displayName = block;
    if (typeof block !== "string") {
        displayName = block.type.id;
    }

    // Save Data
    let sections = [];

    // Determine the bounding box for the sphere
    const min = { x: cx - radius, y: cy - radius, z: cz - radius };
    const max = { x: cx + radius, y: cy + radius, z: cz + radius };

    // Iterate over each block position in the sphere's bounding box
    for (let x = min.x; x <= max.x; x++) {
        for (let y = min.y; y <= max.y; y++) {
            for (let z = min.z; z <= max.z; z++) {
                // Calculate the distance from the center of the sphere
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2);

                // Check if the block position is within the sphere's radius
                if ((!isFilled && Math.abs(dist - radius) < 0.5) || (isFilled && dist-0.5 <= radius)) {
                    const pos = { x, y, z };
                    const blockVolume = new BlockVolume(pos, pos);
                    sections.push(blockVolume);
                }
            }
        }
    }

    // Save sections for undo functionality if needed
    actions.saveAction(player, sections);

    // Iterate over each block position again to fill or hollow out the sphere
    let loaded = 0;
    sections.forEach(blockVolume => {
        dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true });
        loaded++;
        player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}/${sections.length}]`);
    });

    player.teleport({ x: location.x, y: location.y + radius + 1, z: location.z });
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} ${displayName} sphere §awas created with a radius §d${radius}`);
}

function createCube(player, location, radius, block, isFilled){

}

function createSquare(player, location, radius, block, isFilled){

}

function createPyramid(player, location, radius, block, isFilled){

}

function createTriangle(player, location, radius, block, isFilled){

}

function createHelix(player, location, radius, block, isFilled){

}

    /* OLD CODE
      
            let form = new ModalFormData();
            form.title("Shape Function: Square")
            form.textField("Block ID: ", "")
            form.slider("Square Size", 1, 25, 1, 5);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    // Change Block
                    if(typeof Number(response.formValues[1]) == 'number'){
                        let radius = Number(response.formValues[1])
                        let lowX = player.location.x - radius
                        let lowZ = player.location.z - radius
                        let maxX = player.location.x + radius
                        let maxZ = player.location.z + radius
                        let y = player.location.y;

                        if(response.formValues[2] == false){
                            exe.runCommand(`fill ${lowX} ${y} ${lowZ} ${maxX} ${y} ${lowZ} ${response.formValues[0]}`)
                            exe.runCommand(`fill ${lowX} ${y} ${maxZ} ${maxX} ${y} ${maxZ} ${response.formValues[0]}`)
                            exe.runCommand(`fill ${maxX} ${y} ${lowZ} ${maxX} ${y} ${maxZ} ${response.formValues[0]}`)
                            exe.runCommand(`fill ${lowX} ${y} ${lowZ} ${lowX} ${y} ${maxZ} ${response.formValues[0]}`)
                        } else {
                            exe.runCommand(`fill ${lowX} ${y} ${lowZ} ${maxX} ${y} ${maxZ} ${response.formValues[0]}`)
                        }

                        player.teleport({x: player.location.x, y: y+1, z: player.location.z})
                        player.sendMessage(`§aA ${response.formValues[0]} square with a size of ${radius} was placed.`)
                    }
                }
            })*/