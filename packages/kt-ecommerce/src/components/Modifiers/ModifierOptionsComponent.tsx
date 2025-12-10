import React from "react";
import { useController, useFormContext } from "react-hook-form";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Chip
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { FunctionField, Loading, useEditContext, useRecordContext, useShowContext } from "react-admin";

interface IModifierOption {
  id?: number;
  name: string;
  price_adjustment: number;
  description?: string;
  is_default?: boolean;
  display_order?: number;
}

const Edit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
 const { record, isPending } = useEditContext();
    if (!record || isPending) {
      return <Loading />;
    }
    return <EditComponent {...props} record={record} />
}

const Create: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    return <EditComponent {...props}  />
}

const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig, record }) => {
  const { setValue, control } = useFormContext();
  const { field } = useController({ 
    name: "options",
    control,
    defaultValue: record?.options || []
  });
  
  const [modifierOptions, setModifierOptions] = React.useState<IModifierOption[]>([]);
  const [newOption, setNewOption] = React.useState<IModifierOption>({
    name: "",
    price_adjustment: 0,
    description: "",
    is_default: false
  });

  React.useEffect(() => {
    if (record?.options) {
      // Sort by display_order when loading
      const sortedOptions = [...record.options].sort((a, b) => 
        (a.display_order || 0) - (b.display_order || 0)
      );
      setModifierOptions(sortedOptions);
    } else {
      setModifierOptions([]);
    }
  }, [record]);

  const updateFormField = React.useCallback((newOptions: IModifierOption[]) => {
    // Update display_order based on array position
    const optionsWithOrder = newOptions.map((option, index) => ({
      ...option,
      display_order: index
    }));
    
    field.onChange(optionsWithOrder);
    setValue("options", optionsWithOrder);
  }, [field, setValue]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const items = Array.from(modifierOptions);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    setModifierOptions(items);
    updateFormField(items);
  };

  const handleAddOption = () => {
    if (!newOption.name) {
      return;
    }
    
    const updatedOptions = [...modifierOptions, { 
      ...newOption, 
      display_order: modifierOptions.length 
    }];
    setModifierOptions(updatedOptions);
    updateFormField(updatedOptions);
    setNewOption({
      name: "",
      price_adjustment: 0,
      description: "",
      is_default: false
    });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...modifierOptions];
    updatedOptions.splice(index, 1);
    setModifierOptions(updatedOptions);
    updateFormField(updatedOptions);
  };

  const handleOptionChange = (index: number, fieldName: string, value: any) => {
    const updatedOptions = [...modifierOptions];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [fieldName]: value
    };
    setModifierOptions(updatedOptions);
    updateFormField(updatedOptions);
  };

  // Generate stable IDs for draggable items
  const getDraggableId = (option: IModifierOption, index: number) => {
    return option.id ? `option-${option.id}` : `new-option-${index}`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Opciones del Grupo de Modificadores
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
             {/* @ts-ignore */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Nombre"
                fullWidth
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
              />
            </Grid>
             {/* @ts-ignore */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Ajuste de precio"
                type="number"
                fullWidth
                value={newOption.price_adjustment}
                onChange={(e) => setNewOption({ ...newOption, price_adjustment: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
             {/* @ts-ignore */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Descripción"
                fullWidth
                value={newOption.description || ""}
                onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
              />
            </Grid>
             {/* @ts-ignore */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newOption.is_default || false}
                    onChange={(e) => setNewOption({ ...newOption, is_default: e.target.checked })}
                  />
                }
                label="Opción por defecto"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddOption}
            startIcon={<Icons.Add />}
          >
            Agregar Opción
          </Button>
        </CardActions>
      </Card>


<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable 
  droppableId="modifier-options-list"
  type="DEFAULT"
  isDropDisabled={false}
  isCombineEnabled={false}
  ignoreContainerClipping={false}
  renderClone={undefined}
  getContainerForClone={() => document.body}
  >
    {(provided, snapshot) => (
      <div 
        {...provided.droppableProps} 
        ref={provided.innerRef}
        style={{
          backgroundColor: snapshot.isDraggingOver ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          minHeight: '50px',
          transition: 'background-color 0.2s ease',
          padding: '8px',
          // Ensure container maintains proper positioning
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {modifierOptions.map((option, index) => {
          const draggableId = getDraggableId(option, index);
          return (
            <Draggable 
              key={draggableId}
              draggableId={draggableId}
              index={index}
              isDragDisabled={false}
            >
              {(provided, snapshot) => (
                <Card 
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  sx={{ 
                    mb: 2,
                    backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                    // Improved drag transform - remove rotation and add scale
                    transform: snapshot.isDragging 
                      ? `${provided.draggableProps.style?.transform} scale(1.02)` 
                      : provided.draggableProps.style?.transform,
                    transition: snapshot.isDragging ? 'none' : 'all 0.2s ease',
                    boxShadow: snapshot.isDragging ? 8 : 1,
                    // Ensure proper z-index during drag
                    zIndex: snapshot.isDragging ? 1000 : 'auto',
                    // Maintain width during drag
                    width: snapshot.isDragging ? 'calc(100% - 16px)' : 'auto',
                    // Prevent content from shifting
                    position: 'relative',
                    '&:hover': {
                      boxShadow: snapshot.isDragging ? 8 : 2
                    },
                    // Add border during drag for better visual feedback
                    border: snapshot.isDragging ? '2px solid' : '1px solid transparent',
                    borderColor: snapshot.isDragging ? 'primary.main' : 'transparent',
                  }}
                  // Override inline styles that might cause positioning issues
                  style={{
                    ...provided.draggableProps.style,
                    // Ensure the card maintains its position in the flow
                    position: snapshot.isDragging ? 'fixed' : 'relative',
                    // Maintain proper width
                    width: snapshot.isDragging ? 'auto' : '100%',
                    // Prevent the card from going off-screen
                    maxWidth: snapshot.isDragging ? '90vw' : 'none',
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                         {/* @ts-ignore */}
                      <Grid item xs={1}>
                        <Box 
                          {...provided.dragHandleProps}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            '&:hover': { 
                              backgroundColor: 'action.hover',
                              borderRadius: 1
                            },
                            p: 1,
                            // Add visual feedback for drag handle
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transition: 'opacity 0.2s ease'
                          }}
                        >
                          <Icons.DragIndicator 
                            //color={snapshot.isDragging ? "primary" : "action"} 
                            color={"secondary"} 
                          />
                        </Box>
                      </Grid>
                      {/* Rest of your Grid items remain the same */}
                       {/* @ts-ignore */}
                      <Grid item xs={11} md={3}>
                        <TextField
                          label="Nombre"
                          fullWidth
                          value={option.name || ""}
                          onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                          // Disable interaction during drag
                          disabled={snapshot.isDragging}
                        />
                      </Grid>
                       {/* @ts-ignore */}
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Ajuste de precio"
                          type="number"
                          fullWidth
                          value={option.price_adjustment || 0}
                          onChange={(e) => handleOptionChange(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                          disabled={snapshot.isDragging}
                        />
                      </Grid>
                       {/* @ts-ignore */}
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Descripción"
                          fullWidth
                          value={option.description || ""}
                          onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                          disabled={snapshot.isDragging}
                        />
                      </Grid>
                       {/* @ts-ignore */}
                      <Grid item xs={6} md={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={option.is_default || false}
                              onChange={(e) => handleOptionChange(index, 'is_default', e.target.checked)}
                              disabled={snapshot.isDragging}
                            />
                          }
                          label="Default"
                        />
                      </Grid>
                       {/* @ts-ignore */}
                      <Grid item xs={6} md={1}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveOption(index)}
                          size="small"
                          disabled={snapshot.isDragging}
                        >
                          <Icons.Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        size="small" 
                        label={`Orden: ${index + 1}`} 
                        color={snapshot.isDragging ? "primary" : "default"}
                        variant={snapshot.isDragging ? "filled" : "outlined"}
                      />
                      {option.id && (
                        <Chip 
                          size="small" 
                          label={`ID: ${option.id}`} 
                          color="secondary" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Draggable>
          );
        })}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>

      {modifierOptions.length === 0 && (
        <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
          No hay opciones agregadas. Agregue al menos una opción.
        </Typography>
      )}
    </Box>
  );
};

const View: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const { record: tab, isPending } = useShowContext();
  
  // Sort options by display_order for consistent viewing
  const sortedOptions = React.useMemo(() => {
    if (!tab?.options) return [];
    return [...tab.options].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [tab?.options]);
  
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Opciones del Grupo de Modificadores
      </Typography>
      
      {sortedOptions.map((option: IModifierOption, index: number) => (
        <Card key={option.id || `option-${index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
                {/* @ts-ignore */}
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">Nombre: {option.name}</Typography>
              </Grid>
               {/* @ts-ignore */}
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle1">Ajuste de precio: {option.price_adjustment}</Typography>
              </Grid>
               {/* @ts-ignore */}
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">Descripción: {option.description}</Typography>
              </Grid>
               {/* @ts-ignore */}
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle1">Por defecto: {option.is_default ? "Sí" : "No"}</Typography>
              </Grid>
               {/* @ts-ignore */}
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle1">Orden: {(option.display_order || 0) + 1}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      
      {(!tab?.options || tab.options.length === 0) && (
        <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
          No hay opciones agregadas.
        </Typography>
      )}
    </Box>
  );
};

const List: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const record = useRecordContext();
  
  // Sort options by display_order for consistent listing
  const sortedOptions = React.useMemo(() => {
    if (!record?.options) return [];
    return [...record.options].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [record?.options]);
  
  return <FunctionField
                    label={attribute.label}
                    key={`function_field_options`}
                    render={(r) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {sortedOptions.map((option: IModifierOption, index: number) => (
        <Chip
        size={"small"}
          key={option.id || `option-${index}`}
          label={`${index + 1}. ${option.name} (${option.price_adjustment})`}
          color={option.is_default ? "primary" : "default"}
        />
      ))}
    </Box>
                    )}
                  />                    
};

const Component = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <Edit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "create":
      return <Create attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <View attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "list":
      return <List attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default Component;