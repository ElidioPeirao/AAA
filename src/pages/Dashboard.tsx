import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Filter, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Tool } from '../types';
import { getAllTools, searchTools, getToolsByCategory } from '../services/toolService';

export default function Dashboard() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, isPro } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        const allTools = await getAllTools();
        setTools(allTools);
        setFilteredTools(allTools);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTools();
  }, []);
  
  const handleFilter = async (category: string) => {
    setIsLoading(true);
    try {
      if (filter === category) {
        // Toggle filter off
        setFilter('');
        const allTools = await getAllTools();
        setFilteredTools(allTools);
      } else {
        // Apply filter
        setFilter(category);
        const categoryTools = await getToolsByCategory(category);
        setFilteredTools(categoryTools);
      }
    } catch (error) {
      console.error('Error filtering tools:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    setIsLoading(true);
    try {
      const searchResults = await searchTools(term);
      
      // Apply category filter if active
      if (filter) {
        setFilteredTools(searchResults.filter(tool => tool.category === filter));
      } else {
        setFilteredTools(searchResults);
      }
    } catch (error) {
      console.error('Error searching tools:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToolClick = (tool: Tool) => {
    if (tool.accessLevel === 'Pro' && !isPro()) {
      alert('Esta ferramenta requer acesso Pro. Atualize sua conta para acessá-la.');
      return;
    }
    
    if (tool.isExternal) {
      window.open(tool.link, '_blank');
    } else {
      navigate(tool.link);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div 
        className="w-full h-64 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1650954316166-c3361fefcc87?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwZW5naW5lZXJpbmclMjBnZWFycyUyMGJsYWNrJTIwb3JhbmdlJTIwaW5kdXN0cmlhbCUyMHRvb2xzfGVufDB8fHx8MTc0NjE0MzY1M3ww&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800')" }}
      >
        <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">EPROJECTS</h1>
            <p className="text-white text-xl">Plataforma de Engenharia Especializada</p>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary mb-4">Ferramentas de Engenharia</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bem-vindo à plataforma EPROJECTS. Selecione uma ferramenta para começar.
          </p>
          
          {currentUser?.role === 'Pro' && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              <span className="font-medium">Usuário Pro</span>
              {currentUser.proDaysLeft < 9999 && (
                <span className="ml-1">
                  ({currentUser.proDaysLeft} {currentUser.proDaysLeft === 1 ? 'dia' : 'dias'} restantes)
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="mb-8 flex flex-col items-center sm:flex-row sm:justify-between">
          <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-0">
            <button
              onClick={() => handleFilter('Mecânica')}
              className={`btn flex items-center ${
                filter === 'Mecânica' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              <Filter className="h-4 w-4 mr-1" />
              Mecânica
            </button>
            <button
              onClick={() => handleFilter('Elétrica')}
              className={`btn flex items-center ${
                filter === 'Elétrica' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              <Filter className="h-4 w-4 mr-1" />
              Elétrica
            </button>
            {filter && (
              <button
                onClick={() => handleFilter('')}
                className="btn btn-outline"
              >
                Limpar filtro
              </button>
            )}
          </div>
          
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar ferramentas..."
              value={searchTerm}
              onChange={handleSearch}
              className="input pl-10 w-full"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-20">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`card p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                    tool.accessLevel === 'Pro' && !isPro()
                      ? 'opacity-70'
                      : ''
                  }`}
                  onClick={() => handleToolClick(tool)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Wrench className="h-6 w-6" />
                    </div>
                    {tool.accessLevel === 'Pro' && (
                      <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-secondary">
                    {tool.description}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Categoria: {tool.category}
                  </p>
                  {tool.isExternal && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Link externo
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {filteredTools.length === 0 && (
              <div className="text-center text-gray-500 my-12 p-8 bg-white rounded-lg shadow">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium mb-2">Nenhuma ferramenta encontrada</h3>
                <p>Tente outro filtro ou termo de busca</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
 