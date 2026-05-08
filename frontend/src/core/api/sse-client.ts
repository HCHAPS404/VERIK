export type SseEvent<T = unknown> = {
  event: string;
  data: T;
};

export function parseEventBlock(block: string): SseEvent {
  const lines = block.split("\n");
  let event = "message";
  let dataText = "";

  for (const line of lines) {
    if (line.startsWith("event:")) event = line.replace("event:", "").trim();
    if (line.startsWith("data:")) dataText += line.replace("data:", "").trim();
  }

  let data: unknown = dataText;
  try {
    data = JSON.parse(dataText);
  } catch {
    // Keep raw text when JSON parsing fails.
  }

  return { event, data };
}

export async function* parseSSE(response: Response): AsyncGenerator<SseEvent> {
  if (!response.body) throw new Error("La respuesta SSE no tiene body.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let splitIndex = buffer.indexOf("\n\n");
    while (splitIndex !== -1) {
      const block = buffer.slice(0, splitIndex);
      buffer = buffer.slice(splitIndex + 2);
      if (block.trim().length > 0) yield parseEventBlock(block);
      splitIndex = buffer.indexOf("\n\n");
    }
  }
}
