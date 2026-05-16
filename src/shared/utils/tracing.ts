import { NodeSDK } from '@opentelemetry/sdk-node'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { config } from '@/main/config/config'

if (config.nodeEnv !== 'production') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)
}

const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: config.otel.serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: config.otel.serviceVersion,
})

const traceExporter = new OTLPTraceExporter({
  url: config.otel.tracesUrl,
})

const metricExporter = new OTLPMetricExporter({
  url: config.otel.metricsUrl,
})

const logExporter = new OTLPLogExporter({
  url: `${config.otel.collectorUrl}v1/logs`,
})

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10000,
    }),
  ],
  // Registers the LoggerProvider globally so Winston's OpenTelemetryTransportV3
  // forwards log records to Loki via OTLP with trace_id correlation
  logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
console.info('OpenTelemetry SDK started')

process.on('SIGTERM', async () => {
  await sdk.shutdown()
  process.exit(0)
})
