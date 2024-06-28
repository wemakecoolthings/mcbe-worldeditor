import { world, system } from '@minecraft/server';
import * as wmctevents from './events'

let brush = new Map();
let brushRadius = new Map();
let brushOpt1 = new Map();
let brushOpt2 = new Map();
let brushMode = new Set();



// In-Progress
/*
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
	

OLD CODE

			} else if(response.selection == 5){
				let form = new ActionFormData();
				form.title("§aBlock Brush Function")
				form.button(`§a§l> §0§lSet Gradiant`)
				form.button(`§a§l> §0§lSet Radius`)
				form.button(`§a§l> §0§lBrush Options`)
				form.button(`§a§l> §0§lEnable Brush Mode`)
				form.show(player).then(response => {
					if(response.selection == 0){
						let form = new ModalFormData();
						form.title("Block Brush Function")
						form.slider("Number of Blocks in Gradient: ", 1, 10, 1)
						form.show(player).then(response1 => {
							if(!response1.canceled){
								let form = new ModalFormData();
								form.title("Block Brush Function")
								for(let i = 0; i < response1.formValues[0]; i++){
									form.textField(`Block Mask ID ${i+1}: `, "")
									form.slider(`Block Mask ID ${i+1} Weight: `, 0, 100, 1, 100)
								}
								form.show(player).then(response2 => {
									if(!response2.canceled){
										let gradient = [];
										for(let i = 0; i < response1.formValues[0]*2; i += 2){
											gradient.push([response2.formValues[i], response2.formValues[i+1]]);
											player.sendMessage(`§aSet gradient: \nBlock: ${response2.formValues[i]}\nWeight: ${response2.formValues[i+1]}\n---`)
										}
										brush.set(player.id, gradient)
									}
								})
							}
						})
					} else if(response.selection == 1){
						let form = new ModalFormData();
						form.title("Block Brush Function")
						form.slider("Brush Radius: ", 1, 6, 1)
						form.show(player).then(response1 => {
							if(!response1.canceled){
								brushRadius.set(player.id, response1.formValues[0])
								player.sendMessage(`§aBrush radius was set to ${response1.formValues[0]}`)
							}
						})
					} else if(response.selection == 2){
						if(!brushOpt1.has(player.id) || !brushOpt2.has(player.id)){
							brushOpt1.set(player.id, false)
							brushOpt2.set(player.id, false)
						}

						let form = new ModalFormData();
						form.title("Block Brush Function")
						form.toggle("Include Liquid Blocks\n - i.e Lava or Water", brushOpt1.get(player.id))
						form.toggle("Include Passable Blocks\n - i.e Flowers or Vines", brushOpt2.get(player.id))
						form.show(player).then(response => {
							if(!response.canceled){
								brushOpt1.set(player.id, response.formValues[0])
								brushOpt2.set(player.id, response.formValues[1])

								let opt1 = "§cDisabled"
								let opt2 = "§cDisabled"
								if(brushOpt1.get(player.id) == true){
									opt1 = "§aEnabled"
								}
								if(brushOpt2.get(player.id) == true){
									opt2 = "§aEnabled"
								}

								player.sendMessage(`§aInclude Liquid Blocks: ${opt1}\n§aInclude Passable Blocks: ${opt2}`)
							}
						})
					} else if(response.selection == 3){
						brushMode.add(player.id);
						player.sendMessage(`§aRight click the World Editor to use brush\n§aCrouch + right click to disable brush mode`)
					}
				})
			} else if(response.selection == 6){
				toggle = 0;
				player.sendMessage(`§cWorld Editor Disabled`)
				world.beforeEvents.playerBreakBlock.unsubscribe(events.get(1))
			}
		})
	}
}


*/