import { Injectable } from '@nestjs/common';
import { Enum_UserType } from 'src/types/Payload';

export interface ConversationContext {
  userId: string;
  userType: Enum_UserType;
  currentFlow?: string;
  currentStep?: string;
  collectedData?: Record<string, any>;
  lastIntent?: string;
  sessionStartTime: Date;
  previousMessages: string[];
  preferredLanguage?: string;
  escalationCount: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ChatbotResponse {
  message: string;
  type:
    | 'text'
    | 'options'
    | 'transfer'
    | 'quick_reply'
    | 'carousel'
    | 'form'
    | 'confirmation';
  options?: Array<{
    text: string;
    value: string;
    action?: string;
  }>;
  quickReplies?: string[];
  cards?: Array<{
    title: string;
    subtitle?: string;
    imageUrl?: string;
    buttons?: Array<{ text: string; value: string }>;
  }>;
  formFields?: Array<{
    name: string;
    type: 'text' | 'email' | 'phone' | 'select';
    label: string;
    required: boolean;
    options?: string[];
  }>;
  confidence?: number;
  suggestedActions?: string[];
  followUpPrompt?: string;
  requiresHuman?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Intent {
  name: string;
  patterns: string[];
  responses: string[];
  context?: string[];
  userTypes?: Enum_UserType[];
  followUp?: string[];
  requiresData?: string[];
  escalationTrigger?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable()
export class ChatbotService {
  private contexts = new Map<string, ConversationContext>();
  private intents: Intent[] = [];
  private conversationFlows: Map<string, any> = new Map();
  private userTypeHandlers: Map<Enum_UserType, any> = new Map();

  constructor() {
    this.initializeIntents();
    this.initializeConversationFlows();
    this.initializeUserTypeHandlers();
  }

  private initializeIntents() {
    this.intents = [
      // Greeting Intents
      {
        name: 'greeting',
        patterns: [
          'hi',
          'hello',
          'hey',
          'good morning',
          'good afternoon',
          'good evening',
          'start',
          'begin'
        ],
        responses: [
          'Hello! Welcome to FlashFood! 👋',
          'Hi there! How can I help you today?',
          "Welcome! I'm here to assist you."
        ],
        followUp: ['main_menu']
      },

      // Order Related Intents
      {
        name: 'order_status',
        patterns: [
          'order status',
          'where is my order',
          'track order',
          'order tracking',
          'delivery status',
          'how long',
          'eta'
        ],
        responses: ['Let me help you track your order.'],
        requiresData: ['order_id'],
        userTypes: [Enum_UserType.CUSTOMER]
      },

      {
        name: 'order_issue',
        patterns: [
          'wrong order',
          'missing items',
          'cold food',
          'order problem',
          'incorrect order',
          'refund'
        ],
        responses: [
          "I'm sorry to hear about the issue with your order. Let me help resolve this."
        ],
        context: ['order_resolution'],
        userTypes: [Enum_UserType.CUSTOMER],
        escalationTrigger: true
      },

      {
        name: 'payment_issue',
        patterns: [
          'payment failed',
          'card declined',
          'refund',
          'billing issue',
          'charge',
          'money back'
        ],
        responses: [
          'I understand your payment concern. Let me assist you with this.'
        ],
        context: ['payment_resolution'],
        escalationTrigger: true
      },

      // Driver Specific Intents
      {
        name: 'driver_navigation',
        patterns: [
          'route',
          'directions',
          'gps',
          'navigation',
          'address',
          'location',
          'way'
        ],
        responses: ['I can help you with navigation and route optimization.'],
        userTypes: [Enum_UserType.DRIVER],
        context: ['driver_support']
      },

      {
        name: 'driver_payment',
        patterns: [
          'earnings',
          'payment',
          'salary',
          'commission',
          'payout',
          'withdrawal'
        ],
        responses: [
          'Let me help you with your earnings and payment information.'
        ],
        userTypes: [Enum_UserType.DRIVER],
        context: ['driver_payment']
      },

      {
        name: 'driver_vehicle',
        patterns: [
          'vehicle',
          'car',
          'bike',
          'motorcycle',
          'breakdown',
          'maintenance',
          'fuel'
        ],
        responses: ['I can assist you with vehicle-related concerns.'],
        userTypes: [Enum_UserType.DRIVER],
        context: ['driver_vehicle']
      },

      // Restaurant Specific Intents
      {
        name: 'restaurant_orders',
        patterns: [
          'new orders',
          'pending orders',
          'order management',
          'kitchen',
          'preparation time'
        ],
        responses: [
          'I can help you manage your restaurant orders efficiently.'
        ],
        userTypes: [Enum_UserType.RESTAURANT_OWNER],
        context: ['restaurant_orders']
      },

      {
        name: 'restaurant_menu',
        patterns: [
          'menu',
          'items',
          'dishes',
          'pricing',
          'availability',
          'out of stock',
          'add item'
        ],
        responses: ['Let me assist you with menu management.'],
        userTypes: [Enum_UserType.RESTAURANT_OWNER],
        context: ['restaurant_menu']
      },

      {
        name: 'restaurant_analytics',
        patterns: [
          'sales',
          'revenue',
          'analytics',
          'reports',
          'performance',
          'statistics'
        ],
        responses: [
          "I can help you understand your restaurant's performance metrics."
        ],
        userTypes: [Enum_UserType.RESTAURANT_OWNER],
        context: ['restaurant_analytics']
      },

      // General Support Intents
      {
        name: 'account_issue',
        patterns: [
          'account',
          'profile',
          'login',
          'password',
          'forgot password',
          'account blocked',
          'verification'
        ],
        responses: ['I can help you with account-related issues.'],
        context: ['account_support']
      },

      {
        name: 'technical_issue',
        patterns: [
          'app crash',
          'bug',
          'error',
          'not working',
          'frozen',
          'slow',
          'technical problem'
        ],
        responses: [
          "I'm sorry you're experiencing technical difficulties. Let me help troubleshoot."
        ],
        context: ['technical_support'],
        escalationTrigger: true
      },

      {
        name: 'human_request',
        patterns: [
          'human',
          'agent',
          'representative',
          'talk to person',
          'customer service',
          'escalate'
        ],
        responses: ["I'll connect you with a human representative."],
        context: ['transfer_human']
      },

      // Complaint and Feedback
      {
        name: 'complaint',
        patterns: [
          'complaint',
          'dissatisfied',
          'unhappy',
          'terrible',
          'worst',
          'angry',
          'frustrated'
        ],
        responses: [
          "I'm sorry to hear about your negative experience. Let me help resolve this immediately."
        ],
        context: ['complaint_handling'],
        escalationTrigger: true,
        priority: 'high'
      },

      {
        name: 'compliment',
        patterns: [
          'great',
          'excellent',
          'amazing',
          'love',
          'fantastic',
          'wonderful',
          'perfect'
        ],
        responses: [
          "Thank you for the positive feedback! We're glad you're happy with our service."
        ],
        context: ['positive_feedback']
      }
    ];
  }

  private initializeConversationFlows() {
    // Customer Order Resolution Flow
    this.conversationFlows.set('order_resolution', {
      steps: {
        identify_issue: {
          message: 'What specific issue are you experiencing with your order?',
          type: 'options',
          options: [
            {
              text: 'Wrong items received',
              value: 'wrong_items',
              action: 'collect_order_details'
            },
            {
              text: 'Missing items',
              value: 'missing_items',
              action: 'collect_order_details'
            },
            {
              text: 'Food quality issue',
              value: 'quality_issue',
              action: 'collect_order_details'
            },
            { text: 'Delivery delay', value: 'delay', action: 'track_order' },
            {
              text: 'Other issue',
              value: 'other',
              action: 'collect_description'
            }
          ]
        },
        collect_order_details: {
          message:
            'Please provide your order ID or the phone number used for the order.',
          type: 'form',
          formFields: [
            {
              name: 'order_id',
              type: 'text',
              label: 'Order ID',
              required: false
            },
            {
              name: 'phone',
              type: 'phone',
              label: 'Phone Number',
              required: false
            }
          ]
        },
        resolution_options: {
          message: 'Based on your issue, here are the available solutions:',
          type: 'options',
          options: [
            {
              text: 'Request refund',
              value: 'refund',
              action: 'process_refund'
            },
            {
              text: 'Reorder items',
              value: 'reorder',
              action: 'process_reorder'
            },
            {
              text: 'Speak to manager',
              value: 'escalate',
              action: 'transfer_human'
            }
          ]
        }
      }
    });

    // Driver Support Flow
    this.conversationFlows.set('driver_support', {
      steps: {
        identify_need: {
          message: 'How can I assist you today?',
          type: 'options',
          options: [
            {
              text: 'Navigation help',
              value: 'navigation',
              action: 'navigation_support'
            },
            {
              text: 'Customer contact',
              value: 'contact',
              action: 'contact_support'
            },
            {
              text: 'Order details',
              value: 'order_info',
              action: 'order_support'
            },
            {
              text: 'Emergency',
              value: 'emergency',
              action: 'emergency_support'
            }
          ]
        },
        navigation_support: {
          message: 'I can help you with navigation. What do you need?',
          type: 'quick_reply',
          quickReplies: [
            'Get directions',
            'Traffic update',
            'Best route',
            'Contact customer'
          ]
        }
      }
    });

    // Restaurant Management Flow
    this.conversationFlows.set('restaurant_orders', {
      steps: {
        order_management: {
          message: 'What would you like to do with your orders?',
          type: 'options',
          options: [
            {
              text: 'View pending orders',
              value: 'view_pending',
              action: 'show_pending'
            },
            {
              text: 'Update preparation time',
              value: 'update_time',
              action: 'update_prep_time'
            },
            {
              text: 'Mark items unavailable',
              value: 'mark_unavailable',
              action: 'manage_availability'
            },
            {
              text: 'Order issue',
              value: 'order_issue',
              action: 'handle_order_issue'
            }
          ]
        }
      }
    });
  }

  private initializeUserTypeHandlers() {
    // Customer Handler
    this.userTypeHandlers.set(Enum_UserType.CUSTOMER, {
      welcomeMessage:
        "Welcome to FlashFood! 🍔 I'm your personal food delivery assistant. I can help you with orders, payments, account issues, and more!",
      mainMenu: [
        { text: '📱 Track my order', value: 'track_order' },
        { text: '🔄 Order issue/refund', value: 'order_issue' },
        { text: '💳 Payment & billing', value: 'payment_help' },
        { text: '👤 Account settings', value: 'account_help' },
        { text: '📞 Talk to human', value: 'human_agent' }
      ],
      priority: 'medium'
    });

    // Driver Handler
    this.userTypeHandlers.set(Enum_UserType.DRIVER, {
      welcomeMessage:
        "Hello Driver! 🚗 I'm here to support you during your deliveries. I can help with navigation, customer issues, earnings, and more!",
      mainMenu: [
        { text: '🗺️ Navigation help', value: 'navigation_help' },
        { text: '📦 Current delivery', value: 'current_delivery' },
        { text: '💰 Earnings & payments', value: 'earnings' },
        { text: '🔧 Vehicle support', value: 'vehicle_help' },
        { text: '🚨 Emergency support', value: 'emergency' },
        { text: '📞 Talk to dispatcher', value: 'human_agent' }
      ],
      priority: 'high'
    });

    // Restaurant Handler
    this.userTypeHandlers.set(Enum_UserType.RESTAURANT_OWNER, {
      welcomeMessage:
        'Welcome Restaurant Partner! 🏪 I can help you manage orders, update your menu, track performance, and resolve any issues!',
      mainMenu: [
        { text: '📋 Manage orders', value: 'manage_orders' },
        { text: '📝 Update menu', value: 'menu_management' },
        { text: '📊 View analytics', value: 'view_analytics' },
        { text: '⚙️ Restaurant settings', value: 'restaurant_settings' },
        { text: '💡 Business tips', value: 'business_support' },
        { text: '📞 Partner support', value: 'human_agent' }
      ],
      priority: 'high'
    });
  }

  async getResponse(
    userMessage: string,
    userId: string,
    userType: Enum_UserType
  ): Promise<ChatbotResponse> {
    const context = this.getOrCreateContext(userId, userType);

    // Update conversation context
    context.previousMessages.push(userMessage);
    if (context.previousMessages.length > 10) {
      context.previousMessages = context.previousMessages.slice(-10);
    }

    // Analyze sentiment
    context.sentiment = this.analyzeSentiment(userMessage);

    // Check if this is a direct option selection first
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Check for main menu option selection
    const userHandler = this.userTypeHandlers.get(context.userType);
    if (userHandler?.mainMenu) {
      // Strip emojis and special characters for better matching
      const cleanMessage = normalizedMessage.replace(/[^\w\s]/gi, '').trim();

      console.log('DEBUG - User type:', context.userType);
      console.log('DEBUG - User message:', userMessage);
      console.log('DEBUG - Normalized message:', normalizedMessage);
      console.log('DEBUG - Clean message:', cleanMessage);
      console.log(
        'DEBUG - Available menu options:',
        JSON.stringify(userHandler.mainMenu)
      );

      const selectedOption = userHandler.mainMenu.find(option => {
        // Try exact value match first
        if (option.value.toLowerCase() === normalizedMessage) {
          console.log('DEBUG - Exact value match found:', option.value);
          return true;
        }

        // Try exact text match (with emojis)
        if (option.text.toLowerCase() === normalizedMessage) {
          console.log('DEBUG - Exact text match found:', option.text);
          return true;
        }

        // Try text match without emojis
        const cleanOptionText = option.text
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .trim();

        console.log(
          'DEBUG - Comparing:',
          cleanOptionText,
          'with',
          cleanMessage
        );
        const isMatch =
          cleanOptionText === cleanMessage ||
          cleanMessage.includes(cleanOptionText);
        if (isMatch) {
          console.log('DEBUG - Text match found:', option.text, option.value);
        }
        return isMatch;
      });

      console.log(
        'DEBUG - Selected option:',
        selectedOption ? JSON.stringify(selectedOption) : 'none'
      );

      if (selectedOption) {
        // Handle the selected option
        switch (selectedOption.value) {
          case 'vehicle_help':
            return {
              message: 'I can assist you with vehicle-related concerns.',
              type: 'text',
              followUpPrompt: 'How else can I assist you today?'
            };
          case 'navigation_help':
            return {
              message: 'I can help you with navigation and route optimization.',
              type: 'text',
              followUpPrompt: 'What specific navigation assistance do you need?'
            };
          case 'emergency':
            return {
              message:
                '🚨 This is an emergency support channel. What type of emergency?',
              type: 'options',
              options: [
                { text: 'Vehicle breakdown', value: 'breakdown' },
                { text: 'Accident', value: 'accident' },
                { text: 'Safety concern', value: 'safety' },
                { text: 'Medical emergency', value: 'medical' }
              ],
              priority: 'urgent',
              requiresHuman: true
            };
          case 'human_agent':
            return {
              message:
                "I'll connect you with a human representative right away! 👥",
              type: 'transfer',
              priority: 'medium',
              requiresHuman: true
            };
          // Restaurant owner menu options
          case 'manage_orders':
            return {
              message:
                'I can help you manage your restaurant orders. What would you like to do?',
              type: 'options',
              options: [
                { text: 'View pending orders', value: 'view_pending' },
                { text: 'Update preparation time', value: 'update_time' },
                { text: 'Mark items unavailable', value: 'mark_unavailable' },
                { text: 'Order issue', value: 'order_issue' }
              ]
            };
          case 'menu_management':
            return {
              message: 'Let me assist you with menu management.',
              type: 'options',
              options: [
                { text: 'Add new item', value: 'add_item' },
                { text: 'Update existing item', value: 'update_item' },
                { text: 'Remove item', value: 'remove_item' },
                { text: 'Change prices', value: 'change_prices' }
              ]
            };
          case 'view_analytics':
            return {
              message:
                "I can help you understand your restaurant's performance metrics.",
              type: 'options',
              options: [
                { text: 'Sales report', value: 'sales_report' },
                { text: 'Customer feedback', value: 'customer_feedback' },
                { text: 'Popular items', value: 'popular_items' },
                { text: 'Delivery statistics', value: 'delivery_stats' }
              ]
            };
          case 'restaurant_settings':
            return {
              message: 'What restaurant settings would you like to manage?',
              type: 'options',
              options: [
                { text: 'Update business hours', value: 'update_hours' },
                { text: 'Manage delivery zones', value: 'delivery_zones' },
                { text: 'Update contact info', value: 'update_contact' },
                { text: 'Change restaurant profile', value: 'update_profile' }
              ]
            };
          case 'business_support':
            return {
              message:
                'Here are some business support options for your restaurant:',
              type: 'options',
              options: [
                { text: 'Marketing tips', value: 'marketing_tips' },
                { text: 'Optimize menu', value: 'optimize_menu' },
                { text: 'Increase sales', value: 'increase_sales' },
                { text: 'Reduce costs', value: 'reduce_costs' }
              ]
            };
          // Add other option handlers as needed
        }
      }
    }

    // Check for flow-specific option selection
    if (this.isOptionSelection(userMessage, context)) {
      console.log('Flow-specific option selected');
      // Let the flow handler deal with it
    }

    // Process the message normally if no option was selected
    const intent = this.identifyIntent(userMessage, userType, context);
    let response: ChatbotResponse;

    if (context.currentFlow && context.currentStep) {
      response = await this.handleFlowResponse(userMessage, context, intent);
    } else {
      response = await this.handleInitialResponse(userMessage, context, intent);
    }

    // Check if escalation is needed
    if (this.shouldEscalate(context, intent, userMessage)) {
      response.requiresHuman = true;
      response.priority = 'high';
      context.escalationCount++;
    }

    // Update context
    context.lastIntent = intent?.name;
    this.contexts.set(userId, context);

    // Validate options before returning
    if (response && response.options) {
      response.options = this.validateMenuOptions(response.options);
    }

    return response;
  }

  private getOrCreateContext(
    userId: string,
    userType: Enum_UserType
  ): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        userType,
        sessionStartTime: new Date(),
        previousMessages: [],
        escalationCount: 0
      });
    }
    return this.contexts.get(userId)!;
  }

  private identifyIntent(
    message: string,
    userType: Enum_UserType,
    context: ConversationContext
  ): Intent | null {
    const normalizedMessage = message.toLowerCase().trim();
    let bestMatch: Intent | null = null;
    let highestScore = 0;

    for (const intent of this.intents) {
      // Skip if intent is not for this user type
      if (intent.userTypes && !intent.userTypes.includes(userType)) continue;

      const score = this.calculateIntentScore(
        normalizedMessage,
        intent,
        context
      );
      if (score > highestScore && score > 0.4) {
        highestScore = score;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  private calculateIntentScore(
    message: string,
    intent: Intent,
    context: ConversationContext
  ): number {
    let score = 0;
    const messageWords = message.split(' ');

    // Pattern matching
    for (const pattern of intent.patterns) {
      if (message.includes(pattern)) {
        score += pattern.split(' ').length * 0.3;
      } else {
        const patternWords = pattern.split(' ');
        let wordMatches = 0;
        for (const patternWord of patternWords) {
          if (messageWords.includes(patternWord)) {
            wordMatches++;
          }
        }
        if (wordMatches > 0) {
          score += (wordMatches / patternWords.length) * 0.2;
        }
      }
    }

    // Context bonus
    if (
      intent.context &&
      context.currentFlow &&
      intent.context.includes(context.currentFlow)
    ) {
      score += 0.3;
    }

    // Recent intent bonus
    if (context.lastIntent === intent.name) {
      score += 0.1;
    }

    return score;
  }

  private async handleInitialResponse(
    message: string,
    context: ConversationContext,
    intent: Intent | null
  ): Promise<ChatbotResponse> {
    if (!intent) {
      return this.getDefaultResponse(context);
    }

    const userHandler = this.userTypeHandlers.get(context.userType);

    switch (intent.name) {
      case 'greeting':
        return {
          message:
            userHandler?.welcomeMessage || 'Hello! How can I help you today?',
          type: 'options',
          options: userHandler?.mainMenu || [],
          followUpPrompt:
            'Please select an option or tell me what you need help with.'
        };

      case 'order_status':
        context.currentFlow = 'order_tracking';
        context.currentStep = 'get_order_id';
        return {
          message: "I'll help you track your order! 📦",
          type: 'form',
          formFields: [
            {
              name: 'order_id',
              type: 'text',
              label: 'Order ID',
              required: false
            },
            {
              name: 'phone',
              type: 'phone',
              label: 'Phone Number',
              required: false
            }
          ],
          followUpPrompt:
            'Provide either your Order ID or the phone number you used to place the order.'
        };

      case 'order_issue':
        context.currentFlow = 'order_resolution';
        context.currentStep = 'identify_issue';
        return this.conversationFlows.get('order_resolution').steps[
          'identify_issue'
        ];

      case 'driver_navigation':
        context.currentFlow = 'driver_support';
        context.currentStep = 'identify_need';
        return this.conversationFlows.get('driver_support').steps[
          'identify_need'
        ];

      case 'restaurant_orders':
        context.currentFlow = 'restaurant_orders';
        context.currentStep = 'order_management';
        return this.conversationFlows.get('restaurant_orders').steps[
          'order_management'
        ];

      case 'human_request':
        return {
          message:
            "I'll connect you with a human representative right away! 👥",
          type: 'transfer',
          priority: 'medium'
        };

      case 'complaint':
        context.escalationCount++;
        return {
          message:
            "I sincerely apologize for the trouble you're experiencing. Let me escalate this to our priority support team immediately. 🚨",
          type: 'transfer',
          priority: 'urgent',
          requiresHuman: true
        };

      default:
        const response =
          intent.responses[Math.floor(Math.random() * intent.responses.length)];
        return {
          message: response,
          type: 'text',
          followUpPrompt: 'How else can I assist you today?'
        };
    }
  }

  private async handleFlowResponse(
    message: string,
    context: ConversationContext,
    intent: Intent | null
  ): Promise<ChatbotResponse> {
    const flow = this.conversationFlows.get(context.currentFlow!);
    if (!flow || !context.currentStep) {
      return this.getDefaultResponse(context);
    }

    // Store user response
    if (!context.collectedData) context.collectedData = {};
    context.collectedData[context.currentStep] = message;

    // Process based on current flow and step
    switch (context.currentFlow) {
      case 'order_resolution':
        return this.handleOrderResolutionFlow(message, context);
      case 'driver_support':
        return this.handleDriverSupportFlow(message, context);
      case 'restaurant_orders':
        return this.handleRestaurantOrdersFlow(message, context);
      default:
        return this.getDefaultResponse(context);
    }
  }

  private handleOrderResolutionFlow(
    message: string,
    context: ConversationContext
  ): ChatbotResponse {
    switch (context.currentStep) {
      case 'identify_issue':
        context.currentStep = 'collect_order_details';
        return {
          message:
            "I understand you're having an issue. Let me get your order details to help resolve this quickly.",
          type: 'form',
          formFields: [
            {
              name: 'order_id',
              type: 'text',
              label: 'Order ID (if you have it)',
              required: false
            },
            {
              name: 'phone',
              type: 'phone',
              label: 'Phone Number',
              required: true
            }
          ]
        };

      case 'collect_order_details':
        context.currentStep = 'resolution_options';
        return {
          message:
            'Thank you for the information. Based on your issue, here are the available solutions:',
          type: 'options',
          options: [
            { text: '💰 Request full refund', value: 'full_refund' },
            { text: '🔄 Reorder missing/wrong items', value: 'reorder' },
            { text: '💳 Partial refund + reorder', value: 'partial_refund' },
            { text: '📞 Speak to manager', value: 'escalate' }
          ]
        };

      default:
        return this.completeFlow(
          context,
          'Your issue has been logged and will be resolved within 24 hours. Is there anything else I can help you with?'
        );
    }
  }

  private handleDriverSupportFlow(
    message: string,
    context: ConversationContext
  ): ChatbotResponse {
    switch (context.currentStep) {
      case 'identify_need':
        if (message.toLowerCase().includes('navigation')) {
          return {
            message: '🗺️ Navigation Support Available:',
            type: 'quick_reply',
            quickReplies: [
              'Get best route',
              'Traffic alerts',
              'Customer location',
              'Emergency contacts'
            ]
          };
        } else if (message.toLowerCase().includes('emergency')) {
          return {
            message:
              '🚨 This is an emergency support channel. What type of emergency?',
            type: 'options',
            options: [
              { text: 'Vehicle breakdown', value: 'breakdown' },
              { text: 'Accident', value: 'accident' },
              { text: 'Safety concern', value: 'safety' },
              { text: 'Medical emergency', value: 'medical' }
            ],
            priority: 'urgent',
            requiresHuman: true
          };
        }
        break;
    }

    return this.completeFlow(
      context,
      "I've noted your request. A dispatcher will contact you shortly if needed."
    );
  }

  private handleRestaurantOrdersFlow(
    message: string,
    context: ConversationContext
  ): ChatbotResponse {
    switch (context.currentStep) {
      case 'order_management':
        if (message.toLowerCase().includes('pending')) {
          return {
            message: '📋 Here are your pending orders management options:',
            type: 'carousel',
            cards: [
              {
                title: 'Current Orders',
                subtitle: 'View and manage active orders',
                buttons: [
                  { text: 'View orders', value: 'view_orders' },
                  { text: 'Update times', value: 'update_times' }
                ]
              },
              {
                title: 'Menu Management',
                subtitle: 'Update availability and pricing',
                buttons: [
                  { text: 'Mark unavailable', value: 'mark_unavailable' },
                  { text: 'Update prices', value: 'update_prices' }
                ]
              }
            ]
          };
        }
        break;
    }

    return this.completeFlow(
      context,
      'Your restaurant management request has been processed. Anything else I can help with?'
    );
  }

  private completeFlow(
    context: ConversationContext,
    message: string
  ): ChatbotResponse {
    context.currentFlow = undefined;
    context.currentStep = undefined;
    context.collectedData = {};

    const userHandler = this.userTypeHandlers.get(context.userType);

    return {
      message,
      type: 'options',
      options: userHandler?.mainMenu || [],
      followUpPrompt: 'Is there anything else I can help you with?'
    };
  }

  private shouldEscalate(
    context: ConversationContext,
    intent: Intent | null,
    message: string
  ): boolean {
    // Escalate if user explicitly requests human
    if (intent?.name === 'human_request') return true;

    // Escalate for complaints
    if (intent?.escalationTrigger) return true;

    // Escalate if user is frustrated (multiple escalation attempts)
    if (context.escalationCount >= 2) return true;

    // Escalate for negative sentiment with certain keywords
    if (
      context.sentiment === 'negative' &&
      (message.includes('manager') ||
        message.includes('supervisor') ||
        message.includes('complaint'))
    ) {
      return true;
    }

    // Escalate for drivers in emergency situations
    if (
      context.userType === Enum_UserType.DRIVER &&
      (message.includes('emergency') ||
        message.includes('accident') ||
        message.includes('urgent'))
    ) {
      return true;
    }

    return false;
  }

  private analyzeSentiment(
    message: string
  ): 'positive' | 'negative' | 'neutral' {
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'hate',
      'angry',
      'frustrated',
      'disappointed',
      'worst',
      'horrible'
    ];
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'love',
      'fantastic',
      'wonderful',
      'perfect',
      'best'
    ];

    const lowerMessage = message.toLowerCase();
    const negativeCount = negativeWords.filter(word =>
      lowerMessage.includes(word)
    ).length;
    const positiveCount = positiveWords.filter(word =>
      lowerMessage.includes(word)
    ).length;

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  private getDefaultResponse(context: ConversationContext): ChatbotResponse {
    const userHandler = this.userTypeHandlers.get(context.userType);

    // Check if user selected an option from main menu
    if (userHandler?.mainMenu) {
      const normalizedMessage = context.previousMessages[
        context.previousMessages.length - 1
      ]
        .toLowerCase()
        .trim();

      // Check if the message matches any menu option value or text
      const selectedOption = userHandler.mainMenu.find(
        option =>
          option.value.toLowerCase() === normalizedMessage ||
          option.text
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .includes(normalizedMessage)
      );

      if (selectedOption) {
        // Handle the selected option
        switch (selectedOption.value) {
          case 'vehicle_help':
            return {
              message: 'I can assist you with vehicle-related concerns.',
              type: 'text',
              followUpPrompt: 'How else can I assist you today?'
            };
          case 'navigation_help':
            return {
              message: 'I can help you with navigation and route optimization.',
              type: 'text',
              followUpPrompt: 'What specific navigation assistance do you need?'
            };
          case 'emergency':
            return {
              message:
                '🚨 This is an emergency support channel. What type of emergency?',
              type: 'options',
              options: [
                { text: 'Vehicle breakdown', value: 'breakdown' },
                { text: 'Accident', value: 'accident' },
                { text: 'Safety concern', value: 'safety' },
                { text: 'Medical emergency', value: 'medical' }
              ],
              priority: 'urgent',
              requiresHuman: true
            };
          case 'human_agent':
            return {
              message:
                "I'll connect you with a human representative right away! 👥",
              type: 'transfer',
              priority: 'medium',
              requiresHuman: true
            };
          // Restaurant owner menu options
          case 'manage_orders':
            return {
              message:
                'I can help you manage your restaurant orders. What would you like to do?',
              type: 'options',
              options: [
                { text: 'View pending orders', value: 'view_pending' },
                { text: 'Update preparation time', value: 'update_time' },
                { text: 'Mark items unavailable', value: 'mark_unavailable' },
                { text: 'Order issue', value: 'order_issue' }
              ]
            };
          case 'menu_management':
            return {
              message: 'Let me assist you with menu management.',
              type: 'options',
              options: [
                { text: 'Add new item', value: 'add_item' },
                { text: 'Update existing item', value: 'update_item' },
                { text: 'Remove item', value: 'remove_item' },
                { text: 'Change prices', value: 'change_prices' }
              ]
            };
          case 'view_analytics':
            return {
              message:
                "I can help you understand your restaurant's performance metrics.",
              type: 'options',
              options: [
                { text: 'Sales report', value: 'sales_report' },
                { text: 'Customer feedback', value: 'customer_feedback' },
                { text: 'Popular items', value: 'popular_items' },
                { text: 'Delivery statistics', value: 'delivery_stats' }
              ]
            };
          case 'restaurant_settings':
            return {
              message: 'What restaurant settings would you like to manage?',
              type: 'options',
              options: [
                { text: 'Update business hours', value: 'update_hours' },
                { text: 'Manage delivery zones', value: 'delivery_zones' },
                { text: 'Update contact info', value: 'update_contact' },
                { text: 'Change restaurant profile', value: 'update_profile' }
              ]
            };
          case 'business_support':
            return {
              message:
                'Here are some business support options for your restaurant:',
              type: 'options',
              options: [
                { text: 'Marketing tips', value: 'marketing_tips' },
                { text: 'Optimize menu', value: 'optimize_menu' },
                { text: 'Increase sales', value: 'increase_sales' },
                { text: 'Reduce costs', value: 'reduce_costs' }
              ]
            };
          // Add other option handlers as needed
        }
      }
    }

    return {
      message:
        "I'm not sure I understand. Let me show you what I can help you with:",
      type: 'options',
      options: this.validateMenuOptions(
        userHandler?.mainMenu || [
          { text: 'Talk to human', value: 'human_agent' }
        ]
      ),
      confidence: 0.1
    };
  }

  // Helper method to ensure menu options are correctly formatted
  private validateMenuOptions(options: Array<{ text: string; value: string }>) {
    if (!options) return options;

    // Deep clone to avoid modifying the original
    const validatedOptions = JSON.parse(JSON.stringify(options));

    // Check for and fix any double underscores in option values
    for (const option of validatedOptions) {
      if (option.value && option.value.includes('__')) {
        console.log(
          `DEBUG - Found double underscore in option value: ${option.value}`
        );
        option.value = option.value.replace(/__/g, '_');
        console.log(`DEBUG - Fixed to: ${option.value}`);
      }
    }

    return validatedOptions;
  }

  getGreeting(userType: Enum_UserType): ChatbotResponse {
    const userHandler = this.userTypeHandlers.get(userType);

    // Validate menu options before returning
    const validatedOptions = this.validateMenuOptions(
      userHandler?.mainMenu || []
    );

    return {
      message:
        userHandler?.welcomeMessage || 'Hello! How can I help you today?',
      type: 'options',
      options: validatedOptions,
      followUpPrompt:
        'Please select an option or tell me what you need help with.'
    };
  }

  // Analytics and insights
  getConversationAnalytics(userId: string): any {
    const context = this.contexts.get(userId);
    if (!context) return null;

    return {
      sessionDuration: Date.now() - context.sessionStartTime.getTime(),
      messageCount: context.previousMessages.length,
      escalationCount: context.escalationCount,
      lastSentiment: context.sentiment,
      userType: context.userType,
      completedFlows: context.collectedData
        ? Object.keys(context.collectedData)
        : []
    };
  }

  clearContext(userId: string): void {
    this.contexts.delete(userId);
  }

  // New method to handle option selection
  private isOptionSelection(
    message: string,
    context: ConversationContext
  ): boolean {
    // Check if we have a current flow and step
    if (!context.currentFlow || !context.currentStep) {
      return false;
    }

    // Get the current flow and step
    const flow = this.conversationFlows.get(context.currentFlow);
    if (!flow || !flow.steps || !flow.steps[context.currentStep]) {
      return false;
    }

    const step = flow.steps[context.currentStep];

    // Check if the step has options
    if (!step.options) {
      return false;
    }

    // Check if the message matches any option value or text
    const normalizedMessage = message.toLowerCase().trim();
    const cleanMessage = normalizedMessage.replace(/[^\w\s]/gi, '').trim();

    return step.options.some(option => {
      // Try exact value match first
      if (option.value.toLowerCase() === normalizedMessage) {
        return true;
      }

      // Try exact text match (with emojis)
      if (option.text.toLowerCase() === normalizedMessage) {
        return true;
      }

      // Try text match without emojis
      const cleanOptionText = option.text
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .trim();
      return (
        cleanOptionText === cleanMessage ||
        cleanMessage.includes(cleanOptionText)
      );
    });
  }
}
