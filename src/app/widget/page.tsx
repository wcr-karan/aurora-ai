import { ChatWidget } from "@/components/widget/chat-widget";
import { TransparentBody } from "./transparent-body";

// The iframe target injected by /widget.js. Renders the floating widget with a
// transparent page background so only the launcher + panel are visible.
export default async function WidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (!key) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center text-sm text-ink-3">
        Missing widget key. Add <code className="mono">?key=pk_…</code> to the URL.
      </div>
    );
  }

  return (
    <TransparentBody>
      <ChatWidget publicKey={key} />
    </TransparentBody>
  );
}
