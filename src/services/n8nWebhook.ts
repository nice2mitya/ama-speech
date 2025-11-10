export interface N8nRequest {
  audioBase64: string;
  format: string;
  timestamp: number;
  duration: number;
}

export interface N8nResponse {
  transcribedText: string;
  answer: string;
  error?: string;
}

export class N8nWebhookService {
  private webhookUrl: string;
  private timeout: number;

  constructor(webhookUrl: string, timeout = 30000) {
    this.webhookUrl = webhookUrl;
    this.timeout = timeout;
  }

  async sendAudio(request: N8nRequest): Promise<N8nResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as N8nResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - n8n webhook did not respond in time');
        }
        throw error;
      }

      throw new Error('Unknown error occurred while sending audio to n8n');
    }
  }

  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }
}
