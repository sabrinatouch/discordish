import { v4 as uuidv4 } from 'uuid';
import { ServerMember, ServerMemberRole } from './types';
import { UserModel } from './User';
import { ServerModel } from './Server';

export class ServerMemberModel {
  private static instance: ServerMemberModel;
  private serverMembers: Map<string, ServerMember>;
  private userModel: UserModel;
  private serverModel: ServerModel;

  private constructor() {
    this.serverMembers = new Map();
    this.userModel = UserModel.getInstance();
    this.serverModel = ServerModel.getInstance();
  }

  public static getInstance(): ServerMemberModel {
    if (!ServerMemberModel.instance) {
      ServerMemberModel.instance = new ServerMemberModel();
    }
    return ServerMemberModel.instance;
  }

  async create(memberData: Omit<ServerMember, 'id' | 'created_at' | 'joined_at'>): Promise<ServerMember> {
    // Verify that both user and server exist
    const user = await this.userModel.findById(memberData.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    const server = await this.serverModel.findById(memberData.server_id);
    if (!server) {
      throw new Error('Server not found');
    }

    // Check if user is already a member of the server
    const existingMember = await this.findByServerAndUser(memberData.server_id, memberData.user_id);
    if (existingMember) {
      throw new Error('User is already a member of this server');
    }

    const member: ServerMember = {
      ...memberData,
      id: uuidv4(),
      created_at: new Date(),
      joined_at: new Date(),
    };

    this.serverMembers.set(member.id, member);
    return member;
  }

  async findById(id: string): Promise<ServerMember | null> {
    return this.serverMembers.get(id) || null;
  }

  async findByServerAndUser(serverId: string, userId: string): Promise<ServerMember | null> {
    return Array.from(this.serverMembers.values()).find(
      member => member.server_id === serverId && member.user_id === userId
    ) || null;
  }

  async findByServerId(serverId: string): Promise<ServerMember[]> {
    return Array.from(this.serverMembers.values()).filter(member => member.server_id === serverId);
  }

  async findByUserId(userId: string): Promise<ServerMember[]> {
    return Array.from(this.serverMembers.values()).filter(member => member.user_id === userId);
  }

  async update(id: string, updateData: Partial<Omit<ServerMember, 'id' | 'created_at' | 'joined_at'>>): Promise<ServerMember | null> {
    const member = await this.findById(id);
    if (!member) return null;

    // If updating user_id, verify the new user exists
    if (updateData.user_id && updateData.user_id !== member.user_id) {
      const user = await this.userModel.findById(updateData.user_id);
      if (!user) {
        throw new Error('New user not found');
      }
    }

    // If updating server_id, verify the new server exists
    if (updateData.server_id && updateData.server_id !== member.server_id) {
      const server = await this.serverModel.findById(updateData.server_id);
      if (!server) {
        throw new Error('New server not found');
      }
    }

    const updatedMember: ServerMember = {
      ...member,
      ...updateData,
    };

    this.serverMembers.set(id, updatedMember);
    return updatedMember;
  }

  async updateRole(id: string, role: ServerMemberRole): Promise<ServerMember | null> {
    return this.update(id, { role });
  }

  async delete(id: string): Promise<boolean> {
    return this.serverMembers.delete(id);
  }

  async removeUserFromServer(serverId: string, userId: string): Promise<boolean> {
    const member = await this.findByServerAndUser(serverId, userId);
    if (!member) return false;
    return this.delete(member.id);
  }

  async getServerMembers(serverId: string): Promise<ServerMember[]> {
    return this.findByServerId(serverId);
  }

  async getUserServers(userId: string): Promise<ServerMember[]> {
    return this.findByUserId(userId);
  }
} 