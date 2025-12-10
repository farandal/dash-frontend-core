import * as React from 'react';
import { memo, ReactElement } from 'react';
import ImageEye from '@mui/icons-material/RemoveRedEye';
import { Link } from 'react-router-dom';
import { RaRecord } from 'react-admin';

import {

  useResourceContext,
  useRecordContext,
  useCreatePath,
} from 'react-admin';

import { Button, ButtonProps } from 'react-admin';
//import { ICustomRAButton } from 'dash-auto-admin';

export type ICustomRAButton<T extends RaRecord> = ShowButtonProps;

interface CustomRAButtonProps {
  icon?: React.ReactElement;
  label?: string;
  record?: any;
  scrollToTop?: boolean;
}

const CustomRAButton = <RecordType extends RaRecord = any>(
  props: CustomRAButtonProps
) => {
  const {
    icon = defaultIcon,
    label = 'ra.action.show',
    record: recordProp,
    /* @ts-ignore */
    resource: resourceProp,
    scrollToTop = true,
    ...rest
  } = props;
    /* @ts-ignore */
  const resource = useResourceContext(props);
  const record = useRecordContext(props);
  const createPath = useCreatePath();
  if (!record) return null;
  return (
    <Button
      component={Link}
      to={createPath({ type: 'show', resource, id: record.id })}
      state={scrollStates[String(scrollToTop)]}
      label={label}
      onClick={stopPropagation}
      {...(rest as any)}
    >
      {icon}
    </Button>
  );
};

// avoids using useMemo to get a constant value for the link state
const scrollStates = {
  true: { _scrollToTop: true },
  false: {},
};

const defaultIcon = <ImageEye />;

// useful to prevent click bubbling in a datagrid with rowClick
const stopPropagation = e => e.stopPropagation();

interface Props<RecordType extends RaRecord = any> {
  icon?: ReactElement;
  label?: string;
  record?: RecordType;
  resource?: string;
  scrollToTop?: boolean;
}

export type ShowButtonProps<RecordType extends RaRecord = any> = Props<
  RecordType
> &
  ButtonProps;

const PureCustonRaButton = memo(
  CustomRAButton,
  (props: ShowButtonProps, nextProps: ShowButtonProps) =>
    props.resource === nextProps.resource &&
    (props.record && nextProps.record
      ? props.record.id === nextProps.record.id
      : props.record == nextProps.record) && // eslint-disable-line eqeqeq
    props.label === nextProps.label &&
    props.disabled === nextProps.disabled
);

export default PureCustonRaButton;