import { supabase } from './supabase';
import { openai } from './openai';

export interface OperationTask {
  id: string;
  type: 'finance' | 'hr' | 'legal' | 'compliance' | 'backup' | 'monitoring' | 'reporting';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate: string;
  completedAt?: string;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceReconciliation {
  id: string;
  stripeTransactionId: string;
  ledgerEntryId: string;
  amount: number;
  currency: string;
  status: 'matched' | 'mismatch' | 'unmatched';
  discrepancy?: number;
  notes?: string;
  reconciledAt: string;
  reconciledBy: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'approved' | 'paid';
  paymentMethod: 'bank_transfer' | 'deel' | 'remote';
  externalId?: string;
  processedAt?: string;
  createdAt: string;
}

export interface TaxSummary {
  id: string;
  region: string;
  period: string;
  totalSales: number;
  taxOwed: number;
  currency: string;
  breakdown: TaxBreakdown[];
  status: 'draft' | 'review' | 'filed' | 'paid';
  filedAt?: string;
  createdAt: string;
}

export interface TaxBreakdown {
  taxType: string;
  rate: number;
  amount: number;
  description: string;
}

export interface VendorScorecard {
  id: string;
  vendorName: string;
  vendorType: 'api' | 'service' | 'infrastructure' | 'software';
  reliability: number; // 0-100
  latency: number; // ms
  cost: number; // monthly cost
  uptime: number; // percentage
  support: number; // 0-100
  overallScore: number; // 0-100
  recommendation: 'keep' | 'replace' | 'negotiate';
  lastUpdated: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  description: string;
  vendor: string;
  receiptUrl?: string;
  aiClassified: boolean;
  confidence: number; // 0-100
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface CashFlowForecast {
  id: string;
  period: string;
  currentRunway: number; // months
  burnRate: number; // monthly
  projectedRevenue: number;
  projectedExpenses: number;
  netCashFlow: number;
  confidence: number; // 0-100
  alerts: string[];
  generatedAt: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'resolved' | 'monitoring';
  description: string;
  affectedServices: string[];
  startTime: string;
  endTime?: string;
  resolution?: string;
  impact: string;
  rootCause?: string;
  prevention?: string;
  reportedBy: string;
  assignedTo?: string;
}

// AI Operations Service
export class AIOperationsService {
  // Finance Reconciler
  async reconcileStripePayments(): Promise<FinanceReconciliation[]> {
    try {
      // Get recent Stripe transactions
      const stripeTransactions = await this.getStripeTransactions();
      
      // Get ledger entries
      const ledgerEntries = await this.getLedgerEntries();
      
      const reconciliations: FinanceReconciliation[] = [];
      
      for (const transaction of stripeTransactions) {
        const matchingLedger = ledgerEntries.find(entry => 
          Math.abs(entry.amount - transaction.amount) < 0.01 &&
          entry.currency === transaction.currency &&
          Math.abs(new Date(entry.date).getTime() - new Date(transaction.date).getTime()) < 24 * 60 * 60 * 1000
        );
        
        const reconciliation: FinanceReconciliation = {
          id: `recon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          stripeTransactionId: transaction.id,
          ledgerEntryId: matchingLedger?.id || 'unmatched',
          amount: transaction.amount,
          currency: transaction.currency,
          status: matchingLedger ? 'matched' : 'unmatched',
          discrepancy: matchingLedger ? Math.abs(transaction.amount - matchingLedger.amount) : undefined,
          reconciledAt: new Date().toISOString(),
          reconciledBy: 'ai-finance-reconciler',
        };
        
        reconciliations.push(reconciliation);
        
        // Store reconciliation
        await supabase
          .from('finance_reconciliations')
          .insert([reconciliation]);
      }
      
      return reconciliations;
    } catch (error) {
      console.error('Error reconciling Stripe payments:', error);
      return [];
    }
  }

  private async getStripeTransactions(): Promise<any[]> {
    // Mock Stripe transactions - in real app, use Stripe API
    return [
      { id: 'txn_1', amount: 99.00, currency: 'USD', date: new Date().toISOString() },
      { id: 'txn_2', amount: 49.00, currency: 'USD', date: new Date().toISOString() },
    ];
  }

  private async getLedgerEntries(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('ledger_entries')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      return data || [];
    } catch (error) {
      console.error('Error getting ledger entries:', error);
      return [];
    }
  }

  // Payroll Automation
  async processPayroll(period: string): Promise<PayrollRecord[]> {
    try {
      // Get active employees
      const employees = await this.getActiveEmployees();
      
      const payrollRecords: PayrollRecord[] = [];
      
      for (const employee of employees) {
        const grossPay = await this.calculateGrossPay(employee.id, period);
        const deductions = await this.calculateDeductions(employee.id, grossPay);
        const netPay = grossPay - deductions;
        
        const payrollRecord: PayrollRecord = {
          id: `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          employeeId: employee.id,
          employeeName: employee.name,
          period,
          grossPay,
          deductions,
          netPay,
          status: 'pending',
          paymentMethod: employee.paymentMethod || 'bank_transfer',
          createdAt: new Date().toISOString(),
        };
        
        payrollRecords.push(payrollRecord);
        
        // Store payroll record
        await supabase
          .from('payroll_records')
          .insert([payrollRecord]);
      }
      
      return payrollRecords;
    } catch (error) {
      console.error('Error processing payroll:', error);
      return [];
    }
  }

  private async getActiveEmployees(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active');
      
      return data || [];
    } catch (error) {
      console.error('Error getting active employees:', error);
      return [];
    }
  }

  private async calculateGrossPay(employeeId: string, period: string): Promise<number> {
    // Mock calculation - in real app, calculate based on hours, salary, etc.
    return 5000; // Monthly salary
  }

  private async calculateDeductions(employeeId: string, grossPay: number): Promise<number> {
    // Mock calculation - in real app, calculate taxes, benefits, etc.
    return grossPay * 0.25; // 25% deductions
  }

  // Tax Summary AI
  async generateTaxSummary(region: string, period: string): Promise<TaxSummary> {
    try {
      // Get sales data for the period
      const salesData = await this.getSalesData(region, period);
      
      // Calculate tax breakdown
      const breakdown = await this.calculateTaxBreakdown(region, salesData);
      
      const totalTaxOwed = breakdown.reduce((sum, item) => sum + item.amount, 0);
      
      const taxSummary: TaxSummary = {
        id: `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        region,
        period,
        totalSales: salesData.totalSales,
        taxOwed: totalTaxOwed,
        currency: 'USD',
        breakdown,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      
      // Store tax summary
      await supabase
        .from('tax_summaries')
        .insert([taxSummary]);
      
      return taxSummary;
    } catch (error) {
      console.error('Error generating tax summary:', error);
      throw error;
    }
  }

  private async getSalesData(region: string, period: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('sales_data')
        .select('*')
        .eq('region', region)
        .eq('period', period);
      
      return data?.[0] || { totalSales: 0 };
    } catch (error) {
      console.error('Error getting sales data:', error);
      return { totalSales: 0 };
    }
  }

  private async calculateTaxBreakdown(region: string, salesData: any): Promise<TaxBreakdown[]> {
    // Mock tax calculation - in real app, use actual tax rates
    const baseRate = 0.08; // 8% base tax rate
    
    return [
      {
        taxType: 'Sales Tax',
        rate: baseRate,
        amount: salesData.totalSales * baseRate,
        description: 'Standard sales tax',
      },
      {
        taxType: 'VAT',
        rate: 0.02,
        amount: salesData.totalSales * 0.02,
        description: 'Value Added Tax',
      },
    ];
  }

  // AI Procurement Assistant
  async analyzeAPISpending(): Promise<any> {
    try {
      const spendingData = await this.getAPISpendingData();
      
      const analysis = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI procurement assistant. Analyze API spending data and provide recommendations for cost optimization, including suggestions for cheaper alternatives and usage optimization.`
          },
          {
            role: "user",
            content: `Analyze this API spending data: ${JSON.stringify(spendingData)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      return {
        analysis: analysis.choices[0]?.message?.content,
        recommendations: this.generateProcurementRecommendations(spendingData),
        potentialSavings: this.calculatePotentialSavings(spendingData),
      };
    } catch (error) {
      console.error('Error analyzing API spending:', error);
      return null;
    }
  }

  private async getAPISpendingData(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('api_usage')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      return data || [];
    } catch (error) {
      console.error('Error getting API spending data:', error);
      return [];
    }
  }

  private generateProcurementRecommendations(spendingData: any[]): string[] {
    // Mock recommendations - in real app, use AI analysis
    return [
      'Consider switching to GPT-3.5-turbo for non-critical tasks',
      'Implement request caching to reduce API calls',
      'Negotiate volume discounts with OpenAI',
      'Use regional endpoints to reduce latency costs',
    ];
  }

  private calculatePotentialSavings(spendingData: any[]): number {
    // Mock calculation - in real app, calculate actual savings
    return 500; // Monthly potential savings
  }

  // Vendor Scorecard Bot
  async updateVendorScorecards(): Promise<VendorScorecard[]> {
    try {
      const vendors = await this.getVendors();
      const scorecards: VendorScorecard[] = [];
      
      for (const vendor of vendors) {
        const metrics = await this.getVendorMetrics(vendor.id);
        const scorecard = await this.calculateVendorScorecard(vendor, metrics);
        scorecards.push(scorecard);
        
        // Store scorecard
        await supabase
          .from('vendor_scorecards')
          .upsert([scorecard], { onConflict: 'id' });
      }
      
      return scorecards;
    } catch (error) {
      console.error('Error updating vendor scorecards:', error);
      return [];
    }
  }

  private async getVendors(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true);
      
      return data || [];
    } catch (error) {
      console.error('Error getting vendors:', error);
      return [];
    }
  }

  private async getVendorMetrics(vendorId: string): Promise<any> {
    // Mock metrics - in real app, collect real performance data
    return {
      uptime: 99.5,
      latency: 150,
      cost: 1000,
      support: 85,
    };
  }

  private async calculateVendorScorecard(vendor: any, metrics: any): Promise<VendorScorecard> {
    const reliability = metrics.uptime;
    const latency = Math.max(0, 100 - (metrics.latency / 10)); // Convert to 0-100 scale
    const cost = Math.max(0, 100 - (metrics.cost / 50)); // Convert to 0-100 scale
    const support = metrics.support;
    
    const overallScore = (reliability + latency + cost + support) / 4;
    
    let recommendation: 'keep' | 'replace' | 'negotiate' = 'keep';
    if (overallScore < 60) recommendation = 'replace';
    else if (overallScore < 80) recommendation = 'negotiate';
    
    return {
      id: `scorecard_${vendor.id}`,
      vendorName: vendor.name,
      vendorType: vendor.type,
      reliability,
      latency: metrics.latency,
      cost: metrics.cost,
      uptime: metrics.uptime,
      support,
      overallScore,
      recommendation,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Expense Classifier
  async classifyExpense(
    amount: number,
    description: string,
    receiptUrl?: string
  ): Promise<ExpenseRecord> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expense classification AI. Classify business expenses into appropriate categories and subcategories. Return a JSON object with category, subcategory, and confidence score.`
          },
          {
            role: "user",
            content: `Classify this expense: Amount: $${amount}, Description: "${description}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
      });
      
      const classification = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      const expenseRecord: ExpenseRecord = {
        id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency: 'USD',
        category: classification.category || 'Other',
        subcategory: classification.subcategory,
        description,
        vendor: this.extractVendorFromDescription(description),
        receiptUrl,
        aiClassified: true,
        confidence: classification.confidence || 0,
        approved: false,
        createdAt: new Date().toISOString(),
      };
      
      // Store expense record
      await supabase
        .from('expense_records')
        .insert([expenseRecord]);
      
      return expenseRecord;
    } catch (error) {
      console.error('Error classifying expense:', error);
      throw error;
    }
  }

  private extractVendorFromDescription(description: string): string {
    // Simple vendor extraction - in real app, use more sophisticated NLP
    const words = description.split(' ');
    return words[0] || 'Unknown';
  }

  // Cash-Flow Forecaster
  async generateCashFlowForecast(): Promise<CashFlowForecast> {
    try {
      const currentMetrics = await this.getCurrentFinancialMetrics();
      const historicalData = await this.getHistoricalFinancialData();
      
      const forecast = await this.calculateCashFlowForecast(currentMetrics, historicalData);
      
      // Store forecast
      await supabase
        .from('cash_flow_forecasts')
        .insert([forecast]);
      
      return forecast;
    } catch (error) {
      console.error('Error generating cash flow forecast:', error);
      throw error;
    }
  }

  private async getCurrentFinancialMetrics(): Promise<any> {
    try {
      const { data } = await supabase
        .from('financial_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      return data?.[0] || {};
    } catch (error) {
      console.error('Error getting current financial metrics:', error);
      return {};
    }
  }

  private async getHistoricalFinancialData(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('financial_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      return data || [];
    } catch (error) {
      console.error('Error getting historical financial data:', error);
      return [];
    }
  }

  private async calculateCashFlowForecast(current: any, historical: any[]): Promise<CashFlowForecast> {
    // Mock calculation - in real app, use sophisticated forecasting models
    const currentRunway = 18; // months
    const burnRate = 50000; // monthly
    const projectedRevenue = 75000; // monthly
    const projectedExpenses = 60000; // monthly
    const netCashFlow = projectedRevenue - projectedExpenses;
    
    const alerts: string[] = [];
    if (currentRunway < 6) alerts.push('Low runway - consider fundraising');
    if (burnRate > projectedRevenue) alerts.push('Burn rate exceeds revenue');
    
    return {
      id: `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      currentRunway,
      burnRate,
      projectedRevenue,
      projectedExpenses,
      netCashFlow,
      confidence: 85,
      alerts,
      generatedAt: new Date().toISOString(),
    };
  }

  // Incident Response AI
  async detectAndRespondToIncident(): Promise<IncidentReport | null> {
    try {
      const systemHealth = await this.checkSystemHealth();
      
      if (systemHealth.status === 'healthy') {
        return null;
      }
      
      const incident = await this.createIncidentReport(systemHealth);
      
      // Store incident
      await supabase
        .from('incident_reports')
        .insert([incident]);
      
      // Send notifications
      await this.sendIncidentNotifications(incident);
      
      return incident;
    } catch (error) {
      console.error('Error detecting incident:', error);
      return null;
    }
  }

  private async checkSystemHealth(): Promise<any> {
    // Mock health check - in real app, check actual system metrics
    return {
      status: 'healthy',
      uptime: 99.9,
      responseTime: 150,
      errorRate: 0.1,
    };
  }

  private async createIncidentReport(health: any): Promise<IncidentReport> {
    const severity = health.errorRate > 5 ? 'critical' : 
                    health.errorRate > 2 ? 'high' : 
                    health.responseTime > 2000 ? 'medium' : 'low';
    
    return {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `System ${severity} incident detected`,
      severity,
      status: 'detected',
      description: `System health degraded: ${JSON.stringify(health)}`,
      affectedServices: ['api', 'database', 'cdn'],
      startTime: new Date().toISOString(),
      impact: `${severity} impact on user experience`,
      reportedBy: 'ai-incident-detector',
    };
  }

  private async sendIncidentNotifications(incident: IncidentReport): Promise<void> {
    // Mock notification - in real app, send actual notifications
    console.log(`Incident notification: ${incident.title}`);
  }

  // Get all operations tasks
  async getOperationsTasks(
    type?: string,
    status?: string,
    limit: number = 50
  ): Promise<OperationTask[]> {
    try {
      let query = supabase
        .from('operation_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting operations tasks:', error);
      return [];
    }
  }

  // Create operation task
  async createOperationTask(task: Omit<OperationTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationTask> {
    try {
      const newTask: OperationTask = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('operation_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating operation task:', error);
      throw error;
    }
  }

  // Update operation task
  async updateOperationTask(taskId: string, updates: Partial<OperationTask>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('operation_tasks')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating operation task:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiOperationsService = new AIOperationsService();
