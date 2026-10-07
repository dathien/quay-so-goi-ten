import React from 'react';

interface FormulaToolbarProps {
  onInsert: (snippet: string) => void;
}

export const FormulaToolbar: React.FC<FormulaToolbarProps> = ({ onInsert }) => {
  const tools = [
    { label: 'x²', snippet: '$x^2$', title: 'Bình phương' },
    { label: 'xⁿ', snippet: '$x^{n}$', title: 'Lũy thừa' },
    { label: '√', snippet: '$\\sqrt{x}$', title: 'Căn bậc hai' },
    { label: 'a/b', snippet: '$\\frac{a}{b}$', title: 'Phân số' },
    { label: '|x|', snippet: '$|x|$', title: 'Giá trị tuyệt đối' },
    { label: '∑', snippet: '$\\sum_{i=1}^{n}$', title: 'Tổng xích-ma' },
    { label: 'lim', snippet: '$\\lim_{x \\to 0}$', title: 'Giới hạn' },
    { label: '∫', snippet: '$\\int_{a}^{b} f(x)\\,dx$', title: 'Tích phân' },
    { label: 'vec', snippet: '$\\vec{AB}$', title: 'Vectơ' },
    { label: 'hệ', snippet: '$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$', title: 'Hệ phương trình' },
    { label: 'ma trận', snippet: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$', title: 'Ma trận' },
    { label: 'π', snippet: '$\\pi$', title: 'Số Pi' },
    { label: 'α', snippet: '$\\alpha$', title: 'Alpha' },
    { label: 'β', snippet: '$\\beta$', title: 'Beta' },
    { label: 'Δ', snippet: '$\\Delta$', title: 'Delta' },
    { label: '∞', snippet: '$\\infty$', title: 'Vô cực' },
    { label: 'H₂O', snippet: '$\\text{H}_2\\text{O}$', title: 'Hóa học: Nước' },
    { label: '→', snippet: '$\\xrightarrow{t^\\circ}$', title: 'Mũi tên phản ứng' },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-slate-950/80 border border-slate-800">
      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mr-1">
        Công thức:
      </span>
      {tools.map((t, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onInsert(t.snippet)}
          title={t.title}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border border-slate-700/60"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
