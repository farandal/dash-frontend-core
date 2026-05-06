import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    TextField,
    IconButton,
    CircularProgress,
    Divider,
    Chip,
    Avatar,
    Button,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import ExtensionIcon from '@mui/icons-material/Extension';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { useDataProvider, useNotify } from 'react-admin';

interface Document {
    id: string;
    name: string;
    original_name: string;
    file_type: string;
    file_size: number;
    is_active: boolean;
}

interface McpServer {
    id: string;
    name: string;
    transport_type: string;
    is_active: boolean;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: any[];
    created_at: string;
}

interface ChatSession {
    id: string;
    title: string | null;
    created_at: string;
    metadata?: {
        selected_document_ids?: string[];
        selected_mcp_ids?: string[];
    };
}

interface AgenticWindowProps {
    projectId: string;
    projectName?: string;
    apiBase?: string;
}

const API_BASE = '/api/lab';

async function apiFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options?.headers ?? {}),
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
}

export const AgenticWindow: React.FC<AgenticWindowProps> = ({ projectId, projectName }) => {
    const notify = useNotify();

    // ── Documents ─────────────────────────────────────────────────────────────
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── MCP Servers ───────────────────────────────────────────────────────────
    const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
    const [selectedMcpIds, setSelectedMcpIds] = useState<string[]>([]);

    // ── Chat ──────────────────────────────────────────────────────────────────
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ── Load data ─────────────────────────────────────────────────────────────

    const loadDocuments = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/document?filter=${JSON.stringify({ lab_project_id: projectId })}`);
            const json = await res.json();
            setDocuments(json.data ?? []);
        } catch { /* silent */ }
    }, [projectId]);

    const loadMcpServers = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/mcp-server?filter=${JSON.stringify({ is_active: true })}`);
            const json = await res.json();
            setMcpServers(json.data ?? []);
        } catch { /* silent */ }
    }, []);

    const loadSessions = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/chat/${projectId}/sessions`);
            const json = await res.json();
            setSessions(json.data ?? []);
        } catch { /* silent */ }
    }, [projectId]);

    const loadMessages = useCallback(async (sessionId: string) => {
        try {
            const res = await apiFetch(`${API_BASE}/chat/${projectId}/sessions/${sessionId}/messages`);
            const json = await res.json();
            setMessages(json.data ?? []);
        } catch { /* silent */ }
    }, [projectId]);

    useEffect(() => {
        loadDocuments();
        loadMcpServers();
        loadSessions();
    }, [loadDocuments, loadMcpServers, loadSessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // ── Session management ────────────────────────────────────────────────────

    const createNewSession = async () => {
        try {
            const res = await apiFetch(`${API_BASE}/chat/${projectId}/sessions`, {
                method: 'POST',
                body: JSON.stringify({
                    title: null,
                    selected_document_ids: selectedDocIds,
                    selected_mcp_ids: selectedMcpIds,
                }),
            });
            const json = await res.json();
            const session: ChatSession = json.data;
            setSessions(prev => [session, ...prev]);
            setActiveSession(session);
            setMessages([]);
        } catch {
            notify('Could not create session', { type: 'error' });
        }
    };

    const selectSession = async (session: ChatSession) => {
        setActiveSession(session);
        setSelectedDocIds(session.metadata?.selected_document_ids ?? []);
        setSelectedMcpIds(session.metadata?.selected_mcp_ids ?? []);
        await loadMessages(session.id);
    };

    // ── Send message (SSE streaming) ──────────────────────────────────────────

    const sendMessage = async () => {
        if (!inputValue.trim() || streaming) return;

        let session = activeSession;
        if (!session) {
            await createNewSession();
            session = activeSession;
            if (!session) return;
        }

        // Sync session metadata with current checkbox state
        await apiFetch(`${API_BASE}/chat/${projectId}/sessions/${session.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                selected_document_ids: selectedDocIds,
                selected_mcp_ids: selectedMcpIds,
            }),
        }).catch(() => {});

        const content = inputValue.trim();
        setInputValue('');
        setMessages(prev => [
            ...prev,
            { id: `temp-${Date.now()}`, role: 'user', content, created_at: new Date().toISOString() },
        ]);
        setStreaming(true);
        setStreamingContent('');

        try {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
            const response = await fetch(
                `${API_BASE}/chat/${projectId}/sessions/${session.id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content }),
                }
            );

            if (!response.body) throw new Error('No stream body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        if (event.type === 'text_delta') {
                            accumulated += event.text;
                            setStreamingContent(accumulated);
                        } else if (event.type === 'tool_use') {
                            setStreamingContent(prev => prev + `\n[Tool: ${event.name}]`);
                        } else if (event.type === 'message_stop') {
                            setMessages(prev => [
                                ...prev,
                                { id: `asst-${Date.now()}`, role: 'assistant', content: accumulated, created_at: new Date().toISOString() },
                            ]);
                            setStreamingContent('');
                            break;
                        } else if (event.type === 'error') {
                            notify(event.message ?? 'Stream error', { type: 'error' });
                            break;
                        }
                    } catch { /* skip malformed SSE */ }
                }
            }
        } catch (err: any) {
            notify(err.message ?? 'Failed to send message', { type: 'error' });
        } finally {
            setStreaming(false);
            setStreamingContent('');
            await loadMessages(session.id);
        }
    };

    // ── Document upload ───────────────────────────────────────────────────────

    const uploadDocument = async (file: File) => {
        setUploading(true);
        try {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('lab_project_id', projectId);

            const res = await fetch(`${API_BASE}/document`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            notify('Document uploaded', { type: 'success' });
            await loadDocuments();
        } catch {
            notify('Upload failed', { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    // ── Renderers ─────────────────────────────────────────────────────────────

    const renderMessage = (msg: ChatMessage) => {
        const isUser = msg.role === 'user';
        return (
            <Box
                key={msg.id}
                sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    gap: 1,
                    mb: 2,
                    alignItems: 'flex-start',
                }}
            >
                <Avatar sx={{ bgcolor: isUser ? 'primary.main' : 'secondary.main', width: 32, height: 32 }}>
                    {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        maxWidth: '75%',
                        bgcolor: isUser ? 'primary.light' : 'grey.100',
                        borderRadius: 2,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    <Typography variant="body2">{msg.content}</Typography>
                </Paper>
            </Box>
        );
    };

    // ── Layout ────────────────────────────────────────────────────────────────

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr 220px',
                height: 'calc(100vh - 120px)',
                gap: 1,
                p: 1,
                bgcolor: 'background.default',
            }}
        >
            {/* ── Left panel: Documents ── */}
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        Documents
                    </Typography>
                    <Box>
                        {uploading ? (
                            <CircularProgress size={18} />
                        ) : (
                            <Tooltip title="Upload document">
                                <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept=".pdf,.txt,.md,.docx,.csv"
                            onChange={e => e.target.files?.[0] && uploadDocument(e.target.files[0])}
                        />
                    </Box>
                </Box>
                <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                    {documents.length === 0 && (
                        <ListItem>
                            <ListItemText secondary="No documents yet" />
                        </ListItem>
                    )}
                    {documents.map(doc => (
                        <ListItem key={doc.id} dense disableGutters sx={{ px: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Checkbox
                                    size="small"
                                    edge="start"
                                    checked={selectedDocIds.includes(doc.id)}
                                    onChange={e => {
                                        setSelectedDocIds(prev =>
                                            e.target.checked ? [...prev, doc.id] : prev.filter(id => id !== doc.id)
                                        );
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <DescriptionIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText
                                primary={doc.name}
                                primaryTypographyProps={{ variant: 'caption', noWrap: true }}
                            />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        {selectedDocIds.length} selected
                    </Typography>
                </Box>
            </Paper>

            {/* ── Center panel: Chat ── */}
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Session selector */}
                <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Session</InputLabel>
                        <Select
                            label="Session"
                            value={activeSession?.id ?? ''}
                            onChange={e => {
                                const s = sessions.find(s => s.id === e.target.value);
                                if (s) selectSession(s);
                            }}
                        >
                            {sessions.map(s => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.title ?? new Date(s.created_at).toLocaleString()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={createNewSession}>
                        New
                    </Button>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {!activeSession && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Box textAlign="center">
                                <SmartToyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography color="text.secondary">
                                    Start a new session or select an existing one
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {messages.map(renderMessage)}

                    {streamingContent && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                            <Paper elevation={0} sx={{ p: 1.5, maxWidth: '75%', bgcolor: 'grey.100', borderRadius: 2, whiteSpace: 'pre-wrap' }}>
                                <Typography variant="body2">{streamingContent}</Typography>
                                <CircularProgress size={12} sx={{ ml: 1 }} />
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        maxRows={4}
                        placeholder="Ask something…"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        disabled={streaming}
                    />
                    <IconButton color="primary" onClick={sendMessage} disabled={streaming || !inputValue.trim()}>
                        {streaming ? <CircularProgress size={20} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </Paper>

            {/* ── Right panel: MCP Tools ── */}
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        Tools (MCP)
                    </Typography>
                </Box>
                <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                    {mcpServers.length === 0 && (
                        <ListItem>
                            <ListItemText secondary="No MCP servers configured" />
                        </ListItem>
                    )}
                    {mcpServers.map(server => (
                        <ListItem key={server.id} dense disableGutters sx={{ px: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Checkbox
                                    size="small"
                                    edge="start"
                                    checked={selectedMcpIds.includes(server.id)}
                                    onChange={e => {
                                        setSelectedMcpIds(prev =>
                                            e.target.checked ? [...prev, server.id] : prev.filter(id => id !== server.id)
                                        );
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <ExtensionIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText
                                primary={server.name}
                                secondary={server.transport_type}
                                primaryTypographyProps={{ variant: 'caption', noWrap: true }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        {selectedMcpIds.length} active
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default AgenticWindow;
