import React, { useState } from 'react';
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
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Switch,
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
  PlusIcon,
  EditIcon,
  TrashIcon,
  PlayIcon,
  StopIcon,
  CogIcon,
} from '@patternfly/react-icons';
import { useConfigurations } from '../hooks/useConfigurations';
import type { FixConfiguration } from '../types';

const Configurations: React.FC = () => {
  const { 
    configurations, 
    loading, 
    createConfiguration, 
    updateConfiguration, 
    deleteConfiguration,
    activateConfiguration,
    deactivateConfiguration,
    refetch 
  } = useConfigurations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FixConfiguration | null>(null);
  const [isSessionTypeOpen, setIsSessionTypeOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sessionType: 'INITIATOR' as 'INITIATOR' | 'ACCEPTOR',
    beginString: 'FIX.4.4',
    senderCompID: '',
    targetCompID: '',
    heartBtInt: 30,
    socketConnectHost: '',
    socketConnectPort: 9876,
    socketAcceptHost: '',
    socketAcceptPort: 9876,
    isActive: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sessionType: 'INITIATOR',
      beginString: 'FIX.4.4',
      senderCompID: '',
      targetCompID: '',
      heartBtInt: 30,
      socketConnectHost: '',
      socketConnectPort: 9876,
      socketAcceptHost: '',
      socketAcceptPort: 9876,
      isActive: false,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const openEditModal = (config: FixConfiguration) => {
    setFormData({
      name: config.name,
      sessionType: config.sessionType,
      beginString: config.beginString,
      senderCompID: config.senderCompID,
      targetCompID: config.targetCompID,
      heartBtInt: config.heartBtInt,
      socketConnectHost: config.connectionSettings.socketConnectHost || '',
      socketConnectPort: config.connectionSettings.socketConnectPort || 9876,
      socketAcceptHost: config.connectionSettings.socketAcceptHost || '',
      socketAcceptPort: config.connectionSettings.socketAcceptPort || 9876,
      isActive: config.isActive,
    });
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const configData = {
        name: formData.name,
        sessionType: formData.sessionType,
        beginString: formData.beginString,
        senderCompID: formData.senderCompID,
        targetCompID: formData.targetCompID,
        heartBtInt: formData.heartBtInt,
        connectionSettings: {
          socketConnectHost: formData.socketConnectHost || undefined,
          socketConnectPort: formData.socketConnectPort,
          socketAcceptHost: formData.socketAcceptHost || undefined,
          socketAcceptPort: formData.socketAcceptPort,
        },
        sessionSettings: {},
        isActive: formData.isActive,
      };

      if (editingConfig) {
        await updateConfiguration(editingConfig.id, configData);
      } else {
        await createConfiguration(configData);
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleDelete = async (configId: string) => {
    if (confirm('Tem certeza que deseja deletar esta configuração?')) {
      try {
        await deleteConfiguration(configId);
      } catch (error) {
        console.error('Erro ao deletar configuração:', error);
      }
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
          <p>Carregando configurações...</p>
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
              Configurações
            </Title>
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Button variant="primary" icon={<PlusIcon />} onClick={openCreateModal}>
              Nova Configuração
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="secondary" onClick={refetch}>
              Atualizar
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Card>
        <CardBody>
          {configurations.length === 0 ? (
            <EmptyState>
              <CogIcon style={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Title headingLevel="h4" size="lg">
                Nenhuma configuração encontrada
              </Title>
              <EmptyStateBody>
                Crie uma nova configuração para começar.
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <Table aria-label="Configurações">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Tipo</Th>
                  <Th>Versão</Th>
                  <Th>Sender</Th>
                  <Th>Target</Th>
                  <Th>Status</Th>
                  <Th>Criado em</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {configurations.map((config) => (
                  <Tr key={config.id}>
                    <Td>{config.name}</Td>
                    <Td>
                      <Label color={config.sessionType === 'INITIATOR' ? 'blue' : 'green'}>
                        {config.sessionType}
                      </Label>
                    </Td>
                    <Td>{config.beginString}</Td>
                    <Td>{config.senderCompID}</Td>
                    <Td>{config.targetCompID}</Td>
                    <Td>
                      <Label color={config.isActive ? 'green' : 'grey'}>
                        {config.isActive ? 'ATIVO' : 'INATIVO'}
                      </Label>
                    </Td>
                    <Td>{formatDate(config.createdAt)}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {config.isActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<StopIcon />}
                            onClick={() => deactivateConfiguration(config.id)}
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<PlayIcon />}
                            onClick={() => activateConfiguration(config.id)}
                          >
                            Ativar
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<EditIcon />}
                          onClick={() => openEditModal(config)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<TrashIcon />}
                          onClick={() => handleDelete(config.id)}
                        >
                          Deletar
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

      {/* Modal de Criação/Edição */}
      <Modal
        variant={ModalVariant.medium}
        title={editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <Form>
          <FormGroup label="Nome" isRequired fieldId="name">
            <TextInput
              id="name"
              value={formData.name}
              onChange={(_, value) => setFormData({ ...formData, name: value })}
            />
          </FormGroup>

          <FormGroup label="Tipo de Sessão" isRequired fieldId="sessionType">
            <Select
              id="sessionType"
              isOpen={isSessionTypeOpen}
              selected={formData.sessionType}
              onSelect={(_, selection) => {
                setFormData({ ...formData, sessionType: selection as 'INITIATOR' | 'ACCEPTOR' });
                setIsSessionTypeOpen(false);
              }}
              toggle={(toggleRef) => (
                <MenuToggle 
                  ref={toggleRef}
                  onClick={() => setIsSessionTypeOpen(!isSessionTypeOpen)}
                  isExpanded={isSessionTypeOpen}
                >
                  {formData.sessionType}
                </MenuToggle>
              )}
            >
              <SelectList>
                <SelectOption value="INITIATOR">INITIATOR</SelectOption>
                <SelectOption value="ACCEPTOR">ACCEPTOR</SelectOption>
              </SelectList>
            </Select>
          </FormGroup>

          <FormGroup label="Versão FIX" isRequired fieldId="beginString">
            <Select
              id="beginString"
              isOpen={isVersionOpen}
              selected={formData.beginString}
              onSelect={(_, selection) => {
                setFormData({ ...formData, beginString: selection as string });
                setIsVersionOpen(false);
              }}
              toggle={(toggleRef) => (
                <MenuToggle 
                  ref={toggleRef}
                  onClick={() => setIsVersionOpen(!isVersionOpen)}
                  isExpanded={isVersionOpen}
                >
                  {formData.beginString}
                </MenuToggle>
              )}
            >
              <SelectList>
                <SelectOption value="FIX.4.0">FIX.4.0</SelectOption>
                <SelectOption value="FIX.4.1">FIX.4.1</SelectOption>
                <SelectOption value="FIX.4.2">FIX.4.2</SelectOption>
                <SelectOption value="FIX.4.3">FIX.4.3</SelectOption>
                <SelectOption value="FIX.4.4">FIX.4.4</SelectOption>
                <SelectOption value="FIXT.1.1">FIXT.1.1</SelectOption>
              </SelectList>
            </Select>
          </FormGroup>

          <FormGroup label="Sender CompID" isRequired fieldId="senderCompID">
            <TextInput
              id="senderCompID"
              value={formData.senderCompID}
              onChange={(_, value) => setFormData({ ...formData, senderCompID: value })}
            />
          </FormGroup>

          <FormGroup label="Target CompID" isRequired fieldId="targetCompID">
            <TextInput
              id="targetCompID"
              value={formData.targetCompID}
              onChange={(_, value) => setFormData({ ...formData, targetCompID: value })}
            />
          </FormGroup>

          <FormGroup label="Heartbeat Interval (segundos)" isRequired fieldId="heartBtInt">
            <TextInput
              id="heartBtInt"
              type="number"
              value={formData.heartBtInt.toString()}
              onChange={(_, value) => setFormData({ ...formData, heartBtInt: parseInt(value) || 30 })}
            />
          </FormGroup>

          {formData.sessionType === 'INITIATOR' && (
            <>
              <FormGroup label="Host" fieldId="socketConnectHost">
                <TextInput
                  id="socketConnectHost"
                  value={formData.socketConnectHost}
                  onChange={(_, value) => setFormData({ ...formData, socketConnectHost: value })}
                  placeholder="localhost"
                />
              </FormGroup>

              <FormGroup label="Porta" fieldId="socketConnectPort">
                <TextInput
                  id="socketConnectPort"
                  type="number"
                  value={formData.socketConnectPort.toString()}
                  onChange={(_, value) => setFormData({ ...formData, socketConnectPort: parseInt(value) || 9876 })}
                />
              </FormGroup>
            </>
          )}

          {formData.sessionType === 'ACCEPTOR' && (
            <>
              <FormGroup label="Host de Aceite" fieldId="socketAcceptHost">
                <TextInput
                  id="socketAcceptHost"
                  value={formData.socketAcceptHost}
                  onChange={(_, value) => setFormData({ ...formData, socketAcceptHost: value })}
                  placeholder="0.0.0.0"
                />
              </FormGroup>

              <FormGroup label="Porta de Aceite" fieldId="socketAcceptPort">
                <TextInput
                  id="socketAcceptPort"
                  type="number"
                  value={formData.socketAcceptPort.toString()}
                  onChange={(_, value) => setFormData({ ...formData, socketAcceptPort: parseInt(value) || 9876 })}
                />
              </FormGroup>
            </>
          )}

          <FormGroup label="Ativar automaticamente" fieldId="isActive">
            <Switch
              id="isActive"
              isChecked={formData.isActive}
              onChange={(_, checked) => setFormData({ ...formData, isActive: checked })}
            />
          </FormGroup>
        </Form>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
          <Button variant="link" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </PageSection>
  );
};

export default Configurations;