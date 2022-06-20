/* tracing.js */

// Require dependencies
const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
//const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-grpc');

/*
const collectorOptions = {
  // url is optional and can be omitted - default is http://localhost:4317
  url: 'http://localhost:4317',
  credentials: grpc.credentials.createSsl(),
};
*/

const exporter = new OTLPTraceExporter();
/*
const exporter = new OTLPTraceExporter({
  // optional - url default value is http://localhost:55681/v1/traces
  url: 'http://localhost:4318/v1/traces',

  // optional - collection of custom headers to be sent with each request, empty by default
  headers: { "Content-Type": "application/json" }, 
});
*/

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()]
});
sdk.start()
