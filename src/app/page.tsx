import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pipeline } from "@/components/landing/pipeline";
import { Embed } from "@/components/landing/embed";
import { Showcase } from "@/components/landing/showcase";
import { CtaFooter } from "@/components/landing/cta-footer";
import { ChatWidget } from "@/components/widget/chat-widget";
import { DEMO } from "@/lib/demo";

export default function HomePage() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Features />
      <Pipeline />
      <Embed />
      <Showcase />
      <CtaFooter />
      {/* The real embeddable widget, live on this page for the demo tenant. */}
      <ChatWidget publicKey={DEMO.publicKey} />
    </main>
  );
}
