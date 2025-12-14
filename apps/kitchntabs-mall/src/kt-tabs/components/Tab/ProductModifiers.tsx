import { Product } from "../../types/ecommerce";
import ImagePlaceHolder from 'kt-utils/src/components/ImagePlaceHolder/ImagePlaceHolder';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useState, useEffect } from "react";
import { Button, Loading, useEditContext, useGetList, useRecordContext, useShowContext } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";


import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, Note as NoteIcon } from '@mui/icons-material'
import { CardMedia, CardContent, ListItem, List, IconButton, Typography, Box, Grid, Card, TextField, CircularProgress, LinearProgress, Accordion, AccordionSummary, AccordionDetails, FormControl, FormGroup, FormControlLabel, Checkbox, Radio, RadioGroup, Select, MenuItem, InputAdornment, Avatar } from "@mui/material";
import { IModifierGroup } from "../interfaces/ITab";

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="


// Component to render modifier groups for a product
const ProductModifiers = ({
    product,
    productIndex,
    modifiers = [],
    onModifierChange
}) => {
    // Get modifier groups from product
    const modifierGroups: IModifierGroup[] = product?.product?.modifier_groups || [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>

            {/*<Box>
                <Typography variant="body1"><b>{product.product?.name}</b></Typography>
            </Box>*/}

            {modifierGroups.length && modifierGroups.map((group) => {
                // Find modifiers that belong to this group
                const groupModifiers = modifiers.filter(m => m.modifier_group_id === group.id);

                // For SINGLE type, get the selected option ID (or empty string if none)
                const singleValue = groupModifiers.length > 0
                    ? groupModifiers[0].modifier_option_id
                    : '';

                // For MULTIPLE type, get all selected option IDs
                const multipleValues = groupModifiers.map(m => m.modifier_option_id);

                return (
                    <Box key={group.id} sx={{ mb: 2 }}>
                        <b>{group.name}{group.is_required ? ' *' : ''}</b>
                        <Select
                            sx={{ width: '100%' }}
                            size={"small"}
                            aria-placeholder={`${group.name}${group.is_required ? ' *' : ''}`}
                            multiple={group.type === 'MULTIPLE'}
                            value={group.type === 'MULTIPLE' ? multipleValues : singleValue}
                            onChange={(e) => {
                                const value = e.target.value;
                                let updatedModifiers = [...modifiers];

                                // Remove existing modifiers for this group
                                updatedModifiers = updatedModifiers.filter(
                                    mod => mod.modifier_group_id !== group.id
                                );

                                // Handle single or multiple selections
                                const selectedValues = Array.isArray(value) ? value : [value];

                                selectedValues.forEach(optionId => {
                                    if (!optionId) return; // Skip empty selections

                                    const option = group.options.find(o => o.id === optionId);
                                    if (option) {
                                        updatedModifiers.push({
                                            modifier_option_id: option.id,
                                            modifier_group_id: group.id,
                                            price_adjustment: option.price_adjustment,
                                            modifier_option: {
                                                id: option.id,
                                                name: option.name,
                                                price_adjustment: option.price_adjustment,
                                                modifierGroup: {
                                                    id: group.id,
                                                    name: group.name,
                                                    type: group.type
                                                }
                                            }
                                        });
                                    }
                                });

                                onModifierChange(updatedModifiers);
                            }}
                        >
                            {group.options?.map((option) => (
                                <MenuItem
                                    key={option.id}
                                    value={option.id}
                                    selected={option.is_default}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span>{option.name}</span>
                                        {parseFloat(option.price_adjustment) !== 0 && (
                                            <span>
                                                {parseFloat(option.price_adjustment) > 0 ? '+' : ''}${option.price_adjustment}
                                            </span>
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                );
            })}
        </Box>
    );
};

export default ProductModifiers;