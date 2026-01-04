import { useTranslate } from 'react-admin';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';

export interface IAutoTitle {
	record?: any;
	resourceConfig: IDashAutoAdminResourceConfig;
}

const DashAutoTitle: React.FC<IAutoTitle> = ({
	resourceConfig,
	record,
	..._props
}) => {
	const translate = useTranslate();
	const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });

	return (
		<span>
			{record ? `${translate('dash.action.edit')} "${record[resourceConfig.schema[0].attribute]}"` : translatedLabel}
		</span>
	);
};

export default DashAutoTitle;
