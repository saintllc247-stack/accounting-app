import { useState, useEffect } from 'react'
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Typography, IconButton,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import api from '../api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', tin: '' })

  useEffect(() => { api.get('/clients').then((r) => setClients(r.data)) }, [])

  const handleSave = async () => {
    if (edit) await api.put(`/clients/${edit.id}`, form)
    else await api.post('/clients', form)
    setOpen(false)
    setEdit(null)
    const r = await api.get('/clients')
    setClients(r.data)
  }

  const handleDelete = async (id) => {
    if (confirm('Удалить клиента?')) {
      await api.delete(`/clients/${id}`)
      setClients(clients.filter((c) => c.id !== id))
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Клиенты</Typography>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setEdit(null); setForm({ name: '', email: '', phone: '', address: '', tin: '' }); setOpen(true) }}>
          Добавить
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>ИНН</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell>{c.tin || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setEdit(c); setForm(c); setOpen(true) }}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(c.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">Нет клиентов</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{edit ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle>
        <DialogContent>
          <TextField label="Название / Имя" fullWidth margin="normal" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" fullWidth margin="normal"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Телефон" fullWidth margin="normal"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Адрес" fullWidth margin="normal" multiline rows={2}
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <TextField label="ИНН" fullWidth margin="normal"
            value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
