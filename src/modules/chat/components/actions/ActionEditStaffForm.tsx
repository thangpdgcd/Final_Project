import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Select, Switch } from 'antd';
import type { UpdateUserPayload } from '@/types';
import { chatEvents } from '../../socket/chatEvents';
import { useChatStore } from '../../store/useChatStore';

type Props = {
  targetStaffId: number;
  initialValues?: Record<string, unknown>;
  onDone?: (payload: { ok: boolean; error?: string }) => void;
};

const createId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

export const ActionEditStaffForm: React.FC<Props> = ({ targetStaffId, initialValues, onDone }) => {
  const [loading, setLoading] = useState(false);
  const selectedRoomId = useChatStore((s) => s.selectedRoomId);

  const init = useMemo(() => {
    const raw = initialValues ?? {};
    return {
      name: typeof raw.name === 'string' ? raw.name : undefined,
      email: typeof raw.email === 'string' ? raw.email : undefined,
      roleID:
        typeof raw.roleID === 'string' || typeof raw.roleID === 'number' ? raw.roleID : undefined,
      status: raw.status === 'inactive' ? 'inactive' : 'active',
    };
  }, [initialValues]);

  const onSubmit = async (values: any) => {
    const roomId = selectedRoomId;
    if (!roomId) {
      onDone?.({ ok: false, error: 'No active conversation selected.' });
      return;
    }

    const payload: UpdateUserPayload = {
      name: values.name,
      email: values.email,
      roleID: values.roleID,
      status: values.status ? 'active' : 'inactive',
    };

    setLoading(true);
    try {
      const correlationId = createId();
      const action = {
        kind: 'edit_staff' as const,
        title: 'Edit staff',
        schema: { fields: [] },
        initialValues: payload as any,
        targetStaffId,
      };

      chatEvents.sendActionEvent({ roomId, action, correlationId }, (ack: any) => {
        if (!ack) return;
        if (ack?.ok === true) onDone?.({ ok: true });
        else onDone?.({ ok: false, error: String(ack?.error ?? 'Action failed') });
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      layout="vertical"
      initialValues={{ ...init, status: init.status === 'active' }}
      onFinish={onSubmit}
    >
      <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
        <Input placeholder="Full name" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Email is required' }]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item label="Role" name="roleID">
        <Select
          options={[
            { label: 'Admin', value: 1 },
            { label: 'Staff', value: 2 },
            { label: 'User', value: 3 },
          ]}
        />
      </Form.Item>

      <Form.Item label="Active" name="status" valuePropName="checked">
        <Switch />
      </Form.Item>

      <div className="flex justify-end gap-2">
        <Button type="primary" htmlType="submit" loading={loading}>
          Save
        </Button>
      </div>
    </Form>
  );
};
