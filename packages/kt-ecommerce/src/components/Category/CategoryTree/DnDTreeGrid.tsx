import React, { useEffect, useState, useRef } from 'react';
import { set, useController } from "react-hook-form";
import { useDialog } from 'dash-dialog';
import { NodeRendererProps, Tree, DragPreviewProps, CursorProps } from 'react-arborist';
import { TextField, Box, Button, IconButton, Typography, Paper, ButtonGroup } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import useWindowSize from 'dash-admin/src/hooks/window/useWindowSize';

interface CategoryData {
    id: number | string;
    name: string;
    is_primary?: boolean;
    tree_index?: number;
    subcategories?: CategoryData[];
}

interface TreeNodeData {
    id: string;
    name: string;
    is_primary: boolean;
    index: number;
    children?: TreeNodeData[];
}

interface DefaultNodeProps extends NodeRendererProps<TreeNodeData> {
    onEdit: (e: React.MouseEvent, node: any) => void;
    onDelete: (e: React.MouseEvent, node: any) => void;
}

const DragPreview: React.FC<DragPreviewProps> = ({ offset, mouse, id, dragIds, isDragging }) => (
    <div
        style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 100,
            left: offset?.x,
            top: offset?.y,
            opacity: 0.5,
            backgroundColor: '#fff',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
    >
        {dragIds.length} item(s) selected
    </div>
);


const CursorRow: React.FC<CursorProps> = ({ top, left, indent }) => (
    <div
        style={{
            position: 'absolute',
            top: top - 2,
            left,
            width: `calc(100% - ${indent}px)`,
            height: '4px',
            background: '#2196f3',
            zIndex: 1,
        }}
    >
        <div
            style={{
                position: 'absolute',
                left: -6,
                top: -4,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2196f3',
            }}
        />
    </div>
);

const DefaultNode: React.FC<DefaultNodeProps> = (props) => {
    const { node, style, dragHandle, tree, onEdit, onDelete } = props;

    if (!node || !node.data) {
        console.error("Invalid node:", node);
        return null;
    }

    const isPrimary = node.data.is_primary;
    const isFolder = !node.isLeaf;
    const folder = Array.isArray(node.data.children);
    const open = node.state.isOpen;
    const name = node.data.name;
    const isSelected = node.isSelected;
    const isDragging = node.isDragging;

    const rowClassNames = [
        'row',
        isSelected ? 'isSelected' : '',
        isDragging ? 'dragging' : '',
    ].filter(Boolean).join(' ');

    const handleClick = () => {
        if (isFolder) {
            node.toggle();
        }
    };

    return (
        <div
            className={rowClassNames}
            style={{
                ...style,
                cursor: isFolder ? 'pointer' : 'default'
            }}
            ref={dragHandle}
            draggable={true}
            onClick={handleClick}
        >
            <DragIndicatorIcon fontSize="small" style={{ marginRight: '4px', cursor: 'grab' }} />
            <div style={{ marginRight: '8px' }}>
                {isFolder ? (
                    node.isOpen ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />
                ) : (
                    <InsertDriveFileIcon fontSize="small" />
                )}
            </div>
            <Typography
                className="row-contents"
                style={{
                    flexGrow: 1,
                    fontWeight: node.isSelected ? 'bold' : 'normal'
                }}
            >
                {node.data.name}
            </Typography>
            <ButtonGroup size="small">
                <IconButton
                    onClick={(e) => onEdit(e, node)}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                    onClick={(e) => onDelete(e, node)}
                    disabled={isPrimary}
                >
                    {isPrimary ?
                        <Typography variant="caption">Principal</Typography> :
                        <DeleteIcon fontSize="small" />
                    }
                </IconButton>
            </ButtonGroup>
        </div>
    );
};

const DnDTreeGrid: React.FC<{ data: CategoryData[]; onEdit: any; onDelete: any }> = (props) => {
    const { data, onEdit, onDelete, ...rest } = props;
    const treeFormData = useController({ name: 'treeData' });
    const dialog = useDialog();
    const [searchText, setSearchText] = useState('');
    const treeRef = useRef(null);

    const convertToTreeFormat = (categories: CategoryData[], parentIndex = 0): TreeNodeData[] => {
        if (!categories || !Array.isArray(categories)) return [];

        return categories.map((category, idx) => ({
            id: category.id.toString(),
            name: category.name,
            is_primary: category.is_primary || false,
            index: category.tree_index || parentIndex + idx,
            children: category.subcategories && category.subcategories.length > 0
                ? convertToTreeFormat(category.subcategories, (parentIndex + idx) * 100)
                : []
        }));
    };

    const convertFromTreeFormat = (treeData: TreeNodeData[]): CategoryData[] => {
        if (!treeData || !Array.isArray(treeData)) return [];

        return treeData.map(node => ({
            id: isNaN(parseInt(node.id)) ? node.id : parseInt(node.id),
            name: node.name,
            is_primary: node.is_primary,
            tree_index: node.index,
            subcategories: node.children && node.children.length > 0
                ? convertFromTreeFormat(node.children)
                : []
        }));
    };

    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const formattedData = convertToTreeFormat(data);
            setTreeData(formattedData);
            console.log("Tree data initialized:", formattedData);
        } else {
            console.warn("Invalid data format:", data);
            setTreeData([]);
        }
    }, [data]);

   const windowSize = useWindowSize();
const containerRef = useRef<HTMLDivElement>(null);
const [currentWidth, setCurrentWidth] = useState<number>(null);
const [currentHeight, setCurrentHeight] = useState<number>(null);

useEffect(() => {
    const updateDimensions = () => {
        if (containerRef.current) {
            setCurrentWidth(containerRef.current.offsetWidth);
            setCurrentHeight(document.documentElement.clientHeight - 400);
        }
    };

    // Initial update with a small delay to ensure DOM is ready
    setTimeout(updateDimensions, 100);
    updateDimensions();
}, [windowSize.width, windowSize.height]); // Depend on windowSize instead of manual event listener
    
    
    
    
    useEffect(() => {
        if (treeData && treeData.length > 0) {
            const originalFormat = convertFromTreeFormat(treeData);
            treeFormData.field.onChange(originalFormat);
            console.log("Form data updated:", originalFormat);
        }
    }, [treeData]);

    const searchMatch = (node: TreeNodeData, term: string) => {
        return node.name.toLowerCase().includes(term.toLowerCase());
    };

    const handleSearch = () => {
        if (!searchText) {
            setSearchText('');
        }
    };

    const expandAll = () => {
        if (treeRef.current) {
            try {
                treeRef.current.openAll();
            } catch (error) {
                console.error("Expand all error:", error);
            }
        }
    };

    const collapseAll = () => {
        if (treeRef.current) {
            try {
                treeRef.current.closeAll();
            } catch (error) {
                console.error("Collapse all error:", error);
            }
        }
    };

    const handleEditClick = (e: React.MouseEvent, node: any) => {
        e.stopPropagation();
        onEdit(e, null, {
            id: isNaN(parseInt(node.id)) ? node.id : parseInt(node.id),
            name: node.data.name,
            is_primary: node.data.is_primary,
            tree_index: node.data.index
        });
    };

    const handleDeleteClick = (e: React.MouseEvent, node: any) => {
        e.stopPropagation();
        onDelete(e, null, {
            id: isNaN(parseInt(node.id)) ? node.id : parseInt(node.id),
            name: node.data.name,
            is_primary: node.data.is_primary,
            tree_index: node.data.index
        });
    };

    const moveNode = (dragIds: string[], parentId: string | null, index: number) => {
        const dataCopy = JSON.parse(JSON.stringify(treeData));

        const findAndRemoveNode = (nodes: TreeNodeData[], id: string) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    return nodes.splice(i, 1)[0];
                }
                if (nodes[i].children && nodes[i].children.length > 0) {
                    const found = findAndRemoveNode(nodes[i].children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const findParentNode = (nodes: TreeNodeData[], id: string | null) => {
            if (!id) return { node: null, children: nodes };

            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    if (!nodes[i].children) nodes[i].children = [];
                    return { node: nodes[i], children: nodes[i].children };
                }
                if (nodes[i].children && nodes[i].children.length > 0) {
                    const result = findParentNode(nodes[i].children, id);
                    if (result.node) return result;
                }
            }
            return { node: null, children: null };
        };

        for (const dragId of dragIds) {
            const draggedNode = findAndRemoveNode(dataCopy, dragId);
            if (!draggedNode) continue;

            const { children } = findParentNode(dataCopy, parentId);
            if (!children) continue;

            draggedNode.index = index;
            children.splice(index, 0, draggedNode);

            // Update indexes for all siblings
            children.forEach((node: TreeNodeData, idx: number) => {
                node.index = idx;
            });
        }

        return dataCopy;
    };

    const handleMove = ({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) => {
        console.log("Move event:", { dragIds, parentId, index });
        const updatedData = moveNode(dragIds, parentId, index);
        console.log("Updated tree data after move:", updatedData);
        setTreeData(updatedData);
    };

    if (!treeData || treeData.length === 0) {
        return (
            <Paper elevation={1} style={{ padding: '16px' }}>
                <Typography>No hay categorías disponibles</Typography>
            </Paper>
        );
    }

    const renderNode = (props: NodeRendererProps<TreeNodeData>) => (
        <DefaultNode {...props} onEdit={handleEditClick} onDelete={handleDeleteClick} />
    );

  
    
    return (
        <Paper  elevation={1} style={{ padding: '16px' }}>
            <Box display="flex" mb={2} gap={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    InputProps={{
                        startAdornment: <SearchIcon fontSize="small" style={{ marginRight: 8 }} />,
                        endAdornment: (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSearch}
                                disabled={!searchText}
                            >
                                Buscar
                            </Button>
                        )
                    }}
                />
                <Button variant="outlined" onClick={expandAll}>Expandir Todo</Button>
                <Button variant="outlined" onClick={collapseAll}>Colapsar Todo</Button>
            </Box>

            <Box ref={containerRef} display="flex" mb={2} gap={2}>
            {treeData.length > 0 && currentWidth ? (
                <Tree
                    width={currentWidth}
                    height={currentHeight}
                    className="dash-tree"
                    ref={treeRef}
                    data={treeData}
                    openByDefault={true}
                    indent={24}
                    rowHeight={40}
                    paddingTop={8}
                    paddingBottom={8}
                    searchTerm={searchText}
                    searchMatch={(node, term) => node.data.name.toLowerCase().includes(term.toLowerCase())}
                    onMove={handleMove}
                    selection="single"
                    renderDragPreview={DragPreview}
                    renderCursor={CursorRow}
                >
                    {renderNode}
                </Tree>
            ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography>No hay datos para mostrar</Typography>
                </Box>
            )}
            </Box>
        </Paper>
    );
};

export default DnDTreeGrid;