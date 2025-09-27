import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Pagination,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
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
  EnvelopeIcon,
  FilterIcon,
} from '@patternfly/react-icons';
import { useMessages } from '../hooks/useMessages';

const Messages: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { 
    messages, 
    pagination, 
    loading, 
    changePage, 
    changePageSize,
    refetch 
  } = useMessages(sessionId);

  const [isSessionFilterOpen, setIsSessionFilterOpen] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'INBOUND' ? 'blue' : 'green';
  };

  const getDirectionLabel = (direction: string) => {
    return direction === 'INBOUND' ? 'ENTRADA' : 'SAÍDA';
  };

  const getValidationColor = (isValid: boolean) => {
    return isValid ? 'green' : 'red';
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
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
          <p>Carregando mensagens...</p>
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
              Mensagens FIX {sessionId && `- ${sessionId}`}
            </Title>
          </ToolbarItem>
          <ToolbarItem>
            <Select
              id="session-filter"
              isOpen={isSessionFilterOpen}
              selected={selectedSessionFilter}
              onSelect={(_, selection) => {
                setSelectedSessionFilter(selection as string);
                setIsSessionFilterOpen(false);
              }}
              toggle={(toggleRef) => (
                <MenuToggle 
                  ref={toggleRef}
                  onClick={() => setIsSessionFilterOpen(!isSessionFilterOpen)}
                  isExpanded={isSessionFilterOpen}
                  icon={<FilterIcon />}
                >
                  Filtrar Sessão
                </MenuToggle>
              )}
            >
              <SelectList>
                <SelectOption value="all">Todas as Sessões</SelectOption>
                {/* Aqui você poderia adicionar opções dinâmicas baseadas nas sessões disponíveis */}
              </SelectList>
            </Select>
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
          {messages.length === 0 ? (
            <EmptyState>
              <EnvelopeIcon style={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Title headingLevel="h4" size="lg">
                Nenhuma mensagem encontrada
              </Title>
              <EmptyStateBody>
                Não há mensagens FIX para exibir.
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <>
              <Table aria-label="Mensagens FIX">
                <Thead>
                  <Tr>
                    <Th>Timestamp</Th>
                    <Th>Sessão</Th>
                    <Th>Direção</Th>
                    <Th>Tipo</Th>
                    <Th>Seq#</Th>
                    <Th>Válida</Th>
                    <Th>Mensagem</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {messages.map((message) => (
                    <Tr key={message.id}>
                      <Td>{formatDate(message.timestamp)}</Td>
                      <Td>{message.sessionID}</Td>
                      <Td>
                        <Label color={getDirectionColor(message.direction)}>
                          {getDirectionLabel(message.direction)}
                        </Label>
                      </Td>
                      <Td>
                        <div>
                          <strong>{message.messageType}</strong>
                          {message.messageTypeDescription && (
                            <div style={{ fontSize: '0.8rem', color: '#6a6e73' }}>
                              {message.messageTypeDescription}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>{message.sequenceNumber}</Td>
                      <Td>
                        <Label color={getValidationColor(message.isValid)}>
                          {message.isValid ? 'VÁLIDA' : 'INVÁLIDA'}
                        </Label>
                      </Td>
                      <Td>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {truncateMessage(message.rawMessage)}
                        </div>
                        {message.parsedFields.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <details>
                              <summary style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                                Ver campos ({message.parsedFields.length})
                              </summary>
                              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                {message.parsedFields.slice(0, 5).map((field, index) => (
                                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                                    <strong>{field.tag}</strong> ({field.name}): {field.value}
                                  </div>
                                ))}
                                {message.parsedFields.length > 5 && (
                                  <div style={{ color: '#6a6e73' }}>
                                    ... e mais {message.parsedFields.length - 5} campos
                                  </div>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                        {!message.isValid && message.validationErrors && (
                          <div style={{ marginTop: '0.5rem', color: 'red', fontSize: '0.8rem' }}>
                            Erros: {message.validationErrors.join(', ')}
                          </div>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Paginação */}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#6a6e73' }}>
                  Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} de {pagination.totalCount} mensagens
                </div>
                <Pagination
                  itemCount={pagination.totalCount}
                  perPage={pagination.pageSize}
                  page={pagination.page}
                  onSetPage={(_, page) => changePage(page)}
                  onPerPageSelect={(_, perPage) => changePageSize(perPage)}
                  variant="bottom"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Estatísticas das Mensagens */}
      {messages.length > 0 && (
        <Card style={{ marginTop: '1rem' }}>
          <CardBody>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '1rem' }}>
              Estatísticas da Página
            </Title>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <strong>Total:</strong> {messages.length}
              </div>
              <div>
                <strong>Entrada:</strong> {messages.filter(m => m.direction === 'INBOUND').length}
              </div>
              <div>
                <strong>Saída:</strong> {messages.filter(m => m.direction === 'OUTBOUND').length}
              </div>
              <div>
                <strong>Válidas:</strong> {messages.filter(m => m.isValid).length}
              </div>
              <div>
                <strong>Inválidas:</strong> {messages.filter(m => !m.isValid).length}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </PageSection>
  );
};

export default Messages;