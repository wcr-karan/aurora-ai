import { z } from "zod";
import {
  PERSONALITIES,
  PRIORITIES,
  TICKET_STATUS,
} from "./constants";

export const registerSchema = z.object({
  businessName: z.string().min(2, "Business name is too short").max(80),
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const configSchema = z.object({
  botName: z.string().min(1).max(60),
  welcomeMessage: z.string().min(1).max(400),
  personality: z.enum(PERSONALITIES),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color like #6366f1"),
  suggestedQuestions: z.array(z.string().min(1).max(120)).max(8),
  escalationKeywords: z.array(z.string().min(1).max(40)).max(30),
  autoEscalateAngry: z.boolean(),
  autoEscalateHuman: z.boolean(),
});

export const chatSchema = z.object({
  sessionId: z.string().min(6).max(80),
  message: z.string().min(1, "Message is empty").max(2000),
  customerName: z.string().max(80).optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export const widgetChatSchema = chatSchema.extend({
  publicKey: z.string().min(6),
});

export const createTicketSchema = z.object({
  customerName: z.string().min(1).max(80),
  customerEmail: z.string().email(),
  subject: z.string().min(1).max(140),
  query: z.string().min(1).max(2000),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  category: z.string().max(40).optional(),
  conversationId: z.string().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUS).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assignedToId: z.string().nullable().optional(),
});

export const inviteAgentSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["OWNER", "AGENT"]).default("AGENT"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ConfigInput = z.infer<typeof configSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
