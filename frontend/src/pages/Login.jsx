import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Card, TextField, Button, Typography, Alert, Container } from '@mui/material'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      setError('Неверное имя пользователя или пароль')
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          Вход в систему
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Имя пользователя" fullWidth margin="normal" required
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <TextField label="Пароль" type="password" fullWidth margin="normal" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
            Войти
          </Button>
        </Box>
        <Typography textAlign="center" sx={{ mt: 2 }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </Typography>
      </Card>
    </Container>
  )
}
