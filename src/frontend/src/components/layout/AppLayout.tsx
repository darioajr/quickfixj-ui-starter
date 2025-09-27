import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Nav,
  NavList,
  NavItem,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  TachometerAltIcon,
  ConnectedIcon,
  CogIcon,
  EnvelopeIcon,
  BarsIcon,
} from '@patternfly/react-icons';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <TachometerAltIcon />,
    },
    {
      title: 'Sessões FIX',
      path: '/sessions',
      icon: <ConnectedIcon />,
    },
    {
      title: 'Configurações',
      path: '/configurations',
      icon: <CogIcon />,
    },
    {
      title: 'Mensagens',
      path: '/messages',
      icon: <EnvelopeIcon />,
    },
  ];

  const onNavSelect = (_event: React.FormEvent<HTMLInputElement>, result: { itemId: string | number }) => {
    const selectedItem = navigation[Number(result.itemId)];
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #d2d2d2', 
        backgroundColor: '#fff',
        width: '100%',
        flexShrink: 0
      }}>
        <Toolbar id="page-toolbar">
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <Button
                  variant="plain"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-label="Toggle navigation"
                >
                  <BarsIcon />
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <div
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    color: '#151515',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  QuickFIX/J UI
                </div>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </div>

      {/* Content Area */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}>
        {/* Sidebar */}
        {isSidebarOpen && (
          <div 
            style={{ 
              width: '250px', 
              backgroundColor: '#f8f9fa', 
              borderRight: '1px solid #d2d2d2',
              padding: '1rem',
              overflow: 'auto'
            }}
          >
            <Nav onSelect={onNavSelect}>
              <NavList>
                {navigation.map((item, index) => (
                  <NavItem
                    key={item.title}
                    itemId={index}
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.75rem',
                      marginBottom: '0.25rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: location.pathname === item.path ? '#e7f1ff' : 'transparent'
                    }}
                  >
                    {item.icon} {item.title}
                  </NavItem>
                ))}
              </NavList>
            </Nav>
          </div>
        )}

        {/* Main Content */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          backgroundColor: '#f8f9fa',
          width: '100%',
          height: '100%'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;