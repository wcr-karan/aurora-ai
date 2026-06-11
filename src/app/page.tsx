import { Nav } from "@/components/landing/nav";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Story } from "@/components/landing/story";
import { Features } from "@/components/landing/features";
import { Embed } from "@/components/landing/embed";
import { Showcase } from "@/components/landing/showcase";
import { CtaFooter } from "@/components/landing/cta-footer";
import { ChatWidget } from "@/components/widget/chat-widget";
import { DEMO } from "@/lib/demo";

export default function HomePage() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav />
      {/* The story arc: hook → problem → journey → platform → proof → install → begin */}
      <Hero />
      <Problem />
      <Story />
      <Features />
      <Showcase />
      <Embed />
      <CtaFooter />
      {/* The real embeddable widget, live on this page for the demo tenant. */}
      <ChatWidget publicKey={DEMO.publicKey} />
    </main>
  );
}
