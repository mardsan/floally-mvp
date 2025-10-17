import React from 'react';

const IntegrationsManager = ({ integrations, userEmail, onRefresh }) => {
  if (!integrations || !integrations.integrations) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔗</div>
        <p className="text-slate-600">Loading integrations...</p>
      </div>
    );
  }

  const connected = integrations.integrations.filter(i => i.status === 'connected');
  const available = integrations.integrations.filter(i => i.status === 'not_connected');

  const getServiceIcon = (service) => {
    const icons = {
      gmail: '📧',
      google_calendar: '📅',
      microsoft_outlook: '📨',
      slack: '💬',
      discord: '🎮',
      notion: '📝',
      trello: '📋'
    };
    return icons[service] || '🔗';
  };

  const getHealthBadge = (health) => {
    if (health === 'healthy') {
      return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">● Healthy</span>;
    } else if (health === 'warning') {
      return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">⚠ Warning</span>;
    } else if (health === 'error') {
      return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">✕ Error</span>;
    }
    return null;
  };

  const formatServiceName = (service) => {
    return service
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      
      {/* Summary */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border" style={{borderColor: '#dafef4'}}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔗</span>
          <div>
            <h3 className="font-semibold text-slate-900">
              {integrations.total_connected} {integrations.total_connected === 1 ? 'Integration' : 'Integrations'} Connected
            </h3>
            <p className="text-sm text-slate-600">
              Connect more services to enhance Alli's capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Connected Services */}
      {connected.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">✅ Connected Services</h3>
          
          {connected.map((integration, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border p-5 hover:shadow-md transition-all"
              style={{borderColor: '#dafef4'}}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-2xl">
                    {getServiceIcon(integration.service)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">
                        {formatServiceName(integration.service)}
                      </h4>
                      {getHealthBadge(integration.health)}
                    </div>
                    
                    {integration.email && (
                      <p className="text-sm text-slate-600 mb-2">
                        {integration.email}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Connected: {formatDate(integration.connected_at)}
                      </span>
                      {integration.last_sync && (
                        <span>
                          Last sync: {formatDate(integration.last_sync)}
                        </span>
                      )}
                    </div>

                    {/* Scopes */}
                    {integration.scopes && integration.scopes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {integration.scopes.map((scope, scopeIdx) => (
                          <span
                            key={scopeIdx}
                            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all">
                    Manage
                  </button>
                  <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Integrations */}
      {available.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">➕ Available Integrations</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {available.map((integration, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-5 ${
                  integration.coming_soon
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white hover:shadow-md transition-all cursor-pointer'
                }`}
                style={!integration.coming_soon ? {borderColor: '#dafef4'} : {}}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    integration.coming_soon
                      ? 'bg-slate-200'
                      : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                  }`}>
                    {getServiceIcon(integration.service)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">
                        {formatServiceName(integration.service)}
                      </h4>
                      {integration.coming_soon && (
                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full font-semibold">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {integration.description}
                    </p>
                    
                    {!integration.coming_soon && (
                      <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all">
                        Connect {formatServiceName(integration.service)}
                      </button>
                    )}
                    
                    {integration.coming_soon && (
                      <button className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium cursor-not-allowed">
                        Notify Me
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Tips */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-2">Integration Tips</h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Connect Slack to get Alli notifications in your workspace</li>
              <li>• Microsoft Outlook integration supports both email and calendar</li>
              <li>• All integrations respect your privacy settings</li>
              <li>• You can disconnect any service at any time</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IntegrationsManager;
