import { useState, useEffect } from 'react'
import {
  Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
} from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../api'

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#5d4037', '#c2185b']

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((r) => setData(r.data))
  }, [])

  if (!data) return <Typography>Загрузка...</Typography>

  const incomeTotal = data.income_by_category.reduce((s, c) => s + c.amount, 0)
  const expenseTotal = data.expense_by_category.reduce((s, c) => s + c.amount, 0)

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card><CardContent>
          <Typography color="text.secondary" gutterBottom>Доходы</Typography>
          <Typography variant="h4" color="success.main" fontWeight={700}>
            {data.total_income.toLocaleString()} сум
          </Typography>
        </CardContent></Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card><CardContent>
          <Typography color="text.secondary" gutterBottom>Расходы</Typography>
          <Typography variant="h4" color="error.main" fontWeight={700}>
            {data.total_expense.toLocaleString()} сум
          </Typography>
        </CardContent></Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card><CardContent>
          <Typography color="text.secondary" gutterBottom>Баланс</Typography>
          <Typography variant="h4" color={data.balance >= 0 ? 'primary.main' : 'error.main'} fontWeight={700}>
            {data.balance.toLocaleString()} сум
          </Typography>
        </CardContent></Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Доходы по категориям</Typography>
          {incomeTotal === 0 ? <Typography color="text.secondary">Нет данных</Typography> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.income_by_category} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {data.income_by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent></Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Расходы по категориям</Typography>
          {expenseTotal === 0 ? <Typography color="text.secondary">Нет данных</Typography> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.expense_by_category} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {data.expense_by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent></Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Последние транзакции</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>
                      <Typography color={t.type === 'income' ? 'success.main' : 'error.main'}>
                        {t.type === 'income' ? 'Доход' : 'Расход'}
                      </Typography>
                    </TableCell>
                    <TableCell>{t.category_id || '-'}</TableCell>
                    <TableCell>{t.description || '-'}</TableCell>
                    <TableCell align="right">{t.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {data.recent_transactions.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">Нет транзакций</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}
