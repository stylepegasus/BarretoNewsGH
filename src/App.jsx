import React, { useState, useEffect } from 'react';
import {
  Menu, X, Mail, ChevronRight, Share2,
  Info, ArrowRight, ShieldCheck, CheckCircle2,
  Instagram, MessageCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';

/* --- SISTEMA DE DESIGN & TOKENS ---
  Paleta derivada da imagem enviada:
  Ouro Principal: #b4832d
  Marrom Escuro: #6c3805
  Beige Claro: #dec8a6
  Beige Médio: #a18865
  Background: #fdfbf7 (Off-white quente para leitura)
*/

const theme = {
  colors: {
    gold: '#b4832d',
    goldLight: '#dec8a6',
    brown: '#6c3805',
    bg: '#fdfbf7',
    glass: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    textMain: '#1a1a1a',
    textMuted: '#525252',
  }
};

// --- MOCK DATA (Conteúdo de Exemplo) ---

const articles = [
  {
    id: 1,
    category: "Mundo",
    readTime: "3 min",
    title: "A nova lei da Europa que pode mudar seu WhatsApp",
    excerpt: "Bruxelas decidiu apertar o cerco contra as big techs. Mas o que isso muda na sua mensagem de bom dia no grupo da família?",
    content: `
      <p>Sabe quando você envia uma mensagem e ela chega instantaneamente? A União Europeia quer garantir que isso continue acontecendo, mas com mais privacidade e menos monopólio.</p>
      
      <h3>O que está acontecendo?</h3>
      <p>Basicamente, a nova Lei de Mercados Digitais (DMA) entrou em vigor. Ela obriga gigantes como Meta (dona do WhatsApp) e Apple a "abrirem seus portões".</p>
      
      <h3>O que isso significa para você?</h3>
      <p>Em teoria, você poderia mandar uma mensagem do WhatsApp para alguém que só usa o Telegram. É a chamada "interoperabilidade". Parece mágico, mas a segurança é o grande debate.</p>
      
      <div class="bg-orange-50 p-6 rounded-2xl my-6 border border-orange-100">
        <h4 class="text-[#b4832d] font-bold mb-2 flex items-center gap-2">
          <span class="text-xl">⚖️</span> Visão Jurídica Simples
        </h4>
        <p class="text-sm text-gray-700">Não é só tecnologia, é sobre <strong>concorrência leal</strong>. O objetivo jurídico é evitar que uma única empresa controle toda a comunicação. Se isso chegar ao Brasil, as regras do Marco Civil da Internet serão testadas.</p>
      </div>

      <p>Por enquanto, a mudança é só lá fora. Mas como tudo na internet, as fronteiras são invisíveis. Fique de olho.</p>
    `,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    category: "Brasil",
    readTime: "4 min",
    title: "Imposto de Renda: O Leão está mais digital (e faminto)",
    excerpt: "A Receita Federal cruzou dados de PIX, cartão e cripto. Veja como não cair na malha fina sem querer.",
    content: "Conteúdo simulado sobre IR e cruzamento de dados...",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    category: "Tecnologia",
    readTime: "2 min",
    title: "Inteligência Artificial vs. Direitos Autorais",
    excerpt: "Artistas estão processando criadores de IA. Quem é o dono da arte feita por robô?",
    content: "Conteúdo simulado sobre IA...",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop"
  }
];

// --- COMPONENTES UI REUTILIZÁVEIS ---

const GlassCard = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/60 backdrop-blur-xl border border-white/60 
      shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] 
      transition-all duration-300 hover:shadow-[0_8px_30px_rgb(180,131,45,0.15)]
      hover:scale-[1.01] active:scale-[0.99]
      ${className}
    `}
  >
    {children}
  </div>
);

const Button = ({ children, primary = false, full = false, onClick, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className={`
      h-12 px-8 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2
      ${full ? 'w-full' : ''}
      ${primary
        ? 'bg-gradient-to-r from-[#b4832d] to-[#d4a045] text-white shadow-lg hover:shadow-xl hover:brightness-110'
        : 'bg-white/80 text-[#6c3805] hover:bg-white border border-[#dec8a6]'}
    `}
  >
    {children}
  </button>
);

const Badge = ({ children }) => (
  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#dec8a6]/30 text-[#6c3805] border border-[#dec8a6]/50">
    {children}
  </span>
);

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b4832d] to-[#6c3805] flex items-center justify-center shadow-md text-white font-serif font-bold text-xl border border-[#dec8a6]">
      B
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-serif text-lg text-[#6c3805] font-bold tracking-tight">Barreto</span>
      <span className="font-sans text-xs text-[#b4832d] font-semibold tracking-[0.2em] uppercase">News</span>
    </div>
  </div>
);

// --- COMPONENTES DA PÁGINA ---

const NewsletterForm = ({ location = "hero" }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation code for Postgres
          setErrorMessage("Este e-mail já está inscrito.");
          setStatus("error");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setErrorMessage("Erro ao inscrever. Tente novamente.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 animate-fade-in">
        <CheckCircle2 className="text-green-600 w-6 h-6" />
        <div className="text-left">
          <p className="font-bold text-green-800 text-sm">Inscrição confirmada!</p>
          <p className="text-green-700 text-xs">Fique de olho na sua caixa de entrada.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative group">
      <div className="relative flex items-center">
        <Mail className="absolute left-4 text-[#b4832d] w-5 h-5 transition-colors group-focus-within:text-[#6c3805]" />
        <input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-14 pl-12 pr-36 rounded-full bg-white/80 backdrop-blur-md border border-[#dec8a6] focus:border-[#b4832d] focus:ring-2 focus:ring-[#b4832d]/20 outline-none transition-all placeholder:text-gray-400 text-gray-800"
        />
        <div className="absolute right-1 top-1 bottom-1">
          <Button primary type="submit">
            {status === "loading" ? "..." : "Inscrever"}
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 text-center">
        Junte-se a 5.000+ leitores inteligentes. <span className="opacity-70">Grátis. Sem spam.</span>
      </p>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500 text-center animate-fade-in">
          {errorMessage}
        </p>
      )}
    </form>

  );
};

// --- PÁGINAS ---

const HomePage = ({ navigateToArticle }) => (
  <div className="space-y-16 pb-20">
    {/* HERO SECTION */}
    <section className="pt-8 px-4 flex flex-col items-center text-center">
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-[#dec8a6] backdrop-blur-sm shadow-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-xs font-medium text-[#6c3805]">Edição de hoje já disponível</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#6c3805] mb-6 leading-tight">
        Notícias que importam,<br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b4832d] to-[#d4a045]">
          sem "juridiquês".
        </span>
      </h1>

      <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
        Uma curadoria inteligente dos fatos mais polêmicos do Brasil e do mundo, com uma pitada de análise jurídica simplificada. Direto no seu e-mail, toda manhã.
      </p>

      <NewsletterForm location="hero" />
    </section>

    {/* COMO FUNCIONA (Trust) */}
    <section className="px-4">
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {[
          { icon: Mail, title: "Curadoria Diária", text: "Nós lemos tudo e selecionamos apenas o que muda a sua vida." },
          { icon: ShieldCheck, title: "Sem Fake News", text: "Fatos verificados com a seriedade da Barreto Advocacia." },
          { icon: MessageCircle, title: "Linguagem Simples", text: "Explicamos o complexo como se fosse uma conversa de bar." }
        ].map((item, idx) => (
          <GlassCard key={idx} className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#fdfbf7] flex items-center justify-center mb-4 text-[#b4832d] shadow-inner">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-[#6c3805] mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
          </GlassCard>
        ))}
      </div>
    </section>

    {/* DESTAQUES (Feed) */}
    <section className="px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-bold text-[#6c3805]">Em Alta</h2>
        <button className="text-[#b4832d] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          Ver tudo <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <GlassCard key={article.id} className="overflow-hidden group cursor-pointer flex flex-col h-full" onClick={() => navigateToArticle(article)}>
            <div className="h-48 overflow-hidden relative">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-3 left-3">
                <Badge>{article.category}</Badge>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                ⏱ {article.readTime} de leitura
              </p>
              <h3 className="font-serif font-bold text-xl text-[#1a1a1a] mb-3 leading-snug group-hover:text-[#b4832d] transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                {article.excerpt}
              </p>
              <div className="pt-4 border-t border-gray-100 flex items-center text-[#b4832d] text-sm font-semibold">
                Ler notícia completa
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>

    {/* AUTHORITY BLOCK */}
    <section className="px-4">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#3a2a1a] rounded-[2.5rem] p-8 md:p-12 text-center md:text-left md:flex items-center gap-10 shadow-2xl relative overflow-hidden">
        {/* Abstract shapes bg */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b4832d] opacity-10 blur-[80px] rounded-full"></div>

        <div className="relative z-10 flex-1">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
            Jornalismo com a credibilidade <br /> <span className="text-[#dec8a6]">Barreto Advocacia.</span>
          </h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            O Barreto News é uma iniciativa para democratizar a informação. Entenda seus direitos e o mundo ao seu redor sem precisar de um dicionário.
          </p>
          <button className="text-white border-b border-[#b4832d] pb-0.5 hover:text-[#b4832d] transition-colors text-sm">
            Conheça o escritório pai
          </button>
        </div>
        <div className="relative z-10 mt-8 md:mt-0">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#b4832d] rounded-full flex items-center justify-center text-4xl font-serif text-white shadow-lg mx-auto">
            B
          </div>
        </div>
      </div>
    </section>
  </div>
);

const ArticlePage = ({ article, onBack }) => (
  <div className="max-w-3xl mx-auto px-4 pb-20 pt-4 animate-fade-in-up">
    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#b4832d] mb-6 transition-colors">
      <ChevronRight className="w-5 h-5 rotate-180" /> Voltar
    </button>

    <Badge>{article.category}</Badge>

    <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1a1a1a] mt-4 mb-6 leading-tight">
      {article.title}
    </h1>

    <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 border-b border-gray-200 pb-8">
      <span>Por <strong>Redação Barreto</strong></span>
      <span>•</span>
      <span>{article.readTime} de leitura</span>
      <div className="flex-grow"></div>
      <button className="p-2 rounded-full hover:bg-gray-100"><Share2 className="w-5 h-5" /></button>
    </div>

    <img src={article.image} alt={article.title} className="w-full h-64 md:h-96 object-cover rounded-3xl mb-10 shadow-lg" />

    {/* ARTICLE CONTENT */}
    <div
      className="prose prose-lg prose-headings:font-serif prose-headings:text-[#6c3805] prose-p:text-gray-600 prose-a:text-[#b4832d] max-w-none"
      dangerouslySetInnerHTML={{ __html: article.content }}
    />

    {/* MID-ARTICLE CAPTURE */}
    <div className="my-12 p-8 rounded-3xl bg-[#dec8a6]/20 border border-[#dec8a6]/50 text-center">
      <h3 className="font-serif font-bold text-xl text-[#6c3805] mb-2">Gostou desse conteúdo?</h3>
      <p className="text-sm text-gray-600 mb-6">Receba análises como esta toda manhã. É grátis.</p>
      <div className="max-w-xs mx-auto">
        <NewsletterForm location="article" />
      </div>
    </div>
  </div>
);

const LegalPage = ({ title, content }) => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-serif font-bold text-[#6c3805] mb-8">{title}</h1>
    <div className="prose text-gray-600 text-sm">
      {content}
      <p className="italic mt-8 text-gray-400">Última atualização: Fevereiro 2026</p>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="max-w-2xl mx-auto px-4 py-12 text-center">
    <h1 className="text-4xl font-serif font-bold text-[#6c3805] mb-4">Fale Conosco</h1>
    <p className="text-gray-600 mb-12">Dúvidas, sugestões ou apenas um "olá". Estamos ouvindo.</p>

    <div className="space-y-4">
      <GlassCard className="p-6 flex items-center gap-4 text-left">
        <div className="p-3 rounded-full bg-orange-100 text-[#b4832d]"><Mail /></div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold">Email Principal</p>
          <a href="mailto:paulo@advocaciabarreto.com" className="text-lg font-medium hover:text-[#b4832d]">paulo@advocaciabarreto.com</a>
        </div>
      </GlassCard>

      <GlassCard className="p-6 flex items-center gap-4 text-left">
        <div className="p-3 rounded-full bg-orange-100 text-[#b4832d]"><Mail /></div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold">Suporte</p>
          <a href="mailto:barretoadvocacia01@gmail.com" className="text-lg font-medium hover:text-[#b4832d]">barretoadvocacia01@gmail.com</a>
        </div>
      </GlassCard>

      <GlassCard className="p-6 flex items-center gap-4 text-left">
        <div className="p-3 rounded-full bg-green-100 text-green-700"><MessageCircle /></div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold">WhatsApp</p>
          <a href="https://wa.me/5561992657044" className="text-lg font-medium hover:text-green-700">+55 61 99265-7044</a>
        </div>
      </GlassCard>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // home, article, contact, privacy
  const [currentArticle, setCurrentArticle] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const openArticle = (article) => {
    setCurrentArticle(article);
    setCurrentPage('article');
    window.scrollTo(0, 0);
  };

  // --- RENDERIZADOR DE PÁGINAS ---
  const renderContent = () => {
    switch (currentPage) {
      case 'home': return <HomePage navigateToArticle={openArticle} />;
      case 'article': return <ArticlePage article={currentArticle} onBack={() => setCurrentPage('home')} />;
      case 'contact': return <ContactPage />;
      case 'privacy': return <LegalPage title="Política de Privacidade" content={<p>Respeitamos seus dados. Seguimos rigorosamente a LGPD. Seus e-mails são usados exclusivamente para o envio da newsletter.</p>} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] font-sans selection:bg-[#b4832d] selection:text-white">
      {/* BACKGROUND MESH GRADIENT (Visual Effect) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dec8a6] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#b4832d] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-[#e8dcc8] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <button onClick={() => navigateTo('home')} className="hover:opacity-80 transition-opacity">
            <Logo />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigateTo('home')} className="text-sm font-medium hover:text-[#b4832d] transition-colors">Início</button>
            <button onClick={() => navigateTo('contact')} className="text-sm font-medium hover:text-[#b4832d] transition-colors">Contato</button>
            <Button onClick={() => document.querySelector('input[type="email"]')?.focus()} primary>
              Inscrever-se
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-[#6c3805]" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#fdfbf7]/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <button className="absolute top-6 right-6 p-2" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-8 h-8 text-[#6c3805]" />
          </button>

          <Logo />

          <div className="flex flex-col items-center gap-6 text-xl font-serif font-bold text-[#6c3805]">
            <button onClick={() => navigateTo('home')}>Início</button>
            <button onClick={() => navigateTo('contact')}>Fale Conosco</button>
            <button onClick={() => navigateTo('privacy')}>Privacidade</button>
          </div>

          <div className="w-64">
            <Button full primary onClick={() => {
              setMobileMenuOpen(false);
              // scroll to top logic handled by page change
            }}>
              Assinar Newsletter
            </Button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <main className="relative z-10 pt-28 min-h-screen">
        {renderContent()}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#eaddc5]/30 border-t border-[#dec8a6]/40 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mt-6 text-sm text-gray-500 max-w-sm leading-relaxed">
              O Barreto News simplifica o mundo jurídico e as notícias globais para você. Uma iniciativa Barreto Advocacia Especializada.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6c3805] shadow-sm hover:scale-110 transition-transform"><Instagram className="w-5 h-5" /></a>
              <a href="https://wa.me/5561992657044" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6c3805] shadow-sm hover:scale-110 transition-transform"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-[#6c3805] mb-4">Explorar</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><button onClick={() => navigateTo('home')} className="hover:text-[#b4832d]">Brasil</button></li>
              <li><button onClick={() => navigateTo('home')} className="hover:text-[#b4832d]">Mundo</button></li>
              <li><button onClick={() => navigateTo('contact')} className="hover:text-[#b4832d]">Contato</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-[#6c3805] mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><button onClick={() => navigateTo('privacy')} className="hover:text-[#b4832d]">Política de Privacidade</button></li>
              <li><button onClick={() => navigateTo('privacy')} className="hover:text-[#b4832d]">Termos de Uso</button></li>
              <li className="text-xs text-gray-400 mt-4">Conteúdo informativo. Não substitui consulta jurídica individual.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#dec8a6]/30 pt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Barreto News & Barreto Advocacia. Brasília, DF.
        </div>
      </footer>
    </div>
  );
}
