import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    ListItemText,
    Box,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { isComponent } from 'dash-auto-admin';

import React, { FC, JSX, useEffect, useState } from 'react';

interface IDictEntry {
    [x: string]: any;
}

export interface MUISimpleJsonTable {
    tableData: any;
    vertical: boolean;
    ignore?: string[];
    include?: string[];
    dict?: IDictEntry;
    showKey?: boolean;
    maxDepth?: number;
    currentDepth?: number;
}

function isJSXElement(value: any): value is JSX.Element {
    return (
        value &&
        typeof value === "object" &&
        value.$typeof === Symbol.for("react.element")
    );
}

function isReactNode(value: any): value is React.ReactNode {
    return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value instanceof React.Component ||
        value instanceof React.Fragment ||
        Array.isArray(value) && value.every((item) => isReactNode(item))
    );
}

function isReactNodeArrayOrJSXElementArray(value: any): boolean {
    return (
        Array.isArray(value) &&
        (value.every((item) => isReactNode(item)) ||
            value.every((item) => isJSXElement(item)))
    );
}

function isArrayOfStrings(value: any): boolean {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// Improved helper function to detect plain objects
function isPlainObject(value: any): boolean {
    if (value === null || value === undefined) {
        return false;
    }
    
    if (typeof value !== 'object') {
        return false;
    }
    
    if (Array.isArray(value)) {
        return false;
    }
    
    if (isJSXElement(value)) {
        return false;
    }
    
    // Check if it's a plain object (not a class instance, Date, etc.)
    return value.constructor === Object || value.constructor === undefined;
}

const MUISimpleJsonTable: FC<MUISimpleJsonTable> = ({
    tableData,
    vertical,
    ignore,
    include,
    dict,
    showKey,
    maxDepth = 3,
    currentDepth = 0,
}) => {
    if (!ignore) ignore = [];
    if (!include) include = [];
    if (!dict) dict = {};
    const [column, setColumn] = useState<string[]>([]);

    useEffect(() => {
        if (tableData) {
            let cols = Object.keys(tableData);
            if (include.length) cols = cols.filter((key) => include.includes(key));
            if (ignore.length) cols = cols.filter((key) => !ignore.includes(key));
            setColumn(cols);
        } else {
            setColumn([]);
        }
    }, [tableData]);

    const parseValue = (value: any, key?: string) => {
        try {
            // Add debug logging
            //console.log(`Parsing value for key "${key}":`, value, typeof value);
            
            if (value === undefined || value === null) {
                return "n/a";´
            }

            // Check for plain objects FIRST, before other checks
            if (isPlainObject(value) && currentDepth < maxDepth) {
                const objectKeys = Object.keys(value);
                //console.log(`Found plain object with keys:`, objectKeys);
                
                if (objectKeys.length > 0) {
                    return (
                        <Accordion sx={{ width: '100%', boxShadow: 1, margin: 0 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    minHeight: 40,
                                    '&.Mui-expanded': {
                                        minHeight: 40,
                                    },
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {key ? `${key} (${objectKeys.length} properties)` : `Object (${objectKeys.length} properties)`}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: 1 }}>
                                <MUISimpleJsonTable
                                    tableData={value}
                                    vertical={vertical}
                                    ignore={ignore}
                                    include={include}
                                    dict={dict}
                                    showKey={showKey}
                                    maxDepth={maxDepth}
                                    currentDepth={currentDepth + 1}
                                />
                            </AccordionDetails>
                        </Accordion>
                    );
                }
            }

            // Array handling
            if (Array.isArray(value)) {
                return (
                    <Chip
                        label={
                            <Box sx={{ maxHeight: 200, overflow: 'auto', width: '100%' }}>
                                <List dense sx={{ py: 0 }}>
                                    {value.map((item, index) => (
                                        <ListItem key={index} sx={{ py: 0.5, px: 1 }}>
                                            <ListItemText 
                                                primary={String(item)} 
                                                sx={{ 
                                                    margin: 0,
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: '0.875rem',
                                                        lineHeight: 1.2
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        }
                        sx={{ 
                            height: 'auto',
                            '& .MuiChip-label': {
                                display: 'block',
                                whiteSpace: 'normal'
                            }
                        }}
                    />
                );
            }

            // Primitive values
            if (typeof value !== 'object') {
                if (dict.hasOwnProperty(value)) {
                    return dict[value];
                }
                return String(value);
            }

            // React components
            if (isComponent(value) || isReactNodeArrayOrJSXElementArray(value)) {
                return value;
            }

            // Fallback for other objects
            if (typeof value === 'object') {
                //console.log(`Falling back to JSON.stringify for:`, value);
                return JSON.stringify(value);
            }

            return value;

        } catch (error) {
            //console.error('Error in parseValue:', error);
            return "n/a";
        }
    };

    const ThData = () => {
        return (
            column &&
            column.map((data, key) => (
                <TableCell key={key}>{parseValue(data)}</TableCell>
            ))
        );
    };

    const tdData = () => {
        return vertical ? (
            column &&
            column.map((v, key) => {
                return (
                    <TableRow key={key}>
                        {showKey && <TableCell>{parseValue(v)}</TableCell>}
                        <TableCell>{parseValue(tableData[v], v)}</TableCell>
                    </TableRow>
                );
            })
        ) : (
            <TableRow>
                {column &&
                    column.map((v, key) => {
                        return <TableCell key={key}>{parseValue(tableData[v], v)}</TableCell>;
                    })}
            </TableRow>
        );
    };

    // Add debug info at the top level
    //console.log('MUISimpleJsonTable render:', { tableData, column, currentDepth, maxDepth });

    return vertical ? (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>{tdData()}</TableBody>
            </Table>
        </TableContainer>
    ) : (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>{ThData()}</TableRow>
                </TableHead>
                <TableBody>{tdData()}</TableBody>
            </Table>
        </TableContainer>
    );
};

export default MUISimpleJsonTable;
