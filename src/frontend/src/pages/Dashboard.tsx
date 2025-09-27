import React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Grid,
  GridItem,
  Gallery,
  GalleryItem,
} from '@patternfly/react-core';
import {
  ConnectedIcon,
  DisconnectedIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useSessions } from '../hooks/useSessions';

const Dashboard: React.FC = () => {
  const { sessions, loading } = useSessions();

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
        <Title headingLevel="h1" size="xl">
          Dashboard
        </Title>
        <p>Carregando...</p>
      </PageSection>
    );
  }

  const connectedSessions = sessions.filter(s => s.status === 'CONNECTED');
  const disconnectedSessions = sessions.filter(s => s.status === 'DISCONNECTED');
  const errorSessions = sessions.filter(s => s.status === 'ERROR');
  const totalMessages = sessions.reduce((acc, s) => acc + s.messagesSent + s.messagesReceived, 0);

  const statsCards = [
    {
      title: 'Sessões Conectadas',
      value: connectedSessions.length,
      icon: <ConnectedIcon style={{ color: 'green', fontSize: '2rem' }} />,
      color: 'green',
    },
    {
      title: 'Sessões Desconectadas',
      value: disconnectedSessions.length,
      icon: <DisconnectedIcon style={{ color: 'orange', fontSize: '2rem' }} />,
      color: 'orange',
    },
    {
      title: 'Sessões com Erro',
      value: errorSessions.length,
      icon: <ExclamationTriangleIcon style={{ color: 'red', fontSize: '2rem' }} />,
      color: 'red',
    },
    {
      title: 'Total de Mensagens',
      value: totalMessages,
      icon: <EnvelopeIcon style={{ color: 'blue', fontSize: '2rem' }} />,
      color: 'blue',
    },
  ];

  return (
    <PageSection style={{ 
      padding: '1.5rem', 
      backgroundColor: '#fff', 
      height: '100%', 
      width: '100%',
      overflow: 'auto',
      margin: 0
    }}>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '2rem' }}>
        Dashboard QuickFIX/J
      </Title>

      {/* Cards de Estatísticas */}
      <Gallery hasGutter minWidths={{ default: '300px' }} style={{ marginBottom: '2rem' }}>
        {statsCards.map((stat, index) => (
          <GalleryItem key={index}>
            <Card>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Title headingLevel="h3" size="lg">
                      {stat.value}
                    </Title>
                    <p style={{ margin: 0, color: '#6a6e73' }}>{stat.title}</p>
                  </div>
                  {stat.icon}
                </div>
              </CardBody>
            </Card>
          </GalleryItem>
        ))}
      </Gallery>

      {/* Lista de Sessões */}
      <Grid hasGutter>
        <GridItem span={12}>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
                Status das Sessões
              </Title>
              {sessions.length === 0 ? (
                <p>Nenhuma sessão configurada.</p>
              ) : (
                <div>
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div>
                        <strong>{session.sessionID}</strong>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6a6e73' }}>
                          {session.senderCompID} → {session.targetCompID}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            backgroundColor:
                              session.status === 'CONNECTED'
                                ? '#d4edda'
                                : session.status === 'ERROR'
                                ? '#f8d7da'
                                : '#fff3cd',
                            color:
                              session.status === 'CONNECTED'
                                ? '#155724'
                                : session.status === 'ERROR'
                                ? '#721c24'
                                : '#856404',
                          }}
                        >
                          {session.status}
                        </span>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6a6e73' }}>
                          {session.messagesSent + session.messagesReceived} mensagens
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default Dashboard;