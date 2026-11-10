/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Blessing Hub: warm paper, orange accents and quiet sage neutrals.
        primary: {
          50: '#fff6ef',
          100: '#fbece4',
          200: '#f8cfb9',
          300: '#f4aa87',
          400: '#ef9168',
          500: '#ed7545',
          600: '#bd5129',
          700: '#9e4022',
          800: '#813820',
          900: '#6a3020',
          950: '#39190f'
        },
        gray: {
          50: '#f7f7f3',
          100: '#f1f2eb',
          200: '#e8e9e1',
          300: '#d5d8cc',
          400: '#94998b',
          500: '#747a6e',
          600: '#656b60',
          700: '#4c5547',
          800: '#394133',
          900: '#2c3029',
          950: '#1b2019'
        },
        // 辅助色 - 深蓝灰
        accent: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // 深色模式背景
        dark: {
          50: '#f7f7f3',
          100: '#eef0e8',
          200: '#dce0d4',
          300: '#c3c9bb',
          400: '#a3ad9a',
          500: '#7c8974',
          600: '#56624f',
          700: '#3b4736',
          800: '#293226',
          900: '#20271e',
          950: '#171d16'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        glass: '0 8px 32px rgba(48, 54, 45, 0.04)',
        'glass-sm': '0 4px 16px rgba(48, 54, 45, 0.03)',
        glow: '0 4px 18px rgba(189, 81, 41, 0.1)',
        'glow-lg': '0 8px 28px rgba(189, 81, 41, 0.12)',
        card: '0 3px 18px rgba(48, 54, 45, 0.025)',
        'card-hover': '0 8px 28px rgba(48, 54, 45, 0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #bd5129 0%, #9e4022 100%)',
        'gradient-dark': 'linear-gradient(135deg, #293226 0%, #20271e 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(237, 117, 69, 0.04) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124, 137, 116, 0.04) 0px, transparent 50%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 12px rgba(189, 81, 41, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(189, 81, 41, 0.15)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
