import { Service, ServiceBroker } from "moleculer";
import ApiGateway from "moleculer-web"
export class ApiService extends Service {
    constructor(broker: ServiceBroker) {
        super(broker)
        this.parseServiceSchema({
            name: "api",
            version: "v1",
            meta: {
                scalable: false,
            },

            dependencies: [],
            settings: {
                // port: 3040,
                server : false,
                cors: {
                    origin: "*",
                    methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
                    maxAge: 3600, allowedHeaders: [
                        "Content-Type",
                        "Authorization",
                        "X-Requested-With",
                        "Accept",
                        "Origin",
                        "Access-Control-Allow-Origin",
                        "Access-Control-Allow-Headers",
                        "Access-Control-Allow-Methods"
                    ],
                    exposedHeaders: ["Content-Range", "X-Content-Range"]
                },
                routes: [{
                    // path: '/api',
                    bodyParsers: {
                        json: true,
                        urlencoded: { extended: true }
                    },
                    async onBeforeCall(ctx: any, route: any, req: any, res: any) {
                        ctx.meta.headers = req.headers
                    },
                }],
            },
            actions: {

            },
            mixins: [ApiGateway],
            events: {},
            created: this.serviceCreated,
            started: this.serviceStarted,
            stopped: this.serviceStopped
        })
    }
    async serviceCreated() {
        console.log("Molecular api gateway service Created")
    }
    serviceStarted() {
        console.log("Molecular api gateway service Started")
    }
    serviceStopped() {
        console.log("Molecular api gateway service Stopped")
    }
}