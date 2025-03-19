import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from './types';

export class UserModel {
  private static instance: UserModel;
  private users: Map<string, User>;

  private constructor() {
    this.users = new Map();
  }

  public static getInstance(): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel();
    }
    return UserModel.instance;
  }

  async create(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const user: User = {
      ...userData,
      id: uuidv4(),
      created_at: new Date(),
    };

    // Check for unique constraints
    if (await this.findByUsername(userData.username)) {
      throw new Error('Username already exists');
    }
    if (await this.findByEmail(userData.email)) {
      throw new Error('Email already exists');
    }

    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.username === username) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async update(id: string, updateData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    // Check unique constraints if updating username or email
    if (updateData.username && updateData.username !== user.username) {
      if (await this.findByUsername(updateData.username)) {
        throw new Error('Username already exists');
      }
    }
    if (updateData.email && updateData.email !== user.email) {
      if (await this.findByEmail(updateData.email)) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser: User = {
      ...user,
      ...updateData,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    return this.update(id, { status });
  }
} 