import { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  Node,
  Edge,
  Position,
  MarkerType,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LearningBlock } from '@/types/content';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Book, Blocks } from 'lucide-react';

interface MindMapProps {
  blocks: LearningBlock[];
}

const NODE_WIDTH = 250; // Reduced width
const NODE_HEIGHT = 150; // Reduced height
const VERTICAL_SPACING = 100;
const HORIZONTAL_SPACING = 400;

export default function MindMap({ blocks }: MindMapProps) {
  // Create nodes for each learning block
  const nodes: Node[] = blocks.map((block, index) => {
    // Calculate position based on difficulty and prerequisites
    const level = block.difficulty === 'foundational' ? 0 
      : block.difficulty === 'intermediate' ? 1 
      : 2;

    // Count blocks at the same level before this one
    const blocksAtSameLevel = blocks.filter(
      (b, i) => b.difficulty === block.difficulty && i < index
    ).length;

    return {
      id: block.id,
      position: {
        x: level * HORIZONTAL_SPACING,
        y: blocksAtSameLevel * (NODE_HEIGHT + VERTICAL_SPACING)
      },
      type: 'mindMapNode',
      data: block,
    };
  });

  // Create edges between related nodes
  const edges: Edge[] = blocks.flatMap(block => 
    block.prerequisiteIds.map(prereqId => ({
      id: `${prereqId}-${block.id}`,
      source: prereqId,
      target: block.id,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#94a3b8' }
    }))
  );

  const downloadCheatsheet = useCallback(() => {
    // Create CSV content
    const headers = ['Topic', 'Difficulty', 'Description', 'Resources', 'Recommended Books'];
    const rows = blocks.map(block => [
      block.title,
      block.difficulty,
      block.content,
      block.resources.map(r => `${r.type}: ${r.url}`).join('; '),
      '' // Empty column for recommended books
    ]);

    // Add recommended books as separate rows
    if (blocks[0] && blocks[0].recommendedBooks) {
      blocks[0].recommendedBooks.forEach(book => {
        rows.push(['', '', '', '', `${book.title} by ${book.author}: ${book.url}`]);
      });
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'learning_path_cheatsheet.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [blocks]);

  // Custom node component
  const MindMapNode = ({ data }: { data: LearningBlock }) => (
    <>
      <Handle type="target" position={Position.Left} />
      <Card className={`w-[${NODE_WIDTH}px] transition-colors ${
        data.difficulty === 'foundational' ? 'border-l-4 border-l-green-500' :
        data.difficulty === 'intermediate' ? 'border-l-4 border-l-blue-500' :
        'border-l-4 border-l-purple-500'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{data.title}</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${data.difficulty === 'foundational' ? 'bg-green-100 text-green-700' : ''}
              ${data.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' : ''}
              ${data.difficulty === 'advanced' ? 'bg-purple-100 text-purple-700' : ''}
            `}>
              {data.difficulty}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm whitespace-normal line-clamp-3">{data.content}</p>
          {data.resources.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {data.resources.map((resource, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {resource.type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} />
    </>
  );

  const nodeTypes = {
    mindMapNode: MindMapNode
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={downloadCheatsheet} variant="outline" size="sm">
          <Book className="h-4 w-4 mr-2" />
          Download Cheatsheet
        </Button>
      </div>
      <div className="h-[600px] border rounded-lg bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
          className="bg-dots-darker dark:bg-dots-lighter"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}