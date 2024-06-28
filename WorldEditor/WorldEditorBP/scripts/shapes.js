import { world, system, BlockTypes, BlockVolume } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as blockset from './blockset'
import * as editor from './main'
import * as actions from './actionSave'

let shapeData = new Map();

// Config Limits
let sphereLimit = 15;
let circleLimit = 15;
let cubeLimit = 50;
let squareLimit = 25;
let pyramidLimit = 25;
let triangleLimit = 25;
let helixLimit = 25;

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
    form.button(`§a§l> §0§lCreate Double Helix`)
    form.button(`§a§l> §0§lCreate Outward Spiral`)
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
            form.slider("Circle Height", 1, circleLimit, 1, 1);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let height = response.formValues[1];
                    let isFilled = response.formValues[2];
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
                                    createCircle(player, newLoc, radius, height, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, height, isFilled, shape: "circle"})
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
        } else if(response.selection == 3){
            let form = new ModalFormData();
            form.title(`§d§lSquare Function`)
            form.slider("Square Size", 1, squareLimit, 1, 5);
            form.slider("Square Height", 1, squareLimit, 1, 5);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let height = response.formValues[1];
                    let isFilled = response.formValues[2];
                    let form = new ActionFormData();
                    form.title(`§d§lSquare Function`)
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
                                    createSquare(player, newLoc, radius, height, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, height, isFilled, shape: "square"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 4){
            let form = new ModalFormData();
            form.title(`§d§lPyramid Function`)
            form.slider("Pyramid Size", 1, pyramidLimit, 1, 5);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let isFilled = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lPyramid Function`)
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
                                    createPyramid(player, newLoc, radius, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, isFilled, shape: "pyramid"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 5){
            let form = new ModalFormData();
            form.title(`§d§lTriangle Function`)
            form.slider("Triangle Size", 1, triangleLimit, 1, 5);
            form.slider("Triangle Height", 1, triangleLimit, 1, 1);
            form.toggle("Filled", false);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let height = response.formValues[1];
                    let isFilled = response.formValues[2];
                    let form = new ActionFormData();
                    form.title(`§d§lTriangle Function`)
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
                                    createTriangle(player, newLoc, radius, height, block, isFilled)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, height, isFilled, shape: "triangle"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 6){
            let form = new ModalFormData();
            form.title(`§d§lHelix Function`)
            form.slider("Helix Size", 1, helixLimit, 1, 15);
            form.slider("Helix Height", 1, helixLimit*4, 1, 15);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let height = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lHelix Function`)
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
                                    createHelix(player, newLoc, radius, height, block)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, height, shape: "helix"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 7){
            let form = new ModalFormData();
            form.title(`§d§lDouble Helix Function`)
            form.slider("Double Helix Size", 1, helixLimit, 1, 15);
            form.slider("Double Helix Height", 1, helixLimit*4, 1, 15);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let height = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lDouble Helix Function`)
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
                                    createDoubleHelix(player, newLoc, radius, height, block)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, height, shape: "doublehelix"})
                            player.sendMessage(`§aUse worldeditor to grab block!`);
                            editor.setPickBlock(1)
                        }
                    })
                }
            })
        } else if(response.selection == 8){
            let form = new ModalFormData();
            form.title(`§d§lOutward Spiral Function`)
            form.slider("Outward Spiral Size", 1, helixLimit, 1, 15);
            form.slider("Outward Spiral Height", 1, helixLimit*4, 1, 15);
            form.show(player).then(response => {
                if(!response.canceled){
                    let radius = response.formValues[0];
                    let height = response.formValues[1];
                    let form = new ActionFormData();
                    form.title(`§d§lOutward Spiral Function`)
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
                                    createSpiral(player, newLoc, radius, height, block)
                                }
                            })
                        } else if(response2.selection == 1){
                            blockset.setPermRecord(player, "record")
                            blockset.setFunction(player, "shape")
                            let newLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
                            const blockVolume = new BlockVolume(newLoc, newLoc);
                            player.dimension.fillBlocks(blockVolume, "glowstone", { ignoreChunkBoundErrors: true });
                            shapeData.set(player.id, {newLoc, radius, height, shape: "spiral"})
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
    let { newLoc, radius, height, isFilled, shape } = shapeData.get(player.id);
    const blockVolume = new BlockVolume(newLoc, newLoc);
    player.dimension.fillBlocks(blockVolume, "air", { ignoreChunkBoundErrors: true });
    if(shape == "sphere"){
        createSphere(player, newLoc, radius, block, isFilled)
    } else if(shape == "circle"){
        createCircle(player, newLoc, radius, height, block, isFilled)
    } else if(shape == "cube"){
        createCube(player, newLoc, radius, block, isFilled)
    } else if(shape == "square"){
        createSquare(player, newLoc, radius, height, block, isFilled)
    } else if(shape == "pyramid"){
        createPyramid(player, newLoc, radius, block, isFilled)
    } else if(shape == "triangle"){
        createTriangle(player, newLoc, radius, height, block, isFilled)
    } else if(shape == "helix"){
        createHelix(player, newLoc, radius, height, block)
    } else if(shape == "doublehelix"){
        createDoubleHelix(player, newLoc, radius, height, block)
    } else if(shape == "spiral"){
        createSpiral(player, newLoc, radius, height, block)
    }
}

function createCircle(player, location, radius, height, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    let displayName = block;
    if (typeof block !== "string") {
        displayName = block.type.id;
    }

    // Save Data
    let sections = [];
    for (let x = -radius; x <= radius; x++) {
        for (let y = 0; y < height; y++) {  // Loop through the height of the cylinder
            for (let z = -radius; z <= radius; z++) {
                const dist = Math.sqrt(x * x + z * z);
                const pos = { x: cx + x, y: cy + y, z: cz + z };

                // Create a BlockVolume for the current block
                const blockVolume = new BlockVolume(pos, pos);

                if (!isFilled) {
                    if ((dist - radius) ** 2 < 0.5) {
                        sections.push(blockVolume);
                    }
                } else {
                    if (dist - 0.5 <= radius) {
                        sections.push(blockVolume);
                    }
                }
            }
        }
    }
    actions.saveAction(player, sections);

    // Iterate over each block position in the cylinder's bounding box
    let loaded = 0;
    for (let x = -radius; x <= radius; x++) {
        for (let y = 0; y < height; y++) {  // Loop through the height of the cylinder
            for (let z = -radius; z <= radius; z++) {
                const dist = Math.sqrt(x * x + z * z);
                const pos = { x: cx + x, y: cy + y, z: cz + z };

                // Create a BlockVolume for the current block
                const blockVolume = new BlockVolume(pos, pos);

                if (!isFilled) {
                    if ((dist - radius) ** 2 < 0.5) {
                        loaded += 1;
                        player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}]`);
                        dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true });
                    }
                } else {
                    if (dist - 0.5 <= radius) {
                        loaded += 1;
                        player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}]`);
                        dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true });
                    }
                }
            }
        }
    }

    player.teleport({ x: location.x, y: location.y + height + 1, z: location.z });
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} ${displayName} cylinder §awas created with a radius of §d${radius}§a and height of §d${height}`);
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
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} ${displayName} sphere §awas created with a radius of §d${radius}`);
}

function createCube(player, location, radius, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    let displayName = block;
    if (typeof block !== "string") {
        displayName = block.type.id;
    }

    const min = { x: cx - radius, y: cy - radius, z: cz - radius };
    const max = { x: cx + radius, y: cy + radius, z: cz + radius };

    // Generate sections for filling
    const sections = blockset.createSections(min, max, 32768);
    actions.saveAction(player, sections);

    if (isFilled) {
        // Fill each section with the specified block
        sections.forEach(section => {
            dimension.fillBlocks(section, block, { ignoreChunkBoundErrors: true });
        });
    } else {
        const edges = [];

        // Add all edge sections for a hollow cube
        for (let x = min.x; x <= max.x; x++) {
            for (let y = min.y; y <= max.y; y++) {
                edges.push(new BlockVolume({ x: x, y: y, z: min.z }, { x: x, y: y, z: min.z }));
                edges.push(new BlockVolume({ x: x, y: y, z: max.z }, { x: x, y: y, z: max.z }));
            }
        }

        for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
                edges.push(new BlockVolume({ x: x, y: min.y, z: z }, { x: x, y: min.y, z: z }));
                edges.push(new BlockVolume({ x: x, y: max.y, z: z }, { x: x, y: max.y, z: z }));
            }
        }

        for (let y = min.y; y <= max.y; y++) {
            for (let z = min.z; z <= max.z; z++) {
                edges.push(new BlockVolume({ x: min.x, y: y, z: z }, { x: min.x, y: y, z: z }));
                edges.push(new BlockVolume({ x: max.x, y: y, z: z }, { x: max.x, y: y, z: z }));
            }
        }

        edges.forEach(edge => {
            dimension.fillBlocks(edge, block, { ignoreChunkBoundErrors: true });
        });
    }

    player.teleport({ x: location.x, y: location.y + radius + 1, z: location.z });
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} ${displayName} cube §awas created with a radius of §d${radius}`);
}

function createSquare(player, location, radius, height, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    let displayName = block;
    if (typeof block !== "string") {
        displayName = block.type.id;
    }

    // Determine the minimum and maximum coordinates for the cube
    const min = { x: cx - radius, y: cy, z: cz - radius };
    const max = { x: cx + radius, y: cy + height - 1, z: cz + radius };

    // Generate sections for filling
    const sections = blockset.createSections(min, max, 32768);
    actions.saveAction(player, sections);

    if (isFilled) {
        // Fill each section with the specified block
        sections.forEach(section => {
            dimension.fillBlocks(section, block, { ignoreChunkBoundErrors: true });
        });
    } else {
        // Create the hollow cube by filling only the edges
        const edges = [];

        // Add all edge sections for a hollow cube
        for (let y = min.y; y <= max.y; y++) {
            for (let x = min.x; x <= max.x; x++) {
                edges.push(new BlockVolume({ x: x, y: y, z: min.z }, { x: x, y: y, z: min.z }));
                edges.push(new BlockVolume({ x: x, y: y, z: max.z }, { x: x, y: y, z: max.z }));
            }
            for (let z = min.z; z <= max.z; z++) {
                edges.push(new BlockVolume({ x: min.x, y: y, z: z }, { x: min.x, y: y, z: z }));
                edges.push(new BlockVolume({ x: max.x, y: y, z: z }, { x: max.x, y: y, z: z }));
            }
        }

        edges.forEach(edge => {
            dimension.fillBlocks(edge, block, { ignoreChunkBoundErrors: true });
        });
    }

    player.teleport({ x: location.x, y: location.y + height + 1, z: location.z });
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} ${displayName} square §awas created with a radius of §d${radius} §aand a height of §d${height}`);
}

function createPyramid(player, location, radius, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Determine the maximum height of the pyramid
    const height = radius;

    // Save sections array with extended dimensions for saving
    let saveSections = [];
    let fillSections = [];

    if (isFilled) {
        // Create a solid pyramid
        for (let y = 0; y <= height; y++) {
            const currentRadius = radius - Math.floor((radius * y) / height);

            // Calculate min and max for the current layer
            const min = { x: cx - currentRadius, y: cy + y, z: cz - currentRadius };
            const max = { x: cx + currentRadius, y: cy + y, z: cz + currentRadius };

            // Generate sections for filling
            const layerSections = blockset.createSections(min, max, 32768);
            fillSections = fillSections.concat(layerSections);

            // Generate sections with extended dimensions for saving
            const enlargedMin = { x: min.x - 1, y: min.y, z: min.z - 1 };
            const enlargedMax = { x: max.x + 1, y: max.y, z: max.z + 1 };
            const saveVolume = new BlockVolume(enlargedMin, enlargedMax);
            saveSections.push(saveVolume);
        }
    } else {
        // Create a hollow pyramid
        for (let y = 0; y <= height; y++) {
            const currentRadius = radius - Math.floor((radius * y) / height);

            // Calculate min and max for the current layer
            const min = { x: cx - currentRadius, y: cy + y, z: cz - currentRadius };
            const max = { x: cx + currentRadius, y: cy + y, z: cz + currentRadius };

            // Bottom edges are always filled in the hollow mode
            if (y === 0) {
                for (let x = min.x; x <= max.x; x++) {
                    fillSections.push(new BlockVolume({ x: x, y: min.y, z: min.z }, { x: x, y: min.y, z: max.z }));
                }
                for (let z = min.z; z <= max.z; z++) {
                    fillSections.push(new BlockVolume({ x: min.x, y: min.y, z: z }, { x: max.x, y: min.y, z: z }));
                }
            } else {
                // Only fill the outermost edges for inner layers
                fillSections.push(new BlockVolume({ x: min.x, y: min.y, z: min.z }, { x: max.x, y: min.y, z: min.z }));
                fillSections.push(new BlockVolume({ x: min.x, y: min.y, z: max.z }, { x: max.x, y: min.y, z: max.z }));
                fillSections.push(new BlockVolume({ x: min.x, y: min.y, z: min.z }, { x: min.x, y: min.y, z: max.z }));
                fillSections.push(new BlockVolume({ x: max.x, y: min.y, z: min.z }, { x: max.x, y: min.y, z: max.z }));
            }

            // Generate sections with extended dimensions for saving
            const enlargedMin = { x: min.x - 1, y: min.y, z: min.z - 1 };
            const enlargedMax = { x: max.x + 1, y: max.y, z: max.z + 1 };
            const saveVolume = new BlockVolume(enlargedMin, enlargedMax);
            saveSections.push(saveVolume);
        }
    }

    // Save sections for undo functionality if needed
    actions.saveAction(player, saveSections);

    // Iterate over fill sections to fill or hollow out the pyramid
    let loaded = 0;
    fillSections.forEach(blockVolume => {
        dimension.fillBlocks(blockVolume, block, { ignoreChunkBoundErrors: true });
        loaded++;
        player.onScreenDisplay.setActionBar(`§dLoading block sections... §7§o[${loaded}/${fillSections.length}]`);
    });

    player.teleport({ x: location.x, y: location.y + radius + 1, z: location.z });
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} pyramid §awas created with a base radius of §d${radius}`);
}

function createTriangle(player, location, radius, height, block, isFilled) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Determine the vertical height of each equilateral triangle
    const triangleHeight = Math.floor((Math.sqrt(3) / 2) * radius);

    // Save sections array
    let sections = [];

    // Create triangles
    for (let h = 0; h < height; h++) {
        for (let i = 0; i <= triangleHeight; i++) {
            const currentWidth = Math.floor(radius - (radius * i) / triangleHeight);

            let min = { x: cx - i, y: cy + h, z: cz - currentWidth };
            let max = { x: cx - i, y: cy + h, z: cz + currentWidth };

            // Define sections or edges based on filled or hollow mode
            if (!isFilled) {
                // Hollow mode: generate edges for outermost edges
                if (i === 0) {
                    // Special case for the bottom layer of the first triangle
                    for (let z = min.z + 1; z <= max.z - 1; z++) {
                        sections.push(new BlockVolume({ x: min.x, y: min.y, z: z }, { x: min.x, y: min.y, z: z }));
                    }
                } else {
                    // Only save the outermost edges for inner layers
                    sections.push(new BlockVolume({ x: min.x, y: min.y, z: min.z }, { x: min.x, y: min.y, z: min.z }));
                    sections.push(new BlockVolume({ x: min.x, y: min.y, z: max.z }, { x: min.x, y: min.y, z: max.z }));
                }
            } else {
                // Fill mode: generate sections for filling
                if (i === 0) {
                    // Special case for the bottom layer of the first triangle
                    for (let z = min.z + 1; z <= max.z - 1; z++) {
                        sections.push(new BlockVolume({ x: min.x, y: min.y, z: z }, { x: min.x, y: min.y, z: z }));
                    }
                } else {
                    const filledSections = blockset.createSections(min, max, 32768);
                    sections = sections.concat(filledSections);
                }
            }
        }
    }

    // Save one large section covering the entire triangle
    const minX = cx - triangleHeight;
    const maxX = cx;
    const minZ = cz - radius;
    const maxZ = cz + radius;
    const saveSection = new BlockVolume({ x: minX, y: cy, z: minZ }, { x: maxX, y: cy + height - 1, z: maxZ });
    actions.saveAction(player, [saveSection]);

    // Fill blocks after saving the action
    sections.forEach(section => {
        dimension.fillBlocks(section, block, { ignoreChunkBoundErrors: true });
    });

    // Inform the player about the created triangle
    player.sendMessage(`§aA §d${isFilled ? 'solid' : 'hollow'} triangle §awas created with a base radius of §d${radius} §aand a height of §d${height}`);
}

function createHelix(player, location, radius, height, block) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Constants for helix generation
    const verticalSpacing = 1;  // Vertical spacing between each layer
    const angularSpacing = 0.2;  // Angular spacing per layer
    const thetaMax = height / verticalSpacing;  // Total number of layers based on height

    // Save sections array
    let sections = [];

    // Create sections for each layer of the helix
    for (let theta = 0; theta <= thetaMax; theta++) {
        const y = theta * verticalSpacing;
        const currentRadius = radius;

        // Calculate positions for the current layer
        const x1 = Math.round(cx + currentRadius * Math.cos(theta * angularSpacing));
        const z1 = Math.round(cz + currentRadius * Math.sin(theta * angularSpacing));

        // Connect to the outermost block of the previous layer
        if (theta > 0) {
            const prevX = Math.round(cx + currentRadius * Math.cos((theta - 1) * angularSpacing));
            const prevZ = Math.round(cz + currentRadius * Math.sin((theta - 1) * angularSpacing));
            sections.push(new BlockVolume({ x: prevX, y: cy + (theta - 1) * verticalSpacing, z: prevZ }, { x: x1, y: cy + y, z: z1 }));
        }

        // Create a BlockVolume for the current position
        const volume = new BlockVolume({ x: x1, y: cy + y, z: z1 }, { x: x1, y: cy + y, z: z1 });
        sections.push(volume);
    }

    // Extend the saving range slightly
    const savingExtension = 2;
    const minX = Math.round(cx - radius - savingExtension);
    const maxX = Math.round(cx + radius + savingExtension);
    const minZ = Math.round(cz - radius - savingExtension);
    const maxZ = Math.round(cz + radius + savingExtension);
    const minY = cy;
    const maxY = cy + height + savingExtension - 1;

    // Save one large section covering the extended area around the helix
    const saveSection = new BlockVolume({ x: minX, y: minY, z: minZ }, { x: maxX, y: maxY, z: maxZ });
    actions.saveAction(player, [saveSection]);

    // Fill blocks after saving the action
    sections.forEach(section => {
        dimension.fillBlocks(section, block);
    });

    // Inform the player about the created helix
    player.sendMessage(`§aA single helix structure was created with a base radius of §d${radius} §aand height of §d${height}`);
}

function createDoubleHelix(player, location, radius, height, block) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Constants for helix generation
    const verticalSpacing = 1;  // Vertical spacing between each layer
    const angularSpacing = 0.2;  // Angular spacing per layer
    const thetaMax = height / verticalSpacing;  // Total number of layers based on height

    // Save sections array
    let sections = [];

    // Create sections for each layer of both helix strands
    for (let theta = 0; theta <= thetaMax; theta++) {
        const y = theta * verticalSpacing;
        const currentRadius = radius;

        // Calculate positions for the current layer
        const x1 = Math.round(cx + currentRadius * Math.cos(theta * angularSpacing));
        const z1 = Math.round(cz + currentRadius * Math.sin(theta * angularSpacing));
        const x2 = Math.round(cx - currentRadius * Math.cos(theta * angularSpacing));
        const z2 = Math.round(cz - currentRadius * Math.sin(theta * angularSpacing));

        // Connect to the outermost block of the previous layer for both strands
        if (theta > 0) {
            const prevX1 = Math.round(cx + currentRadius * Math.cos((theta - 1) * angularSpacing));
            const prevZ1 = Math.round(cz + currentRadius * Math.sin((theta - 1) * angularSpacing));
            const prevX2 = Math.round(cx - currentRadius * Math.cos((theta - 1) * angularSpacing));
            const prevZ2 = Math.round(cz - currentRadius * Math.sin((theta - 1) * angularSpacing));

            sections.push(new BlockVolume({ x: prevX1, y: cy + (theta - 1) * verticalSpacing, z: prevZ1 }, { x: x1, y: cy + y, z: z1 }));
            sections.push(new BlockVolume({ x: prevX2, y: cy + (theta - 1) * verticalSpacing, z: prevZ2 }, { x: x2, y: cy + y, z: z2 }));
        }

        // Create BlockVolumes for both strands of the helix
        const volume1 = new BlockVolume({ x: x1, y: cy + y, z: z1 }, { x: x1, y: cy + y, z: z1 });
        const volume2 = new BlockVolume({ x: x2, y: cy + y, z: z2 }, { x: x2, y: cy + y, z: z2 });

        sections.push(volume1);
        sections.push(volume2);
    }

    // Extend the saving range slightly
    const savingExtension = 2;
    const minX = Math.round(cx - radius - savingExtension);
    const maxX = Math.round(cx + radius + savingExtension);
    const minZ = Math.round(cz - radius - savingExtension);
    const maxZ = Math.round(cz + radius + savingExtension);
    const minY = cy;
    const maxY = cy + height + savingExtension - 1;

    // Save one large section covering the extended area around the double helix
    const saveSection = new BlockVolume({ x: minX, y: minY, z: minZ }, { x: maxX, y: maxY, z: maxZ });
    actions.saveAction(player, [saveSection]);

    // Fill blocks after saving the action
    sections.forEach(section => {
        dimension.fillBlocks(section, block);
    });

    // Inform the player about the created double helix
    player.sendMessage(`§aA double helix structure was created with a base radius of §d${radius} §aand height of §d${height}`);
}

function createSpiral(player, location, radius, height, block) {
    const dimension = player.dimension;
    const { x: cx, y: cy, z: cz } = location;

    // Constants for spiral generation
    const verticalSpacing = 1;  // Vertical spacing between each layer
    const angularSpacing = 0.2;  // Angular spacing per layer
    const thetaMax = height / verticalSpacing;  // Total number of layers based on height

    // Save sections array
    let sections = [];

    // Create sections for each layer of the spiral
    for (let theta = 0; theta <= thetaMax; theta++) {
        const y = theta * verticalSpacing;
        const currentRadius = radius;

        // Calculate positions for the current layer
        const x1 = Math.round(cx + currentRadius * Math.cos(theta * angularSpacing));
        const z1 = Math.round(cz + currentRadius * Math.sin(theta * angularSpacing));
        const x2 = Math.round(cx - currentRadius * Math.cos(theta * angularSpacing));
        const z2 = Math.round(cz - currentRadius * Math.sin(theta * angularSpacing));

        // Determine the number of steps between the strands to connect them
        const numSteps = Math.max(Math.abs(x1 - x2), Math.abs(z1 - z2)) + 1;

        // Interpolate between the two strands to ensure connectivity
        for (let step = 0; step <= numSteps; step++) {
            const xi = Math.round(x1 + (x2 - x1) * (step / numSteps));
            const zi = Math.round(z1 + (z2 - z1) * (step / numSteps));

            const volume = new BlockVolume({ x: xi, y: cy + y, z: zi }, { x: xi, y: cy + y, z: zi });
            sections.push(volume);
        }
    }

    // Extend the saving range slightly
    const savingExtension = 2;
    const minX = Math.round(cx - radius - savingExtension);
    const maxX = Math.round(cx + radius + savingExtension);
    const minZ = Math.round(cz - radius - savingExtension);
    const maxZ = Math.round(cz + radius + savingExtension);
    const minY = cy;
    const maxY = cy + height + savingExtension   - 1;

    // Save one large section covering the extended area around the spiral
    const saveSection = new BlockVolume({ x: minX, y: minY, z: minZ }, { x: maxX, y: maxY, z: maxZ });
    actions.saveAction(player, [saveSection]);

    // Fill blocks after saving the action
    sections.forEach(section => {
        dimension.fillBlocks(section, block);
    });

    // Inform the player about the created spiral structure
    player.sendMessage(`§aA spiral structure was created with a base radius of §d${radius} §aand height of §d${height}`);
}




