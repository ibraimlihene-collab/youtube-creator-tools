import React from 'react';

interface ToolCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300 p-6 md:p-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default ToolCard;