import { FormSearchInput } from '@/components/form';
import { CountrySearchModal } from '../modals';

export const FormCountrySearch = () => {
	return (
		<FormSearchInput
			name="countryCode"
			label={'Country'}
			modalsProps={{
				selectType: 'single',
				initialSearchValues: {
					useFlg: 'Y',
				},
			}}
			searchModal={<CountrySearchModal />}
			onSelectCallback={(record) => {
				console.log('Selected:', record);
			}}
		/>
	);
};
