
/* OLD CODE


import { world, system, BlockTypes } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

function worldeditorMenu(player){

	if(toggle == 1){
		let form = new ActionFormData();
		form.title("§aWorld Editor Commands")
		form.button(`§a§l> §0§lSet`)
		form.button(`§a§l> §0§lReplace`)
		form.button(`§a§l> §0§lShapes`)
		form.button(`§a§l> §0§lMask`)
		form.button(`§a§l> §0§lUndo`)
		form.button(`§a§l> §0§lBrush`)
		form.button(`§a§l> §0§lDisable World Editor`)
		form.show(player).then(response => {

			if(!response.canceled){
				if(response.selection == 0 || response.selection == 1){
					if(!pos1.has(player.id) || !pos2.has(player.id)){
						player.sendMessage(`§aYou must select two valid positions before using commands.`)
						return;
					}
				}
			}

			if(response.selection == 0){
				
			} else if(response.selection == 1){
				let form = new ModalFormData();
				form.title("Block Replace Function")
				form.textField("Replace Block ID: ", "", mask.get(player.id) ?? "???")
				form.textField("New Block ID: ", "", "???")
				form.slider("Percentage To Replace", 0, 100, 1, 100);
				form.show(player).then(response => {
					if(!response.canceled){

						if(response.formValues[0] == "???" || response.formValues[1] == "???"){
							player.sendMessage(`§aMissing Block ID`)
							return;
						}

						let findReplace = 0;

						let p1 = pos1.get(player.id)
						let p2 = pos2.get(player.id)
						let highX = Math.max(p2.x, p1.x);
						let highY = Math.max(p2.y, p1.y);
						let highZ = Math.max(p2.z, p1.z);
						let lowX = Math.min(p2.x, p1.x);
						let lowY = Math.min(p2.y, p1.y);
						let lowZ = Math.min(p2.z, p1.z);

						for(let i = lowX; i < highX+1;){
							for(let j = lowY; j < highY+1;){
								for(let k = lowZ; k < highZ+1;){
									// Change Block
									try{
										let replaceBlock = exe.getBlock({x: i, y: j, z: k}).typeId
										if(!mask.has(player.id)){
											if(replaceBlock.includes(response.formValues[0])){
												if(typeof Number(response.formValues[2]) == 'number'){
													let percentage = Number(response.formValues[2]);
													if(Math.random() < (percentage/100)){
														findReplace += 1;
														if(findReplace % 10000 == 1){
															player.teleport({x: i, y: j, z: k})
														}
														exe.runCommand(`fill ${i} ${j} ${k} ${i} ${j} ${k} ${response.formValues[1]}`)
													}
												} else {
													player.sendMessage(`§aPercent value is not a number!`)
													return;
												}
											}
										} else {
											if(replaceBlock.includes(mask.get(player.id))){
												if(replaceBlock.includes(response.formValues[0])){
													if(typeof Number(response.formValues[2]) == 'number'){
														let percentage = Number(response.formValues[2]);
														if(Math.random() < (percentage/100)){
															findReplace += 1;
															if(findReplace % 10000 == 1){
																player.teleport({x: i, y: j, z: k})
															}
															exe.runCommand(`fill ${i} ${j} ${k} ${i} ${j} ${k} ${response.formValues[1]}`)
														}
													} else {
														player.sendMessage(`§aPercent value is not a number!`)
														return;
													}
												}
											}
										}
									} catch(e){
										player.sendMessage(`§aInvalid Block ID`)
										return;
									}
									k += 1;
								}
								j += 1;
							}
							i += 1;
						}
						player.teleport({x: highX, y: highY, z: highZ})
						player.sendMessage(`§a${findReplace} blocks was set from ${response.formValues[0]} to ${response.formValues[1]}`)
					}
				})
			} else if(response.selection == 2){
				let form = new ActionFormData();
				form.title(`Shape Functions`)
				form.button(`§a§l> §0§lCreate Sphere`)
				form.button(`§a§l> §0§lCreate Circle`)
				form.button(`§a§l> §0§lCreate Square`)
				form.button(`§a§l> §0§lCreate Cube`)
				form.show(player).then(response => {
					if(response.selection == 0){
						let form = new ModalFormData();
						form.title("Shape Function: Sphere")
						form.textField("Block ID: ", "")
						form.slider("Sphere Size", 1, 25, 1, 5);
						form.toggle("Filled", false);
						form.show(player).then(response => {
							if(!response.canceled){
								// Change Block

								if(typeof Number(response.formValues[1]) == 'number'){
									let radius = Number(response.formValues[1])
									let posx = player.location.x
									let posy = player.location.y
									let posz = player.location.z
									for (let y = posy - radius; y < posy + radius + 1; y++) {
										for (let x = posx - radius; x < posx + radius + 1; x++) {
											for (let z = posz - radius; z < posz + radius + 1; z++) {
												let dist = ((posx - x) ** 2 + (posy - y) ** 2 + (posz - z) ** 2) ** 0.5
												if(response.formValues[2] == false){
													if ((dist - radius) ** 2 < 0.5) {
														exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} ${response.formValues[0]}`)
													}
												} else {
													if (dist-0.5 <= radius) {
														exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} ${response.formValues[0]}`)
													}
												}
											}
										}
									}
									player.teleport({x: posx, y: posy+radius+1, z: posz})
									player.sendMessage(`§aA ${response.formValues[0]} sphere with a size of ${radius} was placed.`)
								}
							}
						})
					} else if(response.selection == 1){
						let form = new ModalFormData();
						form.title("Shape Function: Circle")
						form.textField("Block ID: ", "")
						form.slider("Circle Size", 1, 25, 1, 5);
						form.toggle("Filled", false);
						form.show(player).then(response => {
							if(!response.canceled){
								// Change Block
								if(typeof Number(response.formValues[1]) == 'number'){
									let radius = Number(response.formValues[1])
									let posx = player.location.x
									let posy = player.location.y
									let posz = player.location.z
									let y = posy
									for (let x = posx - radius; x < posx + radius + 1; x++) {
										for (let z = posz - radius; z < posz + radius + 1; z++) {
											let dist = ((posx - x) ** 2 + (posy - y) ** 2 + (posz - z) ** 2) ** 0.5
											if(response.formValues[2] == false){
												if ((dist - radius) ** 2 < 0.5) {
													exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} ${response.formValues[0]}`)
												}
											} else {
												if (dist-0.5 <= radius) {
													exe.runCommand(`fill ${x} ${y} ${z} ${x} ${y} ${z} ${response.formValues[0]}`)
												}
											}
										}
									}
									player.teleport({x: posx, y: posy+radius+1, z: posz})
									player.sendMessage(`§aA ${response.formValues[0]} circle with a size of ${radius} was placed.`)
								}
							}
						})
					} else if(response.selection == 2){
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
						})
					} else if(response.selection == 3){
						let form = new ModalFormData();
						form.title("Shape Function: Cube")
						form.textField("Block ID: ", "")
						form.slider("Cube Size", 1, 25, 1, 5);
						form.toggle("Filled", false);
						form.show(player).then(response => {
							if(!response.canceled){
								// Change Block
								if(typeof Number(response.formValues[1]) == 'number'){
									let radius = Number(response.formValues[1])
									let lowX = player.location.x - radius
									let lowY = player.location.y - radius
									let lowZ = player.location.z - radius
									let maxX = player.location.x + radius
									let maxY = player.location.y + radius
									let maxZ = player.location.z + radius

									if(response.formValues[2] == false){
										exe.runCommand(`fill ${lowX} ${lowY} ${lowZ} ${maxX} ${lwoY} ${maxZ} ${response.formValues[0]}`)
										exe.runCommand(`fill ${lowX} ${maxY} ${lowZ} ${maxX} ${maxY} ${maxZ} ${response.formValues[0]}`)
										exe.runCommand(`fill ${lowX} ${lowY} ${lowZ} ${lowX} ${maxY} ${maxZ} ${response.formValues[0]}`)
										exe.runCommand(`fill ${lowX} ${lowY} ${lowZ} ${maxX} ${maxY} ${lowZ} ${response.formValues[0]}`)
										exe.runCommand(`fill ${maxX} ${lowY} ${maxZ} ${maxX} ${maxY} ${lowZ} ${response.formValues[0]}`)
										exe.runCommand(`fill ${maxX} ${lowY} ${maxZ} ${lowX} ${maxY} ${maxZ} ${response.formValues[0]}`)
									} else {
										for(let i = lowX; i < maxX+1;){
											for(let j = lowY; j < maxY+1;){
												for(let k = lowZ; k < maxZ+1;){
													exe.runCommand(`fill ${i} ${j} ${k} ${i} ${j} ${k} ${response.formValues[0]}`)
													k += 1;
												}
												j += 1;
											}
											i += 1;
										}
									}

									player.teleport({x: player.location.x, y: maxY+1, z: player.location.z})
									player.sendMessage(`§aA ${response.formValues[0]} cube with a size of ${radius} was placed.`)
								}
							}
						})
					}
				})
			} else if(response.selection == 3){
				let form = new ActionFormData();
				form.title("§aBlock Mask Function")
				form.button(`§a§l> §0§lSet Mask`)
				form.button(`§a§l> §0§lRemove Mask`)
				form.show(player).then(response => {
					if(response.selection == 0){
						let form = new ModalFormData();
						form.title("Block Mask Function")
						form.textField("Block Mask ID: ", "")
						form.show(player).then(response => {
							if(!response.canceled){
								mask.set(player.id, response.formValues[0])
								player.sendMessage(`§aBlock ID "${response.formValues[0]}" is now being masked for the set and replace commands`)
							}
						})
					} else if(response.selection == 1){
						mask.delete(player.id)
						player.sendMessage(`§aMask removed`)
					}
				})
			} else if(response.selection == 4){
				player.sendMessage(`§aThis command does not work currently work.`)
				
				if(playerLogID.has(player.id)){
					if(playerLogID.get(player.id) > 0){
							let log = changeLog.get(player.id);
							let replaceBlocks = 0;
							for(let i = 0; i < log.length; i++){
								if(log[i].ID == playerLogID.get(player.id)){
									let oldBlock = log[i].oldBlock
									let x = oldBlock.x;
									let y = oldBlock.y;
									let z = oldBlock.z;
									let permutation = oldBlock.permutation
									exe.fillBlocks({x: x, y: y, z: z}, {x: x, y: y, z: z}, permutation)
									replaceBlocks += 1;
								}
							}
							playerLogID.set(player.id, playerLogID.get(player.id)-1)
							player.sendMessage(`§aAction Undone §7§o[${replaceBlocks} block change(s)]`)
							player.sendMessage(`§cOnly the §e"Set" §ccommand is supported.`)

					} else {
						player.sendMessage(`§aThere is nothing to undo`)
					}
				} else {
					player.sendMessage(`§aThere is nothing to undo`)
				}
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
}*/
