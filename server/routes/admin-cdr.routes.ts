import type { Express } from "express";
import { connexcs } from "../connexcs";

export function registerAdminCdrRoutes(app: Express): void {
  // ==================== CDR (Call Detail Records) ====================

  app.get("/api/cdrs", async (req, res) => {
    try {
      const { customerId, startDate, endDate, direction, limit = '100', offset = '0' } = req.query;
      
      if (connexcs.isMockMode()) {
        const mockCdrs = [];
        const now = new Date();
        for (let i = 0; i < 50; i++) {
          const startTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
          const duration = Math.floor(Math.random() * 600);
          const endTime = new Date(startTime.getTime() + duration * 1000);
          const answerTime = Math.random() > 0.2 ? new Date(startTime.getTime() + 2000) : null;
          const rate = (Math.random() * 0.05 + 0.01).toFixed(6);
          const cost = (duration / 60 * parseFloat(rate)).toFixed(6);
          
          mockCdrs.push({
            id: `cdr-${i + 1}`,
            customerId: `cust-${Math.floor(Math.random() * 10) + 1}`,
            callId: `call-${Date.now()}-${i}`,
            callerNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
            calledNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
            direction: Math.random() > 0.5 ? 'outbound' : 'inbound',
            startTime: startTime.toISOString(),
            answerTime: answerTime?.toISOString() || null,
            endTime: endTime.toISOString(),
            duration,
            billableSeconds: Math.ceil(duration / 6) * 6,
            rate,
            cost,
            carrierId: `carrier-${Math.floor(Math.random() * 5) + 1}`,
            routeId: `route-${Math.floor(Math.random() * 3) + 1}`,
            sipResponseCode: answerTime ? 200 : [404, 480, 486, 503][Math.floor(Math.random() * 4)],
            hangupCause: answerTime ? 'NORMAL_CLEARING' : ['NO_ROUTE_DESTINATION', 'USER_BUSY', 'NO_ANSWER', 'SERVICE_UNAVAILABLE'][Math.floor(Math.random() * 4)],
            createdAt: startTime.toISOString(),
          });
        }
        
        let filtered = mockCdrs;
        if (customerId) filtered = filtered.filter(c => c.customerId === customerId);
        if (direction) filtered = filtered.filter(c => c.direction === direction);
        if (startDate) filtered = filtered.filter(c => new Date(c.startTime) >= new Date(String(startDate)));
        if (endDate) filtered = filtered.filter(c => new Date(c.startTime) <= new Date(String(endDate)));
        
        filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        
        const total = filtered.length;
        const paginated = filtered.slice(parseInt(String(offset)), parseInt(String(offset)) + parseInt(String(limit)));
        
        res.json({
          data: paginated,
          total,
          limit: parseInt(String(limit)),
          offset: parseInt(String(offset)),
        });
      } else {
        const cdrs = await connexcs.getCDRs({
          start_date: startDate ? String(startDate) : undefined,
          end_date: endDate ? String(endDate) : undefined,
          customer_id: customerId ? String(customerId) : undefined,
          destination: direction ? String(direction) : undefined,
          limit: parseInt(String(limit)),
        });
        const offsetNum = parseInt(String(offset));
        const limitNum = parseInt(String(limit));
        const paginated = cdrs.slice(offsetNum, offsetNum + limitNum);
        res.json({ data: paginated, total: cdrs.length, limit: limitNum, offset: offsetNum });
      }
    } catch (error) {
      console.error("CDRs fetch error:", error);
      res.status(500).json({ error: "Failed to fetch CDRs" });
    }
  });

  app.get("/api/cdrs/stats/summary", async (req, res) => {
    try {
      res.json({
        totalCalls: 15234,
        answeredCalls: 12456,
        failedCalls: 2778,
        totalDuration: 8456789,
        totalCost: 1245.67,
        avgDuration: 678,
        asr: 81.8,
        acd: 135,
        ner: 94.2,
      });
    } catch (error) {
      console.error("CDR stats error:", error);
      res.status(500).json({ error: "Failed to fetch CDR stats" });
    }
  });

  app.get("/api/cdrs/:id", async (req, res) => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 600);
      
      res.json({
        id: req.params.id,
        customerId: 'cust-1',
        callId: `call-${Date.now()}`,
        callerNumber: '+14155551234',
        calledNumber: '+14155555678',
        direction: 'outbound',
        startTime: startTime.toISOString(),
        answerTime: new Date(startTime.getTime() + 2000).toISOString(),
        endTime: new Date(startTime.getTime() + duration * 1000).toISOString(),
        duration,
        billableSeconds: Math.ceil(duration / 6) * 6,
        rate: '0.012000',
        cost: (duration / 60 * 0.012).toFixed(6),
        carrierId: 'carrier-1',
        routeId: 'route-1',
        sipResponseCode: 200,
        hangupCause: 'NORMAL_CLEARING',
        createdAt: startTime.toISOString(),
      });
    } catch (error) {
      console.error("CDR fetch error:", error);
      res.status(500).json({ error: "Failed to fetch CDR" });
    }
  });
}
