import { v4 as uuidv4 } from 'uuid';
import { Server } from './types';
import { UserModel } from './User';

export class ServerModel {
  private static instance: ServerModel;
  private servers: Map<string, Server>;
  private userModel: UserModel;

  private constructor() {
    this.servers = new Map();
    this.userModel = UserModel.getInstance();
  }

  public static getInstance(): ServerModel {
    if (!ServerModel.instance) {
      ServerModel.instance = new ServerModel();
    }
    return ServerModel.instance;
  }

  async create(serverData: Omit<Server, 'id' | 'created_at'>): Promise<Server> {
    // Verify that the owner exists
    const owner = await this.userModel.findById(serverData.owner_id);
    if (!owner) {
      throw new Error('Owner user not found');
    }

    const server: Server = {
      ...serverData,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.servers.set(server.id, server);
    return server;
  }

  async findById(id: string): Promise<Server | null> {
    return this.servers.get(id) || null;
  }

  async findByOwnerId(ownerId: string): Promise<Server[]> {
    return Array.from(this.servers.values()).filter(server => server.owner_id === ownerId);
  }

  async update(id: string, updateData: Partial<Omit<Server, 'id' | 'created_at'>>): Promise<Server | null> {
    const server = await this.findById(id);
    if (!server) return null;

    // If updating owner_id, verify the new owner exists
    if (updateData.owner_id && updateData.owner_id !== server.owner_id) {
      const newOwner = await this.userModel.findById(updateData.owner_id);
      if (!newOwner) {
        throw new Error('New owner user not found');
      }
    }

    const updatedServer: Server = {
      ...server,
      ...updateData,
    };

    this.servers.set(id, updatedServer);
    return updatedServer;
  }

  async delete(id: string): Promise<boolean> {
    return this.servers.delete(id);
  }

  async getServerOwner(serverId: string) {
    const server = await this.findById(serverId);
    if (!server) return null;
    return this.userModel.findById(server.owner_id);
  }
} 