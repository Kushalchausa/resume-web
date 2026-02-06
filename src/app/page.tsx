"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Wand2, 
    FileText, 
    Zap, 
    CheckCircle2, 
    ArrowRight, 
    Layout, 
    ShieldCheck, 
    Bot,
    Menu,
    X
} from 'lucide-react';
import { 
    createTheme, 
    ThemeProvider, 
    responsiveFontSizes 
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    Grid,
    Paper,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    Chip
} from "@mui/material";

// --- Theme Configuration ---
let landingTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#34d399', // Emerald 400
            light: '#6ee7b7',
            dark: '#10b981',
            contrastText: '#0f172a',
        },
        secondary: {
            main: '#60a5fa', // Blue 400
            light: '#93c5fd',
            dark: '#3b82f6',
        },
        background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b',   // Slate 800
        },
        text: {
            primary: '#f8fafc', // Slate 50
            secondary: '#94a3b8', // Slate 400
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.025em' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 16
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontSize: '1rem',
                },
                containedPrimary: {
                    boxShadow: '0 4px 14px 0 rgba(52, 211, 153, 0.39)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(52, 211, 153, 0.23)',
                    },
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        }
    }
});

landingTheme = responsiveFontSizes(landingTheme);

// --- Components ---

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const navItems = ['Features', 'How it Works', 'Pricing'];

    return (
        <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Container maxWidth={false} sx={{ px: { xs: 3, md: 8 } }}>
                <Toolbar disableGutters sx={{ height: 80, justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 no-underline text-white group">
                        <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2.5 rounded-xl transition-transform group-hover:scale-105 shadow-lg shadow-emerald-500/20">
                            <FileText className="text-white w-6 h-6" />
                        </div>
                        <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: -0.5, display: { xs: 'none', sm: 'block' } }}>
                            Resume<span className="text-emerald-400">AI</span>
                        </Typography>
                    </Link>

                    {/* Desktop Utility Nav */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                        {navItems.map((item) => (
                            <Button key={item} color="inherit" sx={{ px: 2, py: 1, borderRadius: 2, color: 'text.secondary', fontWeight: 500, fontSize: '0.95rem', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                {item}
                            </Button>
                        ))}
                        <Box sx={{ ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            <Link href="/dashboard" passHref>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    sx={{ 
                                        borderRadius: '50px', 
                                        px: 3,
                                        boxShadow: '0 0 15px rgba(52, 211, 153, 0.3)',
                                        '&:hover': { boxShadow: '0 0 25px rgba(52, 211, 153, 0.5)' }
                                    }}
                                >
                                    Launch App
                                </Button>
                            </Link>
                        </Box>
                    </Box>

                    {/* Mobile Menu Icon */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ display: { md: 'none' }, ml: 2 }}
                    >
                        {mobileOpen ? <X /> : <Menu />}
                    </IconButton>
                </Toolbar>
            </Container>
            
            {/* Mobile Drawer */}
            <Drawer
                anchor="top"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { bgcolor: '#0f172a', mt: '80px', borderTop: '1px solid rgba(255,255,255,0.05)' } }}
            >
                <List sx={{ px: 3, pb: 4 }}>
                    {navItems.map((item) => (
                        <ListItem key={item} disablePadding>
                            <ListItemButton sx={{ textAlign: 'center', borderRadius: 2, my: 0.5 }}>
                                <ListItemText primary={item} primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem disablePadding sx={{ mt: 2 }}>
                        <Link href="/dashboard" passHref className="w-full">
                            <Button fullWidth variant="contained" size="large" sx={{ borderRadius: 3, py: 1.5 }}>Launch App</Button>
                        </Link>
                    </ListItem>
                </List>
            </Drawer>
        </AppBar>
    );
};

const Hero = () => {
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            position: 'relative', 
            overflow: 'hidden',
            pt: { xs: 16, md: 24 },
            pb: { xs: 8, md: 10 },
            background: 'radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 1) 0%, rgba(2, 6, 23, 1) 100%)'
        }}>
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <Container maxWidth={false} sx={{ position: 'relative', px: { xs: 3, md: 8 } }}>
                <Grid container spacing={{ xs: 6, md: 4, lg: 8 }} alignItems="center">
                    {/* Left Content */}
                    <Grid size={{ xs: 12, md: 6, lg: 5 }}>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <Chip 
                                label="✨ v2.0 Now Live" 
                                sx={{ 
                                    mb: 3, 
                                    bgcolor: 'rgba(52, 211, 153, 0.08)', 
                                    color: '#34d399', 
                                    fontWeight: 700, 
                                    border: '1px solid rgba(52, 211, 153, 0.2)',
                                    px: 1
                                }} 
                            />
                            <Typography 
                                variant="h1" 
                                sx={{ 
                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '5rem' },
                                    lineHeight: 1.1,
                                    fontWeight: 800,
                                    mb: 3,
                                    background: 'linear-gradient(to bottom right, #ffffff 30%, #94a3b8 100%)',
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                Craft Your Perfect <br />
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                    Resume in Seconds
                                </span>
                            </Typography>
                            
                            <Typography 
                                variant="h5" 
                                color="text.secondary" 
                                sx={{ 
                                    mb: 5, 
                                    maxWidth: '600px', 
                                    lineHeight: 1.6,
                                    fontSize: { xs: '1rem', md: '1.25rem' },
                                    fontWeight: 400
                                }}
                            >
                                Stop wrestling with formatting. Our AI analyzes job descriptions and tailors your resume keywords instantly to beat the ATS and get hired faster.
                            </Typography>
                            
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
                                <Link href="/dashboard" passHref className="w-full sm:w-auto">
                                    <Button 
                                        variant="contained" 
                                        size="large" 
                                        endIcon={<ArrowRight />} 
                                        fullWidth
                                        sx={{ 
                                            px: 5, 
                                            py: 2, 
                                            fontSize: '1.1rem',
                                            borderRadius: '50px',
                                            background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                                            boxShadow: '0 0 20px rgba(52, 211, 153, 0.4)',
                                            '&:hover': {
                                                boxShadow: '0 0 30px rgba(52, 211, 153, 0.6)',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Build My Resume
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    sx={{ 
                                        px: 5, 
                                        py: 2, 
                                        fontSize: '1.1rem', 
                                        borderRadius: '50px',
                                        borderColor: 'rgba(255,255,255,0.1)', 
                                        color: 'white', 
                                        borderWidth: '1px',
                                        '&:hover': { 
                                            borderColor: 'white', 
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            borderWidth: '1px'
                                        } 
                                    }}
                                >
                                    View Samples
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={4} alignItems="center" sx={{ opacity: 0.8 }}>
                                {[
                                    { text: "ATS Friendly", icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
                                    { text: "GPT-4 Powered", icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
                                    { text: "Privacy First", icon: <CheckCircle2 size={18} className="text-emerald-400" /> }
                                ].map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {item.icon}
                                        <Typography variant="body2" color="white" fontWeight={500}>
                                            {item.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </motion.div>
                    </Grid>

                    {/* Right Visual */}
                    <Grid size={{ xs: 12, md: 6, lg: 7 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
                        <motion.div 
                            initial={{ opacity: 0, y: 40, rotateX: 10 }} 
                            animate={{ opacity: 1, y: 0, rotateX: 0 }} 
                            transition={{ delay: 0.2, duration: 0.8 }}
                            style={{ perspective: 1000 }}
                        >
                            <Box sx={{ position: 'relative' }}>
                                {/* Floating Elements */}
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }} 
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute -top-12 -right-12 z-20"
                                >
                                    <Paper sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 4 }}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                                                <Bot size={24} />
                                            </div>
                                            <div>
                                                <Typography variant="subtitle2" fontWeight="bold">AI Analysis</Typography>
                                                <Typography variant="caption" className="text-emerald-400">Optimized</Typography>
                                            </div>
                                        </div>
                                    </Paper>
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 15, 0] }} 
                                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-8 -left-8 z-20"
                                >
                                    <Paper sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: 4 }}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <Typography variant="subtitle2" fontWeight="bold">ATS Score</Typography>
                                                <Typography variant="caption" className="text-blue-400">98/100 Excellent</Typography>
                                            </div>
                                        </div>
                                    </Paper>
                                </motion.div>

                                {/* Main Resume Card Visual */}
                                <Paper 
                                    elevation={24} 
                                    sx={{ 
                                        width: { md: 450, lg: 550 },
                                        height: { md: 600, lg: 700 },
                                        bgcolor: 'rgba(255, 255, 255, 0.03)', 
                                        backdropFilter: 'blur(20px)', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                >
                                    {/* Mock Browser Header */}
                                    <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>

                                    {/* Mock Resume Content */}
                                    <div className="p-8 space-y-6 opacity-60">
                                            {/* Header */}
                                            <div className="flex gap-4 items-center mb-8">
                                                <div className="w-16 h-16 rounded-full bg-white/10" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 w-1/2 bg-white/20 rounded" />
                                                    <div className="h-3 w-1/3 bg-white/10 rounded" />
                                                </div>
                                            </div>

                                            {/* Lines */}
                                            <div className="space-y-3">
                                                <div className="h-4 w-1/4 bg-emerald-500/20 rounded mb-4" />
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="h-2 w-full bg-white/5 rounded" />
                                                ))}
                                                <div className="h-2 w-2/3 bg-white/5 rounded" />
                                            </div>

                                            <div className="space-y-3 pt-4">
                                                <div className="h-4 w-1/4 bg-blue-500/20 rounded mb-4" />
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className="h-2 w-full bg-white/5 rounded" />
                                                ))}
                                            </div>
                                            
                                            {/* Glowing Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10" />
                                    </div>
                                    
                                    {/* Scan Line Animation */}
                                    <motion.div 
                                        className="absolute top-0 left-0 w-full h-1 bg-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.5)] z-10"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                    />
                                </Paper>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

const Features = () => {
    const features = [
        {
            icon: <Bot className="w-6 h-6 text-white" />,
            title: "AI-Powered Tailoring",
            desc: "Instantly rewrite your resume to match specific job descriptions using advanced LLMs."
        },
        {
            icon: <Layout className="w-6 h-6 text-white" />,
            title: "Professional Templates",
            desc: "Choose from battle-tested, recruiter-approved templates that stand out."
        },
        {
            icon: <Wand2 className="w-6 h-6 text-white" />,
            title: "Smart Optimization",
            desc: "Automatic keyword optimization ensures you pass Applicant Tracking Systems (ATS)."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-white" />,
            title: "Data Privacy",
            desc: "Your data stays yours. We don't share your personal information with third parties."
        },
        {
            icon: <FileText className="w-6 h-6 text-white" />,
            title: "Cover Letter Gen",
            desc: "Generate personalized cover letters that perfectly complement your tailored resume."
        },
        {
            icon: <Zap className="w-6 h-6 text-white" />,
            title: "Real-time Previews",
            desc: "See your changes instantly with our high-performance, live-rendering engine."
        }
    ];

    return (
        <Box sx={{ py: 12, bgcolor: '#0f172a' }}>
            <Container maxWidth={false} sx={{ px: { xs: 3, md: 8 } }}>
                <Box mb={8}>
                    <Typography variant="h6" color="primary" gutterBottom textTransform="uppercase" fontWeight="bold" letterSpacing={1}>
                        Why Choose Us
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                        Supercharge Your Job Search
                    </Typography>
                </Box>
                
                <Grid container spacing={4}>
                    {features.map((feature, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                            <Paper 
                                sx={{ 
                                    p: 4, 
                                    height: '100%', 
                                    bgcolor: 'rgba(30, 41, 59, 0.4)', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        bgcolor: 'rgba(30, 41, 59, 0.8)',
                                        borderColor: 'rgba(52, 211, 153, 0.3)'
                                    }
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                    {feature.icon}
                                </div>
                                <Typography variant="h6" fontWeight="bold" gutterBottom color="white">
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {feature.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

const Footer = () => {
    return (
        <Box sx={{ py: 8, bgcolor: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="text-emerald-400 w-6 h-6" />
                            <Typography variant="h6" fontWeight="800" color="white">
                                Resume<span className="text-emerald-400">AI</span>
                            </Typography>
                        </div>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                            Empowering job seekers with AI-driven tools to land their dream jobs faster and easier.
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 6, md: 4 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="white" gutterBottom>Product</Typography>
                                <Stack spacing={1}>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Features</Link>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Pricing</Link>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Templates</Link>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 6, md: 4 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="white" gutterBottom>Company</Typography>
                                <Stack spacing={1}>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">About</Link>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Blog</Link>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Careers</Link>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 6, md: 4 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="white" gutterBottom>Legal</Typography>
                                <Stack spacing={1}>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Privacy</Link>
                                    <Link href="#" className="text-slate-400 hover:text-emerald-400 text-sm no-underline">Terms</Link>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 8, textAlign: 'center' }}>
                    © {new Date().getFullYear()} ResumeAI. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default function LandingPage() {
    return (
        <ThemeProvider theme={landingTheme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Navbar />
                <Hero />
                <Features />
                <Footer />
            </Box>
        </ThemeProvider>
    );
}
