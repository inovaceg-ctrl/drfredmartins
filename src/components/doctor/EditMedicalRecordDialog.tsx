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
import { ptBR } from "date-fns/locale";

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];

interface EditMedicalRecordDialogProps {
  medicalRecord: MedicalRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordUpdated: () => void;
}

export const EditMedicalRecordDialog: React.FC<EditMedicalRecordDialogProps> = ({
  medicalRecord,
  open,
  onOpenChange,
  onRecordUpdated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    prescription: "",
    notes: "",
  });

  useEffect(() => {
    if (medicalRecord && open) {
      setFormData({
        diagnosis: medicalRecord.diagnosis || "",
        prescription: medicalRecord.prescription || "",
        notes: medicalRecord.notes || "",
      });
    }
  }, [medicalRecord, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          diagnosis: formData.diagnosis || null,
          prescription: formData.prescription || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', medicalRecord.id);

      if (error) {
        throw error;
      }

      toast({ title: "Sucesso", description: "Prontuário atualizado com sucesso!" });
      onRecordUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar prontuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o prontuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Prontuário Médico</DialogTitle>
          <DialogDescription>
            Edite os detalhes do prontuário criado em {medicalRecord.created_at ? format(new Date(medicalRecord.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'data desconhecida'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Input
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Ex: Transtorno de Ansiedade Generalizada"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prescription">Prescrição</Label>
            <Textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="Medicamentos, dosagem, frequência..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notas Médicas Gerais</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observações gerais sobre o estado de saúde do paciente..."
              rows={4}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};