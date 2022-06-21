#!/usr/bin/env python
import os
import sys
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry import trace
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


resource = Resource(attributes={
    SERVICE_NAME: "thegym-microservice-messageduplicator"
})

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://127.0.0.1:4317"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

if __name__ == '__main__':

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MessageDuplicator.settings')

    DjangoInstrumentor().instrument()

    try:

        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

