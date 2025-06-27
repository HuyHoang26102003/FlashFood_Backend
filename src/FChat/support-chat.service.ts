import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from 'src/redis/redis.service';
import { Enum_UserType } from 'src/types/Payload';

export interface SupportSession {
  sessionId: string;
  userId: string;
  userType: Enum_UserType;
  agentId?: string;
  status: 'waiting' | 'active' | 'ended' | 'transferred' | 'escalated';
  startTime: Date;
  endTime?: Date;
  chatMode: 'bot' | 'human';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  subcategory?: string;
  tags?: string[];
  customerSatisfaction?: number;
  resolution?: string;
  transferHistory?: AgentTransfer[];
  slaDeadline?: Date;
  waitTime?: number;
  responseTime?: number;
  escalationReason?: string;
  metadata?: Record<string, any>;
}

export interface AgentTransfer {
  timestamp: Date;
  fromAgentId?: string;
  toAgentId: string;
  reason: string;
  transferType: 'manual' | 'automatic' | 'escalation';
}

export interface QueueItem {
  sessionId: string;
  userId: string;
  userType: Enum_UserType;
  priority: number;
  timestamp: Date;
  estimatedWaitTime?: number;
  category?: string;
  requiredSkills?: string[];
  language?: string;
  previousAgentId?: string;
  escalationLevel: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  skills: string[];
  languages: string[];
  currentSessions: number;
  maxSessions: number;
  performanceRating: number;
  specializations: string[];
  isOnline: boolean;
  lastActivity: Date;
  totalHandledSessions: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
  tier: 'tier1' | 'tier2' | 'tier3' | 'supervisor';
}

export interface SupportMetrics {
  totalSessions: number;
  activeSessions: number;
  waitingInQueue: number;
  averageWaitTime: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
  escalationRate: number;
  resolutionRate: number;
  agentUtilization: number;
}

@Injectable()
export class SupportChatService {
  private activeSessions = new Map<string, SupportSession>();
  private supportQueue: QueueItem[] = [];
  private agents = new Map<string, Agent>();
  private sessionMetrics = new Map<string, any>();
  private categoryHandlers = new Map<string, string[]>();
  private slaRules = new Map<string, number>();

  constructor(
    private eventEmitter: EventEmitter2,
    private redisService: RedisService
  ) {
    this.initializeCategoryHandlers();
    this.initializeSLARules();
    this.startPeriodicTasks();
  }

  private initializeCategoryHandlers() {
    this.categoryHandlers.set('order_issue', [
      'order_management',
      'refunds',
      'logistics'
    ]);
    this.categoryHandlers.set('payment_issue', [
      'billing',
      'payment_processing'
    ]);
    this.categoryHandlers.set('technical_issue', [
      'technical_support',
      'app_development'
    ]);
    this.categoryHandlers.set('driver_support', [
      'driver_management',
      'navigation',
      'vehicle_support'
    ]);
    this.categoryHandlers.set('restaurant_support', [
      'restaurant_management',
      'menu_support',
      'analytics'
    ]);
    this.categoryHandlers.set('account_issue', [
      'account_management',
      'verification'
    ]);
    this.categoryHandlers.set('complaint', [
      'complaint_handling',
      'customer_relations'
    ]);
    this.categoryHandlers.set('emergency', ['emergency_response', 'safety']);
  }

  private initializeSLARules() {
    // SLA times in minutes
    this.slaRules.set('urgent', 5);
    this.slaRules.set('high', 15);
    this.slaRules.set('medium', 60);
    this.slaRules.set('low', 240);
  }

  private startPeriodicTasks() {
    // Check SLA violations every minute
    setInterval(() => {
      this.checkSLAViolations();
    }, 60000);

    // Update queue positions every 30 seconds
    setInterval(() => {
      this.updateQueueEstimates();
    }, 30000);

    // Cleanup old sessions every hour
    setInterval(() => {
      this.cleanupOldSessions();
    }, 3600000);
  }

  // Enhanced session management
  async startSupportSession(
    userId: string,
    userType: Enum_UserType,
    category?: string,
    priority?: 'low' | 'medium' | 'high' | 'urgent',
    metadata?: Record<string, any>
  ): Promise<SupportSession> {
    const sessionId = `support_${userId}_${Date.now()}`;

    // Determine priority based on user type and category
    const sessionPriority = this.determinePriority(
      userType,
      category,
      priority
    );

    // Calculate SLA deadline
    const slaMinutes = this.slaRules.get(sessionPriority) || 60;
    const slaDeadline = new Date(Date.now() + slaMinutes * 60000);

    const session: SupportSession = {
      sessionId,
      userId,
      userType,
      status: 'waiting',
      startTime: new Date(),
      chatMode: 'bot',
      priority: sessionPriority,
      category,
      tags: [],
      transferHistory: [],
      slaDeadline,
      metadata: metadata || {}
    };

    // Save session
    this.activeSessions.set(sessionId, session);
    await this.redisService.set(
      `support_session:${sessionId}`,
      JSON.stringify(session),
      86400 * 1000 // 24 hours TTL
    );

    // Initialize metrics
    this.sessionMetrics.set(sessionId, {
      messagesExchanged: 0,
      botInteractions: 0,
      humanInteractions: 0,
      escalationAttempts: 0,
      transferCount: 0
    });

    // Emit session started event
    this.eventEmitter.emit('supportSessionStarted', {
      sessionId,
      userId,
      userType,
      priority: sessionPriority,
      category
    });

    return session;
  }

  // Enhanced human agent request with skill-based routing
  async requestHumanAgent(
    sessionId: string,
    category?: string,
    requiredSkills?: string[],
    escalationReason?: string
  ): Promise<{
    success: boolean;
    agentId?: string;
    position?: number;
    estimatedWaitTime?: number;
  }> {
    console.log(`📡 Fetching session for human agent request: ${sessionId}`);
    const session = await this.getSession(sessionId);
    if (!session) {
      console.log(`❌ Session not found for human agent request: ${sessionId}`);
      return { success: false };
    }

    // Update session category if provided
    if (category) {
      session.category = category;
    }

    // Determine required skills
    const skills =
      requiredSkills ||
      this.getRequiredSkills(session.category, session.userType);

    // Find optimal agent
    const availableAgent = this.findOptimalAgent(
      skills,
      session.userType,
      session.priority
    );

    if (availableAgent) {
      console.log(`✅ Found available agent: ${availableAgent.id}`);
      // Assign agent immediately
      const success = await this.assignAgentToSession(
        session,
        availableAgent.id
      );

      if (success) {
        session.waitTime = Date.now() - session.startTime.getTime();
        return {
          success: true,
          agentId: availableAgent.id
        };
      }
    }

    console.log(`⏳ No available agent, adding to queue: ${sessionId}`);
    // Add to queue with enhanced queueing
    const queueItem: QueueItem = {
      sessionId,
      userId: session.userId,
      userType: session.userType,
      priority: this.calculateQueuePriority(session),
      timestamp: new Date(),
      category: session.category,
      requiredSkills: skills,
      escalationLevel: session.transferHistory?.length || 0
    };

    this.supportQueue.push(queueItem);
    this.sortQueue();

    // Calculate queue position and estimated wait time
    const position =
      this.supportQueue.findIndex(item => item.sessionId === sessionId) + 1;
    const estimatedWaitTime = this.calculateEstimatedWaitTime(queueItem);

    // Update session
    session.chatMode = 'human';
    session.status = 'waiting';
    if (escalationReason) {
      session.escalationReason = escalationReason;
    }

    this.activeSessions.set(sessionId, session);
    await this.redisService.set(
      `support_session:${sessionId}`,
      JSON.stringify(session),
      86400 * 1000
    );

    return {
      success: false,
      position,
      estimatedWaitTime
    };
  }

  // Enhanced agent management
  async registerAgent(agentData: Partial<Agent>): Promise<Agent> {
    const agent: Agent = {
      id: agentData.id!,
      name: agentData.name || '',
      email: agentData.email || '',
      status: 'available',
      skills: agentData.skills || [],
      languages: agentData.languages || ['en'],
      currentSessions: 0,
      maxSessions: agentData.maxSessions || 3,
      performanceRating: agentData.performanceRating || 5.0,
      specializations: agentData.specializations || [],
      isOnline: true,
      lastActivity: new Date(),
      totalHandledSessions: 0,
      averageResponseTime: 0,
      customerSatisfactionScore: 0,
      tier: agentData.tier || 'tier1'
    };

    this.agents.set(agent.id, agent);
    await this.redisService.set(
      `agent:${agent.id}`,
      JSON.stringify(agent),
      86400 * 1000
    );

    return agent;
  }

  async agentAvailable(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.status = 'available';
    agent.isOnline = true;
    agent.lastActivity = new Date();

    await this.redisService.set(
      `agent:${agentId}`,
      JSON.stringify(agent),
      86400 * 1000
    );

    // Process queue for this agent
    await this.processQueueForAgent(agentId);
  }

  async agentUnavailable(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.status = 'offline';
    agent.isOnline = false;
    agent.lastActivity = new Date();

    // Transfer any active sessions
    const agentSessions = Array.from(this.activeSessions.values()).filter(
      session => session.agentId === agentId && session.status === 'active'
    );

    for (const session of agentSessions) {
      await this.transferSession(
        session.sessionId,
        undefined,
        'agent_unavailable'
      );
    }
  }

  // Advanced session operations
  async transferSession(
    sessionId: string,
    toAgentId?: string,
    reason?: string,
    transferType: 'manual' | 'automatic' | 'escalation' = 'manual'
  ): Promise<boolean> {
    console.log(`📡 Fetching session for transfer: ${sessionId}`);
    const session = await this.getSession(sessionId);
    if (!session) {
      console.log(`❌ Session not found for transfer: ${sessionId}`);
      return false;
    }

    const fromAgentId = session.agentId;

    // Free up current agent
    if (fromAgentId) {
      const fromAgent = this.agents.get(fromAgentId);
      if (fromAgent) {
        fromAgent.currentSessions--;
        if (fromAgent.currentSessions === 0) {
          fromAgent.status = 'available';
        }
      }
    }

    // Find new agent if not specified
    if (!toAgentId) {
      const skills = this.getRequiredSkills(session.category, session.userType);
      const optimalAgent = this.findOptimalAgent(
        skills,
        session.userType,
        session.priority
      );
      toAgentId = optimalAgent?.id;
    }

    if (!toAgentId) {
      // Add back to queue
      const result = await this.requestHumanAgent(
        sessionId,
        session.category,
        undefined,
        reason
      );
      return result.success;
    }

    // Record transfer
    const transfer: AgentTransfer = {
      timestamp: new Date(),
      fromAgentId,
      toAgentId,
      reason: reason || 'transfer_requested',
      transferType
    };

    session.transferHistory = session.transferHistory || [];
    session.transferHistory.push(transfer);

    // Assign to new agent
    const success = await this.assignAgentToSession(session, toAgentId);

    if (success) {
      // Update metrics
      const metrics = this.sessionMetrics.get(sessionId);
      if (metrics) {
        metrics.transferCount++;
      }

      // Emit transfer event
      this.eventEmitter.emit('sessionTransferred', {
        sessionId,
        fromAgentId,
        toAgentId,
        reason,
        transferType
      });
    }

    return success;
  }

  async escalateSession(
    sessionId: string,
    reason: string,
    targetTier?: 'tier2' | 'tier3' | 'supervisor'
  ): Promise<boolean> {
    console.log(`📡 Fetching session for escalation: ${sessionId}`);
    const session = await this.getSession(sessionId);
    if (!session) {
      console.log(`❌ Session not found for escalation: ${sessionId}`);
      return false;
    }

    session.status = 'escalated';
    session.escalationReason = reason;
    session.priority =
      session.priority === 'urgent'
        ? 'urgent'
        : session.priority === 'high'
          ? 'high'
          : 'high';

    // Find supervisor or higher tier agent
    const tier =
      targetTier || (session.priority === 'urgent' ? 'supervisor' : 'tier2');
    const supervisorAgents = Array.from(this.agents.values())
      .filter(agent => agent.tier === tier && agent.status === 'available')
      .sort((a, b) => b.performanceRating - a.performanceRating);

    if (supervisorAgents.length > 0) {
      return await this.transferSession(
        sessionId,
        supervisorAgents[0].id,
        reason,
        'escalation'
      );
    }

    // Add to priority queue
    const queueItem = this.supportQueue.find(
      item => item.sessionId === sessionId
    );
    if (queueItem) {
      queueItem.priority += 1000; // Escalation priority boost
      queueItem.escalationLevel++;
      this.sortQueue();
    }

    // Update session in Redis
    this.activeSessions.set(sessionId, session);
    await this.redisService.set(
      `support_session:${sessionId}`,
      JSON.stringify(session),
      86400 * 1000
    );

    // Emit escalation event
    this.eventEmitter.emit('sessionEscalated', {
      sessionId,
      reason,
      targetTier: tier,
      currentPriority: session.priority
    });

    return true;
  }

  // Enhanced session ending with analytics
  async endSession(
    sessionId: string,
    resolution?: string,
    customerSatisfaction?: number,
    tags?: string[]
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'ended';
    session.endTime = new Date();
    session.resolution = resolution;
    session.customerSatisfaction = customerSatisfaction;

    if (tags) {
      session.tags = [...(session.tags || []), ...tags];
    }

    // Calculate session metrics
    const sessionDuration =
      session.endTime.getTime() - session.startTime.getTime();
    const metrics = this.sessionMetrics.get(sessionId);

    if (session.agentId) {
      const agent = this.agents.get(session.agentId);
      if (agent) {
        agent.currentSessions--;
        agent.totalHandledSessions++;

        // Update agent performance metrics
        if (customerSatisfaction) {
          const currentScore = agent.customerSatisfactionScore;
          const totalSessions = agent.totalHandledSessions;
          agent.customerSatisfactionScore =
            (currentScore * (totalSessions - 1) + customerSatisfaction) /
            totalSessions;
        }

        if (agent.currentSessions === 0) {
          agent.status = 'available';
        }
      }
    }

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    // Archive session data
    await this.redisService.set(
      `support_session_ended:${sessionId}`,
      JSON.stringify({
        ...session,
        sessionDuration,
        metrics
      }),
      86400 * 7 * 1000 // Keep for 7 days
    );

    // Remove active session
    await this.redisService.del(`support_session:${sessionId}`);
    this.sessionMetrics.delete(sessionId);

    // Emit session ended event
    this.eventEmitter.emit('sessionEnded', {
      sessionId,
      userId: session.userId,
      agentId: session.agentId,
      duration: sessionDuration,
      resolution,
      customerSatisfaction,
      metrics
    });

    // Check if agent can handle more sessions
    if (session.agentId) {
      await this.processQueueForAgent(session.agentId);
    }
  }

  // Utility methods
  private determinePriority(
    userType: Enum_UserType,
    category?: string,
    explicitPriority?: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (explicitPriority) {
      return explicitPriority as any;
    }

    // Emergency categories
    if (category === 'emergency' || category === 'safety_concern') {
      return 'urgent';
    }

    // Driver priority (business critical)
    if (userType === Enum_UserType.DRIVER) {
      return 'high';
    }

    // Restaurant priority (business partner)
    if (userType === Enum_UserType.RESTAURANT_OWNER) {
      return 'high';
    }

    // Complaint handling
    if (category === 'complaint') {
      return 'high';
    }

    return 'medium';
  }

  private getRequiredSkills(
    category?: string,
    userType?: Enum_UserType
  ): string[] {
    const skills: string[] = [];

    if (category) {
      const categorySkills = this.categoryHandlers.get(category);
      if (categorySkills) {
        skills.push(...categorySkills);
      }
    }

    // Add user-type specific skills
    switch (userType) {
      case Enum_UserType.DRIVER:
        skills.push('driver_support', 'logistics');
        break;
      case Enum_UserType.RESTAURANT_OWNER:
        skills.push('restaurant_management', 'business_support');
        break;
      case Enum_UserType.CUSTOMER:
        skills.push('customer_service');
        break;
    }

    return skills;
  }

  private findOptimalAgent(
    requiredSkills: string[],
    userType: Enum_UserType,
    priority: string
  ): Agent | undefined {
    const availableAgents = Array.from(this.agents.values()).filter(
      agent =>
        agent.isOnline &&
        agent.status === 'available' &&
        agent.currentSessions < agent.maxSessions
    );

    if (availableAgents.length === 0) return undefined;

    // Score agents based on skills, performance, and availability
    const scoredAgents = availableAgents.map(agent => {
      let score = 0;

      // Skill matching
      const matchingSkills = requiredSkills.filter(
        skill =>
          agent.skills.includes(skill) || agent.specializations.includes(skill)
      );
      score += matchingSkills.length * 10;

      // Performance rating
      score += agent.performanceRating * 2;

      // Availability (prefer agents with fewer active sessions)
      score += (agent.maxSessions - agent.currentSessions) * 5;

      // Customer satisfaction
      score += agent.customerSatisfactionScore;

      // Priority handling (prefer higher tier for urgent issues)
      if (priority === 'urgent' && agent.tier !== 'tier1') {
        score += 20;
      }

      return { agent, score };
    });

    // Sort by score and return best match
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent;
  }

  private async assignAgentToSession(
    session: SupportSession,
    agentId: string
  ): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent || agent.currentSessions >= agent.maxSessions) {
      return false;
    }

    session.agentId = agentId;
    session.status = 'active';
    session.chatMode = 'human';

    if (session.status.toString() === 'waiting') {
      session.waitTime = Date.now() - session.startTime.getTime();
    }

    agent.currentSessions++;
    agent.status =
      agent.currentSessions >= agent.maxSessions ? 'busy' : 'available';
    agent.lastActivity = new Date();

    // Remove from queue if present
    this.supportQueue = this.supportQueue.filter(
      item => item.sessionId !== session.sessionId
    );

    // Update storage
    this.activeSessions.set(session.sessionId, session);
    await this.redisService.set(
      `support_session:${session.sessionId}`,
      JSON.stringify(session),
      86400 * 1000
    );

    // Emit assignment event
    this.eventEmitter.emit('agentAssigned', {
      sessionId: session.sessionId,
      userId: session.userId,
      agentId,
      userType: session.userType,
      waitTime: session.waitTime
    });

    return true;
  }

  private calculateQueuePriority(session: SupportSession): number {
    let priority = 0;

    // Base priority
    switch (session.priority) {
      case 'urgent':
        priority = 1000;
        break;
      case 'high':
        priority = 500;
        break;
      case 'medium':
        priority = 100;
        break;
      case 'low':
        priority = 10;
        break;
    }

    // Time-based priority boost
    const waitTime = Date.now() - session.startTime.getTime();
    priority += Math.floor(waitTime / 60000); // +1 per minute

    // Escalation boost
    priority += (session.transferHistory?.length || 0) * 100;

    return priority;
  }

  private sortQueue(): void {
    this.supportQueue.sort((a, b) => {
      // First by priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Then by timestamp (FIFO)
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  private calculateEstimatedWaitTime(queueItem: QueueItem): number {
    const position = this.supportQueue.findIndex(
      item => item.sessionId === queueItem.sessionId
    );
    const availableAgents = Array.from(this.agents.values()).filter(
      agent => agent.isOnline && agent.status !== 'offline'
    ).length;

    if (availableAgents === 0) return 900; // 15 minutes default

    // Estimate based on average session time and queue position
    const averageSessionTime = 8; // 8 minutes average
    return Math.max(
      2,
      Math.ceil((position + 1) / availableAgents) * averageSessionTime
    );
  }

  private async processQueueForAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (
      !agent ||
      agent.currentSessions >= agent.maxSessions ||
      agent.status !== 'available'
    ) {
      return;
    }

    // Find next suitable session in queue
    for (let i = 0; i < this.supportQueue.length; i++) {
      const queueItem = this.supportQueue[i];
      const session = this.activeSessions.get(queueItem.sessionId);

      if (!session) continue;

      // Check if agent has required skills
      const requiredSkills = queueItem.requiredSkills || [];
      const hasRequiredSkills =
        requiredSkills.length === 0 ||
        requiredSkills.some(
          skill =>
            agent.skills.includes(skill) ||
            agent.specializations.includes(skill)
        );

      if (hasRequiredSkills) {
        await this.assignAgentToSession(session, agentId);
        break;
      }
    }
  }

  private checkSLAViolations(): void {
    const now = new Date();

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (
        session.slaDeadline &&
        now > session.slaDeadline &&
        session.status === 'waiting'
      ) {
        // SLA violation detected
        this.eventEmitter.emit('slaViolation', {
          sessionId,
          userId: session.userId,
          priority: session.priority,
          waitTime: now.getTime() - session.startTime.getTime(),
          slaDeadline: session.slaDeadline
        });

        // Auto-escalate
        this.escalateSession(sessionId, 'SLA violation');
      }
    }
  }

  private updateQueueEstimates(): void {
    this.supportQueue.forEach(item => {
      item.estimatedWaitTime = this.calculateEstimatedWaitTime(item);
    });
  }

  private cleanupOldSessions(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.startTime < cutoffTime && session.status === 'ended') {
        this.activeSessions.delete(sessionId);
        this.sessionMetrics.delete(sessionId);
      }
    }
  }

  // Analytics and reporting
  getMetrics(): SupportMetrics {
    const totalSessions = this.activeSessions.size;
    const activeSessions = Array.from(this.activeSessions.values()).filter(
      session => session.status === 'active'
    ).length;
    const waitingInQueue = this.supportQueue.length;

    const waitTimes = Array.from(this.activeSessions.values())
      .filter(session => session.waitTime)
      .map(session => session.waitTime!);

    const averageWaitTime =
      waitTimes.length > 0
        ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
        : 0;

    const satisfactionScores = Array.from(this.activeSessions.values())
      .filter(session => session.customerSatisfaction)
      .map(session => session.customerSatisfaction!);

    const customerSatisfactionScore =
      satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum + score, 0) /
          satisfactionScores.length
        : 0;

    const totalAgents = this.agents.size;
    const busyAgents = Array.from(this.agents.values()).filter(
      agent => agent.status === 'busy'
    ).length;

    const agentUtilization =
      totalAgents > 0 ? (busyAgents / totalAgents) * 100 : 0;

    return {
      totalSessions,
      activeSessions,
      waitingInQueue,
      averageWaitTime: Math.round(averageWaitTime / 1000 / 60), // Convert to minutes
      averageResponseTime: 0, // Would need to calculate from message timestamps
      customerSatisfactionScore:
        Math.round(customerSatisfactionScore * 100) / 100,
      escalationRate: 0, // Would need historical data
      resolutionRate: 0, // Would need historical data
      agentUtilization: Math.round(agentUtilization * 100) / 100
    };
  }

  // Existing methods (enhanced)
  async getSession(sessionId: string): Promise<SupportSession | undefined> {
    console.log(`🔍 Getting session ${sessionId}`);

    try {
      // Always check Redis first
      console.log(
        `📡 Fetching session from Redis: support_session:${sessionId}`
      );
      const sessionData = await this.redisService.get(
        `support_session:${sessionId}`
      );

      if (sessionData) {
        const session = JSON.parse(sessionData);
        console.log(`✅ Found session in Redis: ${sessionId}`);

        // Convert string dates to Date objects
        if (session.startTime && typeof session.startTime === 'string') {
          session.startTime = new Date(session.startTime);
        }

        if (session.endTime && typeof session.endTime === 'string') {
          session.endTime = new Date(session.endTime);
        }

        if (session.slaDeadline && typeof session.slaDeadline === 'string') {
          session.slaDeadline = new Date(session.slaDeadline);
        }

        // Convert dates in transfer history
        if (session.transferHistory && Array.isArray(session.transferHistory)) {
          session.transferHistory = session.transferHistory.map(transfer => ({
            ...transfer,
            timestamp:
              typeof transfer.timestamp === 'string'
                ? new Date(transfer.timestamp)
                : transfer.timestamp
          }));
        }

        // Update in-memory cache
        this.activeSessions.set(sessionId, session);

        return session;
      }

      console.log(`❌ Session not found in Redis: ${sessionId}`);
      return undefined;
    } catch (error) {
      console.error(`Error fetching session ${sessionId} from Redis:`, error);

      // Fallback to memory only if Redis fails
      console.log('⚠️ Falling back to in-memory session check');
      const memorySession = this.activeSessions.get(sessionId);
      if (memorySession) {
        console.log(`⚠️ Found session in memory only: ${sessionId}`);
      }

      return memorySession;
    }
  }

  async getUserActiveSession(
    userId: string
  ): Promise<SupportSession | undefined> {
    console.log(`🔍 Checking active session for user ${userId}`);

    try {
      // Always check Redis first
      console.log('📡 Fetching from Redis Upstash...');
      const client = this.redisService.getClient();
      const sessionKeys = await client.keys(`support_session:*`);
      console.log(`📊 Found ${sessionKeys.length} total sessions in Redis`);

      // Look for sessions belonging to this user
      for (const key of sessionKeys) {
        const sessionData = await this.redisService.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.userId === userId && session.status !== 'ended') {
            console.log(
              `✅ Found active session in Redis: ${session.sessionId}`
            );

            // Convert string dates to Date objects
            if (session.startTime && typeof session.startTime === 'string') {
              session.startTime = new Date(session.startTime);
            }

            if (session.endTime && typeof session.endTime === 'string') {
              session.endTime = new Date(session.endTime);
            }

            if (
              session.slaDeadline &&
              typeof session.slaDeadline === 'string'
            ) {
              session.slaDeadline = new Date(session.slaDeadline);
            }

            // Convert dates in transfer history
            if (
              session.transferHistory &&
              Array.isArray(session.transferHistory)
            ) {
              session.transferHistory = session.transferHistory.map(
                transfer => ({
                  ...transfer,
                  timestamp:
                    typeof transfer.timestamp === 'string'
                      ? new Date(transfer.timestamp)
                      : transfer.timestamp
                })
              );
            }

            // Update in-memory cache
            this.activeSessions.set(session.sessionId, session);

            return session;
          }
        }
      }

      console.log(`❌ No active session found in Redis for user ${userId}`);
      return undefined;
    } catch (error) {
      console.error('Error fetching session from Redis:', error);

      // Fallback to memory only if Redis fails
      console.log('⚠️ Falling back to in-memory session check');
      for (const session of this.activeSessions.values()) {
        if (session.userId === userId && session.status !== 'ended') {
          console.log(`⚠️ Found session in memory only: ${session.sessionId}`);
          return session;
        }
      }

      return undefined;
    }
  }

  async switchChatMode(
    sessionId: string,
    mode: 'bot' | 'human'
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    if (mode === 'human') {
      return (await this.requestHumanAgent(sessionId)).success;
    } else {
      // Switch back to bot
      session.chatMode = 'bot';
      if (session.agentId) {
        const agent = this.agents.get(session.agentId);
        if (agent) {
          agent.currentSessions--;
          if (agent.currentSessions === 0) {
            agent.status = 'available';
          }
        }
        session.agentId = undefined;
      }

      this.activeSessions.set(sessionId, session);
      await this.redisService.set(
        `support_session:${sessionId}`,
        JSON.stringify(session),
        86400 * 1000
      );

      return true;
    }
  }

  getQueueStatus(sessionId?: string): {
    position: number;
    estimatedWait: number;
  } {
    if (sessionId) {
      const position = this.supportQueue.findIndex(
        item => item.sessionId === sessionId
      );
      if (position >= 0) {
        const queueItem = this.supportQueue[position];
        return {
          position: position + 1,
          estimatedWait:
            queueItem.estimatedWaitTime ||
            this.calculateEstimatedWaitTime(queueItem)
        };
      }
    }

    return {
      position: this.supportQueue.length,
      estimatedWait: this.supportQueue.length * 5 // 5 minutes per person estimate
    };
  }

  getAvailableAgentsCount(): number {
    return Array.from(this.agents.values()).filter(
      agent => agent.isOnline && agent.status === 'available'
    ).length;
  }

  // Initialize from Redis on startup
  async initializeFromRedis(): Promise<void> {
    try {
      await this.redisService.connect();
      const client = this.redisService.getClient();

      // Load sessions
      const sessionKeys = await client.keys('support_session:*');
      for (const key of sessionKeys) {
        const sessionData = await this.redisService.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);

          // Convert string dates to Date objects
          if (session.startTime && typeof session.startTime === 'string') {
            session.startTime = new Date(session.startTime);
          }

          if (session.endTime && typeof session.endTime === 'string') {
            session.endTime = new Date(session.endTime);
          }

          if (session.slaDeadline && typeof session.slaDeadline === 'string') {
            session.slaDeadline = new Date(session.slaDeadline);
          }

          // Convert dates in transfer history
          if (
            session.transferHistory &&
            Array.isArray(session.transferHistory)
          ) {
            session.transferHistory = session.transferHistory.map(transfer => ({
              ...transfer,
              timestamp:
                typeof transfer.timestamp === 'string'
                  ? new Date(transfer.timestamp)
                  : transfer.timestamp
            }));
          }

          this.activeSessions.set(session.sessionId, session);
        }
      }

      // Load agents
      const agentKeys = await client.keys('agent:*');
      for (const key of agentKeys) {
        const agentData = await this.redisService.get(key);
        if (agentData) {
          const agent = JSON.parse(agentData);

          // Convert string dates to Date objects
          if (agent.lastActivity && typeof agent.lastActivity === 'string') {
            agent.lastActivity = new Date(agent.lastActivity);
          }

          this.agents.set(agent.id, agent);
        }
      }

      console.log(
        `Initialized ${this.activeSessions.size} sessions and ${this.agents.size} agents from Redis`
      );
    } catch (error) {
      console.error('Error initializing support sessions from Redis:', error);
    }
  }
}
