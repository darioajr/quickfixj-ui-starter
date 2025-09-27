// Tipos para sessões FIX
export interface FixSession {
  id: string;
  sessionID: string;
  targetCompID: string;
  senderCompID: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
  connectionType: 'INITIATOR' | 'ACCEPTOR';
  loggedIn: boolean;
  creationTime: Date;
  lastMessageTime?: Date;
  messagesSent: number;
  messagesReceived: number;
  sequenceNumberSent: number;
  sequenceNumberReceived: number;
  heartbeatInterval: number;
  version: string;
  host?: string;
  port?: number;
  errorMessage?: string;
}

// Tipos para configuração
export interface FixConfiguration {
  id: string;
  name: string;
  sessionType: 'INITIATOR' | 'ACCEPTOR';
  beginString: string;
  senderCompID: string;
  targetCompID: string;
  heartBtInt: number;
  connectionSettings: ConnectionSettings;
  sessionSettings: SessionSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionSettings {
  socketConnectHost?: string;
  socketConnectPort?: number;
  socketAcceptHost?: string;
  socketAcceptPort?: number;
  reconnectInterval?: number;
  logonTimeout?: number;
  logoutTimeout?: number;
}

export interface SessionSettings {
  startTime?: string;
  endTime?: string;
  weekdays?: string;
  useDataDictionary?: boolean;
  dataDictionary?: string;
  validateUserDefinedFields?: boolean;
  validateIncomingMessage?: boolean;
  validateOutgoingMessage?: boolean;
  checkCompID?: boolean;
  checkLatency?: boolean;
  maxLatency?: number;
  logDirectory?: string;
  fileLogPath?: string;
  includeMillisInTimeStamp?: boolean;
}

// Tipos para mensagens FIX
export interface FixMessage {
  id: string;
  sessionID: string;
  direction: 'INBOUND' | 'OUTBOUND';
  messageType: string;
  messageTypeDescription: string;
  rawMessage: string;
  parsedFields: FixField[];
  timestamp: Date;
  sequenceNumber: number;
  isValid: boolean;
  validationErrors?: string[];
}

export interface FixField {
  tag: number;
  name: string;
  value: string;
  description?: string;
  isRequired: boolean;
  isUserDefined: boolean;
}

// Tipos para estatísticas
export interface SessionStatistics {
  sessionID: string;
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  lastHeartbeat?: Date;
  messagesByType: Record<string, number>;
  hourlyStats: HourlyStats[];
}

export interface HourlyStats {
  hour: number;
  messageCount: number;
  errorCount: number;
  averageLatency: number;
}

// Tipos para alertas e notificações
export interface FixAlert {
  id: string;
  sessionID: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  timestamp: Date;
  isAcknowledged: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Tipos de API Response
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}