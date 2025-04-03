import { SimpleShowLayout } from 'react-admin';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { AttributeToField } from './mui/AttributeToField';
import groupByTabs from './utils/groupByTabs';
import { AutoAdminSettings } from '.';

const DashAutoGroup = (resourceConfig: IDashAutoAdminResourceConfig) => {
    return (
        <SimpleShowLayout>
            {groupByTabs(resourceConfig.schema).map((groupOfAttributes, idx) => {

                const label = groupOfAttributes[0].tab || AutoAdminSettings.defaultTabName;

                const count = groupOfAttributes
                    .filter((attribute) => attribute?.inShow !== false).length;

                return count ?
                    <fieldset key={'fieldset-group-' + idx}>
                        <legend>{label}</legend>
                        {groupOfAttributes
                            .filter((attribute) => attribute?.inShow !== false)
                            .map((attribute, i) =>
                                AttributeToField(
                                    'view',
                                    resourceConfig,
                                    attribute,
                                    i /*, options*/,
                                ),
                            )}
                    </fieldset> : <></>

            })}
        </SimpleShowLayout>
    );
};

export default DashAutoGroup;
