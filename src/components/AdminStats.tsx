import  React from 'react';
import { User, Tool, PromoCode } from '../types';
import { Users, Wrench, Calendar, UserPlus, ShieldCheck, Star } from 'lucide-react';

interface AdminStatsProps {
  users: User[];
  tools: Tool[];
  promoCodes: PromoCode[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ users, tools, promoCodes }) => {
  const proUsers = users.filter(user => user.role === 'Pro').length;
  const adminUsers = users.filter(user => user.role === 'Admin').length;
  const basicUsers = users.filter(user => user.role === 'Basic').length;
  
  const proTools = tools.filter(tool => tool.accessLevel === 'Pro').length;
  const basicTools = tools.filter(tool => tool.accessLevel === 'Basic').length;
  
  const mechanicalTools = tools.filter(tool => tool.category === 'Mecânica').length;
  const electricalTools = tools.filter(tool => tool.category === 'Elétrica').length;
  
  const externalTools = tools.filter(tool => tool.isExternal).length;
  const internalTools = tools.filter(tool => !tool.isExternal).length;

  const activePromoCodes = promoCodes.filter(code => code.usesLeft > 0).length;
  
  const totalUsesRemaining = promoCodes.reduce((sum, code) => sum + code.usesLeft, 0);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Visão Geral do Sistema</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Usuários" 
          value={users.length} 
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-500"
          details={[
            { label: 'Basic', value: basicUsers },
            { label: 'Pro', value: proUsers },
            { label: 'Admin', value: adminUsers }
          ]}
        />
        
        <StatCard 
          title="Ferramentas" 
          value={tools.length} 
          icon={<Wrench className="h-6 w-6" />}
          color="bg-green-500"
          details={[
            { label: 'Mecânica', value: mechanicalTools },
            { label: 'Elétrica', value: electricalTools }
          ]}
        />
        
        <StatCard 
          title="Códigos Promo" 
          value={promoCodes.length} 
          icon={<Calendar className="h-6 w-6" />}
          color="bg-purple-500"
          details={[
            { label: 'Ativos', value: activePromoCodes },
            { label: 'Usos Restantes', value: totalUsesRemaining }
          ]}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Distribuição de Usuários</h3>
          <div className="flex items-center justify-around">
            <StatRing 
              value={basicUsers} 
              total={users.length} 
              label="Basic" 
              icon={<UserPlus className="h-5 w-5" />}
              color="bg-gray-500" 
            />
            <StatRing 
              value={proUsers} 
              total={users.length} 
              label="Pro" 
              icon={<Star className="h-5 w-5" />}
              color="bg-orange-500" 
            />
            <StatRing 
              value={adminUsers} 
              total={users.length} 
              label="Admin" 
              icon={<ShieldCheck className="h-5 w-5" />}
              color="bg-blue-500" 
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Distribuição de Ferramentas</h3>
          <div className="space-y-4">
            <StatBar 
              label="Básico vs Pro" 
              value1={basicTools} 
              value2={proTools} 
              total={tools.length}
              color1="bg-gray-500"
              color2="bg-orange-500"
              label1="Basic"
              label2="Pro"
            />
            
            <StatBar 
              label="Mecânica vs Elétrica" 
              value1={mechanicalTools} 
              value2={electricalTools} 
              total={tools.length}
              color1="bg-blue-500"
              color2="bg-green-500"
              label1="Mecânica"
              label2="Elétrica"
            />
            
            <StatBar 
              label="Interno vs Externo" 
              value1={internalTools} 
              value2={externalTools} 
              total={tools.length}
              color1="bg-purple-500"
              color2="bg-pink-500"
              label1="Interno"
              label2="Externo"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Banco de Dados Firebase</h3>
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Firebase ativo</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Seu sistema está utilizando o Firebase para armazenamento de dados em tempo real na nuvem.
                  Todos os dados são sincronizados automaticamente e disponíveis em todos os dispositivos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          <ActivityItem 
            title="Nova ferramenta adicionada" 
            description="Calculadora de Torção foi adicionada à categoria Mecânica"
            time="Hoje, 14:32"
          />
          <ActivityItem 
            title="Usuário atualizado" 
            description="O usuário joão@email.com foi promovido para Pro"
            time="Ontem, 10:15"
          />
          <ActivityItem 
            title="Código promocional utilizado" 
            description="O código PRO3X5ABC foi utilizado (2 usos restantes)"
            time="2 dias atrás"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  details: { label: string; value: number }[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, details }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`${color} rounded-full p-3 text-white mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="grid grid-cols-2 gap-2">
          {details.map((detail, index) => (
            <div key={index} className="text-sm">
              <span className="text-gray-500">{detail.label}:</span>{' '}
              <span className="font-medium text-gray-900">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatRingProps {
  value: number;
  total: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const StatRing: React.FC<StatRingProps> = ({ value, total, label, icon, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="text-center">
      <div className="relative inline-flex">
        <div className="relative">
          <svg className="w-20 h-20">
            <circle
              className="text-gray-200"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
              r="30"
              cx="40"
              cy="40"
            />
            <circle
              className={color.replace('bg-', 'text-')}
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 30}
              strokeDashoffset={2 * Math.PI * 30 * (1 - percentage / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="30"
              cx="40"
              cy="40"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${color} rounded-full p-1.5 text-white`}>
              {icon}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xl font-semibold">{percentage}%</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

interface StatBarProps {
  label: string;
  value1: number;
  value2: number;
  total: number;
  color1: string;
  color2: string;
  label1: string;
  label2: string;
}

const StatBar: React.FC<StatBarProps> = ({ 
  label, value1, value2, total, color1, color2, label1, label2 
}) => {
  const percent1 = total > 0 ? Math.round((value1 / total) * 100) : 0;
  const percent2 = total > 0 ? Math.round((value2 / total) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>
      <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full ${color1}`}
          style={{ width: `${percent1}%`, float: 'left' }}
        ></div>
        <div
          className={`h-full ${color2}`}
          style={{ width: `${percent2}%`, float: 'left' }}
        ></div>
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full ${color1} mr-1`}></span>
          <span>{label1}: {value1} ({percent1}%)</span>
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full ${color2} mr-1`}></span>
          <span>{label2}: {value2} ({percent2}%)</span>
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, time }) => {
  return (
    <div className="border-l-4 border-primary pl-4 py-2">
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  );
};

export default AdminStats;
 