import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json(); // O payload do trigger do banco de dados

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const RECIPIENT_EMAIL = Deno.env.get('CONTACT_FORM_RECIPIENT_EMAIL');
    const SENDER_EMAIL = Deno.env.get('CONTACT_FORM_SENDER_EMAIL');

    if (!SENDGRID_API_KEY || !RECIPIENT_EMAIL || !SENDER_EMAIL) {
      throw new Error('Variáveis de ambiente do SendGrid ou e-mails não configurados.');
    }

    const { 
      name, 
      email, 
      phone, 
      whatsapp, // Novo campo
      date_of_birth, // Novo campo
      zip_code, // Novo campo
      state, // Novo campo
      city, // Novo campo
      receive_email_newsletter, // Novo campo
      receive_whatsapp_newsletter, // Novo campo
      content, 
      created_at 
    } = record;

    const emailBody = `
      Nova mensagem do formulário de contato:

      Nome: ${name || 'Não Informado'}
      Email: ${email || 'Não Informado'}
      Telefone: ${phone || 'Não Informado'}
      WhatsApp: ${whatsapp || 'Não Informado'}
      Data de Nascimento: ${date_of_birth ? new Date(date_of_birth).toLocaleDateString('pt-BR') : 'Não Informado'}
      CEP: ${zip_code || 'Não Informado'}
      Estado: ${state || 'Não Informado'}
      Cidade: ${city || 'Não Informado'}
      Receber informativo por E-mail: ${receive_email_newsletter ? 'Sim' : 'Não'}
      Receber informativo por WhatsApp: ${receive_whatsapp_newsletter ? 'Sim' : 'Não'}
      Mensagem:
      ${content}

      Enviado em: ${new Date(created_at).toLocaleString('pt-BR')}
    `;

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: RECIPIENT_EMAIL }] }],
        from: { email: SENDER_EMAIL, name: 'Dr. Frederick Parreira - Contato' },
        subject: `Nova Mensagem de Contato de ${name || 'Visitante'}`,
        content: [{ type: 'text/plain', value: emailBody }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao enviar e-mail pelo SendGrid:', response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }

    console.log('E-mail de notificação enviado com sucesso!');
    return new Response('Email sent successfully', { headers: corsHeaders, status: 200 });

  } catch (error) {
    console.error('Erro na Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});