import { v4 as uuidv4 } from 'uuid';
import { Reaction } from './types';
import { UserModel } from './User';
import { MessageModel } from './Message';

export class ReactionModel {
  private static instance: ReactionModel;
  private reactions: Map<string, Reaction>;
  private userModel: UserModel;
  private messageModel: MessageModel;

  private constructor() {
    this.reactions = new Map();
    this.userModel = UserModel.getInstance();
    this.messageModel = MessageModel.getInstance();
  }

  public static getInstance(): ReactionModel {
    if (!ReactionModel.instance) {
      ReactionModel.instance = new ReactionModel();
    }
    return ReactionModel.instance;
  }

  async create(reactionData: Omit<Reaction, 'id' | 'created_at'>): Promise<Reaction> {
    // Verify that both user and message exist
    const user = await this.userModel.findById(reactionData.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    const message = await this.messageModel.findById(reactionData.message_id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has already reacted with this emoji
    const existingReaction = await this.findByMessageAndUserAndEmoji(
      reactionData.message_id,
      reactionData.user_id,
      reactionData.emoji
    );
    if (existingReaction) {
      throw new Error('User has already reacted with this emoji');
    }

    const reaction: Reaction = {
      ...reactionData,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.reactions.set(reaction.id, reaction);
    return reaction;
  }

  async findById(id: string): Promise<Reaction | null> {
    return this.reactions.get(id) || null;
  }

  async findByMessageId(messageId: string): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.message_id === messageId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  async findByUserId(userId: string): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async findByMessageAndUserAndEmoji(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<Reaction | null> {
    return Array.from(this.reactions.values()).find(
      reaction =>
        reaction.message_id === messageId &&
        reaction.user_id === userId &&
        reaction.emoji === emoji
    ) || null;
  }

  async update(id: string, updateData: Partial<Omit<Reaction, 'id' | 'created_at'>>): Promise<Reaction | null> {
    const reaction = await this.findById(id);
    if (!reaction) return null;

    // If updating user_id, verify the new user exists
    if (updateData.user_id && updateData.user_id !== reaction.user_id) {
      const user = await this.userModel.findById(updateData.user_id);
      if (!user) {
        throw new Error('New user not found');
      }
    }

    // If updating message_id, verify the new message exists
    if (updateData.message_id && updateData.message_id !== reaction.message_id) {
      const message = await this.messageModel.findById(updateData.message_id);
      if (!message) {
        throw new Error('New message not found');
      }
    }

    // If updating emoji, check for duplicate reactions
    if (updateData.emoji && updateData.emoji !== reaction.emoji) {
      const existingReaction = await this.findByMessageAndUserAndEmoji(
        updateData.message_id || reaction.message_id,
        updateData.user_id || reaction.user_id,
        updateData.emoji
      );
      if (existingReaction) {
        throw new Error('User has already reacted with this emoji');
      }
    }

    const updatedReaction: Reaction = {
      ...reaction,
      ...updateData,
    };

    this.reactions.set(id, updatedReaction);
    return updatedReaction;
  }

  async delete(id: string): Promise<boolean> {
    return this.reactions.delete(id);
  }

  async deleteMessageReactions(messageId: string): Promise<boolean> {
    const reactions = await this.findByMessageId(messageId);
    let success = true;
    for (const reaction of reactions) {
      if (!await this.delete(reaction.id)) {
        success = false;
        break;
      }
    }
    return success;
  }

  async deleteUserReactions(userId: string): Promise<boolean> {
    const reactions = await this.findByUserId(userId);
    let success = true;
    for (const reaction of reactions) {
      if (!await this.delete(reaction.id)) {
        success = false;
        break;
      }
    }
    return success;
  }

  async getMessageReactions(messageId: string): Promise<Reaction[]> {
    return this.findByMessageId(messageId);
  }

  async getUserReactions(userId: string): Promise<Reaction[]> {
    return this.findByUserId(userId);
  }

  async getReactionCount(messageId: string, emoji: string): Promise<number> {
    const reactions = await this.findByMessageId(messageId);
    return reactions.filter(reaction => reaction.emoji === emoji).length;
  }

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<Reaction | null> {
    const existingReaction = await this.findByMessageAndUserAndEmoji(messageId, userId, emoji);
    if (existingReaction) {
      await this.delete(existingReaction.id);
      return null;
    }
    return this.create({ message_id: messageId, user_id: userId, emoji });
  }
} 