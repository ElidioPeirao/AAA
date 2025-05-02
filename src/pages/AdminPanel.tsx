import  { useState, useEffect } from 'react';
import { Users, Settings, Edit, Trash, Calendar, X, Database, Shield, User, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User as UserType, Tool, PromoCode } from '../types';
import AdminStats from '../components/AdminStats';
import { getAllUsers, updateUser, deleteUser, searchUsers } from '../services/userService';
import { getAllTools, addTool, deleteTool } from '../services/toolService';
import { getAllPromoCodes, createPromoCode, deletePromoCode } from '../services/promoCodeService';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAuth();
  
  // Form states
  const [newToolForm, setNewToolForm] = useState({
    category: 'Mecânica' as 'Mecânica' | 'Elétrica',
    description: '',
    link: '',
    accessLevel: 'Basic' as 'Basic' | 'Pro',
    isExternal: false
  });
  
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Basic' as 'Basic' | 'Pro' | 'Admin',
    proDaysLeft: 0
  });
  
  const [newPromoCode, setNewPromoCode] = useState({
    daysGranted: 30,
    totalUses: 1
  });
  
  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [usersData, toolsData, promoCodesData] = await Promise.all([
        getAllUsers(),
        getAllTools(),
        getAllPromoCodes()
      ]);
      
      setUsers(usersData);
      setTools(toolsData);
      setPromoCodes(promoCodesData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtering functions
  const getFilteredUsers = () => {
    if (!searchTerm) return users;
    
    const lowerTerm = searchTerm.toLowerCase();
    return users.filter(
      user => 
        user.username.toLowerCase().includes(lowerTerm) || 
        user.email.toLowerCase().includes(lowerTerm) ||
        user.role.toLowerCase().includes(lowerTerm)
    );
  };
  
  const getFilteredTools = () => {
    if (!searchTerm) return tools;
    
    const lowerTerm = searchTerm.toLowerCase();
    return tools.filter(
      tool => 
        tool.description.toLowerCase().includes(lowerTerm) || 
        tool.category.toLowerCase().includes(lowerTerm) ||
        tool.link.toLowerCase().includes(lowerTerm)
    );
  };
  
  const getFilteredPromoCodes = () => {
    if (!searchTerm) return promoCodes;
    
    const lowerTerm = searchTerm.toLowerCase();
    return promoCodes.filter(
      code => code.code.toLowerCase().includes(lowerTerm)
    );
  };
  
  // User management
  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
  };
  
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsLoading(true);
    try {
      await updateUser(editingUser.id, editingUser);
      await refreshData();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditingUser(null);
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setIsLoading(true);
      try {
        await deleteUser(id);
        await refreshData();
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Tool management
  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await addTool(newToolForm);
      
      // Reset form
      setNewToolForm({
        category: 'Mecânica',
        description: '',
        link: '',
        accessLevel: 'Basic',
        isExternal: false
      });
      
      await refreshData();
    } catch (error) {
      console.error('Error creating tool:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTool = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      setIsLoading(true);
      try {
        await deleteTool(id);
        await refreshData();
      } catch (error) {
        console.error('Error deleting tool:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Promo code management
  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const result = await createPromoCode(
        newPromoCode.daysGranted,
        newPromoCode.totalUses
      );
      
      if (result.success && result.code) {
        alert(`Código promocional criado com sucesso: ${result.code}`);
      }
      
      await refreshData();
    } catch (error) {
      console.error('Error creating promo code:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePromoCode = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este código promocional?')) {
      setIsLoading(true);
      try {
        await deletePromoCode(id);
        await refreshData();
      } catch (error) {
        console.error('Error deleting promo code:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div 
        className="w-full h-40 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1569470451072-68314f596aec?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxtZWNoYW5pY2FsJTIwZW5naW5lZXJpbmclMjBnZWFycyUyMGJsYWNrJTIwb3JhbmdlJTIwaW5kdXN0cmlhbCUyMHRvb2xzfGVufDB8fHx8MTc0NjE0MTcxOXww&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800')" }}
      >
        <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-60">
          <h1 className="text-3xl font-bold text-white">Painel de Administração</h1>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 border-b">
            <button
              className={`px-4 py-3 flex items-center justify-center md:justify-start space-x-2 ${
                activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Database className="h-5 w-5" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              className={`px-4 py-3 flex items-center justify-center md:justify-start space-x-2 ${
                activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-5 w-5" />
              <span className="hidden md:inline">Usuários</span>
            </button>
            <button
              className={`px-4 py-3 flex items-center justify-center md:justify-start space-x-2 ${
                activeTab === 'tools' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('tools')}
            >
              <Settings className="h-5 w-5" />
              <span className="hidden md:inline">Ferramentas</span>
            </button>
            <button
              className={`px-4 py-3 flex items-center justify-center md:justify-start space-x-2 ${
                activeTab === 'promo' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('promo')}
            >
              <Calendar className="h-5 w-5" />
              <span className="hidden md:inline">Códigos</span>
            </button>
          </div>
          
          {/* Search bar for all tabs except dashboard */}
          {activeTab !== 'dashboard' && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder={`Buscar ${
                    activeTab === 'users' 
                      ? 'usuários' 
                      : activeTab === 'tools' 
                        ? 'ferramentas' 
                        : 'códigos'
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && !isLoading && (
              <AdminStats 
                users={users}
                tools={tools}
                promoCodes={promoCodes}
              />
            )}
            
            {/* Users Management */}
            {activeTab === 'users' && !isLoading && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Gerenciar Usuários</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Papel
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dias Pro
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredUsers().map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  <User className="h-4 w-4" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'Admin' 
                                  ? 'bg-primary text-white' 
                                  : user.role === 'Pro' 
                                    ? 'bg-secondary text-white' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.proDaysLeft < 9999 ? user.proDaysLeft : '∞'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getFilteredUsers().length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                      Nenhum usuário encontrado com o termo de busca.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Tools Management */}
            {activeTab === 'tools' && !isLoading && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Gerenciar Ferramentas</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Link
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acesso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredTools().map((tool) => (
                          <tr key={tool.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{tool.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{tool.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 truncate max-w-xs">{tool.link}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                tool.accessLevel === 'Pro' 
                                  ? 'bg-secondary text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {tool.accessLevel}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {tool.isExternal ? 'Externo' : 'Interno'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteTool(tool.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getFilteredTools().length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                      Nenhuma ferramenta encontrada com o termo de busca.
                    </div>
                  )}
                </div>
                
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Adicionar Nova Ferramenta</h3>
                  <form onSubmit={handleCreateTool} className="space-y-4 max-w-lg">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                      <select
                        id="category"
                        value={newToolForm.category}
                        onChange={(e) => setNewToolForm({...newToolForm, category: e.target.value as any})}
                        className="input mt-1"
                      >
                        <option value="Mecânica">Mecânica</option>
                        <option value="Elétrica">Elétrica</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                      <input
                        type="text"
                        id="description"
                        value={newToolForm.description}
                        onChange={(e) => setNewToolForm({...newToolForm, description: e.target.value})}
                        className="input mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link</label>
                      <input
                        type="text"
                        id="link"
                        value={newToolForm.link}
                        onChange={(e) => setNewToolForm({...newToolForm, link: e.target.value})}
                        className="input mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700">Nível de acesso</label>
                      <select
                        id="accessLevel"
                        value={newToolForm.accessLevel}
                        onChange={(e) => setNewToolForm({...newToolForm, accessLevel: e.target.value as any})}
                        className="input mt-1"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Pro">Pro</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isExternal"
                        checked={newToolForm.isExternal}
                        onChange={(e) => setNewToolForm({...newToolForm, isExternal: e.target.checked})}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isExternal" className="ml-2 block text-sm text-gray-700">
                        Link externo
                      </label>
                    </div>
                    
                    <button type="submit" className="btn btn-primary mt-4">
                      Adicionar Ferramenta
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Promo Codes Management */}
            {activeTab === 'promo' && !isLoading && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Códigos Promocionais Pro</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dias Concedidos
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usos Restantes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total de Usos
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredPromoCodes().map((promo) => (
                          <tr key={promo.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono font-medium bg-gray-100 px-2 py-1 rounded">{promo.code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{promo.daysGranted}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{promo.usesLeft}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{promo.totalUses}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeletePromoCode(promo.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getFilteredPromoCodes().length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                      Nenhum código promocional encontrado com o termo de busca.
                    </div>
                  )}
                </div>
                
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Gerar Novo Código Promocional</h3>
                  <form onSubmit={handleCreatePromoCode} className="space-y-4 max-w-lg">
                    <div>
                      <label htmlFor="daysGranted" className="block text-sm font-medium text-gray-700">Dias de acesso Pro</label>
                      <input
                        type="number"
                        id="daysGranted"
                        value={newPromoCode.daysGranted}
                        onChange={(e) => setNewPromoCode({...newPromoCode, daysGranted: parseInt(e.target.value)})}
                        className="input mt-1"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="totalUses" className="block text-sm font-medium text-gray-700">Limite de usos</label>
                      <input
                        type="number"
                        id="totalUses"
                        value={newPromoCode.totalUses}
                        onChange={(e) => setNewPromoCode({...newPromoCode, totalUses: parseInt(e.target.value)})}
                        className="input mt-1"
                        min="1"
                        required
                      />
                    </div>
                    
                    <button type="submit" className="btn btn-primary mt-4">
                      Gerar Código
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* User Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Editar Usuário</h3>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome de usuário</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className="input mt-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="input mt-1"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Papel</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                    className="input mt-1"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                
                {editingUser.role === 'Pro' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dias Pro</label>
                    <input
                      type="number"
                      value={editingUser.proDaysLeft}
                      onChange={(e) => setEditingUser({...editingUser, proDaysLeft: parseInt(e.target.value)})}
                      className="input mt-1"
                      min="1"
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    onClick={() => setEditingUser(null)}
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleUpdateUser}
                    className="btn btn-primary"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
 