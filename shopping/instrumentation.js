const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

// 1. Cấu hình gửi dữ liệu tới Jaeger qua gRPC
const traceExporter = new OTLPTraceExporter({
  // 'jaeger' là tên service chúng ta sẽ đặt trong docker-compose.yml
  url: 'http://jaeger:4317', 
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'shopping', // Tên ứng dụng hiển thị trên Jaeger
});

sdk.start();