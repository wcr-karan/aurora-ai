/**
 * Seeds the demo tenant "Aurora Outdoors":
 *  - owner + agent accounts (RBAC)
 *  - bot configuration
 *  - the sample knowledge base (parsed, chunked, embedded with the offline embedder)
 *  - realistic conversations, events, tickets and query logs spread over 14 days
 *    so every dashboard, analytics chart and kanban lane is populated on first run.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO } from "../src/lib/demo";
import { ingestText } from "../src/lib/ai/ingest";
import { slugify } from "../src/lib/ids";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;
const KB_DIR = join(process.cwd(), "sample-knowledge-base");

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n: number, hour = rand(8, 20)) => {
  const d = new Date(Date.now() - n * DAY);
  d.setHours(hour, rand(0, 59), 0, 0);
  return d;
};

const DOCS = [
  { name: "shipping-and-tracking.md", refCount: 52 },
  { name: "returns-and-refunds.md", refCount: 38 },
  { name: "products-and-pricing.md", refCount: 44 },
  { name: "warranty-and-care.md", refCount: 17 },
  { name: "account-and-support.md", refCount: 26 },
];

const CUSTOMERS = [
  { name: "Liam Patel", email: "liam.patel@example.com" },
  { name: "Sofia Rossi", email: "sofia.rossi@example.com" },
  { name: "Noah Kim", email: "noah.kim@example.com" },
  { name: "Emma Schmidt", email: "emma.s@example.com" },
  { name: "Arjun Mehta", email: "arjun.mehta@example.com" },
  { name: "Olivia Brown", email: "olivia.brown@example.com" },
  { name: "Yuki Tanaka", email: "yuki.tanaka@example.com" },
  { name: "Carlos Díaz", email: "carlos.diaz@example.com" },
  { name: "Hannah Lee", email: "hannah.lee@example.com" },
  { name: "Tom Fischer", email: "tom.fischer@example.com" },
];

const RESOLVED_Q = [
  "How long does standard shipping take?",
  "What's your return policy?",
  "How do I track my order?",
  "Compare the Ridgeline 2 and Summit Pro 2 tents",
  "What does the Summit membership include?",
  "How do I care for my sleeping bag?",
  "Do you offer price matching?",
  "What are your support hours?",
  "How do I start a return?",
  "Is the Breeze 1 good for winter?",
];

const ESCALATION_MSGS: { msg: string; reason: string; label: string; priority: string }[] = [
  { msg: "I was charged twice for my order and I'm really frustrated!", reason: "payment_failure", label: "Payment failure", priority: "HIGH" },
  { msg: "I want a refund for my Basecamp 4 tent, it arrived torn.", reason: "refund_requested", label: "Refund requested", priority: "HIGH" },
  { msg: "Your website is completely down and I can't check out!", reason: "service_outage", label: "Service outage", priority: "URGENT" },
  { msg: "This is unacceptable, I've been waiting 3 weeks. I want to speak to a human now.", reason: "human_requested", label: "Human agent requested", priority: "HIGH" },
  { msg: "I'm considering legal action over my lost package and the GDPR handling of my data.", reason: "legal_concern", label: "Legal concern", priority: "URGENT" },
];

const FAILED_Q = [
  "Do you ship to Antarctica?",
  "Can I pay with Dogecoin?",
  "Do your tents come in camo print?",
  "Is there a student discount?",
  "Can I rent a kayak from you?",
  "What's the R-value of the Breeze 1 footprint?",
  "Do you have physical stores in Berlin?",
  "Can I gift a membership to a friend?",
  "Is the Summit Pro 2 fire retardant certified?",
  "Do you offer corporate bulk orders?",
];

async function main() {
  console.log("🌱 Seeding demo tenant…");

  // Clean any prior demo tenant (cascades to all child rows).
  await prisma.business.deleteMany({ where: { publicKey: DEMO.publicKey } });

  const passwordHash = await bcrypt.hash(DEMO.adminPassword, 10);
  const agentHash = await bcrypt.hash(DEMO.agentPassword, 10);

  const business = await prisma.business.create({
    data: {
      name: DEMO.businessName,
      slug: slugify(DEMO.businessName),
      publicKey: DEMO.publicKey,
      config: {
        create: {
          botName: "Aurora Assistant",
          welcomeMessage:
            "Hi! 👋 I'm Aurora Outdoors' assistant. Ask me about orders, returns, gear, or warranties — I'm trained on our help center.",
          personality: "Friendly",
          accentColor: "#5b8cff",
          suggestedQuestions: JSON.stringify([
            "How do I track my order?",
            "What's your return policy?",
            "Compare your tent models",
            "I want a refund — I'm furious",
          ]),
          escalationKeywords: JSON.stringify(["cancel my account", "chargeback", "data breach"]),
        },
      },
      users: {
        create: [
          { name: DEMO.adminName, email: DEMO.adminEmail, passwordHash, role: "OWNER" },
          { name: DEMO.agentName, email: DEMO.agentEmail, passwordHash: agentHash, role: "AGENT" },
        ],
      },
    },
  });
  const businessId = business.id;

  // ── Knowledge base ─────────────────────────────────────────────────────────
  console.log("📚 Ingesting sample knowledge base…");
  for (const d of DOCS) {
    const text = readFileSync(join(KB_DIR, d.name), "utf-8");
    const doc = await prisma.document.create({
      data: {
        businessId,
        name: d.name,
        type: "MD",
        sizeBytes: Buffer.byteLength(text),
        status: "PROCESSING",
        refCount: d.refCount,
        createdAt: daysAgo(rand(10, 14)),
      },
    });
    await ingestText({ businessId, documentId: doc.id, text });
  }

  // ── Showcase conversations (rich, recent transcripts) ───────────────────────
  console.log("💬 Creating conversations…");
  await richConversation(businessId, {
    customer: CUSTOMERS[0],
    channel: "WIDGET",
    daysAgoStart: 0,
    turns: [
      { user: "How long does standard shipping take?", ai: "Standard shipping takes **5–7 business days** and is **free on orders over $75**. Orders placed before 1pm ET on a business day ship the same day. 📦", sources: ["shipping-and-tracking.md"] },
      { user: "And how do I track it?", ai: "Once it ships, you'll get an email titled \"Your Aurora order is on its way\". Tap **Track package**, or check the Orders page with your order number (format `AO-XXXXXX`) and checkout email.", sources: ["shipping-and-tracking.md"] },
    ],
    resolved: true,
  });

  await richConversation(businessId, {
    customer: CUSTOMERS[1],
    channel: "WIDGET",
    daysAgoStart: 1,
    turns: [
      {
        user: "What are your membership plans?",
        ai: "Here are our Aurora membership plans:",
        cards: [
          { title: "Trail", badge: "$9/mo", fields: [{ label: "Free shipping", value: "Over $50" }, { label: "Discount", value: "5%" }] },
          { title: "Summit", badge: "$29/mo", fields: [{ label: "Free shipping", value: "Always" }, { label: "Discount", value: "12%" }] },
          { title: "Guide", badge: "$59/mo", fields: [{ label: "Free shipping", value: "Always" }, { label: "Discount", value: "20%" }] },
        ],
        sources: ["products-and-pricing.md"],
      },
    ],
    resolved: true,
  });

  await richConversation(businessId, {
    customer: CUSTOMERS[2],
    channel: "WHATSAPP",
    daysAgoStart: 2,
    turns: [
      { user: "I was charged twice and I'm really frustrated!", ai: "I'm really sorry about that. A duplicate charge needs a human on it, so I've flagged this and our billing team will reach out to you shortly. 🙏", escalate: true, escalationLabel: "Payment failure" },
    ],
    escalate: { reason: "payment_failure", label: "Payment failure", priority: "HIGH" },
  });

  await richConversation(businessId, {
    customer: CUSTOMERS[3],
    channel: "WIDGET",
    daysAgoStart: 0,
    turns: [
      { user: "Compare the Ridgeline 2 and Summit Pro 2", ai: "Here's how they stack up:\n\n| Model | Capacity | Weight | Seasons | Price |\n| --- | --- | --- | --- | --- |\n| Ridgeline 2 | 2 person | 1.9 kg | 3 | $329 |\n| Summit Pro 2 | 2 person | 2.4 kg | 4 | $449 |\n\nThe **Ridgeline 2** is our best seller for backpackers. For winter or high-altitude trips, the 4-season **Summit Pro 2** is the better pick.", sources: ["products-and-pricing.md"] },
    ],
    resolved: true,
  });

  // ── Bulk conversations over 14 days ─────────────────────────────────────────
  for (let day = 13; day >= 0; day--) {
    const count = rand(2, 6) + (13 - day > 8 ? 2 : 0); // gentle upward trend
    for (let i = 0; i < count; i++) {
      const escalate = Math.random() < 0.16;
      const customer = Math.random() < 0.75 ? pick(CUSTOMERS) : null;
      const channel = pick(["WIDGET", "WIDGET", "WIDGET", "WHATSAPP", "EMAIL"]);

      if (escalate) {
        const e = pick(ESCALATION_MSGS);
        await richConversation(businessId, {
          customer: customer ?? CUSTOMERS[0],
          channel,
          daysAgoStart: day,
          turns: [{ user: e.msg, ai: "I've escalated this to our team — a human will follow up with you shortly.", escalate: true, escalationLabel: e.label }],
          escalate: { reason: e.reason, label: e.label, priority: e.priority },
          createTicketAt: day,
        });
      } else {
        await richConversation(businessId, {
          customer,
          channel,
          daysAgoStart: day,
          turns: [{ user: pick(RESOLVED_Q), ai: "Here's what I found in our help center for you. 👍", sources: [pick(DOCS).name] }],
          resolved: true,
        });
      }
    }
  }

  // ── Unanswered queries (knowledge gaps) ─────────────────────────────────────
  for (const q of FAILED_Q) {
    await prisma.queryLog.create({
      data: { businessId, question: q, answered: false, topScore: Math.random() * 0.04, createdAt: daysAgo(rand(0, 13)) },
    });
    await prisma.event.create({
      data: { businessId, type: "FAILED_QUERY", summary: `Unanswered: "${q}"`, createdAt: daysAgo(rand(0, 13)) },
    });
  }

  // ── A few standalone tickets to fill the kanban lanes ───────────────────────
  const seedTickets = [
    { subject: "Wrong size tent delivered", priority: "HIGH", status: "IN_PROGRESS", category: "Returns", source: "EMAIL" },
    { subject: "Membership won't cancel", priority: "MEDIUM", status: "OPEN", category: "Billing", source: "WIDGET" },
    { subject: "Sleeping bag zipper broke", priority: "LOW", status: "RESOLVED", category: "Warranty", source: "WIDGET" },
    { subject: "Discount code not applying", priority: "MEDIUM", status: "IN_PROGRESS", category: "Billing", source: "WIDGET" },
    { subject: "Package marked delivered but missing", priority: "HIGH", status: "OPEN", category: "Shipping", source: "WHATSAPP" },
    { subject: "Request invoice for expense report", priority: "LOW", status: "CLOSED", category: "Billing", source: "EMAIL" },
  ];
  for (const t of seedTickets) {
    const c = pick(CUSTOMERS);
    await prisma.ticket.create({
      data: {
        businessId,
        customerName: c.name,
        customerEmail: c.email,
        subject: t.subject,
        query: t.subject + ". Please help.",
        priority: t.priority,
        status: t.status,
        category: t.category,
        source: t.source,
        createdAt: daysAgo(rand(0, 9)),
      },
    });
  }

  const [conv, msgs, tickets, qlogs] = await Promise.all([
    prisma.conversation.count({ where: { businessId } }),
    prisma.message.count({ where: { businessId } }),
    prisma.ticket.count({ where: { businessId } }),
    prisma.queryLog.count({ where: { businessId } }),
  ]);

  console.log("\n✅ Seed complete:");
  console.log(`   ${DOCS.length} documents · ${conv} conversations · ${msgs} messages · ${tickets} tickets · ${qlogs} query logs`);
  console.log("\n🔑 Admin credentials:");
  console.log(`   Owner: ${DEMO.adminEmail} / ${DEMO.adminPassword}`);
  console.log(`   Agent: ${DEMO.agentEmail} / ${DEMO.agentPassword}`);
  console.log(`   Widget key: ${DEMO.publicKey}\n`);
}

interface Turn {
  user: string;
  ai: string;
  sources?: string[];
  cards?: { title: string; badge?: string; fields?: { label: string; value: string }[] }[];
  escalate?: boolean;
  escalationLabel?: string;
}

async function richConversation(
  businessId: string,
  opts: {
    customer: { name: string; email: string } | null;
    channel: string;
    daysAgoStart: number;
    turns: Turn[];
    resolved?: boolean;
    escalate?: { reason: string; label: string; priority: string };
    createTicketAt?: number;
  }
) {
  const base = daysAgo(opts.daysAgoStart);
  const conversation = await prisma.conversation.create({
    data: {
      businessId,
      sessionId: `seed_${Math.random().toString(36).slice(2, 11)}`,
      channel: opts.channel,
      customerName: opts.customer?.name,
      customerEmail: opts.customer?.email,
      status: opts.escalate ? "ESCALATED" : "ACTIVE",
      escalated: !!opts.escalate,
      resolvedByAI: !!opts.resolved && !opts.escalate,
      messageCount: opts.turns.length * 2,
      createdAt: base,
      lastMessageAt: new Date(base.getTime() + opts.turns.length * 60000),
    },
  });

  let t = base.getTime();
  for (const turn of opts.turns) {
    t += 30000;
    await prisma.message.create({
      data: { businessId, conversationId: conversation.id, role: "USER", content: turn.user, createdAt: new Date(t) },
    });
    t += 30000;
    await prisma.message.create({
      data: {
        businessId,
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: turn.ai,
        latencyMs: rand(180, 850),
        createdAt: new Date(t),
        meta: JSON.stringify({
          sources: (turn.sources ?? []).map((name) => ({ documentName: name, score: 0.3 + Math.random() * 0.4 })),
          cards: turn.cards,
          escalate: turn.escalate,
          escalationLabel: turn.escalationLabel,
        }),
      },
    });
    await prisma.queryLog.create({
      data: {
        businessId,
        question: turn.user,
        answered: !turn.escalate,
        topScore: turn.escalate ? Math.random() * 0.05 : 0.3 + Math.random() * 0.4,
        createdAt: new Date(t),
      },
    });
  }

  if (opts.escalate) {
    await prisma.event.create({
      data: {
        businessId,
        conversationId: conversation.id,
        type: "ESCALATION",
        summary: opts.escalate.label,
        data: JSON.stringify({ reason: opts.escalate.reason, priority: opts.escalate.priority }),
        createdAt: new Date(t),
      },
    });
    if (opts.createTicketAt !== undefined || opts.customer) {
      const customer = opts.customer ?? CUSTOMERS[0];
      const ticket = await prisma.ticket.create({
        data: {
          businessId,
          conversationId: conversation.id,
          customerName: customer.name,
          customerEmail: customer.email,
          subject: opts.turns[0].user.slice(0, 70),
          query: opts.turns[0].user,
          priority: opts.escalate.priority,
          reason: opts.escalate.reason,
          category: opts.escalate.label,
          source: opts.channel,
          status: pick(["OPEN", "OPEN", "IN_PROGRESS"]),
          createdAt: new Date(t),
        },
      });
      await prisma.event.create({
        data: {
          businessId,
          conversationId: conversation.id,
          type: "TICKET_CREATED",
          summary: `Ticket opened: ${ticket.subject}`,
          data: JSON.stringify({ ticketId: ticket.id }),
          createdAt: new Date(t + 1000),
        },
      });
    }
  } else if (opts.resolved) {
    await prisma.event.create({
      data: {
        businessId,
        conversationId: conversation.id,
        type: "RESOLVED",
        summary: "Resolved by AI",
        createdAt: new Date(t),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
