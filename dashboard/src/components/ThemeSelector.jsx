import { useTheme } from '../contexts/ThemeContext';
import { Check, Palette, Moon, Sun } from 'lucide-react';

const THEME_ICONS = { light: Sun, purple: Moon };

export function ThemeSelector() {
    const { currentTheme, themes, switchTheme } = useTheme();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#EBEBEB] pb-3">
                <Palette className="w-5 h-5 text-slate-500" aria-hidden="true" />
                <h3 className="text-base font-bold text-[#222026] m-0">Select Appearance</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(themes).map(([themeKey, theme]) => {
                    const isActive = currentTheme === themeKey;
                    const Icon = THEME_ICONS[themeKey] ?? Moon;

                    return (
                        <div
                            key={themeKey}
                            className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer select-none transition-all duration-250 ${isActive ? 'border-[#A7E46A] bg-[#A7E46A]/5 shadow-sm shadow-[#A7E46A]/10' : 'border-[#EBEBEB] bg-white hover:bg-slate-50'}`}
                            onClick={() => switchTheme(themeKey)}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isActive}
                            aria-label={`Switch to ${theme.name} theme`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    switchTheme(themeKey);
                                }
                            }}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-[#222026] text-[#A7E46A]' : 'bg-slate-100 text-slate-500'}`}>
                                <Icon className="w-5 h-5" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-bold text-[#222026] m-0">{theme.name} Theme</h4>
                                    {isActive && <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />}
                                </div>
                                <p className="text-xs text-slate-500 m-0 mt-1 font-semibold leading-relaxed">{theme.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
