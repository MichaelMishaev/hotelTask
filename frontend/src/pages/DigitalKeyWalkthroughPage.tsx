import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../components/ui/MaterialIcon';

interface WalkthroughStep {
  icon: string;
  stepKey: string;
  titleKey: string;
  descKey: string;
}

const STEP_DEFS: WalkthroughStep[] = [
  {
    icon: 'bluetooth',
    stepKey: 'walkthrough.step01',
    titleKey: 'walkthrough.step01Title',
    descKey: 'walkthrough.step01Desc',
  },
  {
    icon: 'door_front',
    stepKey: 'walkthrough.step02',
    titleKey: 'walkthrough.step02Title',
    descKey: 'walkthrough.step02Desc',
  },
  {
    icon: 'contactless',
    stepKey: 'walkthrough.step03',
    titleKey: 'walkthrough.step03Title',
    descKey: 'walkthrough.step03Desc',
  },
  {
    icon: 'lock_open',
    stepKey: 'walkthrough.step04',
    titleKey: 'walkthrough.step04Title',
    descKey: 'walkthrough.step04Desc',
  },
];

export function DigitalKeyWalkthroughPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 20 // gap
      : 300;
    const newStep = Math.round(scrollLeft / cardWidth);
    setActiveStep(Math.min(newStep, STEP_DEFS.length - 1));
  };

  const handleGetStarted = () => {
    navigate('/digital-key');
  };

  return (
    <div data-testid="digital-key-walkthrough-page" className="flex flex-col min-h-screen bg-[#f6f6f8]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#f6f6f8]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <MaterialIcon name="hotel_class" className="text-primary text-3xl" />
          <h1 className="text-xl font-bold tracking-tight uppercase">{t('common.grandHotel')}</h1>
        </div>
        <button
          data-testid="walkthrough-skip"
          onClick={() => navigate('/digital-key')}
          className="text-primary font-semibold hover:opacity-80 transition-opacity"
        >
          {t('walkthrough.skip')}
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 flex flex-col px-6">
        <div className="mt-4 mb-8">
          <h2 className="text-3xl font-bold leading-tight">{t('walkthrough.digitalKeyGuide')}</h2>
          <p className="text-primary/70 mt-2 font-medium">
            {t('walkthrough.followSteps')}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex w-full flex-row items-center gap-2 mb-8">
          {STEP_DEFS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= activeStep ? 'bg-primary' : 'bg-primary/20'
              }`}
            />
          ))}
        </div>

        {/* Horizontal Scrollable Cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto pb-8 snap-x snap-mandatory gap-5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STEP_DEFS.map((step, i) => (
            <div
              key={i}
              data-testid={`walkthrough-step-${i}`}
              className="flex h-full flex-col gap-6 rounded-xl min-w-[280px] w-[80vw] max-w-[320px] snap-center bg-white p-6 shadow-sm border border-black/5 flex-shrink-0"
            >
              <div className="w-full bg-primary/5 aspect-[4/5] rounded-xl flex items-center justify-center relative overflow-hidden">
                <MaterialIcon name={step.icon} className="text-primary !text-8xl" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {t(step.stepKey)}
                </span>
                <h3 className="text-xl font-bold">{t(step.titleKey)}</h3>
                <p className="text-black/60 leading-relaxed text-sm">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Fixed Bottom */}
      <footer className="mt-auto p-6 bg-[#f6f6f8] border-t border-black/5">
        <div className="flex flex-col gap-4">
          <button
            data-testid="walkthrough-get-started"
            onClick={handleGetStarted}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            {t('walkthrough.getStarted')}
            <MaterialIcon name="arrow_forward" className="rtl:scale-x-[-1]" />
          </button>
          <p className="text-center text-xs text-black/40">{t('walkthrough.swipeMore')}</p>
        </div>
      </footer>
    </div>
  );
}
