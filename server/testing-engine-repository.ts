import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  testModules,
  testPages,
  testFeatures,
  testCases,
  testRuns,
  testRunResults,
  InsertTestModule,
  InsertTestPage,
  InsertTestFeature,
  InsertTestCase,
  InsertTestRun,
  InsertTestRunResult,
  TestModule,
  TestPage,
  TestFeature,
  TestCase,
  TestRun,
  TestRunResult,
} from "@shared/schema";

export const testingEngineRepository = {
  // ==================== MODULES ====================
  async getModules(): Promise<TestModule[]> {
    return db.select().from(testModules).orderBy(asc(testModules.order));
  },

  async getModuleById(id: string): Promise<TestModule | undefined> {
    const [module] = await db.select().from(testModules).where(eq(testModules.id, id));
    return module;
  },

  async getModuleBySlug(slug: string): Promise<TestModule | undefined> {
    const [module] = await db.select().from(testModules).where(eq(testModules.slug, slug));
    return module;
  },

  async createModule(data: InsertTestModule): Promise<TestModule> {
    const [module] = await db.insert(testModules).values(data).returning();
    return module;
  },

  async updateModule(id: string, data: Partial<InsertTestModule>): Promise<TestModule | undefined> {
    const [module] = await db.update(testModules).set(data).where(eq(testModules.id, id)).returning();
    return module;
  },

  async deleteModule(id: string): Promise<void> {
    await db.delete(testModules).where(eq(testModules.id, id));
  },

  // ==================== PAGES ====================
  async getPages(moduleId?: string): Promise<TestPage[]> {
    if (moduleId) {
      return db.select().from(testPages).where(eq(testPages.moduleId, moduleId)).orderBy(asc(testPages.order));
    }
    return db.select().from(testPages).orderBy(asc(testPages.order));
  },

  async getPageById(id: string): Promise<TestPage | undefined> {
    const [page] = await db.select().from(testPages).where(eq(testPages.id, id));
    return page;
  },

  async createPage(data: InsertTestPage): Promise<TestPage> {
    const [page] = await db.insert(testPages).values(data).returning();
    return page;
  },

  async updatePage(id: string, data: Partial<InsertTestPage>): Promise<TestPage | undefined> {
    const [page] = await db.update(testPages).set(data).where(eq(testPages.id, id)).returning();
    return page;
  },

  async deletePage(id: string): Promise<void> {
    await db.delete(testPages).where(eq(testPages.id, id));
  },

  // ==================== FEATURES ====================
  async getFeatures(pageId?: string): Promise<TestFeature[]> {
    if (pageId) {
      return db.select().from(testFeatures).where(eq(testFeatures.pageId, pageId)).orderBy(asc(testFeatures.order));
    }
    return db.select().from(testFeatures).orderBy(asc(testFeatures.order));
  },

  async getFeatureById(id: string): Promise<TestFeature | undefined> {
    const [feature] = await db.select().from(testFeatures).where(eq(testFeatures.id, id));
    return feature;
  },

  async createFeature(data: InsertTestFeature): Promise<TestFeature> {
    const [feature] = await db.insert(testFeatures).values(data).returning();
    return feature;
  },

  async updateFeature(id: string, data: Partial<InsertTestFeature>): Promise<TestFeature | undefined> {
    const [feature] = await db.update(testFeatures).set(data).where(eq(testFeatures.id, id)).returning();
    return feature;
  },

  async deleteFeature(id: string): Promise<void> {
    await db.delete(testFeatures).where(eq(testFeatures.id, id));
  },

  // ==================== TEST CASES ====================
  async getTestCases(featureId?: string): Promise<TestCase[]> {
    if (featureId) {
      return db.select().from(testCases).where(eq(testCases.featureId, featureId)).orderBy(asc(testCases.order));
    }
    return db.select().from(testCases).orderBy(asc(testCases.order));
  },

  async getTestCaseById(id: string): Promise<TestCase | undefined> {
    const [testCase] = await db.select().from(testCases).where(eq(testCases.id, id));
    return testCase;
  },

  async createTestCase(data: InsertTestCase): Promise<TestCase> {
    const [testCase] = await db.insert(testCases).values(data).returning();
    return testCase;
  },

  async updateTestCase(id: string, data: Partial<InsertTestCase>): Promise<TestCase | undefined> {
    const [testCase] = await db.update(testCases).set(data).where(eq(testCases.id, id)).returning();
    return testCase;
  },

  async deleteTestCase(id: string): Promise<void> {
    await db.delete(testCases).where(eq(testCases.id, id));
  },

  // ==================== TEST RUNS ====================
  async getTestRuns(limit: number = 50): Promise<TestRun[]> {
    return db.select().from(testRuns).orderBy(desc(testRuns.createdAt)).limit(limit);
  },

  async getTestRunById(id: string): Promise<TestRun | undefined> {
    const [run] = await db.select().from(testRuns).where(eq(testRuns.id, id));
    return run;
  },

  async createTestRun(data: InsertTestRun): Promise<TestRun> {
    const [run] = await db.insert(testRuns).values(data).returning();
    return run;
  },

  async updateTestRun(id: string, data: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const [run] = await db.update(testRuns).set(data).where(eq(testRuns.id, id)).returning();
    return run;
  },

  async deleteTestRun(id: string): Promise<void> {
    await db.delete(testRuns).where(eq(testRuns.id, id));
  },

  // ==================== TEST RUN RESULTS ====================
  async getTestRunResults(runId: string): Promise<TestRunResult[]> {
    return db.select().from(testRunResults).where(eq(testRunResults.runId, runId)).orderBy(asc(testRunResults.executedAt));
  },

  async createTestRunResult(data: InsertTestRunResult): Promise<TestRunResult> {
    const [result] = await db.insert(testRunResults).values(data).returning();
    return result;
  },

  // ==================== HIERARCHICAL QUERIES ====================
  async getModuleWithPages(moduleId: string): Promise<{ module: TestModule; pages: TestPage[] } | null> {
    const module = await this.getModuleById(moduleId);
    if (!module) return null;
    const pages = await this.getPages(moduleId);
    return { module, pages };
  },

  async getPageWithFeatures(pageId: string): Promise<{ page: TestPage; features: TestFeature[] } | null> {
    const page = await this.getPageById(pageId);
    if (!page) return null;
    const features = await this.getFeatures(pageId);
    return { page, features };
  },

  async getFeatureWithTestCases(featureId: string): Promise<{ feature: TestFeature; testCases: TestCase[] } | null> {
    const feature = await this.getFeatureById(featureId);
    if (!feature) return null;
    const cases = await this.getTestCases(featureId);
    return { feature, testCases: cases };
  },

  async getFullHierarchy(): Promise<{
    modules: Array<TestModule & { pages: Array<TestPage & { features: Array<TestFeature & { testCases: TestCase[] }> }> }>;
  }> {
    const modules = await this.getModules();
    const pages = await this.getPages();
    const features = await this.getFeatures();
    const cases = await this.getTestCases();

    const featuresWithCases = features.map(f => ({
      ...f,
      testCases: cases.filter(c => c.featureId === f.id),
    }));

    const pagesWithFeatures = pages.map(p => ({
      ...p,
      features: featuresWithCases.filter(f => f.pageId === p.id),
    }));

    const modulesWithPages = modules.map(m => ({
      ...m,
      pages: pagesWithFeatures.filter(p => p.moduleId === m.id),
    }));

    return { modules: modulesWithPages };
  },

  // ==================== COUNT QUERIES ====================
  async getTestCasesCountByModule(moduleId: string): Promise<number> {
    const pages = await this.getPages(moduleId);
    let count = 0;
    for (const page of pages) {
      const features = await this.getFeatures(page.id);
      for (const feature of features) {
        const cases = await this.getTestCases(feature.id);
        count += cases.length;
      }
    }
    return count;
  },

  async getTestCasesCountByPage(pageId: string): Promise<number> {
    const features = await this.getFeatures(pageId);
    let count = 0;
    for (const feature of features) {
      const cases = await this.getTestCases(feature.id);
      count += cases.length;
    }
    return count;
  },
};
