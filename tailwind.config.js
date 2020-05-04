module.exports = {
  theme: {
    extend: {
      screens: {
        '2xl': '1408px'
      },
      colors: {
        black: '#050505',
        'light-blue': '#f1f8ff',
        gray: {
          default: '#f7f7f9',
          light: '#9194A1',
          lightest: '#EFF0F5',
          '100': '#f5f5f5',
          '200': '#eeeeee',
          '300': '#e0e0e0',
          '400': '#bdbdbd',
          '500': '#9e9e9e',
          '600': '#757575',
          '700': '#616161',
          '800': '#424242',
          '900': '#212121'
        },
        'light-gray': '#525560',
        purple: '#6F42C1',
        red: '#D73A49',
        green: '#28A745',
        orange: {
          default: '#f66a0a',
          '100': '#fff8f2',
          '200': '#eee6d5',
          '300': '#d15704',
          '400': '#a04100'
        },
        blue: {
          default: '#0366D6',
          light: '#d9e8f9'
        },
        pink: '#D03592',
        severity: {
          mild: '#fffdef',
          moderate: '#ffebda',
          aggressive: '#ffdce0'
        },
        severitytext: {
          mild: '#735c0f;',
          moderate: '#a04100',
          aggressive: '#86181d'
        },
        severityhover: {
          mild: '#FFF5B1',
          moderate: '#FFD1AC',
          aggressive: '#FDAEB7'
        }
      },
      spacing: {
        '11': '2.75rem',
        '14': '3.5rem',
        '59': '14.75rem',
        '80': '20rem',
        '102': '25.5rem',
        '128': '32rem'
      },
      maxHeight: {
        '128': '32rem'
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: [
          'Anonymous Pro',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ]
      },
      fontSize: {
        xxs: '0.65rem',
        '3.2xl': '1.25rem',
        '3.25xl': '1.5rem',
        '3.5xl': '2rem'
      }
    }
  }
}
