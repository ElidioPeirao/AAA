import  { User, Tool, PromoCode } from '../types';

// Database class with local storage as fallback
class DB {
  users: User[] = [];
  tools: Tool[] = [];
  promoCodes: PromoCode[] = [];
  currentUser: User | null = null;
  
  constructor() {
    this.loadFromLocalStorage();
    
    // Initialize with default data if needed
    this.initializeDefaultData();
    
    this.saveToLocalStorage();
  }
  
  initializeDefaultData() {
    // Add default admin if none exists
    if (!this.users.some(user => user.role === 'Admin')) {
      this.users.push({
        id: 'admin-1',
        username: 'admin',
        email: 'admin@eprojects.com',
        password: 'admin123',
        role: 'Admin',
        proDaysLeft: 9999,
        createdAt: new Date().toISOString()
      });
    }

    // Add default tools if none exist
    if (this.tools.length === 0) {
      this.tools.push(
        {
          id: 'tool-1',
          category: 'Mecânica',
          description: 'Calculadora Mecânica',
          link: '/calculadora-mecanica',
          accessLevel: 'Basic',
          isExternal: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tool-2',
          category: 'Elétrica',
          description: 'Calculadora Elétrica',
          link: '/calculadora-eletrica',
          accessLevel: 'Basic',
          isExternal: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tool-3',
          category: 'Mecânica',
          description: 'Conversão de Unidades',
          link: 'https://www.convertworld.com/pt/massa/',
          accessLevel: 'Basic',
          isExternal: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tool-4',
          category: 'Elétrica',
          description: 'Calculadora de Resistências',
          link: 'https://www.digikey.com/pt/resources/conversion-calculators/conversion-calculator-resistor-color-code',
          accessLevel: 'Basic',
          isExternal: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tool-5',
          category: 'Mecânica',
          description: 'Análise de Tensão Avançada',
          link: '/pro/analise-tensao',
          accessLevel: 'Pro',
          isExternal: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tool-6',
          category: 'Elétrica',
          description: 'Simulador de Circuitos Pro',
          link: 'https://www.falstad.com/circuit/',
          accessLevel: 'Pro',
          isExternal: true,
          createdAt: new Date().toISOString()
        }
      );
    }
  }

  loadFromLocalStorage() {
    try {
      const usersData = localStorage.getItem('eprojects_users');
      const toolsData = localStorage.getItem('eprojects_tools');
      const promoCodesData = localStorage.getItem('eprojects_promoCodes');
      const currentUserData = localStorage.getItem('eprojects_currentUser');

      if (usersData) this.users = JSON.parse(usersData);
      if (toolsData) this.tools = JSON.parse(toolsData);
      if (promoCodesData) this.promoCodes = JSON.parse(promoCodesData);
      if (currentUserData) this.currentUser = JSON.parse(currentUserData);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('eprojects_users', JSON.stringify(this.users));
      localStorage.setItem('eprojects_tools', JSON.stringify(this.tools));
      localStorage.setItem('eprojects_promoCodes', JSON.stringify(this.promoCodes));
      if (this.currentUser) {
        localStorage.setItem('eprojects_currentUser', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('eprojects_currentUser');
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // User methods
  register(username: string, email: string, password: string, promoCode?: string): { success: boolean; message: string } {
    if (this.users.some(user => user.email === email)) {
      return { success: false, message: 'Email já está em uso.' };
    }

    let role: 'Basic' | 'Pro' | 'Admin' = 'Basic';
    let proDaysLeft = 0;

    // Check if promo code is the admin code
    if (promoCode === 'ELIDIOFODA') {
      role = 'Admin';
      proDaysLeft = 9999;
    } else if (promoCode) {
      // Check if promo code is valid for Pro access
      const promo = this.promoCodes.find(p => p.code === promoCode && p.usesLeft > 0);
      if (promo) {
        role = 'Pro';
        proDaysLeft = promo.daysGranted;
        
        // Decrease uses left
        promo.usesLeft--;
        this.saveToLocalStorage();
      } else if (promoCode) {
        return { success: false, message: 'Código promocional inválido ou expirado.' };
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      role,
      proDaysLeft,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveToLocalStorage();
    
    return { success: true, message: 'Conta criada com sucesso!' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Email ou senha incorretos.' };
    }

    this.currentUser = user;
    this.saveToLocalStorage();
    return { success: true, message: 'Login realizado com sucesso!' };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('eprojects_currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAllUsers(): User[] {
    return this.isCurrentUserAdmin() ? this.users : [];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    this.users[index] = { ...this.users[index], ...updates };
    this.saveToLocalStorage();
    
    // If updated user is current user, update currentUser as well
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = this.users[index];
    }
    
    return { success: true, message: 'Usuário atualizado com sucesso.' };
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    this.users.splice(index, 1);
    this.saveToLocalStorage();
    
    return { success: true, message: 'Usuário excluído com sucesso.' };
  }

  // Tool methods
  getAllTools(): Tool[] {
    if (!this.currentUser) return [];
    
    if (this.currentUser.role === 'Basic') {
      return this.tools.filter(tool => tool.accessLevel === 'Basic');
    }
    
    return this.tools;
  }

  getFilteredTools(category: string): Tool[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }

  async addTool(tool: Omit<Tool, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    const newTool: Tool = {
      ...tool,
      id: `tool-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.tools.push(newTool);
    this.saveToLocalStorage();
    
    return { success: true, message: 'Ferramenta adicionada com sucesso.' };
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    const index = this.tools.findIndex(t => t.id === id);
    if (index === -1) {
      return { success: false, message: 'Ferramenta não encontrada.' };
    }

    this.tools[index] = { ...this.tools[index], ...updates };
    this.saveToLocalStorage();
    
    return { success: true, message: 'Ferramenta atualizada com sucesso.' };
  }

  async deleteTool(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    const index = this.tools.findIndex(t => t.id === id);
    if (index === -1) {
      return { success: false, message: 'Ferramenta não encontrada.' };
    }

    this.tools.splice(index, 1);
    this.saveToLocalStorage();
    
    return { success: true, message: 'Ferramenta excluída com sucesso.' };
  }

  // Promo code methods
  async createPromoCode(daysGranted: number, totalUses: number): Promise<{ success: boolean; message: string; code?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    // Generate a random code
    const code = 'PRO' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const newPromoCode: PromoCode = {
      id: `promo-${Date.now()}`,
      code,
      daysGranted,
      usesLeft: totalUses,
      totalUses,
      createdAt: new Date().toISOString()
    };

    this.promoCodes.push(newPromoCode);
    this.saveToLocalStorage();
    
    return { success: true, message: 'Código promocional criado com sucesso.', code };
  }

  getAllPromoCodes(): PromoCode[] {
    return this.isCurrentUserAdmin() ? this.promoCodes : [];
  }

  async deletePromoCode(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, message: 'Permissão negada.' };
    }

    const index = this.promoCodes.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, message: 'Código promocional não encontrado.' };
    }

    this.promoCodes.splice(index, 1);
    this.saveToLocalStorage();
    
    return { success: true, message: 'Código promocional excluído com sucesso.' };
  }

  // Search methods
  searchTools(searchTerm: string): Tool[] {
    if (!searchTerm) return this.getAllTools();
    
    const term = searchTerm.toLowerCase();
    return this.getAllTools().filter(tool => 
      tool.description.toLowerCase().includes(term) || 
      tool.category.toLowerCase().includes(term) ||
      tool.link.toLowerCase().includes(term)
    );
  }

  searchUsers(searchTerm: string): User[] {
    if (!this.isCurrentUserAdmin()) return [];
    if (!searchTerm) return this.users;
    
    const term = searchTerm.toLowerCase();
    return this.users.filter(user => 
      user.username.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  // Helper methods
  isCurrentUserAdmin(): boolean {
    return !!this.currentUser && this.currentUser.role === 'Admin';
  }

  isCurrentUserPro(): boolean {
    return !!this.currentUser && (this.currentUser.role === 'Pro' || this.currentUser.role === 'Admin');
  }
}

// Singleton instance
const db = new DB();
export default db;
 
