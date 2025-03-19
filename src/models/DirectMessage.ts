import { v4 as uuidv4 } from 'uuid';
import { DirectMessage } from './types';
import { UserModel } from './User';

export class DirectMessageModel {
  private static instance: DirectMessageModel;
  private directMessages: Map<string, DirectMessage>;
  private userModel: UserModel;

  private constructor() {
    this.directMessages = new Map();
    this.userModel = UserModel.getInstance();
  }

  public static getInstance(): DirectMessageModel {
    if (!DirectMessageModel.instance) {
      DirectMessageModel.instance = new DirectMessageModel();
    }
    return DirectMessageModel.instance;
  }

  async create(messageData: Omit<DirectMessage, 'id' | 'created_at'>): Promise<DirectMessage> {
    // Verify that both sender and receiver exist
    const sender = await this.userModel.findById(messageData.sender_id);
    if (!sender) {
      throw new Error('Sender not found');
    }

    const receiver = await this.userModel.findById(messageData.receiver_id);
    if (!receiver) {
      throw new Error('Receiver not found');
    }

    // Prevent sending messages to yourself
    if (messageData.sender_id === messageData.receiver_id) {
      throw new Error('Cannot send direct messages to yourself');
    }

    const message: DirectMessage = {
      ...messageData,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.directMessages.set(message.id, message);
    return message;
  }

  async findById(id: string): Promise<DirectMessage | null> {
    return this.directMessages.get(id) || null;
  }

  async findBySenderId(senderId: string): Promise<DirectMessage[]> {
    return Array.from(this.directMessages.values())
      .filter(message => message.sender_id === senderId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async findByReceiverId(receiverId: string): Promise<DirectMessage[]> {
    return Array.from(this.directMessages.values())
      .filter(message => message.receiver_id === receiverId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async findByUserPair(userId1: string, userId2: string): Promise<DirectMessage[]> {
    return Array.from(this.directMessages.values())
      .filter(message => 
        (message.sender_id === userId1 && message.receiver_id === userId2) ||
        (message.sender_id === userId2 && message.receiver_id === userId1)
      )
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  async update(id: string, updateData: Partial<Omit<DirectMessage, 'id' | 'created_at'>>): Promise<DirectMessage | null> {
    const message = await this.findById(id);
    if (!message) return null;

    // If updating sender_id, verify the new sender exists
    if (updateData.sender_id && updateData.sender_id !== message.sender_id) {
      const sender = await this.userModel.findById(updateData.sender_id);
      if (!sender) {
        throw new Error('New sender not found');
      }
    }

    // If updating receiver_id, verify the new receiver exists
    if (updateData.receiver_id && updateData.receiver_id !== message.receiver_id) {
      const receiver = await this.userModel.findById(updateData.receiver_id);
      if (!receiver) {
        throw new Error('New receiver not found');
      }
    }

    // Prevent updating to send messages to yourself
    if (updateData.sender_id && updateData.receiver_id && updateData.sender_id === updateData.receiver_id) {
      throw new Error('Cannot send direct messages to yourself');
    }

    const updatedMessage: DirectMessage = {
      ...message,
      ...updateData,
    };

    this.directMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  async updateContent(id: string, content: string): Promise<DirectMessage | null> {
    return this.update(id, { content });
  }

  async updateFileUrl(id: string, fileUrl: string): Promise<DirectMessage | null> {
    return this.update(id, { file_url: fileUrl });
  }

  async delete(id: string): Promise<boolean> {
    return this.directMessages.delete(id);
  }

  async deleteUserMessages(userId: string): Promise<boolean> {
    const sentMessages = await this.findBySenderId(userId);
    const receivedMessages = await this.findByReceiverId(userId);
    let success = true;

    for (const message of [...sentMessages, ...receivedMessages]) {
      if (!await this.delete(message.id)) {
        success = false;
        break;
      }
    }

    return success;
  }

  async getConversation(userId1: string, userId2: string): Promise<DirectMessage[]> {
    return this.findByUserPair(userId1, userId2);
  }

  async getConversationWithPagination(
    userId1: string,
    userId2: string,
    limit: number = 50,
    before?: Date
  ): Promise<DirectMessage[]> {
    let messages = await this.findByUserPair(userId1, userId2);
    
    if (before) {
      messages = messages.filter(msg => msg.created_at < before);
    }
    
    return messages.slice(-limit);
  }

  async getSentMessages(userId: string): Promise<DirectMessage[]> {
    return this.findBySenderId(userId);
  }

  async getReceivedMessages(userId: string): Promise<DirectMessage[]> {
    return this.findByReceiverId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const messages = await this.findByReceiverId(userId);
    return messages.length;
  }
} 