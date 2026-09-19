"use client";

import React, {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// --- Types ---
type LiquidItem = {
  id: string;
  channelNo: number;
  name: string;
  nameKo: string;
  hue: number;
  colorLabel: string;
  subtitle: string;
  volume: string;
  formulaLine: string;
  rate: string;
  timeWindow: string;
  warningPrefix: "[주의]" | "[경고]";
  warningText: string;
  characteristic: string;
  dripNote: string;
  rotateDeg: number;
  floatDurationSec: number;
};

// --- Patient Metadata ---
const PATIENT_META = {
  ptName: "MODERN HUMAN",
  regNo: "0524-0608-2026",
  status: "OVERLOADED",
  barcodeId: "WAONGJAE-01",
} as const;

// --- 10 Liquid Items Dataset ---
const LIQUID_ITEMS: LiquidItem[] = [
  {
    id: "melatonin",
    channelNo: 1,
    name: "MELATONIN",
    nameKo: "멜라토닌",
    hue: 220,
    colorLabel: "딥 나이트 블루",
    subtitle: "System Reboot",
    volume: "500ml",
    formulaLine: "Sleep Inducer",
    rate: "SLOW",
    timeWindow: "[T=FORCE_SLEEP] ~ [T=AUTO_WAKE]",
    warningPrefix: "[주의]",
    warningText:
      "진정한 휴식이 아닌, 내일을 위해 다시 소비될 기계적 수면 선택입니다.",
    characteristic: "시스템 강제 종료",
    dripNote: "끈적하고 무겁게 맺혀 있다가 아주 느리게 떨어집니다.",
    rotateDeg: -3,
    floatDurationSec: 6,
  },
  {
    id: "placebo",
    channelNo: 2,
    name: "PLACEBO",
    nameKo: "플라시보",
    hue: 315,
    colorLabel: "바이오 마젠타",
    subtitle: "Fake Hope",
    volume: "500ml",
    formulaLine: "Distilled Water / 0% Nutrition",
    rate: "CONSTANT",
    timeWindow: "[T=HOPE_INJECTION] ~ [T=REALITY_CHECK]",
    warningPrefix: "[주의]",
    warningText: "효과는 없지만 뇌를 속여 시스템에 매달리게 하는 위약입니다.",
    characteristic: "시스템 기만 위약",
    dripNote: "일정한 간격을 두고 천천히 떨어집니다.",
    rotateDeg: 4,
    floatDurationSec: 7,
  },
  {
    id: "caffeine",
    channelNo: 3,
    name: "CAFFEINE",
    nameKo: "카페인",
    hue: 25,
    colorLabel: "앰버 오렌지",
    subtitle: "Labour Fuel",
    volume: "350ml",
    formulaLine: "C₈H₁₀N₄O₂ / Pure Caffeine 99.9%",
    rate: "ASAP",
    timeWindow: "[T=SYS_STARTUP] - [T=DEPLETED]",
    warningPrefix: "[경고]",
    warningText: "강제 구동을 위한 일시적 연명용 기초 연료입니다.",
    characteristic: "일시적 시스템 각성",
    dripNote: "매우 급박한 낙하 속도입니다.",
    rotateDeg: -2,
    floatDurationSec: 5.2,
  },
  {
    id: "nicotine",
    channelNo: 4,
    name: "NICOTINE",
    nameKo: "니코틴",
    hue: 185,
    colorLabel: "스모크 시안",
    subtitle: "Short Break",
    volume: "100ml",
    formulaLine: "C₁₀H₁₄N₂ / Liquid Nicotine",
    rate: "INTERMITTENT",
    timeWindow: "[T=OVERLOAD_DETECT] ~ [T+05:00 MIN]",
    warningPrefix: "[주의]",
    warningText: "억지로 만들어낸 5분간의 기계적 휴식입니다.",
    characteristic: "강제적 신경 안정",
    dripNote: "휴식 타이밍에만 한꺼번에 떨어지는 속도입니다.",
    rotateDeg: 5,
    floatDurationSec: 8,
  },
  {
    id: "sugar",
    channelNo: 5,
    name: "SUGAR",
    nameKo: "당",
    hue: 275,
    colorLabel: "인공 펄 보라",
    subtitle: "Brain Power",
    volume: "1000ml",
    formulaLine: "High-Enriched Sugar Concentrate",
    rate: "20 gtt",
    timeWindow: "[T=LOW_BATTERY] ~ [T=CRITICAL_WARN]",
    warningPrefix: "[경고]",
    warningText: "번아웃 직전의 뇌를 강제 가동하기 위한 즉각적 에너지입니다.",
    characteristic: "화학적 위약 효과",
    dripNote: "기계적으로 규칙적인 박자입니다.",
    rotateDeg: -4,
    floatDurationSec: 5.5,
  },
  {
    id: "attention",
    channelNo: 6,
    name: "ATTENTION",
    nameKo: "타인의 관심",
    hue: 155,
    colorLabel: "메디컬 시안",
    subtitle: "Self-Esteem",
    volume: "250ml",
    formulaLine: "Likes & Views Extract",
    rate: "HIGH PRIORITY",
    timeWindow: "[T=DATA_UPLOAD] ~ [T=SESSION_TIMEOUT]",
    warningPrefix: "[경고]",
    warningText: "타인의 시선으로 증명받아야만 유지되는 가짜 자존감입니다.",
    characteristic: "외부 의존적 동력",
    dripNote: "조급하고 빠른 박자로 계속 보충됩니다.",
    rotateDeg: 3,
    floatDurationSec: 5,
  },
  {
    id: "like",
    channelNo: 7,
    name: "LIKE",
    nameKo: "좋아요",
    hue: 205,
    colorLabel: "일렉트릭 딥 블루",
    subtitle: "Anxiety Block",
    volume: "300ml",
    formulaLine: "Social Proof Concentrate",
    rate: "VARIABLE",
    timeWindow: "[T=REQ_EVAL] ~ [T=NEXT_CYCLE]",
    warningPrefix: "[경고]",
    warningText: "지속적인 타인의 'LIKE' 없이는 시스템 구동이 불가능합니다.",
    characteristic: "디지털 승인 신호",
    dripNote: "불안정하게 몇 방울 빠르게 떨어집니다.",
    rotateDeg: -5,
    floatDurationSec: 6.5,
  },
  {
    id: "alcohol",
    channelNo: 8,
    name: "ALCOHOL",
    nameKo: "알코올",
    hue: 45,
    colorLabel: "독성 옐로우",
    subtitle: "Numbness",
    volume: "750ml",
    formulaLine: "C₂H₅OH / Ethyl Alcohol",
    rate: "FAST",
    timeWindow: "[T=PROCESS_KILL] ~ [T=MEMORY_DUMP]",
    warningPrefix: "[주의]",
    warningText: "하루의 끝을 억지로 마비시키는 용액입니다.",
    characteristic: "화학적 신경 마비",
    dripNote: "굵고 빠르게 뚝뚝 떨어지는 속도입니다.",
    rotateDeg: 2,
    floatDurationSec: 6.8,
  },
  {
    id: "dopamine",
    channelNo: 9,
    name: "DOPAMINE",
    nameKo: "도파민",
    hue: 130,
    colorLabel: "네온 그린",
    subtitle: "Hollow Pleasure",
    volume: "500ml",
    formulaLine: "C₈H₁₁NO₂ / Algorithm Inducer",
    rate: "REAL-TIME",
    timeWindow: "[T=SCREEN_UNLOCK] ~ [T=IDLE_MODE]",
    warningPrefix: "[주의]",
    warningText: "무한 스크롤을 통해 주입되는 휘발성 자극제입니다.",
    characteristic: "보상 회로 강제 활성화",
    dripNote: "얇은 물줄기처럼 쉴 새 없이 흘러내립니다.",
    rotateDeg: -3,
    floatDurationSec: 7.5,
  },
  {
    id: "cortisol",
    channelNo: 10,
    name: "CORTISOL",
    nameKo: "코르티솔",
    hue: 0,
    colorLabel: "경고 레드",
    subtitle: "Survival Tension",
    volume: "500ml",
    formulaLine: "C₂₁H₃₀O₅ / Chronic Stress Hormone",
    rate: "PEAK",
    timeWindow: "[T=WARNING_LVL] ~ [T=SYS_FAILURE]",
    warningPrefix: "[경고]",
    warningText: "과부하된 시스템을 억지로 가동시키는 생존 호르몬입니다.",
    characteristic: "시스템 과부하 경고",
    dripNote: "가장 빠르고 거칠게 쏟아지는 속도입니다.",
    rotateDeg: 4,
    floatDurationSec: 8.5,
  },
];

function colorFromHue(hue: number, lightness = 45): string {
  return `hsl(${hue} 75% ${lightness}%)`;
}

// React 안전한 마운트 감지 서브스크립션 함수
const emptySubscribe = () => () => {};

// --- Vector IV Bag Component ---
function VectorIVBag({
  item,
  isFront,
}: {
  item: LiquidItem;
  isFront: boolean;
}) {
  const accentColor = colorFromHue(item.hue, 45);

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="h-1.5 w-4 rounded-t-full border border-slate-300 bg-slate-200" />

      <div
        className={`relative flex flex-col items-center justify-between rounded-2xl border transition-all duration-200 ${
          isFront
            ? "h-36 w-26 border-slate-300 bg-white shadow-lg"
            : "h-28 w-20 border-slate-200 bg-slate-50 opacity-60"
        }`}
        style={{
          boxShadow: isFront
            ? `0 8px 20px -4px ${colorFromHue(item.hue, 50)}35`
            : "none",
        }}
      >
        <div
          className="absolute inset-x-1 bottom-1.5 top-5 overflow-hidden rounded-xl opacity-85"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${colorFromHue(
              item.hue,
              85,
            )} 35%, ${colorFromHue(item.hue, 60)} 100%)`,
          }}
        >
          <div className="absolute top-1 inset-x-0 h-0.5 rounded-full bg-white/60" />
        </div>

        <div className="relative z-10 p-1.5 text-center w-full">
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 border-b border-slate-200/60 pb-0.5">
            <span>CH-{String(item.channelNo).padStart(3, "0")}</span>
          </div>

          <h3 className="mt-1 font-extrabold tracking-tight text-xs truncate text-slate-900">
            {item.name}
          </h3>

          <p className="text-[9px] text-slate-700 font-medium">{item.nameKo}</p>
        </div>

        <div className="relative z-10 mb-0.5 flex justify-center space-x-1">
          <div className="h-1.5 w-1 rounded-b border border-slate-300 bg-slate-200" />
          <div className="h-1.5 w-1 rounded-b border border-slate-300 bg-slate-200" />
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="h-1 w-0.5 bg-slate-300" />
        <div
          className={`rounded-sm border bg-white overflow-hidden ${
            isFront ? "h-5 w-2.5 border-slate-300" : "h-4 w-2 border-slate-200"
          }`}
        >
          <div
            className="absolute bottom-0 inset-x-0 h-1.5 opacity-80"
            style={{ backgroundColor: accentColor }}
          />
        </div>
        <div className="h-4 w-0.5" style={{ backgroundColor: accentColor }} />
      </div>
    </div>
  );
}

export default function IVCatalogPage() {
  // useSyncExternalStore로 연쇄 재렌더링 경고 없이 클라이언트 마운트 여부 안전하게 처리
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startAngle = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef<number | null>(null);

  const totalItems = LIQUID_ITEMS.length;
  const degreesPerItem = 360 / totalItems;

  const snapToNearest = useCallback(
    (currentAngle: number) => {
      const rawIndex = Math.round(-currentAngle / degreesPerItem);
      const normalizedIndex =
        ((rawIndex % totalItems) + totalItems) % totalItems;
      const targetAngle = -rawIndex * degreesPerItem;

      setRotationAngle(targetAngle);
      setSelectedIndex(normalizedIndex);
    },
    [degreesPerItem, totalItems],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    startAngle.current = rotationAngle;
    velocity.current = 0;

    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const currentX = e.clientX;
    const now = performance.now();
    const deltaX = currentX - startX.current;
    const dt = now - lastTime.current || 16;

    const newAngle = startAngle.current + deltaX * 0.4;
    setRotationAngle(newAngle);

    velocity.current = (currentX - lastX.current) / dt;
    lastX.current = currentX;
    lastTime.current = now;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    let currentV = velocity.current * 15;
    let currentDeg = rotationAngle;

    const animateInertia = () => {
      if (Math.abs(currentV) > 0.5) {
        currentDeg += currentV;
        currentV *= 0.88;
        setRotationAngle(currentDeg);
        animFrame.current = requestAnimationFrame(animateInertia);
      } else {
        snapToNearest(currentDeg);
      }
    };

    animateInertia();
  };

  const handleItemClick = (index: number) => {
    if (isDragging.current) return;
    const targetAngle = -index * degreesPerItem;
    setRotationAngle(targetAngle);
    setSelectedIndex(index);
  };

  if (!hasMounted) {
    return (
      <div className="mx-auto min-h-screen h-screen max-w-md bg-white text-slate-800 font-sans flex items-center justify-center">
        <div className="text-xs font-mono text-slate-500">
          INITIALIZING CATALOG...
        </div>
      </div>
    );
  }

  const selectedLiquid = LIQUID_ITEMS[selectedIndex];

  return (
    <div className="mx-auto min-h-screen h-screen max-h-screen max-w-md w-full bg-white text-slate-900 font-sans flex flex-col justify-between overflow-hidden box-border">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white/90 sticky top-0 z-20">
        <div>
          <span className="text-[9px] font-mono tracking-widest text-slate-400 block uppercase">
            IV Drip Exhibition Catalog
          </span>
          <h1 className="text-xs font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
            3D ROTARY IV STAND
          </h1>
        </div>
      </header>

      {/* Main 3D Rotary Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center py-1 select-none overflow-hidden">
        {/* Rotary Container */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-[220px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none z-10"
        >
          {LIQUID_ITEMS.map((item, i) => {
            const angleDeg = i * degreesPerItem + rotationAngle;
            const angleRad = (angleDeg * Math.PI) / 180;

            const x = Math.sin(angleRad) * 125;
            const z = Math.cos(angleRad);

            const scale = 0.6 + 0.4 * ((z + 1) / 2);
            const opacity = 0.3 + 0.7 * ((z + 1) / 2);
            const zIndex = Math.round((z + 1) * 100);
            const isFront = z > 0.92;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(i)}
                className="absolute transition-transform duration-75 ease-out"
                style={{
                  transform: `translate3d(${x}px, 0px, 0px) scale(${scale})`,
                  opacity,
                  zIndex,
                  filter: isFront ? "none" : "blur(0.5px)",
                }}
              >
                <VectorIVBag item={item} isFront={isFront} />
              </div>
            );
          })}
        </div>

        {/* Compact Detail Card */}
        <section
          className="w-[calc(100%-2rem)] mx-auto rounded-xl border p-3 bg-slate-50/80 shadow-sm z-20 transition-all duration-200"
          style={{
            borderColor: colorFromHue(selectedLiquid.hue, 80),
          }}
        >
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-1 text-[9px] font-mono text-slate-500">
            <div>
              <span className="text-slate-400">PT:</span> {PATIENT_META.ptName}
            </div>
            <div>
              <span className="text-slate-400">REG:</span> {PATIENT_META.regNo}
            </div>
            <div className="text-rose-600 font-bold">{PATIENT_META.status}</div>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between">
            <h2
              className="text-base font-black tracking-tight"
              style={{ color: colorFromHue(selectedLiquid.hue, 35) }}
            >
              {selectedLiquid.name}
            </h2>
          </div>

          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-slate-200/80 pt-1.5 text-[10px]">
            <div>
              <span className="text-[8px] font-mono text-slate-400 block leading-none">
                CHARACTERISTIC
              </span>
              <span className="text-slate-800 font-medium">
                {selectedLiquid.characteristic}
              </span>
            </div>

            <div>
              <span className="text-[8px] font-mono text-slate-400 block leading-none">
                INFUSION RATE
              </span>
              <span className="text-slate-900 font-mono font-bold">
                {selectedLiquid.rate}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[8px] font-mono text-slate-400 block leading-none">
                DRIP NOTE
              </span>
              <span className="text-slate-600 leading-tight text-[9.5px]">
                {selectedLiquid.dripNote}
              </span>
            </div>
          </div>

          <div className="mt-2 rounded bg-amber-50/90 p-1.5 border border-amber-200/80 text-[10px] leading-snug">
            <span className="font-bold text-amber-700 mr-1 font-mono">
              {selectedLiquid.warningPrefix}
            </span>
            <span className="text-amber-900">{selectedLiquid.warningText}</span>
          </div>
        </section>
      </main>

      {/* Footer Dots Navigation */}
      <footer className="py-2.5 px-4 flex justify-center gap-1.5 z-20 bg-white border-t border-slate-100">
        {LIQUID_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(idx)}
            className={`h-1.5 rounded-full transition-all ${
              selectedIndex === idx ? "w-5" : "w-1.5 bg-slate-200"
            }`}
            style={{
              backgroundColor:
                selectedIndex === idx ? colorFromHue(item.hue, 45) : undefined,
            }}
            aria-label={`Select Channel ${item.channelNo}`}
          />
        ))}
      </footer>
    </div>
  );
}
