import React from 'react';
import { useInput, InputProps } from 'react-admin/src';

interface DashFilterWrapperProps extends InputProps {
    children: React.ReactElement;
    source: string;
    label?: string;
    alwaysOn?: boolean;
}

/**
 * Wrapper component that makes custom components work with React Admin's filter system
 */
const DashFilterWrapper: React.FC<DashFilterWrapperProps> = ({ 
    children, 
    source, 
    label,
    alwaysOn,
    ...props 
}) => {
    const {
        field: { onChange, onBlur, value },
        fieldState: { error, invalid },
        formState: { isSubmitted }
    } = useInput({ source, ...props });

    // Clone the child component and pass the necessary props
    const childWithProps = React.cloneElement(children, {
        value,
        onChange,
        onBlur,
        error: error?.message,
        helperText: error?.message,
        source,
        label,
        /* @ts-ignore */
        ...children.props, // Preserve original props
    });

    return childWithProps;
};

export default DashFilterWrapper;
