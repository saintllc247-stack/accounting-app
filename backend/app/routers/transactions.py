from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Transaction
from app.schemas import TransactionCreate, TransactionOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    type: str = "",
    from_date: date = Query(None, alias="from"),
    to_date: date = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == user.id)
    if type:
        q = q.filter(Transaction.type == type)
    if from_date:
        q = q.filter(Transaction.date >= from_date)
    if to_date:
        q = q.filter(Transaction.date <= to_date)
    return q.order_by(Transaction.date.desc()).all()


@router.post("", response_model=TransactionOut)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    txn = Transaction(user_id=user.id, **data.model_dump())
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction(txn_id: int, data: TransactionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for k, v in data.model_dump().items():
        setattr(txn, k, v)
    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}")
def delete_transaction(txn_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
    return {"ok": True}


@router.delete("/imported/clear")
def clear_imported_transactions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    deleted = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.is_imported == True).delete()
    db.commit()
    return {"deleted": deleted}
