export const formatPhone = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  if (numbers.length > 11) {
    // Se tiver mais de 11 dígitos, trunca para 11 e formata como celular
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  } else if (numbers.length === 11) {
    // Formato para 11 dígitos (celular): DD-9-XXXX-XXXX
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  } else if (numbers.length === 10) {
    // Formato para 10 dígitos (fixo ou celular antigo): DD-XXXX-XXXX
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  } else if (numbers.length > 6) {
    // Para 7-9 dígitos, geralmente números locais sem DDD, ou entradas parciais
    // Exemplo: 9XXXX-XXXX ou XXXX-XXXX
    if (numbers.length === 9 && numbers.startsWith('9')) { // 9 dígitos, começa com 9 (celular sem DDD)
      return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5, 9)}`;
    } else if (numbers.length === 8) { // 8 dígitos (fixo sem DDD)
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
    }
    return numbers; // Fallback para outros casos de 7 dígitos ou parciais
  } else if (numbers.length > 2) {
    // Para 3 a 6 dígitos, geralmente DDD parcial + número
    return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
  } else {
    // Para 0 a 2 dígitos (apenas DDD ou menos)
    return numbers;
  }
};

export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};