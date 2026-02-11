import { useState } from 'react';
import { 
  QrCode, 
  User, 
  Calendar, 
  Users, 
  MessageCircle,
  FileText,
  Star,
  HelpCircle,
  Download,
  Share2,
  Printer,
  Clock,
  MapPin,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mentorias = [
  { id: 1, mentor: "Dr. Fernando Lima", date: "22/05", time: "15:00", status: "confirmada" },
  { id: 2, mentor: "Dra. Amanda Rocha", date: "22/05", time: "15:30", status: "confirmada" },
];

const agenda = [
  { time: "09:00", title: "Abertura + Palestra Âncora", type: "keynote", day: "21/05" },
  { time: "10:00", title: "Growth Marketing em Startups", type: "talk", day: "21/05" },
  { time: "14:00", title: "Vendas B2B Consultiva", type: "talk", day: "21/05" },
];

const documentos = [
  { name: "Programação Completa", type: "PDF", size: "2.4 MB" },
  { name: "Mapa do Evento", type: "PDF", size: "1.8 MB" },
  { name: "Guia do Participante", type: "PDF", size: "3.2 MB" },
  { name: "Como Chegar", type: "PDF", size: "0.8 MB" },
];

export function DashboardParticipante() {
  const [activeTab, setActiveTab] = useState('ingresso');

  return (
    <div className="bg-dark min-h-screen">
      {/* Header */}
      <div className="bg-dark-200 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Minha Área</h1>
              <p className="text-gray-400">Bem-vindo ao Growth Summit 2026</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                Passe Pro
              </Badge>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <span className="text-white font-bold">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 bg-dark-200 mb-8">
            <TabsTrigger 
              value="ingresso" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Ingresso
            </TabsTrigger>
            <TabsTrigger 
              value="dados" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Meus Dados
            </TabsTrigger>
            <TabsTrigger 
              value="agenda" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger 
              value="mentorias" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Mentorias
            </TabsTrigger>
            <TabsTrigger 
              value="documentos" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger 
              value="suporte" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Suporte
            </TabsTrigger>
          </TabsList>

          {/* Ingresso Tab */}
          <TabsContent value="ingresso" className="mt-0">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 text-center">
                <h2 className="text-xl font-bold text-white mb-6">Seu QR Code</h2>
                <div className="bg-white p-6 rounded-xl inline-block mb-6">
                  <div className="w-48 h-48 bg-dark rounded-lg flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-white" />
                  </div>
                </div>
                <p className="text-gray-400 mb-2">Número do ingresso</p>
                <p className="text-2xl font-bold text-teal-400 mb-6">#GS2026-00387</p>
                
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" size="sm" className="border-dark-300">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button variant="outline" size="sm" className="border-dark-300">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" className="border-dark-300">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Informações do Ingresso</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo</span>
                      <span className="text-white">Passe Pro</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <Badge className="bg-green-500/20 text-green-400">Pago</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data de acesso</span>
                      <span className="text-white">21-22/05/2026</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Próximos Passos</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-teal-400" />
                      Complete seu cadastro
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-teal-400" />
                      Escolha suas mentorias
                    </li>
                    <li className="flex items-center text-gray-300">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 mr-3" />
                      Monte sua agenda
                    </li>
                    <li className="flex items-center text-gray-300">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 mr-3" />
                      Baixe o app do evento
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Dados Tab */}
          <TabsContent value="dados" className="mt-0">
            <div className="glass-card p-8 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Meus Dados</h2>
                <Button variant="outline" size="sm" className="border-dark-300">
                  Editar
                </Button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome</label>
                  <p className="text-white">João da Silva</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <p className="text-white">joao@email.com</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Telefone</label>
                  <p className="text-white">(88) 99999-9999</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Empresa</label>
                  <p className="text-white">TechStart Brasil</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cargo</label>
                  <p className="text-white">Head de Growth</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cidade</label>
                  <p className="text-white">Juazeiro do Norte, CE</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda" className="mt-0">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Minha Agenda</h2>
              <div className="space-y-4">
                {agenda.map((item, i) => (
                  <div key={i} className="flex items-center p-4 bg-dark-100 rounded-lg">
                    <div className="w-20 flex-shrink-0">
                      <p className="text-teal-400 font-mono">{item.time}</p>
                      <p className="text-gray-500 text-sm">{item.day}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.title}</p>
                      <Badge className="mt-1 bg-dark-300 text-gray-400">
                        {item.type}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Mentorias Tab */}
          <TabsContent value="mentorias" className="mt-0">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Minhas Mentorias</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {mentorias.map((mentoria) => (
                  <div key={mentoria.id} className="p-4 bg-dark-100 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-teal-400" />
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">
                        {mentoria.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold">{mentoria.mentor}</h3>
                    <div className="flex items-center text-gray-400 text-sm mt-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {mentoria.date} às {mentoria.time}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="border-dark-300 flex-1">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline" className="border-dark-300 flex-1 text-red-400">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Documentos Tab */}
          <TabsContent value="documentos" className="mt-0">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Documentos</h2>
              <div className="space-y-3">
                {documentos.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-teal-400 mr-4" />
                      <div>
                        <p className="text-white font-medium">{doc.name}</p>
                        <p className="text-gray-500 text-sm">{doc.type} · {doc.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-dark-300">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Suporte Tab */}
          <TabsContent value="suporte" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-6">Contatos</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-3 text-teal-400" />
                    <div>
                      <p className="text-white">Chat ao vivo</p>
                      <p className="text-gray-400 text-sm">Disponível 9h-18h</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-teal-400" />
                    <div>
                      <p className="text-white">Boulevard Hotel</p>
                      <p className="text-gray-400 text-sm">Help desk no evento</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>
                <div className="space-y-3">
                  <a href="#" className="block p-3 bg-dark-100 rounded-lg text-gray-300 hover:text-white">
                    Como funciona o credenciamento?
                  </a>
                  <a href="#" className="block p-3 bg-dark-100 rounded-lg text-gray-300 hover:text-white">
                    Posso levar convidados?
                  </a>
                  <a href="#" className="block p-3 bg-dark-100 rounded-lg text-gray-300 hover:text-white">
                    Onde fica o estacionamento?
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
