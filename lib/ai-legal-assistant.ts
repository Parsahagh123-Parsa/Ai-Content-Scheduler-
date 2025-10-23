import { supabase } from './supabase';
import { openai } from './openai';

export interface LegalDocument {
  id: string;
  type: 'nda' | 'privacy-policy' | 'partnership-agreement' | 'terms-of-service' | 'data-processing-agreement';
  title: string;
  content: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'signed' | 'expired';
  parties: DocumentParty[];
  effectiveDate: string;
  expirationDate?: string;
  signedAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  templateId?: string;
  customizations: Record<string, any>;
}

export interface DocumentParty {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'brand' | 'agency' | 'platform' | 'third-party';
  signature?: string;
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalCompliance {
  id: string;
  documentId: string;
  complianceType: 'gdpr' | 'ccpa' | 'coppa' | 'hipaa' | 'sox';
  status: 'compliant' | 'non-compliant' | 'needs-review';
  issues: ComplianceIssue[];
  lastChecked: string;
  nextCheck: string;
}

export interface ComplianceIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  section: string;
  recommendation: string;
  fixed: boolean;
  fixedAt?: string;
}

// AI Legal Assistant Service
export class AILegalAssistant {
  // Generate NDA document
  async generateNDA(
    parties: Omit<DocumentParty, 'id'>[],
    purpose: string,
    duration: number = 24, // months
    customizations: Record<string, any> = {}
  ): Promise<LegalDocument> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document generator specializing in Non-Disclosure Agreements (NDAs). Generate a comprehensive NDA that includes:
            - Clear definition of confidential information
            - Obligations of receiving party
            - Exceptions to confidentiality
            - Term and termination clauses
            - Governing law and jurisdiction
            - Remedies for breach
            - Standard legal language and protections
            
            Make it professional, legally sound, and easy to understand.`
          },
          {
            role: "user",
            content: `Generate an NDA for:
            - Purpose: ${purpose}
            - Duration: ${duration} months
            - Parties: ${parties.map(p => `${p.name} (${p.role})`).join(', ')}
            - Customizations: ${JSON.stringify(customizations)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content || '';

      const document: LegalDocument = {
        id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'nda',
        title: `NDA - ${parties.map(p => p.name).join(' & ')}`,
        content,
        version: '1.0',
        status: 'draft',
        parties: parties.map(p => ({ ...p, id: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` })),
        effectiveDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ai-legal-assistant',
        customizations,
      };

      // Store document
      await this.storeDocument(document);

      return document;
    } catch (error) {
      console.error('Error generating NDA:', error);
      throw error;
    }
  }

  // Generate Privacy Policy
  async generatePrivacyPolicy(
    companyName: string,
    website: string,
    dataTypes: string[],
    thirdParties: string[],
    jurisdiction: string = 'US'
  ): Promise<LegalDocument> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document generator specializing in Privacy Policies. Generate a comprehensive privacy policy that includes:
            - Information collection practices
            - Data usage and processing
            - Third-party sharing
            - User rights and choices
            - Data security measures
            - Cookie policy
            - Contact information
            - Compliance with GDPR, CCPA, and other relevant regulations
            
            Make it clear, comprehensive, and legally compliant.`
          },
          {
            role: "user",
            content: `Generate a privacy policy for:
            - Company: ${companyName}
            - Website: ${website}
            - Data types collected: ${dataTypes.join(', ')}
            - Third parties: ${thirdParties.join(', ')}
            - Jurisdiction: ${jurisdiction}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';

      const document: LegalDocument = {
        id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'privacy-policy',
        title: `Privacy Policy - ${companyName}`,
        content,
        version: '1.0',
        status: 'draft',
        parties: [{
          id: `party_${Date.now()}`,
          name: companyName,
          email: `legal@${website}`,
          role: 'platform',
        }],
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ai-legal-assistant',
        customizations: {
          companyName,
          website,
          dataTypes,
          thirdParties,
          jurisdiction,
        },
      };

      await this.storeDocument(document);
      return document;
    } catch (error) {
      console.error('Error generating privacy policy:', error);
      throw error;
    }
  }

  // Generate Partnership Agreement
  async generatePartnershipAgreement(
    parties: Omit<DocumentParty, 'id'>[],
    partnershipType: 'revenue-sharing' | 'collaboration' | 'licensing' | 'distribution',
    terms: Record<string, any>
  ): Promise<LegalDocument> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document generator specializing in Partnership Agreements. Generate a comprehensive partnership agreement that includes:
            - Partnership structure and purpose
            - Rights and obligations of each party
            - Revenue sharing terms
            - Intellectual property rights
            - Confidentiality provisions
            - Term and termination
            - Dispute resolution
            - Governing law
            
            Make it detailed, fair, and legally enforceable.`
          },
          {
            role: "user",
            content: `Generate a partnership agreement for:
            - Type: ${partnershipType}
            - Parties: ${parties.map(p => `${p.name} (${p.role})`).join(', ')}
            - Terms: ${JSON.stringify(terms)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';

      const document: LegalDocument = {
        id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'partnership-agreement',
        title: `Partnership Agreement - ${parties.map(p => p.name).join(' & ')}`,
        content,
        version: '1.0',
        status: 'draft',
        parties: parties.map(p => ({ ...p, id: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` })),
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ai-legal-assistant',
        customizations: {
          partnershipType,
          terms,
        },
      };

      await this.storeDocument(document);
      return document;
    } catch (error) {
      console.error('Error generating partnership agreement:', error);
      throw error;
    }
  }

  // Generate Terms of Service
  async generateTermsOfService(
    companyName: string,
    serviceDescription: string,
    jurisdiction: string = 'US'
  ): Promise<LegalDocument> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document generator specializing in Terms of Service. Generate comprehensive terms that include:
            - Service description and availability
            - User obligations and restrictions
            - Intellectual property rights
            - Limitation of liability
            - Dispute resolution
            - Termination rights
            - Governing law
            - Amendment procedures
            
            Make it clear, comprehensive, and legally protective.`
          },
          {
            role: "user",
            content: `Generate terms of service for:
            - Company: ${companyName}
            - Service: ${serviceDescription}
            - Jurisdiction: ${jurisdiction}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content || '';

      const document: LegalDocument = {
        id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'terms-of-service',
        title: `Terms of Service - ${companyName}`,
        content,
        version: '1.0',
        status: 'draft',
        parties: [{
          id: `party_${Date.now()}`,
          name: companyName,
          email: `legal@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          role: 'platform',
        }],
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ai-legal-assistant',
        customizations: {
          companyName,
          serviceDescription,
          jurisdiction,
        },
      };

      await this.storeDocument(document);
      return document;
    } catch (error) {
      console.error('Error generating terms of service:', error);
      throw error;
    }
  }

  // Generate Data Processing Agreement
  async generateDataProcessingAgreement(
    controller: Omit<DocumentParty, 'id'>,
    processor: Omit<DocumentParty, 'id'>,
    dataTypes: string[],
    purposes: string[]
  ): Promise<LegalDocument> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document generator specializing in Data Processing Agreements (DPAs) for GDPR compliance. Generate a comprehensive DPA that includes:
            - Data processing details and purposes
            - Data subject rights
            - Security measures and safeguards
            - Sub-processor requirements
            - Data breach notification procedures
            - Data retention and deletion
            - Audit rights
            - Liability and indemnification
            
            Ensure full GDPR compliance and clarity.`
          },
          {
            role: "user",
            content: `Generate a DPA for:
            - Controller: ${controller.name}
            - Processor: ${processor.name}
            - Data types: ${dataTypes.join(', ')}
            - Purposes: ${purposes.join(', ')}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';

      const document: LegalDocument = {
        id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'data-processing-agreement',
        title: `DPA - ${controller.name} & ${processor.name}`,
        content,
        version: '1.0',
        status: 'draft',
        parties: [
          { ...controller, id: `party_${Date.now()}_1` },
          { ...processor, id: `party_${Date.now()}_2` },
        ],
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ai-legal-assistant',
        customizations: {
          dataTypes,
          purposes,
        },
      };

      await this.storeDocument(document);
      return document;
    } catch (error) {
      console.error('Error generating DPA:', error);
      throw error;
    }
  }

  // Store document in database
  private async storeDocument(document: LegalDocument): Promise<void> {
    try {
      await supabase
        .from('legal_documents')
        .insert([document]);
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  // Get document by ID
  async getDocument(documentId: string): Promise<LegalDocument | null> {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  // Update document
  async updateDocument(documentId: string, updates: Partial<LegalDocument>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', documentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }

  // Sign document
  async signDocument(
    documentId: string,
    partyId: string,
    signature: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) return false;

      // Update party signature
      const updatedParties = document.parties.map(party => 
        party.id === partyId 
          ? { 
              ...party, 
              signature, 
              signedAt: new Date().toISOString(),
              ipAddress,
              userAgent,
            }
          : party
      );

      // Check if all parties have signed
      const allSigned = updatedParties.every(party => party.signature);
      
      await this.updateDocument(documentId, {
        parties: updatedParties,
        status: allSigned ? 'signed' : 'review',
        signedAt: allSigned ? new Date().toISOString() : undefined,
      });

      return true;
    } catch (error) {
      console.error('Error signing document:', error);
      return false;
    }
  }

  // Generate PDF from document
  async generatePDF(documentId: string): Promise<string> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) throw new Error('Document not found');

      // In a real implementation, this would use a PDF generation service
      // For now, return a mock URL
      const pdfUrl = `https://api.example.com/legal/documents/${documentId}/pdf`;
      
      // Update document with PDF URL
      await this.updateDocument(documentId, { pdfUrl });
      
      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Check compliance
  async checkCompliance(documentId: string): Promise<LegalCompliance[]> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) return [];

      const complianceChecks: LegalCompliance[] = [];

      // GDPR Compliance Check
      const gdprCompliance = await this.checkGDPRCompliance(document);
      if (gdprCompliance) complianceChecks.push(gdprCompliance);

      // CCPA Compliance Check
      const ccpaCompliance = await this.checkCCPACompliance(document);
      if (ccpaCompliance) complianceChecks.push(ccpaCompliance);

      // Store compliance results
      for (const compliance of complianceChecks) {
        await supabase
          .from('legal_compliance')
          .upsert([compliance], { onConflict: 'id' });
      }

      return complianceChecks;
    } catch (error) {
      console.error('Error checking compliance:', error);
      return [];
    }
  }

  private async checkGDPRCompliance(document: LegalDocument): Promise<LegalCompliance | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a GDPR compliance expert. Analyze the legal document and identify any GDPR compliance issues. Return a JSON object with compliance status and specific issues found.`
          },
          {
            role: "user",
            content: `Analyze this ${document.type} document for GDPR compliance:\n\n${document.content}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        id: `compliance_${document.id}_gdpr`,
        documentId: document.id,
        complianceType: 'gdpr',
        status: analysis.status || 'needs-review',
        issues: analysis.issues || [],
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error checking GDPR compliance:', error);
      return null;
    }
  }

  private async checkCCPACompliance(document: LegalDocument): Promise<LegalCompliance | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a CCPA compliance expert. Analyze the legal document and identify any CCPA compliance issues. Return a JSON object with compliance status and specific issues found.`
          },
          {
            role: "user",
            content: `Analyze this ${document.type} document for CCPA compliance:\n\n${document.content}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        id: `compliance_${document.id}_ccpa`,
        documentId: document.id,
        complianceType: 'ccpa',
        status: analysis.status || 'needs-review',
        issues: analysis.issues || [],
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error checking CCPA compliance:', error);
      return null;
    }
  }

  // Get all documents for a user
  async getUserDocuments(userId: string, type?: string): Promise<LegalDocument[]> {
    try {
      let query = supabase
        .from('legal_documents')
        .select('*')
        .or(`created_by.eq.${userId},parties.cs.[{"userId":"${userId}"}]`)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user documents:', error);
      return [];
    }
  }

  // Get document templates
  async getTemplates(type?: string): Promise<ContractTemplate[]> {
    try {
      let query = supabase
        .from('legal_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  // Create document from template
  async createFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    parties: Omit<DocumentParty, 'id'>[]
  ): Promise<LegalDocument> {
    try {
      const template = await supabase
        .from('legal_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template.data) throw new Error('Template not found');

      let content = template.data.content;
      
      // Replace variables in template
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }

      const document: LegalDocument = {
        id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: template.data.type as any,
        title: template.data.name,
        content,
        version: '1.0',
        status: 'draft',
        parties: parties.map(p => ({ ...p, id: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` })),
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ai-legal-assistant',
        templateId,
        customizations: variables,
      };

      await this.storeDocument(document);
      return document;
    } catch (error) {
      console.error('Error creating from template:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiLegalAssistant = new AILegalAssistant();
