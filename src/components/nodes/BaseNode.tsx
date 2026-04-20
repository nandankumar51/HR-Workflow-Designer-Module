import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { WorkflowNodeData, WorkflowNodeType } from '../../types/workflow';

type CanvasNode = Node<WorkflowNodeData, WorkflowNodeType>;

type BaseNodeProps = NodeProps<CanvasNode> & {
  colorClass: string;
  subtitle?: string;
};

const getTaskDescriptionPreview = (description?: string) => {
  const trimmed = description?.trim();
  if (!trimmed) return null;

  const maxPreviewLength = 200;
  const wrapEvery = 50;
  const limitedText = trimmed.slice(0, maxPreviewLength);
  const lines: string[] = [];

  for (let index = 0; index < limitedText.length; index += wrapEvery) {
    lines.push(limitedText.slice(index, index + wrapEvery));
  }

  const preview = lines.join('\n');

  return {
    previewText: trimmed.length > maxPreviewLength ? `${preview}...` : preview,
    truncated: trimmed.length > maxPreviewLength
  };
};

export const BaseNode = ({ data, selected, colorClass, subtitle }: BaseNodeProps) => {
  const customFields = data.customFields?.filter((item) => item.key && item.value).length ?? 0;
  const metadata = data.metadata?.filter((item) => item.key && item.value).length ?? 0;
  const totalMeta = customFields + metadata;
  const taskPreview = colorClass === 'node-task' ? getTaskDescriptionPreview(data.description) : null;

  return (
    <div className={`node-card ${colorClass} ${selected ? 'node-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <div className="node-title-wrap">
          <div className="node-eyebrow">{colorClass.replace('node-', '').toUpperCase()}</div>
          <div className="node-title">{data.title || 'Untitled'}</div>
        </div>
        {totalMeta > 0 && <div className="node-badge">{totalMeta}</div>}
      </div>
      {taskPreview ? (
        <div className="node-description-preview">{taskPreview.previewText}</div>
      ) : null}
      {subtitle ? <div className="node-subtitle">{subtitle}</div> : null}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const getNodeSubtitle = (type: WorkflowNodeType, data: WorkflowNodeData): string => {
  if (type === 'task') {
    return data.assignee ? `Assignee: ${data.assignee}` : 'Human Task';
  }
  if (type === 'approval') return data.approverRole ? `Role: ${data.approverRole}` : 'Approval Step';
  if (type === 'automated') return data.actionId ? `Action: ${data.actionId}` : 'System Action';
  if (type === 'end') return data.summaryFlag ? 'Summary Enabled' : 'Workflow End';
  return 'Workflow Start';
};
