import { supabase } from './supabase';
import { openai } from './openai';

export interface BusinessMetrics {
  mrr: number;
  arr: number;
  arpu: number;
  churnRate: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  grossRevenue: number;
  netRevenue: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  upgradeRate: number;
  downgradeRate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface CohortAnalysis {
  cohortMonth: string;
  cohortSize: number;
  revenue: number[];
  retention: number[];
  ltv: number;
  paybackPeriod: number;
}

export interface RevenueForecast {
  month: string;
  predictedRevenue: number;
  confidence: number;
  factors: string[];
}

export interface AnomalyAlert {
  id: string;
  type: 'revenue' | 'usage' | 'churn' | 'signups';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface GrowthRecommendation {
  id: string;
  category: 'acquisition' | 'retention' | 'monetization' | 'product';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  metrics: string[];
}

// Business Intelligence Service
export class BusinessIntelligenceService {
  // Get comprehensive business metrics
  async getBusinessMetrics(period: '7d' | '30d' | '90d' | '1y'): Promise<BusinessMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get billing history
      const { data: billingHistory } = await supabase
        .from('billing_history')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'paid');

      // Get user data
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate metrics
      const totalRevenue = billingHistory?.reduce((sum, bill) => sum + bill.amount, 0) || 0;
      const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
      const newUsers = users?.length || 0;
      
      // Calculate MRR
      const mrr = this.calculateMRR(subscriptions || []);
      
      // Calculate ARPU
      const arpu = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;
      
      // Calculate churn rate
      const churnRate = this.calculateChurnRate(subscriptions || []);
      
      // Calculate CAC (simplified)
      const cac = this.calculateCAC(newUsers, period);
      
      // Calculate LTV
      const ltv = this.calculateLTV(arpu, churnRate);
      
      // Calculate LTV/CAC ratio
      const ltvCacRatio = cac > 0 ? ltv / cac : 0;

      return {
        mrr,
        arr: mrr * 12,
        arpu,
        churnRate,
        cac,
        ltv,
        ltvCacRatio,
        grossRevenue: totalRevenue,
        netRevenue: totalRevenue * 0.85, // Assuming 15% costs
        activeUsers: activeSubscriptions,
        newUsers,
        churnedUsers: Math.round(activeSubscriptions * churnRate),
        upgradeRate: this.calculateUpgradeRate(subscriptions || []),
        downgradeRate: this.calculateDowngradeRate(subscriptions || []),
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        }
      };
    } catch (error) {
      console.error('Error calculating business metrics:', error);
      throw error;
    }
  }

  private calculateMRR(subscriptions: any[]): number {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
      // Get price from subscription tier
      const tierPrices = { pro: 29, elite: 99 };
      const price = tierPrices[sub.stripe_price_id as keyof typeof tierPrices] || 0;
      return sum + price;
    }, 0);
    
    return monthlyRevenue;
  }

  private calculateChurnRate(subscriptions: any[]): number {
    const totalSubscriptions = subscriptions.length;
    const churnedSubscriptions = subscriptions.filter(sub => 
      sub.status === 'canceled' || sub.status === 'past_due'
    ).length;
    
    return totalSubscriptions > 0 ? churnedSubscriptions / totalSubscriptions : 0;
  }

  private calculateCAC(newUsers: number, period: string): number {
    // Simplified CAC calculation
    const marketingSpend = this.getMarketingSpend(period);
    return newUsers > 0 ? marketingSpend / newUsers : 0;
  }

  private getMarketingSpend(period: string): number {
    // Mock marketing spend data
    const spendData = {
      '7d': 1000,
      '30d': 5000,
      '90d': 15000,
      '1y': 60000
    };
    return spendData[period as keyof typeof spendData] || 0;
  }

  private calculateLTV(arpu: number, churnRate: number): number {
    if (churnRate === 0) return arpu * 12; // If no churn, assume 12 months
    return arpu / churnRate;
  }

  private calculateUpgradeRate(subscriptions: any[]): number {
    // Simplified upgrade rate calculation
    const upgrades = subscriptions.filter(sub => 
      sub.status === 'active' && sub.stripe_price_id.includes('elite')
    ).length;
    return subscriptions.length > 0 ? upgrades / subscriptions.length : 0;
  }

  private calculateDowngradeRate(subscriptions: any[]): number {
    // Simplified downgrade rate calculation
    const downgrades = subscriptions.filter(sub => 
      sub.status === 'canceled' && sub.cancel_at_period_end
    ).length;
    return subscriptions.length > 0 ? downgrades / subscriptions.length : 0;
  }

  // AI Revenue Forecasting
  async generateRevenueForecast(months: number = 6): Promise<RevenueForecast[]> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalRevenueData();
      
      // Use OpenAI to analyze trends and generate forecast
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a business analyst. Analyze the provided revenue data and generate a ${months}-month forecast. Consider seasonality, growth trends, and market factors. Return a JSON array with month, predictedRevenue, confidence (0-1), and factors.`
          },
          {
            role: "user",
            content: `Historical revenue data: ${JSON.stringify(historicalData)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const forecastData = JSON.parse(response.choices[0]?.message?.content || '[]');
      return forecastData;
    } catch (error) {
      console.error('Error generating revenue forecast:', error);
      return [];
    }
  }

  private async getHistoricalRevenueData(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('billing_history')
        .select('amount, created_at')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      // Group by month
      const monthlyData = (data || []).reduce((acc: any, bill: any) => {
        const month = new Date(bill.created_at).toISOString().substring(0, 7);
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += bill.amount;
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));
    } catch (error) {
      console.error('Error fetching historical revenue data:', error);
      return [];
    }
  }

  // Anomaly Detection
  async detectAnomalies(): Promise<AnomalyAlert[]> {
    try {
      const metrics = await this.getBusinessMetrics('30d');
      const previousMetrics = await this.getBusinessMetrics('90d');
      
      const anomalies: AnomalyAlert[] = [];

      // Check revenue anomaly
      const revenueChange = (metrics.mrr - previousMetrics.mrr) / previousMetrics.mrr;
      if (Math.abs(revenueChange) > 0.2) { // 20% change threshold
        anomalies.push({
          id: `revenue-${Date.now()}`,
          type: 'revenue',
          severity: Math.abs(revenueChange) > 0.5 ? 'critical' : 'high',
          metric: 'MRR',
          currentValue: metrics.mrr,
          expectedValue: previousMetrics.mrr,
          deviation: revenueChange,
          description: `MRR ${revenueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Check churn anomaly
      const churnChange = metrics.churnRate - previousMetrics.churnRate;
      if (Math.abs(churnChange) > 0.05) { // 5% change threshold
        anomalies.push({
          id: `churn-${Date.now()}`,
          type: 'churn',
          severity: churnChange > 0.1 ? 'critical' : 'high',
          metric: 'Churn Rate',
          currentValue: metrics.churnRate,
          expectedValue: previousMetrics.churnRate,
          deviation: churnChange,
          description: `Churn rate ${churnChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(churnChange * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Check signup anomaly
      const signupChange = (metrics.newUsers - previousMetrics.newUsers) / previousMetrics.newUsers;
      if (Math.abs(signupChange) > 0.3) { // 30% change threshold
        anomalies.push({
          id: `signups-${Date.now()}`,
          type: 'signups',
          severity: Math.abs(signupChange) > 0.5 ? 'critical' : 'medium',
          metric: 'New Users',
          currentValue: metrics.newUsers,
          expectedValue: previousMetrics.newUsers,
          deviation: signupChange,
          description: `New users ${signupChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(signupChange * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  // Growth Goal Planner
  async generateGrowthPlan(targetGrowth: number, timeframe: string): Promise<GrowthRecommendation[]> {
    try {
      const currentMetrics = await this.getBusinessMetrics('30d');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a growth strategist. Given current business metrics and a target growth goal, provide specific recommendations to achieve that growth. Focus on actionable strategies for acquisition, retention, and monetization.`
          },
          {
            role: "user",
            content: `Current metrics: MRR: $${currentMetrics.mrr}, ARPU: $${currentMetrics.arpu}, Churn: ${(currentMetrics.churnRate * 100).toFixed(1)}%, CAC: $${currentMetrics.cac}, LTV: $${currentMetrics.ltv}
            
            Target: ${targetGrowth}% growth in ${timeframe}
            
            Provide 5-7 specific recommendations with expected impact, effort level, and timeline.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const recommendations = this.parseGrowthRecommendations(response.choices[0]?.message?.content || '');
      return recommendations;
    } catch (error) {
      console.error('Error generating growth plan:', error);
      return [];
    }
  }

  private parseGrowthRecommendations(content: string): GrowthRecommendation[] {
    try {
      // Parse AI response into structured recommendations
      const lines = content.split('\n').filter(line => line.trim());
      const recommendations: GrowthRecommendation[] = [];
      
      let currentRec: Partial<GrowthRecommendation> = {};
      
      lines.forEach((line, index) => {
        if (line.match(/^\d+\./)) {
          if (currentRec.title) {
            recommendations.push(currentRec as GrowthRecommendation);
          }
          currentRec = {
            id: `rec-${index}`,
            title: line.replace(/^\d+\.\s*/, ''),
            category: 'acquisition',
            priority: 'medium',
            effort: 'medium',
            timeline: '1-3 months',
            metrics: []
          };
        } else if (line.includes('Impact:') || line.includes('Expected:')) {
          currentRec.expectedImpact = line.split(':')[1]?.trim() || '';
        } else if (line.includes('Effort:') || line.includes('Difficulty:')) {
          const effort = line.toLowerCase();
          if (effort.includes('low')) currentRec.effort = 'low';
          else if (effort.includes('high')) currentRec.effort = 'high';
          else currentRec.effort = 'medium';
        } else if (line.includes('Timeline:') || line.includes('Duration:')) {
          currentRec.timeline = line.split(':')[1]?.trim() || '1-3 months';
        }
      });
      
      if (currentRec.title) {
        recommendations.push(currentRec as GrowthRecommendation);
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error parsing growth recommendations:', error);
      return [];
    }
  }

  // Cohort Analysis
  async getCohortAnalysis(): Promise<CohortAnalysis[]> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, created_at, subscription_tier')
        .order('created_at', { ascending: true });

      const { data: billingHistory } = await supabase
        .from('billing_history')
        .select('user_id, amount, created_at')
        .eq('status', 'paid');

      // Group users by cohort month
      const cohorts = (users || []).reduce((acc: any, user: any) => {
        const cohortMonth = new Date(user.created_at).toISOString().substring(0, 7);
        if (!acc[cohortMonth]) {
          acc[cohortMonth] = [];
        }
        acc[cohortMonth].push(user);
        return acc;
      }, {});

      const cohortAnalysis: CohortAnalysis[] = [];

      Object.entries(cohorts).forEach(([month, users]: [string, any]) => {
        const cohortSize = users.length;
        const revenue = this.calculateCohortRevenue(users, billingHistory || []);
        const retention = this.calculateCohortRetention(users, month);
        const ltv = revenue.reduce((sum, rev) => sum + rev, 0);
        const paybackPeriod = this.calculatePaybackPeriod(revenue);

        cohortAnalysis.push({
          cohortMonth: month,
          cohortSize,
          revenue,
          retention,
          ltv,
          paybackPeriod
        });
      });

      return cohortAnalysis.sort((a, b) => a.cohortMonth.localeCompare(b.cohortMonth));
    } catch (error) {
      console.error('Error calculating cohort analysis:', error);
      return [];
    }
  }

  private calculateCohortRevenue(users: any[], billingHistory: any[]): number[] {
    const monthlyRevenue = new Array(12).fill(0);
    
    users.forEach(user => {
      const userBills = billingHistory.filter(bill => bill.user_id === user.id);
      userBills.forEach(bill => {
        const monthsSinceSignup = this.getMonthsDifference(user.created_at, bill.created_at);
        if (monthsSinceSignup < 12) {
          monthlyRevenue[monthsSinceSignup] += bill.amount;
        }
      });
    });

    return monthlyRevenue;
  }

  private calculateCohortRetention(users: any[], cohortMonth: string): number[] {
    const retention = new Array(12).fill(0);
    
    users.forEach(user => {
      for (let month = 0; month < 12; month++) {
        const checkDate = new Date(user.created_at);
        checkDate.setMonth(checkDate.getMonth() + month);
        
        // Check if user was active in this month
        // This is simplified - in reality, you'd check actual activity
        if (user.subscription_tier !== 'free') {
          retention[month] += 1;
        }
      }
    });

    return retention.map(count => count / users.length);
  }

  private calculatePaybackPeriod(revenue: number[]): number {
    const totalRevenue = revenue.reduce((sum, rev) => sum + rev, 0);
    const monthlyAverage = totalRevenue / revenue.length;
    const cac = 50; // Simplified CAC
    return cac / monthlyAverage;
  }

  private getMonthsDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  }

  // Auto-KPI Briefings
  async generateKPIBriefing(): Promise<string> {
    try {
      const currentMetrics = await this.getBusinessMetrics('7d');
      const previousMetrics = await this.getBusinessMetrics('30d');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a business analyst. Generate a concise weekly KPI briefing summarizing key metrics, trends, and insights. Focus on actionable insights and notable changes.`
          },
          {
            role: "user",
            content: `Current week metrics: MRR: $${currentMetrics.mrr}, ARPU: $${currentMetrics.arpu}, Churn: ${(currentMetrics.churnRate * 100).toFixed(1)}%, New Users: ${currentMetrics.newUsers}
            
            Previous period: MRR: $${previousMetrics.mrr}, ARPU: $${previousMetrics.arpu}, Churn: ${(previousMetrics.churnRate * 100).toFixed(1)}%, New Users: ${previousMetrics.newUsers}
            
            Generate a 2-3 paragraph briefing highlighting key changes and recommendations.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating KPI briefing:', error);
      return 'Unable to generate KPI briefing at this time.';
    }
  }

  // Store anomaly alerts
  async storeAnomalyAlert(alert: AnomalyAlert): Promise<void> {
    try {
      await supabase
        .from('anomaly_alerts')
        .insert([alert]);
    } catch (error) {
      console.error('Error storing anomaly alert:', error);
    }
  }

  // Get stored anomaly alerts
  async getAnomalyAlerts(resolved: boolean = false): Promise<AnomalyAlert[]> {
    try {
      const { data, error } = await supabase
        .from('anomaly_alerts')
        .select('*')
        .eq('resolved', resolved)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching anomaly alerts:', error);
      return [];
    }
  }

  // Mark anomaly as resolved
  async resolveAnomalyAlert(alertId: string): Promise<void> {
    try {
      await supabase
        .from('anomaly_alerts')
        .update({ resolved: true })
        .eq('id', alertId);
    } catch (error) {
      console.error('Error resolving anomaly alert:', error);
    }
  }
}

// Export singleton instance
export const businessIntelligence = new BusinessIntelligenceService();
