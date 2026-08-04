import React, { useState } from "react";
import {
  BrainCircuit, PlayCircle, BookOpen, Clock, Settings, Zap, Target,
  Users, Video, Sparkles, Layers, ShieldCheck, Mail, ArrowRight, CheckCircle2, Globe, Phone
} from "lucide-react";

type Lang = "uz" | "ru" | "en";

const t = {
  uz: {
    nav: { home: "Bosh sahifa", problem: "Muammo", product: "Mahsulot", team: "Jamoa", login: "Tizimga kirish", start: "Boshlash" },
    hero: { badge: "AI-Powered Education", title1: "O'qituvchilar va Talabalar uchun ", title2: "AI-asosidagi", title3: " ta'lim platformasi", desc: "Missiya: Ta'lim jarayonini raqamlashtirish, qiziqarli video darsliklarni bir necha soniyada yaratish va o'quvchilarga interaktiv bilimlarni ulashish.", tryBtn: "Platformani sinab ko'rish", processing: "Video Generatsiya", status: "Holati", saved: "Tejalgan vaqt", approved: "Tasdiqlangan", time: "4.5 soat" },
    intro: { badge: "Biz bilan tanishing", title: "Tanishuv", desc: "An'anaviy darslik yaratish o'qituvchidan juda ko'p vaqt va texnik bilim talab qiladi. Bizning AI bu muammoni to'liq hal etadi.", oldSystem: "An'anaviy tizimda:", old1: "Ssenariy yozish uchun soatlab vaqt ketadi", old2: "Professional video montaj dasturlarini o'rganish kerak", old3: "Sifatli ovoz yozish uchun qimmat uskunalar kerak", newSystem: "AxioMath da:", new1: "AI matnni avtomatik ssenariyga aylantiradi", new2: "1 klikda tayyor chiroyli video yaratiladi", new3: "Insondek gapiruvchi realistik AI ovozlar" },
    problem: { badge: "Muammolar", title: "Ta'limdagi asosiy qiyinchiliklar", desc: "Hozirgi kunda o'quvchilarga vizual, qiziqarli ma'lumotlarni yetkazib berish juda mashaqqatli jarayon.", items: [
      { id: 1, title: "Texnik bilim yetishmasligi", desc: "Aksariyat o'qituvchilar video tahrirlash dasturlarini bilmaydi" },
      { id: 2, title: "Vaqtning kamligi", desc: "Bitta 5 daqiqalik darslik uchun kunlab vaqt sarflanishi" },
      { id: 3, title: "O'quvchilar e'tibori", desc: "Zerkarlilik sabab o'quvchilar darsni to'liq ko'rmaydi" },
      { id: 4, title: "Qimmatbaho resurslar", desc: "Studiya, kamera va ovoz yozish uskunalari qimmatligi" },
      { id: 5, title: "Eskirgan yondashuv", desc: "Hamon faqat matn va rasmsiz ma'ruzalarga tayanish" }
    ] },
    product: { title: "Bizning AI yechimimiz", step1: "Matn kiritish", step2: "AI Ssenariy", step3: "Video Generatsiya", models: "ML MODELLARI", result: "AXIOMATH NATIJASI" },
    team: { title: "Loyihani yaraturuvchilar jamoasi", members: [
      { name: "Ahror Sulaymonov", role: "CEO va Asoschi", desc: "Sun'iy intellekt bo'yicha mutaxassis" },
      { name: "Tez kunda...", role: "Hammuassis", desc: "Jamoamiz kengaymoqda" }
    ] },
    footer: { desc: "Ta'lim uchun mo'ljallangan ilg'or sun'iy intellekt platformasi. O'qituvchi va talabalar uchun video darsliklar yaratishning eng oson yo'li.", menus: "Menyular", contact: "Aloqa", rights: "Barcha huquqlar himoyalangan." }
  },
  ru: {
    nav: { home: "Главная", problem: "Проблема", product: "Продукт", team: "Команда", login: "Войти", start: "Начать" },
    hero: { badge: "AI-Powered Образование", title1: "Образовательная платформа на ", title2: "базе ИИ", title3: " для учителей и студентов", desc: "Миссия: Оцифровать учебный процесс, создать увлекательные видеоуроки за считанные секунды и делиться интерактивными знаниями.", tryBtn: "Попробовать платформу", processing: "Генерация Видео", status: "Статус", saved: "Сэкономленное время", approved: "Одобрено", time: "4.5 часов" },
    intro: { badge: "О нас", title: "Знакомство", desc: "Создание традиционных уроков требует много времени и технических навыков. Наш ИИ полностью решает эту проблему.", oldSystem: "Традиционная система:", old1: "Написание сценария занимает часы", old2: "Нужно изучать профессиональные программы", old3: "Дорогое оборудование для звука", newSystem: "В AxioMath:", new1: "ИИ автоматически превращает текст в сценарий", new2: "Красивое видео за 1 клик", new3: "Реалистичные голоса ИИ" },
    problem: { badge: "Проблемы", title: "Основные трудности в образовании", desc: "В настоящее время предоставление визуальной, интересной информации учащимся — очень трудоемкий процесс.", items: [
      { id: 1, title: "Нехватка технических знаний", desc: "Большинство учителей не знают программ видеомонтажа" },
      { id: 2, title: "Нехватка времени", desc: "Один 5-минутный урок занимает дни" },
      { id: 3, title: "Внимание учеников", desc: "Из-за скуки ученики не смотрят уроки полностью" },
      { id: 4, title: "Дорогие ресурсы", desc: "Студия, камера и оборудование стоят дорого" },
      { id: 5, title: "Устаревший подход", desc: "Опора только на текстовые лекции без картинок" }
    ] },
    product: { title: "Наше ИИ-решение", step1: "Ввод текста", step2: "ИИ Сценарий", step3: "Генерация Видео", models: "ML МОДЕЛИ", result: "РЕЗУЛЬТАТ AXIOMATH" },
    team: { title: "Команда создателей", members: [
      { name: "Ahror Sulaymonov", role: "CEO и Основатель", desc: "Специалист по ИИ" },
      { name: "Скоро...", role: "Сооснователь", desc: "Наша команда расширяется" }
    ] },
    footer: { desc: "Передовая ИИ-платформа для образования. Самый простой способ создавать видеоуроки.", menus: "Меню", contact: "Контакты", rights: "Все права защищены." }
  },
  en: {
    nav: { home: "Home", problem: "Problem", product: "Product", team: "Team", login: "Log in", start: "Get Started" },
    hero: { badge: "AI-Powered Education", title1: "AI-powered educational platform for ", title2: "Teachers", title3: " and Students", desc: "Mission: Digitalize the educational process, create engaging video lessons in seconds, and share interactive knowledge.", tryBtn: "Try the Platform", processing: "Video Generation", status: "Status", saved: "Time Saved", approved: "Approved", time: "4.5 hours" },
    intro: { badge: "Meet Us", title: "Introduction", desc: "Creating traditional lessons takes a lot of time and technical skills. Our AI completely solves this problem.", oldSystem: "Traditional system:", old1: "Writing a script takes hours", old2: "Need to learn professional video software", old3: "Expensive equipment for quality sound", newSystem: "In AxioMath:", new1: "AI automatically turns text into a script", new2: "Ready-made beautiful video in 1 click", new3: "Human-like realistic AI voices" },
    problem: { badge: "Problems", title: "Main Challenges in Education", desc: "Currently, delivering visual, engaging information to students is a very difficult process.", items: [
      { id: 1, title: "Lack of technical skills", desc: "Most teachers don't know video editing software" },
      { id: 2, title: "Lack of time", desc: "A single 5-minute lesson takes days to create" },
      { id: 3, title: "Student attention", desc: "Due to boredom, students don't watch lessons fully" },
      { id: 4, title: "Expensive resources", desc: "Studio, camera, and sound equipment are expensive" },
      { id: 5, title: "Outdated approach", desc: "Still relying only on text lectures without images" }
    ] },
    product: { title: "Our AI Solution", step1: "Text Input", step2: "AI Script", step3: "Video Generation", models: "ML MODELS", result: "AXIOMATH RESULT" },
    team: { title: "Project Creators Team", members: [
      { name: "Ahror Sulaymonov", role: "CEO & Founder", desc: "AI Specialist" },
      { name: "Coming soon...", role: "Co-founder", desc: "Our team is expanding" }
    ] },
    footer: { desc: "Advanced AI platform designed for education. The easiest way to create video lessons.", menus: "Menus", contact: "Contact", rights: "All rights reserved." }
  }
};

const ICONS = [Settings, Clock, PlayCircle, ShieldCheck, Layers];
const COLORS = [
  "bg-orange-50 text-orange-600",
  "bg-red-50 text-red-600",
  "bg-amber-50 text-amber-600",
  "bg-pink-50 text-pink-600",
  "bg-rose-50 text-rose-600"
];

export default function App() {
  const [lang, setLang] = useState<Lang>("uz");
  const d = t[lang];

  const onLoginClick = () => {
    window.location.href = "https://app.axiomath.tech";
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-violet-200">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-600">
            <img src="/logo.png" alt="AxioMath Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">
              AxioMath
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#bosh-sahifa" className="hover:text-violet-600 transition-colors">{d.nav.home}</a>
            <a href="#muammo" className="hover:text-violet-600 transition-colors">{d.nav.problem}</a>
            <a href="#mahsulot" className="hover:text-violet-600 transition-colors">{d.nav.product}</a>
            <a href="#jamoa" className="hover:text-violet-600 transition-colors">{d.nav.team}</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-slate-200 rounded-md p-1 bg-white mr-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Lang)}
                className="bg-transparent border-none text-xs font-bold outline-none cursor-pointer uppercase text-slate-700"
              >
                <option value="uz">UZ</option>
                <option value="ru">RU</option>
                <option value="en">EN</option>
              </select>
            </div>
            <button
              onClick={onLoginClick}
              className="hidden sm:block text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors px-3 py-2"
            >
              {d.nav.login}
            </button>
            <button
              onClick={onLoginClick}
              className="text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 px-5 py-2 rounded-full transition-all shadow-sm shadow-violet-200"
            >
              {d.nav.start}
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 overflow-hidden">
        {/* HERO SECTION */}
        <section id="bosh-sahifa" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100/50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> {d.hero.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              {d.hero.title1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                {d.hero.title2}
              </span>{" "}
              {d.hero.title3}
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {d.hero.desc}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onLoginClick}
                className="bg-violet-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center gap-2"
              >
                {d.hero.tryBtn} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-100 to-amber-50 rounded-full blur-3xl opacity-60"></div>
            <div className="relative bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{d.hero.processing}</h3>
                    <p className="text-xs text-slate-500">Processing: 95% completed</p>
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
                    <p className="text-xs text-slate-500 mb-1">{d.hero.status}</p>
                    <p className="font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {d.hero.approved}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">{d.hero.saved}</p>
                    <p className="font-semibold text-violet-600 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> {d.hero.time}
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
              <Users className="w-3.5 h-3.5" /> {d.intro.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{d.intro.title}</h2>
            <p className="text-slate-600 mb-12">{d.intro.desc}</p>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-left grid md:grid-cols-2 gap-8 shadow-sm">
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 text-lg border-b border-slate-200 pb-3">{d.intro.oldSystem}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">✕</div>
                    {d.intro.old1}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">✕</div>
                    {d.intro.old2}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">✕</div>
                    {d.intro.old3}
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-violet-700 text-lg border-b border-violet-100 pb-3">{d.intro.newSystem}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">✓</div>
                    {d.intro.new1}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">✓</div>
                    {d.intro.new2}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">✓</div>
                    {d.intro.new3}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section id="muammo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-4">
              <Target className="w-3.5 h-3.5" /> {d.problem.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{d.problem.title}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">{d.problem.desc}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {d.problem.items.map((item, index) => {
              const Icon = ICONS[index];
              const colorClass = COLORS[index];
              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                      #{item.id}
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SOLUTION FLOWCHART */}
        <section id="mahsulot" className="py-20 bg-violet-900 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">{d.product.title}</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-48">
                <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="font-medium text-sm">{d.product.step1}</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/30"></div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-48">
                <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="font-medium text-sm">{d.product.step2}</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/30"></div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-48">
                <Video className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                <p className="font-medium text-sm">{d.product.step3}</p>
              </div>
            </div>
            <div className="w-px h-16 bg-white/30 mx-auto mb-8"></div>
            <div className="bg-violet-600 border border-violet-400 p-8 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-2xl shadow-violet-900/50 mb-8 relative">
              <div className="absolute inset-0 rounded-full border border-violet-400 animate-ping opacity-20"></div>
              <img src="/logo.png" alt="Logo" className="w-12 h-12 mb-2 object-contain filter brightness-0 invert" />
              <p className="font-bold tracking-widest text-sm">{d.product.models}</p>
            </div>
            <div className="w-px h-16 bg-white/30 mx-auto mb-8"></div>
            <div className="bg-white text-violet-900 py-4 px-8 rounded-xl font-bold text-lg inline-block shadow-xl">
              {d.product.result}
            </div>
          </div>
        </section>

        {/* FEATURES / TEAM */}
        <section id="jamoa" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">{d.team.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {d.team.members.map((member, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <img
                    src={`https://ui-avatars.com/api/?name=${member.name.substring(0,2)}&background=${['6366f1','ec4899','8b5cf6','10b981'][i]}&color=fff`}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50"
                  />
                  <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                  <p className="text-violet-600 text-sm font-medium mb-3">{member.role}</p>
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
                <img src="/logo.png" alt="AxioMath Logo" className="w-6 h-6 object-contain" />
                <span className="text-lg font-bold">AxioMath</span>
              </div>
              <p className="text-sm">{d.footer.desc}</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{d.footer.menus}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#bosh-sahifa" className="hover:text-white transition-colors">{d.nav.home}</a></li>
                <li><a href="#muammo" className="hover:text-white transition-colors">{d.nav.problem}</a></li>
                <li><a href="#mahsulot" className="hover:text-white transition-colors">{d.nav.product}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{d.footer.contact}</h4>
              <a href="tel:+998500082310" className="text-sm flex items-center gap-2 mb-2 hover:text-white transition-colors cursor-pointer">
                <Phone className="w-4 h-4" /> +998 (50) 008 23 10
              </a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>© 2026 AxioMath. {d.footer.rights}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
