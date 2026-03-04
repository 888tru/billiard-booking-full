import { addSSEListener, removeSSEListener } from "@/lib/mock-data";
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (type: string, data: unknown) => {
        try { controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)); } catch {}
      };
      send("connected", { ts: Date.now() });
      const hb = setInterval(() => { try { send("heartbeat", { ts: Date.now() }); } catch { clearInterval(hb); } }, 15000);
      addSSEListener(send);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}

