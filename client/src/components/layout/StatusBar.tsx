/** @jsxImportSource theme-ui */
import React from 'react';
import { Flex, Text, Box } from 'theme-ui';
import { GitBranch, Wifi, Settings, BellRing } from 'lucide-react';

const StatusBar: React.FC = () => {
  return (
    <Flex
      sx={{
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: 'foregroundMuted',
        padding: '0 8px',
      }}
    >
      {/* Left section */}
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <GitBranch size={14} />
          <Text>main</Text>
        </Flex>
        
        <Flex 
          sx={{ 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: 'backgroundActive',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          <Text sx={{ fontWeight: 'bold', color: 'primary' }}>Bolt DIY</Text>
        </Flex>
      </Flex>
      
      {/* Middle section - empty for now */}
      <Box></Box>
      
      {/* Right section */}
      <Flex sx={{ alignItems: 'center', gap: 3 }}>
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <Text>TypeScript</Text>
        </Flex>
        
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <Wifi size={14} />
          <Text>Connected</Text>
        </Flex>
        
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <BellRing size={14} />
        </Flex>
        
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <Text>Ln 1, Col 1</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default StatusBar;