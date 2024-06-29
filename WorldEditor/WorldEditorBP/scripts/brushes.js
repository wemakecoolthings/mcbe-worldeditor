import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

let brushes = new Map(); // Stores all brushes by their ID
let brushMode = new Map(); // Tracks whether brush mode is enabled for a player
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
        if (player.hasTag("worldeditor") && brushMode.get(player.name) == true) {
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


export function sendBrushMenu(player){
	let form = new ActionFormData();
	form.title("§d§lBrush Commands")
	form.button(`§a§l> §0§lToggle Brush Tools`)
	form.button(`§a§l> §0§lCreate Brush`)
	form.button(`§a§l> §0§lEdit Brush`)
	form.button(`§a§l> §0§lRemove Brush`)
	form.show(player).then(response => {
		if(response.selection == 0){
			toggleBrushMode(player)
		} else if(response.selection == 1){
			sendBrushMakerMenu(player)
		}
	})
}

// Function to set brush settings
function editBrushSettings(player) {
    
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
    form.dropdown(`Brush Shape`, ["Sphere", "Cube", "Prism", "Helix"]);
    form.slider(`Radius`, 1, 6, 1, 3);
    form.textField(`Block Mask (OPTIONAL)`, "grass_block,stone");
    form.textField(`Block Gradient`, "grass_block:50,stone");

    // Function to validate gradient input
    function validateGradientInput(input) {
        // Regular expression to match alphanumeric characters, commas, underscores, and colons
        const regex = /^[a-zA-Z0-9,_:\s]*$/;
        return regex.test(input);
    }

    form.show(player).then(response => {
        if (!response.canceled) {
            // Extract form values
            let name = response.formValues[0].trim();
            let id = response.formValues[1].trim();
            let shape = response.formValues[2];
            let radius = response.formValues[3];
            
            // Process mask and gradient
            let mask = response.formValues[4].trim().split(",");
            
            let gradient = response.formValues[5].trim();
            if (!validateGradientInput(gradient)) {
                player.sendMessage("§cInvalid characters in Block Gradient input");
                return;
            }
            
            gradient = gradient.split(",").map(block => {
                let parts = block.split(":");
                let type = parts[0].trim();
                let weight = parts.length > 1 ? parseFloat(parts[1]) : 100; // Default weight to 100 if not specified
                return [type, weight];
            });

            // Generate a default brush name if empty
            if (name === "") {
                name = generateDefaultBrushName(player.name);
            }

            // Shape ID
            shape = ["sphere", "cube", "prism", "helix"][shape];

            // Check for duplicate names or item IDs
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

            // Create the brush if no duplicates
            if (!hasDuplicate) {
                createBrush(player, name, id, shape, radius, mask, gradient);
            }
        }
    });
}


function generateDefaultBrushName(playerId) {
    let defaultName = "brush";
    let brushNumber = 1;
    let nameExists = true;

    while (nameExists) {
        nameExists = false;
        let generatedName = `${defaultName}${brushNumber}`;

        brushes.forEach((value, key) => {
            if (key.startsWith(playerId) && value.brushName === generatedName) {
                nameExists = true;
            }
        });

        if (!nameExists) {
            return generatedName;
        }

        brushNumber++;
    }
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

    let gradientOutput = "§dNone (DEFAULTS TO STONE)";
    if (blockGradient.length > 0) {
        gradientOutput = blockGradient.map(block => {
            let [type, weight] = block;
            return `§d${type} -> ${weight}%%`;
        }).join("\n");
    }

    player.sendMessage(`§aCreated new brush called §d${brushName} §aattached to §d${brushTool}\n\n§aBrush Settings:\n§aShape Selection: §d${shape}\n§aRadius: §d${radius}\n§aBlocks Masked:\n${maskOutput}\n§aBlock Gradient:\n${gradientOutput}`);
}

// Function to handle brush actions
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

        let blocksToReplace = getBlocksToReplace(posx, posy, posz, radius, shape, mask, player.dimension);
        const dimension = player.dimension;

        blocksToReplace.forEach(block => {
            let [x, y, z] = block;
            if (brushSettings.blockGradients.length > 0) {
                let randomBlockFromGradient = Math.floor(Math.random() * brushSettings.blockGradients.length);
                let blockType = brushSettings.blockGradients[randomBlockFromGradient][0];
                let weight = brushSettings.blockGradients[randomBlockFromGradient][1];
                while (weight / 100 < Math.random()) {
                    randomBlockFromGradient = Math.floor(Math.random() * brushSettings.blockGradients.length);
                    blockType = brushSettings.blockGradients[randomBlockFromGradient][0];
                    weight = brushSettings.blockGradients[randomBlockFromGradient][1];
                }
                const blockVolume = {
                    min: { x: x, y: y, z: z },
                    max: { x: x, y: y, z: z }
                };
                dimension.fillBlocks(blockVolume, blockType, { ignoreChunkBoundErrors: true });
            } else {
                const blockVolume = {
                    min: { x: x, y: y, z: z },
                    max: { x: x, y: y, z: z }
                };
                dimension.fillBlocks(blockVolume, "minecraft:stone", { ignoreChunkBoundErrors: true });
            }
        });

        player.sendMessage(`§aBrush action completed`);
    } catch (e) {
        player.sendMessage(`§cError during brush action: ${e}`);
    }
}

// Function to get blocks to replace
function getBlocksToReplace(posx, posy, posz, radius, shape, mask, dimension) {
    let blocks = [];

    switch (shape) {
        case 'sphere':
            for (let y = posy - radius; y <= posy + radius; y++) {
                for (let x = posx - radius; x <= posx + radius; x++) {
                    for (let z = posz - radius; z <= posz + radius; z++) {
                        let dist = Math.sqrt((posx - x) ** 2 + (posy - y) ** 2 + (posz - z) ** 2);
                        if (dist <= radius) {
                            if (mask.length === 0 || mask.includes(dimension.getBlock({ x, y, z }).typeId)) {
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
                        if (mask.length === 0 || mask.includes(dimension.getBlock({ x, y, z }).typeId)) {
                            blocks.push([x, y, z]);
                        }
                    }
                }
            }
            break;

        case 'pyramid':
            for (let y = posy; y <= posy + radius; y++) {
                let levelRadius = radius - (y - posy);
                for (let x = posx - levelRadius; x <= posx + levelRadius; x++) {
                    for (let z = posz - levelRadius; z <= posz + levelRadius; z++) {
                        if (mask.length === 0 || mask.includes(dimension.getBlock({ x, y, z }).typeId)) {
                            blocks.push([x, y, z]);
                        }
                    }
                }
            }
            break;

        case 'helix':
            const turns = 3; // Number of turns of the helix
            const height = radius * 2;
            const angleStep = (2 * Math.PI) / 10; // Controls the density of the helix

            for (let y = posy; y <= posy + height; y++) {
                let angle = (y - posy) * (turns / height) * 2 * Math.PI;
                let helixX = posx + Math.cos(angle) * radius;
                let helixZ = posz + Math.sin(angle) * radius;
                let helixCoords = [
                    Math.floor(helixX), y, Math.floor(helixZ),
                    Math.ceil(helixX), y, Math.ceil(helixZ)
                ];
                helixCoords.forEach((coord, index) => {
                    if (index % 3 === 0) {
                        let x = coord;
                        let z = helixCoords[index + 2];
                        if (mask.length === 0 || mask.includes(dimension.getBlock({ x, y, z }).typeId)) {
                            blocks.push([x, y, z]);
                        }
                    }
                });
            }
            break;

        default:
            throw new Error(`Unknown shape: ${shape}`);
    }

    return blocks;
}