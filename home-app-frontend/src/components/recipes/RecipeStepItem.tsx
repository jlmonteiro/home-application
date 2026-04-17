import { Paper, Group, ActionIcon, NumberInput, Stack, Tabs, Box, Text, Button, Avatar, Badge } from '@mantine/core';
import { IconTrash, IconPencil, IconEye, IconCheck, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownContent } from '../MarkdownContent';

interface RecipeStepItemProps {
  index: number;
  totalSteps: number;
  instruction: string;
  timeMinutes?: number;
  isEditing: boolean;
  onEdit: () => void;
  onInstructionChange: (val: string) => void;
  onTimeChange: (val: number | string) => void;
  onRemove: () => void;
  onConfirm: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function RecipeStepItem({
  index,
  totalSteps,
  instruction,
  timeMinutes,
  isEditing,
  onEdit,
  onInstructionChange,
  onTimeChange,
  onRemove,
  onConfirm,
  onMoveUp,
  onMoveDown,
}: RecipeStepItemProps) {
  return (
    <Paper withBorder p="sm" radius="md" mb="xs">
      <Group align="flex-start" wrap="nowrap">
        {/* Reorder Buttons */}
        <Stack gap={4} mt={5}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move Up"
            size="sm"
          >
            <IconArrowUp size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onMoveDown}
            disabled={index === totalSteps - 1}
            title="Move Down"
            size="sm"
          >
            <IconArrowDown size={16} />
          </ActionIcon>
        </Stack>
        
        <Stack gap={5} style={{ flex: 1 }}>
          {isEditing ? (
            <Tabs defaultValue="edit" variant="pills">
              <Group justify="space-between" mb={5}>
                <Tabs.List>
                  <Tabs.Tab value="edit" leftSection={<IconPencil size={12} />}>Edit Step {index + 1}</Tabs.Tab>
                  <Tabs.Tab value="preview" leftSection={<IconEye size={12} />}>Preview</Tabs.Tab>
                </Tabs.List>
                
                <Group gap="xs">
                  <NumberInput
                    size="xs"
                    placeholder="Mins"
                    label="Time (min)"
                    value={timeMinutes}
                    onChange={onTimeChange}
                    w={80}
                    labelProps={{ style: { fontSize: '10px', marginBottom: '2px' } }}
                  />
                  <Button 
                    size="xs" 
                    variant="light" 
                    color="green" 
                    leftSection={<IconCheck size={14} />} 
                    onClick={onConfirm}
                    mt={18}
                  >
                    Done
                  </Button>
                  <ActionIcon variant="subtle" color="red" onClick={onRemove} mt={18}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              <Tabs.Panel value="edit">
                <MarkdownEditor
                  value={instruction}
                  onChange={onInstructionChange}
                  placeholder={`Step ${index + 1} instructions...`}
                  minHeight={100}
                />
              </Tabs.Panel>

              <Tabs.Panel value="preview">
                <Box
                  p="xs"
                  style={{
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    minHeight: '100px',
                    fontSize: '14px'
                  }}
                >
                  {instruction ? (
                    <MarkdownContent content={instruction} />
                  ) : (
                    <Text c="dimmed" fs="italic" size="sm">No instructions yet.</Text>
                  )}
                </Box>
              </Tabs.Panel>
            </Tabs>
          ) : (
            /* View Mode */
            <Group align="flex-start" wrap="nowrap">
              <Avatar color="blue" radius="xl" size="sm">
                {index + 1}
              </Avatar>
              <Stack gap={5} style={{ flex: 1 }}>
                <Box style={{ fontSize: '14px' }}>
                  <MarkdownContent content={instruction || '_No instruction_'} />
                </Box>
                {timeMinutes && (
                  <Badge variant="dot" size="xs" color="gray">
                    {timeMinutes} mins
                  </Badge>
                )}
              </Stack>
              <Group gap="xs">
                <ActionIcon 
                  variant="light" 
                  color="blue" 
                  onClick={onEdit}
                  title="Edit Step"
                >
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon 
                  variant="light" 
                  color="red" 
                  onClick={onRemove}
                  title="Remove Step"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}
