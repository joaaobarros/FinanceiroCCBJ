import React from 'react';
import { TextField, InputAdornment, FormHelperText } from '@mui/material';
import InputMask from 'react-input-mask';

/**
 * Componente de campo de texto com validação e formatação
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.type - Tipo de campo (text, email, cpf, cnpj, telefone, data, moeda)
 * @param {string} props.label - Label do campo
 * @param {string} props.name - Nome do campo
 * @param {string} props.value - Valor do campo
 * @param {function} props.onChange - Função chamada quando o valor muda
 * @param {boolean} props.required - Se o campo é obrigatório
 * @param {string} props.error - Mensagem de erro
 * @param {boolean} props.fullWidth - Se o campo deve ocupar toda a largura
 * @param {string} props.helperText - Texto de ajuda
 * @param {Object} props.inputProps - Propriedades adicionais para o input
 * @param {Object} props.sx - Estilos adicionais
 */
const FormField = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  fullWidth = true,
  helperText,
  inputProps = {},
  sx = {},
  ...rest
}) => {
  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    if (!value) return '';
    
    // Remover caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Converter para número e formatar
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Função para lidar com mudanças em campos monetários
  const handleCurrencyChange = (e) => {
    const { value } = e.target;
    
    // Remover caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Criar um novo evento com o valor numérico
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: numericValue ? (parseFloat(numericValue) / 100).toString() : ''
      }
    };
    
    onChange(newEvent);
  };
  
  // Renderizar campo de acordo com o tipo
  switch (type) {
    case 'cpf':
      return (
        <InputMask
          mask="999.999.999-99"
          value={value || ''}
          onChange={onChange}
          disabled={false}
        >
          {(inputProps) => (
            <TextField
              label={label}
              name={name}
              required={required}
              error={!!error}
              helperText={error || helperText}
              fullWidth={fullWidth}
              sx={sx}
              {...inputProps}
              {...rest}
            />
          )}
        </InputMask>
      );
      
    case 'cnpj':
      return (
        <InputMask
          mask="99.999.999/9999-99"
          value={value || ''}
          onChange={onChange}
          disabled={false}
        >
          {(inputProps) => (
            <TextField
              label={label}
              name={name}
              required={required}
              error={!!error}
              helperText={error || helperText}
              fullWidth={fullWidth}
              sx={sx}
              {...inputProps}
              {...rest}
            />
          )}
        </InputMask>
      );
      
    case 'telefone':
      return (
        <InputMask
          mask="(99) 99999-9999"
          value={value || ''}
          onChange={onChange}
          disabled={false}
        >
          {(inputProps) => (
            <TextField
              label={label}
              name={name}
              required={required}
              error={!!error}
              helperText={error || helperText}
              fullWidth={fullWidth}
              sx={sx}
              {...inputProps}
              {...rest}
            />
          )}
        </InputMask>
      );
      
    case 'data':
      return (
        <InputMask
          mask="99/99/9999"
          value={value || ''}
          onChange={onChange}
          disabled={false}
        >
          {(inputProps) => (
            <TextField
              label={label}
              name={name}
              required={required}
              error={!!error}
              helperText={error || helperText || 'DD/MM/AAAA'}
              fullWidth={fullWidth}
              sx={sx}
              {...inputProps}
              {...rest}
            />
          )}
        </InputMask>
      );
      
    case 'moeda':
      return (
        <TextField
          label={label}
          name={name}
          value={formatCurrency(value)}
          onChange={handleCurrencyChange}
          required={required}
          error={!!error}
          helperText={error || helperText}
          fullWidth={fullWidth}
          InputProps={{
            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            ...inputProps
          }}
          sx={sx}
          {...rest}
        />
      );
      
    case 'email':
      return (
        <TextField
          type="email"
          label={label}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          error={!!error}
          helperText={error || helperText}
          fullWidth={fullWidth}
          sx={sx}
          {...rest}
        />
      );
      
    default:
      return (
        <TextField
          type={type}
          label={label}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          error={!!error}
          helperText={error || helperText}
          fullWidth={fullWidth}
          sx={sx}
          {...rest}
        />
      );
  }
};

export default FormField;
