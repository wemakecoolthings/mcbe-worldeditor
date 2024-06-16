import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

export let mask = new Map();

export function setMask(player){
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
					player.sendMessage(`§aBlock ID "${response.formValues[0]}" is now being masked`)
				}
			})
		} else if(response.selection == 1){
			mask.delete(player.id)
			player.sendMessage(`§aMask removed`)
		}
    })
}