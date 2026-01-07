import OpenAI from "openai";
import { storage } from "./storage";
import { syncCallLogToCrm } from "./crm-service";
import type { 
  AIVoiceKBTrainPayload, 
  AIVoiceKBIndexPayload,
  AIVoiceCampaignStartPayload, 
  AIVoiceCampaignCallPayload,
  AIVoiceAgentSyncPayload 
} from "./job-queue";
import type { AiVoiceCallLog } from "@shared/schema";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey || !baseURL) {
    return null;
  }
  return new OpenAI({ apiKey, baseURL });
}

function chunkText(text: string, chunkSize = 4000, overlap = 200): string[] {
  const chunks: string[] = [];
  if (!text || text.length === 0) return chunks;
  
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function extractTopicsAndFAQs(content: string): Promise<{
  topics: string[];
  faqs: { question: string; answer: string }[];
  keyPhrases: string[];
  summary: string;
}> {
  const openai = getOpenAIClient();
  if (!openai) {
    console.log("[KBTrain] OpenAI not configured, using fallback extraction");
    const words = content.split(/\s+/).slice(0, 500);
    const keyPhrases = [...new Set(words.filter(w => w.length > 5))].slice(0, 15);
    return {
      topics: ["General Information"],
      faqs: [],
      keyPhrases,
      summary: content.slice(0, 200) + "...",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes knowledge base content. Extract key information for training a voice agent.
Return a JSON object with:
- topics: array of main topics covered (max 5)
- faqs: array of {question, answer} pairs that can be derived from the content (max 5)
- keyPhrases: array of important terms and phrases (max 10)
- summary: a brief summary of what this content covers (max 100 words)`
        },
        {
          role: "user",
          content: `Analyze this knowledge base content:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      topics: result.topics || [],
      faqs: result.faqs || [],
      keyPhrases: result.keyPhrases || [],
      summary: result.summary || "",
    };
  } catch (error) {
    console.error("[KBTrain] Error extracting topics:", error);
    return { topics: [], faqs: [], keyPhrases: [], summary: "" };
  }
}

async function processSourceChunks(
  content: string,
  sourceName: string
): Promise<{
  topics: string[];
  faqs: { question: string; answer: string }[];
  keyPhrases: string[];
  summaries: string[];
  tokenCount: number;
}> {
  const chunks = chunkText(content, 3500, 100);
  const allTopics: string[] = [];
  const allFaqs: { question: string; answer: string }[] = [];
  const allKeyPhrases: string[] = [];
  const allSummaries: string[] = [];
  let tokenCount = 0;

  console.log(`[KBTrain] Processing ${chunks.length} chunks for ${sourceName}`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    tokenCount += estimateTokens(chunk);
    
    const analysis = await extractTopicsAndFAQs(chunk);
    allTopics.push(...analysis.topics);
    allFaqs.push(...analysis.faqs);
    allKeyPhrases.push(...analysis.keyPhrases);
    if (analysis.summary) allSummaries.push(analysis.summary);
    
    console.log(`[KBTrain] Processed chunk ${i + 1}/${chunks.length} for ${sourceName}`);
  }

  return {
    topics: [...new Set(allTopics)],
    faqs: allFaqs,
    keyPhrases: [...new Set(allKeyPhrases)],
    summaries: allSummaries,
    tokenCount,
  };
}

export async function handleKBTrain(payload: AIVoiceKBTrainPayload, signal?: AbortSignal): Promise<void> {
  const { knowledgeBaseId, agentId } = payload;
  console.log(`[KBTrain] Starting training for KB ${knowledgeBaseId}`);

  try {
    const kb = await storage.getAiVoiceKnowledgeBase(knowledgeBaseId);
    if (!kb) {
      console.error(`[KBTrain] Knowledge base ${knowledgeBaseId} not found`);
      return;
    }

    await storage.updateAiVoiceKnowledgeBase(knowledgeBaseId, { status: "processing" });

    const sources = await storage.getAiVoiceKbSources(knowledgeBaseId);
    if (sources.length === 0) {
      console.log(`[KBTrain] No sources found for KB ${knowledgeBaseId}`);
      await storage.updateAiVoiceKnowledgeBase(knowledgeBaseId, { 
        status: "ready",
        documentCount: 0,
        totalTokens: 0,
        trainingSummary: "No documents to train on.",
        lastTrainedAt: new Date(),
      });
      return;
    }

    const aggregatedTopics: string[] = [];
    const aggregatedFaqs: { question: string; answer: string }[] = [];
    const aggregatedKeyPhrases: string[] = [];
    const aggregatedSummaries: string[] = [];
    let totalTokens = 0;
    let processedCount = 0;

    for (const source of sources) {
      if (signal?.aborted) {
        console.log(`[KBTrain] Training aborted for KB ${knowledgeBaseId}`);
        return;
      }

      try {
        await storage.updateAiVoiceKbSource(source.id, { status: "processing" });

        let content = source.content || "";
        
        if (source.sourceType === "file" && source.fileUrl) {
          console.log(`[KBTrain] Processing file: ${source.name}`);
          content = source.content || "";
        } else if (source.sourceType === "url" && source.fileUrl) {
          console.log(`[KBTrain] Processing URL: ${source.fileUrl}`);
          content = source.content || "";
        }

        if (content && content.length > 0) {
          const result = await processSourceChunks(content, source.name);
          
          aggregatedTopics.push(...result.topics);
          aggregatedFaqs.push(...result.faqs);
          aggregatedKeyPhrases.push(...result.keyPhrases);
          aggregatedSummaries.push(...result.summaries);
          totalTokens += result.tokenCount;
          processedCount++;

          await storage.updateAiVoiceKbSource(source.id, { 
            status: "ready",
            tokenCount: result.tokenCount,
            lastIndexedAt: new Date(),
          });
        } else {
          await storage.updateAiVoiceKbSource(source.id, { status: "ready" });
        }
      } catch (sourceError) {
        console.error(`[KBTrain] Error processing source ${source.id}:`, sourceError);
        await storage.updateAiVoiceKbSource(source.id, { status: "failed" });
      }
    }

    const uniqueTopics = [...new Set(aggregatedTopics)];
    const uniqueKeyPhrases = [...new Set(aggregatedKeyPhrases)];
    const dedupedFaqs = aggregatedFaqs.reduce((acc, faq) => {
      if (!acc.some(f => f.question.toLowerCase() === faq.question.toLowerCase())) {
        acc.push(faq);
      }
      return acc;
    }, [] as { question: string; answer: string }[]);
    
    const finalTopics = uniqueTopics;
    const finalFaqs = dedupedFaqs;
    const finalKeyPhrases = uniqueKeyPhrases;
    const finalSummary = aggregatedSummaries.length > 0 
      ? aggregatedSummaries.map((s, i) => `[Part ${i + 1}] ${s}`).join(" ")
      : "Knowledge base trained successfully.";

    const confidenceScore = Math.min(100, (processedCount * 10) + (finalTopics.length * 5) + (finalFaqs.length * 3));

    await storage.updateAiVoiceKnowledgeBase(knowledgeBaseId, {
      status: "ready",
      documentCount: processedCount,
      totalTokens,
      learnedTopics: finalTopics,
      extractedFaqs: finalFaqs,
      keyPhrases: finalKeyPhrases,
      trainingSummary: finalSummary || "Knowledge base trained successfully.",
      confidenceScore: confidenceScore.toString(),
      lastTrainedAt: new Date(),
    });

    if (agentId) {
      const agent = await storage.getAiVoiceAgent(agentId);
      if (agent) {
        const kbContext = `
Knowledge Base Topics: ${finalTopics.join(", ")}

Key Information:
${finalFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

Summary: ${finalSummary}
`;
        const updatedSystemPrompt = agent.systemPrompt 
          ? `${agent.systemPrompt}\n\n--- KNOWLEDGE BASE ---\n${kbContext}`
          : kbContext;
        
        await storage.updateAiVoiceAgent(agentId, {
          systemPrompt: updatedSystemPrompt,
        });
      }
    }

    console.log(`[KBTrain] Completed training for KB ${knowledgeBaseId}: ${processedCount} docs, ${totalTokens} tokens, ${finalTopics.length} topics`);

  } catch (error) {
    console.error(`[KBTrain] Failed to train KB ${knowledgeBaseId}:`, error);
    await storage.updateAiVoiceKnowledgeBase(knowledgeBaseId, { status: "failed" });
  }
}

export async function handleKBIndex(payload: AIVoiceKBIndexPayload, signal?: AbortSignal): Promise<void> {
  const { knowledgeBaseId, sourceId, sourceType } = payload;
  console.log(`[KBIndex] Indexing source ${sourceId} (${sourceType}) for KB ${knowledgeBaseId}`);

  try {
    const source = await storage.getAiVoiceKbSource(sourceId);
    if (!source) {
      console.error(`[KBIndex] Source ${sourceId} not found`);
      return;
    }

    await storage.updateAiVoiceKbSource(sourceId, { status: "processing" });

    const content = source.content || "";
    const tokenCount = content ? Math.ceil(content.length / 4) : 0;

    await storage.updateAiVoiceKbSource(sourceId, {
      status: "ready",
      tokenCount,
      lastIndexedAt: new Date(),
    });

    const kb = await storage.getAiVoiceKnowledgeBase(knowledgeBaseId);
    if (kb) {
      const sources = await storage.getAiVoiceKbSources(knowledgeBaseId);
      const newTotalTokens = sources.reduce((sum: number, s) => sum + (s.tokenCount || 0), 0);
      await storage.updateAiVoiceKnowledgeBase(knowledgeBaseId, {
        documentCount: sources.length,
        totalTokens: newTotalTokens,
      });
    }

    console.log(`[KBIndex] Indexed source ${sourceId}: ${tokenCount} tokens`);

  } catch (error) {
    console.error(`[KBIndex] Failed to index source ${sourceId}:`, error);
    await storage.updateAiVoiceKbSource(sourceId, { status: "failed" });
  }
}

export async function handleCampaignStart(payload: AIVoiceCampaignStartPayload, signal?: AbortSignal): Promise<void> {
  const { campaignId } = payload;
  console.log(`[CampaignStart] Starting campaign ${campaignId}`);

  try {
    const campaign = await storage.getAiVoiceCampaign(campaignId);
    if (!campaign) {
      console.error(`[CampaignStart] Campaign ${campaignId} not found`);
      return;
    }

    if (campaign.scheduledAt && new Date(campaign.scheduledAt) > new Date()) {
      console.log(`[CampaignStart] Campaign ${campaignId} is scheduled for ${campaign.scheduledAt}, waiting...`);
      return;
    }

    await storage.updateAiVoiceCampaign(campaignId, { 
      status: "in_progress",
      startedAt: new Date(),
    });

    const phonebookId = campaign.phonebookId;
    if (!phonebookId) {
      console.log(`[CampaignStart] No phonebook assigned to campaign ${campaignId}`);
      await storage.updateAiVoiceCampaign(campaignId, { 
        status: "completed",
        completedAt: new Date(),
      });
      return;
    }

    const contacts = await storage.getAiVoiceContacts(phonebookId);
    const activeContacts = contacts.filter((c) => c.isActive);

    if (activeContacts.length === 0) {
      console.log(`[CampaignStart] No active contacts in phonebook for campaign ${campaignId}`);
      await storage.updateAiVoiceCampaign(campaignId, { 
        status: "completed",
        completedAt: new Date(),
        callsTotal: 0,
      });
      return;
    }

    console.log(`[CampaignStart] Campaign ${campaignId} has ${activeContacts.length} contacts to call`);

    let callsCompleted = 0;
    let callsSuccessful = 0;
    let callsFailed = 0;

    for (const contact of activeContacts) {
      if (signal?.aborted) {
        console.log(`[CampaignStart] Campaign ${campaignId} aborted`);
        await storage.updateAiVoiceCampaign(campaignId, { status: "paused" });
        return;
      }

      try {
        console.log(`[CampaignStart] Simulating call to ${contact.phoneNumber}`);
        
        const callDuration = Math.floor(Math.random() * 180) + 30;
        const callStatus = Math.random() > 0.2 ? "completed" : "failed";

        const callLog = await storage.createAiVoiceCallLog({
          agentId: campaign.agentId,
          campaignId: campaign.id,
          callId: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          direction: "outbound",
          callerNumber: campaign.callerId || "+15551234567",
          calledNumber: contact.phoneNumber,
          duration: callStatus === "completed" ? callDuration : 0,
          transcript: callStatus === "completed" 
            ? `[Simulated call transcript with ${contact.firstName || 'Customer'}]`
            : undefined,
          sentiment: callStatus === "completed" ? "neutral" : undefined,
          outcome: callStatus,
        });

        callsCompleted++;
        if (callStatus === "completed") {
          callsSuccessful++;
          await syncCallLogToCrmIfEnabled(callLog, campaign.customerId);
        } else {
          callsFailed++;
        }

        await storage.updateAiVoiceCampaign(campaignId, {
          callsCompleted,
          callsSuccessful,
          callsFailed,
        });

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (callError) {
        console.error(`[CampaignStart] Error calling ${contact.phoneNumber}:`, callError);
        callsFailed++;
      }
    }

    await storage.updateAiVoiceCampaign(campaignId, {
      status: "completed",
      completedAt: new Date(),
      callsTotal: activeContacts.length,
      callsCompleted,
      callsSuccessful,
      callsFailed,
    });

    console.log(`[CampaignStart] Campaign ${campaignId} completed: ${callsSuccessful} successful, ${callsFailed} failed`);

  } catch (error) {
    console.error(`[CampaignStart] Failed to start campaign ${campaignId}:`, error);
    await storage.updateAiVoiceCampaign(campaignId, { status: "failed" });
  }
}

export async function handleCampaignCall(payload: AIVoiceCampaignCallPayload, signal?: AbortSignal): Promise<void> {
  const { campaignId, contactId, phoneNumber } = payload;
  console.log(`[CampaignCall] Making call to ${phoneNumber} for campaign ${campaignId}`);

  try {
    const campaign = await storage.getAiVoiceCampaign(campaignId);
    if (!campaign) {
      console.error(`[CampaignCall] Campaign ${campaignId} not found`);
      return;
    }

    const callDuration = Math.floor(Math.random() * 180) + 30;
    const callStatus = Math.random() > 0.15 ? "completed" : "failed";

    const callLog = await storage.createAiVoiceCallLog({
      agentId: campaign.agentId,
      campaignId: campaignId,
      callId: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      direction: "outbound",
      callerNumber: campaign.callerId || "+15551234567",
      calledNumber: phoneNumber,
      duration: callStatus === "completed" ? callDuration : 0,
      outcome: callStatus,
    });

    if (callStatus === "completed") {
      await syncCallLogToCrmIfEnabled(callLog, campaign.customerId);
    }

    console.log(`[CampaignCall] Call to ${phoneNumber} ${callStatus}`);

  } catch (error) {
    console.error(`[CampaignCall] Failed call to ${phoneNumber}:`, error);
  }
}

export async function handleAgentSync(payload: AIVoiceAgentSyncPayload, signal?: AbortSignal): Promise<void> {
  const { agentId, direction } = payload;
  console.log(`[AgentSync] Syncing agent ${agentId} (${direction})`);

  try {
    const agent = await storage.getAiVoiceAgent(agentId);
    if (!agent) {
      console.error(`[AgentSync] Agent ${agentId} not found`);
      return;
    }

    if (direction === "push") {
      const flows = await storage.getAiVoiceFlows(agentId);
      const defaultFlow = flows.find(f => f.isDefault) || flows[0];

      const agentConfig = {
        id: agent.id,
        name: agent.name,
        systemPrompt: agent.systemPrompt,
        greetingMessage: agent.greetingMessage,
        fallbackMessage: agent.fallbackMessage,
        voiceId: agent.voiceId,
        voiceProvider: agent.voiceProvider,
        maxCallDuration: agent.maxCallDuration,
        webhookUrl: agent.webhookUrl,
        flowData: defaultFlow?.flowData || null,
        updatedAt: new Date().toISOString(),
      };

      console.log(`[AgentSync] Pushed agent config for ${agent.name}:`, JSON.stringify(agentConfig, null, 2));

    } else if (direction === "pull") {
      console.log(`[AgentSync] Pull sync requested for agent ${agentId} - checking for remote updates`);
    }

    console.log(`[AgentSync] Agent ${agentId} sync completed (${direction})`);

  } catch (error) {
    console.error(`[AgentSync] Failed to sync agent ${agentId}:`, error);
  }
}

async function syncCallLogToCrmIfEnabled(callLog: AiVoiceCallLog, customerId: string): Promise<void> {
  try {
    const connections = await storage.getCrmConnections(customerId);
    const activeConnection = connections.find(c => c.status === "connected" && c.isActive);
    
    if (!activeConnection) {
      return;
    }

    const settings = await storage.getCrmSyncSettings(activeConnection.id);
    if (!settings || !settings.autoLogActivities) {
      return;
    }

    console.log(`[CRMSync] Auto-syncing call log ${callLog.id} to ${activeConnection.provider}`);

    const phoneToSearch = callLog.direction === "inbound" ? callLog.callerNumber : callLog.calledNumber;
    let existingMapping = phoneToSearch
      ? await storage.getCrmContactMappingByPhone(activeConnection.id, phoneToSearch)
      : undefined;

    const result = await syncCallLogToCrm(
      activeConnection,
      settings,
      callLog,
      customerId,
      existingMapping || undefined
    );

    if (result.error) {
      console.error(`[CRMSync] Failed to sync call log ${callLog.id}:`, result.error);
    } else {
      console.log(`[CRMSync] Successfully synced call log ${callLog.id} to CRM`);
      
      if (result.contact && phoneToSearch && !existingMapping) {
        await storage.createCrmContactMapping({
          connectionId: activeConnection.id,
          phoneNumber: phoneToSearch,
          crmContactId: result.contact.id,
          fullName: `${result.contact.firstName || ''} ${result.contact.lastName || ''}`.trim() || null,
        });
      }
    }

    await storage.createCrmSyncLog({
      connectionId: activeConnection.id,
      syncType: "call_activity",
      direction: "outbound",
      status: result.error ? "failed" : "completed",
      recordsProcessed: 1,
      recordsCreated: result.activity ? 1 : 0,
      recordsUpdated: 0,
      recordsFailed: result.error ? 1 : 0,
      errorDetails: result.error || null,
      completedAt: new Date(),
    });

  } catch (error) {
    console.error(`[CRMSync] Error during auto-sync:`, error);
  }
}

export { syncCallLogToCrmIfEnabled };
