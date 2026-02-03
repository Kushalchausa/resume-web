"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    CheckCircle2
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
    Chip
} from "@mui/material";

const DRAWER_WIDTH = 280;

// Mock Data for History (GitHub-like Dashboard)
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
    { id: 1, title: 'Software Engineer @ Google', date: '2 hours ago', status: 'Sent', company: 'Google' },
    { id: 2, title: 'Frontend Developer @ Netflix', date: '5 hours ago', status: 'Draft', company: 'Netflix' },
    { id: 3, title: 'Full Stack Engineer @ Amazon', date: '1 day ago', status: 'Sent', company: 'Amazon' },
    { id: 4, title: 'React Developer @ Meta', date: '2 days ago', status: 'Sent', company: 'Meta' },
    { id: 5, title: 'Product Engineer @ Spotify', date: '3 days ago', status: 'Archived', company: 'Spotify' },
];

// Create a professional dark dashboard theme
const dashboardTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#34d399', // Emerald
        },
        secondary: {
            main: '#60a5fa', // Blue
        },
        background: {
            paper: '#1e293b', // Slate-800
            default: '#0f172a' // Slate-900
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        }
    },
    shape: {
        borderRadius: 12
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 16px',
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#111827',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'none'
                }
            }
        }
    }
});

function cleanForPdf(text: string) {
    return text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/•/g, "")
        .replace(/—/g, "-")
        .replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/–/g, "-")
        .replace(/• --/g, "")
        .replace(/--/g, "")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();
}

export default function Home() {
    const [currentView, setCurrentView] = useState<'builder' | 'history'>('builder');
    
    // Builder State
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

    // History State
    const [historyStats, setHistoryStats] = useState({ totalGenerated: 0, totalSent: 0, streak: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch History Data
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

    // Load history when switching to history view
    useState(() => {
        if (currentView === 'history') {
            fetchHistory();
        }
    }); // Note: This is a render-time check pattern, better use useEffect

    // Correct useEffect Usage
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

            const response = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.text) {
                setBaseResume(data.text);
            } else {
                alert("Failed to extract text: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error parsing resume:", error);
            alert("Error parsing resume");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleTailor = async () => {
        setIsTailoring(true);
        setCurrentEntryId(null); // Reset entry ID for new generation
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
            } else {
                alert("Failed to tailor resume: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error tailoring resume:", error);
            alert("Error tailoring resume");
        } finally {
            setIsTailoring(false);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            const doc = new jsPDF();
            doc.setFont("times");

            const resumeClean = cleanForPdf(tailoredResume);
            const lines = resumeClean.split('\n');
            let y = 20;
            const margin = 20;

            lines.forEach((line) => {
                line = line.trim();
                if (!line) return;

                const isHeader = (
                    line.length > 2 &&
                    line === line.toUpperCase() &&
                    /[A-Z]/.test(line) &&
                    !line.startsWith("-") &&
                    !line.includes("|") 
                );

                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }

                if (isHeader) {
                    doc.setFont("times", "bold");
                    doc.setFontSize(12);
                    doc.text(line, margin, y);
                    doc.setLineWidth(0.5);
                    doc.line(margin, y + 2, 190, y + 2);
                    y += 8;
                } else {
                    doc.setFont("times", "normal");
                    doc.setFontSize(11);
                    const splitLines = doc.splitTextToSize(line, 170);
                    doc.text(splitLines, margin, y);
                    y += splitLines.length * 5; 
                }
            });

            const pdfBase64 = doc.output("datauristring").split(",")[1];

            const docCover = new jsPDF();
            const coverClean = cleanForPdf(coverLetter);
            const splitCover = docCover.splitTextToSize(coverClean, 180);
            let yCover = 10;
            docCover.text(splitCover, 10, yCover);
            const coverLetterPdfBase64 = docCover.output("datauristring").split(",")[1];

            const response = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetEmail,
                    subject: "Job Application",
                    emailBody: coverLetter,
                    pdfBase64: pdfBase64,
                    filename: "Tailored_Resume.pdf",
                    coverLetterPdfBase64: coverLetterPdfBase64,
                    coverLetterFilename: "Cover_Letter.pdf",
                    entryId: currentEntryId // Link this send action to the history entry
                }),
            });
            const data = await response.json();
            if (data.success) {
                alert("Email sent successfully!");
            } else {
                alert("Failed to send email: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error sending email");
        } finally {
            setIsSending(false);
        }
    };

    // UseEffect for History Refresh


    return (
        <ThemeProvider theme={dashboardTheme}>
            <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)' }}>
                <CssBaseline />
                
                {/* 1. TOP APP BAR */}
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-emerald-400 to-blue-500 p-2 rounded-lg">
                                <FileText className="text-white w-6 h-6" />
                            </div>
                            <Typography variant="h6" noWrap component="div" fontWeight="700" sx={{ letterSpacing: 0.5 }}>
                                Resume<span className="text-emerald-400">AI</span>
                            </Typography>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <Box sx={{ position: 'relative', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, mr: 2, display: { xs: 'none', sm: 'block' } }}>
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <InputBase
                                    placeholder="Search..."
                                    sx={{ color: 'inherit', width: '200px', '& .MuiInputBase-input': { p: 1, pl: 5 } }}
                                />
                           </Box>
                           <IconButton color="inherit">
                               <Badge badgeContent={4} color="secondary">
                                   <Bell size={20} />
                               </Badge>
                           </IconButton>
                           <Avatar sx={{ bgcolor: 'secondary.main' }}>KC</Avatar>
                        </div>
                    </Toolbar>
                </AppBar>

                {/* 2. SIDEBAR NAVIGATION */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
                    }}
                >
                    <Toolbar /> {/* Spacer for AppBar */}
                    <Box sx={{ overflow: 'auto', mt: 2 }}>
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton selected={currentView === 'builder'} onClick={() => setCurrentView('builder')}>
                                    <ListItemIcon><LayoutDashboard className={currentView === 'builder' ? "text-emerald-400" : "text-slate-400"}/></ListItemIcon>
                                    <ListItemText primary="Builder" primaryTypographyProps={{ fontWeight: 600, color: currentView === 'builder' ? 'white' : 'gray' }} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton selected={currentView === 'history'} onClick={() => { setCurrentView('history'); fetchHistory(); }}>
                                    <ListItemIcon><History className={currentView === 'history' ? "text-emerald-400" : "text-slate-400"}/></ListItemIcon>
                                    <ListItemText primary="History" primaryTypographyProps={{ fontWeight: 600, color: currentView === 'history' ? 'white' : 'gray' }} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon><FileText className="text-slate-400"/></ListItemIcon>
                                    <ListItemText primary="Templates" className="text-slate-400" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon><Settings className="text-slate-400"/></ListItemIcon>
                                    <ListItemText primary="Settings" className="text-slate-400" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon><LogOut className="text-slate-400"/></ListItemIcon>
                                    <ListItemText primary="Logout" className="text-slate-400" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>

                {/* 3. MAIN DASHBOARD CONTENT */}
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                    <Toolbar /> {/* Spacer for AppBar */}
                    
                    {currentView === 'builder' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Typography variant="h4" gutterBottom fontWeight="700" sx={{ mb: 4 }} className="text-white">
                                Create New Resume
                            </Typography>
                            <Grid container spacing={4} alignItems="stretch">
                                {/* ... Builder Inputs ... */}
                                <Grid size={{ xs: 12, xl: 5 }}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                                                <Wand2 className="text-emerald-400 w-5 h-5" />
                                                <Typography variant="h6" fontWeight="600">Details & Context</Typography>
                                            </div>

                                            <Button
                                                component="label"
                                                variant="outlined"
                                                fullWidth
                                                startIcon={isExtracting ? <CircularProgress size={20} /> : <Upload />}
                                                disabled={isExtracting}
                                                sx={{ height: 64, borderStyle: 'dashed', borderWidth: 2, borderColor: 'text.secondary' }}
                                            >
                                                {isExtracting ? "Parsing PDF..." : "Upload Base Resume (PDF)"}
                                                <input type="file" hidden accept=".pdf" onChange={handleFileSelect} />
                                            </Button>
                                            
                                            <div className="relative text-center">
                                                <Typography variant="caption" className="text-slate-500 uppercase px-2 bg-transparent relative z-10">
                                                    Or paste text
                                                </Typography>
                                            </div>

                                            <TextField
                                                label="Job Description"
                                                placeholder="Paste the job description here..."
                                                multiline
                                                minRows={4}
                                                fullWidth
                                                variant="filled"
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 } }}
                                            />

                                            <TextField
                                                label="Base Resume Content"
                                                placeholder="Extracted resume text..."
                                                multiline
                                                minRows={6}
                                                fullWidth
                                                variant="filled"
                                                value={baseResume}
                                                onChange={(e) => setBaseResume(e.target.value)}
                                                sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, fontFamily: 'monospace', fontSize: '13px' } }}
                                            />
                                            
                                            <div className="mt-auto pt-4">
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    size="large"
                                                    onClick={handleTailor}
                                                    disabled={isTailoring || !jobDescription || !baseResume}
                                                    startIcon={isTailoring ? <CircularProgress size={20} color="inherit" /> : <Wand2 />}
                                                    sx={{ 
                                                        bgcolor: 'primary.main', 
                                                        color: '#000',
                                                        '&:hover': { bgcolor: 'primary.dark' },
                                                        height: 56
                                                    }}
                                                >
                                                    {isTailoring ? "Generating Tailored Resume..." : "Generate Tailored Resume"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* ... Builder Preview ... */}
                                <Grid size={{ xs: 12, xl: 7 }}>
                                     <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="text-blue-400 w-5 h-5" />
                                                    <Typography variant="h6" fontWeight="600">Tailored Preview</Typography>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="small" 
                                                        startIcon={editMode ? <Eye size={16}/> : <Edit size={16}/>}
                                                        onClick={() => setEditMode(!editMode)}
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {editMode ? "Preview Mode" : "Edit Mode"}
                                                    </Button>
                                                </div>
                                            </div>

                                            <Box sx={{ flex: 1, minHeight: 500, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {editMode ? (
                                                    <TextField
                                                        multiline
                                                        fullWidth
                                                        value={tailoredResume}
                                                        onChange={(e) => setTailoredResume(e.target.value)}
                                                        sx={{ 
                                                            height: '100%',
                                                            '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', p: 3, fontFamily: 'monospace' } 
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
                                                        <pre className="whitespace-pre-wrap font-serif text-sm leading-7 text-gray-200">
                                                            {tailoredResume || "Your tailored resume will generated here..."}
                                                        </pre>
                                                    </div>
                                                )}
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 8 }}>
                                                    <TextField
                                                        label="Recruiter Email"
                                                        size="small"
                                                        fullWidth
                                                        value={targetEmail}
                                                        onChange={(e) => setTargetEmail(e.target.value)}
                                                        placeholder="hiring@company.com"
                                                        InputProps={{ startAdornment: <Mail size={16} className="mr-2 text-gray-400"/> }}
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
                                                        sx={{ height: '100%' }}
                                                    >
                                                        Send PDF
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Typography variant="h4" gutterBottom fontWeight="700" sx={{ mb: 4 }} className="text-white">
                                Activity History
                            </Typography>
                            
                            <Grid container spacing={4}>
                                {/* KPI Cards */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{ bgcolor: 'rgba(52, 211, 153, 0.1)' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <div className="p-3 bg-emerald-500/20 rounded-lg">
                                                <TrendingUp className="text-emerald-400 w-8 h-8" />
                                            </div>
                                            <div>
                                                <Typography variant="overline" color="textSecondary">Total Generated</Typography>
                                                <Typography variant="h4" fontWeight="bold">{historyStats.totalGenerated}</Typography>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                                <CheckCircle2 className="text-blue-400 w-8 h-8" />
                                            </div>
                                            <div>
                                                <Typography variant="overline" color="textSecondary">Applications Sent</Typography>
                                                <Typography variant="h4" fontWeight="bold">{historyStats.totalSent}</Typography>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{ bgcolor: 'rgba(248, 113, 113, 0.1)' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <div className="p-3 bg-red-500/20 rounded-lg">
                                                <Calendar className="text-red-400 w-8 h-8" />
                                            </div>
                                            <div>
                                                <Typography variant="overline" color="textSecondary">Active Streak</Typography>
                                                <Typography variant="h4" fontWeight="bold">{historyStats.streak} Days</Typography>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Activity Chart - GitHub Style Contribution */}
                                <Grid size={{ xs: 12, lg: 8 }}>
                                    <Card sx={{ height: 400 }}>
                                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="h6" fontWeight="600" gutterBottom>Generation Activity</Typography>
                                            <div className="flex-1 mt-4">
                                                {loadingHistory ? (
                                                    <div className="flex h-full items-center justify-center">
                                                        <CircularProgress />
                                                    </div>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                                            <YAxis stroke="#94a3b8" />
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                            <Tooltip 
                                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                                                itemStyle={{ color: '#fff' }}
                                                            />
                                                            <Area type="monotone" dataKey="resumes" stroke="#34d399" fillOpacity={1} fill="url(#colorResumes)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Recent Activity List */}
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <Card sx={{ height: 400, overflow: 'auto' }}>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="600" gutterBottom>Recent Applications</Typography>
                                            {loadingHistory ? (
                                                <div className="flex justify-center p-4"><CircularProgress size={24}/></div>
                                            ) : (
                                                <List>
                                                    {historyList.map((item) => (
                                                        <ListItem key={item.id} disablePadding sx={{ mb: 2 }}>
                                                            <ListItemButton sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                                                                <ListItemIcon>
                                                                    <div className="p-2 bg-slate-800 rounded-full">
                                                                        <FileText size={18} className="text-emerald-400" />
                                                                    </div>
                                                                </ListItemIcon>
                                                                <ListItemText 
                                                                    primary={item.title} 
                                                                    secondary={`${item.company} • ${item.date}`} 
                                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                                />
                                                                <Chip 
                                                                    label={item.status} 
                                                                    size="small" 
                                                                    color={item.status === 'Sent' ? "success" : "default"} 
                                                                    variant={item.status === 'Sent' ? "filled" : "outlined"}
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                    {historyList.length === 0 && <Typography variant="caption" sx={{textAlign:'center', display:'block', mt:2}}>No history yet.</Typography>}
                                                </List>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
}
