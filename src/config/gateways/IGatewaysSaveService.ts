export interface IGatewaysSaveService {
    gatewayId: string;
    currState: string;
    search: string;
    gateway: iqs.shell.Gateway;
}
