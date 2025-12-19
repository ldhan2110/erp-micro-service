import dayjs from 'dayjs';
import { useAppForm, useAppTranslate } from '@/hooks';
import { Flex, Modal } from 'antd';
import { FormInput, FormRangeDatePicker, FormSearchContainer } from '../../../form';
import { MessageHistoryTable } from '..';
import { useMessageHistoryStore } from '@/stores/modules/common';

type MessageHistoryModalProps = {
	open: boolean;
	onClose: () => void;
};

export const MessageHistoryModal = ({ open, onClose }: MessageHistoryModalProps) => {
	const { t } = useAppTranslate();
	const form = useAppForm({ formName: 'messageHistoryForm' });

	// Zustands
	const setFilter = useMessageHistoryStore((state) => state.setFilter);

	function handleReset() {
		form.resetFields();
	}

	function handleSearch() {
		const filterValue = form.getFieldsValue();
		setFilter({
			endPoint: filterValue['endpoint'],
			dateFm: filterValue['date'][0].format('YYYY-MM-DD'),
			dateTo: filterValue['date'][1].format('YYYY-MM-DD'),
		});
	}

	return (
		<Modal
			title={t('Message History')}
			open={open}
			onCancel={onClose}
			cancelText="Close"
			centered
			okButtonProps={{
				hidden: true,
			}}
			width={'70%'}
		>
			<Flex vertical gap={16}>
				<FormSearchContainer
					form={form}
					initialValues={{
						date: [dayjs().subtract(1, 'day'), dayjs()], // yesterday and today
					}}
					visible={open}
					timeOut={300}
					onRefresh={handleReset}
					onSearch={handleSearch}
					layout={'vertical'}
				>
					<Flex gap={16}>
						<FormRangeDatePicker
							name="date"
							label={'Date'}
							placeholder={[t('From'), t('To')]}
							width={250}
							allowClear={false}
						/>
						<FormInput
							name="endpoint"
							label={'Endpoint'}
							placeholder={t('Enter Endpoint')}
							width={200}
							style={{
								height: 32,
							}}
						/>
					</Flex>
				</FormSearchContainer>

				<MessageHistoryTable />
			</Flex>
		</Modal>
	);
};
