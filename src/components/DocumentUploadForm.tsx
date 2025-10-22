import React, { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../integrations/supabase/types';

interface DocumentUploadFormProps {
  patientId: string;
  doctorId: string; // O ID do doutor para quem o documento será enviado
  onUploadSuccess?: () => void;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ patientId, doctorId, onUploadSuccess }) => {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!session?.user.id) {
      setError('Usuário não autenticado.');
      return;
    }
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo para enviar.');
      return;
    }
    if (!doctorId) {
      setError('Não foi possível identificar o doutor associado. Por favor, tente novamente mais tarde.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `${patientId}/${doctorId}/${Date.now()}.${fileExtension}`; // patientId/doctorId/timestamp.ext

    try {
      // 1. Upload do arquivo para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('patient_documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter a URL pública do arquivo (ou caminho para acesso via RLS)
      // Para arquivos privados com RLS, não usamos getPublicUrl diretamente para acesso.
      // A URL será construída no backend ou acessada via download assinado.
      // Por enquanto, armazenamos o caminho.

      // 3. Inserir metadados do documento no banco de dados
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          file_name: selectedFile.name,
          file_path: filePath, // Armazena o caminho completo no storage
          description: description,
          uploaded_at: new Date().toISOString(),
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        });

      if (dbError) {
        // Se a inserção no DB falhar, tentar remover o arquivo do storage para evitar lixo
        await supabase.storage.from('patient_documents').remove([filePath]);
        throw dbError;
      }

      setSuccess('Documento enviado com sucesso!');
      setSelectedFile(null);
      setDescription('');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      console.error('Erro ao enviar documento:', err);
      setError(`Erro ao enviar documento: ${err.message || err.error_description || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-4">Enviar Novo Documento</h3>
      <div className="mb-4">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
          Selecionar Arquivo
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">Arquivo selecionado: {selectedFile.name}</p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Adicione uma breve descrição do documento..."
        ></textarea>
      </div>
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading || !doctorId}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${!selectedFile || uploading || !doctorId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
      >
        {uploading ? 'Enviando...' : 'Enviar Documento'}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
    </div>
  );
};

export default DocumentUploadForm;