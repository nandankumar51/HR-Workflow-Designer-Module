import { Edge } from '@xyflow/react';
import { useState } from 'react';
import { mockApi } from '../../api/mockApi';
import { AutomationAction, KeyValue, WorkflowNode } from '../../types/workflow';

type Props = {
  selectedNode: WorkflowNode | undefined;
  actions: AutomationAction[];
  onUpdateNode: (nodeId: string, updater: (node: WorkflowNode) => WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
  nodeCount: number;
  edgeCount: number;
};

const toPairs = (values?: KeyValue[]) => (values && values.length ? values : [{ key: '', value: '' }]);

const KeyValueEditor = ({
  label,
  values,
  onChange
}: {
  label: string;
  values: KeyValue[];
  onChange: (values: KeyValue[]) => void;
}) => {
  return (
    <div className="kv-editor">
      <label>{label}</label>
      {values.map((item, index) => (
        <div className="kv-row" key={`${label}-${index}`}>
          <input
            placeholder="key"
            value={item.key}
            onChange={(event) => {
              const next = [...values];
              next[index] = { ...next[index], key: event.target.value };
              onChange(next);
            }}
          />
          <input
            placeholder="value"
            value={item.value}
            onChange={(event) => {
              const next = [...values];
              next[index] = { ...next[index], value: event.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, currentIndex) => currentIndex !== index))}
          >
            x
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...values, { key: '', value: '' }])}>
        + Add Field
      </button>
    </div>
  );
};

const updateTitle = (
  selectedNode: WorkflowNode,
  onUpdateNode: Props['onUpdateNode'],
  value: string
) => {
  onUpdateNode(selectedNode.id, (node) => ({
    ...node,
    data: { ...node.data, title: value }
  }));
};

export const NodeFormPanel = ({
  selectedNode,
  actions,
  onUpdateNode,
  onDeleteNode,
  nodeCount,
  edgeCount
}: Props) => {
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const downloadFile = (fileName: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onSendMail = async () => {
    if (!selectedNode || selectedNode.type !== 'automated') return;

    const to = selectedNode.data.actionParams?.to?.trim() || '';
    const subject = selectedNode.data.actionParams?.subject?.trim() || '';

    if (!to || !subject) {
      window.alert('Please fill both "to" and "subject" before sending email.');
      return;
    }

    try {
      setIsSendingMail(true);
      const result = await mockApi.sendEmail({
        to,
        subject,
        body: selectedNode.data.description || `Triggered from node: ${selectedNode.data.title || 'Automated Step'}`
      });
      downloadFile(result.fileName, result.content, 'message/rfc822');
    } finally {
      setIsSendingMail(false);
    }
  };

  const onGenerateDoc = async () => {
    if (!selectedNode || selectedNode.type !== 'automated') return;

    const template = selectedNode.data.actionParams?.template?.trim() || '';
    const recipient = selectedNode.data.actionParams?.recipient?.trim() || '';

    if (!template || !recipient) {
      window.alert('Please fill both "template" and "recipient" before generating document.');
      return;
    }

    try {
      setIsGeneratingDoc(true);
      const result = await mockApi.generateDocument({ template, recipient });
      downloadFile(result.fileName, result.content, 'text/plain;charset=utf-8');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  if (!selectedNode) {
    return (
      <aside className="panel form-panel">
        <div className="section-heading">
          <span className="section-kicker">Inspector</span>
          <h3>Node configuration</h3>
          <p>Select a node to tune fields, ownership, and automation details.</p>
        </div>
        <div className="metrics">
          <div className="metric-pill">Nodes: {nodeCount}</div>
          <div className="metric-pill">Edges: {edgeCount}</div>
        </div>
      </aside>
    );
  }

  const type = selectedNode.type;
  const data = selectedNode.data;

  return (
    <aside className="panel form-panel">
      <div className="section-heading">
        <span className="section-kicker">Inspector</span>
        <h3>{type.toUpperCase()} Node</h3>
        <p>Adjust how this step behaves inside the workflow.</p>
      </div>
      <label>Title</label>
      <input value={data.title || ''} onChange={(event) => updateTitle(selectedNode, onUpdateNode, event.target.value)} />

      {type === 'start' && (
        <KeyValueEditor
          label="Metadata"
          values={toPairs(data.metadata)}
          onChange={(values) => onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, metadata: values } }))}
        />
      )}

      {type === 'task' && (
        <>
          <label>Description</label>
          <textarea
            value={data.description || ''}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, description: event.target.value } }))
            }
          />
          <label>Assignee</label>
          <input
            value={data.assignee || ''}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, assignee: event.target.value } }))
            }
          />
          <label>Due Date</label>
          <input
            type="date"
            value={data.dueDate || ''}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, dueDate: event.target.value } }))
            }
          />
          <KeyValueEditor
            label="Custom Fields"
            values={toPairs(data.customFields)}
            onChange={(values) =>
              onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, customFields: values } }))
            }
          />
        </>
      )}

      {type === 'approval' && (
        <>
          <label>Approver Role</label>
          <input
            value={data.approverRole || ''}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, approverRole: event.target.value } }))
            }
          />
          <label>Auto Approve Threshold</label>
          <input
            type="number"
            value={data.autoApproveThreshold ?? 0}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, (node) => ({
                ...node,
                data: { ...node.data, autoApproveThreshold: Number(event.target.value) }
              }))
            }
          />
        </>
      )}

      {type === 'automated' && (
        <>
          <label>Action</label>
          <select
            value={data.actionId || ''}
            onChange={(event) => {
              const selectedAction = actions.find((action) => action.id === event.target.value);
              const actionParams = (selectedAction?.params ?? []).reduce<Record<string, string>>((acc, param) => {
                acc[param] = '';
                return acc;
              }, {});

              onUpdateNode(selectedNode.id, (node) => ({
                ...node,
                data: { ...node.data, actionId: event.target.value, actionParams }
              }));
            }}
          >
            <option value="">Select action</option>
            {actions.map((action) => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>

          {Object.entries(data.actionParams ?? {}).map(([paramKey, paramValue]) => (
            <div key={paramKey}>
              <label>{paramKey}</label>
              <input
                value={paramValue}
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => ({
                    ...node,
                    data: {
                      ...node.data,
                      actionParams: {
                        ...(node.data.actionParams ?? {}),
                        [paramKey]: event.target.value
                      }
                    }
                  }))
                }
              />
            </div>
          ))}

          {data.actionId === 'send_email' && (
            <button type="button" className="automation-btn" onClick={onSendMail} disabled={isSendingMail}>
              {isSendingMail ? 'Sending Mail...' : 'Send Mail'}
            </button>
          )}

          {data.actionId === 'generate_doc' && (
            <button type="button" className="automation-btn" onClick={onGenerateDoc} disabled={isGeneratingDoc}>
              {isGeneratingDoc ? 'Generating Doc...' : 'Generate Doc'}
            </button>
          )}
        </>
      )}

      {type === 'end' && (
        <>
          <label>End Message</label>
          <input
            value={data.endMessage || ''}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, (node) => ({ ...node, data: { ...node.data, endMessage: event.target.value } }))
            }
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(data.summaryFlag)}
              onChange={(event) =>
                onUpdateNode(selectedNode.id, (node) => ({
                  ...node,
                  data: { ...node.data, summaryFlag: event.target.checked }
                }))
              }
            />
            Enable Summary Flag
          </label>
        </>
      )}

      <button className="danger-btn" onClick={() => onDeleteNode(selectedNode.id)}>
        Delete Selected Node
      </button>
    </aside>
  );
};
