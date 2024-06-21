import { world, system, Block, BlockType, StructureSaveMode } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as blockset from './blockset'
import * as maskLib from './mask'
import * as actionManager from './actionSave'
import * as struct from './structures'

// Save Positions
export let pos1 = new Map();
export let pos2 = new Map();
export let exe = world.getDimension("overworld")
export let pickBlock = 0;

// Manage Active Events
export let events = new Map();

// Toggle Tracker
let toggle = 0;

// Reset Players
exe.runCommand(`inputpermission set @a movement enabled`)

// Main Menu
function worldeditorMenu(player) {
	let form = new ActionFormData();
	form.title("§d§lWorld Editor Commands")
	form.button(`§a§l> §0§lBlock Set Commands`)
	form.button(`§a§l> §0§lStructure Commands`)
	form.button(`§a§l> §0§lSelection Commands`)
	form.button(`§a§l> §0§lBrush Commands`)
	form.button(`§a§l> §0§lTerrain Commands`)
	form.button(`§a§l> §0§lShapes Commands`)
	form.button(`§a§l> §0§lNavigation Commands`)
	form.button(`§a§l> §0§lInfo Commands`)
	form.button(`§a§l> §0§lDisable World Editor`)
	form.show(player).then(response => {

		if (response.selection == 0) {
			let form = new ActionFormData();
			form.title("§d§lWorld Editor Commands")
			form.button(`§a§l> §0§lSet Block`)
			form.button(`§a§l> §0§lReplace Block`)
			form.button(`§c§l> §0§lBack`)
			form.show(player).then(response => {

				if (!response.canceled && response.selection != 2) {
					if (!pos1.has(player.id) || !pos2.has(player.id)) {
						player.sendMessage(`§aYou must select two valid positions before using these commands.`)
						return;
					}
				}

				if (response.selection == 0) {
					blockset.setBlockMenu(player, pos1.get(player.id), pos2.get(player.id), exe);
				} else if (response.selection == 1) {
					blockset.setBlockReplaceMenu(player, pos1.get(player.id), pos2.get(player.id), exe);
				} else if (response.selection == 2) {
					worldeditorMenu(player)
				}

			})

		} else if (response.selection == 1){
			if (!response.canceled) {
				if (!pos1.has(player.id) || !pos2.has(player.id)) {
					player.sendMessage(`§aYou must select two valid positions before using these commands.`)
					return;
				}
			}
			sendStructuresMenu(player)
		} else if (response.selection == 2){
			let form = new ActionFormData();
			form.title("§d§lWorld Editor Commands")
			form.button(`§a§l> §0§lMask`)
			form.button(`§c§l> §0§lBack`)
			form.show(player).then(response => {
				if (response.selection == 0) {
					maskLib.sendMaskMenu(player)
				}  else if (response.selection == 1) {
					worldeditorMenu(player)
				}
			})
		} else if (response.selection == 3){
			
		} else if (response.selection == 4){
			
		} else if (response.selection == 5){
			
		} else if (response.selection == 6){
			
		} else if (response.selection == 7){
			
		} else if(response.selection == 8){
			toggle = 0;
			player.sendMessage(`§cWorld Editor Disabled`)
			world.beforeEvents.playerBreakBlock.unsubscribe(events.get(1))
			world.beforeEvents.playerInteractWithBlock.unsubscribe(events.get(2))
		}
	})
}

export function sendStructuresMenu(player){
	let form = new ActionFormData();
	form.title("§d§lWorld Editor Commands")
	form.button(`§a§l> §0§lUndo`)
	form.button(`§a§l> §0§lRedo`)
	form.button(`§a§l> §0§lCopy`)
	form.button(`§a§l> §0§lPaste`)
	form.button(`§a§l> §0§lCut`)
	form.button(`§a§l> §0§lRotate`)
	form.button(`§a§l> §0§lFlip`)
	form.button(`§a§l> §0§lChange Save Settings`)
	form.button(`§c§l> §0§lBack`)
	form.show(player).then(response => {
		if(response.selection == 0){
			actionManager.revertAction(player);
		} else if (response.selection == 1){
			actionManager.redoAction(player)
		} else if (response.selection == 2){
			let sections = blockset.createSections(pos1.get(player.id), pos2.get(player.id));
			struct.copyArea(player, sections);
		} else if (response.selection == 3){
			let blockTotal = blockset.getBlockTotal(pos1.get(player.id), pos2.get(player.id));
			struct.pasteArea(player, blockTotal)
		} else if (response.selection == 4){
			let sections = blockset.createSections(pos1.get(player.id), pos2.get(player.id));
			struct.cutArea(player, sections)
		} else if (response.selection == 5){
			struct.sendRotateMenu(player)
		} else if (response.selection == 6){
			struct.sendFlipMenu(player)
		} else if (response.selection == 7) {
			let form = new ModalFormData();
			form.title(`§d§lChange Save Settings`)
			form.toggle(`Include Blocks`, struct.includeBlocks)
			form.toggle(`Include Entities`, struct.includeEntities)
			form.show(player).then(response => {
				if(!response.canceled){
					struct.changeConfig(response.formValues[0], response.formValues[1])
				}
			})
		} else if (response.selection == 8) {
			worldeditorMenu(player)
		}
	})
}

export function setPickBlock(num){
	pickBlock = num;
}

// Axe & Main Command Menu
world.afterEvents.itemUse.subscribe(ev => {
	if (ev.source.hasTag("worldeditor") && ev.itemStack?.typeId.includes("we:world_editor") && toggle == 1 && pickBlock != 0) {
		
		if(ev.source.isSneaking){
			blockset.resetPermRecord(ev.source)
			ev.source.sendMessage(`§cSelection undone.`)
			return;
		}
		
		let block = ev.source.getBlockFromViewDirection({includeLiquidBlocks: true, includePassableBlocks: true, maxDistance: 6})
		if(block == undefined){
			block = "minecraft:air"
		} else {
			block = block.block.permutation
		}
		let blockPerm = block

		if(pickBlock == 1){
			blockset.setPickBlock(ev.source, blockPerm)
		} else if(pickBlock == 2){
			maskLib.setMask(ev.source, blockPerm)
			pickBlock = 0;
		}

	} else if (ev.source.hasTag("worldeditor") && ev.itemStack?.typeId.includes("we:world_editor") && toggle == 1) {
		ev.source.playSound("random.pop")
		worldeditorMenu(ev.source);
	} else if (ev.source.hasTag("worldeditor") && ev.itemStack?.typeId.includes("we:world_editor") && toggle == 0) {
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
function toggleEvents() {

	const eventBreak = world.beforeEvents.playerBreakBlock.subscribe(ev => {
		let checkRecord = ev.player.hasTag("record") || ev.player.hasTag("record_replace") || ev.player.hasTag("record_final")
		if (ev.player.hasTag("worldeditor") && ev.itemStack?.typeId.includes("wooden_axe") && checkRecord == false) {
			let loc = { x: ev.block.x, y: ev.block.y, z: ev.block.z }
			pos1.set(ev.player.id, loc);
			if (pos2.has(ev.player.id)) {

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
		let checkRecord = ev.player.hasTag("record") || ev.player.hasTag("record_replace") || ev.player.hasTag("record_final")
		if (checkRecord == false && ev.player.hasTag("worldeditor") && !interactCD.has(ev.player.id) && ev.itemStack?.typeId.includes("wooden_axe")) {
			interactCD.add(ev.player.id)
			let loc = { x: ev.block.x, y: ev.block.y, z: ev.block.z }
			pos2.set(ev.player.id, loc);

			if (pos1.has(ev.player.id)) {
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

const init = world.afterEvents.worldInitialize.subscribe(ev => {

	// Reset Undo Structures
	let structures = world.structureManager.getWorldStructureIds();
	for(let i = 0; i < structures.length; i++){
		if(structures[i].includes(`worldeditor`)){
			world.structureManager.delete(structures[i]);
		}
	}

	world.afterEvents.worldInitialize.unsubscribe(init);
})