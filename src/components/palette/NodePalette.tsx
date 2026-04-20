import { WorkflowNodeType } from '../../types/workflow';

const paletteItems: { type: WorkflowNodeType; label: string; accent: string; detail: string }[] = [
  { type: 'start', label: 'Start Node', accent: 'Launch', detail: 'Kick off every workflow with a clear trigger.' },
  { type: 'task', label: 'Task Node', accent: 'Human Step', detail: 'Assign work with owners, due dates, and fields.' },
  { type: 'approval', label: 'Approval Node', accent: 'Decision', detail: 'Add controlled checkpoints for managers or leads.' },
  { type: 'automated', label: 'Automated Step', accent: 'Automation', detail: 'Connect system actions for speed and consistency.' },
  { type: 'end', label: 'End Node', accent: 'Closure', detail: 'Wrap the journey with summaries and completion states.' }
];

type Props = {
  onReset: () => void;
};

export const NodePalette = ({ onReset }: Props) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, type: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="panel palette">
      <div className="section-heading">
        <span className="section-kicker">Builder</span>
        <h3>Workflow blocks</h3>
        <p>Drag components into the canvas to compose a polished employee journey.</p>
      </div>
      {paletteItems.map((item) => (
        <div
          key={item.type}
          className={`palette-item palette-${item.type}`}
          draggable
          onDragStart={(event) => onDragStart(event, item.type)}
        >
          <div className="palette-accent">{item.accent}</div>
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </div>
      ))}
      <button className="secondary-btn" onClick={onReset}>
        Clear Canvas
      </button>
    </aside>
  );
};
