import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEARNING_CARDS } from "@/data/artisanData";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function LearningCarousel({ fullScreen = false }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [readState, setReadState] = useLocalStorage("artisan_learning_read", {});
  const activeCard = LEARNING_CARDS[activeIndex];

  useEffect(() => {
    if (!activeCard) {
      return;
    }

    setReadState((current) => ({
      ...current,
      [activeCard.id]: true,
    }));
  }, [activeCard]);

  const progress = useMemo(
    () => LEARNING_CARDS.map((card) => Boolean(readState[card.id])),
    [readState],
  );

  const handleScroll = () => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const nextIndex = Math.round(element.scrollLeft / element.clientWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), LEARNING_CARDS.length - 1));
  };

  const jumpToCard = (index) => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      behavior: "smooth",
      left: index * element.clientWidth,
    });
  };

  return (
    <div
      className={`overflow-hidden rounded-[2rem] border bg-card shadow-lg shadow-primary/10 ${
        fullScreen ? "min-h-[calc(100vh-5rem)]" : "min-h-[34rem]"
      }`}
    >
      <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Learn & Earn
          </p>
          <h2 className="mt-2 text-xl font-bold">Hindi micro-learning cards</h2>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>
            {progress.filter(Boolean).length}/{LEARNING_CARDS.length} पढ़े गए
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex h-[calc(100%-8rem)] snap-x snap-mandatory overflow-x-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {LEARNING_CARDS.map((card) => (
          <section
            key={card.id}
            className="flex min-w-full snap-center flex-col justify-between bg-gradient-to-br from-orange-50 via-amber-50 to-white p-6 sm:p-8"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">कार्ड {LEARNING_CARDS.indexOf(card) + 1}</p>
                {readState[card.id] ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Read
                  </span>
                ) : null}
              </div>
              <h3 className="max-w-2xl text-3xl font-bold leading-tight">{card.title}</h3>
              <div className="mt-6 space-y-4 text-base leading-7 text-foreground/90">
                {card.body.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setReadState((current) => ({
                    ...current,
                    [card.id]: true,
                  }))
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                पढ़ लिया
              </Button>
            </div>
          </section>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 border-t px-6 py-4">
        {LEARNING_CARDS.map((card, index) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Go to ${card.title}`}
            className={`h-2.5 rounded-full transition-all ${
              activeIndex === index ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30"
            }`}
            onClick={() => jumpToCard(index)}
          />
        ))}
      </div>
    </div>
  );
}
