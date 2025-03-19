import { v4 as uuidv4 } from 'uuid';
import { Message } from './types';
import { ChannelModel } from './Channel';
import { UserModel } from './User';
import { ReactionModel } from './Reaction';

export class MessageModel {
  private static instance: MessageModel;
  private messages: Map<string, Message>;
  private channelModel: ChannelModel;
  private userModel: UserModel;
  private reactionModel: ReactionModel;

  private constructor() {
    this.messages = new Map();
    this.channelModel = ChannelModel.getInstance();
    this.userModel = UserModel.getInstance();
    this.reactionModel = ReactionModel.getInstance();
  }

  public static getInstance(): MessageModel {
    if (!MessageModel.instance) {
      MessageModel.instance = new MessageModel();
    }
    return MessageModel.instance;
  }

  async create(messageData: Omit<Message, 'id' | 'created_at' | 'reactions'>): Promise<Message> {
    // Verify that the channel exists
    const channel = await this.channelModel.findById(messageData.channel_id);
    if (!channel) {
      throw new Error('Channel not found');
    }

    // Verify that the user exists
    const user = await this.userModel.findById(messageData.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // If this is a reply, verify that the referenced message exists
    if (messageData.reply_to_id) {
      const replyToMessage = await this.findById(messageData.reply_to_id);
      if (!replyToMessage) {
        throw new Error('Reply message not found');
      }
    }

    const message: Message = {
      ...messageData,
      id: uuidv4(),
      created_at: new Date(),
      reactions: [],
    };

    this.messages.set(message.id, message);
    return message;
  }

  async findById(id: string): Promise<Message | null> {
    const message = this.messages.get(id);
    if (!message) return null;

    // Load reactions for the message
    const reactions = await this.reactionModel.findByMessageId(id);
    return { ...message, reactions };
  }

  async findByChannelId(channelId: string): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.channel_id === channelId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    // Load reactions for all messages
    const messagesWithReactions = await Promise.all(
      messages.map(async message => {
        const reactions = await this.reactionModel.findByMessageId(message.id);
        return { ...message, reactions };
      })
    );

    return messagesWithReactions;
  }

  async findByUserId(userId: string): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    // Load reactions for all messages
    const messagesWithReactions = await Promise.all(
      messages.map(async message => {
        const reactions = await this.reactionModel.findByMessageId(message.id);
        return { ...message, reactions };
      })
    );

    return messagesWithReactions;
  }

  async findByReplyToId(replyToId: string): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.reply_to_id === replyToId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    // Load reactions for all messages
    const messagesWithReactions = await Promise.all(
      messages.map(async message => {
        const reactions = await this.reactionModel.findByMessageId(message.id);
        return { ...message, reactions };
      })
    );

    return messagesWithReactions;
  }

  async update(id: string, updateData: Partial<Omit<Message, 'id' | 'created_at' | 'reactions'>>): Promise<Message | null> {
    const message = await this.findById(id);
    if (!message) return null;

    // If updating channel_id, verify the new channel exists
    if (updateData.channel_id && updateData.channel_id !== message.channel_id) {
      const channel = await this.channelModel.findById(updateData.channel_id);
      if (!channel) {
        throw new Error('New channel not found');
      }
    }

    // If updating user_id, verify the new user exists
    if (updateData.user_id && updateData.user_id !== message.user_id) {
      const user = await this.userModel.findById(updateData.user_id);
      if (!user) {
        throw new Error('New user not found');
      }
    }

    // If updating reply_to_id, verify the referenced message exists
    if (updateData.reply_to_id && updateData.reply_to_id !== message.reply_to_id) {
      const replyToMessage = await this.findById(updateData.reply_to_id);
      if (!replyToMessage) {
        throw new Error('Reply message not found');
      }
    }

    const updatedMessage: Message = {
      ...message,
      ...updateData,
    };

    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async updateContent(id: string, content: string): Promise<Message | null> {
    return this.update(id, { content });
  }

  async updateFileUrl(id: string, fileUrl: string): Promise<Message | null> {
    return this.update(id, { file_url: fileUrl });
  }

  async delete(id: string): Promise<boolean> {
    // Delete all reactions for this message
    await this.reactionModel.deleteMessageReactions(id);
    return this.messages.delete(id);
  }

  async deleteChannelMessages(channelId: string): Promise<boolean> {
    const messages = await this.findByChannelId(channelId);
    let success = true;
    for (const message of messages) {
      if (!await this.delete(message.id)) {
        success = false;
        break;
      }
    }
    return success;
  }

  async deleteUserMessages(userId: string): Promise<boolean> {
    const messages = await this.findByUserId(userId);
    let success = true;
    for (const message of messages) {
      if (!await this.delete(message.id)) {
        success = false;
        break;
      }
    }
    return success;
  }

  async getChannelMessages(channelId: string): Promise<Message[]> {
    return this.findByChannelId(channelId);
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    return this.findByUserId(userId);
  }

  async getMessageReplies(messageId: string): Promise<Message[]> {
    return this.findByReplyToId(messageId);
  }

  async getChannelMessagesWithPagination(
    channelId: string,
    limit: number = 50,
    before?: Date
  ): Promise<Message[]> {
    let messages = await this.findByChannelId(channelId);
    
    if (before) {
      messages = messages.filter(msg => msg.created_at < before);
    }
    
    return messages.slice(-limit);
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<Message | null> {
    const message = await this.findById(messageId);
    if (!message) return null;

    await this.reactionModel.create({
      message_id: messageId,
      user_id: userId,
      emoji,
    });

    return this.findById(messageId);
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<Message | null> {
    const message = await this.findById(messageId);
    if (!message) return null;

    const reaction = await this.reactionModel.findByMessageAndUserAndEmoji(messageId, userId, emoji);
    if (reaction) {
      await this.reactionModel.delete(reaction.id);
    }

    return this.findById(messageId);
  }

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<Message | null> {
    const message = await this.findById(messageId);
    if (!message) return null;

    await this.reactionModel.toggleReaction(messageId, userId, emoji);
    return this.findById(messageId);
  }
} 