# QuickFix/J Session Monitor UI

Um Spring Boot Starter para **monitoramento** de sessões QuickFIX/J existentes com interface web moderna.

## 🎯 Propósito

Este projeto é uma **UI de monitoramento** que:

✅ **Detecta automaticamente** sessões de projetos externos  
✅ **Não cria** suas próprias sessões QuickFIX/J  
✅ **Lê dados** do registry global do QuickFIX/J  
✅ **Fornece endpoints REST** para a UI React  
✅ **Envia atualizações em tempo real** via WebSocket  

### O que NÃO faz

❌ **Não implementa** `quickfix.Application`  
❌ **Não cria** `SocketInitiator` ou `SocketAcceptor`  
❌ **Não gerencia** conexões FIX  
❌ **Não processa** mensagens FIX diretamente  

## 🚀 Como Funciona

1. **Plugin inicia** como Spring Boot starter
2. **Detecta automaticamente** projetos QuickFIX/J no contexto Spring
3. **UI mostra** sessões ativas encontradas
4. **WebSocket envia** atualizações em tempo real
5. **Usuário pode configurar** para monitorar projetos externos

## 📋 Pré-requisitos

- Java 21+
- Node.js 22+ (para desenvolvimento do frontend)
- Projetos com QuickFIX/J já configurados e executando

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│  Spring Boot API │◄──►│ QuickFIX/J      │
│                 │    │                  │    │ Sessions        │
│ - Sessions View │    │ - Monitoring     │    │ (External)      │
│ - Real-time     │    │ - WebSocket      │    │ - Registry      │
│   Updates       │    │ - REST API       │    │ - Beans         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## ⚙️ Configuração

### application.properties

```properties
# Habilitar monitoramento
quickfixj.monitoring.enabled=true

# Intervalo de atualização (ms)
quickfixj.monitoring.refresh-interval=5000

# Notificações WebSocket
quickfixj.monitoring.websocket-notifications=true

# Caminhos para configurações externas (opcional)
quickfixj.monitoring.external-config-paths=/path/to/external/configs
```

## 📡 API Endpoints

### Monitoramento de Sessões
- `GET /api/fix/sessions` - Lista todas as sessões detectadas
- `GET /api/fix/sessions/status` - Status detalhado das sessões
- `POST /api/fix/sessions/refresh` - Força atualização do monitoramento

### Configuração Externa
- `POST /api/fix/config/load-project` - Carrega configuração de projeto externo
- `POST /api/fix/config/load-directory` - Carrega configurações de diretório
- `POST /api/fix/config/monitor-project` - Configura monitoramento de projeto

### WebSocket
- `/ws` - Endpoint de conexão WebSocket
- `/topic/sessions` - Lista de sessões
- `/topic/session-status` - Atualizações de status

## 🖥️ Interface Web

Acesse `http://localhost:8080` para a interface web que mostra:

- **Dashboard** com visão geral das sessões
- **Sessões** com status detalhado em tempo real
- **Configurações** para monitoramento de projetos externos
- **Mensagens** (somente visualização, não envia)

## 🔧 Desenvolvimento

### Executar o Backend
```bash
mvn spring-boot:run
```

### Executar o Frontend (desenvolvimento)
```bash
cd src/frontend
npm install
npm run dev
```

### Build Completo
```bash
mvn clean package
```

## 📦 Usar como Dependência

Adicione ao seu `pom.xml`:

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>quickfixj-ui-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

O monitoramento será automaticamente habilitado quando o starter detectar sessões QuickFIX/J no contexto.

## 🤝 Integração com Projetos Existentes

Este starter funciona de forma **não invasiva** com projetos QuickFIX/J existentes:

1. **Adicione a dependência** ao seu projeto
2. **Configure as propriedades** (opcional)
3. **Acesse a UI** em `http://localhost:8080`
4. **Suas sessões aparecerão automaticamente** na interface

## 📊 Monitoramento

O starter monitora:

- **Status de conexão** das sessões
- **Estado de logon/logout**
- **Informações de sessão** (CompIDs, versão FIX)
- **Contadores de mensagens** (quando disponível)
- **Última atividade**

## 🔍 Detecção de Sessões

O sistema detecta sessões através de:

1. **Registry global** do QuickFIX/J
2. **Beans Spring** (`SocketInitiator`, `SocketAcceptor`)
3. **Reflection** para acessar sessões internas
4. **Configurações externas** especificadas

## 🆘 Resolução de Problemas

### Sessões não aparecem
- Verifique se as sessões estão ativas e registradas
- Confirme que o contexto Spring contém os beans QuickFIX/J
- Ative logs debug: `logging.level.com.example.quickfixj=DEBUG`

### WebSocket não funciona
- Verifique a configuração de CORS
- Confirme que WebSocket está habilitado
- Teste a conectividade na URL `/ws`

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [guia de contribuição](CONTRIBUTING.md) antes de enviar PRs.

## 📞 Suporte

Para suporte e discussões:
- Abra uma [issue](https://github.com/darioajr/quickfixj-ui-starter/issues)
- Entre em contato via [email](mailto:support@example.com)