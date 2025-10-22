import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../integrations/supabase/types';
import DocumentUploadForm from '@/components/DocumentUploadForm'; // Caminho de importação CORRIGIDO

type Document = Database['public']['Tables']['documents']['Row'];

const PatientDocumentsPage: React.FC = () => {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [patientDoctorId, setPatientDoctorId] = useState<string | null>(null); // Estado para o ID do doutor

  const fetchDocuments = async () => {
    if (!session?.user.id) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('patient_id', session.user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos:', error);
      setError('Erro ao carregar documentos.');
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  // Função para buscar o ID do doutor associado ao paciente
  // ESTA É UMA LÓGICA DE EXEMPLO. VOCÊ PRECISA SUBSTITUÍ-LA PELA LÓGICA REAL DO SEU APP.
  const fetchPatientDoctorId = async () => {
    if (!session?.user.id) return;

    // Exemplo: buscar o doutor da primeira consulta agendada ou de um perfil de paciente
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select('doctor_id')
      .eq('patient_id', session.user.id)
      .not('doctor_id', 'is', null)
      .order('start_time', { ascending: false })
      .limit(1);

    if (appointmentError) {
      console.error('Erro ao buscar doutor associado:', appointmentError);
      // Tratar erro, talvez definir um doutor padrão ou deixar o campo vazio
    } else if (appointmentData && appointmentData.length > 0) {
      setPatientDoctorId(appointmentData[0].doctor_id);
    } else {
      // Se não houver consultas, talvez buscar de um perfil de paciente ou deixar nulo
      console.warn('Nenhum doutor associado encontrado para o paciente.');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchPatientDoctorId(); // Chamar a função para buscar o ID do doutor
  }, [session]);

  const handleUploadSuccess = () => {
    fetchDocuments(); // Recarregar a lista de documentos após um upload bem-sucedido
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    if (!session?.user.id) {
      alert('Você precisa estar logado para baixar arquivos.');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('patient_documents')
        .download(filePath);

      if (error) {
        throw error;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Erro ao baixar arquivo:', err);
      alert(`Erro ao baixar arquivo: ${err.message}`);
    }
  };

  if (!session) {
    return <div className="container mx-auto p-4">Por favor, faça login para ver seus documentos.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Meus Documentos</h2>

      {/* Formulário de Upload */}
      {patientDoctorId ? (
        <div className="mb-8">
          <DocumentUploadForm
            patientId={session.user.id}
            doctorId={patientDoctorId}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 border rounded-lg bg-yellow-50 text-yellow-800">
          <p>Não foi possível identificar um doutor associado para enviar documentos. Por favor, agende uma consulta ou entre em contato com o suporte.</p>
        </div>
      )}


      {/* Lista de Documentos */}
      <h3 className="text-xl font-semibold mb-4">Documentos Enviados</h3>
      {loading && <p>Carregando documentos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && documents.length === 0 && !error && (
        <p>Nenhum documento encontrado.</p>
      )}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <p className="font-semibold text-lg">{doc.file_name}</p>
              {doc.description && <p className="text-gray-600 text-sm mt-1">{doc.description}</p>}
              <p className="text-gray-500 text-xs mt-2">
                Enviado em: {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDownload(doc.file_path!, doc.file_name!)}
                className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Baixar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDocumentsPage;