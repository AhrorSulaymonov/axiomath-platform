import {
  BrainCircuit,
  PlayCircle,
  BookOpen,
  Clock,
  Settings,
  Zap,
  Target,
  Users,
  Video,
  Sparkles,
  Layers,
  ShieldCheck,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function App() {
  const onLoginClick = () => {
    window.location.href = "https://app.axiomath.tech";
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-violet-200">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-600">
            <BrainCircuit className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">
              Education AI
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a
              href="#bosh-sahifa"
              className="hover:text-violet-600 transition-colors"
            >
              Bosh sahifa
            </a>
            <a
              href="#muammo"
              className="hover:text-violet-600 transition-colors"
            >
              Muammo
            </a>
            <a
              href="#mahsulot"
              className="hover:text-violet-600 transition-colors"
            >
              Mahsulot
            </a>
            <a
              href="#jamoa"
              className="hover:text-violet-600 transition-colors"
            >
              Jamoa
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors px-3 py-2"
            >
              Tizimga kirish
            </button>
            <button
              onClick={onLoginClick}
              className="text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 px-5 py-2 rounded-full transition-all shadow-sm shadow-violet-200"
            >
              Boshlash
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 overflow-hidden">
        {/* HERO SECTION */}
        <section
          id="bosh-sahifa"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100/50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Education
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              O'qituvchilar va Talabalar uchun{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                AI-asosidagi
              </span>{" "}
              ta'lim platformasi
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Missiya: Ta'lim jarayonini raqamlashtirish, qiziqarli video
              darsliklarni bir necha soniyada yaratish va o'quvchilarga
              interaktiv bilimlarni ulashish.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onLoginClick}
                className="bg-violet-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center gap-2"
              >
                Platformani sinab ko'rish <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-100 to-amber-50 rounded-full blur-3xl opacity-60"></div>
            <div className="relative bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Video Generatsiya
                    </h3>
                    <p className="text-xs text-slate-500">
                      Processing: 95% completed
                    </p>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 font-bold text-sm">95%</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 w-[95%]"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <p className="font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Approved
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Time Saved</p>
                    <p className="font-semibold text-violet-600 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> 4.5 soat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4">
              <Users className="w-3.5 h-3.5" /> Biz bilan tanishing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Tanishuv
            </h2>
            <p className="text-slate-600 mb-12">
              An'anaviy darslik yaratish o'qituvchidan juda ko'p vaqt va texnik
              bilim talab qiladi. Bizning AI bu muammoni to'liq hal etadi.
            </p>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-left grid md:grid-cols-2 gap-8 shadow-sm">
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 text-lg border-b border-slate-200 pb-3">
                  An'anaviy tizimda:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      ✕
                    </div>
                    Ssenariy yozish uchun soatlab vaqt ketadi
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      ✕
                    </div>
                    Professional video montaj dasturlarini o'rganish kerak
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      ✕
                    </div>
                    Sifatli ovoz yozish uchun qimmat uskunalar kerak
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-violet-700 text-lg border-b border-violet-100 pb-3">
                  Education AI da:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    AI matnni avtomatik ssenariyga aylantiradi
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    1 klikda tayyor chiroyli video yaratiladi
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    Insondek gapiruvchi realistik AI ovozlar
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section
          id="muammo"
          className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-4">
              <Target className="w-3.5 h-3.5" /> Muammolar
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ta'limdagi asosiy qiyinchiliklar
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hozirgi kunda o'quvchilarga vizual, qiziqarli ma'lumotlarni
              yetkazib berish juda mashaqqatli jarayon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: "Texnik bilim yetishmasligi",
                desc: "Aksariyat o'qituvchilar video tahrirlash dasturlarini bilmaydi",
                icon: Settings,
                color: "bg-orange-50 text-orange-600",
              },
              {
                id: 2,
                title: "Vaqtning kamligi",
                desc: "Bitta 5 daqiqalik darslik uchun kunlab vaqt sarflanishi",
                icon: Clock,
                color: "bg-red-50 text-red-600",
              },
              {
                id: 3,
                title: "O'quvchilar e'tibori",
                desc: "Zerkarlilik sabab o'quvchilar darsni to'liq ko'rmaydi",
                icon: PlayCircle,
                color: "bg-amber-50 text-amber-600",
              },
              {
                id: 4,
                title: "Qimmatbaho resurslar",
                desc: "Studiya, kamera va ovoz yozish uskunalari qimmatligi",
                icon: ShieldCheck,
                color: "bg-pink-50 text-pink-600",
              },
              {
                id: 5,
                title: "Eskirgan yondashuv",
                desc: "Hamon faqat matn va rasmsiz ma'ruzalarga tayanish",
                icon: Layers,
                color: "bg-rose-50 text-rose-600",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    #{item.id}
                  </span>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.color}`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SOLUTION FLOWCHART */}
        <section id="mahsulot" className="py-20 bg-violet-900 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">
              Bizning AI yechimimiz
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-48">
                <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="font-medium text-sm">Matn kiritish</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/30"></div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-48">
                <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="font-medium text-sm">AI Ssenariy</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/30"></div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-48">
                <Video className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                <p className="font-medium text-sm">Video Generatsiya</p>
              </div>
            </div>

            <div className="w-px h-16 bg-white/30 mx-auto mb-8"></div>

            <div className="bg-violet-600 border border-violet-400 p-8 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-2xl shadow-violet-900/50 mb-8 relative">
              <div className="absolute inset-0 rounded-full border border-violet-400 animate-ping opacity-20"></div>
              <BrainCircuit className="w-12 h-12 text-white mb-2" />
              <p className="font-bold tracking-widest text-sm">ML MODELLARI</p>
            </div>

            <div className="w-px h-16 bg-white/30 mx-auto mb-8"></div>

            <div className="bg-white text-violet-900 py-4 px-8 rounded-xl font-bold text-lg inline-block shadow-xl">
              EDUCATION AI NATIJASI
            </div>
          </div>
        </section>

        {/* FEATURES / TEAM */}
        <section id="jamoa" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">
              Loyihani yaraturuvchilar jamoasi
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Ahror Sulaymonov",
                  role: "CEO va Asoschi",
                  desc: "Sun'iy intellekt bo'yicha mutaxassis",
                  img: "https://ui-avatars.com/api/?name=Ahror&background=6366f1&color=fff",
                },
                {
                  name: "Jamoa A'zosi",
                  role: "AI Muhandis",
                  desc: "Machine Learning bo'yicha ekspert",
                  img: "https://ui-avatars.com/api/?name=AI&background=ec4899&color=fff",
                },
                {
                  name: "Jamoa A'zosi",
                  role: "Frontend Dasturchi",
                  desc: "React va Next.js ustasi",
                  img: "https://ui-avatars.com/api/?name=Dev&background=8b5cf6&color=fff",
                },
                {
                  name: "Jamoa A'zosi",
                  role: "Mahsulot Menejeri",
                  desc: "Foydalanuvchi tajribasi (UX)",
                  img: "https://ui-avatars.com/api/?name=PM&background=10b981&color=fff",
                },
              ].map((member, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50"
                  />
                  <h3 className="font-bold text-slate-900 text-lg">
                    {member.name}
                  </h3>
                  <p className="text-violet-600 text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-slate-500 text-sm">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <BrainCircuit className="w-6 h-6" />
                <span className="text-lg font-bold">Education AI</span>
              </div>
              <p className="text-sm">
                Ta'lim uchun mo'ljallangan ilg'or sun'iy intellekt platformasi.
                O'qituvchi va talabalar uchun video darsliklar yaratishning eng
                oson yo'li.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Menyular</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#bosh-sahifa"
                    className="hover:text-white transition-colors"
                  >
                    Bosh sahifa
                  </a>
                </li>
                <li>
                  <a
                    href="#muammo"
                    className="hover:text-white transition-colors"
                  >
                    Muammo
                  </a>
                </li>
                <li>
                  <a
                    href="#mahsulot"
                    className="hover:text-white transition-colors"
                  >
                    Mahsulot
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Aloqa</h4>
              <p className="text-sm flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" /> info@education-ai.app
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>© 2026 Education AI. Barcha huquqlar himoyalangan.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
