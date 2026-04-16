import React, { useMemo, useState } from 'react';
import { Alert, Button, Collapse } from 'antd';
import type { ActionMessage } from '../../types';
import { useAuth } from '@/store/AuthContext';
import { isAdmin } from '../../utils/role';
import { ActionEditStaffForm } from './ActionEditStaffForm';
import { ActionEditUserForm } from './ActionEditUserForm';

type Props = {
  message: ActionMessage;
};

export const ActionMessageRenderer: React.FC<Props> = ({ message }) => {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const header = useMemo(() => message.action.title || 'Action', [message.action.title]);
  const kind = message.action.kind;

  if (!admin) {
    return (
      <div className="mt-1">
        <div className="text-sm font-semibold">{header}</div>
        <div className="text-xs opacity-80">This action requires admin permissions.</div>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-2">
      <Collapse
        size="small"
        items={[
          {
            key: 'action',
            label: <div className="text-sm font-semibold">{header}</div>,
            children: (
              <div className="space-y-2">
                {result ? (
                  result.ok ? (
                    <Alert type="success" message="Saved" showIcon />
                  ) : (
                    <Alert type="error" message={result.error || 'Failed'} showIcon />
                  )
                ) : null}

                {kind === 'edit_user' ? (
                  <ActionEditUserForm
                    targetUserId={message.action.targetUserId}
                    initialValues={message.action.initialValues}
                    onDone={setResult}
                  />
                ) : (
                  <ActionEditStaffForm
                    targetStaffId={message.action.targetStaffId}
                    initialValues={message.action.initialValues}
                    onDone={setResult}
                  />
                )}

                <div className="flex justify-end">
                  <Button size="small" onClick={() => setResult(null)}>
                    Reset
                  </Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

