graph TD
    %% Clients
    User((Usuário/Paciente)) --> |Mobile/Web| App[App React Native / Web]
    Caregiver((Cuidador)) --> |Acompanhamento| App

    subgraph "Backend (Node.js + Fastify)"
        API[API Server - Fastify]
        UC[Use Cases: Create Prescription, Mark Adherence, etc]
        DI[Dependency Injection - tsyringe]
        
        API --> DI
        DI --> UC
    end

    subgraph "Persistence & Messaging"
        DB[(PostgreSQL - Drizzle ORM)]
        Queue[(Redis - BullMQ)]
    end

    subgraph "Background Processing"
        Worker[Worker: Dose Event Generator]
        Notifier[Worker: Notification Dispatcher]
    end

    %% Flow
    UC --> |Salva Dados| DB
    UC --> |Agenda Jobs| Queue
    Queue --> Worker
    Queue --> Notifier

    %% External
    Notifier --> |Push Notification| Push[FCM / APNs]
    Worker --> |Gera próximos eventos| DB
    
    subgraph "Observability"
        OTel[OpenTelemetry]
        Logs[Winston Logger]
    end

    API -.-> OTel
    Worker -.-> OTel

    subgraph "Future Integrations"
        Reporting[Reporting Service - PDF/CSV]
        ExternalWebhooks[Webhooks Externos]
    end

    UC --> Reporting
    Reporting --> |Export| User
    Push --> |Delivery Status| ExternalWebhooks
    ExternalWebhooks --> API
