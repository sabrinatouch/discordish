import { v4 as uuidv4 } from 'uuid';
import { Channel, ChannelType } from './types';
import { ServerModel } from './Server';

export class ChannelModel {
  private static instance: ChannelModel;
  private channels: Map<string, Channel>;
  private serverModel: ServerModel;

  private constructor() {
    this.channels = new Map();
    this.serverModel = ServerModel.getInstance();
  }

  public static getInstance(): ChannelModel {
    if (!ChannelModel.instance) {
      ChannelModel.instance = new ChannelModel();
    }
    return ChannelModel.instance;
  }

  async create(channelData: Omit<Channel, 'id' | 'created_at'>): Promise<Channel> {
    // Verify that the server exists
    const server = await this.serverModel.findById(channelData.server_id);
    if (!server) {
      throw new Error('Server not found');
    }

    // Check if a channel with the same name exists in the server
    const existingChannel = await this.findByNameInServer(channelData.server_id, channelData.name);
    if (existingChannel) {
      throw new Error('A channel with this name already exists in this server');
    }

    const channel: Channel = {
      ...channelData,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.channels.set(channel.id, channel);
    return channel;
  }

  async findById(id: string): Promise<Channel | null> {
    return this.channels.get(id) || null;
  }

  async findByNameInServer(serverId: string, name: string): Promise<Channel | null> {
    return Array.from(this.channels.values()).find(
      channel => channel.server_id === serverId && channel.name === name
    ) || null;
  }

  async findByServerId(serverId: string): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(channel => channel.server_id === serverId);
  }

  async findByServerIdAndType(serverId: string, type: ChannelType): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      channel => channel.server_id === serverId && channel.type === type
    );
  }

  async update(id: string, updateData: Partial<Omit<Channel, 'id' | 'created_at'>>): Promise<Channel | null> {
    const channel = await this.findById(id);
    if (!channel) return null;

    // If updating server_id, verify the new server exists
    if (updateData.server_id && updateData.server_id !== channel.server_id) {
      const server = await this.serverModel.findById(updateData.server_id);
      if (!server) {
        throw new Error('New server not found');
      }
    }

    // If updating name, check for duplicates in the server
    if (updateData.name && updateData.name !== channel.name) {
      const existingChannel = await this.findByNameInServer(
        updateData.server_id || channel.server_id,
        updateData.name
      );
      if (existingChannel) {
        throw new Error('A channel with this name already exists in this server');
      }
    }

    const updatedChannel: Channel = {
      ...channel,
      ...updateData,
    };

    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }

  async updateName(id: string, name: string): Promise<Channel | null> {
    return this.update(id, { name });
  }

  async updateType(id: string, type: ChannelType): Promise<Channel | null> {
    return this.update(id, { type });
  }

  async delete(id: string): Promise<boolean> {
    return this.channels.delete(id);
  }

  async deleteServerChannels(serverId: string): Promise<boolean> {
    const channels = await this.findByServerId(serverId);
    let success = true;
    for (const channel of channels) {
      if (!await this.delete(channel.id)) {
        success = false;
        break;
      }
    }
    return success;
  }

  async getServerChannels(serverId: string): Promise<Channel[]> {
    return this.findByServerId(serverId);
  }

  async getServerTextChannels(serverId: string): Promise<Channel[]> {
    return this.findByServerIdAndType(serverId, ChannelType.TEXT);
  }

  async getServerVoiceChannels(serverId: string): Promise<Channel[]> {
    return this.findByServerIdAndType(serverId, ChannelType.VOICE);
  }
} 