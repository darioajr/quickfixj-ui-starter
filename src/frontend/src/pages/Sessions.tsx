import React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Label,
  Spinner,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@patternfly/react-table';
import {
  PlayIcon,
  StopIcon,
  RedoIcon,
  ConnectedIcon,
} from '@patternfly/react-icons';
import { useSessions } from '../hooks/useSessions';

const Sessions: React.FC = () => {
  const { sessions, loading, startSession, stopSession, resetSession, refetch } = useSessions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'green';
      case 'DISCONNECTED':
        return 'orange';
      case 'ERROR':
        return 'red';
      case 'RECONNECTING':
        return 'blue';
      default:
        return 'grey';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <PageSection style={{ 
        padding: '1.5rem', 
        backgroundColor: '#fff', 
        height: '100%', 
        width: '100%',
        overflow: 'auto',
        margin: 0
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner size="lg" />
          <p>Carregando sessões...</p>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection style={{ 
      padding: '1.5rem', 
      backgroundColor: '#fff', 
      height: '100%', 
      width: '100%',
      overflow: 'auto',
      margin: 0
    }}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Title headingLevel="h1" size="xl">
              Sessões FIX
            </Title>
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Button variant="secondary" onClick={refetch}>
              Atualizar
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Card>
        <CardBody>
          {sessions.length === 0 ? (
            <EmptyState>
              <ConnectedIcon style={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Title headingLevel="h4" size="lg">
                Nenhuma sessão encontrada
              </Title>
              <EmptyStateBody>
                Não há sessões FIX configuradas no momento.
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <Table aria-label="Sessões FIX">
              <Thead>
                <Tr>
                  <Th>Session ID</Th>
                  <Th>Sender</Th>
                  <Th>Target</Th>
                  <Th>Tipo</Th>
                  <Th>Status</Th>
                  <Th>Versão</Th>
                  <Th>Mensagens</Th>
                  <Th>Última Atividade</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sessions.map((session) => (
                  <Tr key={session.id}>
                    <Td>{session.sessionID}</Td>
                    <Td>{session.senderCompID}</Td>
                    <Td>{session.targetCompID}</Td>
                    <Td>
                      <Label color={session.connectionType === 'INITIATOR' ? 'blue' : 'green'}>
                        {session.connectionType}
                      </Label>
                    </Td>
                    <Td>
                      <Label color={getStatusColor(session.status)}>
                        {session.status}
                      </Label>
                    </Td>
                    <Td>{session.version}</Td>
                    <Td>
                      <div>
                        <div>↑ {session.messagesSent}</div>
                        <div>↓ {session.messagesReceived}</div>
                      </div>
                    </Td>
                    <Td>
                      {session.lastMessageTime 
                        ? formatDate(session.lastMessageTime)
                        : 'Nunca'
                      }
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {session.status !== 'CONNECTED' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<PlayIcon />}
                            onClick={() => startSession(session.id)}
                          >
                            Iniciar
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<StopIcon />}
                            onClick={() => stopSession(session.id)}
                          >
                            Parar
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RedoIcon />}
                          onClick={() => resetSession(session.id)}
                        >
                          Reset
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Informações adicionais */}
      {sessions.length > 0 && (
        <Card style={{ marginTop: '1rem' }}>
          <CardBody>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '1rem' }}>
              Resumo
            </Title>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <strong>Total de Sessões:</strong> {sessions.length}
              </div>
              <div>
                <strong>Conectadas:</strong> {sessions.filter(s => s.status === 'CONNECTED').length}
              </div>
              <div>
                <strong>Desconectadas:</strong> {sessions.filter(s => s.status === 'DISCONNECTED').length}
              </div>
              <div>
                <strong>Com Erro:</strong> {sessions.filter(s => s.status === 'ERROR').length}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </PageSection>
  );
};

export default Sessions;