import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Group, ActionIcon, Textarea, NumberInput, Stack } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';

interface SortableStepItemProps {
  id: string;
  index: number;
  instruction: string;
  timeMinutes?: number;
  onInstructionChange: (val: string) => void;
  onTimeChange: (val: number | string) => void;
  onRemove: () => void;
}

export function SortableStepItem({
  id,
  index,
  instruction,
  timeMinutes,
  onInstructionChange,
  onTimeChange,
  onRemove,
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper withBorder p="sm" radius="md" mb="xs">
        <Group align="flex-start">
          <ActionIcon
            variant="subtle"
            color="gray"
            {...attributes}
            {...listeners}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', marginTop: '5px' }}
          >
            <IconGripVertical size={18} />
          </ActionIcon>
          
          <Stack gap={5} style={{ flex: 1 }}>
            <Textarea
              placeholder={`Step ${index + 1} instructions...`}
              value={instruction}
              onChange={(e) => onInstructionChange(e.currentTarget.value)}
              autosize
              minRows={2}
            />
            <Group justify="flex-end">
              <NumberInput
                size="xs"
                placeholder="Mins"
                label="Time (min)"
                value={timeMinutes}
                onChange={onTimeChange}
                w={80}
              />
              <ActionIcon variant="subtle" color="red" onClick={onRemove} mt="xl">
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        </Group>
      </Paper>
    </div>
  );
}
