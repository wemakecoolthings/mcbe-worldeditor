import { world, system, BlockVolume, BlockPermutation, Block } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import * as editor from './main';
import * as action from './actionSave'

let brushes = new Map(); // Stores all brushes by their ID
let brushMode = new Map(); // Tracks whether brush mode is enabled for a player
let brushPermBlock = new Map();
let brushPermutations = new Map(); // Stores block permutations separately
let brushOpt1 = new Map(); // Include liquid blocks option
let brushOpt2 = new Map(); // Include passable blocks option

// Brush Events
world.afterEvents.itemUse.subscribe(ev => {
    const player = ev.source;
    let brushTool = ev.itemStack.typeId;

    // Remove "minecraft:" prefix if it exists
    if (brushTool.startsWith("minecraft:")) {
        brushTool = brushTool.replace("minecraft:", "");
    }

    if (brushMode.has(player.name) && !brushTool.includes("slab") && !brushTool.includes("stairs") && !brushTool.includes("block") && brushTool !== "wooden_axe" && brushTool !== "we:world_editor") {
        if (player.hasTag("worldeditor") && brushMode.get(player.name) === true) {
            if (brushes.has(`${player.name}_${brushTool}`)) {
                brushAction(player, brushTool);
            } else {
                player.sendMessage(`§cNo brush settings found for this tool.`);
            }
        }
    } else if(brushes.has(`${player.name}_${brushTool}`)){
        player.sendMessage(`§cBrushes are currently toggled off, you can enable them in the brush menu.`);
    }
});

export function sendBrushMenu(player) {
    let form = new ActionFormData();
    form.title("§d§lBrush Commands")
    form.button(`§a§l> §0§lToggle Brush Tools`)
    form.button(`§a§l> §0§lCreate Brush`)
    form.button(`§a§l> §0§lList Brushes`)
    form.show(player).then(response => {
        if (response.selection === 0) {
            toggleBrushMode(player);
        } else if (response.selection === 1) {
            sendBrushMakerMenu(player);
        } else if (response.selection === 2) {
            listPlayerBrushes(player);
        }
    })
}

function toggleBrushMode(player) {
    if (brushMode.has(player.name)) {
        brushMode.delete(player.name);
        player.sendMessage(`§cBrush mode disabled`);
    } else {
        brushMode.set(player.name, true);
        player.sendMessage(`§aBrush mode enabled`);
    }
}

function sendBrushMakerMenu(player) {
    let form = new ModalFormData();
    form.title("§d§lBrush Maker");
    form.textField(`Brush Name`, "");
    form.textField(`Item ID`, 'blaze_powder');
    form.dropdown(`Brush Shape`, ["Sphere", "Cube", "Prism"]);
    form.slider(`Radius`, 1, 6, 1, 3);
    form.textField(`Block Mask (OPTIONAL)`, "grass_block,dirt");
    form.textField(`Block Gradient`, "dirt");

    // Function to validate gradient input
    function validateGradientInput(input) {
        const regex = /^[a-zA-Z0-9,_:\s]*$/;
        return regex.test(input);
    }

    form.show(player).then(response => {
        if (!response.canceled) {
            let name = response.formValues[0].trim();
            let id = response.formValues[1].trim();
            let shape = response.formValues[2];
            let radius = response.formValues[3];
            let mask = response.formValues[4].trim().split(",");
            let gradient = response.formValues[5].trim();

            if (!validateGradientInput(gradient)) {
                player.sendMessage("§cInvalid characters in Block Gradient input");
                return;
            }

            let gradients = [];

            if (gradient !== "") {
                let items = gradient.split(",");
                for (let i = 0; i < items.length; i += 2) {
                    let block = items[i];
                    let weight = items[i + 1];
                    gradients.push([block, weight]);
                }
            } else {
                gradients = [["dirt", 100]];
            }

            if (name === "") {
                name = generateDefaultBrushName(player.name);
            }

            shape = ["sphere", "cube", "prism"][shape];

            let hasDuplicate = false;
            brushes.forEach((value, key) => {
                if (key.startsWith(player.name)) {
                    if (value.brushName === name) {
                        player.sendMessage(`§cA brush with the name "${name}" already exists.`);
                        hasDuplicate = true;
                    }
                    if (value.itemID === id) {
                        player.sendMessage(`§cA brush with the item ID "${id}" already exists.`);
                        hasDuplicate = true;
                    }
                }
            });

            if (!hasDuplicate) {
                createBrush(player, name, id, shape, radius, mask, gradients);
                sendAdditionalBlockMenu(player, name, id, shape, radius, mask, gradients);
            }
        }
    });
}

function sendAdditionalBlockMenu(player, name, id, shape, radius, mask, gradients) {
    let form = new ActionFormData();
    form.title("§d§lAdditional Blocks");
    form.button(`§a§l> §r§lAdd Additional Blocks Using "Pick Block" Tool!`);
    form.button(`§a§l> §r§lConfirm Selection!`);

    form.show(player).then(response => {
        if (!response.canceled) {
            if (response.selection === 0) {
                player.sendMessage(`§aUse worldeditor to grab block!`);
                editor.setPickBlock(3); // Start pick block process
                brushPermBlock.set(player.name, { name, id, shape, radius, mask, gradients }); // Save current brush settings
            } else if (response.selection === 1) {
                player.sendMessage(`§aBrush "${name}" created successfully with additional blocks!`);
            }
        }
    });
}

function createBrush(player, brushName, brushTool, shape, radius, blockMask, blockGradient) {
    const brushID = `${player.name}_${brushTool}`;
    brushes.set(brushID, {
        brushName: brushName,
        itemID: brushTool,
        shape: shape,
        radius: radius,
        blockMasks: blockMask,
        blockGradients: blockGradient
    });

    let maskOutput = blockMask.filter(Boolean).length > 0 ? `§d${blockMask.filter(Boolean).join(", ")}` : "§dNone";

    let gradientOutput = "§dNone (DEFAULTS TO DIRT)";
    if (blockGradient.length > 0) {
        gradientOutput = blockGradient.map(block => {
            let [type, weight, permutationData] = block; // Added permutationData for checking
            let blockTypeString = `§d${type}`;
            
            // Check if permutationData exists and format the block type string accordingly
            if (permutationData) {
                blockTypeString = `§d${type.type.id}`;
                blockTypeString += ` [+NBT]`;
            }
            
            return `${blockTypeString} -> ${weight}%%`;
        }).join("\n");
    }

    player.sendMessage(`§aCreated new brush called §d${brushName} §aattached to §d${brushTool}\n\n§aBrush Settings:\n§aShape Selection: §d${shape}\n§aRadius: §d${radius}\n§aBlocks Masked:\n${maskOutput}\n§aBlock Gradient:\n${gradientOutput}\n\n§dYou can edit your brush to add specific block types.`);
}


function listPlayerBrushes(player) {
    let playerBrushes = Array.from(brushes.entries()).filter(([key, value]) => key.startsWith(player.name));
    if (playerBrushes.length === 0) {
        player.sendMessage("§cYou don't have any brushes.");
        return;
    }

    let form = new ActionFormData();
    form.title("§d§lYour Brushes");

    playerBrushes.forEach(([key, brush]) => {
        form.button(`${brush.brushName} (${brush.itemID})`);
    });

    form.show(player).then(response => {
        if (!response.canceled) {
            let selectedBrush = playerBrushes[response.selection];
            showBrushSettings(player, selectedBrush[1], selectedBrush[0]);
        }
    });
}

function showBrushSettings(player, brush, brushID) {
    let form = new ActionFormData();
    form.title(`§d§lBrush: ${brush.brushName}`);
    
    // Display basic brush settings
    let bodyText = `§aItem ID: §d${brush.itemID}\n§aShape: §d${brush.shape}\n§aRadius: §d${brush.radius}\n§aBlock Mask: §d${brush.blockMasks.join(", ")}`;

    // Display block gradients
    let gradientText = brush.blockGradients.map(([type, weight, permutationData]) => {
        if (permutationData) {
            return `§d${type.type.id} [+NBT] -> ${weight}%`;
        } else {
            return `§d${type} -> ${weight}%`;
        }
    }).join("\n");

    bodyText += `\n§aBlock Gradient:\n${gradientText}`;

    form.body(bodyText);
    form.button("Edit Brush Settings");
    form.button("Delete Brush");

    form.show(player).then(response => {
        if (!response.canceled) {
            if (response.selection === 0) {
                sendEditBrushMenu(player, brushID);
            } else if (response.selection === 1) {
                deleteBrush(player, brushID);
            }
        }
    });
}

function sendEditBrushMenu(player, brushID) {
    const brush = brushes.get(brushID);

    let form = new ModalFormData();
    form.title(`§d§lEditing Brush: ${brush.brushName}`);
    form.textField("Brush Name", brush.brushName, brush.brushName);
    form.textField("Item ID", brush.itemID, brush.itemID);
    form.dropdown("Brush Shape", ["Sphere", "Cube", "Prism"], brush.shape === "sphere" ? 0 : (brush.shape === "cube" ? 1 : 2));
    form.slider("Radius", 1, 6, 1, brush.radius);
    form.textField("Block Mask (OPTIONAL)", brush.blockMasks.join(","), brush.blockMasks.join(","));

    // Display only non-permutation block types in block gradient
    let nonPermutationGradients = brush.blockGradients.filter(([type, weight, permutationData]) => !permutationData);
    let gradientText = nonPermutationGradients.map(([type, weight]) => `${type},${weight}`).join(",");
    form.textField("Block Gradient", gradientText, gradientText);

    // Function to validate gradient input
    function validateGradientInput(input) {
        const regex = /^[a-zA-Z0-9,_:\s]*$/;
        return regex.test(input);
    }

    form.toggle(`Keep "Pick Block" Additions`, true)
    form.toggle(`Add New "Pick Block" Additions`, false)
    form.show(player).then(response => {
        if (!response.canceled) {
            let name = response.formValues[0].trim();
            let id = response.formValues[1].trim();
            let shape = response.formValues[2];
            let radius = response.formValues[3];
            let mask = response.formValues[4].trim().split(",");
            let gradient = response.formValues[5].trim();
            let keepAdditions = response.formValues[6]
            let addAdditions = response.formValues[7]

            if (!validateGradientInput(gradient)) {
                player.sendMessage("§cInvalid characters in Block Gradient input");
                return;
            }

            let gradients = [];

            if (gradient !== "") {
                let items = gradient.split(",");
                for (let i = 0; i < items.length; i += 2) {
                    let block = items[i];
                    let weight = items[i + 1];
                    gradients.push([block, weight]);
                }
            } else {
                gradients = [["dirt", 100]];
            }

            if (name === "") {
                name = generateDefaultBrushName(player.name);
            }

            shape = ["sphere", "cube", "prism"][shape];

            let hasDuplicate = false;
            brushes.forEach((value, key) => {
                if (key !== brushID && key.startsWith(player.name)) {
                    if (value.brushName === name) {
                        player.sendMessage(`§cA brush with the name "${name}" already exists.`);
                        hasDuplicate = true;
                    }
                    if (value.itemID === id) {
                        player.sendMessage(`§cA brush with the item ID "${id}" already exists.`);
                        hasDuplicate = true;
                    }
                }
            });

            if (!hasDuplicate) {
                // Merge gradients with permutations before updating brush settings
                let updatedGradients = [];
                
                // Add user-inputted gradients
                gradients.forEach(([type, weight]) => {
                    updatedGradients.push([type, weight]);
                });
            
                // Add block permutations
                if(keepAdditions){
                    let permutationGradients = brush.blockGradients.filter(([type, weight, permutationData]) => permutationData);
                    updatedGradients = updatedGradients.concat(permutationGradients);
                }

                if(addAdditions){
                    sendAdditionalBlockMenu(player, name, id, shape, radius, mask, updatedGradients)
                } else {
                    editBrush(player, brushID, name, id, shape, radius, mask, updatedGradients);
                }
            }
        }
    });
}

function editBrush(player, brushID, brushName, brushTool, shape, radius, blockMask, blockGradient) {
    const brush = brushes.get(brushID);
    brush.brushName = brushName;
    brush.itemID = brushTool;
    brush.shape = shape;
    brush.radius = radius;
    brush.blockMasks = blockMask;
    brush.blockGradients = blockGradient;

    let maskOutput = blockMask.filter(Boolean).length > 0 ? `§d${blockMask.filter(Boolean).join(", ")}` : "§dNone";

    let gradientOutput = "§dNone (DEFAULTS TO DIRT)";
    if (blockGradient.length > 0) {
        gradientOutput = blockGradient.map(block => {
            let [type, weight, permutationData] = block; // Added permutationData for checking

            let blockTypeString = `§d${type}`;
            if (permutationData) {
                blockTypeString = `§d${type.type.id}`;
                blockTypeString += ` [+NBT]`;
            }

            return `§d${blockTypeString} -> ${weight}%%`;
        }).join("\n");
    }

    player.sendMessage(`§aEdited brush "${brushName}" (${brushTool}) successfully.\n\n§aUpdated Settings:\n§aShape Selection: §d${shape}\n§aRadius: §d${radius}\n§aBlocks Masked:\n${maskOutput}\n§aBlock Gradient:\n${gradientOutput}\n\n§dYou can continue editing or use 'apply' or other functions to set the new brushes.`);

    brushPermBlock.set(player.name, brush);
}

function deleteBrush(player, brushID) {
    brushes.delete(brushID);
    player.sendMessage(`§cBrush deleted successfully.`);
}

export function setPermutationToBrush(player, blockType, permutationData) {
    if (!brushPermBlock.has(player.name)) {
        player.sendMessage(`§cNo active brush to modify.`);
        return;
    }

    const { name, id, shape, radius, mask, gradients } = brushPermBlock.get(player.name);

    gradients.push([blockType, 100, permutationData]);

    brushPermBlock.delete(player.name);

    createBrush(player, name, id, shape, radius, mask, gradients);
}

function generateDefaultBrushName(playerName) {
    let defaultName = `${playerName}'s Brush`;
    let count = 1;
    while (brushes.has(`${playerName}_${defaultName}`)) {
        defaultName = `${playerName}'s Brush ${count}`;
        count++;
    }
    return defaultName;
}

function brushAction(player, brushTool) {
    try {
        const brushID = `${player.name}_${brushTool}`;
        const brushSettings = brushes.get(brushID);
        if (!brushSettings) {
            player.sendMessage(`§cNo brush settings found for this tool.`);
            return;
        }

        let lookPos = player.getBlockFromViewDirection({ includeLiquidBlocks: brushSettings.includeLiquidBlocks, includePassableBlocks: brushSettings.includePassableBlocks });
        if (!lookPos) {
            player.sendMessage(`§cNo valid target block found.`);
            return;
        }

        let posx = lookPos.block.x;
        let posy = lookPos.block.y;
        let posz = lookPos.block.z;
        let radius = brushSettings.radius;
        let shape = brushSettings.shape;
        let mask = brushSettings.blockMasks;

        // Determine the gradients to use, considering block permutations
        let gradients = brushSettings.blockGradients;
        // Incorporate permutations into the gradients
        gradients.forEach(permutation => {
            let [ blockType, weight, permutationData ] = permutation;
            if(permutationData){
                permutation.blockType = permutationData
            }
        });

        let blocksToReplace = getBlocksToReplace(posx, posy, posz, radius, shape, mask, player.dimension);
        const dimension = player.dimension;

        if (blocksToReplace.length === 0) {
            player.sendMessage(`§cNo blocks found to replace.`);
            return;
        }

        // Function to replicate objects based on weight
        function weight(arr) {
            return [].concat(...arr.map(obj => Array(Math.ceil(obj[1] * 100)).fill(obj)));
        }

        // Function to pick a random object from weighted array
        function pick(arr) {
            let weighted = weight(arr);
            return weighted[Math.floor(Math.random() * weighted.length)];
        }

        // Undo Action
        let sections = []
        blocksToReplace.forEach(block => {
            let [x, y, z] = block;
            let blockVolume = new BlockVolume({ x: x, y: y, z: z }, { x: x, y: y, z: z });
            sections.push(blockVolume)
        });
        action.saveAction(player, sections)

        // Usage example within your block selection loop
        blocksToReplace.forEach(block => {
            let [x, y, z] = block;

            // Use the pick function to select a block type based on gradients
            let chosenBlock = pick(gradients);
            let blockType = chosenBlock[0]; // Type is the first element of the chosen block object

            // Create a BlockVolume for the current block coordinate and fill it with blockType
            let blockVolume = new BlockVolume({ x: x, y: y, z: z }, { x: x, y: y, z: z });
            dimension.fillBlocks(blockVolume, blockType, { ignoreChunkBoundErrors: true });
        });

        player.sendMessage(`§aBrush action completed`);
    } catch (e) {
        player.sendMessage(`§cError during brush action: ${e}`);
    }
}

// Function to get blocks to replace
function getBlocksToReplace(posx, posy, posz, radius, shape, masks, dimension) {
    let blocks = [];
    switch (shape) {
        case 'sphere':
            for (let y = posy - radius; y <= posy + radius; y++) {
                for (let x = posx - radius; x <= posx + radius; x++) {
                    for (let z = posz - radius; z <= posz + radius; z++) {
                        let dist = Math.sqrt((posx - x) ** 2 + (posy - y) ** 2 + (posz - z) ** 2);
                        if (dist-0.5 <= radius) {
                            let blockTypeId = dimension.getBlock({ x, y, z }).typeId;
                            if (masks.length === 0 || isBlockInMasks(blockTypeId, masks)) {
                                blocks.push([x, y, z]);
                            }
                        }
                    }
                }
            }
            break;

        case 'cube':
            for (let y = posy - radius; y <= posy + radius; y++) {
                for (let x = posx - radius; x <= posx + radius; x++) {
                    for (let z = posz - radius; z <= posz + radius; z++) {
                        let blockTypeId = dimension.getBlock({ x, y, z }).typeId;
                        if (masks.length === 0 || isBlockInMasks(blockTypeId, masks)) {
                            blocks.push([x, y, z]);
                        }
                    }
                }
            }
            break;

        case 'prism':
            for (let y = posy; y <= posy + radius; y++) {
                let levelRadius = radius - (y - posy);
                for (let x = posx - levelRadius; x <= posx + levelRadius; x++) {
                    for (let z = posz - levelRadius; z <= posz + levelRadius; z++) {
                        let blockTypeId = dimension.getBlock({ x, y, z }).typeId;
                        if (masks.length === 0 || isBlockInMasks(blockTypeId, masks)) {
                            blocks.push([x, y, z]);
                        }
                    }
                }
            }
            break;

        default:
            throw new Error(`Unknown shape: ${shape}`);
    }

    return blocks;
}

// Helper function to check if a block type is in any of the masks
function isBlockInMasks(blockTypeId, masks) {
    return masks.some(mask => blockTypeId.includes(mask));
}
