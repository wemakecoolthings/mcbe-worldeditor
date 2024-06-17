import { world, system } from '@minecraft/server';
import * as wmctevents from './events'

let brush = new Map();
let brushRadius = new Map();
let brushOpt1 = new Map();
let brushOpt2 = new Map();
let brushMode = new Set();

// In-Progress

export function brush(player) {
	if (player.hasTag("worldeditor") && ev.itemStack.typeId.includes("we:world_editor") && toggle == 1 && brushMode.has(player.id) && player.isSneaking) {
		brushMode.delete(player.id);
		player.sendMessage(`§aBrush mode disabled`)
	} else if (player.hasTag("worldeditor") && ev.itemStack.typeId.includes("we:world_editor") && toggle == 1 && brushMode.has(player.id)) {
		try {
			if (!brushOpt1.has(player.id)) {
				brushOpt1.set(player.id, false)
			}
			if (!brushOpt2.has(player.id)) {
				brushOpt2.set(player.id, false)
			}
			let lookPos = player.getBlockFromViewDirection({ includeLiquidBlocks: brushOpt1.get(player.id), includePassableBlocks: brushOpt2.get(player.id) })
			let posx = lookPos.block.x
			let posy = lookPos.block.y
			let posz = lookPos.block.z
			let radius = brushRadius.get(player.id) ?? 5;
			for (let y = posy - radius; y < posy + radius + 1; y++) {
				for (let x = posx - radius; x < posx + radius + 1; x++) {
					for (let z = posz - radius; z < posz + radius + 1; z++) {
						let dist = ((posx - x) ** 2 + (posy - y) ** 2 + (posz - z) ** 2) ** 0.5
						if (dist - 0.5 <= radius) {
							if (!mask.has(player.id)) {
								if (brush.has(player.id)) {
									let randomBlockFromGradient = Math.floor(Math.random() * brush.get(player.id).length);
									let block = brush.get(player.id)[randomBlockFromGradient][0]
									let weight = brush.get(player.id)[randomBlockFromGradient][1]
									while (weight / 100 < Math.random()) {
										randomBlockFromGradient = Math.floor(Math.random() * brush.get(player.id).length);
										block = brush.get(player.id)[randomBlockFromGradient][0]
										weight = brush.get(player.id)[randomBlockFromGradient][1]
									}
									exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} ${block}`)
								} else {
									exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} minecraft:stone`)
								}
							} else {
								let replaceBlock = exe.getBlock({ x: x, y: y, z: z }).typeId
								if (replaceBlock.includes(mask.get(player.id))) {
									if (brush.has(player.id)) {
										let randomBlockFromGradient = Math.floor(Math.random() * brush.get(player.id).length);
										let block = brush.get(player.id)[randomBlockFromGradient][0]
										let weight = brush.get(player.id)[randomBlockFromGradient][1]
										while (weight / 100 < Math.random()) {
											randomBlockFromGradient = Math.floor(Math.random() * brush.get(player.id).length);
											block = brush.get(player.id)[randomBlockFromGradient][0]
											weight = brush.get(player.id)[randomBlockFromGradient][1]
										}
										exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} ${block}`)
									} else {
										exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} minecraft:stone`)
									}
								}
							}
						}
					}
				}
			}
		} catch (e) {
			player.sendMessage(`§a${e}`)
			return;
		}
	}
}