import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from './openai';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issueDate: Date;
  paymentTerms: string;
  notes: string;
  metadata: InvoiceMetadata;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
  taxRate: number;
}

export interface InvoiceMetadata {
  generatedAt: Date;
  template: string;
  aiGenerated: boolean;
  collaborationId?: string;
  projectId?: string;
  paymentMethod: string;
  lateFeeRate: number;
  discountRate: number;
  attachments: string[];
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  isDefault: boolean;
  createdBy: string;
}

export interface PaymentTerms {
  id: string;
  name: string;
  description: string;
  days: number;
  lateFeeRate: number;
  discountRate: number;
  discountDays: number;
}

export class InvoiceGeneration {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async generateInvoice(invoiceData: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientAddress: any;
    items: Omit<InvoiceItem, 'id' | 'total'>[];
    currency: string;
    paymentTerms: string;
    notes?: string;
    collaborationId?: string;
    projectId?: string;
  }): Promise<Invoice> {
    try {
      const invoiceId = `inv_${Date.now()}`;
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Calculate totals
      const items = invoiceData.items.map(item => ({
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        total: item.quantity * item.unitPrice
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.1; // 10% tax rate
      const total = subtotal + tax;

      const invoice: Invoice = {
        id: invoiceId,
        invoiceNumber,
        clientId: invoiceData.clientId,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientAddress: invoiceData.clientAddress,
        items,
        subtotal,
        tax,
        total,
        currency: invoiceData.currency,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        issueDate: new Date(),
        paymentTerms: invoiceData.paymentTerms,
        notes: invoiceData.notes || '',
        metadata: {
          generatedAt: new Date(),
          template: 'default',
          aiGenerated: false,
          collaborationId: invoiceData.collaborationId,
          projectId: invoiceData.projectId,
          paymentMethod: 'bank_transfer',
          lateFeeRate: 0.05,
          discountRate: 0.02,
          attachments: []
        }
      };

      // Save to database
      await this.saveInvoice(invoice);

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice');
    }
  }

  async generateAIInvoice(collaborationId: string, requirements: {
    includePerformanceBonuses: boolean;
    includeExpenses: boolean;
    includeTaxes: boolean;
    currency: string;
    paymentTerms: string;
  }): Promise<Invoice> {
    try {
      // Get collaboration data
      const collaboration = await this.getCollaboration(collaborationId);
      if (!collaboration) {
        throw new Error('Collaboration not found');
      }

      // Generate AI-powered invoice content
      const aiContent = await this.generateAIInvoiceContent(collaboration, requirements);
      
      // Create invoice with AI-generated content
      const invoice = await this.generateInvoice({
        clientId: collaboration.brandId,
        clientName: collaboration.brandName,
        clientEmail: collaboration.brandEmail,
        clientAddress: collaboration.brandAddress,
        items: aiContent.items,
        currency: requirements.currency,
        paymentTerms: requirements.paymentTerms,
        notes: aiContent.notes,
        collaborationId,
        projectId: collaboration.projectId
      });

      // Mark as AI-generated
      invoice.metadata.aiGenerated = true;
      await this.updateInvoice(invoice);

      return invoice;
    } catch (error) {
      console.error('Error generating AI invoice:', error);
      throw new Error('Failed to generate AI invoice');
    }
  }

  private async generateAIInvoiceContent(collaboration: any, requirements: any): Promise<{
    items: Omit<InvoiceItem, 'id' | 'total'>[];
    notes: string;
  }> {
    const systemPrompt = `You are an expert invoice generator for creator collaborations. Generate professional invoice content based on collaboration details.

Consider:
- Collaboration deliverables and timeline
- Performance metrics and bonuses
- Industry standards and best practices
- Tax implications and compliance
- Payment terms and conditions

Generate detailed invoice items, descriptions, and professional notes.`;

    const userPrompt = `Generate invoice content for this collaboration:

Collaboration: ${collaboration.title}
Description: ${collaboration.description}
Deliverables: ${collaboration.deliverables.join(', ')}
Timeline: ${collaboration.timeline} days
Budget: $${collaboration.budget}
Platform: ${collaboration.platform}
Content Type: ${collaboration.contentType}

Requirements:
- Include Performance Bonuses: ${requirements.includePerformanceBonuses}
- Include Expenses: ${requirements.includeExpenses}
- Include Taxes: ${requirements.includeTaxes}
- Currency: ${requirements.currency}
- Payment Terms: ${requirements.paymentTerms}

Generate professional invoice items and notes.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No AI content generated');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating AI invoice content:', error);
      return {
        items: [
          {
            description: 'Content Creation Services',
            quantity: 1,
            unitPrice: collaboration.budget,
            category: 'services',
            taxRate: 0.1
          }
        ],
        notes: 'Thank you for your business. Payment is due within 30 days.'
      };
    }
  }

  async createInvoiceTemplate(template: Omit<InvoiceTemplate, 'id' | 'createdBy'>): Promise<string> {
    try {
      const templateId = `template_${Date.now()}`;
      
      const { error } = await this.supabase
        .from('invoice_templates')
        .insert({
          id: templateId,
          name: template.name,
          description: template.description,
          template: template.template,
          variables: template.variables,
          category: template.category,
          is_default: template.isDefault,
          created_by: 'system'
        });

      if (error) {
        console.error('Error creating invoice template:', error);
        throw new Error('Failed to create invoice template');
      }

      return templateId;
    } catch (error) {
      console.error('Error creating invoice template:', error);
      throw new Error('Failed to create invoice template');
    }
  }

  async getInvoiceTemplates(category?: string): Promise<InvoiceTemplate[]> {
    try {
      let query = this.supabase
        .from('invoice_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching invoice templates:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        template: item.template,
        variables: item.variables,
        category: item.category,
        isDefault: item.is_default,
        createdBy: item.created_by
      }));
    } catch (error) {
      console.error('Error fetching invoice templates:', error);
      return [];
    }
  }

  async generateInvoicePDF(invoiceId: string): Promise<string> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate PDF content
      const pdfContent = this.generatePDFContent(invoice);
      
      // Save PDF to storage
      const pdfUrl = await this.savePDFToStorage(invoiceId, pdfContent);
      
      // Update invoice with PDF URL
      await this.updateInvoicePDF(invoiceId, pdfUrl);
      
      return pdfUrl;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }

  private generatePDFContent(invoice: Invoice): string {
    // This would generate actual PDF content
    // For now, return HTML that can be converted to PDF
    return `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .totals { text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Invoice #: ${invoice.invoiceNumber}</p>
            <p>Date: ${invoice.issueDate.toLocaleDateString()}</p>
          </div>
          
          <div class="invoice-details">
            <h3>Bill To:</h3>
            <p>${invoice.clientName}</p>
            <p>${invoice.clientEmail}</p>
            <p>${invoice.clientAddress.street}</p>
            <p>${invoice.clientAddress.city}, ${invoice.clientAddress.state} ${invoice.clientAddress.zipCode}</p>
            <p>${invoice.clientAddress.country}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
            <p>Tax: $${invoice.tax.toFixed(2)}</p>
            <p><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
          </div>
          
          <div class="payment-terms">
            <h3>Payment Terms:</h3>
            <p>${invoice.paymentTerms}</p>
            <p>Due Date: ${invoice.dueDate.toLocaleDateString()}</p>
          </div>
          
          ${invoice.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  }

  private async savePDFToStorage(invoiceId: string, content: string): Promise<string> {
    // This would save the PDF to Supabase Storage or similar
    // For now, return a mock URL
    return `https://storage.example.com/invoices/${invoiceId}.pdf`;
  }

  private async updateInvoicePDF(invoiceId: string, pdfUrl: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .update({ pdf_url: pdfUrl })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error updating invoice PDF:', error);
      }
    } catch (error) {
      console.error('Error updating invoice PDF:', error);
    }
  }

  async sendInvoice(invoiceId: string, recipientEmail: string): Promise<void> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate PDF if not exists
      let pdfUrl = invoice.metadata.attachments.find(url => url.includes('.pdf'));
      if (!pdfUrl) {
        pdfUrl = await this.generateInvoicePDF(invoiceId);
      }

      // Send email with invoice
      await this.sendInvoiceEmail(invoice, recipientEmail, pdfUrl);
      
      // Update invoice status
      await this.updateInvoiceStatus(invoiceId, 'sent');
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw new Error('Failed to send invoice');
    }
  }

  private async sendInvoiceEmail(invoice: Invoice, recipientEmail: string, pdfUrl: string): Promise<void> {
    // This would integrate with an email service like SendGrid or Resend
    console.log(`Sending invoice ${invoice.invoiceNumber} to ${recipientEmail}`);
    console.log(`PDF URL: ${pdfUrl}`);
  }

  private async updateInvoiceStatus(invoiceId: string, status: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error updating invoice status:', error);
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching invoice:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        invoiceNumber: data.invoice_number,
        clientId: data.client_id,
        clientName: data.client_name,
        clientEmail: data.client_email,
        clientAddress: data.client_address,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        currency: data.currency,
        status: data.status,
        dueDate: new Date(data.due_date),
        issueDate: new Date(data.issue_date),
        paymentTerms: data.payment_terms,
        notes: data.notes,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  private async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .insert({
          id: invoice.id,
          invoice_number: invoice.invoiceNumber,
          client_id: invoice.clientId,
          client_name: invoice.clientName,
          client_email: invoice.clientEmail,
          client_address: invoice.clientAddress,
          items: invoice.items,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          currency: invoice.currency,
          status: invoice.status,
          due_date: invoice.dueDate.toISOString(),
          issue_date: invoice.issueDate.toISOString(),
          payment_terms: invoice.paymentTerms,
          notes: invoice.notes,
          metadata: invoice.metadata
        });

      if (error) {
        console.error('Error saving invoice:', error);
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw new Error('Failed to save invoice');
    }
  }

  private async updateInvoice(invoice: Invoice): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .update({
          items: invoice.items,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          status: invoice.status,
          due_date: invoice.dueDate.toISOString(),
          payment_terms: invoice.paymentTerms,
          notes: invoice.notes,
          metadata: invoice.metadata
        })
        .eq('id', invoice.id);

      if (error) {
        console.error('Error updating invoice:', error);
        throw new Error('Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  private async getCollaboration(collaborationId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('collaborations')
        .select('*')
        .eq('id', collaborationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching collaboration:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching collaboration:', error);
      return null;
    }
  }
}
