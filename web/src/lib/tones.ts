import type { Season, ToneId } from "./analysis/classifier";

export interface SeasonInfo {
  ko: string;
  en: string;
  emoji: string;
  summary: string;
  accent: string;
}

export const SEASONS: Record<Season, SeasonInfo> = {
  Spring: { ko: "봄 웜톤", en: "Spring", emoji: "🌷", accent: "#F39A6B", summary: "따뜻하고 맑은 색이 생기를 더해주는 타입이에요." },
  Summer: { ko: "여름 쿨톤", en: "Summer", emoji: "🌊", accent: "#8AA6D6", summary: "부드럽고 시원한 색이 피부를 맑아 보이게 하는 타입이에요." },
  Autumn: { ko: "가을 웜톤", en: "Autumn", emoji: "🍂", accent: "#B5713A", summary: "깊고 차분한 따뜻한 색이 고급스럽게 어울리는 타입이에요." },
  Winter: { ko: "겨울 쿨톤", en: "Winter", emoji: "❄️", accent: "#3D4FA8", summary: "선명하고 차가운 색, 강한 대비가 또렷하게 살아나는 타입이에요." },
};

export interface ToneInfo {
  season: Season;
  ko: string;
  en: string;
  keywords: string[];
  description: string;
  best: string[];
  worst: string[];
  lip: string[];
  blush: string[];
  eye: string[];
  hair: string[];
  metal: string;
  tip: string;
}

export const TONES: Record<ToneId, ToneInfo> = {
  Spring_Light: {
    season: "Spring", ko: "봄 라이트", en: "Light Spring",
    keywords: ["밝은", "화사한", "투명한"],
    description: "밝고 가벼운 웜 파스텔이 가장 잘 어울려요. 진하고 무거운 색은 얼굴을 칙칙하게 만들 수 있어요.",
    best: ["#FFE5B4", "#FFB7A5", "#FFD966", "#B5E3A1", "#9FD8E8", "#F7A8B8", "#FFCBA4", "#E8D5B5", "#FFF4E0", "#F4A582", "#A8D5BA", "#C9B6E4"],
    worst: ["#000000", "#36454F", "#800020", "#4B0082", "#556B2F"],
    lip: ["코랄 핑크", "피치", "살구 글로시"],
    blush: ["피치", "라이트 코랄"],
    eye: ["샴페인 골드", "피치 브라운"],
    hair: ["밀크 브라운", "허니 베이지", "라이트 골드 브라운"],
    metal: "로즈골드·옐로골드",
    tip: "검정 대신 아이보리·라이트 베이지를 기본 컬러로 써보세요.",
  },
  Spring_Warm: {
    season: "Spring", ko: "봄 트루", en: "Warm Spring",
    keywords: ["따뜻한", "생기있는", "골든"],
    description: "노란 기가 도는 따뜻하고 선명한 색이 잘 어울려요. 푸른 기가 강한 차가운 색은 피해주세요.",
    best: ["#FF7F50", "#FFA500", "#FFD700", "#8DB600", "#40E0D0", "#FF6F61", "#F4C430", "#C68E17", "#F5DEB3", "#FA8072", "#E9967A", "#7FC97F"],
    worst: ["#000000", "#C0C0C0", "#800080", "#FF00FF", "#708090"],
    lip: ["코랄", "오렌지 레드", "웜 피치"],
    blush: ["코랄", "오렌지 피치"],
    eye: ["골드", "카멜", "웜 브라운"],
    hair: ["골드 브라운", "오렌지 브라운", "카라멜"],
    metal: "옐로골드",
    tip: "흰색은 순백보다 크림·아이보리가 얼굴을 더 화사하게 해요.",
  },
  Spring_Bright: {
    season: "Spring", ko: "봄 브라이트", en: "Bright Spring",
    keywords: ["선명한", "비비드", "또렷한"],
    description: "채도가 높고 맑은 색이 잘 어울려요. 탁하고 회색빛이 도는 색은 얼굴을 흐려 보이게 해요.",
    best: ["#FF4F4F", "#FF8C00", "#FFEF00", "#00C957", "#00CED1", "#FF69B4", "#1E90FF", "#FF7F50", "#FFFFF0", "#7FDB6A", "#FF5E7E", "#20B2AA"],
    worst: ["#C8B8A6", "#8B8589", "#6B5B4B", "#A9A9A9", "#BC8F8F"],
    lip: ["비비드 코랄", "체리 레드", "핫 코랄 핑크"],
    blush: ["비비드 코랄", "클리어 핑크"],
    eye: ["골드 펄", "브라이트 브라운"],
    hair: ["밝은 골드 브라운", "다크 초콜릿(대비감)"],
    metal: "옐로골드 (광택 있는)",
    tip: "포인트 컬러 하나를 과감하게 쓰는 코디가 잘 어울려요.",
  },
  Summer_Light: {
    season: "Summer", ko: "여름 라이트", en: "Light Summer",
    keywords: ["밝은", "청량한", "부드러운"],
    description: "흰 기가 섞인 밝고 시원한 파스텔이 잘 어울려요. 노랗고 진한 색은 얼굴을 누렇게 보이게 할 수 있어요.",
    best: ["#F8C8DC", "#B0C4DE", "#E6E6FA", "#AEC6CF", "#98D7C2", "#D8BFD8", "#FFB6C1", "#C3CDE6", "#F5F5F5", "#A2B5CD", "#E0B0FF", "#87CEEB"],
    worst: ["#FF8C00", "#8B4513", "#000000", "#DAA520", "#556B2F"],
    lip: ["라이트 로즈", "베이비 핑크", "라벤더 핑크"],
    blush: ["라벤더 핑크", "라이트 로즈"],
    eye: ["실버 펄", "라벤더", "쿨 그레이 브라운"],
    hair: ["애쉬 브라운", "밀크티 애쉬", "로즈 브라운"],
    metal: "실버·화이트골드",
    tip: "블랙 대신 그레이시 네이비나 라이트 그레이를 써보세요.",
  },
  Summer_Cool: {
    season: "Summer", ko: "여름 트루", en: "Cool Summer",
    keywords: ["시원한", "깨끗한", "우아한"],
    description: "푸른 기가 도는 중간 밝기의 쿨톤 색이 잘 어울려요. 오렌지·골드 계열은 피해주세요.",
    best: ["#6495ED", "#DB7093", "#B0E0E6", "#708090", "#9370DB", "#4682B4", "#E75480", "#5F9EA0", "#DDA0DD", "#778899", "#F0F8FF", "#34495E"],
    worst: ["#FF4500", "#FFD700", "#8B4513", "#FF8C00", "#9ACD32"],
    lip: ["로즈 핑크", "라즈베리", "쿨 핑크"],
    blush: ["쿨 로즈", "핑크"],
    eye: ["쿨 브라운", "그레이", "모브"],
    hair: ["애쉬 브라운", "블루 블랙(소프트)", "쿨 다크 브라운"],
    metal: "실버·플래티넘",
    tip: "흰 셔츠는 순백보다 살짝 푸른 기가 도는 화이트가 좋아요.",
  },
  Summer_Soft: {
    season: "Summer", ko: "여름 뮤트", en: "Soft Summer",
    keywords: ["차분한", "그레이시", "은은한"],
    description: "회색빛이 섞인 부드럽고 탁한 쿨톤 색이 잘 어울려요. 원색처럼 쨍한 색은 얼굴보다 옷이 먼저 보여요.",
    best: ["#A3B1C2", "#C4A4A7", "#9CAF88", "#B7A9C9", "#8E9AAF", "#D8C3C5", "#7D8C8D", "#B39EB5", "#6E7F80", "#E5DCD3", "#8B8589", "#A57C82"],
    worst: ["#FF0000", "#FFFF00", "#FF8C00", "#000000", "#00FF7F"],
    lip: ["말린 장미", "모브 핑크", "누드 로즈"],
    blush: ["더스티 로즈", "모브"],
    eye: ["토프", "그레이시 브라운", "모브 브라운"],
    hair: ["애쉬 그레이 브라운", "모카 애쉬"],
    metal: "무광 실버·로즈골드",
    tip: "톤온톤(같은 계열 색의 농도 차이) 코디가 가장 세련돼 보여요.",
  },
  Autumn_Soft: {
    season: "Autumn", ko: "가을 뮤트", en: "Soft Autumn",
    keywords: ["부드러운", "내추럴", "차분한"],
    description: "회색빛이 살짝 섞인 따뜻하고 부드러운 색이 잘 어울려요. 쨍한 원색과 차가운 색은 피해주세요.",
    best: ["#C2B280", "#A0785A", "#8A9A5B", "#B5651D", "#C9A27E", "#9E7B6B", "#6B8E7F", "#D2B48C", "#B08D57", "#808000", "#C08081", "#8F9779"],
    worst: ["#FF1493", "#0000FF", "#000000", "#FFFFFF", "#00FFFF"],
    lip: ["누드 베이지", "말린 코랄", "로즈 브라운"],
    blush: ["베이지 코랄", "소프트 피치"],
    eye: ["카키 브라운", "베이지", "브론즈(무광)"],
    hair: ["소프트 브라운", "카키 브라운", "밀크 초콜릿"],
    metal: "무광 골드·브론즈",
    tip: "카멜·카키·베이지 같은 자연색 위주의 레이어드가 잘 어울려요.",
  },
  Autumn_Warm: {
    season: "Autumn", ko: "가을 트루", en: "Warm Autumn",
    keywords: ["따뜻한", "풍부한", "클래식"],
    description: "노란 기가 진하게 도는 깊은 웜톤 색이 잘 어울려요. 형광·파스텔·차가운 핑크는 피해주세요.",
    best: ["#CC5500", "#B7410E", "#DAA520", "#808000", "#8B4513", "#E2725B", "#C19A6B", "#6B8E23", "#008080", "#FFDB58", "#A0522D", "#9C2D2D"],
    worst: ["#FF69B4", "#E6E6FA", "#C0C0C0", "#00BFFF", "#FF00FF"],
    lip: ["벽돌", "테라코타", "오렌지 브라운"],
    blush: ["테라코타", "오렌지 베이지"],
    eye: ["골드 브라운", "카키", "브론즈"],
    hair: ["골드 브라운", "카퍼 브라운", "다크 카라멜"],
    metal: "골드·앤틱 골드",
    tip: "머스타드·테라코타 같은 가을 단풍 색을 포인트로 써보세요.",
  },
  Autumn_Deep: {
    season: "Autumn", ko: "가을 딥", en: "Deep Autumn",
    keywords: ["깊은", "강렬한", "고급스러운"],
    description: "어둡고 깊은 따뜻한 색이 잘 어울려요. 밝은 파스텔은 얼굴을 창백하게 만들 수 있어요.",
    best: ["#5C4033", "#800000", "#556B2F", "#8B1A1A", "#B8860B", "#2F4F4F", "#6F4E37", "#A52A2A", "#CD853F", "#004953", "#722F37", "#C46210"],
    worst: ["#FFB6C1", "#E0FFFF", "#E6E6FA", "#FFFACD", "#B0C4DE"],
    lip: ["딥 브릭", "버건디 브라운", "칠리 레드"],
    blush: ["브릭", "딥 코랄"],
    eye: ["다크 브라운", "올리브", "딥 골드"],
    hair: ["다크 브라운", "다크 초콜릿", "흑갈색"],
    metal: "골드·브론즈",
    tip: "블랙 대신 다크 초콜릿 브라운이나 딥 올리브를 기본 컬러로 써보세요.",
  },
  Winter_Deep: {
    season: "Winter", ko: "겨울 딥", en: "Deep Winter",
    keywords: ["깊은", "도시적인", "강렬한"],
    description: "어둡고 선명한 차가운 색, 블랙&화이트 대비가 잘 어울려요. 탁한 베이지·오렌지는 피해주세요.",
    best: ["#000000", "#FFFFFF", "#8B0000", "#191970", "#4B0082", "#006400", "#800080", "#DC143C", "#2F4F4F", "#C71585", "#0F52BA", "#046307"],
    worst: ["#FFDAB9", "#F5DEB3", "#DAA520", "#FFA07A", "#BDB76B"],
    lip: ["버건디", "딥 플럼", "블랙 체리"],
    blush: ["딥 로즈", "플럼"],
    eye: ["차콜", "딥 퍼플", "블랙 브라운"],
    hair: ["블루 블랙", "다크 브라운(쿨)"],
    metal: "실버·화이트골드",
    tip: "올블랙 코디에 레드 립 하나만 더해도 완성돼요.",
  },
  Winter_Cool: {
    season: "Winter", ko: "겨울 트루", en: "Cool Winter",
    keywords: ["차가운", "선명한", "시크한"],
    description: "푸른 기가 강한 선명하고 차가운 색이 잘 어울려요. 노란 기가 도는 따뜻한 색은 얼굴을 칙칙하게 해요.",
    best: ["#0000CD", "#FF00FF", "#C71585", "#FFFFFF", "#000080", "#DC143C", "#8A2BE2", "#4169E1", "#E0115F", "#009B77", "#708090", "#B0E0E6"],
    worst: ["#FFA500", "#D2B48C", "#8B4513", "#DAA520", "#808000"],
    lip: ["푸시아", "쿨 레드", "와인"],
    blush: ["쿨 핑크", "푸시아(소량)"],
    eye: ["그레이", "네이비", "실버"],
    hair: ["블랙", "블루 블랙", "애쉬 다크 브라운"],
    metal: "실버·플래티넘",
    tip: "순백·블랙·로열블루처럼 깨끗한 단색 코디가 가장 잘 어울려요.",
  },
  Winter_Bright: {
    season: "Winter", ko: "겨울 브라이트", en: "Bright Winter",
    keywords: ["비비드", "화려한", "또렷한"],
    description: "채도가 아주 높은 쨍한 쿨톤 색과 강한 대비가 잘 어울려요. 흐리고 탁한 색은 존재감을 약하게 해요.",
    best: ["#FF0000", "#0047AB", "#FF1493", "#00A86B", "#FFFFFF", "#000000", "#8F00FF", "#00BFFF", "#FFF44F", "#E30B5C", "#40E0D0", "#FF00FF"],
    worst: ["#C2B280", "#A0785A", "#8A9A5B", "#BC8F8F", "#D2B48C"],
    lip: ["트루 레드", "비비드 푸시아", "라즈베리"],
    blush: ["비비드 핑크", "라즈베리(소량)"],
    eye: ["블랙 라인", "실버 글리터", "코발트 포인트"],
    hair: ["블랙", "블루 블랙"],
    metal: "실버 (광택 있는)",
    tip: "블랙&화이트에 비비드 포인트 컬러 하나를 더한 코디가 가장 잘 살아나요.",
  },
};
