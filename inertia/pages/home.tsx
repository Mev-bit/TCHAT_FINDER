import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import {Transmit} from "@adonisjs/transmit-client";
import axios from "axios";
type Message = {
  user: string;
  message: string;
}
export default function Home() {
  const [currentMessages, setMessages] = useState<Message[]>([]);
  const [streamerName, setStreamerName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [word, setWord] = useState("");
  const [isMarked, setIsMarked] = useState(false);
  const [firstWordFind, setfirstWordFind] = useState<null | Message>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isMarkedRef = useRef(isMarked);
  const wordRef = useRef(word);
  const firstWordFindRef = useRef(firstWordFind);
   useEffect(() => {
    isMarkedRef.current = isMarked;
  }, [isMarked]);

  useEffect(() => {
    wordRef.current = word;
  }, [word]);

  useEffect(() => {
    firstWordFindRef.current = firstWordFind;
  }, [firstWordFind]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleConnect = async () => {
    setMessages([])
    if (streamerName.trim()) {
      await axios.post('/connect', { streamerName })
      .then(() => {
        setIsConnected(true);
      });
    }
  };

  const handleDisconnect = async () => {
    await axios.post('/disconnect')
    .then(() => {
      setIsConnected(false);
    });
  };

  const getMessageColor = (username: string) => {
    const colors = [
      "text-red-500", "text-blue-500", "text-green-500", 
      "text-purple-500", "text-pink-500", "text-indigo-500",
      "text-yellow-600", "text-cyan-500"
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    const transmit = new Transmit({
      baseUrl: window.location.origin,
    });

    const channel = transmit.subscription('chat:message');
    channel.create().then(() => {
      channel.onMessage((message : any) => {
        if(isMarkedRef.current){
          if(message.message.trim() === wordRef.current && !firstWordFindRef.current){
            finish(message);
          }
        }
        setMessages(prevMessages => {
          const newMessages = [...prevMessages, message];
          if (newMessages.length > 250) {
            return newMessages.slice(-20);
          }
          return newMessages;
        });
      });
    });

    return () => {
      channel.delete();
    };
  }, []);

  const handleMarkWord = async (word: string) => {
    if (word.trim()) {
      setIsMarked(true);
      setMessages([])
      setfirstWordFind(null)
    }
  };

  const finish = (message : any) => {
    setfirstWordFind(message)
    setIsMarked(false)
  }

  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Chat Viewer
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Panneau de connexion */}
          <div className="w-full lg:w-auto flex flex-col gap-5">
            <Card className="w-full lg:w-[400px] bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  Connexion au Stream
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Entrez le nom du streamer pour commencer
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nom du streamer</label>
                  <Input 
                    placeholder="ex: ninja, pokimane..." 
                    value={streamerName}
                    onChange={(e) => setStreamerName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-purple-500 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                    disabled={isConnected}
                  />
                </div>
                <Button 
                  onClick={isConnected ? handleDisconnect : handleConnect}
                  disabled={!streamerName.trim() && !isConnected}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isConnected ? "Se Déconnecter" : "🚀 Se Connecter"}
                </Button>
                {isConnected && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    Connecté à {streamerName}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="w-full lg:w-[400px] bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
              <CardHeader className="">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  Marquer un mot
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Entrez le mot à marquer, le premier à le marquer sera affiché en vert
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 ">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Entrer le mot à marquer</label>
                  <Input 
                    placeholder="ex: super, cool..." 
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <Button 
                  onClick={() => (isMarked ? setIsMarked(false) : handleMarkWord(word))}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isMarked ? "Annuler" : "Lancer la recherche"}
                </Button>
                {firstWordFind && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    {firstWordFind.user} a marqué le mot {word} en premier à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Panneau de chat */}
          <div className="w-full lg:w-auto">
            <Card className="w-full lg:w-[500px] h-[600px] bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 py-4 sticky top-0 z-10">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    💬 Chat en Direct
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  </div>
                  <span className="text-sm font-normal bg-white/20 px-2 py-1 rounded-full">
                    {currentMessages.length} messages
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0 h-[calc(600px-80px)] overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  <div className="p-4 space-y-3">
                    {currentMessages.map((message, index) => (
                      <div 
                        key={index} 
                        className="group hover:bg-slate-700/30 p-3 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-purple-500"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {message.user.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold text-sm ${getMessageColor(message.user)}`}>
                                {message.user}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date().toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed break-words">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-800/80 p-3 border-t border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  Chat en temps réel
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}