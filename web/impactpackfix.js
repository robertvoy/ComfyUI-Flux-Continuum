import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Comfy.Impact",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if(nodeData.name == "ImpactControlBridge") {
            const onConnectionsChange = nodeType.prototype.onConnectionsChange;
            nodeType.prototype.onConnectionsChange = function (type, index, connected, link_info) {
                if(index != 0 || !link_info || this.inputs[0].type != '*')
                    return;

                // assign type
                let slot_type = '*';

                if(type == 2) {
                    slot_type = link_info.type;
                }
                else {
                    const node = app.graph.getNodeById(link_info.origin_id);
                    slot_type = node.outputs[link_info.origin_slot].type;
                }

                this.inputs[0].type = slot_type;
                this.outputs[0].type = slot_type;
                this.outputs[0].label = slot_type;
            }
        }
    }
});