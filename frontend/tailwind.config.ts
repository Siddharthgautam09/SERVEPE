import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backdropBlur: {
				xs: '2px',
				'3xl': '64px',
			},
			blur: {
				'3xl': '64px',
				'4xl': '128px',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
				'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
				'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
				'3d': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
				'3d-purple': '0 25px 50px rgba(139, 92, 246, 0.3), 0 15px 35px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				blob: {
					'0%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
					'33%': {
						transform: 'translate(30px, -50px) scale(1.1)',
					},
					'66%': {
						transform: 'translate(-20px, 20px) scale(0.9)',
					},
					'100%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				float: {
					'0%, 100%': {
						transform: 'translateY(0px)',
					},
					'50%': {
						transform: 'translateY(-10px)',
					},
				},
				gradient: {
					'0%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					},
					'100%': {
						'background-position': '0% 50%'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						'box-shadow': '0 0 20px rgba(139, 92, 246, 0.3)'
					},
					'50%': {
						'box-shadow': '0 0 40px rgba(139, 92, 246, 0.6)'
					}
				},
				'card-hover': {
					'0%': {
						transform: 'translateY(0) rotateX(0)'
					},
					'100%': {
						transform: 'translateY(-10px) rotateX(5deg)'
					}
				},
				'arrow-move': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(5px)'
					}
				},
				'gradient-shift': {
					'0%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					},
					'100%': {
						'background-position': '0% 50%'
					}
				},
				'spin-3d': {
					'0%': {
						transform: 'rotateY(0deg)'
					},
					'100%': {
						transform: 'rotateY(360deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'blob': 'blob 7s infinite',
				'fade-in': 'fade-in 0.6s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'gradient': 'gradient 3s ease infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'card-hover': 'card-hover 0.3s ease-out',
				'arrow-move': 'arrow-move 0.3s ease-out infinite alternate',
				'gradient-shift': 'gradient-shift 3s ease infinite',
				'spin-3d': 'spin-3d 2s linear infinite'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
				'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
				'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
				'3d': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
