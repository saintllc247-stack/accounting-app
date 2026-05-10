import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Card, TextField, Button, Typography, Alert, Container } from '@mui/material'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', company_name: '' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации')
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          Регистрация
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Имя пользователя" fullWidth margin="normal" required
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <TextField label="Email" type="email" fullWidth margin="normal" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Компания" fullWidth margin="normal"
            value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <TextField label="Пароль" type="password" fullWidth margin="normal" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
            Зарегистрироваться
          </Button>
        </Box>
        <Typography textAlign="center" sx={{ mt: 2 }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </Typography>
      </Card>
    </Container>
  )
}
