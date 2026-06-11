/**
 * Stable identifiers for the seeded demo tenant. The marketing site's live chat
 * demo and the embeddable-widget showcase both call the public API with this
 * key, and the README publishes these admin credentials for evaluators.
 */
export const DEMO = {
  businessName: "Aurora Outdoors",
  publicKey: "pk_demo_aurora_outdoors_public",
  adminName: "Maya Chen",
  adminEmail: "admin@aurora.demo",
  adminPassword: "Password123!",
  agentName: "Sam Rivera",
  agentEmail: "agent@aurora.demo",
  agentPassword: "Password123!",
} as const;
