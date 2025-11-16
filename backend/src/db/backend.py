import asyncio
from db.db import db

async def create(data: dict) -> str:
    col: str = data.collection
    create_data: dict = data.create_data

    try:
        await db[col].insert_one({create_data})
        return "OK"
    except Exception as e:
        return e
    
async def get_data(data: dict) -> str | dict:
    filter: dict = data.filter
    col: str = data.collection

    try:
        for name in db.list_collection_names():
            collection = db[name]
            doc = collection.find_one(filter)
            if doc:
                return doc
        result = await db[col].find_one({filter})
        return result
    except Exception as e:
        return e
    
async def update(data: dict) -> str:
    filter: dict = data.filter
    action: str = data.action
    update_data: dict = data.update_data
    col: str = data.collection

    try:
        await db[col].update_one({
            filter,
            {action: update_data}
        })
        return "OK"
    except Exception as e:
        return e
    

async def delete(data: dict) -> str:
    col: str = data.collection
    filter: dict = data.filter

    try:
        await db[col].find_one_and_delete({filter})
        return "OK"
    except Exception as e:
        return e
