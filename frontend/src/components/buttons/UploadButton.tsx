import { useAppTranslate } from '@/hooks';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, type ButtonProps, type UploadProps } from 'antd';

type UploadButtonProps = ButtonProps & UploadProps;

export const UploadButton = ({ title, ...props }: UploadButtonProps) => {
	const { t } = useAppTranslate();
	return (
		<Upload {...props}>
			<Button icon={<UploadOutlined />}>{t(title || 'Upload')}</Button>
		</Upload>
	);
};
