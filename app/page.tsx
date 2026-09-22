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
    hue: 275,
    colorLabel: "인공 펄 보라",
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
    hue: 45,
    colorLabel: "독성 옐로우",
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
    hue: 315,
    colorLabel: "바이오 마젠타",
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
    hue: 185,
    colorLabel: "스모크 시안",
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

// --- Image-based IV Bag Component (중앙 선택 이미지 대폭 확대) ---
function ImageIVBag({ item, isFront }: { item: LiquidItem; isFront: boolean }) {
  return (
    <div className="relative flex flex-col items-center select-none">
      <div
        className={`relative flex items-center justify-center transition-all duration-200 ${
          isFront ? "h-[380px] w-[250px]" : "h-[220px] w-[145px] opacity-40"
        }`}
      >
        {/* public 폴더 내 이미지 파일 렌더링 */}
        <img
          src={`/${item.id}.png`}
          alt={item.name}
          className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
        />

        {/* 이미지 중앙 위에 이름(영어 / 한국어) 배치 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
          <span
            className={`font-extrabold tracking-wider text-slate-900 leading-tight drop-shadow-[0_1.5px_3px_rgba(255,255,255,0.95)] ${
              isFront ? "text-base" : "text-[11px]"
            }`}
          >
            {item.name}
          </span>
          <span
            className={`mt-0.5 font-bold text-slate-800 leading-none drop-shadow-[0_1.5px_3px_rgba(255,255,255,0.95)] ${
              isFront ? "text-xs" : "text-[9px]"
            }`}
          >
            {item.nameKo}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function IVCatalogPage() {
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
      <div className="mx-auto h-[100dvh] max-w-md bg-white text-slate-800 font-sans flex items-center justify-center">
        <div className="text-xs font-mono text-slate-500">
          INITIALIZING CATALOG...
        </div>
      </div>
    );
  }

  const selectedLiquid = LIQUID_ITEMS[selectedIndex];

  return (
    <div className="mx-auto h-[100dvh] max-w-md w-full bg-white text-slate-900 font-sans flex flex-col justify-between overflow-hidden box-border p-3">
      {/* Main 3D Area (중앙 + 양 옆 총 3개만 표시, 중앙 크기 극대화) */}
      <main className="relative flex-1 flex flex-col items-center justify-center select-none overflow-hidden min-h-0">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none z-10"
        >
          {LIQUID_ITEMS.map((item, i) => {
            const angleDeg = i * degreesPerItem + rotationAngle;
            // 각도를 [-180, 180) 정규화
            const normalizedAngle = (((angleDeg % 360) + 540) % 360) - 180;
            const absAngle = Math.abs(normalizedAngle);

            // 중앙 기준 양옆 1개 범위(약 52도 초과)를 벗어나면 숨김
            if (absAngle > 52) return null;

            const angleRad = (normalizedAngle * Math.PI) / 180;
            const x = Math.sin(angleRad) * 150;
            const z = Math.cos(angleRad);

            const scale = 0.65 + 0.35 * ((z + 1) / 2);
            let opacity = 0.35 + 0.65 * ((z + 1) / 2);

            // 범위 끝부분 부드러운 페이드아웃
            if (absAngle > 36) {
              opacity *= 1 - (absAngle - 36) / (52 - 36);
            }

            const zIndex = Math.round((z + 1) * 100);
            const isFront = absAngle < 15;

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
                <ImageIVBag item={item} isFront={isFront} />
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail Section & Footer Navigation */}
      <div className="flex-none flex flex-col gap-2 z-20">
        {/* Selected Channel Indicator */}
        <div className="w-full flex items-center justify-center">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-slate-400">SELECTED:</span>
            <span
              className="font-bold"
              style={{ color: colorFromHue(selectedLiquid.hue, 40) }}
            >
              #{String(selectedLiquid.channelNo).padStart(2, "0")}{" "}
              {selectedLiquid.name} ({selectedLiquid.nameKo})
            </span>
          </div>
        </div>

        {/* Compact Detail Card */}
        <section
          className="w-full rounded-xl border p-3 bg-slate-50/80 shadow-sm transition-all duration-200"
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
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-mono border"
              style={{
                backgroundColor: colorFromHue(selectedLiquid.hue, 96),
                borderColor: colorFromHue(selectedLiquid.hue, 80),
                color: colorFromHue(selectedLiquid.hue, 35),
              }}
            >
              {selectedLiquid.colorLabel}
            </span>
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

        {/* Footer Dots Navigation */}
        <footer className="py-1 flex justify-center gap-1.5">
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
                  selectedIndex === idx
                    ? colorFromHue(item.hue, 45)
                    : undefined,
              }}
              aria-label={`Select Channel ${item.channelNo}`}
            />
          ))}
        </footer>
      </div>
    </div>
  );
}
