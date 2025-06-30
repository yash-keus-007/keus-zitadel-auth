import express from "express";
import { ServiceBroker } from "moleculer";
import authRouter from "./routes/auth.router";
import { HelloService } from "./services/HelloService";
import dotenv from 'dotenv';
import { ApiService } from "./services/ApiService";
import { DashboardService } from "./services/DashboardService";

dotenv.config()
const app = express();

app.use(express.json());
app.use(require("cors")());
app.use(require("morgan")("dev"));


const broker = new ServiceBroker({ nodeID: "node-1", transporter: null });
const apiService = broker.createService(ApiService)
app.use("/auth", authRouter);
app.use("/api",apiService.express())

broker.createService(HelloService);
broker.createService(DashboardService)

broker.createService({
  name: "api",
  mixins: [ApiService],
  settings: {
    path: "/api",
    routes: [
      {
        path: "/",
        mappingPolicy: "all"
      }
    ]
  }
});

broker.start().then(() => {
  app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
  });
});
