import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Instagram, LogIn, LogOut, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js"; // Import User type

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null); // Explicitly type user state
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      console.log("Navbar: Tentando buscar a função (role) para o userId:", userId);
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Navbar: Erro ao buscar a função do usuário:", error);
        toast({
          title: "Erro ao carregar função do usuário",
          description: error.message,
          variant: "destructive",
        });
        setUserRole(null);
      } else if (data) {
        console.log("Navbar: Função do usuário encontrada:", data.role);
        setUserRole(data.role);
      } else {
        console.log("Navbar: Nenhuma função encontrada para o usuário:", userId);
        setUserRole(null);
      }
    };

    const handleAuthStateChange = async (_event: string, session: any) => { // Use 'any' for session to match Supabase type
      console.log("Navbar: Estado de autenticação alterado. Evento:", _event, "Sessão:", session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        console.log("Navbar: Usuário logado:", currentUser.id, currentUser.email);
        await fetchUserRole(currentUser.id);
      } else {
        console.log("Navbar: Usuário deslogado.");
        setUserRole(null);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Navbar: Verificação inicial da sessão. Sessão:", session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        console.log("Navbar: Usuário logado inicialmente:", currentUser.id, currentUser.email);
        await fetchUserRole(currentUser.id);
      } else {
        console.log("Navbar: Nenhum usuário logado inicialmente.");
        setUserRole(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [toast]); // Added toast to dependency array

  const scrollToSection = (sectionId: string) => {
    try {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setIsDrawerOpen(false);
      }
    } catch (error) {
      console.error(`Error scrolling to ${sectionId}:`, error);
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({top: yOffset, behavior: 'smooth'});
        setIsDrawerOpen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <h1 className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              Dr. Frederick Parreira
            </h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#about');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Sobre
          </a>
          <a 
            href="#credentials"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#credentials');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Formação
          </a>
          <a 
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Contato
          </a>
          <a 
            href="https://instagram.com/drfredmartinsjf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Instagram size={20} />
            Instagram
          </a>
          {user && userRole === 'doctor' && (
            <Button 
              onClick={() => navigate("/doctor")}
              variant="ghost"
              className="font-medium"
            >
              Portal do Profissional
            </Button>
          )}
          {user && userRole === 'patient' && (
            <Button 
              onClick={() => navigate("/patient")}
              variant="ghost"
              className="font-medium"
            >
              Portal do Paciente
            </Button>
          )}
          {user ? (
            <Button 
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast({
                    title: "Erro ao sair",
                    description: error.message,
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Sucesso",
                    description: "Você foi desconectado(a).",
                  });
                  navigate("/"); // Redireciona para a home após o logout
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Sair
            </Button>
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogIn size={16} />
              Entrar
            </Button>
          )}
        </nav>

        <div className="hidden md:block">
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            onClick={() => scrollToSection('contact')}
          >
            Agende Agora
          </Button>
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild className="md:hidden">
            <Button variant="ghost" className="p-2 text-foreground" aria-label="Abrir menu">
              <Menu size={24} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh] rounded-t-[10px] flex flex-col">
            <DrawerHeader className="text-left">
              <DrawerTitle>Navegação</DrawerTitle>
              <DrawerDescription>Explore o site ou acesse seu portal</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex flex-col space-y-2">
                <a 
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('about');
                  }}
                  className="font-medium text-foreground/80 hover:text-foreground bg-accent/50 hover:bg-accent rounded-lg px-4 py-3 transition-colors text-lg block"
                >
                  Sobre
                </a>
                <a 
                  href="#credentials"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('credentials');
                  }}
                  className="font-medium text-foreground/80 hover:text-foreground bg-accent/50 hover:bg-accent rounded-lg px-4 py-3 transition-colors text-lg block"
                >
                  Formação
                </a>
                <a 
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('contact');
                  }}
                  className="font-medium text-foreground/80 hover:text-foreground bg-accent/50 hover:bg-accent rounded-lg px-4 py-3 transition-colors text-lg block"
                >
                  Contato
                </a>
                <a 
                  href="https://instagram.com/drfredmartinsjf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground/80 hover:text-foreground bg-accent/50 hover:bg-accent rounded-lg px-4 py-3 transition-colors text-lg flex items-center gap-2"
                >
                  <Instagram size={20} />
                  Instagram
                </a>
                {user && userRole === 'doctor' && (
                  <Button 
                    onClick={() => {
                      navigate("/doctor");
                      setIsDrawerOpen(false);
                    }}
                    variant="ghost"
                    className="font-medium w-full justify-start text-lg"
                  >
                    Portal do Profissional
                  </Button>
                )}
                {user && userRole === 'patient' && (
                  <Button 
                    onClick={() => {
                      navigate("/patient");
                      setIsDrawerOpen(false);
                    }}
                    variant="ghost"
                    className="font-medium w-full justify-start text-lg"
                  >
                    Portal do Paciente
                  </Button>
                )}
                {user ? (
                  <Button 
                    onClick={async () => {
                      const { error } = await supabase.auth.signOut();
                      if (error) {
                        toast({
                          title: "Erro ao sair",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Sucesso",
                          description: "Você foi desconectado(a).",
                        });
                        navigate("/");
                        setIsDrawerOpen(false);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2 w-full mt-2"
                  >
                    <LogOut size={16} />
                    Sair
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      navigate("/auth");
                      setIsDrawerOpen(false);
                    }}
                    variant="outline"
                    className="flex items-center gap-2 w-full mt-2"
                  >
                    <LogIn size={16} />
                    Entrar
                  </Button>
                )}
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full mt-2 py-4 text-lg"
                  onClick={() => {
                    scrollToSection('contact');
                  }}
                >
                  Agende Agora
                </Button>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
};

export default Navbar;