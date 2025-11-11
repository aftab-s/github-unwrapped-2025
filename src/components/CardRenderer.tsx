import React from 'react';
import type { UserStats, ThemeName } from '@/types';

interface CardRendererProps {
  stats: UserStats;
  theme: ThemeName;
}

export const CardRenderer = React.forwardRef<SVGSVGElement, CardRendererProps>(
  ({ stats, theme }, ref) => {
    // Funky color palette with gradients
    const themeColors = {
      space: {
        bg: '#0d1117',
        bgGradient1: '#1a1f3a',
        bgGradient2: '#0d1117',
        border: '#30363d',
        accent: '#58a6ff',
        accent2: '#7c3aed',
        accent3: '#ec4899',
        text: '#c9d1d9',
        textBold: '#f0f6fc',
        subtle: '#8b949e',
      },
      sunset: {
        bg: '#1c1917',
        bgGradient1: '#3d2817',
        bgGradient2: '#1c1917',
        border: '#44403c',
        accent: '#fb923c',
        accent2: '#f97316',
        accent3: '#fbbf24',
        text: '#e7e5e4',
        textBold: '#fafaf9',
        subtle: '#a8a29e',
      },
      retro: {
        bg: '#1e1b2e',
        bgGradient1: '#3b2f5f',
        bgGradient2: '#1e1b2e',
        border: '#3b3555',
        accent: '#e879f9',
        accent2: '#a78bfa',
        accent3: '#38bdf8',
        text: '#d8b4fe',
        textBold: '#f5f3ff',
        subtle: '#a78bfa',
      },
      minimal: {
        bg: '#ffffff',
        bgGradient1: '#f3f4f6',
        bgGradient2: '#ffffff',
        border: '#d0d7de',
        accent: '#0969da',
        accent2: '#7c3aed',
        accent3: '#059669',
        text: '#57606a',
        textBold: '#1f2328',
        subtle: '#656d76',
      },
      'high-contrast': {
        bg: '#000000',
        bgGradient1: '#1a1a1a',
        bgGradient2: '#000000',
        border: '#ffffff',
        accent: '#00ff00',
        accent2: '#ffff00',
        accent3: '#00ffff',
        text: '#ffffff',
        textBold: '#ffffff',
        subtle: '#bbbbbb',
      },
    };

    const colors = themeColors[theme];

    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
      return num.toString();
    };

    const truncate = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    const topRepo = stats.topRepos[0];

    return (
      <svg
        ref={ref}
        width="1080"
        height="1350"
        viewBox="0 0 1080 1350"
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
      >
        <defs>
          <clipPath id="avatarClip">
            <circle cx="540" cy="100" r="55" />
          </clipPath>
          
          {/* Funky gradients */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.bgGradient1} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.bgGradient2} stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="50%" stopColor={colors.accent2} />
            <stop offset="100%" stopColor={colors.accent3} />
          </linearGradient>
          
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.accent} stopOpacity="0.1" />
            <stop offset="100%" stopColor={colors.accent2} stopOpacity="0.05" />
          </linearGradient>
          
          {/* Sparkle filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background with gradient */}
        <rect width="1080" height="1350" fill={colors.bg} />
        <rect width="1080" height="1350" fill="url(#bgGradient)" opacity="0.3" />
        
        {/* Decorative elements */}
        <circle cx="100" cy="100" r="150" fill={colors.accent} opacity="0.03" />
        <circle cx="980" cy="1250" r="200" fill={colors.accent2} opacity="0.03" />
        <rect x="700" y="50" width="300" height="300" rx="150" fill={colors.accent3} opacity="0.02" transform="rotate(45 850 200)" />

        {/* HEADER */}
        <g id="header">
          {/* Avatar with funky border */}
          <circle cx="540" cy="100" r="60" fill="url(#accentGradient)" opacity="0.3" />
          <circle cx="540" cy="100" r="57" stroke="url(#accentGradient)" strokeWidth="3" fill="none" />
          <image
            href={stats.avatarUrl}
            x="485"
            y="45"
            width="110"
            height="110"
            clipPath="url(#avatarClip)"
            crossOrigin="anonymous"
            preserveAspectRatio="xMidYMid slice"
          />

          {/* Username with gradient underline */}
          <text
            x="540"
            y="190"
            textAnchor="middle"
            fontSize="32"
            fontWeight="700"
            fill={colors.textBold}
            filter="url(#glow)"
          >
            {stats.login}
          </text>
          
          {/* Decorative underline */}
          <rect
            x="440"
            y="200"
            width="200"
            height="3"
            rx="1.5"
            fill="url(#accentGradient)"
          />

          {/* Real name */}
          {stats.name && (
            <text
              x="540"
              y="230"
              textAnchor="middle"
              fontSize="16"
              fill={colors.subtle}
            >
              {truncate(stats.name, 45)}
            </text>
          )}

          {/* Funky year badge */}
          <rect
            x="880"
            y="75"
            width="130"
            height="36"
            rx="18"
            fill="url(#cardGradient)"
            stroke="url(#accentGradient)"
            strokeWidth="2"
          />
          <text
            x="945"
            y="100"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill={colors.accent}
            filter="url(#glow)"
          >
            ✨ 2025
          </text>

          {/* Wavy divider */}
          <path
            d="M 90 260 Q 270 250, 450 260 T 810 260 Q 900 250, 990 260"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
        </g>

        {/* MAIN STATS GRID */}
        <g id="statsGrid" transform="translate(90, 290)">
          {/* Row 1 */}
          {/* Commits */}
          <g>
            <rect
              x="0"
              y="0"
              width="280"
              height="130"
              rx="16"
              fill="url(#cardGradient)"
              stroke={colors.accent}
              strokeWidth="2"
            />
            <text
              x="20"
              y="32"
              fontSize="12"
              fontWeight="600"
              fill={colors.subtle}
            >
              💻 Commits
            </text>
            <text
              x="20"
              y="85"
              fontSize="48"
              fontWeight="700"
              fill={colors.accent}
              filter="url(#glow)"
            >
              {formatNumber(stats.totalCommits)}
            </text>
          </g>

          {/* Pull Requests */}
          <g>
            <rect
              x="310"
              y="0"
              width="280"
              height="130"
              rx="16"
              fill="url(#cardGradient)"
              stroke={colors.accent2}
              strokeWidth="2"
            />
            <text
              x="330"
              y="32"
              fontSize="12"
              fontWeight="600"
              fill={colors.subtle}
            >
              🔀 Pull Requests
            </text>
            <text
              x="330"
              y="85"
              fontSize="48"
              fontWeight="700"
              fill={colors.accent2}
              filter="url(#glow)"
            >
              {formatNumber(stats.totalPRs)}
            </text>
          </g>

          {/* Issues */}
          <g>
            <rect
              x="620"
              y="0"
              width="280"
              height="130"
              rx="16"
              fill="url(#cardGradient)"
              stroke={colors.accent3}
              strokeWidth="2"
            />
            <text
              x="640"
              y="32"
              fontSize="12"
              fontWeight="600"
              fill={colors.subtle}
            >
              🐛 Issues
            </text>
            <text
              x="640"
              y="85"
              fontSize="48"
              fontWeight="700"
              fill={colors.accent3}
              filter="url(#glow)"
            >
              {formatNumber(stats.totalIssues)}
            </text>
          </g>

          {/* Row 2 */}
          {/* Repositories */}
          <g>
            <rect
              x="0"
              y="155"
              width="280"
              height="130"
              rx="16"
              fill="url(#cardGradient)"
              stroke={colors.accent2}
              strokeWidth="2"
            />
            <text
              x="20"
              y="187"
              fontSize="12"
              fontWeight="600"
              fill={colors.subtle}
            >
              📦 Repositories
            </text>
            <text
              x="20"
              y="240"
              fontSize="48"
              fontWeight="700"
              fill={colors.accent2}
              filter="url(#glow)"
            >
              {formatNumber(stats.totalRepositories)}
            </text>
          </g>

          {/* Stars Given */}
          <g>
            <rect
              x="310"
              y="155"
              width="280"
              height="130"
              rx="16"
              fill="url(#cardGradient)"
              stroke={colors.accent3}
              strokeWidth="2"
            />
            <text
              x="330"
              y="187"
              fontSize="12"
              fontWeight="600"
              fill={colors.subtle}
            >
              ⭐ Stars Given
            </text>
            <text
              x="330"
              y="240"
              fontSize="48"
              fontWeight="700"
              fill={colors.accent3}
              filter="url(#glow)"
            >
              {formatNumber(stats.totalStarsGiven)}
            </text>
          </g>

          {/* PR Reviews */}
          <g>
            <rect
              x="620"
              y="155"
              width="280"
              height="130"
              rx="16"
              fill="url(#cardGradient)"
              stroke={colors.accent}
              strokeWidth="2"
            />
            <text
              x="640"
              y="187"
              fontSize="12"
              fontWeight="600"
              fill={colors.subtle}
            >
              👀 PR Reviews
            </text>
            <text
              x="640"
              y="240"
              fontSize="48"
              fontWeight="700"
              fill={colors.accent}
              filter="url(#glow)"
            >
              {formatNumber(stats.totalPRReviews)}
            </text>
          </g>
        </g>

        {/* ACTIVITY INSIGHTS */}
        <g id="insights" transform="translate(90, 620)">
          <text
            x="0"
            y="0"
            fontSize="20"
            fontWeight="700"
            fill={colors.textBold}
          >
            🔥 Activity Insights
          </text>

          {/* Streak */}
          <rect
            x="0"
            y="25"
            width="280"
            height="95"
            rx="16"
            fill="url(#cardGradient)"
            stroke="url(#accentGradient)"
            strokeWidth="2"
          />
          <text
            x="20"
            y="50"
            fontSize="11"
            fontWeight="600"
            fill={colors.subtle}
          >
            🔥 Longest Streak
          </text>
          <text
            x="20"
            y="90"
            fontSize="36"
            fontWeight="700"
            fill={colors.accent}
          >
            {stats.longestStreakDays}
          </text>
          <text
            x="90"
            y="95"
            fontSize="14"
            fill={colors.subtle}
          >
            days
          </text>

          {/* Best Day */}
          <rect
            x="310"
            y="25"
            width="280"
            height="95"
            rx="16"
            fill="url(#cardGradient)"
            stroke="url(#accentGradient)"
            strokeWidth="2"
          />
          <text
            x="330"
            y="50"
            fontSize="11"
            fontWeight="600"
            fill={colors.subtle}
          >
            📅 Most Active Day
          </text>
          <text
            x="330"
            y="90"
            fontSize="36"
            fontWeight="700"
            fill={colors.accent2}
          >
            {stats.bestDayOfWeek}
          </text>

          {/* Peak Hour */}
          <rect
            x="620"
            y="25"
            width="280"
            height="95"
            rx="16"
            fill="url(#cardGradient)"
            stroke="url(#accentGradient)"
            strokeWidth="2"
          />
          <text
            x="640"
            y="50"
            fontSize="11"
            fontWeight="600"
            fill={colors.subtle}
          >
            ⏰ Peak Hour
          </text>
          <text
            x="640"
            y="90"
            fontSize="36"
            fontWeight="700"
            fill={colors.accent3}
          >
            {String(stats.bestHour).padStart(2, '0')}:00
          </text>
        </g>

        {/* TOP LANGUAGES - Redesigned */}
        {stats.topLanguages.length > 0 && (
          <g id="languages" transform="translate(90, 765)">
            <text
              x="0"
              y="0"
              fontSize="20"
              fontWeight="700"
              fill={colors.textBold}
            >
              🌐 Top Languages
            </text>

            {/* Languages Grid Layout */}
            <g transform="translate(0, 30)">
              {stats.topLanguages.slice(0, 3).map((lang, index) => {
                const isFirst = index === 0;
                const positions = [
                  { x: 0, y: 0, width: 900, height: 85 }, // First language - full width, larger
                  { x: 0, y: 100, width: 435, height: 75 }, // Second language - left half
                  { x: 465, y: 100, width: 435, height: 75 }, // Third language - right half
                ];
                const pos = positions[index];

                return (
                  <g key={lang.name}>
                    {/* Card background with gradient border */}
                    <defs>
                      <linearGradient id={`langGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={lang.color || colors.accent} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={lang.color || colors.accent} stopOpacity="0.05" />
                      </linearGradient>
                      <filter id={`langGlow${index}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Main card */}
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      rx="16"
                      fill={`url(#langGradient${index})`}
                      stroke={lang.color || colors.accent}
                      strokeWidth="2"
                    />

                    {/* Decorative corner accent */}
                    <circle
                      cx={pos.x + pos.width - 20}
                      cy={pos.y + 20}
                      r="4"
                      fill={lang.color || colors.accent}
                      opacity="0.6"
                    />
                    <circle
                      cx={pos.x + pos.width - 30}
                      cy={pos.y + 15}
                      r="2.5"
                      fill={lang.color || colors.accent}
                      opacity="0.4"
                    />

                    {/* Rank badge for first language */}
                    {isFirst && (
                      <>
                        <rect
                          x={pos.x + 20}
                          y={pos.y + 15}
                          width="36"
                          height="20"
                          rx="10"
                          fill={lang.color || colors.accent}
                          filter={`url(#langGlow${index})`}
                        />
                        <text
                          x={pos.x + 38}
                          y={pos.y + 29}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="#000000"
                        >
                          #1
                        </text>
                      </>
                    )}

                    {/* Language icon dot with pulse effect */}
                    <circle
                      cx={pos.x + (isFirst ? 75 : 25)}
                      cy={pos.y + (isFirst ? 27 : pos.height / 2)}
                      r="12"
                      fill={lang.color || colors.accent}
                      opacity="0.2"
                    />
                    <circle
                      cx={pos.x + (isFirst ? 75 : 25)}
                      cy={pos.y + (isFirst ? 27 : pos.height / 2)}
                      r="8"
                      fill={lang.color || colors.accent}
                      filter={`url(#langGlow${index})`}
                    />

                    {/* Language name */}
                    <text
                      x={pos.x + (isFirst ? 100 : 50)}
                      y={pos.y + (isFirst ? 32 : pos.height / 2 - 8)}
                      fontSize={isFirst ? "18" : "15"}
                      fontWeight="700"
                      fill={colors.textBold}
                    >
                      {truncate(lang.name, isFirst ? 30 : 20)}
                    </text>

                    {/* Percentage with special styling */}
                    <text
                      x={pos.x + (isFirst ? 100 : 50)}
                      y={pos.y + (isFirst ? 55 : pos.height / 2 + 10)}
                      fontSize={isFirst ? "28" : "22"}
                      fontWeight="700"
                      fill={lang.color || colors.accent}
                      filter={`url(#langGlow${index})`}
                    >
                      {(lang.percent * 100).toFixed(1)}%
                    </text>

                    {/* Visual percentage bar - circular arc for first, line for others */}
                    {isFirst ? (
                      <>
                        {/* Circular progress indicator */}
                        <g transform={`translate(${pos.x + pos.width - 65}, ${pos.y + pos.height / 2})`}>
                          {/* Background circle */}
                          <circle
                            cx="0"
                            cy="0"
                            r="28"
                            fill="none"
                            stroke={colors.border}
                            strokeWidth="6"
                            opacity="0.2"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="0"
                            cy="0"
                            r="28"
                            fill="none"
                            stroke={lang.color || colors.accent}
                            strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 28 * lang.percent} ${2 * Math.PI * 28}`}
                            strokeDashoffset={2 * Math.PI * 28 * 0.25}
                            transform="rotate(-90)"
                            filter={`url(#langGlow${index})`}
                          />
                          {/* Center text */}
                          <text
                            x="0"
                            y="5"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill={colors.subtle}
                          >
                            TOP
                          </text>
                        </g>
                      </>
                    ) : (
                      <>
                        {/* Mini progress bar for 2nd and 3rd */}
                        <rect
                          x={pos.x + 50}
                          y={pos.y + pos.height - 18}
                          width={pos.width - 70}
                          height="6"
                          rx="3"
                          fill={colors.border}
                          opacity="0.2"
                        />
                        <rect
                          x={pos.x + 50}
                          y={pos.y + pos.height - 18}
                          width={(pos.width - 70) * lang.percent}
                          height="6"
                          rx="3"
                          fill={lang.color || colors.accent}
                          filter={`url(#langGlow${index})`}
                        />
                      </>
                    )}

                    {/* Rank indicator for 2nd and 3rd */}
                    {!isFirst && (
                      <text
                        x={pos.x + pos.width - 25}
                        y={pos.y + 25}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fill={lang.color || colors.accent}
                        opacity="0.5"
                      >
                        #{index + 1}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        )}

        {/* TOP REPOSITORY */}
        {topRepo && (
          <g id="topRepo" transform="translate(90, 1040)">
            <text
              x="0"
              y="0"
              fontSize="20"
              fontWeight="700"
              fill={colors.textBold}
            >
              🏆 Top Repository
            </text>

            <rect
              x="0"
              y="25"
              width="900"
              height="90"
              rx="16"
              fill="url(#cardGradient)"
              stroke="url(#accentGradient)"
              strokeWidth="2"
            />

            {/* Repo name */}
            <text
              x="25"
              y="60"
              fontSize="18"
              fontWeight="700"
              fill={colors.textBold}
            >
              {truncate(topRepo.name, 50)}
            </text>

            {/* Stats with icons */}
            <text
              x="25"
              y="88"
              fontSize="14"
              fill={colors.subtle}
            >
              <tspan fill={colors.accent} fontWeight="600">
                💻 {formatNumber(topRepo.contributions)}
              </tspan>
              <tspan fill={colors.subtle}> commits</tspan>
            </text>
            
            <text
              x="250"
              y="88"
              fontSize="14"
              fill={colors.subtle}
            >
              <tspan fill={colors.accent2} fontWeight="600">
                ⭐ {formatNumber(topRepo.stargazers)}
              </tspan>
              <tspan fill={colors.subtle}> stars</tspan>
            </text>
          </g>
        )}

        {/* FOOTER */}
        <g id="footer" transform="translate(0, 1270)">
          <path
            d="M 90 0 Q 270 10, 450 0 T 810 0 Q 900 10, 990 0"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
          <text
            x="540"
            y="32"
            textAnchor="middle"
            fontSize="13"
            fill={colors.subtle}
          >
            ✨ GitHub Unwrapped 2025 ✨
          </text>
        </g>
      </svg>
    );
  }
);

CardRenderer.displayName = 'CardRenderer';

