import { User, Tool, PromoCode } from '../types';
import GoogleSheetsDB from './GoogleSheetsDB';

const googleDB = new GoogleSheetsDB({ sheetId: 'AKfycbwRCjxaCvN9cjhOD1GW09cgcgL1n9RJjdHNFFjf7-K_SvnN2GFb4efMNrWzeEZEyz2z' });

class DB {
  currentUser: User | null = null;

  // Usuários
  async register(username: string, email: string, password: string, promoCode?: string): Promise<{ success: boolean; message: string }> {
    const users = await googleDB.fetchData('users');
    if (users.some((u: User) => u.email === email)) {
      return { success: false, message: 'Email já está em uso.' };
    }

    let role: 'Basic' | 'Pro' | 'Admin' = 'Basic';
    let proDaysLeft = 0;

    if (promoCode === 'ELIDIOFODA') {
      role = 'Admin';
      proDaysLeft = 9999;
    } else if (promoCode) {
      const codes: PromoCode[] = await googleDB.fetchData('promoCodes');
      const promo = codes.find(p => p.code === promoCode && Number(p.usesLeft) > 0);
      if (promo) {
        role = 'Pro';
        proDaysLeft = Number(promo.daysGranted);
        promo.usesLeft = Number(promo.usesLeft) - 1;
        await googleDB.updateRow('promoCodes', promo.id, { usesLeft: promo.usesLeft });
      } else {
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

    await googleDB.insertRow('users', newUser);
    return { success: true, message: 'Conta criada com sucesso!' };
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const users: User[] = await googleDB.fetchData('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Email ou senha incorretos.' };
    this.currentUser = user;
    return { success: true, message: 'Login realizado com sucesso!' };
  }

  logout() {
    this.currentUser = null;
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.isCurrentUserAdmin()) return [];
    return await googleDB.fetchData('users');
  }

  async updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };
    await googleDB.updateRow('users', id, updates);
    return { success: true, message: 'Usuário atualizado com sucesso.' };
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };
    await googleDB.deleteRow('users', id);
    return { success: true, message: 'Usuário excluído com sucesso.' };
  }

  // Ferramentas
  async getAllTools(): Promise<Tool[]> {
    if (!this.currentUser) return [];
    const tools: Tool[] = await googleDB.fetchData('tools');
    return this.currentUser.role === 'Basic'
      ? tools.filter(t => t.accessLevel === 'Basic')
      : tools;
  }

  async getFilteredTools(category: string): Promise<Tool[]> {
    const all = await this.getAllTools();
    return all.filter(t => t.category === category);
  }

  async addTool(tool: Omit<Tool, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };
    const newTool: Tool = {
      ...tool,
      id: `tool-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await googleDB.insertRow('tools', newTool);
    return { success: true, message: 'Ferramenta adicionada com sucesso.' };
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };
    await googleDB.updateRow('tools', id, updates);
    return { success: true, message: 'Ferramenta atualizada com sucesso.' };
  }

  async deleteTool(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };
    await googleDB.deleteRow('tools', id);
    return { success: true, message: 'Ferramenta excluída com sucesso.' };
  }

  async searchTools(term: string): Promise<Tool[]> {
    const tools = await this.getAllTools();
    if (!term) return tools;
    const t = term.toLowerCase();
    return tools.filter(tool =>
      tool.description.toLowerCase().includes(t) ||
      tool.category.toLowerCase().includes(t) ||
      tool.link.toLowerCase().includes(t)
    );
  }

  // Códigos promocionais
  async createPromoCode(daysGranted: number, totalUses: number): Promise<{ success: boolean; message: string; code?: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };

    const code = 'PRO' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code,
      daysGranted,
      usesLeft: totalUses,
      totalUses,
      createdAt: new Date().toISOString()
    };

    await googleDB.insertRow('promoCodes', newPromo);
    return { success: true, message: 'Código criado com sucesso.', code };
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    if (!this.isCurrentUserAdmin()) return [];
    return await googleDB.fetchData('promoCodes');
  }

  async deletePromoCode(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCurrentUserAdmin()) return { success: false, message: 'Sem permissão.' };
    await googleDB.deleteRow('promoCodes', id);
    return { success: true, message: 'Código excluído com sucesso.' };
  }

  async searchUsers(term: string): Promise<User[]> {
    if (!this.isCurrentUserAdmin()) return [];
    const users = await this.getAllUsers();
    if (!term) return users;
    const t = term.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t) ||
      u.role.toLowerCase().includes(t)
    );
  }

  // Permissões
  isCurrentUserAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  isCurrentUserPro(): boolean {
    return this.currentUser?.role === 'Pro' || this.currentUser?.role === 'Admin';
  }
}

const db = new DB();
export default db;
