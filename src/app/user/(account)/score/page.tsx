import AchievementSection from './AchievementSection';
import ScoreBanner from './ScoreBanner';
import ScoreSection from './ScoreSection';

export default function ScorePage() {
    return (
    <div className="relative overflow-hidden">
    <div className="absolute w-[500px] h-[550px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "50px", left: "-200px" }} />
    <div className="absolute w-[500] h-[450px] bg-[var(--primary)] opacity-80 blur-[250px] pointer-events-none" style={{ top: "560px", left: "1380px" }} />
    <div className="absolute w-[500px] h-[550px] bg-[var(--secondary)] opacity-40 blur-[250px] pointer-events-none" style={{ top: "1600px", left: "1380px" }} />
        <ScoreBanner />
        <AchievementSection/>
        <ScoreSection />
    </div>
    );
}


