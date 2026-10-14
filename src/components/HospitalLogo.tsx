import React from 'react';

interface HospitalLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  size = 48,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
        aria-label="ตราสัญลักษณ์โรงพยาบาลสังขละบุรี"
      >
        <defs>
          {/* Top curve for Thai text */}
          <path
            id="topCurve"
            d="M 58 200 A 142 142 0 0 1 342 200"
            fill="none"
          />
          {/* Bottom curve for English text */}
          <path
            id="bottomCurve"
            d="M 68 200 A 132 132 0 0 0 332 200"
            fill="none"
          />

          <linearGradient id="torchGrad" x1="200" y1="100" x2="200" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Outer Circular Rings */}
        <circle cx="200" cy="200" r="194" fill="#ffffff" stroke="#0f6b3e" strokeWidth="4" />
        <circle cx="200" cy="200" r="186" fill="#ffffff" stroke="#0f6b3e" strokeWidth="2.5" />

        {/* Center Emerald Disc */}
        <circle cx="200" cy="200" r="126" fill="#0f6b3e" stroke="#ffffff" strokeWidth="3" />

        {/* Arched Text: โรงพยาบาลสังขละบุรี (Top) */}
        <text
          fill="#0f6b3e"
          fontSize="24"
          fontWeight="bold"
          letterSpacing="2.5"
          style={{ fontFamily: "'Prompt', 'Sarabun', sans-serif" }}
        >
          <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
            โรงพยาบาลสังขละบุรี
          </textPath>
        </text>

        {/* Decorative Thai Kanok motifs left & right */}
        {/* Left Ornament */}
        <g transform="translate(36, 192) scale(0.75)" fill="#0f6b3e">
          <path d="M10,10 C15,5 20,5 25,10 C20,15 15,15 10,10 Z M5,10 C10,0 25,0 30,10 C25,20 10,20 5,10 Z" />
          <circle cx="17.5" cy="10" r="3" />
        </g>
        {/* Right Ornament */}
        <g transform="translate(338, 192) scale(0.75)" fill="#0f6b3e">
          <path d="M10,10 C15,5 20,5 25,10 C20,15 15,15 10,10 Z M5,10 C10,0 25,0 30,10 C25,20 10,20 5,10 Z" />
          <circle cx="17.5" cy="10" r="3" />
        </g>

        {/* Arched Text: SANGKHLABURI HOSPITAL (Bottom) */}
        <text
          fill="#0f6b3e"
          fontSize="19"
          fontWeight="700"
          letterSpacing="4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
            SANGKHLABURI HOSPITAL
          </textPath>
        </text>

        {/* Inner Medical Caduceus / Torch Emblem (White & Silver) */}
        <g id="caduceusEmblem">
          {/* Flame at top of torch */}
          <path
            d="M 200 95 C 196 112 184 120 190 135 C 193 142 198 144 200 152 C 202 144 207 142 210 135 C 216 120 204 112 200 95 Z"
            fill="#ffffff"
          />
          <path
            d="M 194 118 C 190 126 193 132 195 138 C 196 130 199 126 194 118 Z"
            fill="#0f6b3e"
            opacity="0.3"
          />
          <path
            d="M 206 118 C 210 126 207 132 205 138 C 204 130 201 126 206 118 Z"
            fill="#0f6b3e"
            opacity="0.3"
          />

          {/* Torch Bowl / Cup */}
          <path
            d="M 188 152 C 188 165 212 165 212 152 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Staff (Central Rod) */}
          <rect x="196" y="162" width="8" height="130" rx="3" fill="#ffffff" />

          {/* Wings (Thai stylized angel wings / Garuda style) */}
          {/* Left Wing */}
          <path
            d="M 194 165 C 172 150 142 155 125 174 C 145 174 162 178 178 186 C 185 180 190 174 194 165 Z"
            fill="#ffffff"
          />
          <path
            d="M 132 176 C 146 182 160 186 176 192 C 160 192 146 188 132 176 Z"
            fill="#ffffff"
          />
          {/* Right Wing */}
          <path
            d="M 206 165 C 228 150 258 155 275 174 C 255 174 238 178 222 186 C 215 180 210 174 206 165 Z"
            fill="#ffffff"
          />
          <path
            d="M 268 176 C 254 182 240 186 224 192 C 240 192 254 188 268 176 Z"
            fill="#ffffff"
          />

          {/* Serpent 1 (Coiled around staff) */}
          <path
            d="M 184 190 C 165 195 160 215 185 224 C 215 233 225 248 205 262 C 185 275 188 290 200 295"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Serpent 2 (Opposite coil) */}
          <path
            d="M 216 190 C 235 195 240 215 215 224 C 185 233 175 248 195 262 C 215 275 212 290 200 295"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Snake Heads near top wings */}
          <path d="M 183 188 C 178 184 184 180 188 185 Z" fill="#ffffff" />
          <path d="M 217 188 C 222 184 216 180 212 185 Z" fill="#ffffff" />

          {/* Lotus Pedestal Base */}
          <path
            d="M 186 295 L 214 295 L 208 305 L 192 305 Z"
            fill="#ffffff"
          />
          <path
            d="M 190 305 L 210 305 L 200 318 Z"
            fill="#ffffff"
          />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            โรงพยาบาลสังขละบุรี
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Sangkhlaburi Hospital · ระบบคำนวณค่างานและอัตรากำลังพยาบาล
          </span>
        </div>
      )}
    </div>
  );
};
