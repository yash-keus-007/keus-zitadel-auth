import { BrokerOptions } from 'moleculer';

const brokerConfig: BrokerOptions = {
  nodeID: 'node-ts-1',
  transporter: null,
  logger: true,
  logLevel: 'info'
};

export = brokerConfig;
