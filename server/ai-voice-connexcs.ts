const CX_BASE_URL = "https://app.connexcs.com/api/cp/";

interface StorageInterface {
  getIntegrationByProvider: (provider: string) => Promise<{ credentials?: unknown; isEnabled?: boolean | null } | undefined>;
}

interface ConnexCSCredentials {
  username: string;
  password: string;
  accessToken?: string;
  tokenExpiry?: number;
}

interface AIVoiceAgentConfig {
  id: string;
  name: string;
  type: "inbound" | "outbound" | "ivr" | "assistant";
  voice: string;
  language: string;
  greeting: string;
  systemPrompt: string;
  knowledgeBaseId?: string;
  maxCallDuration: number;
  enableRecording: boolean;
  enableTranscription: boolean;
}

interface AIVoiceFlowConfig {
  id: string;
  name: string;
  nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    condition?: string;
  }>;
}

interface AIVoiceKnowledgeEntry {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

interface ConnexCSVoiceHubAgent {
  id?: number;
  name: string;
  enabled: boolean;
  config: {
    provider: string;
    model: string;
    voice: string;
    language: string;
    system_prompt: string;
    greeting: string;
    max_duration: number;
    recording: boolean;
    transcription: boolean;
    knowledge_store_id?: number;
  };
}

interface ConnexCSIVRNode {
  id: string;
  type: "menu" | "prompt" | "transfer" | "hangup" | "ai_agent" | "condition";
  audio_file?: string;
  tts_text?: string;
  options?: Array<{ digit: string; next: string }>;
  next?: string;
  condition?: string;
  true_path?: string;
  false_path?: string;
}

interface ConnexCSIVR {
  id?: number;
  name: string;
  entry_node: string;
  nodes: ConnexCSIVRNode[];
}

interface ConnexCSKnowledgeStore {
  id?: number;
  name: string;
  description?: string;
  entries?: Array<{
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
}

export class AIVoiceConnexCSService {
  private credentials: ConnexCSCredentials | null = null;
  private mockMode = true;

  async loadCredentialsFromStorage(storage: StorageInterface): Promise<void> {
    try {
      const integration = await storage.getIntegrationByProvider("connexcs");
      if (integration?.credentials && integration.isEnabled) {
        const creds = integration.credentials as { username?: string; password?: string };
        if (creds.username && creds.password) {
          this.credentials = {
            username: creds.username,
            password: creds.password,
          };
          this.mockMode = false;
          console.log("[AI Voice ConnexCS] Credentials loaded successfully");
          return;
        }
      }
    } catch (error) {
      console.error("[AI Voice ConnexCS] Failed to load credentials:", error);
    }
    this.mockMode = true;
    console.log("[AI Voice ConnexCS] Running in mock mode - no credentials configured");
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  private async authenticate(): Promise<string> {
    if (!this.credentials) {
      throw new Error("ConnexCS credentials not configured");
    }

    if (this.credentials.accessToken && this.credentials.tokenExpiry && Date.now() < this.credentials.tokenExpiry) {
      return this.credentials.accessToken;
    }

    const authHeader = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString("base64");
    
    const response = await fetch(`${CX_BASE_URL}auth/login`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json() as { token: string };
    this.credentials.accessToken = data.token;
    this.credentials.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
    
    return data.token;
  }

  private async apiRequest<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    if (this.mockMode) {
      return this.getMockResponse<T>(endpoint, method);
    }

    const token = await this.authenticate();
    
    const response = await fetch(`${CX_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ConnexCS API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  private getMockResponse<T>(endpoint: string, method: string): T {
    const mockAgentId = Math.floor(Math.random() * 10000);
    const mockResponses: Record<string, unknown> = {
      "voicehub/agents": method === "GET" 
        ? [] 
        : { id: mockAgentId, success: true },
      "ivr": method === "GET" 
        ? [] 
        : { id: mockAgentId, success: true },
      "knowledge/stores": method === "GET" 
        ? [] 
        : { id: mockAgentId, success: true },
    };

    for (const [key, value] of Object.entries(mockResponses)) {
      if (endpoint.includes(key)) {
        console.log(`[AI Voice ConnexCS Mock] ${method} ${endpoint} -> mock response`);
        return value as T;
      }
    }

    return { success: true, mockMode: true } as T;
  }

  async syncAgentToConnexCS(agent: AIVoiceAgentConfig): Promise<{ connexcsId: number; success: boolean }> {
    const voiceHubAgent: ConnexCSVoiceHubAgent = {
      name: agent.name,
      enabled: true,
      config: {
        provider: "openai",
        model: "gpt-4o",
        voice: agent.voice,
        language: agent.language,
        system_prompt: agent.systemPrompt || `You are ${agent.name}, a helpful AI voice assistant.`,
        greeting: agent.greeting,
        max_duration: agent.maxCallDuration * 60,
        recording: agent.enableRecording,
        transcription: agent.enableTranscription,
      },
    };

    if (agent.knowledgeBaseId) {
      voiceHubAgent.config.knowledge_store_id = parseInt(agent.knowledgeBaseId, 10);
    }

    try {
      const result = await this.apiRequest<{ id: number; success?: boolean }>(
        "POST",
        "voicehub/agents",
        voiceHubAgent
      );

      console.log(`[AI Voice ConnexCS] Agent ${agent.name} synced with ConnexCS ID: ${result.id}`);
      return { connexcsId: result.id, success: true };
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to sync agent ${agent.name}:`, error);
      throw error;
    }
  }

  async updateAgentInConnexCS(connexcsId: number, agent: Partial<AIVoiceAgentConfig>): Promise<boolean> {
    const updatePayload: Partial<ConnexCSVoiceHubAgent> = {
      name: agent.name,
      config: {
        provider: "openai",
        model: "gpt-4o",
        voice: agent.voice || "nova",
        language: agent.language || "en-US",
        system_prompt: agent.systemPrompt || "",
        greeting: agent.greeting || "",
        max_duration: (agent.maxCallDuration || 30) * 60,
        recording: agent.enableRecording ?? true,
        transcription: agent.enableTranscription ?? true,
      },
    };

    try {
      await this.apiRequest("PATCH", `voicehub/agents/${connexcsId}`, updatePayload);
      console.log(`[AI Voice ConnexCS] Agent ${connexcsId} updated successfully`);
      return true;
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to update agent ${connexcsId}:`, error);
      return false;
    }
  }

  async deleteAgentFromConnexCS(connexcsId: number): Promise<boolean> {
    try {
      await this.apiRequest("DELETE", `voicehub/agents/${connexcsId}`);
      console.log(`[AI Voice ConnexCS] Agent ${connexcsId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to delete agent ${connexcsId}:`, error);
      return false;
    }
  }

  async publishFlowAsIVR(flow: AIVoiceFlowConfig): Promise<{ connexcsId: number; success: boolean }> {
    const ivrNodes: ConnexCSIVRNode[] = flow.nodes.map(node => {
      const baseNode: ConnexCSIVRNode = {
        id: node.id,
        type: this.mapNodeTypeToIVR(node.type),
      };

      switch (node.type) {
        case "greeting":
        case "message":
          baseNode.tts_text = (node.data.message as string) || "";
          break;
        case "menu":
          baseNode.tts_text = (node.data.prompt as string) || "Please select an option.";
          baseNode.options = (node.data.options as Array<{ digit: string; label: string }> || []).map(opt => ({
            digit: opt.digit,
            next: this.findNextNode(flow.edges, node.id, opt.digit) || "",
          }));
          break;
        case "transfer":
          baseNode.next = (node.data.destination as string) || "";
          break;
        case "condition":
          baseNode.condition = (node.data.condition as string) || "";
          const trueEdge = flow.edges.find(e => e.source === node.id && e.condition === "true");
          const falseEdge = flow.edges.find(e => e.source === node.id && e.condition === "false");
          baseNode.true_path = trueEdge?.target;
          baseNode.false_path = falseEdge?.target;
          break;
        case "ai_agent":
          baseNode.type = "ai_agent";
          break;
      }

      const nextEdge = flow.edges.find(e => e.source === node.id && !e.condition);
      if (nextEdge && !baseNode.next && !baseNode.options) {
        baseNode.next = nextEdge.target;
      }

      return baseNode;
    });

    const entryNode = flow.nodes.find(n => n.type === "start" || n.type === "greeting")?.id || flow.nodes[0]?.id;

    const ivr: ConnexCSIVR = {
      name: flow.name,
      entry_node: entryNode,
      nodes: ivrNodes,
    };

    try {
      const result = await this.apiRequest<{ id: number }>("POST", "ivr", ivr);
      console.log(`[AI Voice ConnexCS] Flow ${flow.name} published as IVR with ID: ${result.id}`);
      return { connexcsId: result.id, success: true };
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to publish flow ${flow.name}:`, error);
      throw error;
    }
  }

  private mapNodeTypeToIVR(type: string): ConnexCSIVRNode["type"] {
    const mapping: Record<string, ConnexCSIVRNode["type"]> = {
      greeting: "prompt",
      message: "prompt",
      menu: "menu",
      transfer: "transfer",
      end: "hangup",
      hangup: "hangup",
      condition: "condition",
      ai_agent: "ai_agent",
      ai_response: "ai_agent",
    };
    return mapping[type] || "prompt";
  }

  private findNextNode(edges: AIVoiceFlowConfig["edges"], sourceId: string, digit: string): string | undefined {
    const edge = edges.find(e => e.source === sourceId && e.condition === digit);
    return edge?.target;
  }

  async createKnowledgeStore(name: string, description?: string): Promise<{ connexcsId: number; success: boolean }> {
    const store: ConnexCSKnowledgeStore = {
      name,
      description,
    };

    try {
      const result = await this.apiRequest<{ id: number }>("POST", "knowledge/stores", store);
      console.log(`[AI Voice ConnexCS] Knowledge store ${name} created with ID: ${result.id}`);
      return { connexcsId: result.id, success: true };
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to create knowledge store ${name}:`, error);
      throw error;
    }
  }

  async pushKnowledgeEntries(storeId: number, entries: AIVoiceKnowledgeEntry[]): Promise<boolean> {
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      content: entry.content,
      metadata: entry.metadata,
    }));

    try {
      await this.apiRequest("POST", `knowledge/stores/${storeId}/entries`, { entries: formattedEntries });
      console.log(`[AI Voice ConnexCS] Pushed ${entries.length} entries to knowledge store ${storeId}`);
      return true;
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to push knowledge entries:`, error);
      return false;
    }
  }

  async deleteKnowledgeStore(storeId: number): Promise<boolean> {
    try {
      await this.apiRequest("DELETE", `knowledge/stores/${storeId}`);
      console.log(`[AI Voice ConnexCS] Knowledge store ${storeId} deleted`);
      return true;
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to delete knowledge store ${storeId}:`, error);
      return false;
    }
  }

  async assignDIDToAgent(didId: string, agentConnexcsId: number): Promise<boolean> {
    try {
      await this.apiRequest("PATCH", `did/${didId}`, {
        voicehub_agent_id: agentConnexcsId,
      });
      console.log(`[AI Voice ConnexCS] DID ${didId} assigned to agent ${agentConnexcsId}`);
      return true;
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to assign DID:`, error);
      return false;
    }
  }

  async getAgentCallStats(agentConnexcsId: number, startDate: string, endDate: string): Promise<{
    totalCalls: number;
    totalDuration: number;
    avgDuration: number;
    successRate: number;
  }> {
    if (this.mockMode) {
      return {
        totalCalls: Math.floor(Math.random() * 1000),
        totalDuration: Math.floor(Math.random() * 50000),
        avgDuration: Math.floor(Math.random() * 180) + 30,
        successRate: 85 + Math.random() * 10,
      };
    }

    try {
      const result = await this.apiRequest<{
        total_calls: number;
        total_duration: number;
        avg_duration: number;
        success_rate: number;
      }>("GET", `voicehub/agents/${agentConnexcsId}/stats?start=${startDate}&end=${endDate}`);
      
      return {
        totalCalls: result.total_calls,
        totalDuration: result.total_duration,
        avgDuration: result.avg_duration,
        successRate: result.success_rate,
      };
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to get agent stats:`, error);
      throw error;
    }
  }

  async getAgentCallLogs(agentConnexcsId: number, limit = 100): Promise<Array<{
    id: string;
    callId: string;
    phoneNumber: string;
    direction: "inbound" | "outbound";
    duration: number;
    status: string;
    timestamp: string;
    recordingUrl?: string;
    transcriptUrl?: string;
  }>> {
    if (this.mockMode) {
      return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `mock-${i}`,
        callId: `call-${Date.now()}-${i}`,
        phoneNumber: `+1555${String(i).padStart(7, "0")}`,
        direction: i % 2 === 0 ? "inbound" as const : "outbound" as const,
        duration: Math.floor(Math.random() * 300) + 30,
        status: "completed",
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      }));
    }

    try {
      const result = await this.apiRequest<Array<{
        id: string;
        call_id: string;
        phone_number: string;
        direction: string;
        duration: number;
        status: string;
        dt: string;
        recording_url?: string;
        transcript_url?: string;
      }>>("GET", `voicehub/agents/${agentConnexcsId}/calls?limit=${limit}`);

      return result.map(call => ({
        id: call.id,
        callId: call.call_id,
        phoneNumber: call.phone_number,
        direction: call.direction as "inbound" | "outbound",
        duration: call.duration,
        status: call.status,
        timestamp: call.dt,
        recordingUrl: call.recording_url,
        transcriptUrl: call.transcript_url,
      }));
    } catch (error) {
      console.error(`[AI Voice ConnexCS] Failed to get agent call logs:`, error);
      throw error;
    }
  }
}

export const aiVoiceConnexCS = new AIVoiceConnexCSService();
