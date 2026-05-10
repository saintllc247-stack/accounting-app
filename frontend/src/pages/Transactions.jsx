import { useState, useEffect } from 'react'
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography, IconButton,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import api from '../api'

export default function Transactions() {
  const [txns, setTxns] = useState([])
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ type: 'income', amount: '', category_id: '', description: '', date: new Date().toISOString().split('T')[0], client_id: '' })

  const load = () => api.get('/transactions').then((r) => setTxns(r.data))
  const loadCats = () => api.get('/categories').then((r) => setCategories(r.data))

  useEffect(() => { load(); loadCats() }, [])

  const handleSave = async () => {
    const payload = { ...form, amount: parseFloat(form.amount), category_id: form.category_id ? Number(form.category_id) : null, client_id: form.client_id ? Number(form.client_id) : null }
    if (edit) await api.put(`/transactions/${edit.id}`, payload)
    else await api.post('/transactions', payload)
    setOpen(false)
    setEdit(null)
    load()
  }

  const handleDelete = async (id) => {
    if (confirm('Удалить транзакцию?')) {
      await api.delete(`/transactions/${id}`)
      load()
    }
  }

  const openEdit = (t) => {
    setEdit(t)
    setForm({ type: t.type, amount: String(t.amount), category_id: t.category_id || '', description: t.description, date: t.date, client_id: t.client_id || '' })
    setOpen(true)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Транзакции</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEdit(null); setForm({ type: 'income', amount: '', category_id: '', description: '', date: new Date().toISOString().split('T')[0], client_id: '' }); setOpen(true) }}>
          Добавить
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {txns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>
                      <Typography color={t.type === 'income' ? 'success.main' : 'error.main'}>
                        {t.type === 'income' ? 'Доход' : 'Расход'}
                      </Typography>
                    </TableCell>
                    <TableCell>{t.category_id ? categories.find(c => c.id === t.category_id)?.name || t.category_id : '-'}</TableCell>
                    <TableCell>{t.description || '-'}</TableCell>
                    <TableCell align="right">{t.amount.toLocaleString()} сум</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(t)}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(t.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {txns.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">Нет транзакций</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{edit ? 'Редактировать' : 'Новая транзакция'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип</InputLabel>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} label="Тип">
              <MenuItem value="income">Доход</MenuItem>
              <MenuItem value="expense">Расход</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Сумма" type="number" fullWidth margin="normal" required
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Категория</InputLabel>
            <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} label="Категория">
              <MenuItem value="">—</MenuItem>
              {categories.filter(c => c.type === form.type).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Описание" fullWidth margin="normal" multiline rows={2}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField label="Дата" type="date" fullWidth margin="normal" required
            value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
