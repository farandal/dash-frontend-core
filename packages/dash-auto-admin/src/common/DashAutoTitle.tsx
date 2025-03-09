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
	return (
		<span>
			Edit {record ? `"${record[resourceConfig.schema[0].attribute]}"` : ''}
		</span>
	);
};

export default DashAutoTitle;
