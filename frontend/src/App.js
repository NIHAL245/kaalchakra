import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import FortDetail from "@/pages/FortDetail";
import Quiz from "@/pages/Quiz";
import Leaderboard from "@/pages/Leaderboard";
import AskTheKing from "@/pages/AskTheKing";
import Admin from "@/pages/Admin";
import { MuseumHome, MuseumCategory, MuseumItemDetail } from "@/pages/Museum";

function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <LanguageProvider>
                <PlayerProvider>
                    <div className="App">
                        <BrowserRouter>
                            <Routes>
                                <Route element={<AppShell />}>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/explore" element={<Explore />} />
                                    <Route path="/museum" element={<MuseumHome />} />
                                    <Route path="/museum/item/:slug" element={<MuseumItemDetail />} />
                                    <Route path="/museum/:categorySlug" element={<MuseumCategory />} />
                                    <Route path="/fort/:slug" element={<FortDetail />} />
                                    <Route path="/quiz" element={<Quiz />} />
                                    <Route path="/quiz/:slug" element={<Quiz />} />
                                    <Route path="/leaderboard" element={<Leaderboard />} />
                                    <Route path="/ask" element={<AskTheKing />} />
                                </Route>
                                <Route path="/admin" element={<Admin />} />
                            </Routes>
                        </BrowserRouter>
                        <Toaster position="top-center" richColors={false} />
                    </div>
                </PlayerProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
