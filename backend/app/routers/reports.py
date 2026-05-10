from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Transaction, Category
from app.auth import get_current_user
from app.schemas import DashboardData

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/dashboard", response_model=DashboardData)
def dashboard(
    from_date: date = Query(None, alias="from"),
    to_date: date = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == user.id)
    if from_date:
        q = q.filter(Transaction.date >= from_date)
    if to_date:
        q = q.filter(Transaction.date <= to_date)

    total_income = sum(t.amount for t in q.filter(Transaction.type == "income").all())
    total_expense = sum(t.amount for t in q.filter(Transaction.type == "expense").all())

    categories = db.query(Category).filter(Category.user_id == user.id).all()
    cat_map = {c.id: c.name for c in categories}

    inc_cat_q = db.query(Transaction.category_id, func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id, Transaction.type == "income"
    )
    exp_cat_q = db.query(Transaction.category_id, func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id, Transaction.type == "expense"
    )
    recent_q = db.query(Transaction).filter(Transaction.user_id == user.id)

    if from_date:
        inc_cat_q = inc_cat_q.filter(Transaction.date >= from_date)
        exp_cat_q = exp_cat_q.filter(Transaction.date >= from_date)
        recent_q = recent_q.filter(Transaction.date >= from_date)
    if to_date:
        inc_cat_q = inc_cat_q.filter(Transaction.date <= to_date)
        exp_cat_q = exp_cat_q.filter(Transaction.date <= to_date)
        recent_q = recent_q.filter(Transaction.date <= to_date)

    income_by_cat = inc_cat_q.group_by(Transaction.category_id).all()
    expense_by_cat = exp_cat_q.group_by(Transaction.category_id).all()
    recent = recent_q.order_by(Transaction.date.desc()).limit(10).all()

    return DashboardData(
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
        income_by_category=[{"name": cat_map.get(cid, "Other"), "amount": float(amt)} for cid, amt in income_by_cat],
        expense_by_category=[{"name": cat_map.get(cid, "Other"), "amount": float(amt)} for cid, amt in expense_by_cat],
        recent_transactions=recent,
    )
