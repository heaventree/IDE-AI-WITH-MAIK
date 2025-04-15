import React from 'react';

enum OutputTab {
  Preview = 'Preview',
  Terminal = 'Terminal',
  AIAssistant = 'AI Assistant',
  Problems = 'Problems'
}

interface OutputTabsProps {
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
}

const OutputTabs: React.FC<OutputTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-neutral-200 dark:bg-dark-200 text-sm font-medium border-b border-neutral-300 dark:border-dark-100 flex">
      {Object.values(OutputTab).map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 border-r border-neutral-300 dark:border-dark-100 ${
            activeTab === tab ? 'bg-neutral-100 dark:bg-dark-300' : ''
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default OutputTabs;
