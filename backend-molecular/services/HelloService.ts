import { Context, Service, ServiceBroker } from "moleculer";

export class HelloService extends Service {
    constructor(broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: "hello",
            actions: {
                sayhello(ctx: Context) {
                    return "Hello from Moleculer!";
                }
            }
        });
    }
}
