import { AutomationAction, SimulationResult, WorkflowGraph } from '../types/workflow';
import { validateWorkflowStructure } from '../utils/graphValidation';

type SendEmailPayload = {
  to: string;
  subject: string;
  body?: string;
};

type SendEmailResult = {
  fileName: string;
  content: string;
};

type GenerateDocumentPayload = {
  template: string;
  recipient: string;
};

type GenerateDocumentResult = {
  fileName: string;
  content: string;
};

const automations: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] }
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async getAutomations(): Promise<AutomationAction[]> {
    await wait(250);
    return automations;
  },

  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    await wait(300);

    const safeSubject = payload.subject
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workflow-mail';

    const content = [
      'From: hr-workflow@tredence.local',
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      `Date: ${new Date().toUTCString()}`,
      'Content-Type: text/plain; charset="utf-8"',
      '',
      payload.body?.trim() || 'Automated workflow notification.'
    ].join('\n');

    return {
      fileName: `${safeSubject}.eml`,
      content
    };
  },

  async generateDocument(payload: GenerateDocumentPayload): Promise<GenerateDocumentResult> {
    await wait(300);

    const safeTemplate = payload.template
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workflow-doc';

    const content = [
      'Tredence HR Workflow Document',
      '=============================',
      `Template: ${payload.template}`,
      `Recipient: ${payload.recipient}`,
      `Generated At: ${new Date().toUTCString()}`,
      '',
      'This is a mock generated document from the automated workflow node.'
    ].join('\n');

    return {
      fileName: `${safeTemplate}.txt`,
      content
    };
  },

  async simulate(graph: WorkflowGraph): Promise<SimulationResult> {
    await wait(400);
    const validation = validateWorkflowStructure(graph.nodes, graph.edges);

    if (!validation.isValid) {
      return {
        isValid: false,
        issues: validation.issues,
        steps: []
      };
    }

    const ordered = [...graph.nodes].sort((a, b) => a.position.y - b.position.y);
    const steps = ordered.map((node, index) => {
      const nodeTitle = node.data.title || node.type;
      return `Step ${index + 1}: ${node.type.toUpperCase()} - ${nodeTitle} executed successfully.`;
    });

    return {
      isValid: true,
      issues: [],
      steps
    };
  }
};
