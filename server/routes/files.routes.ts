import type { Express } from "express";
import { storage } from "../storage";
import { insertFileTemplateSchema } from "@shared/schema";

export function registerFilesRoutes(app: Express): void {
  // ==================== FILE TEMPLATES (PDF Generation) ====================

  app.get("/api/file-templates", async (req, res) => {
    try {
      const templates = await storage.getFileTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file templates" });
    }
  });

  app.get("/api/file-templates/:id", async (req, res) => {
    try {
      const template = await storage.getFileTemplate(req.params.id);
      if (!template) return res.status(404).json({ error: "File template not found" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file template" });
    }
  });

  app.post("/api/file-templates", async (req, res) => {
    try {
      const parsed = insertFileTemplateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const template = await storage.createFileTemplate(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "file_templates",
        recordId: template.id,
        newValues: template,
      });
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create file template" });
    }
  });

  app.patch("/api/file-templates/:id", async (req, res) => {
    try {
      const oldTemplate = await storage.getFileTemplate(req.params.id);
      if (!oldTemplate) return res.status(404).json({ error: "File template not found" });
      const template = await storage.updateFileTemplate(req.params.id, req.body);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "file_templates",
        recordId: req.params.id,
        oldValues: oldTemplate,
        newValues: template,
      });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update file template" });
    }
  });

  app.delete("/api/file-templates/:id", async (req, res) => {
    try {
      const oldTemplate = await storage.getFileTemplate(req.params.id);
      if (!oldTemplate) return res.status(404).json({ error: "File template not found" });
      const deleted = await storage.deleteFileTemplate(req.params.id);
      if (!deleted) return res.status(404).json({ error: "File template not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "file_templates",
        recordId: req.params.id,
        oldValues: oldTemplate,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file template" });
    }
  });

  // ==================== SIP TEST AUDIO FILES ====================

  app.get("/api/sip-test-audio-files", async (_req, res) => {
    try {
      const files = await storage.getSipTestAudioFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audio files" });
    }
  });

  app.get("/api/sip-test-audio-files/:id", async (req, res) => {
    try {
      const file = await storage.getSipTestAudioFile(req.params.id);
      if (!file) return res.status(404).json({ error: "Audio file not found" });
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audio file" });
    }
  });

  app.post("/api/sip-test-audio-files", async (req, res) => {
    try {
      const file = await storage.createSipTestAudioFile({
        name: req.body.name,
        description: req.body.description,
        filename: req.body.name?.toLowerCase().replace(/\s+/g, '-') || 'audio-file',
        fileUrl: req.body.fileUrl,
        fileSize: req.body.fileSize,
        duration: req.body.durationSeconds || req.body.duration,
        format: req.body.format || 'wav',
        isActive: req.body.isActive ?? true,
      });
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to create audio file" });
    }
  });

  app.patch("/api/sip-test-audio-files/:id", async (req, res) => {
    try {
      const file = await storage.updateSipTestAudioFile(req.params.id, req.body);
      if (!file) return res.status(404).json({ error: "Audio file not found" });
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to update audio file" });
    }
  });

  app.delete("/api/sip-test-audio-files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestAudioFile(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Audio file not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete audio file" });
    }
  });

  // ==================== SIP TEST PROFILES ====================

  app.get("/api/sip-test-profiles", async (_req, res) => {
    try {
      const profiles = await storage.getSipTestProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profiles" });
    }
  });

  app.post("/api/sip-test-profiles", async (req, res) => {
    try {
      const profile = await storage.createSipTestProfile({
        name: req.body.name,
        ip: req.body.ip,
        port: req.body.port || 5060,
        protocol: req.body.protocol || 'SIP',
        username: req.body.username,
        password: req.body.password,
        isDefault: req.body.isDefault || false,
        isActive: req.body.isActive ?? true,
      });
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.delete("/api/sip-test-profiles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestProfile(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Profile not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete profile" });
    }
  });
}
