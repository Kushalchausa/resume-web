"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, 
    Wand2, 
    Mail, 
    Edit, 
    Eye, 
    Upload, 
    LayoutDashboard, 
    History, 
    Settings, 
    LogOut,
    Menu as MenuIcon,
    Bell,
    Search,
    TrendingUp,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    MoreVertical
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

// MUI Imports
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    IconButton,
    InputBase,
    Container,
    CircularProgress,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Avatar,
    Badge,
    Divider,
    Paper,
    Chip,
    alpha
} from "@mui/material";

// --- Styled Components & Theme ---

const DRAWER_WIDTH = 280;

// Custom Glass Card Component
const GlassCard = ({ children, sx = {}, ...props }: any) => (
    <Card
        elevation={0}
        sx={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(52, 211, 153, 0.2)'
            },
            ...sx
        }}
        {...props}
    >
        {children}
    </Card>
);

const dashboardTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#34d399', // Emerald 400
            light: '#6ee7b7',
            dark: '#059669',
            contrastText: '#0f172a',
        },
        secondary: {
            main: '#60a5fa', // Blue 400
        },
        background: {
            paper: '#1e293b', // Slate 800
            default: '#0f172a' // Slate 900
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
        }
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        h4: { fontWeight: 800, letterSpacing: '-0.025em' },
        h6: { fontWeight: 700, letterSpacing: '-0.01em' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
        borderRadius: 16
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(52, 211, 153, 0.2)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    margin: '4px 16px',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
                        borderLeft: '4px solid #34d399',
                        '&:hover': {
                            backgroundColor: 'rgba(52, 211, 153, 0.25)',
                        }
                    },
                     '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        paddingLeft: 20
                    }
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiFilledInput-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 12,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid #34d399',
                            boxShadow: '0 0 0 4px rgba(52, 211, 153, 0.1)'
                        }
                    }
                }
            }
        }
    }
});

// Mock Data
const activityData = [
  { name: 'Mon', resumes: 2, applications: 1 },
  { name: 'Tue', resumes: 5, applications: 3 },
  { name: 'Wed', resumes: 3, applications: 2 },
  { name: 'Thu', resumes: 8, applications: 6 },
  { name: 'Fri', resumes: 12, applications: 10 },
  { name: 'Sat', resumes: 4, applications: 3 },
  { name: 'Sun', resumes: 6, applications: 5 },
];

const recentHistory = [
    { id: 1, title: 'Software Engineer', date: '2h ago', status: 'Sent', company: 'Google', logo: 'G' },
    { id: 2, title: 'Frontend Dev', date: '5h ago', status: 'Draft', company: 'Netflix', logo: 'N' },
    { id: 3, title: 'Full Stack', date: '1d ago', status: 'Sent', company: 'Amazon', logo: 'A' },
    { id: 4, title: 'React Dev', date: '2d ago', status: 'Sent', company: 'Meta', logo: 'M' },
    { id: 5, title: 'Product Eng', date: '3d ago', status: 'Archived', company: 'Spotify', logo: 'S' },
];

function cleanForPdf(text: string) {
    return text.replace(/[^\x00-\x7F]/g, "").trim();
}

export default function Dashboard() {
    const [currentView, setCurrentView] = useState<'builder' | 'history'>('builder');
    
    // States
    const [jobDescription, setJobDescription] = useState("");
    const [baseResume, setBaseResume] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [tailoredResume, setTailoredResume] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
    const [isTailoring, setIsTailoring] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // History
    const [historyStats, setHistoryStats] = useState({ totalGenerated: 0, totalSent: 0, streak: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // ... (Keep existing fetch logic)
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch('/api/history');
            const data = await res.json();
            if (data.stats) {
                setHistoryStats(data.stats);
                setChartData(data.activityData);
                setHistoryList(data.recentHistory);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
    if (currentView === 'history' && !hasFetchedHistory) {
         fetchHistory();
         setHasFetchedHistory(true);
    }
    if (currentView !== 'history' && hasFetchedHistory) {
         setHasFetchedHistory(false);
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setIsExtracting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/parse-resume", { method: "POST", body: formData });
            const data = await response.json();
            if (data.text) setBaseResume(data.text);
            else alert("Failed to extract: " + (data.error || "Unknown error"));
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleTailor = async () => {
        setIsTailoring(true);
        setCurrentEntryId(null);
        try {
            const response = await fetch("/api/tailor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ baseResume, jobDescription }),
            });
            const data = await response.json();
            if (data.tailoredResume) {
                setTailoredResume(data.tailoredResume);
                setCoverLetter(data.coverLetter || "");
                if (data.entryId) setCurrentEntryId(data.entryId);
            } else alert("Failed to tailor: " + (data.error || "Unknown"));
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsTailoring(false);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            // ... (Keep existing PDF generation logic or simplify for brevity in this rewrite)
            // Re-implementing simplified version for robustness
            const doc = new jsPDF();
            doc.setFont("times");
            const lines = cleanForPdf(tailoredResume).split('\n');
            let y = 20;
            lines.forEach(line => {
                if (y > 280) { doc.addPage(); y = 20; }
                const cleanLine = line.trim();
                const isHeader = cleanLine.length > 2 && cleanLine === cleanLine.toUpperCase() && /[A-Z]/.test(cleanLine) && !cleanLine.startsWith("-");
                if (isHeader) {
                    doc.setFont("times", "bold"); doc.setFontSize(12);
                    doc.text(cleanLine, 20, y);
                    doc.line(20, y + 2, 190, y + 2);
                    y += 8;
                } else {
                    doc.setFont("times", "normal"); doc.setFontSize(11);
                    const split = doc.splitTextToSize(cleanLine, 170);
                    doc.text(split, 20, y);
                    y += split.length * 5;
                }
            });
            const pdfBase64 = doc.output("datauristring").split(",")[1];
            
            // Cover Letter
            const docC = new jsPDF();
            docC.text(docC.splitTextToSize(cleanForPdf(coverLetter), 180), 10, 10);
            const coverBase64 = docC.output("datauristring").split(",")[1];

            const response = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetEmail,
                    subject: "Job Application",
                    emailBody: coverLetter,
                    pdfBase64,
                    filename: "Tailored_Resume.pdf",
                    coverLetterPdfBase64: coverBase64,
                    coverLetterFilename: "Cover_Letter.pdf",
                    entryId: currentEntryId
                }),
            });
            const data = await response.json();
            if (data.success) alert("Email sent successfully!");
            else alert("Failed: " + data.error);
        } catch (error) {
            console.error(error);
            alert("Error sending email");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <ThemeProvider theme={dashboardTheme}>
            <Box sx={{ display: 'flex', minHeight: '100vh', 
                backgroundColor: '#0f172a',
                backgroundImage: `
                    radial-gradient(at 0% 0%, rgba(52, 211, 153, 0.15) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(96, 165, 250, 0.15) 0px, transparent 50%)
                `
            }}>
                <CssBaseline />
                
                {/* 1. GLASS TOPBAR */}
                <AppBar position="fixed" elevation={0} sx={{ 
                    bgcolor: 'rgba(15, 23, 42, 0.7)', 
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    zIndex: (theme) => theme.zIndex.drawer + 1 
                }}>
                    <Toolbar sx={{ justifyContent: 'space-between', height: 70 }}>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                                <FileText className="text-white w-5 h-5" />
                            </div>
                            <Typography variant="h5" component="div" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                                Resume<span className="text-emerald-400">AI</span>
                            </Typography>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <Box sx={{ 
                               position: 'relative', 
                               borderRadius: '12px', 
                               backgroundColor: 'rgba(255,255,255,0.03)', 
                               border: '1px solid rgba(255,255,255,0.05)',
                               '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                               mr: 2, 
                               display: { xs: 'none', sm: 'block' },
                               transition: 'all 0.2s'
                           }}>
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-slate-400" />
                                </div>
                                <InputBase
                                    placeholder="Search applications..."
                                    sx={{ color: 'inherit', width: '240px', fontSize: '0.9rem', '& .MuiInputBase-input': { p: 1.25, pl: 5 } }}
                                />
                           </Box>
                           <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                               <Badge badgeContent={4} color="primary">
                                   <Bell size={20} className="text-slate-300"/>
                               </Badge>
                           </IconButton>
                           <Avatar sx={{ 
                               bgcolor: 'transparent', 
                               border: '2px solid #34d399', 
                               width: 40, 
                               height: 40,
                               src: "/path/to/image.jpg"
                           }}>KC</Avatar>
                        </div>
                    </Toolbar>
                </AppBar>

                {/* 2. MODERN SIDEBAR */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
                    }}
                >
                    <Toolbar sx={{ height: 70 }} /> {/* Spacer */}
                    <Box sx={{ overflow: 'auto', mt: 4, px: 2 }}>
                        <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                            Menu
                        </Typography>
                        <List sx={{ mt: 1 }}>
                            <ListItemButton selected={currentView === 'builder'} onClick={() => setCurrentView('builder')}>
                                <ListItemIcon><Sparkles className={currentView === 'builder' ? "text-emerald-400" : "text-slate-400"} size={20}/></ListItemIcon>
                                <ListItemText primary="AI Builder" primaryTypographyProps={{ fontWeight: 600 }} />
                                {currentView === 'builder' && <ChevronRight size={16} className="text-emerald-400"/>}
                            </ListItemButton>
                            
                            <ListItemButton selected={currentView === 'history'} onClick={() => { setCurrentView('history'); fetchHistory(); }}>
                                <ListItemIcon><History className={currentView === 'history' ? "text-emerald-400" : "text-slate-400"} size={20}/></ListItemIcon>
                                <ListItemText primary="History" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                            
                            <ListItemButton>
                                <ListItemIcon><FileText className="text-slate-400" size={20}/></ListItemIcon>
                                <ListItemText primary="Templates" className="text-slate-400" primaryTypographyProps={{ fontWeight: 500 }} />
                                <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                            </ListItemButton>
                        </List>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                                System
                            </Typography>
                            <List sx={{ mt: 1 }}>
                                <ListItemButton>
                                    <ListItemIcon><Settings className="text-slate-400" size={20}/></ListItemIcon>
                                    <ListItemText primary="Settings" className="text-slate-400" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                                <ListItemButton>
                                    <ListItemIcon><LogOut className="text-slate-400" size={20}/></ListItemIcon>
                                    <ListItemText primary="Logout" className="text-slate-400" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                            </List>
                        </Box>

                        {/* Pro Card */}
                        <Box sx={{ mt: 'auto', p: 2 }}>
                            <Box sx={{ 
                                p: 3, 
                                borderRadius: 4, 
                                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                border: '1px solid rgba(52, 211, 153, 0.2)'
                            }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1 bg-emerald-500 rounded text-white"><Sparkles size={14}/></div>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary.light">Pro Plan</Typography>
                                </div>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    You have 4 generations left this week.
                                </Typography>
                                <Button size="small" variant="outlined" fullWidth color="primary" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)' }}>Upgrade</Button>
                            </Box>
                        </Box>
                    </Box>
                </Drawer>

                {/* 3. MAIN DASHBOARD CONTENT */}
                <Box component="main" sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                    <Toolbar sx={{ height: 70 }} /> {/* Spacer */}
                    
                    <AnimatePresence mode="wait">
                        {currentView === 'builder' ? (
                            <motion.div 
                                key="builder"
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <Typography variant="h4" gutterBottom className="text-white">
                                            Create Application
                                        </Typography>
                                        <Typography variant="body1" className="text-slate-400">
                                            Tailor your resume for a specific job in seconds.
                                        </Typography>
                                    </div>
                                    <div className="flex gap-2">
                                         <Button variant="outlined" startIcon={<Upload size={18}/>} color="secondary">Import PDF</Button>
                                         <Button variant="outlined" startIcon={<History size={18}/>}>Load Previous</Button>
                                    </div>
                                </div>

                                <Grid container spacing={4} alignItems="stretch">
                                    {/* Left: Inputs */}
                                    <Grid size={{ xs: 12, xl: 5 }}>
                                        <GlassCard sx={{ height: '100%' }}>
                                            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3.5, height: '100%' }}>
                                                <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
                                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                        <Wand2 className="text-emerald-400 w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <Typography variant="h6">Job Context</Typography>
                                                        <Typography variant="caption" color="text.secondary">Paste the details below</Typography>
                                                    </div>
                                                </div>

                                                <Button
                                                    component="label"
                                                    variant="outlined"
                                                    fullWidth
                                                    disabled={isExtracting}
                                                    sx={{ 
                                                        height: 80, 
                                                        borderStyle: 'dashed', 
                                                        borderWidth: 2, 
                                                        borderColor: 'rgba(255,255,255,0.1)',
                                                        bgcolor: 'rgba(0,0,0,0.2)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        '&:hover': { borderColor: '#34d399', bgcolor: 'rgba(52, 211, 153, 0.05)' }
                                                    }}
                                                >
                                                    {isExtracting ? <CircularProgress size={24} /> : <Upload className="text-slate-400" />}
                                                    <Typography variant="body2" color="text.secondary">
                                                        {isExtracting ? "Analyzing PDF..." : "Click to Upload Base Resume (PDF)"}
                                                    </Typography>
                                                    <input type="file" hidden accept=".pdf" onChange={handleFileSelect} />
                                                </Button>

                                                <TextField
                                                    label="Job Description"
                                                    placeholder="Paste the job description, requirements, and responsibilities here..."
                                                    multiline
                                                    minRows={6}
                                                    fullWidth
                                                    variant="filled"
                                                    value={jobDescription}
                                                    onChange={(e) => setJobDescription(e.target.value)}
                                                />

                                                <TextField
                                                    label="Base Resume Content (Auto-filled)"
                                                    placeholder="Parsed resume text will appear here..."
                                                    multiline
                                                    minRows={4}
                                                    fullWidth
                                                    variant="filled"
                                                    value={baseResume}
                                                    onChange={(e) => setBaseResume(e.target.value)}
                                                    sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                                                />
                                                
                                                <div className="mt-auto pt-6">
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        size="large"
                                                        onClick={handleTailor}
                                                        disabled={isTailoring || !jobDescription || !baseResume}
                                                        startIcon={isTailoring ? <CircularProgress size={20} color="inherit" /> : <Sparkles />}
                                                        sx={{ height: 56, fontSize: '1.05rem' }}
                                                    >
                                                        {isTailoring ? "Working Magic..." : "Generate Optimized Resume"}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>

                                    {/* Right: Preview */}
                                    <Grid size={{ xs: 12, xl: 7 }}>
                                         <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="text-secondary.main w-5 h-5" />
                                                        <Typography variant="h6">Live Preview</Typography>
                                                    </div>
                                                    <div className="flex gap-2 bg-slate-800/80 p-1 rounded-lg border border-white/5">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => setEditMode(false)}
                                                            color={!editMode ? "primary" : "default"}
                                                        >
                                                            <Eye size={18}/>
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => setEditMode(true)}
                                                            color={editMode ? "primary" : "default"}
                                                        >
                                                            <Edit size={18}/>
                                                        </IconButton>
                                                    </div>
                                                </div>

                                                <Box sx={{ flex: 1, minHeight: 600, bgcolor: '#ffffff', position: 'relative' }}>
                                                    {editMode ? (
                                                        <Box sx={{ height: '100%', bgcolor: '#1e293b' }}>
                                                            <TextField
                                                                multiline
                                                                fullWidth
                                                                value={tailoredResume}
                                                                onChange={(e) => setTailoredResume(e.target.value)}
                                                                sx={{ 
                                                                    height: '100%',
                                                                    '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', p: 4, fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0' },
                                                                    '& .MuiFilledInput-root': { bgcolor: 'transparent' }
                                                                }}
                                                            />
                                                        </Box>
                                                    ) : (
                                                        <div className="h-full overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300">
                                                            {/* Resume Paper Effect */}
                                                            <div className="bg-white text-slate-900 min-h-full shadow-sm max-w-[210mm] mx-auto">
                                                                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed p-4">
                                                                    {tailoredResume || "Start by uploading a resume and job description..."}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Box>

                                                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid size={{ xs: 12, md: 8 }}>
                                                            <TextField
                                                                label="Recruiter Email"
                                                                size="small"
                                                                fullWidth
                                                                value={targetEmail}
                                                                onChange={(e) => setTargetEmail(e.target.value)}
                                                                placeholder="hiring@company.com"
                                                                InputProps={{ startAdornment: <Mail size={16} className="mr-3 text-slate-400"/> }}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                fullWidth
                                                                onClick={handleSend}
                                                                disabled={isSending || !tailoredResume || !targetEmail}
                                                                startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : <Mail />}
                                                                sx={{ height: 40 }}
                                                            >
                                                                Send PDF
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="history"
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0 }}
                            >
                                <Typography variant="h4" gutterBottom className="text-white" sx={{ mb: 4 }}>
                                    Activity & Analytics
                                </Typography>
                                
                                <Grid container spacing={4}>
                                    {/* Stats Cards */}
                                    {[
                                        { label: 'Total Generated', value: historyStats.totalGenerated, icon: <Sparkles className="text-emerald-400" />, color: 'rgba(52, 211, 153, 0.1)' },
                                        { label: 'Applications Sent', value: historyStats.totalSent, icon: <Mail className="text-blue-400" />, color: 'rgba(96, 165, 250, 0.1)' },
                                        { label: 'Success Streak', value: `${historyStats.streak} Days`, icon: <TrendingUp className="text-orange-400" />, color: 'rgba(251, 146, 60, 0.1)' }
                                    ].map((stat, i) => (
                                        <Grid size={{ xs: 12, md: 4 }} key={i}>
                                            <GlassCard sx={{ bgcolor: stat.color, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
                                                    <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-sm">
                                                        {stat.icon}
                                                    </div>
                                                    <div>
                                                        <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>{stat.label}</Typography>
                                                        <Typography variant="h3" fontWeight="800">{stat.value}</Typography>
                                                    </div>
                                                </CardContent>
                                            </GlassCard>
                                        </Grid>
                                    ))}

                                    {/* Charts */}
                                    <Grid size={{ xs: 12, lg: 8 }}>
                                        <GlassCard sx={{ height: 450 }}>
                                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 4 }}>
                                                <div className="flex justify-between items-center mb-6">
                                                    <Typography variant="h6">Weekly Overview</Typography>
                                                    <Button size="small" variant="text" color="inherit">Last 7 Days</Button>
                                                </div>
                                                <div className="flex-1 w-full relative">
                                                    {loadingHistory ? (
                                                        <div className="absolute inset-0 flex items-center justify-center"><CircularProgress /></div>
                                                    ) : (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={chartData}>
                                                                <defs>
                                                                    <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                                                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                                                                <Tooltip 
                                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                                    itemStyle={{ color: '#fff' }}
                                                                />
                                                                <Area 
                                                                    type="monotone" 
                                                                    dataKey="resumes" 
                                                                    stroke="#34d399" 
                                                                    strokeWidth={3}
                                                                    fillOpacity={1} 
                                                                    fill="url(#colorResumes)" 
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>

                                    {/* Recent History List */}
                                    <Grid size={{ xs: 12, lg: 4 }}>
                                        <GlassCard sx={{ height: 450, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <div className="p-4 border-b border-white/5">
                                                    <Typography variant="h6" sx={{ px: 1 }}>Recent Activity</Typography>
                                                </div>
                                                <Box sx={{ overflowY: 'auto', p: 2, flex: 1 }} className="scrollbar-thin scrollbar-thumb-slate-700">
                                                    <List>
                                                        {(historyList.length > 0 ? historyList : recentHistory).map((item) => (
                                                            <ListItem key={item.id} disablePadding sx={{ mb: 2 }}>
                                                                <ListItemButton sx={{ 
                                                                    borderRadius: 3, 
                                                                    bgcolor: 'rgba(255,255,255,0.02)', 
                                                                    border: '1px solid rgba(255,255,255,0.02)',
                                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' } 
                                                                }}>
                                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4 text-indigo-400 font-bold">
                                                                        {item.company ? item.company[0] : 'J'}
                                                                    </div>
                                                                    <ListItemText 
                                                                        primary={item.title} 
                                                                        secondary={
                                                                            <span className="flex items-center gap-2 text-xs mt-1">
                                                                                <span className="text-slate-400">{item.company}</span>
                                                                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                                                                <span className="text-slate-500">{item.date}</span>
                                                                            </span>
                                                                        }
                                                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                                                                    />
                                                                    <Chip 
                                                                        label={item.status} 
                                                                        size="small" 
                                                                        sx={{ 
                                                                            height: 24, 
                                                                            bgcolor: item.status === 'Sent' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                                                                            color: item.status === 'Sent' ? '#34d399' : '#94a3b8',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </ListItemButton>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
