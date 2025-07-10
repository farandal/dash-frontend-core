import {
    Box,
    Chip,
} from '@mui/material';
import { KeyValuePair } from '../interfaces/interfaces';
import { getContrastColor, getModeIcon, parseColorKey } from '../helpers/functions';

const ColorPaletteItem: React.FC<{
    pair: KeyValuePair;
    onEdit: (pair: KeyValuePair) => void;
    onDelete: (id: string) => void;
}> = ({ pair, onEdit, onDelete }) => {
    const textColor = getContrastColor(pair.value);
    const { baseChips, mode } = parseColorKey(pair.key);
    const modeIcon = getModeIcon(mode);

    return (
        <Box
            sx={{
                aspectRatio: 'unset',
                height: '30px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                },
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: pair.value,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '0 8px',
                gap: 0.5,
            }}
            onClick={() => onEdit(pair)}
        >
            {/* Base name chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, justifyContent: 'center' }}>
                {baseChips.map((chip, index) => (
                    <Chip
                        key={index}
                        label={chip}
                        size="small"
                        sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#333',
                            '& .MuiChip-label': {
                                padding: '0 4px',
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Mode chip/icon */}
            {mode && (
                <Chip
                    label={modeIcon}
                    size="small"
                    sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        '& .MuiChip-label': {
                            padding: '0 4px',
                        },
                    }}
                />
            )}
        </Box>
    );
};

export default ColorPaletteItem;