import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import * as editor from './main'

export let mask = new Map();

export function setMask(player, maskedBlock){
	mask.set(player.id, maskedBlock)
	player.sendMessage(`§aBlock ID "${maskedBlock.type.id}" §d(with NBT) §ais now being masked`)
}

export function sendMaskMenu(player){
    let form = new ActionFormData();
	form.title("§aBlock Mask Function")
	form.button(`§a§l> §0§lSet Mask`)
	form.button(`§a§l> §0§lRemove Mask`)
	form.show(player).then(response => {
		if(response.selection == 0){
			let form = new ActionFormData();
			form.title("§aBlock Mask Function")
			form.button(`§a§l> §r§lType a Block ID!`)
    		form.button(`§a§l> §r§lUse "Pick Block" Tool!`)
			form.show(player).then(response => {
				if(response.selection == 0){
					let form = new ModalFormData();
					form.title("Block Mask Function")
					form.textField("Block Mask ID: ", "")
					form.show(player).then(response => {
						if(!response.canceled){
							mask.set(player.id, response.formValues[0])
							player.sendMessage(`§aBlock ID "${response.formValues[0]}" is now being masked`)
						}
					})
				} else if(response.selection == 1){
					editor.setPickBlock(2)
            		player.sendMessage(`§aUse worldeditor to grab block!`);
				}
			})
		} else if(response.selection == 1){
			mask.delete(player.id)
			player.sendMessage(`§aMask removed`)
		}
    })
}