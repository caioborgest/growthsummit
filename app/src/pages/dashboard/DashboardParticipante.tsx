import { useState, useMemo } from 'react';
import {
  QrCode,
  User,
  Calendar,
  Users,
  MessageCircle,
  FileText,
  HelpCircle,
  Download,
  Share2,
  Printer,
  Clock,
  MapPin,
  Check,
  TrendingUp,
  Layout,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistrations, useSessions, useMentoringSessions } from '@/hooks/useData';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from './components/ProfileForm';

export function DashboardParticipante() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: registrations } = useRegistrations();
  const { data: sessions } = useSessions();
  const { data: mentoringSessions } = useMentoringSessions();
  const [activeTab, setActiveTab] = useState('ingresso');

  // Find user's registration
  const myRegistration = useMemo(() =>
    registrations.find(r => r.userId === user?.id),
    [registrations, user?.id]
  );

  const myMentories = useMemo(() =>
    mentoringSessions.filter(s => s.menteeId === user?.id),
    [mentoringSessions, user?.id]
  );

  // Filter sessions based on ticket type
  const userSessions = useMemo(() => {
    // Basic sessions always available
    const basicSessions = sessions.filter(s => s.type === 'keynote' || s.type === 'networking');

    // Day sessions if has cursos_selecionados
    const daySessions = sessions.filter(s =>
      s.day === 1 && (myRegistration?.cursosSelecionados || []).includes(s.id)
    );

    // Night sessions only if palestras_noturnas is true
    const nightSessions = myRegistration?.palestrasNoturnas
      ? sessions.filter(s => s.startTime >= '18:00')
      : [];

    return [...basicSessions, ...daySessions, ...nightSessions];
  }, [sessions, myRegistration]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const documentos = [
    { name: "Programação Completa", type: "PDF", size: "2.4 MB" },
    { name: "Mapa do Evento", type: "PDF", size: "1.8 MB" },
    { name: "Guia do Participante", type: "PDF", size: "3.2 MB" },
  ];

  return (
    <div className="bg-dark min-h-screen">
      {/* Header */}
      <div className="bg-dark-200 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-gray-400">Growth Experience Triunfo 2026</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 px-3 py-1">
                {myRegistration?.palestrasNoturnas ? 'Passe Completo' : 'Inscrição Básica'}
              </Badge>
              <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300" onClick={() => navigate('/guia')}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Acessar Manual
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-dark-200 mb-8 p-1">
            <TabsTrigger value="ingresso" className="data-[state=active]:bg-teal-500">
              <QrCode className="h-4 w-4 mr-2" />
              Ingresso
            </TabsTrigger>
            <TabsTrigger value="agenda" className="data-[state=active]:bg-teal-500">
              <Calendar className="h-4 w-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="mentorias" className="data-[state=active]:bg-teal-500">
              <Users className="h-4 w-4 mr-2" />
              Mentorias
            </TabsTrigger>
            <TabsTrigger value="documentos" className="data-[state=active]:bg-teal-500">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="dados" className="data-[state=active]:bg-teal-500">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="suporte" className="data-[state=active]:bg-teal-500">
              <HelpCircle className="h-4 w-4 mr-2" />
              Suporte
            </TabsTrigger>
          </TabsList>

          {/* Ingresso Tab */}
          <TabsContent value="ingresso">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-10 text-center flex flex-col items-center border-teal-500/20">
                <h2 className="text-xl font-bold text-white mb-8">Seu Acesso</h2>
                <div className="bg-white p-6 rounded-3xl inline-block mb-8 shadow-2xl shadow-teal-500/20">
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center">
                    {myRegistration?.id ? (
                      <QRCode
                        value={myRegistration.id}
                        size={160}
                        viewBox={`0 0 256 256`}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    ) : (
                      <QrCode className="h-32 w-32 text-gray-200" />
                    )}
                  </div>
                </div>
                <p className="text-gray-400 mb-1 uppercase tracking-widest text-xs font-bold">Protocolo</p>
                <p className="text-3xl font-black text-white mb-8">#{myRegistration?.id?.slice(0, 8).toUpperCase() || 'GS2026-X'}</p>

                <div className="flex gap-4">
                  <Button variant="outline" className="border-dark-300 rounded-xl hover:bg-dark-300 transition-all">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-8">
                    <QrCode className="h-4 w-4 mr-2" />
                    Validar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-8">
                  <h3 className="text-lg font-bold text-white mb-6 border-b border-dark-300 pb-4 flex items-center">
                    <Sparkles className="h-5 w-5 mr-3 text-teal-400" />
                    Status da Inscrição
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-dark-100 rounded-xl">
                      <span className="text-gray-400">Tipo de Ingresso</span>
                      <Badge className="bg-teal-500/20 text-teal-400 border-none uppercase text-[10px] font-black">
                        {myRegistration?.palestrasNoturnas ? 'Experience Pro' : 'Free Morning'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-100 rounded-xl">
                      <span className="text-gray-400">Status Financeiro</span>
                      <Badge className="bg-green-500/20 text-green-400 border-none">Confirmado</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-100 rounded-xl">
                      <span className="text-gray-400">Acesso Noturno</span>
                      <span className={myRegistration?.palestrasNoturnas ? "text-green-400 font-bold" : "text-gray-600"}>
                        {myRegistration?.palestrasNoturnas ? 'Liberado ✓' : 'Não incluso'}
                      </span>
                    </div>
                  </div>
                </div>

                {!myRegistration?.palestrasNoturnas && (
                  <div className="glass-card p-8 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
                    <h3 className="text-lg font-bold text-white mb-2">Upgrade para Pro</h3>
                    <p className="text-gray-400 text-sm mb-6">Assista as palestras noturnas e tenha acesso a mentorias exclusivas por apenas R$ 179,90.</p>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl">
                      GARANTIR ACESSO PRO
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Minha Agenda Personalizada</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-dark-300 text-gray-400">Hoje</Button>
                  <Button size="sm" className="bg-teal-500 text-white">Ver Tudo</Button>
                </div>
              </div>

              <div className="space-y-4">
                {userSessions.length > 0 ? userSessions.map((item, i) => (
                  <div key={i} className="flex items-center p-5 bg-dark-100 rounded-2xl border border-dark-300 hover:border-teal-500/30 transition-all group">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-teal-400 font-black text-xl">{item.startTime}</p>
                      <p className="text-gray-500 text-xs uppercase tracking-widest">{item.track || 'Palco'}</p>
                    </div>
                    <div className="flex-1 ml-4 border-l border-dark-300 pl-6">
                      <p className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors">{item.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-400 border-dark-400">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.room || 'Arena Principal'}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-gray-400 hover:text-orange-400">
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-20 border-2 border-dashed border-dark-300 rounded-3xl">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Você ainda não selecionou nenhuma atividade.</p>
                    <Button variant="link" className="text-teal-400 mt-2 font-bold" onClick={() => navigate('/programacao')}>
                      Ver Programação Completa
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Mentorias Tab */}
          <TabsContent value="mentorias">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Sessões 1:1 Agendadas</h2>
                <Button size="sm" className="bg-teal-500 text-white font-bold">SOLICITAR NOVA</Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myMentories.map((mentoria) => (
                  <div key={mentoria.id} className="p-6 bg-dark-100 rounded-2xl border border-teal-500/20 hover:bg-teal-500/5 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                        <Users className="h-7 w-7 text-teal-400" />
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-none uppercase text-[10px] font-black">
                        {mentoria.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-bold text-lg">{mentoria.mentorId || 'Mentor Growth'}</h3>
                    <div className="flex items-center text-gray-400 text-sm mt-3">
                      <Clock className="h-4 w-4 mr-2 text-teal-400" />
                      {new Date(mentoria.scheduledAt).toLocaleDateString()} às {new Date(mentoria.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="mt-6 pt-6 border-t border-dark-300 flex gap-2">
                      <Button size="sm" variant="outline" className="border-dark-300 flex-1 hover:bg-dark-300">
                        Chat
                      </Button>
                      <Button size="sm" className="bg-teal-500 flex-1 font-bold">
                        Acessar
                      </Button>
                    </div>
                  </div>
                ))}

                {myMentories.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-dark-300 p-12 text-center rounded-3xl">
                    <p className="text-gray-500 mb-4">Você ainda não tem mentorias agendadas.</p>
                    <Button variant="outline" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 font-bold px-10">
                      Explorar Mentores
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Documentos Tab */}
          <TabsContent value="documentos">
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-8">Materiais do Evento</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {documentos.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-dark-100 rounded-2xl border border-dark-300 hover:border-teal-500/30 transition-all">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mr-4">
                        <FileText className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{doc.name}</p>
                        <p className="text-gray-500 text-xs lowercase">{doc.type} · {doc.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="dados">
            <ProfileForm />
          </TabsContent>

          {/* Suporte Tab */}
          <TabsContent value="suporte">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-8 border-b border-dark-300 pb-4">Canais de Ajuda</h2>
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-dark-100 rounded-2xl hover:bg-teal-500/5 transition-all cursor-pointer">
                    <MessageCircle className="h-8 w-8 mr-5 text-teal-400" />
                    <div>
                      <p className="text-white font-bold">Assistência WhatsApp</p>
                      <p className="text-gray-500 text-sm">Fale com nosso time técnico</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-dark-100 rounded-2xl hover:bg-teal-500/5 transition-all cursor-pointer">
                    <MapPin className="h-8 w-8 mr-5 text-teal-400" />
                    <div>
                      <p className="text-white font-bold">Ponto de Apoio Presencial</p>
                      <p className="text-gray-500 text-sm">Arena Triunfo - Balcão B2B</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 bg-teal-500/5 border-teal-500/20">
                <h2 className="text-xl font-bold text-white mb-8">Central PWA</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">Instale nosso aplicativo em seu smartphone para receber notificações em tempo real sobre seus matches e palestras.</p>
                <Button className="w-full bg-teal-500 text-white font-black py-4 rounded-xl shadow-lg shadow-teal-500/20">
                  INSTALAR APLICATIVO
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
