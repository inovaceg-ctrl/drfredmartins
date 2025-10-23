import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type Session = Database['public']['Tables']['sessions']['Row'];

interface EditTherapySessionDialogProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionUpdated: () => void;
}

export const EditTherapySessionDialog: React.FC<EditTherapySessionDialogProps> = ({
  session,
  open,
  onOpenChange,
  onSessionUpdated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    session_date: "",
    session_theme: "",
    interventions_used: "",
    notes: "",
    homework: "",
  });

  useEffect(() => {
    if (session && open) {
      setFormData({
        session_date: session.session_date ? format(new Date(session.session_date), "yyyy-MM-dd'T'HH:mm") : "",
        session_theme: session.session_theme || "",
        interventions_used: session.interventions_used || "",
        notes: session.notes || "",
        homework: session.homework || "",
      });
    }
  }, [session, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting to save therapy session. Session ID:", session.id, "Form Data:", formData);

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          session_date: formData.session_date ? new Date(formData.session_date).toISOString() : session.session_date,
          session_theme: formData.session_theme || null,
          interventions_used: formData.interventions_used || null,
          notes: formData.notes || null,
          homework: formData.homework || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Therapy session updated successfully.");
      toast({
        title: "Sucesso",
        description: "Sessão de terapia atualizada com sucesso!",
      });
      onSessionUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in handleSubmit (EditTherapySessionDialog):", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a sessão. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("handleSubmit finished. Loading state set to false.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Sessão de Terapia</DialogTitle>
          <DialogDescription>
            Edite os detalhes da sessão para o paciente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="session_date">Data da Sessão *</Label>
            <Input
              id="session_date"
              type="datetime-local"
              value={formData.session_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session_theme">Tema da Sessão</Label>
            <Input
              id="session_theme"
              value={formData.session_theme}
              onChange={handleChange}
              placeholder="Ex: Ansiedade, Relacionamento"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interventions_used">Intervenções Utilizadas</Label>
            <Textarea
              id="interventions_used"
              value={formData.interventions_used}
              onChange={handleChange}
              placeholder="Técnicas e abordagens utilizadas..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas sobre o Estado Emocional</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observações sobre o paciente durante a sessão..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homework">Tarefas de Casa</Label>
            <Textarea
              id="homework"
              value={formData.homework}
              onChange={handleChange}
              placeholder="Atividades ou reflexões recomendadas para o paciente..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};