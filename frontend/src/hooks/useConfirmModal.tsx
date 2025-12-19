import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { confirm } = Modal;

interface UseConfirmProps {
  title?: string;
  content?: React.ReactNode;
  onOk?: () => void;
}

export function useConfirmModal() {
  const { t } = useTranslation();

  return ({
    title = t('Are you sure?'),
    content = (
      <div style={{ lineHeight: 1.6 }}>
        <p>{t('This action cannot be undone.')}</p>
        <p>{t('Please confirm to proceed.')}</p>
      </div>
    ),
    onOk,
  }: UseConfirmProps) => {
    confirm({
      title,
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content,
      okText: t('Confirm'),
      cancelText: t('Cancel'),
      onOk,
    });
  };
}