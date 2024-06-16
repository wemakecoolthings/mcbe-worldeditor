import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as blockset from './blockset'
import * as maskLib from './mask'

// Save Positions
export let pos1 = new Map();
export let pos2 = new Map();
export let exe = world.getDimension("overworld")

// Manage Active Events
export let events = new Map();

// Toggle Tracker
let toggle = 0;

// Main Menu
function worldeditorMenu(player){
    let form = new ActionFormData();
	form.title("§d§lWorld Editor Commands")
	form.button(`§a§l> §0§lSet`)
	form.button(`§a§l> §0§lReplace`)
    form.button(`§a§l> §0§lMask`)
	form.button(`§a§l> §0§lShapes`)
    form.button(`§a§l> §0§lTerrain`)
    form.button(`§a§l> §0§lStructures`)
	form.button(`§a§l> §0§lUndo`)
    form.button(`§a§l> §0§lRedo`)
	form.button(`§a§l> §0§lDisable World Editor`)
	form.show(player).then(response => {

		if(!response.canceled){
            let positionRequired = [0, 1, 4, 5]
            for(let i = 0; i < positionRequired.length; i++){
                if(positionRequired[i]){
                    if(!pos1.has(player.id) || !pos2.has(player.id)){
                        player.sendMessage(`§aYou must select two valid positions before using commands.`)
                        return;
                    }
                }
            }
		}

		if(response.selection == 0){
			blockset.setBlockMenu(player, pos1.get(player.id), pos2.get(player.id), exe);
		} else if(response.selection == 2){
			maskLib.setMask(player)
		}
    })
}

// Axe & Main Command Menu
world.afterEvents.itemUse.subscribe(ev => {
	if(ev.source.hasTag("worldeditor") && ev.itemStack?.typeId.includes("blaze_powder") && toggle == 1){
		ev.source.playSound("random.pop")
		worldeditorMenu(ev.source);
	} else if (ev.source.hasTag("worldeditor") && ev.itemStack?.typeId.includes("blaze_powder") && toggle == 0) {
		toggle = 1;
		toggleEvents()
		exe.runCommand(`clear "${ev.source.name}" wooden_axe`)
		exe.runCommand(`give "${ev.source.name}" wooden_axe`)
		ev.source.sendMessage(`§aWorld Editor Enabled`)
	}
})

system.beforeEvents.watchdogTerminate.subscribe(ev => [
    ev.cancel = true
])

// Axe Functionality
let interactCD = new Set(); // To prevent extra detections
function toggleEvents(){

	const eventBreak = world.beforeEvents.playerBreakBlock.subscribe(ev => {
		if(ev.player.hasTag("worldeditor") && ev.itemStack?.typeId.includes("wooden_axe")){

			let loc = {x: ev.block.x, y: ev.block.y, z: ev.block.z}
			pos1.set(ev.player.id, loc);
			if(pos2.has(ev.player.id)){

				let loc2 = pos2.get(ev.player.id);
				let max1 = Math.max(loc.x, loc2.x);
				let max2 = Math.max(loc.y, loc2.y);
				let max3 = Math.max(loc.z, loc2.z);
				const min1 = Math.min(loc.x, loc2.x);
				const min2 = Math.min(loc.y, loc2.y);
				const min3 = Math.min(loc.z, loc2.z);
				max1++;
				max2++;
				max3++;
				let totalBlocks = (max1 - min1) * (max2 - min2) * (max3 - min3);
				ev.player.sendMessage(`§aPos 1 set to §d${loc.x} ${loc.y} ${loc.z} §7§o[${totalBlocks} Blocks Selected]`)

			} else {
				ev.player.sendMessage(`§aPos 1 set to §d${loc.x} ${loc.y} ${loc.z}`)
			}

            ev.cancel = true;
		}
    })

    const eventInt = world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
        if(ev.player.hasTag("worldeditor") && !interactCD.has(ev.player.id) && ev.itemStack?.typeId.includes("wooden_axe")){

			interactCD.add(ev.player.id)
			let loc = {x: ev.block.x, y: ev.block.y, z: ev.block.z}
			pos2.set(ev.player.id, loc);

			if(pos1.has(ev.player.id)){
				let loc2 = pos1.get(ev.player.id);
				let max1 = Math.max(loc.x, loc2.x);
				let max2 = Math.max(loc.y, loc2.y);
				let max3 = Math.max(loc.z, loc2.z);
				const min1 = Math.min(loc.x, loc2.x);
				const min2 = Math.min(loc.y, loc2.y);
				const min3 = Math.min(loc.z, loc2.z);
				max1++;
				max2++;
				max3++;

				let totalBlocks = (max1 - min1) * (max2 - min2) * (max3 - min3);
				ev.player.sendMessage(`§aPos 2 set to §d${loc.x} ${loc.y} ${loc.z} §7§o[${totalBlocks} Blocks Selected]`)
			} else {
				ev.player.sendMessage(`§aPos 2 set to §d${loc.x} ${loc.y} ${loc.z}`)
			}

			system.runTimeout(() => {
				interactCD.delete(ev.player.id)
			}, 5)

            ev.cancel = true;
		}
    })

	events.set(1, eventBreak)
    events.set(2, eventInt)
}